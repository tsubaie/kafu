# كفوو — نظام تقدير الموظفين

منصة داخلية لتقدير الموظفين مبنية لأداء (ADAA).

## المميزات

- **أرسل كفو** — قدّر زملاءك بشارات (⚡ شقردي، 🔥 هب ريح، 🤝 فزعة، 💪 متعاون، 🎨 فنّان)
- **صندوق الوارد** — شوف كل الكفووات اللي وصلتك ببطاقات ملونة
- **المتصدرون** — منصة ثلاثية الأبعاد لأكثر الموظفين تقديراً
- **٥ كفووات شهرياً** — رصيد يتجدد كل شهر
- **واجهة عربية RTL** — تصميم كامل بالعربي مع خط Baloo Bhaijaan 2

## التشغيل السريع

```bash
docker compose up --build -d
```

تعبئة قاعدة البيانات بمستخدمين تجريبيين:

```bash
docker compose exec app npx tsx scripts/seed.ts
```

التطبيق متاح على [http://localhost:3011](http://localhost:3011).

## المستخدمون التجريبيون

كلمة المرور لجميع الحسابات: `password123`

| الاسم | البريد الإلكتروني | الإدارة |
|-------|-------------------|---------|
| سارة الراشد | sarah@adaa.gov.sa | الهندسة |
| عمر خالد | omar@adaa.gov.sa | التصميم |
| فاطمة حسن | fatima@adaa.gov.sa | المنتجات |
| أحمد ناصر | ahmed@adaa.gov.sa | الهندسة |
| نورة السالم | noura@adaa.gov.sa | العمليات |
| خالد منصور | khalid@adaa.gov.sa | التصميم |
| ليلى إبراهيم | layla@adaa.gov.sa | المنتجات |
| يوسف التميمي | yousef@adaa.gov.sa | الهندسة |
| منى عبدالعزيز | mona@adaa.gov.sa | العمليات |
| طارق الحربي | tariq@adaa.gov.sa | الهندسة |

## التقنيات

| التقنية | الإصدار |
|---------|---------|
| Next.js | 16.2.2 |
| React | 19.2.4 |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| PostgreSQL | 17 (Alpine) |
| NextAuth | 5.0 (beta) |
| Zod | 4.x |

## بنية المشروع

```
app/
  (dashboard)/        # الصفحات الرئيسية (inbox, send, leaderboard, profile)
  api/                # واجهات API (recognitions, users, leaderboard, credits)
  login/              # صفحة تسجيل الدخول
  register/           # صفحة التسجيل
components/
  ui/                 # مكونات واجهة المستخدم (avatar, empty-state, leaderboard-row, recognition-card)
  layout/             # الهيدر العلوي
  sidebar.tsx         # القائمة الجانبية
lib/
  auth.ts             # إعدادات NextAuth
  db.ts               # اتصال PostgreSQL
  validations.ts      # مخططات Zod للتحقق
  rate-limit.ts       # حد محاولات تسجيل الدخول
  utils.ts            # دوال مساعدة
tests/                # اختبارات Vitest
public/icons/         # أيقونات SVG مخصصة
scripts/
  init.sql            # إنشاء جداول قاعدة البيانات
  seed.ts             # تعبئة بيانات تجريبية
```

## نظام الشارات

| الشارة | الرمز | اللون |
|--------|-------|-------|
| شقردي | ⚡ | برتقالي/ذهبي |
| هب ريح | 🔥 | أحمر |
| فزعة | 🤝 | أزرق سماوي |
| متعاون | 💪 | أخضر |
| فنّان | 🎨 | بنفسجي |

## الترتيب في المتصدرون

1. عدد الكفووات المستلمة (الأكثر أولاً)
2. عدد التقديرات الفردية (عند التساوي)
3. أول من استلم كفو (عند التساوي الكامل)

## الاختبارات

```bash
npm test              # تشغيل جميع الاختبارات
npm run test:watch    # وضع المراقبة
```

الاختبارات تغطي:
- **التحقق (Validations)** — مخططات إرسال الكفو، التسجيل، المتصدرون
- **حد المحاولات (Rate Limiting)** — حماية تسجيل الدخول (٥ محاولات / ١٥ دقيقة)
- **الدوال المساعدة** — دمج أصناف Tailwind
- **المكونات** — Avatar، EmptyState

## التطوير المحلي

```bash
npm run dev           # تشغيل بوضع التطوير (المنفذ 3002)
npm run build         # بناء للإنتاج
npm run seed          # تعبئة قاعدة البيانات
npm run lint          # فحص الكود
```

## Docker

التطبيق يعمل بالكامل في Docker:
- **app** — تطبيق Next.js (المنفذ 3011)
- **db** — PostgreSQL 17 Alpine (المنفذ 5445)

```bash
docker compose up --build -d     # تشغيل
docker compose down              # إيقاف
docker compose logs app          # سجلات التطبيق
```
