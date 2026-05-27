 // src/lib/api.ts

export const API_BASE = "/api";

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

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
}
