import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import CtaSection from "@/components/CtaSection";
import {
  Shield,
  Database,
  Cog,
  Lock,
  Mail,
  FileCheck2,
  UserCheck,
  ArrowRight,
} from "lucide-react";

const sections = [
  {
    id: "introduction",
    number: "01",
    icon: Shield,
    title: "Introduction",
    body: (
      <p className="leading-relaxed">
        At Cardamo, we take your privacy seriously. This policy describes how we collect,
        use, and protect your personal and agricultural data when you use our AI services.
        By using our platform, you agree to the collection and use of information in
        accordance with this policy.
      </p>
    ),
  },
  {
    id: "data-collection",
    number: "02",
    icon: Database,
    title: "Data Collection",
    body: (
      <>
        <p className="mb-4 leading-relaxed">
          We collect several types of information for various purposes:
        </p>
        <ul className="space-y-3">
          {[
            ["Personal Data", "Name, email address, and phone number when you register."],
            ["Image Data", "Photos of cardamom pods and leaves uploaded for AI analysis."],
            ["Usage Data", "Information on how the service is accessed and used."],
            [
              "Regional Data",
              "Location data (e.g. Kandy, Nuwara Eliya) for market prediction accuracy.",
            ],
          ].map(([label, desc]) => (
            <li key={label} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
              <span className="leading-relaxed">
                <strong className="font-bold text-gray-900">{label}:</strong> {desc}
              </span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "use-of-data",
    number: "03",
    icon: Cog,
    title: "Use of Data",
    body: (
      <p className="leading-relaxed">
        We use the collected data to provide and maintain our services, notify you about
        changes, allow you to participate in interactive features, provide customer support,
        and gather analysis to improve our AI models. Your agricultural data helps us refine
        disease detection accuracy for the entire community.
      </p>
    ),
  },
  {
    id: "data-security",
    number: "04",
    icon: Lock,
    title: "Data Security",
    body: (
      <p className="leading-relaxed">
        The security of your data is important to us. We implement industry-standard
        encryption and security measures to prevent unauthorized access. However, remember
        that no method of transmission over the Internet or electronic storage is 100%
        secure.
      </p>
    ),
  },
  {
    id: "your-rights",
    number: "05",
    icon: UserCheck,
    title: "Your Rights",
    body: (
      <>
        <p className="mb-4 leading-relaxed">
          You stay in control of the data you give us. At any time you may:
        </p>
        <ul className="space-y-3">
          {[
            "Request a copy of the personal data we hold about you.",
            "Ask us to correct anything inaccurate in your account.",
            "Request deletion of your uploaded imagery and associated records.",
            "Withdraw consent for your data to contribute to model improvement.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <FileCheck2 size={11} />
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 leading-relaxed">
          Requests are actioned within 30 days. Write to privacy@cardamo.ai to start one.
        </p>
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="bg-white">
      <Breadcrumb
        items={[{ label: "Company" }, { label: "Privacy Policy", href: "/privacy" }]}
        title="Privacy Policy"
        description="How we collect, use, and protect your personal and agricultural data — written plainly, without the legal fog."
      />

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-14">
            {/* Table of contents */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-32">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  On this page
                </p>
                <nav className="space-y-1">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-800"
                    >
                      <span className="text-xs font-bold text-brand-400">{s.number}</span>
                      {s.title}
                    </a>
                  ))}
                </nav>

                <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/70 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-700">
                    <Shield size={16} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-gray-900">
                    Your images stay yours
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                    We never sell or share uploaded imagery with third parties without your
                    explicit consent.
                  </p>
                </div>
              </div>
            </aside>

            {/* Body */}
            <div className="lg:col-span-3 space-y-6">
              {sections.map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-32 rounded-3xl border border-gray-200 bg-white p-7 sm:p-9 shadow-soft"
                >
                  <div className="mb-5 flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <s.icon size={21} />
                    </span>
                    <div>
                      <span className="text-xs font-bold tracking-[0.16em] text-brand-400">
                        {s.number}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                        {s.title}
                      </h2>
                    </div>
                  </div>
                  <div className="text-gray-600">{s.body}</div>
                </section>
              ))}

              {/* Questions card */}
              <div className="relative overflow-hidden rounded-3xl mesh-emerald p-8 sm:p-10 shadow-lift">
                <div className="absolute inset-0 grid-lines opacity-50" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Mail size={24} className="text-brand-300" />
                  </span>
                  <div className="flex-grow">
                    <h2 className="text-xl font-bold text-white">Questions about privacy?</h2>
                    <p className="mt-2 text-brand-200/85 leading-relaxed">
                      Write to{" "}
                      <a
                        href="mailto:privacy@cardamo.ai"
                        className="font-semibold text-white underline underline-offset-4"
                      >
                        privacy@cardamo.ai
                      </a>{" "}
                      and a human will answer — not a form letter.
                    </p>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-900 shadow-soft transition-all hover:bg-brand-50 hover:-translate-y-0.5"
                  >
                    Contact us <ArrowRight size={15} />
                  </Link>
                </div>
              </div>

              <p className="pt-4 text-sm italic text-gray-400">
                Last updated: May 7, 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </div>
  );
}
