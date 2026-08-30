"use client";

import { useState } from "react";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";
import { predictGrading, refreshCredits } from "@/lib/api";
import {
  Star,
  Info,
  AlertTriangle,
  Award,
  Ruler,
  Palette,
  ShieldCheck,
  Camera,
  Cpu,
  ClipboardCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import SectionHeading from "@/components/SectionHeading";
import HowItWorks from "@/components/HowItWorks";

const gradingFaqs = [
  { q: "What grading standards do you use?", a: "Our AI grades against the General Cardamom Trade Association standards, including AGEB, AGB, AGS, and Lanka Light Green variants." },
  { q: "Does the AI measure size?", a: "Yes, the AI analyzes relative size, color uniformity, and surface defects to assign the correct quality tier." },
  { q: "Can I grade dried cardamom?", a: "Yes, the model is primarily trained on cured/dried cardamom pods ready for market." },
  { q: "Is the grade accepted by buyers?", a: "The grade maps to recognised trade codes, which makes it a strong negotiating reference. It complements, rather than replaces, a buyer's own inspection — moisture and aroma still need physical assessment." },
];

const criteria = [
  {
    name: "Size & Uniformity",
    icon: Ruler,
    desc: "Relative capsule dimensions and how consistent they are across the sample decide the base tier.",
  },
  {
    name: "Colour Grade",
    icon: Palette,
    desc: "Deep, even green commands the premium. Bleaching and mottling drop a batch a tier at auction.",
  },
  {
    name: "Physical Integrity",
    icon: ShieldCheck,
    desc: "Splits, insect damage, and surface scarring are detected and factored into the final rank.",
  },
];

const tiers = [
  { code: "AGEB", label: "Alleppey Green Extra Bold", tone: "premium" },
  { code: "AGB", label: "Alleppey Green Bold", tone: "high" },
  { code: "AGS", label: "Alleppey Green Superior", tone: "standard" },
  { code: "LLG", label: "Lanka Light Green", tone: "commercial" },
];

const steps = [
  {
    title: "Lay out the sample",
    desc: "Spread a representative handful on a plain surface in even light.",
    icon: Camera,
  },
  {
    title: "Vision model grades",
    desc: "Size, colour, and integrity are scored and mapped to a trade standard code.",
    icon: Cpu,
  },
  {
    title: "Negotiate with evidence",
    desc: "Take the certificate to auction with an explainable summary of the grade.",
    icon: ClipboardCheck,
  },
];

export default function Grading() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictGrading(file);
      setResult(data);
      refreshCredits(); // update Navbar credit count
    } catch (err: any) {
      setError("Failed to grade sample. Ensure the image is clear and centered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <Breadcrumb
        items={[{ label: "Services" }, { label: "Quality Grading", href: "/grading" }]}
        title="Quality Grading"
        description="Automated classification against international cardamom standards — size, colour, and integrity scored the same way every time, for every batch."
        highlights={[
          { label: "Trade tiers", value: "4 grades" },
          { label: "Avg. response", value: "2.6s" },
          { label: "Credits per scan", value: "20" },
        ]}
      />

      {/* ── Analyser ─────────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Left: Upload */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-spice-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-spice-600 ring-1 ring-spice-200 mb-5">
                <Sparkles size={13} /> Step 1 — Sample
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Submit a batch sample</h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                Spread a representative handful on a plain surface. The model assesses size,
                colour uniformity, and surface defects to assign a premium grade.
              </p>

              <ImageUpload onUpload={handleUpload} isLoading={loading} />

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                  <AlertTriangle className="mt-0.5 shrink-0" size={20} />
                  <p className="font-semibold">{error}</p>
                  
                </div>
              )}

              {result?.xai?.summary && (
                <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/70 p-6 animate-fade-up">
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                    <Sparkles size={13} /> AI Analysis Summary
                  </p>
                  <p className="leading-relaxed text-brand-900">{result.xai.summary}</p>
                </div>
              )}

              {/* Grading criteria */}
              <div className="mt-8 space-y-3">
                {criteria.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-100">
                      <c.icon size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{c.name}</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-500">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Certificate */}
            <div className="lg:sticky lg:top-32 rounded-3xl border border-gray-200 bg-gray-50/70 p-6 sm:p-8 shadow-card">
              <div className="flex items-center justify-between gap-4 mb-8 pb-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Quality Certificate</h2>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-spice-600 ring-1 ring-spice-200">
                  <Award size={18} />
                </span>
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white ring-1 ring-spice-200">
                    <Award size={32} strokeWidth={1.5} className="text-spice-400" />
                  </span>
                  <p className="text-lg font-semibold text-gray-700">No batch certified yet</p>
                  <p className="mt-2 max-w-xs text-sm text-gray-500">
                    Place a batch sample for automated quality certification.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="h-16 w-16 rounded-full border-4 border-spice-100 border-t-spice-500 animate-spin" />
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-spice-600">
                    Grading sample
                  </p>
                  <div className="w-full max-w-xs space-y-2">
                    <div className="h-3 skeleton rounded-full" />
                    <div className="h-3 w-4/5 skeleton rounded-full" />
                    <div className="h-3 w-3/5 skeleton rounded-full" />
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-fade-up">
                  {/* Certificate hero */}
                  <div className="relative overflow-hidden rounded-3xl mesh-emerald p-8 text-center text-white shadow-lift">
                    <div className="absolute inset-0 grid-lines opacity-50" />
                    <Star
                      className="absolute -top-4 -right-4 text-white/5"
                      size={140}
                      strokeWidth={1}
                    />
                    <div className="relative">
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-300">
                        Certified Quality
                      </p>
                      <h3 className={`mt-3 font-bold tracking-tight break-words ${
                        result.grade?.length > 5 ? 'text-2xl sm:text-3xl' : 'text-5xl'
                      }`}>
                        {result.grade ? result.grade.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : ''}
                      </h3>
                      {/* {typeof result.confidence === "number" && (
                        <>
                          <p className="mt-3 text-sm text-brand-200">
                            Confidence score {result.confidence.toFixed(2)}%
                          </p>
                          <div className="mx-auto mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
                            <div
                              className="h-full rounded-full bg-brand-400 transition-all duration-700"
                              style={{ width: `${Math.min(result.confidence, 100)}%` }}
                            />
                          </div>
                        </>
                      )} */}
                    </div>
                  </div>

                  {result.standard_grade && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-1.5">
                            Standard Code
                          </p>
                          <p className="text-2xl font-bold text-brand-800">
                            {result.standard_grade.standard_code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-1.5">
                            Quality Rank
                          </p>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-spice-50 px-3.5 py-1.5 text-sm font-bold text-spice-600 ring-1 ring-spice-200">
                            <Star size={13} className="fill-spice-400 text-spice-400" />
                            Tier {result.standard_grade.quality_rank}
                          </span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                          Market Classification
                        </p>
                        <p className="font-bold text-gray-900">
                          {result.standard_grade.market_tier}
                        </p>
                        <p className="mt-2 leading-relaxed text-gray-600">
                          {result.standard_grade.description}
                        </p>
                      </div>

                      {result.standard_grade.typical_traits?.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-3">
                            Typical Traits
                          </p>
                          <ul className="space-y-2.5">
                            {result.standard_grade.typical_traits.map(
                              (trait: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                                  <span className="text-sm leading-relaxed text-gray-700">
                                    {trait}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {result.estimated_size && (
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-1.5">
                          Estimated Size
                        </p>
                        <p className="text-2xl font-bold text-brand-800">
                          {result.estimated_size}
                        </p>
                      </div>
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <Ruler size={20} />
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-4 rounded-2xl border-2 border-dashed border-gray-300 p-5">
                    <Info className="mt-0.5 shrink-0 text-gray-400" size={20} />
                    <p className="text-sm leading-relaxed text-gray-500">
                      This grading is based on visual characteristics and follows the General
                      Cardamom Trade Association guidelines. Final value may vary with
                      moisture content and aroma profile.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Grade ladder ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Trade standards"
            title="The grade ladder your buyers use"
            description="Every result maps to a recognised trade code, so the certificate means the same thing to you and to the auction floor."
          />

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((t, i) => (
              <div
                key={t.code}
                className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 shadow-soft card-hover hover:-translate-y-1.5 hover:border-spice-300 hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{t.code}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 4 - i }).map((_, s) => (
                      <Star
                        key={s}
                        size={13}
                        className="fill-spice-400 text-spice-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{t.label}</p>
                <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-spice-400 to-spice-600"
                    style={{ width: `${100 - i * 20}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Tier {i + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <HowItWorks
        steps={steps}
        title="Certify a batch in three moves"
        description="Consistent grading turns a negotiation into a conversation about price, not about quality."
      />

      {/* ── Why it matters ───────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.25rem] bg-spice-50 -z-10" />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-spice-200 shadow-card">
                <Image
                  src="/cardamom-grading.png"
                  alt="Graded cardamom batch"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 right-6 rounded-2xl bg-white px-5 py-4 shadow-lift ring-1 ring-spice-200">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-spice-50 text-spice-600">
                    <TrendingUp size={18} />
                  </span>
                  <div>
                    <p className="text-lg font-bold leading-none text-gray-900">+18%</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Avg. price lift
                    </p>
                    
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeading
                align="left"
                eyebrow="Why grading pays"
                title="Stop losing a tier to a subjective glance"
                description="Manual grading varies by inspector, by light, and by mood. When every batch is scored the same way, the tier you claim is the tier you can defend."
              />
              <ul className="mt-8 space-y-5">
                {[
                  {
                    t: "One standard, every batch",
                    d: "The same criteria applied identically to the first lot and the hundredth.",
                  },
                  {
                    t: "Explainable results",
                    d: "The AI summary states what drove the grade, so you can show your working.",
                  },
                  {
                    t: "Sort before you ship",
                    d: "Grade at the drying shed and separate tiers before they get mixed into one lot.",
                  },
                ].map((item) => (
                  <li key={item.t} className="flex items-start gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-spice-500 text-white">
                      <Star size={14} className="fill-white" />
                    </span>
                    <span>
                      <span className="block font-bold text-gray-900">{item.t}</span>
                      <span className="block text-gray-600 leading-relaxed">{item.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <FaqSection items={gradingFaqs} eyebrow="Grading & certification" />
     
      <CtaSection />
    </div>
  );
}
