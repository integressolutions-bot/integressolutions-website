'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';
import PropertyCard from '@/components/psid/PropertyCard';

export default function VerifyPropertyPage() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);

  const verifyProperty = async () => {
    const response = await fetch(
      `${API_BASE}/mobile/psid/${code}`
    );

    const data = await response.json();

    setResult(data.psid);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Verify Property
      </h1>

      <div className="flex gap-3">
        <input
          className="border p-3 rounded w-full"
          type="text"
          placeholder="Enter PSID Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button
          onClick={verifyProperty}
          className="bg-black text-white px-6 rounded"
        >
          Verify
        </button>
      </div>

      {result && (
        <div className="mt-8">
          <PropertyCard property={result} />
        </div>
      )}
    </div>
  );
}
