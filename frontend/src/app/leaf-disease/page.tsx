"use client";

import { useState } from "react";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";
import { predictLeafDisease, refreshCredits } from "@/lib/api";
import {
  Microscope,
  CheckCircle2,
  Info,
  AlertTriangle,
  Bug,
  Camera,
  Cpu,
  ClipboardCheck,
  Droplets,
  Wind,
  Sun,
  Sparkles,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import SectionHeading from "@/components/SectionHeading";
import HowItWorks from "@/components/HowItWorks";

const leafFaqs = [
  { q: "Which leaf diseases are supported?", a: "The model detects Leaf Blight (Chenthal) and Phyllosticta Leaf Spot." },
  { q: "What if it's not a cardamom leaf?", a: "The AI has a built-in validation gate. If you upload a random image — or the leaf of another crop — it will warn you that it is not a valid cardamom leaf rather than returning a diagnosis." },
  { q: "How often should I scan?", a: "We recommend scanning a random sample of leaves from different sectors of your plantation every 2 weeks during monsoon season." },
  { q: "Can it tell disease from nutrient deficiency?", a: "The model is trained on the two named fungal classes and a healthy baseline. Yellowing that does not match a disease pattern is returned as healthy with a low-confidence note — treat that as a prompt to check nutrition and drainage." },
];

const detectable = [
  {
    name: "Leaf Blight (Chenthal)",
    icon: Droplets,
    desc: "Water-soaked lesions that spread along the midrib and brown out in dry weather. Thrives in the monsoon canopy.",
    signals: ["Water-soaked edges", "Midrib spread", "Brown necrosis"],
  },
  {
    name: "Phyllosticta Leaf Spot",
    icon: Bug,
    desc: "Small oval spots with pale centres and dark margins that coalesce and tear the lamina as they age.",
    signals: ["Oval spots", "Pale centres", "Shot-hole tearing"],
  },
  {
    name: "Healthy Leaf",
    icon: CheckCircle2,
    desc: "No confident disease pattern. You still get preventive practices to keep fungal pressure down.",
    signals: ["Uniform green", "Intact lamina", "No lesions"],
  },
];

const steps = [
  {
    title: "Pick a suspect leaf",
    desc: "Sample from several sectors, not one convenient row. Include the lesion in frame.",
    icon: Camera,
  },
  {
    title: "Two-stage validation",
    desc: "A gate confirms it is a cardamom leaf and rejects other crops before classification runs.",
    icon: Cpu,
  },
  {
    title: "Apply the plan",
    desc: "Risk level, organic sprays, and canopy management advice come back with the diagnosis.",
    icon: ClipboardCheck,
  },
];

const prevention = [
  { icon: Wind, title: "Open the canopy", desc: "Thin shade trees so air moves. Stagnant humidity is what blight needs." },
  { icon: Droplets, title: "Fix the drainage", desc: "Standing water at the base multiplies fungal pressure through the wet season." },
  { icon: Sun, title: "Spray preventively", desc: "Diluted neem oil every 15–20 days keeps spot counts down before an outbreak starts." },
];

export default function LeafDisease() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInvalidLeaf = result?.predicted_class === "not_a_cardamom_leaf";
  const isHealthy = result?.predicted_class === "healthy";

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictLeafDisease(file);
      setResult(data.result);
      refreshCredits(); // update Navbar credit count
    } catch (err: any) {
      setError("Failed to analyze leaf image. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <Breadcrumb
        items={[{ label: "Services" }, { label: "Leaf Disease Analysis", href: "/leaf-disease" }]}
        title="Leaf Disease Analysis"
        description="Instant diagnostics for cardamom foliage — detect fungal infections, blight, and leaf spot before they move through the canopy."
        highlights={[
          { label: "Disease classes", value: "2 + healthy" },
          { label: "Avg. response", value: "2.1s" },
          { label: "Credits per scan", value: "20" },
        ]}
      />

      {/* ── Analyser ─────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Left: Upload */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 ring-1 ring-brand-100 mb-5">
                <Sparkles size={13} /> Step 1 — Upload
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Submit a leaf sample</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Photograph the lesion, not the whole plant. Other crop leaves are rejected
                by the validation gate before classification.
              </p>

              <ImageUpload onUpload={handleUpload} isLoading={loading} />

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                  <AlertTriangle className="mt-0.5 shrink-0" size={20} />
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {prevention.map((tip) => (
                  <div
                    key={tip.title}
                    className="rounded-2xl border border-gray-200 bg-gray-50/70 p-5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-700 ring-1 ring-brand-100">
                      <tip.icon size={16} />
                    </span>
                    <p className="mt-3 text-sm font-bold text-gray-900">{tip.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Results */}
            <div className="lg:sticky lg:top-32 rounded-3xl border border-gray-200 bg-gray-50/70 p-6 sm:p-8 shadow-card">
              <div className="flex items-center justify-between gap-4 mb-8 pb-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Diagnostic Report</h2>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-100">
                  <Microscope size={18} />
                </span>
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white ring-1 ring-brand-100">
                    <Microscope size={32} strokeWidth={1.5} className="text-brand-400" />
                  </span>
                  <p className="text-lg font-semibold text-gray-700">
                    No sample analysed yet
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-gray-500">
                    Submit a leaf sample for deep learning analysis and a treatment plan.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="h-16 w-16 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
                    Scanning foliage
                  </p>
                  <div className="w-full max-w-xs space-y-2">
                    <div className="h-3 skeleton rounded-full" />
                    <div className="h-3 w-4/5 skeleton rounded-full" />
                    <div className="h-3 w-3/5 skeleton rounded-full" />
                  </div>
                </div>
              )}

              {result && isInvalidLeaf && (
                <div className="space-y-6 animate-fade-up">
                  <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700 mb-1.5">
                        Invalid Image
                      </p>
                      <p className="text-2xl font-bold text-yellow-800">
                        Not a Cardamom Leaf
                      </p>
                    </div>
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
                      <AlertTriangle size={26} />
                    </span>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500 mb-3">
                      What happened
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {result.message || result.recommendation?.farmer_action}
                    </p>
                  </div>
                </div>
              )}

              {result && !isInvalidLeaf && (
                <div className="space-y-6 animate-fade-up">
                  {/* Diagnosis */}
                  <div
                    className={`flex items-center justify-between gap-4 rounded-2xl border-2 p-6 ${
                      isHealthy
                        ? "border-brand-200 bg-brand-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 mb-1.5">
                        Diagnosis
                      </p>
                      <p
                        className={`text-2xl font-bold capitalize ${
                          isHealthy ? "text-brand-800" : "text-red-700"
                        }`}
                      >
                        {result.predicted_class.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        isHealthy
                          ? "bg-brand-100 text-brand-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isHealthy ? <CheckCircle2 size={26} /> : <Bug size={26} />}
                    </span>
                  </div>

                  {/* Probabilities */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-5">
                      Probability Distribution
                    </p>
                    <div className="space-y-4">
                      {Object.entries(result.probabilities || {}).map(
                        ([name, prob]: [string, any]) => {
                          const isTop = name === result.predicted_class;
                          return (
                            <div key={name}>
                              <div className="mb-1.5 flex justify-between text-sm">
                                <span
                                  className={`font-semibold capitalize ${
                                    isTop ? "text-gray-900" : "text-gray-500"
                                  }`}
                                >
                                  {name.replace(/_/g, " ")}
                                </span>
                                <span
                                  className={`font-bold ${
                                    isTop ? "text-brand-700" : "text-gray-400"
                                  }`}
                                >
                                  {typeof prob === "number" ? prob.toFixed(2) : prob}%
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    isTop ? "bg-brand-600" : "bg-gray-300"
                                  }`}
                                  style={{ width: `${prob}%` }}
                                />
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {result.recommendation && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <Info size={16} />
                        </span>
                        Treatment &amp; Recommendations
                      </h3>

                      <div className="space-y-5">
                        {result.recommendation.risk_level && (
                          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <span className="text-sm font-semibold text-gray-500">
                              Risk Level
                            </span>
                            <span
                              className={`rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white ${
                                result.recommendation.risk_level === "High"
                                  ? "bg-red-600"
                                  : result.recommendation.risk_level === "Medium"
                                    ? "bg-spice-500"
                                    : result.recommendation.risk_level === "Low"
                                      ? "bg-brand-600"
                                      : "bg-gray-400"
                              }`}
                            >
                              {result.recommendation.risk_level}
                            </span>
                          </div>
                        )}

                        {result.recommendation.farmer_action && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                              Immediate Action
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                              {result.recommendation.farmer_action}
                            </p>
                          </div>
                        )}

                        {result.recommendation.organic_solutions?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-3">
                              Organic Solutions
                            </p>
                            <ul className="space-y-2.5">
                              {result.recommendation.organic_solutions.map(
                                (sol: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">
                                      {idx + 1}
                                    </span>
                                    <span className="text-sm leading-relaxed text-gray-700">
                                      {sol}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {result.recommendation.note && (
                          <p className="rounded-xl border-l-4 border-brand-500 bg-brand-50/70 p-4 text-sm text-gray-600">
                            <span className="font-bold text-brand-800">Note: </span>
                            {result.recommendation.note}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── What we detect ───────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Coverage"
            title="What the foliage model looks for"
            description="Two fungal classes plus a healthy baseline, each with the visual signals the model keys on."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {detectable.map((d) => (
              <div
                key={d.name}
                className="rounded-2xl border border-gray-200 bg-white p-7 shadow-soft card-hover hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lift"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <d.icon size={22} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{d.name}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{d.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {d.signals.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <HowItWorks
        steps={steps}
        title="Two gates before any diagnosis"
        description="Validation first, classification second — so a photo of the wrong crop never becomes a confident wrong answer."
      />

      {/* ── Monsoon protocol ─────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Monsoon protocol"
                title="Blight is a humidity problem before it is a spray problem"
                description="Fungicide is the last lever, not the first. Most blight outbreaks trace back to canopy density and drainage — fix those and the spray programme gets far cheaper."
              />
              <ul className="mt-8 space-y-5">
                {[
                  {
                    t: "Scan fortnightly through the wet season",
                    d: "Weekly if you have had blight in the block before.",
                  },
                  {
                    t: "Sample across elevations",
                    d: "Lower, wetter sectors show pressure first — start there.",
                  },
                  {
                    t: "Remove and burn infected leaves",
                    d: "Do not compost them near the plantation; spores survive.",
                  },
                  {
                    t: "Track over the season",
                    d: "Log every scan against the block to see whether pressure is climbing.",
                  },
                ].map((item) => (
                  <li key={item.t} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
                      <CheckCircle2 size={15} />
                    </span>
                    <span>
                      <span className="block font-bold text-gray-900">{item.t}</span>
                      <span className="block text-gray-600 leading-relaxed">{item.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative order-first lg:order-last">
              <div className="absolute -inset-4 rounded-[2.25rem] bg-brand-50/70 -z-10" />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-brand-100 shadow-card">
                <Image
                  src="/about-us.png"
                  alt="Cardamom plantation canopy"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection items={leafFaqs} eyebrow="Foliage diagnostics" />
      <CtaSection />
    </div>
  );
}
