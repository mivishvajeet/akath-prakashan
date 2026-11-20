import React, { useEffect, useId, useRef, useState } from 'react';

type ViewportTier = 'mobile' | 'tablet' | 'desktop';

/**
 * Synchronously determines viewport tier on the client so dedicated mobile,
 * tablet, and desktop SVG framing renders immediately without layout flash.
 */
function useLandscapeViewportTier(): ViewportTier {
  const getTier = (): ViewportTier => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'desktop';
    }
    if (window.matchMedia('(max-width: 639px)').matches) return 'mobile';
    if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
    return 'desktop';
  };

  const [tier, setTier] = useState<ViewportTier>(getTier);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mobileQuery = window.matchMedia('(max-width: 639px)');
    const tabletQuery = window.matchMedia('(max-width: 1023px)');

    const updateTier = () => {
      if (mobileQuery.matches) {
        setTier('mobile');
      } else if (tabletQuery.matches) {
        setTier('tablet');
      } else {
        setTier('desktop');
      }
    };

    updateTier();
    mobileQuery.addEventListener?.('change', updateTier);
    tabletQuery.addEventListener?.('change', updateTier);
    return () => {
      mobileQuery.removeEventListener?.('change', updateTier);
      tabletQuery.removeEventListener?.('change', updateTier);
    };
  }, []);

  return tier;
}

/**
 * Lightweight, rAF-throttled scroll parallax & off-screen animation pausing.
 * Writes subtle pixel offsets to CSS custom properties directly on the host
 * element (zero React re-renders during scroll) and fully disables under
 * prefers-reduced-motion.
 */
function useSubtleLandscapeMotion(
  containerRef: React.RefObject<HTMLDivElement | null>,
  mode: 'section' | 'fixed' = 'section'
): boolean {
  const [isOffscreen, setIsOffscreen] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof window === 'undefined') return;

    const reducedMotionQuery = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    );
    if (reducedMotionQuery?.matches) {
      node.style.setProperty('--akath-px-far', '0px');
      node.style.setProperty('--akath-px-mid', '0px');
      node.style.setProperty('--akath-px-near', '0px');
      return;
    }

    let inView = true;
    let rafId: number | null = null;

    const updateParallax = () => {
      rafId = null;
      if (!inView || !containerRef.current) return;

      let progress = 0;
      if (mode === 'fixed') {
        const docHeight = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        progress = Math.min(1, Math.max(0, window.scrollY / docHeight)) * 2 - 1;
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const centerOffset = rect.top + rect.height * 0.5 - vh * 0.5;
        progress = Math.max(-1, Math.min(1, centerOffset / (vh * 0.85)));
      }

      // Extremely restrained differential (max ±5px far, ±9px mid, ±13px near)
      const farY = (progress * 5).toFixed(2);
      const midY = (progress * 9).toFixed(2);
      const nearY = (progress * 13).toFixed(2);

      containerRef.current.style.setProperty('--akath-px-far', `${farY}px`);
      containerRef.current.style.setProperty('--akath-px-mid', `${midY}px`);
      containerRef.current.style.setProperty('--akath-px-near', `${nearY}px`);
    };

    const scheduleUpdate = () => {
      if (!inView || rafId !== null) return;
      rafId = window.requestAnimationFrame(updateParallax);
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && mode === 'section') {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting);
          inView = visible;
          setIsOffscreen(!visible);
          if (visible) scheduleUpdate();
        },
        { rootMargin: '120px 0px 120px 0px', threshold: 0.01 }
      );
      observer.observe(node);
    }

    updateParallax();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer?.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [containerRef, mode]);

  return isOffscreen;
}

/**
 * Shared Archival Ink-and-Wash SVG Definitions.
 * Separates airy, translucent watercolor ground washes (10%–19%) from
 * crisp copperplate pen linework (24%–34%) so editorial details stay sharp
 * without ever weighing down Marathi/English typography.
 */
interface InkWashDefsProps {
  uid: string;
  surfaceHex: string;
  sunCy?: string;
}

