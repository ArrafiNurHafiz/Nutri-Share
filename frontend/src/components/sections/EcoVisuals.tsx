import React from "react";

export type LeafVariant =
  | "hero-cluster"
  | "tropical-duo"
  | "sprig-stem"
  | "single-gloss"
  | "fanned-trio"
  | "dew-blade";

/**
 * 3D Glossy Botanical Leaves with unique natural variants.
 * Each variant has custom curved geometry, multi-stop gradient shading,
 * delicate spine glow, and specular gloss highlights.
 */
export function GlossyLeafDecor({
  className = "",
  style = {},
  flip = false,
  variant = "hero-cluster",
}: {
  className?: string;
  style?: React.CSSProperties;
  flip?: boolean;
  variant?: LeafVariant;
}) {
  const id = React.useId().replace(/:/g, "_");

  return (
    <svg
      width="160"
      height="180"
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
        filter:
          "drop-shadow(0 18px 30px rgba(4, 120, 87, 0.28)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.12))",
        ...style,
      }}
    >
      <defs>
        {/* Rich dark forest under-leaf */}
        <linearGradient id={`${id}-dark`} x1="20" y1="160" x2="80" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#022C22" />
          <stop offset="45%" stopColor="#064E3B" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Medium vibrant emerald leaf */}
        <linearGradient id={`${id}-mid`} x1="30" y1="140" x2="135" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="30%" stopColor="#10B981" />
          <stop offset="70%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#6EE7B7" />
        </linearGradient>

        {/* Top vibrant lush leaf with mint tip */}
        <linearGradient id={`${id}-front`} x1="50" y1="130" x2="155" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="25%" stopColor="#10B981" />
          <stop offset="60%" stopColor="#34D399" />
          <stop offset="85%" stopColor="#A7F3D0" />
          <stop offset="100%" stopColor="#D1FAE5" />
        </linearGradient>

        {/* Golden-lime sunlit leaf variant */}
        <linearGradient id={`${id}-sunlit`} x1="40" y1="140" x2="140" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="30%" stopColor="#10B981" />
          <stop offset="70%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#BEF264" />
        </linearGradient>

        {/* Specular White Gloss Sheen */}
        <linearGradient id={`${id}-sheen`} x1="45" y1="110" x2="150" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#A7F3D0" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
        </linearGradient>

        {/* Thin Spine Vein Glow */}
        <linearGradient id={`${id}-spine`} x1="50" y1="120" x2="150" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#064E3B" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#D1FAE5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
        </linearGradient>

        {/* Inter-leaf ambient shadow */}
        <linearGradient id={`${id}-shadow`} x1="50" y1="110" x2="85" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#022C22" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#022C22" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ─── VARIANT 1: Hero Cluster (3 overlapping lush leaves) ─── */}
      {variant === "hero-cluster" && (
        <g>
          {/* Leaf 1: Dark bottom petal */}
          <path
            d="M32 165 C22 145, 24 115, 42 92 C58 72, 74 65, 78 68 C80 72, 76 96, 62 120 C48 144, 34 162, 32 165 Z"
            fill={`url(#${id}-dark)`}
          />
          <path
            d="M34 160 C42 136, 54 108, 68 84"
            stroke="#022C22"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Leaf 2: Middle leaf */}
          <path
            d="M48 145 C30 110, 36 68, 70 38 C98 12, 122 18, 126 22 C126 22, 118 68, 88 106 C62 138, 50 144, 48 145 Z"
            fill={`url(#${id}-mid)`}
          />
          <path
            d="M48 145 C40 120, 48 85, 70 58 C85 40, 105 30, 115 26 C105 45, 92 80, 72 112 C58 134, 49 143, 48 145 Z"
            fill={`url(#${id}-shadow)`}
          />
          <path
            d="M52 138 C68 106, 92 68, 118 28"
            stroke={`url(#${id}-spine)`}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M58 126 C72 98, 95 64, 116 32"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Leaf 3: Front main blade */}
          <path
            d="M68 132 C68 132, 78 72, 118 30 C146 -2, 158 8, 158 8 C158 8, 150 56, 118 94 C88 128, 70 132, 68 132 Z"
            fill={`url(#${id}-front)`}
          />
          <path
            d="M74 126 C95 94, 126 54, 154 14"
            stroke={`url(#${id}-spine)`}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M80 116 C100 86, 130 48, 150 18"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M102 96 C115 82, 130 68, 142 56"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.65"
          />
        </g>
      )}

      {/* ─── VARIANT 2: Tropical Duo (Two long sweeping leaves) ─── */}
      {variant === "tropical-duo" && (
        <g>
          {/* Back wide curved leaf */}
          <path
            d="M38 152 C20 118, 30 70, 64 36 C96 6, 118 12, 118 12 C118 12, 112 58, 86 98 C64 132, 42 150, 38 152 Z"
            fill={`url(#${id}-dark)`}
          />
          <path
            d="M44 144 C60 112, 84 72, 110 24"
            stroke={`url(#${id}-spine)`}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Front slender soaring leaf */}
          <path
            d="M50 148 C52 110, 72 58, 112 20 C140 -6, 152 4, 152 4 C152 4, 140 50, 108 92 C80 128, 54 146, 50 148 Z"
            fill={`url(#${id}-sunlit)`}
          />
          <path
            d="M56 140 C76 102, 106 58, 144 14"
            stroke={`url(#${id}-spine)`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M62 130 C82 92, 112 50, 140 18"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          {/* Side veins */}
          <path
            d="M84 100 C96 86, 112 76, 128 66"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M68 118 C80 106, 94 98, 108 88"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      )}

      {/* ─── VARIANT 3: Sprig with Stem (Flowing organic sprig) ─── */}
      {variant === "sprig-stem" && (
        <g>
          {/* Stem curve */}
          <path
            d="M24 168 C34 145, 52 110, 84 78 C112 50, 138 28, 148 16"
            stroke="#047857"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Stem highlight */}
          <path
            d="M26 166 C36 144, 54 110, 86 78 C114 50, 138 30, 146 18"
            stroke="#34D399"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Lower leaf */}
          <path
            d="M48 122 C32 104, 34 80, 54 62 C74 44, 88 52, 88 52 C88 52, 84 78, 68 98 C56 114, 48 122, 48 122 Z"
            fill={`url(#${id}-mid)`}
          />
          <path
            d="M52 115 C60 98, 70 80, 82 58"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Middle leaf */}
          <path
            d="M78 92 C62 72, 68 46, 92 28 C116 10, 128 20, 128 20 C128 20, 120 48, 102 70 C88 86, 78 92, 78 92 Z"
            fill={`url(#${id}-front)`}
          />
          <path
            d="M84 84 C94 66, 108 48, 122 26"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Top terminal leaf tip */}
          <path
            d="M112 54 C104 36, 114 18, 134 6 C152 -4, 158 4, 158 4 C158 4, 152 26, 138 42 C126 54, 112 54, 112 54 Z"
            fill={`url(#${id}-sunlit)`}
          />
          <path
            d="M118 48 C128 32, 140 18, 152 8"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* ─── VARIANT 4: Single Gloss Blade (Clean large statement leaf) ─── */}
      {variant === "single-gloss" && (
        <g>
          {/* Main Leaf */}
          <path
            d="M28 152 C26 112, 46 62, 94 22 C132 -8, 152 4, 152 4 C152 4, 144 56, 110 102 C74 146, 32 154, 28 152 Z"
            fill={`url(#${id}-front)`}
          />
          {/* Left fold shadow */}
          <path
            d="M28 152 C28 118, 48 76, 88 40 C108 22, 132 12, 146 6 C132 30, 112 70, 84 108 C58 138, 34 150, 28 152 Z"
            fill={`url(#${id}-shadow)`}
          />
          {/* Central prominent spine */}
          <path
            d="M36 144 C62 104, 102 58, 146 12"
            stroke={`url(#${id}-spine)`}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          {/* Primary gloss reflection line */}
          <path
            d="M44 132 C70 94, 110 50, 142 18"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Lateral veins */}
          <path
            d="M68 112 C82 98, 100 86, 118 76"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M92 88 C108 74, 124 64, 138 52"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>
      )}

      {/* ─── VARIANT 5: Fanned Trio (Three fanned palm-like lush leaves) ─── */}
      {variant === "fanned-trio" && (
        <g>
          {/* Left wing */}
          <path
            d="M42 148 C18 126, 14 90, 32 60 C52 30, 72 34, 72 34 C72 34, 74 70, 64 102 C54 132, 44 146, 42 148 Z"
            fill={`url(#${id}-dark)`}
          />
          <path
            d="M44 140 C42 110, 48 78, 62 44"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Right wing */}
          <path
            d="M58 142 C58 142, 80 102, 116 70 C146 44, 156 54, 156 54 C156 54, 142 90, 114 118 C88 144, 62 144, 58 142 Z"
            fill={`url(#${id}-mid)`}
          />
          <path
            d="M66 136 C90 110, 118 82, 148 60"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Center tall blade */}
          <path
            d="M52 148 C50 106, 68 54, 102 14 C126 -10, 138 0, 138 0 C138 0, 130 46, 104 86 C82 124, 58 146, 52 148 Z"
            fill={`url(#${id}-front)`}
          />
          <path
            d="M58 140 C76 98, 100 52, 130 8"
            stroke={`url(#${id}-spine)`}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M64 128 C82 88, 108 44, 132 14"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* ─── VARIANT 6: Dew Blade (Curved droplet accent leaf) ─── */}
      {variant === "dew-blade" && (
        <g>
          {/* Main rounded curved leaf */}
          <path
            d="M34 146 C28 108, 48 64, 88 28 C124 -4, 144 6, 144 6 C144 6, 138 52, 108 94 C76 138, 40 148, 34 146 Z"
            fill={`url(#${id}-front)`}
          />
          <path
            d="M40 138 C64 98, 98 54, 136 14"
            stroke={`url(#${id}-spine)`}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M48 126 C72 88, 104 46, 132 20"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Small companion leaf sprouting at bottom */}
          <path
            d="M26 156 C18 138, 22 118, 38 104 C52 90, 62 96, 62 96 C62 96, 58 118, 46 134 C36 148, 28 154, 26 156 Z"
            fill={`url(#${id}-sunlit)`}
          />
          <path
            d="M30 150 C38 134, 46 118, 56 102"
            stroke={`url(#${id}-sheen)`}
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Dew drop highlight on leaf tip */}
          <circle cx="120" cy="46" r="4.5" fill="#FFFFFF" opacity="0.85" />
          <circle cx="121.5" cy="44.5" r="1.5" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  );
}

