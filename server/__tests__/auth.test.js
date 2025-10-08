const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payments-portal-test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          idNumber: '9001015009087',
          accountNumber: '1234567890',
          username: 'testuser',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('username', 'testuser');
    });

    it('should reject registration with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          idNumber: '9001015009088',
          accountNumber: '1234567891',
          username: 'testuser2',
          password: 'weak'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should reject duplicate username', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User 2',
          idNumber: '9001015009089',
          accountNumber: '1234567892',
          username: 'testuser',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          accountNumber: '1234567890',
          password: 'Password123!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should reject login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          accountNumber: '1234567890',
          password: 'WrongPassword123!'
        });

      expect(res.statusCode).toBe(401);
    });
  });
});
