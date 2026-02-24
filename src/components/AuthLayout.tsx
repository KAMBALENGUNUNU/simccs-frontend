import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    icon: ReactNode;
    title: ReactNode;
    subtitle: ReactNode;
    gradient?: string;
}

export function AuthLayout({ children, icon, title, subtitle, gradient = 'from-indigo-500 to-cyan-400' }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex selection:bg-indigo-500/30 transition-colors duration-500 relative overflow-hidden">
            {/* Global Animated Background Gradients & Orbs spanning both columns */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob transition-colors duration-500 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 dark:bg-cyan-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000 transition-colors duration-500 pointer-events-none"></div>
            <div className="absolute top-[20%] left-[40%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000 transition-colors duration-500 pointer-events-none"></div>

            {/* Premium Universal Cubes Grid with Artistic Vignette Fading */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Central prominent grid with vignette fade to emphasize the content area */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-[0.25] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_80%)] transition-opacity duration-500"></div>
                {/* Global subtle grid to maintain texture consistency across the entire canvas */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.06] transition-opacity duration-500"></div>
            </div>

            {/* Left Column: Context / Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden z-10 px-12">
                <div className="relative z-10 text-center flex flex-col items-center animate-fade-in">
                    {/* Dynamic Icon */}
                    <div className={`w-28 h-28 bg-gradient-to-br ${gradient} rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] mb-12 relative overflow-hidden group`}>
                        <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-150 rounded-full transition-transform duration-700 opacity-0 group-hover:opacity-100"></div>
                        <div className="relative z-10 text-white [&>svg]:w-14 [&>svg]:h-14">
                            {icon}
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight text-center whitespace-pre-line transition-colors">
                        {title}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-indigo-200/80 font-medium tracking-wide whitespace-pre-line text-center transition-colors">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden z-10">

                {/* Mobile Context Header (Hidden on Large Screens) */}
                <div className="lg:hidden text-center mb-10 animate-fade-in">
                    <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${gradient} rounded-3xl mb-6 shadow-[0_0_40px_rgba(99,102,241,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-500`}>
                        <div className="text-white [&>svg]:w-10 [&>svg]:h-10">
                            {icon}
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight transition-colors whitespace-pre-line">
                        {title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide transition-colors whitespace-pre-line">
                        {subtitle}
                    </p>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
                    {children}
                </div>
            </div>
        </div>
    );
}
