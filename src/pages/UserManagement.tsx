import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { User } from '../types/api';
import { Users, CheckCircle, XCircle, AlertCircle, Shield, Search } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      let response;
      if (filter === 'pending') {
        response = await apiClient.getAllUsers(false);
      } else if (filter === 'active') {
        response = await apiClient.getAllUsers(true);
      } else {
        response = await apiClient.getAllUsers();
      }
      setUsers(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: number) => {
    setActionLoading(userId);
    setError('');

    try {
      await apiClient.approveUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBan = async (userId: number) => {
    if (!confirm('Are you sure you want to ban this user?')) return;

    setActionLoading(userId);
    setError('');

    try {
      await apiClient.banUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'ROLE_ADMIN':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20';
      case 'ROLE_EDITOR':
        return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20';
      case 'ROLE_JOURNALIST':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20';
      default:
        return 'bg-slate-50 text-slate-700 ring-1 ring-slate-500/20';
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

          <div className="relative z-10 w-full flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-3 transition-colors">
                <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <span>User Management</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Control fleet access, roles, and permissions across teams.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start space-x-3 shadow-sm transition-colors">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-rose-800 dark:text-rose-300">{error}</p>
          </div>
        )}

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="p-6 sm:p-8 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 transition-colors">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center space-x-3 transition-colors">
                <span className="bg-indigo-600 text-white text-sm px-2.5 py-1 rounded-lg shadow-sm">{users.length}</span>
                <span>Active Personnel</span>
              </h2>
              <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 transition-colors">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'pending'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'active'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                  Active
                </button>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No users found</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Clear your filters or wait for new registrations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">
                    <th className="px-8 py-5">Personnel</th>
                    <th className="px-8 py-5">Assigned Roles</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Security Protocol</th>
                    <th className="px-8 py-5">Registered On</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 transition-colors">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/50 dark:to-cyan-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-500/30">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">{user.email}</div>
                            {user.fullName && (
                              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{user.fullName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-2">
                          {user.roles.map((role) => (
                            <span
                              key={role.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-sm ${getRoleBadgeColor(
                                role.name
                              )}`}
                            >
                              {role.name.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full shadow-sm ${user.isEnabled ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50'}`}></div>
                          <span
                            className={`text-sm font-bold ${user.isEnabled
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                              }`}
                          >
                            {user.isEnabled ? 'Deployed' : 'Pending Authorization'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-2">
                          {user.mfaEnabled ? (
                            <>
                              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg ring-1 ring-emerald-500/20 dark:ring-emerald-500/30 transition-colors">
                                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <span className="text-sm text-emerald-700 dark:text-emerald-400 font-bold transition-colors">MFA Active</span>
                            </>
                          ) : (
                            <>
                              <div className="p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg ring-1 ring-slate-500/20 dark:ring-slate-600/50 transition-colors">
                                <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                              </div>
                              <span className="text-sm text-slate-500 dark:text-slate-400 font-bold transition-colors">Vulnerable</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-semibold text-slate-500 dark:text-slate-400 transition-colors">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          {!user.isEnabled && (
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={actionLoading === user.id}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white rounded-xl transition-all font-bold text-sm shadow-sm ring-1 ring-emerald-500/20 dark:ring-emerald-500/30 hover:ring-0 disabled:opacity-50"
                              title="Authorize Deployment"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Authorize</span>
                            </button>
                          )}
                          {user.isEnabled && (
                            <button
                              onClick={() => handleBan(user.id)}
                              disabled={actionLoading === user.id}
                              className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white dark:hover:text-white rounded-xl transition-all font-bold text-sm shadow-sm ring-1 ring-rose-500/20 dark:ring-rose-500/30 hover:ring-0 disabled:opacity-50"
                              title="Revoke Access"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Revoke</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
