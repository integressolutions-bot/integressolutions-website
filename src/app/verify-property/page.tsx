 "use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { safeGet } from "@/lib/api";

interface PropertyData {
  psid: string;
  category: string;
  subCategory: string;
  serialNumber: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  location: string;
  purchaseDate: string;
  status: "verified" | "flagged" | "stolen" | "pending";
  registrationDate: string;
  verificationCount: number;
  lawEnforcementContact?: string;   // Will be country-specific later (global model)
  caseNumber?: string;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const initialPsid = searchParams.get("psid") || "";
  const successParam = searchParams.get("success");

  const [psid, setPsid] = useState(initialPsid);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(successParam === "true");

  const handleVerify = async () => {
    if (!psid.trim()) {
      setError("Please enter a PSID");
      return;
    }

    setLoading(true);
    setError("");
    setProperty(null);

    try {
      const data = await safeGet<PropertyData>(`/properties/verify?psid=${encodeURIComponent(psid)}`);
      setProperty(data);
    } catch (err: any) {
      setError(err.message || "Property not found for this PSID.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPsid) handleVerify();
  }, [initialPsid]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800";
      case "flagged": return "bg-yellow-100 text-yellow-800";
      case "stolen": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified": return "✅";
      case "flagged": return "⚠️";
      case "stolen": return "🚨";
      default: return "📋";
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Verify Property</h1>
      <p className="text-gray-600 mb-6">Enter a PSID to verify property ownership and status</p>

      {showSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✅ Property registered successfully! Your PSID is: <strong>{initialPsid}</strong>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter PSID (e.g., PSID-XXXXXX)"
          value={psid}
          onChange={(e) => setPsid(e.target.value)}
          className="flex-1 p-3 border rounded-lg text-lg"
        />
        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>

      {property && (
        <div className="border rounded-lg overflow-hidden">
          {/* Header */}
          <div className={`p-4 ${getStatusColor(property.status)} border-b`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-2xl mr-2">{getStatusIcon(property.status)}</span>
                <span className="font-bold uppercase">{property.status}</span>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-75">PSID</div>
                <div className="font-mono font-bold">{property.psid}</div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="p-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-sm text-gray-500">Category</div>
                <div className="font-medium">{property.category} › {property.subCategory}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Serial Number</div>
                <div className="font-mono text-sm">{property.serialNumber}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Description</div>
              <div>{property.description}</div>
            </div>

            <div className="border-t pt-3">
              <div className="text-sm text-gray-500 mb-2">Owner Information</div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400">Name</div>
                  <div>{property.ownerName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Email</div>
                  <div>{property.ownerEmail}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Phone</div>
                  <div>{property.ownerPhone}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Location</div>
                  <div>{property.location}</div>
                </div>
              </div>
            </div>

            {/* Law enforcement case – temporary Integres contact, will become country-specific later */}
            {property.status === "stolen" && property.caseNumber && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm font-semibold text-red-800">
                  🚨 Law Enforcement Case #{property.caseNumber}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Contact: {property.lawEnforcementContact || "Integres Support: support@integressolutions.com | +234 802 104 9037"}
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  Note: Law enforcement contacts are being onboarded per country. For now, report to Integres.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-500 border-t pt-3">
              <div>Registered: {new Date(property.registrationDate).toLocaleDateString()}</div>
              <div>Verifications: {property.verificationCount}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 p-4 flex gap-3 border-t">
            {(property.status === "stolen" || property.status === "flagged") && (
              <button
                onClick={() => window.location.href = `/law-enforcement/report?psid=${property.psid}`}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 text-sm"
              >
                👮 Report to Law Enforcement
              </button>
            )}
            
            <button
              onClick={() => window.location.href = `/blacklist/dispute?psid=${property.psid}`}
              className={`flex-1 py-2 rounded text-sm ${
                property.status === "verified" 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
              }`}
              disabled={property.status === "verified"}
            >
              ⚖️ Dispute This Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPropertyPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}