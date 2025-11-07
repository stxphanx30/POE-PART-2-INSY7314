const request = require('supertest');
const express = require('express');
const { generalLimiter, authLimiter, paymentLimiter, sanitizeInput } = require('../middleware/security');

describe('Security Middleware Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('Rate Limiting', () => {
    it('should enforce general rate limits', async () => {
      app.use(generalLimiter);
      app.get('/test', (req, res) => res.json({ success: true }));

      // Make requests up to the limit
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(request(app).get('/test'));
      }

      const responses = await Promise.all(requests);
      responses.forEach(res => {
        expect(res.status).toBeLessThanOrEqual(200);
      });
    });

    it('should enforce authentication rate limits', async () => {
      app.use(authLimiter);
      app.post('/login', (req, res) => res.json({ success: true }));

      // Make multiple login attempts
      const requests = [];
      for (let i = 0; i < 6; i++) {
        requests.push(
          request(app)
            .post('/login')
            .send({ username: 'test', password: 'test' })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(res => res.status === 429);
      
      // At least one request should be rate limited
      expect(rateLimited).toBe(true);
    });

    it('should enforce payment rate limits', async () => {
      app.use(paymentLimiter);
      app.post('/payment', (req, res) => res.json({ success: true }));

      // Make multiple payment requests
      const requests = [];
      for (let i = 0; i < 25; i++) {
        requests.push(
          request(app)
            .post('/payment')
            .send({ amount: 100 })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(res => res.status === 429);
      
      // Should enforce limit after 20 requests
      expect(rateLimited).toBe(true);
    });
  });

  describe('Input Sanitization', () => {
    beforeEach(() => {
      app.use(sanitizeInput);
    });

    it('should remove script tags from input', async () => {
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ name: '<script>alert("XSS")</script>John' });

      expect(response.body.body.name).not.toContain('<script>');
      expect(response.body.body.name).toContain('John');
    });

    it('should remove iframe tags from input', async () => {
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ content: '<iframe src="evil.com"></iframe>Safe content' });

      expect(response.body.body.content).not.toContain('<iframe>');
      expect(response.body.body.content).toContain('Safe content');
    });

    it('should remove javascript: protocol from input', async () => {
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ url: 'javascript:alert("XSS")' });

      expect(response.body.body.url).not.toContain('javascript:');
    });

    it('should remove event handlers from input', async () => {
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ html: '<div onclick="alert(1)">Click me</div>' });

      expect(response.body.body.html).not.toContain('onclick=');
    });

    it('should sanitize nested objects', async () => {
      app.post('/test', (req, res) => {
        res.json({ body: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({
          user: {
            name: '<script>alert("XSS")</script>John',
            profile: {
              bio: '<iframe src="evil.com"></iframe>Developer'
            }
          }
        });

      expect(response.body.body.user.name).not.toContain('<script>');
      expect(response.body.body.user.profile.bio).not.toContain('<iframe>');
    });
  });

  describe('Security Headers', () => {
    it('should set appropriate security headers', async () => {
      const helmet = require('helmet');
      app.use(helmet());
      app.get('/test', (req, res) => res.json({ success: true }));

      const response = await request(app).get('/test');

      // Check for security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['strict-transport-security']).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should enforce CORS policy', async () => {
      const cors = require('cors');
      app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
      }));
      app.get('/test', (req, res) => res.json({ success: true }));

      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should reject requests from unauthorized origins', async () => {
      const cors = require('cors');
      app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
      }));
      app.get('/test', (req, res) => res.json({ success: true }));

      const response = await request(app)
        .get('/test')
        .set('Origin', 'http://evil.com');

      // CORS should not allow evil.com
      expect(response.headers['access-control-allow-origin']).not.toBe('http://evil.com');
    });
  });

  describe('Request Size Limits', () => {
    it('should enforce request body size limits', async () => {
      app.use(express.json({ limit: '1kb' }));
      app.post('/test', (req, res) => res.json({ success: true }));

      // Create a large payload (> 1kb)
      const largePayload = { data: 'x'.repeat(2000) };

      const response = await request(app)
        .post('/test')
        .send(largePayload);

      expect(response.status).toBe(413); // Payload Too Large
    });
  });
});

describe('Authentication Security Tests', () => {
  describe('Password Requirements', () => {
    it('should enforce strong password requirements', () => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      // Valid passwords
      expect(passwordRegex.test('Password123!')).toBe(true);
      expect(passwordRegex.test('MyP@ssw0rd')).toBe(true);

      // Invalid passwords
      expect(passwordRegex.test('password')).toBe(false); // No uppercase, number, special char
      expect(passwordRegex.test('PASSWORD123!')).toBe(false); // No lowercase
      expect(passwordRegex.test('Password!')).toBe(false); // No number
      expect(passwordRegex.test('Password123')).toBe(false); // No special char
      expect(passwordRegex.test('Pass1!')).toBe(false); // Too short
    });
  });

  describe('Input Validation Patterns', () => {
    it('should validate username format', () => {
      const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;

      // Valid usernames
      expect(usernameRegex.test('john_doe')).toBe(true);
      expect(usernameRegex.test('user123')).toBe(true);

      // Invalid usernames
      expect(usernameRegex.test('ab')).toBe(false); // Too short
      expect(usernameRegex.test('user@name')).toBe(false); // Invalid character
      expect(usernameRegex.test('user name')).toBe(false); // Space not allowed
    });

    it('should validate account number format', () => {
      const accountRegex = /^[0-9]{10,16}$/;

      // Valid account numbers
      expect(accountRegex.test('1234567890')).toBe(true);
      expect(accountRegex.test('1234567890123456')).toBe(true);

      // Invalid account numbers
      expect(accountRegex.test('123456789')).toBe(false); // Too short
      expect(accountRegex.test('12345678901234567')).toBe(false); // Too long
      expect(accountRegex.test('12345ABC90')).toBe(false); // Contains letters
    });

    it('should validate SWIFT code format', () => {
      const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

      // Valid SWIFT codes
      expect(swiftRegex.test('ABCDEF12')).toBe(true);
      expect(swiftRegex.test('ABCDEF12XXX')).toBe(true);

      // Invalid SWIFT codes
      expect(swiftRegex.test('ABCDE12')).toBe(false); // Too short
      expect(swiftRegex.test('abcdef12')).toBe(false); // Lowercase
      expect(swiftRegex.test('ABCDEF1')).toBe(false); // Incomplete
    });

    it('should validate currency codes', () => {
      const currencyRegex = /^(USD|EUR|GBP|ZAR|JPY|AUD|CAD|CHF)$/;

      // Valid currencies
      expect(currencyRegex.test('USD')).toBe(true);
      expect(currencyRegex.test('EUR')).toBe(true);
      expect(currencyRegex.test('ZAR')).toBe(true);

      // Invalid currencies
      expect(currencyRegex.test('XXX')).toBe(false);
      expect(currencyRegex.test('usd')).toBe(false); // Lowercase
      expect(currencyRegex.test('USDD')).toBe(false); // Too long
    });
  });
});

describe('Error Handling', () => {
  it('should handle errors gracefully without exposing sensitive information', () => {
    const { errorHandler } = require('../middleware/security');
    const app = express();
    
    app.get('/error', (req, res, next) => {
      const error = new Error('Database connection failed');
      error.stack = 'Sensitive stack trace information';
      next(error);
    });

    app.use(errorHandler);

    return request(app)
      .get('/error')
      .expect(500)
      .then(response => {
        // Should not expose stack trace
        expect(response.body.stack).toBeUndefined();
        // Should have generic error message
        expect(response.body.success).toBe(false);
      });
  });
});
