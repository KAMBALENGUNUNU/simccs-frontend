import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { ReportResponse } from '../types/api';
import {
  FileText,
  PlusCircle,
  AlertCircle,
  Search,
  Filter,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

export function Reports() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [filteredReports, setFilteredReports] = useState<ReportResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, statusFilter, reports]);

  const loadReports = async () => {
    try {
      const response = await apiClient.getAllReports();
      setReports(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.content.toLowerCase().includes(term) ||
          r.summary.toLowerCase().includes(term)
      );
    }

    setFilteredReports(filtered);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide shadow-sm flex items-center gap-1.5 whitespace-nowrap';
    switch (status) {
      case 'APPROVED':
        return `${baseClasses} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20`;
      case 'REJECTED':
        return `${baseClasses} bg-rose-50 text-rose-700 ring-1 ring-rose-500/20`;
      case 'PENDING':
        return `${baseClasses} bg-amber-50 text-amber-700 ring-1 ring-amber-500/20`;
      case 'REVISION_REQUESTED':
        return `${baseClasses} bg-orange-50 text-orange-700 ring-1 ring-orange-500/20`;
      case 'FLAGGED':
        return `${baseClasses} bg-rose-50 text-rose-700 ring-1 ring-rose-500/20`;
      default:
        return `${baseClasses} bg-slate-50 text-slate-700 ring-1 ring-slate-500/20`;
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

  return (
    <Layout>
      <div className="animate-fade-in max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl relative overflow-hidden transition-colors">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute right-20 -bottom-20 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-3 transition-colors">
                <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <span>Intelligence Network</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium transition-colors">Browse and search {filteredReports.length} verified and proposed crisis scenarios.</p>
            </div>
            <Link
              to="/reports/new"
              className="flex items-center space-x-2 px-6 py-3.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-all shadow-lg hover:shadow-slate-900/30 dark:hover:shadow-indigo-500/30 transform hover:-translate-y-0.5 group"
            >
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Draft New Intel</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start space-x-3 shadow-sm transition-colors">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>
          </div>
        )}

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm mb-6 p-4 transition-colors">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors z-10" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports by title, contents, or keywords..."
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 flex items-center relative"
              />
            </div>
            <div className="relative md:w-64 group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors z-10 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-200 appearance-none cursor-pointer relative"
              >
                <option value="all">All Scenarios</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Verified Intel</option>
                <option value="REJECTED">Dismissed</option>
                <option value="REVISION_REQUESTED">Needs Clarification</option>
                <option value="FLAGGED">Critical/Flagged</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden min-h-[400px] transition-colors">
          {filteredReports.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-slate-200 dark:ring-slate-700 shadow-inner transition-colors">
                <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">No intelligence found</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-sm mx-auto transition-colors">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try broadening your search parameters.'
                  : 'Start mapping the environment by drafting your first crisis report.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  to="/reports/new"
                  className="inline-flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-900 dark:hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/25 group"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Draft Report</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredReports.map((report) => (
                <Link
                  key={report.id}
                  to={`/reports/${report.id}`}
                  className="group flex flex-col bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 hover:border-indigo-500/30 dark:hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-700/30 rounded-bl-full -z-10 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors"></div>

                  <div className="flex items-start justify-between mb-4 gap-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-tight flex-1">
                      {report.title}
                    </h3>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed mb-6 flex-1 transition-colors">
                    {report.summary}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-y-2">
                      <span className={getStatusBadge(report.status)}>
                        {report.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">
                        {new Date(report.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors">
                      <span className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-700/50 px-2.5 py-1 rounded-lg">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{report.authorName}</span>
                      </span>
                      <span className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-lg">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Loc</span>
                      </span>
                      {report.casualtyCount !== undefined && report.casualtyCount > 0 && (
                        <span className="flex items-center space-x-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2.5 py-1 rounded-lg ml-auto ring-1 ring-rose-500/20 dark:ring-rose-500/30">
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{report.casualtyCount}</span>
                        </span>
                      )}
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
