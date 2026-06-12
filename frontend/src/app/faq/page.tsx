"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Minus,
  Search,
  ArrowRight,
  ShieldCheck,
  Cpu,
  CreditCard,
  Lock,
  Sparkles,
  MessageCircleQuestion,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import CtaSection from "@/components/CtaSection";

type Category = "AI & Accuracy" | "Using the App" | "Credits & Billing" | "Data & Privacy";

const categories: { name: Category | "All"; icon: React.ElementType }[] = [
  { name: "All", icon: Sparkles },
  { name: "AI & Accuracy", icon: Cpu },
  { name: "Using the App", icon: ShieldCheck },
  { name: "Credits & Billing", icon: CreditCard },
  { name: "Data & Privacy", icon: Lock },
];

const faqs: { question: string; answer: string; category: Category }[] = [
  {
    category: "AI & Accuracy",
    question: "How accurate is the disease detection AI?",
    answer:
      "Our models are trained on over 50,000 high-resolution images of cardamom pods and leaves. In controlled testing, we achieve a 98.7% accuracy rate for major diseases like capsule borer and leaf blight.",
  },
  {
    category: "AI & Accuracy",
    question: "What happens if I upload the wrong kind of photo?",
    answer:
      "Every upload passes an image-validation gate before any diagnostic model runs. If the photo is not clearly a cardamom pod or leaf, we tell you so and skip the diagnosis rather than returning a confident-looking but meaningless result.",
  },
  {
    category: "AI & Accuracy",
    question: "How are market price predictions calculated?",
    answer:
      "We combine historical pricing data from major cardamom hubs (like Kandy and Bodinayakanur), weather patterns, and global spice trade demand indicators to forecast dried prices up to 4 weeks in advance, modelled separately per region and grade.",
  },
  {
    category: "AI & Accuracy",
    question: "Which cardamom varieties does the system support?",
    answer:
      "Currently, our AI is optimized for the 'Malabar', 'Mysore', and 'Vazhukka' varieties, which represent the majority of commercial cardamom production.",
  },
  {
    category: "Using the App",
    question: "Do I need special equipment to use the grading service?",
    answer:
      "No special equipment is required. A standard smartphone camera with at least 12MP resolution and good natural lighting is sufficient for our AI to process quality grading.",
  },
  {
    category: "Using the App",
    question: "How should I photograph a sample?",
    answer:
      "Use a plain background, diffused daylight rather than direct flash, and fill most of the frame with the subject. For disease detection, make sure the damaged area is clearly visible and in focus.",
  },
  {
    category: "Using the App",
    question: "Can I use Cardamo offline?",
    answer:
      "An active internet connection is required to reach our cloud AI engines. Harvest records you enter in the dashboard sync once you are back online.",
  },
  {
    category: "Credits & Billing",
    question: "How are credits consumed?",
    answer:
      "Each AI prediction — disease detection, grading, or a market forecast — consumes 20 credits from your account balance. New accounts start with 100 free credits, enough for five analyses.",
  },
  {
    category: "Credits & Billing",
    question: "Do credits expire?",
    answer:
      "No. Credits stay on your account until you use them. Top-ups are available from the Credits & Payments page in your dashboard.",
  },
  {
    category: "Credits & Billing",
    question: "Do you offer plans for cooperatives and estates?",
    answer:
      "Yes. High-volume plans and API access are available for large estates, cooperatives, and exporters. Get in touch through the Contact page and we will size a plan around your harvest volume.",
  },
  {
    category: "Data & Privacy",
    question: "Is my data kept private?",
    answer:
      "Absolutely. We adhere to strict data protection protocols. Your uploaded images and farm data are used solely for your analysis and are never shared with third parties without explicit consent.",
  },
  {
    category: "Data & Privacy",
    question: "Can I delete my uploads?",
    answer:
      "Yes. You can request deletion of your uploaded imagery and associated records at any time by contacting privacy@cardamo.ai, and we action it within 30 days.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [active, setActive] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      const inCategory = active === "All" || f.category === active;
      const inQuery =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [active, query]);

  const selectCategory = (name: Category | "All") => {
    setActive(name);
    setOpenIndex(0);
  };

  return (
    <div className="bg-white">
      <Breadcrumb
        items={[{ label: "Company" }, { label: "FAQ", href: "/faq" }]}
        title="Frequently Asked Questions"
        description="Everything about the models, the workflow, credits, and how we handle your data — in one place."
        highlights={[
          { label: "Questions answered", value: `${faqs.length}` },
          { label: "Support response", value: "< 4 hrs" },
          { label: "Languages", value: "EN / SI / TA" },
        ]}
      />

      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search */}
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenIndex(0);
              }}
              placeholder="Search questions — e.g. credits, accuracy, privacy"
              aria-label="Search frequently asked questions"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/70 py-4 pl-14 pr-5 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </div>

          {/* Category pills */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            {categories.map((c) => {
              const isActive = active === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => selectCategory(c.name)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-brand-900 text-white shadow-soft"
                      : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                  }`}
                >
                  <c.icon size={15} />
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Accordion */}
          <div className="mt-10 space-y-4">
            {filtered.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
                <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                  <Search size={26} />
                </span>
                <p className="font-semibold text-gray-700">No matching questions</p>
                <p className="mt-1.5 text-sm text-gray-500">
                  Try a different keyword, or{" "}
                  <Link href="/contact" className="font-semibold text-brand-700 underline">
                    ask us directly
                  </Link>
                  .
                </p>
              </div>
            )}

            {filtered.map((faq, index) => {
              const open = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    open
                      ? "border-brand-300 shadow-card"
                      : "border-gray-200 hover:border-brand-200 shadow-soft"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  >
                    <span className="min-w-0">
                      <span className="mb-2 inline-block rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-700">
                        {faq.category}
                      </span>
                      <span className="block text-base sm:text-lg font-semibold text-gray-900">
                        {faq.question}
                      </span>
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                        open ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {open ? <Minus size={17} /> : <Plus size={17} />}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-gray-100 px-6 py-5 leading-relaxed text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Still stuck ──────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl mesh-emerald p-8 sm:p-12 shadow-lift">
            <div className="absolute inset-0 grid-lines opacity-50" />
            <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <MessageCircleQuestion size={28} className="text-brand-300" />
              </span>
              <div className="flex-grow">
                <h2 className="text-2xl font-bold text-white">Still have questions?</h2>
                <p className="mt-2 text-brand-200/85 leading-relaxed">
                  Our support team is ready to help with any technical inquiry — in English,
                  Sinhala, or Tamil.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-900 shadow-soft transition-all hover:bg-brand-50 hover:-translate-y-0.5"
              >
                Contact Support <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}
