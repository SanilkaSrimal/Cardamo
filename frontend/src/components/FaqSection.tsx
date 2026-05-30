"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Minus, MessageCircleQuestion, ArrowRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  items: FaqItem[];
  title?: string;
  eyebrow?: string;
  description?: string;
}

export default function FaqSection({
  items,
  title = "Frequently Asked Questions",
  eyebrow = "Answers",
  description = "Everything growers usually ask before running their first analysis.",
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-24 bg-gray-50/70 border-t border-gray-100 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Accordion */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((faq, i) => {
              const open = openIndex === i;
              return (
                <div
                  key={i}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    open
                      ? "border-brand-300 shadow-card"
                      : "border-gray-200 hover:border-brand-200 shadow-soft"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  >
                    <span className="flex items-center gap-4">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                          open
                            ? "bg-brand-600 text-white"
                            : "bg-brand-50 text-brand-700"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base sm:text-lg font-semibold text-gray-900">
                        {faq.q}
                      </span>
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                        open ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {open ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 pl-[4.5rem] text-gray-600 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Support card */}
          <div className="lg:sticky lg:top-32 rounded-3xl mesh-emerald p-8 text-white shadow-lift overflow-hidden relative">
            <div className="absolute inset-0 grid-lines opacity-50" />
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <MessageCircleQuestion size={22} className="text-brand-300" />
              </span>
              <h3 className="mt-5 text-xl font-bold">Still have questions?</h3>
              <p className="mt-3 text-brand-200/85 leading-relaxed">
                Our agronomy and support team answers technical questions within one
                business day — in English, Sinhala, or Tamil.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition-all hover:bg-brand-50 hover:-translate-y-0.5 shadow-soft"
              >
                Contact Support <ArrowRight size={16} />
              </Link>

              <div className="mt-8 pt-6 border-t border-white/10 space-y-2 text-sm text-brand-200/80">
                <p className="flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
                  Avg. first response: under 4 hours
                </p>
                <p className="flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
                  Mon–Fri, 9:00–17:00 LKT
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
