"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// Simple global toast state
let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

export function toast(type: ToastType, message: string) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, type, message }];
  toastListeners.forEach((l) => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    toastListeners.forEach((l) => l(toasts));
  }, 5000);
}

const icons = {
  success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-rose-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const colors = {
  success: "border-emerald-200 bg-emerald-50",
  error: "border-rose-200 bg-rose-50",
  warning: "border-amber-200 bg-amber-50",
  info: "border-blue-200 bg-blue-50",
};

export function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListeners.push(setMessages);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setMessages);
    };
  }, []);

  const dismiss = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    setMessages([...toasts]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all",
            colors[msg.type]
          )}
        >
          {icons[msg.type]}
          <p className="text-sm text-gray-800 flex-1">{msg.message}</p>
          <button onClick={() => dismiss(msg.id)} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
