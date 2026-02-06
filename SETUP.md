# Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Cloudinary account
- Email service (Gmail or other SMTP service)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/lewis-re-bn
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lewis-re-bn

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRE=7d

# Cloudinary Configuration
# Get these from https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@lewis-re.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

### 3. MongoDB Setup

#### Local MongoDB:
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/lewis-re-bn`

#### MongoDB Atlas (Cloud):
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create a database user
4. Whitelist your IP address
5. Get connection string and update `MONGODB_URI`

### 4. Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to `.env` file

### 5. Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password in `EMAIL_PASS`

### 6. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:5000`

## Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "property_owner"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Creating an Admin User

To create an admin user, you can either:

1. Register normally and update the role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

2. Or use the admin update endpoint (if you have admin access)

## Project Structure

```
lewis-RE-bn/
├── src/
│   ├── config/          # Database, Cloudinary config
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── types/           # TypeScript types
│   ├── utils/           # Helper functions
│   └── server.ts        # Entry point
├── .env                 # Environment variables (create this)
├── .env.example         # Example env file
├── package.json
├── tsconfig.json
└── README.md
```

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string format
- Verify network access (for Atlas)

### Cloudinary Upload Fails
- Verify API credentials
- Check file size limits (max 5MB)
- Ensure image format is supported (jpg, jpeg, png, webp)

### Email Not Sending
- Check SMTP credentials
- For Gmail, use App Password (not regular password)
- Verify firewall/network allows SMTP connections

### JWT Errors
- Ensure JWT_SECRET is set and at least 32 characters
- Check token expiration settings

