const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../utils/authMiddleware');
const { getAllUsers, updateUserPermissions } = require('../controllers/userController');

router.use(verifyToken);
router.use(requireRole(['admin']));

router.get('/users', getAllUsers);
router.put('/users/:id/permissions', updateUserPermissions);

module.exports = router; 