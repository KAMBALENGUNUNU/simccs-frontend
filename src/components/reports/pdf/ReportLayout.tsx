import { ReactNode, forwardRef } from 'react';
import logo from '../../../image/simccs_logo.png';

interface ReportLayoutProps {
    children: ReactNode;
}

export const ReportLayout = forwardRef<HTMLDivElement, ReportLayoutProps>(
    ({ children }, ref) => {
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return (
            <div ref={ref} className="bg-white w-[210mm] min-h-[297mm] p-14 pt-0 mx-auto relative shadow-sm print:shadow-none print:w-full print:h-full print:p-14 print:pt-0 print:box-border text-slate-900">

                {/* HEADER */}
                <div className="flex flex-col items-center justify-center pb-2 mb-4">
                    <img src={logo} alt="SIMCCS Logo" className="w-32 h-32 object-contain drop-shadow-sm mb-4" />
                    <h1 className="text-2xl font-serif font-black text-slate-900 tracking-tight uppercase leading-tight text-center">Report at the Agence Congolaise de presse via the SIMCCS system.</h1>
                </div>

                {/* CONTENT */}
                <div className="mb-24">
                    {children}
                </div>

                {/* FOOTER */}
                <div className="absolute bottom-12 left-14 right-14 border-t-2 border-slate-200 pt-6 flex justify-between items-start text-xs text-slate-500 font-mono font-medium">
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-700">Crisis Communication & Management System</span>
                        <span>Confidential & Proprietary Base</span>
                    </div>
                    <div className="text-center flex flex-col gap-1">
                        <span className="font-bold text-slate-700 tracking-widest uppercase text-[10px]">Generated On</span>
                        <span className="text-slate-600">{currentDate}</span>
                    </div>
                    <div className="text-right pt-2 font-bold text-slate-600">
                        Page <span className="pageNumber"></span>
                    </div>
                </div>

            </div>
        );
    });

ReportLayout.displayName = 'ReportLayout';
