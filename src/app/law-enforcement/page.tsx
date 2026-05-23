"use client";

import { useState, useEffect } from "react";
import { safeGet, safePost } from "@/lib/api";

interface StolenReport {
  id: string;
  psid: string;
  propertyDescription: string;
  ownerName: string;
  dateReported: string;
  status: "pending" | "investigating" | "resolved";
  caseNumber: string;
}

export default function LawEnforcementPage() {
  const [reports, setReports] = useState<StolenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ badgeNumber: "", password: "" });
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const savedAuth = localStorage.getItem("lawEnforcementAuth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchReports();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchReports = async () => {
    try {
      const data = await safeGet<StolenReport[]>("/law-enforcement/reports");
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      // Temporary demo login - replace with real auth
      if (loginForm.badgeNumber === "DEMO123" && loginForm.password === "Integres2025") {
        setIsAuthenticated(true);
        localStorage.setItem("lawEnforcementAuth", "true");
        fetchReports();
      } else {
        setLoginError("Invalid credentials. Use DEMO123 / Integres2025 for demo.");
      }
    } catch (err) {
      setLoginError("Login failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lawEnforcementAuth");
    setIsAuthenticated(false);
    setReports([]);
  };

  const updateStatus = async (reportId: string, status: string) => {
    try {
      await safePost("/law-enforcement/reports/update", { reportId, status });
      setReports(reports.map(r => r.id === reportId ? { ...r, status: status as any } : r));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <span className="text-5xl">👮</span>
          <h1 className="text-2xl font-bold mt-2">Law Enforcement Portal</h1>
          <p className="text-gray-600">Authorized personnel only</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white border rounded-lg p-6">
          {loginError && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{loginError}</div>}
          <input type="text" placeholder="Badge Number" className="w-full p-2 border rounded mb-3"
            onChange={(e) => setLoginForm({ ...loginForm, badgeNumber: e.target.value })} required />
          <input type="password" placeholder="Access Code" className="w-full p-2 border rounded mb-3"
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Access Portal</button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-4">Demo: Badge DEMO123 / Password Integres2025</p>
      </div>
    );
  }

  if (loading) return <div className="p-6 text-center">Loading reports...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Law Enforcement Portal</h1>
        <button onClick={handleLogout} className="bg-gray-200 px-4 py-2 rounded">Logout</button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Case #</th>
              <th className="p-3 text-left">PSID</th>
              <th className="p-3 text-left">Property</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id} className="border-b">
                <td className="p-3">{report.caseNumber}</td>
                <td className="p-3 font-mono text-sm">{report.psid}</td>
                <td className="p-3">{report.propertyDescription.substring(0, 50)}</td>
                <td className="p-3">{report.ownerName}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    report.status === "pending" ? "bg-yellow-100" : 
                    report.status === "investigating" ? "bg-blue-100" : "bg-green-100"
                  }`}>{report.status}</span>
                </td>
                <td className="p-3">
                  <select value={report.status} onChange={(e) => updateStatus(report.id, e.target.value)}
                    className="text-sm border rounded p-1">
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}