import Image from "next/image";
import Link from "next/link";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import Breadcrumb from "@/components/Breadcrumb";
import SectionHeading from "@/components/SectionHeading";
import StatsBand from "@/components/StatsBand";
import {
  Target,
  Leaf,
  Shield,
  Zap,
  Cpu,
  Database,
  ScanLine,
  LineChart,
  ArrowRight,
  Quote,
} from "lucide-react";

const aboutFaqs = [
  { q: "Who is Cardamo for?", a: "Our platform is built for cardamom farmers, estate managers, and exporters who want to standardize quality and maximize yields." },
  { q: "How can I get started?", a: "Simply register for a free account to receive your starter credits, then visit any of our AI service pages to begin analyzing." },
  { q: "Do you offer enterprise solutions?", a: "Yes, we provide high-volume API access and custom integrations for large estates and exporters. Use the Contact page to reach out." },
  { q: "How were the models trained?", a: "On thousands of expertly annotated Sri Lankan cardamom samples, collected across growing regions and seasons so the models generalise beyond a single estate's conditions." },
];

const values = [
  {
    icon: Target,
    title: "Precision",
    desc: "Delivering highly accurate, data-backed insights to eliminate guesswork in cardamom farming and grading.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    desc: "Promoting organic treatments and efficient resource use to ensure the long-term health of plantations.",
  },
  {
    icon: Shield,
    title: "Integrity",
    desc: "Standardizing quality assessment to create a fair, transparent market for growers and buyers alike.",
  },
];

const timeline = [
  {
    year: "2023",
    title: "Field research begins",
    desc: "Eighteen months collecting and annotating pod, leaf, and batch imagery across six growing regions.",
  },
  {
    year: "2024",
    title: "First models deployed",
    desc: "Pod and leaf disease classifiers go live with estate partners in Kandy and Matale.",
  },
  {
    year: "2025",
    title: "Grading & market engines",
    desc: "Automated trade-standard grading joins the platform, followed by the 4-week price forecast model.",
  },
  {
    year: "2026",
    title: "Open to every grower",
    desc: "Free tier launched so smallholders get the same diagnostics the large estates run on.",
  },
];

const techStack = [
  {
    icon: ScanLine,
    title: "Two-stage validation",
    desc: "An image gate confirms the subject before any diagnostic model runs, so nonsense inputs get flagged rather than diagnosed.",
  },
  {
    icon: Cpu,
    title: "Custom CNN architectures",
    desc: "Convolutional networks tuned for the fine surface detail that separates borer damage from ordinary scarring.",
  },
  {
    icon: Database,
    title: "Regional price modelling",
    desc: "Auction history, seasonality, and supply indicators combined per region and grade for a 4-week horizon.",
  },
  {
    icon: LineChart,
    title: "Continuous evaluation",
    desc: "Every model is re-validated against held-out seasonal data before it reaches production.",
  },
];

const stats = [
  { label: "Annotated samples", value: "50K+", sub: "Expert-labelled images" },
  { label: "Growing regions", value: "6", sub: "Across Sri Lanka" },
  { label: "Model accuracy", value: "98.7%", sub: "On validation sets" },
  { label: "Growers served", value: "12,000+", sub: "And counting" },
];

export default function About() {
  return (
    <div className="bg-white">
      <Breadcrumb
        items={[{ label: "Company" }, { label: "About Us", href: "/about" }]}
        title="Our Mission"
        description="Cardamo is dedicated to revolutionizing the cardamom industry through cutting-edge artificial intelligence — empowering farmers and exporters with precision quality assurance tools."
      />

      {/* ── The problem ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Why we exist"
                title="The problem we solve"
                description="Traditional quality assessment in cardamom production is subjective, slow, and prone to human error. Diseases like leaf blight and capsule borer devastate yields if not caught early, while inconsistent grading quietly costs farmers real money at auction."
              />

              <figure className="mt-9 rounded-2xl border-l-4 border-brand-600 bg-brand-50/70 p-7">
                <Quote className="mb-3 text-brand-300" size={26} />
                <blockquote className="text-lg font-semibold leading-relaxed text-brand-900">
                  Our vision is a transparent, data-driven spice trade where quality is
                  guaranteed by science.
                </blockquote>
              </figure>

              <p className="mt-7 text-lg leading-relaxed text-gray-600">
                By integrating computer vision and predictive analytics, Cardamo provides
                instant, accurate diagnostics that help maintain the high standards of Sri
                Lankan and international cardamom.
              </p>

              <Link
                href="/register"
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-brand-900 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5"
              >
                Start with 100 free credits <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.25rem] bg-brand-50/70 -z-10" />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-brand-100 shadow-card">
                <Image
                  src="/about-us.png"
                  alt="Cardamo agritech facility"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-6 rounded-2xl bg-white px-5 py-4 shadow-lift ring-1 ring-brand-100">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Leaf size={18} />
                  </span>
                  <div>
                    <p className="text-lg font-bold leading-none text-gray-900">Since 2023</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      In the field
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What guides us"
            title="Our core values"
            description="Three principles that decide what we build and what we refuse to ship."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div
                key={v.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-soft card-hover hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lift"
              >
                <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                  <v.icon size={28} />
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="leading-relaxed text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our journey"
            title="From field notebooks to production models"
            description="Every engine on the platform started as a season spent walking plantations with a camera."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {timeline.map((t, i) => (
              <div
                key={t.year}
                className="relative rounded-2xl border border-gray-200 bg-white p-7 shadow-soft card-hover hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lift"
              >
                <span className="inline-flex items-center rounded-full bg-brand-900 px-3.5 py-1 text-xs font-bold tracking-wider text-white">
                  {t.year}
                </span>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{t.title}</h3>
                <p className="mt-3 leading-relaxed text-gray-600">{t.desc}</p>

                {i < timeline.length - 1 && (
                  <span className="pointer-events-none absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-brand-400 ring-1 ring-brand-100 lg:flex">
                    <ArrowRight size={12} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <StatsBand
        stats={stats}
        title="Built on real field data"
        description="Not a demo trained on stock photography — every model learned from Sri Lankan plantations."
      />

      {/* ── Technology ───────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Under the hood"
            title="Driven by next-gen AI"
            description="Custom convolutional networks trained on thousands of expertly annotated samples, served from a cloud pipeline that answers in seconds."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {techStack.map((t) => (
              <div
                key={t.title}
                className="flex items-start gap-5 rounded-2xl border border-gray-200 bg-gray-50/70 p-7 card-hover hover:-translate-y-1 hover:border-brand-300 hover:bg-white hover:shadow-card"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-brand-700 ring-1 ring-brand-100">
                  <t.icon size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-brand-50 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-brand-700 ring-1 ring-brand-200">
              <Zap className="h-4 w-4" /> Sub-second cloud inference
            </div>
          </div>
        </div>
      </section>

      <FaqSection items={aboutFaqs} eyebrow="About Cardamo" />
      <CtaSection />
    </div>
  );
}
