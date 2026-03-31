import { Link } from 'react-router-dom';
import { Shield, Globe, Lock, Zap, ChevronRight, Moon, Sun, Monitor } from 'lucide-react';
import logo from '../image/simccs_logo.png';
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
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl overflow-hidden group-hover:scale-105 transition-all duration-300">
                <img src={logo} alt="SIMCCS Logo" className="w-full h-full object-contain" />
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
        {/* Background Logo behind Hero */}
        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[800px] opacity-[0.1] dark:opacity-[0.18] pointer-events-none select-none blur-[1px]">
          <img src={logo} alt="" className="w-full h-full object-contain" />
        </div>

        <div className="text-center mb-48 animate-slide-up">

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 leading-[1.1] tracking-tight transition-colors duration-500">
            {t('welcome.title1')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-600 dark:from-indigo-400 dark:via-cyan-400 dark:to-blue-500 filter drop-shadow-[0_0_30px_rgba(99,102,241,0.2)] dark:drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              {t('welcome.title2')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            {t('welcome.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-5 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="w-full sm:w-auto px-10 py-4 relative group overflow-hidden rounded-full bg-slate-900 dark:bg-white text-white dark:text-[#0B0F19] text-lg font-bold hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(15,23,42,0.3)] dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.25)] transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
              <span className="relative z-10">{t('welcome.deploy')}</span>
              <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 text-slate-800 dark:text-white text-lg font-bold hover:bg-white dark:hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(99,102,241,0.15)] transition-all duration-300 flex items-center justify-center group"
            >
              <span>{t('welcome.access')}</span>
            </Link>

          </div>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">

        </div>

      </div>
    </div>
  );
}
