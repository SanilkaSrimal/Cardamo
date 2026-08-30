"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Sprout, TrendingUp, Zap, ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-soft p-6 flex items-start gap-4">
      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.harvesting.my(), api.payments.my()])
      .then(([h, p]) => {
        setRecords(h);
        setPayments(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSpend = payments.reduce((s, p) => s + p.amount_lkr, 0);
  const totalCreditsUsed = payments.reduce((s, p) => s - p.credits_purchased, 0); // unused

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 uppercase tracking-tight">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's what's happening with your Cardamo account.
        </p>
      </div>

      {/* Credit balance hero */}
      <div className="mesh-emerald p-6 md:p-8 relative overflow-hidden rounded-3xl shadow-lift">
        <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 translate-x-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest mb-1">
              Current Balance
            </p>
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-brand-accent" />
              <span className="text-5xl font-semibold text-white">{user?.credits ?? 0}</span>
              <span className="text-emerald-200 text-xl font-semibold">credits</span>
            </div>
            <p className="text-emerald-200 text-xs mt-2">
              Each AI analysis costs 20 credits
            </p>
          </div>
          <Link
            href="/dashboard/payments"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-900 px-6 py-3 font-bold text-sm uppercase tracking-widest shadow-soft transition-all hover:bg-brand-50 hover:-translate-y-0.5"
          >
            BUY CREDITS <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Harvesting Records"
          value={loading ? "—" : records.length}
          icon={Sprout}
          color="bg-emerald-50 text-brand-primary"
        />
        <StatCard
          label="Total Spent (LKR)"
          value={loading ? "—" : `Rs. ${totalSpend.toLocaleString()}`}
          icon={CreditCard}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Plans Activated"
          value={loading ? "—" : payments.length}
          icon={TrendingUp}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Recent harvesting records */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 uppercase tracking-tight text-sm">
            Recent Harvesting Records
          </h2>
          <Link
            href="/dashboard/harvesting"
            className="text-xs font-semibold text-brand-primary hover:text-brand-secondary flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center">
            <Sprout className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No harvesting records yet.</p>
            <Link
              href="/dashboard/harvesting"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:text-brand-secondary"
            >
              Add your first record <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Date", "Fresh Price (LKR/kg)", "Drying Cost (LKR)", "Storage Cost (LKR)", "Conv. Ratio"].map(
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
                {records.slice(0, 5).map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Rs. {r.current_fresh_price_lkr_per_kg.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Rs. {r.drying_cost_total_lkr.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      Rs. {r.storage_cost_total_lkr.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.conversion_ratio}</td>
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
