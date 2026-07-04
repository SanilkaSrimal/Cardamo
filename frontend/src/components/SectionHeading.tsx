import React from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Shared section header — keeps the eyebrow / title / description rhythm
 * identical everywhere instead of each page re-inventing it.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className = "",
}: SectionHeadingProps) {
  const centered = align === "center";
  const dark = tone === "dark";

  return (
    <div
      className={`${centered ? "text-center mx-auto max-w-3xl" : "text-left max-w-2xl"} ${className}`}
    >
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] mb-5 ${
            dark
              ? "bg-brand-400/15 text-brand-200 ring-1 ring-brand-400/30"
              : "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
          }`}
        >
          <span
            className={`inline-flex h-1.5 w-1.5 rounded-full ${
              dark ? "bg-brand-400" : "bg-brand-500"
            }`}
          />
          {eyebrow}
        </div>
      )}

      <h2
        className={`text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.1] ${
          dark ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-5 text-lg leading-relaxed ${
            dark ? "text-brand-200/85" : "text-gray-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
