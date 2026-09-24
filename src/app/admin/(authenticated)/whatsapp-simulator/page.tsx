"use client";

import { useState, useEffect, useRef } from "react";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Send,
  RotateCcw,
  Smartphone,
  Shield,
  Clock,
  Sparkles,
  Bot,
  User,
  Info,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function WhatsAppSimulatorPage() {
  const [phone, setPhone] = useState("919876543210");
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("IDLE");
  const [tempData, setTempData] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text:
        "🏛️ *LAW CENTRE II — Grievance Redressal Bot*\n\n" +
        "Welcome! You can submit grievances, track existing tickets, and get official administrative responses directly on WhatsApp.\n\n" +
        "Please select an option:\n" +
        "*1.* 📝 Submit Grievance\n" +
        "*2.* 🔍 Track Status\n" +
        "*3.* 📚 FAQs & Categories\n" +
        "*4.* 📞 Contact Administration\n\n" +
        "_Reply with a number (1-4) or tap a button below:_\n\n" +
        "[📝 Submit Grievance]  [🔍 Track Status]  [📚 FAQs & Help]",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(customText?: string) {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/whatsapp/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          text: textToSend,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setCurrentStep(data.session?.step || "IDLE");
        setTempData(data.session?.tempData || {});
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: "❌ Error processing message: " + (data.error || "Unknown error"),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "❌ Network error. Please check connection.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setLoading(true);
    try {
      await fetch(`/api/whatsapp/simulate?phone=${phone}`, { method: "DELETE" });
      setMessages([
        {
          id: Date.now().toString(),
          sender: "bot",
          text:
            "🏛️ *LAW CENTRE II — Grievance Redressal Bot*\n\n" +
            "Session reset! Welcome to the Law Centre II Grievance Bot.\n\n" +
            "Please select an option:\n" +
            "*1.* 📝 Submit Grievance\n" +
            "*2.* 🔍 Track Status\n" +
            "*3.* 📚 FAQs & Categories\n" +
            "*4.* 📞 Contact Administration",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setCurrentStep("IDLE");
      setTempData({});
    } finally {
      setLoading(false);
    }
  }

  // Format WhatsApp markdown (*bold*, _italic_) into clean HTML elements
  function formatWhatsAppText(text: string) {
    const formatted = text
      .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
      .replace(/_([^_]+)_/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code class='bg-gray-200 px-1 py-0.5 rounded text-xs'>$1</code>");

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  }

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      <AdminTopbar title="WhatsApp Bot Simulator" userName="Admin" />

      <div className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: WhatsApp Chat Device Frame */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[700px]">
            {/* WhatsApp Header */}
            <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#128c7e] flex items-center justify-center text-white font-bold border border-white/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">
                    LAW CENTRE II Grievance Bot
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Official Verified Business Account</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                title="Reset session"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            {/* Chat Body with WhatsApp Pattern Background */}
            <div className="flex-1 bg-[#efeae2] p-4 overflow-y-auto space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm relative whitespace-pre-wrap leading-relaxed ${
                      m.sender === "user"
                        ? "bg-[#d9fdd3] text-gray-900 rounded-tr-none"
                        : "bg-white text-gray-900 rounded-tl-none border border-gray-100"
                    }`}
                  >
                    <div className="text-[13px]">{formatWhatsAppText(m.text)}</div>
                    <div className="text-[10px] text-gray-400 text-right mt-1">
                      {m.time} {m.sender === "user" ? "✓✓" : ""}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action buttons for convenience */}
            <div className="bg-gray-100 border-t border-gray-200 px-3 py-2 flex flex-wrap gap-1.5 text-xs">
              <span className="text-gray-500 self-center mr-1 text-[11px]">Quick replies:</span>
              <button
                onClick={() => handleSend("1")}
                className="bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-gray-300 rounded-full px-2.5 py-1 text-gray-700 transition-colors shadow-2xs"
              >
                📝 1. Submit Grievance
              </button>
              <button
                onClick={() => handleSend("2")}
                className="bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-gray-300 rounded-full px-2.5 py-1 text-gray-700 transition-colors shadow-2xs"
              >
                🔍 2. Track Status
              </button>
              <button
                onClick={() => handleSend("3")}
                className="bg-white hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 border border-gray-300 rounded-full px-2.5 py-1 text-gray-700 transition-colors shadow-2xs"
              >
                📚 3. FAQs & Help
              </button>
              <button
                onClick={() => handleSend("menu")}
                className="bg-white hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 border border-gray-300 rounded-full px-2.5 py-1 text-gray-700 transition-colors shadow-2xs"
              >
                🏠 menu
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="bg-[#f0f2f5] p-3 border-t border-gray-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message or option number..."
                disabled={loading}
                className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="h-10 w-10 rounded-full bg-[#075e54] hover:bg-[#128c7e] text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Session Inspector & Meta Cloud Setup */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Session Info */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-5 w-5 text-brand-600" />
              <h3 className="font-semibold text-gray-900">Active Test Session</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Simulation Phone Number:
                </label>
                <div className="flex gap-2">
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="919876543210"
                    className="font-mono text-xs"
                  />
                  <Button size="sm" variant="outline" onClick={handleReset}>
                    Reset
                  </Button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Current Step:</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  {currentStep}
                </span>
              </div>

              {Object.keys(tempData).length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 font-medium block mb-1.5">
                    Data Collected In Progress:
                  </span>
                  <div className="bg-gray-50 rounded-lg p-2.5 font-mono text-[11px] text-gray-700 space-y-1">
                    {Object.entries(tempData).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-400">{k}:</span>
                        <span className="font-semibold truncate max-w-[180px]">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Meta Cloud API Production Setup */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Meta WhatsApp Cloud API Setup</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              To connect this bot to a live WhatsApp Business number, configure your webhook in the{" "}
              <a
                href="https://developers.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 font-semibold underline"
              >
                Meta for Developers Portal
              </a>
              .
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-gray-500 font-medium mb-1">Webhook Callback URL:</div>
                <code className="text-brand-700 font-bold break-all block bg-white p-1.5 rounded border border-gray-200">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/api/whatsapp`
                    : "https://your-domain.com/api/whatsapp"}
                </code>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-gray-500 font-medium mb-1">Verify Token:</div>
                <code className="text-emerald-700 font-bold block bg-white p-1.5 rounded border border-gray-200">
                  lc2_grievance_bot_verify_token_2026
                </code>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-gray-500 font-medium mb-1">Webhook Subscriptions:</div>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-brand-100 text-brand-800 font-mono text-[11px]">
                    messages
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* SLA & Feature Matrix */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Clock className="h-4 w-4" />
              Real-time SLA Integration
            </div>
            <p className="leading-relaxed">
              Every complaint filed via WhatsApp is given a unique ticket ID (e.g.{" "}
              <code>GRV-2026-XXXX</code>), enforces the 48-hour acknowledgment and 7-day resolution
              deadlines, and instantly notifies students whenever the administration responds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
