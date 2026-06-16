"use client";

import { useState, useEffect } from "react";
import { safePost, safeUpload } from "@/lib/api";

interface BlacklistResult {
  found: boolean;
  records?: Array<{
    name: string;
    type: string;
    reason: string;
    dateReported: string;
    status: string;
  }>;
}

const CATEGORIES = [
  { value: "LANDLORD_TENANT", label: "Landlord & Tenant", description: "Rent disputes, eviction issues, property damage" },
  { value: "COMPANY_CONTRACTOR", label: "Service Providers", description: "Contract breaches, substandard work, payment disputes" },
  { value: "EMPLOYER_EMPLOYEE", label: "Employer / Employee", description: "Salary issues, wrongful termination, workplace misconduct" },
  { value: "SOCIAL", label: "Relationships", description: "Personal disputes, fraud, trust issues" },
  { value: "OTHER", label: "Other", description: "Matters that don't fit the above categories" },
];

export default function BlacklistPage() {
  // ---------- Search state ----------
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<BlacklistResult | null>(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // ---------- Report form state ----------
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectEmail, setSubjectEmail] = useState("");
  const [subjectPhone, setSubjectPhone] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem("blacklist_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {}
    }
  }, []);

  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("blacklist_searches", JSON.stringify(updated));
  };

  // Search handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    setResult(null);
    try {
      const data = await safePost<BlacklistResult>("/blacklist/check", { query: query.trim() });
      setResult(data);
      saveSearch(query.trim());
    } catch (err: any) {
      setSearchError(err.message || "Unable to check blacklist");
    } finally {
      setSearching(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    setTimeout(() => handleSearch({ preventDefault: () => {} } as React.FormEvent), 100);
  };

  // Report submission handler
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setReportError("Please select a category");
      return;
    }
    if (!subjectName.trim()) {
      setReportError("Please enter the name of the person/company");
      return;
    }
    if (!description.trim()) {
      setReportError("Please provide a description of the issue");
      return;
    }
    setSubmitting(true);
    setReportError("");
    setReportSuccess(false);

    const formData = new FormData();
    formData.append("name", subjectName);
    formData.append("category", selectedCategory);
    formData.append("reason", description);
    formData.append("subjectEmail", subjectEmail);
    formData.append("subjectPhone", subjectPhone);
    if (evidenceFile) formData.append("files", evidenceFile);

    try {
      await safeUpload("/blacklist/submit-due-diligence", formData, true);
      setReportSuccess(true);
      // Reset form
      setSelectedCategory("");
      setSubjectName("");
      setSubjectEmail("");
      setSubjectPhone("");
      setDescription("");
      setEvidenceFile(null);
      setTimeout(() => setShowReportForm(false), 3000);
    } catch (err: any) {
      setReportError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Integres Blacklist</h1>
      <p className="text-gray-600 mb-6">
        The Integres Blacklist is a public record of individuals and companies that have been reported for misconduct, fraud, or breach of trust.
        Reports are reviewed by our team before publication to ensure fairness and accuracy.
      </p>

      {/* Two action buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setShowReportForm(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔍 Search the Blacklist
        </button>
        <button
          onClick={() => setShowReportForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          ➕ Submit a Report
        </button>
      </div>

      {/* ========== HOW IT WORKS SECTION ========== */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
        <h2 className="text-xl font-bold text-gray-900 mb-2">📋 How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
          <div><span className="font-bold text-red-600">1. Submit</span><br/>Submit a report with evidence (no payment required).</div>
          <div><span className="font-bold text-yellow-600">2. Review</span><br/>Our team reviews the report for validity and completeness.</div>
          <div><span className="font-bold text-blue-600">3. Pay</span><br/>If approved, you'll be asked to pay a fee to publish the report.</div>
          <div><span className="font-bold text-green-600">4. Publish</span><br/>The report becomes public. The subject is notified and can dispute.</div>
        </div>
      </div>

      {/* ========== FREE SEARCH SECTION ========== */}
      {!showReportForm && (
        <>
          <div className="bg-gray-100 p-4 rounded-lg flex gap-4 mb-6 flex-wrap">
            <div><span className="font-medium">Check / Search</span><br/><span className="text-green-600 font-bold">Free</span></div>
            <div><span className="font-medium">Report - Individuals</span><br/><span className="font-bold">From ₦15,000</span></div>
            <div><span className="font-medium">Report - Companies</span><br/><span className="font-bold">From ₦30,000</span></div>
          </div>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a name, company, or identifier"
                required
                className="flex-1 p-2 border rounded text-gray-900 bg-white"
              />
              <button
                type="submit"
                disabled={searching}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:bg-gray-400"
              >
                {searching ? "Checking..." : "Run Free Check"}
              </button>
            </div>
          </form>

          {searchError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{searchError}</div>}

          {recentSearches.length > 0 && !result && !searching && (
            <div className="mb-4">
              <p className="text-sm text-gray-500">Recent searches:</p>
              <div className="flex gap-2 flex-wrap">
                {recentSearches.map(term => (
                  <button key={term} onClick={() => handleQuickSearch(term)} className="bg-gray-200 px-2 py-1 rounded text-sm">
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg ${result.found ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
              <h2 className="font-bold text-lg">{result.found ? '⚠️ Record Found' : '✅ Clean Record'}</h2>
              {result.found && result.records ? (
                result.records.map((record, idx) => (
                  <div key={idx} className="mt-3 pt-3 border-t">
                    <p><strong>Name:</strong> {record.name}</p>
                    <p><strong>Category:</strong> {record.type}</p>
                    <p><strong>Reason:</strong> {record.reason}</p>
                    <p><strong>Reported:</strong> {new Date(record.dateReported).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> <span className="capitalize">{record.status}</span></p>
                  </div>
                ))
              ) : (
                <p>No blacklist records found for "{query}".</p>
              )}
            </div>
          )}
        </>
      )}

      {/* ========== REPORT FORM SECTION ========== */}
      {showReportForm && (
        <div className="border rounded-lg p-6 bg-white shadow">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Submit a Blacklist Report</h2>
          <p className="text-gray-600 mb-4">
            Reports are submitted for review at no cost. If approved, you will be guided through payment before publication.
          </p>

          {reportSuccess && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              ✅ Your report has been submitted. We'll contact you via email within 2 business days.
            </div>
          )}

          {reportError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{reportError}</div>}

          <form onSubmit={handleSubmitReport} className="space-y-4">
            {/* Category selection */}
            <div>
              <label className="block font-semibold mb-2 text-gray-900">Category *</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      selectedCategory === cat.value
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {selectedCategory && (
                <p className="text-xs text-gray-500 mt-1">
                  {CATEGORIES.find(c => c.value === selectedCategory)?.description}
                </p>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-900">Name of person/company *</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                className="w-full border p-2 rounded text-gray-900 bg-white"
                placeholder="Enter the full name"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-900">Email of the person/company (optional)</label>
              <input
                type="email"
                value={subjectEmail}
                onChange={(e) => setSubjectEmail(e.target.value)}
                className="w-full border p-2 rounded text-gray-900 bg-white"
                placeholder="If provided, they will be notified when the report is published"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-900">Phone of the person/company (optional)</label>
              <input
                type="tel"
                value={subjectPhone}
                onChange={(e) => setSubjectPhone(e.target.value)}
                className="w-full border p-2 rounded text-gray-900 bg-white"
                placeholder="If provided, they will receive SMS notification"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-900">Description of the issue *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full border p-2 rounded text-gray-900 bg-white"
                placeholder="Provide as much detail as possible (dates, amounts, interactions, etc.)"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-gray-900">Upload evidence (photos, documents, screenshots)</label>
              <input
                type="file"
                onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                className="w-full border p-2 rounded bg-white"
                accept="image/*,application/pdf"
              />
              <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, PDF (max 10MB)</p>
            </div>

            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="text-sm text-gray-700">
                ⚠️ <strong>Important:</strong> Submitting a false or malicious report may result in legal action against you.
                The subject of the report will have an opportunity to dispute the listing.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-gray-600 disabled:bg-gray-400"
            >
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}