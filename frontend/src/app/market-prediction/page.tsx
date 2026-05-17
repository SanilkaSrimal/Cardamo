"use client";

import { useState } from "react";
import Image from "next/image";
import { predictMarketPrice, getMarketRecommendation, refreshCredits } from "@/lib/api";
import {
  TrendingUp,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Loader2,
  Sparkles,
  CalendarRange,
  MapPin,
  Coins,
  Warehouse,
  LineChart,
  Cpu,
  ClipboardCheck,
  CheckCircle2,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import SectionHeading from "@/components/SectionHeading";
import HowItWorks from "@/components/HowItWorks";

const marketFaqs = [
  { q: "Where does the market data come from?", a: "Predictions are based on historical auction prices, seasonal harvest trends, and current global supply constraints." },
  { q: "How accurate are the price forecasts?", a: "Our 4-week forecasts are highly accurate for general trends, but exact daily prices will fluctuate based on local auction dynamics." },
  { q: "Should I hold or sell?", a: "The AI provides a recommendation based on data, but you should always consider your own cash flow needs and storage capabilities." },
  { q: "What does the conversion ratio mean?", a: "It is how many kilograms of fresh cardamom produce one kilogram of dried. A 4:1 ratio means 100 kg fresh yields roughly 25 kg dried — the single biggest lever in the profit calculation, so use your own measured figure rather than the default." },
];

const REGIONS = ["Badulla", "Kandy", "Kegalle", "Matale", "Nuwara Eliya", "Ratnapura"];
const GRADES = ["LB", "LG", "LLG1", "LLG2"];

const formatMoney = (value?: number | null) =>
  typeof value === "number"
    ? value.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "--";

const steps = [
  {
    title: "Pick region & grade",
    desc: "Choose the auction market and grade you actually sell into.",
    icon: MapPin,
  },
  {
    title: "Model forecasts price",
    desc: "The dried price four weeks out is projected from history, season, and supply.",
    icon: Cpu,
  },
  {
    title: "Sell fresh or dry & store",
    desc: "Feed in your costs and the optimizer returns the more profitable route.",
    icon: ClipboardCheck,
  },
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
const labelClass =
  "block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 mb-2";

export default function MarketPrediction() {
  const [priceData, setPriceData] = useState<any>(null);
  const [recommendData, setRecommendData] = useState<any>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingRecommend, setLoadingRecommend] = useState(false);

  // Price Form State
  const [priceForm, setPriceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    region: "Kandy",
    grade: "LG"
  });

  // Recommend Form State
  const [recommendForm, setRecommendForm] = useState({
    date: new Date().toISOString().split('T')[0],
    region: "Kandy",
    grade: "LG",
    harvest_fresh_kg: 100,
    current_fresh_price_lkr_per_kg: 1450,
    drying_cost_total_lkr: 18000,
    storage_cost_total_lkr: 6000,
    quality_loss_pct_est: 2.5,
    conversion_ratio: 4.0
  });

  // Change between the current market price and the 4-week predicted dried price
  const priceDelta = (() => {
    const current = priceData?.current_dried_price_lkr_per_kg;
    const predicted = priceData?.predicted_dried_price_next_4w_lkr_per_kg;
    if (typeof current !== "number" || typeof predicted !== "number" || current === 0) return null;
    const amount = predicted - current;
    return { up: amount >= 0, amount: Math.abs(amount), pct: Math.abs(amount / current) * 100 };
  })();

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPrice(true);
    try {
      const data = await predictMarketPrice(priceForm);
      setPriceData(data);
      refreshCredits(); // update Navbar credit count
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleRecommendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingRecommend(true);
    try {
      const data = await getMarketRecommendation(recommendForm);
      setRecommendData(data);
      refreshCredits(); // update Navbar credit count
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecommend(false);
    }
  };

  return (
    <div className="bg-white">
      <Breadcrumb
        items={[{ label: "Services" }, { label: "Market Prediction", href: "/market-prediction" }]}
        title="Market Intelligence"
        description="Data-driven forecasting and profit optimization for the spice trade — know the dried price four weeks out before you decide to sell."
        highlights={[
          { label: "Forecast horizon", value: "4 weeks" },
          { label: "Regions covered", value: "6" },
          { label: "Grades tracked", value: "4" },
        ]}
      />

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 xl:gap-12">

            {/* ── Section 1: Price Prediction ───────────────────── */}
            <div className="space-y-8">
              <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 sm:p-8 shadow-card">
                <div className="mb-7 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-100">
                    <TrendingUp size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Price Forecasting</h2>
                    <p className="text-sm text-gray-500">Dried price, four weeks ahead</p>
                  </div>
                </div>

                <form onSubmit={handlePriceSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Target Date</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={priceForm.date}
                        onChange={(e) => setPriceForm({...priceForm, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Region</label>
                      <select
                        className={inputClass}
                        value={priceForm.region}
                        onChange={(e) => setPriceForm({...priceForm, region: e.target.value})}
                      >
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Grade</label>
                      <select
                        className={inputClass}
                        value={priceForm.grade}
                        onChange={(e) => setPriceForm({...priceForm, grade: e.target.value})}
                      >
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loadingPrice}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-4 font-bold uppercase tracking-[0.14em] text-white shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loadingPrice ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Forecasting</>
                    ) : (
                      <>Predict Price <ArrowUpRight className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              </div>

              {priceData && (
                <div className="relative overflow-hidden rounded-3xl mesh-emerald p-8 text-white shadow-lift animate-fade-up">
                  <div className="absolute inset-0 grid-lines opacity-50" />
                  <TrendingUp
                    className="absolute -top-4 -right-4 text-white/5"
                    size={150}
                    strokeWidth={1}
                  />

                  <div className="relative">
                    <div className="mb-8 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-300 mb-1.5">
                          Forecast Result
                        </p>
                        <h3 className="text-3xl font-bold">
                          {priceData.grade} · {priceData.region}
                        </h3>
                        <p className="mt-2 text-xs text-brand-200/70">
                          Market data as of {priceData.used_market_date}
                        </p>
                      </div>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                        <LineChart size={20} className="text-brand-300" />
                      </span>
                    </div>

                    {/* Highlighted headline: predicted dried price */}
                    <div className="rounded-2xl bg-brand-400/10 p-6 ring-1 ring-brand-400/40">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
                        Predicted Dried Price (Next {priceData.horizon_weeks ?? 4} Weeks)
                      </p>
                      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                        <p className="text-4xl sm:text-5xl font-bold leading-none text-brand-300 tracking-tight">
                          Rs. {formatMoney(priceData.predicted_dried_price_next_4w_lkr_per_kg)}
                        </p>
                        <span className="pb-1 text-sm font-medium text-brand-200">per kg</span>
                      </div>
                      {priceDelta && (
                        <div
                          className={`mt-5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold ${
                            priceDelta.up
                              ? "bg-brand-400 text-brand-950"
                              : "bg-red-400 text-red-950"
                          }`}
                        >
                          {priceDelta.up ? (
                            <ArrowUpRight size={15} />
                          ) : (
                            <ArrowDownRight size={15} />
                          )}
                          {priceDelta.up ? "+" : "-"}Rs. {formatMoney(priceDelta.amount)} (
                          {priceDelta.pct.toFixed(2)}%)
                        </div>
                      )}
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-6">
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-300/70">
                        Current Market Price
                      </p>
                      <p className="text-2xl font-bold">
                        Rs. {formatMoney(priceData.current_dried_price_lkr_per_kg)}
                        <span className="ml-2 text-sm font-medium text-brand-200/70">per kg</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!priceData && (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 py-14 text-center">
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-400">
                    <CalendarRange size={26} strokeWidth={1.5} />
                  </span>
                  <p className="font-semibold text-gray-700">No forecast run yet</p>
                  <p className="mt-1.5 max-w-xs text-sm text-gray-500">
                    Pick a date, region, and grade to see the projected dried price.
                  </p>
                </div>
              )}
            </div>

            {/* ── Section 2: Recommendation ─────────────────────── */}
            <div className="space-y-8">
              <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 sm:p-8 shadow-card">
                <div className="mb-7 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-spice-600 ring-1 ring-spice-200">
                    <Calculator size={20} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Profit Optimizer</h2>
                    <p className="text-sm text-gray-500">Sell fresh, or dry and store?</p>
                  </div>
                </div>

                <form onSubmit={handleRecommendSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Date</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={recommendForm.date}
                        onChange={(e) => setRecommendForm({...recommendForm, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Region</label>
                      <select
                        className={inputClass}
                        value={recommendForm.region}
                        onChange={(e) => setRecommendForm({...recommendForm, region: e.target.value})}
                      >
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Grade</label>
                      <select
                        className={inputClass}
                        value={recommendForm.grade}
                        onChange={(e) => setRecommendForm({...recommendForm, grade: e.target.value})}
                      >
                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Harvest (Fresh kg)</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={recommendForm.harvest_fresh_kg}
                        onChange={(e) => setRecommendForm({...recommendForm, harvest_fresh_kg: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Fresh Price (per kg)</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={recommendForm.current_fresh_price_lkr_per_kg}
                        onChange={(e) => setRecommendForm({...recommendForm, current_fresh_price_lkr_per_kg: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Drying Cost (Total LKR)</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={recommendForm.drying_cost_total_lkr}
                        onChange={(e) => setRecommendForm({...recommendForm, drying_cost_total_lkr: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Storage Cost (Total LKR)</label>
                      <input
                        type="number"
                        className={inputClass}
                        value={recommendForm.storage_cost_total_lkr}
                        onChange={(e) => setRecommendForm({...recommendForm, storage_cost_total_lkr: Number(e.target.value)})}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Conversion Ratio (Fresh:Dried)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={inputClass}
                        value={recommendForm.conversion_ratio}
                        onChange={(e) => setRecommendForm({...recommendForm, conversion_ratio: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingRecommend}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-4 font-bold uppercase tracking-[0.14em] text-white shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {loadingRecommend ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Optimizing</>
                    ) : (
                      <>Optimize Profit <Coins className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              </div>

              {recommendData && (
                <div className="space-y-5 animate-fade-up">
                  <div className="relative overflow-hidden rounded-3xl border-2 border-brand-600 bg-white p-7 sm:p-8 shadow-card">
                    <span className="absolute top-0 right-0 rounded-bl-2xl bg-brand-600 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                      Recommendation
                    </span>

                    <h3 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 capitalize">
                      {recommendData.recommendation.label.replace(/_/g, ' ').toLowerCase()}
                    </h3>
                    <p className="mt-3 mb-7 italic leading-relaxed text-gray-600">
                      &ldquo;{recommendData.recommendation.message}&rdquo;
                    </p>

                    {/* Highlighted: predicted dried price driving this recommendation */}
                    <div className="relative overflow-hidden rounded-2xl mesh-emerald p-6 text-white">
                      <div className="absolute inset-0 grid-lines opacity-50" />
                      <div className="relative">
                        <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
                          Predicted Dried Price (Next{" "}
                          {recommendData.market_prediction?.horizon_weeks ?? 4} Weeks)
                        </p>
                        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                          <p className="text-3xl sm:text-4xl font-bold leading-none text-brand-300 tracking-tight">
                            Rs.{" "}
                            {formatMoney(
                              recommendData.market_prediction
                                ?.predicted_dried_price_next_4w_lkr_per_kg
                            )}
                          </p>
                          <span className="pb-0.5 text-sm font-medium text-brand-200">
                            per kg
                          </span>
                        </div>
                        <p className="mt-3.5 text-xs text-brand-200/70">
                          Current market price: Rs.{" "}
                          {formatMoney(
                            recommendData.market_prediction?.current_dried_price_lkr_per_kg
                          )}{" "}
                          per kg · {recommendData.market_prediction?.grade} —{" "}
                          {recommendData.market_prediction?.region}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5">
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                          Expected Fresh Revenue
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          Rs. {formatMoney(recommendData.profit_calculation.fresh_revenue_lkr)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-brand-200 bg-brand-50/70 p-5">
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                          Predicted Dried Profit
                        </p>
                        <p className="text-xl font-bold text-brand-800">
                          Rs.{" "}
                          {formatMoney(
                            recommendData.profit_calculation.predicted_dried_net_profit_lkr
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl border border-brand-200 bg-brand-50/70 p-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700">
                      <Info size={18} />
                    </span>
                    <p className="text-sm leading-relaxed text-brand-900">
                      Based on your conversion ratio of{" "}
                      <strong>{recommendForm.conversion_ratio}:1</strong>, drying is predicted
                      to yield a profit difference of{" "}
                      <strong>
                        Rs.{" "}
                        {formatMoney(
                          recommendData.profit_calculation.predicted_profit_difference_lkr
                        )}
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              )}

              {!recommendData && (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 py-14 text-center">
                  <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-spice-50 text-spice-400">
                    <Warehouse size={26} strokeWidth={1.5} />
                  </span>
                  <p className="font-semibold text-gray-700">No optimization run yet</p>
                  <p className="mt-1.5 max-w-xs text-sm text-gray-500">
                    Enter your harvest and cost figures to compare selling fresh against
                    drying and storing.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <HowItWorks
        steps={steps}
        title="Turn a price guess into a decision"
        eyebrow="How it works"
        description="The forecast alone is interesting. Paired with your real costs, it becomes an answer."
        className="border-t border-gray-100 bg-gray-50/70"
      />

      {/* ── Coverage ─────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Market coverage"
                title="Six regions, four grades, one forecast horizon"
                description="Prices are modelled per region and grade, because a Kandy LG lot and a Ratnapura LLG2 lot do not move together."
              />

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {REGIONS.map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3"
                  >
                    <MapPin size={14} className="shrink-0 text-brand-600" />
                    <span className="text-sm font-semibold text-gray-700">{r}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {GRADES.map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-bold text-brand-700 ring-1 ring-brand-100"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <ul className="mt-9 space-y-4">
                {[
                  "Forecasts run on the most recent auction data on or before your target date",
                  "The optimizer accounts for drying loss, storage cost, and quality degradation",
                  "Recommendations use a materiality threshold, so marginal differences return HOLD",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <CheckCircle2 size={13} />
                    </span>
                    <span className="leading-relaxed text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.25rem] bg-brand-50/70 -z-10" />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-brand-100 shadow-card">
                <Image
                  src="/cardamom-grading.png"
                  alt="Cardamom prepared for market"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-6 rounded-2xl bg-white px-5 py-4 shadow-lift ring-1 ring-brand-100">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Sparkles size={18} />
                  </span>
                  <div>
                    <p className="text-lg font-bold leading-none text-gray-900">4 weeks</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Forecast horizon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection items={marketFaqs} eyebrow="Market intelligence" />
      <CtaSection />
    </div>
  );
}
