import React from 'react';
import { Clock, CheckCircle, Send, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/validation';

const PaymentHistory = ({ payments, loading }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { className: 'badge-pending', icon: <Clock size={12} /> },
      verified: { className: 'badge-verified', icon: <CheckCircle size={12} /> },
      submitted: { className: 'badge-submitted', icon: <Send size={12} /> },
      completed: { className: 'badge-completed', icon: <CheckCircle size={12} /> },
      rejected: { className: 'badge-rejected', icon: <XCircle size={12} /> }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`badge ${config.className}`}>
        {config.icon} {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <Send size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3>No payments yet</h3>
          <p>Your payment history will appear here once you make a payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Payment History</h2>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Recipient</th>
              <th>Amount</th>
              <th>SWIFT Code</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{formatDate(payment.createdAt)}</td>
                <td>
                  <div style={{ fontWeight: '600' }}>{payment.recipientName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{payment.recipientAccount}</div>
                </td>
                <td style={{ fontWeight: '600' }}>
                  {formatCurrency(payment.amount, payment.currency)}
                </td>
                <td style={{ fontFamily: 'monospace' }}>{payment.swiftCode}</td>
                <td>{getStatusBadge(payment.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
