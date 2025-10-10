# International Payments Portal

A secure, full-stack web application for processing international payments through SWIFT. Built with React, Node.js, Express, and MongoDB.

##  Security Features

This application implements comprehensive security measures as required:

### 1. **Password Security**
- ✅ **Bcrypt hashing** with 12 salt rounds
- ✅ **Password salting** for additional security
- ✅ Strong password requirements (8+ chars, uppercase, lowercase, number, special character)

### 2. **Input Validation & Whitelisting**
- ✅ **RegEx patterns** for all user inputs
- ✅ Server-side validation using express-validator
- ✅ Client-side validation for immediate feedback
- ✅ Input sanitization to prevent XSS attacks

### 3. **SSL/TLS Encryption**
- ✅ HTTPS server configuration
- ✅ All traffic served over SSL
- ✅ Self-signed certificates for development
- ✅ Production-ready SSL setup

### 4. **Protection Against Common Attacks**
- ✅ **XSS Prevention**: Input sanitization, Content Security Policy
- ✅ **SQL Injection**: MongoDB with parameterized queries
- ✅ **CSRF Protection**: Token-based authentication
- ✅ **Rate Limiting**: Express rate limiter on all endpoints
- ✅ **Brute Force Protection**: Login attempt limiting
- ✅ **Helmet.js**: Security headers (HSTS, CSP, etc.)
- ✅ **CORS**: Configured for specific origins only

##  Architecture

### Backend (Node.js/Express)
```
server/
├── config/          # Database and SSL configuration
├── controllers/     # Business logic
├── middleware/      # Authentication, validation, security
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── utils/           # Helper functions
└── server.js        # Main server file
```

### Frontend (React)
```
client/
├── public/          # Static files
├── src/
│   ├── components/  # React components
│   ├── services/    # API services
│   ├── utils/       # Validation utilities
│   ├── App.js       # Main app component
│   └── index.js     # Entry point
```

##  Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- OpenSSL (for SSL certificates)

### 1. Clone the Repository
```bash
git clone https://github.com/stxphanx30/POE-PART-2-INSY7314.git 
cd customer-payments-portal
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://st10158190_db_user:zmGlRtcg5iNkFsyC@payments-portal.yrddn5i.mongodb.net/

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=24h

# SSL paths (relatifs au dossier server/)
SSL_KEY_PATH=./config/ssl/localhost-key.pem
SSL_CERT_PATH=./config/ssl/localhost.pem

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session management
SESSION_SECRET=your-super-strong-secret-key
SESSION_NAME=sessionId
SESSION_MAX_AGE_MS=1800000
SESSION_SAMESITE=lax
SESSION_COLLECTION=sessions
```

### 3. Generate SSL Certificates (Development)

```bash
cd server/config/ssl
openssl req -x509 -newkey rsa:2048 -nodes -keyout server.key -out server.cert -days 365 -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Bank/CN=localhost"
cd ../../..
```

### 4. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file in client directory:
```env
REACT_APP_API_URL=https://localhost:5000/api

```

### 5. Start MongoDB

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The application will open at `http://localhost:3000`

##  User Roles

### Customer
- Register and login
- Create international payments
- View payment history
- Track payment status

### Employee (Pre-registered)
- Login with employee credentials
- View pending payments
- Verify payment details and SWIFT codes
- Submit verified payments to SWIFT

##  Creating Employee Accounts

Employees must be created directly in the database. Use MongoDB shell or Compass:

```javascript
// In MongoDB shell
use payments-portal

db.users.insertOne({
  fullName: "John Employee",
  idNumber: "8001015009087",
  accountNumber: "1234567890",
  username: "employee1",
  password: "$2a$12$[bcrypt-hashed-password]", // Use bcrypt to hash
  role: "employee",
  isActive: true,
  createdAt: new Date()
})
```

Or use the registration endpoint with a modified controller for initial setup.

##  API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Payments
- `POST /api/payments` - Create payment (customer)
- `GET /api/payments/my-payments` - Get customer's payments (customer)
- `GET /api/payments/pending` - Get pending payments (employee)
- `GET /api/payments` - Get all payments (employee)
- `GET /api/payments/:id` - Get single payment (protected)
- `PUT /api/payments/:id/verify` - Verify payment (employee)
- `POST /api/payments/submit-to-swift` - Submit to SWIFT (employee)

##  Testing

### Manual Testing
1. Register a customer account
2. Login and create a payment
3. Login as employee
4. Verify the payment
5. Submit to SWIFT

### API Testing with cURL

```bash
# Register
curl -k -X POST https://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "idNumber": "9001015009087",
    "accountNumber": "1234567890",
    "username": "johndoe",
    "password": "Password123!"
  }'

# Login
curl -k -X POST https://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "accountNumber": "1234567890",
    "password": "Password123!"
  }'
```

##  Security Best Practices Implemented

1. **Environment Variables**: Sensitive data stored in .env files
2. **JWT Authentication**: Secure token-based authentication
3. **Password Hashing**: Bcrypt with salt rounds
4. **Input Validation**: RegEx whitelisting on all inputs
5. **Rate Limiting**: Prevents brute force attacks
6. **HTTPS Only**: All traffic encrypted
7. **CORS**: Restricted to specific origins
8. **Security Headers**: Helmet.js configuration
9. **Error Handling**: No sensitive data in error messages
10. **Database Security**: Mongoose with schema validation

##  Input Validation Patterns

| Field | Pattern | Description |
|-------|---------|-------------|
| Full Name | `^[a-zA-Z\s'-]{2,100}$` | Letters, spaces, hyphens, apostrophes |
| ID Number | `^[0-9]{13}$` | Exactly 13 digits |
| Account Number | `^[0-9]{10,16}$` | 10-16 digits |
| Username | `^[a-zA-Z0-9_]{3,50}$` | Alphanumeric and underscore |
| Password | Complex pattern | Min 8 chars, upper, lower, number, special |
| SWIFT Code | `^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$` | Valid SWIFT/BIC format |
| IBAN | `^[A-Z0-9]{8,34}$` | 8-34 alphanumeric characters |

##  Supported Currencies

- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- ZAR (South African Rand)
- JPY (Japanese Yen)
- AUD (Australian Dollar)
- CAD (Canadian Dollar)
- CHF (Swiss Franc)

##  Troubleshooting

### SSL Certificate Errors
If you see SSL warnings in the browser, this is normal for self-signed certificates in development. Click "Advanced" and "Proceed to localhost".

### MongoDB Connection Issues
Ensure MongoDB is running:
```bash
# Check status
mongod --version

# Start MongoDB
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod
```

### Port Already in Use
Change the PORT in `.env` file if 5000 is already in use.

##  License

This project is for educational purposes as part of the APDS assignment.

##  Development

Built with:
- **Frontend**: React 18, React Router, Axios, Lucide Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Security**: Bcrypt, JWT, Helmet, Express Rate Limit
- **Validation**: Express Validator, RegEx patterns



