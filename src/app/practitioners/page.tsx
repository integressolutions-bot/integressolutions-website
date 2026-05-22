       'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Practitioner {
  _id: string;
  name: string;
  specialization: string;
  verified: boolean;
  rating: number;
  barNumber: string;
  nbaBranch: string;
  yearsOfExperience: number;
  location: string;
  availability: 'available' | 'busy' | 'unavailable';
  photoUrl?: string;
  phone: string;
  email: string;
  pendingDisputes?: number;
}

export default function PractitionersPage() {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPractitioner, setCurrentPractitioner] = useState<Practitioner | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'dashboard'>('directory');
  const [disputes, setDisputes] = useState<any[]>([]);

  // Fetch public practitioners
  const fetchPractitioners = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/practitioner`);
      const data = await response.json();
      setPractitioners(data.practitioners || []);
    } catch (error) {
      console.error('Failed to fetch practitioners:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch practitioner's disputes (for dashboard)
  const fetchDisputes = async (practitionerId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/practitioner/disputes/${practitionerId}`);
      const data = await response.json();
      setDisputes(data.disputes || []);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    }
  };

  useEffect(() => {
    fetchPractitioners();

    // Check if practitioner is logged in
    const savedPractitioner = localStorage.getItem('practitioner');
    if (savedPractitioner) {
      const p = JSON.parse(savedPractitioner);
      setCurrentPractitioner(p);
      setIsAuthenticated(true);
      fetchDisputes(p._id);
      setActiveTab('dashboard');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/practitioner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await response.json();
      if (data.success) {
        setCurrentPractitioner(data.practitioner);
        setIsAuthenticated(true);
        localStorage.setItem('practitioner', JSON.stringify(data.practitioner));
        fetchDisputes(data.practitioner._id);
        setActiveTab('dashboard');
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('practitioner');
    setCurrentPractitioner(null);
    setIsAuthenticated(false);
    setActiveTab('directory');
    setDisputes([]);
  };

  const updateDisputeStatus = async (disputeId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/practitioner/disputes/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId, status, notes, practitionerId: currentPractitioner?._id }),
      });
      const data = await response.json();
      if (data.success) {
        setDisputes(disputes.map(d => d._id === disputeId ? { ...d, status } : d));
        alert(`Dispute ${status}`);
      }
    } catch (error) {
      console.error('Failed to update dispute:', error);
    }
  };

  const filteredPractitioners = practitioners.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.specialization.toLowerCase().includes(filter.toLowerCase()) ||
    p.nbaBranch?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="p-6 text-center">Loading practitioners...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('directory')}
            className={`pb-2 px-4 ${activeTab === 'directory' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
          >
            Find a Practitioner
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-2 px-4 ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
          >
            {isAuthenticated ? 'My Dashboard' : 'Practitioner Login'}
          </button>
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {currentPractitioner?.name}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        )}
      </div>

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <>
          <h1 className="text-3xl font-bold mb-2">NBA-Verified Practitioners</h1>
          <p className="text-gray-600 mb-6">
            Connect with verified legal practitioners for blacklist disputes, property verification, and mediation.
          </p>

          {/* Search Filter */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Filter by name, specialization, or NBA branch..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {/* Practitioners Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPractitioners.map((practitioner) => (
              <div key={practitioner._id} className="border rounded-xl p-6 shadow hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{practitioner.name}</h2>
                    <p className="text-sm text-gray-500">NBA #{practitioner.barNumber} • {practitioner.nbaBranch}</p>
                  </div>
                  {practitioner.verified && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">NBA Verified</span>
                  )}
                </div>

                <p className="mt-2 text-gray-700">{practitioner.specialization}</p>
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p>📍 {practitioner.location}</p>
                  <p>⭐ {practitioner.rating}/5 • {practitioner.yearsOfExperience} yrs</p>
                  <p className={`font-semibold ${practitioner.availability === 'available' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {practitioner.availability}
                  </p>
                </div>

                <button
                  onClick={() => window.location.href = `/blacklist/dispute?practitionerId=${practitioner._id}`}
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Request Dispute Resolution
                </button>
              </div>
            ))}
          </div>

          {filteredPractitioners.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No practitioners match your search criteria.
            </div>
          )}
        </>
      )}

      {/* Practitioner Dashboard / Login Tab */}
      {activeTab === 'dashboard' && (
        <>
          {!isAuthenticated ? (
            // Login Form
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <span className="text-5xl">⚖️</span>
                <h1 className="text-2xl font-bold mt-2">Practitioner Portal</h1>
                <p className="text-gray-600">Authorized NBA-verified practitioners only</p>
              </div>

              <form onSubmit={handleLogin} className="bg-white border rounded-lg p-6 shadow-sm">
                {loginError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                    {loginError}
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Access Portal
                </button>
              </form>
            </div>
          ) : (
            // Practitioner Dashboard
            <div>
              <h1 className="text-2xl font-bold mb-2">Practitioner Dashboard</h1>
              <p className="text-gray-600 mb-6">Manage dispute cases and client requests</p>

              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{disputes.filter(d => d.status === 'pending').length}</div>
                  <div className="text-sm text-gray-600">Pending Disputes</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{disputes.filter(d => d.status === 'in_review').length}</div>
                  <div className="text-sm text-gray-600">Under Review</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{disputes.filter(d => d.status === 'resolved').length}</div>
                  <div className="text-sm text-gray-600">Resolved Cases</div>
                </div>
              </div>

              {/* Disputes Table */}
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Record Name</th>
                      <th className="p-3 text-left">Dispute Reason</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map(dispute => (
                      <tr key={dispute._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-sm">{new Date(dispute.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 font-medium">{dispute.recordName}</td>
                        <td className="p-3 text-sm max-w-xs truncate">{dispute.reason}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            dispute.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            dispute.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                            dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {dispute.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={dispute.status}
                            onChange={(e) => updateDisputeStatus(dispute._id, e.target.value)}
                            className="text-sm border rounded p-1"
                          >
                            <option value="pending">Mark Pending</option>
                            <option value="in_review">Start Review</option>
                            <option value="resolved">Mark Resolved</option>
                            <option value="rejected">Reject</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {disputes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No disputes assigned to you yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}