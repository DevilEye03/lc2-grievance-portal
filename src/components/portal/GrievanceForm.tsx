"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CATEGORIES } from "@/lib/validations";
import { CheckCircle, Copy, Search, Upload, X, ChevronRight, ChevronLeft, Shield, ShieldCheck, ShieldAlert, Lock } from "lucide-react";

const STEPS = ["Personal Info", "Category & Subject", "Description", "Review & Submit"];

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
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [successSecret, setSuccessSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("anonymous=true")) {
      setForm((prev) => ({ ...prev, isAnonymous: true }));
    }
  }, []);

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validateStep(s: number): boolean {
    const errs: Errors = {};
    if (s === 0) {
      if (!form.isAnonymous) {
        if (!form.studentName.trim() || form.studentName.length < 2)
          errs.studentName = "Name must be at least 2 characters";
        if (!form.studentRoll.trim()) errs.studentRoll = "Roll number is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studentEmail))
          errs.studentEmail = "Enter a valid email address";
        if (form.studentPhone && !/^[6-9]\d{9}$/.test(form.studentPhone))
          errs.studentPhone = "Enter a valid 10-digit mobile number";
      } else {
        if (form.studentEmail && form.studentEmail.trim()) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studentEmail.trim())) {
            errs.studentEmail = "Enter a valid email address or leave blank";
          }
        }
      }
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
        isAnonymous: form.isAnonymous,
        studentName: form.isAnonymous ? "Anonymous Student" : form.studentName,
        studentRoll: form.isAnonymous ? "ANONYMOUS" : form.studentRoll,
        studentEmail: form.studentEmail || undefined,
        studentPhone: form.isAnonymous ? undefined : form.studentPhone || undefined,
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
        setSuccessSecret(data.data.trackingSecret || null);
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
          <div className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center flex-shrink-0 ${
            successSecret ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
          }`}>
            {successSecret ? (
              <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
            ) : (
              <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {successSecret ? "Anonymous Grievance Registered!" : "Grievance Submitted!"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {successSecret
                ? "Your identity is protected. Please copy and save your Secret Tracking Key below."
                : "Your complaint has been successfully registered. Please save your Ticket ID below."}
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

          {successSecret && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl px-4 py-3 sm:px-6 sm:py-4 w-full text-left space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] sm:text-xs text-purple-700 font-semibold uppercase tracking-wider">
                      Secret Tracking Key
                    </p>
                    <span className="text-[9px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold uppercase">
                      Required to Track
                    </span>
                  </div>
                  <p className="text-lg sm:text-2xl font-black text-purple-900 tracking-wider font-mono mt-0.5">
                    {successSecret}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-purple-300 text-purple-800 hover:bg-purple-100"
                  onClick={async () => {
                    await navigator.clipboard.writeText(successSecret);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedSecret ? "Copied" : "Copy Key"}
                </Button>
              </div>
            </div>
          )}

          {successSecret && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 sm:p-4 text-left flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold mb-0.5">Save this Secret Tracking Key now!</p>
                <p>
                  Because this grievance was filed anonymously, authorities do not have your name or student profile. You will need your <strong>Ticket ID</strong> and this <strong>Secret Tracking Key</strong> to view replies at <code>/track</code>.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 justify-center py-2.5"
              onClick={async () => {
                const text = successSecret
                  ? `LAW CENTRE II Grievance Tracking Credentials:\nTicket ID: ${successTicket}\nSecret Key: ${successSecret}\nTrack URL: https://lc2-grievance-portal.vercel.app/track`
                  : `LAW CENTRE II Grievance Ticket: ${successTicket}`;
                await navigator.clipboard.writeText(text);
                setCopiedAll(true);
                setTimeout(() => setCopiedAll(false), 2000);
              }}
            >
              <Copy className="h-4 w-4" />
              {copiedAll ? "All Details Copied!" : successSecret ? "Copy All Credentials" : copied ? "Copied!" : "Copy Ticket ID"}
            </Button>
            <Button
              className="flex-1 justify-center py-2.5 bg-brand-600 hover:bg-brand-700"
              onClick={() =>
                router.push(
                  `/track?ticketId=${successTicket}&email=${encodeURIComponent(
                    successSecret || form.studentEmail || ""
                  )}`
                )
              }
            >
              <Search className="h-4 w-4" />
              Track Status Now
            </Button>
          </div>

          {form.studentEmail && !form.studentEmail.endsWith("@grievance.internal") && (
            <p className="text-xs text-gray-500">
              A confirmation email has been dispatched to <strong>{form.studentEmail}</strong>
            </p>
          )}
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
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {form.isAnonymous ? "Identity & Privacy" : "Personal Information"}
            </h2>
          </div>

          {/* Anonymous toggle card */}
          <div
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              form.isAnonymous
                ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-100"
                : "bg-gray-50 border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => {
              const nextVal = !form.isAnonymous;
              setForm((prev) => ({
                ...prev,
                isAnonymous: nextVal,
                studentName: nextVal ? "Anonymous Student" : "",
                studentRoll: nextVal ? "ANONYMOUS" : "",
                studentPhone: nextVal ? "" : prev.studentPhone,
              }));
              setErrors({});
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg mt-0.5 ${
                    form.isAnonymous ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      File Anonymously
                    </span>
                    {form.isAnonymous ? (
                      <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Protected
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    {form.isAnonymous
                      ? "Whistleblower mode enabled. Your name, roll number, and phone number will NOT be recorded or shown to officers. You will receive a Secret Tracking Key to track replies."
                      : "Check this if you do not want your name, roll number, or phone number disclosed to the administration."}
                  </p>
                </div>
              </div>
              <div className="flex items-center pt-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  id="anonymous-toggle"
                  checked={form.isAnonymous}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm((prev) => ({
                      ...prev,
                      isAnonymous: checked,
                      studentName: checked ? "Anonymous Student" : "",
                      studentRoll: checked ? "ANONYMOUS" : "",
                      studentPhone: checked ? "" : prev.studentPhone,
                    }));
                    setErrors({});
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {form.isAnonymous ? (
            <div className="space-y-4 pt-1">
              <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 font-semibold text-xs uppercase tracking-wider">
                  <Lock className="h-3.5 w-3.5 text-purple-600" />
                  <span>Your Identity Protection Shield</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                    <p className="text-gray-400 text-[11px]">Display Name</p>
                    <p className="font-semibold text-gray-800 mt-0.5">Anonymous Student</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                    <p className="text-gray-400 text-[11px]">Roll Number</p>
                    <p className="font-semibold text-gray-800 mt-0.5">PROTECTED (N/A)</p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                    <p className="text-gray-400 text-[11px]">Contact Phone</p>
                    <p className="font-semibold text-gray-800 mt-0.5">Withheld</p>
                  </div>
                </div>
              </div>

              <div>
                <Input
                  label="Private Notification Email (Optional)"
                  type="email"
                  placeholder="Optional — e.g. you@student.edu"
                  value={form.studentEmail}
                  onChange={(e) => set("studentEmail", e.target.value)}
                  error={errors.studentEmail}
                />
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                  🔒 <strong>Strict Privacy Guarantee:</strong> If entered, this email is only used by the automated system to alert you when an authority reply is posted. It will <strong>never</strong> be visible to officers or attached to your complaint. You can also leave this blank and track status purely using your Secret Tracking Key.
                </p>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
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

          {form.isAnonymous && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-purple-900">
              <ShieldCheck className="h-4 w-4 text-purple-700 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold">Filing as Anonymous Grievance</p>
                <p className="text-purple-700 mt-0.5">
                  Your identity details will be masked and not shared with administration. You will be given a Secret Tracking Key upon submitting.
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-200">
              <div>
                <p className="text-gray-500">Student Name</p>
                <p className="font-semibold text-gray-900">
                  {form.isAnonymous ? "Anonymous Student (Protected)" : form.studentName}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Roll / Reg Number</p>
                <p className="font-semibold text-gray-900">
                  {form.isAnonymous ? "PROTECTED (N/A)" : form.studentRoll}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Email Address</p>
                <p className="font-semibold text-gray-900 break-all">
                  {form.isAnonymous
                    ? form.studentEmail
                      ? `${form.studentEmail} (Private Alerts Only)`
                      : "None Provided"
                    : form.studentEmail}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="font-semibold text-gray-900">
                  {form.isAnonymous ? "Withheld" : form.studentPhone || "—"}
                </p>
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
