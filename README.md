# 🚀 Saha (ساحة) - Professional Classifieds Platform

**Saha** is a high-performance, professional marketplace platform for jobs, real estate, and general classifieds. Inspired by the "Chinese Tech-Aesthetic", it focuses on high information density, rapid interaction, and premium visual design.

![Saha Preview](./saha_homepage_preview.png)

## ✨ Key Features

- **🌐 Global Localization:** Full support for Arabic (RTL) and English (LTR).
- **📊 High-Density UI:** Optimized multi-column grid system for maximum "above-the-fold" content.
- **🔍 Advanced Filtering:** Multi-row, tag-based filtering system for deep-nested categories.
- **💬 Real-time Messaging:** Integrated buyer-seller chat system using Socket.io.
- **🛡️ Verified Sellers:** Built-in badge logic for trusted merchants and verified ads.
- **🌙 Dual Mode:** Premium support for Light and Dark modes.
- **📱 Responsive Design:** Compact, app-like experience on mobile with a bottom navigation bar.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js (Express)
- **ORM:** Prisma
- **Database:** PostgreSQL / SQLite
- **Real-time:** Socket.io

## 📂 Structure

```text
saha-platform/
├── client/                 # Next.js 14 Frontend
├── server/                 # Express API + Prisma
├── WALKTROUGH.md           # Feature documentation
└── API_DOCS.md             # Backend API specification
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/MOPROGRAM/sahaplatform.git
   cd saha-platform
   ```

2. **Setup Server:**
   ```bash
   cd server
   npm install
   npx prisma migrate dev --name init
   npx prisma db seed
   npm run dev
   ```

3. **Setup Client:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ for professional marketplaces.
