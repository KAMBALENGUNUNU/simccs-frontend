import { Layout } from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Link } from 'react-router-dom';
import { Shield, Moon, Sun, Globe, Check, Smartphone, Monitor } from 'lucide-react';

export function Settings() {
    const { user } = useAuth();
    const { theme, setTheme, language, setLanguage, t } = useSettings();

    // MFA Status mock (In a real app, this would come from the user payload or an API check)
    const isMfaEnabled = false;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner ring-1 ring-indigo-200 dark:ring-indigo-800 transition-colors">
                        <Shield className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">{t('settings.title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">{t('settings.subtitle')}</p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Main Config Column */}
                    <div className="md:col-span-2 space-y-8">

                        {/* Security & MFA */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/60 transition-colors">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 flex items-center transition-colors">
                                <Shield className="w-4 h-4 mr-2" /> {t('settings.security')}
                            </h3>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 mb-4 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1 transition-colors">{t('settings.mfa.title')}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm transition-colors">{t('settings.mfa.description')}</p>
                                    </div>
                                    <div className="shrink-0">
                                        {isMfaEnabled ? (
                                            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200/50 dark:border-emerald-800/50 transition-colors">
                                                <Check className="w-4 h-4 mr-2" /> {t('settings.mfa.active')}
                                            </span>
                                        ) : (
                                            <Link to="/mfa-setup" className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold tracking-wide hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                                                {t('settings.mfa.enable')}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 transition-colors">
                                <span>{t('settings.mfa.session')}: <strong className="text-slate-700 dark:text-slate-300">{user?.email}</strong></span>
                                <span className="uppercase text-[10px] tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 font-bold transition-colors">{t('settings.mfa.encrypted')}</span>
                            </div>
                        </div>

                        {/* Appearance (Theme) */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/60 transition-colors">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 flex items-center transition-colors">
                                <Monitor className="w-4 h-4 mr-2" /> {t('settings.theme.title')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`p-5 rounded-2xl flex flex-col items-center gap-3 border-2 transition-all relative ${theme === 'light' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                    <div className={`p-3 rounded-full ${theme === 'light' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                        <Sun className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold ${theme === 'light' ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{t('settings.theme.light')}</span>
                                    {theme === 'light' && <div className="absolute top-4 right-4"><Check className="w-4 h-4 text-indigo-500" /></div>}
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`p-5 rounded-2xl flex flex-col items-center gap-3 border-2 transition-all relative ${theme === 'dark' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                    <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                        <Moon className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold ${theme === 'dark' ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{t('settings.theme.dark')}</span>
                                    {theme === 'dark' && <div className="absolute top-4 right-4"><Check className="w-4 h-4 text-indigo-500" /></div>}
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`p-5 rounded-2xl flex flex-col items-center gap-3 border-2 transition-all relative ${theme === 'system' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                    <div className={`p-3 rounded-full ${theme === 'system' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold text-center ${theme === 'system' ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{t('settings.theme.system')}</span>
                                    {theme === 'system' && <div className="absolute top-4 right-4"><Check className="w-4 h-4 text-indigo-500" /></div>}
                                </button>
                            </div>
                        </div>

                        {/* Language & Region */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200/60 dark:border-slate-800/60 transition-colors">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 flex items-center transition-colors">
                                <Globe className="w-4 h-4 mr-2" /> {t('settings.language.title')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${language === 'en' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                    <div>
                                        <span className={`block font-bold mb-1 ${language === 'en' ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{t('settings.language.en')}</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">{t('settings.language.enDesc')}</span>
                                    </div>
                                    {language === 'en' && <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>}
                                </button>
                                <button
                                    onClick={() => setLanguage('fr')}
                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${language === 'fr' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                    <div>
                                        <span className={`block font-bold mb-1 ${language === 'fr' ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{t('settings.language.fr')}</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">{t('settings.language.frDesc')}</span>
                                    </div>
                                    {language === 'fr' && <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Sidebar Informational */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-indigo-950 dark:to-slate-950 rounded-3xl p-8 shadow-lg text-white relative overflow-hidden transition-colors">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-screen blur-3xl opacity-30"></div>
                            <h4 className="text-xl font-bold mb-3 tracking-tight">{t('settings.info.title')}</h4>
                            <p className="text-indigo-200/90 text-sm leading-relaxed mb-6 font-medium">
                                {t('settings.info.desc')}
                            </p>
                            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/10 flex flex-col gap-2 scale-95 origin-top-left transition-colors">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-indigo-200 font-bold uppercase tracking-widest">{t('settings.info.status')}</span>
                                    <span className="flex items-center text-emerald-400 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span> {t('settings.info.encrypted')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
