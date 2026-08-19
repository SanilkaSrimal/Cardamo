"use client";

import Link from "next/link";
import { useState } from "react";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AuthShell from "@/components/AuthShell";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
const labelClass =
  "block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 mb-2";

function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Already have one?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-900"
          >
            Sign in here
          </Link>
        </>
      }
      panelTitle="Start with 100 free credits — no card required."
      panelPoints={[
        "Five full analyses on the house: disease, grading, or market forecast.",
        "Works from any smartphone in the field — no app install needed.",
        "Organic-first treatment plans attached to every diagnosis.",
      ]}
    >
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} />
          <p className="text-sm font-medium leading-relaxed">{error}</p>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className={labelClass}>
            Full Name
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="name@company.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirm" className={labelClass}>
              Confirm
            </label>
            <div className="relative">
              <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                value={form.confirm}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-brand-700 accent-brand-700"
          />
          <label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-gray-600">
            I agree to the{" "}
            <Link href="/privacy" className="font-semibold text-brand-700 underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-semibold text-brand-700 underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Creating account</>
          ) : (
            <>Create account <UserPlus className="h-4 w-4" /></>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-gray-400">
        No credit card required. 100 credits included on signup.
      </p>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
}
