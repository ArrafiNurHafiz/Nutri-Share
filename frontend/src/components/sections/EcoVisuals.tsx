import React from "react";

/** Realistic botanical green leaf branch matching the reference design */
export function LeafIllustration({
  className = "",
  style = {},
  flip = false,
}: {
  className?: string;
  style?: React.CSSProperties;
  flip?: boolean;
}) {
  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      {/* Curved organic stem */}
      <path
        d="M15 105C30 95 45 75 70 45C90 20 105 8 110 5"
        stroke="#166534"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Main Top Leaf */}
      <path
        d="M60 48C60 48 65 18 92 8C112 0 115 12 115 12C115 12 108 38 85 52C65 65 60 48 60 48Z"
        fill="url(#green-leaf-1)"
        filter="drop-shadow(0 4px 8px rgba(16, 185, 129, 0.25))"
      />
      {/* Top Leaf Central Vein */}
      <path d="M68 42C80 30 98 18 110 10" stroke="#14532D" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

      {/* Middle Side Leaf */}
      <path
        d="M40 70C40 70 30 42 52 25C72 10 82 18 82 18C82 18 78 45 58 64C42 78 40 70 40 70Z"
        fill="url(#green-leaf-2)"
        filter="drop-shadow(0 3px 6px rgba(16, 185, 129, 0.2))"
      />
      <path d="M48 62C58 48 70 32 78 22" stroke="#14532D" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      {/* Small Bottom Leaf */}
      <path
        d="M25 88C25 88 18 68 34 55C48 44 56 50 56 50C56 50 52 70 38 84C26 94 25 88 25 88Z"
        fill="url(#green-leaf-3)"
      />
      <path d="M30 82C38 72 46 60 52 54" stroke="#14532D" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

      <defs>
        <linearGradient id="green-leaf-1" x1="60" y1="48" x2="115" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="0.5" stopColor="#10B981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="green-leaf-2" x1="40" y1="70" x2="82" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6EE7B7" />
          <stop offset="0.6" stopColor="#059669" />
          <stop offset="1" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="green-leaf-3" x1="25" y1="88" x2="56" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A7F3D0" />
          <stop offset="0.7" stopColor="#10B981" />
          <stop offset="1" stopColor="#065F46" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const LeafDeco = LeafIllustration;

/** Dashed connecting curve between process step cards */
export function WaveConnector({ className = "" }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="36"
      viewBox="0 0 400 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      <path
        d="M0 18C100 4 300 32 400 18"
        stroke="#10B981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="6 6"
      />
    </svg>
  );
}

/** Handwritten curved arrow pointing to process */
export function CurvedDoodleArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="54"
      height="46"
      viewBox="0 0 54 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 6C20 24 36 34 46 38"
        stroke="#059669"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M40 26L48 38L34 42"
        stroke="#059669"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tugu Yogyakarta architectural line art for footer */
export function TuguJogjaIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      width="180"
      height="140"
      viewBox="0 0 180 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* City skyline subtle backdrop */}
      <path d="M10 130H170" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M16 130V105H28V130" stroke="#10B981" strokeWidth="1" opacity="0.25" />
      <path d="M148 130V110H160V130" stroke="#10B981" strokeWidth="1" opacity="0.25" />
      <circle cx="22" cy="95" r="6" fill="#10B981" opacity="0.1" />
      <circle cx="154" cy="98" r="8" fill="#10B981" opacity="0.1" />

      {/* Main Tugu Jogja Spire */}
      <path d="M90 14L93 32H87L90 14Z" fill="#FBBF24" />
      <circle cx="90" cy="35" r="2.5" fill="#FBBF24" />
      <path d="M84 40H96V46H84V40Z" fill="#34D399" />
      <path d="M82 46L84 94H96L98 46H82Z" fill="#A7F3D0" stroke="#065F46" strokeWidth="1.5" />
      <line x1="87" y1="56" x2="93" y2="56" stroke="#065F46" strokeWidth="1" />
      <line x1="86" y1="70" x2="94" y2="70" stroke="#065F46" strokeWidth="1" />
      <line x1="85" y1="84" x2="95" y2="84" stroke="#065F46" strokeWidth="1" />
      <path d="M78 94H102V104H78V94Z" fill="#34D399" stroke="#065F46" strokeWidth="1.2" />
      <path d="M72 104H108V114H72V104Z" fill="#065F46" />
      <path d="M66 114H114V122H66V114Z" fill="#A7F3D0" stroke="#065F46" strokeWidth="1" />
      <path d="M58 122H122V128H58V122Z" fill="#047857" />
    </svg>
  );
}
