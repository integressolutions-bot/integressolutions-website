'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { safePost } from '@/lib/api';

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', barAssociations: ['Nigerian Bar Association (NBA)'] },
  { code: 'GH', name: 'Ghana', barAssociations: ['Ghana Bar Association (GBA)'] },
  { code: 'ZA', name: 'South Africa', barAssociations: ['Law Society of South Africa (LSSA)'] },
  { code: 'KE', name: 'Kenya', barAssociations: ['Law Society of Kenya (LSK)'] },
  { code: 'UG', name: 'Uganda', barAssociations: ['Uganda Law Society (ULS)'] },
  { code: 'US', name: 'United States', barAssociations: ['American Bar Association (ABA)'] },
  { code: 'GB', name: 'United Kingdom', barAssociations: ['Law Society of England and Wales'] },
  { code: 'IE', name: 'Ireland', barAssociations: ['Law Society of Ireland'] },
];

export default function PractitionerRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'NG',
    barAssociation: '',
    barNumber: '',
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

  const selectedCountry = COUNTRIES.find(c => c.code === form.country);
  const barOptions = selectedCountry?.barAssociations || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'country') setForm(prev => ({ ...prev, barAssociation: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await safePost('/practitioner/register', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        country: form.country,
        barAssociation: form.barAssociation,
        barNumber: form.barNumber,
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
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">✅ Registration submitted for review. You will be notified once verified.</div>
        <Link href="/practitioners" className="text-red-600 underline">Go to Practitioner Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Practitioner Registration</h1>
      <p className="text-gray-600 mb-6">Join the Integres network of verified legal practitioners worldwide.</p>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input name="fullName" placeholder="Full name *" value={form.fullName} onChange={handleChange} required className="border p-2 rounded text-gray-900 bg-white" />
          <input name="email" type="email" placeholder="Email *" value={form.email} onChange={handleChange} required className="border p-2 rounded text-gray-900 bg-white" />
          
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password *" value={form.password} onChange={handleChange} required className="border p-2 rounded w-full pr-10 text-gray-900 bg-white" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showPassword ? '👁️' : '🔒'}</button>
          </div>
          <div className="relative">
            <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm password *" value={form.confirmPassword} onChange={handleChange} required className="border p-2 rounded w-full pr-10 text-gray-900 bg-white" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">{showConfirmPassword ? '👁️' : '🔒'}</button>
          </div>

          <select name="country" value={form.country} onChange={handleChange} required className="border p-2 rounded text-gray-900 bg-white">
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>

          <select name="barAssociation" value={form.barAssociation} onChange={handleChange} required className="border p-2 rounded text-gray-900 bg-white">
            <option value="">Select bar association</option>
            {barOptions.map(bar => <option key={bar} value={bar}>{bar}</option>)}
          </select>

          <input name="barNumber" placeholder="Bar membership number *" value={form.barNumber} onChange={handleChange} required className="border p-2 rounded text-gray-900 bg-white" />
          <input name="specialization" placeholder="Specialization (e.g., Property Law) *" value={form.specialization} onChange={handleChange} required className="border p-2 rounded text-gray-900 bg-white" />
          <input name="yearsOfExperience" type="number" placeholder="Years of experience *" value={form.yearsOfExperience} onChange={handleChange} required className="border p-2 rounded text-gray-900 bg-white" />
          <input name="location" placeholder="City, State, Country *" value={form.location} onChange={handleChange} required className="border p-2 rounded text-gray-900 bg-white" />
          <input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className="border p-2 rounded text-gray-900 bg-white" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-red-600 text-white py-2 rounded hover:bg-gray-600 disabled:bg-gray-400 transition">
          {loading ? 'Registering...' : 'Register as Practitioner'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link href="/practitioners" className="text-red-600 underline">Login here</Link></p>
    </div>
  );
}