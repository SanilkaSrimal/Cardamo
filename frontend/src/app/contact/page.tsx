"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  Clock,
  MessageSquare,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Headphones,
  Handshake,
  Code2,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import CtaSection from "@/components/CtaSection";
import SectionHeading from "@/components/SectionHeading";
import { submitContactForm } from "@/lib/api";

const contactFaqs = [
  { q: "How quickly do you respond?", a: "Our support team typically responds to inquiries within 24 hours on business days." },
  { q: "Do you offer phone support?", a: "Yes, phone support is available during regular business hours (9 AM - 5 PM LKT)." },
  { q: "Where are you located?", a: "Our main office is located in Kandy, Sri Lanka, in the heart of the spice trade." },
  { q: "Can you visit our estate?", a: "For enterprise and cooperative onboarding we do run on-site sessions across the hill country. Mention your location and estate size in your message and we will arrange a visit." },
];

const channels = [
  {
    icon: MapPin,
    title: "Our Office",
    lines: ["123 Spice Route", "Kandy, Sri Lanka"],
  },
  {
    icon: Phone,
    title: "Phone",
    lines: ["+94 11 234 5678"],
    href: "tel:+94112345678",
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["info@cardamo.ai"],
    href: "mailto:info@cardamo.ai",
  },
  {
    icon: Clock,
    title: "Hours",
    lines: ["Mon–Fri, 9:00–17:00 LKT", "Weekend: email only"],
  },
];

const departments = [
  {
    icon: Headphones,
    title: "Technical Support",
    desc: "Trouble with an analysis, credits, or your account.",
    contact: "support@cardamo.ai",
  },
  {
    icon: Handshake,
    title: "Partnerships",
    desc: "Cooperatives, estates, and exporter onboarding.",
    contact: "partners@cardamo.ai",
  },
  {
    icon: Code2,
    title: "API & Integration",
    desc: "Bulk inference endpoints and custom pipelines.",
    contact: "developers@cardamo.ai",
  },
];

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-100";
const labelClass =
  "block text-xs font-bold uppercase tracking-[0.14em] text-gray-500 mb-2";

export default function Contact() {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await submitContactForm(formData);
      setStatus("success");
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Failed to send message.");
    }
  };

  return (
    <div className="bg-white">
      <Breadcrumb
        items={[{ label: "Company" }, { label: "Contact Us", href: "/contact" }]}
        title="Contact Us"
        description="Questions about our AI services, enterprise plans, or API integration? Our technical team is one message away."
        highlights={[
          { label: "First response", value: "< 4 hrs" },
          { label: "Languages", value: "EN / SI / TA" },
          { label: "Office", value: "Kandy" },
        ]}
      />

      {/* ── Contact grid ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Details */}
            <div className="lg:col-span-2">
              <SectionHeading
                align="left"
                eyebrow="Get in touch"
                title="Talk to the team"
                description="Reach us however suits you — we read every message and reply within one business day."
              />

              <div className="mt-10 space-y-4">
                {channels.map((c) => (
                  <div
                    key={c.title}
                    className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-5 transition-all hover:border-brand-300 hover:bg-white hover:shadow-soft"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-100">
                      <c.icon size={19} />
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900">{c.title}</h3>
                      {c.lines.map((line) =>
                        c.href ? (
                          <a
                            key={line}
                            href={c.href}
                            className="block text-gray-600 transition-colors hover:text-brand-700"
                          >
                            {line}
                          </a>
                        ) : (
                          <p key={line} className="text-gray-600">
                            {line}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Location visual */}
              <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-3xl ring-1 ring-brand-100 shadow-card">
                <Image
                  src="/contact-bg.png"
                  alt="Cardamo office region"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl bg-white/90 p-4 backdrop-blur-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <Building2 size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Cardamo HQ — Kandy</p>
                    <p className="text-xs text-gray-500">
                      In the heart of the Sri Lankan spice trade
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 sm:p-10 shadow-card">
                <div className="mb-8 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-100">
                    <MessageSquare size={19} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Send us a message</h2>
                    <p className="text-sm text-gray-500">
                      We reply within one business day
                    </p>
                  </div>
                </div>

                {status === "success" && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-800">
                    <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                    <p className="text-sm font-medium leading-relaxed">
                      Thank you! Your message has been sent successfully. We will get back to
                      you soon.
                    </p>
                  </div>
                )}
                {status === "error" && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                    <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="first-name" className={labelClass}>
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first-name"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className={inputClass}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="last-name" className={labelClass}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last-name"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className={inputClass}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className={labelClass}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={7}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`${inputClass} resize-none`}
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-4 font-bold uppercase tracking-[0.14em] text-white shadow-soft transition-all hover:bg-brand-800 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {status === "loading" ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Sending</>
                    ) : (
                      <>Send Message <Send className="h-4 w-4" /></>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    By sending this message you agree to our privacy policy. We never share
                    your details.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Departments ──────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/70 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Right team, first time"
            title="Who you need to reach"
            description="Sending your question straight to the right desk cuts the reply time roughly in half."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((d) => (
              <div
                key={d.title}
                className="rounded-2xl border border-gray-200 bg-white p-7 shadow-soft card-hover hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lift"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <d.icon size={22} />
                </span>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{d.title}</h3>
                <p className="mt-2.5 leading-relaxed text-gray-600">{d.desc}</p>
                <a
                  href={`mailto:${d.contact}`}
                  className="mt-5 inline-block text-sm font-bold text-brand-700 transition-colors hover:text-brand-900"
                >
                  {d.contact}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection items={contactFaqs} eyebrow="Contact & support" />
      <CtaSection />
    </div>
  );
}
