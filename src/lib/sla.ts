export interface SLADates {
  ackDueDate: Date;
  slaDueDate: Date;
}

/**
 * Computes SLA deadlines from a complaint creation timestamp.
 * ackDueDate  = createdAt + 48 hours
 * slaDueDate  = createdAt + 7 calendar days
 */
export function computeSLADates(createdAt: Date): SLADates {
  const ackDueDate = new Date(createdAt.getTime() + 48 * 60 * 60 * 1000);
  const slaDueDate = new Date(createdAt);
  slaDueDate.setDate(slaDueDate.getDate() + 7);

  return { ackDueDate, slaDueDate };
}

export type SLAStatus = "ok" | "warning" | "breached";

/**
 * Returns the SLA status relative to now.
 * - "breached": past slaDueDate
 * - "warning": within 24 hours of slaDueDate
 * - "ok": more than 24 hours remaining
 */
export function getSLAStatus(
  slaDueDate: Date | string,
  status: string
): SLAStatus {
  if (status === "RESOLVED" || status === "CLOSED") return "ok";

  const now = Date.now();
  const due = new Date(slaDueDate).getTime();
  const hoursLeft = (due - now) / (1000 * 60 * 60);

  if (hoursLeft < 0) return "breached";
  if (hoursLeft < 24) return "warning";
  return "ok";
}

/**
 * Checks if the acknowledgment SLA (48 hours) has been breached.
 */
export function isAckBreached(ackDueDate: Date, status: string): boolean {
  if (status !== "REGISTERED") return false;
  return Date.now() > new Date(ackDueDate).getTime();
}

/**
 * Formats a date as a human-readable string.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats a date with time.
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Computes average resolution time in days for resolved/closed complaints.
 */
export function avgResolutionDays(
  complaints: Array<{ createdAt: Date | string; updatedAt: Date | string; status: string }>
): number {
  const resolved = complaints.filter(
    (c) => c.status === "RESOLVED" || c.status === "CLOSED"
  );
  if (resolved.length === 0) return 0;

  const totalMs = resolved.reduce((sum, c) => {
    return sum + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime());
  }, 0);

  const avgMs = totalMs / resolved.length;
  return Math.round(avgMs / (1000 * 60 * 60 * 24));
}
