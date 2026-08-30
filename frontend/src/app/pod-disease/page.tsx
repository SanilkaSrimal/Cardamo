"use client";

import { useState } from "react";
import Image from "next/image";
import ImageUpload from "@/components/ImageUpload";
import { predictPodDisease, refreshCredits } from "@/lib/api";
import {
  ShieldAlert,
  CheckCircle2,
  Info,
  AlertTriangle,
  Bug,
  Camera,
  Cpu,
  ClipboardCheck,
  Sun,
  Focus,
  Crop,
  Leaf,
  Sparkles,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import SectionHeading from "@/components/SectionHeading";
import HowItWorks from "@/components/HowItWorks";

const podFaqs = [
  { q: "What pod diseases can be detected?", a: "Currently, our AI is trained to detect Capsule Borer and Cardamom Thrips with high accuracy." },
  { q: "How should I photograph the pod?", a: "Place the pod on a plain background, ensure good lighting, and make sure the affected area (like borer holes) is visible." },
  { q: "Are the organic solutions effective?", a: "The recommended organic treatments are based on standard agricultural practices, but severe infestations may require integrated pest management." },
  { q: "Why did it say my photo is not a cardamom pod?", a: "Every upload passes an image-validation gate before the disease model runs. If the photo does not clearly contain a cardamom pod, we stop there and tell you, rather than returning a confident-looking but meaningless diagnosis." },
];

const detectable = [
  {
    name: "Capsule Borer",
    icon: Bug,
    desc: "Larvae bore into developing capsules and hollow the seeds. Look for pinhole entry wounds and frass around the stalk.",
    signals: ["Entry holes", "Frass deposits", "Hollow capsules"],
  },
  {
    name: "Cardamom Thrips",
    icon: Leaf,
    desc: "Rasping damage scars the capsule surface, producing corky patches that downgrade the batch at auction.",
    signals: ["Corky scarring", "Silvered patches", "Malformed pods"],
  },
  {
    name: "Healthy Pod",
    icon: CheckCircle2,
    desc: "No confident disease pattern detected. You still get preventive guidance to keep the block clean.",
    signals: ["Uniform colour", "Intact surface", "Full capsules"],
  },
];

const steps = [
  {
    title: "Photograph the pod",
    desc: "Plain background, daylight if possible, damaged area clearly in frame.",
    icon: Camera,
  },
  {
    title: "AI validates & classifies",
    desc: "The image gate confirms it is a cardamom pod, then the disease model runs.",
    icon: Cpu,
  },
  {
    title: "Treat the block",
    desc: "Follow the risk level and organic treatment plan returned with the diagnosis.",
    icon: ClipboardCheck,
  },
];

const captureTips = [
  { icon: Sun, title: "Even lighting", desc: "Shoot in shade or diffused daylight. Direct flash blows out surface texture." },
  { icon: Focus, title: "Sharp focus", desc: "Tap to focus on the capsule. Motion blur hides the borer entry wounds." },
  { icon: Crop, title: "Fill the frame", desc: "One or two pods filling most of the frame beats a wide shot of the whole plant." },
];

export default function PodDisease() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The backend returns three distinct outcomes, not two: the image-gate can
  // reject the upload before the disease model ever runs.
  const isInvalidPod = result?.predicted_class === "not_a_cardamom_pod";
  const hasDisease = !isInvalidPod && !!result?.disease_detected;

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictPodDisease(file);
      setResult(data);
      refreshCredits(); // update Navbar credit count
    } catch (err: any) {
      setError("Failed to analyze image. Please ensure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <Breadcrumb
        items={[{ label: "Services" }, { label: "Pod Disease Analysis", href: "/pod-disease" }]}
        title="Pod Disease Detection"
        description="Upload a clear photo of a cardamom pod to identify capsule borer, thrips, and other pod-specific pathologies — with an organic treatment plan attached."
        highlights={[
          { label: "Model accuracy", value: "98.7%" },
          { label: "Avg. response", value: "2.4s" },
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
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Submit a pod sample
              </h2>
              <p className="text-gray-600 leading-relaxed mb-8">
                One clear photo is all the model needs. Images that are not cardamom pods
                are flagged instead of diagnosed.
              </p>

              <ImageUpload onUpload={handleUpload} isLoading={loading} />

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                  <AlertTriangle className="mt-0.5 shrink-0" size={20} />
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              {/* Capture tips */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {captureTips.map((tip) => (
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
                <h2 className="text-xl font-bold text-gray-900">Analysis Result</h2>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-100">
                  <ShieldAlert size={18} />
                </span>
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white ring-1 ring-brand-100">
                    <Info size={32} strokeWidth={1.5} className="text-brand-400" />
                  </span>
                  <p className="text-lg font-semibold text-gray-700">
                    No sample analysed yet
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-gray-500">
                    Upload an image to see the AI diagnostic report, risk level, and
                    treatment plan.
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="h-16 w-16 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">
                    Processing image
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
                  {/* Status */}
                  <div
                    className={`flex items-center justify-between gap-4 rounded-2xl border-2 p-6 ${
                      isInvalidPod
                        ? "border-yellow-200 bg-yellow-50"
                        : hasDisease
                          ? "border-red-200 bg-red-50"
                          : "border-brand-200 bg-brand-50"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-xs font-bold uppercase tracking-[0.18em] mb-1.5 ${
                          isInvalidPod ? "text-yellow-700" : "text-gray-500"
                        }`}
                      >
                        {isInvalidPod ? "Invalid Image" : "Status"}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          isInvalidPod
                            ? "text-yellow-800"
                            : hasDisease
                              ? "text-red-700"
                              : "text-brand-800"
                        }`}
                      >
                        {isInvalidPod
                          ? "Not a Cardamom Pod"
                          : hasDisease
                            ? "Disease Detected"
                            : "Healthy Pod"}
                      </p>
                    </div>
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        isInvalidPod
                          ? "bg-yellow-100 text-yellow-700"
                          : hasDisease
                            ? "bg-red-100 text-red-600"
                            : "bg-brand-100 text-brand-700"
                      }`}
                    >
                      {isInvalidPod ? (
                        <AlertTriangle size={26} />
                      ) : hasDisease ? (
                        <ShieldAlert size={26} />
                      ) : (
                        <CheckCircle2 size={26} />
                      )}
                    </span>
                  </div>

                  {isInvalidPod && result.message && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-gray-500 mb-3">
                        What happened
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{result.message}</p>
                    </div>
                  )}

                  {result.predicted_class && !isInvalidPod && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                          Predicted Issue
                        </p>
                        <p className="text-lg font-bold text-gray-900 capitalize leading-snug">
                          {result.predicted_class.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 bg-white p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400 mb-2">
                          Confidence
                        </p>
                        <p className="text-3xl font-bold text-brand-700 leading-none">
                          {result.confidence_percent?.toFixed(1)}%
                        </p>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all duration-700"
                            style={{ width: `${Math.min(result.confidence_percent ?? 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {result.recommendation && (
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-gray-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <ShieldAlert size={16} />
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
            title="What the pod model looks for"
            description="Two trained disease classes plus a healthy baseline — each with the visual signals the model keys on."
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
        title="From photo to treatment plan"
        description="The whole loop takes under a minute in the field."
      />

      {/* ── Field guidance ───────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.25rem] bg-brand-50/70 -z-10" />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-brand-100 shadow-card">
                <Image
                  src="/farmer-app.png"
                  alt="Inspecting cardamom pods in the field"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <SectionHeading
                align="left"
                eyebrow="Scouting protocol"
                title="Catch borer before it costs you the block"
                description="Capsule borer moves through a plantation faster than most scouting rounds. A structured sampling routine turns this tool into an early-warning system rather than a post-mortem."
              />
              <ul className="mt-8 space-y-5">
                {[
                  {
                    t: "Sample every two weeks",
                    d: "More often during the capsule-filling window and through monsoon.",
                  },
                  {
                    t: "Spread your samples",
                    d: "Take pods from different sectors and elevations, not one convenient row.",
                  },
                  {
                    t: "Photograph the suspicious ones",
                    d: "Damaged pods carry the signal. A perfect pod tells the model very little.",
                  },
                  {
                    t: "Log the result",
                    d: "Save findings against the block in your dashboard to track pressure over the season.",
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
          </div>
        </div>
      </section>

      <FaqSection items={podFaqs} eyebrow="Pod diagnostics" />
      <CtaSection />
    </div>
  );
}
