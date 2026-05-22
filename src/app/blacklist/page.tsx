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

  // Load recent searches from localStorage on mount
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
      // Use the correct endpoint for your backend
      const data = await safePost<BlacklistResult>("/blacklist/check", { 
        query: query.trim(),
        // Optional: include user context if authenticated
        // userId: getCurrentUserId(),
      });
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
    // Auto-submit after a brief delay
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      submit(fakeEvent);
    }, 100);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Integres Blacklist</h1>
      
      <p style={{ marginBottom: "1.5rem", color: "#666" }}>
        Check blacklist records for free. Reporting and removal requests require payment under the platform fee policy.
      </p>
      
      {/* Pricing Cards */}
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        marginBottom: "2rem",
        flexWrap: "wrap",
        background: "#f5f5f5",
        padding: "1rem",
        borderRadius: "8px"
      }}>
        <div style={{ flex: 1 }}>
          <span>Check / Search</span>
          <strong style={{ display: "block", fontSize: "1.25rem", color: "#10b981" }}>Free</strong>
        </div>
        <div style={{ flex: 1 }}>
          <span>Report - Individuals</span>
          <strong style={{ display: "block", fontSize: "1.25rem" }}>From ₦15,000</strong>
        </div>
        <div style={{ flex: 1 }}>
          <span>Report - Companies</span>
          <strong style={{ display: "block", fontSize: "1.25rem" }}>From ₦30,000</strong>
        </div>
      </div>
      
      {/* Search Form */}
      <form onSubmit={submit} style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter a name, company, or identifier"
            required
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "1rem"
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              background: loading ? "#ccc" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem"
            }}
          >
            {loading ? "Checking..." : "Run Free Check"}
          </button>
        </div>
      </form>
      
      {/* Loading Spinner */}
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ 
            display: "inline-block",
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div style={{
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem"
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {/* Recent Searches */}
      {recentSearches.length > 0 && !result && !loading && (
        <div style={{ marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>Recent searches:</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleQuickSearch(term)}
                style={{
                  background: "#f0f0f0",
                  border: "none",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "16px",
                  cursor: "pointer",
                  fontSize: "0.875rem"
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Results Display */}
      {result && (
        <div style={{
          background: result.found ? "#fef3c7" : "#d1fae5",
          border: `1px solid ${result.found ? "#fde68a" : "#a7f3d0"}`,
          borderRadius: "8px",
          padding: "1rem",
          marginTop: "1rem"
        }}>
          <h3 style={{ marginBottom: "0.5rem" }}>
            {result.found ? "⚠️ Record Found" : "✅ Clean Record"}
          </h3>
          
          {result.found && result.records ? (
            <div>
              {result.records.map((record, idx) => (
                <div key={idx} style={{ marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #eee" }}>
                  <p><strong>Name:</strong> {record.name}</p>
                  <p><strong>Type:</strong> {record.type}</p>
                  <p><strong>Reason:</strong> {record.reason}</p>
                  <p><strong>Reported:</strong> {new Date(record.dateReported).toLocaleDateString()}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span style={{ 
                      marginLeft: "0.5rem",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      background: record.status === 'approved' ? '#fee2e2' : '#fef3c7',
                      color: record.status === 'approved' ? '#dc2626' : '#d97706'
                    }}>
                      {record.status}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No blacklist records found for "{query}".</p>
          )}
          
          <button
            onClick={() => window.location.href = "/report"}
            style={{
              marginTop: "1rem",
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Report an Issue
          </button>
        </div>
      )}
    </div>
  );
}