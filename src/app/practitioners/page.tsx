'use client';

import { useEffect, useState } from 'react';

export default function PractitionersPage() {
  const [practitioners, setPractitioners] =
    useState<any[]>([]);

  useEffect(() => {
    fetchPractitioners();
  }, []);

  const fetchPractitioners = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/practitioner`
    );

    const data = await response.json();

    setPractitioners(data.practitioners || []);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Verified Practitioners
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {practitioners.map((practitioner) => (
          <div
            key={practitioner._id}
            className="border rounded-xl p-6 shadow"
          >
            <h2 className="text-xl font-bold">
              {practitioner.name}
            </h2>

            <p>
              Specialization:
              {' '}
              {practitioner.specialization}
            </p>

            <p>
              Verified:
              {' '}
              {practitioner.verified
                ? 'Yes'
                : 'No'}
            </p>

            <p>
              Rating:
              {' '}
              {practitioner.rating || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
