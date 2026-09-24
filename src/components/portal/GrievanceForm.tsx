"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CATEGORIES } from "@/lib/validations";
import { CheckCircle, Copy, Search, Upload, X, ChevronRight, ChevronLeft } from "lucide-react";

const STEPS = ["Personal Info", "Category & Subject", "Description", "Review & Submit"];

interface FormData {
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
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validateStep(s: number): boolean {
    const errs: Errors = {};
    if (s === 0) {
      if (!form.studentName.trim() || form.studentName.length < 2)
        errs.studentName = "Name must be at least 2 characters";
      if (!form.studentRoll.trim()) errs.studentRoll = "Roll number is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studentEmail))
        errs.studentEmail = "Enter a valid email address";
      if (form.studentPhone && !/^[6-9]\d{9}$/.test(form.studentPhone))
        errs.studentPhone = "Enter a valid 10-digit mobile number";
    }
    if (s === 1) {
      if (!form.category) errs.category = "Please select a category";
      if (!form.subject.trim() || form.subject.length < 5)
        errs.subject = "Subject must be at least 5 characters";
      if (form.subject.length > 120) errs.subject = "Subject must be under 120 characters";
    }
    if (s === 2) {
      if (!form.description.trim() || form.description.length < 30)
        errs.description = "Description must be at least 30 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
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
      if (data.success) {
        setAttachmentUrl(data.url);
        setForm((prev) => ({ ...prev, attachment: file }));
      } else {
        setErrors((prev) => ({ ...prev, attachment: data.error || "Upload failed" }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, attachment: "Upload failed. Please try again." }));
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    try {
      const payload = {
        studentName: form.studentName,
        studentRoll: form.studentRoll,
        studentEmail: form.studentEmail,
        studentPhone: form.studentPhone || undefined,
        category: form.category,
        subject: form.subject,
        description: form.description,
        attachmentUrl: attachmentUrl || undefined,
      };

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessTicket(data.data.ticketId);
      } else {
        setErrors({ submit: data.error || "Submission failed. Please try again." });
      }
    } catch {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function copyTicket() {
    if (successTicket) {
      await navigator.clipboard.writeText(successTicket);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // ─── Success card ────────────────────────────────────────────────────────
  if (successTicket) {
    return (
      <Card className="text-center max-w-lg mx-auto p-4 sm:p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Grievance Submitted!</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Your complaint has been successfully registered. Please save your Ticket ID below.
            </p>
          </div>

          <div className="bg-brand-50 border-2 border-brand-200 rounded-xl px-4 py-3 sm:px-8 sm:py-4 w-full">
            <p className="text-[10px] sm:text-xs text-brand-600 font-semibold uppercase tracking-wider mb-1">
              Ticket ID
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-brand-700 tracking-wider font-mono">
              {successTicket}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 justify-center py-2.5"
              onClick={copyTicket}
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied!" : "Copy Ticket ID"}
            </Button>
            <Button
              className="flex-1 justify-center py-2.5"
              onClick={() =>
                router.push(`/track?ticketId=${successTicket}&email=${encodeURIComponent(form.studentEmail)}`)
              }
            >
              <Search className="h-4 w-4" />
              Track Status
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            A confirmation email has been dispatched to <strong>{form.studentEmail}</strong>
          </p>
        </div>
      </Card>
    );
  }

  // ─── Step progress ────────────────────────────────────────────────────────
  const categoryLabel = CATEGORIES.find((c) => c.value === form.category)?.label || form.category;

  return (
    <Card className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Mobile Step Indicator */}
      <div className="sm:hidden mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
          <span className="text-brand-700">Step {step + 1} of {STEPS.length}</span>
          <span className="text-gray-500">{STEPS[step]}</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden sm:flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  i < step
                    ? "bg-brand-600 border-brand-600 text-white"
                    : i === step
                    ? "border-brand-600 text-brand-600 bg-brand-50"
                    : "border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  i === step ? "text-brand-600" : i < step ? "text-gray-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? "bg-brand-600" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ─── Step 0: Personal Info ─── */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              placeholder="e.g. CS2023001"
              value={form.studentRoll}
              onChange={(e) => set("studentRoll", e.target.value)}
              error={errors.studentRoll}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* ─── Step 1: Category & Subject ─── */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Grievance Category</h2>
          <Select
            label="Department / Category"
            options={CATEGORIES}
            placeholder="Select a category..."
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            error={errors.category}
            required
          />
          <Input
            label="Subject Line"
            placeholder="Brief summary of your grievance (max 120 chars)"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            error={errors.subject}
            maxLength={120}
            helperText={`${form.subject.length}/120 characters`}
            required
          />
        </div>
      )}

      {/* ─── Step 2: Description & Attachment ─── */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Detailed Description</h2>
          <Textarea
            label="Detailed Description"
            placeholder="Provide a detailed description of your grievance (minimum 30 characters)..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            error={errors.description}
            rows={5}
            maxLength={5000}
            showCount
            required
          />

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supporting Attachment <span className="text-gray-400">(Optional)</span>
            </label>
            {attachmentUrl ? (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span className="text-sm text-emerald-700 flex-1 truncate">
                  {form.attachment?.name || "Attachment uploaded"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentUrl(null);
                    setForm((prev) => ({ ...prev, attachment: null }));
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full min-h-[110px] p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
                {uploadingFile ? (
                  <div className="flex items-center gap-2 text-brand-600">
                    <div className="h-5 w-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Uploading attachment...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-gray-400 mb-1" />
                    <p className="text-xs sm:text-sm text-gray-600 text-center">
                      Tap or click to upload <span className="text-brand-600 font-medium">JPG, PNG, PDF</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Maximum file size: 5MB</p>
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
      )}

      {/* ─── Step 3: Review & Submit ─── */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Review & Submit</h2>
          <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-500">Student Name</p>
                <p className="font-semibold text-gray-900">{form.studentName}</p>
              </div>
              <div>
                <p className="text-gray-500">Roll / Reg Number</p>
                <p className="font-semibold text-gray-900">{form.studentRoll}</p>
              </div>
              <div>
                <p className="text-gray-500">Email Address</p>
                <p className="font-semibold text-gray-900 break-all">{form.studentEmail}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">{form.studentPhone || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-semibold text-gray-900">{categoryLabel}</p>
              </div>
              <div>
                <p className="text-gray-500">Attachment</p>
                <p className="font-semibold text-gray-900 truncate">
                  {form.attachment ? form.attachment.name : "None"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-500">Subject</p>
              <p className="font-semibold text-gray-900">{form.subject}</p>
            </div>
            <div>
              <p className="text-gray-500">Description</p>
              <p className="font-medium text-gray-800 whitespace-pre-wrap leading-relaxed mt-0.5">
                {form.description}
              </p>
            </div>
          </div>
          {errors.submit && (
            <p className="text-xs sm:text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">
              {errors.submit}
            </p>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={back}
          disabled={step === 0}
          className="w-full sm:w-auto justify-center"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next} className="w-full sm:w-auto justify-center">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting} className="w-full sm:w-auto justify-center">
            Submit Grievance
          </Button>
        )}
      </div>
    </Card>
  );
}
