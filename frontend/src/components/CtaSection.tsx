import React from "react";
import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const perks = [
  "100 free credits on signup",
  "No credit card required",
  "Results in under 3 seconds",
];

export default function CtaSection() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] mesh-emerald shadow-lift">
          {/* Photo texture + grid */}
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: "url('/cta-bg.png')" }}
          />
          <div className="absolute inset-0 grid-lines opacity-60" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />

          <div className="relative px-6 py-16 sm:px-12 lg:px-16 lg:py-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-400/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-200 ring-1 ring-brand-400/30">
              <Sparkles size={13} /> Start in under a minute
            </div>

            <h2 className="mt-6 mx-auto max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] text-white">
              Ready to transform your <span className="text-gradient">harvest</span>?
            </h2>

            <p className="mt-6 mx-auto max-w-2xl text-lg text-brand-200/90 leading-relaxed">
              Join thousands of modern growers using AI for better quality, higher yields,
              and maximum profit at auction.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-900 shadow-lift transition-all hover:bg-brand-50 hover:-translate-y-0.5"
              >
                Create Free Account <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white/10 px-8 py-4 text-base font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition-all hover:bg-white/15 hover:-translate-y-0.5"
              >
                Talk to Sales
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {perks.map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-2 text-sm font-medium text-brand-200/85"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-400/20 text-brand-300">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
