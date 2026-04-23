import { PrismaClient } from "@prisma/client";

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

// Optimized Prisma client with aggressive connection pooling for high concurrency
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    errorFormat: process.env.NODE_ENV === "production" ? "minimal" : "pretty",
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + 
          // Connection pool settings for 300+ concurrent users
          "?connection_limit=20" +           // Max 20 connections (shared hosting limit)
          "&pool_timeout=30" +                // 30s timeout for getting connection
          "&connect_timeout=10" +             // 10s timeout for initial connection
          "&socket_timeout=10" +              // 10s timeout for socket operations
          "&sslaccept=accept_invalid_certs"   // Accept SSL certs (shared hosting)
      }
    }
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Lazy re-export of secureDb to avoid triggering SecureDatabase instantiation
// (and its PrismaClient + query logging) on every import of db.ts
export function getSecureDb() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./db-security").secureDb;
}

// No longer needed - Prisma maintains persistent connections automatically
// Keeping for backward compatibility but it's a no-op
export async function connectDB() {
  // Prisma connects automatically on first query
  return db;
}

export async function disconnectDB() {
  await db.$disconnect();
}
