import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Key, AlertCircle, CheckCircle, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiClient } from '../services/api';
import { Layout } from '../components/Layout';

export function MfaSetup() {
  const navigate = useNavigate();
  const [mfaData, setMfaData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadMfaSetup();
  }, []);

  const loadMfaSetup = async () => {
    try {
      const response = await apiClient.setupMfa();
      setMfaData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cryptographic seed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (mfaData?.secret) {
      navigator.clipboard.writeText(mfaData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifying(true);

    try {
      await apiClient.verifyMfa({ code: verificationCode });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failure. Sync invalid.');
    } finally {
      setVerifying(false);
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
      <div className="max-w-3xl mx-auto animate-fade-in py-8">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden relative">

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full mix-blend-multiply blur-3xl -z-10 opacity-60 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

          {/* Header */}
          <div className="p-8 sm:p-12 text-center border-b border-slate-200/60 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-3xl mb-6 shadow-inner ring-1 ring-indigo-200 transform rotate-3 relative">
              <div className="absolute inset-0 border-2 border-indigo-400 border-dashed rounded-3xl animate-[spin_10s_linear_infinite]"></div>
              <Shield className="w-10 h-10 text-indigo-600 relative z-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Biometric / Digital 2FA
            </h1>
            <p className="text-slate-500 font-medium max-w-lg mx-auto">
              Fortify your clearance level by syncing a multi-factor authentication device to this network node.
            </p>
          </div>

          {error && (
            <div className="m-8 mb-0 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}

          {mfaData && (
            <div className="p-8 sm:p-12 space-y-10 group/mfa relative z-10">

              <div className="flex flex-col md:flex-row gap-10 items-center justify-center">

                {/* QR Core */}
                <div className="flex-1 w-full max-w-sm flex flex-col items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-6 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 mr-2">1</span>
                    Optical Sync
                  </h3>
                  <div className="bg-white p-6 rounded-3xl shadow-lg ring-1 ring-slate-200 transform transition-transform hover:scale-105 duration-300 relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-3xl blur opacity-20"></div>
                    <div className="relative bg-white p-2 rounded-2xl">
                      <QRCodeSVG value={mfaData.qrCodeUrl} size={180} level="H" includeMargin={true} />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mt-6 text-center max-w-[200px]">
                    Scan via Google Auth or compatible client.
                  </p>
                </div>

                <div className="hidden md:block w-px h-64 bg-slate-200"></div>

                {/* Manual Hash */}
                <div className="flex-1 w-full max-w-sm flex flex-col justify-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mr-2">2</span>
                    Manual Injection
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl relative overflow-hidden">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Seed Hash</p>
                    <div className="flex items-center justify-between bg-white rounded-xl ring-1 ring-slate-200 p-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                      <code className="text-sm font-mono font-bold text-indigo-900 tracking-wider pl-3 truncate">
                        {mfaData.secret}
                      </code>
                      <button
                        onClick={handleCopySecret}
                        className={`ml-3 p-2.5 rounded-lg transition-all shadow-sm ${copied ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                        title="Copy Seed"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Zone */}
              <div className="pt-10 border-t border-slate-200/60 max-w-md mx-auto">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center justify-center">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mr-2">3</span>
                  Finalize Authentication
                </h3>
                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <div className="relative group/key">
                      <Key className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within/key:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                        required
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-center text-3xl tracking-[0.5em] font-mono font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
                        placeholder="••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || verificationCode.length !== 6}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-2 flex justify-center items-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        <span>Secure Gateway</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
