'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUserAndBrand } from './actions';

export default function SignupPage() {
  const [brandName, setBrandName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Create the user and brand account securely on the server
      try {
        await registerUserAndBrand(email, password, brandName);
      } catch (err: any) {
        setError(err.message || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      // 2. Now sign in the newly created user to establish the session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Account created, but failed to log in automatically. Please sign in.');
        router.push('/login');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card animate-fade-in">
      <div className="auth-header">
        <div className="auth-logo">
          <div className="sidebar-logo-icon">S</div>
          Sotto
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start showing social proof in minutes</p>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '20px' }}>{error}</div>}

      <form onSubmit={handleSignup} className="auth-form">
        <div className="input-group">
          <label htmlFor="brandName" className="input-label">
            Brand name <span className="required">*</span>
          </label>
          <input
            id="brandName"
            type="text"
            className="input"
            placeholder="Your Brand"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="email" className="input-label">
            Email <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="you@yourbrand.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password" className="input-label">
            Password <span className="required">*</span>
          </label>
          <input
            id="password"
            type="password"
            className="input"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <p className="input-hint">Must be at least 6 characters</p>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span>
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <Link href="/login">Sign in</Link>
      </div>
    </div>
  );
}
