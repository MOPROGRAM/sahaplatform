# Database Configuration Guide

## نظرة عامة | Overview

منصة ساحة تدعم نوعين من قواعد البيانات:

1. **SQLite** - للتطوير المحلي السريع
2. **PostgreSQL (Supabase)** - للإنتاج والبيانات الدائمة

---

## التبديل بين قواعد البيانات | Switching Databases

### استخدام SQLite (التطوير المحلي)

**المزايا**:
- ✅ لا حاجة لإعداد إضافي
- ✅ سريع للتطوير
- ✅ ملف واحد فقط

**الإعداد**:

1. في ملف `server/.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

2. شغّل الأوامر:
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   npm run dev
   ```

**العيوب**:
- ❌ البيانات تُحذف عند إعادة نشر التطبيق على Render
- ❌ غير مناسب للإنتاج

---

### استخدام PostgreSQL (Supabase)

**المزايا**:
- ✅ البيانات دائمة ولا تُحذف
- ✅ مناسب للإنتاج
- ✅ مجاني حتى 500MB
- ✅ يعمل مع Docker

**الإعداد**:

1. **أنشئ مشروع Supabase**:
   - اذهب إلى [supabase.com](https://supabase.com)
   - أنشئ مشروع جديد
   - احفظ كلمة مرور قاعدة البيانات

2. **احصل على رابط الاتصال**:
   - Settings → Database → Connection String → URI
   - انسخ الرابط

3. **حدّث ملف البيئة** `server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

4. **شغّل سكريبت الترحيل**:
   
   **Windows**:
   ```powershell
   .\migrate-to-supabase.ps1
   ```
   
   **Linux/Mac**:
   ```bash
   chmod +x migrate-to-supabase.sh
   ./migrate-to-supabase.sh
   ```

**أو يدوياً**:
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

---

## التطوير المحلي مع PostgreSQL | Local PostgreSQL Development

إذا كنت تريد اختبار PostgreSQL محلياً قبل النشر:

### باستخدام Docker Compose:

```bash
# شغّل PostgreSQL محلياً
docker-compose up -d postgres

# حدّث server/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saha_platform"

# شغّل الترحيل
cd server
npx prisma db push
npx prisma db seed
npm run dev
```

### إيقاف PostgreSQL المحلي:

```bash
docker-compose down
```

---

## الفروقات بين SQLite و PostgreSQL | Differences

| الميزة | SQLite | PostgreSQL |
|--------|--------|------------|
| **الإعداد** | سهل جداً | يحتاج إعداد |
| **الأداء** | سريع للتطوير | أفضل للإنتاج |
| **البيانات الدائمة** | ❌ لا (على Render) | ✅ نعم |
| **التكلفة** | مجاني | مجاني (حتى 500MB) |
| **التوسع** | محدود | قابل للتوسع |
| **النسخ الاحتياطي** | يدوي | تلقائي |

---

## أفضل الممارسات | Best Practices

### للتطوير المحلي:
```env
# استخدم SQLite
DATABASE_URL="file:./dev.db"
```

### للإنتاج (Render, Vercel, etc.):
```env
# استخدم Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### للاختبار المحلي للإنتاج:
```env
# استخدم Docker Compose PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saha_platform"
```

---

## استكشاف الأخطاء | Troubleshooting

### خطأ: "Environment variable not found: DATABASE_URL"

**الحل**: تأكد من وجود ملف `.env` في مجلد `server/`

### خطأ: "Can't reach database server"

**الحل**:
1. تحقق من صحة DATABASE_URL
2. تأكد من أن Supabase project نشط
3. تحقق من كلمة المرور

### خطأ: "Prisma schema validation failed"

**الحل**:
```bash
npx prisma generate
npx prisma db push
```

### خطأ: "Migration failed"

**الحل**:
```bash
# احذف الـ migrations واستخدم db push
rm -rf prisma/migrations
npx prisma db push --accept-data-loss
```

---

## الأوامر المفيدة | Useful Commands

### عرض البيانات:
```bash
npx prisma studio
```

### إعادة تعيين قاعدة البيانات:
```bash
npx prisma db push --force-reset
npx prisma db seed
```

### تصدير البيانات (SQLite):
```bash
sqlite3 dev.db .dump > backup.sql
```

### عرض الجداول:
```bash
npx prisma db execute --stdin < schema.sql
```

---

## الموارد | Resources

- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **دليل Supabase الكامل**: [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)
- **دليل Render + Supabase**: [`RENDER_SUPABASE_GUIDE.md`](RENDER_SUPABASE_GUIDE.md)

---

**تم إنشاؤه بواسطة**: Saha Platform Team  
**التاريخ**: 2026-01-15
