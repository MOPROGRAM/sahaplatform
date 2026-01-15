# ⚡ مرجع سريع - Supabase + Render

## 🎯 الهدف
حل مشكلة حذف البيانات على Render باستخدام Supabase

---

## 📋 الخطوات (5 دقائق)

### 1️⃣ إنشاء Supabase
```
1. اذهب إلى: supabase.com
2. New Project → saha-platform
3. اختر كلمة مرور قوية (احفظها!)
4. Region: Frankfurt
5. انتظر 2-3 دقائق
```

### 2️⃣ الحصول على DATABASE_URL
```
Settings → Database → Connection String → URI

مثال:
postgresql://postgres.xxxxx:MyPass123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### 3️⃣ تحديث Render
```
Dashboard → Your Service → Environment

Key: DATABASE_URL
Value: [الصق رابط Supabase]

Save
```

### 4️⃣ إعادة النشر
```
Manual Deploy → Deploy latest commit
انتظر 5-10 دقائق
```

### 5️⃣ التحقق
```
في Logs، ابحث عن:
✅ "Using PostgreSQL (Supabase) database..."
✅ "Database ready!"
```

---

## 🔧 التطوير المحلي

### SQLite (سريع):
```bash
# server/.env
DATABASE_URL="file:./dev.db"

cd server
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

### PostgreSQL (اختبار):
```bash
docker-compose up -d postgres

# server/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saha_platform"

cd server
npx prisma db push
npx prisma db seed
npm run dev
```

---

## 🆘 حل المشاكل

### البيانات تُحذف
```
✓ تحقق: DATABASE_URL يبدأ بـ postgresql://
✓ تحقق: في Render Environment (ليس في الكود)
✓ تحقق: Logs تقول "Using PostgreSQL"
```

### Can't reach database
```
✓ تحقق: كلمة المرور صحيحة
✓ تحقق: Supabase project نشط
✓ جرّب: أضف ?sslmode=require للنهاية
```

### Migration failed
```
npx prisma generate
npx prisma db push --force-reset
npx prisma db seed
```

---

## 📁 الملفات المهمة

```
QUICK_START_AR.md          ← ابدأ هنا
RENDER_SUPABASE_GUIDE.md   ← دليل Render
SUPABASE_SETUP.md          ← دليل شامل
DATABASE_CONFIG.md         ← إدارة قواعد البيانات

migrate-to-supabase.ps1    ← سكريبت Windows
migrate-to-supabase.sh     ← سكريبت Linux/Mac
render.env.template        ← قالب متغيرات البيئة
```

---

## ✅ قائمة التحقق

قبل النشر:
- [ ] حساب Supabase جاهز
- [ ] DATABASE_URL منسوخ
- [ ] كلمة المرور محفوظة بأمان
- [ ] DATABASE_URL في Render Environment
- [ ] JWT_SECRET محدّث

بعد النشر:
- [ ] Logs تظهر "PostgreSQL"
- [ ] Logs تظهر "Database ready"
- [ ] الموقع يفتح بدون أخطاء
- [ ] يمكن التسجيل
- [ ] يمكن إنشاء إعلان
- [ ] البيانات تبقى بعد إعادة التشغيل

---

## 💡 نصائح

✅ **افعل**:
- احفظ DATABASE_URL في مدير كلمات المرور
- استخدم Environment Variables في Render
- راجع Logs بعد كل deployment
- احتفظ بنسخة احتياطية من .env

❌ **لا تفعل**:
- لا ترفع .env إلى GitHub
- لا تضع DATABASE_URL في الكود
- لا تشارك كلمة مرور Supabase
- لا تستخدم SQLite في Production

---

## 📞 المساعدة

**مشكلة في الإعداد؟**
→ راجع RENDER_SUPABASE_GUIDE.md

**تريد التفاصيل الكاملة؟**
→ راجع SUPABASE_SETUP.md

**تريد فهم قواعد البيانات؟**
→ راجع DATABASE_CONFIG.md

---

## 🎯 النتيجة النهائية

✅ بيانات دائمة (لا تُحذف)
✅ مجاني 100%
✅ نفس Docker
✅ سهل النقل
✅ جاهز للإنتاج

**الوقت**: 5-10 دقائق
**التكلفة**: مجاني
**الصعوبة**: سهل

---

**آخر تحديث**: 2026-01-15
**الإصدار**: 2.0
