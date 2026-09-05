'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { signup, clearLoginError } from '@/store/authSlice';
import { Eye, EyeOff, ArrowRight, Layers } from 'lucide-react';
import Link from 'next/link';
import { validateEmail, validatePassword, validateName } from '@/utils/validation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loginError } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  useEffect(() => {
    dispatch(clearLoginError());
  }, [name, email, password, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameV = validateName(name, 'Name');
    const emailV = validateEmail(email);
    const passV = validatePassword(password);
    const allErrors = [...nameV.errors, ...emailV.errors, ...passV.errors];

    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    dispatch(signup({ name, email, password }));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left: Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 px-16 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Workspace</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Start managing your work in minutes
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Create your account and set up your first workspace. No credit card required, no backend needed.
          </p>
        </div>
      </div>

      {/* Right: Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#10b981' }}
            >
              <Layers className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: 'var(--fg-primary)' }}>
              Workspace
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--fg-primary)' }}>
            Create your account
          </h2>
          <p className="mb-8" style={{ color: 'var(--fg-secondary)' }}>
            Get started with a free workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--fg-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--fg-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm pr-11 transition-all duration-200"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--fg-primary)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--border-focus)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--fg-tertiary)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {(errors.length > 0 || loginError) && (
              <div
                className="px-4 py-3 rounded-lg text-sm animate-slide-up"
                style={{
                  background: 'var(--accent-danger-light)',
                  color: 'var(--accent-danger)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
                {loginError && <div>{loginError}</div>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
              style={{ background: '#10b981' }}
              onMouseOver={e => !isLoading && ((e.target as HTMLElement).style.background = '#059669')}
              onMouseOut={e => ((e.target as HTMLElement).style.background = '#10b981')}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'var(--fg-tertiary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium transition-colors" style={{ color: 'var(--accent-primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
