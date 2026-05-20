export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://integres-backend.up.railway.app/api";

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
