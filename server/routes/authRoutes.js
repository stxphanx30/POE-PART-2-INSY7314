const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');
const { authLimiter, bruteLimiter } = require('../middleware/security');
const { protect } = require('../middleware/auth');

// REGISTRATION DISABLED - Only pre-configured users can access the system
// router.post('/register', authLimiter, registerValidation, validate, register);

// Public routes with rate limiting and brute force protection
router.post('/login', authLimiter, bruteLimiter, loginValidation, validate, login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
