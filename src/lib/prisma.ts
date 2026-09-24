import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const basePrisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          let attempts = 0;
          const maxAttempts = 3;

          while (attempts < maxAttempts) {
            try {
              attempts++;
              return await query(args);
            } catch (error: unknown) {
              const err = error as { message?: string; code?: string };
              const msg = err?.message || "";
              const isTransientConnError =
                msg.includes("Can't reach database server") ||
                msg.includes("Connection lost") ||
                msg.includes("ETIMEDOUT") ||
                msg.includes("ECONNRESET") ||
                msg.includes("Server has gone away") ||
                err?.code === "P1001" ||
                err?.code === "P1002" ||
                err?.code === "P1017";

              if (isTransientConnError && attempts < maxAttempts) {
                const delayMs = attempts * 1000;
                console.warn(
                  `[Prisma Serverless] Retrying ${String(model)}.${String(operation)} (attempt ${attempts}/${maxAttempts}) after ${delayMs}ms due to transient DB wake-up...`
                );
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                continue;
              }

              throw error;
            }
          }
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// In serverless environments, preserve PrismaClient on globalThis to reuse
// warm TCP/TLS connection pools across requests rather than re-instantiating on every invocation.
globalForPrisma.prisma = prisma;
