import React, { useState } from 'react';
import { Lock, Shield, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setError('Please enter the team access key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: passkey.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('ax_prod_auth_token', data.token);
        onSuccess();
      } else {
        setError(data.message || 'Invalid team passkey');
      }
    } catch (err: any) {
      // In case server route is unavailable, allow standard team key
      if (passkey.trim().toLowerCase() === 'ax2026' || passkey.trim().toLowerCase() === 'team') {
        localStorage.setItem('ax_prod_auth_token', 'local_token');
        onSuccess();
      } else {
        setError('Authentication service error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#191F30] border border-[#2A3650] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
        <div className="w-12 h-12 rounded-xl bg-[#9DDB00]/10 border border-[#9DDB00]/30 flex items-center justify-center mb-5 mx-auto">
          <Shield className="w-6 h-6 text-[#9DDB00]" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#F4F6FB] tracking-tight">
            AX Production Dashboard
          </h2>
          <p className="text-xs text-[#9CA8BD] mt-1.5 leading-relaxed">
            Internal Production Monitoring Platform for team leads, reviewers, and management.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9CA8BD] uppercase tracking-wider mb-2">
              Team Passkey
            </label>
            <div className="relative">
              <input
                type="password"
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setError('');
                }}
                placeholder="Enter access key (e.g. ax2026)"
                className="w-full px-4 py-3 rounded-xl bg-[#20283D] border border-[#2A3650] focus:border-[#9DDB00] text-sm text-[#F4F6FB] placeholder-[#9CA8BD]/50 focus:outline-none transition-colors"
                autoFocus
              />
              <Lock className="w-4 h-4 text-[#9CA8BD] absolute right-3.5 top-3.5" />
            </div>
            {error && (
              <div className="flex items-center space-x-1.5 text-xs text-red-400 mt-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#9DDB00] hover:bg-[#8ac200] text-[#111522] font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#9DDB00]/10 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying...' : 'Access Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#2A3650] text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#20283D] text-[11px] text-[#9CA8BD] font-mono">
            <CheckCircle className="w-3.5 h-3.5 text-[#5689FF]" />
            <span>Default team key: <strong className="text-[#F4F6FB]">ax2026</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
