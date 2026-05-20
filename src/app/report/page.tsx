'use client';

import { useState } from 'react';

export default function ReportPage() {
  const [form, setForm] = useState({
    subject: '',
    reason: '',
  });

  const [file, setFile] = useState<any>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const data = new FormData();

    data.append('subject', form.subject);
    data.append('reason', form.reason);

    if (file) {
      data.append('evidence', file);
    }

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/mobile/blacklist`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: data,
      }
    );

    alert('Blacklist report submitted');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Submit Blacklist Report
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-3 rounded w-full"
          placeholder="Subject"
          onChange={(e) =>
            setForm({
              ...form,
              subject: e.target.value,
            })
          }
        />

        <textarea
          className="border p-3 rounded w-full"
          placeholder="Reason"
          rows={5}
          onChange={(e) =>
            setForm({
              ...form,
              reason: e.target.value,
            })
          }
        />

        <input
          type="file"
          onChange={(e: any) =>
            setFile(e.target.files[0])
          }
        />

        <button className="bg-black text-white px-6 py-3 rounded">
          Submit Report
        </button>
      </form>
    </div>
  );
}
