"use client";

import { useState } from "react";
import { safePost } from "@/lib/api";

function ResultCard({ result }: { result: any }) {
  const status = result?.status || result?.item?.status || "unknown";
  const owner = result?.ownerName || result?.item?.ownerName || "Not publicly shown";
  const serial = result?.serial || result?.item?.serial || "-";
  const reward = result?.reward || result?.item?.reward;

  return (
    <div className="card result-card">
      <div className="result-header">
        <div>
          <span className="badge">PSID result</span>
          <h3>{serial}</h3>
        </div>
        <span className={`status-chip ${String(status).toLowerCase()}`}>{status}</span>
      </div>
      <div className="result-grid">
        <div>
          <strong>Owner</strong>
          <p>{owner}</p>
        </div>
        <div>
          <strong>Public note</strong>
          <p>{result?.message || "Verification completed."}</p>
        </div>
      </div>
      {reward ? (
        <div className="notice" style={{ marginTop: "1rem" }}>
          Reward information may be available for qualifying recovery workflows.
        </div>
      ) : null}
    </div>
  );
}

export default function PsidPage() {
  const [serial, setSerial] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await safePost<any>("/mobile/psid/check", { serial: serial.trim() });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unable to verify item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container section">
      <h1>PSID Verification</h1>
      <p>
        Use the Product Serial Identification system to verify an item serial before
        purchase or recovery. For the best scan experience, use the PSID mobile app for QR,
        barcode, and photo-assisted serial capture.
      </p>
      <form className="card form" onSubmit={submit}>
        <input className="input" value={serial} onChange={(e) => setSerial(e.target.value)} placeholder="Enter serial number" required />
        <button className="button" disabled={loading}>{loading ? "Checking..." : "Verify Item"}</button>
      </form>
      {error ? <p style={{ color: "#ffb4b4" }}>{error}</p> : null}
      {result ? <ResultCard result={result} /> : null}
      <div className="card" style={{ marginTop: "1rem" }}>
        <h3>Need scan-first verification?</h3>
        <p>
          The PSID mobile app is designed for the strongest user experience, including QR,
          barcode, and photo-to-serial capture workflows.
        </p>
      </div>
    </main>
  );
}
