 "use client";

import { useState, useEffect } from "react";
import { safePost } from "@/lib/api";

interface BlacklistResult {
  found: boolean;
  records?: Array<{
    name: string;
    type: string;
    reason: string;
    dateReported: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  message?: string;
}

export default function BlacklistPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<BlacklistResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("blacklist_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("blacklist_searches", JSON.stringify(updated));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await safePost<BlacklistResult>("/blacklist/check", { query: query.trim() });
      setResult(data);
      saveSearch(query.trim());
    } catch (err: any) {
      setError(err.message || "Unable to check blacklist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    setTimeout(() => submit({ preventDefault: () => {} } as React.FormEvent), 100);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Integres Blacklist</h1>
      <p className="text-gray-600 mb-6">
        Check blacklist records for free. Reporting and removal requests require payment under the platform fee policy.
      </p>

      <div className="bg-gray-100 p-4 rounded-lg flex gap-4 mb-6 flex-wrap">
        <div><span className="font-medium">Check / Search</span><br/><span className="text-green-600 font-bold">Free</span></div>
        <div><span className="font-medium">Report - Individuals</span><br/><span className="font-bold">From ₦15,000</span></div>
        <div><span className="font-medium">Report - Companies</span><br/><span className="font-bold">From ₦30,000</span></div>
      </div>

      <form onSubmit={submit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a name, company, or identifier"
            required
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Checking..." : "Run Free Check"}
          </button>
        </div>
      </form>

      {loading && <div className="text-center py-4">Loading...</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {recentSearches.length > 0 && !result && !loading && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Recent searches:</p>
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
                <p><strong>Type:</strong> {record.type}</p>
                <p><strong>Reason:</strong> {record.reason}</p>
                <p><strong>Reported:</strong> {new Date(record.dateReported).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span className={`capitalize ${record.status === 'approved' ? 'text-red-600' : 'text-yellow-600'}`}>{record.status}</span></p>
              </div>
            ))
          ) : (
            <p>No blacklist records found for "{query}".</p>
          )}
          <button onClick={() => window.location.href = '/report'} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">
            Report an Issue
          </button>
        </div>
      )}
    </div>
  );
}