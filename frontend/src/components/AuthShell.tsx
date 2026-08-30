import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Star } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: React.ReactNode;
  /** Right-hand marketing panel copy */
  panelTitle: string;
  panelPoints: string[];
  children: React.ReactNode;
}

/**
 * Shared split-screen frame for /login and /register so both auth screens
 * carry the brand instead of floating on a bare grey page.
 */
export default function AuthShell({
  title,
  subtitle,
  panelTitle,
  panelPoints,
  children,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-center bg-white px-5 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-9 inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100">
              <Image
                src="/logo.png"
                alt="Cardamo Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl font-bold tracking-tight text-brand-900">
                CARDAMO
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-500">
                Quality Intelligence
              </span>
            </span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{title}</h1>
          <p className="mt-3 text-gray-600">{subtitle}</p>

          <div className="mt-9">{children}</div>
        </div>
      </div>

      {/* Brand panel */}
      <div className="relative hidden overflow-hidden mesh-emerald lg:block">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        <div className="absolute inset-0 grid-lines opacity-70" />
        <div className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative flex h-full flex-col justify-center px-14 xl:px-20 py-16">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-400/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-200 ring-1 ring-brand-400/30">
            <Star size={13} className="fill-brand-300 text-brand-300" /> Trusted by 12,000+ growers
          </div>

          <h2 className="mt-7 max-w-md text-4xl font-bold leading-[1.1] text-white">
            {panelTitle}
          </h2>

          <ul className="mt-9 space-y-4">
            {panelPoints.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-400/20 text-brand-300">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="text-brand-200/90 leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>

          <figure className="mt-12 max-w-md rounded-2xl bg-white/8 p-6 ring-1 ring-white/15 backdrop-blur-sm">
            <blockquote className="text-brand-100 leading-relaxed">
              &ldquo;The grading certificate ended the argument about tiers. Buyers see the
              same number we do.&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-brand-950">
                CW
              </span>
              <span>
                <span className="block text-sm font-bold text-white">
                  Chamari Wijesinghe
                </span>
                <span className="block text-xs text-brand-300">
                  Smallholder Cooperative, Matale
                </span>
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
