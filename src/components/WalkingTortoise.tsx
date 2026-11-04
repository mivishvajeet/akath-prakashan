import React, { useState } from 'react';
import { useLanguage } from '../i18n/translations';

interface WalkingTortoiseProps {
  className?: string;
}

/**
 * Akath Patient Tortoise Traverse — Subtle Bottom-of-Page CSS Horizon Animation
 *
 * A refined, slow-moving CSS-based horizontal 'traverse' animation
 * that subtly cycles along an archival margin rule at the bottom of the About page
 * without distracting from the reading experience:
 * - GPU-composited CSS keyframes (`akath-patient-traverse` + `akath-patient-turn`)
 *   using container query units (`100cqw`) move the Heritage Forest (#174D3A) tortoise
 *   smoothly across mobile (320px–430px), tablet (768px), and desktop viewports.
 * - A miniature open Smyth-sewn manuscript rests atop its hexagonal woodcut carapace,
 *   with softly breathing pages and alternating slow leg strides.
 * - Includes an explicit Pause/Walk toggle for touch devices and pointer-fine hover pause.
 * - Full `prefers-reduced-motion: reduce` support centers the tortoise in a calm static pose.
 */
export const WalkingTortoise: React.FC<WalkingTortoiseProps> = ({
  className = '',
}) => {
  const { lang } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);

  const stations =
    lang === 'mr'
      ? ['हस्तलिखित', 'संपादन', 'अक्षरजुळणी', 'वाचक संवाद']
      : ['MANUSCRIPT', 'EDITING', 'PRESSWORK', 'READER'];

  return (
    <div
      data-testid="about-walking-tortoise"
      aria-label={
        lang === 'mr'
          ? 'अकथ प्रकाशन संपादकीय कासव भ्रमण — संथ पावले, सखोल अक्षरे, चिरंतन ग्रंथ'
          : 'Akath Prakashan Patient Tortoise Traverse — Slow Steps, Deep Letters, Enduring Books'
      }
      className={`akath-patient-traverse-stage ${
        isPaused ? 'is-paused' : ''
      } relative w-full max-w-[960px] mx-auto pt-3 pb-1 select-none overflow-hidden ${className}`}
    >
      {/* Top Margin Header with Mobile-Friendly Pause/Walk Control */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1 text-[10px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#5A5F72]">
        <span className="text-[#174D3A] font-semibold truncate">
          {lang === 'mr'
            ? 'संथ पावले · सखोल अक्षरे · चिरंतन ग्रंथ'
            : 'PATIENT TORTOISE TRAVERSE · ONE BOOK AT A TIME'}
        </span>

        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[#5A5F72] hidden min-[380px]:inline">
            {lang === 'mr' ? 'नांदेड, महाराष्ट्र' : 'NANDED, MAHARASHTRA'}
          </span>
          <button
            type="button"
            data-testid="about-tortoise-play-toggle"
            aria-pressed={isPaused}
            onClick={() => setIsPaused((prev) => !prev)}
            className="px-2 py-0.5 border-b border-[#243B8A]/40 hover:border-[#243B8A] text-[9.5px] font-mono font-semibold text-[#243B8A] transition-colors cursor-pointer whitespace-nowrap"
          >
            {isPaused
              ? lang === 'mr'
                ? '▶ चालवा'
                : '▶ Walk'
              : lang === 'mr'
              ? '❚❚ थांबवा'
              : '❚❚ Pause'}
          </button>
        </div>
      </div>

      {/* Horizontal Marginalia Traverse Track (Container Query Enabled for Mobile/Tablet/Desktop) */}
      <div
        data-testid="about-tortoise-colophon-seal"
        className="akath-patient-traverse-track relative w-full h-[72px] sm:h-[74px] border-y border-[#E6DFCE] bg-[#F7F3E8]/30 px-3 sm:px-4 overflow-hidden flex flex-col justify-end"
      >
        {/* Editorial Waypoints along the Margin — Visible on Mobile, Tablet & Desktop */}
        <div
          aria-hidden="true"
          className="absolute inset-x-3 sm:inset-x-6 top-2 flex items-center justify-between pointer-events-none"
        >
          {stations.map((station, idx) => (
            <span
              key={station}
              className="inline-flex items-center gap-1 font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#5A5F72]/85"
            >
              <span
                className="w-1 h-1 rounded-full bg-[#174D3A]/60 akath-traverse-footstep shrink-0"
                style={{ animationDelay: `${idx * 0.9}s` }}
              />
              <span>{station}</span>
            </span>
          ))}
        </div>

        {/* Faint Archival Footstep Trail Dots along the Horizon */}
        <div
          data-testid="about-tortoise-traverse-track"
          aria-hidden="true"
          className="relative w-full pb-2.5"
        >
          <div className="flex items-center justify-between px-4 sm:px-8 mb-1 opacity-60">
            {Array.from({ length: 9 }).map((_, idx) => (
              <span
                key={idx}
                className="w-1 h-1 rounded-full bg-[#C89D54] akath-traverse-footstep"
                style={{ animationDelay: `${idx * 0.4}s` }}
              />
            ))}
          </div>

          {/* Primary Archival Horizon Hairline */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#174D3A]/50 to-transparent akath-traverse-horizon-line" />
        </div>

        {/* Slow-Cycling Patient Tortoise Runner (GPU-accelerated cqw traverse) */}
        <div
          data-testid="about-tortoise-traverse-runner"
          className="akath-patient-tortoise-runner pointer-events-none"
          aria-hidden="true"
        >
          <div className="akath-patient-tortoise-flip">
            <svg
              viewBox="0 0 112 58"
              className="w-[84px] h-[44px] overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="akathColophonShellGrad"
                  x1="22"
                  y1="16"
                  x2="78"
                  y2="46"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#1F634B" />
                  <stop offset="55%" stopColor="#174D3A" />
                  <stop offset="100%" stopColor="#103829" />
                </linearGradient>
              </defs>

              {/* Soft Ground Shadow */}
              <ellipse
                cx="52"
                cy="51"
                rx="30"
                ry="2.6"
                fill="#243B8A"
                fillOpacity="0.12"
              />

              {/* Subtle Rising Devanagari Akshara Motes ("अ · क · थ") */}
              <g className="akath-colophon-glyph-a">
                <text
                  x="34"
                  y="11"
                  textAnchor="middle"
                  fill="#243B8A"
                  fillOpacity="0.75"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="Noto Serif Devanagari, serif"
                >
                  अ
                </text>
              </g>
              <g className="akath-colophon-glyph-b">
                <text
                  x="50"
                  y="8"
                  textAnchor="middle"
                  fill="#174D3A"
                  fillOpacity="0.85"
                  fontSize="8"
                  fontWeight="700"
                  fontFamily="Noto Serif Devanagari, serif"
                >
                  क
                </text>
              </g>
              <g className="akath-colophon-glyph-c">
                <text
                  x="66"
                  y="11"
                  textAnchor="middle"
                  fill="#EF6855"
                  fillOpacity="0.8"
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily="Noto Serif Devanagari, serif"
                >
                  थ
                </text>
              </g>

              {/* Miniature Open Smyth-Sewn Book Resting Atop the Shell */}
              <g>
                <g className="akath-colophon-page-left">
                  <path
                    d="M50 20 C42 16 33 16 26 19 L28 13 C35 10 43 11 50 15 Z"
                    fill="#FFFDF7"
                    stroke="#243B8A"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                </g>
                <g className="akath-colophon-page-right">
                  <path
                    d="M50 20 C58 16 67 16 74 19 L72 13 C65 10 57 11 50 15 Z"
                    fill="#FFFDF7"
                    stroke="#243B8A"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                </g>
                <line
                  x1="50"
                  y1="14"
                  x2="50"
                  y2="21"
                  stroke="#EF6855"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </g>

              {/* Walking Tortoise Body, Alternating Stride Legs & Carapace */}
              <g className="akath-walking-tortoise-body">
                {/* Tail */}
                <path
                  d="M22 41 C17 41 13 43 11 45 C15 45.5 19 44 23 43 Z"
                  fill="#8C7355"
                  stroke="#252832"
                  strokeWidth="1.1"
                />

                {/* Back Leg B & Front Leg B (Far-side stride pair) */}
                <g className="akath-walking-tortoise-leg-b">
                  <path
                    d="M31 42 L29 50 L35 50 L36 42 Z"
                    fill="#856D4F"
                    stroke="#252832"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M66 42 L65 50 L71 50 L71 42 Z"
                    fill="#856D4F"
                    stroke="#252832"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Back Leg A & Front Leg A (Near-side stride pair) */}
                <g className="akath-walking-tortoise-leg-a">
                  <path
                    d="M25 42 L23 50.5 L30 50.5 L31 42 Z"
                    fill="#9C8262"
                    stroke="#252832"
                    strokeWidth="1.15"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M60 42 L59 50.5 L66 50.5 L66 42 Z"
                    fill="#9C8262"
                    stroke="#252832"
                    strokeWidth="1.15"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Gentle Observant Head & Neck */}
                <g className="akath-walking-tortoise-head">
                  <path
                    d="M74 38 C80 37 85 33 90 32 C95 31 99 33 99 37 C99 41 94 43 88 43 C83 43 78 42 74 41 Z"
                    fill="#9C8262"
                    stroke="#252832"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <circle cx="93" cy="35.5" r="1.35" fill="#252832" />
                  <circle cx="93.4" cy="35.1" r="0.45" fill="#FFFDF7" />
                </g>

                {/* Heritage Forest (#174D3A) Woodcut Dome Carapace */}
                <g className="akath-colophon-shell-pulse">
                  <path
                    d="M21 41 C21 24 34 17 50 17 C66 17 78 25 79 41 Z"
                    fill="url(#akathColophonShellGrad)"
                    stroke="#252832"
                    strokeWidth="1.35"
                    strokeLinejoin="round"
                  />
                  {/* Golden Scute Seams */}
                  <path
                    d="M31 40 L37 27 L50 23 L63 27 L69 40"
                    stroke="#FFD966"
                    strokeOpacity="0.65"
                    strokeWidth="1.05"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="50"
                    y1="18"
                    x2="50"
                    y2="40"
                    stroke="#FFD966"
                    strokeOpacity="0.48"
                    strokeWidth="1"
                    strokeDasharray="1.8 1.8"
                  />
                  {/* Warm Rim Band */}
                  <path
                    d="M19 40.5 C35 38 65 38 81 40.5 C81 43 78 44 74 44 L26 44 C22 44 19 43 19 40.5 Z"
                    fill="#C89D54"
                    stroke="#252832"
                    strokeWidth="1.15"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkingTortoise;
