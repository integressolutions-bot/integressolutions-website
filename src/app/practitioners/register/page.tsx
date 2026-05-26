 'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { safePost } from '@/lib/api';

export default function PractitionerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    barNumber: '',
    nbaBranch: '',
    specialization: '',
    yearsOfExperience: '',
    location: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await safePost('/practitioner/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        barNumber: form.barNumber,
        nbaBranch: form.nbaBranch,
        specialization: form.specialization,
        yearsOfExperience: parseInt(form.yearsOfExperience),
        location: form.location,
      });
      setSuccess(true);
      setTimeout(() => router.push('/practitioners'), 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded mb-4">
          ✅ Registration successful! You can now log in.
        </div>
        <Link href="/practitioners" className="text-blue-600 underline">
          Go to Practitioner Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Practitioner Registration</h1>
      <p className="text-gray-600 mb-6">Join the Integres network of NBA‑verified legal practitioners.</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="fullName"
            placeholder="Full name *"
            value={form.fullName}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            name="email"
            type="email"
            placeholder="Email *"
            value={form.email}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          
          {/* Password field with visibility toggle */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password *"
              value={form.password}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
            >
              {showPassword ? '👁️' : '🔒'}
            </button>
          </div>
          
          {/* Confirm Password field with visibility toggle */}
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password *"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="border p-2 rounded w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
            >
              {showConfirmPassword ? '👁️' : '🔒'}
            </button>
          </div>
          
          <input
            name="barNumber"
            placeholder="NBA Bar Number *"
            value={form.barNumber}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            name="nbaBranch"
            placeholder="NBA Branch *"
            value={form.nbaBranch}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            name="specialization"
            placeholder="Specialization (e.g., Property Law) *"
            value={form.specialization}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            name="yearsOfExperience"
            type="number"
            placeholder="Years of experience *"
            value={form.yearsOfExperience}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            name="location"
            placeholder="City, State *"
            value={form.location}
            onChange={handleChange}
            required
            className="border p-2 rounded"
          />
          <input
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Registering...' : 'Register as Practitioner'}
        </button>
      </form>
      
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link href="/practitioners" className="text-blue-600 underline">
          Login here
        </Link>
      </p>
    </div>
  );
}