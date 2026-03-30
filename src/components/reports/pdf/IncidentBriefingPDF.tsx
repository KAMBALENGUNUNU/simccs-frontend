import { forwardRef } from 'react';
import { ReportResponse } from '../../../types/api';
import { ReportLayout } from './ReportLayout';
import { MapPin, Users, Calendar } from 'lucide-react';

interface IncidentBriefingPDFProps {
    data: ReportResponse;
}

export const IncidentBriefingPDF = forwardRef<HTMLDivElement, IncidentBriefingPDFProps>(
    ({ data }, ref) => {
        return (
            <ReportLayout
                ref={ref}
            >
                <div className="mb-8 border-2 border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            <tr>
                                <th className="bg-slate-100 p-4 border-b border-r border-slate-300 w-1/4 text-sm font-bold text-slate-900 uppercase tracking-wider">Report Subject</th>
                                <td className="p-4 border-b border-slate-300 text-lg font-bold text-slate-800">{data.title}</td>
                            </tr>
                            <tr>
                                <th className="bg-slate-100 p-4 border-b border-r border-slate-300 text-sm font-bold text-slate-900 uppercase tracking-wider">Timestamp</th>
                                <td className="p-4 border-b border-slate-300 font-mono text-sm text-slate-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-500" />
                                    {new Date(data.createdAt).toLocaleString()}
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-slate-100 p-4 border-b border-r border-slate-300 text-sm font-bold text-slate-900 uppercase tracking-wider">Location</th>
                                <td className="p-4 border-b border-slate-300 text-sm flex items-center gap-2 text-slate-700">
                                    <MapPin className="w-4 h-4 text-rose-500" />
                                    <span className="font-semibold">{data.locationName || 'Unspecified Location'}</span>
                                    {data.latitude !== undefined && data.longitude !== undefined && (
                                        <span className="text-slate-500 font-mono text-xs">({data.latitude.toFixed(4)}, {data.longitude.toFixed(4)})</span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-slate-100 p-4 border-b border-r border-slate-300 text-sm font-bold text-slate-900 uppercase tracking-wider">Impact Estimate</th>
                                <td className="p-4 border-b border-slate-300 text-sm flex items-center gap-2 text-slate-700">
                                    <Users className="w-4 h-4 text-amber-500" />
                                    <span className="font-semibold">{data.casualtyCount || 0} Estimated Casualties</span>
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-slate-100 p-4 border-b border-r border-slate-300 text-sm font-bold text-slate-900 uppercase tracking-wider">Classification</th>
                                <td className="p-4 border-b border-slate-300 text-sm">
                                    <div className="flex gap-2 flex-wrap">
                                        {data.categories?.map(cat => (
                                            <span key={cat} className="px-2 py-1 bg-indigo-50 text-indigo-800 text-[10px] font-bold rounded uppercase border border-indigo-200 shadow-sm">
                                                {cat}
                                            </span>
                                        ))}
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase border shadow-sm ${data.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                                            Status: {data.status}
                                        </span>
                                        {data.flagged && (
                                            <span className="px-2 py-1 bg-rose-50 text-rose-800 text-[10px] font-bold rounded uppercase border border-rose-200 shadow-sm">
                                                Misinformation Risk
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-slate-100 p-5 border-b border-r border-slate-300 text-sm font-bold text-slate-900 uppercase tracking-wider align-top">Executive Summary</th>
                                <td className="p-6 border-b border-slate-300 bg-slate-50/50">
                                    <p className="font-medium text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-slate-100 p-5 border-b border-r border-slate-300 text-sm font-bold text-slate-900 uppercase tracking-wider align-top">Detailed Content</th>
                                <td className="p-6 border-b border-slate-300">
                                    <p className="text-sm font-serif text-slate-800 leading-relaxed whitespace-pre-wrap">{data.content}</p>
                                </td>
                            </tr>
                            <tr>
                                <th className="bg-slate-100 p-5 border-r border-slate-300 text-sm font-bold text-slate-900 uppercase tracking-wider align-top">Chain of Custody</th>
                                <td className="p-5 bg-slate-50 text-sm">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div>
                                            <div className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-widest">Submitting Journalist</div>
                                            <div className="font-mono font-bold text-slate-800 bg-white px-3 py-1.5 rounded-md inline-block border border-slate-200 shadow-sm text-xs">
                                                {data.authorName}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-widest">Internal ID</div>
                                            <div className="font-mono font-bold text-slate-700 bg-white px-3 py-1.5 rounded-md inline-block border border-slate-200 shadow-sm text-xs">
                                                INT-REP-{data.id.toString().padStart(6, '0')}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-[10px] font-bold mb-1.5 uppercase tracking-widest">System Log Time</div>
                                            <div className="font-mono text-slate-700 text-xs bg-white px-3 py-1.5 rounded-md inline-block border border-slate-200 shadow-sm">
                                                {new Date(data.createdAt).toISOString()}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </ReportLayout>
        );
    }
);

IncidentBriefingPDF.displayName = 'IncidentBriefingPDF';
