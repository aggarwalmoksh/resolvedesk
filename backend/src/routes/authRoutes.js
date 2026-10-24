import express from 'express';
import { registerOwner, loginUser, sendPhoneOtp, verifyPhoneOtp, sendEmailOtp, verifyEmailOtp } from '../services/authService.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { store } from '../db/store.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register Business Owner & Organization
 */
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, businessName, subscriptionTier } = req.body;
    const result = await registerOwner({
      name,
      phone,
      email,
      password,
      businessName,
      subscriptionTier
    });

    res.status(201).json({
      status: 'success',
      message: 'Business registered successfully',
      data: result
    });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Log in via phone number or email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, email, identifier, password } = req.body;
    const result = await loginUser({ phone, email, identifier, password });

    res.json({
      status: 'success',
      message: 'Logged in successfully',
      data: result
    });
  } catch (err) {
    res.status(401).json({ status: 'error', error: err.message });
  }
});

/**
 * POST /api/auth/otp/send
 * Smart OTP: detects email vs phone and dispatches accordingly
 */
router.post('/otp/send', async (req, res) => {
  try {
    const { phone, email, identifier } = req.body;

    // Smart detect: if identifier contains '@' → email, otherwise phone
    const rawId = (identifier || email || phone || '').trim();
    if (!rawId) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }

    const isEmail = rawId.includes('@');

    if (isEmail) {
      const result = await sendEmailOtp(rawId);
      return res.json(result);
    } else {
      const result = await sendPhoneOtp(rawId);
      return res.json(result);
    }
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

/**
 * POST /api/auth/otp/verify
 * Smart OTP Verify: detects email vs phone and verifies accordingly
 */
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, email, identifier, token } = req.body;

    const rawId = (identifier || email || phone || '').trim();
    if (!rawId || !token) {
      return res.status(400).json({ error: 'Email/phone and OTP token are required' });
    }

    const isEmail = rawId.includes('@');
    let result;

    if (isEmail) {
      result = await verifyEmailOtp(rawId, token);
    } else {
      result = await verifyPhoneOtp(rawId, token);
    }

    res.json({
      status: 'success',
      message: isEmail ? 'Email verified and authenticated' : 'Phone verified and authenticated',
      data: result
    });
  } catch (err) {
    res.status(401).json({ status: 'error', error: err.message });
  }
});

/**
 * POST /api/auth/otp/send-email
 * Dedicated email OTP endpoint (Supabase free Email OTP)
 */
router.post('/otp/send-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });
    const result = await sendEmailOtp(email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

/**
 * POST /api/auth/otp/verify-email
 * Dedicated email OTP verification endpoint
 */
router.post('/otp/verify-email', async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) return res.status(400).json({ error: 'email and token are required' });
    const result = await verifyEmailOtp(email, token);
    res.json({
      status: 'success',
      message: 'Email verified and authenticated',
      data: result
    });
  } catch (err) {
    res.status(401).json({ status: 'error', error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Get current session profile & tenant info
 */
router.get('/me', authMiddleware, (req, res) => {
  const currentBots = store.getBotsByOrg(req.org.id);
  const currentMembers = store.getUsersByOrg(req.org.id);

  res.json({
    status: 'success',
    data: {
      user: req.user,
      org: {
        ...req.org,
        stats: {
          botsCount: currentBots.length,
          membersCount: currentMembers.length,
          complaintsCount: store.getComplaints(req.org.id).length
        }
      }
    }
  });
});

export default router;
