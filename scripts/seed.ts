import pg from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://kafu:kafu@localhost:5445/kafu";

async function seed() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const hash = await bcrypt.hash("password123", 10);

  const employees = [
    { name: "سارة الراشد", email: "sarah@adaa.gov.sa", department: "الهندسة", is_admin: true },
    { name: "عمر خالد", email: "omar@adaa.gov.sa", department: "التصميم", is_admin: true },
    { name: "فاطمة حسن", email: "fatima@adaa.gov.sa", department: "المنتجات", is_admin: false },
    { name: "أحمد ناصر", email: "ahmed@adaa.gov.sa", department: "الهندسة", is_admin: false },
    { name: "نورة السالم", email: "noura@adaa.gov.sa", department: "العمليات", is_admin: false },
    { name: "خالد منصور", email: "khalid@adaa.gov.sa", department: "التصميم", is_admin: false },
    { name: "ليلى إبراهيم", email: "layla@adaa.gov.sa", department: "المنتجات", is_admin: false },
    { name: "يوسف التميمي", email: "yousef@adaa.gov.sa", department: "الهندسة", is_admin: false },
    { name: "منى عبدالعزيز", email: "mona@adaa.gov.sa", department: "العمليات", is_admin: false },
    { name: "طارق الحربي", email: "tariq@adaa.gov.sa", department: "الهندسة", is_admin: false },
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

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
