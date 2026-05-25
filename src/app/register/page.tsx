"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { safePost } from "@/lib/api";

interface AuthResponse {
  token: string;
  user: unknown;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await safePost<AuthResponse>("/auth/register", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container section">
      <div className="card auth-card">
        <h1>Create Account</h1>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <input type="text" placeholder="Full name" className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <input type="email" placeholder="Email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input type="password" placeholder="Password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input type="tel" placeholder="Phone (optional)" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button type="submit" disabled={loading} className="button">{loading ? "Creating..." : "Register"}</button>
        </form>
        <p className="muted center">Already have an account? <a href="/login">Login</a></p>
      </div>
    </main>
  );
}
