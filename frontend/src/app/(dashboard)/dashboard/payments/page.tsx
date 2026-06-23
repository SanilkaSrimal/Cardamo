"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Check, CreditCard, Package, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Payment, Plan } from "@/lib/auth";

// ─── Plan card ───────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onActivate,
  activating,
}: {
  plan: Plan;
  onActivate: (id: number) => void;
  activating: boolean;
}) {
  const perAnalysis = Math.floor(plan.total_credits / 20);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex flex-col gap-4 card-hover hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift relative">
      {plan.name === "Professional" && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-1">
          POPULAR
        </div>
      )}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Package className="h-5 w-5 text-brand-primary" />
          <h3 className="font-semibold text-gray-900 uppercase tracking-tight">{plan.name}</h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold text-gray-900">
            Rs. {plan.price.toLocaleString()}
          </span>
          <span className="text-gray-500 text-sm">LKR</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="h-4 w-4 text-brand-primary" />
          <span>
            <strong>{plan.total_credits}</strong> credits
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="h-4 w-4 text-brand-primary" />
          <span>Up to <strong>{perAnalysis}</strong> AI analyses</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Check className="h-4 w-4 text-brand-primary" />
          <span>All AI features included</span>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        Rs. {(plan.price / plan.total_credits).toFixed(2)} per credit ·{" "}
        Rs. {(plan.price / perAnalysis).toFixed(0)} per analysis
      </div>

      <button
        onClick={() => onActivate(plan.id)}
        disabled={activating}
        className="w-full py-3.5 rounded-xl bg-brand-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-brand-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
      >
        <Zap className="h-4 w-4" />
        {activating ? "Activating..." : "ACTIVATE PLAN"}
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PaymentsPage() {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, pay] = await Promise.all([api.plans.list(), api.payments.my()]);
      setPlans(p);
      setPayments(pay);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleActivate = async (planId: number) => {
    setActivatingId(planId);
    try {
      const res = await api.payments.activate(planId);
      showToast("success", res.message);
      await Promise.all([load(), refreshUser()]);
    } catch (err: any) {
      showToast("error", err.message || "Activation failed.");
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-4 text-sm font-semibold shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 uppercase tracking-tight">
          Credits & Payments
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your credit balance and purchase history.
        </p>
      </div>

      {/* Balance banner */}
      <div className="mesh-emerald p-6 flex items-center justify-between rounded-2xl shadow-soft">
        <div>
          <p className="text-emerald-200 text-xs font-semibold uppercase tracking-widest">
            Your Current Balance
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Zap className="h-7 w-7 text-brand-accent" />
            <span className="text-4xl font-semibold text-white">{user?.credits ?? 0}</span>
            <span className="text-emerald-200 font-semibold">credits</span>
          </div>
        </div>
        <div className="hidden md:block text-right text-emerald-200 text-xs">
          <p>20 credits = 1 AI analysis</p>
          <p>Credits never expire</p>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="font-semibold text-gray-900 uppercase tracking-tight text-lg mb-4">
          Available Plans
        </h2>
        {loading ? (
          <div className="text-gray-400 text-sm">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onActivate={handleActivate}
                activating={activatingId === plan.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Purchase history */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 uppercase tracking-tight text-sm">
            Purchase History
          </h2>
          <CreditCard className="h-4 w-4 text-gray-400" />
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No purchases yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Plan", "Credits", "Amount (LKR)", "Reference", "Date", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{p.plan_name}</td>
                    <td className="px-4 py-3 text-brand-primary font-semibold">
                      +{p.credits_purchased}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Rs. {p.amount_lkr.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {p.payment_ref}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full text-xs font-bold uppercase px-2.5 py-1 bg-brand-50 text-brand-700">
                        <Check className="h-3 w-3" /> {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
