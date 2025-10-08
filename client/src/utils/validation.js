// Input validation utilities with RegEx whitelisting

export const validators = {
  // Full name validation
  fullName: (value) => {
    const regex = /^[a-zA-Z\s'-]{2,100}$/;
    if (!value) return 'Full name is required';
    if (!regex.test(value)) return 'Full name must contain only letters, spaces, hyphens, and apostrophes (2-100 characters)';
    return '';
  },

  // ID number validation (13 digits for SA ID)
  idNumber: (value) => {
    const regex = /^[0-9]{13}$/;
    if (!value) return 'ID number is required';
    if (!regex.test(value)) return 'ID number must be exactly 13 digits';
    return '';
  },

  // Account number validation
  accountNumber: (value) => {
    const regex = /^[0-9]{10,16}$/;
    if (!value) return 'Account number is required';
    if (!regex.test(value)) return 'Account number must be 10-16 digits';
    return '';
  },

  // Username validation
  username: (value) => {
    const regex = /^[a-zA-Z0-9_]{3,50}$/;
    if (!value) return 'Username is required';
    if (!regex.test(value)) return 'Username must be 3-50 characters and contain only letters, numbers, and underscores';
    return '';
  },

  // Password validation
  password: (value) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!value) return 'Password is required';
    if (!regex.test(value)) return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    return '';
  },

  // Amount validation
  amount: (value) => {
    const num = parseFloat(value);
    if (!value) return 'Amount is required';
    if (isNaN(num) || num <= 0) return 'Amount must be greater than 0';
    if (num > 999999999.99) return 'Amount cannot exceed 999,999,999.99';
    return '';
  },

  // Currency validation
  currency: (value) => {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'AUD', 'CAD', 'CHF'];
    if (!value) return 'Currency is required';
    if (!validCurrencies.includes(value)) return 'Invalid currency';
    return '';
  },

  // Recipient account validation
  recipientAccount: (value) => {
    const regex = /^[A-Z0-9]{8,34}$/;
    if (!value) return 'Recipient account is required';
    if (!regex.test(value.toUpperCase())) return 'Recipient account must be 8-34 alphanumeric characters';
    return '';
  },

  // Recipient name validation
  recipientName: (value) => {
    const regex = /^[a-zA-Z\s'-]{2,100}$/;
    if (!value) return 'Recipient name is required';
    if (!regex.test(value)) return 'Recipient name must contain only letters, spaces, hyphens, and apostrophes (2-100 characters)';
    return '';
  },

  // SWIFT code validation
  swiftCode: (value) => {
    const regex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    if (!value) return 'SWIFT code is required';
    if (!regex.test(value.toUpperCase())) return 'Invalid SWIFT/BIC code format (e.g., ABCDZAJJ or ABCDZAJJXXX)';
    return '';
  }
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Format currency
export const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency || 'ZAR'
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
