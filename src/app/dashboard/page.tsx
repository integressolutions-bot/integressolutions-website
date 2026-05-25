 "use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { safeGet } from '@/lib/api';

interface DashboardData {
  properties: { id: string; address: string; psid: string; registeredAt: string }[];
  reports: { id: string; status: string; submittedAt: string; name: string }[];
  mediationCases: { id: string; status: string; practitionerName: string; createdAt: string }[];
  stats: {
    totalProperties: number;
    pendingReports: number;
    activeCases: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await safeGet<DashboardData>('/dashboard', true);
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{data?.stats?.totalProperties || 0}</div>
          <div className="text-gray-600">Registered Properties</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{data?.stats?.pendingReports || 0}</div>
          <div className="text-gray-600">Pending Reports</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{data?.stats?.activeCases || 0}</div>
          <div className="text-gray-600">Active Mediations</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link href="/register-property" className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition">
          ➕ Register Property
        </Link>
        <Link href="/report" className="bg-red-600 text-white p-4 rounded-lg text-center hover:bg-red-700 transition">
          ⚠️ Report to Blacklist
        </Link>
        <Link href="/practitioners" className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition">
          👥 Find Practitioner
        </Link>
      </div>

      {/* My Properties */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">📋 My Properties</h2>
        {!data?.properties?.length ? (
          <p className="text-gray-500 bg-gray-50 p-4 rounded">No properties registered yet.</p>
        ) : (
          <div className="space-y-2">
            {data.properties.map(prop => (
              <div key={prop.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="font-medium">{prop.address}</p>
                  <p className="text-sm text-gray-500">PSID: {prop.psid}</p>
                  <p className="text-xs text-gray-400">Registered: {new Date(prop.registeredAt).toLocaleDateString()}</p>
                </div>
                <Link href={`/verify-property?psid=${prop.psid}`} className="text-blue-600 text-sm hover:underline">
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Reports */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">📝 My Blacklist Reports</h2>
        {!data?.reports?.length ? (
          <p className="text-gray-500 bg-gray-50 p-4 rounded">No reports submitted.</p>
        ) : (
          <div className="space-y-2">
            {data.reports.map(report => (
              <div key={report.id} className="border rounded-lg p-4">
                <p className="font-medium">{report.name}</p>
                <p className="text-sm text-gray-500">Submitted: {new Date(report.submittedAt).toLocaleDateString()}</p>
                <p className="text-sm mt-1">
                  Status: 
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                    report.status === 'approved' ? 'bg-red-100 text-red-700' : 
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>{report.status}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
