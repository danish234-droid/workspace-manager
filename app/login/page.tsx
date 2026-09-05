'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { login, clearLoginError } from '@/store/authSlice';
import { setTheme } from '@/store/settingsSlice';
import { addToast } from '@/store/uiSlice';
import ToastContainer from '@/components/ui/ToastContainer';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  X,
  ChevronDown,
  Check,
  Globe,
  Sparkles,
  Layers,
  Star,
} from 'lucide-react';
import Link from 'next/link';

interface WorkspacePersona {
  id: string;
  name: string;
  firstName: string;
  workspaceName: string;
  domain: string;
  email: string;
  role: string;
  icon: string;
  accentColor: string;
}

const DEMO_PERSONAS: WorkspacePersona[] = [
  {
    id: 'alex',
    name: 'Alex Johnson',
    firstName: 'Alex',
    workspaceName: 'Engineering Core',
    domain: 'core.workspace.dev',
    email: 'alex@workspace.dev',
    role: 'Lead Architect',
    icon: '⚡',
    accentColor: '#6366f1',
  },
  {
    id: 'sarah',
    name: 'Sarah Williams',
    firstName: 'Sarah',
    workspaceName: 'Product & Design Hub',
    domain: 'design.workspace.dev',
    email: 'sarah@workspace.dev',
    role: 'Product Operations',
    icon: '🎯',
    accentColor: '#ec4899',
  },
  {
    id: 'michael',
    name: 'Michael Brown',
    firstName: 'Michael',
    workspaceName: 'Platform Sprints',
    domain: 'platform.workspace.dev',
    email: 'michael@workspace.dev',
    role: 'Frontend Dev',
    icon: '🚀',
    accentColor: '#f59e0b',
  },
];

