'use client';

import { useState } from 'react';
import { safeUpload } from '@/lib/api';

export default function ReportPage() {
  const [form, setForm] = useState({ subject: '', reason: '' });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const data = new FormData();
    data.append('subject', form.subject);
    data.append('reason', form.reason);
    if (file) data.append('evidence', file);
    try {
      await safeUpload('/blacklist/submit', data, true);
      setSuccess(true);
      setForm({ subject: '', reason: '' });
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-100 p-4 rounded mb-4">✅ Blacklist report submitted successfully.</div>
        <button onClick={() => window.location.href = '/dashboard'} className="bg-blue-600 text-white px-4 py-2 rounded">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Submit Blacklist Report</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Subject" required className="w-full border p-2 rounded" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
        <textarea rows={5} placeholder="Reason" required className="w-full border p-2 rounded" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button type="submit" disabled={submitting} className="bg-black text-white px-6 py-2 rounded disabled:bg-gray-400">{submitting ? 'Submitting...' : 'Submit Report'}</button>
      </form>
    </div>
  );
}