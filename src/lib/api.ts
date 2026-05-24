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

  return (parsed?.data ?? parsed) as T;
}

// Helper for POST requests (JSON)
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

  // Some APIs return { success: true, data: T }
  // Others return T directly. Adjust as needed.
  if (!response.ok) {
    throw new Error(parsed?.message || "Request failed");
  }

  // If the API uses { success, data } pattern
  if (parsed && typeof parsed === 'object' && 'success' in parsed && !parsed.success) {
    throw new Error(parsed.message || "Request failed");
  }

  return (parsed?.data ?? parsed) as T;
}

// Helper for file uploads (FormData)
export async function safeUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    // Do not set Content-Type header – browser sets it with boundary
  });

  const text = await response.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(text || "Unexpected response from server");
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