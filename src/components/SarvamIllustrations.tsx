import React from 'react';
import { motion } from 'motion/react';

/**
 * Sarvam.ai-Inspired Sovereign Architectural & Akath Tortoise Vector System
 * -------------------------------------------------------------------------
 * Reconstructs the official Akath Prakashan emblem — a Tortoise (कासव) with
 * dual counter-rotating spiral shell motifs rising above a 3-layered Open Book
 * (उघडलेले पुस्तक) — alongside Sarvam-style 1px architectural arches and
 * geometric grids.
 *
 * Color discipline (60-30-10 rule):
 * - Dominant strokes: Sovereign Ink (#141413) & Sarvam Indigo (#312E81)
 * - Heritage logo nod: Akath Cerulean (#0B6E99)
 * - Micro-highlight (<1%): Warm Terracotta (#9A3412)
 */

interface AnimatedTortoiseEmblemProps {
  className?: string;
  variant?: 'forest' | 'indigo' | 'cerulean' | 'light' | 'ink';
  animate?: boolean;
  hideAndSeekOnHover?: boolean;
}

export const AnimatedTortoiseEmblem: React.FC<AnimatedTortoiseEmblemProps> = ({
  className = 'w-10 h-10',
  variant = 'forest',
  animate = true,
  hideAndSeekOnHover = false,
}) => {
  const palette = {
    forest: {
      bg: '#FFFDF7',
      border: '#FFD966',
      primary: '#243B8A',
      spiral: '#FFD966',
      innerShell: '#FFFDF7',
      book: '#EF6855',
    },
    indigo: {
      bg: '#FFFDF7',
      border: '#E6E1D6',
      primary: '#243B8A',
      spiral: '#243B8A',
      innerShell: '#FFD966',
      book: '#EF6855',
    },
    cerulean: {
      bg: '#FFD966',
      border: '#F2C94C',
      primary: '#243B8A',
      spiral: '#243B8A',
      innerShell: '#FFFDF7',
      book: '#EF6855',
    },
    light: {
      bg: 'rgba(255, 253, 247, 0.1)',
      border: 'rgba(255, 217, 102, 0.45)',
      primary: '#FFFDF7',
      spiral: '#FFD966',
      innerShell: '#243B8A',
      book: '#FFD966',
    },
    ink: {
      bg: '#FFFDF7',
      border: '#E6E1D6',
      primary: '#252832',
      spiral: '#243B8A',
      innerShell: '#FFD966',
      book: '#EF6855',
    },
  }[variant];

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${animate ? 'tortoise-float' : ''} ${
        hideAndSeekOnHover ? 'tortoise-hide-seek' : ''
      } ${className}`}
      aria-hidden="true"
    >
      {/* Subtle Rounded Architectural Frame */}
      <rect
        x="4"
        y="4"
        width="112"
        height="112"
        rx="26"
        fill={palette.bg}
        stroke={palette.border}
        strokeWidth="1.5"
      />

      {/* Fine Inner Geometric Halo */}
      <circle
        cx="60"
        cy="46"
        r="34"
        stroke={palette.spiral}
        strokeOpacity="0.24"
        strokeWidth="1"
        strokeDasharray="2 3"
      />

      {/* TORTOISE GROUP (Top — Symbol of Patient, Enduring Literary Craft) */}
      <g className={animate ? 'tortoise-emblem-body' : undefined}>
        {/* Tortoise Head */}
        <path
          d="M60 11 C55.5 11 53 15 54 20.5 C55 23 65 23 66 20.5 C67 15 64.5 11 60 11 Z"
          fill={palette.primary}
          className="tortoise-head"
        />

        {/* Front Left Flipper */}
        <path
          d="M41 26 C33 21 26 23 24 28 C28 31 35 32 41 31 Z"
          fill={palette.primary}
          className={animate || hideAndSeekOnHover ? 'tortoise-flipper-l' : undefined}
        />

        {/* Front Right Flipper */}
        <path
          d="M79 26 C87 21 94 23 96 28 C92 31 85 32 79 31 Z"
          fill={palette.primary}
          className={animate || hideAndSeekOnHover ? 'tortoise-flipper-r' : undefined}
        />

        {/* Rear Left Flipper */}
        <path
          d="M43 56 C36 59 31 63 32 67 C36 67 42 64 46 59 Z"
          fill={palette.primary}
          className="tortoise-flipper-rl"
        />

        {/* Rear Right Flipper */}
        <path
          d="M77 56 C84 59 89 63 88 67 C84 67 78 64 74 59 Z"
          fill={palette.primary}
          className="tortoise-flipper-rr"
        />

        {/* Tiny Tail */}
        <path
          d="M58 63 L60 69 L62 63 Z"
          fill={palette.primary}
          className="tortoise-tail"
        />

        {/* Tortoise Carapace & Dual Counter-Rotating Spiral Group */}
        <g className="tortoise-shell-group">
          {/* Tortoise Carapace (Outer Shell Silhouette) */}
          <ellipse
            cx="60"
            cy="42"
            rx="22"
            ry="21"
            fill={palette.primary}
          />

          {/* Inner Carapace Rim */}
          <ellipse
            cx="60"
            cy="42"
            rx="18.5"
            ry="17.5"
            stroke={palette.innerShell}
            strokeWidth="1.6"
          />

          {/* Signature Akath Dual Counter-Rotating Spiral Motifs Inside the Shell */}
          <path
            d="M59 29 C50 29 45 35 46 42 C47 48 53 51 58 49 C62 47 63 42 60 39 C58 37 54 38 54 41"
            stroke={palette.innerShell}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M61 55 C70 55 75 49 74 42 C73 36 67 33 62 35 C58 37 57 42 60 45 C62 47 66 46 66 43"
            stroke={palette.innerShell}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </g>

      {/* THREE-LAYERED OPEN BOOK (Bottom — Symbol of Open Knowledge & Reading) */}
      <g>
        {/* Top Open Pages Layer */}
        <path
          d="M60 85 C48 76 33 74 18 77 C24 84 42 87 60 93 C78 87 96 84 102 77 C87 74 72 76 60 85 Z"
          fill={palette.primary}
          className={animate ? 'tortoise-book-wave' : undefined}
        />
        {/* Middle Pages Layer */}
        <path
          d="M60 95 C46 87 30 85 15 87 C22 94 42 97 60 102 C78 97 98 94 105 87 C90 85 74 87 60 95 Z"
          fill={palette.book}
          fillOpacity="0.92"
        />
        {/* Bottom Book Binding Layer */}
        <path
          d="M60 104 C46 97 29 95 14 96 C23 103 42 106 60 110 C78 106 97 103 106 96 C91 95 74 97 60 104 Z"
          fill={palette.primary}
          fillOpacity="0.72"
        />
      </g>
    </svg>
  );
};

/**
 * Monumental Architectural Stage Illustration featuring the Akath Tortoise +
 * Concentric Sarvam Arches + Orbital Literary Nodes.
 * Used in the Turtle Philosophy Showcase and About Akath view.
 */
export const TortoiseStageIllustration: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 460 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none pointer-events-none ${className}`}
    aria-hidden="true"
  >
    {/* Outer Architectural Frame */}
    <rect
      x="16"
      y="16"
      width="428"
      height="368"
      rx="28"
      stroke="currentColor"
      strokeOpacity="0.16"
      strokeWidth="1"
    />

    {/* Concentric Sarvam Stepwell Arches */}
    <motion.path
      d="M66 384 V205 C66 104 140 38 230 28 C320 38 394 104 394 205 V384"
      stroke="currentColor"
      strokeOpacity="0.2"
      strokeWidth="1.25"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
    />
    <motion.path
      d="M104 384 V214 C104 132 160 74 230 62 C300 74 356 132 356 214 V384"
      stroke="currentColor"
      strokeOpacity="0.14"
      strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.6, delay: 0.15, ease: 'easeOut' }}
    />

    {/* Slowly Rotating Outer Literary Orbit Ring */}
    <motion.g
      animate={{ rotate: 360 }}
      transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
      style={{ transformOrigin: '230px 210px' }}
    >
      <circle
        cx="230"
        cy="210"
        r="118"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1"
        strokeDasharray="4 8"
      />
      <circle cx="230" cy="92" r="4.5" fill="#243B8A" fillOpacity="0.85" />
      <circle cx="348" cy="210" r="4.5" fill="#FFD966" />
      <circle cx="230" cy="328" r="4.5" fill="#243B8A" fillOpacity="0.85" />
      <circle cx="112" cy="210" r="4" fill="#EF6855" fillOpacity="0.85" />
    </motion.g>

    {/* Inner Sacred Geometry Halo */}
    <circle
      cx="230"
      cy="210"
      r="92"
      stroke="currentColor"
      strokeOpacity="0.16"
      strokeWidth="1"
    />

    {/* Central Animated Tortoise & Open Book Monument */}
    <motion.g
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Tortoise Head */}
      <path
        d="M230 116 C221 116 216 124 218 135 C220 140 240 140 242 135 C244 124 239 116 230 116 Z"
        fill="#243B8A"
      />
      {/* Front Flippers */}
      <path
        d="M192 146 C175 136 160 140 156 150 C165 157 180 159 192 156 Z"
        fill="#243B8A"
      />
      <path
        d="M268 146 C285 136 300 140 304 150 C295 157 280 159 268 156 Z"
        fill="#243B8A"
      />
      {/* Rear Flippers */}
      <path
        d="M196 208 C182 214 172 223 174 231 C182 231 194 224 202 214 Z"
        fill="#243B8A"
      />
      <path
        d="M264 208 C278 214 288 223 286 231 C278 231 266 224 258 214 Z"
        fill="#243B8A"
      />
      {/* Tail */}
      <path d="M226 222 L230 234 L234 222 Z" fill="#243B8A" />

      {/* Tortoise Shell */}
      <ellipse cx="230" cy="179" rx="44" ry="42" fill="#243B8A" />
      <ellipse
        cx="230"
        cy="179"
        rx="37"
        ry="35"
        stroke="#FFFDF7"
        strokeWidth="2.2"
      />

      {/* Dual Spiral Shell Paths */}
      <motion.path
        d="M228 152 C210 152 200 165 202 179 C204 191 216 197 226 193 C234 189 236 179 230 173 C226 169 218 171 218 177"
        stroke="#FFFDF7"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <motion.path
        d="M232 206 C250 206 260 193 258 179 C256 167 244 161 234 165 C226 169 224 179 230 185 C234 189 242 187 242 181"
        stroke="#FFD966"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Three-Tiered Open Book Below Tortoise */}
      <path
        d="M230 262 C206 244 176 240 146 246 C158 260 194 266 230 278 C266 266 302 260 314 246 C284 240 254 244 230 262 Z"
        fill="#243B8A"
      />
      <path
        d="M230 282 C202 266 170 262 140 266 C154 280 194 286 230 296 C266 286 306 280 320 266 C290 262 258 266 230 282 Z"
        fill="#EF6855"
      />
      <path
        d="M230 300 C202 286 168 282 138 284 C156 298 194 304 230 312 C266 304 304 298 322 284 C292 282 258 286 230 300 Z"
        fill="#FFD966"
      />
    </motion.g>
  </svg>
);

