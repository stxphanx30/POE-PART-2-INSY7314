import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, User, CheckCircle, Send, List } from 'lucide-react';
import authService from '../services/authService';
import paymentService from '../services/paymentService';
import { formatCurrency, formatDate } from '../utils/validation';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'employee') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadPayments();
  }, [navigate, filter]);

  const loadPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = filter === 'pending' 
        ? await paymentService.getPendingPayments()
        : await paymentService.getAllPayments();
      setPayments(response.payments);
    } catch (error) {
      setError('Error loading payments. Please try again.');
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId) => {
    setError('');
    setSuccess('');
    try {
      await paymentService.verifyPayment(paymentId);
      setSuccess('Payment verified successfully!');
      loadPayments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error verifying payment');
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  const handleSubmitToSwift = async () => {
    if (selectedPayments.length === 0) {
      setError('Please select at least one verified payment to submit');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await paymentService.submitToSwift(selectedPayments);
      setSuccess(response.message);
      setSelectedPayments([]);
      loadPayments();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting payments to SWIFT');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      verified: 'badge-verified',
      submitted: 'badge-submitted',
      completed: 'badge-completed',
      rejected: 'badge-rejected'
    };
    return <span className={`badge ${badges[status] || 'badge-pending'}`}>{status}</span>;
  };

  const verifiedPayments = payments.filter(p => p.status === 'verified');

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#333', marginBottom: '8px' }}>
              <Shield size={32} style={{ display: 'inline', marginRight: '10px', color: '#667eea' }} />
              Employee Portal
            </h1>
            <p style={{ color: '#666', marginLeft: '42px' }}>
              <User size={16} style={{ display: 'inline', marginRight: '5px' }} />
              {user?.fullName} - Payment Verification
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filter Tabs */}
      <div className="card" style={{ marginBottom: '20px', padding: '0' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0' }}>
          <button
            onClick={() => setFilter('pending')}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: filter === 'pending' ? 'white' : '#f8f9fa',
              borderBottom: filter === 'pending' ? '3px solid #667eea' : 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: filter === 'pending' ? '#667eea' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle size={20} />
            Pending Verification
          </button>
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: filter === 'all' ? 'white' : '#f8f9fa',
              borderBottom: filter === 'all' ? '3px solid #667eea' : 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: filter === 'all' ? '#667eea' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <List size={20} />
            All Payments
          </button>
        </div>
      </div>

      {/* Submit to SWIFT Button */}
      {verifiedPayments.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: '#e8f5e9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: '#2e7d32', marginBottom: '4px' }}>Ready to Submit</h3>
              <p style={{ color: '#558b2f', margin: 0 }}>
                {selectedPayments.length} of {verifiedPayments.length} verified payment(s) selected
              </p>
            </div>
            <button 
              onClick={handleSubmitToSwift} 
              className="btn btn-success"
              disabled={loading || selectedPayments.length === 0}
            >
              <Send size={18} />
              Submit to SWIFT
            </button>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="card">
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          {filter === 'pending' ? 'Pending Payments' : 'All Payments'}
        </h2>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <CheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3>No {filter === 'pending' ? 'pending' : ''} payments</h3>
            <p>There are no payments to display at this time.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {filter === 'all' && <th>Select</th>}
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Recipient</th>
                  <th>Amount</th>
                  <th>SWIFT Code</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    {filter === 'all' && (
                      <td>
                        {payment.status === 'verified' && (
                          <input
                            type="checkbox"
                            checked={selectedPayments.includes(payment._id)}
                            onChange={() => handleSelectPayment(payment._id)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        )}
                      </td>
                    )}
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{payment.userId?.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Acc: {payment.userId?.accountNumber}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{payment.recipientName}</div>
                      <div style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                        {payment.recipientAccount}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{payment.swiftCode}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handleVerify(payment._id)}
                          className="btn btn-success"
                          style={{ padding: '8px 16px', fontSize: '14px' }}
                        >
                          <CheckCircle size={16} />
                          Verify
                        </button>
                      )}
                      {payment.status === 'verified' && (
                        <span style={{ color: '#28a745', fontWeight: '600' }}>✓ Verified</span>
                      )}
                      {payment.status === 'submitted' && (
                        <span style={{ color: '#17a2b8', fontWeight: '600' }}>→ Submitted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
