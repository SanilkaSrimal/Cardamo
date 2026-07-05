import React from "react";

export interface Stat {
  label: string;
  value: string;
  sub?: string;
}

interface StatsBandProps {
  stats: Stat[];
  title?: string;
  description?: string;
}

export default function StatsBand({ stats, title, description }: StatsBandProps) {
  return (
    <section className="relative overflow-hidden mesh-emerald py-20">
      <div className="absolute inset-0 grid-lines opacity-60" />
      <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-brand-400/15 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className="mb-14 text-center mx-auto max-w-2xl">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-brand-200/85 leading-relaxed">{description}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white/8 p-6 sm:p-8 ring-1 ring-white/15 backdrop-blur-sm transition-all duration-300 hover:bg-white/12 hover:-translate-y-1"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-none tracking-tight">
                {stat.value}
              </div>
              <div className="mt-3 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-brand-300">
                {stat.label}
              </div>
              {stat.sub && (
                <div className="mt-2 text-sm text-brand-200/70 leading-snug">{stat.sub}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
