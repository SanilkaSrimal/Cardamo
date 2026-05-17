import { getToken, clearAuth, setUser } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Re-fetch the current user and update localStorage so credit counts stay in sync. */
export async function refreshCredits(): Promise<void> {
  const token = getToken();
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const user = await res.json();
      setUser(user); // triggers cardamo:auth-change → Navbar re-renders
    }
  } catch {
    // silently ignore — credit display will be stale until next refresh
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData bodies
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const json = await res.json();
      detail = json.detail || detail;
    } catch {}
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (data: { name: string; email: string; password: string }) =>
      request<{ access_token: string; user: any }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    login: (data: { email: string; password: string }) =>
      request<{ access_token: string; user: any }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    me: () => request<any>("/api/auth/me"),
  },

  // ─── Users ───────────────────────────────────────────────────────────────
  users: {
    list: () => request<any[]>("/api/users/"),
    get: (id: number) => request<any>(`/api/users/${id}`),
    update: (id: number, data: any) =>
      request<any>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<null>(`/api/users/${id}`, { method: "DELETE" }),
  },

  // ─── Plans ───────────────────────────────────────────────────────────────
  plans: {
    list: () => request<any[]>("/api/plans/"),
    listAll: () => request<any[]>("/api/plans/all"),
    create: (data: any) =>
      request<any>("/api/plans/", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      request<any>(`/api/plans/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<null>(`/api/plans/${id}`, { method: "DELETE" }),
  },

  // ─── Payments ────────────────────────────────────────────────────────────
  payments: {
    activate: (plan_id: number) =>
      request<any>("/api/payments/activate", {
        method: "POST",
        body: JSON.stringify({ plan_id }),
      }),
    my: () => request<any[]>("/api/payments/my"),
    all: () => request<any[]>("/api/payments/"),
  },

  // ─── Harvesting ──────────────────────────────────────────────────────────
  harvesting: {
    my: () => request<any[]>("/api/harvesting/my"),
    create: (data: any) =>
      request<any>("/api/harvesting/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/api/harvesting/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<null>(`/api/harvesting/${id}`, { method: "DELETE" }),
  },
};

export { ApiError };

// ─── Legacy named exports (used by existing AI pages) ────────────────────────

const API_BASE_DIRECT =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Build auth headers, attaching Bearer token if present. */
function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken();
  return token
    ? { Authorization: `Bearer ${token}`, ...extra }
    : { ...extra };
}

/** Upload a file to an AI endpoint (attaches JWT). */
async function postFormData(path: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_DIRECT}${path}`, {
    method: "POST",
    headers: authHeaders(), // JWT — no Content-Type for FormData
    body: formData,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function predictPodDisease(file: File): Promise<any> {
  return postFormData("/api/pod-disease/predict", file);
}

export async function predictLeafDisease(file: File): Promise<any> {
  return postFormData("/api/leaf-disease/predict", file);
}

export async function predictGrading(file: File): Promise<any> {
  return postFormData("/api/grading/predict", file);
}

export async function predictMarketPrice(data: {
  date: string;
  region: string;
  grade: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_DIRECT}/api/market/predict-price`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function getMarketRecommendation(data: {
  date: string;
  region: string;
  grade: string;
  harvest_fresh_kg: number;
  current_fresh_price_lkr_per_kg: number;
  drying_cost_total_lkr: number;
  storage_cost_total_lkr: number;
  quality_loss_pct_est: number;
  conversion_ratio: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE_DIRECT}/api/market/recommend`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function submitContactForm(data: {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  message: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_DIRECT}/api/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}
