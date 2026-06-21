"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Package,
  Receipt,
  Sprout,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// ─── Nav items ───────────────────────────────────────────────────────────────

const userNavItems = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Harvesting", href: "/dashboard/harvesting", icon: Sprout },
  { label: "Credits & Payments", href: "/dashboard/payments", icon: CreditCard },
];

const adminNavItems = [
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
  { label: "All Payments", href: "/dashboard/admin/payments", icon: Receipt },
  { label: "Plans", href: "/dashboard/admin/plans", icon: Package },
];

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();

  const NavLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all group ${
          active
            ? "bg-brand-900 text-white shadow-soft"
            : "text-gray-600 hover:bg-brand-50 hover:text-brand-800"
        }`}
        title={collapsed ? label : undefined}
      >
        <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-brand-700"}`} />
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } min-h-screen`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-gray-200 px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 ring-1 ring-brand-100">
              <Image src="/logo.png" alt="Cardamo" width={26} height={26} className="object-contain" />
            </span>
            <span className="font-display font-bold text-brand-900 tracking-tight text-lg">CARDAMO</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/">
            <Image src="/logo.png" alt="Cardamo" width={32} height={32} className="object-contain" />
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="rounded-lg p-1.5 text-gray-400 hover:text-brand-700 hover:bg-brand-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {/* User items */}
        <div className="space-y-0.5 px-2">
          {userNavItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className={`px-4 py-3 mt-4 ${collapsed ? "hidden" : ""}`}>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  Admin
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>
            <div className="space-y-0.5 px-2">
              {adminNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User profile at bottom */}
      <div className="border-t border-gray-200 p-4">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 shadow-soft">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 ring-1 ring-brand-100">
                <Zap className="h-3.5 w-3.5 text-brand-600" />
                <span className="text-xs font-bold text-brand-800">
                  {user?.credits ?? 0} credits
                </span>
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center rounded-lg p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}

// ─── Inner layout (uses auth context) ────────────────────────────────────────

function DashboardInner({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Guard: redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 rounded-full border-[3px] border-brand-100 border-t-brand-600 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="fixed left-14 top-4 z-50 rounded-lg border border-gray-200 bg-white p-1.5 shadow-soft hover:bg-brand-50"
          >
            <Menu className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 glass border-b border-gray-200 h-16 flex items-center px-4 md:px-6 gap-4">
          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          {/* Credit chip */}
          <div className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-1.5 ring-1 ring-brand-200">
            <Zap className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-sm font-bold text-brand-800">
              {user.credits} credits
            </span>
          </div>

          {/* User info */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 shadow-soft">
              <span className="text-xs font-bold text-white">
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// ─── Exported layout ─────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}
