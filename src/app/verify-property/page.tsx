"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { safeGet, safePost } from "@/lib/api";

interface AppUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
}

interface PropertyData {
  serial: string;
  itemName?: string;
  description?: string;
  ownerName?: string;
  owner?: { id?: string; _id?: string; name?: string; email?: string };
  status: "ACTIVE" | "STOLEN" | "RECOVERED" | string;
  ownershipHistory?: Array<{
    owner?: { id?: string; _id?: string; name?: string };
    from: string;
    to: string | null;
    reason: string;
    evidenceNote?: string;
  }>;
}

type HistoryOwner = NonNullable<PropertyData["ownershipHistory"]>[number]["owner"];

function userId(user?: AppUser | null) {
  return user?.id || user?._id || "";
}

function ownerId(owner?: PropertyData["owner"] | HistoryOwner) {
  return owner?.id || owner?._id || "";
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialPsid = searchParams.get("psid") || "";
  const successParam = searchParams.get("success");
  const [psid, setPsid] = useState(initialPsid);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [showSuccess, setShowSuccess] = useState(successParam === "true");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const handleVerify = async () => {
    if (!psid.trim()) {
      setError("Please enter a PSID");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await safeGet<PropertyData>(`/psid/serial/${encodeURIComponent(psid)}`);
      setProperty(data);
    } catch (err) {
      setProperty(null);
      setError(err instanceof Error ? err.message : "Property not found for this PSID.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPsid) void handleVerify();
  }, [initialPsid]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  const isOwner = property && currentUser && ownerId(property.owner) === userId(currentUser);
  const lastTransfer = property?.ownershipHistory?.slice().reverse().find((entry) => entry.reason === "TRANSFER");
  const isPreviousOwner = Boolean(lastTransfer && currentUser && ownerId(lastTransfer.owner) === userId(currentUser));

  const handleTransfer = async () => {
    if (!property || !transferEmail.trim()) return;
    setTransferring(true);
    try {
      await safePost(`/psid/${property.serial}/transfer`, { newOwnerEmail: transferEmail }, true);
      setShowTransferModal(false);
      setTransferEmail("");
      await handleVerify();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setTransferring(false);
    }
  };

  const handleRequestReversal = async () => {
    if (!property) return;
    const reason = prompt("Why was the transfer made under duress?");
    if (!reason) return;
    try {
      await safePost(`/psid/${property.serial}/request-reversal`, { reason }, true);
      alert("Reversal request submitted. An administrator will review it.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Reversal request failed");
    }
  };

  return (
    <main className="container section">
      <h1>Verify Property</h1>
      <p className="muted">Enter a PSID to verify ownership, current status, and ownership history.</p>

      {showSuccess && <div className="notice">Property registered successfully. Your PSID is <strong>{initialPsid}</strong>.</div>}
      {error && <div className="form-error">{error}</div>}

      <div className="verify-row">
        <input className="input" type="text" placeholder="Enter PSID" value={psid} onChange={(event) => setPsid(event.target.value)} />
        <button className="button" onClick={handleVerify} disabled={loading}>{loading ? "Verifying..." : "Verify"}</button>
      </div>

      {property && (
        <section className="card result-card">
          <div className="result-header">
            <div>
              <span className={`status-chip ${property.status.toLowerCase()}`}>{property.status}</span>
              <h2>{property.itemName || property.serial}</h2>
            </div>
            <strong>{property.serial}</strong>
          </div>

          <div className="result-grid">
            <div><strong>Description</strong>{property.description || "No description provided"}</div>
            <div><strong>Current Owner</strong>{property.owner?.name || property.ownerName || "Not publicly listed"}</div>
          </div>

          {(isOwner || isPreviousOwner) && (
            <div className="button-row">
              {isOwner && <button onClick={() => setShowTransferModal(true)} className="button">Transfer Ownership</button>}
              {isPreviousOwner && <button onClick={handleRequestReversal} className="button danger">Request Reversal</button>}
            </div>
          )}

          {!!property.ownershipHistory?.length && (
            <div className="history-list">
              <h3>Ownership History</h3>
              {property.ownershipHistory.map((entry, index) => (
                <div key={`${entry.from}-${index}`} className="history-item">
                  <span>{new Date(entry.from).toLocaleDateString()} to {entry.to ? new Date(entry.to).toLocaleDateString() : "Present"}</span>
                  <strong>{entry.owner?.name || "Unknown owner"}</strong>
                  <span>{entry.reason}</span>
                  {entry.evidenceNote && <em>{entry.evidenceNote}</em>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {showTransferModal && (
        <div className="modal-backdrop">
          <div className="card modal-card">
            <h2>Transfer Property</h2>
            <p className="muted">Enter the new owner email. They must already be registered.</p>
            <input className="input" type="email" placeholder="newowner@example.com" value={transferEmail} onChange={(event) => setTransferEmail(event.target.value)} />
            <div className="button-row modal-actions">
              <button onClick={() => setShowTransferModal(false)} className="button secondary">Cancel</button>
              <button onClick={handleTransfer} disabled={transferring} className="button">{transferring ? "Transferring..." : "Confirm Transfer"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function VerifyPropertyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
