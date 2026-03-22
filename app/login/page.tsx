'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, RotateCcw } from 'lucide-react';
import { USERS, setCurrentUser, factoryReset } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Hardcoded authentication logic for demo
    const usernameLower = username.toLowerCase().trim();

    if (usernameLower === 'yasmin' && password === 'admin') {
      const user = USERS.find(u => u.id === 'u_001');
      if (user) {
        setCurrentUser(user.id);
        router.push('/dashboard');
        return;
      }
    } else if (usernameLower === 'sarah' && password === 'admin') {
      const user = USERS.find(u => u.id === 'm_999');
      if (user) {
        setCurrentUser(user.id);
        router.push('/dashboard');
        return;
      }
    }

    setError('Invalid username or password');
    setLoading(false);
  };

  const handleFactoryReset = () => {
    factoryReset();
    setShowResetConfirm(false);
    setError('');
    setUsername('');
    setPassword('');
    alert('✅ Demo database reset! All HDRs, notifications, and chat history cleared.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-violet-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-6">
            <Shield className="w-12 h-12 text-violet-600" strokeWidth={1.5} />
            <h1 className="text-4xl font-bold text-neutral-900">TrustDoc</h1>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Sign In</h2>
          <p className="text-sm text-neutral-600">Enter your credentials to access the Enterprise Compliance OS</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-8 ring-1 ring-neutral-200 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yasmin or sarah"
                  required
                  autoComplete="username"
                  style={{ color: '#000000 !important', backgroundColor: '#ffffff !important', caretColor: '#000000 !important' }}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ color: '#000000 !important', backgroundColor: '#ffffff !important', caretColor: '#000000 !important' }}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <p className="text-xs text-neutral-500 text-center mb-3">Demo Credentials:</p>
            <div className="space-y-2 text-xs text-neutral-600">
              <div className="flex items-center justify-between bg-neutral-50 rounded px-3 py-2">
                <span className="font-medium">Yasmin Lemke (Junior)</span>
                <code className="text-violet-600">yasmin / admin</code>
              </div>
              <div className="flex items-center justify-between bg-neutral-50 rounded px-3 py-2">
                <span className="font-medium">Sarah Chen (Head)</span>
                <code className="text-violet-600">sarah / admin</code>
              </div>
            </div>
          </div>
        </div>

        {/* EU AI Act Badge */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            🔒 Role-Based Access Control (RBAC) | EU AI Act Art. 14 Compliant Human Oversight
          </p>
        </div>

        {/* Factory Reset Button */}
        <div className="mt-8 text-center">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-neutral-400 hover:text-rose-600 transition-colors flex items-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo Database
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
              <p className="text-xs text-rose-700 font-medium">Clear all test data?</p>
              <button
                onClick={handleFactoryReset}
                className="text-xs text-white bg-rose-600 hover:bg-rose-700 px-3 py-1 rounded transition-colors font-semibold"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
