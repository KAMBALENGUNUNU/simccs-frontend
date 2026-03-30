import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Activity,
  Download
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { CommandCenterPDF } from '../components/reports/pdf/CommandCenterPDF';
import { PersonnelPDF } from '../components/reports/pdf/PersonnelPDF';
import { RiskAuditPDF } from '../components/reports/pdf/RiskAuditPDF';
import { PersonnelStatsDTO, RiskAuditDTO, DashboardStats, UserRole } from '../types/api';

export function Analytics() {
  const { hasRole, user } = useAuth();
  const { t } = useSettings();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [personnelStats, setPersonnelStats] = useState<PersonnelStatsDTO | null>(null);
  const [riskAuditStats, setRiskAuditStats] = useState<RiskAuditDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [printStats, setPrintStats] = useState<DashboardStats | null>(null);
  const [printPeriodText, setPrintPeriodText] = useState<string>('');
  const [printSerialNumber, setPrintSerialNumber] = useState<string>('');
  const [personnelSerial, setPersonnelSerial] = useState<string>('');
  const [riskAuditSerial, setRiskAuditSerial] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [intervalType, setIntervalType] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const commandCenterRef = useRef<HTMLDivElement>(null);
  const personnelRef = useRef<HTMLDivElement>(null);
  const riskAuditRef = useRef<HTMLDivElement>(null);

  const handlePrintCommandCenter = useReactToPrint({
    contentRef: commandCenterRef,
    documentTitle: `Command_Center_Overview_${new Date().toISOString().split('T')[0]}`
  });

  const handleGeneratePrint = async () => {
    try {
      setIsGenerating(true);
      let start: string | undefined = undefined;
      let end: string | undefined = undefined;

      const now = new Date();
      if (intervalType === 'today') {
        const today = new Date(now.setHours(0, 0, 0, 0));
        start = today.toISOString();
        end = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      } else if (intervalType === 'weekly') {
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        start = lastWeek.toISOString();
        end = new Date().toISOString();
      } else if (intervalType === 'monthly') {
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        start = lastMonth.toISOString();
        end = new Date().toISOString();
      } else if (intervalType === 'custom') {
        start = customStart ? new Date(customStart).toISOString() : undefined;
        end = customEnd ? new Date(customEnd).toISOString() : undefined;
      }

      const res = await apiClient.getDashboardStats({ startDate: start, endDate: end });
      setPrintStats(res.data as unknown as DashboardStats);

      let periodText = 'All Time';
      if (intervalType === 'today') periodText = 'Today';
      else if (intervalType === 'weekly') periodText = 'Last 7 Days';
      else if (intervalType === 'monthly') periodText = 'Last 30 Days';
      else if (intervalType === 'custom') periodText = `Custom: ${customStart || 'Any'} to ${customEnd || 'Any'}`;

      setPrintPeriodText(periodText);
      setPrintSerialNumber(`DOC-${Date.now().toString().slice(-6)}`);

      setTimeout(() => {
        handlePrintCommandCenter();
        setIsGenerating(false);
        setIsModalOpen(false);
        setTimeout(() => setPrintStats(null), 1000); // clear after print window closes roughly
      }, 500);

    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  const handlePrintPersonnel = useReactToPrint({
    contentRef: personnelRef,
    documentTitle: `Personnel_Engagement_${new Date().toISOString().split('T')[0]}`
  });

  const handlePrintRiskAudit = useReactToPrint({
    contentRef: riskAuditRef,
    documentTitle: `Risk_Audit_${new Date().toISOString().split('T')[0]}`
  });

  const doPrintPersonnel = () => {
    setPersonnelSerial(`PER-${Date.now().toString().slice(-6)}`);
    setTimeout(() => handlePrintPersonnel(), 100);
  };

  const doPrintRiskAudit = () => {
    setRiskAuditSerial(`RSK-${Date.now().toString().slice(-6)}`);
    setTimeout(() => handlePrintRiskAudit(), 100);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [dashRes, personnelRes, riskAuditRes] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getPersonnelStats(),
        apiClient.getRiskAuditStats()
      ]);
      setStats(dashRes.data as unknown as DashboardStats);
      setPersonnelStats(personnelRes.data);
      setRiskAuditStats(riskAuditRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Layout>
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 shadow-sm max-w-6xl mx-auto mt-8">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-rose-800">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 p-8 rounded-3xl shadow-sm border border-slate-200/60 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="absolute right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
                <Activity className="w-8 h-8 text-indigo-600" />
                <span>{t('analytics.title')}</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium">{t('analytics.subtitle')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {hasRole(UserRole.ADMIN) && (
                <>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!stats}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md ring-1 ring-indigo-900/10 transition-all disabled:opacity-50 hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4" />
                    {t('analytics.export.commandCenter')}
                  </button>

                  <button
                    onClick={doPrintPersonnel}
                    disabled={!personnelStats}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-900 hover:to-slate-800 text-white font-bold text-xs rounded-xl shadow-md ring-1 ring-slate-900/10 transition-all disabled:opacity-50 hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4" />
                    {t('analytics.export.personnelAudit')}
                  </button>

                  <button
                    onClick={doPrintRiskAudit}
                    disabled={!riskAuditStats}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md ring-1 ring-rose-900/10 transition-all disabled:opacity-50 hover:-translate-y-0.5"
                  >
                    <Download className="w-4 h-4" />
                    {t('analytics.export.misinfoAudit')}
                  </button>
                </>
              )}

              <div className="hidden sm:flex px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow"></div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{t('analytics.export.live')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Printable Components */}
        <div className="hidden">
          {stats && (
            <CommandCenterPDF
              ref={commandCenterRef}
              data={printStats || stats}
              periodText={printStats ? printPeriodText : 'All Time'}
              generatedBy={user?.fullName || user?.username || 'System'}
              serialNumber={printStats ? printSerialNumber : `DOC-${Date.now().toString().slice(-6)}`}
            />
          )}
          {personnelStats && (
            <PersonnelPDF
              ref={personnelRef}
              data={personnelStats}
              periodText="All Time"
              generatedBy={user?.fullName || user?.username || 'System'}
              serialNumber={personnelSerial || `PER-${Date.now().toString().slice(-6)}`}
            />
          )}
          {riskAuditStats && (
            <RiskAuditPDF
              ref={riskAuditRef}
              data={riskAuditStats}
              periodText="All Time"
              generatedBy={user?.fullName || user?.username || 'System'}
              serialNumber={riskAuditSerial || `RSK-${Date.now().toString().slice(-6)}`}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/reports" className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden block cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('analytics.cards.totalReports')}</p>
                <p className="text-4xl font-black text-slate-900">{stats?.totalReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <FileText className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50/50 w-fit px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              <span>Excl. deleted</span>
            </div>
          </Link>

          <Link to="/reports?status=PENDING_DRAFT" className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden block cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('analytics.cards.awaitingReview')}</p>
                <p className="text-4xl font-black text-amber-600">{stats?.pendingReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-amber-600 bg-amber-50/50 w-fit px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              <span>Drafts & Submitted</span>
            </div>
          </Link>

          <Link to="/reports?status=APPROVED_PUBLISHED" className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden block cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('analytics.cards.approved')}</p>
                <p className="text-4xl font-black text-emerald-600">{stats?.approvedReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50/50 w-fit px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              <span>Verified and live</span>
            </div>
          </Link>

          <Link to="/reports?status=REJECTED" className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden block cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('analytics.cards.rejected')}</p>
                <p className="text-4xl font-black text-rose-600">{stats?.rejectedReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <XCircle className="w-7 h-7 text-rose-600" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-rose-600 bg-rose-50/50 w-fit px-3 py-1.5 rounded-lg">
              <XCircle className="w-4 h-4 mr-1.5" />
              <span>Inactive/Rejected</span>
            </div>
          </Link>

          <Link to="/flagged" className="bg-amber-50/50 backdrop-blur-xl rounded-3xl p-6 border border-amber-200 shadow-sm hover:shadow-md hover:ring-2 hover:ring-amber-500/50 transition-all duration-300 group relative overflow-hidden block cursor-pointer">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-100/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 italic flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{t('analytics.cards.misinfoRisks')}</span>
                </p>
                <p className="text-4xl font-black text-amber-900">{stats?.flaggedReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner border border-amber-200">
                <AlertTriangle className="w-7 h-7 text-amber-700" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-amber-700 bg-amber-100/50 w-fit px-3 py-1.5 rounded-lg border border-amber-200/50">
              <Activity className="w-4 h-4 mr-1.5" />
              <span>Requires validation</span>
            </div>
          </Link>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('analytics.cards.criticalPriority')}</p>
                <p className="text-4xl font-black text-rose-700">{stats?.urgentReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <AlertCircle className="w-7 h-7 text-rose-700" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-rose-700 bg-rose-50/50 w-fit px-3 py-1.5 rounded-lg">
              <Activity className="w-4 h-4 mr-1.5" />
              <span>Urgent reports</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-slate-200/60 bg-white/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg"><BarChart3 className="w-5 h-5 text-indigo-600" /></div>
                <span>Reports by Type</span>
              </h2>
            </div>
            <div className="p-8 flex-grow">
              <div className="space-y-6">
                {stats?.reportsByCategory && Object.keys(stats.reportsByCategory).length > 0 ? (
                  Object.entries(stats.reportsByCategory).map(([category, count]) => {
                    const total = stats.totalReports || 1;
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

                    return (
                      <Link to={`/reports?type=${category}`} key={category} className="group block cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-slate-700 bg-slate-100/50 px-3 py-1 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">
                            {category.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {count} <span className="text-slate-400 font-semibold ml-1">({percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100/80 rounded-full h-3.5 shadow-inner overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <BarChart3 className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium">No category data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-200/60 bg-white/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg"><Clock className="w-5 h-5 text-indigo-600" /></div>
                <span>Recent Activity</span>
              </h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                    <h3 className="font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                      {activity.title}
                    </h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs px-3 py-1 rounded-lg font-bold uppercase tracking-wide
                        ${activity.status === 'VERIFIED' || activity.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20' :
                          activity.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20' :
                            activity.status === 'SUBMITTED' || activity.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20' :
                              'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20'}`}>
                        {activity.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(activity.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No recent activity detected</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-indigo-900/90 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-indigo-400/20 shadow-2xl relative overflow-hidden text-white mt-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -z-10"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-indigo-400" />
                <span>System Health & Insights</span>
              </h2>
              <p className="text-indigo-100/70 font-medium leading-relaxed">
                The counts displayed represent active reports currently in the pipeline. Flagged reports indicate potential misinformation requiring manual verification.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                to="/reports"
                className="px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-950/20 hover:-translate-y-1"
              >
                View Full Logs
              </Link>
              <Link
                to="/settings"
                className="px-8 py-4 bg-indigo-800/50 text-white font-bold rounded-2xl border border-indigo-400/30 hover:bg-indigo-800 transition-all backdrop-blur-xl"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <Clock className="w-6 h-6 text-indigo-600" />
              <span>{t('analytics.modal.title')}</span>
            </h3>

            <div className="space-y-3 mb-6">
              {[
                { id: 'all', label: t('analytics.modal.allTime') },
                { id: 'today', label: t('analytics.modal.today') },
                { id: 'weekly', label: t('analytics.modal.weekly') },
                { id: 'monthly', label: t('analytics.modal.monthly') },
                { id: 'custom', label: t('analytics.modal.custom') }
              ].map(opt => (
                <label key={opt.id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${intervalType === opt.id ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  <input type="radio" className="mr-3 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    checked={intervalType === opt.id}
                    onChange={() => setIntervalType(opt.id)}
                  />
                  <span className="font-bold text-sm">{opt.label}</span>
                </label>
              ))}
            </div>

            {intervalType === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('analytics.modal.startDate')}</label>
                  <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full border-slate-300 rounded-lg text-sm bg-white form-input focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{t('analytics.modal.endDate')}</label>
                  <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full border-slate-300 rounded-lg text-sm bg-white form-input focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={isGenerating}
              >
                {t('analytics.modal.cancel')}
              </button>
              <button
                onClick={handleGeneratePrint}
                disabled={isGenerating || (intervalType === 'custom' && (!customStart || !customEnd))}
                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t('analytics.modal.generating')}
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {t('analytics.modal.download')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
