/**
 * Thin fetch wrapper around the Recon FastAPI backend's /broker/* routes —
 * the same backend recon-frontend talks to, but every call here goes
 * through the broker-scoped endpoints (app/api/broker.py,
 * app/api/broker_auth.py on the backend), never the admin/reviewer ones.
 */

import type {
  AuditLogEntry,
  BrokerLoadDetail,
  BrokerLoadListItem,
  CarrierUser,
  DocumentUploadResponse,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const TOKEN_KEY = "recon_broker_token";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

async function extractErrorDetail(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      // FastAPI/Pydantic validation errors: [{loc, msg, type}, ...]
      return data.detail.map((d: any) => d.msg ?? JSON.stringify(d)).join(" ");
    }
    return JSON.stringify(data.detail ?? data);
  } catch {
    return res.statusText || `Request failed with status ${res.status}`;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof URLSearchParams) && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    throw new ApiError(res.status, await extractErrorDetail(res));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export const api = {
  // --- Auth ---
  login: (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });
    return request<{ access_token: string; token_type: string }>("/broker/auth/login", {
      method: "POST",
      body,
    });
  },
  acceptInvite: (token: string, password: string) =>
    request<{ access_token: string; token_type: string }>("/broker/auth/accept-invite", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  me: () => request<CarrierUser>("/broker/auth/me"),

  // --- Loads ---
  listLoads: () => request<BrokerLoadListItem[]>("/broker/loads"),
  getLoad: (id: string) => request<BrokerLoadDetail>(`/broker/loads/${id}`),
  getAuditTrail: (loadId: string) => request<AuditLogEntry[]>(`/broker/loads/${loadId}/audit`),

  // --- Responding / uploading ---
  respondToLoad: (loadId: string, message: string) =>
    request<void>(`/broker/loads/${loadId}/respond`, { method: "POST", body: JSON.stringify({ message }) }),
  uploadDocument: (params: { loadId: string; docType: "invoice" | "pod"; file: File }) => {
    const form = new FormData();
    form.append("doc_type", params.docType);
    form.append("file", params.file);
    return request<DocumentUploadResponse>(`/broker/loads/${params.loadId}/documents`, {
      method: "POST",
      body: form,
    });
  },

  // Fetches a source document as a Blob, auth header attached — a plain
  // <a href> can't carry the Bearer token a direct navigation would need.
  fetchDocumentFile: async (documentId: string): Promise<Blob> => {
    const token = getToken();
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(`${API_URL}/broker/documents/${documentId}/file`, { headers });
    if (!res.ok) {
      throw new ApiError(res.status, await extractErrorDetail(res));
    }
    return res.blob();
  },
};
