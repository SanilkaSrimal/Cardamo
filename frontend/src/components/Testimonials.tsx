import React from "react";
import { Star, Quote } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";

const testimonials = [
  {
    quote:
      "We used to lose a third of a block before anyone noticed the borer. Now the supervisors photograph suspect pods on their rounds and we treat the same week.",
    name: "Nimal Rajapaksha",
    role: "Estate Manager, Kandy",
    initials: "NR",
    stars: 5,
  },
  {
    quote:
      "The grading is what sold me. Buyers used to argue every lot down a tier. A printed certificate from the app ended that conversation for good.",
    name: "Chamari Wijesinghe",
    role: "Smallholder Cooperative, Matale",
    initials: "CW",
    stars: 5,
  },
  {
    quote:
      "The profit optimizer told us to dry and store instead of selling fresh. Four weeks later the dried price was up and it paid for the whole season's subscription.",
    name: "Ruwan Fernando",
    role: "Exporter, Nuwara Eliya",
    initials: "RF",
    stars: 5,
  },
];

const STAGGER = ["stagger-1", "stagger-2", "stagger-3", "stagger-4"];

export default function Testimonials() {
  return (
    <section className="relative py-24 bg-gray-50/70 border-y border-gray-100 overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Field results"
          title="Trusted across the hill country"
          description="Estates, cooperatives, and exporters using Cardamo through the full harvest cycle."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className={`relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-soft card-hover hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lift animate-fade-up ${STAGGER[i] ?? ""}`}
            >
              <Quote
                className="absolute top-6 right-6 text-brand-100"
                size={40}
                strokeWidth={1.5}
              />

              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star
                    key={s}
                    size={16}
                    className="fill-spice-400 text-spice-400"
                  />
                ))}
              </div>

              <blockquote className="relative flex-grow text-gray-700 leading-relaxed">
                {t.quote}
              </blockquote>

              <figcaption className="mt-7 flex items-center gap-3 border-t border-gray-100 pt-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 text-sm font-bold text-white">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-bold text-gray-900">{t.name}</span>
                  <span className="block text-xs text-gray-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
