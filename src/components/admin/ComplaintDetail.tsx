"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Badge, SLABadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CATEGORIES, STATUSES } from "@/lib/validations";
import { formatDate, formatDateTime } from "@/lib/sla";
import type { Complaint } from "@/types";
import {
  ArrowLeft,
  Paperclip,
  MessageSquare,
  Clock,
  CheckCircle2,
  Hash,
  User,
  Mail,
  Phone,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/Toast";
import { ReplyForm } from "./ReplyForm";

interface ComplaintDetailProps {
  complaint: Complaint;
  userName: string;
}

export function ComplaintDetail({ complaint, userName }: ComplaintDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState(complaint.status);
  const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || "");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const categoryLabel =
    CATEGORIES.find((c) => c.value === complaint.category)?.label || complaint.category;

  async function handleStatusUpdate() {
    if (status === complaint.status && assignedTo === (complaint.assignedTo || "")) {
      toast("warning", "No changes made.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assignedTo, comment }),
      });
      const data = await res.json();
      if (data.success) {
        toast("success", "Complaint updated successfully.");
        router.refresh();
      } else {
        toast("error", data.error || "Update failed.");
      }
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <Link
        href="/admin/complaints"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Complaints
      </Link>

      {/* Header */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Hash className="h-4 w-4 text-brand-600" />
              <span className="font-mono text-xl font-bold text-brand-700">
                {complaint.ticketId}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{complaint.subject}</h2>
            <p className="text-sm text-gray-500 mt-1">{categoryLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {complaint.isAnonymous && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                🔒 Anonymous Complaint
              </span>
            )}
            <Badge status={complaint.status} />
            <SLABadge slaDueDate={complaint.slaDueDate} status={complaint.status} />
          </div>
        </div>

        {/* Anonymous banner */}
        {complaint.isAnonymous && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700 flex-shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                Anonymous Whistleblower Protection
              </h4>
              <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                This grievance was submitted anonymously. Personal contact details and roll numbers are strictly withheld to protect the student from retaliation. The student tracks progress and authority responses via a secure Secret Tracking Key.
              </p>
            </div>
          </div>
        )}

        {/* Student info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100 text-sm">
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-500 text-xs">Student</p>
              <p className="font-medium text-gray-900">
                {complaint.isAnonymous ? "Anonymous Student" : complaint.studentName}
              </p>
              <p className="text-gray-500 text-xs">
                {complaint.isAnonymous ? "Identity Protected" : complaint.studentRoll}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-500 text-xs">Email</p>
              <p className="font-medium text-gray-900 break-all">
                {complaint.isAnonymous ? "[Concealed for Privacy]" : complaint.studentEmail}
              </p>
            </div>
          </div>
          {!complaint.isAnonymous && complaint.studentPhone && (
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs">Phone</p>
                <p className="font-medium text-gray-900">{complaint.studentPhone}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-500 text-xs">Filed On</p>
              <p className="font-medium text-gray-900">{formatDate(complaint.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-500 text-xs">ACK Due</p>
              <p className="font-medium text-gray-900">{formatDateTime(complaint.ackDueDate)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-500 text-xs">SLA Due</p>
              <p className="font-medium text-gray-900">{formatDate(complaint.slaDueDate)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Description + Attachment */}
      <Card>
        <h3 className="font-semibold text-gray-800 mb-3">Complaint Description</h3>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {complaint.description}
        </p>

        {complaint.attachmentUrl && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <a
              href={complaint.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 font-medium"
            >
              <Paperclip className="h-4 w-4" />
              View Attachment
            </a>
          </div>
        )}
      </Card>

      {/* Status Update Panel */}
      <Card>
        <h3 className="font-semibold text-gray-800 mb-4">Update Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Status"
            options={STATUSES}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            helperText={
              status === "RESOLVED" || status === "CLOSED"
                ? "Official reply is required below before saving."
                : undefined
            }
          />
          <Input
            label="Assign To"
            placeholder="Officer / Department name"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Status Update Comment (optional)"
            placeholder="Internal note about this status change..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            maxLength={500}
            showCount
          />
        </div>
        <div className="mt-4">
          <Button onClick={handleStatusUpdate} loading={saving} className="w-full sm:w-auto">
            Update Status
          </Button>
        </div>
      </Card>

      {/* Reply Form (mandatory for RESOLVED/CLOSED) */}
      <ReplyForm
        complaintId={complaint.id}
        existingReply={complaint.authorityReply}
        repliedAt={complaint.repliedAt}
        currentStatus={complaint.status}
        assignedTo={complaint.assignedTo}
        userName={userName}
      />

      {/* Status Timeline */}
      {complaint.statusLogs && complaint.statusLogs.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand-600" />
            Activity Timeline
          </h3>
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
            {[...complaint.statusLogs].reverse().map((log) => (
              <div key={log.id} className="relative">
                <div className="absolute -left-4 top-1.5 h-4 w-4 rounded-full bg-brand-600 border-2 border-white" />
                <div className="flex items-center gap-2 mb-1">
                  <Badge status={log.status} />
                  <span className="text-xs text-gray-400">{formatDateTime(log.createdAt)}</span>
                </div>
                {log.comment && (
                  <p className="text-sm text-gray-600">{log.comment}</p>
                )}
                {log.changedBy && (
                  <p className="text-xs text-gray-400">by {log.changedBy}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
