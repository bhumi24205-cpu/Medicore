/**
 * Role Guard Middleware
 * Restricts access to routes based on allowed roles.
 * Roles: Admin, Receptionist, Doctor, Billing, Patient
 */

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }

    // Admin has access to everything
    if (req.user.role === 'Admin') {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: role '${req.user.role}' is not authorized to access this resource. Requires one of: ${roles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  allowRoles
};
