# 🚀 Saha (ساحة) - Professional Classifieds Platform

**Saha** is a high-performance, professional marketplace platform for jobs, real estate, and general classifieds. Inspired by the "Chinese Tech-Aesthetic", it focuses on high information density, rapid interaction, and premium visual design.

![Saha Preview](./live-preview.html)

## ✨ Key Features

- **🌐 Global Localization:** Full support for Arabic (RTL) and English (LTR).
- **📊 High-Density UI:** Optimized multi-column grid system for maximum "above-the-fold" content.
- **🔍 Advanced Filtering:** Multi-row, tag-based filtering system for deep-nested categories.
- **💬 Real-time Messaging:** Integrated buyer-seller chat system using Socket.io.
- **🛡️ Verified Sellers:** Built-in badge logic for trusted merchants and verified ads.
- **🌙 Dual Mode:** Premium support for Light and Dark modes.
- **📱 Responsive Design:** Compact, app-like experience on mobile with a bottom navigation bar.
- **🔐 Authentication:** JWT-based user system with secure registration/login
- **🗄️ Database:** SQLite with Prisma ORM for data persistence

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Icons:** Lucide React
- **TypeScript:** Full type safety

### Backend
- **Runtime:** Node.js (Express)
- **ORM:** Prisma
- **Database:** SQLite (production-ready)
- **Authentication:** JWT + bcrypt
- **Security:** Helmet, CORS, middleware
- **Real-time:** Socket.io (ready for chat)

## 📂 Project Structure

```
saha-platform/
├── client/                    # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── page.tsx      # Homepage with full UI
│   │   │   ├── login/        # Authentication page
│   │   │   ├── post-ad/      # Ad posting form
│   │   │   ├── layout.tsx    # Root layout with navigation
│   │   │   └── globals.css   # Global styles
│   │   ├── components/       # Reusable components
│   │   │   ├── BottomNav.tsx # Mobile navigation
│   │   │   ├── AdvancedFilter.tsx # Search filters
│   │   │   └── ChatWindow.tsx # Chat component
│   │   ├── lib/              # Utilities
│   │   │   └── api.ts        # API client with auth
│   │   └── store/            # State management
│   │       └── useAuthStore.ts # Authentication store
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── server/                    # Express API Server
│   ├── src/
│   │   ├── index.js          # Main server file
│   │   ├── middleware/       # Express middleware
│   │   │   └── auth.js       # JWT authentication
│   │   └── modules/          # Feature modules
│   │       ├── auth/         # Authentication system
│   │       │   ├── auth.controller.js
│   │       │   └── auth.service.js
│   │       └── ads/          # Ads management
│   │           ├── ad.controller.js
│   │           └── ad.service.js
│   ├── prisma/               # Database schema & migrations
│   │   ├── schema.prisma     # Database model
│   │   ├── seed.js           # Sample data
│   │   └── migrations/       # DB migrations
│   └── package.json
├── database/                 # SQLite database files
├── docs/                     # Documentation
│   ├── API_DOCS.md          # API documentation
│   ├── SECURITY.md           # Security guidelines
│   └── WALKTHROUGH.md       # Feature walkthrough
├── live-preview.html         # Static preview of the site
├── package.json             # Root package config
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (download from [nodejs.org](https://nodejs.org/))
- npm (comes with Node.js)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/saha-platform.git
   cd saha-platform
   ```

2. **Setup Backend (Server):**
   ```bash
   cd server
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   npm run dev
   ```
   The server will start on http://localhost:5000

3. **Setup Frontend (Client):**
   ```bash
   # In a new terminal
   cd client
   npm install
   npm run dev
   ```
   The client will start on http://localhost:3000

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "USER"
  }
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

### Ads Endpoints

#### GET /api/ads
Get all ads with optional filtering.

**Query Parameters:**
- `category`: Filter by category
- `location`: Search in location
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `searchQuery`: Text search in title/description

**Response:**
```json
[
  {
    "id": "ad_id",
    "title": "شقة فاخرة للبيع",
    "description": "شقة 3 غرف في موقع متميز",
    "price": 1250000,
    "currency": "SAR",
    "category": "Real Estate",
    "location": "الرياض",
    "images": "[]",
    "isBoosted": false,
    "author": {
      "name": "User Name",
      "verified": true
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### POST /api/ads
Create a new advertisement (requires authentication).

**Request Body:**
```json
{
  "title": "Ad Title",
  "description": "Ad description",
  "price": 1000,
  "category": "Electronics",
  "location": "City, District",
  "images": "[]"
}
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

