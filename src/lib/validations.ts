import { z } from "zod";

export const CATEGORIES = [
  { value: "ACADEMIC", label: "Academic" },
  { value: "HOSTEL_MESS", label: "Hostel / Mess" },
  { value: "EXAMINATION", label: "Examination" },
  { value: "INFRASTRUCTURE_MAINTENANCE", label: "Infrastructure & Maintenance" },
  { value: "FEES_SCHOLARSHIP", label: "Fees & Scholarship" },
  { value: "ANTI_RAGGING", label: "Anti-Ragging" },
  { value: "DISCIPLINARY", label: "Disciplinary" },
  { value: "OTHER", label: "Other" },
] as const;

export const STATUSES = [
  { value: "REGISTERED", label: "Registered" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
] as const;

export const ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "PRESIDENT", label: "President" },
  { value: "DEPARTMENT_HEAD", label: "Department Head" },
  { value: "OFFICER", label: "Officer" },
] as const;

// ─── Complaint Submission ──────────────────────────────────────────────────────
export const complaintSubmitSchema = z.object({
  studentName: z.string().min(2, "Name must be at least 2 characters").max(100),
  studentRoll: z.string().min(2, "Roll number is required").max(50),
  studentEmail: z.string().email("Please enter a valid email address"),
  studentPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),
  category: z.enum([
    "ACADEMIC",
    "HOSTEL_MESS",
    "EXAMINATION",
    "INFRASTRUCTURE_MAINTENANCE",
    "FEES_SCHOLARSHIP",
    "ANTI_RAGGING",
    "DISCIPLINARY",
    "OTHER",
  ]),
  subject: z.string().min(5, "Subject is too short").max(120, "Subject must be under 120 characters"),
  description: z
    .string()
    .min(30, "Description must be at least 30 characters")
    .max(5000, "Description too long"),
});

export type ComplaintSubmitInput = z.infer<typeof complaintSubmitSchema>;

// ─── Admin Login ───────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Admin: Update Complaint ───────────────────────────────────────────────────
export const updateComplaintSchema = z
  .object({
    status: z
      .enum(["REGISTERED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"])
      .optional(),
    assignedTo: z.string().max(100).optional().or(z.literal("")),
    comment: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // Must provide something to update
      return data.status !== undefined || data.assignedTo !== undefined;
    },
    { message: "Provide at least one field to update" }
  );

export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;

// ─── Admin: Authority Reply ────────────────────────────────────────────────────
export const replySchema = z.object({
  authorityReply: z
    .string()
    .min(20, "Official reply must contain at least 20 characters")
    .max(5000),
  status: z.enum(["RESOLVED", "CLOSED"]),
});

export type ReplyInput = z.infer<typeof replySchema>;

// ─── Admin: Create/Update User ─────────────────────────────────────────────────
export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["SUPER_ADMIN", "PRESIDENT", "DEPARTMENT_HEAD", "OFFICER"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "PRESIDENT", "DEPARTMENT_HEAD", "OFFICER"]).optional(),
});

// ─── Track Form ────────────────────────────────────────────────────────────────
export const trackSchema = z.object({
  ticketId: z
    .string()
    .regex(/^GRV-\d{4}-\d{4}$/, "Invalid Ticket ID format. Example: GRV-2026-0001"),
  studentEmail: z.string().email("Please enter a valid email address"),
});

export type TrackInput = z.infer<typeof trackSchema>;
