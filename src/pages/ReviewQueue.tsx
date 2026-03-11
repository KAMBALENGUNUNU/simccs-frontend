import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { ReportResponse, WorkflowAction } from '../types/api';
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  MapPin,
  ClipboardCheck,
  ChevronRight,
} from 'lucide-react';

export function ReviewQueue() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [action, setAction] = useState<WorkflowAction | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await apiClient.searchReports({ status: 'SUBMITTED' });
      setReports(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedReport || !action) return;

    setSubmitting(true);
    setError('');

    try {
      await apiClient.changeReportStatus(selectedReport.id, {
        action,
        comment: comment || undefined,
      });

      setReports(reports.filter((r) => r.id !== selectedReport.id));
      setSelectedReport(null);
      setAction(null);
      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const actionButtons = [
    {
      action: WorkflowAction.APPROVE,
      label: 'Verify Intel',
      icon: CheckCircle,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50/50 dark:bg-emerald-900/20',
      borderClass: 'border-emerald-200/50 dark:border-emerald-800/50',
      hoverClass: 'hover:bg-emerald-500 hover:text-white hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.5)] dark:hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.3)] hover:border-transparent',
      ringClass: 'group-hover:ring-emerald-500/30'
    },
    {
      action: WorkflowAction.REJECT,
      label: 'Reject',
      icon: XCircle,
      colorClass: 'text-rose-600 dark:text-rose-400',
      bgClass: 'bg-rose-50/50 dark:bg-rose-900/20',
      borderClass: 'border-rose-200/50 dark:border-rose-800/50',
      hoverClass: 'hover:bg-rose-500 hover:text-white hover:shadow-[0_8px_30px_-4px_rgba(244,63,94,0.5)] dark:hover:shadow-[0_8px_30px_-4px_rgba(244,63,94,0.3)] hover:border-transparent',
      ringClass: 'group-hover:ring-rose-500/30'
    },
    {
      action: WorkflowAction.REQUEST_REVISION,
      label: 'Clarify',
      icon: AlertCircle,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50/50 dark:bg-amber-900/20',
      borderClass: 'border-amber-200/50 dark:border-amber-800/50',
      hoverClass: 'hover:bg-amber-500 hover:text-white hover:shadow-[0_8px_30px_-4px_rgba(245,158,11,0.5)] dark:hover:shadow-[0_8px_30px_-4px_rgba(245,158,11,0.3)] hover:border-transparent',
      ringClass: 'group-hover:ring-amber-500/30'
    },
    {
      action: WorkflowAction.FLAG_MISINFORMATION,
      label: 'Disinfo',
      icon: AlertTriangle,
      colorClass: 'text-slate-700 dark:text-slate-300',
      bgClass: 'bg-slate-100/50 dark:bg-slate-800/50',
      borderClass: 'border-slate-300/50 dark:border-slate-700/50',
      hoverClass: 'hover:bg-slate-900 hover:text-white dark:hover:bg-black dark:hover:text-white hover:shadow-[0_8px_30px_-4px_rgba(15,23,42,0.5)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.5)] hover:border-transparent',
      ringClass: 'group-hover:ring-slate-900/30 dark:group-hover:ring-white/30'
    },
  ];

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

  return (
    <Layout>
      <div className="animate-fade-in max-w-7xl mx-auto space-y-8 flex flex-col pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl shrink-0 transition-colors">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-3 transition-colors">
              <ClipboardCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span>Verification Queue</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium transition-colors">Analyze and adjudicate pending field intelligence.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start space-x-3 shadow-sm shrink-0 transition-colors">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column: Queue List */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col w-full lg:w-1/3 shrink-0 lg:sticky lg:top-8 h-[600px] lg:h-[calc(100vh-6rem)] transition-colors">
            <div className="p-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 flex items-center justify-between transition-colors">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">
                Inbox
              </h2>
              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs px-2.5 py-1 rounded-lg font-bold transition-colors">
                {reports.length} pending
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors">
                  <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">Queue empty</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">All pending intelligence has been processed.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left p-4 mb-2 rounded-2xl transition-all duration-300 relative overflow-hidden group border ${selectedReport?.id === report.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-500/50 shadow-sm'
                      : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700/50'
                      }`}
                  >
                    {selectedReport?.id === report.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl"></div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-sm font-bold truncate pr-3 flex-1 ${selectedReport?.id === report.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors'}`}>
                        {report.title}
                      </h3>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedReport?.id === report.id ? 'text-indigo-500 translate-x-1' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'}`} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed transition-colors">{report.summary}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 transition-colors">
                        {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded text-[10px] transition-colors">
                        {report.authorName}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Preview & Action Panel */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm w-full lg:w-2/3 flex-1 transition-colors overflow-hidden flex flex-col">
            {selectedReport ? (
              <div className="flex flex-col w-full">
                {/* Header Details */}
                <div className="p-8 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 shrink-0 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight transition-colors">
                      {selectedReport.title}
                    </h2>
                    <span className="bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20 dark:ring-amber-500/40 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-widest shrink-0 transition-colors">
                      Pending Action
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 transition-colors">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1 transition-colors">Author</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate transition-colors">{selectedReport.authorName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1 transition-colors">Timestamp</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate transition-colors">
                        {new Date(selectedReport.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1 transition-colors">Location</p>
                      <div className="flex items-center space-x-1 text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span className="truncate">{selectedReport.latitude}, {selectedReport.longitude}</span>
                      </div>
                    </div>
                    {selectedReport.casualtyCount !== undefined && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1 transition-colors">Casualties</p>
                        <div className="flex items-center space-x-1 text-sm font-bold text-rose-600 dark:text-rose-400 transition-colors">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{selectedReport.casualtyCount} recorded</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 space-y-8 flex-1">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-3 ml-1 transition-colors">Executive Summary</h4>
                    <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-300 text-lg leading-relaxed font-medium transition-colors">
                      {selectedReport.summary}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 ml-1 transition-colors">Full Decrypted Payload</h4>
                    <div className="text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed transition-colors font-serif bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
                      {selectedReport.content}
                    </div>
                  </div>

                  {selectedReport.categories && selectedReport.categories.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 ml-1 transition-colors">Assigned Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.categories.map((category, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Area */}
                <div className="p-6 sm:p-8 border-t border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.2)] shrink-0 z-10 relative transition-colors">
                  {action ? (
                    <div className="space-y-4 animate-slide-up">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide transition-colors">
                          Finalizing action: <span className="text-indigo-600 dark:text-indigo-400">{actionButtons.find(b => b.action === action)?.label}</span>
                        </h4>
                        <button onClick={() => setAction(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white underline transition-colors">
                          Change Action
                        </button>
                      </div>

                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
                        placeholder={action === WorkflowAction.REQUEST_REVISION ? "Detail required revisions here (Required)..." : "Optional notes for the author..."}
                      />

                      <button
                        onClick={handleReview}
                        disabled={
                          submitting ||
                          (action === WorkflowAction.REQUEST_REVISION && !comment.trim())
                        }
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25 group"
                      >
                        {submitting ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                        <span>{submitting ? 'Executing Protocol...' : 'Confirm & Execute'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="animate-fade-in pb-2">
                      <h4 className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6 text-center transition-colors">
                        Adjudication Protocols
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {actionButtons.map((btn, index) => {
                          const Icon = btn.icon;
                          const delay = index * 50;
                          return (
                            <button
                              key={btn.action}
                              onClick={() => setAction(btn.action)}
                              style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
                              className={`relative overflow-hidden flex flex-col items-center justify-center space-y-4 p-5 rounded-[1.5rem] font-bold transition-all duration-500 ease-out border shadow-sm group animate-fade-in-up 
                                ${btn.bgClass} ${btn.borderClass} ${btn.colorClass} ${btn.hoverClass} hover:-translate-y-1`}
                            >
                              <div className="absolute inset-0 bg-white/20 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
                              <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm border ${btn.borderClass} group-hover:border-transparent group-hover:bg-white/20 dark:group-hover:bg-black/20 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-out ${btn.ringClass} group-hover:ring-4`}>
                                <Icon className="w-6 h-6 transition-transform duration-500 group-hover:scale-110" />
                              </div>
                              <span className="relative z-10 text-[11px] sm:text-xs uppercase tracking-widest text-center mt-2 group-hover:-translate-y-0.5 transition-transform duration-500">{btn.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30 dark:bg-slate-800/30 transition-colors">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 transform rotate-3 transition-colors">
                  <ClipboardCheck className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
                  Waiting for intelligence selection
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm transition-colors">
                  Select an item from the inbox to analyze the full report and exercise adjudication protocols.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}