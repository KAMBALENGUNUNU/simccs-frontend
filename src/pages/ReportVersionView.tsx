import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import {
    ArrowLeft,
    Clock,
    FileText,
    MapPin,
    User,
    GitBranch,
    AlertTriangle,
} from 'lucide-react';

interface VersionDetail {
    id: number;
    versionNumber: number;
    changeReason: string;
    actorName: string;
    createdAt: string;
    content: string;
    reportId: number;
    reportTitle: string;
    reportSummary: string;
    reportAuthor: string;
    reportLocation: string | null;
}

export function ReportVersionView() {
    const { reportId, versionId } = useParams<{ reportId: string; versionId: string }>();
    const navigate = useNavigate();

    const [version, setVersion] = useState<VersionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!reportId || !versionId) return;
        (async () => {
            try {
                const res = await apiClient.getReportVersionDetail(
                    parseInt(reportId),
                    parseInt(versionId)
                );
                setVersion(res.data as unknown as VersionDetail);
            } catch {
                setError('Failed to load this version. It may have been purged or the decryption key has changed.');
            } finally {
                setLoading(false);
            }
        })();
    }, [reportId, versionId]);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-violet-400 rounded-full animate-spin animation-delay-2000"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16 px-4 sm:px-6">

                {/* Top Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-xl ring-1 ring-slate-200/60 dark:ring-slate-800/60 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Report</span>
                    </button>
                    {version && (
                        <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 ml-1">
                            <Link to={`/reports/${version.reportId}`} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors truncate max-w-[200px]">
                                {version.reportTitle}
                            </Link>
                            <span>/</span>
                            <span className="text-slate-600 dark:text-slate-300">Version {version.versionNumber}</span>
                        </nav>
                    )}
                </div>

                {error && (
                    <div className="p-5 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start gap-3 shadow-sm">
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>
                    </div>
                )}

                {version && (
                    <>
                        {/* Version Banner */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-900 dark:from-slate-950 dark:to-indigo-950 rounded-3xl p-8 shadow-xl">
                            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl -z-0" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                                        <GitBranch className="w-5 h-5 text-indigo-300" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300/70">Historical Snapshot</p>
                                        <p className="text-lg font-black text-white tracking-tight">Version {version.versionNumber}</p>
                                    </div>
                                    <span className="ml-auto px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-widest rounded-xl">
                                        Archived
                                    </span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-4">
                                    {version.reportTitle}
                                </h1>
                                <div className="flex flex-wrap gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-slate-300/80 text-xs font-semibold">
                                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Saved {new Date(version.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300/80 text-xs font-semibold">
                                        <User className="w-3.5 h-3.5 text-violet-400" />
                                        <span>Edited by <strong className="text-white">{version.actorName}</strong></span>
                                    </div>
                                    {version.reportLocation && (
                                        <div className="flex items-center gap-2 text-slate-300/80 text-xs font-semibold">
                                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>{version.reportLocation}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Change Reason */}
                        {version.changeReason && (
                            <div className="flex items-start gap-4 p-5 bg-amber-50/80 dark:bg-amber-900/20 rounded-2xl border border-amber-200/60 dark:border-amber-700/40 shadow-sm">
                                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/70 dark:text-amber-400/70 mb-1">Change Reason</p>
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200 leading-relaxed">{version.changeReason}</p>
                                </div>
                            </div>
                        )}

                        {/* Main Content Card */}
                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">

                            {/* Summary Section */}
                            {version.reportSummary && (
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/40 dark:bg-indigo-900/10">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3">Executive Summary</h3>
                                    <p className="text-lg text-indigo-900 dark:text-indigo-300 font-medium leading-relaxed">
                                        {version.reportSummary}
                                    </p>
                                </div>
                            )}

                            {/* Full Content */}
                            <div className="p-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    Full Content at This Version
                                </h3>
                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                    <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-300 leading-relaxed font-serif text-base">
                                        {version.content}
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-5 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                                <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                    Original author: <span className="font-bold text-slate-600 dark:text-slate-300">{version.reportAuthor}</span>
                                </div>
                                <Link
                                    to={`/reports/${version.reportId}`}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                                >
                                    View Current Report →
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    );
}
