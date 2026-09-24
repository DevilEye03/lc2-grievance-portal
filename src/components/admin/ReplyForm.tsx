"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "@/components/ui/Toast";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { formatDateTime } from "@/lib/sla";

interface ReplyFormProps {
  complaintId: string;
  existingReply: string | null | undefined;
  repliedAt: string | null | undefined;
  currentStatus: string;
  assignedTo: string | null | undefined;
  userName: string;
}

const FINAL_STATUSES = [
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export function ReplyForm({
  complaintId,
  existingReply,
  repliedAt,
  currentStatus,
  assignedTo,
  userName,
}: ReplyFormProps) {
  const router = useRouter();
  const [reply, setReply] = useState(existingReply || "");
  const [finalStatus, setFinalStatus] = useState("RESOLVED");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const hasExistingReply = !!existingReply;

  async function handleSubmit() {
    setError("");
    if (reply.trim().length < 20) {
      setError("Official reply must contain at least 20 characters of explanation.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/complaints/${complaintId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorityReply: reply.trim(), status: finalStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast("success", `Reply posted. Status set to ${finalStatus}.`);
        router.refresh();
      } else {
        toast("error", data.error || "Failed to post reply.");
      }
    } catch {
      toast("error", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (hasExistingReply) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-800">Official Authority Reply</h3>
          {repliedAt && (
            <span className="ml-auto text-xs text-gray-400">{formatDateTime(repliedAt)}</span>
          )}
        </div>

        <div className="border-2 border-emerald-200 bg-emerald-50 rounded-xl p-4">
          <p className="text-sm text-emerald-900 whitespace-pre-wrap leading-relaxed">{existingReply}</p>
          {assignedTo && (
            <div className="mt-3 pt-3 border-t border-emerald-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">{assignedTo}</span>
            </div>
          )}
        </div>

        {/* Allow editing if not fully closed */}
        {currentStatus !== "CLOSED" && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">Update the official reply:</p>
            <Textarea
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                setError("");
              }}
              rows={4}
              maxLength={5000}
              showCount
              error={error}
            />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3">
              <Select
                options={FINAL_STATUSES}
                value={finalStatus}
                onChange={(e) => setFinalStatus(e.target.value)}
                className="w-full sm:w-36"
              />
              <Button onClick={handleSubmit} loading={saving} className="w-full sm:w-auto">
                Update Reply
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">Official Authority Reply</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-amber-700 font-medium">
              Mandatory before setting status to RESOLVED or CLOSED
            </p>
          </div>
        </div>
      </div>

      <Textarea
        label="Official Resolution / Reply"
        placeholder="Write the official response from the college authority here. Minimum 20 characters required. Be clear and concise about the action taken and the outcome."
        value={reply}
        onChange={(e) => {
          setReply(e.target.value);
          setError("");
        }}
        rows={6}
        maxLength={5000}
        showCount
        error={error}
        required
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mt-4">
        <Select
          label="Mark As"
          options={FINAL_STATUSES}
          value={finalStatus}
          onChange={(e) => setFinalStatus(e.target.value)}
          className="w-full sm:w-40"
        />
        <Button onClick={handleSubmit} loading={saving} disabled={reply.trim().length < 20} className="w-full sm:w-auto">
          <ShieldCheck className="h-4 w-4" />
          Post Official Reply
        </Button>
      </div>

      {reply.trim().length > 0 && reply.trim().length < 20 && (
        <p className="mt-2 text-xs text-rose-600">
          {20 - reply.trim().length} more characters needed.
        </p>
      )}
    </Card>
  );
}
