"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Zap,
  ShieldCheck,
  Microscope,
  BarChart3,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { getUser, getToken, clearAuth, User } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

const serviceLinks = [
  {
    name: "Pod Disease",
    href: "/pod-disease",
    icon: ShieldCheck,
    desc: "Capsule borer & thrips detection",
  },
  {
    name: "Leaf Disease",
    href: "/leaf-disease",
    icon: Microscope,
    desc: "Blight & leaf spot diagnostics",
  },
  {
    name: "Grading",
    href: "/grading",
    icon: BarChart3,
    desc: "Automated quality certification",
  },
  {
    name: "Market Prediction",
    href: "/market-prediction",
    icon: TrendingUp,
    desc: "Price forecast & profit optimizer",
  },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "AI Services", href: "#", dropdown: serviceLinks },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Sync user from localStorage on mount
    const syncUser = () => {
      if (getToken()) {
        setUser(getUser());
      } else {
        setUser(null);
      }
    };

    syncUser();

    // Same-tab updates (login, logout, credit deduction)
    window.addEventListener("cardamo:auth-change", syncUser);
    // Cross-tab updates
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("cardamo:auth-change", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const servicesActive = serviceLinks.some((s) => pathname.startsWith(s.href));

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement strip */}
      <div className="hidden md:block bg-brand-950 text-brand-100 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <p className="flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
            AI models online — pod, leaf, grading &amp; market engines running
          </p>
          <div className="flex items-center gap-5">
            <a href="tel:+94112345678" className="hover:text-white transition-colors">
              +94 11 234 5678
            </a>
            <span className="text-brand-800">|</span>
            <a href="mailto:info@cardamo.ai" className="hover:text-white transition-colors">
              info@cardamo.ai
            </a>
          </div>
        </div>
      </div>

      <nav
        className={`transition-all duration-300 border-b ${
          scrolled
            ? "bg-white border-brand-100 shadow-soft"
            : "bg-white border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 ring-1 ring-brand-100 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/logo.png"
                    alt="Cardamo Logo"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-2xl font-bold text-brand-900 tracking-tight font-display">
                    CARDAMO
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-500">
                    Quality Intelligence
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div key={link.name} className="relative group">
                    <button
                      className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                        servicesActive
                          ? "text-brand-700 bg-brand-50"
                          : "text-gray-600 hover:text-brand-700 hover:bg-brand-50"
                      }`}
                    >
                      {link.name}
                      <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                    </button>

                    <div className="absolute left-1/2 -translate-x-1/2 pt-3 w-[26rem] opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
                      <div className="rounded-2xl border border-brand-100 bg-white p-2 shadow-lift">
                        <div className="grid grid-cols-1 gap-1">
                          {link.dropdown.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-brand-50 group/item"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100 group-hover/item:bg-brand-600 group-hover/item:text-white transition-colors">
                                <sub.icon size={18} />
                              </span>
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-gray-900 group-hover/item:text-brand-800">
                                  {sub.name}
                                </span>
                                <span className="block text-xs text-gray-500">{sub.desc}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                        <Link
                          href="/register"
                          className="mt-1 flex items-center justify-between rounded-xl bg-brand-950 px-4 py-3 text-white transition-colors hover:bg-brand-900"
                        >
                          <span className="text-sm font-semibold">
                            Start free — 100 credits included
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                      isActive(link.href)
                        ? "text-brand-700 bg-brand-50"
                        : "text-gray-600 hover:text-brand-700 hover:bg-brand-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              )}

              {/* Auth section */}
              <div className="flex items-center gap-3 ml-3 pl-3 border-l border-gray-200">
                {user ? (
                  /* Logged in */
                  <>
                    {/* Credit chip */}
                    <div className="flex items-center gap-1.5 rounded-full bg-brand-50 ring-1 ring-brand-200 px-3 py-1.5">
                      <Zap className="h-3.5 w-3.5 text-brand-600" />
                      <span className="text-sm font-bold text-brand-800">{user.credits}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">
                        credits
                      </span>
                    </div>

                    {/* User avatar dropdown */}
                    <div className="relative group">
                      <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-50">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 text-white font-bold text-xs shadow-soft">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {user.name?.split(" ")[0]}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:rotate-180" />
                      </button>
                      <div className="absolute right-0 pt-3 w-56 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
                        <div className="rounded-2xl border border-brand-100 bg-white p-2 shadow-lift">
                          <div className="px-3 py-2 border-b border-gray-100 mb-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-800"
                          >
                            <LayoutDashboard className="h-4 w-4" /> Dashboard
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Not logged in */
                  <>
                    <Link
                      href="/login"
                      className="px-4 py-2 rounded-full text-sm font-semibold text-gray-600 transition-colors hover:text-brand-700 hover:bg-brand-50"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-800 hover:shadow-lift hover:-translate-y-0.5"
                    >
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-1.5 rounded-full bg-brand-50 ring-1 ring-brand-200 px-2.5 py-1.5">
                  <Zap className="h-3.5 w-3.5 text-brand-600" />
                  <span className="text-sm font-bold text-brand-800">{user.credits}</span>
                </div>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation menu"
                className="rounded-xl p-2 text-gray-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden border-t border-brand-100 bg-white animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.dropdown ? (
                    <div className="py-2">
                      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-600">
                        {link.name}
                      </div>
                      <div className="space-y-1">
                        {link.dropdown.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-brand-50"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                              <sub.icon size={16} />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-gray-900">
                                {sub.name}
                              </span>
                              <span className="block text-xs text-gray-500">{sub.desc}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className={`block rounded-xl px-3 py-3 text-base font-semibold transition-colors ${
                        isActive(link.href)
                          ? "bg-brand-50 text-brand-800"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="rounded-xl border border-red-200 py-3 font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-xl border border-gray-200 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-brand-900 py-3 text-center font-semibold text-white transition-colors hover:bg-brand-800"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
