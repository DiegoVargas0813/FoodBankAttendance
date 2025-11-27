const userModel = require('../models/userModel');

// Return the authenticated user's profile (safe fields only)
exports.getMe = async (req, res) => {
  try {
    const id = req.user?.idusers || req.user?.id;
    if (!id) return res.status(400).json({ error: 'Missing user id' });
    const user = await userModel.fetchUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('getMe error', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin-only: lookup another user (safe fields only)
exports.getUserByIdAdminOnly = async (req, res) => {
  try {
    const user = await userModel.fetchUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('getUserByIdAdminOnly error', error);
    res.status(500).json({ error: 'Server error' });
  }
};