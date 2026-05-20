"use client";

import { useState } from "react";
import { safePost } from "@/lib/api";

type RegistrationForm = {
  serial: string;
  itemName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  notes: string;
};

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
  const [registration, setRegistration] = useState<RegistrationForm>({
    serial: "",
    itemName: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    notes: "",
  });
  const [registering, setRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState("");

  const handleRegistrationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRegistration((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

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

  const submitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setRegistrationError("");
    setRegistrationMessage("");

    try {
      const response = await fetch("/api/psid-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...registration,
          serial: registration.serial.trim(),
          itemName: registration.itemName.trim(),
          ownerName: registration.ownerName.trim(),
          ownerEmail: registration.ownerEmail.trim(),
          ownerPhone: registration.ownerPhone.trim(),
          notes: registration.notes.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to save registration");
      }

      setRegistration({
        serial: "",
        itemName: "",
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        notes: "",
      });
      setRegistrationMessage(
        "Registration saved. Payment can be completed later when the payment system is ready.",
      );
    } catch (err: any) {
      setRegistrationError(err.message || "Unable to save registration");
    } finally {
      setRegistering(false);
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
      <section className="card psid-registration">
        <div>
          <span className="badge">Registration</span>
          <h2>Register a PSID item</h2>
          <p>
            Save item and owner details now. These records are stored in the site database
            with payment marked as pending until the payment workflow is available.
          </p>
        </div>
        <form className="form" onSubmit={submitRegistration}>
          <div className="form-grid">
            <input
              className="input"
              name="serial"
              value={registration.serial}
              onChange={handleRegistrationChange}
              placeholder="PSID serial number"
              required
            />
            <input
              className="input"
              name="itemName"
              value={registration.itemName}
              onChange={handleRegistrationChange}
              placeholder="Item or property name"
              required
            />
            <input
              className="input"
              name="ownerName"
              value={registration.ownerName}
              onChange={handleRegistrationChange}
              placeholder="Owner name"
              required
            />
            <input
              className="input"
              type="email"
              name="ownerEmail"
              value={registration.ownerEmail}
              onChange={handleRegistrationChange}
              placeholder="Owner email"
              required
            />
            <input
              className="input"
              name="ownerPhone"
              value={registration.ownerPhone}
              onChange={handleRegistrationChange}
              placeholder="Phone number"
            />
          </div>
          <textarea
            className="textarea"
            name="notes"
            value={registration.notes}
            onChange={handleRegistrationChange}
            placeholder="Notes, address, or recovery details"
          />
          <button className="button" disabled={registering}>
            {registering ? "Saving..." : "Save Registration"}
          </button>
        </form>
        {registrationError ? <p style={{ color: "#ffb4b4" }}>{registrationError}</p> : null}
        {registrationMessage ? <div className="notice">{registrationMessage}</div> : null}
      </section>
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
