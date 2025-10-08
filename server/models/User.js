const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide full name'],
    trim: true,
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  idNumber: {
    type: String,
    required: [true, 'Please provide ID number'],
    unique: true,
    trim: true,
    match: [/^[0-9]{13}$/, 'Please provide a valid 13-digit South African ID number']
  },
  accountNumber: {
    type: String,
    required: [true, 'Please provide account number'],
    unique: true,
    trim: true,
    match: [/^[0-9]{10,16}$/, 'Please provide a valid account number (10-16 digits)']
  },
  username: {
    type: String,
    required: [true, 'Please provide username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'employee'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  // Generate salt with 12 rounds for strong hashing
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
