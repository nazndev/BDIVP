const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/authMiddleware');
const { verifyBasicDetails, verifyFullDetails } = require('../controllers/verificationController');

// All routes require authentication
router.use(verifyToken);

// POST /api/nid/verify-basic - Basic voter verification
router.post('/verify-basic', verifyBasicDetails);

// POST /api/nid/verify-full - Full voter verification
router.post('/verify-full', verifyFullDetails);

module.exports = router; 