'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safeGet, safePost } from '@/lib/api';

interface Stats {
  totalProperties: number;
  totalBlacklistReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalPractitioners: number;
  pendingPractitioners: number;
  verifiedPractitioners: number;
  totalUsers: number;
}

interface PendingReport {
  _id: string;
  subjectName: string;
  category: string;
  summary: string;
  reporter: { user?: { fullName: string; email: string } };
  createdAt: string;
}

interface PendingPractitioner {
  _id: string;
  user: { fullName: string; email: string };
  practiceAreas: string[];
  barAssociation: string;
  createdAt: string;
}

interface PSIDProperty {
  _id: string;
  serial: string;
  itemName: string;
  owner: { fullName: string; email: string };
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'blacklist' | 'practitioners' | 'psid'>('stats');

  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [pendingPractitioners, setPendingPractitioners] = useState<PendingPractitioner[]>([]);
  const [properties, setProperties] = useState<PSIDProperty[]>([]);
  const [stolenProperties, setStolenProperties] = useState<PSIDProperty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PSIDProperty[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/admin');
      return;
    }

    const fetchAll = async () => {
      try {
        const profile = await safeGet<{ role: string }>('/auth/profile', true);
        if (profile.role !== 'ADMIN') throw new Error('Access denied');

        const [statsData, reportsData, practitionersData, propsData, stolenData] = await Promise.all([
          safeGet<Stats>('/admin/stats', true),
          safeGet<{ data: PendingReport[] }>('/admin/reports/pending', true),
          safeGet<{ data: PendingPractitioner[] }>('/admin/practitioners/pending', true),
          safeGet<{ data: PSIDProperty[] }>('/admin/properties', true),
          safeGet<PSIDProperty[]>('/admin/psid/stolen', true),
        ]);
        setStats(statsData);
        setPendingReports(reportsData.data || []);
        setPendingPractitioners(practitionersData.data || []);
        setProperties(propsData.data || []);
        setStolenProperties(stolenData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [router]);

  const handleReportAction = async (id: string, status: string) => {
    setProcessing(id);
    try {
      await safePost(`/admin/blacklist/${id}/review`, { status }, true);
      setPendingReports(prev => prev.filter(r => r._id !== id));
      if (stats) {
        setStats({
          ...stats,
          pendingReports: stats.pendingReports - 1,
          [status === 'APPROVED' ? 'approvedReports' : 'rejectedReports']: stats[status === 'APPROVED' ? 'approvedReports' : 'rejectedReports'] + 1,
        });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handlePractitionerAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      await safePost('/admin/practitioners/verify', { practitionerId: id, action }, true);
      setPendingPractitioners(prev => prev.filter(p => p._id !== id));
      if (stats) {
        setStats({
          ...stats,
          pendingPractitioners: stats.pendingPractitioners - 1,
          verifiedPractitioners: action === 'approve' ? stats.verifiedPractitioners + 1 : stats.verifiedPractitioners,
        });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRecover = async (serial: string) => {
    if (!confirm('Mark this property as recovered?')) return;
    setProcessing(serial);
    try {
      await safePost(`/admin/psid/property/${serial}/recovered`, {}, true);
      const updatedStolen = await safeGet<PSIDProperty[]>('/admin/psid/stolen', true);
      setStolenProperties(updatedStolen);
      const updatedProps = await safeGet<{ data: PSIDProperty[] }>('/admin/properties', true);
      setProperties(updatedProps.data || []);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await safeGet<PSIDProperty[]>(`/admin/psid/search?q=${encodeURIComponent(searchQuery)}`, true);
      setSearchResults(results);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-900">Loading admin dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Admin Dashboard</h1>

      <div className="flex flex-wrap gap-2 border-b mb-6">
        <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 ${activeTab === 'stats' ? 'border-b-2 border-red-600 font-semibold text-red-600' : 'text-gray-700'}`}>📊 Stats</button>
        <button onClick={() => setActiveTab('blacklist')} className={`px-4 py-2 ${activeTab === 'blacklist' ? 'border-b-2 border-red-600 font-semibold text-red-600' : 'text-gray-700'}`}>📝 Blacklist ({pendingReports.length})</button>
        <button onClick={() => setActiveTab('practitioners')} className={`px-4 py-2 ${activeTab === 'practitioners' ? 'border-b-2 border-red-600 font-semibold text-red-600' : 'text-gray-700'}`}>👥 Practitioners ({pendingPractitioners.length})</button>
        <button onClick={() => setActiveTab('psid')} className={`px-4 py-2 ${activeTab === 'psid' ? 'border-b-2 border-red-600 font-semibold text-red-600' : 'text-gray-700'}`}>🏠 PSID Management</button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border-l-4 border-red-600 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">{stats.totalProperties}</div><div className="text-gray-600">Registered Properties</div></div>
          <div className="bg-white border-l-4 border-yellow-500 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">{stats.totalBlacklistReports}</div><div className="text-gray-600">Total Blacklist Reports</div></div>
          <div className="bg-white border-l-4 border-orange-500 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">{stats.pendingReports}</div><div className="text-gray-600">Pending Reports</div></div>
          <div className="bg-white border-l-4 border-green-500 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">{stats.approvedReports}</div><div className="text-gray-600">Approved Reports</div></div>
          <div className="bg-white border-l-4 border-red-500 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">{stats.rejectedReports}</div><div className="text-gray-600">Rejected Reports</div></div>
          <div className="bg-white border-l-4 border-indigo-500 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">{stats.totalPractitioners}</div><div className="text-gray-600">Total Practitioners</div></div>
          <div className="bg-white border-l-4 border-pink-500 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">{stats.pendingPractitioners}</div><div className="text-gray-600">Pending Verifications</div></div>
          <div className="bg-white border-l-4 border-teal-500 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">{stats.verifiedPractitioners}</div><div className="text-gray-600">Verified Practitioners</div></div>
          <div className="bg-white border-l-4 border-purple-500 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div><div className="text-gray-600">Registered Users</div></div>
          <div className="bg-white border-l-4 border-blue-500 p-4 rounded shadow"><div className="text-2xl font-bold text-gray-900">—</div><div className="text-gray-600">Visitors (last 30 days)</div></div>
        </div>
      )}

      {activeTab === 'blacklist' && (
        <div className="space-y-4">
          {pendingReports.length === 0 ? <p className="text-gray-600">No pending reports.</p> : pendingReports.map(report => (
            <div key={report._id} className="border rounded-lg p-4 bg-white shadow">
              <p className="font-semibold text-gray-900">{report.subjectName}</p>
              <p className="text-sm text-gray-600">Category: {report.category}</p>
              <p className="text-sm text-gray-700 mt-1">{report.summary}</p>
              <p className="text-xs text-gray-500">Reported by: {report.reporter.user?.fullName || 'Anonymous'} ({report.reporter.user?.email})</p>
              <p className="text-xs text-gray-500">Date: {new Date(report.createdAt).toLocaleString()}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleReportAction(report._id, 'APPROVED')} disabled={processing === report._id} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
                <button onClick={() => handleReportAction(report._id, 'REJECTED')} disabled={processing === report._id} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'practitioners' && (
        <div className="space-y-4">
          {pendingPractitioners.length === 0 ? <p className="text-gray-600">No pending practitioners.</p> : pendingPractitioners.map(p => (
            <div key={p._id} className="border rounded-lg p-4 bg-white shadow">
              <p className="font-semibold text-gray-900">{p.user.fullName}</p>
              <p className="text-sm text-gray-600">Email: {p.user.email}</p>
              <p className="text-sm text-gray-700">Bar: {p.barAssociation}</p>
              <p className="text-sm text-gray-700">Areas: {p.practiceAreas.join(', ')}</p>
              <p className="text-xs text-gray-500">Registered: {new Date(p.createdAt).toLocaleString()}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handlePractitionerAction(p._id, 'approve')} disabled={processing === p._id} className="bg-green-600 text-white px-3 py-1 rounded">Verify</button>
                <button onClick={() => handlePractitionerAction(p._id, 'reject')} disabled={processing === p._id} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'psid' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <input type="text" placeholder="Search by serial or item name" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 border p-2 rounded text-gray-900 bg-white" />
            <button onClick={handleSearch} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-gray-600">Search</button>
          </div>

          {searchResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">Search Results</h2>
              {searchResults.map(prop => (
                <div key={prop._id} className="border p-3 rounded mb-2 flex justify-between items-center bg-white">
                  <div className="text-gray-900"><span className="font-mono">{prop.serial}</span> – {prop.itemName} – {prop.status}</div>
                  <button onClick={() => router.push(`/admin/properties/${prop.serial}`)} className="text-blue-600">View Details</button>
                </div>
              ))}
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Stolen Items</h2>
            {stolenProperties.length === 0 ? <p className="text-gray-600">No stolen items reported.</p> : stolenProperties.map(prop => (
              <div key={prop._id} className="border p-3 rounded mb-2 flex justify-between items-center bg-white">
                <div className="text-gray-900"><span className="font-mono">{prop.serial}</span> – {prop.itemName} – Owner: {prop.owner.fullName}</div>
                <button onClick={() => handleRecover(prop.serial)} disabled={processing === prop.serial} className="bg-green-600 text-white px-3 py-1 rounded">Mark Recovered</button>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">All Properties</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-gray-100">
                  <tr><th className="p-2 text-left text-gray-900">PSID</th><th className="p-2 text-left text-gray-900">Item Name</th><th className="p-2 text-left text-gray-900">Owner</th><th className="p-2 text-left text-gray-900">Status</th><th className="p-2 text-left text-gray-900">Registered</th></tr>
                </thead>
                <tbody>
                  {properties.map(prop => (
                    <tr key={prop._id} className="border-t">
                      <td className="p-2 font-mono text-gray-900">{prop.serial}</td>
                      <td className="p-2 text-gray-900">{prop.itemName}</td>
                      <td className="p-2 text-gray-900">{prop.owner.fullName} (<span className="text-xs">{prop.owner.email}</span>)</td>
                      <td className="p-2 capitalize text-gray-900">{prop.status}</td>
                      <td className="p-2 text-gray-900">{new Date(prop.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}