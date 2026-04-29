"use client";

import { useState } from "react";
import { safePost } from "@/lib/api";

function BlacklistResultCard({ result }: { result: any }) {
  const records = Array.isArray(result?.records)
    ? result.records
    : Array.isArray(result?.results)
      ? result.results
      : result?.record
        ? [result.record]
        : [];

  if (!records.length) {
    return (
      <div className="card result-card">
        <div className="result-header">
          <div>
            <span className="badge">Check result</span>
            <h3>No matching public record found</h3>
          </div>
          <span className="status-chip clear">Clear</span>
        </div>
        <p>This search did not return a public blacklist match.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {records.map((record: any, index: number) => {
        const name = record?.name || record?.subjectName || record?.entityName || `Record ${index + 1}`;
        const category = record?.category || "General";
        const status = record?.status || record?.publicationStatus || "Listed";
        const summary = record?.summary || record?.reason || "Public record available.";
        return (
          <div className="card result-card" key={`${name}-${index}`}>
            <div className="result-header">
              <div>
                <span className="badge">Blacklist result</span>
                <h3>{name}</h3>
              </div>
              <span className={`status-chip ${String(status).toLowerCase().replace(/\s+/g, "-")}`}>{status}</span>
            </div>
            <div className="result-grid">
              <div>
                <strong>Category</strong>
                <p>{category}</p>
              </div>
              <div>
                <strong>Public summary</strong>
                <p>{summary}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BlacklistPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await safePost<any>("/mobile/blacklist/check", { query: query.trim() });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unable to check blacklist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container section">
      <h1>Integres Blacklist</h1>
      <p>
        Run a public blacklist check for free. Paid reporting, disputes, evidence upload,
        and removal requests are handled through the Integres Blacklist mobile app under
        the platform fee policy.
      </p>
      <div className="price-list" style={{ marginBottom: "1rem" }}>
        <div className="price-item"><span>Check/search</span><strong>Free</strong></div>
        <div className="price-item"><span>Report - individuals</span><strong>From ₦15,000</strong></div>
        <div className="price-item"><span>Report - companies</span><strong>From ₦30,000</strong></div>
        <div className="price-item"><span>Removal request</span><strong>Paid after resolution</strong></div>
      </div>
      <div className="notice" style={{ marginBottom: "1rem" }}>
        Public website search is free. Use the mobile app for paid report submission,
        evidence-backed disputes, removal requests, and mediation-related workflow.
      </div>
      <form className="card form" onSubmit={submit}>
        <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter a name, company, or identifier" required />
        <button className="button" disabled={loading}>{loading ? "Checking..." : "Run Free Check"}</button>
      </form>
      {error ? <p style={{ color: "#ffb4b4" }}>{error}</p> : null}
      {result ? <BlacklistResultCard result={result} /> : null}
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3>Need reporting or removal?</h3>
        <p>
          Reporting, disputes, removal requests, and evidence-backed submissions are
          completed through the Integres Blacklist app, where fees, status updates, and
          workflow steps are handled more safely.
        </p>
      </div>
    </main>
  );
}