const InkWashDefs: React.FC<InkWashDefsProps> = ({
  uid,
  surfaceHex,
  sunCy = '60%',
}) => (
  <defs>
    {/* Warm Dusk Horizon Watercolor Glow */}
    <radialGradient id={`duskSun-${uid}`} cx="50%" cy={sunCy} r="48%">
      <stop offset="0%" stopColor="#EF6855" stopOpacity="0.16" />
      <stop offset="46%" stopColor="#C89D54" stopOpacity="0.10" />
      <stop offset="100%" stopColor="#243B8A" stopOpacity="0" />
    </radialGradient>

    {/* Distant Sahyadri Basalt Mesa Wash */}
    <linearGradient id={`farWash-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#243B8A" stopOpacity="0.13" />
      <stop offset="68%" stopColor="#243B8A" stopOpacity="0.06" />
      <stop offset="100%" stopColor="#243B8A" stopOpacity="0.01" />
    </linearGradient>

    {/* Midground Deccan Escarpment Wash */}
    <linearGradient id={`midWash-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#1B2D6B" stopOpacity="0.17" />
      <stop offset="70%" stopColor="#1B2D6B" stopOpacity="0.08" />
      <stop offset="100%" stopColor="#1B2D6B" stopOpacity="0.02" />
    </linearGradient>

    {/* Foreground Foothill & Riverbank Wash */}
    <linearGradient id={`nearWash-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#174D3A" stopOpacity="0.17" />
      <stop offset="66%" stopColor="#1B2D6B" stopOpacity="0.10" />
      <stop offset="100%" stopColor="#1B2D6B" stopOpacity="0.04" />
    </linearGradient>

    {/* Godavari Dusk River Watercolor Ribbon */}
    <linearGradient id={`riverWash-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#243B8A" stopOpacity="0.06" />
      <stop offset="28%" stopColor="#C89D54" stopOpacity="0.19" />
      <stop offset="52%" stopColor="#EF6855" stopOpacity="0.13" />
      <stop offset="76%" stopColor="#C89D54" stopOpacity="0.17" />
      <stop offset="100%" stopColor="#243B8A" stopOpacity="0.06" />
    </linearGradient>

    {/* Soft Organic Valley Mist Gradient */}
    <linearGradient id={`mistRibbon-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={surfaceHex} stopOpacity="0" />
      <stop offset="46%" stopColor={surfaceHex} stopOpacity="0.82" />
      <stop offset="100%" stopColor={surfaceHex} stopOpacity="0" />
    </linearGradient>

    {/* Whisper-Light Archival Cotton-Rag Paper Stipple */}
    <pattern
      id={`ragGrain-${uid}`}
      width="32"
      height="32"
      patternUnits="userSpaceOnUse"
    >
      <circle cx="5" cy="7" r="0.5" fill="#243B8A" opacity="0.065" />
      <circle cx="17" cy="4" r="0.45" fill="#C89D54" opacity="0.08" />
      <circle cx="27" cy="14" r="0.5" fill="#1B2D6B" opacity="0.06" />
      <circle cx="10" cy="22" r="0.45" fill="#C89D54" opacity="0.075" />
      <circle cx="24" cy="28" r="0.5" fill="#243B8A" opacity="0.055" />
    </pattern>
  </defs>
);

/* ============================================================================
   BESPOKE ARCHIVAL INK-AND-WASH ARCHITECTURAL & BOTANICAL PLATES
   ============================================================================ */

/**
 * 1. Nanded Riverfront Heritage Complex (Hero Exclusive)
 * Ink-and-wash engraving with fluted ribbed dome, lotus neck, kalasha finial,
 * flanking chhatris, corbelled corner minars, cusped stone colonnade arches,
 * and delicate dusk diya accents.
 */
const NandedRiverfrontComplex: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Soft Tinted Architectural Wash */}
    <g fill="#1B2D6B" opacity="0.18">
      <path d="M 78 54 C 76 34, 92 20, 112 18 C 132 20, 148 34, 146 54 Z" />
      <path d="M 46 54 C 46 43, 53 38, 61 38 C 69 38, 76 43, 76 54 Z" />
      <path d="M 148 54 C 148 43, 155 38, 163 38 C 171 38, 178 43, 178 54 Z" />
      <rect x="34" y="54" width="156" height="36" rx="1" />
      <rect x="20" y="28" width="9" height="62" rx="0.8" />
      <rect x="195" y="28" width="9" height="62" rx="0.8" />
      <rect x="18" y="90" width="188" height="7" rx="0.8" />
    </g>

    {/* Paper-Highlight Arched Openings */}
    <path
      d="M 46 90 L 46 72 Q 53 63 60 72 L 60 90 Z
         M 72 90 L 72 70 Q 80 61 88 70 L 88 90 Z
         M 101 90 L 101 65 Q 112 55 123 65 L 123 90 Z
         M 136 90 L 136 70 Q 144 61 152 70 L 152 90 Z
         M 164 90 L 164 72 Q 171 63 178 72 L 178 90 Z"
      fill={surfaceHex}
      opacity="0.72"
    />

    {/* Crisp Archival Copperplate Ink Linework */}
    <g fill="none" stroke="#1B2D6B" opacity="0.34">
      {/* Plinth & Terrace Cornice */}
      <path d="M 14 97 L 210 97 M 18 90 L 206 90" strokeWidth="1.25" />
      <path d="M 28 54 L 196 54 M 31 58 L 193 58" strokeWidth="1.15" />
      <path d="M 34 54 L 34 90 M 190 54 L 190 90" strokeWidth="1.1" />

      {/* Central Fluted Dome Contour & Interior Ribs */}
      <path
        d="M 78 54 C 76 34, 92 20, 112 18 C 132 20, 148 34, 146 54"
        strokeWidth="1.35"
      />
      <path
        d="M 92 54 C 92 36, 100 24, 112 19 M 112 54 L 112 19 M 132 54 C 132 36, 124 24, 112 19"
        strokeWidth="0.75"
        opacity="0.75"
      />
      {/* Shadow-Side Fine Copperplate Hatching on Dome */}
      <path
        d="M 131 32 L 141 35 M 135 39 L 144 41 M 137 46 L 145 48"
        strokeWidth="0.7"
        opacity="0.7"
      />

      {/* Flanking Chhatris */}
      <path d="M 46 54 C 46 43, 53 38, 61 38 C 69 38, 76 43, 76 54" strokeWidth="1.1" />
      <path d="M 148 54 C 148 43, 155 38, 163 38 C 171 38, 178 43, 178 54" strokeWidth="1.1" />

      {/* Corner Minars with Balcony Corbels */}
      <path d="M 20 90 L 20 28 C 20 21, 29 21, 29 28 L 29 90" strokeWidth="1.15" />
      <path d="M 17 48 L 32 48 M 17 68 L 32 68" strokeWidth="1.0" />
      <path d="M 195 90 L 195 28 C 195 21, 204 21, 204 28 L 204 90" strokeWidth="1.15" />
      <path d="M 192 48 L 207 48 M 192 68 L 207 68" strokeWidth="1.0" />

      {/* Engraved Cusped Colonnade Arch Outlines */}
      <path
        d="M 46 90 L 46 72 Q 53 63 60 72 L 60 90
           M 72 90 L 72 70 Q 80 61 88 70 L 88 90
           M 101 90 L 101 65 Q 112 55 123 65 L 123 90
           M 136 90 L 136 70 Q 144 61 152 70 L 152 90
           M 164 90 L 164 72 Q 171 63 178 72 L 178 90"
        strokeWidth="0.95"
      />
      {/* Shadow Hatching on Right Pavilion Bay */}
      <path
        d="M 181 62 L 188 62 M 181 68 L 188 68 M 181 74 L 188 74 M 181 80 L 188 80"
        strokeWidth="0.65"
        opacity="0.72"
      />
    </g>

    {/* Warm Ochre Kalasha Finials */}
    <g stroke="#C89D54" fill="#C89D54" opacity="0.46">
      <line x1="112" y1="18" x2="112" y2="5" strokeWidth="1.3" />
      <circle cx="112" cy="8.5" r="2.0" stroke="none" />
      <circle cx="112" cy="4.2" r="1.1" stroke="none" />
      <line x1="61" y1="38" x2="61" y2="30" strokeWidth="1.0" />
      <line x1="163" y1="38" x2="163" y2="30" strokeWidth="1.0" />
      <line x1="24.5" y1="22" x2="24.5" y2="15" strokeWidth="0.95" />
      <line x1="199.5" y1="22" x2="199.5" y2="15" strokeWidth="0.95" />
    </g>

    {/* Whisper-Subtle Dusk Diya Glints Inside Arches */}
    <g className="akath-diya-glint">
      <circle cx="112" cy="83" r="2.2" fill="#EF6855" opacity="0.34" />
      <circle cx="80" cy="84" r="1.4" fill="#C89D54" opacity="0.32" />
      <circle cx="144" cy="84" r="1.4" fill="#C89D54" opacity="0.32" />
    </g>
  </g>
);

/**
 * 2. Distant Sahyadri Watchtower Bastion (Hero Left Escarpment)
 * Compact, crisp stone watchtower & merlon wall perched on the far basalt spur.
 */
const SahyadriWatchtowerFort: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    <path
      d="M 4 28 L 4 13 L 12 13 L 12 9 L 20 9 L 20 13 L 32 13 L 32 6 L 40 6 L 40 10 L 48 10 L 48 6 L 56 6 L 56 10 L 64 10 L 64 6 L 72 6 L 72 14 L 84 14 L 84 10 L 92 10 L 92 14 L 100 14 L 100 28 Z"
      fill="#1B2D6B"
      opacity="0.19"
    />
    <path d="M 16 28 L 16 20 Q 21 16 26 20 L 26 28 Z" fill={surfaceHex} opacity="0.7" />
    <path
      d="M 4 28 L 4 13 L 12 13 L 12 9 L 20 9 L 20 13 L 32 13 L 32 6 L 40 6 L 40 10 L 48 10 L 48 6 L 56 6 L 56 10 L 64 10 L 64 6 L 72 6 L 72 14 L 84 14 L 84 10 L 92 10 L 92 14 L 100 14 L 100 28"
      fill="none"
      stroke="#1B2D6B"
      strokeWidth="1.15"
      opacity="0.34"
    />
    {/* Engraved Stone Courses & Shadow Hatching */}
    <g stroke="#1B2D6B" strokeWidth="0.65" opacity="0.28">
      <line x1="6" y1="19" x2="98" y2="19" />
      <line x1="6" y1="24" x2="98" y2="24" />
      <line x1="58" y1="12" x2="70" y2="12" />
      <line x1="60" y1="15" x2="70" y2="15" />
    </g>
    <line x1="52" y1="6" x2="52" y2="-9" stroke="#1B2D6B" strokeWidth="1.05" opacity="0.34" />
    <path d="M 52 -9 L 62 -6.5 L 52 -4 Z" fill="#EF6855" opacity="0.32" />
  </g>
);

/**
 * 3. Hemadpanthi Stepped Stone Shikhara (About Exclusive — Marathwada Heritage)
 * Authentic Deccan star-plan stone temple spire with bhumi horizontal tiers,
 * vertical ratha ribs, amalaka finial, and stone mandapa porch.
 */
const HemadpanthiStoneShikhara: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Soft Archival Wash */}
    <g fill="#1B2D6B" opacity="0.17">
      {/* Main Curvilinear Stepped Shikhara Tower */}
      <path d="M 38 92 L 42 54 C 46 34, 54 18, 66 10 C 78 18, 86 34, 90 54 L 94 92 Z" />
      {/* Adjoining Stepped Mandapa Hall */}
      <path d="M 94 92 L 94 58 L 106 48 L 118 44 L 130 48 L 142 58 L 142 92 Z" />
      {/* Carved Adhishthana Stone Plinth */}
      <rect x="28" y="90" width="124" height="8" rx="0.8" />
    </g>

    {/* Paper-Highlight Sanctum Entrance */}
    <path d="M 110 90 L 110 70 Q 118 63 126 70 L 126 90 Z" fill={surfaceHex} opacity="0.72" />

    {/* Crisp Hand-Engraved Hemadpanthi Masonry & Bhumi Tier Lines */}
    <g fill="none" stroke="#1B2D6B" opacity="0.34">
      <path d="M 38 92 L 42 54 C 46 34, 54 18, 66 10 C 78 18, 86 34, 90 54 L 94 92" strokeWidth="1.25" />
      <path d="M 94 58 L 106 48 L 118 44 L 130 48 L 142 58 L 142 92" strokeWidth="1.15" />
      <path d="M 24 98 L 156 98 M 28 90 L 152 90" strokeWidth="1.2" />

      {/* Horizontal Hemadpanthi Bhumi Stone Moulding Courses */}
      <path
        d="M 55 24 L 77 24
           M 50 34 L 82 34
           M 46 44 L 86 44
           M 43 54 L 89 54
           M 41 64 L 91 64
           M 40 74 L 92 74
           M 39 82 L 93 82"
        strokeWidth="0.8"
      />
      {/* Vertical Ratha Offset Ribs */}
      <path
        d="M 56 90 L 59 24 M 66 90 L 66 14 M 76 90 L 73 24"
        strokeWidth="0.72"
        opacity="0.75"
      />
      {/* Mandapa Stepped Pyramid Roof Courses */}
      <path
        d="M 101 53 L 135 53 M 96 60 L 140 60 M 110 90 L 110 70 Q 118 63 126 70 L 126 90"
        strokeWidth="0.9"
      />
    </g>

    {/* Carved Amalaka Ring & Kalasha Finial */}
    <g stroke="#C89D54" fill="#C89D54" opacity="0.46">
      <ellipse cx="66" cy="9" rx="6.5" ry="2.4" fill="none" strokeWidth="1.1" />
      <line x1="66" y1="7" x2="66" y2="-1" strokeWidth="1.2" />
      <circle cx="66" cy="1.5" r="1.4" stroke="none" />
      <line x1="118" y1="44" x2="118" y2="37" strokeWidth="1.0" />
    </g>
  </g>
);

/**
 * 4. Monumental Sahyadri Maratha Hill-Fort Citadel (About Exclusive — Right Crest)
 * Twin circular stone buruj bastions, arched mahadarwaza gate, crenellated
 * rampart hugging the basalt escarpment, and fine masonry hatching.
 */
const SahyadriCitadelFort: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Soft Indigo Stone Wash */}
    <path
      d="M 0 38 L 0 18 L 8 18 L 8 14 L 16 14 L 16 18 L 28 18 L 28 9 L 36 9 L 36 13 L 44 13 L 44 9 L 52 9 L 52 13 L 60 13 L 60 9 L 68 9 L 68 18 L 88 18 L 88 13 L 96 13 L 96 18 L 106 18 L 106 13 L 114 13 L 114 18 L 124 18 L 124 11 L 132 11 L 132 15 L 140 15 L 140 11 L 148 11 L 148 15 L 156 15 L 156 20 L 168 20 L 168 38 Z"
      fill="#1B2D6B"
      opacity="0.19"
    />
    {/* Mahadarwaza Arched Fort Gateway */}
    <path d="M 88 38 L 88 26 Q 97 19 106 26 L 106 38 Z" fill={surfaceHex} opacity="0.72" />

    {/* Crisp Engraved Citadel Outlines & Stone Masonry */}
    <g fill="none" stroke="#1B2D6B" opacity="0.35">
      <path
        d="M 0 38 L 0 18 L 8 18 L 8 14 L 16 14 L 16 18 L 28 18 L 28 9 L 36 9 L 36 13 L 44 13 L 44 9 L 52 9 L 52 13 L 60 13 L 60 9 L 68 9 L 68 18 L 88 18 L 88 13 L 96 13 L 96 18 L 106 18 L 106 13 L 114 13 L 114 18 L 124 18 L 124 11 L 132 11 L 132 15 L 140 15 L 140 11 L 148 11 L 148 15 L 156 15 L 156 20 L 168 20 L 168 38"
        strokeWidth="1.2"
      />
      <path d="M 88 38 L 88 26 Q 97 19 106 26 L 106 38" strokeWidth="1.05" />
      {/* Curved Buruj Bastion Shading & Horizontal Courses */}
      <path
        d="M 2 25 L 166 25 M 2 32 L 86 32 M 108 32 L 166 32"
        strokeWidth="0.7"
        opacity="0.72"
      />
      {/* Vertical Curved Buruj Ribs */}
      <path
        d="M 48 14 L 48 37 M 58 14 L 58 37 M 63 14 L 63 37 M 142 16 L 142 37 M 150 16 L 150 37"
        strokeWidth="0.65"
        opacity="0.75"
      />
    </g>
    {/* Watchtower Standard */}
    <line x1="48" y1="9" x2="48" y2="-11" stroke="#1B2D6B" strokeWidth="1.15" opacity="0.34" />
    <path d="M 48 -11 L 61 -8 L 48 -4.5 Z" fill="#EF6855" opacity="0.34" />
  </g>
);

/**
 * 5. Intimate Engraved Godavari Stone Ghat Mandapa & Moored Skiff (For Authors Exclusive)
 * Open pillared riverside pavilion, carved cusped spandrels, hanging dusk lantern,
 * descending weathered stone ghat stairs with stone joint lines, and a detailed
 * wooden hodi skiff moored calmly beside the lower steps.
 */
const EngravedGhatMandapa: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Soft Ink-and-Wash Fill */}
    <g fill="#1B2D6B" opacity="0.17">
      <path d="M 52 52 C 52 28, 72 16, 94 16 C 116 16, 136 28, 136 52 Z" />
      <path d="M 28 52 L 160 52 L 154 59 L 34 59 Z" />
      <rect x="38" y="58" width="9" height="66" />
      <rect x="74" y="58" width="8" height="66" />
      <rect x="106" y="58" width="8" height="66" />
      <rect x="141" y="58" width="9" height="66" />
      <path
        d="M 47 58 L 74 58 L 74 75 Q 60.5 64 47 75 Z
           M 82 58 L 106 58 L 106 74 Q 94 63 82 74 Z
           M 114 58 L 141 58 L 141 75 Q 127.5 64 114 75 Z"
      />
      {/* Broad Descending Weathered Stone Ghat Steps */}
      <rect x="16" y="124" width="164" height="8" rx="0.8" />
      <rect x="6" y="133" width="192" height="8" rx="0.8" />
      <rect x="-4" y="142" width="218" height="8" rx="0.8" />
      <rect x="-14" y="151" width="242" height="9" rx="0.8" />
    </g>

    {/* Crisp Archival Pen Linework */}
    <g fill="none" stroke="#1B2D6B" opacity="0.35">
      {/* Fluted Chhatri Roof & Ribs */}
      <path d="M 52 52 C 52 28, 72 16, 94 16 C 116 16, 136 28, 136 52" strokeWidth="1.3" />
      <path
        d="M 74 52 C 74 34, 83 22, 94 17 M 94 52 L 94 17 M 114 52 C 114 34, 105 22, 94 17"
        strokeWidth="0.72"
        opacity="0.72"
      />
      {/* Shadow Hatching on Chhatri Right Curve */}
      <path d="M 118 28 L 128 31 M 122 36 L 133 38 M 124 44 L 135 46" strokeWidth="0.68" opacity="0.7" />
      {/* Overhanging Chhajja Eave */}
      <path d="M 28 52 L 160 52 L 154 59 L 34 59 Z" strokeWidth="1.15" />

      {/* Carved Columns & Cusped Arch Curves */}
      <path
        d="M 38 59 L 38 124 M 47 59 L 47 124
           M 74 59 L 74 124 M 82 59 L 82 124
           M 106 59 L 106 124 M 114 59 L 114 124
           M 141 59 L 141 124 M 150 59 L 150 124"
        strokeWidth="1.05"
      />
      <path
        d="M 47 75 Q 60.5 64 74 75 M 82 74 Q 94 63 106 74 M 114 75 Q 127.5 64 141 75"
        strokeWidth="1.0"
      />

      {/* Weathered Stone Ghat Step Edges & Vertical Masonry Joints */}
      <path
        d="M 16 124 L 180 124 M 6 133 L 198 133 M -4 142 L 214 142 M -14 151 L 228 151 M -16 160 L 232 160"
        strokeWidth="1.15"
      />
      <path
        d="M 48 124 L 48 132 M 96 124 L 96 132 M 142 124 L 142 132
           M 34 133 L 34 141 M 80 133 L 80 141 M 128 133 L 128 141 M 170 133 L 170 141
           M 22 142 L 22 150 M 68 142 L 68 150 M 116 142 L 116 150 M 162 142 L 162 150"
        strokeWidth="0.65"
        opacity="0.65"
      />
    </g>

    {/* Paper Highlights Along Step Tops */}
    <g stroke={surfaceHex} strokeWidth="0.8" opacity="0.55">
      <line x1="18" y1="125" x2="178" y2="125" />
      <line x1="8" y1="134" x2="196" y2="134" />
      <line x1="-2" y1="143" x2="212" y2="143" />
    </g>

    {/* Finial & Quiet Hanging Brass Dusk Lantern */}
    <g stroke="#C89D54" fill="#C89D54" opacity="0.48">
      <line x1="94" y1="16" x2="94" y2="3" strokeWidth="1.35" />
      <circle cx="94" cy="6" r="2.0" stroke="none" />
      <line x1="94" y1="64" x2="94" y2="80" strokeWidth="0.9" />
    </g>
    <circle cx="94" cy="82.5" r="2.6" fill="#EF6855" className="akath-diya-glint" opacity="0.38" />

    {/* Quiet Moored Wooden River Skiff (Hodi) Resting Beside the Lower Steps */}
    <g transform="translate(212, 146)">
      {/* Timber Mooring Bollard & Slack Hemp Rope */}
      <line x1="-8" y1="1" x2="-8" y2="17" stroke="#1B2D6B" strokeWidth="2.2" opacity="0.36" />
      <path d="M -7 5 Q 4 13 15 11" fill="none" stroke="#1B2D6B" strokeWidth="0.9" opacity="0.32" />
      {/* Skiff Hull Wash & Crisp Engraved Planks */}
      <path d="M 6 10 C 16 19, 64 20, 86 9 C 74 13, 24 13, 6 10 Z" fill="#1B2D6B" opacity="0.22" />
      <path d="M 6 10 C 16 19, 64 20, 86 9 C 74 13, 24 13, 6 10 Z" fill="none" stroke="#1B2D6B" strokeWidth="1.2" opacity="0.38" />
      <path d="M 16 14 Q 46 16 74 13" fill="none" stroke="#1B2D6B" strokeWidth="0.65" opacity="0.32" />
      {/* Resting Wooden Oar & Waterline Shimmer */}
      <line x1="28" y1="11.5" x2="64" y2="5.5" stroke="#1B2D6B" strokeWidth="1.1" opacity="0.36" />
      <path d="M 14 20 Q 46 23 78 20" fill="none" stroke="#C89D54" strokeWidth="1.05" opacity="0.42" />
    </g>
  </g>
);

/**
 * 6. Traditional Maharashtra Stone Deepstambh (For Authors Right Bank)
 */
const StoneDeepstambh: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    <path d="M 10 74 L 15 16 L 23 16 L 28 74 Z" fill="#1B2D6B" opacity="0.18" />
    <rect x="6" y="72" width="26" height="6" rx="0.8" fill="#1B2D6B" opacity="0.22" />
    <path d="M 13 16 L 19 6 L 25 16 Z" fill="#1B2D6B" opacity="0.22" />
    <g fill="none" stroke="#1B2D6B" opacity="0.35">
      <path d="M 10 74 L 15 16 L 19 6 L 23 16 L 28 74 M 6 72 L 32 72 L 32 78 L 6 78 Z" strokeWidth="1.15" />
      {/* Projecting Stone Lamp Brackets */}
      <path
        d="M 8 28 L 30 28 M 7 39 L 31 39 M 6 50 L 32 50 M 5 61 L 33 61"
        strokeWidth="1.15"
      />
      <line x1="19" y1="16" x2="19" y2="72" strokeWidth="0.65" opacity="0.65" />
    </g>
    <line x1="16" y1="18" x2="13" y2="70" stroke={surfaceHex} strokeWidth="0.7" opacity="0.45" />
    <circle cx="19" cy="4" r="1.9" fill="#EF6855" className="akath-diya-glint" opacity="0.38" />
  </g>
);

/**
 * 7. Hand-Engraved Mature Banyan Tree (Sky Breathing Through Branches)
 * Open architectural boughs, distinct airy foliage clusters with paper sky
 * peeking between crowns, fluted bark grain, and irregular hanging aerial roots.
 */
const EngravedBanyanTree: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Airy Broken Watercolor Canopy Clusters (Not One Heavy Blob — Sky Breathes Through) */}
    <g fill="#174D3A" opacity="0.14">
      <ellipse cx="44" cy="54" rx="30" ry="18" />
      <ellipse cx="76" cy="34" rx="34" ry="20" />
      <ellipse cx="118" cy="30" rx="36" ry="21" />
      <ellipse cx="152" cy="52" rx="30" ry="18" />
      <ellipse cx="96" cy="48" rx="28" ry="15" />
    </g>

    {/* Negative-Space Sky Windows Breathing Inside the Canopy */}
    <g fill={surfaceHex} opacity="0.58">
      <ellipse cx="66" cy="52" rx="9" ry="5" />
      <ellipse cx="126" cy="50" rx="10" ry="5.5" />
      <ellipse cx="98" cy="36" rx="7" ry="4" />
    </g>

    {/* Gnarled Fluted Banyan Trunk, Buttress Roots & Spreading Skeletal Boughs */}
    <path
      d="M 88 70 C 90 90, 84 112, 70 126 L 82 126 C 89 116, 95 109, 99 113 C 103 117, 108 123, 115 126 L 128 126 C 114 112, 108 90, 110 70 Z"
      fill="#174D3A"
      opacity="0.22"
    />
    <g fill="none" stroke="#174D3A" opacity="0.38">
      {/* Trunk Contours & Vertical Bark Etching */}
      <path d="M 88 70 C 90 90, 84 112, 70 126 M 110 70 C 108 90, 114 112, 128 126" strokeWidth="1.45" />
      <path d="M 94 74 C 95 92, 92 106, 86 118 M 103 74 C 102 92, 106 106, 112 118" strokeWidth="0.75" opacity="0.78" />

      {/* Multi-Forked Boughs Visible Between Leaf Clusters */}
      <path d="M 94 73 C 78 62, 58 58, 34 58" strokeWidth="2.3" />
      <path d="M 68 61 C 62 50, 58 42, 48 36" strokeWidth="1.25" />
      <path d="M 96 68 C 92 52, 86 42, 74 30" strokeWidth="1.7" />
      <path d="M 103 70 C 110 54, 118 44, 128 32" strokeWidth="1.8" />
      <path d="M 106 73 C 124 62, 144 58, 166 56" strokeWidth="2.2" />
      <path d="M 134 62 C 142 52, 148 44, 158 40" strokeWidth="1.2" />
    </g>

    {/* Scalloped Botanical Pen-and-Ink Foliage Crown Contours & Shadow Hatching */}
    <g fill="none" stroke="#174D3A" opacity="0.34">
      <path
        d="M 14 58 C 12 46, 22 38, 34 38 C 36 24, 52 14, 70 16 C 82 6, 108 6, 122 14 C 140 12, 156 22, 158 36 C 174 36, 184 48, 180 60 C 174 70, 158 72, 146 68"
        strokeWidth="1.15"
      />
      {/* Fine Layered Leaf-Spray Scallops & Underside Shade Strokes */}
      <path
        d="M 24 48 Q 36 42 48 48 M 52 30 Q 68 22 84 28 M 96 22 Q 116 16 134 24 M 138 40 Q 154 36 168 46"
        strokeWidth="0.85"
      />
      <path
        d="M 22 64 Q 36 68 50 64 M 140 64 Q 156 68 170 64 M 72 44 Q 84 40 94 44"
        strokeWidth="0.75"
        opacity="0.8"
      />
    </g>

    {/* Organic Irregular Hanging Aerial Roots (Jata) */}
    <g fill="none" stroke="#174D3A" opacity="0.33">
      <path d="M 42 62 C 40 78, 44 96, 41 118" strokeWidth="1.05" />
      <path d="M 48 63 C 49 74, 47 86, 48 98" strokeWidth="0.7" />
      <path d="M 62 63 C 61 80, 64 98, 61 122" strokeWidth="1.15" />
      <path d="M 66 96 C 69 104, 70 112, 68 121" strokeWidth="0.7" />
      <path d="M 134 63 C 136 82, 132 102, 135 123" strokeWidth="1.15" />
      <path d="M 145 62 C 144 76, 147 88, 145 104" strokeWidth="0.75" />
      <path d="M 158 61 C 160 74, 157 90, 159 112" strokeWidth="0.95" />
    </g>
  </g>
);

/**
 * 8. Airy Hand-Engraved Marathwada Neem Tree
 * Slender leaning trunk, fine upward limbs, and feathery pinnate frond sprays
 * with open ivory paper breathing between foliage clusters.
 */
const EngravedNeemTree: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Soft Feathery Watercolor Wash Clusters */}
    <g fill="#174D3A" opacity="0.13">
      <ellipse cx="40" cy="40" rx="22" ry="15" />
      <ellipse cx="70" cy="24" rx="26" ry="16" />
      <ellipse cx="102" cy="38" rx="24" ry="15" />
      <ellipse cx="68" cy="46" rx="22" ry="12" />
    </g>
    <ellipse cx="58" cy="42" rx="7" ry="4" fill={surfaceHex} opacity="0.54" />
    <ellipse cx="86" cy="40" rx="6.5" ry="3.8" fill={surfaceHex} opacity="0.54" />

    {/* Slender Curved Trunk & Forking Limbs */}
    <path
      d="M 66 56 C 68 74, 63 94, 56 108 L 66 108 C 71 94, 75 76, 74 56 Z"
      fill="#174D3A"
      opacity="0.20"
    />
    <g fill="none" stroke="#174D3A" opacity="0.36">
      <path d="M 66 56 C 68 74, 63 94, 56 108 M 74 56 C 75 76, 71 94, 66 108" strokeWidth="1.25" />
      <path d="M 68 60 Q 52 46 36 42 M 71 58 Q 70 40 68 24 M 73 59 Q 88 46 106 42" strokeWidth="1.5" />
      {/* Feathery Pinnate Leaf Spray Strokes */}
      <path
        d="M 18 46 C 16 32, 28 22, 42 22 C 48 10, 70 6, 86 14 C 102 10, 120 20, 124 36 C 130 44, 124 54, 110 54"
        strokeWidth="1.0"
      />
      <path
        d="M 28 36 Q 38 30 48 35 M 56 20 Q 70 15 84 22 M 90 32 Q 104 28 116 36 M 38 48 Q 50 44 60 48 M 82 48 Q 94 44 106 48"
        strokeWidth="0.78"
      />
    </g>
  </g>
);

/**
 * 9. Delicate Swaying Godavari River Reeds & Plumes
 */
const GodavariReeds: React.FC<{ transform: string }> = ({ transform }) => (
  <g transform={transform} fill="none" stroke="#174D3A" strokeLinecap="round" opacity="0.36">
    <path d="M 6 48 Q 2 28 -4 10" strokeWidth="1.1" />
    <path d="M 14 48 Q 14 26 11 4" strokeWidth="1.25" />
    <ellipse cx="10.5" cy="9" rx="1.6" ry="4.4" fill="#174D3A" stroke="none" opacity="0.82" />
    <path d="M 22 48 Q 26 28 31 12" strokeWidth="1.0" />
    <path d="M 30 48 Q 36 32 42 18" strokeWidth="0.95" />
    <path d="M 38 48 Q 40 30 39 8" strokeWidth="1.15" />
    <ellipse cx="39" cy="13" rx="1.5" ry="4.0" fill="#174D3A" stroke="none" opacity="0.82" />
    <path d="M 46 48 Q 52 34 58 22" strokeWidth="0.9" />
  </g>
);

/* ============================================================================
   1. HERO — CHAPTER I: TWILIGHT PANORAMA (INK-AND-WASH ARCHIVAL PLATE)
   Wide Deccan vista uniting contour-hatched Sahyadri basalt mesas, organic
   curling valley mist, distant hill-fort watchtower, Nanded riverfront heritage
   complex with broken Godavari reflection, stepped ghats, and airy banyan/reeds.
   ============================================================================ */
export const HeroPublicationWatermark: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tier = useLandscapeViewportTier();
  const isOffscreen = useSubtleLandscapeMotion(containerRef, 'section');

  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';

  const viewBox = isMobile
    ? '0 0 640 680'
    : isTablet
    ? '0 0 1120 620'
    : '0 0 1600 620';

  const surfaceHex = '#FAF8F0';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="hero-dusk-landscape-svg"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none bg-[#FAF8F0] ${
        isOffscreen ? 'akath-landscape-offscreen' : ''
      }`}
    >
      {/* Warm Dusk Horizon Atmospheric Wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 84% 52% at 50% 16%, rgba(200, 157, 84, 0.12) 0%, rgba(239, 104, 85, 0.05) 44%, rgba(250, 248, 240, 0) 78%)',
        }}
      />

      {/* Responsive Framing Container */}
      <div className="relative w-full h-[500px] sm:h-[560px] lg:h-[630px] max-w-[1680px] mx-auto overflow-hidden">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-[0.86] sm:opacity-[0.90] lg:opacity-[0.94]"
        >
          <InkWashDefs uid={uid} surfaceHex={surfaceHex} sunCy="62%" />

          {/* Subtle Cotton-Rag Paper Stipple */}
          <rect width="100%" height="100%" fill={`url(#ragGrain-${uid})`} />

          {/* Dusk Solar Glow Behind the Sahyadri Horizon */}
          <ellipse
            cx={isMobile ? 320 : isTablet ? 560 : 800}
            cy={isMobile ? 430 : 368}
            rx={isMobile ? 320 : isTablet ? 470 : 620}
            ry={isMobile ? 210 : 245}
            fill={`url(#duskSun-${uid})`}
          />

          {/* LAYER 1 — Sky Meridian Arcs, Crescent Moon & Stepped Sahyadri Basalt Mesas */}
          <g className="akath-parallax-far" strokeLinecap="round">
            {isMobile ? (
              <>
                <path
                  d="M 24 410 Q 320 220 616 410"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="0.9"
                  strokeDasharray="3.5 7.5"
                  opacity="0.18"
                />
                <g transform="translate(534, 154) scale(0.86)">
                  <path
                    d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                    fill="#243B8A"
                    opacity="0.24"
                  />
                  <circle cx="-14" cy="18" r="2.1" fill="#C89D54" opacity="0.36" />
                  <circle cx="48" cy="10" r="1.5" fill="#243B8A" opacity="0.26" />
                </g>
                {/* Far Stepped Basalt Mesas (Mobile) */}
                <path
                  d="M -16 488 C 12 454, 34 422, 66 418 L 138 416 C 154 416, 166 436, 192 444 C 228 452, 258 432, 294 432 L 344 434 C 368 436, 392 454, 424 446 C 452 438, 474 402, 504 398 L 574 398 C 598 400, 622 426, 656 436 L 656 680 L -16 680 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 488 C 12 454, 34 422, 66 418 L 138 416 C 154 416, 166 436, 192 444 C 228 452, 258 432, 294 432 L 344 434 C 368 436, 392 454, 424 446 C 452 438, 474 402, 504 398 L 574 398 C 598 400, 622 426, 656 436"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.25"
                  opacity="0.28"
                />
                {/* Contour-Following Deccan Basalt Step Ledges */}
                <g fill="none" stroke="#243B8A" strokeWidth="0.72" opacity="0.22">
                  <path d="M 52 430 L 146 429 M 42 442 L 158 441" />
                  <path d="M 488 410 L 584 410 M 476 422 L 598 423" />
                  <path d="M 138 416 C 148 430, 158 444, 174 456 M 574 398 C 588 414, 602 428, 620 442" />
                </g>
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M 60 356 Q 560 128 1060 356"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="0.95"
                  strokeDasharray="4 8"
                  opacity="0.18"
                />
                <path
                  d="M 180 384 Q 560 212 940 384"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="0.8"
                  strokeDasharray="2 7"
                  opacity="0.20"
                />
                <g transform="translate(920, 108)">
                  <path
                    d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                    fill="#243B8A"
                    opacity="0.24"
                  />
                  <circle cx="-18" cy="18" r="2.2" fill="#C89D54" opacity="0.36" />
                  <circle cx="52" cy="8" r="1.6" fill="#243B8A" opacity="0.26" />
                </g>
                {/* Far Stepped Basalt Mesas (Tablet) */}
                <path
                  d="M -16 432 C 28 386, 62 346, 108 342 L 210 340 C 234 340, 252 366, 286 372 C 330 378, 368 326, 412 320 L 494 318 C 534 322, 566 364, 622 368 C 674 370, 710 330, 756 324 L 832 322 C 864 324, 886 352, 922 342 C 958 332, 984 298, 1022 296 L 1094 298 L 1136 330 L 1136 620 L -16 620 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 432 C 28 386, 62 346, 108 342 L 210 340 C 234 340, 252 366, 286 372 C 330 378, 368 326, 412 320 L 494 318 C 534 322, 566 364, 622 368 C 674 370, 710 330, 756 324 L 832 322 C 864 324, 886 352, 922 342 C 958 332, 984 298, 1022 296 L 1094 298 L 1136 330"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.25"
                  opacity="0.28"
                />
                {/* Contour-Following Deccan Basalt Strata & Slope Hachures */}
                <g fill="none" stroke="#243B8A" strokeWidth="0.72" opacity="0.22">
                  <path d="M 88 355 L 222 354 M 72 369 L 238 369 M 210 340 C 228 358, 246 374, 272 386" />
                  <path d="M 396 332 L 506 332 M 384 345 L 522 346 M 494 318 C 516 340, 540 358, 568 372" />
                  <path d="M 1004 310 L 1106 310 M 990 323 L 1118 324" />
                </g>
              </>
            ) : (
              <>
                <path
                  d="M 96 344 Q 800 108 1504 344"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="0.95"
                  strokeDasharray="4 8"
                  opacity="0.18"
                />
                <path
                  d="M 240 374 Q 800 194 1360 374"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="0.85"
                  strokeDasharray="2 7"
                  opacity="0.20"
                />
                <g transform="translate(1324, 106)">
                  <path
                    d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                    fill="#243B8A"
                    opacity="0.25"
                  />
                  <circle cx="-18" cy="18" r="2.2" fill="#C89D54" opacity="0.38" />
                  <circle cx="52" cy="8" r="1.7" fill="#243B8A" opacity="0.28" />
                  <circle cx="38" cy="-14" r="1.4" fill="#C89D54" opacity="0.30" />
                </g>

                {/* Far Stepped Sahyadri Basalt Mesas (Desktop) */}
                <path
                  d="M -20 426 C 28 378, 66 338, 118 332 L 236 330 C 266 332, 288 362, 330 368 C 378 374, 414 302, 464 294 L 568 292 C 612 296, 646 348, 706 354 C 768 360, 816 332, 868 330 L 948 328 C 986 332, 1022 356, 1068 348 C 1118 340, 1152 282, 1204 276 L 1318 274 C 1356 278, 1390 318, 1438 312 C 1484 306, 1528 294, 1620 332 L 1620 620 L -20 620 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -20 426 C 28 378, 66 338, 118 332 L 236 330 C 266 332, 288 362, 330 368 C 378 374, 414 302, 464 294 L 568 292 C 612 296, 646 348, 706 354 C 768 360, 816 332, 868 330 L 948 328 C 986 332, 1022 356, 1068 348 C 1118 340, 1152 282, 1204 276 L 1318 274 C 1356 278, 1390 318, 1438 312 C 1484 306, 1528 294, 1620 332"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.3"
                  opacity="0.28"
                />
                {/* Hand-Placed Contour-Following Deccan Basalt Step Ledges & Shadow-Side Hachures */}
                <g fill="none" stroke="#243B8A" strokeWidth="0.72" opacity="0.22">
                  {/* Western Mesa Strata & Fall-Line Spurs */}
                  <path d="M 96 346 L 250 344 M 78 360 L 266 360 M 64 374 L 222 374" />
                  <path d="M 236 330 C 254 348, 274 364, 304 376 M 212 332 C 228 348, 242 362, 260 372" />
                  {/* Mid-Left Mesa Strata */}
                  <path d="M 444 308 L 584 307 M 426 322 L 600 322 M 412 336 L 564 336" />
                  <path d="M 568 292 C 594 318, 622 340, 658 356 M 542 293 C 564 316, 586 334, 616 348" />
                  {/* Eastern High Mesa Strata */}
                  <path d="M 1184 290 L 1334 289 M 1166 304 L 1354 304 M 1150 318 L 1310 318" />
                  <path d="M 1318 274 C 1344 298, 1370 316, 1404 328 M 1288 276 C 1310 296, 1332 312, 1362 324" />
                </g>
              </>
            )}

            {/* Quiet Evening Birds Drifting Above Western Crest */}
            <g
              fill="none"
              stroke="#1B2D6B"
              strokeWidth="1.25"
              opacity="0.28"
              transform={
                isMobile
                  ? 'translate(-156, 130) scale(0.84)'
                  : isTablet
                  ? 'translate(-76, 12) scale(0.92)'
                  : undefined
              }
            >
              <path d="M 252 178 Q 260 170 268 178 Q 276 170 284 178" />
              <path d="M 302 162 Q 308 157 314 162 Q 320 157 326 162" />
              <path d="M 284 198 Q 289 194 294 198 Q 299 194 304 198" />
              {!isMobile && (
                <path d="M 1188 194 Q 1194 189 1200 194 Q 1206 189 1212 194" />
              )}
            </g>
          </g>

          {/* Organic Curling Valley Mist Ribbon 1 (No Rectangular Bars) */}
          <path
            d={
              isMobile
                ? 'M -50 482 C 60 456, 164 470, 268 456 C 378 442, 488 464, 690 448 L 690 512 C 520 496, 392 514, 260 502 C 134 490, 48 508, -50 500 Z'
                : isTablet
                ? 'M -60 404 C 130 376, 310 408, 520 384 C 710 362, 910 398, 1180 374 L 1180 444 C 940 426, 730 448, 520 434 C 310 420, 120 440, -60 428 Z'
                : 'M -60 398 C 180 364, 410 406, 680 378 C 940 352, 1210 398, 1660 366 L 1660 442 C 1320 422, 1020 448, 720 432 C 420 416, 180 440, -60 426 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-slow"
            opacity="0.88"
          />

          {/* LAYER 2 — Midground Contour-Hatched Escarpments, Watchtower & Nanded Heritage Skyline */}
          <g className="akath-parallax-mid" strokeLinecap="round">
            {isMobile ? (
              <>
                <path
                  d="M -16 532 C 26 492, 58 470, 98 468 L 166 468 C 194 470, 218 502, 266 508 C 318 514, 354 494, 404 490 C 444 486, 476 460, 524 460 L 604 462 L 656 488 L 656 680 L -16 680 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -16 532 C 26 492, 58 470, 98 468 L 166 468 C 194 470, 218 502, 266 508 C 318 514, 354 494, 404 490 C 444 486, 476 460, 524 460 L 604 462 L 656 488"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.25"
                  opacity="0.30"
                />
                {/* Contour-Following Cliff Hatching */}
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.72" opacity="0.22">
                  <path d="M 166 468 C 178 482, 190 496, 210 510 M 152 470 C 164 486, 174 498, 190 512 M 136 472 C 146 486, 156 498, 168 510" />
                  <path d="M 78 482 L 172 481 M 498 474 L 610 475" />
                </g>
                <SahyadriWatchtowerFort
                  transform="translate(96, 449) scale(0.68)"
                  surfaceHex={surfaceHex}
                />
                <NandedRiverfrontComplex
                  transform="translate(422, 396) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 474 C 46 422, 92 396, 148 394 L 244 394 C 282 398, 316 426, 368 424 C 424 422, 464 388, 524 396 C 588 406, 646 432, 712 418 C 772 404, 818 370, 882 368 L 972 368 C 1024 372, 1072 396, 1136 408 L 1136 620 L -16 620 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -16 474 C 46 422, 92 396, 148 394 L 244 394 C 282 398, 316 426, 368 424 C 424 422, 464 388, 524 396 C 588 406, 646 432, 712 418 C 772 404, 818 370, 882 368 L 972 368 C 1024 372, 1072 396, 1136 408"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.25"
                  opacity="0.30"
                />
                <path
                  d="M -16 472 C 46 420, 92 394, 148 392 L 244 392"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="0.9"
                  opacity="0.32"
                />
                {/* Sculpted Slope Hachures */}
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.72" opacity="0.22">
                  <path d="M 244 394 C 264 412, 286 426, 314 438 M 224 396 C 242 414, 260 426, 282 438 M 118 410 L 258 410" />
                  <path d="M 972 368 C 1002 388, 1034 406, 1074 420 M 946 370 C 974 388, 1002 404, 1036 418" />
                </g>
                <SahyadriWatchtowerFort
                  transform="translate(152, 370) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
                <NandedRiverfrontComplex
                  transform="translate(808, 318) scale(0.95)"
                  surfaceHex={surfaceHex}
                />
              </>
            ) : (
              <>
                <path
                  d="M -20 472 C 46 418, 96 386, 164 382 L 266 380 C 308 384, 344 408, 392 374 C 424 352, 454 348, 502 348 L 574 348 C 618 354, 658 408, 738 416 C 824 424, 884 390, 956 378 C 1018 368, 1068 388, 1126 364 C 1176 344, 1218 342, 1296 344 L 1384 348 C 1442 354, 1510 384, 1620 402 L 1620 620 L -20 620 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -20 472 C 46 418, 96 386, 164 382 L 266 380 C 308 384, 344 408, 392 374 C 424 352, 454 348, 502 348 L 574 348 C 618 354, 658 408, 738 416 C 824 424, 884 390, 956 378 C 1018 368, 1068 388, 1126 364 C 1176 344, 1218 342, 1296 344 L 1384 348 C 1442 354, 1510 384, 1620 402"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.35"
                  opacity="0.30"
                />
                {/* Warm Dusk Rim Highlight Along Sunward Escarpment Shoulders */}
                <path
                  d="M 88 394 C 118 384, 146 382, 266 380 M 436 352 C 460 348, 496 348, 574 348 M 1178 344 C 1226 342, 1296 344, 1384 348"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.0"
                  opacity="0.34"
                />
                {/* Contour-Following Copperplate Slope Hachures on Shadow Faces */}
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.72" opacity="0.22">
                  {/* Left Escarpment Bench & Shadow Hatching */}
                  <path d="M 134 396 L 284 395 M 114 410 L 298 410" />
                  <path d="M 266 380 C 284 398, 302 414, 326 426 M 246 382 C 262 398, 278 412, 298 424" />
                  {/* Fort Plateau Slope Hatching */}
                  <path d="M 456 362 L 588 362 M 440 376 L 606 376" />
                  <path d="M 574 348 C 598 372, 624 396, 662 418 M 552 350 C 574 374, 598 396, 632 416 M 528 352 C 546 374, 566 394, 594 410" />
                  {/* Eastern Ghat Cliff Hatching */}
                  <path d="M 1384 348 C 1418 370, 1456 392, 1502 412 M 1358 350 C 1390 372, 1426 392, 1468 410" />
                </g>
                {/* Distant Sahyadri Watchtower Bastion */}
                <SahyadriWatchtowerFort
                  transform="translate(464, 324) scale(0.92)"
                  surfaceHex={surfaceHex}
                />
                {/* Nanded Riverfront Heritage Complex */}
                <NandedRiverfrontComplex
                  transform="translate(1168, 304) scale(1.06)"
                  surfaceHex={surfaceHex}
                />
              </>
            )}
          </g>

          {/* Organic Curling Lower Valley Mist Ribbon 2 */}
          <path
            d={
              isMobile
                ? 'M -50 538 C 90 520, 210 534, 340 524 C 460 514, 560 532, 690 522 L 690 568 C 540 554, 400 570, 250 560 C 120 550, 30 564, -50 556 Z'
                : isTablet
                ? 'M -60 452 C 180 434, 390 456, 620 442 C 830 428, 990 450, 1180 438 L 1180 486 C 950 472, 740 488, 520 478 C 300 468, 120 484, -60 474 Z'
                : 'M -60 450 C 240 426, 520 454, 820 438 C 1100 424, 1340 452, 1660 436 L 1660 486 C 1340 470, 1020 488, 720 476 C 420 464, 160 484, -60 472 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-deep"
            opacity="0.72"
          />

          {/* LAYER 3 — Airy Hand-Engraved Botanicals, Stepped Nanded Ghats & Shimmering Godavari */}
          <g className="akath-parallax-near" strokeLinecap="round">
            {isMobile ? (
              <>
                <EngravedBanyanTree
                  transform="translate(14, 456) scale(0.70)"
                  surfaceHex={surfaceHex}
                />
                <GodavariReeds transform="translate(152, 536) scale(0.75)" />
                <GodavariReeds transform="translate(566, 538) scale(0.7)" />
                <path
                  d="M -16 560 Q 112 534 234 552 T 456 544 Q 554 532 656 548 L 656 680 L -16 680 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -16 560 Q 112 534 234 552 T 456 544 Q 554 532 656 548"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.2"
                  opacity="0.30"
                />
                {/* Stepped Stone Ghat Masonry */}
                <g stroke="#1B2D6B" strokeWidth="1.0" opacity="0.28">
                  <line x1="378" y1="550" x2="624" y2="550" />
                  <line x1="364" y1="558" x2="634" y2="558" />
                  <line x1="350" y1="566" x2="642" y2="566" />
                </g>
                {/* Godavari River Dusk Band */}
                <path
                  d="M -16 588 Q 160 572 332 586 T 656 584 L 656 648 Q 450 634 260 642 T -16 646 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -16 588 Q 160 572 332 586 T 656 584" fill="none" stroke="#243B8A" strokeWidth="0.9" opacity="0.24" />
                {/* Broken Ink Water Reflection Directly Below Nanded Dome */}
                <g stroke="#1B2D6B" strokeWidth="1.05" opacity="0.24">
                  <line x1="454" y1="598" x2="574" y2="598" />
                  <line x1="472" y1="607" x2="556" y2="607" />
                  <line x1="490" y1="616" x2="538" y2="616" />
                </g>
                <g stroke="#C89D54" strokeWidth="1.15">
                  <line x1="94" y1="602" x2="188" y2="602" className="akath-river-shimmer-a" opacity="0.40" />
                  <line x1="256" y1="612" x2="392" y2="612" className="akath-river-shimmer-b" opacity="0.40" />
                  <line x1="436" y1="604" x2="544" y2="604" className="akath-river-shimmer-a" opacity="0.40" />
                </g>
              </>
            ) : isTablet ? (
              <>
                <EngravedBanyanTree
                  transform="translate(52, 384) scale(0.88)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(216, 404) scale(0.74)"
                  surfaceHex={surfaceHex}
                />
                <GodavariReeds transform="translate(298, 466) scale(0.84)" />
                <path
                  d="M -16 492 Q 180 460 370 480 T 740 474 Q 930 456 1136 476 L 1136 620 L -16 620 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -16 492 Q 180 460 370 480 T 740 474 Q 930 456 1136 476"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.25"
                  opacity="0.30"
                />
                <g stroke="#1B2D6B" strokeWidth="1.05" opacity="0.28">
                  <line x1="744" y1="478" x2="1072" y2="478" />
                  <line x1="726" y1="487" x2="1090" y2="487" />
                  <line x1="708" y1="496" x2="1108" y2="496" />
                </g>
                <path
                  d="M -16 524 Q 260 500 540 520 T 1136 522 L 1136 584 Q 820 564 520 576 T -16 582 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -16 524 Q 260 500 540 520 T 1136 522" fill="none" stroke="#243B8A" strokeWidth="0.95" opacity="0.24" />
                <g stroke="#1B2D6B" strokeWidth="1.1" opacity="0.24">
                  <line x1="846" y1="534" x2="984" y2="534" />
                  <line x1="868" y1="544" x2="962" y2="544" />
                  <line x1="888" y1="554" x2="942" y2="554" />
                </g>
                <g stroke="#C89D54" strokeWidth="1.2">
                  <line x1="220" y1="538" x2="345" y2="538" className="akath-river-shimmer-a" opacity="0.42" />
                  <line x1="470" y1="548" x2="645" y2="548" className="akath-river-shimmer-b" opacity="0.42" />
                  <line x1="750" y1="540" x2="885" y2="540" className="akath-river-shimmer-a" opacity="0.42" />
                  <line x1="518" y1="559" x2="615" y2="559" className="akath-river-shimmer-b" opacity="0.42" />
                </g>
              </>
            ) : (
              <>
                <EngravedBanyanTree
                  transform="translate(86, 374) scale(1.04)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(270, 398) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
                <GodavariReeds transform="translate(366, 462) scale(0.95)" />
                <GodavariReeds transform="translate(1486, 464) scale(0.9)" />

                {/* Foreground Riverbank & Engraved Bank Contour */}
                <path
                  d="M -20 492 Q 160 456 346 478 T 700 486 Q 832 492 954 474 T 1316 460 Q 1474 452 1620 476 L 1620 620 L -20 620 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -20 492 Q 160 456 346 478 T 700 486 Q 832 492 954 474 T 1316 460 Q 1474 452 1620 476"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.3"
                  opacity="0.30"
                />
                {/* Stepped Nanded Stone Ghat Stairs & Vertical Stone Joints */}
                <g stroke="#1B2D6B" strokeWidth="1.05" opacity="0.28">
                  <line x1="1084" y1="476" x2="1456" y2="476" />
                  <line x1="1062" y1="485" x2="1478" y2="485" />
                  <line x1="1040" y1="494" x2="1500" y2="494" />
                  <line x1="1024" y1="503" x2="1518" y2="503" opacity="0.72" />
                </g>
                <g stroke={surfaceHex} strokeWidth="0.75" opacity="0.52">
                  <line x1="1086" y1="477" x2="1454" y2="477" />
                  <line x1="1064" y1="486" x2="1476" y2="486" />
                  <line x1="1042" y1="495" x2="1498" y2="495" />
                </g>

                {/* Winding Godavari River Dusk Reflection Band */}
                <path
                  d="M -20 524 Q 320 498 660 522 T 1320 516 Q 1470 510 1620 526 L 1620 586 Q 1340 562 980 578 T 320 572 Q 140 568 -20 582 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path
                  d="M -20 524 Q 320 498 660 522 T 1320 516 Q 1470 510 1620 526"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="0.95"
                  opacity="0.24"
                />
                {/* Engraved Broken Reflection Directly Below Nanded Dome */}
                <g stroke="#1B2D6B" strokeWidth="1.15" opacity="0.24">
                  <line x1="1206" y1="532" x2="1366" y2="532" />
                  <line x1="1228" y1="542" x2="1344" y2="542" />
                  <line x1="1250" y1="552" x2="1322" y2="552" />
                  <line x1="1272" y1="561" x2="1302" y2="561" />
                </g>
                {/* Copperplate Dusk Water Shimmer Lines */}
                <g stroke="#C89D54" strokeWidth="1.25">
                  <line x1="210" y1="549" x2="318" y2="549" className="akath-river-shimmer-b" opacity="0.42" />
                  <line x1="420" y1="536" x2="552" y2="536" className="akath-river-shimmer-a" opacity="0.42" />
                  <line x1="686" y1="545" x2="880" y2="545" className="akath-river-shimmer-b" opacity="0.42" />
                  <line x1="742" y1="556" x2="844" y2="556" className="akath-river-shimmer-a" opacity="0.42" />
                  <line x1="994" y1="538" x2="1136" y2="538" className="akath-river-shimmer-b" opacity="0.42" />
                  <line x1="1212" y1="548" x2="1348" y2="548" className="akath-river-shimmer-a" opacity="0.42" />
                </g>
              </>
            )}
          </g>
        </svg>

        {/* Precision Center Readability Veil — Protects Headline & CTAs While Outer Engraved Plate Stays Razor-Sharp */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 58% 54% at 50% 38%, rgba(250, 248, 240, 0.76) 0%, rgba(250, 248, 240, 0.36) 58%, rgba(250, 248, 240, 0) 100%)',
          }}
        />

        {/* Soft Edge Feathering into Ultra-Wide Viewports (>1680px) */}
        <div
          className="hidden 2xl:block absolute inset-y-0 left-0 w-24"
          style={{
            background:
              'linear-gradient(90deg, #FAF8F0 0%, rgba(250, 248, 240, 0) 100%)',
          }}
        />
        <div
          className="hidden 2xl:block absolute inset-y-0 right-0 w-24"
          style={{
            background:
              'linear-gradient(270deg, #FAF8F0 0%, rgba(250, 248, 240, 0) 100%)',
          }}
        />

        {/* Seamless Bottom Fade Into the Interactive Book Plinth */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 sm:h-32"
          style={{
            background:
              'linear-gradient(180deg, rgba(250, 248, 240, 0) 0%, rgba(250, 248, 240, 0.84) 70%, #FAF8F0 100%)',
          }}
        />
      </div>

      {/* Gentle Bottom Transition From Warm Ivory Hero Canvas Into Section 01 */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            'linear-gradient(180deg, rgba(250, 248, 240, 0) 0%, rgba(243, 246, 252, 0.85) 100%)',
        }}
      />
    </div>
  );
};

/* ============================================================================
   2. FOR AUTHORS — CHAPTER II: INTIMATE GODAVARI GHAT STUDY (INK-AND-WASH)
   Contemplative riverside plate: open carved stone mandapa, descending broad
   weathered stone ghat steps, quiet moored wooden hodi skiff, opposite-bank
   stone deepstambh, airy neem branches, river reeds, and calm hatched water.
   ============================================================================ */
export const AuthorsLandscapeBackdrop: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tier = useLandscapeViewportTier();
  const isOffscreen = useSubtleLandscapeMotion(containerRef, 'section');

  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';

  const viewBox = isMobile
    ? '0 0 640 760'
    : isTablet
    ? '0 0 1120 720'
    : '0 0 1600 720';

  const surfaceHex = '#F4EDE0';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="authors-dusk-landscape-svg"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none bg-[#F4EDE0] ${
        isOffscreen ? 'akath-landscape-offscreen' : ''
      }`}
    >
      {/* Warm Parchment Dusk Atmospheric Wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 84% 56% at 50% 18%, rgba(200, 157, 84, 0.12) 0%, rgba(239, 104, 85, 0.045) 46%, rgba(244, 237, 224, 0) 78%)',
        }}
      />

      <div className="relative w-full h-full max-w-[1680px] mx-auto overflow-hidden flex items-end">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-[0.86] sm:opacity-[0.90] lg:opacity-[0.94]"
        >
          <InkWashDefs uid={uid} surfaceHex={surfaceHex} sunCy="58%" />

          {/* Whisper-Light Archival Paper Stipple */}
          <rect width="100%" height="100%" fill={`url(#ragGrain-${uid})`} />

          {/* Calm Low Horizon Dusk Glow */}
          <ellipse
            cx={isMobile ? 320 : isTablet ? 560 : 800}
            cy={isMobile ? 510 : 460}
            rx={isMobile ? 310 : isTablet ? 470 : 620}
            ry={isMobile ? 190 : 230}
            fill={`url(#duskSun-${uid})`}
          />

          {/* Far Plane — Quiet Evening Crescent & Soft Low Marathwada Hills */}
          <g className="akath-parallax-far" strokeLinecap="round">
            <g
              transform={
                isMobile
                  ? 'translate(76, 134) scale(0.84)'
                  : isTablet
                  ? 'translate(124, 118) scale(0.92)'
                  : 'translate(192, 116)'
              }
            >
              <path
                d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                fill="#243B8A"
                opacity="0.24"
              />
              <circle cx="58" cy="18" r="2.0" fill="#C89D54" opacity="0.38" />
              <circle cx="-12" cy="10" r="1.4" fill="#243B8A" opacity="0.26" />
            </g>

            {/* Pair of Evening Herons Gliding Quietly Over the River */}
            <g
              fill="none"
              stroke="#1B2D6B"
              strokeWidth="1.2"
              opacity="0.26"
              transform={
                isMobile
                  ? 'translate(-790, 62)'
                  : isTablet
                  ? 'translate(-380, 26)'
                  : undefined
              }
            >
              <path d="M 1246 196 Q 1255 188 1264 196 Q 1273 188 1282 196" />
              <path d="M 1298 180 Q 1304 175 1310 180 Q 1316 175 1322 180" />
            </g>

            {isMobile ? (
              <>
                <path
                  d="M -16 538 C 46 512, 116 498, 194 504 C 266 510, 326 496, 404 494 C 484 492, 560 508, 656 522 L 656 760 L -16 760 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 538 C 46 512, 116 498, 194 504 C 266 510, 326 496, 404 494 C 484 492, 560 508, 656 522"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.1"
                  opacity="0.24"
                />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 500 C 84 468, 186 452, 294 460 C 402 468, 496 446, 610 448 C 724 450, 824 468, 932 454 C 1010 444, 1072 456, 1136 476 L 1136 720 L -16 720 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 500 C 84 468, 186 452, 294 460 C 402 468, 496 446, 610 448 C 724 450, 824 468, 932 454 C 1010 444, 1072 456, 1136 476"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.15"
                  opacity="0.24"
                />
              </>
            ) : (
              <>
                <path
                  d="M -20 496 C 110 456, 240 436, 380 448 C 510 460, 628 432, 774 436 C 918 440, 1042 464, 1192 444 C 1326 426, 1468 442, 1620 472 L 1620 720 L -20 720 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -20 496 C 110 456, 240 436, 380 448 C 510 460, 628 432, 774 436 C 918 440, 1042 464, 1192 444 C 1326 426, 1468 442, 1620 472"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.2"
                  opacity="0.24"
                />
                {/* Soft Horizontal Contour Shading on Distant Marathwada Hills */}
                <g fill="none" stroke="#243B8A" strokeWidth="0.65" opacity="0.18">
                  <path d="M 210 458 Q 290 452 370 462 M 690 450 Q 790 444 888 456 M 1150 458 Q 1270 446 1390 458" />
                </g>
              </>
            )}
          </g>

          {/* Organic Curling River Mist Ribbon Separating Distant Hills from the Ghats */}
          <path
            d={
              isMobile
                ? 'M -50 536 C 80 516, 200 532, 330 518 C 460 506, 560 526, 690 516 L 690 572 C 520 556, 380 574, 240 562 C 110 550, 30 564, -50 558 Z'
                : isTablet
                ? 'M -60 492 C 160 466, 380 494, 620 476 C 840 460, 990 486, 1180 470 L 1180 532 C 950 516, 720 536, 500 522 C 280 508, 120 528, -60 518 Z'
                : 'M -60 488 C 220 458, 490 494, 800 472 C 1090 452, 1340 488, 1660 466 L 1660 530 C 1340 512, 1020 534, 720 520 C 420 506, 160 526, -60 516 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-slow"
            opacity="0.86"
          />

          {/* Midground — Quiet River Embankment, Carved Ghat Mandapa, Deepstambh & Airy Neem Grove */}
          <g className="akath-parallax-mid" strokeLinecap="round">
            {isMobile ? (
              <>
                <path
                  d="M -16 588 Q 140 562 276 584 T 656 574 L 656 760 L -16 760 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -16 588 Q 140 562 276 584 T 656 574"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.1"
                  opacity="0.26"
                />
                <EngravedGhatMandapa
                  transform="translate(18, 474) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
                <StoneDeepstambh
                  transform="translate(468, 514) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(502, 496) scale(0.9)"
                  surfaceHex={surfaceHex}
                />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 544 Q 210 518 420 542 T 840 536 Q 990 520 1136 534 L 1136 720 L -16 720 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -16 544 Q 210 518 420 542 T 840 536 Q 990 520 1136 534"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.15"
                  opacity="0.26"
                />
                <EngravedGhatMandapa
                  transform="translate(54, 419) scale(0.96)"
                  surfaceHex={surfaceHex}
                />
                <StoneDeepstambh
                  transform="translate(838, 464) scale(0.92)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(892, 434) scale(1.06)"
                  surfaceHex={surfaceHex}
                />
              </>
            ) : (
              <>
                <path
                  d="M -20 538 Q 260 508 540 534 T 1120 530 Q 1360 510 1620 528 L 1620 720 L -20 720 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -20 538 Q 260 508 540 534 T 1120 530 Q 1360 510 1620 528"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.2"
                  opacity="0.26"
                />
                {/* Left Bank: Engraved Stone Ghat Mandapa, Weathered Steps & Quiet Moored Skiff */}
                <EngravedGhatMandapa
                  transform="translate(108, 398) scale(1.08)"
                  surfaceHex={surfaceHex}
                />
                {/* Right Bank: Stone Deepstambh, Airy Neem Grove & Low Stone Ghat Parapet */}
                <StoneDeepstambh
                  transform="translate(1208, 456) scale(1.02)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(1272, 418) scale(1.18)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(1414, 444) scale(0.86)"
                  surfaceHex={surfaceHex}
                />
                <g stroke="#1B2D6B" strokeWidth="1.0" opacity="0.26">
                  <line x1="1158" y1="538" x2="1548" y2="538" />
                  <line x1="1138" y1="548" x2="1564" y2="548" />
                  <line x1="1118" y1="558" x2="1580" y2="558" />
                </g>
              </>
            )}
          </g>

          {/* Foreground — Mirror-Calm Godavari Dusk Water, Broken Ink Reflections & Reeds */}
          <g className="akath-parallax-near" strokeLinecap="round">
            {isMobile ? (
              <>
                <path
                  d="M -16 610 Q 180 594 340 606 T 656 604 L 656 760 L -16 760 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -16 610 Q 180 594 340 606 T 656 604" fill="none" stroke="#243B8A" strokeWidth="0.9" opacity="0.24" />
                <g stroke="#1B2D6B" strokeWidth="1.0" opacity="0.22">
                  <line x1="56" y1="624" x2="156" y2="624" />
                  <line x1="68" y1="634" x2="142" y2="634" />
                  <line x1="82" y1="644" x2="128" y2="644" />
                </g>
                <g stroke="#C89D54" strokeWidth="1.15">
                  <line x1="184" y1="636" x2="320" y2="636" className="akath-river-shimmer-a" opacity="0.40" />
                  <line x1="230" y1="652" x2="412" y2="652" className="akath-river-shimmer-b" opacity="0.40" />
                  <line x1="364" y1="628" x2="492" y2="628" className="akath-river-shimmer-a" opacity="0.40" />
                </g>
                <GodavariReeds transform="translate(556, 610) scale(0.9)" />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 574 Q 290 554 580 572 T 1136 568 L 1136 720 L -16 720 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -16 574 Q 290 554 580 572 T 1136 568" fill="none" stroke="#243B8A" strokeWidth="0.95" opacity="0.24" />
                <g stroke="#1B2D6B" strokeWidth="1.05" opacity="0.22">
                  <line x1="94" y1="590" x2="220" y2="590" />
                  <line x1="110" y1="602" x2="202" y2="602" />
                  <line x1="126" y1="614" x2="188" y2="614" />
                </g>
                <g stroke="#C89D54" strokeWidth="1.2">
                  <line x1="330" y1="604" x2="498" y2="604" className="akath-river-shimmer-a" opacity="0.42" />
                  <line x1="468" y1="620" x2="684" y2="620" className="akath-river-shimmer-b" opacity="0.42" />
                  <line x1="696" y1="600" x2="854" y2="600" className="akath-river-shimmer-a" opacity="0.42" />
                  <line x1="528" y1="638" x2="646" y2="638" className="akath-river-shimmer-b" opacity="0.42" />
                </g>
                <GodavariReeds transform="translate(998, 566) scale(1.04)" />
                <GodavariReeds transform="translate(20, 580) scale(0.88)" />
              </>
            ) : (
              <>
                <path
                  d="M -20 576 Q 360 554 780 574 T 1620 568 L 1620 720 L -20 720 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -20 576 Q 360 554 780 574 T 1620 568" fill="none" stroke="#243B8A" strokeWidth="0.95" opacity="0.24" />
                {/* Broken Ink Water Reflections of Mandapa & Deepstambh */}
                <g stroke="#1B2D6B" strokeWidth="1.1" opacity="0.22">
                  <line x1="158" y1="592" x2="310" y2="592" />
                  <line x1="176" y1="604" x2="290" y2="604" />
                  <line x1="194" y1="616" x2="268" y2="616" />
                  <line x1="1210" y1="592" x2="1246" y2="592" />
                  <line x1="1216" y1="604" x2="1240" y2="604" />
                </g>
                {/* Fine Copperplate Water Shimmer Lines */}
                <g stroke="#C89D54" strokeWidth="1.25">
                  <line x1="426" y1="604" x2="612" y2="604" className="akath-river-shimmer-a" opacity="0.42" />
                  <line x1="674" y1="618" x2="928" y2="618" className="akath-river-shimmer-b" opacity="0.42" />
                  <line x1="744" y1="636" x2="878" y2="636" className="akath-river-shimmer-a" opacity="0.42" />
                  <line x1="998" y1="602" x2="1162" y2="602" className="akath-river-shimmer-b" opacity="0.42" />
                  <line x1="1296" y1="616" x2="1444" y2="616" className="akath-river-shimmer-a" opacity="0.42" />
                </g>
                <GodavariReeds transform="translate(26, 582) scale(1.06)" />
                <GodavariReeds transform="translate(1484, 566) scale(1.16)" />
              </>
            )}
          </g>
        </svg>

        {/* Precision Center Readability Veil — Keeps Section Heading & Author Studio Card Crisp */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 64% 60% at 50% 45%, rgba(244, 237, 224, 0.78) 0%, rgba(244, 237, 224, 0.38) 62%, rgba(244, 237, 224, 0) 100%)',
          }}
        />

        {/* Ultra-Wide Viewport Edge Feathering */}
        <div
          className="hidden 2xl:block absolute inset-y-0 left-0 w-24"
          style={{
            background:
              'linear-gradient(90deg, #F4EDE0 0%, rgba(244, 237, 224, 0) 100%)',
          }}
        />
        <div
          className="hidden 2xl:block absolute inset-y-0 right-0 w-24"
          style={{
            background:
              'linear-gradient(270deg, #F4EDE0 0%, rgba(244, 237, 224, 0) 100%)',
          }}
        />
      </div>

      {/* Gentle Top & Bottom Seamless Section Transitions */}
      <div
        className="absolute inset-x-0 top-0 h-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 253, 247, 0.65) 0%, rgba(244, 237, 224, 0) 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(244, 237, 224, 0) 0%, rgba(250, 246, 236, 0.85) 100%)',
        }}
      />
    </div>
  );
};

