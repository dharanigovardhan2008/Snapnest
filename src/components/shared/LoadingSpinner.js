'use client';

export default function LoadingSpinner({ fullScreen = false, size = 'md', text = 'Loading...' }) {
  // Map standard sizes to pixel-perfect tailwind dimensions
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  // Dynamically adjust the stroke thickness based on the size so it always looks sharp
  const strokeWidths = {
    sm: '3',
    md: '2.5',
    lg: '2',
  };

  const spinner = (
    <div className={`relative ${sizes[size]} shrink-0`}>
      {/* Background Track */}
      <svg 
        className="absolute inset-0 w-full h-full text-studio-grey" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={strokeWidths[size]} />
      </svg>
      {/* Animated Foreground Ring */}
      <svg 
        className="absolute inset-0 w-full h-full text-ink-black animate-spin" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth={strokeWidths[size]} 
          strokeDasharray="32" 
          strokeDashoffset="16" 
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-studio-white/80 backdrop-blur-md z-50">
        {/* Floating Studio Card overlay */}
        <div className="flex flex-col items-center gap-4 bg-studio-white px-8 py-6 rounded-[32px] shadow-glass border border-studio-grey">
          {spinner}
          {text && (
            <p className="font-body font-medium text-ink-muted text-sm tracking-wide animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  return spinner;
}