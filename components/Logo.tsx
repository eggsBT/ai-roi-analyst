import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="paint0_linear" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" /> {/* Emerald-500 */}
          <stop offset="1" stopColor="#0F766E" /> {/* Teal-700 */}
        </linearGradient>
      </defs>
      <g transform="matrix(-1 0 0 1 48 0)">
        <rect width="48" height="48" rx="12" fill="url(#paint0_linear)" />
        {/* Dollar Sign */}
        <path 
          d="M24 10V38M16 16.5C16 16.5 19 14 24 14C29 14 31 16 31 19.5C31 23 28 25 24 26C20 27 17 29 17 32.5C17 36 20 38 24 38C29 38 32 35.5 32 35.5" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Lightning Bolt Accent for AI/Flash */}
        <path 
          d="M34 10L28 22H33L27 34" 
          stroke="#FCD34D" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="#FCD34D"
        />
      </g>
    </svg>
  );
};

export default Logo;