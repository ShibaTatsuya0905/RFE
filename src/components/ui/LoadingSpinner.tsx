import React from 'react';
import { Utensils } from 'lucide-react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
  const foodLoader = (
    <div className="flex flex-col items-center justify-center gap-5 select-none">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_20px_rgba(255,107,53,0.15)]">
          <circle cx="50" cy="50" r="46" fill="#0F172A" stroke="#1E293B" strokeWidth="3" />
          <circle cx="50" cy="50" r="40" fill="#1E293B" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

          <g className="slice-1">
            <path d="M 50 50 L 82 50 A 32 32 0 0 1 66 77.71 Z" fill="#FF6B35" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="64" cy="58" r="3" fill="#EF4444" />
            <circle cx="56" cy="65" r="2" fill="#10B981" />
          </g>

          <g className="slice-2">
            <path d="M 50 50 L 66 77.71 A 32 32 0 0 1 34 77.71 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="50" cy="68" r="3" fill="#EF4444" />
            <circle cx="42" cy="62" r="2" fill="#10B981" />
          </g>

          <g className="slice-3">
            <path d="M 50 50 L 34 77.71 A 32 32 0 0 1 18 50 Z" fill="#FF6B35" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="32" cy="58" r="3" fill="#EF4444" />
            <circle cx="38" cy="66" r="2" fill="#10B981" />
          </g>

          <g className="slice-4">
            <path d="M 50 50 L 18 50 A 32 32 0 0 1 34 22.29 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="34" cy="40" r="3" fill="#EF4444" />
            <circle cx="44" cy="34" r="2" fill="#10B981" />
          </g>

          <g className="slice-5">
            <path d="M 50 50 L 34 22.29 A 32 32 0 0 1 66 22.29 Z" fill="#FF6B35" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="50" cy="32" r="3" fill="#EF4444" />
            <circle cx="58" cy="38" r="2" fill="#10B981" />
          </g>

          <g className="slice-6">
            <path d="M 50 50 L 66 22.29 A 32 32 0 0 1 82 50 Z" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="66" cy="40" r="3" fill="#EF4444" />
            <circle cx="56" cy="34" r="2" fill="#10B981" />
          </g>

          <circle cx="50" cy="50" r="4" fill="#0F172A" />
        </svg>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#FF6B35] animate-pulse uppercase">
        <Utensils size={14} />
        <span>Đang dọn món ngon...</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0B1120]/85 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
        {foodLoader}
      </div>
    );
  }

  return (
    <div className="w-full py-24 flex items-center justify-center animate-fade-in">
      {foodLoader}
    </div>
  );
};

export default LoadingSpinner;