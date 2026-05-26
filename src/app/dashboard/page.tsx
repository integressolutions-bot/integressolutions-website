 'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { safeGet } from '@/lib/api';

interface Property {
  id: string;
  serial: string;
  itemName: string;
  status: string;
  createdAt: string;
}

interface Report {
  id: string;
  name: string;
  status: string;
  submittedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user's PSID items (from your new endpoint)
        const props = await safeGet<Property[]>('/psid/my', true);
        setProperties(Array.isArray(props) ? props : []);

        // Fetch user's blacklist reports (from your new endpoint)
        const reps = await safeGet<Report[]>('/blacklist/my-reports', true);
        setReports(Array.isArray(reps) ? reps : []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/register-property"
          className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700"
        >
          + Register New Property
        </Link>
        <Link
          href="/report"
          className="bg-red-600 text-white p-4 rounded-lg text-center hover:bg-red-700"
        >
          ⚠️ Submit Blacklist Report
        </Link>
      </div>

      {/* My Properties */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">My Properties</h2>
        {properties.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-4 rounded">
            You haven't registered any properties yet.
          </p>
        ) : (
          <div className="space-y-3">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{prop.itemName || prop.serial}</p>
                  <p className="text-sm text-gray-500">PSID: {prop.serial}</p>
                  <p className="text-xs text-gray-400">
                    Status: <span className="capitalize">{prop.status}</span>
                  </p>
                </div>
                <Link
                  href={`/verify-property?psid=${prop.serial}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  View Details →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Blacklist Reports */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">My Blacklist Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 p-4 rounded">
            You haven't submitted any blacklist reports yet.
          </p>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="border rounded-lg p-4">
                <p className="font-medium">{rep.name}</p>
                <p className="text-sm text-gray-500">
                  Submitted: {new Date(rep.submittedAt).toLocaleDateString()}
                </p>
                <p className="text-sm mt-1">
                  Status:{' '}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded text-xs ${
                      rep.status === 'approved'
                        ? 'bg-red-100 text-red-700'
                        : rep.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {rep.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}