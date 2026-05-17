"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { api } from "@/lib/api";

interface PaymentRow {
  id: number;
  amount_lkr: number;
  credits_purchased: number;
  payment_ref: string;
  status: string;
  created_at: string;
  plan_name: string;
  user_name: string;
  user_email: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.payments.all();
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalRevenue = payments.reduce((s, p) => s + p.amount_lkr, 0);
  const totalCredits = payments.reduce((s, p) => s + p.credits_purchased, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 uppercase tracking-tight">
          All Payments
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Complete purchase history across all users.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Transactions", value: payments.length },
          {
            label: "Total Revenue (LKR)",
            value: `Rs. ${totalRevenue.toLocaleString()}`,
          },
          {
            label: "Total Credits Sold",
            value: totalCredits.toLocaleString(),
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 p-5">
            <p className="text-2xl font-semibold text-gray-900">{loading ? "—" : s.value}</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 uppercase tracking-tight text-sm">
            Payment Records
          </h2>
          <Receipt className="h-4 w-4 text-gray-400" />
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No payments yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[
                    "User",
                    "Email",
                    "Plan",
                    "Credits",
                    "Amount (LKR)",
                    "Reference",
                    "Date",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.user_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.user_email}</td>
                    <td className="px-4 py-3 text-gray-700">{p.plan_name}</td>
                    <td className="px-4 py-3 text-brand-primary font-semibold">
                      +{p.credits_purchased}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Rs. {p.amount_lkr.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {p.payment_ref}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-xs font-semibold uppercase px-2 py-1 bg-emerald-50 text-emerald-700">
                        {p.status}
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
