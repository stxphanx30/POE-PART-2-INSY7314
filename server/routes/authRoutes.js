const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../middleware/validation');
const { authLimiter } = require('../middleware/security');
const { protect } = require('../middleware/auth');

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
