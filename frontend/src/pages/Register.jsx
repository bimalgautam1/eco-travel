import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter',  test: (p) => /[A-Z]/.test(p) },
  { label: 'One number',            test: (p) => /\d/.test(p) },
];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const passStrength = PASSWORD_RULES.filter((r) => r.test(form.password)).length;
  const strengthColor = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthLabel = ['Weak', 'Fair', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (passStrength < 2) {
      setError('Please choose a stronger password (8+ chars, uppercase, number).');
      return;
    }

    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(52,211,153,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-2xl shadow-emerald-500/30 text-3xl mb-4">
            🌱
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            EcoRoute <span className="text-emerald-400">India</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Create your free account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl shadow-black/60 p-8">
          <h2 className="text-xl font-bold text-white mb-1">Join EcoRoute</h2>
          <p className="text-slate-400 text-sm mb-6">
            Start comparing commute costs &amp; carbon footprint
          </p>

          {success && (
            <div className="mb-5 bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-emerald-400 text-lg">✅</span>
              <p className="text-emerald-300 text-sm font-semibold">Account created! Redirecting…</p>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-950/50 border border-red-800/60 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-red-400 text-lg mt-0.5">⚠</span>
              <p className="text-red-300 text-sm leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="reg-name">
                Full name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">👤</span>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Riya Sharma"
                  className="w-full bg-slate-800/70 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="reg-email">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">📧</span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full bg-slate-800/70 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔒</span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full bg-slate-800/70 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
                  tabIndex={-1}
                  id="toggle-reg-password"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                          i < passStrength ? strengthColor[passStrength - 1] : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-500">
                      {PASSWORD_RULES.map((r) => (
                        <span
                          key={r.label}
                          className={`inline-block mr-2 ${r.test(form.password) ? 'text-emerald-500' : 'text-slate-600'}`}
                        >
                          {r.test(form.password) ? '✓' : '○'} {r.label}
                        </span>
                      ))}
                    </p>
                    <span className={`text-[11px] font-bold ${strengthColor[passStrength - 1]?.replace('bg-', 'text-') || 'text-slate-500'}`}>
                      {form.password.length > 0 ? strengthLabel[passStrength - 1] || 'Weak' : ''}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2" htmlFor="reg-confirm">
                Confirm password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔑</span>
                <input
                  id="reg-confirm"
                  name="confirm"
                  type={showConf ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`w-full bg-slate-800/70 border rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-700/60 focus:ring-red-500/40 focus:border-red-500/60'
                      : 'border-slate-700/60 focus:ring-emerald-500/60 focus:border-emerald-500/60'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConf((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-sm"
                  tabIndex={-1}
                  id="toggle-confirm-password"
                >
                  {showConf ? '🙈' : '👁️'}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-[11px] text-red-400 mt-1.5">Passwords don't match</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-slate-500 text-[11px] leading-relaxed pt-1">
              By creating an account you agree to our data being stored securely in Supabase (PostgreSQL) and used solely for commute analysis.
            </p>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-700/40 text-sm tracking-wide flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-slate-600 text-xs font-medium">or</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              id="goto-login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Sign in →
            </Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          🇮🇳 EcoRoute India · Hackathon v1.0 · Powered by Supabase
        </p>
      </div>
    </div>
  );
}
