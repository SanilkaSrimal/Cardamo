import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display face for headings — gives the brand a voice the body text doesn't have
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cardamo | Cardamom Quality Assurance AI",
    template: "%s | Cardamo",
  },
  description:
    "Advanced AI-powered quality assurance for cardamom — pod and leaf disease detection, automated grading, and market price forecasting for growers and exporters.",
  keywords: [
    "cardamom",
    "agritech",
    "AI disease detection",
    "cardamom grading",
    "spice market prediction",
    "Sri Lanka",
  ],
  applicationName: "Cardamo",
  openGraph: {
    title: "Cardamo | Cardamom Quality Assurance AI",
    description:
      "Detect disease, grade quality, and forecast market prices for cardamom with production-grade AI.",
    siteName: "Cardamo",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#064e3b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
