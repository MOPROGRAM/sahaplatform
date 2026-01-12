# Saha API Documentation (ساحة)

## 🔐 Authentication

All authenticated requests must include the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "اسم المستخدم"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "اسم المستخدم",
    "role": "USER"
  }
}
```

**Error Response (400):**
```json
{
  "error": "User already exists"
}
```

### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

## 📰 Ads Endpoints

### GET /api/ads
Retrieve advertisements with optional filtering.

**Query Parameters:**
- `category`: Filter by category (Jobs, Real Estate, Vehicles, etc.)
- `location`: Search in location field
- `searchQuery`: Full-text search in title and description
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter

**Example Request:**
```
GET /api/ads?category=Real%20Estate&location=الرياض&minPrice=100000
```

**Response (200):**
```json
[
  {
    "id": "ad_123",
    "title": "شقة فاخرة للبيع - حي النرجس",
    "description": "شقة 3 غرف وصالة في موقع متميز",
    "price": 1250000,
    "currency": "SAR",
    "category": "Real Estate",
    "location": "الرياض، حي النرجس",
    "images": "[\"image1.jpg\", \"image2.jpg\"]",
    "isBoosted": false,
    "authorId": "user_123",
    "author": {
      "name": "شركة العقارات المميزة",
      "verified": true
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### POST /api/ads
Create a new advertisement (requires authentication).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "عنوان الإعلان",
  "description": "وصف تفصيلي للإعلان",
  "price": 50000,
  "currency": "SAR",
  "category": "Real Estate",
  "location": "الرياض، حي الملقا",
  "images": "[\"image1.jpg\"]",
  "isBoosted": false
}
```

**Success Response (201):**
```json
{
  "id": "ad_456",
  "title": "عنوان الإعلان",
  "description": "وصف تفصيلي للإعلان",
  "price": 50000,
  "currency": "SAR",
  "category": "Real Estate",
  "location": "الرياض، حي الملقا",
  "images": "[\"image1.jpg\"]",
  "isBoosted": false,
  "authorId": "user_123",
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "error": "Access denied"
}
```

## 💬 Real-time Messaging (Socket.io)

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'JWT_TOKEN'
  }
});
```

### Events

#### Join Chat Room
```javascript
socket.emit('join_room', {
  adId: 'ad_123',
  userId: 'user_456'
});
```

#### Send Message
```javascript
socket.emit('send_message', {
  adId: 'ad_123',
  senderId: 'user_456',
  receiverId: 'user_789',
  content: 'مرحباً، هل الإعلان متاح؟'
});
```

#### Receive Messages
```javascript
socket.on('receive_message', (message) => {
  console.log('New message:', message);
  // message: { id, content, senderId, receiverId, createdAt }
});
```

#### Connection Events
```javascript
socket.on('connect', () => {
  console.log('Connected to chat server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from chat server');
});
```

## 👥 User Roles & Permissions

### USER
- Post, edit, and delete own ads
- Send/receive messages
- View all public ads
- Basic account management

### MERCHANT
- All USER permissions
- Verified badge on profile
- Bulk ad uploads
- Premium ad placements
- Priority customer support

### ADMIN
- All MERCHANT permissions
- Moderate user content
- Manage user accounts
- System administration
- View analytics and reports

## 📊 Database Schema

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  role          String    @default("USER")
  verified      Boolean   @default(false)
  ads           Ad[]
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Ad Model
```prisma
model Ad {
  id          String   @id @default(cuid())
  title       String
  description String
  price       Float?
  currency    String   @default("SAR")
  category    String
  location    String
  images      String   @default("[]")
  video       String?
  isBoosted   Boolean  @default(false)
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Message Model
```prisma
model Message {
  id          String   @id @default(cuid())
  content     String
  senderId    String
  receiverId  String
  sender      User     @relation("SentMessages", fields: [senderId], references: [id])
  receiver    User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  createdAt   DateTime @default(now())
}
```

## ⚠️ Error Responses

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": "Error message description"
}
```

## 🔒 Security

- JWT tokens expire after 7 days
- Passwords hashed with bcrypt (salt rounds: 10)
- CORS configured for frontend origin
- Helmet security headers applied
- Input validation on all endpoints
- Rate limiting ready for implementation

## 📝 Notes

- All prices are in the specified currency (default: SAR)
- Image URLs are stored as JSON strings in the images field
- Timestamps are in ISO 8601 format
- All text fields support Arabic characters
- Search is case-insensitive for Arabic and English
