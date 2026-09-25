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

/**
 * Generates a high-entropy, human-friendly Secret Tracking Key for anonymous complaints.
 * Format: SEC-XXXX-XXXX (e.g., SEC-8F3A-9B2C)
 */
export function generateTrackingSecret(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude easily confused chars (0, O, 1, I)
  let part1 = "";
  let part2 = "";
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SEC-${part1}-${part2}`;
}

