"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide Navbar and Footer on all dashboard routes
  const isDashboardRoute = pathname.startsWith("/dashboard");

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {!isDashboardRoute && <Footer />}
    </>
  );
}
