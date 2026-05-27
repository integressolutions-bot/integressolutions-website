// src/lib/api.ts

export const API_BASE = "/api";

// Helper to get auth headers when needed
const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ✅ Generic GET request
export async function safeGet<T>(path: string, requireAuth = false): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (requireAuth) Object.assign(headers, getAuthHeaders());

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const text = await res.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || 'Invalid response');
  }

  if (!res.ok) {
    throw new Error(parsed?.message || 'Request failed');
  }

  return (parsed?.data ?? parsed) as T;
}

// ✅ Generic POST request
export async function safePost<T>(path: string, body: unknown, requireAuth = false): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (requireAuth) Object.assign(headers, getAuthHeaders());

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await res.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || 'Invalid response');
  }

  if (!res.ok || (parsed && parsed.success === false)) {
    throw new Error(parsed?.message || 'Request failed');
  }

  return (parsed?.data ?? parsed) as T;
}

// ✅ Generic file upload
export async function safeUpload<T>(path: string, formData: FormData, requireAuth = false): Promise<T> {
  const headers: HeadersInit = {};
  if (requireAuth) Object.assign(headers, getAuthHeaders());

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await res.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || 'Invalid response');
  }

  if (!res.ok) {
    throw new Error(parsed?.message || 'Upload failed');
  }

  return (parsed?.data ?? parsed) as T;
}export const API_BASE = "/api";

const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function safeGet<T>(path: string, requireAuth = false): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (requireAuth) Object.assign(headers, getAuthHeaders());

  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || "Invalid response");
  }

  if (!response.ok) {
    throw new Error(parsed?.message || "Request failed");
  }

  return (parsed?.data ?? parsed) as T;
}

// Helper for POST requests (JSON)
export async function safePost<T>(path: string, body: unknown, requireAuth = false): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (requireAuth) Object.assign(headers, getAuthHeaders());

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || "Invalid response");
  }

  if (!response.ok || (parsed && typeof parsed === "object" && "success" in parsed && !parsed.success)) {
    throw new Error(parsed?.message || "Request failed");
  }

  return (parsed?.data ?? parsed) as T;
}

export async function safeUpload<T>(path: string, formData: FormData, requireAuth = false): Promise<T> {
  const headers: HeadersInit = {};
  if (requireAuth) Object.assign(headers, getAuthHeaders());

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || "Invalid response");
  }

  if (!response.ok) {
    throw new Error(parsed?.message || "Upload failed");
  }

  // Some APIs return { success, data }; some return data directly.
  if (parsed && typeof parsed === 'object' && 'success' in parsed && !parsed.success) {
    throw new Error(parsed.message || "Upload failed");
  }

  return (parsed?.data ?? parsed) as T;
}
