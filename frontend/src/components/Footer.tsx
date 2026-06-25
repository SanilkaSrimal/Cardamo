import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

// lucide-react v1 dropped brand marks, so the social glyphs are inlined here.
const brandIcon = (path: string) => {
  const Glyph = ({ size = 18 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
  return Glyph;
};

const socials = [
  {
    label: "Facebook",
    href: "#",
    icon: brandIcon(
      "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"
    ),
  },
  {
    label: "X",
    href: "#",
    icon: brandIcon(
      "M17.53 3h3.05l-6.66 7.61L21.75 21h-6.13l-4.8-6.28L5.32 21H2.26l7.12-8.14L2.25 3h6.29l4.34 5.74L17.53 3Zm-1.07 16.17h1.69L7.62 4.73H5.81l10.65 14.44Z"
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: brandIcon(
      "M6.94 5.5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.25 8.75h3.4V21h-3.4V8.75Zm5.6 0h3.26v1.68h.05c.45-.86 1.56-1.76 3.21-1.76 3.43 0 4.07 2.26 4.07 5.2V21h-3.4v-5.44c0-1.3-.02-2.97-1.81-2.97-1.82 0-2.09 1.42-2.09 2.88V21h-3.4V8.75Z"
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: brandIcon(
      "M21.58 7.19a2.51 2.51 0 0 0-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42a2.51 2.51 0 0 0-1.77 1.77A26.2 26.2 0 0 0 2 12a26.2 26.2 0 0 0 .42 4.81 2.51 2.51 0 0 0 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42a2.51 2.51 0 0 0 1.77-1.77A26.2 26.2 0 0 0 22 12a26.2 26.2 0 0 0-.42-4.81ZM10 15.02V8.98L15.2 12 10 15.02Z"
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative mesh-emerald text-white overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Newsletter / CTA band */}
        <div className="mb-16 rounded-3xl bg-white/8 backdrop-blur-sm ring-1 ring-white/15 p-8 md:p-10 shadow-lift">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200 ring-1 ring-brand-400/30 mb-4">
                <Sparkles size={13} /> Harvest Intelligence Digest
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Weekly price signals, straight to your inbox
              </h3>
              <p className="text-brand-200/90 leading-relaxed">
                Regional auction trends, disease alerts for the monsoon window, and grading
                tips from our agronomy team. No spam, unsubscribe anytime.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                placeholder="you@estate.lk"
                aria-label="Email address"
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-4 py-3.5 text-white placeholder-brand-300/70 outline-none transition-colors focus:border-brand-400 focus:bg-white/15"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-400 px-6 py-3.5 font-semibold text-brand-950 transition-all hover:bg-brand-300 hover:-translate-y-0.5 shadow-soft"
              >
                Subscribe <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1.5">
                <Image
                  src="/logo.png"
                  alt="Cardamo Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-2xl font-bold tracking-tight">CARDAMO</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-300">
                  Quality Intelligence
                </span>
              </span>
            </Link>
            <p className="text-brand-200/80 leading-relaxed max-w-sm">
              Leading the way in cardamom quality assurance through advanced artificial
              intelligence and market analytics — built for growers, estates, and exporters.
            </p>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 ring-1 ring-white/15 text-brand-200 transition-all hover:bg-brand-400 hover:text-brand-950 hover:-translate-y-0.5"
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold mb-6 uppercase tracking-[0.18em] text-brand-300">
              Services
            </h3>
            <ul className="space-y-3.5">
              {[
                { label: "Pod Disease Detection", href: "/pod-disease" },
                { label: "Leaf Disease Analysis", href: "/leaf-disease" },
                { label: "Quality Grading", href: "/grading" },
                { label: "Market Forecasting", href: "/market-prediction" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-brand-200/80 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold mb-6 uppercase tracking-[0.18em] text-brand-300">
              Company
            </h3>
            <ul className="space-y-3.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "FAQ", href: "/faq" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Contact Us", href: "/contact" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-brand-200/80 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-bold mb-6 uppercase tracking-[0.18em] text-brand-300">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/15 text-brand-300">
                  <MapPin size={16} />
                </span>
                <span className="text-brand-200/80 pt-1.5">
                  123 Spice Route, Kandy, Sri Lanka
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/15 text-brand-300">
                  <Phone size={16} />
                </span>
                <a
                  href="tel:+94112345678"
                  className="text-brand-200/80 pt-1.5 transition-colors hover:text-white"
                >
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/15 text-brand-300">
                  <Mail size={16} />
                </span>
                <a
                  href="mailto:info@cardamo.ai"
                  className="text-brand-200/80 pt-1.5 transition-colors hover:text-white"
                >
                  info@cardamo.ai
                </a>
              </li>
            </ul>

            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/8 ring-1 ring-white/15 px-4 py-2.5 text-sm text-brand-200">
              <ShieldCheck size={16} className="text-brand-400" />
              Data encrypted &amp; never shared
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-white/10 text-sm text-brand-300/70">
          <p>© {new Date().getFullYear()} Cardamo QA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Terms
            </Link>
            <span className="flex items-center gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
