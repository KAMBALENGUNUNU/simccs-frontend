import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../services/api';
import { MapPin, AlertCircle, FileText, UploadCloud, CheckCircle } from 'lucide-react';

export function ReportForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    latitude: '',
    longitude: '',
    casualtyCount: '',
    categories: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    try {
      const file = e.target.files[0];
      const fileName = await apiClient.uploadMedia(file);
      setMediaFile(fileName);
    } catch {
      setError('Failed to upload image asset. Server rejected payload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const categories = formData.categories
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c);

      // We explicitly pass the mediaFiles as any since type might not strict allow it, but backend accepts it.
      await apiClient.submitReport({
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        casualtyCount: formData.casualtyCount ? parseInt(formData.casualtyCount) : undefined,
        categories: categories.length > 0 ? categories : undefined,
        mediaFiles: mediaFile ? [mediaFile] : undefined,
      } as any);

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto animate-fade-in py-4">
        <div className="mb-8 p-8 bg-indigo-600 rounded-3xl shadow-lg relative overflow-hidden text-white">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute left-10 -bottom-20 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2 flex items-center space-x-3">
              <UploadCloud className="w-8 h-8" />
              <span>Upload Field Intelligence</span>
            </h1>
            <p className="text-indigo-100 font-medium">Submit secure, detailed scenario briefings for command center review.</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-xl p-8 sm:p-10 relative">
          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-8">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-bold text-slate-700 tracking-wide uppercase">
                  Operation Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm"
                  placeholder="E.g., Sector 7 Perimeter Breach"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="summary" className="block text-sm font-bold text-slate-700 tracking-wide uppercase">
                  Executive Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm leading-relaxed"
                  placeholder="Brief overview of the incident for quick parsing..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-bold text-slate-700 tracking-wide uppercase">
                  Full Tactical Report <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm leading-relaxed resize-y"
                  placeholder="Provide granular details, timelines, involved entities, and required responses..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 tracking-wide uppercase">
                  Photographic Evidence / Asset Upload
                </label>
                <div className="flex flex-col gap-3">
                  <label className={`flex items-center justify-center w-full h-32 px-4 transition ${mediaFile ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-300'} border-2 border-dashed rounded-xl appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none group`}>
                    <div className="flex flex-col items-center space-y-2">
                      {uploading ? (
                        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      ) : mediaFile ? (
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      )}
                      <span className={`font-medium text-sm ${mediaFile ? 'text-emerald-700' : 'text-slate-500 group-hover:text-indigo-600'}`}>
                        {uploading ? 'Transmitting Asset...' : mediaFile ? 'Asset Secure (Click to replace)' : 'Click to select or drop image here'}
                      </span>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*" />
                  </label>
                  {mediaFile && (
                    <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 shadow-sm animate-fade-in">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span className="font-semibold truncate">Asset ID Code: {mediaFile}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
              <div className="space-y-2">
                <label htmlFor="latitude" className="block text-sm font-bold text-slate-700 tracking-wide uppercase">
                  Latitude <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    required
                    className="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-sans shadow-sm"
                    placeholder="e.g. 48.8584"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="longitude" className="block text-sm font-bold text-slate-700 tracking-wide uppercase">
                  Longitude <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    required
                    className="w-full pl-12 pr-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-mono font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-sans shadow-sm"
                    placeholder="e.g. 2.2945"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label
                  htmlFor="casualtyCount"
                  className="block text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center justify-between"
                >
                  <span>Casualty Metrics</span>
                  <span className="text-xs text-slate-400 font-medium normal-case">Optional</span>
                </label>
                <input
                  id="casualtyCount"
                  type="number"
                  min="0"
                  value={formData.casualtyCount}
                  onChange={(e) => setFormData({ ...formData, casualtyCount: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm"
                  placeholder="Estimated number..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="categories" className="block text-sm font-bold text-slate-700 tracking-wide uppercase flex items-center justify-between">
                  <span>Tags & Categories</span>
                  <span className="text-xs text-slate-400 font-medium normal-case">Comma-separated</span>
                </label>
                <input
                  id="categories"
                  type="text"
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm"
                  placeholder="e.g. Kinetic, Cyber, Supply Chain"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-8 border-t border-slate-200/60 mt-8">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                <span>{loading ? 'Encrypting & Dispatching...' : 'Dispatch Report'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
