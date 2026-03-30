import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { ReportAction, ChatMessage, WorkflowAction, ChannelDTO, AiEditorRequest, AiAnalysisResponse, ReportResponse, UserRole } from '../types/api';
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
    Brain,
    MessageSquare,
    Eye,
    Globe,
    Activity,
    Send as SendIcon,
    Wand2,
    Download
} from 'lucide-react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { IncidentBriefingPDF } from '../components/reports/pdf/IncidentBriefingPDF';

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

    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<AiAnalysisResponse | null>(null);
    const [aiError, setAiError] = useState('');

    const [actions, setActions] = useState<ReportAction[]>([]);
    const [showAudit, setShowAudit] = useState(false);

    const [aiEditorLoading, setAiEditorLoading] = useState(false);
    const [aiEditorTone, setAiEditorTone] = useState('Professional');
    const [aiEditorRules, setAiEditorRules] = useState('');

    const [chatChannel, setChatChannel] = useState<ChannelDTO | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatConnected, setIsChatConnected] = useState(false);
    const sseControllerRef = useRef<AbortController | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: report ? `Briefing_${report.id}_${report.title.replace(/\s+/g, '_')}` : 'Crisis_Briefing'
    });

    const isAuthor = report?.authorId === user?.id ||
        (user?.id && report?.authorName === user?.id.toString()) ||
        (user?.email && report?.authorName === user.email) ||
        (user?.email && report?.authorName?.toLowerCase() === user.email.toLowerCase()) ||
        ((user as any)?.fullName && report?.authorName === (user as any).fullName) ||
        ((user as any)?.username && report?.authorName === (user as any).username) ||
        (user?.email && report?.authorName && user.email.startsWith(report.authorName));

    const canUploadImage = hasRole(UserRole.EDITOR) || (hasRole(UserRole.JOURNALIST) && isAuthor && report?.status === 'DRAFT');

    useEffect(() => {
        loadReport();
    }, [id]);

    useEffect(() => {
        if (hasRole(UserRole.ADMIN) && id) {
            loadAuditLog();
        }
    }, [id, hasRole]);

    useEffect(() => {
        if (id && !chatChannel) {
            initChat();
        }
    }, [id]);

    // Disconnect SSE when chat closes or unmount
    useEffect(() => {
        return () => {
            if (sseControllerRef.current) {
                sseControllerRef.current.abort();
            }
        };
    }, []);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                longitude: report.longitude,
                locationName: report.locationName,
                reportType: report.reportType,
                priority: report.priority
            } as any);
            setIsEditing(false);
            loadReport();
        } catch {
            alert('Failed to update report data.');
        }
    };

    const handlePublish = async () => {
        if (!report || !id) return;
        try {
            await apiClient.changeReportStatus(report.id, { action: WorkflowAction.PUBLISH, comment: "Published by admin" });
            alert('Report successfully published.');
            loadReport();
            if (hasRole(UserRole.ADMIN)) loadAuditLog();
        } catch {
            alert('Failed to publish report.');
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

    const handleAiCheck = async () => {
        if (!report) return;
        setAiLoading(true);
        setAiError('');
        setAiResult(null);
        try {
            const response = await apiClient.checkMisinformation(report.id);
            setAiResult(response.data);
        } catch (err: any) {
            setAiError(err.message || 'AI analysis failed to compute risk factor.');
        } finally {
            setAiLoading(false);
        }
    };

    const handleAiEdit = async () => {
        if (!report) return;
        setAiEditorLoading(true);
        try {
            const req: AiEditorRequest = {
                reportId: report.id,
                tone: aiEditorTone,
                customRules: aiEditorRules || undefined
            };
            const res = await apiClient.getAiSuggestedEdits(req);
            setEditForm({ ...editForm, content: res.data.suggestedContent });
            alert('AI Editor successfully merged suggestions into your draft. Please review and optionally tweak before committing.');
        } catch (err: any) {
            alert(err.message || 'AI Editor failed to generate suggestions.');
        } finally {
            setAiEditorLoading(false);
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

    const loadAuditLog = async () => {
        if (!id) return;
        try {
            const response = await apiClient.getReportActions(parseInt(id));
            setActions(response.data);
        } catch {
            console.error('Failed to load audit history');
        }
    };

    const initChat = async () => {
        if (!id) return;
        try {
            // First pass: retrieve channel info and history
            const res = await apiClient.request<ChannelDTO>('GET', `/api/chat/reports/${id}/channel`);
            const channel = res.data;
            setChatChannel(channel);

            const histRes = await apiClient.request<ChatMessage[]>('GET', `/api/chat/channels/${channel.id}/history`);
            setMessages(histRes.data);

            // Close existing SSE stream before starting a new one
            if (sseControllerRef.current) {
                sseControllerRef.current.abort();
            }
            const ctrl = new AbortController();
            sseControllerRef.current = ctrl;

            fetchEventSource(`http://localhost:8080/api/chat/channels/${channel.id}/stream`, {
                method: 'GET',
                signal: ctrl.signal,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                onopen: async (response) => {
                    if (response.ok) {
                        setIsChatConnected(true);
                        return; // valid SSE stream open
                    } else {
                        setIsChatConnected(false);
                        throw new Error(`Connection failed: ${response.status}`);
                    }
                },
                onmessage(ev) {
                    try {
                        const parsedData: any = JSON.parse(ev.data);
                        if (parsedData.type === 'INIT' || !parsedData.senderName) return;
                        setMessages((prev) => [...prev, parsedData as ChatMessage]);
                    } catch (e) {
                        console.error('Failed to parse incoming SSE message', e);
                    }
                },
                onclose() {
                    setIsChatConnected(false);
                },
                onerror(err) {
                    console.error('SSE Stream Error: ', err);
                    setIsChatConnected(false);
                }
            });
        } catch (err) {
            console.error('Failed to initialize dedicated report chat stream', err);
            setIsChatConnected(false);
        }
    };

    const handleSendChatMessage = async () => {
        if (!newMessage.trim() || !chatChannel || !user?.email) return;

        const payload = {
            content: newMessage,
        };

        // Instantly clear the text box for perceived responsiveness
        setNewMessage('');

        try {
            await apiClient.request('POST', `/api/chat/channels/${chatChannel.id}/messages`, payload);
            // We do NOT manually push into messages array: SSE will broadcast it down to us natively.
        } catch (error) {
            console.error('Failed to dispatch message over REST:', error);
            alert('Failed to send message.');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !report) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const fileName = await apiClient.uploadMedia(file);

            const existingFilenames = (report.mediaFiles || []).map(url => {
                try {
                    return new URL(url).pathname.split('/').pop() || '';
                } catch {
                    // Fallback if not a valid URL
                    return url.split('?')[0].split('/').pop() || url;
                }
            }).filter(Boolean);

            await apiClient.updateReport(report.id, {
                ...editForm,
                latitude: report.latitude,
                longitude: report.longitude,
                locationName: report.locationName,
                reportType: report.reportType,
                priority: report.priority,
                mediaFiles: [...existingFilenames, fileName]
            } as any);
            alert('Asset linked successfully: ' + fileName);
            loadReport();
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

    // Early return removed to preserve Chat Sidebar

    return (
        <Layout>
            <div className="max-w-[100rem] mx-auto space-y-6 animate-fade-in pb-12 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
                    <button onClick={() => navigate(-1)} className="group flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold text-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-4 py-2 rounded-xl ring-1 ring-slate-200/60 dark:ring-slate-800/60 shadow-sm">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Briefings</span>
                    </button>
                    {!isEditing && (
                        <div className="flex flex-wrap items-center gap-2">
                            {hasRole(UserRole.ADMIN) && report && (
                                <button onClick={handlePrint} className="flex items-center px-3 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md hover:from-slate-800 hover:to-slate-700 group">
                                    <Download className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-y-0.5 transition-transform" /> Export PDF
                                </button>
                            )}
                            {hasRole(UserRole.ADMIN) && report?.status !== 'PUBLISHED' && (
                                <button onClick={handlePublish} className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 font-bold text-sm rounded-xl shadow-sm ring-1 ring-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/25">
                                    <Globe className="w-4 h-4 mr-2" /> Publish Report
                                </button>
                            )}
                            {(hasRole(UserRole.ADMIN) || hasRole(UserRole.EDITOR)) && (
                                <button onClick={handleAiCheck} disabled={aiLoading} className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 font-bold text-sm rounded-xl shadow-sm ring-1 ring-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {aiLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    ) : (
                                        <Brain className="w-4 h-4 mr-2" />
                                    )}
                                    {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
                                </button>
                            )}
                            {((hasRole(UserRole.EDITOR) && (report?.status === 'SUBMITTED' || report?.status === 'VERIFIED')) ||
                                (hasRole(UserRole.JOURNALIST) && isAuthor && (report?.status === 'DRAFT' || report?.status === 'REVISION_REQUESTED'))) && (
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

                {report?.flagged && (
                    <div className="p-6 bg-rose-500/10 dark:bg-rose-500/20 border-2 border-rose-500/50 rounded-3xl flex items-center justify-between shadow-lg shadow-rose-500/10 animate-pulse transition-all">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/40">
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">Misinformation Alert</h3>
                                <p className="text-sm font-bold text-rose-800/80 dark:text-rose-300/80">This intelligence briefing has been officially flagged by the moderation team. Proceed with extreme caution.</p>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <span className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md">Secluded Content</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start space-x-3 shadow-sm transition-colors">
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>
                    </div>
                )}

                <div className="hidden">
                    {report && <IncidentBriefingPDF ref={printRef} data={report} />}
                </div>

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

                                {/* AI Editor Integration Panel */}
                                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-800/40 rounded-2xl mt-6 shadow-sm">
                                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-3">
                                        <Wand2 className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                        AI Magic Edit
                                    </h3>
                                    <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mb-5 font-medium leading-relaxed">
                                        Use AI to intelligently rewrite the drafted payload. It will automatically consult the team's discussion thread and apply your specific instructions.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 mb-5">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold text-indigo-800/70 dark:text-indigo-300/70 uppercase tracking-widest mb-2">Desired Tone</label>
                                            <select
                                                value={aiEditorTone}
                                                onChange={e => setAiEditorTone(e.target.value)}
                                                className="w-full bg-white dark:bg-slate-900/50 border border-indigo-200 dark:border-indigo-700/50 text-sm font-medium rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all">
                                                <option value="Professional">Professional</option>
                                                <option value="Journalistic">Journalistic</option>
                                                <option value="Urgent">Urgent / Crisis</option>
                                                <option value="Concise">Concise / Bullet points</option>
                                            </select>
                                        </div>
                                        <div className="flex-[2]">
                                            <label className="block text-[10px] font-bold text-indigo-800/70 dark:text-indigo-300/70 uppercase tracking-widest mb-2">Custom Directives (Optional)</label>
                                            <input
                                                type="text"
                                                value={aiEditorRules}
                                                onChange={e => setAiEditorRules(e.target.value)}
                                                placeholder="e.g. 'Remove all mentions of specific names', 'Limit to 3 paragraphs'"
                                                className="w-full bg-white dark:bg-slate-900/50 border border-indigo-200 dark:border-indigo-700/50 text-sm font-medium rounded-xl px-4 py-2.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAiEdit}
                                        disabled={aiEditorLoading}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                        {aiEditorLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        ) : (
                                            <Wand2 className="w-4 h-4 mr-2" />
                                        )}
                                        {aiEditorLoading ? 'Synthesizing...' : 'Generate Edits'}
                                    </button>
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
                        <div className="flex flex-col xl:flex-row xl:items-start relative">
                            {/* Main Content Area (Left Column) */}
                            <div className="flex-1 p-6 sm:p-8 lg:p-12 w-full min-w-0">
                                {report ? (
                                    <>
                                        <div className="mb-8">
                                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                                <span className={getStatusBadge(report.status)}>
                                                    {report.status.replace('_', ' ')}
                                                </span>
                                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-3 py-1 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm">
                                                    ID: {report.id}
                                                </span>
                                            </div>
                                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight transition-colors">
                                                {report.title}
                                            </h1>

                                            {/* Sleek Metadata Presentation */}
                                            <div className="flex flex-wrap items-center gap-4 pt-4 mt-2 border-t border-slate-100/50 dark:border-slate-800/50 transition-colors">
                                                <div className="group flex items-center px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-sm hover:shadow-md hover:ring-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]">
                                                    <FileText className="w-4 h-4 mr-2.5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                                                    <div>
                                                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-0.5 transition-colors">Author</p>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{report.authorName}</p>
                                                    </div>
                                                </div>
                                                <div className="group flex items-center px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-sm hover:shadow-md hover:ring-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]">
                                                    <MapPin className="w-4 h-4 mr-2.5 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                                                    <div>
                                                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-0.5 transition-colors">{report.locationName ? 'Detected Locale' : 'Location'}</p>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{report.locationName || 'Location Unknown'}</p>
                                                    </div>
                                                </div>
                                                <div className="group flex items-center px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-sm hover:shadow-md hover:ring-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]">
                                                    <Calendar className="w-4 h-4 mr-2.5 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                                                    <div>
                                                        <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-0.5 transition-colors">Timestamp</p>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                {/* Priority chip */}
                                                {report.priority && (
                                                    <div className={`group flex items-center px-4 py-2.5 backdrop-blur-md rounded-2xl ring-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${report.priority === 'URGENT' ? 'bg-rose-50/80 dark:bg-rose-900/20 ring-rose-500/20 dark:ring-rose-800/40 hover:ring-rose-500/40' :
                                                        report.priority === 'HIGH' ? 'bg-amber-50/80 dark:bg-amber-900/20 ring-amber-500/20 dark:ring-amber-800/40 hover:ring-amber-500/40' :
                                                            report.priority === 'LOW' ? 'bg-slate-50 dark:bg-slate-800/50 ring-slate-200/50 dark:ring-slate-700/50' :
                                                                'bg-indigo-50/50 dark:bg-indigo-900/20 ring-indigo-500/20 dark:ring-indigo-800/40 hover:ring-indigo-500/40'
                                                        }`}>
                                                        <span className={`w-2.5 h-2.5 rounded-full mr-2.5 shrink-0 transition-transform group-hover:scale-125 ${report.priority === 'URGENT' ? 'bg-rose-500' :
                                                            report.priority === 'HIGH' ? 'bg-amber-500' :
                                                                report.priority === 'LOW' ? 'bg-slate-400' : 'bg-indigo-400'
                                                            }`} />
                                                        <div>
                                                            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-0.5">Priority</p>
                                                            <p className={`text-sm font-bold ${report.priority === 'URGENT' ? 'text-rose-700 dark:text-rose-400' :
                                                                report.priority === 'HIGH' ? 'text-amber-700 dark:text-amber-400' :
                                                                    report.priority === 'LOW' ? 'text-slate-600 dark:text-slate-400' : 'text-indigo-700 dark:text-indigo-400'
                                                                }`}>{report.priority}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Report Type chip */}
                                                {report.reportType && (
                                                    <div className="group flex items-center px-4 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]">
                                                        <FileText className="w-4 h-4 mr-2.5 text-violet-500 dark:text-violet-400 group-hover:scale-110 transition-transform" />
                                                        <div>
                                                            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-0.5">Type</p>
                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{report.reportType.replace('_', ' ')}</p>
                                                        </div>
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

                                            {report.mediaFiles && report.mediaFiles.length > 0 && (
                                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 transition-colors">Attached Intelligence Assets</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {report.mediaFiles.map((filename, idx) => (
                                                            <div key={idx} className="group relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 transition-all hover:ring-indigo-500/50 hover:shadow-lg">
                                                                <img
                                                                    src={filename}
                                                                    alt={`Asset ${idx + 1}`}
                                                                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                    <span className="text-xs font-bold text-white uppercase tracking-wider truncate mr-2">Asset {idx + 1}</span>
                                                                    <a href={filename} target="_blank" rel="noreferrer" className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-white/40 hover:scale-110 active:scale-95 transition-all shrink-0">
                                                                        <Eye className="w-4 h-4" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {aiError && (
                                                <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start space-x-3 shadow-sm transition-colors animate-fade-in group">
                                                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                                    <p className="text-sm font-medium text-rose-800 dark:text-rose-300 transition-colors">{aiError}</p>
                                                </div>
                                            )}

                                            {aiResult && (
                                                <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg relative overflow-hidden animate-fade-in transition-all duration-300 hover:shadow-xl group hover:-translate-y-1">
                                                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 opacity-20 transition-colors ${aiResult.confidenceScore > 0.65 ? 'bg-rose-500' : 'bg-emerald-500'
                                                        }`}></div>
                                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                                        <div className="relative w-24 h-24 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                                <circle cx="50" cy="50" r="42" className="stroke-slate-100 dark:stroke-slate-700 fill-none transition-colors" strokeWidth="8" />
                                                                <circle
                                                                    cx="50" cy="50" r="42"
                                                                    className={`fill-none transition-all duration-1000 ease-out ${aiResult.confidenceScore > 0.65 ? 'stroke-rose-500' : 'stroke-emerald-500'
                                                                        }`}
                                                                    strokeWidth="8"
                                                                    strokeDasharray={`${2 * Math.PI * 42}`}
                                                                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - aiResult.confidenceScore)}`}
                                                                />
                                                            </svg>
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                                <span className={`text-xl font-black transition-colors ${aiResult.confidenceScore > 0.65 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                                                                    }`}>{Math.round(aiResult.confidenceScore * 100)}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 text-center sm:text-left">
                                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-center sm:justify-start gap-2 transition-colors">
                                                                <Brain className="w-5 h-5 text-indigo-500" /> Layer 1: Gemini AI Logical Analysis
                                                            </h3>
                                                            <div className="relative text-left">
                                                                <div className="absolute -left-3 sm:-left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full hidden sm:block"></div>
                                                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed sm:pl-2 font-medium italic transition-colors">
                                                                    "{aiResult.reason}"
                                                                </p>
                                                            </div>

                                                            {aiResult.factCheckHits && aiResult.factCheckHits.length > 0 ? (
                                                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                                                            <Globe className="w-4 h-4" /> Layer 2: Authoritative Fact Verification
                                                                        </h4>
                                                                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-lg font-bold">
                                                                            {aiResult.factCheckHits.length} Source{aiResult.factCheckHits.length > 1 ? 's' : ''} Found
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid gap-3">
                                                                        {aiResult.factCheckHits.map((hit, idx) => (
                                                                            <div key={idx} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 transition-all hover:border-emerald-500/30 group/hit shadow-sm">
                                                                                <div className="flex justify-between items-start gap-4 mb-2">
                                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${hit.rating.toLowerCase().includes('false') || hit.rating.toLowerCase().includes('faux') || hit.rating.toLowerCase().includes('misleading') ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                                                        {hit.rating}
                                                                                    </span>
                                                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{hit.publisher}</span>
                                                                                </div>
                                                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2 leading-relaxed italic">"{hit.claim}"</p>
                                                                                {hit.sourceUrl && (
                                                                                    <a href={hit.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group-hover/hit:translate-x-1 duration-300">
                                                                                        Read Source Investigation <Eye className="w-3 h-3 ml-1" />
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                                                                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                                                        <Globe className="w-4 h-4 opacity-50" />
                                                                        <p className="text-xs font-medium italic">No direct matches found in authoritative fact-checking databases for this specific query.</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>
                                            )}

                                            {(report.reportType || report.priority) && (
                                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 transition-colors">Editorial Classification</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {report.priority && (
                                                            <span className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm uppercase tracking-wide transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default flex items-center gap-1.5 ${report.priority === 'URGENT' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' :
                                                                report.priority === 'HIGH' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                                                                    report.priority === 'LOW' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' :
                                                                        'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                                                }`}>
                                                                <span className={`w-2 h-2 rounded-full ${report.priority === 'URGENT' ? 'bg-rose-500' :
                                                                    report.priority === 'HIGH' ? 'bg-amber-500' :
                                                                        report.priority === 'LOW' ? 'bg-slate-400' : 'bg-indigo-400'
                                                                    }`} />
                                                                {report.priority} Priority
                                                            </span>
                                                        )}
                                                        {report.reportType && (
                                                            <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold shadow-sm uppercase tracking-wide transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default hover:text-violet-600 dark:hover:text-violet-400">
                                                                {report.reportType.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Utility Panels Integration */}
                                        <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 transition-colors">
                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2 transition-colors">
                                                <Activity className="w-5 h-5 text-indigo-500" /> Operations & Utilities
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {canUploadImage && (
                                                    <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm hover:shadow-md ring-1 ring-slate-200/60 dark:ring-slate-700/60 hover:ring-indigo-500/30 rounded-3xl p-6 transition-all duration-300">
                                                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4 flex items-center transition-colors">
                                                            <Upload className="w-4 h-4 mr-2" /> Asset Attachment
                                                        </h3>
                                                        <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-2xl appearance-none cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none group">
                                                            <div className="flex flex-col items-center space-y-2">
                                                                {uploading ? (
                                                                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                                                                )}
                                                                <span className="font-medium text-xs text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                                    {uploading ? 'Transmitting...' : 'Drop files to attach'}
                                                                </span>
                                                            </div>
                                                            <input type="file" name="file_upload" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                                        </label>
                                                    </div>
                                                )}

                                                {hasRole(UserRole.ADMIN) && (
                                                    <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm hover:shadow-md ring-1 ring-slate-200/60 dark:ring-slate-700/60 hover:ring-amber-500/30 rounded-3xl p-6 transition-all duration-300 flex flex-col">
                                                        <button onClick={() => setShowAudit(!showAudit)} className="flex items-center justify-between w-full text-left group">
                                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center transition-colors">
                                                                <History className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                                                                Audit History
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-xl group-hover:bg-amber-50 dark:group-hover:bg-amber-900/50 group-hover:text-amber-600 dark:group-hover:text-amber-300 shadow-sm transition-all">{showAudit ? 'Hide' : 'Reveal'}</span>
                                                        </button>

                                                        {showAudit && (
                                                            <div className="space-y-4 mt-6 animate-fade-in relative z-10 before:absolute before:inset-0 before:ml-[11px] before:-z-10 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                                                {actions.map((act) => (
                                                                    <div key={act.id} className="relative pl-8 group/item hover:-translate-y-0.5 transition-transform">
                                                                        <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white dark:ring-slate-800 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover/item:text-amber-500 transition-colors">
                                                                            <Eye className="w-3.5 h-3.5" />
                                                                        </div>
                                                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group-hover/item:shadow-md group-hover/item:border-amber-200 dark:group-hover/item:border-amber-900/50 transition-all">
                                                                            <div className="flex justify-between items-center mb-1.5">
                                                                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{act.action}</span>
                                                                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{new Date(act.createdAt).toLocaleDateString()}</span>
                                                                            </div>
                                                                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-2 transition-colors">By {act.actorName}</p>
                                                                            {act.comment && <p className="text-[11px] text-slate-500 dark:text-slate-500 italic bg-amber-50/50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 leading-relaxed font-medium">"{act.comment}"</p>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {actions.length === 0 && (
                                                                    <div className="pl-6 text-sm font-medium text-slate-500 dark:text-slate-400 italic">No audit actions found.</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm hover:shadow-md ring-1 ring-slate-200/60 dark:ring-slate-700/60 hover:ring-indigo-500/30 rounded-3xl p-6 transition-all duration-300 flex flex-col">
                                                    <button onClick={loadVersions} className="flex items-center justify-between w-full text-left group">
                                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center transition-colors">
                                                            <History className="w-4 h-4 mr-2 group-hover:-rotate-45 transition-transform" />
                                                            Version Control
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 shadow-sm transition-all">{showHistory ? 'Hide' : 'Reveal'}</span>
                                                    </button>

                                                    {showHistory && (
                                                        <div className="space-y-4 mt-6 animate-fade-in relative z-10 before:absolute before:inset-0 before:ml-[11px] before:-z-10 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                                            {versions.map((v, i) => (
                                                                <Link
                                                                    key={v.id}
                                                                    to={`/reports/${id}/versions/${v.id}`}
                                                                    className="relative pl-8 group/item hover:-translate-y-0.5 transition-transform block"
                                                                >
                                                                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white dark:ring-slate-800 transition-colors ${i === 0 ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 group-hover/item:text-indigo-500 group-hover/item:bg-indigo-100 dark:group-hover/item:bg-indigo-900/50'}`}>
                                                                        {i === 0 ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                                                    </div>
                                                                    <div className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border transition-all shadow-sm group-hover/item:shadow-md group-hover/item:border-indigo-300 dark:group-hover/item:border-indigo-700/60 cursor-pointer ${i === 0 ? 'border-indigo-200 dark:border-indigo-500/50 ring-1 ring-indigo-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                                                        <div className="flex justify-between items-center mb-1.5">
                                                                            <span className={`text-xs font-bold ${i === 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>v{v.versionNumber}</span>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{new Date(v.createdAt).toLocaleDateString()}</span>
                                                                                <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider opacity-0 group-hover/item:opacity-100 transition-opacity bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-lg">View →</span>
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed transition-colors">{v.changeReason}</p>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                            {versions.length === 0 && (
                                                                <div className="pl-6 text-sm font-medium text-slate-500 dark:text-slate-400 italic">No historical revisions found.</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-20 text-center animate-fade-in flex flex-col items-center justify-center h-full min-h-[500px]">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-1 ring-slate-200 dark:ring-slate-700 shadow-inner shadow-slate-200/50 dark:shadow-slate-900/50 transition-all hover:scale-105">
                                            <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 transition-colors">Classified or Restricted Data</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors max-w-md mx-auto leading-relaxed">
                                            The requested intelligence brief could not be located, or your clearance level prohibits access to its payload.
                                        </p>
                                    </div>
                                )}
                            </div>
                            {/* Chat Sidebar (Floating Design) */}
                            {report && (
                                <div className="w-full xl:w-[420px] p-4 sm:p-6 xl:pl-0 shrink-0 z-20 xl:sticky xl:top-6 transition-all duration-500">
                                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col h-[600px] xl:h-[calc(100vh-140px)] rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/50 dark:ring-slate-800/50 transition-all">

                                        {/* Header */}
                                        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-200/50 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 relative overflow-hidden transition-colors">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl -z-10 rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
                                            <div className="flex items-center gap-3.5 z-10">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center ring-1 ring-indigo-100 dark:ring-indigo-800 shadow-inner group transition-all">
                                                    <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                                                </div>
                                                <div>
                                                    <h2 className="font-black text-slate-900 dark:text-white tracking-tight transition-colors">Team Comms</h2>
                                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{chatChannel ? chatChannel.name : 'Securing link...'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full ring-1 ring-slate-200/50 dark:ring-slate-700/50 backdrop-blur-sm z-10 shadow-sm transition-colors">
                                                <div className="relative flex h-2 w-2 mr-2">
                                                    {isChatConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isChatConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{isChatConnected ? 'Live' : 'Syncing'}</span>
                                            </div>
                                        </div>

                                        {/* Messages Area */}
                                        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/20">
                                            {messages.map((msg, idx) => {
                                                const isMe = msg.senderName === user?.email;
                                                return (
                                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`} style={{ animationFillMode: 'both' }}>
                                                        <div className={`max-w-[85%] rounded-[1.25rem] px-5 py-3.5 shadow-sm transform transition-transform hover:scale-[1.02] ${isMe ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-sm shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50'}`}>
                                                            <div className={`text-[10px] font-bold mb-1.5 flex justify-between gap-5 tracking-wide ${isMe ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                                                <span>{msg.senderName?.split('@')[0] || 'System'}</span>
                                                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {/* Input Area */}
                                        <div className="p-4 sm:p-5 bg-white/60 dark:bg-slate-900/60 border-t border-slate-200/50 dark:border-slate-800/80 backdrop-blur-xl transition-colors">
                                            <div className="flex gap-2.5 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:bg-white dark:focus-within:bg-slate-900 shadow-inner focus-within:shadow-md transition-all duration-300 ease-out group">
                                                <input
                                                    type="text"
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                                                    placeholder="Transmit intelligence..."
                                                    disabled={!chatChannel}
                                                    className="flex-1 bg-transparent px-4 text-sm font-medium focus:outline-none text-slate-900 dark:text-white disabled:opacity-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                                                />
                                                <button
                                                    onClick={handleSendChatMessage}
                                                    disabled={!chatChannel || !newMessage.trim()}
                                                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center transform active:scale-90 hover:-translate-y-0.5 transition-all duration-300 ease-out group-focus-within:bg-indigo-500"
                                                >
                                                    <SendIcon className="w-4 h-4 transform group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}