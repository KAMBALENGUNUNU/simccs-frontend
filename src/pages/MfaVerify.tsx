import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/AuthLayout';

export function MfaVerify() {
  const navigate = useNavigate();
  const { verifyMfaLogin } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await verifyMfaLogin(code);

      if (userData.roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (userData.roles.includes('ROLE_EDITOR')) {
        navigate('/review-queue');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={<Shield />}
      title={"Two-Factor Auth"}
      subtitle={"Enter the code from your\nauthenticator app"}
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
            <label htmlFor="code" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 transition-colors">
              Verification Code
            </label>
            <div className="relative group/input">
              <Key className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
                className="w-full pl-14 pr-6 py-4 bg-slate-50/50 dark:bg-black/20 border-2 border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-mono font-bold text-center text-3xl tracking-[0.5em] text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40 shadow-inner"
                placeholder="••••••"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-4 relative group overflow-hidden rounded-2xl bg-indigo-600 text-white font-bold tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] mt-2 flex items-center justify-center"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Verify Access</span>
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
