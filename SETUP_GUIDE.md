# Quick Setup Guide

## Prerequisites Installation

### 1. Install Node.js
Download and install from: https://nodejs.org/ (v14 or higher)

Verify installation:
```bash
node --version
npm --version
```

### 2. Install MongoDB

**Windows:**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service
5. Verify: `mongod --version`

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### 3. Install OpenSSL (for SSL certificates)

**Windows:**
- Download from: https://slproweb.com/products/Win32OpenSSL.html
- Or use Git Bash which includes OpenSSL

**macOS/Linux:**
Usually pre-installed. Verify: `openssl version`

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (in new terminal)
cd client
npm install
```

### Step 2: Configure Environment Variables

**Backend (.env):**
```bash
cd server
copy .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/payments-portal
JWT_SECRET=change-this-to-a-random-secure-string-min-32-chars
JWT_EXPIRE=24h
SSL_KEY_PATH=./config/ssl/server.key
SSL_CERT_PATH=./config/ssl/server.cert
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend (.env):**
```bash
cd client
copy .env.example .env
```

Edit `client/.env`:
```env
REACT_APP_API_URL=https://localhost:5000/api
```

### Step 3: Generate SSL Certificates

```bash
cd server/config/ssl

# Generate self-signed certificate (valid for 1 year)
openssl req -x509 -newkey rsa:2048 -nodes -keyout server.key -out server.cert -days 365 -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Bank/CN=localhost"

cd ../../..
```

**Note:** You'll see browser warnings with self-signed certificates. This is normal for development.

### Step 4: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

Verify MongoDB is running:
```bash
mongosh
# or
mongo
```

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

You should see:
```
MongoDB Connected: localhost
🔒 HTTPS Server running in development mode on port 5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Browser will open at `http://localhost:3000`

### Step 6: Create Test Employee Account

Open MongoDB shell:
```bash
mongosh
```

Run these commands:
```javascript
use payments-portal

// First, hash a password using Node.js
// In a separate terminal, run node and execute:
// const bcrypt = require('bcryptjs');
// bcrypt.hash('Employee123!', 12).then(hash => console.log(hash));

// Then insert the employee with the hashed password
db.users.insertOne({
  fullName: "Bank Employee",
  idNumber: "8001015009087",
  accountNumber: "9876543210",
  username: "employee1",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBpaQBdaa", // Employee123!
  role: "employee",
  isActive: true,
  createdAt: new Date()
})
```

**Or use this Node.js script:**

Create `server/scripts/createEmployee.js`:
```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI);

async function createEmployee() {
  const User = require('../models/User');
  
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash('Employee123!', salt);
  
  await User.create({
    fullName: "Bank Employee",
    idNumber: "8001015009087",
    accountNumber: "9876543210",
    username: "employee1",
    password: hashedPassword,
    role: "employee",
    isActive: true
  });
  
  console.log('Employee created successfully!');
  process.exit(0);
}

createEmployee();
```

Run it:
```bash
cd server
node scripts/createEmployee.js
```

## Testing the Application

### 1. Test Customer Flow

1. **Register:**
   - Go to http://localhost:3000
   - Click "Get Started"
   - Fill in registration form:
     - Full Name: John Doe
     - ID Number: 9001015009087 (13 digits)
     - Account Number: 1234567890123 (10-16 digits)
     - Username: johndoe
     - Password: Password123!
   - Click "Register"

2. **Create Payment:**
   - You'll be redirected to dashboard
   - Fill in payment form:
     - Amount: 1000.00
     - Currency: USD
     - Recipient Name: Jane Smith
     - Recipient Account: GB29NWBK60161331926819
     - SWIFT Code: ABCDZAJJ
   - Click "Pay Now"

3. **View History:**
   - Click "Payment History" tab
   - See your payment with "pending" status

### 2. Test Employee Flow

1. **Login as Employee:**
   - Logout from customer account
   - Login with:
     - Username: employee1
     - Account Number: 9876543210
     - Password: Employee123!

2. **Verify Payment:**
   - You'll see the pending payment
   - Review details
   - Click "Verify" button

3. **Submit to SWIFT:**
   - Click "All Payments" tab
   - Select verified payment(s) checkbox
   - Click "Submit to SWIFT"
   - Payment status changes to "submitted"

### 3. Test API with cURL

```bash
# Health Check
curl -k https://localhost:5000/api/health

# Register
curl -k -X POST https://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Test User\",\"idNumber\":\"9001015009087\",\"accountNumber\":\"1234567890\",\"username\":\"testuser\",\"password\":\"Password123!\"}"

# Login
curl -k -X POST https://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"testuser\",\"accountNumber\":\"1234567890\",\"password\":\"Password123!\"}"
```

## Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
```bash
# Check if MongoDB is running
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### Issue 2: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env file
```

### Issue 3: SSL Certificate Warnings
**Error:** Browser shows "Your connection is not private"

**Solution:**
This is normal for self-signed certificates. Click "Advanced" → "Proceed to localhost (unsafe)"

### Issue 4: CORS Errors
**Error:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:**
- Ensure backend is running on https://localhost:5000
- Check REACT_APP_API_URL in client/.env
- Verify CORS configuration in server/server.js

### Issue 5: Module Not Found
**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

### Issue 6: React Not Starting
**Error:** Various React errors

**Solution:**
```bash
cd client
npm install react-scripts@latest
npm start
```

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Development Tips

1. **Auto-reload:** Backend uses nodemon, frontend uses React hot reload
2. **Debugging:** Use browser DevTools Network tab to inspect API calls
3. **MongoDB GUI:** Use MongoDB Compass for easier database management
4. **API Testing:** Use Postman or Insomnia for API testing
5. **Logs:** Check terminal output for errors

## Next Steps

1. ✅ Complete setup
2. ✅ Test customer registration and payment
3. ✅ Test employee verification
4. 📝 Review security documentation (SECURITY.md)
5. 📝 Read API documentation (README.md)
6. 🧪 Run security tests
7. 📊 Review code for assignment submission

## Production Deployment

For production deployment, see README.md section "Production Deployment"

Key changes needed:
- Use real SSL certificates
- Set NODE_ENV=production
- Use strong JWT secrets
- Configure production MongoDB
- Set up proper logging
- Implement monitoring

## Support

If you encounter issues:
1. Check this guide
2. Review error messages in terminal
3. Check MongoDB logs
4. Verify all environment variables
5. Ensure all dependencies are installed

## Quick Reference

**Start Everything:**
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm start
```

**Stop Everything:**
- Press `Ctrl+C` in both terminals
- Stop MongoDB: `net stop MongoDB` (Windows) or `brew services stop mongodb-community` (macOS)

**Reset Database:**
```bash
mongosh
use payments-portal
db.dropDatabase()
```

**View Logs:**
- Backend: Check terminal running `npm run dev`
- Frontend: Check browser console (F12)
- MongoDB: Check MongoDB logs in data directory
