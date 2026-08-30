import React from "react";
import SectionHeading from "@/components/SectionHeading";

export interface Step {
  title: string;
  desc: string;
  icon: React.ElementType;
}

interface HowItWorksProps {
  steps: Step[];
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Numbered step row used by the home page and every AI service page so the
 * "how do I actually use this" story is told the same way throughout.
 */
export default function HowItWorks({
  steps,
  eyebrow = "How it works",
  title = "Three steps from photo to decision",
  description,
  className = "bg-white",
}: HowItWorksProps) {
  return (
    <section className={`py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
 <button className="fixed bottom-6 right-6 z-50 rounded-full bg-brand-600 p-4 text-white shadow-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
        
      </button>
        <div className="relative mt-16">
          {/* Connector rail behind the cards on large screens */}
          <div className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden lg:block">
            <div className="mx-auto h-px w-4/5 bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
          </div>

          <div
            className={`relative grid grid-cols-1 gap-8 sm:grid-cols-2 ${
              steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 text-center card-hover hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lift"
              >
                <span className="relative mx-auto mb-6 flex h-[6.5rem] w-[6.5rem] items-center justify-center rounded-full bg-white ring-1 ring-brand-100">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                    <step.icon size={30} />
                  </span>
                  <span className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-950 text-xs font-bold text-white ring-4 ring-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>

                <h3 className="text-lg font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
