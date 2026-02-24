import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '../services/api';
import { AuthLayout } from '../components/AuthLayout';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        icon={<CheckCircle />}
        title={"Check Your Email"}
        subtitle={`We've sent password reset instructions to\n${email}`}
        gradient="from-emerald-400 to-cyan-400"
      >
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200/50 dark:border-white/10 text-center relative overflow-hidden transition-colors">
          <Link
            to="/login"
            className="inline-block w-full px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-[#0B0F19] rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all uppercase tracking-widest text-sm shadow-xl"
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={<Shield />}
      title={"Reset Password"}
      subtitle={"Enter your email to receive\nreset instructions"}
    >
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200/50 dark:border-white/10 relative overflow-hidden transition-colors">
        {error && (
          <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-start space-x-3 backdrop-blur-md transition-colors">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-800 dark:text-rose-200 leading-relaxed transition-colors">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 transition-colors">
              Email Address
            </label>
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 relative group overflow-hidden rounded-2xl bg-indigo-600 text-white font-bold tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/10 text-center relative z-10 transition-colors">
          <Link to="/login" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
