'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

export default function RegisterPropertyPage() {
  const [form, setForm] = useState({
    propertyName: '',
    code: '',
    owner: '',
    address: '',
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    await fetch(`${API_BASE}/mobile/psid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(form),
    });

    alert('Property registered');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Register Property
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="border p-3 rounded w-full" type="text" name="propertyName" placeholder="Property Name" onChange={handleChange} />

        <input className="border p-3 rounded w-full" type="text" name="code" placeholder="PSID Code" onChange={handleChange} />

        <input className="border p-3 rounded w-full" type="text" name="owner" placeholder="Owner Name" onChange={handleChange} />

        <input className="border p-3 rounded w-full" type="text" name="address" placeholder="Address" onChange={handleChange} />

        <button className="bg-black text-white px-6 py-3 rounded">
          Register Property
        </button>
      </form>
    </div>
  );
}
