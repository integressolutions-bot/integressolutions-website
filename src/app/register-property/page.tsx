"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { safePost } from "@/lib/api";

interface PropertyFormData {
  category: string;
  subCategory: string;
  customSubCategory: string;
  serialNumber: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  location: string;
  purchaseDate: string;
  proofOfOwnership: string;
  additionalNotes: string;
}

const CATEGORIES = {
  electronics: {
    label: "Electronics",
    subCategories: ["Smartphone", "Laptop", "Tablet", "Desktop", "Camera", "TV", "Gaming Console", "Audio Equipment", "Other"]
  },
  vehicle: {
    label: "Vehicle",
    subCategories: ["Car", "Motorcycle", "Truck", "Bus", "Bicycle", "Boat", "Aircraft", "Other"]
  },
  real_estate: {
    label: "Real Estate",
    subCategories: ["House", "Apartment", "Land", "Commercial Building", "Office Space", "Warehouse", "Other"]
  },
  jewelry: {
    label: "Jewelry",
    subCategories: ["Ring", "Necklace", "Bracelet", "Earrings", "Watch", "Gemstone", "Gold", "Silver", "Other"]
  },
  other: {
    label: "Other",
    subCategories: ["Art", "Antique", "Collectible", "Furniture", "Tool", "Equipment", "Specify"]
  }
};

export default function RegisterPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<PropertyFormData>({
    category: "electronics",
    subCategory: "",
    customSubCategory: "",
    serialNumber: "",
    description: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    location: "",
    purchaseDate: "",
    proofOfOwnership: "",
    additionalNotes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, category: e.target.value, subCategory: "", customSubCategory: "" });
  };

  const getSubCategories = () => {
    const cat = CATEGORIES[form.category as keyof typeof CATEGORIES];
    return cat ? cat.subCategories : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const finalSubCategory = form.subCategory === "Other" || form.subCategory === "Specify" 
      ? form.customSubCategory 
      : form.subCategory;

    try {
      const result = await safePost<{ psid: string; propertyId: string }>("/properties/register", {
        ...form,
        subCategory: finalSubCategory
      });
      setSuccess(`Property registered successfully! Your PSID: ${result.psid}`);
      setTimeout(() => {
        router.push(`/verify-property?psid=${result.psid}&success=true`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Register Property</h1>
      <p className="text-gray-600 mb-6">Register your item to generate a unique PSID for verification and protection</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Property Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleCategoryChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="electronics">Electronics</option>
              <option value="vehicle">Vehicle</option>
              <option value="real_estate">Real Estate</option>
              <option value="jewelry">Jewelry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Sub-Category *</label>
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select sub-category</option>
              {getSubCategories().map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Sub-Category Input */}
        {(form.subCategory === "Other" || form.subCategory === "Specify") && (
          <div>
            <label className="block font-semibold mb-1">Please specify *</label>
            <input
              type="text"
              name="customSubCategory"
              value={form.customSubCategory}
              onChange={handleChange}
              placeholder="Enter specific category"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        )}

        {/* Serial/Identification */}
        <div>
          <label className="block font-semibold mb-1">Serial/Identification Number *</label>
          <input
            type="text"
            name="serialNumber"
            value={form.serialNumber}
            onChange={handleChange}
            placeholder="IMEI, VIN, Serial #, etc."
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-1">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brand, model, color, distinguishing features..."
            rows={3}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Owner Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Owner Name *</label>
            <input
              type="text"
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Owner Email *</label>
            <input
              type="email"
              name="ownerEmail"
              value={form.ownerEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Owner Phone *</label>
            <input
              type="tel"
              name="ownerPhone"
              value={form.ownerPhone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Location/Address *</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="City, State or full address"
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block font-semibold mb-1">Purchase/Acquisition Date</label>
          <input
            type="date"
            name="purchaseDate"
            value={form.purchaseDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Proof of Ownership */}
        <div>
          <label className="block font-semibold mb-1">Proof of Ownership (URL/Reference)</label>
          <input
            type="text"
            name="proofOfOwnership"
            value={form.proofOfOwnership}
            onChange={handleChange}
            placeholder="Receipt #, document ID, or cloud storage link"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block font-semibold mb-1">Additional Notes</label>
          <textarea
            name="additionalNotes"
            value={form.additionalNotes}
            onChange={handleChange}
            placeholder="Any other relevant information"
            rows={2}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? "Registering..." : "Register Property & Get PSID"}
        </button>
      </form>
    </div>
  );
}