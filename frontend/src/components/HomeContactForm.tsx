"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { submitContactForm } from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
const labelClass =
  "block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 mb-2";

export default function HomeContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitContactForm(formData);
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to send message.");
    }
  };

  return (
    <div>
      {status === "success" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-800">
          <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
          <p className="text-sm font-medium leading-relaxed">
            Thank you! Your message has been sent successfully. We will get back to you soon.
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Message</label>
          <textarea
            rows={5}
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className={`${inputClass} resize-none`}
            placeholder="How can we help you?"
          />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-4 font-bold uppercase tracking-[0.14em] text-white shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {status === "loading" ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Sending</>
          ) : (
            <>Send Message <Send className="h-4 w-4" /></>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          We reply within one business day. Your details are never shared.
        </p>
      </form>
    </div>
  );
}
