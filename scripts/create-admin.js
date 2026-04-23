/**
 * Create the first admin user. Run from project root:
 *   node scripts/create-admin.js <email> <password>
 * Password must be at least 12 characters.
 * Loads DATABASE_URL from .env or .env.local
 */
const path = require("path");

// Load .env from project root (dotenv handles .env and .env.local via path)
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env.local") });

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: node scripts/create-admin.js <email> <password>");
  process.exit(1);
}
if (password.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.error("Admin with this email already exists.");
    process.exit(1);
  }
  const hashed = await bcrypt.hash(password, 12);
  await prisma.admin.create({ data: { email, passwordHash: hashed } });
  console.log("Admin created successfully for:", email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error(err);
    try {
      await prisma.$disconnect();
    } finally {
      process.exit(1);
    }
  });
