# Security Documentation - Customer Payments Portal

## Overview
This document outlines all security measures implemented in the Customer Payments Portal to protect against common web vulnerabilities and attacks.

## Table of Contents
1. [Password Security](#password-security)
2. [Authentication & Authorization](#authentication--authorization)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [Rate Limiting & Brute Force Protection](#rate-limiting--brute-force-protection)
5. [SSL/HTTPS Configuration](#sslhttps-configuration)
6. [Attack Prevention](#attack-prevention)
7. [DevSecOps Pipeline](#devsecops-pipeline)

---

## 1. Password Security

### Implementation
- **Hashing Algorithm**: bcrypt with 12 rounds of salting
- **Password Requirements**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)

### Code Location
- **File**: `server/models/User.js`
- **Pre-save Hook**: Automatically hashes passwords before saving to database
- **Comparison Method**: Secure password verification using bcrypt.compare()

```javascript
// Password hashing (12 rounds)
const salt = await bcrypt.genSalt(12);
this.password = await bcrypt.hash(this.password, salt);

// Password verification
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### Security Features
- Passwords never stored in plain text
- Unique salt for each password
- Timing-safe comparison prevents timing attacks
- Password field excluded from queries by default (`select: false`)

---

## 2. Authentication & Authorization

### JWT (JSON Web Tokens)
- **Token Generation**: Secure token generation with configurable expiration
- **Token Storage**: Client-side storage in localStorage
- **Token Verification**: Middleware validates tokens on protected routes

### Static Login (No Registration)
- **Registration Disabled**: Only pre-configured users can access the system
- **File**: `server/routes/authRoutes.js` (registration endpoint commented out)
- **User Creation**: Users must be manually created in the database

### Role-Based Access Control (RBAC)
- **Roles**: Customer, Employee
- **Authorization Middleware**: `server/middleware/auth.js`
- **Route Protection**: Different endpoints for different roles

```javascript
// Customer routes
router.post('/', protect, authorize('customer'), createPayment);

// Employee routes
router.get('/pending', protect, authorize('employee'), getPendingPayments);
```

---

## 3. Input Validation & Sanitization

### RegEx Whitelisting
All inputs are validated using strict RegEx patterns:

#### User Inputs
- **Full Name**: `/^[a-zA-Z\s'-]{2,100}$/`
- **ID Number**: `/^[0-9]{13}$/` (South African ID)
- **Account Number**: `/^[0-9]{10,16}$/`
- **Username**: `/^[a-zA-Z0-9_]{3,50}$/`
- **Password**: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/`

#### Payment Inputs
- **Currency**: `/^(USD|EUR|GBP|ZAR|JPY|AUD|CAD|CHF)$/`
- **SWIFT Code**: `/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/`
- **Recipient Account**: `/^[A-Z0-9]{8,34}$/` (IBAN format)
- **Recipient Name**: `/^[a-zA-Z\s'-]{2,100}$/`

### Sanitization Middleware
- **File**: `server/middleware/security.js`
- **Protection Against**: XSS, Script Injection, Event Handler Injection
- **Implementation**: Removes dangerous content from all inputs

```javascript
// Removes script tags, iframes, javascript: protocol, and event handlers
obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
obj[key] = obj[key].replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
obj[key] = obj[key].replace(/javascript:/gi, '');
obj[key] = obj[key].replace(/on\w+\s*=/gi, '');
```

---

## 4. Rate Limiting & Brute Force Protection

### Express-Rate-Limit
Multiple rate limiters for different endpoints:

#### Authentication Limiter
- **Window**: 15 minutes
- **Max Requests**: 5 per IP
- **Purpose**: Prevent credential stuffing attacks

#### Payment Limiter
- **Window**: 15 minutes
- **Max Requests**: 20 per IP
- **Purpose**: Prevent payment spam

#### General API Limiter
- **Window**: 15 minutes (configurable)
- **Max Requests**: 100 per IP (configurable)
- **Purpose**: Overall API protection

### Express-Brute (Brute Force Protection)
- **File**: `server/middleware/security.js`
- **Storage**: MongoDB (persistent across restarts)
- **Configuration**:
  - Free Retries: 5 failed login attempts
  - Min Wait: 5 minutes after failed attempts
  - Max Wait: 1 hour
  - Lifetime: 24 hours

```javascript
const bruteforce = new ExpressBrute(store, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000,
  maxWait: 60 * 60 * 1000,
  lifetime: 24 * 60 * 60
});
```

---

## 5. SSL/HTTPS Configuration

### Development Mode
- **Protocol**: HTTP (for local testing)
- **Port**: 5000
- **URL**: `http://localhost:5000/api`

### Production Mode
- **Protocol**: HTTPS (enforced)
- **Port**: 5000 (or configured)
- **SSL Certificates**: Located in `server/config/ssl/`
- **Configuration**: `server/server.js`

```javascript
if (process.env.NODE_ENV === 'production') {
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'config/ssl/server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'config/ssl/server.cert'))
  };
  const server = https.createServer(sslOptions, app);
}
```

### HSTS (HTTP Strict Transport Security)
- **Enabled**: Yes (via Helmet)
- **Max Age**: 1 year (31536000 seconds)
- **Include Subdomains**: Yes
- **Preload**: Yes

---

## 6. Attack Prevention

### Cross-Site Scripting (XSS)
- **Protection**: Input sanitization middleware
- **CSP Headers**: Content Security Policy via Helmet
- **Implementation**: Removes script tags and dangerous content

### SQL/NoSQL Injection
- **Protection**: Mongoose schema validation
- **Parameterized Queries**: All database queries use Mongoose methods
- **Input Validation**: RegEx whitelisting prevents malicious input

### Cross-Site Request Forgery (CSRF)
- **Protection**: JWT tokens in Authorization headers
- **CORS Configuration**: Restricted origins
- **Same-Site Cookies**: Not using cookies (JWT in headers)

### Clickjacking
- **Protection**: X-Frame-Options header via Helmet
- **Value**: DENY (prevents embedding in iframes)

### Man-in-the-Middle (MITM)
- **Protection**: HTTPS in production
- **HSTS**: Forces HTTPS connections
- **Certificate Validation**: SSL/TLS certificates

### Session Hijacking
- **Protection**: JWT with expiration
- **Token Storage**: Secure storage practices
- **Token Rotation**: Configurable expiration (30 days default)

### Denial of Service (DoS)
- **Protection**: Rate limiting on all endpoints
- **Request Size Limits**: 10MB max body size
- **Timeout Configuration**: 10-second timeout on API requests

### Information Disclosure
- **Error Handling**: Generic error messages to clients
- **Logging**: Detailed errors only in server logs
- **Headers**: Security headers hide server information

---

## 7. DevSecOps Pipeline

### CircleCI Configuration
File: `.circleci/config.yml`

#### Pipeline Jobs

##### 1. Backend Tests
- Runs unit and integration tests
- Includes security-specific tests
- MongoDB test database

##### 2. Frontend Tests
- React component tests
- Build verification
- Security audit

##### 3. Security Scan (Software Composition Analysis)
- **npm audit**: Checks for vulnerable dependencies
- **Severity Level**: High
- **Runs On**: Both server and client

##### 4. SonarQube Scan (Static Application Security Testing)
- **Code Quality**: Checks for code smells
- **Security Hotspots**: Identifies potential vulnerabilities
- **Coverage Reports**: Analyzes test coverage
- **Configuration**: `sonar-project.properties`

##### 5. API Security Testing
- **Rate Limiting Tests**: Verifies rate limiters work
- **Authentication Tests**: Tests JWT and login security
- **Input Validation Tests**: Validates RegEx patterns
- **Security Headers Tests**: Verifies Helmet configuration

### Workflow
```yaml
workflows:
  test-and-deploy:
    jobs:
      - test-backend
      - test-frontend
      - security-scan
      - sonarqube-scan
      - api-security-test
```

### SonarQube Integration
- **Platform**: SonarCloud
- **Scans**: Code quality, security vulnerabilities, code smells
- **Coverage**: Both frontend and backend
- **Triggers**: On every push to repository

---

## Security Checklist

### ✅ Implemented
- [x] Password hashing with bcrypt (12 rounds)
- [x] Password strength requirements
- [x] JWT authentication
- [x] Role-based authorization
- [x] Input validation with RegEx whitelisting
- [x] Input sanitization (XSS prevention)
- [x] Rate limiting (multiple tiers)
- [x] Brute force protection (express-brute)
- [x] HTTPS/SSL configuration
- [x] Security headers (Helmet)
- [x] CORS configuration
- [x] Static login (no registration)
- [x] DevSecOps pipeline with CircleCI
- [x] SonarQube integration
- [x] Software Composition Analysis (npm audit)
- [x] API security testing
- [x] Error handling
- [x] Request size limits
- [x] MongoDB injection prevention

### 🔒 Security Best Practices
- Environment variables for sensitive data
- Secure token storage
- Logging without sensitive information
- Database connection security
- Timeout configurations
- Error message sanitization

---

## Testing Security Features

### Manual Testing
1. **Rate Limiting**: Make multiple rapid requests to test limits
2. **Brute Force Protection**: Attempt multiple failed logins
3. **Input Validation**: Try submitting invalid data
4. **Authentication**: Test protected routes without tokens
5. **Authorization**: Test accessing routes with wrong role

### Automated Testing
Run the security test suite:
```bash
cd server
npm test -- --testPathPattern=security
```

---

## Maintenance & Updates

### Regular Tasks
1. **Dependency Updates**: Run `npm audit` and update vulnerable packages
2. **Certificate Renewal**: Update SSL certificates before expiration
3. **Security Patches**: Monitor and apply security updates
4. **Log Review**: Regularly review security logs
5. **SonarQube Reports**: Address code smells and hotspots

### Monitoring
- Failed login attempts
- Rate limit violations
- Unusual API patterns
- Error rates
- Response times

---

## Contact & Support
For security concerns or to report vulnerabilities, please contact the development team.

**Last Updated**: 2025-10-24
**Version**: 1.0
