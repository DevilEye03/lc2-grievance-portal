"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CATEGORIES } from "@/lib/validations";
import {
  CheckCircle,
  Copy,
  Search,
  Upload,
  X,
  Lock,
  User,
  ShieldAlert,
  Paperclip,
} from "lucide-react";

interface FormData {
  isAnonymous: boolean;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  studentPhone: string;
  category: string;
  subject: string;
  description: string;
  attachment: File | null;
}

interface Errors {
  [key: string]: string;
}

const initialForm: FormData = {
  isAnonymous: false,
  studentName: "",
  studentRoll: "",
  studentEmail: "",
  studentPhone: "",
  category: "",
  subject: "",
  description: "",
  attachment: null,
};

export function GrievanceForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [successSecret, setSuccessSecret] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  function set(field: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const errs: Errors = {};

    if (!form.isAnonymous) {
      if (!form.studentName.trim() || form.studentName.length < 2) {
        errs.studentName = "Name must be at least 2 characters";
      }
      if (!form.studentRoll.trim()) {
        errs.studentRoll = "Roll number is required";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studentEmail)) {
        errs.studentEmail = "Enter a valid email address";
      }
      if (form.studentPhone && !/^[6-9]\d{9}$/.test(form.studentPhone)) {
        errs.studentPhone = "Enter a valid 10-digit mobile number";
      }
    } else {
      if (form.studentEmail && form.studentEmail.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studentEmail.trim())) {
          errs.studentEmail = "Enter a valid email address or leave blank";
        }
      }
    }

    if (!form.category) {
      errs.category = "Please select a category";
    }
    if (!form.subject.trim() || form.subject.length < 5) {
      errs.subject = "Subject must be at least 5 characters";
    } else if (form.subject.length > 120) {
      errs.subject = "Subject must be under 120 characters";
    }
    if (!form.description.trim() || form.description.length < 30) {
      errs.description = "Description must be at least 30 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, attachment: "Only JPG, PNG, WebP, and PDF allowed" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, attachment: "File must be under 5MB" }));
      return;
    }

    setErrors((prev) => ({ ...prev, attachment: "" }));
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors((prev) => ({ ...prev, attachment: data.error || "File upload failed" }));
      } else {
        setAttachmentUrl(data.url);
        setForm((prev) => ({ ...prev, attachment: file }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, attachment: "File upload failed. Please try again." }));
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        isAnonymous: form.isAnonymous,
        studentName: form.isAnonymous ? "Anonymous Student" : form.studentName.trim(),
        studentRoll: form.isAnonymous ? "ANONYMOUS" : form.studentRoll.trim(),
        studentEmail: form.studentEmail.trim(),
        studentPhone: form.isAnonymous ? null : form.studentPhone.trim() || null,
        category: form.category,
        subject: form.subject.trim(),
        description: form.description.trim(),
        attachmentUrl: attachmentUrl || null,
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrors((prev) => ({
          ...prev,
          submit: data.error || "Submission failed. Please check your details.",
        }));
      } else {
        setSuccessTicket(data.data.ticketId);
        if (data.data.isAnonymous && data.data.trackingSecret) {
          setSuccessSecret(data.data.trackingSecret);
        }
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: "Network error. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (successTicket) {
    return (
      <Card className="max-w-xl mx-auto p-5 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Grievance Registered</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {successSecret
                ? "Your identity is protected. Keep your Secret Tracking Key safe to track progress."
                : "Your complaint is recorded. Save your Ticket ID to track resolution."}
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3 w-full flex items-center justify-between">
            <div className="text-left">
              <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">Ticket ID</p>
              <p className="text-xl sm:text-2xl font-black text-brand-700 font-mono">{successTicket}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-white border-brand-300 text-brand-700"
              onClick={async () => {
                await navigator.clipboard.writeText(successTicket);
                setCopiedTicket(true);
                setTimeout(() => setCopiedTicket(false), 2000);
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedTicket ? "Copied" : "Copy"}
            </Button>
          </div>

          {/* Secret Key Box */}
          {successSecret && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 w-full flex items-center justify-between">
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">Secret Tracking Key</p>
                  <span className="text-[9px] bg-purple-200 text-purple-900 px-1 py-0.2 rounded font-bold">Required</span>
                </div>
                <p className="text-lg sm:text-xl font-black text-purple-900 font-mono tracking-wider">{successSecret}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs bg-white border-purple-300 text-purple-800"
                onClick={async () => {
                  await navigator.clipboard.writeText(successSecret);
                  setCopiedSecret(true);
                  setTimeout(() => setCopiedSecret(false), 2000);
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedSecret ? "Copied" : "Copy"}
              </Button>
            </div>
          )}

          {successSecret && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left flex items-start gap-2.5 text-xs text-amber-900 w-full">
              <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                As this complaint is anonymous, authorities cannot look you up by name. You will need your <strong>Ticket ID</strong> and <strong>Secret Key</strong> to view replies.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
            <Button
              variant="outline"
              className="flex-1 justify-center py-2 text-xs sm:text-sm"
              onClick={async () => {
                const text = successSecret
                  ? `LAW CENTRE II Grievance Credentials:\nTicket ID: ${successTicket}\nSecret Key: ${successSecret}\nTrack URL: https://lc2-grievance-portal.vercel.app/track`
                  : `LAW CENTRE II Grievance Ticket: ${successTicket}`;
                await navigator.clipboard.writeText(text);
                setCopiedAll(true);
                setTimeout(() => setCopiedAll(false), 2000);
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              {copiedAll ? "Credentials Copied!" : "Copy Details"}
            </Button>
            <Button
              className="flex-1 justify-center py-2 text-xs sm:text-sm bg-brand-600 hover:bg-brand-700"
              onClick={() =>
                router.push(
                  `/track?ticketId=${successTicket}&email=${encodeURIComponent(
                    successSecret || form.studentEmail || ""
                  )}`
                )
              }
            >
              <Search className="h-3.5 w-3.5" />
              Track Grievance
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // ─── Minimal Single-Page Form ─────────────────────────────────────────────
  return (
    <Card className="max-w-2xl mx-auto p-4 sm:p-7 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Filing Mode Toggle (Pills) */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Complaint Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => set("isAnonymous", false)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                !form.isAnonymous
                  ? "bg-white text-gray-900 shadow-xs border border-gray-200/60"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Standard (Identified)</span>
            </button>
            <button
              type="button"
              onClick={() => set("isAnonymous", true)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                form.isAnonymous
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Lock className="h-4 w-4" />
              <span>File Anonymously</span>
            </button>
          </div>
        </div>

        {/* Identity Section: Masked or Expanded */}
        {form.isAnonymous ? (
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-purple-900">
              <Lock className="h-4 w-4 text-purple-700 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold">Whistleblower Shield Active.</span> Your name, roll number, and phone are neither asked nor stored. You will receive a Secret Tracking Key upon submission.
              </div>
            </div>

            <div>
              <Input
                label="Private Alert Email (Optional)"
                type="email"
                placeholder="Optional email solely for status update alerts"
                value={form.studentEmail}
                onChange={(e) => set("studentEmail", e.target.value)}
                error={errors.studentEmail}
                helperText="Never shown to committee officers or public views."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Student Full Name"
                placeholder="e.g. Arjun Mehta"
                value={form.studentName}
                onChange={(e) => set("studentName", e.target.value)}
                error={errors.studentName}
                required
              />
              <Input
                label="Roll / Registration Number"
                placeholder="e.g. 23LC2001"
                value={form.studentRoll}
                onChange={(e) => set("studentRoll", e.target.value)}
                error={errors.studentRoll}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Student Email Address"
                type="email"
                placeholder="you@student.edu"
                value={form.studentEmail}
                onChange={(e) => set("studentEmail", e.target.value)}
                error={errors.studentEmail}
                required
              />
              <Input
                label="Contact Phone (Optional)"
                type="tel"
                placeholder="10-digit mobile number"
                value={form.studentPhone}
                onChange={(e) => set("studentPhone", e.target.value)}
                error={errors.studentPhone}
              />
            </div>
          </div>
        )}

        {/* Grievance Details */}
        <div className="space-y-3.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Grievance Category"
              options={CATEGORIES}
              placeholder="Select category..."
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              error={errors.category}
              required
            />
            <Input
              label="Subject Line"
              placeholder="Brief summary (max 120 chars)"
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              error={errors.subject}
              maxLength={120}
              required
            />
          </div>

          <Textarea
            label="Detailed Description"
            placeholder="Describe the issue clearly (min 30 characters)..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            error={errors.description}
            rows={4}
            maxLength={5000}
            showCount
            required
          />

          {/* Compact Attachment Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-gray-700">Supporting Document (Optional)</span>
              <span className="text-gray-400">PDF, JPG, PNG &lt; 5MB</span>
            </div>

            {attachmentUrl ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{form.attachment?.name || "Document attached"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentUrl(null);
                    setForm((prev) => ({ ...prev, attachment: null }));
                  }}
                  className="p-1 hover:text-emerald-950 rounded"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-500 hover:bg-brand-50/50 transition-colors text-xs text-gray-600">
                {uploadingFile ? (
                  <div className="flex items-center gap-2 text-brand-600">
                    <div className="h-3.5 w-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Paperclip className="h-3.5 w-3.5 text-gray-400" />
                    <span>Click to attach file</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploadingFile}
                />
              </label>
            )}
            {errors.attachment && (
              <p className="mt-1 text-xs text-rose-600">{errors.attachment}</p>
            )}
          </div>
        </div>

        {errors.submit && (
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
            {errors.submit}
          </p>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            loading={submitting}
            className="w-full justify-center py-2.5 text-sm bg-brand-600 hover:bg-brand-700"
          >
            Submit Grievance
          </Button>
        </div>
      </form>
    </Card>
  );
}
