"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { safePost } from "@/lib/api";

function ReportContent() {
  const searchParams = useSearchParams();
  const psid = searchParams.get("psid") || "";

  const [form, setForm] = useState({
    psid: psid,
    propertyAddress: "",
    description: "",
    evidence: "",
    reporterName: "",
    reporterBadge: "",
    reporterEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await safePost("/law-enforcement/report", form);
      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-100 p-4 rounded mb-4">✅ Report submitted to law enforcement database.</div>
        <button onClick={() => window.location.href = "/dashboard"} className="bg-blue-600 text-white px-4 py-2 rounded">Return</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Law Enforcement Report</h1>
      <p className="text-gray-600 mb-6">Submit stolen property report for investigation.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={form.psid} disabled className="w-full p-2 border rounded bg-gray-100" />
        <input type="text" placeholder="Property Address" required className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, propertyAddress: e.target.value })} />
        <textarea placeholder="Description of stolen property" rows={3} required className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <textarea placeholder="Evidence / Witness information" rows={2} className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, evidence: e.target.value })} />
        <input type="text" placeholder="Your Name" required className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, reporterName: e.target.value })} />
        <input type="text" placeholder="Badge Number" required className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, reporterBadge: e.target.value })} />
        <input type="email" placeholder="Official Email" required className="w-full p-2 border rounded"
          onChange={(e) => setForm({ ...form, reporterEmail: e.target.value })} />
        <button type="submit" disabled={submitting} className="w-full bg-red-600 text-white py-2 rounded">
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}

export default function LawEnforcementReportPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ReportContent />
    </Suspense>
  );
}