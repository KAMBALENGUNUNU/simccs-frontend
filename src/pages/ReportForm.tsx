import { useState, useEffect } from 'react';
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
    locationName: '',
    casualtyCount: '',
    categories: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Reverse Geocoding
        let locName = '';
        try {
          const geocodeRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
          const geocodeData = await geocodeRes.json();
          locName = [geocodeData.city, geocodeData.principalSubdivision, geocodeData.countryName].filter(Boolean).join(', ');
        } catch (e) {
          console.error("Reverse geocoding failed", e);
        }

        setFormData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
          locationName: locName
        }));
        setLocationLoading(false);
        setError('');
      },
      (err) => {
        setLocationLoading(false);
        console.error('Geolocation error:', err);
        // We do not set the main error blocking the form submission, 
        // just let them enter it manually if it fails.
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

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
        locationName: formData.locationName || undefined,
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
      <div className="max-w-4xl mx-auto animate-fade-in py-8 px-4 sm:px-6 relative">

        {/* Dynamic Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] -z-10 rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[300px] bg-cyan-500/10 dark:bg-cyan-500/20 blur-[80px] -z-10 rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[300px] bg-purple-500/10 dark:bg-purple-500/20 blur-[100px] -z-10 rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors"></div>

        {/* Header Section */}
        <div className="mb-10 p-8 sm:p-10 bg-white/60 dark:bg-slate-900/60 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-2xl relative overflow-hidden transition-colors">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen transition-colors"></div>
          <div className="absolute left-10 -bottom-20 w-40 h-40 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-2xl mix-blend-multiply dark:mix-blend-screen transition-colors"></div>
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black mb-3 flex items-center space-x-4 text-slate-900 dark:text-white tracking-tight transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 transform rotate-3 hover:rotate-12 transition-transform duration-300">
                <UploadCloud className="w-7 h-7 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">Upload Field Intelligence</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl mt-4 leading-relaxed transition-colors">Submit secure, detailed scenario briefings for command center review. Ensure all field intelligence is corroborated before dispatch.</p>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/60 shadow-xl shadow-slate-200/20 dark:shadow-black/40 p-8 sm:p-12 relative transition-colors overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-bl-full -z-10 transition-colors"></div>
          {error && (
            <div className="mb-10 p-5 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl flex items-start space-x-3 shadow-sm transition-colors animate-fade-in group">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-rose-800 dark:text-rose-300 transition-colors leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid gap-10">
              {/* Primary Details */}
              <div className="space-y-3 group">
                <label htmlFor="title" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Operation Title <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-focus-within:bg-indigo-500 dark:group-focus-within:bg-indigo-400 rounded-l-xl transition-colors duration-300"></div>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-semibold text-lg text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="E.g., Sector 7 Perimeter Breach"
                  />
                </div>
              </div>

              <div className="space-y-3 group">
                <label htmlFor="summary" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Executive Summary <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-focus-within:bg-indigo-500 dark:group-focus-within:bg-indigo-400 rounded-l-xl transition-colors duration-300"></div>
                  <textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-sm leading-relaxed resize-none hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="Brief overview of the incident for quick parsing..."
                  />
                </div>
              </div>

              <div className="space-y-3 group">
                <label htmlFor="content" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Full Tactical Report <span className="text-rose-500 dark:text-rose-400">*</span>
                </label>
                <div className="relative h-full">
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-focus-within:bg-indigo-500 dark:group-focus-within:bg-indigo-400 rounded-l-xl transition-colors duration-300"></div>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={12}
                    className="w-full h-full px-5 py-5 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-serif text-lg text-slate-800 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none shadow-sm leading-relaxed resize-y hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="Provide granular details, timelines, involved entities, and required responses..."
                  />
                </div>
              </div>

              {/* Asset Upload */}
              <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 rounded-[2rem] space-y-4 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase transition-colors flex items-center">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Photographic Evidence / Asset Upload
                </label>
                <div className="flex flex-col gap-3">
                  <label className={`flex items-center justify-center w-full h-36 px-4 transition-all duration-300 border-2 border-dashed rounded-[1.5rem] cursor-pointer focus:outline-none group ${mediaFile ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20'}`}>
                    <div className="flex flex-col items-center space-y-3">
                      {uploading ? (
                        <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                      ) : mediaFile ? (
                        <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400 drop-shadow-sm group-hover:scale-110 transition-transform" />
                      ) : (
                        <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:-translate-y-1 transition-all duration-300" />
                      )}
                      <span className={`font-bold text-sm tracking-wide transition-colors ${mediaFile ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                        {uploading ? 'Transmitting Asset...' : mediaFile ? 'Asset Secure (Click to replace)' : 'Click to select or drop image here'}
                      </span>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept="image/*" />
                  </label>
                  {mediaFile && (
                    <div className="flex items-center space-x-2 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/30 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm animate-fade-in backdrop-blur-sm">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span className="font-bold truncate tracking-wide">Asset ID Code: {mediaFile}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location Data */}
            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 rounded-[2rem] space-y-8 relative overflow-hidden transition-colors hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/50 duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full -z-10 transition-colors"></div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase flex items-center transition-colors">
                    <MapPin className="w-4 h-4 mr-2" /> Global Coordinates
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Geospatial data for incident mapping.</p>
                </div>
                <button
                  type="button"
                  onClick={fetchLocation}
                  disabled={locationLoading}
                  className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-800/60 ring-1 ring-indigo-200/50 dark:ring-indigo-700/50 transition-all flex items-center space-x-2 disabled:opacity-50 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {locationLoading ? (
                    <div className="w-4 h-4 border-2 border-indigo-300 dark:border-indigo-700 border-t-indigo-700 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span>{locationLoading ? 'Acquiring Signal...' : 'Auto-Locate'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 group">
                  <label htmlFor="latitude" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Latitude <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      required
                      className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/30 dark:focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="e.g. 48.8584"
                    />
                  </div>
                </div>

                <div className="space-y-3 group">
                  <label htmlFor="longitude" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Longitude <span className="text-rose-500 dark:text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                    <input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      required
                      className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/30 dark:focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                      placeholder="e.g. 2.2945"
                    />
                  </div>
                </div>
              </div>

              {/* Detected Location Name */}
              {formData.locationName && (
                <div className="mt-6 flex items-center space-x-3 text-sm text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 px-5 py-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm animate-fade-in backdrop-blur-sm group">
                  <MapPin className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-indigo-400 dark:text-indigo-500 tracking-wider mb-0.5">Detected Locale</p>
                    <span className="font-bold tracking-wide">{formData.locationName}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 group">
                <label
                  htmlFor="casualtyCount"
                  className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase flex items-center justify-between transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                >
                  <span>Casualty Metrics</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-normal italic">Optional</span>
                </label>
                <div className="relative">
                  <input
                    id="casualtyCount"
                    type="number"
                    min="0"
                    value={formData.casualtyCount}
                    onChange={(e) => setFormData({ ...formData, casualtyCount: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="Estimated number..."
                  />
                </div>
              </div>

              <div className="space-y-3 group">
                <label htmlFor="categories" className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase flex items-center justify-between transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span>Tags & Categories</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-normal italic">Comma-separated</span>
                </label>
                <div className="relative">
                  <input
                    id="categories"
                    type="text"
                    value={formData.categories}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-semibold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none shadow-sm hover:border-slate-300 dark:hover:border-slate-600"
                    placeholder="e.g. Kinetic, Cyber, Supply Chain"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-10 mt-10 border-t border-slate-200/60 dark:border-slate-800/80 transition-colors">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800"
              >
                Abort
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 bg-size-200 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-right transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-[0_8px_30px_-8px_rgba(99,102,241,0.5)] dark:shadow-[0_8px_30px_-8px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_40px_-10px_rgba(99,102,241,0.7)] dark:hover:shadow-[0_12px_40px_-10px_rgba(99,102,241,0.5)] transform hover:-translate-y-1"
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
