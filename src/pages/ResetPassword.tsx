import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { apiClient } from '../services/api';
import { AuthLayout } from '../components/AuthLayout';

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setMsg("Passwords don't match");
            return;
        }
        if (!token) {
            setMsg("Invalid or missing token");
            return;
        }

        setStatus('loading');
        try {
            await apiClient.resetPassword(token, password);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch {
            // FIX: Removed (err)
            setStatus('error');
            setMsg('Failed to reset password. Token may be expired.');
        }
    };

    if (status === 'success') {
        return (
            <AuthLayout
                icon={<CheckCircle />}
                title={"Password Reset!"}
                subtitle={"Redirecting to login..."}
                gradient="from-emerald-400 to-cyan-400"
            >
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200/50 dark:border-white/10 text-center relative overflow-hidden transition-colors">
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed transition-colors animate-pulse">Redirecting...</p>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            icon={<Lock />}
            title={"Set New Password"}
            subtitle={"Secure your account"}
        >
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-200/50 dark:border-white/10 relative overflow-hidden transition-colors">
                {msg && (
                    <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl flex items-start space-x-3 backdrop-blur-md transition-colors">
                        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-rose-800 dark:text-rose-200 leading-relaxed transition-colors">{msg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 transition-colors">New Password</label>
                        <div className="relative group/input">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40 tracking-widest"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest pl-1 transition-colors">Confirm Password</label>
                        <div className="relative group/input">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors" />
                            <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-black/40 tracking-widest"
                                required
                            />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-4 relative group overflow-hidden rounded-2xl bg-indigo-600 text-white font-bold tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <span className="relative z-10">{status === 'loading' ? 'Resetting...' : 'Reset Password'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}