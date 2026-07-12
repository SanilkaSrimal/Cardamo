"use client";

import Link from "next/link";
import { useState } from "react";
import { LogIn, Mail, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AuthShell from "@/components/AuthShell";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
const labelClass =
  "block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 mb-2";

function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        <>
          New here?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-700 underline underline-offset-4 transition-colors hover:text-brand-900"
          >
            Create a free account
          </Link>
        </>
      }
      panelTitle="Every scan, grade, and forecast in one place."
      panelPoints={[
        "Pick up where you left off — your harvest records sync across devices.",
        "Track credits and top up without leaving the dashboard.",
        "Review past diagnoses to see how disease pressure trends over the season.",
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="name@company.com"
            />
          </div>
        </div>

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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-4 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Signing in</>
          ) : (
            <>Sign in <LogIn className="h-4 w-4" /></>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-gray-400">
        Protected by industry-standard encryption. See our{" "}
        <Link href="/privacy" className="font-semibold text-gray-500 underline">
          privacy policy
        </Link>
        .
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
