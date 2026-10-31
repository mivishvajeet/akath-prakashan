import React from 'react';
import { useLanguage } from '../i18n/translations';

interface WalkingTortoiseProps {
  className?: string;
}

/**
 * WalkingTortoise — Literary colophon & closing animation for the About section.
 *
 * Pure inline SVG + CSS keyframe animation (zero JS animation loops, zero continuous state).
 * Features Akath Prakashan's signature tortoise mascot with a muted forest-green shell
 * (#174D3A / #2E5A44), dual counter-rotating spiral motif, and warm earthy body tones
 * (#8C5E3C / #A47551) walking unhurriedly across a delicate archival ground line.
 * Automatically pauses in a calm centered position when `prefers-reduced-motion: reduce` is active.
 */
export const WalkingTortoise: React.FC<WalkingTortoiseProps> = ({
  className = '',
}) => {
  const { lang } = useLanguage();

  return (
    <div
      data-testid="about-walking-tortoise"
      aria-label={
        lang === 'mr'
          ? 'अकथ प्रकाशन कासव बोधचिन्ह — संथ आणि सखोल साहित्यिक वाटचाल'
          : 'Akath Prakashan tortoise colophon — unhurried literary craft'
      }
      role="img"
      className={`akath-walking-tortoise-stage relative w-full max-w-[460px] mx-auto pt-6 pb-3 overflow-hidden select-none ${className}`}
    >
      {/* Traveling Tortoise Carrier (Left -> Pause -> Smooth Turn -> Right) */}
      <div className="akath-walking-tortoise-track relative w-full h-[68px] sm:h-[78px] flex items-end">
        <div
          data-testid="walking-tortoise-traveler"
          className="akath-walking-tortoise-traveler relative z-10 w-[94px] sm:w-[116px] h-[54px] sm:h-[66px]"
        >
          <div className="akath-walking-tortoise-turner w-full h-full">
            <svg
              viewBox="0 0 128 74"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full overflow-visible"
              aria-hidden="true"
            >
              {/* Soft ground shadow beneath the tortoise */}
              <ellipse
                cx="62"
                cy="66"
                rx="38"
                ry="3.2"
                fill="#252832"
                fillOpacity="0.1"
              />

              {/* Back Pair of Legs (Warm Earthy Umber #7A5032 — slightly deeper for depth) */}
              <g className="akath-walking-tortoise-leg-b">
                {/* Back-left far leg */}
                <path
                  d="M37 51 C35 57, 34 62, 36 65 C38 66, 42 66, 43 64 C44 60, 44 55, 43 51 Z"
                  fill="#7A5032"
                  stroke="#4E321E"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Front-right far leg */}
                <path
                  d="M78 51 C79 57, 81 62, 83 65 C85 66, 89 65, 89 63 C89 59, 86 54, 84 50 Z"
                  fill="#7A5032"
                  stroke="#4E321E"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Front Pair of Legs (Warm Terracotta Earth #9B6B47) */}
              <g className="akath-walking-tortoise-leg-a">
                {/* Back-left near leg */}
                <path
                  d="M29 50 C26 56, 25 62, 27 65 C29 66.5, 34 66.5, 35 64 C36 60, 36 54, 35 50 Z"
                  fill="#9B6B47"
                  stroke="#4E321E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M27.5 64.5 H33.5"
                  stroke="#D9B36C"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                {/* Front-right near leg */}
                <path
                  d="M70 51 C71 57, 73 63, 75 65.5 C77.5 66.5, 82 66, 82 63.5 C82 59, 79 54, 77 50 Z"
                  fill="#9B6B47"
                  stroke="#4E321E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M75.5 64.5 H80.5"
                  stroke="#D9B36C"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>

              {/* Main Body, Tail, Head & Forest-Green Literary Shell (Subtle Bounce) */}
              <g className="akath-walking-tortoise-body">
                {/* Small hand-drawn tail */}
                <path
                  d="M21 48 C15 48, 12 50, 10 52 C13 53, 17 52.5, 22 51 Z"
                  fill="#8C5E3C"
                  stroke="#4E321E"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Gentle Head & Neck with Literary Poise */}
                <g className="akath-walking-tortoise-head">
                  <path
                    d="M88 46 C94 45, 99 40, 104 38 C110 36, 116 38.5, 117 43.5 C118 48.5, 112 52, 105 52 C98 52, 93 51, 87 51 Z"
                    fill="#9B6B47"
                    stroke="#4E321E"
                    strokeWidth="1.55"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Subtle neck fold */}
                  <path
                    d="M93 46.5 C95 48.5, 95 50, 93.5 51"
                    stroke="#6B4428"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                  {/* Calm, observant eye */}
                  <circle cx="109.5" cy="42.5" r="1.7" fill="#252832" />
                  <circle cx="110.1" cy="42" r="0.55" fill="#FFFDF7" />
                  {/* Gentle smile line */}
                  <path
                    d="M111 47.2 C113 47.4, 114.8 46.8, 115.8 45.8"
                    stroke="#4E321E"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </g>

                {/* Muted Heritage Forest-Green Dome Shell (#174D3A & #2E5A44) */}
                <path
                  d="M20 50 C20 26, 38 15, 56 15 C75 15, 91 27, 92 49 C74 52, 38 52, 20 50 Z"
                  fill="#174D3A"
                  stroke="#103829"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Inner Archival Shell Plate Highlight */}
                <path
                  d="M25 46.5 C26 28.5, 40 19.5, 56 19.5 C72 19.5, 85 29, 87 46.5"
                  fill="#23634B"
                  fillOpacity="0.65"
                  stroke="#D9B36C"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                  strokeDasharray="180 4"
                />

                {/* Signature Akath Dual Counter-Rotating Spiral Motif on Shell */}
                {/* Left Spiral */}
                <path
                  d="M44 34 C44 30.8, 47 28.8, 49.8 30.5 C52.2 32, 51.5 36.2, 48.2 37.5 C44 39, 39.5 35.5, 40.5 30.5 C41.5 25.5, 47.5 23.5, 52.5 26"
                  stroke="#FFD966"
                  strokeWidth="1.45"
                  strokeLinecap="round"
                />
                {/* Right Counter-Spiral */}
                <path
                  d="M68 34 C68 30.8, 65 28.8, 62.2 30.5 C59.8 32, 60.5 36.2, 63.8 37.5 C68 39, 72.5 35.5, 71.5 30.5 C70.5 25.5, 64.5 23.5, 59.5 26"
                  stroke="#FFD966"
                  strokeWidth="1.45"
                  strokeLinecap="round"
                />
                {/* Central Spine Link Between Spirals */}
                <path
                  d="M52.5 26 C55 27.5, 57 27.5, 59.5 26"
                  stroke="#FFD966"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                />

                {/* Warm Earthy Shell Rim Band (Colophon Base) */}
                <path
                  d="M18.5 49.5 C38 52.5, 74 52.5, 93.5 49.2 C94.2 51.5, 92.5 53.2, 89.5 53.5 C71 55.2, 39 55.2, 21.5 53.2 C18.8 52.8, 17.8 51.2, 18.5 49.5 Z"
                  fill="#B88655"
                  stroke="#4E321E"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Rim Scute Dividers */}
                <path
                  d="M31 50.8 V53.8 M44 51.4 V54.4 M57 51.5 V54.5 M70 51.3 V54.2 M82 50.6 V53.5"
                  stroke="#4E321E"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Subtle Literary Ground Line with Tiny Botanical / Colophon Marks */}
      <div className="relative w-full flex items-center justify-center -mt-1.5">
        <svg
          viewBox="0 0 460 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-3 text-[#243B8A]/35"
          aria-hidden="true"
        >
          {/* Hand-drawn slightly imperfect ground path */}
          <path
            d="M8 6.5 C95 5.2, 180 7.4, 265 6.1 C340 5.1, 405 7.1, 452 6.2"
            stroke="#8C5E3C"
            strokeOpacity="0.45"
            strokeWidth="1.35"
            strokeLinecap="round"
          />
          <path
            d="M42 9.5 H96 M210 9.8 H275 M355 9.4 H402"
            stroke="#174D3A"
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Small diamond colophon stops at left and right */}
          <circle cx="10" cy="6.5" r="2" fill="#174D3A" fillOpacity="0.4" />
          <circle cx="450" cy="6.2" r="2" fill="#174D3A" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
};
