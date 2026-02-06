# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "property_owner" // optional: "admin", "property_owner", "property_seeker" (default)
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response includes JWT token:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "password": "newpassword123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

### Property Endpoints

#### Get All Properties (Public)
```http
GET /properties?type=house&city=Accra&minPrice=10000&maxPrice=100000&page=1&limit=10
```

Query Parameters:
- `type`: house, apartment, land, commercial, car, other
- `status`: available, pending, sold, rented
- `city`: Filter by city
- `state`: Filter by state
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `search`: Text search in title/description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### Get Property by ID (Public)
```http
GET /properties/:id
```

#### Get My Properties (Protected)
```http
GET /properties/my/properties
Authorization: Bearer <token>
```

#### Create Property (Protected - Owner/Admin)
```http
POST /properties
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Beautiful House",
  "description": "3 bedroom house in prime location",
  "type": "house",
  "price": 50000,
  "location": {
    "address": "123 Main St",
    "city": "Accra",
    "state": "Greater Accra",
    "zipCode": "GA123",
    "country": "Ghana"
  },
  "features": {
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 2000,
    "parking": true,
    "furnished": true,
    "yearBuilt": 2020
  },
  "images": [file1, file2, ...] // up to 10 images
}
```

#### Update Property (Protected - Owner/Admin)
```http
PUT /properties/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Updated Title",
  "price": 55000,
  "images": [newFile1, newFile2] // optional: adds to existing images
}
```

#### Delete Property (Protected - Owner/Admin)
```http
DELETE /properties/:id
Authorization: Bearer <token>
```

---

### Bid Endpoints

#### Create Bid (Protected)
```http
POST /bids
Authorization: Bearer <token>
Content-Type: application/json

{
  "propertyId": "property-id-here",
  "amount": 48000,
  "message": "I'm interested in this property"
}
```

#### Get Bids (Protected)
```http
GET /bids?propertyId=property-id-here
Authorization: Bearer <token>
```

- Returns user's own bids or bids on user's properties
- Admins see all bids

#### Get Bid by ID (Protected)
```http
GET /bids/:id
Authorization: Bearer <token>
```

#### Update Bid Status (Protected - Owner/Admin)
```http
PUT /bids/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted" // or "rejected"
}
```

When a bid is accepted:
- Property status changes to "pending"
- All other pending bids on the property are rejected

#### Delete Bid (Protected)
```http
DELETE /bids/:id
Authorization: Bearer <token>
```

---

### Admin Endpoints

#### Get Statistics (Admin Only)
```http
GET /admin/statistics
Authorization: Bearer <token>
```

Returns:
- Total users, properties, bids
- Users by role
- Properties by type and status
- Recent users and properties

#### Get All Users (Admin Only)
```http
GET /admin/users?page=1&limit=10&role=property_owner&search=john
Authorization: Bearer <token>
```

#### Update User (Admin Only)
```http
PUT /admin/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin",
  "isVerified": true
}
```

#### Delete User (Admin Only)
```http
DELETE /admin/users/:id
Authorization: Bearer <token>
```

---

## Property Features

The `features` object is flexible and can contain different fields based on property type:

### House/Apartment
```json
{
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 2000,
  "parking": true,
  "furnished": true,
  "yearBuilt": 2020
}
```

### Land
```json
{
  "area": 5000,
  "zoning": "residential",
  "utilities": true
}
```

### Car
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "mileage": 50000,
  "condition": "excellent"
}
```

### Commercial
```json
{
  "area": 10000,
  "parking": true,
  "zoning": "commercial"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [...] // optional: validation errors
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

---

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes
- Other endpoints: 100 requests per 15 minutes

