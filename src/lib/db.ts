import { PrismaClient } from "@prisma/client";
import { secureDb } from "./db-security";

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

// Optimized Prisma client with connection pooling and security enhancements
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    errorFormat: process.env.NODE_ENV === "production" ? "minimal" : "pretty",
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Export secure database wrapper for enhanced security
export { secureDb };

// No longer needed - Prisma maintains persistent connections automatically
// Keeping for backward compatibility but it's a no-op
export async function connectDB() {
  // Prisma connects automatically on first query
  return db;
}

export async function disconnectDB() {
  await db.$disconnect();
}
