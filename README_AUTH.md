# Authentication System - Complete Setup Guide

## Overview
This authentication system provides secure user registration, login, and protected route access using JWT (JSON Web Tokens).

## What's Included

### 1. **User Model** (`src/models/User.ts`)
- User schema with name, email, and password fields
- Automatic password hashing using bcrypt (salt factor: 10)
- Password comparison method for authentication
- Unique email constraint

### 2. **Authentication Controller** (`src/controllers/authController.ts`)
- **signup**: Register new users
- **signin**: Authenticate existing users
- **logout**: Logout endpoint (token removal handled client-side)

### 3. **Authentication Middleware** (`src/middleware/authMiddleware.ts`)
- **protect**: Middleware to protect routes requiring authentication
- Validates JWT tokens from Authorization header
- Attaches user object to request

### 4. **Token Generation** (`src/utils/generateToken.ts`)
- Generates JWT tokens with user ID
- Configurable expiration time
- Uses secret from environment variables

### 5. **Routes**
- **Auth Routes** (`src/routes/authRoutes.ts`): `/api/auth/signup`, `/api/auth/signin`, `/api/auth/logout`
- **User Routes** (`src/routes/userRoutes.ts`): Protected routes example

## Quick Start

### Step 1: Environment Configuration
Make sure your `.env` file has the following variables:

```env
# MongoDB URI (update with your credentials)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trip-planner

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=30d

# Server Configuration
PORT=5000
NODE_ENV=development
```

**⚠️ IMPORTANT:** Change `JWT_SECRET` to a strong, random string in production!

Generate a secure secret using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Install Dependencies
Dependencies have already been installed:
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation and verification
- `@types/bcryptjs` - TypeScript types
- `@types/jsonwebtoken` - TypeScript types

### Step 3: Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

## API Endpoints

### Authentication Endpoints

#### 1. Register a New User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Logout
```http
POST /api/auth/logout
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### Protected Route Example

#### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-11-26T18:10:00.000Z"
}
```

## How Authentication Works

### Registration Flow
1. User sends name, email, and password
2. System checks if email already exists
3. Password is hashed using bcrypt
4. User is saved to database
5. JWT token is generated and returned

### Login Flow
1. User sends email and password
2. System finds user by email
3. Password is compared with hashed password
4. If valid, JWT token is generated and returned

### Protected Route Access
1. Client sends request with `Authorization: Bearer <token>` header
2. Middleware validates the token
3. User information is attached to request
4. Route handler can access user data via `req.user`

## Token Management

### Token Structure
```javascript
{
  "id": "user_id_here",
  "iat": 1637251234,  // Issued at
  "exp": 1639843234   // Expiration
}
```

### Token Expiration
- Default: **30 days**
- Configurable via `JWT_EXPIRES_IN` environment variable
- Examples: `1h`, `7d`, `30d`, `60m`

### Client-Side Token Storage
**Option 1: LocalStorage** (Simple, but vulnerable to XSS)
```javascript
localStorage.setItem('token', token);
```

**Option 2: HTTP-Only Cookie** (More secure, recommended for production)
- Requires backend implementation
- Protected from XSS attacks

**Option 3: SessionStorage** (Cleared when tab closes)
```javascript
sessionStorage.setItem('token', token);
```

## Using Protected Routes

### Creating a Protected Route

```typescript
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// This route requires authentication
router.get('/my-route', protect, async (req: AuthRequest, res: Response) => {
  // req.user contains the authenticated user's data
  const userId = req.user._id;
  
  // Your route logic here
  res.json({ message: `Hello ${req.user.name}!` });
});
```

### Making Authenticated Requests (Client-Side)

```javascript
// Fetch API
const response = await fetch('http://localhost:5000/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Axios
const response = await axios.get('http://localhost:5000/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Security Features

### ✅ Implemented
- Password hashing with bcrypt (salt factor: 10)
- JWT token-based authentication
- Unique email constraint
- Password excluded from API responses
- Token expiration handling

### 🔒 Recommended Additions
1. **Input Validation**: Use `express-validator` or `joi`
2. **Rate Limiting**: Prevent brute force attacks
3. **Email Verification**: Confirm email addresses
4. **Password Reset**: Forgot password flow
5. **Refresh Tokens**: For better security
6. **2FA**: Two-factor authentication
7. **HTTPS**: Use SSL/TLS in production
8. **CORS Configuration**: Restrict allowed origins

## Testing the API

### Using cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

**Signin:**
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Access Protected Route:**
```bash
curl http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using the Test File
A test file has been provided: `testAuth.js`

Run it with Node.js (after starting your server):
```bash
node testAuth.js
```

### Using Postman or Insomnia
1. Create a new request
2. Set method to POST
3. Set URL to `http://localhost:5000/api/auth/signup`
4. Set headers: `Content-Type: application/json`
5. Set body to raw JSON:
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "test123"
   }
   ```
6. Send request and save the token
7. Use the token in the Authorization header for protected routes

## File Structure

```
src/
├── models/
│   └── User.ts              # User model with password hashing
├── controllers/
│   └── authController.ts    # Auth logic (signup, signin, logout)
├── middleware/
│   └── authMiddleware.ts    # JWT verification middleware
├── routes/
│   ├── authRoutes.ts        # Auth endpoints
│   └── userRoutes.ts        # Protected user endpoints
├── utils/
│   └── generateToken.ts     # JWT token generation
├── config/
│   └── db.ts                # MongoDB connection
└── server.ts                # Main application file
```

## Common Issues & Solutions

### Issue: "User already exists"
**Solution:** The email is already registered. Use a different email or sign in.

### Issue: "Invalid email or password"
**Solution:** Check credentials. Passwords are case-sensitive.

### Issue: "Not authorized, no token"
**Solution:** Include the token in the Authorization header: `Bearer <token>`

### Issue: "Not authorized, token failed"
**Solution:** Token might be expired or invalid. Sign in again to get a new token.

### Issue: Token expires too quickly
**Solution:** Update `JWT_EXPIRES_IN` in your `.env` file (e.g., `7d`, `30d`)

## Next Steps

Consider implementing:

1. **Input Validation**
   ```bash
   npm install express-validator
   ```

2. **Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```

3. **Email Service** (for verification)
   ```bash
   npm install nodemailer
   ```

4. **Password Strength Validation**
   ```bash
   npm install validator
   ```

## Documentation Files

- `AUTH_API_DOCS.md` - Detailed API documentation
- `testAuth.js` - Test examples
- `.env.example` - Environment variables template
- `README_AUTH.md` - This file

## Support

For issues or questions:
1. Check the documentation
2. Review error messages in console
3. Verify environment variables
4. Ensure MongoDB connection is working
5. Check that all dependencies are installed

---

**🎉 Your authentication system is ready to use!**

Start building your protected routes and enjoy secure user authentication.
