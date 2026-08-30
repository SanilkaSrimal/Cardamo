const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "cardamo_token";
const USER_KEY = "cardamo_user";

/** Notify all same-tab listeners (e.g. Navbar) that auth state changed. */
function dispatchAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cardamo:auth-change"));
  }
}

// ─── Token storage ──────────────────────────────────────────────────────────

export function setToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    dispatchAuthChange();
  }
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    dispatchAuthChange();
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  return getUser()?.role === "admin";
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  credits: number;
  role: "admin" | "user";
  created_at: string;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  total_credits: number;
  is_active: boolean;
  created_at: string;
}

export interface Payment {
  id: number;
  amount_lkr: number;
  credits_purchased: number;
  payment_ref: string;
  status: string;
  created_at: string;
  plan_name: string;
  plan_price?: number;
  user_name?: string;
  user_email?: string;
}

export interface HarvestingRecord {
  id: number;
  current_fresh_price_lkr_per_kg: number;
  drying_cost_total_lkr: number;
  storage_cost_total_lkr: number;
  quality_loss_pct_est: number;
  conversion_ratio: number;
  harvest_fresh_kg: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
