# 🚀 نشر Saha Platform على Cloudflare Pages مع Supabase

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر منصة ساحة على **Cloudflare Pages** (للفرونت إند) مع **Supabase** (للباك إند وقاعدة البيانات).

### البنية:
- **Frontend**: Cloudflare Pages (Next.js Static Export)
- **Backend**: Render أو أي خادم Node.js
- **Database**: Supabase PostgreSQL

---

## ⚡ الخطوات السريعة (10 دقائق)

### 1️⃣ إعداد Supabase (إذا لم تفعل بعد)

راجع [`QUICK_START_AR.md`](QUICK_START_AR.md) للحصول على:
- رابط قاعدة البيانات (DATABASE_URL)
- Supabase URL
- Supabase Anon Key

### 2️⃣ تحديث متغيرات البيئة للعميل

في ملف `client/.env.local`:

```env
# API URL - سيكون رابط الباك إند على Render
NEXT_PUBLIC_API_URL="https://your-backend.onrender.com/api"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 3️⃣ تحديث Next.js للتصدير الثابت

في `client/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

### 4️⃣ بناء المشروع

```bash
cd client
npm install
npm run build
```

سيتم إنشاء مجلد `client/out` يحتوي على الملفات الثابتة.

### 5️⃣ النشر على Cloudflare Pages

#### الطريقة 1: عبر Dashboard (الأسهل)

