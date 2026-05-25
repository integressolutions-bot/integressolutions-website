"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { safePost } from "@/lib/api";

interface PractitionerRegisterResponse {
  token?: string;
  user?: unknown;
  requiresApproval?: boolean;
}

export default function PractitionerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    barNumber: "",
    nbaBranch: "",
    specialization: "",
    yearsOfExperience: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await safePost<PractitionerRegisterResponse>("/practitioner/register", form);
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/practitioners");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container section">
      <div className="card auth-card wide">
        <h1>Practitioner Registration</h1>
        <p className="muted">Create a practitioner profile for dispute handling and approval review.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit} className="form">
          <div className="form-grid">
            <input className="input" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <input className="input" type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" placeholder="Bar number" value={form.barNumber} onChange={(e) => setForm({ ...form, barNumber: e.target.value })} required />
            <input className="input" placeholder="NBA branch" value={form.nbaBranch} onChange={(e) => setForm({ ...form, nbaBranch: e.target.value })} required />
            <input className="input" placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
            <input className="input" type="number" min="0" placeholder="Years of experience" value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })} required />
          </div>
          <input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          <button className="button" disabled={loading}>{loading ? "Submitting..." : "Submit Registration"}</button>
        </form>
      </div>
    </main>
  );
}
