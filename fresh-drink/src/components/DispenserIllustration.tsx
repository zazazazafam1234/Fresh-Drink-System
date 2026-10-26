import React from 'react';

interface DispenserIllustrationProps {
  className?: string;
  size?: number;
}

export const DispenserIllustration: React.FC<DispenserIllustrationProps> = ({
  className = '',
  size = 72,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size * 1.3 }}
    >
      <svg
        viewBox="0 0 80 104"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="bodyWhite" x1="16" y1="8" x2="64" y2="8">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="20%" stopColor="#ffffff" />
            <stop offset="80%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="waterTank" x1="18" y1="44" x2="62" y2="44">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
            <stop offset="15%" stopColor="#f8fafc" stopOpacity="0.5" />
            <stop offset="85%" stopColor="#f8fafc" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="waterLiquid" x1="20" y1="62" x2="60" y2="92">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="glassRim" x1="18" y1="44" x2="62" y2="44">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>

        {/* Top Head Unit */}
        <rect x="20" y="8" width="40" height="38" rx="6" fill="url(#bodyWhite)" />
        {/* Subtle top bevel */}
        <path d="M22 10C22 9 23 8 25 8H55C57 8 58 9 58 10V14H22V10Z" fill="#f8fafc" />

        {/* Status indicator / Logo on Head */}
        <circle cx="40" cy="22" r="2.5" fill="#0ea5e9" fillOpacity="0.8" />
        <path d="M39.5 28H40.5V33H39.5V28Z" fill="#cbd5e1" />
        {/* Spout / Dispense nozzle */}
        <path d="M37 36H43L41 40H39L37 36Z" fill="#94a3b8" />

        {/* Transparent Water Reservoir Chamber */}
        <rect
          x="20"
          y="46"
          width="40"
          height="46"
          rx="4"
          fill="url(#waterTank)"
          stroke="#cbd5e1"
          strokeWidth="1.2"
        />

        {/* Water Liquid Level */}
        <rect
          x="22"
          y="62"
          width="36"
          height="28"
          rx="2"
          fill="url(#waterLiquid)"
          fillOpacity="0.85"
        />

        {/* Water Surface Wave / Bubble */}
        <ellipse cx="40" cy="62" rx="18" ry="2.5" fill="#7dd3fc" fillOpacity="0.9" />
        <ellipse cx="32" cy="74" rx="2.5" ry="1.5" fill="#ffffff" fillOpacity="0.4" />
        <ellipse cx="48" cy="80" rx="3" ry="1.8" fill="#ffffff" fillOpacity="0.3" />

        {/* Glass Specular Highlight (vertical shine) */}
        <rect x="24" y="48" width="3" height="42" rx="1.5" fill="#ffffff" fillOpacity="0.65" />

        {/* Base Unit */}
        <rect x="18" y="92" width="44" height="6" rx="3" fill="url(#bodyWhite)" stroke="#cbd5e1" strokeWidth="1" />
        {/* Subtle glow ring at base */}
        <rect x="24" y="93" width="32" height="1.5" rx="0.75" fill="#38bdf8" />
      </svg>
    </div>
  );
};
