import api from './api';

const paymentService = {
  // Create new payment
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Get customer's payments
  getMyPayments: async () => {
    const response = await api.get('/payments/my-payments');
    return response.data;
  },

  // Get all payments (employee)
  getAllPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  // Get pending payments (employee)
  getPendingPayments: async () => {
    const response = await api.get('/payments/pending');
    return response.data;
  },

  // Get single payment
  getPayment: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Verify payment (employee)
  verifyPayment: async (id) => {
    const response = await api.put(`/payments/${id}/verify`);
    return response.data;
  },

  // Submit payments to SWIFT (employee)
  submitToSwift: async (paymentIds) => {
    const response = await api.post('/payments/submit-to-swift', { paymentIds });
    return response.data;
  }
};

export default paymentService;
