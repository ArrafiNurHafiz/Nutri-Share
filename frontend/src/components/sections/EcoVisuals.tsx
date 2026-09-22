import React from "react";

/** Realistic botanical green leaf illustration matching the reference design */
export function LeafIllustration({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={style}
    >
      {/* Main realistic green leaf blade */}
      <path
        d="M20 80C20 80 15 45 45 25C75 5 88 12 88 12C88 12 82 45 55 68C28 90 20 80 20 80Z"
        fill="url(#leaf-gradient)"
        filter="drop-shadow(0px 4px 10px rgba(16, 185, 129, 0.2))"
      />
      {/* Secondary branch leaf */}
      <path
        d="M38 55C38 55 28 32 45 18C62 4 72 8 72 8C72 8 68 30 50 45C32 60 38 55 38 55Z"
        fill="#34D399"
        opacity="0.75"
      />
      {/* Leaf stem and central vein */}
      <path
        d="M12 92C18 84 32 66 52 48C68 32 82 18 88 12"
        stroke="#065F46"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Side veins */}
      <path d="M35 64C42 60 50 62 55 68" stroke="#065F46" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M46 53C54 48 64 50 70 56" stroke="#065F46" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      <path d="M58 40C66 35 74 38 78 42" stroke="#065F46" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      <defs>
        <linearGradient id="leaf-gradient" x1="20" y1="80" x2="88" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="0.5" stopColor="#059669" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Legacy alias for leaf decoration */
export const LeafDeco = LeafIllustration;

/** Dashed connecting curve between process step cards */
export function WaveConnector({ className = "" }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="32"
      viewBox="0 0 200 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M0 16C50 4 150 28 200 16"
        stroke="#10B981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="5 5"
      />
    </svg>
  );
}

/** Tugu Yogyakarta architectural line art for footer */
export function TuguJogjaIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      width="160"
      height="120"
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* City skyline subtle backdrop */}
      <path d="M10 110H150" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M15 110V85H30V110" stroke="#059669" strokeWidth="1" opacity="0.25" />
      <path d="M130 110V90H145V110" stroke="#059669" strokeWidth="1" opacity="0.25" />
      <circle cx="22" cy="75" r="8" fill="#10B981" opacity="0.1" />
      <circle cx="138" cy="80" r="10" fill="#10B981" opacity="0.1" />

      {/* Main Tugu Jogja Spire */}
      <path d="M80 12L83 30H77L80 12Z" fill="#FBBF24" />
      <circle cx="80" cy="33" r="3" fill="#FBBF24" />
      <path d="M74 38H86V44H74V38Z" fill="#34D399" />
      <path d="M72 44L74 88H86L88 44H72Z" fill="#A7F3D0" stroke="#065F46" strokeWidth="1.5" />
      {/* Decorative ornaments on body */}
      <line x1="77" y1="52" x2="83" y2="52" stroke="#065F46" strokeWidth="1" />
      <line x1="76" y1="64" x2="84" y2="64" stroke="#065F46" strokeWidth="1" />
      <line x1="75" y1="76" x2="85" y2="76" stroke="#065F46" strokeWidth="1" />
      {/* Base pedestals */}
      <path d="M68 88H92V96H68V88Z" fill="#34D399" stroke="#065F46" strokeWidth="1.2" />
      <path d="M62 96H98V104H62V96Z" fill="#065F46" />
      <path d="M56 104H104V110H56V104Z" fill="#A7F3D0" stroke="#065F46" strokeWidth="1" />
      <path d="M50 110H110V114H50V110Z" fill="#047857" />
    </svg>
  );
}
