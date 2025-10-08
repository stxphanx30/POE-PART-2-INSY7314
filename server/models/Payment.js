const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    required: [true, 'Please provide currency'],
    enum: ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'AUD', 'CAD', 'CHF'],
    uppercase: true
  },
  provider: {
    type: String,
    required: [true, 'Please provide payment provider'],
    enum: ['SWIFT'],
    default: 'SWIFT'
  },
  recipientAccount: {
    type: String,
    required: [true, 'Please provide recipient account number'],
    trim: true,
    match: [/^[A-Z0-9]{8,34}$/, 'Please provide a valid IBAN or account number']
  },
  recipientName: {
    type: String,
    required: [true, 'Please provide recipient name'],
    trim: true,
    maxlength: [100, 'Recipient name cannot exceed 100 characters']
  },
  swiftCode: {
    type: String,
    required: [true, 'Please provide SWIFT code'],
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Please provide a valid SWIFT/BIC code']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'submitted', 'completed', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: null
  }
});

// Index for faster queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
