

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated. Please log in.' });
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${role}.`,
      });
    }

    next();
  };
};

module.exports = authorize;