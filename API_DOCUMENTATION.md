# API Documentation

Base URL: `https://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Authentication Endpoints

#### Register Customer
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "idNumber": "9001015009087",
  "accountNumber": "1234567890",
  "username": "johndoe",
  "password": "Password123!"
}
```

**Validation Rules:**
- `fullName`: 2-100 characters, letters/spaces/hyphens/apostrophes only
- `idNumber`: Exactly 13 digits
- `accountNumber`: 10-16 digits
- `username`: 3-50 characters, alphanumeric and underscore
- `password`: Min 8 chars, must include uppercase, lowercase, number, special character

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "username": "johndoe",
    "accountNumber": "1234567890",
    "role": "customer"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "User with this username, ID number, or account number already exists"
}
```

---

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "johndoe",
  "accountNumber": "1234567890",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "username": "johndoe",
    "accountNumber": "1234567890",
    "role": "customer"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Rate Limit:** 5 requests per 15 minutes per IP

---

#### Get Current User
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "username": "johndoe",
    "accountNumber": "1234567890",
    "role": "customer"
  }
}
```

---

### Payment Endpoints

#### Create Payment (Customer Only)
```http
POST /api/payments
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 1000.50,
  "currency": "USD",
  "provider": "SWIFT",
  "recipientAccount": "GB29NWBK60161331926819",
  "recipientName": "Jane Smith",
  "swiftCode": "ABCDZAJJ"
}
```

**Validation Rules:**
- `amount`: 0.01 to 999,999,999.99
- `currency`: USD, EUR, GBP, ZAR, JPY, AUD, CAD, CHF
- `provider`: SWIFT (only option)
- `recipientAccount`: 8-34 alphanumeric characters
- `recipientName`: 2-100 characters, letters/spaces/hyphens/apostrophes
- `swiftCode`: 8 or 11 characters (e.g., ABCDZAJJ or ABCDZAJJXXX)

**Response (201):**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "payment": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "amount": 1000.50,
    "currency": "USD",
    "provider": "SWIFT",
    "recipientAccount": "GB29NWBK60161331926819",
    "recipientName": "Jane Smith",
    "swiftCode": "ABCDZAJJ",
    "status": "pending",
    "createdAt": "2025-10-08T10:30:00.000Z"
  }
}
```

**Rate Limit:** 20 requests per 15 minutes per IP

---

#### Get My Payments (Customer Only)
```http
GET /api/payments/my-payments
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "payments": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "amount": 1000.50,
      "currency": "USD",
      "recipientName": "Jane Smith",
      "recipientAccount": "GB29NWBK60161331926819",
      "swiftCode": "ABCDZAJJ",
      "status": "pending",
      "createdAt": "2025-10-08T10:30:00.000Z"
    }
  ]
}
```

---

#### Get Pending Payments (Employee Only)
```http
GET /api/payments/pending
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "payments": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "John Doe",
        "accountNumber": "1234567890"
      },
      "amount": 1000.50,
      "currency": "USD",
      "recipientName": "Jane Smith",
      "recipientAccount": "GB29NWBK60161331926819",
      "swiftCode": "ABCDZAJJ",
      "status": "pending",
      "createdAt": "2025-10-08T10:30:00.000Z"
    }
  ]
}
```

---

#### Get All Payments (Employee Only)
```http
GET /api/payments
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "payments": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "John Doe",
        "accountNumber": "1234567890"
      },
      "amount": 1000.50,
      "currency": "USD",
      "recipientName": "Jane Smith",
      "recipientAccount": "GB29NWBK60161331926819",
      "swiftCode": "ABCDZAJJ",
      "status": "verified",
      "verifiedBy": {
        "_id": "507f1f77bcf86cd799439013",
        "fullName": "Bank Employee",
        "username": "employee1"
      },
      "verifiedAt": "2025-10-08T11:00:00.000Z",
      "createdAt": "2025-10-08T10:30:00.000Z"
    }
  ]
}
```

---

#### Get Single Payment
```http
GET /api/payments/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "payment": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "John Doe",
      "accountNumber": "1234567890"
    },
    "amount": 1000.50,
    "currency": "USD",
    "recipientName": "Jane Smith",
    "recipientAccount": "GB29NWBK60161331926819",
    "swiftCode": "ABCDZAJJ",
    "status": "pending",
    "createdAt": "2025-10-08T10:30:00.000Z"
  }
}
```

**Note:** Customers can only view their own payments. Employees can view all payments.

---

#### Verify Payment (Employee Only)
```http
PUT /api/payments/:id/verify
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "verified",
    "verifiedBy": "507f1f77bcf86cd799439013",
    "verifiedAt": "2025-10-08T11:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Payment has already been processed"
}
```

---

#### Submit to SWIFT (Employee Only)
```http
POST /api/payments/submit-to-swift
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "paymentIds": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012"
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "2 payment(s) submitted to SWIFT successfully",
  "submittedCount": 2
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "No verified payments found to submit"
}
```

---

#### Health Check
```http
GET /api/health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-08T12:00:00.000Z"
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation Error |
| 401 | Unauthorized - Invalid/Missing Token |
| 403 | Forbidden - Insufficient Permissions |
| 404 | Not Found |
| 429 | Too Many Requests - Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Payment Status Flow

```
pending → verified → submitted → completed
```

- **pending**: Payment created by customer, awaiting verification
- **verified**: Payment verified by employee, ready for submission
- **submitted**: Payment submitted to SWIFT
- **completed**: Payment processed successfully
- **rejected**: Payment rejected (not implemented in current version)

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "msg": "Detailed error message",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/api/auth/register` | 5 requests / 15 min |
| `/api/auth/login` | 5 requests / 15 min |
| `/api/payments` (POST) | 20 requests / 15 min |
| All other endpoints | 100 requests / 15 min |

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## Security Headers

All responses include:
- `Strict-Transport-Security`: HSTS enabled
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 1; mode=block
- `Content-Security-Policy`: Configured

---

## Example Usage with JavaScript

```javascript
// Register
const registerResponse = await fetch('https://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'John Doe',
    idNumber: '9001015009087',
    accountNumber: '1234567890',
    username: 'johndoe',
    password: 'Password123!'
  })
});

const { token } = await registerResponse.json();

// Create Payment
const paymentResponse = await fetch('https://localhost:5000/api/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 1000.50,
    currency: 'USD',
    provider: 'SWIFT',
    recipientAccount: 'GB29NWBK60161331926819',
    recipientName: 'Jane Smith',
    swiftCode: 'ABCDZAJJ'
  })
});
```

---

## Testing with cURL

```bash
# Register
curl -k -X POST https://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","idNumber":"9001015009087","accountNumber":"1234567890","username":"johndoe","password":"Password123!"}'

# Login
curl -k -X POST https://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","accountNumber":"1234567890","password":"Password123!"}'

# Create Payment (replace TOKEN)
curl -k -X POST https://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"amount":1000.50,"currency":"USD","provider":"SWIFT","recipientAccount":"GB29NWBK60161331926819","recipientName":"Jane Smith","swiftCode":"ABCDZAJJ"}'
```

---

## WebSocket Support

Not implemented in current version. All communication is via REST API.

---

## Versioning

Current API Version: v1 (implicit in base URL)

Future versions will use: `/api/v2/...`
