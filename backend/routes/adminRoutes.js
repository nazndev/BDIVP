const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, checkRole, checkScope } = require('../utils/authMiddleware');

// Apply admin middleware to all routes
router.use(verifyToken);
router.use(checkRole(['admin']));
router.use(checkScope('admin'));

// Dashboard overview
router.get('/overview', adminController.getOverview);

// Audit logs with filtering
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router; 