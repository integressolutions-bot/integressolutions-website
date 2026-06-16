"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { safePost, safeGet } from "@/lib/api";

interface PsidResult {
  status: "clean" | "flagged" | "stolen" | "unknown";
  ownerName?: string;
  serial: string;
  reward?: number | null;
  message?: string;
  reportedAt?: string;
}

const CATEGORIES = [
  { value: "electronics", label: "Electronics", icon: "📱" },
  { value: "vehicle", label: "Vehicle", icon: "🚗" },
  { value: "real_estate", label: "Real Estate", icon: "🏠" },
  { value: "jewelry", label: "Jewelry", icon: "💍" },
  { value: "other", label: "Other", icon: "📦" },
];

function ResultCard({ result }: { result: PsidResult }) {
  const statusColors = {
    clean: { bg: "#d1fae5", text: "#065f46", label: "Clean" },
    flagged: { bg: "#fef3c7", text: "#92400e", label: "Flagged" },
    stolen: { bg: "#fee2e2", text: "#991b1b", label: "Stolen" },
    unknown: { bg: "#f3f4f6", text: "#374151", label: "Unknown" }
  };
  const color = statusColors[result.status] || statusColors.unknown;

  return (
    <div className="border border-gray-200 rounded-xl p-6 mt-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">PSID result</span>
          <h3 className="text-xl font-bold text-gray-900 mt-2">{result.serial}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${color.bg} ${color.text}`}>
          {color.label}
        </span>
      </div>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <strong className="text-gray-700">Owner</strong>
          <p className="text-gray-600">{result.ownerName || "Not publicly shown"}</p>
        </div>
        <div>
          <strong className="text-gray-700">Public note</strong>
          <p className="text-gray-600">{result.message || "Verification completed."}</p>
        </div>
      </div>
      {result.reward && (
        <div className="bg-yellow-50 p-3 rounded-md text-sm text-gray-700 border border-yellow-200">
          💰 Reward information may be available for qualifying recovery workflows.
        </div>
      )}
      {result.status === "stolen" && (
        <div className="bg-red-50 p-3 rounded-md text-sm text-red-700 border border-red-200">
          ⚠️ This item has been reported as stolen. Please contact authorities.
        </div>
      )}
    </div>
  );
}

export default function PsidPage() {
  const router = useRouter();
  const [serial, setSerial] = useState("");
  const [result, setResult] = useState<PsidResult | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Registration form state
  const [regForm, setRegForm] = useState({
    serial: "",
    itemName: "",
    category: "electronics",
    subCategory: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    notes: "",
  });
  const [regError, setRegError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Sub-categories mapping
  const subCategories: Record<string, string[]> = {
    electronics: ["Smartphone", "Laptop", "Tablet", "Desktop", "Camera", "TV", "Gaming Console", "Audio Equipment", "Other"],
    vehicle: ["Car", "Motorcycle", "Truck", "Bus", "Bicycle", "Boat", "Aircraft", "Other"],
    real_estate: ["House", "Apartment", "Land", "Commercial Building", "Office Space", "Warehouse", "Other"],
    jewelry: ["Ring", "Necklace", "Bracelet", "Earrings", "Watch", "Gemstone", "Gold", "Silver", "Other"],
    other: ["Art", "Antique", "Collectible", "Furniture", "Tool", "Equipment", "Specify"],
  };

  const getSubCategories = () => subCategories[regForm.category] || [];

  // --- Verification Handler ---
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim()) return;
    setIsVerifying(true);
    setVerifyError("");
    setResult(null);
    try {
      const data = await safeGet<PsidResult>(`/psid/serial/${encodeURIComponent(serial.trim())}`);
      setResult(data);
    } catch (err: any) {
      setVerifyError(err.message || "Unable to verify item. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // --- Registration Handler ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegError("");
    try {
      // Ensure subCategory is set; if "Other" or "Specify", use custom input (you can add a custom field)
      const payload = {
        ...regForm,
        subCategory: regForm.subCategory || "General",
      };
      const result = await safePost<{ serial: string }>("/psid/register", payload, true);
      alert(`✅ Item registered successfully! PSID: ${result.serial}`);
      router.push(`/verify-property?psid=${result.serial}&success=true`);
      setRegForm({
        serial: "",
        itemName: "",
        category: "electronics",
        subCategory: "",
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        notes: "",
      });
    } catch (err: any) {
      setRegError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">🔐 PSID – Property Secure Identification</h1>
      <p className="text-gray-700 mb-6">
        PSID is a unique identifier that helps protect your property, verify ownership, and assist in recovery.
        Register your valuable items – from electronics and vehicles to real estate and jewelry – and generate a secure PSID
        with a QR code for easy verification.
      </p>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">📋 How PSID Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-white p-3 rounded border border-gray-200">
            <span className="font-bold text-blue-600 block">1. Register</span>
            <span className="text-gray-700">Add your item details (category, serial, description, owner info).</span>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <span className="font-bold text-purple-600 block">2. Get PSID</span>
            <span className="text-gray-700">A unique PSID and QR code are generated for your item.</span>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <span className="font-bold text-green-600 block">3. Verify</span>
            <span className="text-gray-700">Anyone can verify ownership by scanning the QR code or entering the PSID.</span>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <span className="font-bold text-red-600 block">4. Protect</span>
            <span className="text-gray-700">Report stolen, set rewards, transfer ownership, and track history.</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          💡 <strong>Tip:</strong> Registering your items with PSID increases the chance of recovery if lost or stolen.
        </p>
      </div>

      {/* ========== TWO ACTION BUTTONS ========== */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => {
            document.getElementById("verify-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔍 Verify a PSID
        </button>
        <button
          onClick={() => {
            document.getElementById("register-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          ➕ Register a New PSID
        </button>
      </div>

      {/* ========== VERIFICATION SECTION ========== */}
      <div id="verify-section" className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🔍 Verify a PSID</h2>
        <p className="text-gray-700 mb-4">
          Enter a PSID to check the status and ownership details of any registered item.
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="serial" className="block text-sm font-medium text-gray-700 mb-1">PSID Serial Number *</label>
            <input
              type="text"
              id="serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Enter serial number (e.g., PSID-ABC123)"
              required
              className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isVerifying ? "Verifying..." : "Verify Item"}
          </button>
        </form>
        {verifyError && <div className="mt-3 bg-red-100 text-red-700 p-2 rounded">{verifyError}</div>}
        {result && <ResultCard result={result} />}
      </div>

      {/* ========== REGISTRATION SECTION ========== */}
      <div id="register-section" className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">➕ Register a New PSID</h2>
        <p className="text-gray-700 mb-4">
          Protect your valuable items. Registration is free and gives you a permanent, verifiable record of ownership.
          <br />
          <span className="text-sm text-gray-500">* You must be logged in to register a property.</span>
        </p>

        {regError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{regError}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setRegForm({ ...regForm, category: cat.value, subCategory: "" })}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    regForm.category === cat.value
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category *</label>
            <select
              value={regForm.subCategory}
              onChange={(e) => setRegForm({ ...regForm, subCategory: e.target.value })}
              required
              className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white"
            >
              <option value="">Select sub-category</option>
              {getSubCategories().map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PSID Serial Number *</label>
              <input
                type="text"
                value={regForm.serial}
                onChange={(e) => setRegForm({ ...regForm, serial: e.target.value })}
                placeholder="Enter a unique serial number"
                required
                className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item/Property Name *</label>
              <input
                type="text"
                value={regForm.itemName}
                onChange={(e) => setRegForm({ ...regForm, itemName: e.target.value })}
                placeholder="e.g., MacBook Pro 2024"
                required
                className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
              <input
                type="text"
                value={regForm.ownerName}
                onChange={(e) => setRegForm({ ...regForm, ownerName: e.target.value })}
                placeholder="Your full name"
                required
                className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email *</label>
              <input
                type="email"
                value={regForm.ownerEmail}
                onChange={(e) => setRegForm({ ...regForm, ownerEmail: e.target.value })}
                placeholder="Your email address"
                required
                className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={regForm.ownerPhone}
                onChange={(e) => setRegForm({ ...regForm, ownerPhone: e.target.value })}
                placeholder="Phone number (optional)"
                className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Recovery Details</label>
            <textarea
              rows={3}
              value={regForm.notes}
              onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
              placeholder="Add any extra details (colour, distinguishing features, etc.)"
              className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <p className="text-sm text-gray-700">
              💡 <strong>After registration:</strong> You'll receive a unique PSID and a QR code.
              You can <strong>transfer ownership</strong>, <strong>report stolen</strong>, and <strong>set rewards</strong> for recovery.
            </p>
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-gray-600 disabled:bg-gray-400"
          >
            {isRegistering ? "Registering..." : "Register & Get PSID"}
          </button>
        </form>
      </div>

      {/* ========== FOOTER NOTE ========== */}
      <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-200 pt-4">
        <p>
          The PSID mobile app provides QR scanning, barcode capture, and photo-to-serial workflows for the best verification experience.
        </p>
      </div>
    </div>
  );
}