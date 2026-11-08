import React, { useState } from 'react';
import { api } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onNotify }) => {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        await api.auth.register(formData);
        onNotify('Account created successfully! Logging you in...', 'success');
      }

      const loginPayload = new URLSearchParams();
      loginPayload.append('username', formData.username.trim().toLowerCase());
      loginPayload.append('password', formData.password);

      const tokenRes = await api.auth.login(loginPayload);
      await login(tokenRes.access_token);
      onNotify('Welcome back! Signed in successfully.', 'success');
      onClose();
    } catch (err: any) {
      onNotify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-8 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        {/* Tab switch */}
        <div className="flex border-b border-stone-100 font-mono text-xs dark:border-stone-800">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 pb-3 font-semibold uppercase tracking-wider transition-colors ${
              !isRegister
                ? 'border-b-2 border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 pb-3 font-semibold uppercase tracking-wider transition-colors ${
              isRegister
                ? 'border-b-2 border-stone-900 text-stone-900 dark:border-stone-100 dark:text-stone-100'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="font-mono text-[10px] uppercase text-stone-500">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase text-stone-500">Email Address</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                />
              </div>
            </>
          )}

          <div>
            <label className="font-mono text-[10px] uppercase text-stone-500">Username</label>
            <input
              type="text"
              placeholder="Username"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase text-stone-500">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:border-stone-900 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-stone-900 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Register & Join' : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center font-mono text-xs text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
