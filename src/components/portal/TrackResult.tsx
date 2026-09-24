import { Badge, SLABadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CATEGORIES, STATUSES } from "@/lib/validations";
import { formatDate, formatDateTime } from "@/lib/sla";
import type { Complaint } from "@/types";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Paperclip,
  User,
  Calendar,
  Hash,
} from "lucide-react";

const STATUS_ORDER = ["REGISTERED", "ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

interface StepperProps {
  currentStatus: string;
}

function StatusStepper({ currentStatus }: StepperProps) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div>
      {/* Mobile Stepper (compact cards / segment bar) */}
      <div className="sm:hidden space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 font-medium">Stage {Math.max(1, currentIdx + 1)} of 5</span>
          <span className="font-semibold text-brand-700">
            {STATUSES.find((s) => s.value === currentStatus)?.label || currentStatus}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 h-2">
          {STATUS_ORDER.map((s, i) => (
            <div
              key={s}
              className={`rounded-full transition-all ${
                i <= currentIdx ? "bg-brand-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <div className="flex overflow-x-auto gap-2 pb-1 text-[11px] scrollbar-none">
          {STATUS_ORDER.map((status, i) => {
            const isDone = i < currentIdx;
            const isCurrent = i === currentIdx;
            const label = STATUSES.find((s) => s.value === status)?.label || status;
            return (
              <span
                key={status}
                className={`px-2 py-1 rounded-md whitespace-nowrap font-medium flex-shrink-0 ${
                  isCurrent
                    ? "bg-brand-100 text-brand-800 border border-brand-300"
                    : isDone
                    ? "text-gray-600 bg-gray-100"
                    : "text-gray-400 bg-gray-50"
                }`}
              >
                {isDone ? "✓ " : `${i + 1}. `}{label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden sm:block relative">
        <div className="flex items-start justify-between">
          {STATUS_ORDER.map((status, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            const label = STATUSES.find((s) => s.value === status)?.label || status;

            return (
              <div key={status} className="flex flex-col items-center flex-1 relative">
                {/* Connector line */}
                {i < STATUS_ORDER.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${
                      done ? "bg-brand-500" : "bg-gray-200"
                    }`}
                  />
                )}
                {/* Circle */}
                <div
                  className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                    done
                      ? "bg-brand-600 border-brand-600 text-white"
                      : active
                      ? "border-brand-600 text-brand-600 bg-brand-50 ring-4 ring-brand-100"
                      : "border-gray-300 text-gray-400 bg-white"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {/* Label */}
                <span
                  className={`text-xs mt-2 text-center leading-tight max-w-[70px] ${
                    active ? "text-brand-700 font-semibold" : done ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface TrackResultProps {
  complaint: Complaint;
}

export function TrackResult({ complaint }: TrackResultProps) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === complaint.category)?.label || complaint.category;

  const hasResolution =
    complaint.status === "RESOLVED" ||
    complaint.status === "CLOSED" ||
    (complaint.authorityReply && complaint.authorityReply.length > 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Hash className="h-4 w-4 text-brand-600 flex-shrink-0" />
              <span className="font-mono text-base sm:text-lg font-bold text-brand-700">
                {complaint.ticketId}
              </span>
            </div>
            <p className="text-gray-900 font-semibold text-sm sm:text-base leading-snug">{complaint.subject}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge status={complaint.status} />
            <SLABadge slaDueDate={complaint.slaDueDate} status={complaint.status} />
          </div>
        </div>

        {/* Progress stepper */}
        <div className="pt-2 sm:pt-4 border-t border-gray-100">
          <StatusStepper currentStatus={complaint.status} />
        </div>
      </Card>

      {/* Details grid */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Complaint Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Student</p>
              <p className="font-semibold text-gray-900">
                {complaint.studentName} ({complaint.studentRoll})
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-semibold text-gray-900">{categoryLabel}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Date Filed</p>
              <p className="font-semibold text-gray-900">{formatDate(complaint.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Acknowledgment Due</p>
              <p className="font-semibold text-gray-900">{formatDateTime(complaint.ackDueDate)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500">Target Resolution</p>
              <p className="font-semibold text-gray-900">{formatDate(complaint.slaDueDate)}</p>
            </div>
          </div>
          {complaint.attachmentUrl && (
            <div className="flex items-start gap-2.5">
              <Paperclip className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-gray-500">Attachment</p>
                <a
                  href={complaint.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
                >
                  View File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1 font-medium">Description</p>
          <p className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {complaint.description}
          </p>
        </div>
      </Card>

      {/* Official Resolution Box */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Official Resolution
        </h3>
        {hasResolution && complaint.authorityReply ? (
          <div className="border-2 border-emerald-300 bg-emerald-50 rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-emerald-900">
                  Official Response from College Authority
                </span>
              </div>
              {complaint.repliedAt && (
                <span className="text-[11px] sm:text-xs text-emerald-700">
                  {formatDateTime(complaint.repliedAt)}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-emerald-950 whitespace-pre-wrap leading-relaxed">
              {complaint.authorityReply}
            </p>
            {complaint.assignedTo && (
              <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center gap-2">
                <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
                  {complaint.assignedTo.charAt(0)}
                </div>
                <span className="text-xs text-emerald-800 font-semibold">{complaint.assignedTo}</span>
                <span className="text-[11px] text-emerald-600">— Assigned Authority</span>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 sm:p-5 flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              Your grievance is currently under active review by the assigned college authority.
              You will be notified by email as soon as an official resolution is issued.
            </p>
          </div>
        )}
      </Card>

      {/* Status timeline */}
      {complaint.statusLogs && complaint.statusLogs.length > 0 && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Activity Timeline
          </h3>
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
            {[...complaint.statusLogs].reverse().map((log) => (
              <div key={log.id} className="relative mb-4 last:mb-0">
                <div className="absolute -left-4 top-1 h-3.5 w-3.5 rounded-full bg-brand-600 border-2 border-white" />
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <Badge status={log.status} />
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                  {log.comment && (
                    <p className="text-xs sm:text-sm text-gray-700 mt-1">{log.comment}</p>
                  )}
                  {log.changedBy && (
                    <p className="text-[11px] text-gray-400 mt-0.5">by {log.changedBy}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
