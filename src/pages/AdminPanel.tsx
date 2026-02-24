import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { SystemBackup, AuditLog } from '../types/api';
import {
  Database,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export function AdminPanel() {
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'backups' | 'audit'>('backups');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'backups') {
        const response = await apiClient.getBackupHistory();
        setBackups(response.data);
      } else {
        const response = await apiClient.getAuditLogs();
        setAuditLogs(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerBackup = async () => {
    setActionLoading(true);
    setError('');

    try {
      await apiClient.triggerBackup();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger backup');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (filename: string) => {
    if (
      !confirm(
        'CRITICAL ACTION: Are you sure you want to restore this backup? This will completely overwrite the current database state in production.'
      )
    )
      return;

    setActionLoading(true);
    setError('');

    try {
      await apiClient.restoreBackup(filename);
      alert('Database restored successfully to the selected snapshot.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore backup snapshot');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide shadow-sm flex items-center justify-center gap-2';
    switch (status) {
      case 'SUCCESS':
        return `${baseClasses} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20`;
      case 'FAILED':
        return `${baseClasses} bg-rose-50 text-rose-700 ring-1 ring-rose-500/20`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-amber-50 text-amber-700 ring-1 ring-amber-500/20`;
      default:
        return `${baseClasses} bg-slate-50 text-slate-700 ring-1 ring-slate-500/20`;
    }
  };

  return (
    <Layout>
      <div className="animate-fade-in max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 dark:bg-slate-900/60 p-8 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl relative overflow-hidden transition-colors">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-3 transition-colors">
                <ShieldAlert className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <span>Administration Matrix</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Critical system operations, snapshot restorations, and audit trails.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start space-x-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>
          </div>
        )}

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 p-4 sm:px-8 sm:py-6">
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 w-full sm:w-fit transition-colors">
              <button
                onClick={() => setActiveTab('backups')}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'backups'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <Database className="w-4 h-4" />
                <span>State Snapshots</span>
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'audit'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
              >
                <FileText className="w-4 h-4" />
                <span>Audit Matrix</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin animation-delay-2000"></div>
              </div>
            </div>
          ) : activeTab === 'backups' ? (
            <div className="animate-fade-in">
              <div className="p-6 sm:px-8 sm:py-6 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Database Snapshots</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Manual triggers will generate a complete database cold backup.</p>
                </div>
                <button
                  onClick={handleTriggerBackup}
                  disabled={actionLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25 group"
                >
                  <RefreshCw className={`w-5 h-5 ${actionLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  <span>{actionLoading ? 'Allocating Snapshot...' : 'Trigger State Backup'}</span>
                </button>
              </div>

              {backups.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner ring-1 ring-slate-200 dark:ring-slate-700 transition-colors">
                    <Database className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No infrastructure snapshots</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Initialize your first database backup to secure mission-critical data.</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">
                        <th className="px-8 py-5">Archive Volume</th>
                        <th className="px-8 py-5">Bandwidth Size</th>
                        <th className="px-8 py-5">Operation Status</th>
                        <th className="px-8 py-5">Timestamp</th>
                        <th className="px-8 py-5 text-right">Disaster Recovery Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {backups.map((backup) => (
                        <tr key={backup.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 transition-colors">
                                <Database className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors font-mono">{backup.filename}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors">
                              {(backup.fileSizeMb || 0).toFixed(2)} MB
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className={getStatusBadge(backup.status)}>
                              {getStatusIcon(backup.status)}
                              <span>{backup.status.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-500">
                            {new Date(backup.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-8 py-5 text-right">
                            {backup.status === 'SUCCESS' && (
                              <button
                                onClick={() => handleRestore(backup.filename)}
                                disabled={actionLoading}
                                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white text-indigo-600 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition-all font-bold text-sm shadow-sm disabled:opacity-50 group-hover:shadow hover:-translate-y-0.5"
                              >
                                <Download className="w-4 h-4" />
                                <span>Recover State</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              {auditLogs.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 shadow-inner ring-1 ring-slate-200 dark:ring-slate-700 transition-colors">
                    <FileText className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Audit ledger is empty</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Administrative and security events will propagate here in real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">
                        <th className="px-8 py-5">Event Timestamp</th>
                        <th className="px-8 py-5">Identity Protocol</th>
                        <th className="px-8 py-5">Triggered Vector</th>
                        <th className="px-8 py-5">Payload Decryption</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="px-8 py-5">
                            <span className="font-bold text-slate-900">{log.username}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold tracking-wider ring-1 ring-indigo-500/20 shadow-sm uppercase">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm font-medium text-slate-600 max-w-md truncate">
                            {log.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
