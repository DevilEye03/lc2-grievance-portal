import { prisma } from "./prisma";

/**
 * Generates the next sequential ticket ID in the format GRV-YYYY-XXXX.
 * Uses a count-based approach that is safe for low-to-medium concurrency.
 */
export async function generateTicketId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `GRV-${year}-`;

  const count = await prisma.complaint.count({
    where: {
      ticketId: {
        startsWith: prefix,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, "0");
  return `${prefix}${sequence}`;
}
