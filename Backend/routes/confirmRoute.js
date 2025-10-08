const express = require('express');
const router = express.Router();
const db = require('../connection');

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

module.exports = router;