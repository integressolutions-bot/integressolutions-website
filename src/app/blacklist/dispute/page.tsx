 'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { safeGet, safePost } from '@/lib/api';

interface BlacklistRecord {
  _id: string;
  name: string;
  reason: string;
  dateReported: string;
  status: 'active' | 'pending_removal' | 'removed';
}

interface Practitioner {
  _id: string;
  name: string;
  specialization: string;
  rating: number;
}

function DisputeContent() {
  const searchParams = useSearchParams();
  const recordId = searchParams.get('recordId') || '';
  const practitionerId = searchParams.get('practitionerId') || '';

  const [record, setRecord] = useState<BlacklistRecord | null>(null);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState(practitionerId);
  const [disputeReason, setDisputeReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (recordId) {
        try {
          const data = await safeGet<BlacklistRecord>(`/blacklist/record/${recordId}`);
          setRecord(data);
        } catch (err) { console.error(err); }
      }
    };
    const fetchPractitioners = async () => {
      try {
        const data = await safeGet<{ practitioners: Practitioner[] }>('/practitioner');
        setPractitioners(data.practitioners || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchRecord();
    fetchPractitioners();
  }, [recordId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPractitioner) {
      setError('Please select a practitioner');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await safePost('/blacklist/dispute', {
        recordId: record?._id,
        practitionerId: selectedPractitioner,
        disputeReason,
        evidence,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-100 p-4 rounded mb-4">✅ Dispute submitted. A practitioner will review your case within 5‑7 business days.</div>
        <button onClick={() => window.location.href = '/dashboard'} className="bg-blue-600 text-white px-4 py-2 rounded">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Dispute Blacklist Record</h1>
      <p className="text-gray-600 mb-6">If you believe this record is inaccurate or defamatory, submit a dispute for legal review.</p>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {record && (
        <div className="bg-yellow-50 p-4 rounded mb-6">
          <p><strong>Name:</strong> {record.name}</p>
          <p><strong>Reason:</strong> {record.reason}</p>
          <p><strong>Reported:</strong> {new Date(record.dateReported).toLocaleDateString()}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <select value={selectedPractitioner} onChange={e => setSelectedPractitioner(e.target.value)} className="w-full p-2 border rounded" required>
          <option value="">Select a practitioner</option>
          {practitioners.map(p => <option key={p._id} value={p._id}>{p.name} - {p.specialization} (⭐ {p.rating})</option>)}
        </select>
        <textarea rows={4} placeholder="Explain why this record is inaccurate or defamatory..." value={disputeReason} onChange={e => setDisputeReason(e.target.value)} className="w-full p-2 border rounded" required />
        <textarea rows={3} placeholder="Evidence URLs or descriptions..." value={evidence} onChange={e => setEvidence(e.target.value)} className="w-full p-2 border rounded" />
        <div className="bg-gray-50 p-3 rounded text-sm text-gray-500">⚠️ Disputes are reviewed by NBA‑verified legal practitioners. Filing a false dispute may result in legal action.</div>
        <button type="submit" disabled={submitting} className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400">
          {submitting ? 'Submitting...' : 'Submit Dispute for Review'}
        </button>
      </form>
    </div>
  );
}

export default function DisputePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <DisputeContent />
    </Suspense>
  );
}