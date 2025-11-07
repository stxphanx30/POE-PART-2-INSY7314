import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, History, LogOut, User, DollarSign } from 'lucide-react';
import authService from '../services/authService';
import paymentService from '../services/paymentService';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('new-payment');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    if (activeTab === 'history') {
      loadPayments();
    }
  }, [navigate, activeTab]);

  // -------------------------------
  // SESSION TIMEOUT / AUTO-LOGOUT / FRONTEND
  // -------------------------------
  useEffect(() => {
    if (!user) return; // only run if user is logged in

    // Poll server every 5 seconds to check session validity
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/health', { credentials: 'include' });
        if (!res.ok) {
          alert('Session expired! Redirecting to login...');
          authService.logout();
          navigate('/login');
        }
      } catch (err) {
        console.error('Error checking session:', err);
        authService.logout();
        navigate('/login');
      }
    }, 300000);

  

    return () => clearInterval(interval); // clear on unmount
    // return () => { clearInterval(interval); clearTimeout(testTimeout); }; // if using testTimeout
  }, [user, navigate]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getMyPayments();
      setPayments(response.payments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handlePaymentSuccess = () => {
    setActiveTab('history');
  };

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#333', marginBottom: '8px' }}>
              <DollarSign size={32} style={{ display: 'inline', marginRight: '10px', color: '#667eea' }} />
              International Payments Portal
            </h1>
            <p style={{ color: '#666', marginLeft: '42px' }}>
              <User size={16} style={{ display: 'inline', marginRight: '5px' }} />
              Welcome, {user?.fullName}
            </p>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card" style={{ marginBottom: '20px', padding: '0' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0' }}>
          <button
            onClick={() => setActiveTab('new-payment')}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: activeTab === 'new-payment' ? 'white' : '#f8f9fa',
              borderBottom: activeTab === 'new-payment' ? '3px solid #667eea' : 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'new-payment' ? '#667eea' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Send size={20} />
            New Payment
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: activeTab === 'history' ? 'white' : '#f8f9fa',
              borderBottom: activeTab === 'history' ? '3px solid #667eea' : 'none',
              cursor: 'pointer',
              fontWeight: '600',
              color: activeTab === 'history' ? '#667eea' : '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <History size={20} />
            Payment History
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'new-payment' && <PaymentForm onSuccess={handlePaymentSuccess} />}
      {activeTab === 'history' && <PaymentHistory payments={payments} loading={loading} />}
    </div>
  );
};

export default CustomerDashboard;
