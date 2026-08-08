"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Edit2, Package, PlusCircle, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { Plan } from "@/lib/auth";

const EMPTY_FORM = { name: "", price: "", total_credits: "" };

function PlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan?: Plan | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!plan;
  const [form, setForm] = useState(
    plan
      ? {
          name: plan.name,
          price: String(plan.price),
          total_credits: String(plan.total_credits),
        }
      : EMPTY_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      name: form.name,
      price: parseFloat(form.price),
      total_credits: parseInt(form.total_credits),
    };
    try {
      if (isEdit && plan) {
        await api.plans.update(plan.id, payload);
      } else {
        await api.plans.create(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save plan.");
    } finally {
      setLoading(false);
    }
  };

  const fields: Array<{ label: string; key: keyof typeof form; type?: string; placeholder: string }> = [
    { label: "Plan Name", key: "name", type: "text", placeholder: "e.g. Premium" },
    { label: "Price (LKR)", key: "price", placeholder: "e.g. 2500" },
    { label: "Total Credits", key: "total_credits", placeholder: "e.g. 300" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 uppercase tracking-tight">
            {isEdit ? "Edit Plan" : "Create Plan"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                {f.label}
              </label>
              <input
                type={f.type ?? "number"}
                value={form[f.key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                step="any"
                required
                className="w-full px-3 py-2.5 border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-brand-primary"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-sm font-semibold uppercase text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-brand-primary text-white text-sm font-semibold uppercase tracking-widest hover:bg-brand-secondary disabled:opacity-60"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.plans.listAll();
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (plan: Plan) => {
    try {
      await api.plans.update(plan.id, { is_active: !plan.is_active });
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.plans.delete(id);
      setDeleteId(null);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 uppercase tracking-tight">
            Plan Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage credit plans for users.
          </p>
        </div>
        <button
          onClick={() => {
            setEditPlan(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-brand-900 text-white px-5 py-3 text-sm font-bold uppercase tracking-widest shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5"
        >
          <PlusCircle className="h-4 w-4" /> NEW PLAN
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : plans.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No plans yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Plan", "Price (LKR)", "Credits", "Per Credit", "Status", "Created", ""].map((h) => (
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
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 text-gray-700">
                      Rs. {p.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-brand-primary font-semibold">
                      {p.total_credits}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      Rs. {(p.price / p.total_credits).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(p)}
                        className={`text-xs font-semibold uppercase px-3 py-1 transition-colors ${
                          p.is_active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditPlan(p);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-emerald-50"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <PlanModal
          plan={editPlan}
          onClose={() => {
            setModalOpen(false);
            setEditPlan(null);
          }}
          onSaved={load}
        />
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white max-w-sm w-full p-6 space-y-4 rounded-2xl shadow-lift">
            <h3 className="font-semibold text-gray-900 uppercase">Deactivate Plan</h3>
            <p className="text-sm text-gray-600">
              This will mark the plan as inactive. Existing purchases will not be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 border border-gray-300 text-sm font-semibold uppercase text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 bg-red-600 text-white text-sm font-semibold uppercase hover:bg-red-700"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
