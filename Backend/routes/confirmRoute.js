const express = require('express');
const router = express.Router();
const db = require('../connection');
const rateLimit = require('express-rate-limit');
const loginModel = require('../models/loginModel');
const { sendConfirmationEmail } = require('../utils/email');
const crypto = require('crypto');

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many resend attempts, try later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const deleteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many account deletion attempts, try later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/confirm-email', (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token missing' });

  db.query(
    //TODO: Move SQL statement to model later
    'UPDATE users SET is_confirmed = TRUE, confirmation_token = NULL WHERE confirmation_token = ?',
    [token],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (result.affectedRows === 0) return res.status(400).json({ error: 'Invalid or expired token' });
      res.json({ message: 'Email confirmed successfully!' });
    }
  );
});

// POST /resend-confirmation  { email }
router.post('/resend-confirmation', resendLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await loginModel.fetchUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.is_confirmed) return res.status(400).json({ error: 'Account already confirmed' });

    const newToken = crypto.randomBytes(32).toString('hex');
    await loginModel.setConfirmationTokenForEmail(email, newToken);
    await sendConfirmationEmail(email, newToken);

    return res.json({ success: true, message: 'Confirmation email resent' });
  } catch (err) {
    console.error('resend-confirmation error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /delete-unconfirmed  { email }
// Deletes an unconfirmed account on user request (rate-limited). 
router.post('/delete-unconfirmed', deleteLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await loginModel.fetchUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.is_confirmed) return res.status(400).json({ error: 'Account already confirmed' });

    await loginModel.deleteUnconfirmedByEmail(email);
    return res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    console.error('delete-unconfirmed error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;