# Supabase Integration Guide for Saha Platform

## نظرة عامة | Overview

هذا الدليل يشرح كيفية دمج Supabase مع منصة ساحة للحفاظ على البيانات بشكل دائم.

This guide explains how to integrate Supabase with Saha Platform for persistent data storage.

---

## لماذا Supabase؟ | Why Supabase?

### المشكلة | The Problem
- خوادم Render المجانية تحذف البيانات عند إعادة التشغيل
- قاعدة بيانات SQLite المحلية تُفقد مع كل deployment

### الحل | The Solution
- Supabase توفر قاعدة بيانات PostgreSQL دائمة ومجانية
- إمكانية نقل المشروع لأي منصة استضافة
- الحفاظ على Docker والبنية الحالية

---

## خطوات الإعداد | Setup Steps

### 1. إنشاء مشروع Supabase | Create Supabase Project

1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب مجاني
3. أنشئ مشروع جديد (New Project)
4. اختر:
   - **اسم المشروع**: saha-platform
   - **كلمة مرور قاعدة البيانات**: احفظها بأمان!
   - **المنطقة**: اختر الأقرب لك (مثل: Frankfurt, Singapore)

### 2. الحصول على بيانات الاتصال | Get Connection Details

من لوحة تحكم Supabase:

1. اذهب إلى **Settings** → **Database**
2. ابحث عن **Connection String** → **URI**
3. انسخ الرابط وسيكون بهذا الشكل:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
4. استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها

### 3. تحديث ملفات البيئة | Update Environment Files

#### للخادم | For Server (`server/.env`):

```env
# استبدل هذا السطر
DATABASE_URL="file:./dev.db"

# بهذا السطر (مع بياناتك من Supabase)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

#### للعميل | For Client (`client/.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

**للحصول على المفاتيح**:
- اذهب إلى **Settings** → **API**
- انسخ **Project URL** و **anon/public key**

### 4. تحديث قاعدة البيانات | Update Database Schema

```bash
# في مجلد server
cd server

# تثبيت التبعيات
npm install

# إنشاء الجداول في Supabase
npx prisma db push

# ملء البيانات الأساسية (العملات، الدول، المدن)
npx prisma db seed
```

---

## استخدام Docker مع Supabase | Using Docker with Supabase

### للتطوير المحلي | For Local Development

يمكنك الاستمرار باستخدام SQLite:

```env
DATABASE_URL="file:./dev.db"
```

### للإنتاج على Render | For Production on Render

1. في لوحة تحكم Render، اذهب إلى **Environment**
2. أضف متغير البيئة:
   - **Key**: `DATABASE_URL`
   - **Value**: رابط Supabase الخاص بك

3. أعد نشر التطبيق (Redeploy)

---

## التبديل بين SQLite و PostgreSQL | Switching Between SQLite and PostgreSQL

### البنية الحالية تدعم كلاهما!

**للتطوير المحلي** (SQLite):
```env
DATABASE_URL="file:./dev.db"
```

**للإنتاج** (Supabase PostgreSQL):
```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

فقط غيّر `DATABASE_URL` وأعد تشغيل التطبيق!

---

## نقل البيانات من SQLite إلى Supabase | Migrating Data

إذا كان لديك بيانات في SQLite وتريد نقلها:

### الطريقة 1: تصدير واستيراد يدوي

```bash
# 1. تصدير البيانات من SQLite
sqlite3 dev.db .dump > backup.sql

# 2. تحويل إلى PostgreSQL format (يدوياً أو باستخدام أدوات)
# 3. استيراد إلى Supabase عبر SQL Editor
```

### الطريقة 2: استخدام Prisma

```bash
# 1. تأكد من أن DATABASE_URL يشير إلى Supabase
# 2. أعد تشغيل seed script
npx prisma db push
npx prisma db seed
```

---

## المزايا الإضافية لـ Supabase | Additional Supabase Features

### 1. Storage للملفات | File Storage
- رفع صور الإعلانات
- تخزين ملفات المحادثات

### 2. Authentication
- تسجيل دخول بالبريد الإلكتروني
- OAuth (Google, Facebook, etc.)

### 3. Realtime
- تحديثات فورية للمحادثات
- إشعارات لحظية

### 4. Edge Functions
- معالجة الصور
- إرسال الإشعارات

---

## استكشاف الأخطاء | Troubleshooting

### خطأ: "Can't reach database server"

**الحل**:
1. تأكد من صحة رابط DATABASE_URL
2. تأكد من أن كلمة المرور صحيحة
3. تحقق من أن المشروع نشط في Supabase

### خطأ: "SSL connection required"

**الحل**: أضف `?sslmode=require` لنهاية DATABASE_URL:
```
postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres?sslmode=require
```

### خطأ: "Prisma schema validation failed"

**الحل**:
```bash
npx prisma generate
npx prisma db push
```

---

## الأمان | Security

### ⚠️ مهم جداً | Very Important

1. **لا تشارك** كلمة مرور قاعدة البيانات
2. **لا ترفع** ملف `.env` إلى GitHub
3. **استخدم** متغيرات البيئة في Render
4. **فعّل** Row Level Security في Supabase

### تفعيل Row Level Security (RLS)

في Supabase SQL Editor:

```sql
-- للمستخدمين
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- للإعلانات
ALTER TABLE "Ad" ENABLE ROW LEVEL SECURITY;

-- سياسة: المستخدمون يمكنهم قراءة الإعلانات النشطة فقط
CREATE POLICY "Public ads are viewable by everyone"
ON "Ad" FOR SELECT
USING (isActive = true);

-- سياسة: المستخدمون يمكنهم تعديل إعلاناتهم فقط
CREATE POLICY "Users can update own ads"
ON "Ad" FOR UPDATE
USING (auth.uid() = authorId);
```

---

## الدعم | Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Saha Platform**: راجع `README.md`

---

## الخلاصة | Summary

✅ **قاعدة بيانات دائمة** - لن تُحذف البيانات
✅ **مجانية** - 500MB تخزين + 2GB نقل بيانات شهرياً
✅ **قابلة للتوسع** - يمكن الترقية لاحقاً
✅ **متوافقة** - تعمل مع Docker والبنية الحالية
✅ **قابلة للنقل** - يمكن نقل المشروع لأي منصة

---

**تم إنشاؤه بواسطة**: Saha Platform Team  
**التاريخ**: 2026-01-15
