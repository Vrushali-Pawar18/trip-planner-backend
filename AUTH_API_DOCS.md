# Authentication API Documentation

This document outlines the authentication endpoints available in the Trip Planner Backend API.

## Base URL
```
http://localhost:5000/api/auth
```

## Endpoints

### 1. Sign Up (Create New User)

**Endpoint:** `POST /api/auth/signup`

**Description:** Registers a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- **400 Bad Request** - User already exists
```json
{
  "message": "User already exists"
}
```

- **400 Bad Request** - Invalid user data
```json
{
  "message": "Invalid user data"
}
```

- **500 Internal Server Error**
```json
{
  "message": "Error message details"
}
```

---

### 2. Sign In (Login)

**Endpoint:** `POST /api/auth/signin`

**Description:** Authenticates an existing user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- **401 Unauthorized** - Invalid credentials
```json
{
  "message": "Invalid email or password"
}
```

- **500 Internal Server Error**
```json
{
  "message": "Error message details"
}
```

---

### 3. Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logs out the user. Since we're using JWT, the token should be removed on the client side.

**Success Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## JWT Token Usage

### Token Format
The JWT token returned from signup/signin should be included in subsequent requests to protected routes.

### How to Use the Token
Include the token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration
- Default expiration: **30 days**
- Configurable via `JWT_EXPIRES_IN` environment variable
- When a token expires, the user must sign in again

### Token Payload
The JWT token contains:
```javascript
{
  "id": "507f1f77bcf86cd799439011",  // User ID
  "iat": 1637251234,                  // Issued at timestamp
  "exp": 1639843234                   // Expiration timestamp
}
```

---

## Environment Variables

Ensure your `.env` file contains:

```env
# MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trip-planner

# JWT Secret (Change this to a secure random string in production!)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# JWT Token Expiration (default: 30d)
JWT_EXPIRES_IN=30d

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

---

## Password Security

- Passwords are **automatically hashed** using bcrypt with a salt factor of 10
- **Never** store plain text passwords
- Passwords are **not returned** in API responses

---

## Testing with cURL

### Sign Up
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Sign In
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Using Protected Routes (Example)
```bash
curl http://localhost:5000/api/protected-route \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Security Best Practices

1. **Never commit `.env` to version control** - It contains sensitive secrets
2. **Use strong JWT secrets** - Generate using: `openssl rand -base64 32`
3. **Use HTTPS in production** - Never send tokens over HTTP
4. **Implement rate limiting** - Prevent brute force attacks
5. **Token refresh strategy** - Consider implementing refresh tokens for long-lived sessions
6. **Validate all inputs** - Always validate and sanitize user inputs

---

## Client-Side Implementation Example

### JavaScript/TypeScript Example

```typescript
// Sign Up
async function signup(name: string, email: string, password: string) {
  const response = await fetch('http://localhost:5000/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token (localStorage, sessionStorage, or secure cookie)
    localStorage.setItem('token', data.token);
    return data;
  } else {
    throw new Error(data.message);
  }
}

// Sign In
async function signin(email: string, password: string) {
  const response = await fetch('http://localhost:5000/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('token', data.token);
    return data;
  } else {
    throw new Error(data.message);
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  // Optionally call the logout endpoint
  fetch('http://localhost:5000/api/auth/logout', { method: 'POST' });
}

// Making authenticated requests
async function makeAuthenticatedRequest(url: string) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

---

## Next Steps

1. **Add input validation** - Use express-validator or joi
2. **Implement rate limiting** - Use express-rate-limit
3. **Add email verification** - Send confirmation emails
4. **Password reset flow** - Forgot password functionality
5. **Refresh token mechanism** - For better security
6. **2FA support** - Two-factor authentication
7. **Account management** - Update profile, change password

---

## Error Handling

All endpoints follow a consistent error response format:
```json
{
  "message": "Descriptive error message"
}
```

HTTP Status Codes Used:
- `200` - Success (GET, POST for existing resources)
- `201` - Created (POST for new resources)
- `400` - Bad Request (validation errors, duplicate resources)
- `401` - Unauthorized (invalid credentials, missing token)
- `500` - Internal Server Error (server-side errors)