1. اذهب إلى [dash.cloudflare.com](https://dash.cloudflare.com)
2. اختر **Pages** من القائمة الجانبية
3. اضغط **Create a project**
4. اختر **Connect to Git** أو **Direct Upload**

##### إذا اخترت Git:
- اربط حساب GitHub
- اختر repository `saha-platform`
- **Build settings**:
  - Build command: `cd client && npm install && npm run build`
  - Build output directory: `client/out`
  - Root directory: `/`
- **Environment variables**:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

##### إذا اخترت Direct Upload:
- اسحب مجلد `client/out` إلى المتصفح
- أو استخدم CLI (الطريقة 2)

#### الطريقة 2: عبر Wrangler CLI

```bash
# تثبيت Wrangler
npm install -g wrangler

# تسجيل الدخول
wrangler login

# النشر
wrangler pages deploy client/out --project-name=saha-platform
```

---

## 🔧 الإعداد الكامل خطوة بخطوة

### الخطوة 1: تحضير الباك إند

#### نشر الباك إند على Render:

1. اذهب إلى [render.com](https://render.com)
2. أنشئ **Web Service** جديد
3. اربط repository `saha-platform`
4. **Settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   PORT=5000
   ```
6. انسخ رابط الخدمة (مثل: `https://saha-backend.onrender.com`)

### الخطوة 2: تحضير الفرونت إند

#### تحديث `client/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // إضافة هذا إذا كنت تستخدم مسارات ديناميكية
  // generateStaticParams: true,
}

module.exports = nextConfig
```

#### تحديث `client/.env.local`:

```env
NEXT_PUBLIC_API_URL="https://saha-backend.onrender.com/api"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

#### بناء المشروع:

```bash
cd client
npm install
npm run build
```

### الخطوة 3: النشر على Cloudflare Pages

#### باستخدام Git (موصى به):

1. ارفع الكود إلى GitHub:
   ```bash
   git add .
   git commit -m "Setup for Cloudflare Pages deployment"
   git push origin main
   ```

2. في Cloudflare Dashboard:
   - **Pages** → **Create a project** → **Connect to Git**
   - اختر repository
   - **Build settings**:
     ```
     Build command: cd client && npm install && npm run build
     Build output directory: client/out
     Root directory: /
     ```
   - **Environment variables**:
     ```
     NEXT_PUBLIC_API_URL=https://saha-backend.onrender.com/api
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

3. اضغط **Save and Deploy**

#### باستخدام Wrangler CLI:

```bash
# تثبيت Wrangler
npm install -g wrangler

# تسجيل الدخول
wrangler login

# النشر
cd client
npm run build
wrangler pages deploy out --project-name=saha-platform
```

---

## 🌐 إعداد Domain مخصص (اختياري)

### في Cloudflare Pages:

1. اذهب إلى **Custom domains**
2. اضغط **Set up a custom domain**
3. أدخل اسم النطاق (مثل: `saha.com`)
4. اتبع التعليمات لتحديث DNS

---

## 🔄 التحديثات التلقائية

### مع Git Integration:

كل مرة تدفع تحديثات إلى `main`:
- Cloudflare ستبني ونشر الفرونت إند تلقائياً
- Render سيعيد نشر الباك إند تلقائياً

### بدون Git:

استخدم Wrangler CLI:
```bash
cd client
npm run build
wrangler pages deploy out --project-name=saha-platform
```

---

## 📊 البنية النهائية

```
┌─────────────────────────────────────────┐
│         المستخدم / User                 │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Cloudflare Pages (Frontend)           │
│   - Next.js Static Export               │
│   - Global CDN                          │
│   - HTTPS مجاني                         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Render (Backend API)                  │
│   - Node.js + Express                   │
│   - Docker Container                    │
│   - Auto-deploy from Git                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│   Supabase (Database)                   │
│   - PostgreSQL                          │
│   - بيانات دائمة                        │
│   - نسخ احتياطي تلقائي                  │
└─────────────────────────────────────────┘
```

---

## 🎯 المزايا

### Cloudflare Pages:
- ✅ **مجاني تماماً** - Unlimited bandwidth
- ✅ **سريع جداً** - Global CDN
- ✅ **HTTPS مجاني** - SSL تلقائي
- ✅ **Auto-deploy** - من Git
- ✅ **Preview deployments** - لكل PR

### Render (Backend):
- ✅ **مجاني** - مع قيود (يتوقف بعد 15 دقيقة)
- ✅ **Docker support** - البنية الحالية
- ✅ **Auto-deploy** - من Git
- ✅ **Environment variables** - سهل الإدارة

### Supabase (Database):
- ✅ **مجاني** - حتى 500MB
- ✅ **بيانات دائمة** - لا تُحذف
- ✅ **نسخ احتياطي** - تلقائي
- ✅ **Dashboard** - لإدارة البيانات

---

## 🔍 استكشاف الأخطاء

### خطأ: "Build failed"

**الحل**:
```bash
# تأكد من أن next.config.js يحتوي على:
output: 'export'
images: { unoptimized: true }
```

### خطأ: "API calls failing"

**الحل**:
1. تحقق من `NEXT_PUBLIC_API_URL` في Environment Variables
2. تأكد من أن الباك إند يعمل على Render
3. تحقق من CORS في الباك إند

### خطأ: "Environment variables not working"

**الحل**:
- في Cloudflare Pages، المتغيرات يجب أن تبدأ بـ `NEXT_PUBLIC_`
- أعد البناء بعد تغيير المتغيرات

---

## 📝 سكريبتات مفيدة

أضف هذه إلى `package.json` في الجذر:

```json
{
  "scripts": {
    "cf:build": "cd client && npm install && npm run build",
    "cf:deploy": "cd client && npm run build && wrangler pages deploy out --project-name=saha-platform",
    "cf:dev": "cd client && npm run dev"
  }
}
```

الاستخدام:
```bash
npm run cf:build    # بناء الفرونت
npm run cf:deploy   # نشر على Cloudflare
npm run cf:dev      # تطوير محلي
```

---

## 🚀 الخطوات التالية

بعد النشر:

1. **اختبر الموقع**:
   - افتح رابط Cloudflare Pages
   - سجل مستخدم جديد
   - أنشئ إعلان
   - تحقق من المحادثات

2. **إعداد Domain مخصص** (اختياري):
   - اشتري نطاق
   - أضفه في Cloudflare Pages

3. **مراقبة الأداء**:
   - Cloudflare Analytics
   - Render Logs
   - Supabase Dashboard

4. **تحسينات**:
   - إضافة CDN للصور (Cloudflare R2)
   - تفعيل Caching
   - إضافة Service Worker

---

## 💰 التكاليف

### الخطة المجانية:

| الخدمة | الحد المجاني | التكلفة |
|--------|-------------|---------|
| **Cloudflare Pages** | Unlimited | مجاني |
| **Render** | 750 ساعة/شهر | مجاني |
| **Supabase** | 500MB + 2GB نقل | مجاني |

**المجموع**: **مجاني 100%** للاستخدام الأساسي!

### للترقية:

- **Cloudflare**: $20/شهر (Workers Paid)
- **Render**: $7/شهر (Starter)
- **Supabase**: $25/شهر (Pro)

---

## 📚 الموارد

- **Cloudflare Pages Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Next.js Static Export**: [nextjs.org/docs/app/building-your-application/deploying/static-exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

## ✅ قائمة التحقق النهائية

قبل النشر:
- [ ] Supabase جاهز ومتغيرات البيئة محدثة
- [ ] الباك إند منشور على Render ويعمل
- [ ] `next.config.js` محدث بـ `output: 'export'`
- [ ] `.env.local` يحتوي على المتغيرات الصحيحة
- [ ] البناء المحلي يعمل: `npm run build`

بعد النشر:
- [ ] الموقع يفتح على Cloudflare Pages
- [ ] API calls تعمل
- [ ] التسجيل يعمل
- [ ] إنشاء الإعلانات يعمل
- [ ] البيانات تُحفظ في Supabase

---

**🎉 مبروك! موقعك الآن على Cloudflare Pages مع Supabase!**

**الرابط**: `https://saha-platform.pages.dev`

---

**تم إنشاؤه**: 2026-01-15  
**الإصدار**: 2.0 (Cloudflare + Supabase)
