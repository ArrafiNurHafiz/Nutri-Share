import React from "react";

export type LeafVariant =
  | "hero-cluster"
  | "tropical-duo"
  | "sprig-stem"
  | "single-gloss"
  | "fanned-trio"
  | "dew-blade";

/**
 * 3D Glossy Botanical Leaves with high contrast, natural dual-tone axial folding,
 * vibrant emerald-lime gradients, glowing vein spines, and crisp specular highlights.
 * 100% transparent background with zero clipping artifacts or background boxes.
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
  const rawId = React.useId();
  const id = "leaf_" + rawId.replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none bg-transparent overflow-visible ${className}`}
      style={{
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      <defs>
        {/* Deep Forest Shadow Half (Axial fold shadow) */}
        <linearGradient id={`${id}-deep`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#01241a" />
          <stop offset="50%" stopColor="#064e3b" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Medium Vibrant Emerald */}
        <linearGradient id={`${id}-mid`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="40%" stopColor="#059669" />
          <stop offset="80%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        {/* Luminous Sunlit Leaf Blade (High Contrast Front) */}
        <linearGradient id={`${id}-bright`} x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="35%" stopColor="#10b981" />
          <stop offset="70%" stopColor="#34d399" />
          <stop offset="90%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>

        {/* Golden-Lime Spring Foliage */}
        <linearGradient id={`${id}-lime`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#047857" />
          <stop offset="30%" stopColor="#10b981" />
          <stop offset="70%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#bef264" />
        </linearGradient>

        {/* Organic Woody-Green Stem */}
        <linearGradient id={`${id}-stem`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#022c22" />
          <stop offset="40%" stopColor="#065f46" />
          <stop offset="80%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        {/* Sharp Specular Gloss Reflection */}
        <linearGradient id={`${id}-gloss`} x1="20%" y1="80%" x2="80%" y2="20%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#d1fae5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>

        {/* Crisp Central Midrib / Spine Glow */}
        <linearGradient id={`${id}-spine`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#022c22" stopOpacity="0.8" />
          <stop offset="30%" stopColor="#047857" />
          <stop offset="70%" stopColor="#a7f3d0" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Soft Ambient Contact Shadow */}
        <linearGradient id={`${id}-contact-shadow`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#01241a" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#01241a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ─── VARIANT 1: Hero Cluster (3 High-Contrast 3D Botanical Leaves) ─── */}
      {variant === "hero-cluster" && (
        <g transform="translate(10, 10)">
          {/* Back Leaf (Dark Forest Contrast) */}
          <g>
            <path
              d="M34 162 C22 135 24 95 48 70 C58 59 70 54 78 52 C76 68 68 96 52 124 C44 140 37 154 34 162 Z"
              fill={`url(#${id}-deep)`}
            />
            <path
              d="M34 162 C37 154 44 140 52 124 C68 96 76 68 78 52 C86 58 88 74 82 96 C74 122 56 148 34 162 Z"
              fill={`url(#${id}-mid)`}
            />
            <path
              d="M34 162 C44 136 58 100 78 52"
              stroke={`url(#${id}-spine)`}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>

          {/* Middle Leaf (Vibrant Emerald Body) */}
          <g>
            <path
              d="M48 148 C30 110 38 64 74 34 C94 17 114 18 122 20 C118 42 102 78 78 110 C62 132 52 144 48 148 Z"
              fill={`url(#${id}-deep)`}
            />
            <path
              d="M48 148 C52 144 62 132 78 110 C102 78 118 42 122 20 C130 28 132 48 118 78 C102 110 74 138 48 148 Z"
              fill={`url(#${id}-bright)`}
            />
            <path
              d="M48 148 C40 125 46 90 70 60 C86 40 106 28 116 22 C104 46 90 82 70 114 C56 136 49 146 48 148 Z"
              fill={`url(#${id}-contact-shadow)`}
            />
            <path
              d="M48 148 C68 116 94 72 122 20"
              stroke={`url(#${id}-spine)`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M58 134 C76 104 100 64 120 28"
              stroke={`url(#${id}-gloss)`}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path d="M72 110 C82 102 96 98 108 94" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
            <path d="M88 88 C98 80 110 76 120 70" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
          </g>

          {/* Front Dominant Leaf (High-Contrast Lime / Spring Emerald) */}
          <g>
            <path
              d="M66 136 C64 98 84 52 124 16 C144 -2 158 4 162 6 C158 26 142 62 116 98 C92 126 72 134 66 136 Z"
              fill={`url(#${id}-mid)`}
            />
            <path
              d="M66 136 C72 134 92 126 116 98 C142 62 158 26 162 6 C170 16 170 38 152 72 C132 108 98 132 66 136 Z"
              fill={`url(#${id}-lime)`}
            />
            <path
              d="M66 136 C92 102 128 58 162 6"
              stroke={`url(#${id}-spine)`}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M76 122 C100 90 134 48 156 16"
              stroke={`url(#${id}-gloss)`}
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path d="M96 100 C110 90 128 84 144 80" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            <path d="M116 76 C128 66 144 58 156 52" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
            <path d="M80 118 C92 110 106 106 120 102" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
          </g>
        </g>
      )}

      {/* ─── VARIANT 2: Tropical Duo (Two Sweeping Curved Leaves) ─── */}
      {variant === "tropical-duo" && (
        <g transform="translate(10, 10)">
          {/* Back broad curved leaf */}
          <g>
            <path
              d="M36 156 C18 120 28 72 64 36 C92 8 116 12 122 14 C118 36 106 72 82 108 C62 138 42 152 36 156 Z"
              fill={`url(#${id}-deep)`}
            />
            <path
              d="M36 156 C42 152 62 138 82 108 C106 72 118 36 122 14 C130 22 130 46 114 80 C94 118 64 148 36 156 Z"
              fill={`url(#${id}-mid)`}
            />
            <path
              d="M36 156 C60 120 88 74 122 14"
              stroke={`url(#${id}-spine)`}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M48 140 C70 106 96 64 116 26"
              stroke={`url(#${id}-gloss)`}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>

          {/* Front slender soaring blade */}
          <g>
            <path
              d="M48 152 C50 112 70 60 112 20 C138 -6 154 4 158 6 C152 28 136 68 106 106 C78 138 54 150 48 152 Z"
              fill={`url(#${id}-bright)`}
            />
            <path
              d="M48 152 C54 150 78 138 106 106 C136 68 152 28 158 6 C166 16 164 40 144 76 C120 116 84 144 48 152 Z"
              fill={`url(#${id}-lime)`}
            />
            <path
              d="M48 152 C74 110 110 62 158 6"
              stroke={`url(#${id}-spine)`}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <path
              d="M58 138 C82 98 116 52 150 16"
              stroke={`url(#${id}-gloss)`}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path d="M84 108 C100 96 118 88 136 82" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
            <path d="M106 82 C120 72 136 64 148 58" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <path d="M68 126 C82 116 98 110 114 104" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
          </g>
        </g>
      )}

      {/* ─── VARIANT 3: Sprig with Stem (Aesthetic Organic Branch with 3 Natural Leaves) ─── */}
      {variant === "sprig-stem" && (
        <g transform="translate(12, 10)">
          {/* Main Arched Botanical Stem */}
          <path
            d="M24 166 C36 140 56 106 88 74 C114 48 138 28 150 16"
            stroke={`url(#${id}-stem)`}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          {/* Stem light ridge */}
          <path
            d="M25 165 C37 139 57 106 89 74 C115 48 139 28 149 17"
            stroke="#a7f3d0"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Leaf 1: Lower Leaf */}
          <g>
            <path d="M48 118 C44 112 42 106 42 102" stroke={`url(#${id}-stem)`} strokeWidth="2.2" strokeLinecap="round" />
            <path
              d="M44 114 C28 100 26 76 46 58 C64 42 76 48 78 50 C74 68 66 88 54 104 C48 110 45 113 44 114 Z"
              fill={`url(#${id}-deep)`}
            />
            <path
              d="M44 114 C45 113 48 110 54 104 C66 88 74 68 78 50 C86 58 84 74 72 92 C60 110 50 114 44 114 Z"
              fill={`url(#${id}-bright)`}
            />
            <path d="M44 114 C54 94 64 74 78 50" stroke={`url(#${id}-spine)`} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M48 106 C56 88 66 70 76 54" stroke={`url(#${id}-gloss)`} strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Leaf 2: Middle Leaf */}
          <g>
            <path d="M80 84 C84 80 88 76 92 74" stroke={`url(#${id}-stem)`} strokeWidth="2.2" strokeLinecap="round" />
            <path
              d="M82 82 C66 66 68 42 90 26 C106 12 118 18 120 20 C116 38 106 60 94 74 C88 80 84 82 82 82 Z"
              fill={`url(#${id}-mid)`}
            />
            <path
              d="M82 82 C84 82 88 80 94 74 C106 60 116 38 120 20 C128 28 126 44 112 64 C98 82 88 84 82 82 Z"
              fill={`url(#${id}-lime)`}
            />
            <path d="M82 82 C94 62 106 42 120 20" stroke={`url(#${id}-spine)`} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M88 74 C98 56 108 38 116 26" stroke={`url(#${id}-gloss)`} strokeWidth="2.4" strokeLinecap="round" />
            <path d="M96 64 C104 58 112 54 118 52" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          </g>

          {/* Leaf 3: Terminal Top Sunlit Leaf */}
          <g>
            <path
              d="M118 42 C110 26 116 12 134 4 C148 -2 156 4 158 6 C152 22 144 36 132 44 C126 46 120 44 118 42 Z"
              fill={`url(#${id}-mid)`}
            />
            <path
              d="M118 42 C120 44 126 46 132 44 C144 36 152 22 158 6 C164 14 160 28 148 40 C136 50 126 46 118 42 Z"
              fill={`url(#${id}-lime)`}
            />
            <path d="M118 42 C128 28 140 16 158 6" stroke={`url(#${id}-spine)`} strokeWidth="2" strokeLinecap="round" />
            <path d="M124 36 C132 24 142 14 152 8" stroke={`url(#${id}-gloss)`} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        </g>
      )}

      {/* ─── VARIANT 4: Single Gloss Blade (Bold Statement Botanical Leaf) ─── */}
      {variant === "single-gloss" && (
        <g transform="translate(10, 10)">
          {/* Main Leaf Shadow Side (Left) */}
          <path
            d="M28 152 C26 112 46 66 90 28 C122 -2 144 4 148 6 C142 30 128 72 98 110 C68 144 34 152 28 152 Z"
            fill={`url(#${id}-deep)`}
          />
          {/* Main Leaf Sunlit Side (Right) */}
          <path
            d="M28 152 C34 152 68 144 98 110 C128 72 142 30 148 6 C158 18 156 44 134 86 C106 132 60 156 28 152 Z"
            fill={`url(#${id}-bright)`}
          />
          {/* Outer leaf highlight margin */}
          <path
            d="M98 110 C128 72 142 30 148 6 C158 18 156 44 134 86 C106 132 60 156 28 152"
            stroke={`url(#${id}-lime)`}
            strokeWidth="1.2"
            opacity="0.7"
          />
          {/* Central prominent spine */}
          <path
            d="M28 152 C58 112 96 66 148 6"
            stroke={`url(#${id}-spine)`}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Primary gloss reflection band */}
          <path
            d="M38 138 C66 100 104 56 140 16"
            stroke={`url(#${id}-gloss)`}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          {/* Elegant secondary lateral veins */}
          <path d="M64 114 C78 102 98 92 118 84" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
          <path d="M86 88 C102 76 122 66 138 56" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" opacity="0.65" />
          <path d="M46 132 C58 120 74 114 92 108" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
          <path d="M108 64 C122 52 134 44 144 36" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        </g>
      )}

      {/* ─── VARIANT 5: Fanned Trio (Three Symmetrical Lush Botanical Leaves) ─── */}
      {variant === "fanned-trio" && (
        <g transform="translate(10, 10)">
          {/* Left Wing Leaf */}
          <g>
            <path
              d="M44 148 C20 126 16 92 34 62 C50 36 68 36 72 38 C70 56 64 88 52 116 C46 132 44 144 44 148 Z"
              fill={`url(#${id}-deep)`}
            />
            <path
              d="M44 148 C44 144 46 132 52 116 C64 88 70 56 72 38 C80 46 80 66 70 94 C58 124 48 142 44 148 Z"
              fill={`url(#${id}-mid)`}
            />
            <path d="M44 148 C52 114 62 76 72 38" stroke={`url(#${id}-spine)`} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M48 138 C54 108 62 74 70 44" stroke={`url(#${id}-gloss)`} strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Right Wing Leaf */}
          <g>
            <path
              d="M58 144 C58 144 80 106 112 76 C138 50 150 58 152 60 C148 76 136 104 110 128 C88 146 64 146 58 144 Z"
              fill={`url(#${id}-mid)`}
            />
            <path
              d="M58 144 C64 146 88 146 110 128 C136 104 148 76 152 60 C160 70 154 92 132 118 C108 144 78 150 58 144 Z"
              fill={`url(#${id}-bright)`}
            />
            <path d="M58 144 C82 118 116 88 152 60" stroke={`url(#${id}-spine)`} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M68 134 C92 110 122 82 146 64" stroke={`url(#${id}-gloss)`} strokeWidth="2.4" strokeLinecap="round" />
          </g>

          {/* Center Tall Blade */}
          <g>
            <path
              d="M52 148 C48 108 66 58 96 20 C118 -4 132 2 134 4 C130 24 120 64 96 102 C76 134 56 146 52 148 Z"
              fill={`url(#${id}-deep)`}
            />
            <path
              d="M52 148 C56 146 76 134 96 102 C120 64 130 24 134 4 C142 14 140 36 122 72 C102 114 74 142 52 148 Z"
              fill={`url(#${id}-lime)`}
            />
            <path d="M52 148 C72 106 100 58 134 4" stroke={`url(#${id}-spine)`} strokeWidth="2.6" strokeLinecap="round" />
            <path d="M60 134 C78 96 104 50 128 12" stroke={`url(#${id}-gloss)`} strokeWidth="3" strokeLinecap="round" />
            <path d="M80 102 C94 94 108 88 124 82" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
            <path d="M98 78 C110 68 124 62 134 54" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          </g>
        </g>
      )}

      {/* ─── VARIANT 6: Dew Blade (Sweeping Arched Leaf with Translucent Dewdrop) ─── */}
      {variant === "dew-blade" && (
        <g transform="translate(10, 10)">
          {/* Main Arched Blade Shadow Half */}
          <path
            d="M32 148 C26 110 46 68 84 32 C116 -2 136 6 140 8 C134 30 122 70 96 106 C68 140 38 148 32 148 Z"
            fill={`url(#${id}-deep)`}
          />
          {/* Main Arched Blade Sunlit Half */}
          <path
            d="M32 148 C38 148 68 140 96 106 C122 70 134 30 140 8 C148 18 148 40 128 78 C104 118 64 148 32 148 Z"
            fill={`url(#${id}-bright)`}
          />
          {/* Central spine */}
          <path
            d="M32 148 C58 108 94 62 140 8"
            stroke={`url(#${id}-spine)`}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          {/* Gloss sheen */}
          <path
            d="M44 132 C68 96 100 52 132 18"
            stroke={`url(#${id}-gloss)`}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Lateral veins */}
          <path d="M70 110 C84 98 102 90 118 82" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.55" />
          <path d="M90 84 C106 72 120 64 132 56" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

          {/* Small Companion Sprout */}
          <g>
            <path
              d="M26 154 C18 138 22 120 38 106 C50 94 62 98 64 100 C60 114 52 130 44 144 C34 152 28 154 26 154 Z"
              fill={`url(#${id}-mid)`}
            />
            <path
              d="M26 154 C28 154 34 152 44 144 C52 130 60 114 64 100 C70 108 66 122 56 136 C44 150 32 154 26 154 Z"
              fill={`url(#${id}-lime)`}
            />
            <path d="M26 154 C36 136 46 118 64 100" stroke={`url(#${id}-spine)`} strokeWidth="1.6" strokeLinecap="round" />
          </g>

          {/* Realistic Translucent Dew Drop on Leaf Apex */}
          <g transform="translate(114, 38)">
            <ellipse cx="6" cy="7" rx="5.5" ry="3.5" fill="#01241a" opacity="0.35" />
            <circle cx="5" cy="5" r="5" fill="#d1fae5" opacity="0.75" />
            <circle cx="5" cy="5" r="4.5" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.9" />
            <circle cx="3.6" cy="3.4" r="1.6" fill="#ffffff" />
            <circle cx="6.4" cy="6.4" r="0.8" fill="#ffffff" opacity="0.7" />
          </g>
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
