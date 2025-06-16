const express = require('express');
const { verifyBasic, verifyFull } = require('../controllers/nidController');
const { verifyToken, requirePartnerOrAdmin } = require('../utils/authMiddleware');
const { rateLimitNIDVerification } = require('../utils/rateLimiter');

const router = express.Router();

router.post('/verify-basic', verifyToken, rateLimitNIDVerification, requirePartnerOrAdmin(), verifyBasic);
router.post('/verify-full', verifyToken, rateLimitNIDVerification, requirePartnerOrAdmin(), verifyFull);

module.exports = router; 