export const HorizonArchIllustration: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 1200 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none pointer-events-none ${className}`}
    aria-hidden="true"
  >
    {/* Panoramic Concentric Sarvam Arches (Clean, Uncluttered Center for Hero Text) */}
    <motion.path
      d="M180 420 V235 C180 105 370 24 600 14 C830 24 1020 105 1020 235 V420"
      stroke="currentColor"
      strokeOpacity="0.14"
      strokeWidth="1.2"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
    />
    <motion.path
      d="M280 420 V250 C280 140 425 66 600 56 C775 66 920 140 920 250 V420"
      stroke="currentColor"
      strokeOpacity="0.1"
      strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.6, delay: 0.15, ease: 'easeOut' }}
    />
    <motion.path
      d="M380 420 V265 C380 178 480 112 600 102 C720 112 820 178 820 265 V420"
      stroke="currentColor"
      strokeOpacity="0.07"
      strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.8, delay: 0.25, ease: 'easeOut' }}
    />

    {/* Subtle Lateral Nodes Away from Center Typography */}
    <circle cx="180" cy="240" r="3.5" fill="#243B8A" fillOpacity="0.35" />
    <circle cx="1020" cy="240" r="3.5" fill="#EF6855" fillOpacity="0.4" />
  </svg>
);

export const GatewayArchIllustration: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 420 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none pointer-events-none ${className}`}
    aria-hidden="true"
  >
    <rect
      x="20"
      y="20"
      width="380"
      height="380"
      rx="20"
      stroke="currentColor"
      strokeOpacity="0.15"
      strokeWidth="1"
    />
    <line
      x1="210"
      y1="20"
      x2="210"
      y2="400"
      stroke="currentColor"
      strokeOpacity="0.09"
      strokeWidth="1"
      strokeDasharray="3 5"
    />
    <line
      x1="20"
      y1="210"
      x2="400"
      y2="210"
      stroke="currentColor"
      strokeOpacity="0.09"
      strokeWidth="1"
      strokeDasharray="3 5"
    />

    <motion.path
      d="M80 400 V210 C80 125 140 65 210 50 C280 65 340 125 340 210 V400"
      stroke="currentColor"
      strokeOpacity="0.24"
      strokeWidth="1.25"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.4, ease: 'easeOut' }}
    />
    <motion.path
      d="M115 400 V220 C115 152 162 102 210 88 C258 102 305 152 305 220 V400"
      stroke="currentColor"
      strokeOpacity="0.18"
      strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.6, delay: 0.15, ease: 'easeOut' }}
    />

    <circle
      cx="210"
      cy="175"
      r="36"
      stroke="currentColor"
      strokeOpacity="0.18"
      strokeWidth="1"
    />
    <path
      d="M210 130 L218 167 L255 175 L218 183 L210 220 L202 183 L165 175 L202 167 Z"
      stroke="currentColor"
      strokeOpacity="0.28"
      strokeWidth="1.1"
    />

    <circle cx="210" cy="50" r="3" fill="#312E81" fillOpacity="0.55" />
    <circle cx="210" cy="175" r="3" fill="#0B6E99" fillOpacity="0.55" />
  </svg>
);

