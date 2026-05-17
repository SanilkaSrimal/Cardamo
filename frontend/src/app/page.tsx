import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Microscope,
  BarChart3,
  TrendingUp,
  Camera,
  Cpu,
  ClipboardCheck,
  Check,
  Sparkles,
  Leaf,
  Clock,
  Globe2,
  Award,
  Zap,
} from "lucide-react";
import HomeContactForm from "@/components/HomeContactForm";
import SectionHeading from "@/components/SectionHeading";
import HowItWorks from "@/components/HowItWorks";
import StatsBand from "@/components/StatsBand";
import Testimonials from "@/components/Testimonials";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";

const services = [
  {
    title: "Pod Disease",
    desc: "Real-time identification of capsule borer, thrips, and other pod-specific pathologies from a single photo.",
    icon: ShieldCheck,
    link: "/pod-disease",
    tag: "Vision AI",
  },
  {
    title: "Leaf Analysis",
    desc: "Comprehensive diagnostic for leaf blight, phyllosticta spot, and early fungal pressure.",
    icon: Microscope,
    link: "/leaf-disease",
    tag: "Vision AI",
  },
  {
    title: "Quality Grading",
    desc: "Standardized AI grading on size, colour uniformity, and physical integrity against trade standards.",
    icon: BarChart3,
    link: "/grading",
    tag: "Certification",
  },
  {
    title: "Market Trends",
    desc: "Four-week dried-price forecasts plus a profit optimizer that tells you when to sell or store.",
    icon: TrendingUp,
    link: "/market-prediction",
    tag: "Forecasting",
  },
];

const trustPoints = [
  { icon: Award, label: "98.7% model accuracy" },
  { icon: Clock, label: "Sub-3-second results" },
  { icon: Globe2, label: "6 growing regions covered" },
  { icon: Leaf, label: "Organic-first treatment advice" },
];

const steps = [
  {
    title: "Capture",
    desc: "Photograph a pod, a leaf, or a batch sample with any smartphone. No lab, no special rig.",
    icon: Camera,
  },
  {
    title: "Analyse",
    desc: "Our models validate the image, then run disease, grading, or price inference in the cloud.",
    icon: Cpu,
  },
  {
    title: "Act",
    desc: "Get a risk level, organic treatment plan, or a sell-vs-store recommendation you can act on today.",
    icon: ClipboardCheck,
  },
];

const stats = [
  { label: "AI Accuracy", value: "98.7%", sub: "Across validated test sets" },
  { label: "Farmers Helped", value: "12,000+", sub: "Across Sri Lanka" },
  { label: "Predictions Made", value: "500K+", sub: "Since launch" },
  { label: "Yield Increase", value: "24%", sub: "Average reported gain" },
];

