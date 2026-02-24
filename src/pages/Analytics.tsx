import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
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
} from 'lucide-react';

interface DashboardStats {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  flaggedReports: number;
  totalCasualties: number;
  reportsByStatus: Record<string, number>;
  recentActivity: Array<{
    id: number;
    title: string;
    status: string;
    createdAt: string;
  }>;
}

export function Analytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiClient.getDashboardStats();
      setStats(response.data as unknown as DashboardStats);
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
      <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 p-8 rounded-3xl shadow-sm border border-slate-200/60 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
          <div className="absolute right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
                <Activity className="w-8 h-8 text-indigo-600" />
                <span>Analytics Dashboard</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium">Crisis reporting metrics and real-time insights</p>
            </div>
            <div className="hidden sm:flex p-3 bg-white rounded-2xl shadow-sm border border-slate-100 items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow"></div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Live</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Reports</p>
                <p className="text-4xl font-black text-slate-900">{stats?.totalReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <FileText className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-indigo-600 bg-indigo-50/50 w-fit px-3 py-1.5 rounded-lg">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              <span>All-time total</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Review</p>
                <p className="text-4xl font-black text-amber-600">{stats?.pendingReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-amber-600 bg-amber-50/50 w-fit px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              <span>Awaiting action</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Approved</p>
                <p className="text-4xl font-black text-emerald-600">{stats?.approvedReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <CheckCircle className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50/50 w-fit px-3 py-1.5 rounded-lg">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              <span>Verified reports</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rejected</p>
                <p className="text-4xl font-black text-rose-600">{stats?.rejectedReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <XCircle className="w-7 h-7 text-rose-600" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-rose-600 bg-rose-50/50 w-fit px-3 py-1.5 rounded-lg">
              <XCircle className="w-4 h-4 mr-1.5" />
              <span>Not approved</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Flagged</p>
                <p className="text-4xl font-black text-orange-600">{stats?.flaggedReports || 0}</p>
              </div>
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <AlertTriangle className="w-7 h-7 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-orange-600 bg-orange-50/50 w-fit px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              <span>Requires attention</span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Casualties</p>
                <p className="text-4xl font-black text-red-700">{stats?.totalCasualties || 0}</p>
              </div>
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center group-hover:-rotate-12 transition-transform shadow-inner">
                <AlertCircle className="w-7 h-7 text-red-700" />
              </div>
            </div>
            <div className="flex items-center text-xs font-semibold text-red-700 bg-red-50/50 w-fit px-3 py-1.5 rounded-lg">
              <Activity className="w-4 h-4 mr-1.5" />
              <span>Across all reports</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-200/60 bg-white/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-3">
                <div className="p-2 bg-indigo-50 rounded-lg"><BarChart3 className="w-5 h-5 text-indigo-600" /></div>
                <span>Reports by Status</span>
              </h2>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                {stats?.reportsByStatus &&
                  Object.entries(stats.reportsByStatus).map(([status, count]) => {
                    const total = stats.totalReports || 1;
                    const percentage = ((count / total) * 100).toFixed(1);

                    let colorClass = 'bg-slate-500';
                    let bgLightClass = 'bg-slate-100';
                    let textClass = 'text-slate-700';

                    if (status === 'APPROVED') { colorClass = 'bg-emerald-500'; bgLightClass = 'bg-emerald-50'; textClass = 'text-emerald-700'; }
                    if (status === 'PENDING') { colorClass = 'bg-amber-500'; bgLightClass = 'bg-amber-50'; textClass = 'text-amber-700'; }
                    if (status === 'REJECTED') { colorClass = 'bg-rose-500'; bgLightClass = 'bg-rose-50'; textClass = 'text-rose-700'; }
                    if (status === 'FLAGGED') { colorClass = 'bg-orange-500'; bgLightClass = 'bg-orange-50'; textClass = 'text-orange-700'; }

                    return (
                      <div key={status} className="group">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-lg ${bgLightClass} ${textClass}`}>
                            {status.replace('_', ' ')}
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {count} <span className="text-slate-400 font-semibold ml-1">({percentage}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100/80 rounded-full h-3.5 shadow-inner overflow-hidden">
                          <div
                            className={`${colorClass} h-full rounded-full transition-all duration-1000 ease-out group-hover:opacity-80`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
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
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
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
                            activity.status === 'SUBMITTED' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20' :
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
      </div>
    </Layout>
  );
}
