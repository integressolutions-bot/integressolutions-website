'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { safePost } from '@/lib/api';

const CATEGORIES = {
  electronics: {
    label: 'Electronics',
    subCategories: [
      'Smartphone',
      'Laptop',
      'Tablet',
      'Desktop',
      'Camera',
      'TV',
      'Gaming Console',
      'Audio Equipment',
      'Other',
    ],
  },
  vehicle: {
    label: 'Vehicle',
    subCategories: [
      'Car',
      'Motorcycle',
      'Truck',
      'Bus',
      'Bicycle',
      'Boat',
      'Aircraft',
      'Other',
    ],
  },
  real_estate: {
    label: 'Real Estate',
    subCategories: [
      'House',
      'Apartment',
      'Land',
      'Commercial Building',
      'Office Space',
      'Warehouse',
      'Other',
    ],
  },
  jewelry: {
    label: 'Jewelry',
    subCategories: [
      'Ring',
      'Necklace',
      'Bracelet',
      'Earrings',
      'Watch',
      'Gemstone',
      'Gold',
      'Silver',
      'Other',
    ],
  },
  other: {
    label: 'Other',
    subCategories: [
      'Art',
      'Antique',
      'Collectible',
      'Furniture',
      'Tool',
      'Equipment',
      'Specify',
    ],
  },
};

interface RegisterResponse {
  serial: string;
}

export default function RegisterPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [form, setForm] = useState({
    category: 'electronics',
    subCategory: '',
    customSubCategory: '',
    serialNumber: '',
    description: '',
    purchaseDate: '',
    proofOfOwnership: '',
    additionalNotes: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/register-property' as any);
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      category: e.target.value,
      subCategory: '',
      customSubCategory: '',
    }));
  };

  const getSubCategories = () => {
    const cat = CATEGORIES[form.category as keyof typeof CATEGORIES];
    return cat ? cat.subCategories : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalSubCategory =
      form.subCategory === 'Other' || form.subCategory === 'Specify'
        ? form.customSubCategory
        : form.subCategory;

    try {
      const result = await safePost<RegisterResponse>(
        '/psid/register',
        { ...form, subCategory: finalSubCategory },
        true
      );
      router.push(`/verify-property?psid=${result.serial}&success=true`);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return <div className="p-6 text-center">Checking authentication...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Register Property</h1>
      <p className="text-gray-600 mb-6">
        Register your item to generate a unique PSID (you must be logged in).
      </p>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <select
            name="category"
            value={form.category}
            onChange={handleCategoryChange}
            className="p-2 border rounded text-gray-900 bg-white"
            required
          >
            <option value="electronics">Electronics</option>
            <option value="vehicle">Vehicle</option>
            <option value="real_estate">Real Estate</option>
            <option value="jewelry">Jewelry</option>
            <option value="other">Other</option>
          </select>

          <select
            name="subCategory"
            value={form.subCategory}
            onChange={handleChange}
            className="p-2 border rounded text-gray-900 bg-white"
            required
          >
            <option value="">Select sub-category</option>
            {getSubCategories().map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {(form.subCategory === 'Other' || form.subCategory === 'Specify') && (
          <input
            name="customSubCategory"
            placeholder="Please specify"
            value={form.customSubCategory}
            onChange={handleChange}
            className="w-full p-2 border rounded text-gray-900 bg-white"
            required
          />
        )}

        <input
          name="serialNumber"
          placeholder="Serial/Identification Number *"
          value={form.serialNumber}
          onChange={handleChange}
          className="w-full p-2 border rounded text-gray-900 bg-white"
          required
        />

        <textarea
          name="description"
          placeholder="Description *"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded text-gray-900 bg-white"
          required
        />

        <input
          name="purchaseDate"
          type="date"
          value={form.purchaseDate}
          onChange={handleChange}
          className="w-full p-2 border rounded text-gray-900 bg-white"
        />

        <input
          name="proofOfOwnership"
          placeholder="Proof of Ownership (URL/Reference)"
          value={form.proofOfOwnership}
          onChange={handleChange}
          className="w-full p-2 border rounded text-gray-900 bg-white"
        />

        <textarea
          name="additionalNotes"
          placeholder="Additional Notes"
          rows={2}
          value={form.additionalNotes}
          onChange={handleChange}
          className="w-full p-2 border rounded text-gray-900 bg-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Registering...' : 'Register Property & Get PSID'}
        </button>
      </form>
    </div>
  );
}