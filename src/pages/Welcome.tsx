import { Link } from 'react-router-dom';
import { Shield, Globe, Lock, Zap, ChevronRight, Activity, Moon, Sun, Monitor } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export function Welcome() {
  const { t, theme, setTheme, language, setLanguage } = useSettings();

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      {/* Animated Background Gradients & Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 mix-blend-overlay"></div>
      </div>

      <nav className="relative z-50 bg-white/60 dark:bg-[#0B0F19]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 sticky top-0 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 rounded-full transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                <Activity className="w-7 h-7 text-white relative z-10" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">{t('welcome.brand')}</span>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="flex items-center space-x-1 sm:space-x-2 border-r border-slate-200/50 dark:border-white/10 pr-4 sm:pr-6">
                <button
                  onClick={cycleTheme}
                  className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-200/80 dark:hover:bg-white/10"
                  title={t('settings.theme.title')}
                >
                  {theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-slate-200/80 dark:hover:bg-white/10 font-bold text-sm uppercase"
                  title={t('settings.language.title')}
                >
                  <Globe className="w-4 h-4" />
                  <span>{language}</span>
                </button>
              </div>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-[#0B0F19] rounded-full text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(15,23,42,0.15)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(15,23,42,0.3)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
              >
                {t('nav.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="text-center mb-28 animate-slide-up">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md">
            <Shield className="w-4 h-4" />
            <span>Enterprise-Grade Security Protocol</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight transition-colors duration-500">
            {t('welcome.title1')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-600 dark:from-indigo-400 dark:via-cyan-400 dark:to-blue-500 filter drop-shadow-[0_0_30px_rgba(99,102,241,0.2)] dark:drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              {t('welcome.title2')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            {t('welcome.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-2xl text-lg font-bold hover:from-indigo-500 hover:to-cyan-500 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] dark:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transform hover:-translate-y-1 flex items-center justify-center space-x-2 group"
            >
              <span>{t('welcome.deploy')}</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/80 dark:bg-white/5 backdrop-blur-lg text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl text-lg font-bold hover:bg-white dark:hover:bg-white/10 transition-all flex items-center justify-center shadow-lg dark:shadow-none group"
            >
              {t('welcome.access')}
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {/* Card 1 */}
          <div className="group bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/60 dark:border-white/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:bg-white dark:hover:bg-white/[0.07] transition-all duration-300 shadow-xl dark:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/10 dark:group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-200 dark:border-indigo-500/30">
              <Globe className="w-7 h-7 text-indigo-600 dark:text-indigo-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('welcome.card1.title')}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('welcome.card1.desc')}
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/60 dark:border-white/10 hover:border-cyan-500/30 dark:hover:border-cyan-500/30 hover:bg-white dark:hover:bg-white/[0.07] transition-all duration-300 shadow-xl dark:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/10 dark:group-hover:bg-cyan-500/20 transition-colors"></div>
            <div className="w-14 h-14 bg-cyan-100 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-cyan-200 dark:border-cyan-500/30">
              <Lock className="w-7 h-7 text-cyan-600 dark:text-cyan-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('welcome.card2.title')}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('welcome.card2.desc')}
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/60 dark:border-white/10 hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:bg-white dark:hover:bg-white/[0.07] transition-all duration-300 shadow-xl dark:shadow-2xl relative overflow-hidden lg:col-span-1 md:col-span-2 lg:col-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/10 dark:group-hover:bg-blue-500/20 transition-colors"></div>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-500/30">
              <Zap className="w-7 h-7 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('welcome.card3.title')}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {t('welcome.card3.desc')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
