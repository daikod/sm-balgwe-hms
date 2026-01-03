// lib/db.ts
import { PrismaClient } from "@prisma/client";

// ✅ Singleton pattern for Prisma in dev and prod
const prismaClientSingleton = () => new PrismaClient();

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const db = globalThis.prismaGlobal ?? prismaClientSingleton();

// Only persist global Prisma client in development
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = db;

export default db;
