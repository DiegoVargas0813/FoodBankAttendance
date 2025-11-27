const checkRole = (required) => {
  // normalize requirement to array
  const requiredRoles = Array.isArray(required) ? required : [required];
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const role = (user.role || '').toString().toUpperCase();
    if (!requiredRoles.map(r => r.toString().toUpperCase()).includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

module.exports = { checkRole };