export default function LoginPage() {
  const [selectedPersona, setSelectedPersona] = useState<WorkspacePersona>(DEMO_PERSONAS[0]);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [email, setEmail] = useState(DEMO_PERSONAS[0].email);
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, loginError } = useAppSelector(state => state.auth);
  const currentTheme = useAppSelector(state => state.settings.settings.theme);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else if (currentTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [currentTheme]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    dispatch(clearLoginError());
  }, [email, password, dispatch]);

  // Subtle story ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStoryIndex(prev => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPersona = (persona: WorkspacePersona) => {
    setSelectedPersona(persona);
    setEmail(persona.email);
    setPassword('password123');
    setWorkspaceDropdownOpen(false);
    dispatch(
      addToast({
        type: 'info',
        message: `Loaded ${persona.name} (${persona.workspaceName})`,
        duration: 2500,
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    dispatch(login({ email, password }));
    setIsLoading(false);
  };

  const toggleTheme = () => {
    dispatch(setTheme(currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 relative selection:bg-indigo-500 selection:text-white"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Delicate Ambient Background Glow */}
      <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Card Container */}
      <div
        className="w-full max-w-[980px] rounded-3xl overflow-hidden transition-all duration-300 relative z-10 flex flex-col lg:flex-row"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* ─── LEFT: Refined Brand Poster Card ─── */}
        <div className="p-3 sm:p-4 lg:p-4 lg:w-[44%] flex">
          <div className="w-full rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[320px] lg:min-h-[520px] text-white select-none bg-gradient-to-br from-[#0e0c24] via-[#141238] to-[#0a081a]">
            {/* Ambient Graphic Layers */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/25 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-violet-600/25 rounded-full blur-3xl" />

              {/* Concentric Glow Ripples (Inspired by the reference design, tailored & polished) */}
              <div className="absolute -bottom-24 -right-24 w-[340px] h-[340px] rounded-full border border-indigo-400/15 pointer-events-none" />
              <div className="absolute -bottom-14 -right-14 w-[260px] h-[260px] rounded-full border border-indigo-400/25 pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 w-[180px] h-[180px] rounded-full border border-violet-400/35 shadow-[0_0_35px_rgba(139,92,246,0.25)] pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-[110px] h-[110px] rounded-full border border-violet-300/50 shadow-[0_0_25px_rgba(167,139,250,0.4)] pointer-events-none" />
            </div>

            {/* Top Carousel Bar & Header */}
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-6">
                <div
                  className="h-1 flex-1 rounded-full transition-all duration-500"
                  style={{
                    background: activeStoryIndex === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                  }}
                />
                <div
                  className="h-1 flex-1 rounded-full transition-all duration-500"
                  style={{
                    background: activeStoryIndex === 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.25)',
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold tracking-wide">
                <span>→</span>
                <span>Workspace Manager — Built for Teams</span>
              </div>
            </div>

            {/* Middle: Clean Typography Tailored to Workspace Manager */}
            <div className="relative z-10 my-auto py-4">
              {activeStoryIndex === 0 ? (
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-[1.15] tracking-tight uppercase text-white mb-3">
                    Manage Projects. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200">
                      Lead Teams. Ship Faster.
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-indigo-100/70 leading-relaxed max-w-[280px]">
                    Kanban boards, sprint tracking, task assignments & team collaboration — all unified in one workspace.
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-[1.15] tracking-tight uppercase text-white mb-3">
                    Track Tasks. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-200">
                      Hit Every Deadline.
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-indigo-100/70 leading-relaxed max-w-[280px]">
                    Prioritize work, assign tasks, and monitor sprint progress — all in real time with your team.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom: 4-Point Glow Sparkle & Community Trust */}
            <div className="relative z-10 flex items-end justify-between pt-4">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-white/70 font-medium">Trusted by 10k+ project teams</span>
              </div>

              {/* 4-Point Neon Sparkle Star (As in the reference) */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-violet-400 blur-lg opacity-70 animate-pulse" />
                <svg
                  className="w-10 h-10 text-white fill-white relative z-10 drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Clean, Professional Form ─── */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          {/* Top Bar: Brand Logo & Language/Theme Switcher */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ background: 'var(--accent-primary)' }}
              >
                <Layers size={17} />
              </div>
              <span className="font-bold text-base tracking-tight" style={{ color: 'var(--fg-primary)' }}>
                Workspace
              </span>
            </div>

            {/* Controls: Theme & Locale */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle theme"
              >
                {currentTheme === 'dark' ? (
                  <Sun size={15} className="text-amber-400" />
                ) : (
                  <Moon size={15} className="text-indigo-600" />
                )}
              </button>

              <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Globe size={13} />
                <span>English</span>
                <ChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-[380px] w-full mx-auto my-auto py-1">
            {/* Heading */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--fg-primary)' }}>
                Welcome back{selectedPersona ? `, ${selectedPersona.firstName}` : ''}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-400">
                Sign in to your Workspace Manager account
              </p>
            </div>

            {/* ─── Workspace Dropdown Selector (Inspired by SpaceX EMEA card) ─── */}
            <div className="relative mb-4">
              <button
                type="button"
                onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 text-left cursor-pointer"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs"
                    style={{ background: selectedPersona.accentColor }}
                  >
                    {selectedPersona.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight" style={{ color: 'var(--fg-primary)' }}>
                      {selectedPersona.workspaceName}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {selectedPersona.domain}
                    </div>
                  </div>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform duration-200 ${workspaceDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Options */}
              {workspaceDropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-xl z-30 shadow-xl border animate-scale-in"
                  style={{
                    background: 'var(--bg-elevated)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Workspace Demo
                  </div>
                  {DEMO_PERSONAS.map(p => {
                    const isCurrent = p.id === selectedPersona.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPersona(p)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs"
                            style={{ background: p.accentColor }}
                          >
                            {p.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold" style={{ color: 'var(--fg-primary)' }}>
                              {p.workspaceName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {p.name} • {p.role}
                            </div>
                          </div>
                        </div>
                        {isCurrent && <Check size={14} className="text-indigo-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Work Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--fg-secondary)' }}
                >
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--fg-primary)',
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--fg-secondary)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 pr-10 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--fg-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-500 dark:text-slate-400 text-xs">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Banner */}
              {loginError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 animate-slide-up">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span className="flex-1 font-medium">{loginError}</span>
                  <button type="button" onClick={() => dispatch(clearLoginError())}>
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Submit Pill Button (Inspired by reference) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-full text-xs sm:text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 cursor-pointer shadow-md hover:brightness-110 active:scale-[0.99] mt-2"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <span>Log me in</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Quick switch:</span>
              <div className="flex items-center gap-1.5">
                {DEMO_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      selectedPersona.id === p.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {p.firstName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer (Privacy · Terms · Status) */}
          <div className="flex items-center justify-end gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-3">
            <a href="#" className="hover:underline">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms</a>
            <span>•</span>
            <a href="#" className="hover:underline">Status</a>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-sm p-6 rounded-2xl shadow-2xl border animate-scale-in"
            style={{
              background: 'var(--bg-elevated)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'var(--fg-primary)' }}>
                Reset Password
              </h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="py-4 text-center space-y-2">
                <p className="text-xs font-medium text-emerald-500">
                  Password reset link sent to {forgotEmail || email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your work email to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="alex@workspace.dev"
                  className="w-full px-3.5 py-2 rounded-xl text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--fg-primary)',
                  }}
                />
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    Send link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}
