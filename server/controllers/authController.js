const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, idNumber, accountNumber, username, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ username }, { idNumber }, { accountNumber }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this username, ID number, or account number already exists'
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      idNumber,
      accountNumber,
      username,
      password,
      role: 'customer'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        accountNumber: user.accountNumber,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, accountNumber, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ username, accountNumber }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        accountNumber: user.accountNumber,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        accountNumber: user.accountNumber,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};
