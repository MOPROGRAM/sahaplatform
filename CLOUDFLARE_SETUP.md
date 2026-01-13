# 🚀 إعداد Saha Platform على Cloudflare Pages

## نظرة عامة
تم تحويل Saha Platform للعمل مع **Cloudflare Pages + Functions + D1 Database** للنشر المجاني والسريع.

## 🏗️ البنية الجديدة
```
saha-platform/
├── client/                 # Next.js Frontend (يتم بناؤه للـ static)
├── pages/
│   ├── functions/         # Cloudflare Functions (الباكيند)
│   │   └── api/
│   │       ├── health.js  # Health check endpoint
│   │       └── ads.js     # Ads API
│   └── d1/
│       └── migrations/    # D1 Database migrations
├── wrangler.toml          # Cloudflare configuration
└── package.json           # Scripts للنشر
```

## 📋 خطوات الإعداد

### 1. تثبيت Wrangler CLI
```bash
npm install -g wrangler
```

### 2. تسجيل الدخول إلى Cloudflare
```bash
wrangler auth login
```

### 3. إنشاء D1 Database
```bash
# إنشاء قاعدة البيانات
wrangler d1 create saha-platform-db

# ستحصل على database_id، انسخه وضعه في wrangler.toml
```

### 4. تشغيل الـ migrations
```bash
# تطبيق migrations على قاعدة البيانات
wrangler d1 migrations apply saha-platform-db
```

### 5. بناء الفرونت
```bash
npm run build
```

### 6. النشر
```bash
# نشر الموقع
wrangler pages deploy client/out
```

## 🔧 Scripts المتاحة

```bash
# التطوير المحلي
npm run cf:dev

# النشر
npm run cf:deploy

# إنشاء قاعدة بيانات جديدة
npm run cf:db:create

# تطبيق migrations
npm run cf:db:migrate

# إعداد كامل
npm run cf:setup
```

## 🌐 API Endpoints

### Health Check
```
GET https://your-domain.pages.dev/api/health
```

### Ads API
```
GET  https://your-domain.pages.dev/api/ads     # جلب جميع الإعلانات
POST https://your-domain.pages.dev/api/ads     # إضافة إعلان جديد
```

## 📊 قاعدة البيانات D1

### الجداول المتاحة:
- **Currency**: العملات
- **Country**: الدول
- **City**: المدن
- **User**: المستخدمين
- **Ad**: الإعلانات

### حدود D1 المجانية:
- 500MB storage
- 100K rows per table
- 100K requests/day

## 🚀 الخطوات التفصيلية

### الخطوة 1: تحضير البيئة
```bash
# تثبيت dependencies
npm install

# تثبيت Wrangler
npm install -g wrangler

# تسجيل الدخول
wrangler auth login
```

### الخطوة 2: إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
npx wrangler d1 create saha-platform-db

# انسخ database_id وضعه في wrangler.toml
# في السطر: database_id = "your-database-id-here"
```

### الخطوة 3: تطبيق Schema
```bash
# تطبيق migrations
npx wrangler d1 migrations apply saha-platform-db
```

### الخطوة 4: بناء ونشر
```bash
# بناء الفرونت
npm run build

# نشر الموقع
npx wrangler pages deploy client/out
```

## 🔍 استكشاف الأخطاء

### مشكلة: Authentication failed
```bash
wrangler auth login
```

### مشكلة: Database not found
```bash
# تأكد من أن database_id صحيح في wrangler.toml
wrangler d1 list
```

### مشكلة: Functions not working
```bash
# اختبر محلياً أولاً
npm run cf:dev
```

## 📈 الترقية للإنتاج

عندما ينمو الموقع، يمكنك الترقية إلى:

### Workers Paid Plan:
- 10M requests/month (بدلاً من 100K)

### D1 Pro:
- Unlimited storage
- Higher limits

### R2 Storage:
- للصور والملفات (بديل للـ local storage)

## 🌟 المزايا

✅ **مجاني تماماً** للاستخدام الأساسي
✅ **سريع جداً** - Cloudflare CDN عالمي
✅ **موثوق** - 99.9% uptime
✅ **سهل الاستخدام** - CLI بسيط
✅ **قابل للترقية** - نمو مع الموقع

## 🎯 البدء السريع

```bash
# 1. إعداد
npm install && npm install -g wrangler
wrangler auth login

# 2. قاعدة بيانات
npx wrangler d1 create saha-platform-db
# (انسخ database_id)

# 3. تطبيق schema
npx wrangler d1 migrations apply saha-platform-db

# 4. بناء ونشر
npm run build
npx wrangler pages deploy client/out
```

**🎉 تهانينا! موقعك الآن على Cloudflare!**