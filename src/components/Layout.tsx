import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  Shield,
  BarChart3,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { UserRole } from '../types/api';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout, hasRole } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      roles: [UserRole.JOURNALIST],
    },
    {
      path: '/reports',
      label: t('nav.reports'),
      icon: FileText,
      roles: [UserRole.JOURNALIST, UserRole.EDITOR, UserRole.ADMIN],
    },
    {
      path: '/review-queue',
      label: t('nav.reviewQueue'),
      icon: AlertTriangle,
      roles: [UserRole.EDITOR, UserRole.ADMIN],
    },
    {
      path: '/analytics',
      label: t('nav.analytics'),
      icon: BarChart3,
      roles: [UserRole.EDITOR, UserRole.ADMIN],
    },
    {
      path: '/admin',
      label: t('nav.admin'),
      icon: Shield,
      roles: [UserRole.ADMIN],
    },
    {
      path: '/users',
      label: t('nav.users'),
      icon: Users,
      roles: [UserRole.ADMIN],
    },
  ];

  const visibleNavItems = navItems.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] transition-colors duration-300 selection:bg-indigo-500/20">
      <nav className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/5 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 rounded-full transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                  <Shield className="w-6 h-6 text-white relative z-10" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 group-hover:from-indigo-600 group-hover:to-cyan-600 dark:group-hover:from-indigo-400 dark:group-hover:to-cyan-400 transition-colors duration-300">SIMCCS</span>
              </Link>
            </div>

            <div className="flex items-center space-x-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 relative group overflow-hidden ${isActive(item.path)
                      ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-500/20 dark:ring-indigo-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    {isActive(item.path) && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"></span>
                    )}
                    <Icon className={`w-4 h-4 ${isActive(item.path) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 max-sm:mr-0'}`} />
                    <span className="hidden sm:block">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{user?.email}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-bold mt-0.5">
                  {user?.roles.map((role) => role.replace('ROLE_', '')).join(', ')}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
              <button
                onClick={() => navigate('/settings')}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all duration-300 group shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-indigo-200 dark:hover:ring-indigo-500/50 hover:shadow-md"
                title={t('nav.settings')}
              >
                <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 group shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-red-200 dark:hover:ring-red-500/50 hover:shadow-md"
                title={t('nav.logout')}
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">{children}</main>
    </div>
  );
}
