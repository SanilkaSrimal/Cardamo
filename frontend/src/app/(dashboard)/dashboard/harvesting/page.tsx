"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Edit2, PlusCircle, Trash2, X, Sprout, Info, Activity, Loader2 } from "lucide-react";
import { api, getMarketRecommendation, refreshCredits } from "@/lib/api";
import { HarvestingRecord } from "@/lib/auth";

const DEFAULT_FORM = {
  current_fresh_price_lkr_per_kg: "",
  drying_cost_total_lkr: "",
  storage_cost_total_lkr: "",
  quality_loss_pct_est: "2.5",
  conversion_ratio: "4.0",
  harvest_fresh_kg: "",
  notes: "",
};

type FormState = typeof DEFAULT_FORM;

function FormField({
  label,
  name,
  value,
  onChange,
  type = "number",
  placeholder,
  hint,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-xl px-3.5 py-2.5 border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-colors resize-none"
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          step="any"
          className="w-full rounded-xl px-3.5 py-2.5 border border-gray-300 text-sm text-gray-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-colors"
        />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Info className="h-3 w-3" />{hint}</p>}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function HarvestingModal({
  record,
  onClose,
  onSaved,
}: {
  record?: HarvestingRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!record;
  const [form, setForm] = useState<FormState>(
    record
      ? {
          current_fresh_price_lkr_per_kg: String(record.current_fresh_price_lkr_per_kg),
          drying_cost_total_lkr: String(record.drying_cost_total_lkr),
          storage_cost_total_lkr: String(record.storage_cost_total_lkr),
          quality_loss_pct_est: String(record.quality_loss_pct_est),
          conversion_ratio: String(record.conversion_ratio),
          harvest_fresh_kg: record.harvest_fresh_kg ? String(record.harvest_fresh_kg) : "",
          notes: record.notes ?? "",
        }
      : DEFAULT_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      current_fresh_price_lkr_per_kg: parseFloat(form.current_fresh_price_lkr_per_kg),
      drying_cost_total_lkr: parseFloat(form.drying_cost_total_lkr),
      storage_cost_total_lkr: parseFloat(form.storage_cost_total_lkr),
      quality_loss_pct_est: parseFloat(form.quality_loss_pct_est),
      conversion_ratio: parseFloat(form.conversion_ratio),
      harvest_fresh_kg: form.harvest_fresh_kg ? parseFloat(form.harvest_fresh_kg) : null,
      notes: form.notes || null,
    };

    try {
      if (isEdit && record) {
        await api.harvesting.update(record.id, payload);
      } else {
        await api.harvesting.create(payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lift">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="font-semibold text-gray-900 uppercase tracking-tight">
            {isEdit ? "Edit Record" : "Add Harvesting Record"}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Fresh Price (LKR/kg)"
              name="current_fresh_price_lkr_per_kg"
              value={form.current_fresh_price_lkr_per_kg}
              onChange={handleChange}
              placeholder="2500"
              required
            />
            <FormField
              label="Harvest (kg)"
              name="harvest_fresh_kg"
              value={form.harvest_fresh_kg}
              onChange={handleChange}
              placeholder="100"
              hint="Optional"
            />
            <FormField
              label="Drying Cost (LKR)"
              name="drying_cost_total_lkr"
              value={form.drying_cost_total_lkr}
              onChange={handleChange}
              placeholder="15000"
              required
            />
            <FormField
              label="Storage Cost (LKR)"
              name="storage_cost_total_lkr"
              value={form.storage_cost_total_lkr}
              onChange={handleChange}
              placeholder="5000"
              required
            />
            <FormField
              label="Quality Loss (%)"
              name="quality_loss_pct_est"
              value={form.quality_loss_pct_est}
              onChange={handleChange}
              hint="Default: 2.5%"
            />
            <FormField
              label="Conversion Ratio"
              name="conversion_ratio"
              value={form.conversion_ratio}
              onChange={handleChange}
              hint="Fresh→Dry ratio, default: 4.0"
            />
          </div>

          <FormField
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            type="textarea"
            placeholder="Optional notes about this harvest..."
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors uppercase tracking-wide"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-brand-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-brand-800 disabled:opacity-60 transition-colors"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Add Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Predict Modal ─────────────────────────────────────────────────────────────

const REGIONS = ["Badulla", "Kandy", "Kegalle", "Matale", "Nuwara Eliya", "Ratnapura"];
const GRADES = ["LB", "LG", "LLG1", "LLG2"];

function PredictModal({
  record,
  onClose,
}: {
  record: HarvestingRecord;
  onClose: () => void;
}) {
  const [recommendForm, setRecommendForm] = useState({
    date: new Date().toISOString().split("T")[0],
    region: "Kandy",
    grade: "LG",
    harvest_fresh_kg: record.harvest_fresh_kg || 0,
    current_fresh_price_lkr_per_kg: record.current_fresh_price_lkr_per_kg || 0,
    drying_cost_total_lkr: record.drying_cost_total_lkr || 0,
    storage_cost_total_lkr: record.storage_cost_total_lkr || 0,
    quality_loss_pct_est: record.quality_loss_pct_est || 2.5,
    conversion_ratio: record.conversion_ratio || 4.0,
  });

  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [recommendData, setRecommendData] = useState<any>(null);
  const [error, setError] = useState("");

  const handleRecommendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRecommend(true);
    setError("");
    try {
      const data = await getMarketRecommendation(recommendForm);
      setRecommendData(data);
      refreshCredits();
    } catch (err: any) {
      setError(err.message || "Failed to get prediction.");
    } finally {
      setLoadingRecommend(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-lift">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="font-semibold text-gray-900 uppercase tracking-tight flex items-center">
            <Activity className="h-5 w-5 mr-2 text-brand-primary" /> Profit Optimizer
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleRecommendSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Date</label>
                <input
                  type="date"
                  required
                  className="w-full rounded-xl bg-white border border-gray-200 p-3 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100 text-gray-900"
                  value={recommendForm.date}
                  onChange={(e) => setRecommendForm({ ...recommendForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Region</label>
                <select
                  className="w-full rounded-xl bg-white border border-gray-200 p-3 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100 text-gray-900"
                  value={recommendForm.region}
                  onChange={(e) => setRecommendForm({ ...recommendForm, region: e.target.value })}
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Grade</label>
                <select
                  className="w-full rounded-xl bg-white border border-gray-200 p-3 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100 text-gray-900"
                  value={recommendForm.grade}
                  onChange={(e) => setRecommendForm({ ...recommendForm, grade: e.target.value })}
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingRecommend}
              className="w-full rounded-xl bg-brand-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-brand-800 transition-colors flex items-center justify-center disabled:opacity-60"
            >
              {loadingRecommend ? (
                <><Loader2 className="animate-spin mr-2 h-5 w-5" /> OPTIMIZING...</>
              ) : (
                "GET PREDICTION"
              )}
            </button>
          </form>

          {recommendData && (
            <div className="mt-8 space-y-4">
              <div className="bg-white p-6 rounded-2xl border-2 border-brand-600 shadow-card relative">
                <div className="absolute top-0 right-0 rounded-bl-xl bg-brand-600 text-white px-3 py-1 text-xs font-bold uppercase">Recommendation</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 uppercase tracking-tight">
                  {recommendData.recommendation.label.replace(/_/g, " ")}
                </h3>
                <p className="text-gray-600 mb-6 font-medium italic">"{recommendData.recommendation.message}"</p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Expected Fresh Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">Rs. {recommendData.profit_calculation.fresh_revenue_lkr?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-brand-primary text-xs font-semibold uppercase mb-1">Predicted Dried Profit</p>
                    <p className="text-lg font-semibold text-brand-primary">Rs. {recommendData.profit_calculation.predicted_dried_net_profit_lkr?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HarvestingPage() {
  const [records, setRecords] = useState<HarvestingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<HarvestingRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [predictRecord, setPredictRecord] = useState<HarvestingRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.harvesting.my();
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number) => {
    try {
      await api.harvesting.delete(id);
      setDeleteId(null);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 uppercase tracking-tight">
            Harvesting Records
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your harvest data for profit analysis.
          </p>
        </div>
        <button
          onClick={() => {
            setEditRecord(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-brand-900 text-white px-5 py-3 text-sm font-bold uppercase tracking-widest shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5"
        >
          <PlusCircle className="h-4 w-4" /> ADD RECORD
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <Sprout className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No records yet. Add your first harvesting entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {["Date", "Fresh Price", "Drying Cost", "Storage Cost", "Quality Loss", "Conv. Ratio", "Harvest (kg)", "Notes", ""].map(
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
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      Rs. {r.current_fresh_price_lkr_per_kg.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      Rs. {r.drying_cost_total_lkr.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      Rs. {r.storage_cost_total_lkr.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.quality_loss_pct_est}%</td>
                    <td className="px-4 py-3 text-gray-700">{r.conversion_ratio}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.harvest_fresh_kg ? `${r.harvest_fresh_kg} kg` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">
                      {r.notes ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPredictRecord(r)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Predict / Optimize Profit"
                        >
                          <Activity className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditRecord(r);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-emerald-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
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

      {/* Add/Edit Modal */}
      {modalOpen && (
        <HarvestingModal
          record={editRecord}
          onClose={() => {
            setModalOpen(false);
            setEditRecord(null);
          }}
          onSaved={load}
        />
      )}

      {/* Predict Modal */}
      {predictRecord !== null && (
        <PredictModal
          record={predictRecord}
          onClose={() => setPredictRecord(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white max-w-sm w-full p-6 space-y-4 rounded-2xl shadow-lift">
            <h3 className="font-semibold text-gray-900 uppercase tracking-tight">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this harvesting record? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-bold uppercase tracking-widest hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