const homeFaqs = [
  {
    q: "How accurate is the AI detection?",
    a: "Our models have been trained on thousands of verified samples and achieve over 98% accuracy in controlled conditions. Every upload also passes an image-validation gate first, so a photo that isn't a cardamom pod or leaf is flagged rather than guessed at.",
  },
  {
    q: "Do I need special equipment?",
    a: "No. A standard smartphone camera is sufficient. Just ensure the image is well-lit, in focus, and shot against a plain background.",
  },
  {
    q: "How are credits consumed?",
    a: "Each AI prediction — disease detection, grading, or market forecast — consumes 20 credits from your account balance. New accounts start with 100 free credits.",
  },
  {
    q: "Can I use this offline?",
    a: "Currently an active internet connection is required to reach our cloud AI engines. Field notes and harvest records in the dashboard sync when you reconnect.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden mesh-emerald">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 grid-lines opacity-70" />
        <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-400/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-200 ring-1 ring-brand-400/30 animate-fade-up">
                <Sparkles size={13} /> AI for the cardamom supply chain
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.03] text-white animate-fade-up stagger-1">
                Precision intelligence for{" "}
                <span className="text-gradient">cardamom</span> quality
              </h1>

              <p className="mt-7 max-w-xl text-lg lg:text-xl leading-relaxed text-brand-200/90 animate-fade-up stagger-2">
                Detect disease before it spreads, certify your grade before you negotiate,
                and know the dried price four weeks ahead. The future of cardamom
                production is data-driven.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up stagger-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-900 shadow-lift transition-all hover:bg-brand-50 hover:-translate-y-0.5"
                >
                  Start Analysis Now <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-8 py-4 text-base font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition-all hover:bg-white/15 hover:-translate-y-0.5"
                >
                  Learn More
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 animate-fade-up stagger-4">
                {["100 free credits", "No card required", "Works on any phone"].map((p) => (
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

            {/* Hero visual with floating result cards */}
            <div className="lg:col-span-5 relative animate-fade-up stagger-2">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] ring-1 ring-white/20 shadow-lift">
                <Image
                  src="/farmer-app.png"
                  alt="Grower analysing cardamom with the Cardamo app"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/70 via-transparent to-transparent" />
              </div>

              {/* Floating diagnostic chip */}
              <div className="absolute -left-4 sm:-left-8 top-10 w-56 rounded-2xl bg-white p-4 shadow-lift animate-float">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <ShieldCheck size={17} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                      Pod status
                    </p>
                    <p className="text-sm font-bold text-brand-700">Healthy pod</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full w-[97%] rounded-full bg-brand-500" />
                </div>
                <p className="mt-2 text-[11px] text-gray-500">97% confidence</p>
              </div>

              {/* Floating price chip */}
              <div
                className="absolute -right-2 sm:-right-6 bottom-12 w-56 rounded-2xl bg-white p-4 shadow-lift animate-float"
                style={{ animationDelay: "1.5s" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                    Dried price · 4w
                  </p>
                  <TrendingUp size={14} className="text-brand-600" />
                </div>
                <p className="mt-1.5 text-xl font-bold text-gray-900">Rs. 20,554</p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                  ▲ 0.70% vs today
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="relative border-t border-white/10 bg-brand-950/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {trustPoints.map((t) => (
                <div key={t.label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 text-brand-300 ring-1 ring-white/15">
                    <t.icon size={16} />
                  </span>
                  <span className="text-sm font-medium text-brand-200/85">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our AI ecosystem"
            title="Four engines, one harvest workflow"
            description="Integrated solutions designed to maximise crop yield and profitability through automated quality control."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.link}
                href={service.link}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white p-7 card-hover hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lift"
              >
                {/* Hover wash */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/0 to-brand-50/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600">
                      <service.icon size={26} />
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                      {service.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 transition-colors group-hover:text-brand-800">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{service.desc}</p>

                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-brand-700">
                    Explore service
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <HowItWorks
        steps={steps}
        description="No agronomist on call, no lab turnaround. A phone camera and a connection are the whole toolkit."
        className="border-t border-gray-100 bg-gray-50/70"
      />

      {/* ── Feature deep-dives ───────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {/* Feature 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="order-2 lg:order-1">
              <SectionHeading
                align="left"
                eyebrow="Step 1 · Field diagnostics"
                title="Capture and analyse on the go"
                description="Empower your workforce with instant AI diagnostics. Photograph a leaf or pod with any smartphone and our deep learning models detect capsule borer or leaf blight before it spreads through the block."
              />
              <ul className="mt-8 space-y-4">
                {[
                  "Works directly from the field, no lab needed",
                  "Immediate organic treatment recommendations",
                  "Invalid photos are flagged, never silently guessed",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pod-disease"
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-brand-900 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5"
              >
                Try disease detection <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-4 rounded-[2.25rem] bg-brand-50/70 -z-10" />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-brand-100 shadow-card">
                <Image
                  src="/farmer-app.png"
                  alt="Farmer using the Cardamo app in the field"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-6 rounded-2xl bg-white px-5 py-4 shadow-lift ring-1 ring-brand-100">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Zap size={18} />
                  </span>
                  <div>
                    <p className="text-lg font-bold leading-none text-gray-900">2.4s</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Avg. inference
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.25rem] bg-spice-50 -z-10" />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl ring-1 ring-spice-200 shadow-card">
                <Image
                  src="/cardamom-grading.png"
                  alt="Cardamom grading process"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 right-6 rounded-2xl bg-white px-5 py-4 shadow-lift ring-1 ring-spice-200">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-spice-50 text-spice-600">
                    <Award size={18} />
                  </span>
                  <div>
                    <p className="text-lg font-bold leading-none text-gray-900">AGEB</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Top trade tier
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeading
                align="left"
                eyebrow="Step 2 · Certification"
                title="Standardize quality grading"
                description="Eliminate subjective pricing. Computer vision assesses size, colour uniformity, and surface defects to certify your harvest against strict international trade standards."
              />
              <ul className="mt-8 space-y-4">
                {[
                  "Accurate, unbiased certification per batch",
                  "Command premium prices at auction",
                  "Explainable summary of what drove the grade",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/grading"
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-brand-900 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5"
              >
                Grade a sample <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <StatsBand
        stats={stats}
        title="Numbers from the field"
        description="Aggregated across estates and smallholders running Cardamo through a full harvest cycle."
      />

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <Testimonials />

      {/* ── Contact ──────────────────────────────────────────────── */}
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Get in touch"
                title="Talk to the team behind the models"
                description="Questions about enterprise plans, API integration, or on-boarding a cooperative? Send a message and we'll come back within one business day."
              />

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Cpu, title: "API access", desc: "Bulk inference endpoints" },
                  { icon: Globe2, title: "Regional roll-out", desc: "Cooperative onboarding" },
                  { icon: Award, title: "Certification", desc: "Trade-standard grading" },
                  { icon: ShieldCheck, title: "Data policy", desc: "Your images stay yours" },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-soft"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <c.icon size={18} />
                    </span>
                    <p className="mt-3 font-bold text-gray-900">{c.title}</p>
                    <p className="text-sm text-gray-500">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-8 shadow-card">
              <HomeContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <FaqSection
        items={homeFaqs}
        eyebrow="Common questions"
        description="The things growers ask us most before their first upload."
      />

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <CtaSection />
    </div>
  );
}
