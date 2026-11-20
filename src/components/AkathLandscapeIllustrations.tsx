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
 * Shared archival copperplate & woodcut pattern primitives.
 * Pure vector (zero raster filters), giving authentic Deccan basalt strata,
 * shadowed escarpment cross-hatching, and subtle rag-paper stippling.
 */
interface EngravingDefsProps {
  uid: string;
  surfaceHex: string;
  sunCy?: string;
}

const EngravingDefs: React.FC<EngravingDefsProps> = ({
  uid,
  surfaceHex,
  sunCy = '58%',
}) => (
  <defs>
    {/* Warm Dusk Horizon Glow */}
    <radialGradient id={`duskSun-${uid}`} cx="50%" cy={sunCy} r="48%">
      <stop offset="0%" stopColor="#EF6855" stopOpacity="0.62" />
      <stop offset="44%" stopColor="#C89D54" stopOpacity="0.34" />
      <stop offset="100%" stopColor="#243B8A" stopOpacity="0" />
    </radialGradient>

    {/* Distant Sahyadri Basalt Ridge Fill */}
    <linearGradient id={`farRidge-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#243B8A" stopOpacity="0.56" />
      <stop offset="68%" stopColor="#243B8A" stopOpacity="0.26" />
      <stop offset="100%" stopColor="#243B8A" stopOpacity="0.1" />
    </linearGradient>

    {/* Midground Escarpment Fill */}
    <linearGradient id={`midRidge-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#1B2D6B" stopOpacity="0.76" />
      <stop offset="72%" stopColor="#1B2D6B" stopOpacity="0.38" />
      <stop offset="100%" stopColor="#1B2D6B" stopOpacity="0.16" />
    </linearGradient>

    {/* Foreground Bank & Foothill Fill */}
    <linearGradient id={`nearBank-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#174D3A" stopOpacity="0.82" />
      <stop offset="65%" stopColor="#1B2D6B" stopOpacity="0.52" />
      <stop offset="100%" stopColor="#1B2D6B" stopOpacity="0.28" />
    </linearGradient>

    {/* Godavari Dusk River Reflection Ribbon */}
    <linearGradient id={`riverBand-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#243B8A" stopOpacity="0.22" />
      <stop offset="28%" stopColor="#C89D54" stopOpacity="0.68" />
      <stop offset="52%" stopColor="#EF6855" stopOpacity="0.48" />
      <stop offset="76%" stopColor="#C89D54" stopOpacity="0.64" />
      <stop offset="100%" stopColor="#243B8A" stopOpacity="0.22" />
    </linearGradient>

    {/* Soft Valley Mist Band */}
    <linearGradient id={`valleyMist-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={surfaceHex} stopOpacity="0" />
      <stop offset="48%" stopColor={surfaceHex} stopOpacity="0.78" />
      <stop offset="100%" stopColor={surfaceHex} stopOpacity="0" />
    </linearGradient>

    {/* Copperplate Diagonal Escarpment Shadow Hatching */}
    <pattern
      id={`hatchDiag-${uid}`}
      width="7"
      height="7"
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(-34)"
    >
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="7"
        stroke="#1B2D6B"
        strokeWidth="0.7"
        strokeOpacity="0.42"
      />
    </pattern>

    {/* Deccan Trap Horizontal Basalt Strata Etching */}
    <pattern
      id={`strataHoriz-${uid}`}
      width="42"
      height="9"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 0 3.5 L 18 3.5 M 23 3.5 L 40 3.5 M 6 7.5 L 32 7.5"
        stroke="#FAF8F0"
        strokeWidth="0.65"
        strokeOpacity="0.34"
        fill="none"
      />
    </pattern>

    {/* Fine Archival Aquatint Paper Grain Stipple */}
    <pattern
      id={`stipple-${uid}`}
      width="28"
      height="28"
      patternUnits="userSpaceOnUse"
    >
      <circle cx="4" cy="6" r="0.55" fill="#243B8A" opacity="0.2" />
      <circle cx="15" cy="3" r="0.45" fill="#C89D54" opacity="0.24" />
      <circle cx="24" cy="12" r="0.5" fill="#1B2D6B" opacity="0.18" />
      <circle cx="9" cy="19" r="0.45" fill="#C89D54" opacity="0.22" />
      <circle cx="21" cy="24" r="0.55" fill="#243B8A" opacity="0.16" />
    </pattern>
  </defs>
);

/**
 * Engraved Nanded Riverfront Heritage Complex (Dome, Lotus Finial, Chhatris,
 * Arched Stone Colonnade, Corner Minars & Subtle Inverted Godavari Reflection).
 */
const NandedRiverfrontComplex: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform}>
    {/* Main Architectural Engraving */}
    <g fill="#1B2D6B" stroke="#1B2D6B" strokeLinejoin="round">
      {/* Plinth & Carved Terrace Cornice */}
      <rect x="20" y="90" width="184" height="7" rx="0.8" opacity="0.86" stroke="none" />
      <line x1="14" y1="90" x2="210" y2="90" stroke={surfaceHex} strokeWidth="0.9" opacity="0.55" />

      {/* Central Pavilion Body */}
      <rect x="34" y="54" width="156" height="36" rx="1" opacity="0.82" stroke="none" />
      {/* Cornice Chhajja Eave */}
      <path d="M 28 54 L 196 54 L 192 58 L 32 58 Z" opacity="0.9" stroke="none" />

      {/* Central Fluted Dome with Lotus Base & Kalasha Finial */}
      <path d="M 78 54 C 76 34, 92 20, 112 18 C 132 20, 148 34, 146 54 Z" opacity="0.88" stroke="none" />
      {/* Engraved Dome Ribbing */}
      <path
        d="M 96 54 C 96 36, 103 24, 112 19 M 112 54 L 112 19 M 128 54 C 128 36, 121 24, 112 19"
        fill="none"
        stroke={surfaceHex}
        strokeWidth="0.75"
        opacity="0.45"
      />
      {/* Lotus Neck & Golden Finial */}
      <path d="M 105 19 Q 112 15 119 19" fill="none" stroke="#C89D54" strokeWidth="1.2" opacity="0.85" />
      <line x1="112" y1="18" x2="112" y2="5" stroke="#C89D54" strokeWidth="1.5" opacity="0.92" />
      <circle cx="112" cy="8.5" r="2.1" fill="#C89D54" stroke="none" opacity="0.92" />
      <circle cx="112" cy="4.2" r="1.2" fill="#C89D54" stroke="none" opacity="0.92" />

      {/* Flanking Chhatri Cupolas */}
      <g opacity="0.85" stroke="none">
        <path d="M 46 54 C 46 43, 53 38, 61 38 C 69 38, 76 43, 76 54 Z" />
        <line x1="61" y1="38" x2="61" y2="31" stroke="#C89D54" strokeWidth="1.1" />
        <circle cx="61" cy="31" r="1.3" fill="#C89D54" />
        <path d="M 148 54 C 148 43, 155 38, 163 38 C 171 38, 178 43, 178 54 Z" />
        <line x1="163" y1="38" x2="163" y2="31" stroke="#C89D54" strokeWidth="1.1" />
        <circle cx="163" cy="31" r="1.3" fill="#C89D54" />
      </g>

      {/* Slender Corner Minars with Balcony Corbels */}
      <g opacity="0.84" stroke="none">
        <rect x="20" y="28" width="9" height="62" rx="0.8" />
        <rect x="17.5" y="48" width="14" height="2.4" />
        <rect x="17.5" y="68" width="14" height="2.2" />
        <path d="M 18 29 C 18 21, 31 21, 31 29 Z" />
        <line x1="24.5" y1="22" x2="24.5" y2="16" stroke="#C89D54" strokeWidth="1" />

        <rect x="195" y="28" width="9" height="62" rx="0.8" />
        <rect x="192.5" y="48" width="14" height="2.4" />
        <rect x="192.5" y="68" width="14" height="2.2" />
        <path d="M 193 29 C 193 21, 206 21, 206 29 Z" />
        <line x1="199.5" y1="22" x2="199.5" y2="16" stroke="#C89D54" strokeWidth="1" />
      </g>

      {/* Recessed Cusped Deccan Colonnade Arches */}
      <path
        d="M 46 90 L 46 72 Q 53 63 60 72 L 60 90 Z
           M 72 90 L 72 70 Q 80 61 88 70 L 88 90 Z
           M 101 90 L 101 66 Q 112 56 123 66 L 123 90 Z
           M 136 90 L 136 70 Q 144 61 152 70 L 152 90 Z
           M 164 90 L 164 72 Q 171 63 178 72 L 178 90 Z"
        fill={surfaceHex}
        stroke="none"
        opacity="0.68"
      />

      {/* Restrained Dusk Diya Lamp Glints Inside the Arches */}
      <g className="akath-diya-glint" stroke="none">
        <circle cx="112" cy="83" r="2.1" fill="#EF6855" opacity="0.72" />
        <circle cx="80" cy="84" r="1.4" fill="#C89D54" opacity="0.68" />
        <circle cx="144" cy="84" r="1.4" fill="#C89D54" opacity="0.68" />
      </g>
    </g>
  </g>
);

/**
 * Engraved Sahyadri Maratha Hill-Fort Bastion (Buruj, Crenellated Curtain Wall & Masonry Lines).
 */
const SahyadriFortBastion: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform}>
    {/* Rounded Stone Buruj (Bastion Tower) & Curtain Rampart */}
    <path
      d="M 0 28 L 0 12 L 8 12 L 8 8 L 15 8 L 15 12 L 24 12 L 24 8 L 32 8 L 32 12 L 42 12 L 42 5 L 50 5 L 50 9 L 58 9 L 58 5 L 66 5 L 66 9 L 74 9 L 74 5 L 82 5 L 82 14 L 94 14 L 94 10 L 102 10 L 102 14 L 112 14 L 112 28 Z"
      fill="#1B2D6B"
      opacity="0.84"
    />
    {/* Engraved Masonry Stone Courses & Embrasure Slits */}
    <g stroke={surfaceHex} strokeWidth="0.7" opacity="0.46">
      <line x1="3" y1="18" x2="108" y2="18" />
      <line x1="6" y1="23" x2="106" y2="23" />
      <line x1="48" y1="11" x2="48" y2="16" />
      <line x1="62" y1="11" x2="62" y2="16" />
      <line x1="76" y1="11" x2="76" y2="16" />
    </g>
    {/* Subtle Gate Archway */}
    <path d="M 19 28 L 19 20 Q 24 16 29 20 L 29 28 Z" fill={surfaceHex} opacity="0.58" />
    {/* Slender Watchtower Flagstaff */}
    <line x1="62" y1="5" x2="62" y2="-11" stroke="#1B2D6B" strokeWidth="1.15" opacity="0.78" />
    <path d="M 62 -11 L 73 -8 L 62 -5 Z" fill="#EF6855" opacity="0.68" />
  </g>
);

/**
 * Hand-Engraved Mature Banyan Tree (Gnarled Trunk, Multi-Cluster Canopy & Hanging Aerial Roots).
 */
const EngravedBanyanTree: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform}>
    {/* Layered Botanical Foliage Clusters */}
    <path
      d="M 18 68 C 6 58, 12 38, 30 35 C 34 18, 56 10, 76 16 C 88 4, 118 4, 132 18 C 154 14, 174 28, 172 48 C 186 52, 184 72, 164 76 C 148 82, 126 78, 114 74 C 94 82, 66 80, 50 74 C 34 78, 22 74, 18 68 Z"
      fill="#174D3A"
      opacity="0.82"
    />
    {/* Fine Woodcut Canopy Highlight Contours */}
    <path
      d="M 38 40 Q 60 28 84 34 M 92 24 Q 118 18 142 30 M 118 52 Q 144 44 164 54 M 28 58 Q 52 52 72 60"
      fill="none"
      stroke={surfaceHex}
      strokeWidth="0.95"
      strokeLinecap="round"
      opacity="0.4"
    />
    {/* Organic Fluted Banyan Trunk & Buttress Roots */}
    <path
      d="M 86 72 C 88 92, 82 112, 72 124 L 84 124 C 90 114, 96 108, 100 112 C 104 116, 108 122, 114 124 L 126 124 C 114 110, 108 92, 110 72 Z"
      fill="#174D3A"
      opacity="0.9"
    />
    {/* Primary Spreading Limbs */}
    <path
      d="M 94 74 Q 72 62 52 62 M 102 74 Q 124 60 148 64"
      fill="none"
      stroke="#174D3A"
      strokeWidth="4.2"
      strokeLinecap="round"
      opacity="0.85"
    />
    {/* Delicate Vertical Hanging Aerial Roots (Jata) */}
    <g
      stroke="#174D3A"
      strokeLinecap="round"
      fill="none"
      opacity="0.62"
    >
      <path d="M 46 72 C 45 88, 47 104, 45 120" strokeWidth="1.25" />
      <path d="M 54 74 C 55 86, 53 98, 54 114" strokeWidth="0.9" />
      <path d="M 68 74 C 67 90, 69 104, 67 118" strokeWidth="1.05" />
      <path d="M 134 73 C 135 89, 133 105, 135 121" strokeWidth="1.25" />
      <path d="M 144 74 C 143 86, 145 96, 144 108" strokeWidth="0.85" />
      <path d="M 156 72 C 157 86, 155 100, 156 116" strokeWidth="1.0" />
    </g>
  </g>
);

/**
 * Feathery Marathwada Neem Tree Silhouette (Delicate Branching & Fine Foliate Sprays).
 */
const EngravedNeemTree: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform}>
    {/* Airy Layered Neem Crown */}
    <path
      d="M 14 54 C 8 40, 22 24, 38 24 C 46 10, 72 6, 86 18 C 102 12, 122 22, 124 38 C 136 44, 132 60, 114 62 C 98 68, 76 62, 64 60 C 48 66, 22 64, 14 54 Z"
      fill="#174D3A"
      opacity="0.76"
    />
    {/* Fine Etched Pinnate Leaf Texture */}
    <g stroke={surfaceHex} strokeWidth="0.85" strokeLinecap="round" opacity="0.42" fill="none">
      <path d="M 32 34 Q 44 26 56 32" />
      <path d="M 62 22 Q 76 18 90 26" />
      <path d="M 86 40 Q 100 34 114 42" />
      <path d="M 42 48 Q 56 44 70 50" />
    </g>
    {/* Graceful Leaning Trunk */}
    <path
      d="M 66 56 C 68 74, 64 94, 58 106 L 68 106 C 72 94, 76 76, 75 56 Z"
      fill="#174D3A"
      opacity="0.86"
    />
    <path
      d="M 68 62 Q 52 50 40 50 M 73 60 Q 90 48 104 52"
      fill="none"
      stroke="#174D3A"
      strokeWidth="2.6"
      strokeLinecap="round"
      opacity="0.8"
    />
  </g>
);

/**
 * Delicate Godavari Riverfront Reeds & Sedges Cluster.
 */
const GodavariReeds: React.FC<{ transform: string }> = ({ transform }) => (
  <g
    transform={transform}
    fill="none"
    stroke="#174D3A"
    strokeLinecap="round"
    opacity="0.72"
  >
    <path d="M 6 48 Q 2 28 -4 10" strokeWidth="1.2" />
    <path d="M 14 48 Q 14 26 11 4" strokeWidth="1.35" />
    <ellipse cx="10.5" cy="9" rx="1.7" ry="4.5" fill="#174D3A" stroke="none" />
    <path d="M 22 48 Q 26 28 31 12" strokeWidth="1.1" />
    <path d="M 30 48 Q 36 32 42 18" strokeWidth="1.0" />
    <path d="M 38 48 Q 40 30 39 8" strokeWidth="1.25" />
    <ellipse cx="39" cy="13" rx="1.6" ry="4.2" fill="#174D3A" stroke="none" />
    <path d="M 46 48 Q 52 34 58 22" strokeWidth="0.95" />
  </g>
);

/**
 * Traditional Maharashtra Stone Deepstambh (Riverside Lamp Pillar) Silhouette.
 */
const StoneDeepstambh: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform}>
    <path
      d="M 10 74 L 15 16 L 23 16 L 28 74 Z"
      fill="#1B2D6B"
      opacity="0.82"
    />
    {/* Stepped Plinth & Finial Cap */}
    <rect x="6" y="72" width="26" height="6" rx="0.8" fill="#1B2D6B" opacity="0.88" />
    <path d="M 13 16 L 19 6 L 25 16 Z" fill="#1B2D6B" opacity="0.88" />
    {/* Carved Lamp Brackets */}
    <g stroke="#1B2D6B" strokeWidth="1.4" strokeLinecap="round" opacity="0.82">
      <line x1="9" y1="28" x2="29" y2="28" />
      <line x1="8" y1="40" x2="30" y2="40" />
      <line x1="7" y1="52" x2="31" y2="52" />
      <line x1="6" y1="64" x2="32" y2="64" />
    </g>
    {/* Masonry Etch & Tiny Dusk Flame Accent */}
    <line x1="19" y1="18" x2="19" y2="70" stroke={surfaceHex} strokeWidth="0.65" opacity="0.38" />
    <circle cx="19" cy="4" r="1.8" fill="#EF6855" className="akath-diya-glint" opacity="0.72" />
  </g>
);

/**
 * Intimate Engraved Godavari Stone Ghat Pavilion, Weathered Steps & Quiet Moored Wooden Skiff
 * (Commissioned specifically for the "04 · For Authors" contemplative riverfront study).
 */
const EngravedGhatMandapa: React.FC<{
  transform: string;
  surfaceHex: string;
}> = ({ transform, surfaceHex }) => (
  <g transform={transform}>
    {/* Stone Ghat Pavilion (Mandapa) */}
    <g fill="#1B2D6B">
      {/* Stepped Chhatri Roof & Lotus Finial */}
      <path d="M 52 52 C 52 28, 72 16, 94 16 C 116 16, 136 28, 136 52 Z" opacity="0.86" />
      <path
        d="M 74 52 C 74 34, 83 22, 94 17 M 94 52 L 94 17 M 114 52 C 114 34, 105 22, 94 17"
        fill="none"
        stroke={surfaceHex}
        strokeWidth="0.8"
        opacity="0.44"
      />
      <line x1="94" y1="16" x2="94" y2="3" stroke="#C89D54" strokeWidth="1.6" opacity="0.9" />
      <circle cx="94" cy="6" r="2.2" fill="#C89D54" opacity="0.9" />

      {/* Overhanging Carved Stone Chhajja Eave */}
      <path d="M 28 52 L 160 52 L 154 59 L 34 59 Z" opacity="0.9" />

      {/* Tall Slender Carved Pillars & Cusped Arches */}
      <rect x="38" y="58" width="9" height="66" opacity="0.86" />
      <rect x="74" y="58" width="8" height="66" opacity="0.84" />
      <rect x="106" y="58" width="8" height="66" opacity="0.84" />
      <rect x="141" y="58" width="9" height="66" opacity="0.86" />

      {/* Arch Spandrels Between Columns */}
      <path
        d="M 47 58 L 74 58 L 74 75 Q 60.5 64 47 75 Z
           M 82 58 L 106 58 L 106 74 Q 94 63 82 74 Z
           M 114 58 L 141 58 L 141 75 Q 127.5 64 114 75 Z"
        opacity="0.82"
      />

      {/* Quiet Hanging Dusk Lantern Inside Center Arch */}
      <line x1="94" y1="65" x2="94" y2="80" stroke="#C89D54" strokeWidth="0.9" opacity="0.76" />
      <circle cx="94" cy="82" r="2.5" fill="#EF6855" className="akath-diya-glint" opacity="0.78" />
    </g>

    {/* Broad Descending Weathered Stone Ghat Steps */}
    <g fill="#1B2D6B">
      <rect x="16" y="124" width="164" height="8" rx="0.8" opacity="0.86" />
      <rect x="6" y="133" width="192" height="8" rx="0.8" opacity="0.78" />
      <rect x="-4" y="142" width="218" height="8" rx="0.8" opacity="0.7" />
      <rect x="-14" y="151" width="242" height="9" rx="0.8" opacity="0.62" />
    </g>
    {/* Stone Masonry Step Highlights */}
    <g stroke={surfaceHex} strokeWidth="0.95" opacity="0.52">
      <line x1="18" y1="124.5" x2="178" y2="124.5" />
      <line x1="8" y1="133.5" x2="196" y2="133.5" />
      <line x1="-2" y1="142.5" x2="212" y2="142.5" />
      <line x1="-12" y1="151.5" x2="226" y2="151.5" />
    </g>

    {/* Quiet Moored Wooden River Skiff (Hodi) Resting Beside the Lower Ghat */}
    <g transform="translate(212, 147)">
      {/* Mooring Post & Slack Rope */}
      <line x1="-8" y1="1" x2="-8" y2="16" stroke="#1B2D6B" strokeWidth="2.4" strokeLinecap="round" opacity="0.84" />
      <path d="M -7 5 Q 4 12 16 11" fill="none" stroke="#1B2D6B" strokeWidth="0.95" opacity="0.68" />
      {/* Graceful Curved Hull Silhouette */}
      <path
        d="M 8 10 C 16 18, 62 19, 82 9 C 72 13, 24 13, 8 10 Z"
        fill="#1B2D6B"
        opacity="0.84"
      />
      {/* Resting Oar & Subtle Waterline Shadow */}
      <line x1="28" y1="11" x2="62" y2="6" stroke="#1B2D6B" strokeWidth="1.2" strokeLinecap="round" opacity="0.74" />
      <path d="M 14 19 Q 46 22 76 19" fill="none" stroke="#C89D54" strokeWidth="1" opacity="0.62" />
    </g>
  </g>
);

/* ============================================================================
   1. HERO — CHAPTER I: TWILIGHT PANORAMA
   Wide Deccan vista uniting authentic Sahyadri basalt mesas, valley mist,
   distant hill-fort watchtower, Nanded riverfront heritage skyline with
   Godavari reflection, stepped ghats, and framing banyan & reeds.
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
            'radial-gradient(ellipse 84% 52% at 50% 16%, rgba(200, 157, 84, 0.12) 0%, rgba(239, 104, 85, 0.055) 44%, rgba(250, 248, 240, 0) 78%)',
        }}
      />

      {/* Responsive Framing Container — Preserves Landmarks Without Indiscriminate Cropping */}
      <div className="relative w-full h-[500px] sm:h-[560px] lg:h-[630px] max-w-[1680px] mx-auto overflow-hidden">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-[0.21] sm:opacity-[0.23] lg:opacity-[0.25]"
        >
          <EngravingDefs uid={uid} surfaceHex={surfaceHex} sunCy="62%" />

          {/* Subtle Rag-Paper Aquatint Stipple Field */}
          <rect width="100%" height="100%" fill={`url(#stipple-${uid})`} opacity="0.55" />

          {/* Dusk Solar Glow Behind the Sahyadri Horizon */}
          <ellipse
            cx={isMobile ? 320 : isTablet ? 560 : 800}
            cy={isMobile ? 430 : 368}
            rx={isMobile ? 320 : isTablet ? 470 : 620}
            ry={isMobile ? 210 : 245}
            fill={`url(#duskSun-${uid})`}
          />

          {/* Fine Astronomical Dusk Arcs & Waning Crescent Moon */}
          <g className="akath-parallax-far">
            {isMobile ? (
              <>
                <path
                  d="M 24 410 Q 320 220 616 410"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1"
                  strokeDasharray="3.5 7.5"
                  opacity="0.46"
                />
                <g transform="translate(534, 154) scale(0.86)">
                  <path
                    d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                    fill="#243B8A"
                    opacity="0.82"
                  />
                  <circle cx="-14" cy="18" r="2.2" fill="#C89D54" opacity="0.9" />
                  <circle cx="48" cy="10" r="1.6" fill="#243B8A" opacity="0.72" />
                </g>
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M 60 356 Q 560 128 1060 356"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.05"
                  strokeDasharray="4 8"
                  opacity="0.48"
                />
                <path
                  d="M 180 384 Q 560 212 940 384"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="0.85"
                  strokeDasharray="2 7"
                  opacity="0.44"
                />
                <g transform="translate(920, 108)">
                  <path
                    d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                    fill="#243B8A"
                    opacity="0.82"
                  />
                  <circle cx="-18" cy="18" r="2.3" fill="#C89D54" opacity="0.92" />
                  <circle cx="52" cy="8" r="1.8" fill="#243B8A" opacity="0.74" />
                </g>
              </>
            ) : (
              <>
                <path
                  d="M 96 344 Q 800 108 1504 344"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.1"
                  strokeDasharray="4 8"
                  opacity="0.48"
                />
                <path
                  d="M 240 374 Q 800 194 1360 374"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="0.9"
                  strokeDasharray="2 7"
                  opacity="0.46"
                />
                <g transform="translate(1324, 106)">
                  <path
                    d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                    fill="#243B8A"
                    opacity="0.82"
                  />
                  <circle cx="-18" cy="18" r="2.4" fill="#C89D54" opacity="0.92" />
                  <circle cx="52" cy="8" r="1.8" fill="#243B8A" opacity="0.74" />
                  <circle cx="38" cy="-14" r="1.5" fill="#C89D54" opacity="0.78" />
                </g>
              </>
            )}

            {/* Quiet Evening Birds Over the Western Escarpment */}
            <g
              fill="none"
              stroke="#1B2D6B"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.68"
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

            {/* LAYER 1 — Authentic Stepped Sahyadri Flat-Topped Basalt Mesas */}
            {isMobile ? (
              <g>
                <path
                  d="M -16 488 C 12 454, 34 422, 66 418 L 138 416 C 154 416, 166 436, 192 444 C 228 452, 258 432, 294 432 L 344 434 C 368 436, 392 454, 424 446 C 452 438, 474 402, 504 398 L 574 398 C 598 400, 622 426, 656 436 L 656 680 L -16 680 Z"
                  fill={`url(#farRidge-${uid})`}
                />
                <path
                  d="M -16 488 C 12 454, 34 422, 66 418 L 138 416 C 154 416, 166 436, 192 444 C 228 452, 258 432, 294 432 L 344 434 C 368 436, 392 454, 424 446 C 452 438, 474 402, 504 398 L 574 398 C 598 400, 622 426, 656 436 L 656 680 L -16 680 Z"
                  fill={`url(#strataHoriz-${uid})`}
                />
                <path
                  d="M -16 488 C 12 454, 34 422, 66 418 L 138 416 C 154 416, 166 436, 192 444 C 228 452, 258 432, 294 432 L 344 434 C 368 436, 392 454, 424 446 C 452 438, 474 402, 504 398 L 574 398 C 598 400, 622 426, 656 436"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.35"
                  opacity="0.62"
                />
              </g>
            ) : isTablet ? (
              <g>
                <path
                  d="M -16 432 C 28 386, 62 346, 108 342 L 210 340 C 234 340, 252 366, 286 372 C 330 378, 368 326, 412 320 L 494 318 C 534 322, 566 364, 622 368 C 674 370, 710 330, 756 324 L 832 322 C 864 324, 886 352, 922 342 C 958 332, 984 298, 1022 296 L 1094 298 L 1136 330 L 1136 620 L -16 620 Z"
                  fill={`url(#farRidge-${uid})`}
                />
                <path
                  d="M -16 432 C 28 386, 62 346, 108 342 L 210 340 C 234 340, 252 366, 286 372 C 330 378, 368 326, 412 320 L 494 318 C 534 322, 566 364, 622 368 C 674 370, 710 330, 756 324 L 832 322 C 864 324, 886 352, 922 342 C 958 332, 984 298, 1022 296 L 1094 298 L 1136 330 L 1136 620 L -16 620 Z"
                  fill={`url(#strataHoriz-${uid})`}
                />
                <path
                  d="M -16 432 C 28 386, 62 346, 108 342 L 210 340 C 234 340, 252 366, 286 372 C 330 378, 368 326, 412 320 L 494 318 C 534 322, 566 364, 622 368 C 674 370, 710 330, 756 324 L 832 322 C 864 324, 886 352, 922 342 C 958 332, 984 298, 1022 296 L 1094 298 L 1136 330"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.35"
                  opacity="0.62"
                />
              </g>
            ) : (
              <g>
                <path
                  d="M -20 426 C 28 378, 66 338, 118 332 L 236 330 C 266 332, 288 362, 330 368 C 378 374, 414 302, 464 294 L 568 292 C 612 296, 646 348, 706 354 C 768 360, 816 332, 868 330 L 948 328 C 986 332, 1022 356, 1068 348 C 1118 340, 1152 282, 1204 276 L 1318 274 C 1356 278, 1390 318, 1438 312 C 1484 306, 1528 294, 1620 332 L 1620 620 L -20 620 Z"
                  fill={`url(#farRidge-${uid})`}
                />
                {/* Deccan Basalt Horizontal Strata Etching */}
                <path
                  d="M -20 426 C 28 378, 66 338, 118 332 L 236 330 C 266 332, 288 362, 330 368 C 378 374, 414 302, 464 294 L 568 292 C 612 296, 646 348, 706 354 C 768 360, 816 332, 868 330 L 948 328 C 986 332, 1022 356, 1068 348 C 1118 340, 1152 282, 1204 276 L 1318 274 C 1356 278, 1390 318, 1438 312 C 1484 306, 1528 294, 1620 332 L 1620 620 L -20 620 Z"
                  fill={`url(#strataHoriz-${uid})`}
                />
                {/* Engraved Cliff Rim Contour */}
                <path
                  d="M -20 426 C 28 378, 66 338, 118 332 L 236 330 C 266 332, 288 362, 330 368 C 378 374, 414 302, 464 294 L 568 292 C 612 296, 646 348, 706 354 C 768 360, 816 332, 868 330 L 948 328 C 986 332, 1022 356, 1068 348 C 1118 340, 1152 282, 1204 276 L 1318 274 C 1356 278, 1390 318, 1438 312 C 1484 306, 1528 294, 1620 332"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.4"
                  opacity="0.62"
                />
                {/* Fine Escarpment Spur Contours */}
                <g stroke="#243B8A" strokeWidth="0.9" fill="none" opacity="0.42">
                  <path d="M 118 332 Q 146 364 188 386" />
                  <path d="M 464 294 Q 492 332 544 360" />
                  <path d="M 1204 276 Q 1236 318 1286 346" />
                </g>
              </g>
            )}
          </g>

          {/* Drifting Atmospheric Valley Mist Band 1 (Separates Far Mesas from Mid Escarpment) */}
          <rect
            x="-60"
            y={isMobile ? 430 : 344}
            width={isMobile ? 760 : isTablet ? 1240 : 1720}
            height={isMobile ? 76 : 84}
            fill={`url(#valleyMist-${uid})`}
            className="akath-landscape-mist-slow"
            opacity="0.72"
          />

          {/* LAYER 2 — Midground Sahyadri Escarpments, Fort Bastion & Nanded Heritage Skyline */}
          <g className="akath-parallax-mid">
            {isMobile ? (
              <>
                <path
                  d="M -16 532 C 26 492, 58 470, 98 468 L 166 468 C 194 470, 218 502, 266 508 C 318 514, 354 494, 404 490 C 444 486, 476 460, 524 460 L 604 462 L 656 488 L 656 680 L -16 680 Z"
                  fill={`url(#midRidge-${uid})`}
                />
                <path
                  d="M -16 532 C 26 492, 58 470, 98 468 L 166 468 C 194 470, 218 502, 266 508 C 318 514, 354 494, 404 490 C 444 486, 476 460, 524 460 L 604 462 L 656 488 L 656 680 L -16 680 Z"
                  fill={`url(#hatchDiag-${uid})`}
                  opacity="0.55"
                />
                <path
                  d="M -16 532 C 26 492, 58 470, 98 468 L 166 468 C 194 470, 218 502, 266 508 C 318 514, 354 494, 404 490 C 444 486, 476 460, 524 460 L 604 462 L 656 488"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.05"
                  opacity="0.52"
                />
                <SahyadriFortBastion
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
                  fill={`url(#midRidge-${uid})`}
                />
                <path
                  d="M -16 474 C 46 422, 92 396, 148 394 L 244 394 C 282 398, 316 426, 368 424 C 424 422, 464 388, 524 396 C 588 406, 646 432, 712 418 C 772 404, 818 370, 882 368 L 972 368 C 1024 372, 1072 396, 1136 408 L 1136 620 L -16 620 Z"
                  fill={`url(#hatchDiag-${uid})`}
                  opacity="0.52"
                />
                <path
                  d="M -16 474 C 46 422, 92 396, 148 394 L 244 394 C 282 398, 316 426, 368 424 C 424 422, 464 388, 524 396 C 588 406, 646 432, 712 418 C 772 404, 818 370, 882 368 L 972 368 C 1024 372, 1072 396, 1136 408"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.1"
                  opacity="0.5"
                />
                <SahyadriFortBastion
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
                  fill={`url(#midRidge-${uid})`}
                />
                {/* Copperplate Diagonal Shadow Hatching Across Midground Escarpment */}
                <path
                  d="M -20 472 C 46 418, 96 386, 164 382 L 266 380 C 308 384, 344 408, 392 374 C 424 352, 454 348, 502 348 L 574 348 C 618 354, 658 408, 738 416 C 824 424, 884 390, 956 378 C 1018 368, 1068 388, 1126 364 C 1176 344, 1218 342, 1296 344 L 1384 348 C 1442 354, 1510 384, 1620 402 L 1620 620 L -20 620 Z"
                  fill={`url(#hatchDiag-${uid})`}
                  opacity="0.54"
                />
                <path
                  d="M -20 472 C 46 418, 96 386, 164 382 L 266 380 C 308 384, 344 408, 392 374 C 424 352, 454 348, 502 348 L 574 348 C 618 354, 658 408, 738 416 C 824 424, 884 390, 956 378 C 1018 368, 1068 388, 1126 364 C 1176 344, 1218 342, 1296 344 L 1384 348 C 1442 354, 1510 384, 1620 402"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.15"
                  opacity="0.5"
                />
                {/* Distant Sahyadri Hill-Fort Bastion (Left Escarpment) */}
                <SahyadriFortBastion
                  transform="translate(464, 324) scale(0.92)"
                  surfaceHex={surfaceHex}
                />
                {/* Nanded Riverfront Heritage Complex (Right Bank) */}
                <NandedRiverfrontComplex
                  transform="translate(1168, 304) scale(1.06)"
                  surfaceHex={surfaceHex}
                />
              </>
            )}
          </g>

          {/* Subtle Lower Valley Mist Band 2 */}
          <rect
            x="-60"
            y={isMobile ? 512 : 422}
            width={isMobile ? 760 : isTablet ? 1240 : 1720}
            height={isMobile ? 52 : 58}
            fill={`url(#valleyMist-${uid})`}
            className="akath-landscape-mist-deep"
            opacity="0.56"
          />

          {/* LAYER 3 — Foreground Botanicals, Stepped Nanded Godavari Ghats & Shimmering River */}
          <g className="akath-parallax-near">
            {/* Organic Banyan, Neem & Riverbank Reeds */}
            {isMobile ? (
              <>
                <EngravedBanyanTree
                  transform="translate(18, 460) scale(0.68)"
                  surfaceHex={surfaceHex}
                />
                <GodavariReeds transform="translate(152, 536) scale(0.75)" />
                <GodavariReeds transform="translate(566, 538) scale(0.7)" />
              </>
            ) : isTablet ? (
              <>
                <EngravedBanyanTree
                  transform="translate(56, 386) scale(0.86)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(216, 404) scale(0.74)"
                  surfaceHex={surfaceHex}
                />
                <GodavariReeds transform="translate(298, 466) scale(0.84)" />
              </>
            ) : (
              <>
                <EngravedBanyanTree
                  transform="translate(88, 376) scale(1.02)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(268, 398) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
                <GodavariReeds transform="translate(366, 462) scale(0.95)" />
                <GodavariReeds transform="translate(1486, 464) scale(0.9)" />
              </>
            )}

            {/* Foreground Rolling Riverbank & Ghat Embankment */}
            {isMobile ? (
              <>
                <path
                  d="M -16 560 Q 112 534 234 552 T 456 544 Q 554 532 656 548 L 656 680 L -16 680 Z"
                  fill={`url(#nearBank-${uid})`}
                />
                {/* Engraved Stone Ghat Steps Along Right Bank */}
                <g stroke={surfaceHex} strokeWidth="1.15" opacity="0.58">
                  <line x1="378" y1="550" x2="624" y2="550" />
                  <line x1="364" y1="558" x2="634" y2="558" />
                  <line x1="350" y1="566" x2="642" y2="566" />
                </g>
                {/* Godavari River Dusk Band */}
                <path
                  d="M -16 588 Q 160 572 332 586 T 656 584 L 656 648 Q 450 634 260 642 T -16 646 Z"
                  fill={`url(#riverBand-${uid})`}
                />
                {/* Restrained Inverted Nanded Heritage Reflection on the Godavari */}
                <g stroke="#1B2D6B" strokeWidth="1.2" strokeLinecap="round" opacity="0.28">
                  <line x1="454" y1="598" x2="574" y2="598" />
                  <line x1="472" y1="608" x2="556" y2="608" />
                  <line x1="490" y1="618" x2="538" y2="618" />
                </g>
                <g stroke="#C89D54" strokeWidth="1.2" strokeLinecap="round">
                  <line x1="94" y1="602" x2="188" y2="602" className="akath-river-shimmer-a" />
                  <line x1="256" y1="612" x2="392" y2="612" className="akath-river-shimmer-b" />
                  <line x1="436" y1="604" x2="544" y2="604" className="akath-river-shimmer-a" />
                </g>
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 492 Q 180 460 370 480 T 740 474 Q 930 456 1136 476 L 1136 620 L -16 620 Z"
                  fill={`url(#nearBank-${uid})`}
                />
                <g stroke={surfaceHex} strokeWidth="1.25" opacity="0.56">
                  <line x1="744" y1="478" x2="1072" y2="478" />
                  <line x1="726" y1="487" x2="1090" y2="487" />
                  <line x1="708" y1="496" x2="1108" y2="496" />
                </g>
                <path
                  d="M -16 524 Q 260 500 540 520 T 1136 522 L 1136 584 Q 820 564 520 576 T -16 582 Z"
                  fill={`url(#riverBand-${uid})`}
                />
                <g stroke="#1B2D6B" strokeWidth="1.25" strokeLinecap="round" opacity="0.28">
                  <line x1="846" y1="534" x2="984" y2="534" />
                  <line x1="868" y1="544" x2="962" y2="544" />
                  <line x1="888" y1="554" x2="942" y2="554" />
                </g>
                <g stroke="#C89D54" strokeWidth="1.3" strokeLinecap="round">
                  <line x1="220" y1="538" x2="345" y2="538" className="akath-river-shimmer-a" />
                  <line x1="470" y1="548" x2="645" y2="548" className="akath-river-shimmer-b" />
                  <line x1="750" y1="540" x2="885" y2="540" className="akath-river-shimmer-a" />
                  <line x1="518" y1="559" x2="615" y2="559" className="akath-river-shimmer-b" />
                </g>
              </>
            ) : (
              <>
                <path
                  d="M -20 492 Q 160 456 346 478 T 700 486 Q 832 492 954 474 T 1316 460 Q 1474 452 1620 476 L 1620 620 L -20 620 Z"
                  fill={`url(#nearBank-${uid})`}
                />
                {/* Stepped Nanded Stone Ghat Steps Along Right Riverfront */}
                <g stroke={surfaceHex} strokeWidth="1.3" opacity="0.56">
                  <line x1="1084" y1="476" x2="1456" y2="476" />
                  <line x1="1062" y1="485" x2="1478" y2="485" />
                  <line x1="1040" y1="494" x2="1500" y2="494" />
                  <line x1="1024" y1="503" x2="1518" y2="503" opacity="0.7" />
                </g>
                {/* Winding Godavari River Dusk Reflection Band */}
                <path
                  d="M -20 524 Q 320 498 660 522 T 1320 516 Q 1470 510 1620 526 L 1620 586 Q 1340 562 980 578 T 320 572 Q 140 568 -20 582 Z"
                  fill={`url(#riverBand-${uid})`}
                />
                {/* Engraved Broken Water Reflection Directly Below Nanded Riverfront Dome */}
                <g stroke="#1B2D6B" strokeWidth="1.35" strokeLinecap="round" opacity="0.28">
                  <line x1="1206" y1="532" x2="1366" y2="532" />
                  <line x1="1228" y1="542" x2="1344" y2="542" />
                  <line x1="1250" y1="552" x2="1322" y2="552" />
                  <line x1="1272" y1="561" x2="1302" y2="561" />
                </g>
                {/* Fine Copperplate Water Shimmer Lines */}
                <g stroke="#C89D54" strokeWidth="1.3" strokeLinecap="round">
                  <line x1="210" y1="549" x2="318" y2="549" className="akath-river-shimmer-b" />
                  <line x1="420" y1="536" x2="552" y2="536" className="akath-river-shimmer-a" />
                  <line x1="686" y1="545" x2="880" y2="545" className="akath-river-shimmer-b" />
                  <line x1="742" y1="556" x2="844" y2="556" className="akath-river-shimmer-a" />
                  <line x1="994" y1="538" x2="1136" y2="538" className="akath-river-shimmer-b" />
                  <line x1="1212" y1="548" x2="1348" y2="548" className="akath-river-shimmer-a" />
                </g>
              </>
            )}
          </g>
        </svg>

        {/* Precision Center Readability Veil — Protects Hero Typography While Outer Landmarks Stay Crisp */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 56% at 50% 39%, rgba(250, 248, 240, 0.68) 0%, rgba(250, 248, 240, 0.28) 62%, rgba(250, 248, 240, 0) 100%)',
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
   2. FOR AUTHORS — CHAPTER II: INTIMATE GODAVARI GHAT STUDY
   Original closer riverfront composition: weathered stone ghat steps, an
   engraved cusped-arch riverfront mandapa, quiet moored wooden skiff,
   traditional stone deepstambh, neem foliage, slender river reeds, and calm
   hatched dusk water framed by distant misty Marathwada hills.
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
            'radial-gradient(ellipse 84% 56% at 50% 18%, rgba(200, 157, 84, 0.13) 0%, rgba(239, 104, 85, 0.05) 46%, rgba(244, 237, 224, 0) 78%)',
        }}
      />

      <div className="relative w-full h-full max-w-[1680px] mx-auto overflow-hidden flex items-end">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-[0.21] sm:opacity-[0.23] lg:opacity-[0.25]"
        >
          <EngravingDefs uid={uid} surfaceHex={surfaceHex} sunCy="58%" />

          {/* Whisper-Light Archival Rag-Paper Stipple */}
          <rect width="100%" height="100%" fill={`url(#stipple-${uid})`} opacity="0.5" />

          {/* Calm Low Horizon Dusk Glow */}
          <ellipse
            cx={isMobile ? 320 : isTablet ? 560 : 800}
            cy={isMobile ? 510 : 460}
            rx={isMobile ? 310 : isTablet ? 470 : 620}
            ry={isMobile ? 190 : 230}
            fill={`url(#duskSun-${uid})`}
          />

          {/* Far Plane — Soft, Low Distant Marathwada Hills & Quiet Evening Crescent */}
          <g className="akath-parallax-far">
            {/* Restrained Evening Crescent Tucked High Left */}
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
                opacity="0.78"
              />
              <circle cx="58" cy="18" r="2.1" fill="#C89D54" opacity="0.88" />
              <circle cx="-12" cy="10" r="1.5" fill="#243B8A" opacity="0.68" />
            </g>

            {/* Single Pair of Evening Herons Gliding High Across the River */}
            <g
              fill="none"
              stroke="#1B2D6B"
              strokeWidth="1.45"
              strokeLinecap="round"
              opacity="0.6"
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

            {/* Soft Low Distant Hills (Kept Deliberately Low for Contemplative Open Sky) */}
            {isMobile ? (
              <>
                <path
                  d="M -16 538 C 46 512, 116 498, 194 504 C 266 510, 326 496, 404 494 C 484 492, 560 508, 656 522 L 656 760 L -16 760 Z"
                  fill={`url(#farRidge-${uid})`}
                />
                <path
                  d="M -16 538 C 46 512, 116 498, 194 504 C 266 510, 326 496, 404 494 C 484 492, 560 508, 656 522"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.2"
                  opacity="0.54"
                />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 500 C 84 468, 186 452, 294 460 C 402 468, 496 446, 610 448 C 724 450, 824 468, 932 454 C 1010 444, 1072 456, 1136 476 L 1136 720 L -16 720 Z"
                  fill={`url(#farRidge-${uid})`}
                />
                <path
                  d="M -16 500 C 84 468, 186 452, 294 460 C 402 468, 496 446, 610 448 C 724 450, 824 468, 932 454 C 1010 444, 1072 456, 1136 476"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.25"
                  opacity="0.54"
                />
              </>
            ) : (
              <>
                <path
                  d="M -20 496 C 110 456, 240 436, 380 448 C 510 460, 628 432, 774 436 C 918 440, 1042 464, 1192 444 C 1326 426, 1468 442, 1620 472 L 1620 720 L -20 720 Z"
                  fill={`url(#farRidge-${uid})`}
                />
                <path
                  d="M -20 496 C 110 456, 240 436, 380 448 C 510 460, 628 432, 774 436 C 918 440, 1042 464, 1192 444 C 1326 426, 1468 442, 1620 472 L 1620 720 L -20 720 Z"
                  fill={`url(#strataHoriz-${uid})`}
                  opacity="0.75"
                />
                <path
                  d="M -20 496 C 110 456, 240 436, 380 448 C 510 460, 628 432, 774 436 C 918 440, 1042 464, 1192 444 C 1326 426, 1468 442, 1620 472"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.3"
                  opacity="0.54"
                />
              </>
            )}
          </g>

          {/* Drifting River Mist Separating Distant Hills from the Stone Ghats */}
          <rect
            x="-60"
            y={isMobile ? 496 : 446}
            width={isMobile ? 760 : isTablet ? 1240 : 1720}
            height={isMobile ? 68 : 76}
            fill={`url(#valleyMist-${uid})`}
            className="akath-landscape-mist-slow"
            opacity="0.76"
          />

          {/* Midground — Quiet Opposite Embankment, Stone Ghat Mandapa, Deepstambh & Neem Trees */}
          <g className="akath-parallax-mid">
            {isMobile ? (
              <>
                {/* Gentle River Embankment Curves */}
                <path
                  d="M -16 588 Q 140 562 276 584 T 656 574 L 656 760 L -16 760 Z"
                  fill={`url(#midRidge-${uid})`}
                  opacity="0.72"
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
                  fill={`url(#midRidge-${uid})`}
                  opacity="0.72"
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
                  fill={`url(#midRidge-${uid})`}
                  opacity="0.72"
                />
                <path
                  d="M -20 538 Q 260 508 540 534 T 1120 530 Q 1360 510 1620 528 L 1620 720 L -20 720 Z"
                  fill={`url(#hatchDiag-${uid})`}
                  opacity="0.38"
                />
                {/* Left Bank: Engraved Stone Ghat Mandapa, Descending Steps & Quiet Moored Skiff */}
                <EngravedGhatMandapa
                  transform="translate(108, 398) scale(1.08)"
                  surfaceHex={surfaceHex}
                />
                {/* Right Bank: Stone Deepstambh, Ancient Neem Grove & Low Stone Parapet */}
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
                {/* Low Stone Ghat Coping Wall on Right Bank */}
                <g stroke={surfaceHex} strokeWidth="1.2" opacity="0.52">
                  <line x1="1158" y1="538" x2="1548" y2="538" />
                  <line x1="1138" y1="548" x2="1564" y2="548" />
                  <line x1="1118" y1="558" x2="1580" y2="558" />
                </g>
              </>
            )}
          </g>

          {/* Foreground — Expansive Calm Mirror-Like Godavari Water, Reflections & River Reeds */}
          <g className="akath-parallax-near">
            {/* Calm Dusk Godavari Water Sheet */}
            {isMobile ? (
              <>
                <path
                  d="M -16 610 Q 180 594 340 606 T 656 604 L 656 760 L -16 760 Z"
                  fill={`url(#riverBand-${uid})`}
                />
                {/* Inverted Archway Reflection Lines */}
                <g stroke="#1B2D6B" strokeWidth="1.2" opacity="0.28">
                  <line x1="56" y1="624" x2="156" y2="624" />
                  <line x1="68" y1="634" x2="142" y2="634" />
                  <line x1="82" y1="644" x2="128" y2="644" />
                </g>
                {/* Gentle Shimmer Ripples */}
                <g stroke="#C89D54" strokeWidth="1.2" strokeLinecap="round">
                  <line x1="184" y1="636" x2="320" y2="636" className="akath-river-shimmer-a" />
                  <line x1="230" y1="652" x2="412" y2="652" className="akath-river-shimmer-b" />
                  <line x1="364" y1="628" x2="492" y2="628" className="akath-river-shimmer-a" />
                </g>
                <GodavariReeds transform="translate(556, 610) scale(0.9)" />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 574 Q 290 554 580 572 T 1136 568 L 1136 720 L -16 720 Z"
                  fill={`url(#riverBand-${uid})`}
                />
                <g stroke="#1B2D6B" strokeWidth="1.25" opacity="0.28">
                  <line x1="94" y1="590" x2="220" y2="590" />
                  <line x1="110" y1="602" x2="202" y2="602" />
                  <line x1="126" y1="614" x2="188" y2="614" />
                </g>
                <g stroke="#C89D54" strokeWidth="1.3" strokeLinecap="round">
                  <line x1="330" y1="604" x2="498" y2="604" className="akath-river-shimmer-a" />
                  <line x1="468" y1="620" x2="684" y2="620" className="akath-river-shimmer-b" />
                  <line x1="696" y1="600" x2="854" y2="600" className="akath-river-shimmer-a" />
                  <line x1="528" y1="638" x2="646" y2="638" className="akath-river-shimmer-b" />
                </g>
                <GodavariReeds transform="translate(998, 566) scale(1.04)" />
                <GodavariReeds transform="translate(20, 580) scale(0.88)" />
              </>
            ) : (
              <>
                <path
                  d="M -20 576 Q 360 554 780 574 T 1620 568 L 1620 720 L -20 720 Z"
                  fill={`url(#riverBand-${uid})`}
                />
                {/* Engraved Broken Reflection of Mandapa & Deepstambh */}
                <g stroke="#1B2D6B" strokeWidth="1.3" strokeLinecap="round" opacity="0.28">
                  <line x1="158" y1="592" x2="310" y2="592" />
                  <line x1="176" y1="604" x2="290" y2="604" />
                  <line x1="194" y1="616" x2="268" y2="616" />
                  <line x1="1210" y1="592" x2="1246" y2="592" />
                  <line x1="1216" y1="604" x2="1240" y2="604" />
                </g>
                {/* Copperplate Dusk Water Shimmer Lines */}
                <g stroke="#C89D54" strokeWidth="1.35" strokeLinecap="round">
                  <line x1="426" y1="604" x2="612" y2="604" className="akath-river-shimmer-a" />
                  <line x1="674" y1="618" x2="928" y2="618" className="akath-river-shimmer-b" />
                  <line x1="744" y1="636" x2="878" y2="636" className="akath-river-shimmer-a" />
                  <line x1="998" y1="602" x2="1162" y2="602" className="akath-river-shimmer-b" />
                  <line x1="1296" y1="616" x2="1444" y2="616" className="akath-river-shimmer-a" />
                </g>
                {/* Slender Framing River Reeds */}
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
              'radial-gradient(ellipse 64% 60% at 50% 45%, rgba(244, 237, 224, 0.7) 0%, rgba(244, 237, 224, 0.3) 64%, rgba(244, 237, 224, 0) 100%)',
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
   3. ABOUT — CHAPTER III: ELEVATED SAHYADRI HORIZON
   Original high-altitude composition: terraced Deccan Trap basalt plateaus,
   a prominent Maratha hill-fort rampart & buruj bastion, distant valley
   heritage spire silhouette, drifting valley mist, and mature deep-rooted
   banyan & neem groves anchoring the flanks. Works seamlessly both in
   Homepage Section "05 · About Akath Prakashan" and whole-page "/about".
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

  // Detect if mounted inside fixed whole-page /about container vs normal homepage section
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
            'radial-gradient(ellipse 84% 56% at 50% 16%, rgba(200, 157, 84, 0.13) 0%, rgba(239, 104, 85, 0.05) 45%, rgba(250, 246, 236, 0) 78%)',
        }}
      />

      <div className="relative w-full h-full max-w-[1680px] mx-auto overflow-hidden flex items-end">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-[0.20] sm:opacity-[0.23] lg:opacity-[0.25]"
        >
          <EngravingDefs uid={uid} surfaceHex={surfaceHex} sunCy="64%" />

          {/* Whisper-Fine Archival Aquatint Stipple */}
          <rect width="100%" height="100%" fill={`url(#stipple-${uid})`} opacity="0.52" />

          {/* Golden-Dusk Horizon Halo Behind High Sahyadri Plateaus */}
          <ellipse
            cx={isMobile ? 320 : isTablet ? 560 : 800}
            cy={isMobile ? 450 : 390}
            rx={isMobile ? 330 : isTablet ? 490 : 650}
            ry={isMobile ? 215 : 250}
            fill={`url(#duskSun-${uid})`}
          />

          {/* LAYER 1 — High Sahyadri Stepped Basalt Plateaus & Deccan Pinnacle Escarpments */}
          <g className="akath-parallax-far">
            {/* Subtle Engraved Meridian Arcs & High Dusk Star/Crescent Accent */}
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
              strokeWidth="0.95"
              strokeDasharray="3 8"
              opacity="0.46"
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
              <circle cx="0" cy="0" r="2.2" fill="#C89D54" opacity="0.88" />
              <circle cx="24" cy="14" r="1.6" fill="#243B8A" opacity="0.72" />
              <circle cx="-18" cy="20" r="1.5" fill="#C89D54" opacity="0.76" />
            </g>

            {/* Monumental Flat-Topped Deccan Trap Plateaus (Distinct Horizon Profile from Hero) */}
            {isMobile ? (
              <>
                <path
                  d="M -16 492 L 32 436 L 116 434 L 154 458 L 188 456 L 236 416 L 318 416 L 358 452 L 424 462 L 478 408 L 568 406 L 612 440 L 656 446 L 656 720 L -16 720 Z"
                  fill={`url(#farRidge-${uid})`}
                />
                <path
                  d="M -16 492 L 32 436 L 116 434 L 154 458 L 188 456 L 236 416 L 318 416 L 358 452 L 424 462 L 478 408 L 568 406 L 612 440 L 656 446 L 656 720 L -16 720 Z"
                  fill={`url(#strataHoriz-${uid})`}
                />
                <path
                  d="M -16 492 L 32 436 L 116 434 L 154 458 L 188 456 L 236 416 L 318 416 L 358 452 L 424 462 L 478 408 L 568 406 L 612 440 L 656 446"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.3"
                  opacity="0.6"
                />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 446 L 56 364 L 184 362 L 246 402 L 326 398 L 398 342 L 516 340 L 584 388 L 692 394 L 774 328 L 916 326 L 986 372 L 1068 358 L 1136 392 L 1136 660 L -16 660 Z"
                  fill={`url(#farRidge-${uid})`}
                />
                <path
                  d="M -16 446 L 56 364 L 184 362 L 246 402 L 326 398 L 398 342 L 516 340 L 584 388 L 692 394 L 774 328 L 916 326 L 986 372 L 1068 358 L 1136 392 L 1136 660 L -16 660 Z"
                  fill={`url(#strataHoriz-${uid})`}
                />
                <path
                  d="M -16 446 L 56 364 L 184 362 L 246 402 L 326 398 L 398 342 L 516 340 L 584 388 L 692 394 L 774 328 L 916 326 L 986 372 L 1068 358 L 1136 392"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.35"
                  opacity="0.6"
                />
              </>
            ) : (
              <>
                <path
                  d="M -20 432 C 36 372, 74 324, 126 320 L 284 318 C 328 320, 360 368, 422 374 C 482 378, 524 332, 578 328 L 696 326 C 756 330, 804 382, 892 384 C 974 386, 1024 316, 1094 304 L 1266 302 C 1320 306, 1364 352, 1428 344 C 1488 336, 1546 318, 1620 356 L 1620 640 L -20 640 Z"
                  fill={`url(#farRidge-${uid})`}
                />
                <path
                  d="M -20 432 C 36 372, 74 324, 126 320 L 284 318 C 328 320, 360 368, 422 374 C 482 378, 524 332, 578 328 L 696 326 C 756 330, 804 382, 892 384 C 974 386, 1024 316, 1094 304 L 1266 302 C 1320 306, 1364 352, 1428 344 C 1488 336, 1546 318, 1620 356 L 1620 640 L -20 640 Z"
                  fill={`url(#strataHoriz-${uid})`}
                />
                <path
                  d="M -20 432 C 36 372, 74 324, 126 320 L 284 318 C 328 320, 360 368, 422 374 C 482 378, 524 332, 578 328 L 696 326 C 756 330, 804 382, 892 384 C 974 386, 1024 316, 1094 304 L 1266 302 C 1320 306, 1364 352, 1428 344 C 1488 336, 1546 318, 1620 356"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.4"
                  opacity="0.62"
                />
                {/* Vertical Basalt Escarpment Rib Engraving */}
                <g stroke="#243B8A" strokeWidth="0.95" fill="none" opacity="0.4">
                  <path d="M 152 320 L 146 362 M 188 319 L 184 354 M 248 319 L 256 364" />
                  <path d="M 1118 304 L 1108 358 M 1172 303 L 1168 348 M 1228 303 L 1238 356" />
                </g>
              </>
            )}
          </g>

          {/* Luminous High-Altitude Valley Mist Ribbon */}
          <rect
            x="-60"
            y={isMobile ? 454 : 368}
            width={isMobile ? 760 : isTablet ? 1240 : 1720}
            height={isMobile ? 74 : 84}
            fill={`url(#valleyMist-${uid})`}
            className="akath-landscape-mist-slow"
            opacity="0.74"
          />

          {/* LAYER 2 — Fortified Maratha Hill-Fort Plateau & Distant Valley Heritage Spire */}
          <g className="akath-parallax-mid">
            {isMobile ? (
              <>
                <path
                  d="M -16 544 C 38 510, 86 502, 148 518 C 216 534, 286 546, 366 534 C 424 524, 464 476, 514 472 L 598 472 L 656 506 L 656 720 L -16 720 Z"
                  fill={`url(#midRidge-${uid})`}
                />
                <path
                  d="M -16 544 C 38 510, 86 502, 148 518 C 216 534, 286 546, 366 534 C 424 524, 464 476, 514 472 L 598 472 L 656 506 L 656 720 L -16 720 Z"
                  fill={`url(#hatchDiag-${uid})`}
                  opacity="0.52"
                />
                {/* Historic Sahyadri Fort Bastion Commanding the Right Crest */}
                <SahyadriFortBastion
                  transform="translate(494, 448) scale(0.92)"
                  surfaceHex={surfaceHex}
                />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -16 492 C 74 446, 152 440, 248 468 C 368 502, 488 510, 616 488 C 710 472, 774 406, 846 402 L 992 402 C 1044 406, 1088 436, 1136 452 L 1136 660 L -16 660 Z"
                  fill={`url(#midRidge-${uid})`}
                />
                <path
                  d="M -16 492 C 74 446, 152 440, 248 468 C 368 502, 488 510, 616 488 C 710 472, 774 406, 846 402 L 992 402 C 1044 406, 1088 436, 1136 452 L 1136 660 L -16 660 Z"
                  fill={`url(#hatchDiag-${uid})`}
                  opacity="0.52"
                />
                <path
                  d="M -16 492 C 74 446, 152 440, 248 468 C 368 502, 488 510, 616 488 C 710 472, 774 406, 846 402 L 992 402 C 1044 406, 1088 436, 1136 452"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.1"
                  opacity="0.48"
                />
                <SahyadriFortBastion
                  transform="translate(848, 374) scale(1.06)"
                  surfaceHex={surfaceHex}
                />
                {/* Distant Heritage Dome Spire Nestled in the Left Valley */}
                <NandedRiverfrontComplex
                  transform="translate(154, 404) scale(0.56)"
                  surfaceHex={surfaceHex}
                />
              </>
            ) : (
              <>
                <path
                  d="M -20 486 C 88 434, 186 426, 304 456 C 446 492, 598 506, 756 490 C 892 476, 988 446, 1074 402 C 1116 382, 1152 378, 1216 378 L 1368 378 C 1438 384, 1518 424, 1620 442 L 1620 640 L -20 640 Z"
                  fill={`url(#midRidge-${uid})`}
                />
                <path
                  d="M -20 486 C 88 434, 186 426, 304 456 C 446 492, 598 506, 756 490 C 892 476, 988 446, 1074 402 C 1116 382, 1152 378, 1216 378 L 1368 378 C 1438 384, 1518 424, 1620 442 L 1620 640 L -20 640 Z"
                  fill={`url(#hatchDiag-${uid})`}
                  opacity="0.54"
                />
                <path
                  d="M -20 486 C 88 434, 186 426, 304 456 C 446 492, 598 506, 756 490 C 892 476, 988 446, 1074 402 C 1116 382, 1152 378, 1216 378 L 1368 378 C 1438 384, 1518 424, 1620 442"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.15"
                  opacity="0.5"
                />
                {/* Prominent Sahyadri Hill-Fort Bastion & Curtain Rampart on Right Crest */}
                <SahyadriFortBastion
                  transform="translate(1206, 348) scale(1.22)"
                  surfaceHex={surfaceHex}
                />
                {/* Distant Valley Heritage Sanctuary Silhouette on Left Valley Floor */}
                <NandedRiverfrontComplex
                  transform="translate(274, 396) scale(0.62)"
                  surfaceHex={surfaceHex}
                />
              </>
            )}
          </g>

          {/* Lower Ridge Mist Band */}
          <rect
            x="-60"
            y={isMobile ? 548 : 478}
            width={isMobile ? 760 : isTablet ? 1240 : 1720}
            height={isMobile ? 54 : 60}
            fill={`url(#valleyMist-${uid})`}
            className="akath-landscape-mist-deep"
            opacity="0.54"
          />

          {/* LAYER 3 — Deeply Rooted Mature Banyan & Neem Groves Framing the Terraced Foreland */}
          <g className="akath-parallax-near">
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
                  fill={`url(#nearBank-${uid})`}
                />
                {/* Terraced Stone Heritage Path Contour */}
                <path
                  d="M -16 644 Q 186 626 352 638 T 656 632"
                  fill="none"
                  stroke={surfaceHex}
                  strokeWidth="1.1"
                  strokeDasharray="6 6"
                  opacity="0.45"
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
                  fill={`url(#nearBank-${uid})`}
                />
                <path
                  d="M -16 592 Q 300 572 580 586 T 1136 576"
                  fill="none"
                  stroke={surfaceHex}
                  strokeWidth="1.15"
                  strokeDasharray="7 7"
                  opacity="0.44"
                />
              </>
            ) : (
              <>
                {/* Mature Rooted Banyan Grove (Left Foreland — Symbolizing Literary Roots) */}
                <EngravedBanyanTree
                  transform="translate(64, 412) scale(1.22)"
                  surfaceHex={surfaceHex}
                />
                <EngravedNeemTree
                  transform="translate(274, 448) scale(0.92)"
                  surfaceHex={surfaceHex}
                />
                {/* Mature Neem & Deccan Ridge Grove (Right Foreland) */}
                <EngravedNeemTree
                  transform="translate(1352, 434) scale(1.12)"
                  surfaceHex={surfaceHex}
                />
                <EngravedBanyanTree
                  transform="translate(1442, 446) scale(0.84)"
                  surfaceHex={surfaceHex}
                />
                {/* Terraced Foreground Deccan Plateau & Ancient Stone Wall */}
                <path
                  d="M -20 546 Q 220 512 468 538 T 980 542 Q 1280 524 1620 536 L 1620 640 L -20 640 Z"
                  fill={`url(#nearBank-${uid})`}
                />
                {/* Fine Copperplate Ridge Contour & Distant River Thread in the Valley */}
                <path
                  d="M -20 578 Q 340 556 740 574 T 1620 564"
                  fill="none"
                  stroke="#C89D54"
                  strokeWidth="1.35"
                  opacity="0.52"
                />
                <path
                  d="M 480 592 Q 800 578 1120 594"
                  fill="none"
                  stroke={surfaceHex}
                  strokeWidth="1.05"
                  strokeDasharray="6 8"
                  opacity="0.42"
                />
              </>
            )}
          </g>
        </svg>

        {/* Precision Center Readability Veil — Keeps Unboxed About Prose & Cards Crisp */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 64% 62% at 50% 42%, ${surfaceHex}B8 0%, ${surfaceHex}4D 62%, ${surfaceHex}00 100%)`,
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
