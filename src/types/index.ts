export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface StatusLogEntry {
  id: string;
  complaintId: string;
  status: string;
  comment: string | null;
  changedBy: string | null;
  createdAt: string;
}

export interface Complaint {
  id: string;
  ticketId: string;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  studentPhone: string | null;
  category: string;
  subject: string;
  description: string;
  attachmentUrl: string | null;
  status: string;
  assignedTo: string | null;
  authorityReply: string | null;
  repliedAt: string | null;
  ackDueDate: string;
  slaDueDate: string;
  source?: string;
  isAnonymous?: boolean;
  trackingSecret?: string | null;
  createdAt: string;
  updatedAt: string;
  statusLogs?: StatusLogEntry[];
}

export interface PaginatedComplaints {
  complaints: Complaint[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalThisMonth: number;
  activePending: number;
  slaBreached: number;
  avgResolutionDays: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
