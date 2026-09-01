import pg from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://kafu:kafu@localhost:5445/kafu";

async function seed() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const hash = await bcrypt.hash("password123", 10);

  const employees = [
    { name: "سارة الراشد", email: "sarah@example.com", department: "الهندسة", is_admin: true },
    { name: "عمر خالد", email: "omar@example.com", department: "التصميم", is_admin: true },
    { name: "فاطمة حسن", email: "fatima@example.com", department: "المنتجات", is_admin: false },
    { name: "أحمد ناصر", email: "ahmed@example.com", department: "الهندسة", is_admin: false },
    { name: "نورة السالم", email: "noura@example.com", department: "العمليات", is_admin: false },
    { name: "خالد منصور", email: "khalid@example.com", department: "التصميم", is_admin: false },
    { name: "ليلى إبراهيم", email: "layla@example.com", department: "المنتجات", is_admin: false },
    { name: "يوسف التميمي", email: "yousef@example.com", department: "الهندسة", is_admin: false },
    { name: "منى عبدالعزيز", email: "mona@example.com", department: "العمليات", is_admin: false },
    { name: "طارق الحربي", email: "tariq@example.com", department: "الهندسة", is_admin: false },
  ];

  for (const emp of employees) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, department, is_admin)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department, password_hash = EXCLUDED.password_hash, is_admin = EXCLUDED.is_admin`,
      [emp.name, emp.email, hash, emp.department, emp.is_admin]
    );
  }

  console.log("Seeded employees:");
  for (const emp of employees) {
    console.log(`  ${emp.name} — ${emp.email} — ${emp.department}`);
  }
  console.log("\nPassword for all accounts: password123");

  // Demo kafus, so a fresh install has a populated inbox and leaderboard.
  // Skipped if any recognitions already exist, so re-seeding stays idempotent.
  const { rows: existing } = await pool.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM recognitions"
  );

  if (Number(existing[0].count) > 0) {
    console.log("\nRecognitions already present — skipping demo kafus.");
    await pool.end();
    return;
  }

  const { rows: users } = await pool.query<{ id: string; email: string }>(
    "SELECT id, email FROM users"
  );
  const idFor = (email: string) => users.find((u) => u.email === email)!.id;

  const kafus = [
    { from: "sarah@example.com", to: "fatima@example.com", credits: 3, badge: "شقردي", message: "شرحت الـ API للفريق كامل بنص ساعة، وفّرتي علينا يومين." },
    { from: "omar@example.com", to: "fatima@example.com", credits: 2, badge: "فنّان", message: "التصميم الجديد لصفحة الوارد طلع نظيف ومرتب، كفو." },
    { from: "ahmed@example.com", to: "fatima@example.com", credits: 2, badge: "متعاون", message: "دايم جاهزة تساعد حتى لو مشغولة." },
    { from: "noura@example.com", to: "khalid@example.com", credits: 4, badge: "هب ريح", message: "سلّم الهوية البصرية قبل الموعد بثلاثة أيام." },
    { from: "layla@example.com", to: "khalid@example.com", credits: 2, badge: "فنّان", message: "الأيقونات الجديدة رفعت مستوى الواجهة." },
    { from: "yousef@example.com", to: "sarah@example.com", credits: 3, badge: "فزعة", message: "فزعت لنا في نشر الإصدار يوم الخميس متأخر." },
    { from: "mona@example.com", to: "sarah@example.com", credits: 2, badge: "شقردي", message: "حلّت مشكلة قاعدة البيانات اللي عطّلتنا أسبوع." },
    { from: "tariq@example.com", to: "noura@example.com", credits: 3, badge: "متعاون", message: "نسّقت بين ثلاث فرق بدون ما يضيع شي." },
    { from: "khalid@example.com", to: "omar@example.com", credits: 2, badge: "فنّان", message: "مراجعة التصاميم كانت دقيقة ومفيدة." },
    { from: "fatima@example.com", to: "yousef@example.com", credits: 2, badge: "شقردي", message: "كتب اختبارات غطّت حالات ما انتبهنا لها." },
    { from: "sarah@example.com", to: "ahmed@example.com", credits: 1, badge: "متعاون", message: "شكراً على مراجعة الـ PR بسرعة." },
    { from: "omar@example.com", to: "layla@example.com", credits: 2, badge: "فزعة", message: "قامت بالعرض التقديمي بدل عني وأنا مسافر." },
    { from: "noura@example.com", to: "mona@example.com", credits: 1, badge: "هب ريح", message: "جهّزت التقرير الشهري في نفس اليوم." },
    { from: "ahmed@example.com", to: "tariq@example.com", credits: 2, badge: "متعاون", message: "ساعدني أفهم الجزء القديم من النظام." },
  ];

  for (const [i, k] of kafus.entries()) {
    await pool.query(
      `INSERT INTO recognitions (sender_id, receiver_id, credits, badge, message, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW() - ($6 || ' hours')::interval)`,
      [idFor(k.from), idFor(k.to), k.credits, k.badge, k.message, i * 7]
    );
  }

  console.log(`\nSeeded ${kafus.length} demo kafus.`);

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
