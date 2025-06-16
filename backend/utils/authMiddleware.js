const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const { PartnerUser } = require('../models');

// Async verifyToken: attaches full user object to req.user
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: 'error', message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch full user from DB
    const user = await PartnerUser.findByPk(decoded.id || decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ status: 'error', message: 'Invalid or inactive user' });
    }
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Token expired' });
    }
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
    }
    next();
  };
};

// Middleware to check if user is admin or accessing their own partner data
const requirePartnerOrAdmin = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Authentication required' });
    }
    if (req.user.role === 'admin') {
      return next();
    }
    if (req.user.role === 'partner' || req.user.role === 'user') {
      const partnerIdFromRequest = req.body.partnerId || req.params.partnerId || req.user.partnerId;
      if (partnerIdFromRequest && partnerIdFromRequest === req.user.partnerId) {
        return next();
      } else {
        return res.status(403).json({ status: 'error', message: 'Insufficient permissions: can only access own partner data' });
      }
    }
    return res.status(403).json({ status: 'error', message: 'Insufficient permissions' });
  };
};

// checkRole: like requireRole but with 'error' key for adminRoutes compatibility
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// checkPermission: checks user.hasPermission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!req.user.hasPermission || !req.user.hasPermission(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// checkScope: checks user.hasScope
const checkScope = (scope) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!req.user.hasScope || !req.user.hasScope(scope)) {
      return res.status(403).json({ error: 'Insufficient scope' });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
  requirePartnerOrAdmin,
  checkRole,
  checkPermission,
  checkScope
}; 