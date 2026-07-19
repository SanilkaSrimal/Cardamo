import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  title?: string;
  description?: string;
  /** Optional stat pills rendered under the title, e.g. accuracy / latency */
  highlights?: { label: string; value: string }[];
}

export default function Breadcrumb({
  items,
  title,
  description,
  highlights,
}: BreadcrumbProps) {
  return (
    <section className="relative overflow-hidden mesh-emerald">
      {/* Photographic base layer, dimmed under the mesh gradient */}
      <div
        className="absolute inset-0 opacity-25 bg-cover bg-center"
        style={{ backgroundImage: "url('/breadcrumb-bg.png')" }}
      />
      <div className="absolute inset-0 grid-lines opacity-70" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <nav className="flex items-center text-sm font-medium" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                href="/"
                className="flex items-center rounded-lg p-1.5 text-brand-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Home size={15} />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <li key={item.label} className="flex items-center">
                  <ChevronRight size={14} className="mx-0.5 text-brand-500 shrink-0" />
                  {isLast || !item.href ? (
                    <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white ring-1 ring-white/15">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-200 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {title && (
          <h1 className="mt-7 max-w-3xl text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] text-white animate-fade-up">
            {title}
          </h1>
        )}

        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-200/90 animate-fade-up stagger-1">
            {description}
          </p>
        )}

        {highlights && highlights.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up stagger-2">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="rounded-xl bg-white/8 px-4 py-2.5 ring-1 ring-white/15 backdrop-blur-sm"
              >
                <span className="block text-lg font-bold text-brand-300 leading-none">
                  {h.value}
                </span>
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-200/70">
                  {h.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Soft transition into the page body */}
      <div className="relative h-6 bg-white rounded-t-[2rem]" />
    </section>
  );
}
