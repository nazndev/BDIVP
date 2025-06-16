# NID Integration Service API Documentation

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Security & Middleware
- All routes are protected by JWT authentication (`verifyToken`).
- Role-based and partner-based access enforced (`requireRole`, `requirePartnerOrAdmin`).
- Audit logging for all sensitive actions (NID verification, user/partner changes, etc).
- **Rate Limiting:** NID verification endpoints are limited to 10 requests per minute per user (HTTP 429 if exceeded).
- **Note:** There are two `authMiddleware.js` files (`utils/` and `middleware/`). For consistency, use only `utils/authMiddleware.js` and remove/merge the other.

---

## Admin Endpoints

### Dashboard Overview
```
GET /api/admin/overview
```
**Admin only**

**Response:**
```json
{
  "partners": 10,
  "users": 25,
  "activeTokens": 15,
  "totalVerifications": 1000
}
```

### Audit Logs
```
GET /api/admin/audit-logs
```
**Admin only**

**Query Parameters:**
- `partnerId` (optional): Filter by partner ID
- `verified` (optional): Filter by verification status (true/false)
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "total": 1000,
  "page": 1,
  "limit": 50,
  "logs": [
    {
      "id": "uuid",
      "partnerId": "uuid",
      "endpoint": "/verify-basic",
      "requestBody": {},
      "responseBody": {},
      "statusCode": 200,
      "matchedFields": ["name", "dob"],
      "verified": true,
      "timestamp": "2024-03-20T10:00:00Z",
      "Partner": {
        "name": "Partner Name",
        "apiKey": "masked-api-key"
      }
    }
  ]
}
```

---

## User Management (Admin Only)

### List All Users
```
GET /api/users
```
**Admin only**

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "partner",
    "permissions": ["read:own"],
    "scopes": ["user"],
    "isActive": true,
    "partner": { "id": "uuid", "orgName": "Org", "systemName": "sys" }
  }
]
```

### Update User Permissions/Scopes
```
PUT /api/users/:id/permissions
```
**Admin only**

**Request Body:**
```json
{
  "permissions": ["read:own", "write:own"],
  "scopes": ["user", "partner"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "permissions": ["read:own", "write:own"],
  "scopes": ["user", "partner"]
}
```

---

## Partner Management

### List All Partners
```
GET /api/partners
```
**Admin only**

### Get Partner Details
```
GET /api/partners/:id
```
**Admin or owning partner**

### Create Partner
```
POST /api/partners
```
**Admin only**

### Update Partner
```
PUT /api/partners/:id
```
**Admin only**

### Delete (Deactivate) Partner
```
DELETE /api/partners/:id
```
**Admin only**

### Update NID API Credentials
```
PUT /api/partners/:id/credentials
```
**Admin only**

**Request Body:**
```json
{
  "nidUsername": "new-nid-username",
  "nidPassword": "new-nid-password"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "orgName": "Org Name",
    "systemName": "sys",
    "nidUsername": "abcd****",
    "nidPassword": "xyza****",
    "isActive": true,
    "updatedAt": "2024-06-15T12:00:00Z"
  }
}
```

---

## NID Verification Endpoints

### Basic Verification
```
POST /api/nid/verify-basic
```
**Partner or user (own partner only)**

**Rate limit:** 10 requests/min/user

**Request Body:**
```json
{
  "nidNumber": "1234567890",
  "dateOfBirth": "1990-01-01"
}
```

**Response:**
```json
{
  "status": "success",
  "type": "BASIC",
  "verified": true,
  "matchedFields": ["name", "dob"],
  "fieldVerificationResult": {
    "name": true,
    "dob": true
  }
}
```

### Full Verification
```
POST /api/nid/verify-full
```
**Partner or user (own partner only)**

**Rate limit:** 10 requests/min/user

**Request Body:**
```json
{
  "nidNumber": "1234567890",
  "dateOfBirth": "1990-01-01"
}
```

**Response:**
```json
{
  "status": "success",
  "type": "FULL",
  "verified": true,
  "matchedFields": ["name", "dob", "father", "mother", "address"],
  "fieldVerificationResult": {
    "name": true,
    "dob": true,
    "father": true,
    "mother": true,
    "address": true
  },
  "details": {
    "name": "John Doe",
    "dob": "1990-01-01",
    "father": "Father Name",
    "mother": "Mother Name",
    "address": "Full Address"
  }
}
```

---

## Sample curl Commands

### Login
```
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nid-integration.com","password":"yourpassword"}'
```

### Get Current User (/me)
```
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Basic NID Verification
```
curl -X POST http://localhost:3000/api/nid/verify-basic \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"nidNumber":"1234567890","dateOfBirth":"1990-01-01"}'
```

### Admin: Update User Permissions
```
curl -X PUT http://localhost:3000/api/users/<user-id>/permissions \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"permissions":["read:own","write:own"],"scopes":["user","partner"]}'
```

### Admin: Update Partner NID Credentials
```
curl -X PUT http://localhost:3000/api/partners/<partner-id>/credentials \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"nidUsername":"new-nid-username","nidPassword":"new-nid-password"}'
```

---

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "No token provided"
}
```
or
```json
{
  "error": "Invalid token"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```
or
```json
{
  "error": "Insufficient scope"
}
```

**429 Too Many Requests:**
```json
{
  "error": "Rate limit exceeded: 10 NID verifications per minute"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Something went wrong!"
}
```

---

## Notes
- All sensitive actions are audit logged (including NID verification, user/partner changes, credential updates).
- Use only one `authMiddleware.js` (preferably `utils/authMiddleware.js`).
- All IDs are UUIDs.
- All date/times are ISO8601. 