## 🔧 Components Documentation

### Frontend Components

#### BottomNav
Mobile navigation component with 5 main sections:
- الرئيسية (Home)
- بحث (Search)
- أضف (Add Ad - centered)
- رسائلي (Messages)
- حسابي (Profile)

#### AdvancedFilter
Complex filtering component with:
- Category selection
- Location search with map icon
- Price range inputs
- Tag-based filtering system
- Active filters display

#### CategoryCard
Dynamic category display with:
- Rotating ad spotlight
- Static list of 3 recent ads
- Animated transitions
- Responsive design

### Backend Modules

#### Auth Module
- `auth.controller.js`: API endpoints for login/register
- `auth.service.js`: Business logic for authentication
- JWT token generation and validation
- Password hashing with bcrypt

#### Ads Module
- `ad.controller.js`: CRUD operations for advertisements
- `ad.service.js`: Business logic for ad management
- Filtering and search functionality
- User authorization checks

## 🚀 Deployment & GitHub Setup

### 1. إعداد GitHub Repository

#### إنشاء Repository جديد على GitHub:
1. اذهب إلى [github.com](https://github.com) وأنشئ حساب إذا لم يكن لديك
2. اضغط "New repository"
3. اختر اسم مناسب مثل `saha-platform`
4. اجعل الـ repository عام (Public)
5. لا تضف README أو .gitignore (موجودان بالفعل)

#### رفع الكود إلى GitHub:
```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit: Saha Platform with full backend and documentation"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/saha-platform.git
git push -u origin main
```

### 2. نشر الواجهة الأمامية (Vercel)

#### إعداد Vercel:
1. اذهب إلى [vercel.com](https://vercel.com) وسجل دخول
2. اضغط "Import Project"
3. اختر "From Git Repository" واربط حساب GitHub
4. اختر repository `saha-platform`
5. في إعدادات المشروع:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - أضف متغيرات البيئة:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
     ```

#### نشر الخادم الخلفي (Railway):

1. اذهب إلى [railway.app](https://railway.app) وسجل دخول
2. اضغط "New Project" → "Deploy from GitHub"
3. اربط repository `saha-platform`
4. في إعدادات المشروع:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm run dev`
   - أضف متغيرات البيئة:
     ```
     DATABASE_URL=file:./database/saha.db
     JWT_SECRET=your_super_secret_key_here
     NODE_ENV=production
     PORT=5000
     ```

### 3. إعداد قاعدة البيانات للإنتاج

#### تحويل إلى PostgreSQL:
1. غير `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. في Railway، أضف PostgreSQL database
3. انسخ connection string إلى متغيرات البيئة

#### تشغيل الـ Migrations:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 4. التحقق من النشر

بعد النشر، تأكد من:
- ✅ الموقع يعمل على https://your-app.vercel.app
- ✅ API يعمل على https://your-backend.railway.app
- ✅ قاعدة البيانات متصلة
- ✅ المصادقة تعمل
- ✅ الإعلانات تُحفظ وتُعرض

### 5. مراقبة وصيانة

#### إضافة مراقبة:
- استخدم Vercel Analytics للموقع
- استخدم Railway logs للخادم
- أضف error tracking مثل Sentry

#### النسخ الاحتياطي:
- Railway يقوم بنسخ احتياطي تلقائي
- احتفظ بنسخة محلية من قاعدة البيانات

---

## 📊 حالة المشروع

| المكون | الحالة | الرابط |
|---------|--------|---------|
| ✅ الواجهة الأمامية | جاهز للنشر | [Next.js App](client/) |
| ✅ الخادم الخلفي | جاهز للنشر | [Express API](server/) |
| ✅ قاعدة البيانات | SQLite/PostgreSQL | [Prisma Schema](server/prisma/) |
| ✅ التوثيق | مكتمل | [Documentation](docs/) |
| ✅ الأمان | مُطبق | [Security Guide](docs/SECURITY.md) |
| ✅ API | موثق | [API Docs](docs/API_DOCS.md) |

**المشروع مُكتمل ومُوثق بالكامل وجاهز للنشر على GitHub! 🎉**

## 🔐 Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Rate limiting (ready to implement)

## 📱 Responsive Design

- Mobile-first approach
- RTL support for Arabic
- Touch-friendly interface
- Optimized for all screen sizes
- Progressive Web App ready

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@saha-platform.com or join our Discord community.

---

Built with ❤️ for professional marketplaces in the Middle East.
