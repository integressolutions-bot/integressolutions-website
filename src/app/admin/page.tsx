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
  status: 'ACTIVE' | 'STOLEN' | 'RECOVERED';
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

  const handleReportAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
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
    setLoading(true);
    try {
      const results = await safeGet<PSIDProperty[]>(`/admin/psid/search?q=${encodeURIComponent(searchQuery)}`, true);
      setSearchResults(results);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return <div className="p-6 text-center">Loading admin dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b mb-6">
        <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 ${activeTab === 'stats' ? 'border-b-2 border-red-600 font-semibold' : ''}`}>📊 Stats</button>
        <button onClick={() => setActiveTab('blacklist')} className={`px-4 py-2 ${activeTab === 'blacklist' ? 'border-b-2 border-red-600 font-semibold' : ''}`}>📝 Blacklist ({pendingReports.length})</button>
        <button onClick={() => setActiveTab('practitioners')} className={`px-4 py-2 ${activeTab === 'practitioners' ? 'border-b-2 border-red-600 font-semibold' : ''}`}>👥 Practitioners ({pendingPractitioners.length})</button>
        <button onClick={() => setActiveTab('psid')} className={`px-4 py-2 ${activeTab === 'psid' ? 'border-b-2 border-red-600 font-semibold' : ''}`}>🏠 PSID Management</button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg"><div className="text-2xl font-bold">{stats.totalProperties}</div><div>Registered Properties</div></div>
          <div className="bg-yellow-50 p-4 rounded-lg"><div className="text-2xl font-bold">{stats.totalBlacklistReports}</div><div>Total Blacklist Reports</div></div>
          <div className="bg-orange-50 p-4 rounded-lg"><div className="text-2xl font-bold">{stats.pendingReports}</div><div>Pending Reports</div></div>
          <div className="bg-purple-50 p-4 rounded-lg"><div className="text-2xl font-bold">{stats.approvedReports}</div><div>Approved Reports</div></div>
          <div className="bg-red-50 p-4 rounded-lg"><div className="text-2xl font-bold">{stats.rejectedReports}</div><div>Rejected Reports</div></div>
          <div className="bg-indigo-50 p-4 rounded-lg"><div className="text-2xl font-bold">{stats.totalPractitioners}</div><div>Total Practitioners</div></div>
          <div className="bg-pink-50 p-4 rounded-lg"><div className="text-2xl font-bold">{stats.pendingPractitioners}</div><div>Pending Verifications</div></div>
          <div className="bg-teal-50 p-4 rounded-lg"><div className="text-2xl font-bold">{stats.verifiedPractitioners}</div><div>Verified Practitioners</div></div>
        </div>
      )}

      {/* Blacklist Tab */}
      {activeTab === 'blacklist' && (
        <div className="space-y-4">
          {pendingReports.length === 0 ? <p>No pending reports.</p> : pendingReports.map(report => (
            <div key={report._id} className="border rounded-lg p-4">
              <p><strong>Subject:</strong> {report.subjectName}</p>
              <p><strong>Category:</strong> {report.category}</p>
              <p><strong>Summary:</strong> {report.summary}</p>
              <p><strong>Reported by:</strong> {report.reporter.user?.fullName || 'Anonymous'} ({report.reporter.user?.email})</p>
              <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleString()}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handleReportAction(report._id, 'APPROVED')} disabled={processing === report._id} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                <button onClick={() => handleReportAction(report._id, 'REJECTED')} disabled={processing === report._id} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Practitioners Tab */}
      {activeTab === 'practitioners' && (
        <div className="space-y-4">
          {pendingPractitioners.length === 0 ? <p>No pending practitioners.</p> : pendingPractitioners.map(p => (
            <div key={p._id} className="border rounded-lg p-4">
              <p><strong>Name:</strong> {p.user.fullName}</p>
              <p><strong>Email:</strong> {p.user.email}</p>
              <p><strong>Bar Association:</strong> {p.barAssociation}</p>
              <p><strong>Practice Areas:</strong> {p.practiceAreas.join(', ')}</p>
              <p><strong>Registered:</strong> {new Date(p.createdAt).toLocaleString()}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => handlePractitionerAction(p._id, 'approve')} disabled={processing === p._id} className="bg-green-600 text-white px-3 py-1 rounded">Verify</button>
                <button onClick={() => handlePractitionerAction(p._id, 'reject')} disabled={processing === p._id} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PSID Management Tab */}
      {activeTab === 'psid' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <input type="text" placeholder="Search by serial or item name" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 border p-2 rounded" />
            <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
          </div>
          {searchResults.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Search Results</h2>
              <div className="space-y-2">
                {searchResults.map(prop => (
                  <div key={prop._id} className="border p-3 rounded flex justify-between items-center">
                    <div><span className="font-mono">{prop.serial}</span> – {prop.itemName} – {prop.status}</div>
                    <button onClick={() => router.push(`/admin/properties/${prop.serial}`)} className="text-blue-600">View Details</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold mb-2">Stolen Items</h2>
            {stolenProperties.length === 0 ? <p>No stolen items reported.</p> : (
              <div className="space-y-2">
                {stolenProperties.map(prop => (
                  <div key={prop._id} className="border p-3 rounded flex justify-between items-center">
                    <div><span className="font-mono">{prop.serial}</span> – {prop.itemName} – Owner: {prop.owner.fullName}</div>
                    <button onClick={() => handleRecover(prop.serial)} disabled={processing === prop.serial} className="bg-green-600 text-white px-3 py-1 rounded">Mark Recovered</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">All Properties</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead><tr className="bg-gray-100 border-b"><th className="p-2 text-left">Serial</th><th className="p-2 text-left">Item Name</th><th className="p-2 text-left">Owner</th><th className="p-2 text-left">Status</th><th className="p-2 text-left">Registered</th></tr></thead>
                <tbody>
                  {properties.map(prop => (
                    <tr key={prop._id} className="border-b">
                      <td className="p-2 font-mono">{prop.serial}</td>
                      <td className="p-2">{prop.itemName}</td>
                      <td className="p-2">{prop.owner.fullName} ({prop.owner.email})</td>
                      <td className="p-2 capitalize">{prop.status}</td>
                      <td className="p-2">{new Date(prop.createdAt).toLocaleDateString()}</td>
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