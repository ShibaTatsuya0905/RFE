import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <svg className="animate-spin h-12 w-12 text-[#FF6B35]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="text-sm font-semibold tracking-wider text-slate-400 animate-pulse uppercase">
        Loading live analytics...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0B1120]/80 backdrop-blur-md z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="w-full py-28 flex items-center justify-center">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;