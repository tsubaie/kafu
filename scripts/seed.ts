import pg from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://kafu:kafu@localhost:5445/kafu";

async function seed() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  const hash = await bcrypt.hash("password123", 10);

  const employees = [
    { name: "Sarah Al-Rashid", email: "sarah@adaa.gov.sa", department: "Engineering" },
    { name: "Omar Khalid", email: "omar@adaa.gov.sa", department: "Design" },
    { name: "Fatima Hassan", email: "fatima@adaa.gov.sa", department: "Product" },
    { name: "Ahmed Nasser", email: "ahmed@adaa.gov.sa", department: "Engineering" },
    { name: "Noura Al-Salem", email: "noura@adaa.gov.sa", department: "Operations" },
    { name: "Khalid Mansour", email: "khalid@adaa.gov.sa", department: "Design" },
    { name: "Layla Ibrahim", email: "layla@adaa.gov.sa", department: "Product" },
    { name: "Yousef Al-Tamimi", email: "yousef@adaa.gov.sa", department: "Engineering" },
    { name: "Mona Abdulaziz", email: "mona@adaa.gov.sa", department: "Operations" },
    { name: "Tariq Al-Harbi", email: "tariq@adaa.gov.sa", department: "Engineering" },
  ];

  for (const emp of employees) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, department)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
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
