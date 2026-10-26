import React from 'react';

export const WaterDropLogo: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Main droplet */}
        <path
          d="M24 3C24 3 8 20.8 8 31.2C8 39.9 15.2 47 24 47C32.8 47 40 39.9 40 31.2C40 20.8 24 3 24 3Z"
          fill="url(#droplet_grad)"
        />
        {/* Inner stylized wave / leaf swirl */}
        <path
          d="M17 31C17 25 21 21 27 21C26 27 22 31 17 31Z"
          fill="white"
          fillOpacity="0.85"
        />
        <path
          d="M21 37C21 33 24 30 29 30C28 35 25 38 21 37Z"
          fill="white"
          fillOpacity="0.9"
        />
        <defs>
          <linearGradient id="droplet_grad" x1="8" y1="3" x2="40" y2="47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="0.6" stopColor="#2563EB" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
