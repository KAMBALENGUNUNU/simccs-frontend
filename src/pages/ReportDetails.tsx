import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { ReportResponse, UserRole } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import {
    MapPin,
    Calendar,
    AlertTriangle,
    Edit2,
    Trash2,
    Flag,
    Save,
    History,
    Upload,
    ArrowLeft,
    Clock,
    FileText,
    CheckCircle,
} from 'lucide-react';

interface ReportVersion {
    id: number;
    versionNumber: number;
    changeReason: string;
    createdAt: string;
}

export function ReportDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, hasRole } = useAuth();

    const [report, setReport] = useState<ReportResponse | null>(null);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', summary: '', content: '' });

    const [versions, setVersions] = useState<ReportVersion[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadReport();
    }, [id]);

    const loadReport = async () => {
        try {
            if (!id) return;
            const response = await apiClient.getReportById(parseInt(id));
            setReport(response.data);
            setEditForm({
                title: response.data.title,
                summary: response.data.summary,
                content: response.data.content
            });
        } catch {
            setError('Failed to load report. It may have been secluded or redacted.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!report || !id) return;
        try {
            await apiClient.updateReport(report.id, {
                ...editForm,
                latitude: report.latitude,
                longitude: report.longitude
            });
            setIsEditing(false);
            loadReport();
        } catch {
            alert('Failed to update report data.');
        }
    };

    const handleDelete = async () => {
        if (!report || !confirm('CRITICAL ACTION: Are you sure you want to completely expunge this report from the mainframe?')) return;
        try {
            await apiClient.deleteReport(report.id);
            navigate('/dashboard');
        } catch {
            alert('Failed to delete report.');
        }
    };

    const handleFlag = async () => {
        if (!report) return;
        try {
            await apiClient.flagReport(report.id);
            alert('Report successfully flagged for review by the misinformation moderation team.');
        } catch {
            alert('Failed to flag report.');
        }
    };

    const loadVersions = async () => {
        if (!report) return;
        try {
            const response = await apiClient.getReportVersions(report.id);
            setVersions(response.data as unknown as ReportVersion[]);
            setShowHistory(!showHistory);
        } catch {
            alert('Failed to extract version history.');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !report) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const fileName = await apiClient.uploadMedia(file);

            await apiClient.updateReport(report.id, {
                ...editForm,
                latitude: report.latitude,
                longitude: report.longitude,
                mediaFiles: [fileName]
            });
            alert('Asset linked successfully: ' + fileName);
        } catch {
            alert('Asset transmission failed.');
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-3 py-1 rounded-xl text-xs font-bold tracking-wide shadow-sm flex items-center justify-center gap-1.5 uppercase transition-colors';
        switch (status) {
            case 'APPROVED':
                return `${baseClasses} bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20 dark:ring-emerald-500/30`;
            case 'REJECTED':
                return `${baseClasses} bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/20 dark:ring-rose-500/30`;
            case 'PENDING':
                return `${baseClasses} bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20 dark:ring-amber-500/30`;
            case 'REVISION_REQUESTED':
                return `${baseClasses} bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 ring-1 ring-orange-500/20 dark:ring-orange-500/30`;
            case 'FLAGGED':
                return `${baseClasses} bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500/20 dark:ring-rose-500/30`;
            default:
                return `${baseClasses} bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-slate-500/20 dark:ring-slate-500/30`;
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin animation-delay-2000"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!report && !loading) {
        return (
            <Layout>
                <div className="p-20 text-center animate-fade-in">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-slate-200 dark:ring-slate-700 shadow-inner transition-colors">
                        <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Classified or Expunged Data</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">The requested intelligence brief could not be located on the current server hierarchy.</p>
                    <button onClick={() => navigate(-1)} className="mt-8 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                        Return to Dashboard
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
                    <button onClick={() => navigate(-1)} className="group flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-xl ring-1 ring-slate-200/60 dark:ring-slate-800/60 shadow-sm">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Briefings</span>
                    </button>
                    {!isEditing && (
                        <div className="flex flex-wrap items-center gap-2">
                            {(hasRole(UserRole.EDITOR) || user?.id.toString() === report?.authorName) && (
                                <button onClick={() => setIsEditing(true)} className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 font-bold text-sm rounded-xl shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60 transition-all hover:ring-indigo-200 dark:hover:ring-slate-600 hover:shadow-md">
                                    <Edit2 className="w-4 h-4 mr-2" /> Modify Record
                                </button>
                            )}
                            <button onClick={handleFlag} className="flex items-center px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-bold text-sm rounded-xl shadow-sm ring-1 ring-amber-500/20 dark:ring-amber-500/30 transition-all hover:shadow-md">
                                <Flag className="w-4 h-4 mr-2" /> Flag Asset
                            </button>
                            {hasRole(UserRole.ADMIN) && (
                                <button onClick={handleDelete} className="flex items-center px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-bold text-sm rounded-xl shadow-sm ring-1 ring-rose-500/20 dark:ring-rose-500/30 transition-all hover:shadow-md">
                                    <Trash2 className="w-4 h-4 mr-2" /> Expunge
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start space-x-3 shadow-sm transition-colors">
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>
                    </div>
                )}

                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden relative transition-colors">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-bl-full -z-10 transition-colors"></div>

                    {isEditing ? (
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/30 pb-4 mb-6 transition-colors">
                                <h2 className="text-xl font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-3 transition-colors">
                                    <Edit2 className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                                    Editing Briefing
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 transition-colors">Subject Header</label>
                                    <input
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-700/60 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 pb-2 transition-colors text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        placeholder="Operation title..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 mt-6 transition-colors">Executive Summary</label>
                                    <textarea
                                        value={editForm.summary}
                                        onChange={e => setEditForm({ ...editForm, summary: e.target.value })}
                                        className="w-full p-4 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200 font-medium"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 mt-4 transition-colors">Full Decrypted Payload</label>
                                    <textarea
                                        value={editForm.content}
                                        rows={12}
                                        onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                                        className="w-full p-5 border border-slate-200 dark:border-slate-700/60 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-300 leading-relaxed font-serif"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                    <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Abort Changes</button>
                                    <button onClick={handleUpdate} className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                                        <Save className="w-4 h-4 mr-2" /> Commit Modification
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        report && (
                            <div className="flex flex-col lg:flex-row">
                                <div className="flex-1 p-8 lg:p-12 lg:pr-8">
                                    <div className="mb-8">
                                        <div className="flex flex-wrap items-center gap-3 mb-6">
                                            <span className={getStatusBadge(report.status)}>
                                                {report.status.replace('_', ' ')}
                                            </span>
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-3 py-1 rounded-xl text-xs uppercase tracking-wider transition-colors">
                                                ID: {report.id}
                                            </span>
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight transition-colors">
                                            {report.title}
                                        </h1>

                                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1 transition-colors">Author</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center transition-colors">
                                                    <FileText className="w-4 h-4 mr-1.5 text-indigo-400" />
                                                    {report.authorName}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1 transition-colors">Coordinates</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center transition-colors">
                                                    <MapPin className="w-4 h-4 mr-1.5 text-emerald-500 dark:text-emerald-400" />
                                                    {report.latitude}, {report.longitude}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mb-1 transition-colors">Timestamp</p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center transition-colors">
                                                    <Calendar className="w-4 h-4 mr-1.5 text-blue-500 dark:text-blue-400" />
                                                    {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                            {report.casualtyCount !== undefined && report.casualtyCount > 0 && (
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-rose-400 dark:text-rose-500 mb-1 transition-colors">Casualties</p>
                                                    <p className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 rounded-lg ring-1 ring-rose-500/20 dark:ring-rose-500/30 transition-colors">
                                                        <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-500 dark:text-rose-400" />
                                                        {report.casualtyCount} Recorded
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-8 mt-10">
                                        <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm relative overflow-hidden transition-colors">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-2 transition-colors">Executive Overview</h3>
                                            <p className="text-lg text-indigo-900 dark:text-indigo-300 font-medium leading-relaxed transition-colors">{report.summary}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 transition-colors">Full Decrypted Transmission</h3>
                                            <div className="prose prose-slate dark:prose-invert max-w-none transition-colors">
                                                <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-300 leading-relaxed font-serif text-lg transition-colors">{report.content}</p>
                                            </div>
                                        </div>

                                        {report.categories && report.categories.length > 0 && (
                                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 transition-colors">Assigned Classifications</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {report.categories.map((category, idx) => (
                                                        <span key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm uppercase tracking-wide transition-colors">
                                                            {category}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Sidebar */}
                                <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30 p-8 flex flex-col gap-8 transition-colors">
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50 transition-colors">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center transition-colors">
                                            <Upload className="w-4 h-4 mr-2" /> Asset Attachment
                                        </h3>
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center justify-center w-full h-24 px-4 transition bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none group">
                                                <div className="flex flex-col items-center space-y-2">
                                                    {uploading ? (
                                                        <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                                    )}
                                                    <span className="font-medium text-xs text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {uploading ? 'Transmitting...' : 'Drop files to attach'}
                                                    </span>
                                                </div>
                                                <input type="file" name="file_upload" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50 flex-1 transition-colors">
                                        <button onClick={loadVersions} className="flex items-center justify-between w-full text-left group mb-4">
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center transition-colors">
                                                <History className="w-4 h-4 mr-2" />
                                                Version Control
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">Toggle</span>
                                        </button>

                                        {showHistory && (
                                            <div className="space-y-3 mt-4 animate-fade-in relative z-10 before:absolute before:inset-0 before:ml-[11px] before:-z-10 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                                                {versions.map((v, i) => (
                                                    <div key={v.id} className="relative pl-8">
                                                        <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white dark:ring-slate-800 ${i === 0 ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                                            {i === 0 ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <div className={`bg-white dark:bg-slate-900 p-3 rounded-xl border ${i === 0 ? 'border-indigo-200 dark:border-indigo-500/50 shadow-sm' : 'border-slate-200 dark:border-slate-700'} transition-colors`}>
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className={`text-xs font-bold ${i === 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>v{v.versionNumber}</span>
                                                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed transition-colors">{v.changeReason}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {versions.length === 0 && (
                                                    <div className="pl-6 text-sm font-medium text-slate-500 dark:text-slate-400 italic transition-colors">No historical revisions found.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </Layout>
    );
}