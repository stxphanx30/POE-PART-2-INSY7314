import React, { useState } from 'react';
import { Send, DollarSign, Building2, User, CreditCard } from 'lucide-react';
import paymentService from '../services/paymentService';
import { validators, sanitizeInput } from '../utils/validation';

const PaymentForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    provider: 'SWIFT',
    recipientAccount: '',
    recipientName: '',
    swiftCode: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'ZAR', 'JPY', 'AUD', 'CAD', 'CHF'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    setFormData({ ...formData, [name]: sanitizedValue });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.amount = validators.amount(formData.amount);
    newErrors.currency = validators.currency(formData.currency);
    newErrors.recipientAccount = validators.recipientAccount(formData.recipientAccount);
    newErrors.recipientName = validators.recipientName(formData.recipientName);
    newErrors.swiftCode = validators.swiftCode(formData.swiftCode);

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await paymentService.createPayment({
        ...formData,
        amount: parseFloat(formData.amount),
        recipientAccount: formData.recipientAccount.toUpperCase(),
        swiftCode: formData.swiftCode.toUpperCase()
      });
      
      setSuccess(true);
      setFormData({
        amount: '',
        currency: 'USD',
        provider: 'SWIFT',
        recipientAccount: '',
        recipientName: '',
        swiftCode: ''
      });
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (error) {
      setApiError(
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.msg ||
        'Payment creation failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ color: '#333', marginBottom: '20px' }}>
        <Send size={24} style={{ display: 'inline', marginRight: '10px', color: '#667eea' }} />
        Create New Payment
      </h2>

      {apiError && (
        <div className="alert alert-error">
          {apiError}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          Payment created successfully! It will be reviewed by our staff.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>
              <DollarSign size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={errors.amount ? 'error' : ''}
              placeholder="0.00"
              step="0.01"
              min="0.01"
            />
            {errors.amount && <div className="error-message">{errors.amount}</div>}
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className={errors.currency ? 'error' : ''}
            >
              {currencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
            {errors.currency && <div className="error-message">{errors.currency}</div>}
          </div>
        </div>

        <div className="form-group">
          <label>
            <Building2 size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Payment Provider
          </label>
          <select
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            disabled
          >
            <option value="SWIFT">SWIFT</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Recipient Name
          </label>
          <input
            type="text"
            name="recipientName"
            value={formData.recipientName}
            onChange={handleChange}
            className={errors.recipientName ? 'error' : ''}
            placeholder="John Doe"
          />
          {errors.recipientName && <div className="error-message">{errors.recipientName}</div>}
        </div>

        <div className="form-group">
          <label>
            <CreditCard size={16} style={{ display: 'inline', marginRight: '8px' }} />
            Recipient Account Number (IBAN)
          </label>
          <input
            type="text"
            name="recipientAccount"
            value={formData.recipientAccount}
            onChange={handleChange}
            className={errors.recipientAccount ? 'error' : ''}
            placeholder="GB29NWBK60161331926819"
            maxLength="34"
          />
          {errors.recipientAccount && <div className="error-message">{errors.recipientAccount}</div>}
        </div>

        <div className="form-group">
          <label>
            <Building2 size={16} style={{ display: 'inline', marginRight: '8px' }} />
            SWIFT Code
          </label>
          <input
            type="text"
            name="swiftCode"
            value={formData.swiftCode}
            onChange={handleChange}
            className={errors.swiftCode ? 'error' : ''}
            placeholder="ABCDZAJJ or ABCDZAJJXXX"
            maxLength="11"
          />
          {errors.swiftCode && <div className="error-message">{errors.swiftCode}</div>}
          <small style={{ color: '#666', fontSize: '14px' }}>
            8 or 11 characters (e.g., ABCDZAJJ or ABCDZAJJXXX)
          </small>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '10px' }} 
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
