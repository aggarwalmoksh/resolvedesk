import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
import { store, PLANS } from '../db/store.js';
import { registerBotWebhook, deleteBotWebhook } from '../services/telegramService.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/subscription
 * Get current subscription status and usage quotas
 */
router.get('/', (req, res) => {
  const org = req.org;
  const allBots = store.getBotsByOrg(org.id);
  const activeBots = allBots.filter(b => b.status === 'active');
  const pausedBots = allBots.filter(b => b.status === 'paused' || b.status === 'suspended');
  const currentMembers = store.getUsersByOrg(org.id);
  const pendingInvites = store.getInvitationsByOrg(org.id);
  const planInfo = PLANS[org.subscription_tier] || PLANS.starter;

  res.json({
    status: 'success',
    data: {
      plan: planInfo,
      usage: {
        bots: {
          current: allBots.length,
          active: activeBots.length,
          paused: pausedBots.length,
          max: org.max_bots,
          available: Math.max(0, org.max_bots - activeBots.length)
        },
        team_members: {
          current: currentMembers.length,
          pending_invites: pendingInvites.length,
          total_used: currentMembers.length + pendingInvites.length,
          max: org.max_members,
          available: Math.max(0, org.max_members - (currentMembers.length + pendingInvites.length))
        }
      }
    }
  });
});

/**
 * GET /api/subscription/plans
 * List all available subscription tiers
 */
router.get('/plans', (req, res) => {
  res.json({
    status: 'success',
    data: Object.values(PLANS)
  });
});

/**
 * POST /api/subscription/upgrade
 * Change subscription tier (Upgrades and Downgrades)
 * Handles auto-pausing excess bots on downgrade and auto-reactivating on upgrade
 */
router.post('/upgrade', requireRole(['owner']), async (req, res) => {
  try {
    const { plan_id } = req.body;
    const targetPlan = PLANS[plan_id];

    if (!targetPlan) {
      return res.status(400).json({
        error: `Invalid plan_id. Must be one of: ${Object.keys(PLANS).join(', ')}`
      });
    }

    const currentOrg = req.org;
    const currentBots = store.getBotsByOrg(currentOrg.id);

    let botsPaused = 0;
    let botsReactivated = 0;

    // 1. Handle Bot Capacity Adjustments
    if (currentBots.length > targetPlan.max_bots) {
      // Downgrade scenario: Keep first targetPlan.max_bots active, pause the rest
      for (let i = 0; i < currentBots.length; i++) {
        const b = currentBots[i];
        if (i < targetPlan.max_bots) {
          if (b.status !== 'active') {
            store.updateBot(b.id, { status: 'active' });
          }
        } else {
          if (b.status !== 'paused') {
            store.updateBot(b.id, { status: 'paused' });
            botsPaused++;
            try {
              await deleteBotWebhook(b.bot_token);
              console.log(`⏸️  [Downgrade] Paused bot @${b.bot_username} and deleted Telegram webhook`);
            } catch (err) {
              console.warn(`Could not delete webhook for paused bot @${b.bot_username}:`, err.message);
            }
          }
        }
      }
    } else if (targetPlan.max_bots > currentOrg.max_bots) {
      // Upgrade scenario: Reactivate any paused bots up to new capacity
      const pausedBots = currentBots.filter(b => b.status === 'paused' || b.status === 'suspended');
      let availableSlots = targetPlan.max_bots - currentBots.filter(b => b.status === 'active').length;

      for (const b of pausedBots) {
        if (availableSlots > 0) {
          store.updateBot(b.id, { status: 'active' });
          availableSlots--;
          botsReactivated++;
          try {
            if (b.webhook_url && b.secret_token) {
              await registerBotWebhook(b.bot_token, b.webhook_url, b.secret_token);
              console.log(`▶️  [Upgrade] Reactivated bot @${b.bot_username} and registered Telegram webhook`);
            }
          } catch (err) {
            console.warn(`Could not re-register webhook for reactivated bot @${b.bot_username}:`, err.message);
          }
        }
      }
    }

    // 2. Update Organization plan and limits
    const updatedOrg = store.updateOrg(req.org.id, {
      subscription_tier: targetPlan.id,
      max_bots: targetPlan.max_bots,
      max_members: targetPlan.max_members
    });

    let message = `Subscription successfully changed to ${targetPlan.name}!`;
    if (botsPaused > 0) {
      message = `Subscription changed to ${targetPlan.name}. ${targetPlan.max_bots} bot remains active; ${botsPaused} excess bot(s) have been paused and their Telegram webhooks disconnected.`;
    } else if (botsReactivated > 0) {
      message = `Subscription upgraded to ${targetPlan.name}! ${botsReactivated} previously paused bot(s) have been automatically reactivated.`;
    }

    res.json({
      status: 'success',
      message,
      data: {
        org: updatedOrg,
        new_limits: {
          max_bots: targetPlan.max_bots,
          max_members: targetPlan.max_members
        },
        bots_paused: botsPaused,
        bots_reactivated: botsReactivated
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
