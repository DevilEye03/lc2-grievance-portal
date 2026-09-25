"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";

interface TrackFormProps {
  initialTicketId?: string;
}

export function TrackForm({ initialTicketId }: TrackFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ticketId, setTicketId] = useState(
    initialTicketId || searchParams.get("ticketId") || ""
  );
  const [studentEmail, setStudentEmail] = useState(searchParams.get("email") || "");
  const [errors, setErrors] = useState<{ ticketId?: string; studentEmail?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!/^GRV-\d{4}-\d{4}$/.test(ticketId.trim())) {
      errs.ticketId = "Invalid format. Example: GRV-2026-0001";
    }
    const val = studentEmail.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isSecretKey = /^SEC-[A-Z0-9-]{4,15}$/i.test(val) || val.toUpperCase().startsWith("SEC-") || val.length >= 6;
    if (!isEmail && !isSecretKey) {
      errs.studentEmail = "Enter your registered email or Secret Tracking Key (SEC-...)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Navigate — TrackResult will fetch via server component / searchParams
    router.push(`/track?ticketId=${encodeURIComponent(ticketId.trim())}&email=${encodeURIComponent(studentEmail.trim())}`);
    setLoading(false);
  }

  return (
    <form onSubmit={handleTrack} className="space-y-4">
      <Input
        label="Ticket / Reference ID"
        placeholder="GRV-2026-0001"
        value={ticketId}
        onChange={(e) => {
          setTicketId(e.target.value.toUpperCase());
          setErrors((p) => ({ ...p, ticketId: "" }));
        }}
        error={errors.ticketId}
        required
      />
      <div>
        <Input
          label="Registered Email or Secret Tracking Key"
          type="text"
          placeholder="you@student.edu or SEC-XXXX-XXXX"
          value={studentEmail}
          onChange={(e) => {
            setStudentEmail(e.target.value);
            setErrors((p) => ({ ...p, studentEmail: "" }));
          }}
          error={errors.studentEmail}
          required
        />
        <p className="text-xs text-gray-500 mt-1.5">
          🔒 For anonymous grievances, enter the <strong>Secret Tracking Key</strong> you received upon submission.
        </p>
      </div>
      <Button type="submit" loading={loading} className="w-full">
        <Search className="h-4 w-4" />
        Track Grievance
      </Button>
    </form>
  );
}
