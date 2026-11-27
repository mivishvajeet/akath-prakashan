import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CapabilitySpecimenPlateProps {
  activeIndex: number;
  isMr: boolean;
  title: string;
  deliverable: string;
  description?: string;
  onSelectIndex?: (idx: number) => void;
}

/**
 * Interactive Frosted Atelier Specimen Showcase for "01 · WHAT WE DO"
 * Renders crisp architectural/editorial SVG scenes alongside the active editorial
 * narrative inside a cohesive frosted-glass landscape showcase.
 */
export const CapabilitySpecimenPlate: React.FC<CapabilitySpecimenPlateProps> = React.memo(({
  activeIndex,
  isMr,
  title,
  deliverable,
  description,
  onSelectIndex,
}) => {
  const plateNumbers = ['FIG. 01.1', 'FIG. 01.2', 'FIG. 01.3', 'FIG. 01.4'];
  const plateNumber = plateNumbers[activeIndex] || 'FIG. 01.1';
  const progressPercent = ((activeIndex + 1) / 4) * 100;

  return (
    <div className="relative w-full flex flex-col justify-between rounded-3xl bg-white/96 border border-[#DCD4C0]/85 shadow-[0_24px_64px_-26px_rgba(36,59,138,0.2)] px-4 py-4 sm:px-7 sm:py-6 overflow-hidden">
      {/* Subtle Concentric Blueprint Halo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 w-72 h-72 rounded-full border border-[#243B8A]/12"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-14 w-52 h-52 rounded-full border border-dashed border-[#C89D54]/28"
      />

      {/* Smooth Stage Progress Track */}
      <div className="w-full h-[2px] rounded-full bg-[#E5DEC9]/70 overflow-hidden mb-3.5">
        <div
          className="h-full bg-gradient-to-r from-[#243B8A] via-[#EF6855] to-[#C89D54] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Plate Caption Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 pb-3 border-b border-[#E5DEC9]/80 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#57534E]">
        <span className="font-semibold text-[#243B8A] tabular-nums shrink-0">
          {plateNumber} · {isMr ? 'संहिता व निर्मिती' : 'CRAFT SPECIMEN'}
        </span>
        <span className="text-[#174D3A] font-medium truncate">
          {deliverable}
        </span>
      </div>

      {/* Unified Landscape Showcase: Editorial Narrative (Left on lg+) + Animated Craft Plate (Right on lg+) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-5 lg:gap-8 py-4 sm:py-5">
        {description && (
          <div className="lg:col-span-5 text-center lg:text-left space-y-2.5 lg:pr-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#243B8A] font-semibold">
              0{activeIndex + 1} · {deliverable}
            </p>
            <h3 className="text-xl sm:text-2xl lg:text-[26px] font-serif not-italic font-medium text-[#1C1917] leading-snug">
              {title}
            </h3>
            <p className="text-sm sm:text-[15px] text-[#525665] leading-relaxed max-w-[42ch] mx-auto lg:mx-0">
              {description}
            </p>
          </div>
        )}

        <div
          className={`${
            description ? 'lg:col-span-7' : 'lg:col-span-12'
          } min-h-[195px] sm:min-h-[240px] lg:min-h-[260px] flex items-center justify-center`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`specimen-plate-${activeIndex}`}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[360px] flex items-center justify-center"
            >
              {activeIndex === 0 && (
                /* 01: MANUSCRIPT DEVELOPMENT — Fountain Nib, Layered Sheets & Chapter Arc */
              <svg
                viewBox="0 0 420 280"
                fill="none"
                className="w-full h-auto"
                aria-label="Manuscript development architectural illustration"
              >
                {/* Faint Architectural Radial Halo */}
                <circle
                  cx="210"
                  cy="140"
                  r="116"
                  stroke="#C89D54"
                  strokeOpacity="0.32"
                  strokeDasharray="3 5"
                />
                {/* Back Loose Sheet */}
                <rect
                  x="88"
                  y="38"
                  width="186"
                  height="214"
                  transform="rotate(-4 88 38)"
                  fill="#F7F3E8"
                  stroke="#DCD4C0"
                  strokeWidth="1.3"
                />
                {/* Primary Manuscript Sheet */}
                <rect
                  x="108"
                  y="28"
                  width="196"
                  height="220"
                  fill="#FFFDF7"
                  stroke="#243B8A"
                  strokeWidth="1.5"
                />
                {/* Margin Red Rule */}
                <line
                  x1="138"
                  y1="28"
                  x2="138"
                  y2="248"
                  stroke="#EF6855"
                  strokeOpacity="0.55"
                  strokeWidth="1.1"
                />
                {/* Chapter Header Specimen */}
                <text
                  x="154"
                  y="62"
                  fill="#243B8A"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="700"
                  letterSpacing="2"
                >
                  CHAPTER I · DRAFT
                </text>
                <line
                  x1="154"
                  y1="72"
                  x2="282"
                  y2="72"
                  stroke="#C89D54"
                  strokeWidth="1.5"
                />
                {/* Prose Lines & Structural Brackets */}
                <line x1="154" y1="92" x2="276" y2="92" stroke="#1C1917" strokeOpacity="0.72" strokeWidth="1.6" />
                <line x1="154" y1="108" x2="262" y2="108" stroke="#1C1917" strokeOpacity="0.5" strokeWidth="1.4" />
                <line x1="154" y1="124" x2="270" y2="124" stroke="#1C1917" strokeOpacity="0.5" strokeWidth="1.4" />
                <line x1="154" y1="146" x2="248" y2="146" stroke="#174D3A" strokeWidth="1.6" />
                <line x1="154" y1="162" x2="272" y2="162" stroke="#1C1917" strokeOpacity="0.45" strokeWidth="1.4" />
                <line x1="154" y1="178" x2="236" y2="178" stroke="#1C1917" strokeOpacity="0.45" strokeWidth="1.4" />

                {/* Devanagari Akshara Drop Cap on Margin */}
                <text
                  x="123"
                  y="108"
                  textAnchor="middle"
                  fill="#EF6855"
                  fontSize="18"
                  fontFamily="Noto Serif Devanagari, serif"
                  fontWeight="700"
                >
                  अ
                </text>

                {/* Brass Fountain Nib Gliding Diagonal */}
                <g transform="translate(268, 128) rotate(32)">
                  <path
                    d="M22 0 L44 52 L32 82 L12 82 L0 52 Z"
                    fill="#FFD966"
                    stroke="#1C1917"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <line x1="22" y1="0" x2="22" y2="44" stroke="#1C1917" strokeWidth="1.4" />
                  <circle cx="22" cy="46" r="3.2" fill="#243B8A" />
                  <rect x="8" y="82" width="28" height="44" fill="#243B8A" stroke="#1C1917" strokeWidth="1.5" />
                </g>

                {/* Structural Story Arc Curve Below */}
                <path
                  d="M46 218 Q 108 164 178 212"
                  stroke="#174D3A"
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />
                <circle cx="46" cy="218" r="4" fill="#EF6855" />
                <circle cx="178" cy="212" r="4" fill="#174D3A" />
              </svg>
            )}

            {activeIndex === 1 && (
              /* 02: EDITING & PROOFREADING — Galley Proof Sheet, Red-Pen Corrections & Loupe */
              <svg
                viewBox="0 0 420 280"
                fill="none"
                className="w-full h-auto"
                aria-label="Editing and proofreading specimen illustration"
              >
                <circle
                  cx="210"
                  cy="140"
                  r="116"
                  stroke="#EF6855"
                  strokeOpacity="0.24"
                  strokeDasharray="3 5"
                />
                {/* Galley Sheet */}
                <rect
                  x="76"
                  y="32"
                  width="244"
                  height="216"
                  fill="#FFFDF7"
                  stroke="#1C1917"
                  strokeWidth="1.5"
                />
                {/* Galley Top Rule */}
                <text
                  x="96"
                  y="58"
                  fill="#174D3A"
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="700"
                  letterSpacing="1.8"
                >
                  GALLEY PROOF · PASS 03
                </text>
                <line x1="96" y1="68" x2="300" y2="68" stroke="#DCD4C0" strokeWidth="1.2" />

                {/* Text Lines with Proofreading Annotations */}
                <line x1="96" y1="92" x2="262" y2="92" stroke="#1C1917" strokeWidth="1.7" />
                {/* Red strikethrough + caret */}
                <line x1="168" y1="92" x2="216" y2="92" stroke="#EF6855" strokeWidth="2.4" />
                <path d="M192 80 L186 70 L198 70 Z" fill="#EF6855" />

                <line x1="96" y1="120" x2="278" y2="120" stroke="#1C1917" strokeOpacity="0.55" strokeWidth="1.5" />
                {/* Circled Phrase for Clarity */}
                <ellipse
                  cx="154"
                  cy="120"
                  rx="34"
                  ry="11"
                  stroke="#243B8A"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                <line x1="96" y1="148" x2="246" y2="148" stroke="#1C1917" strokeOpacity="0.55" strokeWidth="1.5" />
                <line x1="96" y1="176" x2="268" y2="176" stroke="#1C1917" strokeOpacity="0.72" strokeWidth="1.7" />

                {/* Proofreader Checkmark Stamp */}
                <circle cx="118" cy="216" r="14" fill="#FFD966" stroke="#1C1917" strokeWidth="1.3" />
                <path d="M111 216 L116 221 L125 211" stroke="#174D3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <text x="142" y="220" fill="#174D3A" fontSize="10" fontFamily="monospace" fontWeight="700">
                  STET · APPROVED
                </text>

                {/* Editorial Inspection Loupe Overlapping Right Margin */}
                <g transform="translate(244, 118)">
                  <circle cx="48" cy="48" r="42" fill="#FAF6EC" fillOpacity="0.88" stroke="#243B8A" strokeWidth="2.2" />
                  <circle cx="48" cy="48" r="33" stroke="#C89D54" strokeWidth="1" strokeDasharray="2 3" />
                  <text
                    x="48"
                    y="55"
                    textAnchor="middle"
                    fill="#243B8A"
                    fontSize="26"
                    fontFamily="Noto Serif Devanagari, serif"
                    fontWeight="700"
                  >
                    कथ
                  </text>
                  <line x1="78" y1="78" x2="108" y2="108" stroke="#1C1917" strokeWidth="5" strokeLinecap="round" />
                </g>
              </svg>
            )}

            {activeIndex === 2 && (
              /* 03: BOOK DESIGN & PRODUCTION — Classical Open Spread, Golden Margins & Spine Geometry */
              <svg
                viewBox="0 0 420 280"
                fill="none"
                className="w-full h-auto"
                aria-label="Book design and typesetting open spread illustration"
              >
                <circle
                  cx="210"
                  cy="140"
                  r="116"
                  stroke="#243B8A"
                  strokeOpacity="0.22"
                  strokeDasharray="3 5"
                />
                {/* Hardbound Spine Shadow Base */}
                <path
                  d="M42 224 C112 232 184 228 210 218 C236 228 308 232 378 224 L378 234 C308 242 236 238 210 228 C184 238 112 242 42 234 Z"
                  fill="#243B8A"
                />
                {/* Left Verso Page */}
                <path
                  d="M48 56 C108 50 176 54 210 68 L210 218 C176 206 108 206 48 216 Z"
                  fill="#FFFDF7"
                  stroke="#1C1917"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Right Recto Page */}
                <path
                  d="M372 56 C312 50 244 54 210 68 L210 218 C244 206 312 206 372 216 Z"
                  fill="#FFFDF7"
                  stroke="#1C1917"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* Left Page Classical Margin Guide Box */}
                <rect
                  x="72"
                  y="74"
                  width="114"
                  height="116"
                  stroke="#C89D54"
                  strokeOpacity="0.7"
                  strokeDasharray="2 3"
                />
                <text
                  x="129"
                  y="124"
                  textAnchor="middle"
                  fill="#243B8A"
                  fontSize="28"
                  fontFamily="Noto Serif Devanagari, serif"
                  fontWeight="700"
                >
                  अकथ
                </text>
                <text
                  x="129"
                  y="148"
                  textAnchor="middle"
                  fill="#57534E"
                  fontSize="9"
                  fontFamily="monospace"
                  letterSpacing="1.6"
                >
                  TYPE SPECIMEN
                </text>

                {/* Right Page Typeset Lines & Folio */}
                <rect
                  x="234"
                  y="74"
                  width="114"
                  height="116"
                  stroke="#C89D54"
                  strokeOpacity="0.7"
                  strokeDasharray="2 3"
                />
                <line x1="248" y1="92" x2="334" y2="92" stroke="#1C1917" strokeWidth="1.8" />
                <line x1="248" y1="108" x2="328" y2="108" stroke="#1C1917" strokeOpacity="0.55" strokeWidth="1.4" />
                <line x1="248" y1="122" x2="332" y2="122" stroke="#1C1917" strokeOpacity="0.55" strokeWidth="1.4" />
                <line x1="248" y1="136" x2="320" y2="136" stroke="#1C1917" strokeOpacity="0.55" strokeWidth="1.4" />
                <line x1="248" y1="150" x2="330" y2="150" stroke="#1C1917" strokeOpacity="0.55" strokeWidth="1.4" />
                <line x1="248" y1="164" x2="306" y2="164" stroke="#EF6855" strokeWidth="1.5" />

                {/* Ribbon Bookmark */}
                <path d="M204 216 L204 256 L210 248 L216 256 L216 216 Z" fill="#EF6855" />

                {/* Golden Ratio Dimension Callout */}
                <line x1="48" y1="36" x2="210" y2="36" stroke="#174D3A" strokeWidth="1.1" />
                <line x1="48" y1="31" x2="48" y2="41" stroke="#174D3A" strokeWidth="1.1" />
                <line x1="210" y1="31" x2="210" y2="41" stroke="#174D3A" strokeWidth="1.1" />
                <text x="129" y="30" textAnchor="middle" fill="#174D3A" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                  1 : 1.618 FOLIO
                </text>
              </svg>
            )}

            {activeIndex === 3 && (
              /* 04: PUBLISHING & DISTRIBUTION — Standing Books, ISBN Stamp & Reader Reach Arc */
              <svg
                viewBox="0 0 420 280"
                fill="none"
                className="w-full h-auto"
                aria-label="Publishing and book distribution shelf illustration"
              >
                <circle
                  cx="210"
                  cy="140"
                  r="116"
                  stroke="#174D3A"
                  strokeOpacity="0.24"
                  strokeDasharray="3 5"
                />
                {/* Bookshelf Plank Hairline */}
                <line x1="46" y1="224" x2="374" y2="224" stroke="#1C1917" strokeWidth="2" />
                <line x1="56" y1="230" x2="364" y2="230" stroke="#C89D54" strokeWidth="1" />

                {/* Book 1 Spine */}
                <rect x="82" y="94" width="38" height="130" fill="#243B8A" stroke="#1C1917" strokeWidth="1.4" />
                <line x1="82" y1="112" x2="120" y2="112" stroke="#FFD966" strokeWidth="1.6" />
                <line x1="82" y1="204" x2="120" y2="204" stroke="#FFD966" strokeWidth="1.6" />

                {/* Book 2 Spine (Taller Featured Edition) */}
                <rect x="124" y="70" width="44" height="154" fill="#EF6855" stroke="#1C1917" strokeWidth="1.4" />
                <rect x="132" y="92" width="28" height="44" fill="#FFFDF7" />
                <text
                  x="146"
                  y="119"
                  textAnchor="middle"
                  fill="#1C1917"
                  fontSize="14"
                  fontFamily="Noto Serif Devanagari, serif"
                  fontWeight="700"
                >
                  ग्रंथ
                </text>

                {/* Book 3 Spine */}
                <rect x="172" y="102" width="34" height="122" fill="#174D3A" stroke="#1C1917" strokeWidth="1.4" />
                <circle cx="189" cy="144" r="6" fill="#FFD966" />

                {/* Standing Front-Facing Finished Book */}
                <rect x="218" y="82" width="108" height="142" fill="#FFFDF7" stroke="#1C1917" strokeWidth="1.6" />
                <rect x="230" y="94" width="84" height="72" fill="#FFD966" fillOpacity="0.45" stroke="#243B8A" strokeWidth="1.1" />
                <text
                  x="272"
                  y="134"
                  textAnchor="middle"
                  fill="#243B8A"
                  fontSize="18"
                  fontFamily="Noto Serif Devanagari, serif"
                  fontWeight="700"
                >
                  अकथ
                </text>
                {/* ISBN Barcode Mark */}
                <rect x="234" y="180" width="80" height="24" fill="#FAF6EC" stroke="#DCD4C0" />
                <text x="274" y="196" textAnchor="middle" fill="#1C1917" fontSize="9.5" fontFamily="monospace" fontWeight="700">
                  ISBN-13 · INDIA
                </text>

                {/* Reader Distribution Trajectory Arc */}
                <path
                  d="M146 62 Q 214 14 294 70"
                  stroke="#243B8A"
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />
                <polygon points="296,72 287,69 292,62" fill="#EF6855" />
              </svg>
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {/* Plate Bottom Caption & Quick Stage Bar */}
      <div className="relative z-10 pt-3.5 border-t border-[#E5DEC9]/80 flex items-center justify-between gap-3">
        <span className="font-serif text-sm sm:text-base font-medium text-[#1C1917] truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {onSelectIndex && (
            <div className="hidden sm:inline-flex items-center gap-1 mr-1">
              {[0, 1, 2, 3].map((stageIdx) => (
                <button
                  key={stageIdx}
                  type="button"
                  onClick={() => onSelectIndex(stageIdx)}
                  aria-label={`Stage 0${stageIdx + 1}`}
                  className={`w-6 h-6 rounded-full text-[10px] font-mono font-semibold tabular-nums transition-colors cursor-pointer ${
                    activeIndex === stageIdx
                      ? 'bg-[#243B8A] text-[#FFFDF7]'
                      : 'bg-[#FAF6EC] text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  0{stageIdx + 1}
                </button>
              ))}
            </div>
          )}
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#57534E] tabular-nums">
            0{activeIndex + 1} / 04
          </span>
        </div>
      </div>
    </div>
  );
});

interface JourneyStageGlyphProps {
  index: number;
  isActive: boolean;
}

/**
 * Minimalist 28x28 Brass/Gold-Leaf Craft Glyph rendered inside the circular
 * medallion nodes of "02 · HOW WE PUBLISH (An Idea Becomes a Book.)".
 */
export const JourneyStageGlyph: React.FC<JourneyStageGlyphProps> = ({
  index,
  isActive,
}) => {
  const stroke = isActive ? '#1C1917' : '#FFD966';
  const accent = isActive ? '#243B8A' : '#FFFDF7';

  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className="w-6 h-6"
      aria-hidden="true"
    >
      {index === 0 && (
        /* 01 DISCOVER: Fountain Nib & Spark */
        <>
          <path
            d="M14 4 L21 15 L17 22 L11 22 L7 15 Z"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <line x1="14" y1="4" x2="14" y2="13" stroke={stroke} strokeWidth="1.4" />
          <circle cx="14" cy="14" r="1.8" fill={accent} />
        </>
      )}
      {index === 1 && (
        /* 02 REVIEW: Editorial Magnifying Glass */
        <>
          <circle cx="12.5" cy="12.5" r="6" stroke={stroke} strokeWidth="1.6" />
          <line x1="17" y1="17" x2="23" y2="23" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="12.5" x2="15" y2="12.5" stroke={accent} strokeWidth="1.3" />
        </>
      )}
      {index === 2 && (
        /* 03 DEVELOP: Margin Proof & Pen */
        <>
          <rect x="6" y="5" width="16" height="18" rx="1.5" stroke={stroke} strokeWidth="1.5" />
          <line x1="9.5" y1="10" x2="18.5" y2="10" stroke={stroke} strokeWidth="1.4" />
          <line x1="9.5" y1="14" x2="16.5" y2="14" stroke={accent} strokeWidth="1.4" />
          <line x1="9.5" y1="18" x2="14" y2="18" stroke={stroke} strokeWidth="1.4" />
        </>
      )}
      {index === 3 && (
        /* 04 PRODUCE: Open Sewn Book Spread */
        <>
          <path
            d="M4 8 C8 7 12 8 14 10 C16 8 20 7 24 8 L24 20 C20 19 16 20 14 21 C12 20 8 19 4 20 Z"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <line x1="14" y1="10" x2="14" y2="21" stroke={accent} strokeWidth="1.5" />
        </>
      )}
      {index === 4 && (
        /* 05 PUBLISH: Shelf Book Trio */
        <>
          <rect x="5" y="7" width="5" height="15" stroke={stroke} strokeWidth="1.5" />
          <rect x="11.5" y="5" width="5" height="17" stroke={accent} strokeWidth="1.6" />
          <rect x="18" y="8" width="5" height="14" stroke={stroke} strokeWidth="1.5" />
        </>
      )}
    </svg>
  );
};
