const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Registration validation rules with RegEx whitelisting
exports.registerValidation = [
  body('fullName')
    .trim()
    .matches(/^[a-zA-Z\s'-]{2,100}$/)
    .withMessage('Full name must contain only letters, spaces, hyphens, and apostrophes (2-100 characters)'),
  
  body('idNumber')
    .trim()
    .matches(/^[0-9]{13}$/)
    .withMessage('ID number must be exactly 13 digits'),
  
  body('accountNumber')
    .trim()
    .matches(/^[0-9]{10,16}$/)
    .withMessage('Account number must be 10-16 digits'),
  
  body('username')
    .trim()
    .matches(/^[a-zA-Z0-9_]{3,50}$/)
    .withMessage('Username must be 3-50 characters and contain only letters, numbers, and underscores'),
  
  body('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character')
];

// Login validation rules
exports.loginValidation = [
  body('username')
    .trim()
    .matches(/^[a-zA-Z0-9_]{3,50}$/)
    .withMessage('Invalid username format'),
  
  body('accountNumber')
    .trim()
    .matches(/^[0-9]{10,16}$/)
    .withMessage('Invalid account number format'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Payment validation rules
exports.paymentValidation = [
  body('amount')
    .isFloat({ min: 0.01, max: 999999999.99 })
    .withMessage('Amount must be between 0.01 and 999,999,999.99'),
  
  body('currency')
    .trim()
    .matches(/^(USD|EUR|GBP|ZAR|JPY|AUD|CAD|CHF)$/)
    .withMessage('Invalid currency code'),
  
  body('provider')
    .trim()
    .matches(/^SWIFT$/)
    .withMessage('Only SWIFT provider is supported'),
  
  body('recipientAccount')
    .trim()
    .matches(/^[A-Z0-9]{8,34}$/)
    .withMessage('Recipient account must be 8-34 alphanumeric characters'),
  
  body('recipientName')
    .trim()
    .matches(/^[a-zA-Z\s'-]{2,100}$/)
    .withMessage('Recipient name must contain only letters, spaces, hyphens, and apostrophes (2-100 characters)'),
  
  body('swiftCode')
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
    .withMessage('Invalid SWIFT/BIC code format')
];
