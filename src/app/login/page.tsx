"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { safePost } from "@/lib/api";

interface AuthResponse {
  token: string;
  user: unknown;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await safePost<AuthResponse>("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container section">
      <div className="card auth-card">
        <h1>Login</h1>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <input type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="submit" disabled={loading} className="button">{loading ? "Signing in..." : "Login"}</button>
        </form>
        <p className="muted center">Do not have an account? <a href="/register">Register</a></p>
      </div>
    </main>
  );
}
