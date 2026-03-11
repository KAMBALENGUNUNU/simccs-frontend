import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle, Info, FileKey } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/AuthLayout';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);

      if (userData.enabled) {
        if (userData.roles.includes('ROLE_ADMIN')) {
          navigate('/admin');
        } else if (userData.roles.includes('ROLE_EDITOR')) {
          navigate('/review-queue');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Your perimeter clearance is pending administrator approval.');
      }
    } catch (err: any) {
      if (err.message === 'MFA_REQUIRED') {
        navigate('/mfa-verify');
      } else {
        setError(err instanceof Error ? err.message : 'Authentication sequence failed. Verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={<Shield />}
      title={"Access Portal"}
      subtitle={"Enter credentials\nto authenticate"}
    >
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200/50 dark:border-white/10 relative overflow-hidden group transition-colors">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-start space-x-3 backdrop-blur-md transition-colors">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-800 dark:text-rose-200 leading-relaxed transition-colors">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 transition-colors">
              Identity Vector
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
                placeholder="operative@simccs.network"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <label htmlFor="password" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest transition-colors">
                Encryption Key
              </label>
              <Link to="/forgot-password" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                Lost Key?
              </Link>
            </div>
            <div className="relative group/input">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40 tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center py-2">
            <label className="flex items-center cursor-pointer group/check">
              <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                <input
                  id="remember"
                  type="checkbox"
                  className="appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-md bg-transparent checked:bg-indigo-500 checked:border-indigo-500 transition-all peer cursor-pointer"
                />
                <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover/check:text-slate-800 dark:group-hover/check:text-slate-300 transition-colors">Maintain active session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 relative group overflow-hidden rounded-2xl bg-indigo-600 text-white font-bold tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FileKey className="w-5 h-5" />
              )}
              {loading ? 'Authenticating...' : 'Initialize Access'}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/10 text-center relative z-10 flex flex-col gap-4 transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">
            Awaiting clearance?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold ml-1 transition-colors">
              Request access
            </Link>
          </p>
        </div>
      </div>

      <div className="text-center mt-8 animate-slide-up animation-delay-500">
        <Link to="/" className="inline-flex items-center justify-center space-x-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/5">
          <Info className="w-4 h-4" />
          <span>Return to Public Matrix</span>
        </Link>
      </div>
    </AuthLayout>
  );
}
