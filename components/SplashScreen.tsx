
import React from 'react';
import Logo from './Logo';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Padrão de Circuito de Fundo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 10 H20 V30 H40 V10 H60 V30 H80 V10 H100 M10 0 V100 M30 0 V100 M50 0 V100 M70 0 V100 M90 0 V100" 
                    fill="none" stroke="#D1101E" strokeWidth="0.5" />
              <circle cx="20" cy="10" r="1.5" fill="#D1101E" />
              <circle cx="60" cy="30" r="1.5" fill="#D1101E" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      {/* Brilho Radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D1101E]/20 rounded-full blur-[120px] animate-pulse"></div>

      {/* Logo Component */}
      <div className="relative flex flex-col items-center animate-in zoom-in duration-1000">
        <Logo className="w-64" variant="light" />
        
        {/* Linha de Brilho que passa pelo logo */}
        <div className="absolute top-0 bottom-0 left-[-100%] w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] animate-[shine_3s_infinite]"></div>

        {/* Tagline e Loading */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Iniciando Sistemas VSI</span>
          </div>
          
          <div className="w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#D1101E] to-red-400 animate-[loading_2s_infinite]"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">
        Tecnologia • Performance • Confiança
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shine {
          0% { left: -100%; }
          50% { left: 200%; }
          100% { left: 200%; }
        }
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default SplashScreen;
