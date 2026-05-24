 'use client';

import { useState } from 'react';
import { safeUpload } from '@/lib/api';

export default function ReportPage() {
  const [form, setForm] = useState({
    subject: '',
    reason: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    const data = new FormData();
    data.append('subject', form.subject);
    data.append('reason', form.reason);
    if (file) data.append('evidence', file);

    try {
      // Use the safeUpload helper which goes through Netlify proxy (/api)
      await safeUpload('/mobile/blacklist', data);
      setSuccess(true);
      setForm({ subject: '', reason: '' });
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✅ Blacklist report submitted successfully. Our team will review it.
        </div>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Submit Blacklist Report</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-3 rounded w-full"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        />

        <textarea
          className="border p-3 rounded w-full"
          placeholder="Reason"
          rows={5}
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
          required
        />

        <input
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFile(e.target.files?.[0] || null)
          }
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white px-6 py-3 rounded disabled:bg-gray-400"
        >
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}