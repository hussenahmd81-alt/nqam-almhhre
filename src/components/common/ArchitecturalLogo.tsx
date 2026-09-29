import React from 'react';

interface ArchitecturalLogoProps {
  collapsed?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ArchitecturalLogo: React.FC<ArchitecturalLogoProps> = ({ collapsed = false, size = 'md' }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* 3D Geometric Architectural Emblem */}
      <div className={`relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/30 p-2 shadow-lg shadow-amber-500/5 ${size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-13 h-13' : 'w-11 h-11'}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-amber-400 transform transition-transform duration-300 hover:rotate-6"
        >
          {/* Isometric Architectural Structure */}
          {/* Base foundation */}
          <path
            d="M24 6L40 15V33L24 42L8 33V15L24 6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500/60"
          />
          {/* Internal architectural ribs */}
          <path
            d="M24 6V42"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="2 2"
            className="text-amber-400"
          />
          <path
            d="M8 15L24 24L40 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-300"
          />
          <path
            d="M8 33L24 24L40 33"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500/40"
          />
          {/* Modern cantilever golden apex */}
          <circle cx="24" cy="24" r="3" fill="#F59E0B" className="animate-pulse" />
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col min-w-0 transition-opacity duration-200">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white text-lg leading-tight">
              لمسات المعمار
            </span>
            <span className="text-[10px] font-mono tracking-widest text-amber-400/90 font-semibold px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              ERP
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium tracking-wide truncate">
            للمقاولات والهندسة المعمارية
          </span>
        </div>
      )}
    </div>
  );
};
