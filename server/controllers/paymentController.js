const Payment = require('../models/Payment');

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private (Customer)
exports.createPayment = async (req, res, next) => {
  try {
    const { amount, currency, provider, recipientAccount, recipientName, swiftCode } = req.body;

    const payment = await Payment.create({
      userId: req.user.id,
      amount,
      currency,
      provider,
      recipientAccount,
      recipientName,
      swiftCode,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments for logged in customer
// @route   GET /api/payments/my-payments
// @access  Private (Customer)
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending payments (for employees)
// @route   GET /api/payments/pending
// @access  Private (Employee)
exports.getPendingPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: 'pending' })
      .populate('userId', 'fullName accountNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (for employees)
// @route   GET /api/payments
// @access  Private (Employee)
exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'fullName accountNumber')
      .populate('verifiedBy', 'fullName username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a payment
// @route   PUT /api/payments/:id/verify
// @access  Private (Employee)
exports.verifyPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed'
      });
    }

    payment.status = 'verified';
    payment.verifiedBy = req.user.id;
    payment.verifiedAt = Date.now();

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit verified payments to SWIFT
// @route   POST /api/payments/submit-to-swift
// @access  Private (Employee)
exports.submitToSwift = async (req, res, next) => {
  try {
    const { paymentIds } = req.body;

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of payment IDs'
      });
    }

    // Update all verified payments to submitted
    const result = await Payment.updateMany(
      {
        _id: { $in: paymentIds },
        status: 'verified'
      },
      {
        status: 'submitted',
        submittedAt: Date.now()
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No verified payments found to submit'
      });
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} payment(s) submitted to SWIFT successfully`,
      submittedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('userId', 'fullName accountNumber')
      .populate('verifiedBy', 'fullName username');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Customers can only view their own payments
    if (req.user.role === 'customer' && payment.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};
