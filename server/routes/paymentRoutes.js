const express = require('express');
const router = express.Router();
const {
  createPayment,
  getMyPayments,
  getPendingPayments,
  getAllPayments,
  verifyPayment,
  submitToSwift,
  getPayment
} = require('../controllers/paymentController');
const { paymentValidation, validate } = require('../middleware/validation');
const { paymentLimiter } = require('../middleware/security');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', protect, authorize('customer'), paymentLimiter, paymentValidation, validate, createPayment);
router.get('/my-payments', protect, authorize('customer'), getMyPayments);

// Employee routes
router.get('/pending', protect, authorize('employee'), getPendingPayments);
router.get('/', protect, authorize('employee'), getAllPayments);
router.put('/:id/verify', protect, authorize('employee'), verifyPayment);
router.post('/submit-to-swift', protect, authorize('employee'), submitToSwift);

// Shared routes
router.get('/:id', protect, getPayment);

module.exports = router;
