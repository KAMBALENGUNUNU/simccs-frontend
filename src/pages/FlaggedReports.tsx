import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { AlertTriangle, ShieldAlert, FlagOff, CheckCircle2 } from 'lucide-react';

export function FlaggedReports() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.getFlaggedReports().then(res => {
            if (Array.isArray(res.data)) setReports(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
                <div className="bg-gradient-to-r from-red-600 to-rose-700 p-8 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full mix-blend-overlay blur-2xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full mix-blend-overlay blur-xl"></div>
                    <div className="relative z-10 flex-1">
                        <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center mb-3 tracking-tight">
                            <ShieldAlert className="w-10 h-10 mr-4 text-rose-200" />
                            Quarantine Zone
                        </h1>
                        <p className="text-rose-100 font-medium text-lg leading-relaxed max-w-xl">
                            Intelligence flagged for severe misinformation, protocol breach, or manual escalation. Review immediately.
                        </p>
                    </div>
                    <div className="relative z-10 shrink-0 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-inner">
                        <div className="text-rose-100 text-xs font-bold uppercase tracking-widest mb-1 text-center">Threat Level</div>
                        <div className="text-white text-3xl font-black text-center flex items-center justify-center">
                            {reports.length}
                            <span className="text-lg ml-2">{reports.length === 1 ? 'Asset' : 'Assets'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden min-h-[400px] transition-colors">
                    {reports.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-emerald-200 dark:ring-emerald-500/30 transition-colors">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight transition-colors">Quarantine Empty</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-sm transition-colors">No intelligence payloads trigger current heuristic flags.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100/80 dark:divide-slate-800/80 transition-colors">
                            {reports.map((flag) => (
                                <div key={flag.id} className="p-6 sm:p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="shrink-0 pt-1">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner ring-1 ring-rose-200 dark:ring-rose-500/30 group-hover:bg-rose-600 dark:group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                                            <FlagOff className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 transition-colors">Investigation ID</h3>
                                                <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg inline-block transition-colors">{flag.reportId || flag.id || 'N/A'}</p>
                                            </div>
                                            {flag.aiConfidenceScore && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 transition-colors">Heuristics Confidence</span>
                                                    <div className="flex items-center space-x-2 bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-800/50 transition-colors">
                                                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                                        <span className="text-sm font-black text-rose-700 dark:text-rose-400">{(flag.aiConfidenceScore * 100).toFixed(0)}%</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 transition-colors">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 transition-colors">Automated Flag Reason</h4>
                                            <p className="text-slate-800 dark:text-slate-300 font-medium leading-relaxed transition-colors">{flag.reason}</p>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors">
                                                Review Payload
                                            </button>
                                            <button className="px-5 py-2.5 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-rose-700 dark:hover:bg-rose-500 shadow-sm hover:shadow-md transition-all">
                                                Expunge Immediately
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}