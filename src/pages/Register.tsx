import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, AlertCircle, CheckCircle, Fingerprint, Info, Badge } from 'lucide-react';
import { apiClient } from '../services/api';
import { UserRole } from '../types/api';
import { AuthLayout } from '../components/AuthLayout';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    nationalId: '',
    role: UserRole.JOURNALIST,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Encryption keys do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Key length must exceed 6 cryptographic units.');
      return;
    }

    setLoading(true);

    try {
      await apiClient.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        nationalId: formData.nationalId,
        role: [formData.role],
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration sequence rejected.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        icon={<CheckCircle />}
        title={"Clearance Granted"}
        subtitle={"Your identity vector has been registered.\nPending final authorization by command personnel."}
        gradient="from-emerald-400 to-cyan-400"
      >
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-slate-200/50 dark:border-white/10 text-center relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>

          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8 mt-2 animate-pulse transition-colors">
            Redirecting to Access Portal...
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full px-6 py-4 bg-slate-900 dark:bg-white/10 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-white/20 transition-all border border-transparent dark:border-white/10 uppercase tracking-widest text-sm"
          >
            Force Redirect
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={<Fingerprint />}
      title={"Initialize Identity"}
      subtitle={"Register for command clearance"}
      gradient="from-indigo-500 to-rose-400"
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
            <label htmlFor="fullName" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 transition-colors">
              Operative Designation
            </label>
            <div className="relative group/input">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="nationalId" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 transition-colors">
              National Journalistic ID Number
            </label>
            <div className="relative group/input">
              <Badge className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
              <input
                id="nationalId"
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40 tracking-widest"
                placeholder="ID-XXXX-YYYY"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 transition-colors">
              Telecom Vector
            </label>
            <div className="relative group/input">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40"
                placeholder="email@secure.net"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 transition-colors">
              Requested Clearance
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-bold text-indigo-700 dark:text-indigo-400 appearance-none focus:bg-white dark:focus:bg-black/40 cursor-pointer"
            >
              <option value={UserRole.JOURNALIST} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Field Operative (Journalist)</option>
              <option value={UserRole.EDITOR} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Command Center (Editor)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 truncate transition-colors">
                Cipher Key
              </label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40 tracking-widest"
                  placeholder="••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 truncate transition-colors">
                Verify Key
              </label>
              <div className="relative group/input">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40 tracking-widest"
                  placeholder="••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 relative group overflow-hidden rounded-2xl bg-indigo-600 text-white font-bold tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] block"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                {loading ? 'Processing...' : 'Request Clearance'}
              </span>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/10 text-center relative z-10 transition-colors">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">
            Existing clearances?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold ml-1 transition-colors">
              Access Portal
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
