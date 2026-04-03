import pg from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://kafu:kafu@localhost:5445/kafu";

async function seed() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const hash = await bcrypt.hash("password123", 10);

  const employees = [
    { name: "سارة الراشد", email: "sarah@adaa.gov.sa", department: "الهندسة" },
    { name: "عمر خالد", email: "omar@adaa.gov.sa", department: "التصميم" },
    { name: "فاطمة حسن", email: "fatima@adaa.gov.sa", department: "المنتجات" },
    { name: "أحمد ناصر", email: "ahmed@adaa.gov.sa", department: "الهندسة" },
    { name: "نورة السالم", email: "noura@adaa.gov.sa", department: "العمليات" },
    { name: "خالد منصور", email: "khalid@adaa.gov.sa", department: "التصميم" },
    { name: "ليلى إبراهيم", email: "layla@adaa.gov.sa", department: "المنتجات" },
    { name: "يوسف التميمي", email: "yousef@adaa.gov.sa", department: "الهندسة" },
    { name: "منى عبدالعزيز", email: "mona@adaa.gov.sa", department: "العمليات" },
    { name: "طارق الحربي", email: "tariq@adaa.gov.sa", department: "الهندسة" },
  ];

  for (const emp of employees) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, department)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department, password_hash = EXCLUDED.password_hash`,
      [emp.name, emp.email, hash, emp.department]
    );
  }

  console.log("Seeded employees:");
  for (const emp of employees) {
    console.log(`  ${emp.name} — ${emp.email} — ${emp.department}`);
  }
  console.log("\nPassword for all accounts: password123");

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
