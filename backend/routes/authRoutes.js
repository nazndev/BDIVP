const express = require('express');
const router = express.Router();
const { login, me, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require('../utils/authMiddleware');

// Public login endpoint
router.post('/login', login);
// Public forgot password endpoint
router.post('/forgot-password', forgotPassword);
// Public reset password endpoint
router.post('/reset-password', resetPassword);

// Protected endpoints
router.get('/me', verifyToken, me);
router.post('/logout', verifyToken, logout);

// Example of a protected route (uncomment to use)
// router.get('/protected', verifyToken, (req, res) => {
//   res.json({ user: req.user });
// });

module.exports = router; 