export const LeafIllustration = GlossyLeafDecor;
export const LeafDeco = GlossyLeafDecor;

/**
 * Curved Dashed Connecting Line for Process section (Step 01 -> Step 02 -> Step 03 -> Step 04)
 */
export function StepConnector({ className = "" }: { className?: string }) {
  return (
    <div className={`hidden lg:block absolute top-[2.2rem] left-0 right-0 z-0 pointer-events-none px-14 ${className}`}>
      <svg
        width="100%"
        height="40"
        viewBox="0 0 1000 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full"
      >
        <path
          d="M80 20 C 180 5, 220 35, 320 20 C 420 5, 480 35, 580 20 C 680 5, 740 35, 840 20 C 900 10, 930 20, 950 20"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 8"
          opacity="0.75"
        />
      </svg>
    </div>
  );
}

export const WaveConnector = StepConnector;

/** Handwritten curved arrow pointing to process header */
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
        d="M6 6C18 22 34 32 44 36"
        stroke="#059669"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M36 26L46 36L32 40"
        stroke="#059669"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tugu Yogyakarta architectural line art for footer matching reference */
export function TuguJogjaIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      width="200"
      height="120"
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="100" cy="60" r="40" fill="#10B981" opacity="0.15" />
      <path d="M10 114H190" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M20 114V95H34V114" stroke="#10B981" strokeWidth="1" opacity="0.25" />
      <path d="M165 114V98H180V114" stroke="#10B981" strokeWidth="1" opacity="0.25" />

      {/* Main Tugu Jogja Spire */}
      <path d="M100 10L103 26H97L100 10Z" fill="#FBBF24" />
      <circle cx="100" cy="28" r="2.5" fill="#FBBF24" />
      <path d="M95 32H105V37H95V32Z" fill="#34D399" />
      <path d="M92 37L94 80H106L108 37H92Z" fill="#A7F3D0" stroke="#065F46" strokeWidth="1.2" />
      <line x1="96" y1="48" x2="104" y2="48" stroke="#065F46" strokeWidth="1" />
      <line x1="95" y1="60" x2="105" y2="60" stroke="#065F46" strokeWidth="1" />
      <line x1="94" y1="72" x2="106" y2="72" stroke="#065F46" strokeWidth="1" />
      <path d="M88 80H112V88H88V80Z" fill="#34D399" stroke="#065F46" strokeWidth="1.2" />
      <path d="M82 88H118V96H82V88Z" fill="#065F46" />
      <path d="M76 96H124V104H76V96Z" fill="#A7F3D0" stroke="#065F46" strokeWidth="1.2" />
      <path d="M68 104H132V112H68V104Z" fill="#047857" />
    </svg>
  );
}