export const OpenFolioIllustration: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 280 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none pointer-events-none ${className}`}
    aria-hidden="true"
  >
    <path
      d="M140 125 L75 32 M140 125 L108 20 M140 125 L140 14 M140 125 L172 20 M140 125 L205 32"
      stroke="currentColor"
      strokeOpacity="0.18"
      strokeWidth="1"
      strokeDasharray="2 4"
    />
    <circle
      cx="140"
      cy="70"
      r="46"
      stroke="currentColor"
      strokeOpacity="0.16"
      strokeWidth="1"
    />
    <path
      d="M140 132 C116 118 82 114 48 120 V52 C82 46 116 50 140 64 C164 50 198 46 232 52 V120 C198 114 164 118 140 132 Z"
      stroke="currentColor"
      strokeOpacity="0.45"
      strokeWidth="1.25"
      fill="white"
      fillOpacity="0.6"
    />
    <line
      x1="140"
      y1="64"
      x2="140"
      y2="132"
      stroke="currentColor"
      strokeOpacity="0.4"
      strokeWidth="1.2"
    />
    <line x1="68" y1="72" x2="122" y2="75" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
    <line x1="68" y1="84" x2="122" y2="87" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
    <line x1="68" y1="96" x2="110" y2="99" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
    <line x1="158" y1="75" x2="212" y2="72" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
    <line x1="158" y1="87" x2="212" y2="84" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
    <line x1="158" y1="99" x2="198" y2="96" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />
    <path
      d="M140 24 L144 34 L154 38 L144 42 L140 52 L136 42 L126 38 L136 34 Z"
      stroke="#312E81"
      strokeOpacity="0.6"
      strokeWidth="1.1"
    />
  </svg>
);

export const StepwellMandalaBadge: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`select-none pointer-events-none ${className}`}
    aria-hidden="true"
  >
    <rect
      x="6"
      y="6"
      width="52"
      height="52"
      rx="10"
      stroke="currentColor"
      strokeOpacity="0.22"
      strokeWidth="1"
    />
    <rect
      x="14"
      y="14"
      width="36"
      height="36"
      transform="rotate(45 32 32)"
      stroke="currentColor"
      strokeOpacity="0.22"
      strokeWidth="1"
    />
    <circle
      cx="32"
      cy="32"
      r="10"
      stroke="currentColor"
      strokeOpacity="0.35"
      strokeWidth="1.2"
    />
    <circle cx="32" cy="32" r="2.5" fill="currentColor" fillOpacity="0.6" />
  </svg>
);

export const ArchitecturalDivider: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div
    className={`flex items-center justify-center gap-4 select-none pointer-events-none ${className}`}
    aria-hidden="true"
  >
    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E5E0D5] to-[#E5E0D5]" />
    <AnimatedTortoiseEmblem className="w-8 h-8" variant="ink" animate={false} />
    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#E5E0D5] to-[#E5E0D5]" />
  </div>
);
