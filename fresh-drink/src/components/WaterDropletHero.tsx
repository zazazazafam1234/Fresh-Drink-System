import React from 'react';

interface WaterDropletHeroProps {
  size?: number;
  animated?: boolean;
  withRipples?: boolean;
}

export const WaterDropletHero: React.FC<WaterDropletHeroProps> = ({
  size = 140,
  animated = true,
  withRipples = true,
}) => {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Background Soft Glow */}
      <div
        className="absolute inset-0 rounded-full bg-sky-200/40 blur-xl scale-110 pointer-events-none"
        aria-hidden="true"
      />

      {/* Ripple Waves Effect */}
      {withRipples && (
        <svg
          className="absolute bottom-2 w-full h-12 overflow-visible pointer-events-none"
          viewBox="0 0 160 40"
          fill="none"
        >
          {/* Outer Ripple */}
          <ellipse
            cx="80"
            cy="24"
            rx="56"
            ry="12"
            stroke="url(#rippleGradOuter)"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            className={animated ? 'animate-pulse' : ''}
          />
          {/* Middle Ripple */}
          <ellipse
            cx="80"
            cy="24"
            rx="40"
            ry="9"
            stroke="url(#rippleGradMid)"
            strokeWidth="1.8"
            strokeOpacity="0.7"
          />
          {/* Inner Splash Ring */}
          <ellipse
            cx="80"
            cy="24"
            rx="24"
            ry="6"
            fill="url(#innerSplash)"
            stroke="#38bdf8"
            strokeWidth="1.5"
          />

          {/* Tiny Droplet Splashes */}
          <circle cx="56" cy="18" r="1.5" fill="#38bdf8" fillOpacity="0.8" />
          <circle cx="106" cy="19" r="1.8" fill="#38bdf8" fillOpacity="0.8" />
          <circle cx="68" cy="12" r="1.2" fill="#60a5fa" fillOpacity="0.9" />
          <circle cx="94" cy="11" r="1.4" fill="#60a5fa" fillOpacity="0.9" />

          <defs>
            <linearGradient id="rippleGradOuter" x1="20" y1="24" x2="140" y2="24">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="rippleGradMid" x1="40" y1="24" x2="120" y2="24">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
            </linearGradient>
            <radialGradient id="innerSplash" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#7dd3fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      )}

      {/* 3D Realistic Water Droplet */}
      <svg
        className={`w-28 h-28 relative z-10 filter drop-shadow-[0_12px_18px_rgba(14,165,233,0.35)] ${
          animated ? 'transition-transform duration-700 ease-in-out hover:scale-105' : ''
        }`}
        viewBox="0 0 100 120"
        fill="none"
      >
        <defs>
          {/* Main Body Gradient */}
          <linearGradient id="dropBody" x1="50" y1="10" x2="50" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="25%" stopColor="#7dd3fc" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Deep Reflection Bottom */}
          <radialGradient id="dropDepth" cx="45%" cy="75%" r="45%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#075985" stopOpacity="0.95" />
          </radialGradient>

          {/* Specular Highlight Top Left */}
          <linearGradient id="specularGlow" x1="30" y1="35" x2="45" y2="70">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Secondary Light Reflection Right */}
          <linearGradient id="rightReflection" x1="75" y1="50" x2="60" y2="85">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Droplet Outline & Base Silhouette */}
        <path
          d="M50 10 
             C50 10, 24 55, 24 78 
             A26 26 0 0 0 76 78 
             C76 55, 50 10, 50 10 Z"
          fill="url(#dropBody)"
        />

        {/* Internal Depth Layer */}
        <path
          d="M50 14 
             C50 14, 26 57, 26 78 
             A24 24 0 0 0 74 78 
             C74 57, 50 14, 50 14 Z"
          fill="url(#dropDepth)"
          opacity="0.85"
        />

        {/* Primary Glossy Specular Highlight (Curved Bean Shape) */}
        <path
          d="M40 32 
             C44 26, 47 24, 48 24 
             C48 24, 34 50, 34 70 
             C34 76, 36 82, 38 84 
             C35 80, 32 74, 32 68 
             C32 50, 38 36, 40 32 Z"
          fill="url(#specularGlow)"
        />

        {/* Secondary Bright Top Pinpoint Glint */}
        <circle cx="47" cy="22" r="2.5" fill="#ffffff" opacity="0.9" />

        {/* Bottom Internal Water Bubble Reflection */}
        <ellipse
          cx="52"
          cy="85"
          rx="14"
          ry="6"
          fill="#bae6fd"
          opacity="0.45"
        />

        {/* Right Rim Light */}
        <path
          d="M62 48 
             C66 56, 68 66, 68 74 
             C68 81, 65 86, 62 88 
             C65 85, 66 80, 66 74 
             C66 66, 64 56, 60 50 Z"
          fill="url(#rightReflection)"
        />
      </svg>
    </div>
  );
};
