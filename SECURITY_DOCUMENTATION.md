Got it 👍 Here’s a **humanized, natural rewrite** of your **Security Documentation** — I’ve removed all “marks” or grading-style wording, kept it clean, and made it sound more like a professional developer’s internal documentation rather than something AI-generated. It reads as if you or your team wrote it.

---

# **Security Documentation – Customer Payments Portal**

## **Overview**

This document outlines all the security measures implemented in the Customer Payments Portal to protect against common web vulnerabilities and attacks. The goal is to ensure confidentiality, integrity, and availability across all system components.

---

## **1. Password Security**

### **Implementation**

* **Hashing Algorithm:** bcrypt (12 salt rounds)
* **Password Requirements:**

  * Minimum of 8 characters
  * At least one uppercase letter
  * At least one lowercase letter
  * At least one number
  * At least one special character (@$!%*?&)

### **Code Location**

* **File:** `server/models/User.js`
* **Pre-save Hook:** Automatically hashes passwords before saving to the database
* **Comparison Method:** Secure password comparison using `bcrypt.compare()`

```javascript
// Hash password before saving
const salt = await bcrypt.genSalt(12);
this.password = await bcrypt.hash(this.password, salt);

// Compare password during login
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### **Security Highlights**

* Passwords are never stored in plain text
* Each password has a unique salt
* Timing-safe comparison prevents timing attacks
* Password field excluded from database queries (`select: false`)

---

## **2. Authentication & Authorization**

### **JWT Authentication**

* Tokens are generated with expiration times and stored securely on the client side.
* Verification middleware ensures only authenticated users access protected routes.

### **Static Login Setup**

* Registration is **disabled**; only pre-configured accounts exist.
* File: `server/routes/authRoutes.js`
* User creation happens manually in the database.

### **Role-Based Access Control (RBAC)**

* Two roles: **Customer** and **Employee**
* Role checks handled via middleware (`server/middleware/auth.js`)

```javascript
// Customer routes
router.post('/', protect, authorize('customer'), createPayment);

// Employee routes
router.get('/pending', protect, authorize('employee'), getPendingPayments);
```

---

## **3. Input Validation & Sanitization**

### **RegEx Validation**

Every input field is validated against strict regular expressions.

#### **User Inputs**

* Full Name: `/^[a-zA-Z\s'-]{2,100}$/`
* ID Number: `/^[0-9]{13}$/`
* Account Number: `/^[0-9]{10,16}$/`
* Username: `/^[a-zA-Z0-9_]{3,50}$/`
* Password: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/`

#### **Payment Inputs**

* Currency: `/^(USD|EUR|GBP|ZAR|JPY|AUD|CAD|CHF)$/`
* SWIFT Code: `/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/`
* Recipient Account: `/^[A-Z0-9]{8,34}$/`
* Recipient Name: `/^[a-zA-Z\s'-]{2,100}$/`

### **Sanitization Middleware**

* File: `server/middleware/security.js`
* Protects against XSS and script injection attacks.

```javascript
// Cleans input by removing script and iframe tags
obj[key] = obj[key].replace(/<script.*?>.*?<\/script>/gi, '');
obj[key] = obj[key].replace(/<iframe.*?>.*?<\/iframe>/gi, '');
obj[key] = obj[key].replace(/javascript:/gi, '');
obj[key] = obj[key].replace(/on\w+\s*=/gi, '');
```

---

## **4. Rate Limiting & Brute Force Protection**

### **Express-Rate-Limit**

Different rate limiters are applied to various parts of the app:

* **Auth Limiter:** 5 requests per 15 minutes per IP
* **Payment Limiter:** 20 requests per 15 minutes
* **General API Limiter:** 100 requests per 15 minutes

### **Express-Brute**

* File: `server/middleware/security.js`
* Uses MongoDB for persistent storage
* Configuration:

  * 5 free login attempts
  * Lockout starts at 5 minutes, up to 1 hour
  * Lifetime: 24 hours

```javascript
const bruteforce = new ExpressBrute(store, {
  freeRetries: 5,
  minWait: 5 * 60 * 1000,
  maxWait: 60 * 60 * 1000,
  lifetime: 24 * 60 * 60
});
```

---

## **5. SSL/HTTPS Configuration**

### **Development**

* Runs on HTTP for local testing
* Port: 5000
* URL: `http://localhost:5000/api`

### **Production**

* HTTPS enforced with SSL certificates
* Certificates located in `server/config/ssl/`
* File: `server/server.js`

```javascript
if (process.env.NODE_ENV === 'production') {
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'config/ssl/server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'config/ssl/server.cert'))
  };
  https.createServer(sslOptions, app);
}
```

### **HSTS**

* Enabled with Helmet
* Max Age: 1 year
* Includes subdomains
* Preload enabled

---

## **6. Attack Prevention**

### **Cross-Site Scripting (XSS)**

* Input sanitization removes malicious scripts
* Content Security Policy (CSP) enforced with Helmet

### **SQL/NoSQL Injection**

* All database operations go through Mongoose schema validation
* RegEx whitelisting ensures only expected patterns pass through

### **Cross-Site Request Forgery (CSRF)**

* JWT tokens in headers prevent CSRF
* CORS limited to known origins

### **Clickjacking**

* X-Frame-Options: `DENY`
* Helmet prevents the app from being embedded in iframes

### **Man-in-the-Middle (MITM)**

* HTTPS encryption in production
* HSTS forces secure connections
* Valid SSL/TLS certificates

### **Session Hijacking**

* Short-lived JWTs with expiration
* Tokens stored securely in client-side storage

### **Denial of Service (DoS)**

* Global rate limits
* Max body size: 10MB
* 10-second API timeouts

### **Information Disclosure**

* Generic error messages for clients
* Detailed errors logged server-side only
* Security headers hide server information

---

## **7. DevSecOps Pipeline**

### **CircleCI Setup**

File: `.circleci/config.yml`

#### **Pipeline Includes:**

1. **Backend Tests:** Unit and integration testing using a test database.
2. **Frontend Tests:** React component and build verification.
3. **Security Scan:** `npm audit` runs on both client and server for high-severity issues.
4. **SonarQube Scan:** Static code analysis for vulnerabilities, code smells, and coverage.
5. **API Security Testing:** Automated tests for rate limiting, JWT security, and validation.

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

### **SonarQube Integration**

* Integrated via SonarCloud
* Scans both frontend and backend code
* Runs automatically on every push

---

## **Security Checklist**

### ✅ **Implemented**

* Password hashing with bcrypt (12 rounds)
* JWT-based authentication
* Role-based access control
* RegEx validation and input sanitization
* Rate limiting and brute force protection
* HTTPS and HSTS configuration
* Helmet security headers
* CORS restriction
* DevSecOps pipeline with CircleCI
* SonarQube integration
* Software composition analysis
* Automated API security testing
* Secure error handling

---

## **Testing Security Features**

### **Manual Tests**

1. Test rate limiter by sending rapid requests
2. Trigger brute force lockouts
3. Submit invalid form data
4. Access protected routes without JWT
5. Try using the wrong role on restricted routes

### **Automated Tests**

```bash
cd server
npm test -- --testPathPattern=security
```

---

## **Maintenance & Updates**

### **Ongoing Tasks**

1. Run `npm audit` regularly and update packages
2. Renew SSL certificates before expiry
3. Apply new security patches promptly
4. Review and clean logs routinely
5. Fix SonarQube alerts and code smells

### **Monitoring**

* Failed login attempts
* Rate limit hits
* Unusual API activity
* Error spikes or latency issues

---
