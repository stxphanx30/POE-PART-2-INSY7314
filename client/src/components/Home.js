import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Globe, CheckCircle, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingTop: '40px' }}>
      {/* Hero Section */}
      <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <Globe size={64} style={{ color: '#667eea', marginBottom: '20px' }} />
        <h1 style={{ fontSize: '48px', color: '#333', marginBottom: '16px' }}>
          International Payments Portal
        </h1>
        <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Secure, fast, and reliable international payment processing through SWIFT
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('/register')} 
            className="btn btn-primary"
            style={{ fontSize: '18px', padding: '16px 32px' }}
          >
            Get Started
            <ArrowRight size={20} />
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-secondary"
            style={{ fontSize: '18px', padding: '16px 32px' }}
          >
            Login
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '40px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <Shield size={48} style={{ color: '#667eea', marginBottom: '16px' }} />
          <h3 style={{ color: '#333', marginBottom: '12px' }}>Bank-Grade Security</h3>
          <p style={{ color: '#666' }}>
            Your data is protected with industry-leading encryption, SSL/TLS, and secure authentication
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <Lock size={48} style={{ color: '#667eea', marginBottom: '16px' }} />
          <h3 style={{ color: '#333', marginBottom: '12px' }}>Password Protection</h3>
          <p style={{ color: '#666' }}>
            Advanced password hashing with bcrypt salting ensures your credentials are always safe
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <CheckCircle size={48} style={{ color: '#667eea', marginBottom: '16px' }} />
          <h3 style={{ color: '#333', marginBottom: '12px' }}>Verified Transactions</h3>
          <p style={{ color: '#666' }}>
            All payments are reviewed and verified by our dedicated staff before processing
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="card" style={{ marginTop: '40px' }}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
          <div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: '#667eea', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '20px',
              marginBottom: '12px'
            }}>1</div>
            <h4 style={{ color: '#333', marginBottom: '8px' }}>Register</h4>
            <p style={{ color: '#666' }}>Create your account with your personal and banking details</p>
          </div>

          <div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: '#667eea', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '20px',
              marginBottom: '12px'
            }}>2</div>
            <h4 style={{ color: '#333', marginBottom: '8px' }}>Make Payment</h4>
            <p style={{ color: '#666' }}>Enter payment details including amount, currency, and recipient information</p>
          </div>

          <div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: '#667eea', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '20px',
              marginBottom: '12px'
            }}>3</div>
            <h4 style={{ color: '#333', marginBottom: '8px' }}>Verification</h4>
            <p style={{ color: '#666' }}>Our staff verifies your payment details and SWIFT code</p>
          </div>

          <div>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: '#667eea', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '20px',
              marginBottom: '12px'
            }}>4</div>
            <h4 style={{ color: '#333', marginBottom: '8px' }}>Processing</h4>
            <p style={{ color: '#666' }}>Payment is submitted to SWIFT for international processing</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
        <p>© 2025 International Payments Portal. All rights reserved.</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>Secure payments powered by SWIFT</p>
      </div>
    </div>
  );
};

export default Home;