/* ============================================================================
   3. ABOUT — CHAPTER III: ELEVATED SAHYADRI HORIZON (INK-AND-WASH PLATE)
   High-altitude original vista: contour-hatched Deccan basalt plateaus, a
   monumental Maratha hill-fort citadel on the eastern escarpment, an authentic
   Hemadpanthi stepped stone shikhara nestled in the western valley (zero reuse
   of Hero's dome), organic curling valley mist, and mature rooted banyan & neem
   groves anchoring the terraced foreland.
   ============================================================================ */
export interface AboutLandscapeBackdropProps {
  /** Base paper surface color for radial readability veil & edge fades */
  surfaceHex?: string;
  /** Optional top blend color from preceding section */
  topFadeRgba?: string;
  /** Optional bottom blend color into following section */
  bottomFadeRgba?: string;
}

export const AboutLandscapeBackdrop: React.FC<AboutLandscapeBackdropProps> = ({
  surfaceHex = '#FAF6EC',
  topFadeRgba = 'rgba(244, 237, 224, 0.72)',
  bottomFadeRgba = 'rgba(250, 246, 236, 0.85)',
}) => {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tier = useLandscapeViewportTier();

  // Detect whole-page fixed mount on /about vs homepage Section 05
  const isWholePageFixed = topFadeRgba.includes('0.32');
  const isOffscreen = useSubtleLandscapeMotion(
    containerRef,
    isWholePageFixed ? 'fixed' : 'section'
  );

  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';

  const viewBox = isMobile
    ? '0 0 640 720'
    : isTablet
    ? '0 0 1120 660'
    : '0 0 1600 640';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="about-dusk-landscape-svg"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${
        isOffscreen ? 'akath-landscape-offscreen' : ''
      }`}
      style={{ backgroundColor: surfaceHex }}
    >
      {/* Warm Dusk Horizon Atmospheric Wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 84% 56% at 50% 16%, rgba(200, 157, 84, 0.12) 0%, rgba(239, 104, 85, 0.045) 45%, rgba(250, 246, 236, 0) 78%)',
        }}
      />

      <div className="relative w-full h-full max-w-[1680px] mx-auto overflow-hidden flex items-end">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-[0.84] sm:opacity-[0.88] lg:opacity-[0.92]"
        >
          <InkWashDefs uid={uid} surfaceHex={surfaceHex} sunCy="64%" />

          {/* Whisper-Fine Cotton-Rag Paper Stipple */}
          <rect width="100%" height="100%" fill={`url(#ragGrain-${uid})`} />

          {/* Golden-Dusk Horizon Halo Behind High Sahyadri Plateaus */}
          <ellipse
            cx={isMobile ? 320 : isTablet ? 560 : 800}
            cy={isMobile ? 450 : 390}
            rx={isMobile ? 330 : isTablet ? 490 : 650}
            ry={isMobile ? 215 : 250}
            fill={`url(#duskSun-${uid})`}
          />

          {/* LAYER 1 — Monumental Terraced Deccan Trap Basalt Plateaus */}
          <g className="akath-parallax-far" strokeLinecap="round">
            <path
              d={
                isMobile
                  ? 'M 36 420 Q 320 250 604 420'
                  : isTablet
                  ? 'M 80 374 Q 560 156 1040 374'
                  : 'M 120 364 Q 800 132 1480 364'
              }
              fill="none"
              stroke="#C89D54"
              strokeWidth="0.9"
              strokeDasharray="3 8"
              opacity="0.22"
            />
            <g
              transform={
                isMobile
                  ? 'translate(518, 174) scale(0.8)'
                  : isTablet
                  ? 'translate(944, 130) scale(0.9)'
                  : 'translate(1354, 126)'
              }
            >
              <circle cx="0" cy="0" r="2.1" fill="#C89D54" opacity="0.38" />
              <circle cx="24" cy="14" r="1.5" fill="#243B8A" opacity="0.26" />
              <circle cx="-18" cy="20" r="1.4" fill="#C89D54" opacity="0.30" />
            </g>

            {isMobile ? (
              <>
                <path
                  d="M -16 492 C 4 468, 18 438, 38 436 L 116 434 C 132 436, 144 456, 168 458 C 194 460, 214 418, 240 416 L 318 416 C 338 418, 352 450, 384 458 C 424 466, 456 410, 484 408 L 568 406 C 594 408, 616 438, 656 446 L 656 720 L -16 720 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 492 C 4 468, 18 438, 38 436 L 116 434 C 132 436, 144 456, 168 458 C 194 460, 214 418, 240 416 L 318 416 C 338 418, 352 450, 384 458 C 424 466, 456 410, 484 408 L 568 406 C 594 408, 616 438, 656 446"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.25"
                  opacity="0.28"
                />
                <g fill="none" stroke="#243B8A" strokeWidth="0.72" opacity="0.22">
                  <path d="M 28 448 L 126 447 M 228 428 L 328 428 M 472 420 L 578 420 M 462 434 L 592 434" />
                </g>
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 446 C 18 408, 38 366, 68 364 L 184 362 C 212 364, 232 398, 272 402 C 324 406, 366 346, 404 342 L 516 340 C 552 344, 578 386, 636 392 C 698 398, 742 332, 784 328 L 916 326 C 954 330, 984 370, 1028 364 C 1066 358, 1098 370, 1136 392 L 1136 660 L -16 660 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 446 C 18 408, 38 366, 68 364 L 184 362 C 212 364, 232 398, 272 402 C 324 406, 366 346, 404 342 L 516 340 C 552 344, 578 386, 636 392 C 698 398, 742 332, 784 328 L 916 326 C 954 330, 984 370, 1028 364 C 1066 358, 1098 370, 1136 392"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.25"
                  opacity="0.28"
                />
                <g fill="none" stroke="#243B8A" strokeWidth="0.72" opacity="0.22">
                  <path d="M 54 378 L 198 377 M 44 392 L 210 392" />
                  <path d="M 388 356 L 528 355 M 516 340 C 538 364, 562 384, 594 396" />
                  <path d="M 768 342 L 930 341 M 752 356 L 946 356 M 916 326 C 942 350, 968 368, 998 378" />
                </g>
              </>
            ) : (
              <>
                <path
                  d="M -20 432 C 36 372, 74 324, 126 320 L 284 318 C 328 320, 360 368, 422 374 C 482 378, 524 332, 578 328 L 696 326 C 756 330, 804 382, 892 384 C 974 386, 1024 316, 1094 304 L 1266 302 C 1320 306, 1364 352, 1428 344 C 1488 336, 1546 318, 1620 356 L 1620 640 L -20 640 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -20 432 C 36 372, 74 324, 126 320 L 284 318 C 328 320, 360 368, 422 374 C 482 378, 524 332, 578 328 L 696 326 C 756 330, 804 382, 892 384 C 974 386, 1024 316, 1094 304 L 1266 302 C 1320 306, 1364 352, 1428 344 C 1488 336, 1546 318, 1620 356"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.3"
                  opacity="0.28"
                />
                {/* Authentic Stepped Basalt Escarpment Strata & Eroded Spur Lines */}
                <g fill="none" stroke="#243B8A" strokeWidth="0.72" opacity="0.22">
                  <path d="M 104 334 L 298 333 M 84 350 L 316 349 M 68 366 L 266 365" />
                  <path d="M 284 318 C 312 344, 340 364, 378 378 M 252 320 C 276 344, 300 362, 330 374" />
                  <path d="M 556 342 L 712 341 M 696 326 C 730 352, 766 372, 814 384" />
                  <path d="M 1072 318 L 1282 317 M 1052 334 L 1300 334 M 1032 350 L 1254 350" />
                  <path d="M 1266 302 C 1296 328, 1328 348, 1368 360 M 1230 304 C 1258 328, 1286 346, 1322 356" />
                </g>
              </>
            )}
          </g>

          {/* Organic Curling High-Altitude Valley Mist Ribbon 1 */}
          <path
            d={
              isMobile
                ? 'M -50 492 C 70 468, 190 486, 320 470 C 440 456, 550 478, 690 464 L 690 526 C 530 510, 390 528, 250 516 C 120 504, 30 520, -50 512 Z'
                : isTablet
                ? 'M -60 426 C 160 398, 370 428, 600 404 C 820 384, 980 416, 1180 396 L 1180 466 C 950 448, 730 470, 510 454 C 290 440, 120 460, -60 450 Z'
                : 'M -60 420 C 220 386, 480 424, 780 398 C 1070 374, 1330 418, 1660 388 L 1660 462 C 1340 444, 1020 468, 720 452 C 420 436, 160 458, -60 446 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-slow"
            opacity="0.86"
          />

          {/* LAYER 2 — Fortified Maratha Hill-Fort Citadel & Valley Hemadpanthi Stone Shikhara */}
          <g className="akath-parallax-mid" strokeLinecap="round">
            {isMobile ? (
              <>
                <path
                  d="M -16 544 C 38 510, 86 502, 148 518 C 216 534, 286 546, 366 534 C 424 524, 464 476, 514 472 L 598 472 L 656 506 L 656 720 L -16 720 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -16 544 C 38 510, 86 502, 148 518 C 216 534, 286 546, 366 534 C 424 524, 464 476, 514 472 L 598 472 L 656 506"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.25"
                  opacity="0.30"
                />
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.72" opacity="0.22">
                  <path d="M 488 486 L 610 486 M 474 498 L 622 498" />
                </g>
                {/* Hemadpanthi Stone Shikhara in Left Valley */}
                <HemadpanthiStoneShikhara
                  transform="translate(72, 462) scale(0.56)"
                  surfaceHex={surfaceHex}
                />
                {/* Monumental Maratha Hill-Fort Citadel on Right Crest */}
                <SahyadriCitadelFort
                  transform="translate(476, 444) scale(0.76)"
                  surfaceHex={surfaceHex}
                />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 492 C 74 446, 152 440, 248 468 C 368 502, 488 510, 616 488 C 710 472, 774 406, 846 402 L 992 402 C 1044 406, 1088 436, 1136 452 L 1136 660 L -16 660 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -16 492 C 74 446, 152 440, 248 468 C 368 502, 488 510, 616 488 C 710 472, 774 406, 846 402 L 992 402 C 1044 406, 1088 436, 1136 452"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.25"
                  opacity="0.30"
                />
                <path
                  d="M 846 400 L 992 400"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="0.9"
                  opacity="0.34"
                />
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.72" opacity="0.22">
                  <path d="M 822 418 L 1006 418 M 804 434 L 1024 434 M 992 402 C 1022 422, 1052 440, 1088 456" />
                </g>
                <SahyadriCitadelFort
                  transform="translate(836, 368) scale(0.92)"
                  surfaceHex={surfaceHex}
                />
                <HemadpanthiStoneShikhara
                  transform="translate(166, 396) scale(0.72)"
                  surfaceHex={surfaceHex}
                />
              </>
            ) : (
              <>
                <path
                  d="M -20 486 C 88 434, 186 426, 304 456 C 446 492, 598 506, 756 490 C 892 476, 988 446, 1074 402 C 1116 382, 1152 378, 1216 378 L 1368 378 C 1438 384, 1518 424, 1620 442 L 1620 640 L -20 640 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -20 486 C 88 434, 186 426, 304 456 C 446 492, 598 506, 756 490 C 892 476, 988 446, 1074 402 C 1116 382, 1152 378, 1216 378 L 1368 378 C 1438 384, 1518 424, 1620 442"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.35"
                  opacity="0.30"
                />
                <path
                  d="M 1074 402 C 1116 382, 1152 378, 1216 378 L 1368 378"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.0"
                  opacity="0.34"
                />
                {/* Contour-Following Citadel Cliff Strata & Shadow Hachures */}
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.72" opacity="0.22">
                  <path d="M 1116 394 L 1384 394 M 1084 410 L 1408 410 M 1054 426 L 1430 426" />
                  <path d="M 1368 378 C 1408 402, 1448 424, 1498 444 M 1334 380 C 1372 404, 1412 426, 1456 444" />
                  <path d="M 122 454 C 190 452, 248 462, 314 480 M 96 470 C 166 468, 224 476, 286 492" />
                </g>
                {/* Monumental Maratha Hill-Fort Citadel Commanding the Right Escarpment */}
                <SahyadriCitadelFort
                  transform="translate(1192, 342) scale(1.04)"
                  surfaceHex={surfaceHex}
                />
                {/* Authentic Marathwada Hemadpanthi Stone Shikhara in the Left Valley */}
                <HemadpanthiStoneShikhara
                  transform="translate(268, 386) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
              </>
            )}
          </g>

          {/* Organic Curling Lower Ridge Mist Ribbon 2 */}
          <path
            d={
              isMobile
                ? 'M -50 572 C 90 554, 210 570, 340 558 C 460 548, 560 566, 690 554 L 690 604 C 540 590, 400 606, 250 596 C 120 586, 30 600, -50 592 Z'
                : isTablet
                ? 'M -60 508 C 180 486, 390 510, 620 494 C 830 480, 990 504, 1180 490 L 1180 542 C 950 528, 740 546, 520 534 C 300 524, 120 540, -60 530 Z'
                : 'M -60 504 C 240 478, 520 508, 820 492 C 1100 476, 1340 506, 1660 488 L 1660 542 C 1340 526, 1020 544, 720 532 C 420 520, 160 538, -60 528 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-deep"
            opacity="0.72"
          />

          {/* LAYER 3 — Deeply Rooted Mature Banyan & Neem Groves Framing the Terraced Foreland */}
          <g className="akath-parallax-near" strokeLinecap="round">
            {isMobile ? (
              <>
                <EngravedBanyanTree
                  transform="translate(14, 514) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(514, 536) scale(0.82)"
                  surfaceHex={surfaceHex}
                />
                <path
                  d="M -16 616 Q 156 588 320 606 T 656 598 L 656 720 L -16 720 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -16 616 Q 156 588 320 606 T 656 598"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.2"
                  opacity="0.30"
                />
                <path
                  d="M -16 644 Q 186 626 352 638 T 656 632"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.0"
                  strokeDasharray="6 6"
                  opacity="0.30"
                />
              </>
            ) : isTablet ? (
              <>
                <EngravedBanyanTree
                  transform="translate(46, 444) scale(1.04)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(932, 466) scale(0.98)"
                  surfaceHex={surfaceHex}
                />
                <path
                  d="M -16 558 Q 250 526 520 550 T 1136 538 L 1136 660 L -16 660 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -16 558 Q 250 526 520 550 T 1136 538"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.25"
                  opacity="0.30"
                />
                <path
                  d="M -16 592 Q 300 572 580 586 T 1136 576"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.05"
                  strokeDasharray="7 7"
                  opacity="0.32"
                />
              </>
            ) : (
              <>
                {/* Mature Deep-Rooted Banyan & Neem Grove (Left Foreland) */}
                <EngravedBanyanTree
                  transform="translate(64, 412) scale(1.22)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(274, 448) scale(0.92)"
                  surfaceHex={surfaceHex}
                />
                {/* Mature Neem & Banyan Grove (Right Foreland) */}
                <EngravedNeemTree
                  transform="translate(1352, 434) scale(1.12)"
                  surfaceHex={surfaceHex}
                />
                <EngravedBanyanTree
                  transform="translate(1442, 446) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
                {/* Terraced Foreground Deccan Plateau & Engraved Ridge Contour */}
                <path
                  d="M -20 546 Q 220 512 468 538 T 980 542 Q 1280 524 1620 536 L 1620 640 L -20 640 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -20 546 Q 220 512 468 538 T 980 542 Q 1280 524 1620 536"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.3"
                  opacity="0.30"
                />
                {/* Copperplate Horizon Contour & Winding Valley Footpath */}
                <path
                  d="M -20 578 Q 340 556 740 574 T 1620 564"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.15"
                  opacity="0.34"
                />
                <path
                  d="M 480 594 Q 800 578 1120 596"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="0.9"
                  strokeDasharray="5 8"
                  opacity="0.22"
                />
              </>
            )}
          </g>
        </svg>

        {/* Precision Center Readability Veil — Keeps Unboxed About Prose & Monograph Cards Crisp */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 64% 62% at 50% 42%, ${surfaceHex}CC 0%, ${surfaceHex}66 60%, ${surfaceHex}00 100%)`,
          }}
        />

        {/* Soft Edge Feathering into Ultra-Wide Viewports (>1680px) */}
        <div
          className="hidden 2xl:block absolute inset-y-0 left-0 w-24"
          style={{
            background: `linear-gradient(90deg, ${surfaceHex} 0%, ${surfaceHex}00 100%)`,
          }}
        />
        <div
          className="hidden 2xl:block absolute inset-y-0 right-0 w-24"
          style={{
            background: `linear-gradient(270deg, ${surfaceHex} 0%, ${surfaceHex}00 100%)`,
          }}
        />
      </div>

      {/* Seamless Top & Bottom Section Transitions */}
      <div
        className="absolute inset-x-0 top-0 h-20"
        style={{
          background: `linear-gradient(180deg, ${topFadeRgba} 0%, ${surfaceHex}00 100%)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-20"
        style={{
          background: `linear-gradient(180deg, ${surfaceHex}00 0%, ${bottomFadeRgba} 100%)`,
        }}
      />
    </div>
  );
};
