import React from 'react';
import { useLanguage } from '../i18n/translations';

interface WalkingTortoiseProps {
  className?: string;
}

/**
 * Akath Archival Colophon Medallion — Researched Literary Printer's Mark Animation
 *
 * Replaces the previous horizontal ground-track walking tortoise with a bespoke,
 * woodcut-inspired Literary Printer's Seal ("Festina Lente / संथ पावले · सखोल अक्षरे"):
 * - An open Smyth-sewn archival volume whose left and right pages gently breathe open.
 * - The Heritage Forest (#174D3A) tortoise emblem resting atop the open manuscript
 *   with a breathing hexagonal carapace and gentle observant head motion.
 * - A slow-revolving astronomical & literary astrolabe ring encircling the seal.
 * - Rising golden Devanagari akshara ink-sparks ("अ", "क", "थ") ascending from the pages.
 * - Full `prefers-reduced-motion: reduce` support for a calm static colophon impression.
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
          ? 'अकथ प्रकाशन संपादकीय कासव मुद्रा — संथ पावले, सखोल अक्षरे, चिरंतन ग्रंथ'
          : 'Akath Prakashan Archival Tortoise Colophon Seal — Patient Craft, Enduring Books'
      }
      className={`akath-colophon-stage relative w-full max-w-[540px] mx-auto pt-10 pb-4 select-none overflow-hidden ${className}`}
    >
      {/* Top Hairline Ornamental Rule with Cardinal Diamond */}
      <div
        aria-hidden="true"
        className="flex items-center justify-center gap-3 mb-7"
      >
        <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent via-[#174D3A]/35 to-[#174D3A]/60" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#174D3A] font-semibold">
          {lang === 'mr' ? 'अकथ ग्रंथ-मुद्रा' : 'IMPRINT COLOPHON SEAL'}
        </span>
        <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent via-[#174D3A]/35 to-[#174D3A]/60" />
      </div>

      {/* Central Researched Woodcut & Astrolabe Colophon Medallion */}
      <div
        data-testid="about-tortoise-colophon-seal"
        className="relative flex flex-col items-center justify-center"
      >
        <svg
          viewBox="0 0 260 220"
          className="w-[210px] sm:w-[240px] h-auto overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <radialGradient
              id="akathColophonAura"
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="0%" stopColor="#FFD966" stopOpacity="0.34" />
              <stop offset="62%" stopColor="#F7F3E8" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#FFFDF7" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="akathColophonShellGrad"
              x1="88"
              y1="72"
              x2="172"
              y2="132"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#1F634B" />
              <stop offset="55%" stopColor="#174D3A" />
              <stop offset="100%" stopColor="#103829" />
            </linearGradient>
          </defs>

          {/* Soft Breathing Archival Gold Aura */}
          <circle
            cx="130"
            cy="112"
            r="88"
            fill="url(#akathColophonAura)"
            className="akath-colophon-aura"
          />

          {/* Outer Stationary Double-Line Imprint Ring */}
          <circle
            cx="130"
            cy="112"
            r="82"
            stroke="#243B8A"
            strokeOpacity="0.22"
            strokeWidth="1"
          />
          <circle
            cx="130"
            cy="112"
            r="76"
            stroke="#174D3A"
            strokeOpacity="0.18"
            strokeWidth="0.9"
          />

          {/* Slow-Revolving Literary Astrolabe & Compass Ring */}
          <g className="akath-colophon-orbit-ring">
            <circle
              cx="130"
              cy="112"
              r="70"
              stroke="#243B8A"
              strokeOpacity="0.38"
              strokeWidth="1.2"
              strokeDasharray="4 6"
            />
            {/* North-South-East-West Literary Star Nodes */}
            <path
              d="M130 38 L132.5 42 L130 46 L127.5 42 Z"
              fill="#EF6855"
            />
            <path
              d="M130 178 L132.5 182 L130 186 L127.5 182 Z"
              fill="#174D3A"
            />
            <circle cx="56" cy="112" r="2.5" fill="#FFD966" stroke="#243B8A" strokeWidth="1" />
            <circle cx="204" cy="112" r="2.5" fill="#FFD966" stroke="#243B8A" strokeWidth="1" />
          </g>

          {/* Rising Devanagari Akshara Ink-Sparks ("अ", "क", "थ") */}
          <g className="akath-colophon-glyph-a">
            <circle cx="92" cy="64" r="9" fill="#FFFDF7" stroke="#E6DFCE" strokeWidth="1" />
            <text
              x="92"
              y="68"
              textAnchor="middle"
              fill="#243B8A"
              fontSize="11"
              fontWeight="700"
              fontFamily="Noto Serif Devanagari, serif"
            >
              अ
            </text>
          </g>

          <g className="akath-colophon-glyph-b">
            <circle cx="130" cy="52" r="10" fill="#FFD966" fillOpacity="0.45" stroke="#243B8A" strokeWidth="1" />
            <text
              x="130"
              y="56"
              textAnchor="middle"
              fill="#174D3A"
              fontSize="11.5"
              fontWeight="700"
              fontFamily="Noto Serif Devanagari, serif"
            >
              क
            </text>
          </g>

          <g className="akath-colophon-glyph-c">
            <circle cx="168" cy="64" r="9" fill="#FFFDF7" stroke="#E6DFCE" strokeWidth="1" />
            <text
              x="168"
              y="68"
              textAnchor="middle"
              fill="#243B8A"
              fontSize="11"
              fontWeight="700"
              fontFamily="Noto Serif Devanagari, serif"
            >
              थ
            </text>
          </g>

          {/* ===============================================================
              OPEN ARCHIVAL SMYTH-SEWN BOOK PEDESTAL (BREATHING PAGES)
              =============================================================== */}
          <g>
            {/* Book Cover Base Shadow */}
            <path
              d="M68 154 C92 146 112 149 130 156 C148 149 168 146 192 154"
              stroke="#243B8A"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M74 160 C95 153 113 155 130 161 C147 155 165 153 186 160"
              stroke="#EF6855"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Left Breathing Manuscript Page */}
            <g className="akath-colophon-page-left">
              <path
                d="M130 152 C112 143 90 141 70 148 L74 128 C94 122 114 125 130 135 Z"
                fill="#FFFDF7"
                stroke="#243B8A"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M82 135 Q104 131 122 139"
                stroke="#174D3A"
                strokeOpacity="0.55"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M80 141 Q102 137 120 145"
                stroke="#243B8A"
                strokeOpacity="0.4"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </g>

            {/* Right Breathing Manuscript Page */}
            <g className="akath-colophon-page-right">
              <path
                d="M130 152 C148 143 170 141 190 148 L186 128 C166 122 146 125 130 135 Z"
                fill="#FFFDF7"
                stroke="#243B8A"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M178 135 Q156 131 138 139"
                stroke="#174D3A"
                strokeOpacity="0.55"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M180 141 Q158 137 140 145"
                stroke="#243B8A"
                strokeOpacity="0.4"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </g>

            {/* Central Sewn Binding Spine & Tassel */}
            <line
              x1="130"
              y1="133"
              x2="130"
              y2="163"
              stroke="#EF6855"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="130" cy="165" r="2.5" fill="#FFD966" stroke="#243B8A" strokeWidth="1" />
          </g>

          {/* ===============================================================
              HERITAGE FOREST TORTOISE SEAL ATOP THE OPEN MANUSCRIPT
              =============================================================== */}
          <g className="akath-colophon-tortoise-body">
            {/* Tail */}
            <path
              d="M88 116 C81 116 76 119 73 122 C78 123 84 121 89 119 Z"
              fill="#8C7355"
              stroke="#252832"
              strokeWidth="1.3"
            />

            {/* Sturdy Pillars (Legs resting on the manuscript) */}
            <path
              d="M96 118 C94 124 94 128 97 130 L105 130 C106 127 105 122 103 118 Z"
              fill="#9C8262"
              stroke="#252832"
              strokeWidth="1.4"
            />
            <path
              d="M151 118 C150 123 151 127 154 130 L162 130 C164 127 163 122 159 118 Z"
              fill="#9C8262"
              stroke="#252832"
              strokeWidth="1.4"
            />

            {/* Gentle Observant Head & Neck */}
            <g className="akath-colophon-head-nod">
              <path
                d="M162 112 C169 111 175 106 181 104 C187 102 192 105 192 110 C192 116 186 119 179 119 C173 119 167 118 162 117 Z"
                fill="#9C8262"
                stroke="#252832"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="184" cy="108.5" r="1.8" fill="#252832" />
              <circle cx="184.5" cy="108" r="0.6" fill="#FFFDF7" />
              <path
                d="M182 114 Q186 115 189 113.5"
                stroke="#252832"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </g>

            {/* Archival Forest-Green Dome Carapace (#174D3A) */}
            <g className="akath-colophon-shell-pulse">
              <path
                d="M86 116 C86 87 105 73 128 73 C151 73 168 88 169 116 Z"
                fill="url(#akathColophonShellGrad)"
                stroke="#252832"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />

              {/* Woodcut Scute Geometry & Golden Literary Spine Seam */}
              <path
                d="M101 114 L109 92 L127 86 L146 92 L154 114"
                stroke="#FFD966"
                strokeOpacity="0.6"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <path
                d="M115 90 L127 77 L140 90"
                stroke="#FFD966"
                strokeOpacity="0.5"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <line
                x1="127"
                y1="74"
                x2="127"
                y2="114"
                stroke="#FFD966"
                strokeOpacity="0.45"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />

              {/* Warm Rim Band along Bottom of Carapace */}
              <path
                d="M84 115 C106 111 149 111 171 115 C171 119 167 121 161 121 L94 121 C88 121 84 119 84 115 Z"
                fill="#C89D54"
                stroke="#252832"
                strokeWidth="1.4"
              />
            </g>
          </g>
        </svg>

        {/* Subtle Bilingual Printer's Mark Caption */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11.5px] font-mono text-[#5A5F72] tracking-wider">
          <span className="font-semibold text-[#174D3A]">
            {lang === 'mr'
              ? 'संथ पावले · सखोल अक्षरे · चिरंतन ग्रंथ'
              : 'SLOW STEPS · DEEP LETTERS · ENDURING BOOKS'}
          </span>
          <span aria-hidden="true" className="text-[#E6DFCE]">
            •
          </span>
          <span className="text-[#243B8A]">
            {lang === 'mr' ? 'नांदेड व पुणे' : 'NANDED & PUNE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WalkingTortoise;
