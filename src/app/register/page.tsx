'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { safePost } from '@/lib/api';

interface RegisterResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await safePost<RegisterResponse>('/auth/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/register-property');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Create Account</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Full name"
          className="w-full border p-2 rounded text-gray-900 bg-white"
          value={form.fullName}
          onChange={e => setForm({ ...form, fullName: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded text-gray-900 bg-white"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full border p-2 rounded pr-10 text-gray-900 bg-white"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
          >
            {showPassword ? '👁️' : '🔒'}
          </button>
        </div>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            className="w-full border p-2 rounded pr-10 text-gray-900 bg-white"
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            required
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
          type="tel"
          placeholder="Phone (optional)"
          className="w-full border p-2 rounded text-gray-900 bg-white"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="text-center mt-4 text-gray-600">
        Already have an account? <a href="/login" className="text-blue-600">Login</a>
      </p>
    </div>
  );
}