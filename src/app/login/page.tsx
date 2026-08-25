'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { safePost } from '@/lib/api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

const GOOGLE_WEB_CLIENT_ID =
  '463399358521-3sti9q753ao4bpsfrar7v43ulg1mb7pj.apps.googleusercontent.com';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/register-property';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) router.push(redirectTo);
  }, [router, redirectTo]);

  const establishSession = useCallback(
    (data: LoginResponse) => {
      if (!data?.token || !data?.user) {
        throw new Error('The server returned an incomplete sign-in response.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push(redirectTo);
    },
    [router, redirectTo]
  );

  const handleGoogleCredential = useCallback(
    async (response: any) => {
      const idToken = response?.credential;

      if (!idToken) {
        setError('Google did not return an ID token.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await safePost<LoginResponse>('/auth/google', { idToken });
        establishSession(data);
      } catch (err: any) {
        setError(err?.message || 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    },
    [establishSession]
  );

  const initGoogle = useCallback(() => {
    const google = (window as any)?.google;
    if (!google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_WEB_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    const target = document.getElementById('google-signin-button');

    if (target) {
      target.innerHTML = '';

      google.accounts.id.renderButton(target, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: 400,
      });

      setGoogleReady(true);
    }
  }, [handleGoogleCredential]);

  useEffect(() => {
    if ((window as any)?.google?.accounts?.id) initGoogle();
  }, [initGoogle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await safePost<LoginResponse>('/auth/login', form);
      establishSession(data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogle}
      />

      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">
          Integres Risk Review
        </h1>

        <p className="text-sm text-gray-600 mb-6">
          Sign in to check, report, respond, dispute and manage Risk Review activity.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-5">
          <div
            id="google-signin-button"
            className={loading ? 'opacity-50 pointer-events-none' : ''}
          />

          {!googleReady && (
            <div className="w-full border rounded py-3 text-center text-gray-500">
              Loading Google sign-in…
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-500">or use email</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded text-gray-900 bg-white"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full border p-2 rounded pr-16 text-gray-900 bg-white"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-gray-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Signing in...' : 'Sign in with email'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-red-600">
            Register
          </a>
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
