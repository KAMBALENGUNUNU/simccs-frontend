import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { ReportResponse } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await apiClient.searchReports({
        authorId: user?.id,
      });
      setReports(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'PUBLISHED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'SUBMITTED':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'DRAFT':
        return <AlertCircle className="w-5 h-5 text-indigo-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5';
    switch (status) {
      case 'VERIFIED':
      case 'PUBLISHED':
        return `${baseClasses} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20`;
      case 'REJECTED':
        return `${baseClasses} bg-rose-50 text-rose-700 ring-1 ring-rose-500/20`;
      case 'SUBMITTED':
        return `${baseClasses} bg-amber-50 text-amber-700 ring-1 ring-amber-500/20`;
      case 'DRAFT':
        return `${baseClasses} bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20`;
      default:
        return `${baseClasses} bg-slate-50 text-slate-700 ring-1 ring-slate-500/20`;
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'SUBMITTED').length,
    approved: reports.filter((r) => r.status === 'VERIFIED' || r.status === 'PUBLISHED').length,
    needsRevision: reports.filter((r) => r.status === 'DRAFT').length,
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

  return (
    <Layout>
      <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl relative overflow-hidden transition-colors">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute right-20 -bottom-20 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user?.email}</span></p>
          </div>
          <Link
            to="/reports/new"
            className="relative z-10 flex items-center space-x-2 px-6 py-3.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 group"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Report</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-800">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Reports</span>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.total}</div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Pending Review</span>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.pending}</div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Approved</span>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.approved}</div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800/60 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Needs Revision</span>
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              </div>
            </div>
            <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.needsRevision}</div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="p-8 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
          </div>

          {reports.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner transition-colors">
                <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No reports found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Your intelligence feeds are quiet. Start by documenting your first crisis report.</p>
              <Link
                to="/reports/new"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-900 dark:hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/25 group"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Report</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {reports.map((report) => (
                <Link
                  key={report.id}
                  to={`/reports/${report.id}`}
                  className="block p-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-indigo-500 transition-colors duration-300"></div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mt-1 transition-colors">
                        {getStatusIcon(report.status)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {report.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed max-w-2xl">{report.summary}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <span className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {new Date(report.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </span>
                          {report.casualtyCount !== undefined && report.casualtyCount > 0 && (
                            <span className="flex items-center space-x-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg ring-1 ring-rose-500/20 dark:ring-rose-500/30 transition-colors">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{report.casualtyCount} casualties</span>
                            </span>
                          )}
                          {report.categories && report.categories.length > 0 && (
                            <span className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg ring-1 ring-indigo-500/20 dark:ring-indigo-500/30 transition-colors">
                              <span>{report.categories.join(', ')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 justify-between sm:justify-start">
                      <span className={getStatusBadge(report.status)}>
                        <div className={`w-1.5 h-1.5 rounded-full ${report.status === 'VERIFIED' || report.status === 'PUBLISHED' ? 'bg-emerald-500' : report.status === 'REJECTED' ? 'bg-rose-500' : report.status === 'SUBMITTED' ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
                        {report.status.charAt(0) + report.status.slice(1).toLowerCase().replace('_', ' ')}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}