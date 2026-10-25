import express from 'express';
import crypto from 'crypto';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { checkBotQuota } from '../middleware/quotaMiddleware.js';
import { store } from '../db/store.js';
import { verifyBotToken, registerBotWebhook, deleteBotWebhook } from '../services/telegramService.js';
import { PUBLIC_BASE_URL } from '../config.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/bots
 * List all linked Telegram bots for the organization
 */
router.get('/', async (req, res, next) => {
  try {
  const bots = (await store.getBotsByOrg(req.org.id)).map(b => {
    // Mask bot token for security
    const maskedToken = b.bot_token.length > 10 ? `${b.bot_token.substring(0, 6)}...${b.bot_token.substring(b.bot_token.length - 4)}` : '***';
    return {
      id: b.id,
      bot_username: b.bot_username,
      bot_title: b.bot_title,
      masked_token: maskedToken,
      webhook_url: b.webhook_url,
      status: b.status,
      created_at: b.created_at
    };
  });

  res.json({
    status: 'success',
    data: {
      bots,
      quota: {
        used: bots.length,
        max: req.org.max_bots
      }
    }
  });
  } catch (error) { next(error); }
});

/**
 * POST /api/bots
 * Link a new Telegram bot
 */
router.post('/', requirePermission('can_manage_bots'), checkBotQuota, async (req, res) => {
  try {
    const { bot_token, bot_title } = req.body;
    if (!bot_token) {
      return res.status(400).json({ error: 'bot_token is required' });
    }

    const cleanToken = bot_token.trim();

    // Check if token already linked to any organization
    const existing = await store.getBotByToken(cleanToken);
    if (existing) {
      return res.status(400).json({ error: 'This Telegram bot is already linked to an organization' });
    }

    // 1. Verify token with Telegram API
    const botInfo = await verifyBotToken(cleanToken);

    // 2. Generate unique secret token and webhook URL
    const secretToken = crypto.randomBytes(24).toString('hex');
    const tempBotId = crypto.randomUUID();
    const baseUrl = (PUBLIC_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');
    const webhookUrl = `${baseUrl}/telegram/webhook/${tempBotId}`;

    // 3. Register webhook with Telegram
    try {
      await registerBotWebhook(cleanToken, webhookUrl, secretToken);
    } catch (err) {
      console.warn('⚠️ Webhook registration with Telegram failed (might be offline/dev):', err.message);
    }

    // 4. Save to store
    const newBot = await store.createBot({
      id: tempBotId,
      org_id: req.org.id,
      bot_token: cleanToken,
      bot_username: botInfo.username,
      bot_title: bot_title || botInfo.title || botInfo.username,
      secret_token: secretToken,
      webhook_url: webhookUrl
    });

    res.status(201).json({
      status: 'success',
      message: `Bot @${newBot.bot_username} linked successfully!`,
      data: {
        id: newBot.id,
        bot_username: newBot.bot_username,
        bot_title: newBot.bot_title,
        webhook_url: newBot.webhook_url,
        status: newBot.status
      }
    });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

/**
 * DELETE /api/bots/:id
 * Unlink a bot
 */
router.delete('/:id', requirePermission('can_manage_bots'), async (req, res) => {
  try {
    const bot = await store.getBotById(req.params.id);
    if (!bot || bot.org_id !== req.org.id) {
      return res.status(404).json({ error: 'Bot not found in your organization' });
    }

    // Deregister webhook from Telegram
    try {
      await deleteBotWebhook(bot.bot_token);
    } catch (err) {
      console.warn('⚠️ Failed to delete webhook from Telegram:', err.message);
    }

    await store.deleteBot(bot.id);

    res.json({
      status: 'success',
      message: `Bot @${bot.bot_username} unlinked successfully`
    });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

/**
 * POST /api/bots/:id/sync
 * Force re-sync webhook with Telegram
 */
router.post('/:id/sync', requirePermission('can_manage_bots'), async (req, res) => {
  try {
    const bot = await store.getBotById(req.params.id);
    if (!bot || bot.org_id !== req.org.id) {
      return res.status(404).json({ error: 'Bot not found in your organization' });
    }

    const baseUrl = (PUBLIC_BASE_URL || 'http://localhost:4000').replace(/\/+$/, '');
    const webhookUrl = `${baseUrl}/telegram/webhook/${bot.id}`;

    await registerBotWebhook(bot.bot_token, webhookUrl, bot.secret_token);
    await store.updateBot(bot.id, { webhook_url: webhookUrl, status: 'active' });

    res.json({
      status: 'success',
      message: `Webhook for @${bot.bot_username} successfully synced with Telegram!`,
      webhook_url: webhookUrl
    });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});


/**
 * POST /api/bots/:id/activate
 * Activate a paused bot (swaps active bot if at plan limit)
 */
router.post('/:id/activate', requirePermission('can_manage_bots'), async (req, res) => {
  try {
    const targetBot = await store.getBotById(req.params.id);
    if (!targetBot || targetBot.org_id !== req.org.id) {
      return res.status(404).json({ error: 'Bot not found in your organization' });
    }

    const orgBots = await store.getBotsByOrg(req.org.id);
    const activeBots = orgBots.filter(b => b.status === 'active' && b.id !== targetBot.id);

    // If active bots meet max quota, pause the oldest active bot to make room
    if (activeBots.length >= req.org.max_bots) {
      const botToPause = activeBots[activeBots.length - 1];
      await store.updateBot(botToPause.id, { status: 'paused' });
      try {
        await deleteBotWebhook(botToPause.bot_token);
        console.log(`⏸️  [Quota Shift] Paused bot @${botToPause.bot_username} to activate @${targetBot.bot_username}`);
      } catch (e) {}
    }

    // Activate target bot and re-register webhook
    await store.updateBot(targetBot.id, { status: 'active' });
    try {
      if (targetBot.webhook_url && targetBot.secret_token) {
        await registerBotWebhook(targetBot.bot_token, targetBot.webhook_url, targetBot.secret_token);
      }
    } catch (e) {}

    res.json({
      status: 'success',
      message: `Bot @${targetBot.bot_username} is now active!`,
      data: targetBot
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/bots/:id/pause
 * Manually pause a bot and disconnect its webhook
 */
router.post('/:id/pause', requirePermission('can_manage_bots'), async (req, res) => {
  try {
    const targetBot = await store.getBotById(req.params.id);
    if (!targetBot || targetBot.org_id !== req.org.id) {
      return res.status(404).json({ error: 'Bot not found in your organization' });
    }

    await store.updateBot(targetBot.id, { status: 'paused' });
    try {
      await deleteBotWebhook(targetBot.bot_token);
    } catch (e) {}

    res.json({
      status: 'success',
      message: `Bot @${targetBot.bot_username} has been paused`,
      data: targetBot
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
