// src/lib/api.ts

// Use relative path so requests go through Netlify proxy
export const API_BASE = "/api";

// Helper for GET requests
export async function safeGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || "Unexpected response from server");
  }

  if (!response.ok) {
    throw new Error(parsed?.message || "Request failed");
  }

  return parsed?.data || parsed as T;
}

// Helper for POST requests with proper error handling
export async function safePost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || "Unexpected response from server");
  }

  if (!response.ok || !parsed?.success) {
    throw new Error(parsed?.message || "Request failed");
  }

  return parsed.data as T;
}