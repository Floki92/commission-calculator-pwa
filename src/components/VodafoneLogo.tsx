import React from 'react';

interface VodafoneLogoProps {
  className?: string;
  size?: number;
  title?: string;
}

/**
 * Official Vodafone Speech Mark Logo
 * The iconic circular badge in official Vodafone Red (#E60000)
 * with the authentic precision-rendered white speech mark (quotation mark).
 */
export function VodafoneLogo({ className = 'w-7 h-7', size, title = 'Vodafone' }: VodafoneLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label={title}
      role="img"
    >
      <title>{title}</title>

      {/* Official Vodafone Red Circle (#E60000) */}
      <circle cx="50" cy="50" r="50" fill="#E60000" />

      {/* Official Vodafone White Speechmark Teardrop Path */}
      <path
        d="M 22.13 47.41 c 0.29 18.97 14.37 30.75 28.16 30.75 16.95 -0.29 27.01 -14.08 26.72 -27.01 0 -12.64 -6.9 -21.84 -22.13 -25.57 0 0 0 -0.29 0 -0.86 0 -9.48 7.18 -18.1 16.38 -19.83 -0.86 -0.29 -2.3 -0.57 -3.74 -0.57 -10.34 0.29 -21.84 4.6 -30.17 11.49 -8.33 7.18 -15.23 19.25 -15.23 31.61 z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
