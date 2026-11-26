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
  mode: 'hero' | 'section' | 'fixed' = 'section'
): boolean {
  // Start below-the-fold landscape sections paused until scrolled into viewport
  const [isOffscreen, setIsOffscreen] = useState(mode !== 'hero');

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof window === 'undefined') return;

    const reducedMotionQuery = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    );
    const isTouchOrCompact = window.matchMedia?.(
      '(max-width: 1023px), (pointer: coarse)'
    )?.matches;

    let inView = mode === 'hero';
    let rafId: number | null = null;
    const enableScrollParallax = !reducedMotionQuery?.matches && !isTouchOrCompact;

    const updateParallax = () => {
      rafId = null;
      if (!enableScrollParallax || !inView || !containerRef.current) return;

      const vh = window.innerHeight || 800;
      if (mode === 'hero') {
        const heroRange = Math.max(420, Math.min(720, vh * 0.85));
        const heroProgress = Math.min(1, Math.max(0, window.scrollY / heroRange));
        containerRef.current.style.setProperty(
          '--akath-hero-scroll',
          heroProgress.toFixed(3)
        );
        return;
      }

      let progress = 0;
      if (mode === 'fixed') {
        const docHeight = Math.max(
          1,
          document.documentElement.scrollHeight - vh
        );
        progress = Math.min(1, Math.max(0, window.scrollY / docHeight)) * 2 - 1;
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const centerOffset = rect.top + rect.height * 0.5 - vh * 0.5;
        progress = Math.max(-1, Math.min(1, centerOffset / (vh * 0.8)));
      }

      containerRef.current.style.setProperty(
        '--akath-scroll-p',
        progress.toFixed(3)
      );
    };

    const scheduleUpdate = () => {
      if (!enableScrollParallax || !inView || rafId !== null) return;
      rafId = window.requestAnimationFrame(updateParallax);
    };

    let observer: IntersectionObserver | null = null;
    if (
      typeof IntersectionObserver !== 'undefined' &&
      (mode === 'section' || mode === 'hero')
    ) {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((e) => e.isIntersecting);
          inView = visible;
          setIsOffscreen((prev) => (prev !== !visible ? !visible : prev));
          if (visible && enableScrollParallax) scheduleUpdate();
        },
        { rootMargin: '120px 0px 120px 0px', threshold: 0.01 }
      );
      observer.observe(node);
    } else if (mode === 'fixed') {
      setIsOffscreen(false);
    }

    if (enableScrollParallax) {
      updateParallax();
      window.addEventListener('scroll', scheduleUpdate, { passive: true });
      window.addEventListener('resize', scheduleUpdate, { passive: true });
    } else {
      node.style.setProperty('--akath-scroll-p', '0');
      node.style.setProperty('--akath-hero-scroll', '0');
    }

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer?.disconnect();
      if (enableScrollParallax) {
        window.removeEventListener('scroll', scheduleUpdate);
        window.removeEventListener('resize', scheduleUpdate);
      }
    };
  }, [containerRef, mode]);

  return isOffscreen;
}

/**
 * Shared Illuminated Archival Ink-and-Wash SVG Definitions.
 * Combines luminous Akath Butter Gold metallic foil gradients, soft dusk glow
 * filters, translucent indigo/emerald washes, and crisp copperplate pen linework
 * so the landscapes gleam like gilded literary frontispieces while preserving
 * Marathi/English typographic clarity.
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
    {/* Radiant Golden-Hour Horizon Corona */}
    <radialGradient id={`duskSun-${uid}`} cx="50%" cy={sunCy} r="50%">
      <stop offset="0%" stopColor="#FFFBE6" stopOpacity="0.82" />
      <stop offset="28%" stopColor="#FFD966" stopOpacity="0.46" />
      <stop offset="56%" stopColor="#EF6855" stopOpacity="0.22" />
      <stop offset="100%" stopColor="#243B8A" stopOpacity="0" />
    </radialGradient>

    {/* Metallic Gold-Leaf Foil Gradient for Finials, Rim-Light & Shimmer */}
    <linearGradient id={`goldFoil-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFFDF2" />
      <stop offset="24%" stopColor="#FFD966" />
      <stop offset="52%" stopColor="#E6A62A" />
      <stop offset="78%" stopColor="#FFF2B2" />
      <stop offset="100%" stopColor="#C88A1E" />
    </linearGradient>

    {/* Horizontal Specular Gold-Leaf River & Horizon Sheen */}
    <linearGradient id={`goldBeam-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#FFD966" stopOpacity="0.18" />
      <stop offset="30%" stopColor="#FFF8D6" stopOpacity="0.95" />
      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
      <stop offset="72%" stopColor="#FFD966" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#E6A62A" stopOpacity="0.2" />
    </linearGradient>

    {/* Soft Zero-Cost Radial Halo Replaces Expensive feGaussianBlur Filters */}

    {/* Distant Sahyadri Basalt Mesa Wash */}
    <linearGradient id={`farWash-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#243B8A" stopOpacity="0.22" />
      <stop offset="65%" stopColor="#243B8A" stopOpacity="0.11" />
      <stop offset="100%" stopColor="#243B8A" stopOpacity="0.025" />
    </linearGradient>

    {/* Midground Deccan Escarpment Wash */}
    <linearGradient id={`midWash-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#1B2D6B" stopOpacity="0.29" />
      <stop offset="68%" stopColor="#1B2D6B" stopOpacity="0.15" />
      <stop offset="100%" stopColor="#1B2D6B" stopOpacity="0.04" />
    </linearGradient>

    {/* Foreground Foothill & Riverbank Wash */}
    <linearGradient id={`nearWash-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#174D3A" stopOpacity="0.28" />
      <stop offset="64%" stopColor="#1B2D6B" stopOpacity="0.16" />
      <stop offset="100%" stopColor="#1B2D6B" stopOpacity="0.06" />
    </linearGradient>

    {/* Luminous Sunlit Godavari River Gold-and-Indigo Ribbon */}
    <linearGradient id={`riverWash-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#243B8A" stopOpacity="0.15" />
      <stop offset="24%" stopColor="#FFD966" stopOpacity="0.46" />
      <stop offset="48%" stopColor="#FFF7D1" stopOpacity="0.62" />
      <stop offset="64%" stopColor="#EF6855" stopOpacity="0.26" />
      <stop offset="80%" stopColor="#FFD966" stopOpacity="0.44" />
      <stop offset="100%" stopColor="#243B8A" stopOpacity="0.15" />
    </linearGradient>

    {/* Soft Organic Valley Mist Gradient */}
    <linearGradient id={`mistRibbon-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor={surfaceHex} stopOpacity="0" />
      <stop offset="46%" stopColor={surfaceHex} stopOpacity="0.72" />
      <stop offset="100%" stopColor={surfaceHex} stopOpacity="0" />
    </linearGradient>

  </defs>
);

/**
 * Crisp 4-point specular star / river-sun glint with zero-cost soft halo.
 */
const DiamondSparkle: React.FC<{
  cx: number;
  cy: number;
  r: number;
  uid: string;
  className?: string;
  opacity?: number;
}> = ({ cx, cy, r, uid, className = 'akath-star-twinkle-a', opacity = 0.95 }) => (
  <g
    transform={`translate(${cx}, ${cy})`}
    className={className}
    opacity={opacity}
  >
    <circle cx="0" cy="0" r={r * 1.1} fill="#FFD966" opacity="0.22" />
    <path
      d={`M 0 ${-r} Q 0 0 ${r} 0 Q 0 0 0 ${r} Q 0 0 ${-r} 0 Q 0 0 0 ${-r} Z`}
      fill={`url(#goldFoil-${uid})`}
    />
    <circle cx="0" cy="0" r={Math.max(1, r * 0.24)} fill="#FFFDF6" />
  </g>
);

/* ============================================================================
   BESPOKE ILLUMINATED INK-AND-WASH ARCHITECTURAL & BOTANICAL PLATES
   ============================================================================ */

/**
 * 1. Grand Hand-Drawn Heritage Banyan Tree & Riverbank Literary Katta (Hero Exclusive)
 * Collector's-edition copperplate ink-and-wash Vata-Vriksha (banyan tree) perched
 * on a weathered Deccan basalt katta/paar overlooking the Godavari ghats.
 * Features individual pointed leaf sprays, backlit golden canopy pockets, tapered
 * gnarled boughs, braided prop-root pillars, drifting falling banyan leaves, and
 * 6 warmly hand-tinted editorial figures (khadi kurtas, gold-bordered sari,
 * spectacles, open ink-lined books, brass hurricane lantern & steaming kulhads).
 */
const BanyanVachankattaScene: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g
    id="hero-banyan-literary-gathering"
    transform={transform}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <defs>
      {/* Painterly Multi-Tone Banyan Canopy Watercolor Gradient */}
      <linearGradient id={`banyanCanopyGrad-${uid}`} x1="12%" y1="0%" x2="88%" y2="100%">
        <stop offset="0%" stopColor="#42825D" stopOpacity="0.48" />
        <stop offset="44%" stopColor="#1E5C45" stopOpacity="0.42" />
        <stop offset="100%" stopColor="#0F3528" stopOpacity="0.52" />
      </linearGradient>

      {/* Sunlit Backlit Emerald-Gold Upper Leaf Crown Wash */}
      <linearGradient id={`banyanCrownGold-${uid}`} x1="0%" y1="0%" x2="100%" y2="90%">
        <stop offset="0%" stopColor="#FFE694" stopOpacity="0.62" />
        <stop offset="45%" stopColor="#72A877" stopOpacity="0.38" />
        <stop offset="100%" stopColor="#174D3A" stopOpacity="0.16" />
      </linearGradient>

      {/* Sculpted Ancient Banyan Bark & Wood-Ink Wash */}
      <linearGradient id={`banyanBarkGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6D5744" stopOpacity="0.72" />
        <stop offset="36%" stopColor="#4A433B" stopOpacity="0.76" />
        <stop offset="76%" stopColor="#1C3F39" stopOpacity="0.78" />
        <stop offset="100%" stopColor="#1B2D6B" stopOpacity="0.70" />
      </linearGradient>

      {/* Soft Golden Dappled Sunlight Filtering Through Canopy Gaps */}
      <linearGradient id={`banyanSunShaft-${uid}`} x1="0%" y1="0%" x2="25%" y2="100%">
        <stop offset="0%" stopColor="#FFF8D8" stopOpacity="0.40" />
        <stop offset="58%" stopColor="#FFD966" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#FFD966" stopOpacity="0" />
      </linearGradient>

      {/* Warm Brass Lantern Radiance Illuminating Faces & Open Pages */}
      <radialGradient id={`kattaLanternHalo-${uid}`} cx="50%" cy="54%" r="54%">
        <stop offset="0%" stopColor="#FFFBE6" stopOpacity="0.95" />
        <stop offset="28%" stopColor="#FFD966" stopOpacity="0.62" />
        <stop offset="62%" stopColor="#EF6855" stopOpacity="0.20" />
        <stop offset="100%" stopColor="#FFD966" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Soft Golden Light Shafts Filtering Down Through the Banyan Canopy */}
    <g opacity="0.82">
      <polygon points="70,48 104,45 130,145 80,145" fill={`url(#banyanSunShaft-${uid})`} />
      <polygon points="154,44 186,48 202,145 148,145" fill={`url(#banyanSunShaft-${uid})`} />
    </g>

    {/* Warm Glowing Dusk Lantern Pool Over the Reading Circle */}
    <ellipse
      cx="146"
      cy="132"
      rx="92"
      ry="36"
      fill={`url(#kattaLanternHalo-${uid})`}
      opacity="0.86"
    />

    {/* =====================================================================
        A. ARCHITECTURAL BOTANICAL BANYAN CANOPY (4 PAINTERLY LAYERS + LEAVES)
        ===================================================================== */}
    {/* Tier 1: Deep Back Foliage Shadow Canopy */}
    <path
      d="M 8 81 C 0 64, 11 45, 30 41 C 36 22, 58 12, 81 16 C 95 0, 126 -6, 152 4 C 176 -5, 208 4, 224 21 C 246 19, 266 34, 272 52 C 286 58, 288 79, 272 89 C 255 97, 233 95, 214 88 C 194 93, 168 91, 146 86 C 122 93, 92 93, 70 87 C 48 95, 20 95, 8 81 Z"
      fill={`url(#banyanCanopyGrad-${uid})`}
    />

    {/* Tier 2: Deep Shaded Under-Canopy Bough Recesses */}
    <g fill="#0E3326" opacity="0.30">
      <path d="M 16 80 C 32 70, 56 68, 79 76 C 62 90, 32 91, 16 80 Z" />
      <path d="M 86 77 C 110 66, 142 65, 170 75 C 150 88, 108 90, 86 77 Z" />
      <path d="M 186 77 C 214 67, 242 69, 266 81 C 250 92, 212 93, 186 77 Z" />
    </g>

    {/* Tier 3: Mid-Canopy Layered Botanical Foliage Clouds */}
    <path
      d="M 22 72 C 16 55, 31 41, 52 39 C 60 22, 84 15, 107 21 C 123 7, 155 5, 175 18 C 197 12, 221 21, 230 38 C 250 40, 264 54, 258 70 C 246 81, 224 81, 206 74 C 182 81, 154 79, 134 74 C 110 80, 82 79, 62 72 C 44 80, 28 79, 22 72 Z"
      fill="#1F644C"
      opacity="0.32"
    />

    {/* Tier 4: Sun-Kissed Backlit Golden-Sage Crown Glaze */}
    <path
      d="M 36 40 C 46 21, 69 13, 94 16 C 110 3, 144 0, 167 10 C 187 3, 214 11, 226 27 C 240 28, 252 36, 256 48 C 238 41, 214 39, 194 42 C 172 32, 138 30, 112 38 C 88 32, 58 34, 36 40 Z"
      fill={`url(#banyanCrownGold-${uid})`}
    />

    {/* Backlit Translucent Golden-Green Canopy Glow Pockets */}
    <g fill="#FFE48C" opacity="0.28">
      <ellipse cx="78" cy="30" rx="18" ry="8" />
      <ellipse cx="144" cy="18" rx="22" ry="8.5" />
      <ellipse cx="204" cy="30" rx="16" ry="7.5" />
    </g>

    {/* Organic Parchment Sky Openings Breathing Naturally Between Leaf Clusters */}
    <g fill={surfaceHex} opacity="0.80">
      <path d="M 60 56 Q 71 48 82 55 Q 72 62 60 56 Z" />
      <path d="M 124 38 Q 137 30 150 38 Q 138 45 124 38 Z" />
      <path d="M 192 52 Q 204 45 216 53 Q 204 60 192 52 Z" />
      <path d="M 164 23 Q 174 17 183 24 Q 173 29 164 23 Z" />
      <path d="M 92 31 Q 100 26 108 32 Q 100 36 92 31 Z" />
    </g>

    {/* Explicit Hand-Drawn Pointed Banyan Leaf Sprays Around Canopy Perimeter */}
    <g fill="#1B5B44" fillOpacity="0.62" stroke="#113629" strokeWidth="0.7">
      <path d="M 12 52 Q 4 46 8 39 Q 15 44 12 52 Z M 18 46 Q 13 38 19 33 Q 24 40 18 46 Z" />
      <path d="M 40 24 Q 36 15 44 12 Q 48 19 40 24 Z M 94 7 Q 92 -2 100 -3 Q 102 4 94 7 Z" />
      <path d="M 158 5 Q 162 -3 170 -1 Q 167 6 158 5 Z M 226 22 Q 233 15 240 19 Q 235 26 226 22 Z" />
      <path d="M 272 56 Q 282 52 286 58 Q 279 64 272 56 Z M 274 72 Q 284 71 286 78 Q 278 81 274 72 Z" />
      <path d="M 14 78 Q 4 82 6 88 Q 14 87 14 78 Z" />
    </g>

    {/* =====================================================================
        B. SCULPTED GNARLED TRUNK, TAPERED BOUGHS & BRAIDED AERIAL PROP ROOTS
        ===================================================================== */}
    {/* Monumental Gnarled Trunk, Fluted Buttress Roots & Tapered Spreading Limbs */}
    <path
      d="M 122 86
         C 96 72, 66 68, 22 72
         L 23 67
         C 68 62, 100 65, 126 78
         C 120 60, 108 42, 92 28
         L 96 26
         C 114 40, 126 56, 134 74
         C 138 56, 144 40, 152 24
         L 157 25
         C 150 42, 145 58, 143 75
         C 156 58, 172 44, 190 32
         L 193 36
         C 176 48, 162 62, 152 79
         C 182 66, 218 63, 260 68
         L 259 73
         C 218 70, 186 73, 158 88
         C 156 108, 162 128, 182 146
         L 164 146
         C 156 138, 149 131, 142 132
         C 134 133, 126 138, 118 146
         L 100 146
         C 119 128, 125 108, 122 86 Z"
      fill={`url(#banyanBarkGrad-${uid})`}
    />

    {/* Hand-Inked Bark Fissures, Intertwined Trunk Roots & Secondary Limbs */}
    <g fill="none" stroke="#153B2E" opacity="0.82">
      <path d="M 122 86 C 125 108, 119 128, 100 146 M 158 88 C 156 108, 162 128, 182 146" strokeWidth="1.7" />
      <path d="M 129 86 C 131 106, 126 124, 115 140 M 138 85 C 138 103, 141 118, 147 131 M 149 88 C 148 106, 152 124, 164 140" strokeWidth="1.0" opacity="0.84" />
      {/* Intertwined braided vine/root wrapping trunk */}
      <path d="M 124 94 C 134 102, 144 106, 156 116 M 122 114 C 134 120, 146 124, 162 136" strokeWidth="0.9" opacity="0.72" />
      {/* Tapered Secondary Twig Limbs */}
      <path d="M 80 68 C 68 54, 56 44, 40 36" strokeWidth="1.8" />
      <path d="M 52 67 C 40 58, 30 53, 18 54" strokeWidth="1.25" />
      <path d="M 196 68 C 208 55, 220 46, 236 38" strokeWidth="1.8" />
      <path d="M 224 68 C 236 60, 248 56, 262 58" strokeWidth="1.2" />
    </g>

    {/* Warm Sunlit Golden Rim Along Upper Bough Shoulders */}
    <g fill="none" stroke={`url(#goldFoil-${uid})`} opacity="0.86">
      <path d="M 26 67 C 66 62, 98 64, 124 76" strokeWidth="1.15" />
      <path d="M 155 77 C 184 65, 218 63, 256 68" strokeWidth="1.15" />
      <path d="M 122 92 C 123 108, 118 124, 105 140" strokeWidth="1.0" opacity="0.78" />
    </g>

    {/* Fine Copperplate Pen-and-Ink Scalloped Botanical Leaf Contours & Hatching */}
    <g fill="none" stroke="#11382B" opacity="0.74">
      <path
        d="M 8 81 C 0 64, 11 45, 30 41 C 36 22, 58 12, 81 16 C 95 0, 126 -6, 152 4 C 176 -5, 208 4, 224 21 C 246 19, 266 34, 272 52 C 286 58, 288 79, 272 89 C 256 96, 238 95, 224 89"
        strokeWidth="1.5"
      />
      <path d="M 10 83 C 24 92, 44 93, 62 86 M 214 87 C 232 95, 254 95, 272 89" strokeWidth="1.2" />
      <path
        d="M 20 62 Q 34 51 50 59 Q 62 52 76 60
           M 48 34 Q 68 23 88 31 Q 102 22 118 29
           M 112 18 Q 138 8 166 19 Q 184 11 206 23
           M 178 36 Q 200 26 222 37 Q 238 32 254 44
           M 218 62 Q 236 53 254 64 Q 266 60 274 70"
        strokeWidth="1.1"
      />
      <path
        d="M 28 76 Q 42 71 58 76 M 86 48 Q 102 41 118 48 M 156 48 Q 174 41 190 48 M 216 76 Q 234 71 250 76"
        strokeWidth="0.92"
        opacity="0.84"
      />
      {/* Shadow Cross-Hatching Under Leaf Lobes */}
      <path
        d="M 26 84 L 31 79 M 34 86 L 39 81 M 42 87 L 47 82
           M 232 87 L 237 82 M 240 88 L 245 83 M 248 87 L 253 82
           M 122 81 L 126 76 M 130 82 L 134 77 M 150 82 L 154 77"
        strokeWidth="0.75"
        opacity="0.68"
      />
    </g>

    {/* Coral-Ochre Banyan Figs (Vad-Fale) & Two Perched Dusk Sparrows */}
    <g>
      <circle cx="48" cy="54" r="1.45" fill="#EF6855" opacity="0.82" />
      <circle cx="88" cy="36" r="1.35" fill="#EF6855" opacity="0.76" />
      <circle cx="152" cy="28" r="1.45" fill="#EF6855" opacity="0.78" />
      <circle cx="206" cy="40" r="1.4" fill="#EF6855" opacity="0.80" />
      <circle cx="242" cy="62" r="1.35" fill="#EF6855" opacity="0.78" />
      <g fill="#1B2D6B" opacity="0.82">
        <path d="M 254 46 C 256 43, 260 43, 262 45 L 265 44 L 262 47 C 260 49, 256 49, 254 46 Z" />
        <path d="M 263 50 C 265 48, 268 48, 270 50 L 272 49 L 270 51 C 268 53, 265 53, 263 50 Z" />
      </g>
    </g>

    {/* Luminous Golden-Hour Rim Catching the Upper Banyan Crown */}
    <path
      d="M 32 36 C 41 21, 59 14, 81 16 C 95 0, 126 -6, 152 4 C 176 -5, 208 4, 224 21 C 242 20, 258 30, 267 44"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.85"
      opacity="0.92"
    />

    {/* Iconic Braided Aerial Prop-Root Pillars (Parambhya) Anchoring Into the Katta */}
    <g fill="none" stroke="#1B4335" opacity="0.78">
      <path d="M 26 76 C 22 98, 27 124, 22 154" strokeWidth="2.2" />
      <path d="M 31 78 C 28 100, 32 124, 29 152" strokeWidth="1.25" opacity="0.80" />
      <path d="M 26 112 C 31 124, 34 138, 35 152" strokeWidth="1.1" opacity="0.76" />
      <path d="M 46 76 C 44 96, 48 118, 44 146" strokeWidth="1.5" />
      <path d="M 238 76 C 240 96, 236 118, 240 146" strokeWidth="1.5" />
      <path d="M 254 76 C 251 100, 256 124, 252 154" strokeWidth="2.2" />
      <path d="M 259 78 C 261 100, 257 122, 261 151" strokeWidth="1.25" opacity="0.80" />
      <path d="M 254 114 C 249 126, 246 138, 245 152" strokeWidth="1.05" opacity="0.74" />
    </g>

    {/* Fine Suspended Aerial Root Tendrils Swaying Softly + Gently Drifting Falling Banyan Leaves */}
    <g fill="none" stroke="#174D3A" opacity="0.62">
      <g className="akath-banyan-root-sway-a">
        <path d="M 62 76 C 60 90, 63 104, 60 116" strokeWidth="0.95" />
        <path d="M 96 76 C 95 87, 97 96, 95 106" strokeWidth="0.85" />
        <path d="M 222 76 C 224 90, 221 104, 224 117" strokeWidth="0.95" />
      </g>
      <g className="akath-banyan-root-sway-b">
        <path d="M 38 78 C 39 92, 37 104, 39 118" strokeWidth="0.85" />
        <path d="M 188 76 C 189 87, 187 96, 189 106" strokeWidth="0.85" />
        <path d="M 248 78 C 249 91, 247 104, 249 118" strokeWidth="0.85" />
      </g>
    </g>
    {/* Two Tiny Falling Golden-Emerald Leaves Drifting Lazily Under the Boughs */}
    <path d="M 68 88 Q 73 86 75 91 Q 70 92 68 88 Z" fill="#6AA173" stroke="#154233" strokeWidth="0.45" className="akath-banyan-leaf-drift-a" />
    <path d="M 212 86 Q 217 84 218 89 Q 213 90 212 86 Z" fill="#E6B84C" stroke="#154233" strokeWidth="0.45" className="akath-banyan-leaf-drift-b" />

    {/* =====================================================================
        C. WEATHERED DECCAN STONE KATTA / PAAR (पारा) & WOVEN SATARANGI MAT
        ===================================================================== */}
    <g>
      {/* Lower Basalt Plinth Step */}
      <path d="M 16 154 L 272 154 L 282 166 L 6 166 Z" fill="#1B2D6B" opacity="0.22" />
      {/* Upper Seated Stone Katta Terrace */}
      <path d="M 30 144 L 258 144 L 268 154 L 20 154 Z" fill="#1B2D6B" opacity="0.29" />
      {/* Woven Handloom Cotton Satarangi (Reading Mat) With Striped Borders */}
      <path d="M 50 144 L 238 144 L 243 148.5 L 45 148.5 Z" fill="#243B8A" opacity="0.28" />
      <line x1="56" y1="146.2" x2="232" y2="146.2" stroke="#FFD966" strokeWidth="0.9" strokeDasharray="5 4" opacity="0.88" />

      {/* Hand-Engraved Basalt Stone Courses & Weathered Joints */}
      <g fill="none" stroke="#1B2D6B" opacity="0.68">
        <path d="M 30 144 L 258 144 M 18 154 L 270 154 M 6 166 L 282 166" strokeWidth="1.45" />
        <path d="M 32 144 L 30 154 M 74 144 L 74 154 M 118 144 L 118 154 M 164 144 L 164 154 M 210 144 L 210 154 M 256 144 L 258 154" strokeWidth="0.82" opacity="0.72" />
        <path d="M 52 154 L 50 166 M 98 154 L 98 166 M 144 154 L 144 166 M 190 154 L 190 166 M 236 154 L 238 166" strokeWidth="0.82" opacity="0.66" />
      </g>
      <line x1="32" y1="144.3" x2="256" y2="144.3" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.4" opacity="0.92" />

      {/* Small Riverbank Grass Tufts & Wildflowers Hugging the Stone Plinth Base */}
      <g fill="none" stroke="#174D3A" strokeWidth="0.95" opacity="0.72">
        <path d="M 10 166 Q 8 160 5 158 M 13 166 Q 14 159 17 157" />
        <path d="M 274 166 Q 275 160 278 157 M 278 166 Q 281 161 284 159" />
      </g>
      <circle cx="15" cy="158" r="1.15" fill="#FFD966" opacity="0.88" />
      <circle cx="279" cy="158" r="1.15" fill="#EF6855" opacity="0.82" />
    </g>

    {/* =====================================================================
        D. LITERARY DISCUSSION CIRCLE (वाचनकट्टा) — 6 WARM HAND-TINTED FIGURES
           Warm parchment-ochre faces & hands framed by dark indigo ink hair &
           contrasting handloom khadi/sari wardrobes for instant visual clarity.
        ===================================================================== */}
    <g id="banyan-people-discussing">
      {/* PERSON 1 (Far Left): Young Reader in Sage Kurta With Spectacles, Listening Intently */}
      <g>
        <path d="M 40 144 C 45 136, 59 135, 70 144 Z" fill="#174D3A" stroke="#123629" strokeWidth="0.95" />
        <path
          d="M 45 143 C 43 132, 46 121, 54 120 C 61 119, 65 125, 68 134 L 71 143 Z"
          fill="#2B6751"
          stroke="#133A2D"
          strokeWidth="1.05"
        />
        {/* Warm hand-tinted neck, profile face & dark ink hair */}
        <path d="M 54.5 120 L 56.2 116.5" stroke="#DFB892" strokeWidth="2.6" />
        <path
          d="M 52 113.5 C 52 108.5, 56.5 106.8, 60.4 109.5 C 61.9 110.8, 62.3 112.8, 61.4 114.6 C 60.6 116.2, 59.2 117.2, 56.8 117.3 C 54 117.3, 52 115.8, 52 113.5 Z"
          fill="#E5C09B"
          stroke="#1B2D6B"
          strokeWidth="0.8"
        />
        {/* Tousled indigo-ink scholar hair */}
        <path d="M 51.6 114.2 C 50.6 110.2, 53.2 106.4, 58.2 107.2 C 60.2 107.6, 61 108.8, 60.4 109.8 C 57.6 109.2, 55.2 110.4, 54.4 113.6 Z" fill="#162354" />
        {/* Delicate Spectacles & Eye Line */}
        <circle cx="60.4" cy="112.2" r="1.35" fill="none" stroke="#1B2D6B" strokeWidth="0.65" />
        <line x1="58.6" y1="112" x2="59.1" y2="112.1" stroke="#1B2D6B" strokeWidth="0.55" />
        {/* Hand resting thoughtfully under chin */}
        <path d="M 56 128 C 61 128, 63.5 124, 61.2 119.5" fill="none" stroke="#2B6751" strokeWidth="2.8" />
        <path d="M 56 128 C 61 128, 63.5 124, 61.2 119.5" fill="none" stroke="#133A2D" strokeWidth="0.9" />
        <circle cx="61.2" cy="118.2" r="1.45" fill="#E5C09B" stroke="#1B2D6B" strokeWidth="0.6" />
        <path d="M 55 121 C 59 122, 62 126, 64 131" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.9" opacity="0.85" />
        {/* Small books beside him */}
        <rect x="33" y="140.5" width="11" height="3.2" rx="0.6" fill="#243B8A" stroke="#162354" strokeWidth="0.65" />
        <rect x="34.5" y="138" width="9" height="2.6" rx="0.5" fill="#FFFDF4" stroke="#1B2D6B" strokeWidth="0.7" />
      </g>

      {/* PERSON 2 (Inner Left — FOCAL SPEAKER): Elder Poet in Ivory Khadi Kurta & Indigo-Gold Shawl Reciting */}
      <g>
        {/* Cross-legged base */}
        <path d="M 75 144 C 82 135, 100 134, 112 144 Z" fill="#EFE7D6" stroke="#1B2D6B" strokeWidth="0.95" />
        {/* Crisp Ivory Khadi Kurta Torso Leaning Forward Into the Circle */}
        <path
          d="M 80 144 C 78 131, 82 119, 91 118 C 98 117, 104 124, 107 134 L 111 144 Z"
          fill="#FAF4E4"
          stroke="#1B2D6B"
          strokeWidth="1.05"
        />
        {/* Handwoven Midnight-Indigo Literary Shawl (Uparna) With Gold Zari Edge */}
        <path
          d="M 81 132 C 84 121, 93 118, 99 122 C 96 130, 89 136, 80 139 Z"
          fill="#243B8A"
          fillOpacity="0.88"
          stroke="#152254"
          strokeWidth="0.75"
        />
        <path d="M 83 130 C 87 123, 93 121, 98 124" fill="none" stroke="#FFD966" strokeWidth="0.9" opacity="0.94" />

        {/* Warm Hand-Tinted Neck, Dignified Profile Face, Silver Hair & Beard */}
        <path d="M 91 118 L 93 114" stroke="#DFB892" strokeWidth="2.8" />
        <path
          d="M 88 110 C 88 104.5, 93.2 102.6, 97.6 105.5 C 99.6 107, 100.3 109.5, 99.5 111.6 C 98.8 113.5, 97.2 115.1, 94.4 115.2 C 91 115.3, 88 113.5, 88 110 Z"
          fill="#E5C09B"
          stroke="#1B2D6B"
          strokeWidth="0.85"
        />
        {/* Silver-slate elder hair & trimmed beard */}
        <path d="M 87.6 111.5 C 86.5 107.2, 89.2 103.2, 95 103.8 C 97 104.2, 98.2 105.2, 97.5 106.2 C 94.4 105.6, 91.5 107.2, 90.8 110.6 Z" fill="#2A3A68" />
        <path d="M 94.8 114.6 C 97.2 115.8, 99.4 114.8, 99.6 112.2 C 98 113.2, 96.2 113.4, 94.8 114.6 Z" fill="#E9E4D8" stroke="#1B2D6B" strokeWidth="0.55" />
        {/* Spectacles catching lantern light */}
        <circle cx="97.8" cy="109.3" r="1.4" fill="none" stroke="#1B2D6B" strokeWidth="0.7" />
        <circle cx="98.1" cy="109.0" r="0.35" fill="#FFFDF4" />

        {/* Subtle Animated Expressive Recital Arm & Warm Tinted Open Hand */}
        <g className="akath-speaker-gesture">
          <path d="M 96 126 C 103 124, 109 120, 114.5 115" fill="none" stroke="#FAF4E4" strokeWidth="3.2" />
          <path d="M 96 126 C 103 124, 109 120, 114.5 115" fill="none" stroke="#1B2D6B" strokeWidth="1.05" />
          <circle cx="115.2" cy="114.3" r="1.6" fill="#E5C09B" stroke="#1B2D6B" strokeWidth="0.65" />
          <path d="M 116.2 113.8 L 119.2 111.6 M 116.5 114.6 L 119.8 114.2 M 116.2 115.4 L 118.8 116.8" fill="none" stroke="#1B2D6B" strokeWidth="0.9" />
        </g>

        {/* Supporting Left Forearm Holding Open Illustrated Book */}
        <path d="M 94 131 C 99 132, 103 132, 107 130" fill="none" stroke="#1B2D6B" strokeWidth="2.1" />
        <g transform="translate(103, 123)">
          <path d="M 0 5 Q 4 1 9 1 L 10 9 Q 5 9 1 12 Z" fill="#FFFDF5" stroke="#1B2D6B" strokeWidth="0.9" />
          <path d="M 9 1 Q 14 1 18 4 L 19 11 Q 14 9 10 9 Z" fill="#FFF7DE" stroke="#1B2D6B" strokeWidth="0.9" />
          <line x1="2.4" y1="5.2" x2="7.2" y2="3.5" stroke="#243B8A" strokeWidth="0.55" opacity="0.72" />
          <line x1="2.8" y1="7.5" x2="7.5" y2="5.8" stroke="#243B8A" strokeWidth="0.55" opacity="0.72" />
          <line x1="11.2" y1="3.4" x2="16" y2="4.8" stroke="#243B8A" strokeWidth="0.55" opacity="0.72" />
          <line x1="11.5" y1="5.8" x2="16.2" y2="7.2" stroke="#243B8A" strokeWidth="0.55" opacity="0.72" />
        </g>
        <path d="M 97 120 C 101 122, 104 126, 106 130" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.05" opacity="0.92" />
      </g>

      {/* PERSON 3 (Center-Left Behind): Quiet Scholar Seated Near the Ancient Trunk */}
      <g opacity="0.92">
        <path d="M 115 138 C 115 126, 118 118, 125 117 C 131 117, 134 125, 135 138 Z" fill="#2E547A" stroke="#162354" strokeWidth="0.9" />
        <path
          d="M 121.5 111 C 121.5 106.8, 125.5 105.4, 128.8 107.8 C 130 109.2, 129.8 112.4, 127.6 114 C 125 115.2, 121.5 114, 121.5 111 Z"
          fill="#DFB690"
          stroke="#1B2D6B"
          strokeWidth="0.75"
        />
        <path d="M 121 111.2 C 120.5 107.6, 123 105.2, 127.6 106.2 C 126 107.2, 124 108.4, 123.5 111.2 Z" fill="#162354" />
        <path d="M 119 130 L 129 128.5 L 130 133 L 120 134.5 Z" fill="#FFFDF4" stroke="#1B2D6B" strokeWidth="0.7" />
        <path d="M 127 118 C 129 120, 131 124, 132 128" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.8" opacity="0.78" />
      </g>

      {/* ===================================================================
          CENTER GATHERING STILL-LIFE: BRASS LANTERN (KANDIL), BOOKS & TEA
          =================================================================== */}
      <g>
        {/* Two Earthen Kulhad Teacups With Faint Steam Wisps */}
        <path d="M 126 140.2 L 130.5 140.2 L 129.8 144 L 126.7 144 Z" fill="#EF6855" opacity="0.82" stroke="#1B2D6B" strokeWidth="0.6" />
        <path d="M 128 138.5 Q 127 136 128.5 133.5" fill="none" stroke="#FFF8DC" strokeWidth="0.75" opacity="0.76" className="akath-katta-ember-a" />
        <path d="M 161 140.2 L 165.5 140.2 L 164.8 144 L 161.7 144 Z" fill="#EF6855" opacity="0.82" stroke="#1B2D6B" strokeWidth="0.6" />
        <path d="M 163 138.5 Q 164 136 162.5 133.5" fill="none" stroke="#FFF8DC" strokeWidth="0.75" opacity="0.76" className="akath-katta-ember-b" />

        {/* Stack of Vintage Hardcover Books */}
        <rect x="134" y="140" width="22" height="4" rx="0.7" fill="#1B2D6B" opacity="0.92" />
        <rect x="136" y="136.4" width="18" height="3.6" rx="0.6" fill="#FFFDF4" stroke="#1B2D6B" strokeWidth="0.75" />
        <line x1="138" y1="138.2" x2="152" y2="138.2" stroke="#EF6855" strokeWidth="0.7" opacity="0.85" />

        {/* Detailed Brass Dusk Hurricane Lantern (Kandil) */}
        <g transform="translate(145, 136)">
          <rect x="-4.5" y="-2" width="9" height="2.2" rx="0.7" fill="#1B2D6B" />
          <path d="M -3.5 -2 L -2.6 -10.5 L 2.6 -10.5 L 3.5 -2 Z" fill="#FFF8D6" fillOpacity="0.52" stroke="#1B2D6B" strokeWidth="0.9" />
          <path d="M -3.8 -10.5 L 3.8 -10.5 L 2.2 -13 L -2.2 -13 Z" fill="#1B2D6B" />
          <path d="M -3.2 -12 Q 0 -16 3.2 -12" fill="none" stroke="#1B2D6B" strokeWidth="0.95" />
          <g className="akath-diya-glint">
            <circle cx="0" cy="-6.2" r="9.5" fill="#FFD966" opacity="0.58" />
            <circle cx="0" cy="-6.2" r="3.9" fill="#EF6855" opacity="0.92" />
            <circle cx="0" cy="-6.6" r="1.85" fill="#FFFDF6" opacity="1" />
          </g>
        </g>

        {/* Rising Warm Lantern Embers / Fireflies Under the Canopy */}
        <circle cx="140" cy="112" r="1.25" fill="#FFD966" className="akath-katta-ember-a" />
        <circle cx="152" cy="105" r="1.1" fill="#FFF8D6" className="akath-katta-ember-b" />
        <circle cx="131" cy="101" r="0.95" fill="#FFD966" className="akath-katta-ember-b" />
      </g>

      {/* PERSON 4 (Inner Right — PRIMARY DISCUSSANT): Poetess in Deep Indigo & Gold-Bordered Sari */}
      <g>
        <path d="M 169 144 C 179 134, 196 135, 205 144 Z" fill="#243B8A" stroke="#152254" strokeWidth="1.0" />
        <path
          d="M 200 144 C 202 131, 198 119, 189 118 C 182 117, 177 124, 174 134 L 169 144 Z"
          fill="#243B8A"
          stroke="#152254"
          strokeWidth="1.05"
        />
        {/* Emerald-Teal Draped Sari Pallu With Crisp Gold Zari Border */}
        <path
          d="M 197 122 C 192 119, 184 122, 178 133 L 195 139 Z"
          fill="#1D5D47"
          stroke="#133A2D"
          strokeWidth="0.7"
        />
        <path d="M 195 122 C 189 124, 184 128, 179 135" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.0" opacity="0.94" />

        {/* Warm Hand-Tinted Neck, Profile Face & Traditional Hair Bun (Ambada) With Jasmine */}
        <path d="M 189 118 L 187 114.5" stroke="#DFB892" strokeWidth="2.5" />
        <path
          d="M 192 110.5 C 192 105.2, 187 103.3, 183 106.2 C 181.2 107.6, 180.6 109.8, 181.4 111.8 C 182 113.6, 183.5 115, 186 115.2 C 189.2 115.3, 192 113.5, 192 110.5 Z"
          fill="#E5C09B"
          stroke="#1B2D6B"
          strokeWidth="0.82"
        />
        {/* Swept dark indigo hair & neat bun with ivory jasmine dots */}
        <path d="M 184 105.6 C 187.5 103.5, 192.8 105.8, 192.6 112.2 C 190.5 113, 189 111.2, 188.4 109.2 C 187.4 107.2, 185.6 106.2, 184 105.6 Z" fill="#162354" />
        <circle cx="194.2" cy="112" r="2.7" fill="#162354" />
        <circle cx="192.5" cy="110.0" r="0.95" fill="#FFFDF4" />
        <circle cx="193.6" cy="111.5" r="0.8" fill="#FFFDF4" />
        {/* Tiny crimson bindi & gentle eye line */}
        <circle cx="182.2" cy="109.2" r="0.55" fill="#EF6855" />

        {/* Expressive Replying Forearm & Hand Gesturing Warmly */}
        <path d="M 183 127 C 176 125, 170 122, 165.5 118" fill="none" stroke="#243B8A" strokeWidth="2.8" />
        <path d="M 183 127 C 176 125, 170 122, 165.5 118" fill="none" stroke="#152254" strokeWidth="0.9" />
        <circle cx="164.6" cy="117.3" r="1.45" fill="#E5C09B" stroke="#1B2D6B" strokeWidth="0.6" />
        <path d="M 163.5 116.8 L 161 115.2 M 163.4 117.8 L 160.8 117.8" fill="none" stroke="#1B2D6B" strokeWidth="0.85" />

        {/* Open book resting on crossed knees */}
        <path d="M 168 136 L 178 133.5 L 185 136 L 175 139.5 Z" fill="#FFFDF4" stroke="#1B2D6B" strokeWidth="0.85" />
        <path d="M 183 120 C 179 122, 176 126, 174 130" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.0" opacity="0.92" />
      </g>

      {/* PERSON 5 (Mid-Right): Writer in Muted Sage-Teal Shawl Writing Notes */}
      <g>
        <path d="M 204 144 C 211 136, 224 136, 232 144 Z" fill="#243B8A" stroke="#152254" strokeWidth="0.9" />
        <path
          d="M 227 144 C 228 132, 224 122, 217 121 C 211 121, 207 127, 205 136 L 202 144 Z"
          fill="#FAF4E4"
          stroke="#1B2D6B"
          strokeWidth="1.0"
        />
        {/* Muted sage-teal handloom literary shawl */}
        <path d="M 225 125 C 220 122, 213 124, 208 134 L 222 138 Z" fill="#3B6B5C" fillOpacity="0.88" stroke="#184235" strokeWidth="0.7" />
        {/* Warm hand-tinted profile tilted down toward notebook */}
        <path
          d="M 220.2 114 C 220.2 109.2, 215.8 107.6, 212.4 110.1 C 211 111.5, 210.8 114.2, 212.6 116 C 214.8 117.5, 220.2 116.7, 220.2 114 Z"
          fill="#E5C09B"
          stroke="#1B2D6B"
          strokeWidth="0.78"
        />
        <path d="M 213.6 109.4 C 216.8 107.6, 221 109.6, 220.6 115.2 C 218.5 115.2, 217.2 113.4, 216.8 111.4 Z" fill="#162354" />
        {/* Forearm, hand & fountain pen writing into open notebook */}
        <path d="M 213 129 C 208 130, 206 131, 204 132" fill="none" stroke="#1B2D6B" strokeWidth="1.9" />
        <path d="M 199 133 L 209 131 L 211 136.5 L 201 138.5 Z" fill="#FFFDF4" stroke="#1B2D6B" strokeWidth="0.85" />
        <circle cx="204.2" cy="132" r="1.25" fill="#E5C09B" stroke="#1B2D6B" strokeWidth="0.55" />
        <line x1="204.5" y1="129.5" x2="207.5" y2="135" stroke="#1B2D6B" strokeWidth="1.05" />
        <path d="M 215 121 C 212 123, 209 127, 207 131" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.88" opacity="0.86" />
      </g>

      {/* PERSON 6 (Far Right): Relaxed Reader Beneath Aerial Roots Sipping Tea & Listening */}
      <g opacity="0.94">
        <path d="M 230 144 C 236 137, 248 137, 254 144 Z" fill="#174D3A" stroke="#113629" strokeWidth="0.9" />
        <path
          d="M 249 144 C 250 133, 246 124, 240 123 C 234 123, 231 129, 229 136 L 227 144 Z"
          fill="#2B6751"
          stroke="#123629"
          strokeWidth="0.95"
        />
        <path
          d="M 243.2 116 C 243.2 111.5, 239 110, 236 112.5 C 234.6 114, 234.6 116.8, 236.6 118.2 C 239 119.5, 243.2 118.4, 243.2 116 Z"
          fill="#DFB690"
          stroke="#1B2D6B"
          strokeWidth="0.75"
        />
        <path d="M 237 111.8 C 239.8 110.2, 243.8 111.8, 243.6 117.2 C 241.6 117, 240.4 115.2, 240 113.2 Z" fill="#162354" />
        {/* Holding small steaming earthen teacup */}
        <path d="M 235 131 C 231 131, 229 130, 228 128" fill="none" stroke="#1B2D6B" strokeWidth="1.9" />
        <circle cx="228.5" cy="128.5" r="1.2" fill="#DFB690" stroke="#1B2D6B" strokeWidth="0.55" />
        <rect x="225.2" y="126.5" width="3.4" height="3.2" rx="0.5" fill="#EF6855" stroke="#1B2D6B" strokeWidth="0.55" />
        <path d="M 227 125 Q 226 123 227.5 121" fill="none" stroke="#FFF8DC" strokeWidth="0.75" opacity="0.76" className="akath-katta-ember-a" />
        <path d="M 238 124 C 235 126, 233 129, 231 133" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.82" opacity="0.82" />
      </g>
    </g>
  </g>
);

/**
 * 1C. Sister Hand-Drawn Banyan Storytelling & Manuscript-Craft Circle (About Exclusive)
 * Kindred to the Hero's Godavari Banyan gathering yet thoughtfully distinct for
 * Akath's "About" chapter ("Rooted in Language. Driven by Stories."):
 * An asymmetric, wind-sculpted ancient Banyan on the western Sahyadri terrace
 * with a gently swinging brass bough lamp suspended overhead, a carved wooden
 * Marathi chaurang (low writing desk) with open manuscript & inkpot, a woven
 * basket of freshly bound books, a brass chai kettle, and 5 intergenerational
 * figures — elder author, young woman editor taking proof notes, an absorbed
 * child listener sitting cross-legged in front, a quiet poet leaning against
 * the gnarled trunk, and a companion pouring chai.
 */
const AboutBanyanStorytellerScene: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => {
  const [isBanyanHovered, setIsBanyanHovered] = useState(false);
  const [glowPulseId, setGlowPulseId] = useState(0);

  const handleEnter = () => {
    setIsBanyanHovered(true);
    setGlowPulseId((n) => n + 1);
  };

  const handleLeave = () => {
    setIsBanyanHovered(false);
  };

  return (
    <g
      id="about-banyan-storyteller-scene"
      transform={transform}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`akath-about-banyan-interactive pointer-events-auto ${
        isBanyanHovered ? 'is-banyan-hovered' : ''
      }`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <defs>
        {/* Warmer Parchment-Twilight Emerald & Olive-Gold Canopy Palette */}
        <linearGradient id={`aboutBanyanCanopy-${uid}`} x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#4A865F" stopOpacity="0.46" />
          <stop offset="48%" stopColor="#1E5942" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#103628" stopOpacity="0.50" />
        </linearGradient>

        <linearGradient id={`aboutBanyanCrown-${uid}`} x1="0%" y1="0%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#FFE692" stopOpacity="0.64" />
          <stop offset="46%" stopColor="#85B17A" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#174D3A" stopOpacity="0.16" />
        </linearGradient>

        <linearGradient id={`aboutBanyanBark-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#725A44" stopOpacity="0.72" />
          <stop offset="42%" stopColor="#4A423A" stopOpacity="0.76" />
          <stop offset="82%" stopColor="#1C3D36" stopOpacity="0.78" />
          <stop offset="100%" stopColor="#1B2D6B" stopOpacity="0.68" />
        </linearGradient>

        <radialGradient id={`aboutLampPool-${uid}`} cx="50%" cy="46%" r="54%">
          <stop offset="0%" stopColor="#FFFBE6" stopOpacity="0.94" />
          <stop offset="30%" stopColor="#FFD966" stopOpacity="0.58" />
          <stop offset="66%" stopColor="#E6B84C" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#FFD966" stopOpacity="0" />
        </radialGradient>

        {/* Soft Transient Golden Light Glow Triggered on Hover */}
        <radialGradient id={`aboutBanyanHoverGlow-${uid}`} cx="52%" cy="42%" r="56%">
          <stop offset="0%" stopColor="#FFFDF0" stopOpacity="0.92" />
          <stop offset="32%" stopColor="#FFE27A" stopOpacity="0.58" />
          <stop offset="64%" stopColor="#F2C85B" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FFD966" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Transparent Interactive Hit Area Covering the Banyan Tree Canopy & Boughs */}
      <ellipse
        cx="152"
        cy="82"
        rx="150"
        ry="88"
        fill="#000"
        fillOpacity="0"
        style={{ pointerEvents: 'all' }}
      />

      {/* Soft Transient Golden Sunbeam Bloom Behind the Canopy on Hover */}
      <g
        key={glowPulseId}
        className={
          glowPulseId > 0
            ? 'akath-about-banyan-hover-glow is-pulsing'
            : 'akath-about-banyan-hover-glow'
        }
        style={{ pointerEvents: 'none' }}
      >
        <ellipse
          cx="154"
          cy="52"
          rx="148"
          ry="72"
          fill={`url(#aboutBanyanHoverGlow-${uid})`}
        />
        <ellipse
          cx="156"
          cy="36"
          rx="96"
          ry="34"
          fill="#FFFBE6"
          opacity="0.48"
         
        />
      </g>

      {/* Warm Downward Lantern Pool From Hanging Brass Bough Lamp Over the Chaurang Desk */}
      <ellipse
        cx="166"
        cy="128"
        rx="92"
        ry="40"
        fill={`url(#aboutLampPool-${uid})`}
        opacity="0.84"
      />

      {/* =====================================================================
          A. ASYMMETRIC WIND-SWEPT ANCIENT BANYAN CANOPY (LEANING RIGHTWARD)
             Hovering gently shimmers the leaf clusters & awakens golden dappled light.
          ===================================================================== */}
      <g className="akath-about-banyan-canopy-shimmer">
        {/* Back Foliage Silhouette */}
        <path
          d="M 10 86 C 2 68, 12 46, 32 40 C 38 20, 62 10, 88 14 C 106 -2, 144 -6, 174 6 C 202 0, 234 10, 252 28 C 274 28, 290 44, 292 64 C 296 78, 282 92, 260 92 C 238 96, 214 91, 192 86 C 166 93, 136 92, 112 86 C 84 94, 48 96, 24 88 C 16 88, 12 88, 10 86 Z"
          fill={`url(#aboutBanyanCanopy-${uid})`}
        />

        {/* Shaded Under-Bough Recesses */}
        <g fill="#0E3326" opacity="0.28">
          <path d="M 18 84 C 40 73, 66 72, 92 80 C 72 93, 38 94, 18 84 Z" />
          <path d="M 108 80 C 138 69, 174 70, 202 80 C 178 92, 134 92, 108 80 Z" />
          <path d="M 214 80 C 240 72, 266 74, 284 84 C 266 94, 234 94, 214 80 Z" />
        </g>

        {/* Mid-Tier Sunlit Foliage Clouds */}
        <path
          d="M 24 76 C 18 58, 34 42, 56 40 C 66 22, 94 14, 120 20 C 140 8, 174 8, 198 20 C 222 16, 248 26, 258 44 C 276 48, 284 64, 274 78 C 258 86, 236 85, 214 78 C 188 84, 158 83, 134 77 C 106 84, 72 84, 48 77 C 34 82, 26 80, 24 76 Z"
          fill="#1F644C"
          opacity="0.30"
          className="akath-leaf-shimmer-layer-a"
        />

        {/* Golden-Hour Crown Wash */}
        <path
          d="M 38 40 C 50 20, 76 12, 104 16 C 122 2, 160 0, 186 12 C 210 6, 238 14, 252 30 C 268 32, 278 42, 282 54 C 262 46, 236 44, 212 46 C 186 34, 148 32, 120 40 C 92 34, 62 36, 38 40 Z"
          fill={`url(#aboutBanyanCrown-${uid})`}
          className="akath-leaf-shimmer-layer-b"
        />

        {/* Subtle Hover-Activated Sun-Dappled Golden Leaf Highlights */}
        <g className="akath-about-banyan-sun-dapples" fill="#FFF2B2">
          <ellipse cx="74" cy="34" rx="16" ry="7" />
          <ellipse cx="148" cy="22" rx="22" ry="8" />
          <ellipse cx="222" cy="36" rx="18" ry="7.5" />
          <circle cx="110" cy="46" r="2.2" fill="#FFFDF4" />
          <circle cx="188" cy="28" r="2.4" fill="#FFFDF4" />
          <circle cx="246" cy="48" r="1.9" fill="#FFD966" />
        </g>

        {/* Breathing Parchment Sky Openings */}
        <g fill={surfaceHex} opacity="0.80">
          <path d="M 56 58 Q 68 50 80 57 Q 69 64 56 58 Z" />
          <path d="M 134 38 Q 148 30 162 38 Q 148 45 134 38 Z" />
          <path d="M 218 52 Q 230 45 242 53 Q 230 60 218 52 Z" />
          <path d="M 184 23 Q 194 17 204 24 Q 194 29 184 23 Z" />
        </g>

        {/* Individual Pointed Hand-Drawn Banyan Leaf Sprays */}
        <g
          fill="#1B5B44"
          fillOpacity="0.60"
          stroke="#113629"
          strokeWidth="0.7"
          className="akath-leaf-shimmer-layer-c"
        >
          <path d="M 12 56 Q 3 49 8 42 Q 16 47 12 56 Z M 46 22 Q 42 13 50 10 Q 54 18 46 22 Z" />
          <path d="M 122 5 Q 124 -3 132 -2 Q 130 5 122 5 Z M 254 28 Q 262 21 269 26 Q 262 33 254 28 Z" />
          <path d="M 290 66 Q 299 63 301 70 Q 293 74 290 66 Z" />
        </g>
      </g>

    {/* =====================================================================
        B. ASYMMETRIC GNARLED TRUNK (LEFT-ANCHORED) & SWEEPING OVERHEAD BOUGH
        ===================================================================== */}
    <path
      d="M 74 88
         C 54 78, 36 74, 18 76
         L 19 71
         C 42 68, 62 70, 78 80
         C 76 60, 70 42, 62 26
         L 67 24
         C 78 40, 86 56, 90 74
         C 102 54, 118 36, 138 22
         L 142 26
         C 124 40, 110 58, 102 76
         C 142 62, 206 58, 274 70
         L 272 76
         C 208 66, 150 70, 108 90
         C 104 112, 110 132, 130 150
         L 110 150
         C 102 141, 95 135, 88 136
         C 80 137, 74 142, 66 150
         L 46 150
         C 68 132, 76 112, 74 88 Z"
      fill={`url(#aboutBanyanBark-${uid})`}
    />

    {/* Bark Hatching, Knot Hollow & Upper Bough Rim-Light */}
    <g fill="none" stroke="#153B2E" opacity="0.82">
      <path d="M 74 88 C 76 112, 68 132, 46 150 M 108 90 C 104 112, 110 132, 130 150" strokeWidth="1.75" />
      <path d="M 82 90 C 83 110, 78 128, 66 144 M 92 88 C 91 108, 94 122, 100 135 M 100 92 C 99 110, 103 128, 114 144" strokeWidth="1.0" opacity="0.82" />
      {/* Secondary upper twigs */}
      <path d="M 164 66 C 176 52, 190 42, 208 32" strokeWidth="1.85" />
      <path d="M 218 66 C 234 56, 250 50, 268 48" strokeWidth="1.45" />
    </g>
    <g fill="none" stroke={`url(#goldFoil-${uid})`} opacity="0.86">
      <path d="M 105 76 C 144 63, 206 59, 272 70" strokeWidth="1.15" />
      <path d="M 74 94 C 75 112, 70 128, 55 144" strokeWidth="1.0" opacity="0.78" />
    </g>

    {/* Scalloped Copperplate Ink Canopy Contours & Golden Crown Rim */}
    <g fill="none" stroke="#11382B" opacity="0.72">
      <path
        d="M 10 86 C 2 68, 12 46, 32 40 C 38 20, 62 10, 88 14 C 106 -2, 144 -6, 174 6 C 202 0, 234 10, 252 28 C 274 28, 290 44, 292 64 C 296 78, 282 92, 260 92"
        strokeWidth="1.5"
      />
      <path
        d="M 22 66 Q 38 55 56 63 M 54 34 Q 76 23 98 31 M 126 18 Q 156 8 186 20 M 202 36 Q 226 26 250 38 M 244 64 Q 262 56 278 68"
        strokeWidth="1.1"
      />
      <path d="M 32 88 L 38 83 M 42 90 L 48 85 M 246 90 L 252 85 M 256 89 L 262 84" strokeWidth="0.75" opacity="0.65" />
    </g>
    <path
      d="M 34 36 C 44 19, 66 12, 88 14 C 106 -2, 144 -6, 174 6 C 202 0, 234 10, 252 28 C 270 28, 284 39, 290 54"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.8"
      opacity="0.90"
    />

    {/* Braided Aerial Prop Roots (Anchoring Left Edge & Far-Right Natural Archway) */}
    <g fill="none" stroke="#1B4335" opacity="0.76">
      <path d="M 28 80 C 24 102, 29 128, 24 158" strokeWidth="2.1" />
      <path d="M 34 82 C 31 104, 35 128, 32 156" strokeWidth="1.15" opacity="0.78" />
      <path d="M 262 76 C 260 100, 265 128, 260 158" strokeWidth="2.2" />
      <path d="M 268 78 C 270 102, 266 126, 270 156" strokeWidth="1.2" opacity="0.78" />
      <path d="M 244 76 C 246 98, 242 122, 246 149" strokeWidth="1.4" />
    </g>
    <g fill="none" stroke="#174D3A" opacity="0.60">
      <g className="akath-banyan-root-sway-a">
        <path d="M 52 82 C 50 96, 53 108, 50 120" strokeWidth="0.9" />
        <path d="M 224 76 C 226 90, 223 104, 226 116" strokeWidth="0.92" />
      </g>
      <g className="akath-banyan-root-sway-b">
        <path d="M 134 78 C 135 90, 133 100, 135 110" strokeWidth="0.82" />
        <path d="M 278 80 C 279 94, 277 106, 279 120" strokeWidth="0.85" />
      </g>
    </g>

    {/* Suspended Hanging Brass Bough Lamp Gently Swinging Above the Storytellers */}
    <g transform="translate(168, 74)">
      <g className="akath-lamp-pendulum">
        <line x1="0" y1="0" x2="0" y2="23" stroke="#1B2D6B" strokeWidth="0.95" opacity="0.82" />
        <path d="M -5 23 L 5 23 L 3.4 20 L -3.4 20 Z" fill="#1B2D6B" />
        <path d="M -4 23 L -3 31 L 3 31 L 4 23 Z" fill="#FFF8D6" fillOpacity="0.58" stroke="#1B2D6B" strokeWidth="0.85" />
        <path d="M -4.2 31 L 4.2 31 L 1.8 33.4 L -1.8 33.4 Z" fill="#1B2D6B" />
        <g className="akath-diya-glint">
          <circle cx="0" cy="27.2" r="9.5" fill="#FFD966" opacity="0.56" />
          <circle cx="0" cy="27.2" r="3.8" fill="#EF6855" opacity="0.90" />
          <circle cx="0" cy="26.8" r="1.8" fill="#FFFDF6" opacity="1" />
        </g>
      </g>
    </g>

    {/* Falling Drifting Leaf */}
    <path d="M 206 90 Q 211 88 212 93 Q 207 94 206 90 Z" fill="#E6B84C" stroke="#154233" strokeWidth="0.45" className="akath-banyan-leaf-drift-a" />

    {/* =====================================================================
        C. STEPPED SANDSTONE VERANDA TERRACE & WOVEN STORYTELLING CARPET
        ===================================================================== */}
    <g>
      <path d="M 14 158 L 280 158 L 290 170 L 4 170 Z" fill="#1B2D6B" opacity="0.20" />
      <path d="M 28 148 L 266 148 L 276 158 L 18 158 Z" fill="#1B2D6B" opacity="0.28" />
      {/* Warm Ochre-Indigo Handloom Floor Runner */}
      <path d="M 96 148 L 246 148 L 250 152.5 L 92 152.5 Z" fill="#243B8A" opacity="0.28" />
      <line x1="100" y1="150.2" x2="242" y2="150.2" stroke="#FFD966" strokeWidth="0.9" strokeDasharray="4 4" opacity="0.88" />
      <g fill="none" stroke="#1B2D6B" opacity="0.66">
        <path d="M 28 148 L 266 148 M 16 158 L 278 158 M 4 170 L 290 170" strokeWidth="1.4" />
        <path d="M 56 148 L 54 158 M 104 148 L 104 158 M 154 148 L 154 158 M 206 148 L 206 158 M 254 148 L 256 158" strokeWidth="0.8" opacity="0.7" />
        <path d="M 42 158 L 40 170 M 94 158 L 94 170 M 148 158 L 148 170 M 202 158 L 202 170 M 252 158 L 254 170" strokeWidth="0.8" opacity="0.64" />
      </g>
      <line x1="30" y1="148.3" x2="264" y2="148.3" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.35" opacity="0.90" />
      {/* Grass Tufts & Tiny Marigold Blossoms */}
      <g fill="none" stroke="#174D3A" strokeWidth="0.95" opacity="0.72">
        <path d="M 10 170 Q 8 163 4 161 M 14 170 Q 15 164 19 162 M 280 170 Q 282 163 286 161" />
      </g>
      <circle cx="16" cy="162" r="1.4" fill="#EF6855" opacity="0.86" />
      <circle cx="283" cy="162" r="1.35" fill="#FFD966" opacity="0.92" />
    </g>

    {/* =====================================================================
        D. INTERGENERATIONAL STORYTELLING & MANUSCRIPT CRAFT (5 HAND-TINTED FIGURES)
           1. Quiet Poet Leaning Back Against the Banyan Trunk
           2. Elder Author Seated by the Low Carved Wooden Chaurang Desk
           3. Curious Child Reader Listening Chin-in-Hands in Front
           4. Young Woman Editor Reviewing Proof Pages With Fountain Pen
           5. Companion Pouring Chai Beside a Woven Basket of Bound Books
        ===================================================================== */}
    <g id="about-banyan-storytellers">
      {/* PERSON 1 (Left Against Trunk): Quiet Poet Resting Against the Banyan Roots With Journal */}
      <g>
        {/* Stretched/drawn knees leaning comfortably against trunk */}
        <path d="M 52 148 C 60 138, 76 138, 86 148 Z" fill="#174D3A" stroke="#113629" strokeWidth="0.95" />
        <path
          d="M 54 148 C 52 136, 56 125, 64 124 C 71 124, 75 130, 77 139 L 79 148 Z"
          fill="#2B6751"
          stroke="#123629"
          strokeWidth="1.0"
        />
        {/* Warm hand-tinted profile face gazing peacefully rightward */}
        <path
          d="M 62 117.5 C 62 112.5, 66.5 110.8, 70.4 113.5 C 71.8 114.8, 72 117, 70.8 118.8 C 69.8 120.2, 68 121.2, 65.8 121.2 C 63.4 121.2, 62 119.6, 62 117.5 Z"
          fill="#E5C09B"
          stroke="#1B2D6B"
          strokeWidth="0.78"
        />
        <path d="M 61.5 118.2 C 60.5 114, 63 110.4, 68.4 111.2 C 66.8 112.4, 64.6 113.6, 64 117.2 Z" fill="#162354" />
        {/* Open poetry journal propped on knees */}
        <path d="M 73 137 L 83 134.5 L 85 140 L 75 142.5 Z" fill="#FFFDF4" stroke="#1B2D6B" strokeWidth="0.8" />
        <path d="M 66 125 C 69 127, 72 131, 74 135" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.88" opacity="0.84" />
      </g>

      {/* PERSON 2 (Inner Left — ELDER AUTHOR): Seated on Low Paat Cushion Reading Aloud Over Chaurang */}
      <g>
        {/* Low wooden seating paat / cushion */}
        <rect x="103" y="145" width="32" height="3.2" rx="0.8" fill="#5D4C3C" stroke="#1B2D6B" strokeWidth="0.7" />
        <path d="M 104 145 C 110 137, 126 136, 136 145 Z" fill="#EFE7D6" stroke="#1B2D6B" strokeWidth="0.9" />
        {/* Warm ivory khadi kurta + deep indigo waistcoat (bandi) */}
        <path
          d="M 107 145 C 106 132, 110 120, 119 119 C 126 119, 131 126, 134 136 L 137 145 Z"
          fill="#243B8A"
          stroke="#152254"
          strokeWidth="1.05"
        />
        <path d="M 111 124 L 122 124 L 120 143 L 109 143 Z" fill="#FAF4E4" opacity="0.85" />
        {/* Warm face, silver hair & gentle storytelling gesture */}
        <path d="M 119 119 L 121 115.5" stroke="#DFB892" strokeWidth="2.6" />
        <path
          d="M 116 111.5 C 116 106, 121 104.2, 125.4 107 C 127.2 108.5, 127.8 111, 127 113 C 126.2 114.8, 124.6 116.2, 122 116.4 C 118.8 116.5, 116 114.8, 116 111.5 Z"
          fill="#E5C09B"
          stroke="#1B2D6B"
          strokeWidth="0.82"
        />
        <path d="M 115.5 112.5 C 114.6 108.4, 117.2 104.6, 123 105.2 C 124.8 105.6, 125.8 106.8, 125 107.6 C 122 107, 119.5 108.6, 118.8 112 Z" fill="#2A3A68" />
        <circle cx="125.2" cy="110.8" r="1.35" fill="none" stroke="#1B2D6B" strokeWidth="0.65" />
        {/* Gently animated storytelling arm reaching toward open manuscript on chaurang */}
        <g className="akath-speaker-gesture">
          <path d="M 124 128 C 131 128, 138 128, 145 129.5" fill="none" stroke="#FAF4E4" strokeWidth="3.0" />
          <path d="M 124 128 C 131 128, 138 128, 145 129.5" fill="none" stroke="#1B2D6B" strokeWidth="1.0" />
          <circle cx="146" cy="129.8" r="1.45" fill="#E5C09B" stroke="#1B2D6B" strokeWidth="0.6" />
        </g>
        <path d="M 124 121 C 128 123, 131 127, 133 132" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.98" opacity="0.90" />
      </g>

      {/* CARVED LOW WOODEN MARATHI CHAURANG (WRITING DESK) + OPEN MANUSCRIPT & INKPOT */}
      <g>
        {/* Desk top & curved wooden legs */}
        <rect x="145" y="135.5" width="44" height="3.2" rx="0.7" fill="#6D533E" stroke="#1B2D6B" strokeWidth="0.85" />
        <path d="M 149 138.7 L 147 148 M 185 138.7 L 187 148" stroke="#5D4634" strokeWidth="2.1" />
        <path d="M 149 138.7 L 147 148 M 185 138.7 L 187 148" stroke="#1B2D6B" strokeWidth="0.75" />
        {/* Open Illuminated Manuscript Spread Resting on Desk */}
        <path d="M 150 135.5 Q 158 131.5 166 132.5 L 166 135.5 Z" fill="#FFFDF4" stroke="#1B2D6B" strokeWidth="0.75" />
        <path d="M 166 132.5 Q 174 131.5 182 135.5 L 166 135.5 Z" fill="#FFF6DC" stroke="#1B2D6B" strokeWidth="0.75" />
        {/* Brass Inkpot & Feather Quill Resting Beside the Pages */}
        <rect x="182.5" y="132.2" width="4" height="3.3" rx="0.6" fill="#243B8A" stroke="#1B2D6B" strokeWidth="0.6" />
        <path d="M 184.5 132.2 Q 188 126 190 123.5" fill="none" stroke="#FFFDF4" strokeWidth="1.25" />
        <path d="M 184.5 132.2 Q 188 126 190 123.5" fill="none" stroke="#1B2D6B" strokeWidth="0.65" />
        {/* Warm Lantern Motes Floating Above the Manuscript */}
        <circle cx="163" cy="116" r="1.15" fill="#FFD966" className="akath-katta-ember-a" />
        <circle cx="174" cy="111" r="1.0" fill="#FFF8D6" className="akath-katta-ember-b" />
      </g>

      {/* PERSON 3 (Front Center-Left): Curious Young Child Reader Sitting Cross-Legged Listening in Wonder */}
      <g>
        <path d="M 132 148 C 136 142, 147 142, 152 148 Z" fill="#3B5F8F" stroke="#1B2D6B" strokeWidth="0.85" />
        <path
          d="M 136 148 C 135 140, 138 133, 143 133 C 148 133, 150 138, 151 148 Z"
          fill="#557FB0"
          stroke="#1B2D6B"
          strokeWidth="0.9"
        />
        <circle cx="143" cy="127.5" r="3.8" fill="#E5C09B" stroke="#1B2D6B" strokeWidth="0.75" />
        <path d="M 139.2 128 C 138.8 124.8, 141.6 123, 145.6 124.4 C 144 125.4, 142 126.2, 141.4 128.4 Z" fill="#162354" />
        {/* Small open picture/storybook right beside the child */}
        <path d="M 151 146 L 159 144.5 L 160 148 L 152 148.5 Z" fill="#FFFDF4" stroke="#1B2D6B" strokeWidth="0.7" />
      </g>

      {/* PERSON 4 (Inner Right — YOUNG WOMAN EDITOR): Ivory & Heritage Emerald Sari Reviewing Proof Sheets */}
      <g>
        <path d="M 190 148 C 199 138, 216 139, 224 148 Z" fill="#FAF4E4" stroke="#1B2D6B" strokeWidth="0.95" />
        <path
          d="M 219 148 C 221 135, 217 123, 208 122 C 201 122, 196 128, 193 138 L 189 148 Z"
          fill="#FAF4E4"
          stroke="#1B2D6B"
          strokeWidth="1.0"
        />
        {/* Deep Heritage Emerald Sari Pallu With Gold Zari Edge */}
        <path d="M 216 126 C 211 123, 203 126, 197 137 L 214 142 Z" fill="#1D624C" fillOpacity="0.90" stroke="#123C2E" strokeWidth="0.72" />
        <path d="M 214 126 C 208 128, 203 132, 198 139" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.95" opacity="0.94" />
        {/* Warm face profile, sleek dark hair & bun */}
        <path d="M 208 122 L 206 118.5" stroke="#DFB892" strokeWidth="2.4" />
        <path
          d="M 211 114.5 C 211 109.2, 206 107.4, 202.2 110.2 C 200.5 111.6, 200 113.8, 200.8 115.8 C 201.5 117.4, 203 118.8, 205.5 119 C 208.6 119.1, 211 117.4, 211 114.5 Z"
          fill="#E5C09B"
          stroke="#1B2D6B"
          strokeWidth="0.8"
        />
        <path d="M 203.2 109.8 C 206.8 107.6, 211.8 109.8, 211.6 116 C 209.4 116.8, 208 115, 207.4 113.2 Z" fill="#162354" />
        <circle cx="213.2" cy="116" r="2.5" fill="#162354" />
        <circle cx="211.6" cy="114.2" r="0.9" fill="#FFFDF4" />
        {/* Arm holding fountain pen poised over proof pages */}
        <path d="M 202 131 C 196 131, 191 131, 187 132" fill="none" stroke="#FAF4E4" strokeWidth="2.6" />
        <path d="M 202 131 C 196 131, 191 131, 187 132" fill="none" stroke="#1B2D6B" strokeWidth="0.95" />
        <circle cx="186.5" cy="132" r="1.35" fill="#E5C09B" stroke="#1B2D6B" strokeWidth="0.55" />
        <path d="M 202 124 C 198 126, 195 130, 193 134" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.95" opacity="0.90" />
      </g>

      {/* PERSON 5 (Far Right): Companion Pouring Warm Chai Beside Woven Book Basket */}
      <g opacity="0.94">
        <path d="M 228 148 C 234 140, 246 140, 252 148 Z" fill="#243B8A" stroke="#152254" strokeWidth="0.9" />
        <path
          d="M 248 148 C 249 136, 245 127, 238 126 C 232 126, 229 132, 227 140 L 225 148 Z"
          fill="#243B8A"
          stroke="#152254"
          strokeWidth="0.95"
        />
        <path
          d="M 241.5 119.5 C 241.5 115, 237.2 113.5, 234.2 116 C 232.8 117.4, 232.8 120.2, 234.8 121.6 C 237.2 122.8, 241.5 121.8, 241.5 119.5 Z"
          fill="#DFB690"
          stroke="#1B2D6B"
          strokeWidth="0.75"
        />
        <path d="M 235.2 115.2 C 238.2 113.6, 242 115.4, 241.8 120.6 C 239.8 120.4, 238.6 118.6, 238.2 116.8 Z" fill="#162354" />
        {/* Brass Chai Kettle & Steaming Pour */}
        <path d="M 233 134 C 228 134, 226 135, 224 137" fill="none" stroke="#1B2D6B" strokeWidth="1.9" />
        <ellipse cx="222.5" cy="139" rx="3.4" ry="2.6" fill="#E6A62A" stroke="#1B2D6B" strokeWidth="0.65" />
        <path d="M 219.2 138.5 L 217 137" stroke="#1B2D6B" strokeWidth="0.8" />
        <path d="M 222.5 135 Q 221.5 132.5 223 130" fill="none" stroke="#FFF8DC" strokeWidth="0.75" opacity="0.78" className="akath-katta-ember-b" />

        {/* Woven Cane Basket Holding Freshly Bound Akath Books on Far Right */}
        <path d="M 249 148 L 251 140 L 263 140 L 265 148 Z" fill="#C9A26B" fillOpacity="0.72" stroke="#1B2D6B" strokeWidth="0.75" />
        <line x1="251" y1="143" x2="263" y2="143" stroke="#1B2D6B" strokeWidth="0.55" opacity="0.65" />
        <line x1="250.5" y1="146" x2="263.5" y2="146" stroke="#1B2D6B" strokeWidth="0.55" opacity="0.65" />
        <rect x="252.5" y="136.5" width="3.5" height="4" rx="0.4" fill="#243B8A" stroke="#1B2D6B" strokeWidth="0.5" />
        <rect x="256.5" y="135.8" width="3.5" height="4.7" rx="0.4" fill="#3B6B5C" stroke="#1B2D6B" strokeWidth="0.5" />
        <rect x="260.2" y="137" width="2.8" height="3.5" rx="0.4" fill="#FFFDF4" stroke="#1B2D6B" strokeWidth="0.5" />
      </g>
    </g>
  </g>
  );
};

/**
 * 1D. Lightweight Animated Floating Banyan Leaves Drifting Slowly Across the About Section
 * Pure CSS GPU-composited SVG breeze paths mimicking the Hero's tranquil breeze without
 * cluttering centered typography — automatically paused off-screen & under reduced motion.
 */
const AboutDriftingBanyanLeaves: React.FC<{ tier: ViewportTier }> = ({ tier }) => {
  const leaves =
    tier === 'mobile'
      ? [
          { x: 64, y: 452, scale: 0.94, fill: '#4E8660', cls: 'akath-about-breeze-leaf-1' },
          { x: 168, y: 498, scale: 0.84, fill: '#D9BC62', cls: 'akath-about-breeze-leaf-2' },
          { x: 42, y: 386, scale: 0.88, fill: '#6D9E73', cls: 'akath-about-breeze-leaf-3' },
          { x: 248, y: 464, scale: 0.80, fill: '#356E52', cls: 'akath-about-breeze-leaf-4' },
        ]
      : tier === 'tablet'
      ? [
          { x: 240, y: 382, scale: 1.05, fill: '#4E8660', cls: 'akath-about-breeze-leaf-1' },
          { x: 390, y: 438, scale: 0.92, fill: '#D9BC62', cls: 'akath-about-breeze-leaf-2' },
          { x: 195, y: 310, scale: 0.95, fill: '#6D9E73', cls: 'akath-about-breeze-leaf-3' },
          { x: 520, y: 396, scale: 0.88, fill: '#356E52', cls: 'akath-about-breeze-leaf-4' },
          { x: 640, y: 450, scale: 0.82, fill: '#E4C76E', cls: 'akath-about-breeze-leaf-5' },
        ]
      : [
          { x: 310, y: 368, scale: 1.12, fill: '#4E8660', cls: 'akath-about-breeze-leaf-1' },
          { x: 460, y: 422, scale: 0.96, fill: '#D9BC62', cls: 'akath-about-breeze-leaf-2' },
          { x: 250, y: 296, scale: 1.0, fill: '#6D9E73', cls: 'akath-about-breeze-leaf-3' },
          { x: 690, y: 396, scale: 0.92, fill: '#356E52', cls: 'akath-about-breeze-leaf-4' },
          { x: 890, y: 344, scale: 0.88, fill: '#E4C76E', cls: 'akath-about-breeze-leaf-5' },
        ];

  return (
    <g id="about-drifting-banyan-leaves" style={{ pointerEvents: 'none' }}>
      {leaves.map((leaf, index) => (
        <g key={index} transform={`translate(${leaf.x}, ${leaf.y}) scale(${leaf.scale})`}>
          <g className={leaf.cls}>
            <path
              d="M 0 0 Q 6 -4 11 1 Q 6 6 0 0 Z"
              fill={leaf.fill}
              stroke="#143D2E"
              strokeWidth="0.65"
              strokeLinejoin="round"
            />
            <path
              d="M 0.8 0.2 Q 5.2 0.4 9.5 1"
              fill="none"
              stroke="#FAF6EC"
              strokeWidth="0.45"
              opacity="0.72"
            />
          </g>
        </g>
      ))}
    </g>
  );
};

/**
 * 1B. Subtle, Lightweight Animated SVG Ripple Layer Over the Godavari Water Surface
 * Combines softly drifting sinusoidal current waves with delicate perspective-foreshortened
 * concentric rings catching golden dusk reflections — pure CSS/SVG, zero JS loop overhead.
 */
const GodavariWaterRipples: React.FC<{
  tier: ViewportTier;
  uid: string;
}> = ({ tier, uid }) => {
  if (tier === 'mobile') {
    return (
      <g id="godavari-water-ripples-mobile" fill="none" strokeLinecap="round">
        {/* Flowing Sinusoidal Current Ripples Tuned for 430px Portrait Mobile Framing */}
        <g className="akath-godavari-ripple-flow-a" opacity="0.64">
          <path
            d="M -30 607 Q 45 603 120 608 T 270 606 T 460 608"
            stroke="#FFF8DC"
            strokeWidth="1.05"
            strokeDasharray="22 20 14 26"
          />
          <path
            d="M -24 631 Q 62 627 148 632 T 318 630 T 462 632"
            stroke="#243B8A"
            strokeWidth="0.85"
            strokeDasharray="16 24 12 28"
            opacity="0.46"
          />
        </g>
        <g className="akath-godavari-ripple-flow-b" opacity="0.56">
          <path
            d="M -30 619 Q 54 615 138 620 T 306 618 T 460 620"
            stroke={`url(#goldBeam-${uid})`}
            strokeWidth="1.15"
            strokeDasharray="18 22 14 22"
          />
          <path
            d="M -18 643 Q 74 639 168 644 T 356 641 T 456 644"
            stroke="#FFFDF4"
            strokeWidth="0.8"
            strokeDasharray="14 26"
            opacity="0.66"
          />
        </g>
        {/* Subtle Expanding Concentric Water Surface Rings Centered Inside Safe Mobile Frame */}
        <g transform="translate(116, 624)">
          <ellipse cx="0" cy="0" rx="20" ry="2.9" stroke="#FFF8DC" strokeWidth="0.92" className="akath-godavari-ring-a" />
          <ellipse cx="0" cy="0" rx="12" ry="1.8" stroke="#FFD966" strokeWidth="0.72" className="akath-godavari-ring-b" />
        </g>
        <g transform="translate(316, 616)">
          <ellipse cx="0" cy="0" rx="22" ry="3.2" stroke="#FFD966" strokeWidth="0.92" className="akath-godavari-ring-b" />
          <ellipse cx="0" cy="0" rx="13" ry="1.9" stroke="#FFFDF6" strokeWidth="0.72" className="akath-godavari-ring-c" />
        </g>
      </g>
    );
  }

  if (tier === 'tablet') {
    return (
      <g id="godavari-water-ripples-tablet" fill="none" strokeLinecap="round">
        {/* Flowing Sinusoidal Current Ripples */}
        <g className="akath-godavari-ripple-flow-a" opacity="0.64">
          <path
            d="M -40 532 Q 95 527 230 533 T 500 531 T 770 534 T 1160 530"
            stroke="#FFF8DC"
            strokeWidth="1.1"
            strokeDasharray="30 24 18 32"
          />
          <path
            d="M -30 562 Q 115 557 260 563 T 550 560 T 840 564 T 1160 560"
            stroke="#243B8A"
            strokeWidth="0.9"
            strokeDasharray="24 28 14 34"
            opacity="0.46"
          />
        </g>
        <g className="akath-godavari-ripple-flow-b" opacity="0.56">
          <path
            d="M -40 546 Q 120 542 280 548 T 600 545 T 920 549 T 1160 546"
            stroke={`url(#goldBeam-${uid})`}
            strokeWidth="1.2"
            strokeDasharray="26 28 18 26"
          />
          <path
            d="M -20 572 Q 140 568 300 573 T 640 571 T 1150 573"
            stroke="#FFFDF4"
            strokeWidth="0.85"
            strokeDasharray="18 34"
            opacity="0.64"
          />
        </g>
        {/* Subtle Expanding Concentric Water Surface Rings */}
        <g transform="translate(310, 552)">
          <ellipse cx="0" cy="0" rx="28" ry="3.8" stroke="#FFF8DC" strokeWidth="1.0" className="akath-godavari-ring-a" />
          <ellipse cx="0" cy="0" rx="16" ry="2.2" stroke="#FFD966" strokeWidth="0.8" className="akath-godavari-ring-b" />
        </g>
        <g transform="translate(612, 543)">
          <ellipse cx="0" cy="0" rx="24" ry="3.2" stroke="#FFFDF6" strokeWidth="0.9" className="akath-godavari-ring-c" />
        </g>
        <g transform="translate(918, 546)">
          <ellipse cx="0" cy="0" rx="32" ry="4.2" stroke="#FFD966" strokeWidth="1.0" className="akath-godavari-ring-b" />
          <ellipse cx="0" cy="0" rx="18" ry="2.4" stroke="#FFFDF6" strokeWidth="0.8" className="akath-godavari-ring-a" />
        </g>
      </g>
    );
  }

  return (
    <g id="godavari-water-ripples-desktop" fill="none" strokeLinecap="round">
      {/* Flowing Sinusoidal Current Ripples Across Full Godavari River Ribbon */}
      <g className="akath-godavari-ripple-flow-a" opacity="0.66">
        <path
          d="M -50 531 Q 120 525 290 532 T 630 530 T 970 534 T 1310 530 T 1660 533"
          stroke="#FFF8DC"
          strokeWidth="1.15"
          strokeDasharray="36 28 20 34"
        />
        <path
          d="M -40 561 Q 150 555 340 562 T 720 559 T 1100 563 T 1480 559 T 1660 561"
          stroke="#243B8A"
          strokeWidth="0.95"
          strokeDasharray="28 32 16 36"
          opacity="0.45"
        />
      </g>
      <g className="akath-godavari-ripple-flow-b" opacity="0.58">
        <path
          d="M -50 546 Q 140 541 330 548 T 710 544 T 1090 549 T 1470 545 T 1660 548"
          stroke={`url(#goldBeam-${uid})`}
          strokeWidth="1.25"
          strokeDasharray="30 30 20 28"
        />
        <path
          d="M -30 573 Q 170 568 370 574 T 770 571 T 1170 575 T 1650 572"
          stroke="#FFFDF4"
          strokeWidth="0.88"
          strokeDasharray="20 38"
          opacity="0.65"
        />
      </g>
      {/* Subtle Expanding Perspective-Foreshortened Concentric Surface Rings */}
      <g transform="translate(364, 551)">
        <ellipse cx="0" cy="0" rx="30" ry="4.0" stroke="#FFF8DC" strokeWidth="1.0" className="akath-godavari-ring-a" />
        <ellipse cx="0" cy="0" rx="17" ry="2.3" stroke="#FFD966" strokeWidth="0.8" className="akath-godavari-ring-b" />
      </g>
      <g transform="translate(812, 542)">
        <ellipse cx="0" cy="0" rx="34" ry="4.4" stroke="#FFFDF6" strokeWidth="0.95" className="akath-godavari-ring-c" />
        <ellipse cx="0" cy="0" rx="19" ry="2.5" stroke="#FFD966" strokeWidth="0.8" className="akath-godavari-ring-a" />
      </g>
      <g transform="translate(1284, 546)">
        <ellipse cx="0" cy="0" rx="36" ry="4.6" stroke="#FFD966" strokeWidth="1.05" className="akath-godavari-ring-b" />
        <ellipse cx="0" cy="0" rx="21" ry="2.6" stroke="#FFFDF6" strokeWidth="0.82" className="akath-godavari-ring-c" />
      </g>
    </g>
  );
};

/**
 * 2. Distant Sahyadri Watchtower Bastion (Hero Left Escarpment)
 * Crisp stone watchtower & merlon wall gilded along its sunward crest.
 */
const SahyadriWatchtowerFort: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    <path
      d="M 4 28 L 4 13 L 12 13 L 12 9 L 20 9 L 20 13 L 32 13 L 32 6 L 40 6 L 40 10 L 48 10 L 48 6 L 56 6 L 56 10 L 64 10 L 64 6 L 72 6 L 72 14 L 84 14 L 84 10 L 92 10 L 92 14 L 100 14 L 100 28 Z"
      fill="#1B2D6B"
      opacity="0.28"
    />
    <path d="M 16 28 L 16 20 Q 21 16 26 20 L 26 28 Z" fill={surfaceHex} opacity="0.78" />
    <path
      d="M 4 28 L 4 13 L 12 13 L 12 9 L 20 9 L 20 13 L 32 13 L 32 6 L 40 6 L 40 10 L 48 10 L 48 6 L 56 6 L 56 10 L 64 10 L 64 6 L 72 6 L 72 14 L 84 14 L 84 10 L 92 10 L 92 14 L 100 14 L 100 28"
      fill="none"
      stroke="#1B2D6B"
      strokeWidth="1.2"
      opacity="0.48"
    />
    {/* Gilded Sun-Rim Parapet Edge */}
    <path
      d="M 12 9 L 20 9 M 32 6 L 40 6 M 48 6 L 56 6 M 64 6 L 72 6"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.2"
      opacity="0.86"
    />
    {/* Engraved Stone Courses, Embrasures & Shadow Hatching (Flag-Free Stone Bastion) */}
    <g stroke="#1B2D6B" strokeWidth="0.7" opacity="0.38">
      <line x1="6" y1="19" x2="98" y2="19" />
      <line x1="6" y1="24" x2="98" y2="24" />
      <line x1="58" y1="12" x2="70" y2="12" />
      <line x1="60" y1="15" x2="70" y2="15" />
      <line x1="44" y1="13" x2="44" y2="18" />
      <line x1="60" y1="13" x2="60" y2="18" />
    </g>
    {/* Subtle Warm Watchtower Arch Lantern Glint */}
    <circle
      cx="21"
      cy="23.5"
      r="1.45"
      fill="#FFD966"
      className="akath-diya-glint"
     
      opacity="0.80"
    />
  </g>
);

/**
 * 2B. Hand-Engraved Deccan Buddhist Great Stupa & Torana Gateway (Sanchi / Paithan Heritage)
 * Stepped circular Medhi drum with carved Vedika railing, hemispherical Anda dome gilded by
 * twilight sun-rim, square Harmika, three-tiered golden Chatravali parasols, triple-architrave
 * Torana gateway crowned by a Dharmachakra wheel, monolithic Stambha pillar, and entrance diyas.
 */
const BuddhistStupaMonastery: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Soft Radiant Dusk Halo Behind Golden Chatravali Crown */}
    <ellipse cx="86" cy="24" rx="46" ry="24" fill="#FFD966" opacity="0.16" />

    {/* Monolithic Ashokan-Inspired Stambha Stone Pillar (Left) */}
    <g>
      <path d="M 10 98 L 12 46 L 16 46 L 18 98 Z" fill="#1B2D6B" opacity="0.28" />
      <path d="M 10 98 L 12 46 L 16 46 L 18 98" fill="none" stroke="#1B2D6B" strokeWidth="1.0" opacity="0.54" />
      {/* Inverted Bell-Lotus Capital & Abacus */}
      <path d="M 9.5 46 C 10.5 41.5, 17.5 41.5, 18.5 46 Z" fill="#243B8A" opacity="0.46" stroke="#1B2D6B" strokeWidth="0.85" />
      <rect x="9" y="40.5" width="10" height="2.2" rx="0.5" fill={`url(#goldFoil-${uid})`} opacity="0.88" />
      {/* Miniature Crown Wheel on Pillar */}
      <circle cx="14" cy="37" r="2.6" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.95" opacity="0.90" />
      <circle cx="14" cy="37" r="0.8" fill="#FFD966" opacity="0.95" />
    </g>

    {/* Companion Miniature Votive Stupa (Right Terrace) */}
    <g>
      <path d="M 140 98 L 140 88 C 140 76, 148 70, 155 70 C 162 70, 170 76, 170 88 L 170 98 Z" fill="#1B2D6B" opacity="0.24" />
      <path d="M 140 98 L 140 88 C 140 76, 148 70, 155 70 C 162 70, 170 76, 170 88 L 170 98" fill="none" stroke="#1B2D6B" strokeWidth="1.0" opacity="0.48" />
      <line x1="138" y1="88" x2="172" y2="88" stroke="#1B2D6B" strokeWidth="0.9" opacity="0.46" />
      <rect x="151.5" y="66.5" width="7" height="3.5" fill="#1B2D6B" opacity="0.34" stroke="#1B2D6B" strokeWidth="0.75" />
      <line x1="155" y1="66.5" x2="155" y2="60.5" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.05" opacity="0.88" />
      <line x1="151.8" y1="63.5" x2="158.2" y2="63.5" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.9" opacity="0.88" />
    </g>

    {/* Great Stupa Base Plinth & Stepped Circular Medhi Drum */}
    <path
      d="M 16 102 L 16 96 L 26 96 L 26 84 L 146 84 L 146 96 L 156 96 L 156 102 Z"
      fill="#1B2D6B"
      opacity="0.25"
    />
    {/* Hemispherical Anda Dome Archival Wash */}
    <path
      d="M 34 84 C 34 40, 58 23, 86 23 C 114 23, 138 40, 138 84 Z"
      fill="#1B2D6B"
      opacity="0.26"
    />
    {/* Sunlit Paper-Highlight Crescent Along Western Curve of the Anda Dome */}
    <path
      d="M 41 80 C 42 46, 60 28, 84 26 C 66 31, 52 50, 50 80 Z"
      fill={surfaceHex}
      opacity="0.54"
    />
    {/* Crisp Hand-Engraved Anda Dome Outline & Concentric Masonry Courses */}
    <g fill="none" stroke="#1B2D6B" opacity="0.52">
      <path d="M 34 84 C 34 40, 58 23, 86 23 C 114 23, 138 40, 138 84" strokeWidth="1.35" />
      <path d="M 24 84 L 148 84 M 22 96 L 150 96 M 12 102 L 160 102" strokeWidth="1.2" />
      {/* Subtle Curved Stone Courses & Shadow Hatching on Right Hemisphere */}
      <path d="M 42 66 Q 86 60 130 66" strokeWidth="0.72" opacity="0.58" />
      <path d="M 50 48 Q 86 43 122 48" strokeWidth="0.72" opacity="0.52" />
      <path d="M 110 31 C 122 42, 128 60, 130 82 M 118 39 C 127 50, 132 64, 134 82" strokeWidth="0.68" opacity="0.50" />
      {/* Carved Lotus-Petal Collar Ring Around Drum */}
      <path
        d="M 36 84 Q 41 79 46 84 Q 51 79 56 84 Q 61 79 66 84 M 106 84 Q 111 79 116 84 Q 121 79 126 84 Q 131 79 136 84"
        strokeWidth="0.8"
        opacity="0.66"
      />
    </g>

    {/* Carved Vedika Stone Balustrade Railing Across Medhi Terrace */}
    <g stroke="#1B2D6B" strokeWidth="0.82" opacity="0.52">
      <line x1="28" y1="88" x2="66" y2="88" />
      <line x1="28" y1="92" x2="66" y2="92" />
      <line x1="106" y1="88" x2="144" y2="88" />
      <line x1="106" y1="92" x2="144" y2="92" />
      {/* Vertical Vedika Posts */}
      <line x1="34" y1="84" x2="34" y2="96" />
      <line x1="43" y1="84" x2="43" y2="96" />
      <line x1="52" y1="84" x2="52" y2="96" />
      <line x1="61" y1="84" x2="61" y2="96" />
      <line x1="111" y1="84" x2="111" y2="96" />
      <line x1="120" y1="84" x2="120" y2="96" />
      <line x1="129" y1="84" x2="129" y2="96" />
      <line x1="138" y1="84" x2="138" y2="96" />
    </g>

    {/* Gilded Dusk Sun-Rim Catching the Anda Dome Shoulder */}
    <path
      d="M 35 76 C 37 42, 58 24, 86 23 C 102 23, 116 28, 125 38"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.4"
      opacity="0.88"
    />

    {/* Square Carved Harmika Pavilion & Golden Three-Tiered Chatravali Parasols */}
    <g>
      <rect x="75" y="14" width="22" height="9" rx="0.6" fill="#1B2D6B" opacity="0.34" stroke="#1B2D6B" strokeWidth="1.05" />
      <g stroke={surfaceHex} strokeWidth="0.65" opacity="0.65">
        <line x1="79" y1="15" x2="79" y2="22" />
        <line x1="83.5" y1="15" x2="83.5" y2="22" />
        <line x1="88.5" y1="15" x2="88.5" y2="22" />
        <line x1="93" y1="15" x2="93" y2="22" />
      </g>
      {/* Gleaming Gold-Foil Yashti Mast & 3 Tiered Sacred Parasols */}
      <g
        stroke={`url(#goldFoil-${uid})`}
        fill={`url(#goldFoil-${uid})`}
       
        opacity="0.96"
      >
        <line x1="86" y1="14" x2="86" y2="-3.5" strokeWidth="1.45" />
        <path d="M 76 10 Q 86 7.5 96 10" fill="none" strokeWidth="1.35" />
        <path d="M 78.5 6 Q 86 3.8 93.5 6" fill="none" strokeWidth="1.25" />
        <path d="M 81.2 2 Q 86 0.2 90.8 2" fill="none" strokeWidth="1.15" />
        <circle cx="86" cy="-4.2" r="1.75" stroke="none" />
      </g>
    </g>

    {/* Iconic Front Carved Torana Gateway (Triple Volute-Scrolled Architraves + Dharmachakra) */}
    <g>
      {/* Paper-Cleared Gateway Opening */}
      <rect x="76" y="72" width="20" height="26" fill={surfaceHex} opacity="0.82" />
      {/* Twin Carved Upright Stone Pillars */}
      <rect x="71" y="62" width="5" height="36" fill="#1B2D6B" opacity="0.40" stroke="#1B2D6B" strokeWidth="0.95" />
      <rect x="96" y="62" width="5" height="36" fill="#1B2D6B" opacity="0.40" stroke="#1B2D6B" strokeWidth="0.95" />
      {/* Three Gracefully Curved Architraves with Rolled Volute Ends */}
      <g fill="none" stroke="#1B2D6B" strokeWidth="1.55" opacity="0.62">
        <path d="M 63 72 Q 86 67.5 109 72" />
        <path d="M 64.5 65.5 Q 86 61.2 107.5 65.5" />
        <path d="M 66.5 59 Q 86 54.8 105.5 59" />
      </g>
      {/* Delicate Gold Highlight on Architrave Ridges & Rolled Volute Tips */}
      <g fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.85" opacity="0.88">
        <path d="M 66.5 58.6 Q 86 54.4 105.5 58.6" />
        <circle cx="62.5" cy="72" r="1.4" />
        <circle cx="109.5" cy="72" r="1.4" />
        <circle cx="64" cy="65.5" r="1.3" />
        <circle cx="108" cy="65.5" r="1.3" />
        <circle cx="66" cy="59" r="1.2" />
        <circle cx="106" cy="59" r="1.2" />
      </g>
      {/* Miniature Golden Dharmachakra Wheel Crowning the Torana Gateway */}
      <g>
        <circle cx="86" cy="51.2" r="4.1" fill={surfaceHex} fillOpacity="0.82" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.1" />
        <g stroke="#1B2D6B" strokeWidth="0.55" opacity="0.68">
          <line x1="86" y1="47.4" x2="86" y2="55" />
          <line x1="82.2" y1="51.2" x2="89.8" y2="51.2" />
          <line x1="83.3" y1="48.5" x2="88.7" y2="53.9" />
          <line x1="88.7" y1="48.5" x2="83.3" y2="53.9" />
        </g>
        <circle cx="86" cy="51.2" r="1.0" fill="#FFD966" />
      </g>
      {/* Stepped Stone Entry Stairs */}
      <path d="M 74 98 L 98 98 M 71 101 L 101 101" stroke="#1B2D6B" strokeWidth="0.9" opacity="0.46" />
    </g>

    {/* Warm Glowing Entrance Diyas Flanking the Torana Threshold */}
    <g className="akath-diya-glint">
      <circle cx="67.5" cy="94" r="3.1" fill="#FFD966" opacity="0.48" />
      <circle cx="67.5" cy="94" r="1.2" fill="#FFFDF6" opacity="0.96" />
      <circle cx="104.5" cy="94" r="3.1" fill="#FFD966" opacity="0.48" />
      <circle cx="104.5" cy="94" r="1.2" fill="#FFFDF6" opacity="0.96" />
    </g>
  </g>
);

/**
 * 2C. Hand-Engraved Ajanta / Ellora Rock-Cut Buddhist Chaitya Cave Hall (Marathwada Heritage)
 * Sculpted Deccan basalt cliff facade featuring the iconic horseshoe Gavaksha (Chaitya) arch,
 * radiating vaulted ribs, warm lantern-lit sanctum revealing an inner votive stupa, and
 * flanking pillared Vihara niches carved directly into the hillside stone.
 */
const AjantaChaityaCaveHall: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Carved Basalt Cliff Face Mass */}
    <path
      d="M 4 82 L 8 28 C 12 16, 30 9, 72 9 C 114 9, 132 16, 136 28 L 140 82 Z"
      fill="#1B2D6B"
      opacity="0.24"
    />
    {/* Cliff Facade Archival Contour & Horizontal Basalt Strata */}
    <g fill="none" stroke="#1B2D6B" opacity="0.48">
      <path d="M 4 82 L 8 28 C 12 16, 30 9, 72 9 C 114 9, 132 16, 136 28 L 140 82" strokeWidth="1.25" />
      <path d="M 10 34 L 44 34 M 100 34 L 134 34" strokeWidth="0.82" opacity="0.62" />
      <path d="M 8 44 L 38 44 M 106 44 L 136 44" strokeWidth="0.78" opacity="0.54" />
      <path d="M 2 82 L 142 82" strokeWidth="1.2" />
    </g>

    {/* Sunlit Golden Rim Catching the Rock-Cut Cliff Brow */}
    <path
      d="M 14 22 C 26 12, 48 9, 72 9 C 94 9, 114 12, 126 19"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.3"
      opacity="0.84"
    />

    {/* Flanking Rock-Cut Vihara Pillared Meditation Niches */}
    <g>
      <path d="M 16 78 L 16 52 Q 25 45 34 52 L 34 78 Z" fill={surfaceHex} opacity="0.70" stroke="#1B2D6B" strokeWidth="0.95" />
      <line x1="22" y1="53" x2="22" y2="78" stroke="#1B2D6B" strokeWidth="0.85" opacity="0.54" />
      <line x1="28" y1="53" x2="28" y2="78" stroke="#1B2D6B" strokeWidth="0.85" opacity="0.54" />
      {/* Mini Kudu Horseshoe Arch Motif Above Left Niche */}
      <path d="M 19 42 C 19 36, 25 33, 25 33 C 25 33, 31 36, 31 42" fill="none" stroke="#1B2D6B" strokeWidth="0.85" opacity="0.56" />

      <path d="M 110 78 L 110 52 Q 119 45 128 52 L 128 78 Z" fill={surfaceHex} opacity="0.70" stroke="#1B2D6B" strokeWidth="0.95" />
      <line x1="116" y1="53" x2="116" y2="78" stroke="#1B2D6B" strokeWidth="0.85" opacity="0.54" />
      <line x1="122" y1="53" x2="122" y2="78" stroke="#1B2D6B" strokeWidth="0.85" opacity="0.54" />
      {/* Mini Kudu Horseshoe Arch Motif Above Right Niche */}
      <path d="M 113 42 C 113 36, 119 33, 119 33 C 119 33, 125 36, 125 42" fill="none" stroke="#1B2D6B" strokeWidth="0.85" opacity="0.56" />
    </g>

    {/* Iconic Horseshoe Chaitya Gavaksha Window & Sanctum Portal */}
    <g>
      {/* Recessed Warm Paper-Lit Archway Interior */}
      <path
        d="M 46 80 L 46 56 C 42 38, 52 21, 72 16 C 92 21, 102 38, 98 56 L 98 80 Z"
        fill={surfaceHex}
        opacity="0.84"
      />
      {/* Warm Candlelit Inner Sanctum Wash */}
      <ellipse cx="72" cy="64" rx="22" ry="18" fill="#FFD966" opacity="0.26" />

      {/* Outer Carved Ogee Horseshoe Chaitya Molding + Finial */}
      <path
        d="M 42 58 C 37 36, 50 17, 72 11 C 94 17, 107 36, 102 58"
        fill="none"
        stroke="#1B2D6B"
        strokeWidth="1.65"
        opacity="0.62"
      />
      <path
        d="M 46 56 C 42 38, 52 21, 72 16 C 92 21, 102 38, 98 56"
        fill="none"
        stroke={`url(#goldFoil-${uid})`}
        strokeWidth="1.25"
        opacity="0.90"
      />
      {/* Radiating Carved Stone Vault Ribs Inside the Chaitya Window */}
      <g stroke="#1B2D6B" strokeWidth="0.72" opacity="0.46">
        <line x1="72" y1="45" x2="72" y2="17" />
        <line x1="72" y1="45" x2="57" y2="23" />
        <line x1="72" y1="45" x2="87" y2="23" />
        <line x1="72" y1="45" x2="48" y2="35" />
        <line x1="72" y1="45" x2="96" y2="35" />
        <path d="M 46 47 Q 72 42 98 47" fill="none" strokeWidth="1.05" />
      </g>

      {/* Portal Pillars Framing the Inner Chaitya Hall */}
      <rect x="46" y="47" width="4.5" height="33" fill="#1B2D6B" opacity="0.34" stroke="#1B2D6B" strokeWidth="0.85" />
      <rect x="93.5" y="47" width="4.5" height="33" fill="#1B2D6B" opacity="0.34" stroke="#1B2D6B" strokeWidth="0.85" />

      {/* Inner Votive Stupa Silhouetted Inside the Glowing Cave Hall */}
      <path
        d="M 60 80 L 60 69 C 60 58, 65.5 53, 72 53 C 78.5 53, 84 58, 84 69 L 84 80 Z"
        fill="#1B2D6B"
        opacity="0.42"
        stroke="#1B2D6B"
        strokeWidth="0.95"
      />
      <rect x="68.5" y="49.5" width="7" height="3.5" fill="#1B2D6B" opacity="0.50" />
      <line x1="72" y1="49.5" x2="72" y2="45.5" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.1" />

      {/* Subtle Warm Sanctuary Lamp Glow at Stupa Base */}
      <g className="akath-diya-glint">
        <circle cx="72" cy="75.5" r="3.6" fill="#FFD966" opacity="0.54" />
        <circle cx="72" cy="75.5" r="1.4" fill="#FFFDF6" opacity="0.98" />
      </g>
    </g>
  </g>
);

/**
 * 2D. Soft Painterly Twilight Sky Cloud Ribbons (Flank-Framed — Never Obscures Typography)
 * Lightweight layered cotton-parchment cirrus bands with delicate gold-leaf dusk undersides.
 */
const TwilightCloudRibbons: React.FC<{
  tier: ViewportTier;
  uid: string;
}> = ({ tier, uid }) => {
  if (tier === 'mobile') {
    return (
      <g fill="none" strokeLinecap="round" opacity="0.62">
        <g className="akath-cloud-drift-a">
          <path
            d="M 16 146 Q 42 134 68 142 Q 92 136 116 146 Q 82 152 16 146 Z"
            fill="#FFFDF6"
            fillOpacity="0.68"
          />
          <path d="M 24 147 Q 68 149 112 146" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.9" opacity="0.65" />
        </g>
        <g className="akath-cloud-drift-b">
          <path
            d="M 294 128 Q 324 116 352 124 Q 378 118 404 128 Q 362 135 294 128 Z"
            fill="#FFFDF6"
            fillOpacity="0.64"
          />
          <path d="M 302 129 Q 350 132 398 128" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.9" opacity="0.62" />
        </g>
      </g>
    );
  }

  if (tier === 'tablet') {
    return (
      <g fill="none" strokeLinecap="round" opacity="0.68">
        <g className="akath-cloud-drift-a">
          <path
            d="M 64 188 Q 112 168 164 182 Q 204 172 246 188 Q 180 198 64 188 Z"
            fill="#FFFDF6"
            fillOpacity="0.72"
          />
          <path d="M 78 190 Q 158 194 238 188" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.0" opacity="0.68" />
        </g>
        <g className="akath-cloud-drift-b">
          <path
            d="M 812 168 Q 862 148 914 162 Q 960 152 1006 168 Q 934 178 812 168 Z"
            fill="#FFFDF6"
            fillOpacity="0.68"
          />
          <path d="M 824 170 Q 912 174 996 168" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.0" opacity="0.66" />
        </g>
      </g>
    );
  }

  return (
    <g fill="none" strokeLinecap="round" opacity="0.72">
      <g className="akath-cloud-drift-a">
        <path
          d="M 84 194 Q 146 168 214 186 Q 268 172 326 194 Q 232 206 84 194 Z"
          fill="#FFFDF6"
          fillOpacity="0.74"
        />
        <path d="M 102 196 Q 208 202 316 194" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.05" opacity="0.70" />
        <path
          d="M 380 236 Q 424 222 470 232 Q 506 226 540 236 Q 474 244 380 236 Z"
          fill="#FFFDF6"
          fillOpacity="0.56"
        />
      </g>
      <g className="akath-cloud-drift-b">
        <path
          d="M 1168 172 Q 1236 146 1308 164 Q 1364 152 1424 172 Q 1326 184 1168 172 Z"
          fill="#FFFDF6"
          fillOpacity="0.72"
        />
        <path d="M 1184 174 Q 1302 180 1412 172" stroke={`url(#goldFoil-${uid})`} strokeWidth="1.05" opacity="0.68" />
        <path
          d="M 1036 224 Q 1084 210 1134 220 Q 1170 214 1206 224 Q 1136 232 1036 224 Z"
          fill="#FFFDF6"
          fillOpacity="0.54"
        />
      </g>
    </g>
  );
};

/**
 * 2E. Serene Wooden Godavari Dusk Skiff (Hodi) With Bow Lantern & Golden Reflection
 */
const GodavariEveningSkiff: React.FC<{
  transform: string;
  uid: string;
}> = ({ transform, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    <g className="akath-skiff-bob">
      {/* Gentle Water Ripple Under Keel */}
      <ellipse cx="28" cy="18.5" rx="28" ry="2.6" fill="#243B8A" opacity="0.18" />
      <line x1="6" y1="21" x2="50" y2="21" stroke={`url(#goldBeam-${uid})`} strokeWidth="1.0" opacity="0.68" />
      {/* Curved Timber Hodi Hull */}
      <path
        d="M 2 11 C 12 18.5, 44 18.5, 56 10 C 48 13.5, 10 13.5, 2 11 Z"
        fill="#1B2D6B"
        fillOpacity="0.64"
        stroke="#152254"
        strokeWidth="1.0"
      />
      <path d="M 8 12.2 Q 29 14.2 50 11.6" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.85" opacity="0.85" />
      {/* Seated Boatman Silhouette & Resting Oar */}
      <path d="M 30 12.5 C 30.5 7, 35 6.5, 36.5 12.5 Z" fill="#1B2D6B" opacity="0.62" />
      <circle cx="33.2" cy="4.8" r="2.0" fill="#1B2D6B" opacity="0.66" />
      <line x1="28" y1="9.5" x2="17" y2="17.5" stroke="#1B2D6B" strokeWidth="0.95" opacity="0.64" />
      {/* Small Warm Brass Bow Lantern & Shimmering Reflection */}
      <line x1="7.5" y1="11.5" x2="7.5" y2="6.5" stroke="#1B2D6B" strokeWidth="0.85" opacity="0.62" />
      <g className="akath-diya-glint">
        <circle cx="7.5" cy="5.8" r="3.4" fill="#FFD966" opacity="0.48" />
        <circle cx="7.5" cy="5.8" r="1.25" fill="#FFFDF6" opacity="0.98" />
      </g>
      <line x1="4.5" y1="23.5" x2="11.5" y2="23.5" stroke="#FFD966" strokeWidth="1.15" opacity="0.64" />
    </g>
  </g>
);

/**
 * 3. Hemadpanthi Stepped Stone Shikhara (About Exclusive — Marathwada Heritage)
 * Authentic Deccan star-plan stone temple spire with bhumi horizontal tiers,
 * vertical ratha ribs, gleaming gold-leaf amalaka finial, and lit sanctum lamp.
 */
const HemadpanthiStoneShikhara: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Tinted Archival Wash */}
    <g fill="#1B2D6B" opacity="0.27">
      <path d="M 38 92 L 42 54 C 46 34, 54 18, 66 10 C 78 18, 86 34, 90 54 L 94 92 Z" />
      <path d="M 94 92 L 94 58 L 106 48 L 118 44 L 130 48 L 142 58 L 142 92 Z" />
      <rect x="28" y="90" width="124" height="8" rx="0.8" />
    </g>

    {/* Paper-Highlight Sanctum Entrance */}
    <path d="M 110 90 L 110 70 Q 118 63 126 70 L 126 90 Z" fill={surfaceHex} opacity="0.80" />

    {/* Crisp Hand-Engraved Hemadpanthi Masonry & Bhumi Tier Lines */}
    <g fill="none" stroke="#1B2D6B" opacity="0.50">
      <path d="M 38 92 L 42 54 C 46 34, 54 18, 66 10 C 78 18, 86 34, 90 54 L 94 92" strokeWidth="1.3" />
      <path d="M 94 58 L 106 48 L 118 44 L 130 48 L 142 58 L 142 92" strokeWidth="1.2" />
      <path d="M 24 98 L 156 98 M 28 90 L 152 90" strokeWidth="1.25" />

      {/* Horizontal Hemadpanthi Bhumi Stone Moulding Courses */}
      <path
        d="M 55 24 L 77 24
           M 50 34 L 82 34
           M 46 44 L 86 44
           M 43 54 L 89 54
           M 41 64 L 91 64
           M 40 74 L 92 74
           M 39 82 L 93 82"
        strokeWidth="0.85"
      />
      {/* Vertical Ratha Offset Ribs */}
      <path
        d="M 56 90 L 59 24 M 66 90 L 66 14 M 76 90 L 73 24"
        strokeWidth="0.75"
        opacity="0.78"
      />
      {/* Mandapa Stepped Pyramid Roof Courses */}
      <path
        d="M 101 53 L 135 53 M 96 60 L 140 60 M 110 90 L 110 70 Q 118 63 126 70 L 126 90"
        strokeWidth="0.95"
      />
    </g>

    {/* Gilded Sun-Rim Edge Along Shikhara Curve & Mandapa Eave */}
    <path
      d="M 39 88 L 43 54 C 47 34, 55 18, 66 11"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.35"
      opacity="0.82"
    />

    {/* Gleaming Gold-Foil Amalaka Ring & Kalasha Finial */}
    <g
      stroke={`url(#goldFoil-${uid})`}
      fill={`url(#goldFoil-${uid})`}
     
      opacity="0.96"
    >
      <ellipse cx="66" cy="9" rx="6.8" ry="2.5" fill="none" strokeWidth="1.35" />
      <line x1="66" y1="7" x2="66" y2="-2.5" strokeWidth="1.45" />
      <circle cx="66" cy="1.2" r="1.8" stroke="none" />
      <line x1="118" y1="44" x2="118" y2="35.5" strokeWidth="1.25" />
      <circle cx="118" cy="36.5" r="1.2" stroke="none" />
    </g>

    {/* Warm Glowing Sanctum Lamp Inside Doorway */}
    <g className="akath-diya-glint">
      <circle cx="118" cy="83" r="3.6" fill="#FFD966" opacity="0.50" />
      <circle cx="118" cy="83" r="1.9" fill="#EF6855" opacity="0.82" />
      <circle cx="118" cy="82.6" r="0.95" fill="#FFFDF4" opacity="0.98" />
    </g>
  </g>
);

/**
 * 4. Monumental Sahyadri Maratha Hill-Fort Citadel (About Exclusive — Right Crest)
 * Twin circular stone buruj bastions, arched mahadarwaza gate, and crenellated
 * rampart gilded by twilight sun (clean flag-free heritage stonework).
 */
const SahyadriCitadelFort: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Indigo Stone Wash */}
    <path
      d="M 0 38 L 0 18 L 8 18 L 8 14 L 16 14 L 16 18 L 28 18 L 28 9 L 36 9 L 36 13 L 44 13 L 44 9 L 52 9 L 52 13 L 60 13 L 60 9 L 68 9 L 68 18 L 88 18 L 88 13 L 96 13 L 96 18 L 106 18 L 106 13 L 114 13 L 114 18 L 124 18 L 124 11 L 132 11 L 132 15 L 140 15 L 140 11 L 148 11 L 148 15 L 156 15 L 156 20 L 168 20 L 168 38 Z"
      fill="#1B2D6B"
      opacity="0.28"
    />
    {/* Mahadarwaza Arched Fort Gateway */}
    <path d="M 88 38 L 88 26 Q 97 19 106 26 L 106 38 Z" fill={surfaceHex} opacity="0.80" />

    {/* Crisp Engraved Citadel Outlines & Stone Masonry */}
    <g fill="none" stroke="#1B2D6B" opacity="0.50">
      <path
        d="M 0 38 L 0 18 L 8 18 L 8 14 L 16 14 L 16 18 L 28 18 L 28 9 L 36 9 L 36 13 L 44 13 L 44 9 L 52 9 L 52 13 L 60 13 L 60 9 L 68 9 L 68 18 L 88 18 L 88 13 L 96 13 L 96 18 L 106 18 L 106 13 L 114 13 L 114 18 L 124 18 L 124 11 L 132 11 L 132 15 L 140 15 L 140 11 L 148 11 L 148 15 L 156 15 L 156 20 L 168 20 L 168 38"
        strokeWidth="1.25"
      />
      <path d="M 88 38 L 88 26 Q 97 19 106 26 L 106 38" strokeWidth="1.1" />
      <path
        d="M 2 25 L 166 25 M 2 32 L 86 32 M 108 32 L 166 32"
        strokeWidth="0.75"
        opacity="0.74"
      />
      <path
        d="M 48 14 L 48 37 M 58 14 L 58 37 M 63 14 L 63 37 M 142 16 L 142 37 M 150 16 L 150 37"
        strokeWidth="0.7"
        opacity="0.76"
      />
    </g>
    {/* Gilded Dusk Sun-Rim Along Bastion Merlons */}
    <path
      d="M 8 14 L 16 14 M 28 9 L 36 9 M 44 9 L 52 9 M 60 9 L 68 9 M 124 11 L 132 11 M 140 11 L 148 11"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.25"
      opacity="0.88"
    />
    {/* Warm Gateway Torch Glint */}
    <circle
      cx="97"
      cy="33"
      r="2.1"
      fill="#FFD966"
      className="akath-diya-glint"
     
      opacity="0.84"
    />
  </g>
);

/**
 * 5. Intimate Engraved Godavari Stone Ghat Mandapa & Moored Skiff (For Authors Exclusive)
 * Open pillared riverside pavilion, gilded chhatri dome, radiant hanging brass
 * dusk lantern, weathered stone ghat stairs, and wooden hodi skiff over shimmering gold.
 */
const EngravedGhatMandapa: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Ink-and-Wash Fill */}
    <g fill="#1B2D6B" opacity="0.26">
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
    <g fill="none" stroke="#1B2D6B" opacity="0.50">
      <path d="M 52 52 C 52 28, 72 16, 94 16 C 116 16, 136 28, 136 52" strokeWidth="1.35" />
      <path
        d="M 74 52 C 74 34, 83 22, 94 17 M 94 52 L 94 17 M 114 52 C 114 34, 105 22, 94 17"
        strokeWidth="0.78"
        opacity="0.76"
      />
      <path d="M 118 28 L 128 31 M 122 36 L 133 38 M 124 44 L 135 46" strokeWidth="0.72" opacity="0.72" />
      <path d="M 28 52 L 160 52 L 154 59 L 34 59 Z" strokeWidth="1.2" />

      <path
        d="M 38 59 L 38 124 M 47 59 L 47 124
           M 74 59 L 74 124 M 82 59 L 82 124
           M 106 59 L 106 124 M 114 59 L 114 124
           M 141 59 L 141 124 M 150 59 L 150 124"
        strokeWidth="1.1"
      />
      <path
        d="M 47 75 Q 60.5 64 74 75 M 82 74 Q 94 63 106 74 M 114 75 Q 127.5 64 141 75"
        strokeWidth="1.05"
      />

      <path
        d="M 16 124 L 180 124 M 6 133 L 198 133 M -4 142 L 214 142 M -14 151 L 228 151 M -16 160 L 232 160"
        strokeWidth="1.2"
      />
      <path
        d="M 48 124 L 48 132 M 96 124 L 96 132 M 142 124 L 142 132
           M 34 133 L 34 141 M 80 133 L 80 141 M 128 133 L 128 141 M 170 133 L 170 141
           M 22 142 L 22 150 M 68 142 L 68 150 M 116 142 L 116 150 M 162 142 L 162 150"
        strokeWidth="0.7"
        opacity="0.70"
      />
    </g>

    {/* Gilded Chhatri Crown Highlight & Warm Lit Step Edges */}
    <path
      d="M 53 50 C 53 28, 72 17, 94 17"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.45"
      opacity="0.86"
    />
    <g stroke="#FFF8DC" strokeWidth="0.95" opacity="0.72">
      <line x1="18" y1="125" x2="178" y2="125" />
      <line x1="8" y1="134" x2="196" y2="134" />
      <line x1="-2" y1="143" x2="212" y2="143" />
    </g>

    {/* Gleaming Gold-Foil Finial & Radiant Hanging Brass Dusk Lantern */}
    <g
      stroke={`url(#goldFoil-${uid})`}
      fill={`url(#goldFoil-${uid})`}
     
      opacity="0.96"
    >
      <line x1="94" y1="16" x2="94" y2="2" strokeWidth="1.6" />
      <circle cx="94" cy="5.5" r="2.4" stroke="none" />
      <line x1="94" y1="64" x2="94" y2="80" strokeWidth="1.05" />
    </g>
    <g className="akath-diya-glint">
      <circle cx="94" cy="83" r="6.5" fill="#FFD966" opacity="0.46" />
      <circle cx="94" cy="83" r="3.4" fill="#EF6855" opacity="0.82" />
      <circle cx="94" cy="82.6" r="1.5" fill="#FFFDF6" opacity="1" />
    </g>

    {/* Quiet Moored Wooden River Skiff (Hodi) Resting Beside the Lower Steps */}
    <g transform="translate(212, 146)">
      <line x1="-8" y1="1" x2="-8" y2="17" stroke="#1B2D6B" strokeWidth="2.3" opacity="0.50" />
      <path d="M -7 5 Q 4 13 15 11" fill="none" stroke="#1B2D6B" strokeWidth="1.0" opacity="0.46" />
      <path d="M 6 10 C 16 19, 64 20, 86 9 C 74 13, 24 13, 6 10 Z" fill="#1B2D6B" opacity="0.30" />
      <path d="M 6 10 C 16 19, 64 20, 86 9 C 74 13, 24 13, 6 10 Z" fill="none" stroke="#1B2D6B" strokeWidth="1.25" opacity="0.52" />
      <path d="M 16 14 Q 46 16 74 13" fill="none" stroke={`url(#goldFoil-${uid})`} strokeWidth="0.85" opacity="0.78" />
      <line x1="28" y1="11.5" x2="64" y2="5.5" stroke="#1B2D6B" strokeWidth="1.2" opacity="0.50" />
      <path
        d="M 12 20 Q 46 23.5 80 20"
        fill="none"
        stroke={`url(#goldBeam-${uid})`}
        strokeWidth="1.7"
        opacity="0.90"
      />
    </g>
  </g>
);

/**
 * 6. Traditional Maharashtra Stone Deepstambh (For Authors Right Bank)
 */
const StoneDeepstambh: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    <path d="M 10 74 L 15 16 L 23 16 L 28 74 Z" fill="#1B2D6B" opacity="0.27" />
    <rect x="6" y="72" width="26" height="6" rx="0.8" fill="#1B2D6B" opacity="0.30" />
    <path d="M 13 16 L 19 6 L 25 16 Z" fill="#1B2D6B" opacity="0.30" />
    <g fill="none" stroke="#1B2D6B" opacity="0.50">
      <path d="M 10 74 L 15 16 L 19 6 L 23 16 L 28 74 M 6 72 L 32 72 L 32 78 L 6 78 Z" strokeWidth="1.2" />
      <path
        d="M 8 28 L 30 28 M 7 39 L 31 39 M 6 50 L 32 50 M 5 61 L 33 61"
        strokeWidth="1.2"
      />
      <line x1="19" y1="16" x2="19" y2="72" strokeWidth="0.7" opacity="0.70" />
    </g>
    <line x1="16" y1="18" x2="13" y2="70" stroke={surfaceHex} strokeWidth="0.85" opacity="0.62" />
    {/* Glowing Crown & Lamp-Bracket Diya Glints */}
    <g className="akath-diya-glint">
      <circle cx="19" cy="4" r="4.6" fill="#FFD966" opacity="0.52" />
      <circle cx="19" cy="4" r="2.4" fill="#EF6855" opacity="0.85" />
      <circle cx="19" cy="3.6" r="1.1" fill="#FFFDF6" opacity="1" />
      <circle cx="8" cy="27" r="1.3" fill="#FFD966" opacity="0.88" />
      <circle cx="30" cy="27" r="1.3" fill="#FFD966" opacity="0.88" />
      <circle cx="7" cy="38" r="1.3" fill="#FFD966" opacity="0.84" />
      <circle cx="31" cy="38" r="1.3" fill="#FFD966" opacity="0.84" />
    </g>
  </g>
);

/**
 * 7. Hand-Engraved Mature Banyan Tree (Sky Breathing Through Branches + Golden Rim)
 */
const EngravedBanyanTree: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    {/* Airy Broken Watercolor Canopy Clusters */}
    <g fill="#174D3A" opacity="0.22">
      <ellipse cx="44" cy="54" rx="30" ry="18" />
      <ellipse cx="76" cy="34" rx="34" ry="20" />
      <ellipse cx="118" cy="30" rx="36" ry="21" />
      <ellipse cx="152" cy="52" rx="30" ry="18" />
      <ellipse cx="96" cy="48" rx="28" ry="15" />
    </g>

    {/* Negative-Space Sky Windows Breathing Inside the Canopy */}
    <g fill={surfaceHex} opacity="0.62">
      <ellipse cx="66" cy="52" rx="9" ry="5" />
      <ellipse cx="126" cy="50" rx="10" ry="5.5" />
      <ellipse cx="98" cy="36" rx="7" ry="4" />
    </g>

    {/* Gnarled Fluted Banyan Trunk, Buttress Roots & Spreading Skeletal Boughs */}
    <path
      d="M 88 70 C 90 90, 84 112, 70 126 L 82 126 C 89 116, 95 109, 99 113 C 103 117, 108 123, 115 126 L 128 126 C 114 112, 108 90, 110 70 Z"
      fill="#174D3A"
      opacity="0.30"
    />
    <g fill="none" stroke="#174D3A" opacity="0.50">
      <path d="M 88 70 C 90 90, 84 112, 70 126 M 110 70 C 108 90, 114 112, 128 126" strokeWidth="1.5" />
      <path d="M 94 74 C 95 92, 92 106, 86 118 M 103 74 C 102 92, 106 106, 112 118" strokeWidth="0.8" opacity="0.80" />

      <path d="M 94 73 C 78 62, 58 58, 34 58" strokeWidth="2.3" />
      <path d="M 68 61 C 62 50, 58 42, 48 36" strokeWidth="1.25" />
      <path d="M 96 68 C 92 52, 86 42, 74 30" strokeWidth="1.7" />
      <path d="M 103 70 C 110 54, 118 44, 128 32" strokeWidth="1.8" />
      <path d="M 106 73 C 124 62, 144 58, 166 56" strokeWidth="2.2" />
      <path d="M 134 62 C 142 52, 148 44, 158 40" strokeWidth="1.2" />
    </g>

    {/* Scalloped Botanical Pen-and-Ink Foliage Crown Contours */}
    <g fill="none" stroke="#174D3A" opacity="0.48">
      <path
        d="M 14 58 C 12 46, 22 38, 34 38 C 36 24, 52 14, 70 16 C 82 6, 108 6, 122 14 C 140 12, 156 22, 158 36 C 174 36, 184 48, 180 60 C 174 70, 158 72, 146 68"
        strokeWidth="1.2"
      />
      <path
        d="M 24 48 Q 36 42 48 48 M 52 30 Q 68 22 84 28 M 96 22 Q 116 16 134 24 M 138 40 Q 154 36 168 46"
        strokeWidth="0.9"
      />
      <path
        d="M 22 64 Q 36 68 50 64 M 140 64 Q 156 68 170 64 M 72 44 Q 84 40 94 44"
        strokeWidth="0.8"
        opacity="0.82"
      />
    </g>

    {/* Golden-Hour Sun-Rim Catching Upper Crown */}
    <path
      d="M 38 28 C 44 18, 56 14, 70 16 C 82 6, 108 6, 122 14 C 136 13, 150 20, 155 30"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.15"
      opacity="0.68"
    />

    {/* Organic Irregular Hanging Aerial Roots (Jata) */}
    <g fill="none" stroke="#174D3A" opacity="0.46">
      <path d="M 42 62 C 40 78, 44 96, 41 118" strokeWidth="1.1" />
      <path d="M 48 63 C 49 74, 47 86, 48 98" strokeWidth="0.75" />
      <path d="M 62 63 C 61 80, 64 98, 61 122" strokeWidth="1.2" />
      <path d="M 66 96 C 69 104, 70 112, 68 121" strokeWidth="0.75" />
      <path d="M 134 63 C 136 82, 132 102, 135 123" strokeWidth="1.2" />
      <path d="M 145 62 C 144 76, 147 88, 145 104" strokeWidth="0.8" />
      <path d="M 158 61 C 160 74, 157 90, 159 112" strokeWidth="1.0" />
    </g>
  </g>
);

/**
 * 8. Airy Hand-Engraved Marathwada Neem Tree (With Golden Crown Rim)
 */
const EngravedNeemTree: React.FC<{
  transform: string;
  surfaceHex: string;
  uid: string;
}> = ({ transform, surfaceHex, uid }) => (
  <g transform={transform} strokeLinecap="round" strokeLinejoin="round">
    <g fill="#174D3A" opacity="0.21">
      <ellipse cx="40" cy="40" rx="22" ry="15" />
      <ellipse cx="70" cy="24" rx="26" ry="16" />
      <ellipse cx="102" cy="38" rx="24" ry="15" />
      <ellipse cx="68" cy="46" rx="22" ry="12" />
    </g>
    <ellipse cx="58" cy="42" rx="7" ry="4" fill={surfaceHex} opacity="0.58" />
    <ellipse cx="86" cy="40" rx="6.5" ry="3.8" fill={surfaceHex} opacity="0.58" />

    <path
      d="M 66 56 C 68 74, 63 94, 56 108 L 66 108 C 71 94, 75 76, 74 56 Z"
      fill="#174D3A"
      opacity="0.28"
    />
    <g fill="none" stroke="#174D3A" opacity="0.48">
      <path d="M 66 56 C 68 74, 63 94, 56 108 M 74 56 C 75 76, 71 94, 66 108" strokeWidth="1.3" />
      <path d="M 68 60 Q 52 46 36 42 M 71 58 Q 70 40 68 24 M 73 59 Q 88 46 106 42" strokeWidth="1.55" />
      <path
        d="M 18 46 C 16 32, 28 22, 42 22 C 48 10, 70 6, 86 14 C 102 10, 120 20, 124 36 C 130 44, 124 54, 110 54"
        strokeWidth="1.05"
      />
      <path
        d="M 28 36 Q 38 30 48 35 M 56 20 Q 70 15 84 22 M 90 32 Q 104 28 116 36 M 38 48 Q 50 44 60 48 M 82 48 Q 94 44 106 48"
        strokeWidth="0.82"
      />
    </g>
    {/* Delicate Sunlit Foliage Rim */}
    <path
      d="M 44 19 C 51 10, 70 6, 86 14 C 98 11, 112 17, 119 27"
      fill="none"
      stroke={`url(#goldFoil-${uid})`}
      strokeWidth="1.05"
      opacity="0.64"
    />
  </g>
);

/**
 * 9. Delicate Swaying Godavari River Reeds & Gilded Plumes
 */
const GodavariReeds: React.FC<{ transform: string }> = ({ transform }) => (
  <g transform={transform} fill="none" stroke="#174D3A" strokeLinecap="round" opacity="0.50">
    <path d="M 6 48 Q 2 28 -4 10" strokeWidth="1.15" />
    <path d="M 14 48 Q 14 26 11 4" strokeWidth="1.3" />
    <ellipse cx="10.5" cy="9" rx="1.7" ry="4.5" fill="#174D3A" stroke="none" opacity="0.88" />
    <ellipse cx="10.1" cy="8.2" rx="0.6" ry="2.2" fill="#FFD966" stroke="none" opacity="0.72" />
    <path d="M 22 48 Q 26 28 31 12" strokeWidth="1.05" />
    <path d="M 30 48 Q 36 32 42 18" strokeWidth="1.0" />
    <path d="M 38 48 Q 40 30 39 8" strokeWidth="1.2" />
    <ellipse cx="39" cy="13" rx="1.6" ry="4.2" fill="#174D3A" stroke="none" opacity="0.88" />
    <ellipse cx="38.6" cy="12.2" rx="0.55" ry="2.0" fill="#FFD966" stroke="none" opacity="0.72" />
    <path d="M 46 48 Q 52 34 58 22" strokeWidth="0.95" />
  </g>
);

/* ============================================================================
   1. HERO — CHAPTER I: TWILIGHT PANORAMA (ILLUMINATED INK-AND-WASH PLATE)
   Wide Deccan vista uniting contour-hatched Sahyadri basalt mesas gilded with
   dusk sunlight, curling valley mist, distant hill-fort watchtower, stepped
   Godavari riverfront ghats with animated water ripples, and a hand-drawn
   heritage Banyan tree with a literary discussion gathering beneath its boughs.
   ============================================================================ */
export const HeroPublicationWatermark: React.FC = React.memo(() => {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tier = useLandscapeViewportTier();
  const isOffscreen = useSubtleLandscapeMotion(containerRef, 'hero');

  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';

  const viewBox = isMobile
    ? '0 0 430 680'
    : isTablet
    ? '0 0 1120 620'
    : '0 0 1600 620';

  const surfaceHex = '#FAF8F0';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="hero-dusk-landscape-svg"
      style={{ contain: 'layout style paint' }}
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none bg-[#FAF8F0] ${
        isOffscreen ? 'akath-landscape-offscreen' : ''
      }`}
    >
      {/* Radiant Golden-Hour Horizon Atmospheric Wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 88% 58% at 50% 18%, rgba(255, 217, 102, 0.28) 0%, rgba(239, 104, 85, 0.11) 42%, rgba(250, 248, 240, 0) 78%)',
        }}
      />

      {/* Responsive Framing Container — Fills Full Hero Stage Across Mobile, Tablet & Desktop */}
      <div className="relative w-full h-full max-w-[1680px] mx-auto overflow-hidden">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          className="akath-landscape-svg-luminous w-full h-full opacity-[0.95] sm:opacity-[0.98] lg:opacity-100"
        >
          <InkWashDefs uid={uid} surfaceHex={surfaceHex} sunCy="60%" />

          {/* Radiant Dusk Solar Corona & Soft Drifting Twilight Clouds */}
          <g className="akath-hero-parallax-sky" data-parallax-layer="sky">
            <ellipse
              cx={isMobile ? 215 : isTablet ? 560 : 800}
              cy={isMobile ? 430 : 364}
              rx={isMobile ? 255 : isTablet ? 520 : 680}
              ry={isMobile ? 215 : 265}
              fill={`url(#duskSun-${uid})`}
            />
            <TwilightCloudRibbons tier={tier} uid={uid} />
          </g>

          {/* LAYER 1 — Sky Meridian Arcs, Gleaming Crescent Moon & Stepped Sahyadri Basalt Mesas */}
          <g
            className="akath-hero-parallax-mountains"
            data-parallax-layer="mountains"
            strokeLinecap="round"
          >
            {isMobile ? (
              <>
                <path
                  d="M 16 392 Q 215 216 414 392"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.05"
                  strokeDasharray="3.5 7.5"
                  opacity="0.48"
                />
                {/* Crescent Moon Positioned Safely Inside 360px–430px Mobile Corridor */}
                <g transform="translate(332, 84) scale(0.80)">
                  <path
                    d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                    fill={`url(#goldFoil-${uid})`}
                   
                    opacity="0.95"
                  />
                  <DiamondSparkle cx={-16} cy={18} r={6.2} uid={uid} className="akath-star-twinkle-a" />
                  <DiamondSparkle cx={48} cy={10} r={4.4} uid={uid} className="akath-star-twinkle-b" />
                </g>
                <DiamondSparkle cx={56} cy={106} r={4.8} uid={uid} className="akath-star-twinkle-b" opacity={0.86} />
                <DiamondSparkle cx={114} cy={138} r={3.6} uid={uid} className="akath-star-twinkle-a" opacity={0.78} />
                {/* Far Stepped Basalt Mesas (Mobile Portrait 430x680) */}
                <path
                  d="M -16 462 C 8 434, 24 406, 48 402 L 116 400 C 134 402, 148 424, 174 430 C 198 436, 224 418, 254 418 L 296 420 C 314 422, 326 436, 344 426 C 362 414, 376 388, 398 386 L 446 388 L 446 680 L -16 680 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 462 C 8 434, 24 406, 48 402 L 116 400 C 134 402, 148 424, 174 430 C 198 436, 224 418, 254 418 L 296 420 C 314 422, 326 436, 344 426 C 362 414, 376 388, 398 386 L 446 388"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.25"
                  opacity="0.44"
                />
                <path
                  d="M 36 408 C 42 403, 46 402, 116 400 M 242 419 L 296 420 M 382 392 C 390 387, 394 386, 442 388"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.35"
                  opacity="0.82"
                />
                {/* Contour-Following Deccan Basalt Step Ledges */}
                <g fill="none" stroke="#243B8A" strokeWidth="0.74" opacity="0.32">
                  <path d="M 34 414 L 122 413 M 26 426 L 134 425" />
                  <path d="M 378 398 L 444 398 M 368 410 L 444 410" />
                  <path d="M 116 400 C 126 414, 136 426, 150 436" />
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
                  opacity="0.28"
                />
                <path
                  d="M 180 384 Q 560 212 940 384"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.05"
                  strokeDasharray="2 7"
                  opacity="0.54"
                />
                <g transform="translate(920, 108)">
                  <path
                    d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                    fill={`url(#goldFoil-${uid})`}
                   
                    opacity="0.96"
                  />
                  <DiamondSparkle cx={-20} cy={18} r={7.2} uid={uid} className="akath-star-twinkle-a" />
                  <DiamondSparkle cx={52} cy={8} r={5.0} uid={uid} className="akath-star-twinkle-b" />
                </g>
                <DiamondSparkle cx={196} cy={146} r={5.6} uid={uid} className="akath-star-twinkle-b" opacity={0.86} />
                <DiamondSparkle cx={756} cy={156} r={4.6} uid={uid} className="akath-star-twinkle-a" opacity={0.82} />
                {/* Far Stepped Basalt Mesas (Tablet) */}
                <path
                  d="M -16 432 C 28 386, 62 346, 108 342 L 210 340 C 234 340, 252 366, 286 372 C 330 378, 368 326, 412 320 L 494 318 C 534 322, 566 364, 622 368 C 674 370, 710 330, 756 324 L 832 322 C 864 324, 886 352, 922 342 C 958 332, 984 298, 1022 296 L 1094 298 L 1136 330 L 1136 620 L -16 620 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 432 C 28 386, 62 346, 108 342 L 210 340 C 234 340, 252 366, 286 372 C 330 378, 368 326, 412 320 L 494 318 C 534 322, 566 364, 622 368 C 674 370, 710 330, 756 324 L 832 322 C 864 324, 886 352, 922 342 C 958 332, 984 298, 1022 296 L 1094 298 L 1136 330"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.35"
                  opacity="0.44"
                />
                <path
                  d="M 86 348 C 96 343, 102 342, 210 340 M 392 324 C 402 321, 408 320, 494 318 M 738 328 L 832 322 M 1004 300 L 1094 298"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.45"
                  opacity="0.82"
                />
                {/* Contour-Following Deccan Basalt Strata & Slope Hachures */}
                <g fill="none" stroke="#243B8A" strokeWidth="0.78" opacity="0.32">
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
                  strokeWidth="1.0"
                  strokeDasharray="4 8"
                  opacity="0.28"
                />
                <path
                  d="M 240 374 Q 800 194 1360 374"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.1"
                  strokeDasharray="2 7"
                  opacity="0.56"
                />
                <g transform="translate(1324, 106)">
                  <path
                    d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                    fill={`url(#goldFoil-${uid})`}
                   
                    opacity="0.96"
                  />
                  <DiamondSparkle cx={-20} cy={18} r={7.5} uid={uid} className="akath-star-twinkle-a" />
                  <DiamondSparkle cx={54} cy={8} r={5.4} uid={uid} className="akath-star-twinkle-b" />
                  <DiamondSparkle cx={38} cy={-16} r={4.4} uid={uid} className="akath-star-twinkle-a" opacity={0.86} />
                </g>
                <DiamondSparkle cx={246} cy={142} r={6.0} uid={uid} className="akath-star-twinkle-b" opacity={0.88} />
                <DiamondSparkle cx={430} cy={176} r={4.4} uid={uid} className="akath-star-twinkle-a" opacity={0.82} />
                <DiamondSparkle cx={1136} cy={154} r={5.0} uid={uid} className="akath-star-twinkle-b" opacity={0.84} />

                {/* Far Stepped Sahyadri Basalt Mesas (Desktop) */}
                <path
                  d="M -20 426 C 28 378, 66 338, 118 332 L 236 330 C 266 332, 288 362, 330 368 C 378 374, 414 302, 464 294 L 568 292 C 612 296, 646 348, 706 354 C 768 360, 816 332, 868 330 L 948 328 C 986 332, 1022 356, 1068 348 C 1118 340, 1152 282, 1204 276 L 1318 274 C 1356 278, 1390 318, 1438 312 C 1484 306, 1528 294, 1620 332 L 1620 620 L -20 620 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -20 426 C 28 378, 66 338, 118 332 L 236 330 C 266 332, 288 362, 330 368 C 378 374, 414 302, 464 294 L 568 292 C 612 296, 646 348, 706 354 C 768 360, 816 332, 868 330 L 948 328 C 986 332, 1022 356, 1068 348 C 1118 340, 1152 282, 1204 276 L 1318 274 C 1356 278, 1390 318, 1438 312 C 1484 306, 1528 294, 1620 332"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.4"
                  opacity="0.44"
                />
                {/* Gleaming Golden-Hour Sun-Rim Along Far Mesa Crests */}
                <path
                  d="M 94 340 C 106 334, 112 332, 236 330 M 442 300 C 454 295, 460 294, 568 292 M 850 332 L 948 328 M 1182 282 C 1194 277, 1200 276, 1318 274"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.5"
                  opacity="0.84"
                />
                {/* Hand-Placed Contour-Following Deccan Basalt Step Ledges & Shadow-Side Hachures */}
                <g fill="none" stroke="#243B8A" strokeWidth="0.78" opacity="0.32">
                  <path d="M 96 346 L 250 344 M 78 360 L 266 360 M 64 374 L 222 374" />
                  <path d="M 236 330 C 254 348, 274 364, 304 376 M 212 332 C 228 348, 242 362, 260 372" />
                  <path d="M 444 308 L 584 307 M 426 322 L 600 322 M 412 336 L 564 336" />
                  <path d="M 568 292 C 594 318, 622 340, 658 356 M 542 293 C 564 316, 586 334, 616 348" />
                  <path d="M 1184 290 L 1334 289 M 1166 304 L 1354 304 M 1150 318 L 1310 318" />
                  <path d="M 1318 274 C 1344 298, 1370 316, 1404 328 M 1288 276 C 1310 296, 1332 312, 1362 324" />
                </g>
              </>
            )}

            {/* Quiet Evening Birds Drifting Above Western Crest */}
            <g
              fill="none"
              stroke="#1B2D6B"
              strokeWidth="1.35"
              opacity="0.42"
              transform={
                isMobile
                  ? 'translate(-172, 62) scale(0.76)'
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

          {/* Organic Curling Valley Mist Ribbon 1 */}
          <path
            d={
              isMobile
                ? 'M -30 462 C 42 440, 120 456, 206 444 C 292 432, 362 452, 466 438 L 466 494 C 360 480, 270 496, 176 486 C 88 476, 30 490, -30 482 Z'
                : isTablet
                ? 'M -60 404 C 130 376, 310 408, 520 384 C 710 362, 910 398, 1180 374 L 1180 444 C 940 426, 730 448, 520 434 C 310 420, 120 440, -60 428 Z'
                : 'M -60 398 C 180 364, 410 406, 680 378 C 940 352, 1210 398, 1660 366 L 1660 442 C 1320 422, 1020 448, 720 432 C 420 416, 180 440, -60 426 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-slow"
            opacity="0.80"
          />

          {/* LAYER 2 — Midground Escarpments, Buddhist Stupa Monastery & Flag-Free Sahyadri Watchtower */}
          <g
            className="akath-hero-parallax-mid"
            data-parallax-layer="mid"
            strokeLinecap="round"
          >
            {isMobile ? (
              <>
                <path
                  d="M -16 498 C 12 468, 36 452, 74 452 L 138 452 C 164 454, 182 484, 215 490 C 254 496, 286 474, 316 462 C 336 454, 356 446, 388 446 L 446 456 L 446 680 L -16 680 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -16 498 C 12 468, 36 452, 74 452 L 138 452 C 164 454, 182 484, 215 490 C 254 496, 286 474, 316 462 C 336 454, 356 446, 388 446 L 446 456"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.3"
                  opacity="0.46"
                />
                <path
                  d="M 28 462 C 44 454, 58 452, 138 452 M 328 456 C 346 448, 364 446, 412 449"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.4"
                  opacity="0.84"
                />
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.74" opacity="0.32">
                  <path d="M 38 466 L 142 466 M 138 452 C 150 466, 160 478, 174 490" />
                  <path d="M 326 466 L 424 466" />
                </g>
                {/* Western Deccan Buddhist Great Stupa & Torana (Cleanly Inside Safe Mobile Corridor) */}
                <BuddhistStupaMonastery
                  transform="translate(18, 382) scale(0.68)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                {/* Flag-Free Sahyadri Watchtower Bastion on Eastern Ridge */}
                <SahyadriWatchtowerFort
                  transform="translate(324, 428) scale(0.66)"
                  surfaceHex={surfaceHex}
                  uid={uid}
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
                  strokeWidth="1.35"
                  opacity="0.46"
                />
                <path
                  d="M -16 472 C 46 420, 92 394, 148 392 L 244 392 M 844 374 C 862 369, 874 368, 972 368"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.5"
                  opacity="0.86"
                />
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.78" opacity="0.32">
                  <path d="M 244 394 C 264 412, 286 426, 314 438 M 224 396 C 242 414, 260 426, 282 438 M 118 410 L 258 410" />
                  <path d="M 972 368 C 1002 388, 1034 406, 1074 420 M 946 370 C 974 388, 1002 404, 1036 418" />
                </g>
                <SahyadriWatchtowerFort
                  transform="translate(148, 370) scale(0.80)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <BuddhistStupaMonastery
                  transform="translate(262, 366) scale(0.76)"
                  surfaceHex={surfaceHex}
                  uid={uid}
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
                  strokeWidth="1.45"
                  opacity="0.46"
                />
                {/* Luminous Gold-Foil Rim Highlight Along Sunward Escarpment Shoulders */}
                <path
                  d="M 88 394 C 118 384, 146 382, 266 380 M 436 352 C 460 348, 496 348, 574 348 M 1178 344 C 1226 342, 1296 344, 1384 348"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.65"
                  opacity="0.88"
                />
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.78" opacity="0.32">
                  <path d="M 134 396 L 284 395 M 114 410 L 298 410" />
                  <path d="M 266 380 C 284 398, 302 414, 326 426 M 246 382 C 262 398, 278 412, 298 424" />
                  <path d="M 456 362 L 588 362 M 440 376 L 606 376" />
                  <path d="M 574 348 C 598 372, 624 396, 662 418 M 552 350 C 574 374, 598 396, 632 416 M 528 352 C 546 374, 566 394, 594 410" />
                  <path d="M 1384 348 C 1418 370, 1456 392, 1502 412 M 1358 350 C 1390 372, 1426 392, 1468 410" />
                </g>
                {/* Deccan Great Buddhist Stupa & Torana Gateway on Western Terrace */}
                <BuddhistStupaMonastery
                  transform="translate(226, 336) scale(0.86)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                {/* Flag-Free Sahyadri Watchtower Bastion on Upper Crest */}
                <SahyadriWatchtowerFort
                  transform="translate(464, 324) scale(0.92)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                {/* Subtle Rock-Cut Ajanta Chaitya Hall Carved Into Far-Eastern Basalt Escarpment */}
                <AjantaChaityaCaveHall
                  transform="translate(1372, 344) scale(0.76)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
              </>
            )}
          </g>

          {/* Organic Curling Lower Valley Mist Ribbon 2 */}
          <path
            d={
              isMobile
                ? 'M -30 532 C 62 516, 148 530, 232 520 C 314 510, 386 526, 466 516 L 466 562 C 362 548, 268 564, 168 554 C 82 544, 24 558, -30 550 Z'
                : isTablet
                ? 'M -60 452 C 180 434, 390 456, 620 442 C 830 428, 990 450, 1180 438 L 1180 486 C 950 472, 740 488, 520 478 C 300 468, 120 484, -60 474 Z'
                : 'M -60 450 C 240 426, 520 454, 820 438 C 1100 424, 1340 452, 1660 436 L 1660 486 C 1340 470, 1020 488, 720 476 C 420 464, 160 484, -60 472 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-deep"
            opacity="0.64"
          />

          {/* LAYER 3A — Stepped Nanded Ghats, Serene Skiff & Shimmering Godavari River Plane */}
          <g
            className="akath-hero-parallax-river"
            data-parallax-layer="river"
            strokeLinecap="round"
          >
            {isMobile ? (
              <>
                <path
                  d="M -16 562 Q 84 542 178 556 T 340 552 Q 392 544 446 556 L 446 710 L -16 710 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -16 562 Q 84 542 178 556 T 340 552 Q 392 544 446 556"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.25"
                  opacity="0.46"
                />
                {/* Centered Stepped Nanded Stone Ghat Stairs Directly Below the Banyan Katta */}
                <g stroke="#1B2D6B" strokeWidth="1.05" opacity="0.44">
                  <line x1="78" y1="572" x2="352" y2="572" />
                  <line x1="66" y1="580" x2="364" y2="580" />
                  <line x1="54" y1="588" x2="376" y2="588" />
                </g>
                <g stroke="#FFF8DC" strokeWidth="0.85" opacity="0.72">
                  <line x1="80" y1="573" x2="350" y2="573" />
                  <line x1="68" y1="581" x2="362" y2="581" />
                </g>
                {/* Luminous Godavari River Dusk Band */}
                <path
                  d="M -20 598 Q 112 584 218 596 T 450 594 L 450 664 Q 312 646 184 654 T -20 660 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -20 598 Q 112 584 218 596 T 450 594" fill="none" stroke={`url(#goldBeam-${uid})`} strokeWidth="1.3" opacity="0.78" />
                {/* Dappled Banyan Canopy & Warm Lantern Reflection Centered on the Godavari */}
                <g stroke="#174D3A" strokeWidth="1.1" opacity="0.30">
                  <line x1="118" y1="608" x2="312" y2="608" strokeDasharray="16 8" />
                  <line x1="142" y1="617" x2="288" y2="617" strokeDasharray="12 9" />
                  <line x1="168" y1="626" x2="262" y2="626" strokeDasharray="10 8" />
                </g>
                <g stroke={`url(#goldBeam-${uid})`} strokeWidth="1.75">
                  <line x1="48" y1="612" x2="122" y2="612" className="akath-river-shimmer-a" />
                  <line x1="162" y1="622" x2="268" y2="622" className="akath-river-shimmer-b" />
                  <line x1="296" y1="614" x2="378" y2="614" className="akath-river-shimmer-a" />
                </g>
                <GodavariEveningSkiff transform="translate(32, 608) scale(0.72)" uid={uid} />
                <GodavariWaterRipples tier="mobile" uid={uid} />
                <DiamondSparkle cx={215} cy={622} r={5.0} uid={uid} className="akath-star-twinkle-a" opacity={0.94} />
                <DiamondSparkle cx={336} cy={614} r={4.0} uid={uid} className="akath-star-twinkle-b" opacity={0.88} />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -24 492 Q 180 460 370 480 T 740 474 Q 930 456 1144 476 L 1144 650 L -24 650 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -24 492 Q 180 460 370 480 T 740 474 Q 930 456 1144 476"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.35"
                  opacity="0.46"
                />
                <g stroke="#1B2D6B" strokeWidth="1.1" opacity="0.42">
                  <line x1="654" y1="484" x2="982" y2="484" />
                  <line x1="636" y1="493" x2="1002" y2="493" />
                  <line x1="618" y1="502" x2="1020" y2="502" />
                </g>
                <path
                  d="M -24 524 Q 260 500 540 520 T 1144 522 L 1144 590 Q 820 564 520 576 T -24 586 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -24 524 Q 260 500 540 520 T 1144 522" fill="none" stroke={`url(#goldBeam-${uid})`} strokeWidth="1.4" opacity="0.78" />
                {/* Dappled Banyan Canopy & Lantern Reflection on the Godavari */}
                <g stroke="#174D3A" strokeWidth="1.2" opacity="0.32">
                  <line x1="708" y1="534" x2="928" y2="534" strokeDasharray="18 9" />
                  <line x1="740" y1="544" x2="896" y2="544" strokeDasharray="14 10" />
                  <line x1="772" y1="554" x2="864" y2="554" strokeDasharray="12 10" />
                </g>
                <g stroke={`url(#goldBeam-${uid})`} strokeWidth="1.9">
                  <line x1="220" y1="538" x2="345" y2="538" className="akath-river-shimmer-a" />
                  <line x1="470" y1="548" x2="645" y2="548" className="akath-river-shimmer-b" />
                  <line x1="754" y1="540" x2="885" y2="540" className="akath-river-shimmer-a" />
                  <line x1="518" y1="559" x2="615" y2="559" className="akath-river-shimmer-b" />
                </g>
                <GodavariEveningSkiff transform="translate(364, 534) scale(0.84)" uid={uid} />
                <GodavariWaterRipples tier="tablet" uid={uid} />
                <DiamondSparkle cx={556} cy={548} r={5.6} uid={uid} className="akath-star-twinkle-a" opacity={0.95} />
                <DiamondSparkle cx={816} cy={540} r={4.5} uid={uid} className="akath-star-twinkle-b" opacity={0.90} />
              </>
            ) : (
              <>
                {/* Foreground Riverbank & Engraved Bank Contour */}
                <path
                  d="M -28 492 Q 160 456 346 478 T 700 486 Q 832 492 954 474 T 1316 460 Q 1474 452 1628 476 L 1628 654 L -28 654 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -28 492 Q 160 456 346 478 T 700 486 Q 832 492 954 474 T 1316 460 Q 1474 452 1628 476"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.4"
                  opacity="0.46"
                />
                {/* Stepped Nanded Stone Ghat Stairs & Warm Sunlit Edges Below the Banyan Katta */}
                <g stroke="#1B2D6B" strokeWidth="1.15" opacity="0.44">
                  <line x1="1014" y1="480" x2="1376" y2="480" />
                  <line x1="992" y1="489" x2="1400" y2="489" />
                  <line x1="970" y1="498" x2="1424" y2="498" />
                  <line x1="952" y1="507" x2="1442" y2="507" opacity="0.78" />
                </g>
                <g stroke="#FFF8DC" strokeWidth="0.95" opacity="0.74">
                  <line x1="1016" y1="481" x2="1374" y2="481" />
                  <line x1="994" y1="490" x2="1398" y2="490" />
                  <line x1="972" y1="499" x2="1422" y2="499" />
                </g>

                {/* Winding Luminous Godavari River Reflection Band */}
                <path
                  d="M -28 524 Q 320 498 660 522 T 1320 516 Q 1470 510 1628 526 L 1628 592 Q 1340 562 980 578 T 320 572 Q 140 568 -28 588 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path
                  d="M -28 524 Q 320 498 660 522 T 1320 516 Q 1470 510 1628 526"
                  fill="none"
                  stroke={`url(#goldBeam-${uid})`}
                  strokeWidth="1.5"
                  opacity="0.80"
                />
                {/* Organic Dappled Reflection Directly Below the Banyan Literary Katta */}
                <g stroke="#174D3A" strokeWidth="1.25" opacity="0.32">
                  <line x1="1068" y1="532" x2="1312" y2="532" strokeDasharray="22 10" />
                  <line x1="1102" y1="542" x2="1278" y2="542" strokeDasharray="18 11" />
                  <line x1="1136" y1="552" x2="1244" y2="552" strokeDasharray="14 10" />
                  <line x1="1164" y1="561" x2="1216" y2="561" strokeDasharray="12 9" />
                </g>
                {/* Gleaming Gold-Foil Dusk Water Shimmer Lines */}
                <g stroke={`url(#goldBeam-${uid})`} strokeWidth="2.0">
                  <line x1="210" y1="549" x2="318" y2="549" className="akath-river-shimmer-b" />
                  <line x1="420" y1="536" x2="552" y2="536" className="akath-river-shimmer-a" />
                  <line x1="686" y1="545" x2="880" y2="545" className="akath-river-shimmer-b" />
                  <line x1="742" y1="556" x2="844" y2="556" className="akath-river-shimmer-a" />
                  <line x1="994" y1="538" x2="1118" y2="538" className="akath-river-shimmer-b" />
                  <line x1="1142" y1="548" x2="1264" y2="548" className="akath-river-shimmer-a" />
                </g>
                {/* Serene Hand-Drawn Wooden Godavari Skiff Gliding Quietly at Dusk */}
                <GodavariEveningSkiff transform="translate(524, 532) scale(0.95)" uid={uid} />
                {/* Subtle Animated SVG Ripple Layer Over Godavari Water Surface */}
                <GodavariWaterRipples tier="desktop" uid={uid} />
                {/* Specular Sun-Glints Dancing on the Godavari */}
                <DiamondSparkle cx={786} cy={545} r={6.2} uid={uid} className="akath-star-twinkle-a" opacity={0.96} />
                <DiamondSparkle cx={484} cy={536} r={4.8} uid={uid} className="akath-star-twinkle-b" opacity={0.92} />
                <DiamondSparkle cx={1192} cy={548} r={5.2} uid={uid} className="akath-star-twinkle-a" opacity={0.95} />
              </>
            )}
          </g>

          {/* LAYER 3B — Foreground Hand-Drawn Banyan Literary Gathering, Neem & River Reeds */}
          <g
            className="akath-hero-parallax-trees"
            data-parallax-layer="trees"
            strokeLinecap="round"
          >
            {isMobile ? (
              <>
                {/* Mathematically Centered Hero Banyan Literary Circle (x=70..360, center=215) */}
                <BanyanVachankattaScene
                  transform="translate(70, 412) scale(1.0)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <GodavariReeds transform="translate(18, 550) scale(0.64)" />
                <GodavariReeds transform="translate(372, 550) scale(0.64)" />
              </>
            ) : isTablet ? (
              <>
                <EngravedBanyanTree
                  transform="translate(26, 396) scale(0.78)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <EngravedNeemTree
                  transform="translate(402, 418) scale(0.64)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <BanyanVachankattaScene
                  transform="translate(646, 304) scale(1.12)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <GodavariReeds transform="translate(332, 466) scale(0.84)" />
              </>
            ) : (
              <>
                <EngravedBanyanTree
                  transform="translate(42, 382) scale(0.92)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <EngravedNeemTree
                  transform="translate(388, 404) scale(0.76)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <BanyanVachankattaScene
                  transform="translate(1002, 278) scale(1.24)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <GodavariReeds transform="translate(476, 466) scale(0.92)" />
                <GodavariReeds transform="translate(1414, 464) scale(0.9)" />
              </>
            )}
          </g>

        </svg>

        {/* Subtle Animated Gilded Foil Sheen Gliding Across the Plate (Desktop Only) */}
        <div
          className="hidden lg:block akath-gold-sheen-sweep absolute inset-y-0 -inset-x-[24%] pointer-events-none"
          style={{
            background:
              'linear-gradient(112deg, rgba(255, 253, 245, 0) 28%, rgba(255, 217, 102, 0.14) 45%, rgba(255, 250, 224, 0.26) 50%, rgba(255, 217, 102, 0.12) 56%, rgba(255, 253, 245, 0) 72%)',
          }}
        />

        {/* Balanced Center Readability Veil — Keeps Headline Crisp While Banyan Gathering & River Shine Vividly */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 46% at 50% 32%, rgba(250, 248, 240, 0.56) 0%, rgba(250, 248, 240, 0.20) 56%, rgba(250, 248, 240, 0) 100%)',
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

        {/* Seamless Bottom Fade Into the Interactive Book Plinth (Keeps Shimmering Godavari River Vivid) */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 sm:h-14"
          style={{
            background:
              'linear-gradient(180deg, rgba(250, 248, 240, 0) 0%, rgba(250, 248, 240, 0.78) 72%, #FAF8F0 100%)',
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
});

/* ============================================================================
   2. FOR AUTHORS — CHAPTER II: INTIMATE GODAVARI GHAT STUDY (ILLUMINATED)
   Contemplative gilded riverside plate: open carved stone mandapa with lit
   hanging brass lantern, weathered stone ghat steps, quiet moored wooden hodi
   skiff, opposite-bank lit deepstambh, sunlit neem grove, reeds, and gleaming
   golden-hour Godavari water reflections.
   ============================================================================ */
export const AuthorsLandscapeBackdrop: React.FC = React.memo(() => {
  const uid = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tier = useLandscapeViewportTier();
  const isOffscreen = useSubtleLandscapeMotion(containerRef, 'section');

  const isMobile = tier === 'mobile';
  const isTablet = tier === 'tablet';

  const viewBox = isMobile
    ? '0 0 430 700'
    : isTablet
    ? '0 0 1120 720'
    : '0 0 1600 720';

  const surfaceHex = '#F4EDE0';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="authors-dusk-landscape-svg"
      style={{ contain: 'layout style paint' }}
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none bg-[#F4EDE0] ${
        isOffscreen ? 'akath-landscape-offscreen' : ''
      }`}
    >
      {/* Radiant Golden-Parchment Dusk Atmospheric Wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 88% 58% at 50% 18%, rgba(255, 217, 102, 0.27) 0%, rgba(239, 104, 85, 0.11) 44%, rgba(244, 237, 224, 0) 78%)',
        }}
      />

      <div className="relative w-full h-full max-w-[1680px] mx-auto overflow-hidden flex items-end">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          className="akath-landscape-svg-luminous w-full h-full opacity-[0.95] sm:opacity-[0.98] lg:opacity-100"
        >
          <InkWashDefs uid={uid} surfaceHex={surfaceHex} sunCy="56%" />

          {/* Radiant Low Horizon Dusk Corona */}
          <ellipse
            cx={isMobile ? 215 : isTablet ? 560 : 800}
            cy={isMobile ? 492 : 454}
            rx={isMobile ? 245 : isTablet ? 510 : 660}
            ry={isMobile ? 195 : 245}
            fill={`url(#duskSun-${uid})`}
          />

          {/* Far Plane — Gleaming Evening Crescent & Sun-Rimmed Low Marathwada Hills */}
          <g className="akath-parallax-far" strokeLinecap="round">
            <g
              transform={
                isMobile
                  ? 'translate(42, 92) scale(0.80)'
                  : isTablet
                  ? 'translate(124, 118) scale(0.94)'
                  : 'translate(192, 116)'
              }
            >
              <path
                d="M 22 4 A 24 24 0 1 0 42 36 A 18 18 0 1 1 22 4 Z"
                fill={`url(#goldFoil-${uid})`}
               
                opacity="0.96"
              />
              <DiamondSparkle cx={58} cy={18} r={6.8} uid={uid} className="akath-star-twinkle-a" />
              <DiamondSparkle cx={-12} cy={10} r={4.6} uid={uid} className="akath-star-twinkle-b" />
            </g>
            {!isMobile && (
              <>
                <DiamondSparkle
                  cx={isTablet ? 956 : 1380}
                  cy={isTablet ? 148 : 136}
                  r={5.8}
                  uid={uid}
                  className="akath-star-twinkle-b"
                  opacity={0.88}
                />
                <DiamondSparkle
                  cx={isTablet ? 810 : 1140}
                  cy={isTablet ? 186 : 172}
                  r={4.2}
                  uid={uid}
                  className="akath-star-twinkle-a"
                  opacity={0.82}
                />
              </>
            )}

            {/* Pair of Evening Herons Gliding Quietly Over the River */}
            <g
              fill="none"
              stroke="#1B2D6B"
              strokeWidth="1.35"
              opacity="0.40"
              transform={
                isMobile
                  ? 'translate(-930, 12) scale(0.84)'
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
                  d="M -16 516 C 34 494, 86 482, 146 488 C 202 494, 246 480, 304 478 C 356 476, 404 490, 446 502 L 446 700 L -16 700 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 516 C 34 494, 86 482, 146 488 C 202 494, 246 480, 304 478 C 356 476, 404 490, 446 502"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.2"
                  opacity="0.38"
                />
                <path
                  d="M 52 487 C 84 483, 114 485, 146 488 M 248 480 C 276 478, 310 477, 344 479"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.35"
                  opacity="0.82"
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
                  strokeWidth="1.25"
                  opacity="0.38"
                />
                <path
                  d="M 150 457 C 198 453, 246 455, 294 460 M 492 448 C 546 446, 594 447, 638 450 M 892 458 C 940 450, 990 445, 1044 450"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.45"
                  opacity="0.82"
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
                  strokeWidth="1.3"
                  opacity="0.38"
                />
                <path
                  d="M 180 442 C 250 436, 316 440, 380 448 M 622 436 C 692 432, 756 434, 816 438 M 1188 444 C 1272 430, 1362 430, 1446 444"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.5"
                  opacity="0.84"
                />
                <g fill="none" stroke="#243B8A" strokeWidth="0.72" opacity="0.28">
                  <path d="M 210 458 Q 290 452 370 462 M 690 450 Q 790 444 888 456 M 1150 458 Q 1270 446 1390 458" />
                </g>
              </>
            )}
          </g>

          {/* Organic Curling River Mist Ribbon Separating Distant Hills from the Ghats */}
          <path
            d={
              isMobile
                ? 'M -30 518 C 56 500, 140 516, 224 504 C 310 494, 382 512, 466 502 L 466 552 C 354 538, 258 554, 162 544 C 76 534, 24 546, -30 540 Z'
                : isTablet
                ? 'M -60 492 C 160 466, 380 494, 620 476 C 840 460, 990 486, 1180 470 L 1180 532 C 950 516, 720 536, 500 522 C 280 508, 120 528, -60 518 Z'
                : 'M -60 488 C 220 458, 490 494, 800 472 C 1090 452, 1340 488, 1660 466 L 1660 530 C 1340 512, 1020 534, 720 520 C 420 506, 160 526, -60 516 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-slow"
            opacity="0.78"
          />

          {/* Midground — Quiet River Embankment, Carved Ghat Mandapa, Lit Deepstambh & Sunlit Neem Grove */}
          <g className="akath-parallax-mid" strokeLinecap="round">
            {isMobile ? (
              <>
                <path
                  d="M -16 562 Q 98 540 198 558 T 446 550 L 446 700 L -16 700 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -16 562 Q 98 540 198 558 T 446 550"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.2"
                  opacity="0.40"
                />
                <EngravedGhatMandapa
                  transform="translate(14, 464) scale(0.74)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <StoneDeepstambh
                  transform="translate(290, 500) scale(0.76)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <EngravedNeemTree
                  transform="translate(322, 486) scale(0.74)"
                  surfaceHex={surfaceHex}
                  uid={uid}
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
                  strokeWidth="1.25"
                  opacity="0.40"
                />
                <EngravedGhatMandapa
                  transform="translate(54, 419) scale(0.96)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <StoneDeepstambh
                  transform="translate(838, 464) scale(0.92)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <EngravedNeemTree
                  transform="translate(892, 434) scale(1.06)"
                  surfaceHex={surfaceHex}
                  uid={uid}
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
                  strokeWidth="1.3"
                  opacity="0.40"
                />
                <EngravedGhatMandapa
                  transform="translate(108, 398) scale(1.08)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <StoneDeepstambh
                  transform="translate(1208, 456) scale(1.02)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <EngravedNeemTree
                  transform="translate(1272, 418) scale(1.18)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <EngravedNeemTree
                  transform="translate(1414, 444) scale(0.86)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <g stroke="#1B2D6B" strokeWidth="1.1" opacity="0.40">
                  <line x1="1158" y1="538" x2="1548" y2="538" />
                  <line x1="1138" y1="548" x2="1564" y2="548" />
                  <line x1="1118" y1="558" x2="1580" y2="558" />
                </g>
              </>
            )}
          </g>

          {/* Foreground River Plane — Gleaming Mirror-Calm Godavari Dusk Water & Reflections */}
          <g className="akath-parallax-river" strokeLinecap="round">
            {isMobile ? (
              <>
                <path
                  d="M -20 584 Q 118 570 226 582 T 450 580 L 450 720 L -20 720 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -20 584 Q 118 570 226 582 T 450 580" fill="none" stroke={`url(#goldBeam-${uid})`} strokeWidth="1.35" opacity="0.76" />
                <g stroke="#1B2D6B" strokeWidth="1.05" opacity="0.34">
                  <line x1="42" y1="598" x2="128" y2="598" />
                  <line x1="52" y1="608" x2="116" y2="608" />
                  <line x1="64" y1="618" x2="104" y2="618" />
                </g>
                <g stroke={`url(#goldBeam-${uid})`} strokeWidth="1.8">
                  <line x1="128" y1="610" x2="236" y2="610" className="akath-river-shimmer-a" />
                  <line x1="164" y1="626" x2="306" y2="626" className="akath-river-shimmer-b" />
                  <line x1="258" y1="602" x2="354" y2="602" className="akath-river-shimmer-a" />
                </g>
                <DiamondSparkle cx={232} cy={626} r={5.0} uid={uid} className="akath-star-twinkle-a" opacity={0.94} />
                <DiamondSparkle cx={312} cy={602} r={4.0} uid={uid} className="akath-star-twinkle-b" opacity={0.88} />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -24 574 Q 290 554 580 572 T 1144 568 L 1144 750 L -24 750 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -24 574 Q 290 554 580 572 T 1144 568" fill="none" stroke={`url(#goldBeam-${uid})`} strokeWidth="1.4" opacity="0.78" />
                <g stroke="#1B2D6B" strokeWidth="1.15" opacity="0.34">
                  <line x1="94" y1="590" x2="220" y2="590" />
                  <line x1="110" y1="602" x2="202" y2="602" />
                  <line x1="126" y1="614" x2="188" y2="614" />
                </g>
                <g stroke={`url(#goldBeam-${uid})`} strokeWidth="1.95">
                  <line x1="330" y1="604" x2="498" y2="604" className="akath-river-shimmer-a" />
                  <line x1="468" y1="620" x2="684" y2="620" className="akath-river-shimmer-b" />
                  <line x1="696" y1="600" x2="854" y2="600" className="akath-river-shimmer-a" />
                  <line x1="528" y1="638" x2="646" y2="638" className="akath-river-shimmer-b" />
                </g>
                <DiamondSparkle cx={582} cy={620} r={5.8} uid={uid} className="akath-star-twinkle-a" opacity={0.95} />
                <DiamondSparkle cx={778} cy={600} r={4.6} uid={uid} className="akath-star-twinkle-b" opacity={0.90} />
              </>
            ) : (
              <>
                <path
                  d="M -28 576 Q 360 554 780 574 T 1628 568 L 1628 750 L -28 750 Z"
                  fill={`url(#riverWash-${uid})`}
                />
                <path d="M -28 576 Q 360 554 780 574 T 1628 568" fill="none" stroke={`url(#goldBeam-${uid})`} strokeWidth="1.5" opacity="0.80" />
                {/* Broken Ink Water Reflections of Mandapa & Deepstambh */}
                <g stroke="#1B2D6B" strokeWidth="1.2" opacity="0.34">
                  <line x1="158" y1="592" x2="310" y2="592" />
                  <line x1="176" y1="604" x2="290" y2="604" />
                  <line x1="194" y1="616" x2="268" y2="616" />
                  <line x1="1210" y1="592" x2="1246" y2="592" />
                  <line x1="1216" y1="604" x2="1240" y2="604" />
                </g>
                {/* Gleaming Gold-Foil Water Shimmer Bars */}
                <g stroke={`url(#goldBeam-${uid})`} strokeWidth="2.0">
                  <line x1="426" y1="604" x2="612" y2="604" className="akath-river-shimmer-a" />
                  <line x1="674" y1="618" x2="928" y2="618" className="akath-river-shimmer-b" />
                  <line x1="744" y1="636" x2="878" y2="636" className="akath-river-shimmer-a" />
                  <line x1="998" y1="602" x2="1162" y2="602" className="akath-river-shimmer-b" />
                  <line x1="1296" y1="616" x2="1444" y2="616" className="akath-river-shimmer-a" />
                </g>
                <DiamondSparkle cx={802} cy={618} r={6.4} uid={uid} className="akath-star-twinkle-a" opacity={0.96} />
                <DiamondSparkle cx={522} cy={604} r={4.8} uid={uid} className="akath-star-twinkle-b" opacity={0.92} />
                <DiamondSparkle cx={1084} cy={602} r={5.0} uid={uid} className="akath-star-twinkle-a" opacity={0.92} />
              </>
            )}
          </g>

          {/* Foreground Botanicals Plane — Riverbank Reeds (Independent Depth Motion) */}
          <g className="akath-parallax-trees" strokeLinecap="round">
            {isMobile ? (
              <GodavariReeds transform="translate(366, 588) scale(0.78)" />
            ) : isTablet ? (
              <>
                <GodavariReeds transform="translate(998, 566) scale(1.04)" />
                <GodavariReeds transform="translate(20, 580) scale(0.88)" />
              </>
            ) : (
              <>
                <GodavariReeds transform="translate(26, 582) scale(1.06)" />
                <GodavariReeds transform="translate(1484, 566) scale(1.16)" />
              </>
            )}
          </g>

        </svg>

        {/* Subtle Animated Gilded Foil Sheen Gliding Across the Plate (Desktop Only) */}
        <div
          className="hidden lg:block akath-gold-sheen-sweep absolute inset-y-0 -inset-x-[24%] pointer-events-none"
          style={{
            background:
              'linear-gradient(112deg, rgba(255, 253, 245, 0) 28%, rgba(255, 217, 102, 0.14) 45%, rgba(255, 250, 224, 0.25) 50%, rgba(255, 217, 102, 0.12) 56%, rgba(255, 253, 245, 0) 72%)',
          }}
        />

        {/* Balanced Center Readability Veil — Keeps Section Heading & Author Studio Card Crisp */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 62% 58% at 50% 45%, rgba(244, 237, 224, 0.56) 0%, rgba(244, 237, 224, 0.22) 60%, rgba(244, 237, 224, 0) 100%)',
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
});

/* ============================================================================
   3. ABOUT — CHAPTER III: ELEVATED SAHYADRI HORIZON (ILLUMINATED PLATE)
   High-altitude original vista: sun-gilded Deccan basalt plateaus, monumental
   Maratha hill-fort citadel on the eastern escarpment, Hemadpanthi stepped
   stone shikhara with gleaming amalaka in the western valley, curling mist,
   and mature sunlit banyan & neem groves anchoring the terraced foreland.
   ============================================================================ */
export interface AboutLandscapeBackdropProps {
  /** Base paper surface color for radial readability veil & edge fades */
  surfaceHex?: string;
  /** Optional top blend color from preceding section */
  topFadeRgba?: string;
  /** Optional bottom blend color into following section */
  bottomFadeRgba?: string;
}

export const AboutLandscapeBackdrop: React.FC<AboutLandscapeBackdropProps> = React.memo(({
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
    ? '0 0 430 680'
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
      style={{ backgroundColor: surfaceHex, contain: 'layout style paint' }}
    >
      {/* Radiant Golden-Hour Horizon Atmospheric Wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 88% 58% at 50% 16%, rgba(255, 217, 102, 0.27) 0%, rgba(239, 104, 85, 0.11) 44%, rgba(250, 246, 236, 0) 78%)',
        }}
      />

      <div className="relative w-full h-full max-w-[1680px] mx-auto overflow-hidden flex items-end">
        <svg
          viewBox={viewBox}
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          className="akath-landscape-svg-luminous w-full h-full opacity-[0.94] sm:opacity-[0.97] lg:opacity-100"
        >
          <InkWashDefs uid={uid} surfaceHex={surfaceHex} sunCy="62%" />

          {/* Radiant Golden-Dusk Horizon Halo & Soft Twilight Clouds */}
          <ellipse
            cx={isMobile ? 215 : isTablet ? 560 : 800}
            cy={isMobile ? 430 : 386}
            rx={isMobile ? 255 : isTablet ? 530 : 700}
            ry={isMobile ? 210 : 265}
            fill={`url(#duskSun-${uid})`}
          />
          <TwilightCloudRibbons tier={tier} uid={uid} />

          {/* LAYER 1 — Monumental Terraced Deccan Trap Basalt Plateaus */}
          <g className="akath-parallax-far" strokeLinecap="round">
            <path
              d={
                isMobile
                  ? 'M 20 398 Q 215 232 410 398'
                  : isTablet
                  ? 'M 80 374 Q 560 156 1040 374'
                  : 'M 120 364 Q 800 132 1480 364'
              }
              fill="none"
              stroke={`url(#goldFoil-${uid})`}
              strokeWidth="1.15"
              strokeDasharray="3 8"
              opacity="0.56"
            />
            <g
              transform={
                isMobile
                  ? 'translate(352, 92) scale(0.80)'
                  : isTablet
                  ? 'translate(944, 130) scale(0.92)'
                  : 'translate(1354, 126)'
              }
            >
              <DiamondSparkle cx={0} cy={0} r={7.2} uid={uid} className="akath-star-twinkle-a" />
              <DiamondSparkle cx={26} cy={16} r={5.0} uid={uid} className="akath-star-twinkle-b" />
              <DiamondSparkle cx={-20} cy={22} r={4.4} uid={uid} className="akath-star-twinkle-a" opacity={0.86} />
            </g>
            <DiamondSparkle
              cx={isMobile ? 62 : isTablet ? 186 : 244}
              cy={isMobile ? 108 : isTablet ? 148 : 144}
              r={isMobile ? 5.0 : 6.0}
              uid={uid}
              className="akath-star-twinkle-b"
              opacity={0.88}
            />

            {isMobile ? (
              <>
                <path
                  d="M -16 462 C 4 440, 18 416, 38 414 L 106 412 C 122 414, 136 434, 162 436 C 186 438, 206 404, 232 402 L 284 402 C 302 404, 314 426, 336 430 C 358 434, 374 394, 396 392 L 446 392 L 446 680 L -16 680 Z"
                  fill={`url(#farWash-${uid})`}
                />
                <path
                  d="M -16 462 C 4 440, 18 416, 38 414 L 106 412 C 122 414, 136 434, 162 436 C 186 438, 206 404, 232 402 L 284 402 C 302 404, 314 426, 336 430 C 358 434, 374 394, 396 392 L 446 392"
                  fill="none"
                  stroke="#243B8A"
                  strokeWidth="1.3"
                  opacity="0.44"
                />
                <path
                  d="M 38 414 L 106 412 M 232 402 L 284 402 M 396 392 L 442 392"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.4"
                  opacity="0.82"
                />
                <g fill="none" stroke="#243B8A" strokeWidth="0.74" opacity="0.32">
                  <path d="M 28 426 L 114 425 M 222 414 L 294 414 M 382 406 L 444 406" />
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
                  strokeWidth="1.35"
                  opacity="0.44"
                />
                <path
                  d="M 68 364 L 184 362 M 404 342 L 516 340 M 784 328 L 916 326"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.45"
                  opacity="0.84"
                />
                <g fill="none" stroke="#243B8A" strokeWidth="0.78" opacity="0.32">
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
                  strokeWidth="1.4"
                  opacity="0.44"
                />
                {/* Sunlit Gold-Foil Rim Along High Deccan Tablelands */}
                <path
                  d="M 102 328 C 114 322, 120 320, 284 318 M 556 334 C 566 329, 574 328, 696 326 M 1068 312 C 1082 306, 1090 304, 1266 302"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.55"
                  opacity="0.86"
                />
                <g fill="none" stroke="#243B8A" strokeWidth="0.78" opacity="0.32">
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
                ? 'M -30 468 C 56 446, 140 464, 224 450 C 308 438, 382 458, 466 444 L 466 500 C 362 486, 268 502, 168 492 C 80 482, 24 496, -30 488 Z'
                : isTablet
                ? 'M -60 426 C 160 398, 370 428, 600 404 C 820 384, 980 416, 1180 396 L 1180 466 C 950 448, 730 470, 510 454 C 290 440, 120 460, -60 450 Z'
                : 'M -60 420 C 220 386, 480 424, 780 398 C 1070 374, 1330 418, 1660 388 L 1660 462 C 1340 444, 1020 468, 720 452 C 420 436, 160 458, -60 446 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-slow"
            opacity="0.78"
          />

          {/* LAYER 2 — Buddhist Great Stupa, Ajanta Rock-Cut Chaitya Cave Hall & Flag-Free Sahyadri Citadel */}
          <g className="akath-parallax-mid" strokeLinecap="round">
            {isMobile ? (
              <>
                <path
                  d="M -16 516 C 24 484, 62 478, 116 492 C 170 506, 220 518, 268 504 C 296 494, 314 452, 344 446 L 404 446 L 446 472 L 446 680 L -16 680 Z"
                  fill={`url(#midWash-${uid})`}
                />
                <path
                  d="M -16 516 C 24 484, 62 478, 116 492 C 170 506, 220 518, 268 504 C 296 494, 314 452, 344 446 L 404 446 L 446 472"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.3"
                  opacity="0.46"
                />
                <path
                  d="M 322 454 C 334 448, 340 446, 404 446"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.45"
                  opacity="0.86"
                />
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.74" opacity="0.32">
                  <path d="M 326 460 L 414 460 M 314 472 L 424 472" />
                </g>
                {/* Western Heritage Valley: Great Buddhist Stupa & Torana */}
                <BuddhistStupaMonastery
                  transform="translate(18, 412) scale(0.66)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                {/* Eastern Basalt Plateau: Flag-Free Sahyadri Citadel Above Ajanta Rock-Cut Chaitya Hall */}
                <SahyadriCitadelFort
                  transform="translate(294, 422) scale(0.62)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <AjantaChaityaCaveHall
                  transform="translate(298, 458) scale(0.68)"
                  surfaceHex={surfaceHex}
                  uid={uid}
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
                  strokeWidth="1.35"
                  opacity="0.46"
                />
                <path
                  d="M 812 414 C 826 406, 838 402, 992 402"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.6"
                  opacity="0.88"
                />
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.78" opacity="0.32">
                  <path d="M 822 418 L 1006 418 M 804 434 L 1024 434 M 992 402 C 1022 422, 1052 440, 1088 456" />
                </g>
                <SahyadriCitadelFort
                  transform="translate(836, 368) scale(0.92)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <AjantaChaityaCaveHall
                  transform="translate(814, 424) scale(0.84)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <BuddhistStupaMonastery
                  transform="translate(154, 392) scale(0.84)"
                  surfaceHex={surfaceHex}
                  uid={uid}
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
                  strokeWidth="1.45"
                  opacity="0.46"
                />
                <path
                  d="M 1074 402 C 1116 382, 1152 378, 1216 378 L 1368 378"
                  fill="none"
                  stroke={`url(#goldFoil-${uid})`}
                  strokeWidth="1.75"
                  opacity="0.90"
                />
                <g fill="none" stroke="#1B2D6B" strokeWidth="0.78" opacity="0.32">
                  <path d="M 1116 394 L 1384 394 M 1084 410 L 1408 410 M 1054 426 L 1430 426" />
                  <path d="M 1368 378 C 1408 402, 1448 424, 1498 444 M 1334 380 C 1372 404, 1412 426, 1456 444" />
                  <path d="M 122 454 C 190 452, 248 462, 314 480 M 96 470 C 166 468, 224 476, 286 492" />
                </g>
                {/* Eastern Sahyadri Escarpment: Flag-Free Citadel Above Ajanta Rock-Cut Chaitya Cave Hall */}
                <SahyadriCitadelFort
                  transform="translate(1192, 342) scale(1.04)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <AjantaChaityaCaveHall
                  transform="translate(1158, 404) scale(0.96)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                {/* Western Marathwada Heritage Valley: Great Buddhist Stupa & Companion Hemadpanthi Shikhara */}
                <HemadpanthiStoneShikhara
                  transform="translate(34, 406) scale(0.68)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <BuddhistStupaMonastery
                  transform="translate(232, 376) scale(0.96)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
              </>
            )}
          </g>

          {/* Organic Curling Lower Ridge Mist Ribbon 2 */}
          <path
            d={
              isMobile
                ? 'M -30 546 C 58 530, 142 544, 228 534 C 314 524, 386 540, 466 530 L 466 578 C 362 564, 268 580, 168 570 C 82 560, 24 572, -30 564 Z'
                : isTablet
                ? 'M -60 508 C 180 486, 390 510, 620 494 C 830 480, 990 504, 1180 490 L 1180 542 C 950 528, 740 546, 520 534 C 300 524, 120 540, -60 530 Z'
                : 'M -60 504 C 240 478, 520 508, 820 492 C 1100 476, 1340 506, 1660 488 L 1660 542 C 1340 526, 1020 544, 720 532 C 420 520, 160 538, -60 528 Z'
            }
            fill={`url(#mistRibbon-${uid})`}
            className="akath-landscape-mist-deep"
            opacity="0.64"
          />

          {/* LAYER 3A — Terraced Foreground Deccan Foreland & Gilded Valley Contour */}
          <g className="akath-parallax-river" strokeLinecap="round">
            {isMobile ? (
              <>
                <path
                  d="M -20 594 Q 108 570 216 586 T 450 578 L 450 704 L -20 704 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -20 594 Q 108 570 216 586 T 450 578"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.25"
                  opacity="0.46"
                />
                <path
                  d="M -20 626 Q 124 610 236 620 T 450 614"
                  fill="none"
                  stroke={`url(#goldBeam-${uid})`}
                  strokeWidth="1.45"
                  strokeDasharray="6 6"
                  opacity="0.80"
                />
              </>
            ) : isTablet ? (
              <>
                <path
                  d="M -24 558 Q 250 526 520 550 T 1144 538 L 1144 690 L -24 690 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -24 558 Q 250 526 520 550 T 1144 538"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.35"
                  opacity="0.46"
                />
                <path
                  d="M -24 592 Q 300 572 580 586 T 1144 576"
                  fill="none"
                  stroke={`url(#goldBeam-${uid})`}
                  strokeWidth="1.55"
                  strokeDasharray="7 7"
                  opacity="0.82"
                />
              </>
            ) : (
              <>
                <path
                  d="M -28 546 Q 220 512 468 538 T 980 542 Q 1280 524 1628 536 L 1628 670 L -28 670 Z"
                  fill={`url(#nearWash-${uid})`}
                />
                <path
                  d="M -28 546 Q 220 512 468 538 T 980 542 Q 1280 524 1628 536"
                  fill="none"
                  stroke="#174D3A"
                  strokeWidth="1.4"
                  opacity="0.46"
                />
                <path
                  d="M -28 578 Q 340 556 740 574 T 1628 564"
                  fill="none"
                  stroke={`url(#goldBeam-${uid})`}
                  strokeWidth="1.7"
                 
                  opacity="0.88"
                />
                <path
                  d="M 480 594 Q 800 578 1120 596"
                  fill="none"
                  stroke="#1B2D6B"
                  strokeWidth="1.0"
                  strokeDasharray="5 8"
                  opacity="0.34"
                />
              </>
            )}
          </g>

          {/* LAYER 3B — Intergenerational Banyan Storytelling Circle & Sunlit Neem Grove (About Exclusive) */}
          <g className="akath-parallax-trees" strokeLinecap="round">
            {isMobile ? (
              <>
                {/* Mathematically Centered About Banyan Storytelling Circle (x=66..364, center=215) */}
                <AboutBanyanStorytellerScene
                  transform="translate(66, 494) scale(1.0)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
              </>
            ) : isTablet ? (
              <>
                <AboutBanyanStorytellerScene
                  transform="translate(148, 434) scale(1.08)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <EngravedNeemTree
                  transform="translate(866, 474) scale(0.92)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
              </>
            ) : (
              <>
                <AboutBanyanStorytellerScene
                  transform="translate(114, 396) scale(1.22)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <EngravedNeemTree
                  transform="translate(1332, 436) scale(1.10)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
                <EngravedBanyanTree
                  transform="translate(1432, 448) scale(0.84)"
                  surfaceHex={surfaceHex}
                  uid={uid}
                />
              </>
            )}
          </g>

          {/* LAYER 3C — Lightweight Floating Banyan Leaves Drifting Slowly Across the About Section */}
          <AboutDriftingBanyanLeaves tier={tier} />

        </svg>

        {/* Subtle Animated Gilded Foil Sheen Gliding Across the Plate (Desktop Only) */}
        <div
          className="hidden lg:block akath-gold-sheen-sweep absolute inset-y-0 -inset-x-[24%] pointer-events-none"
          style={{
            background:
              'linear-gradient(112deg, rgba(255, 253, 245, 0) 28%, rgba(255, 217, 102, 0.14) 45%, rgba(255, 250, 224, 0.25) 50%, rgba(255, 217, 102, 0.12) 56%, rgba(255, 253, 245, 0) 72%)',
          }}
        />

        {/* Balanced Center Readability Veil — Keeps Unboxed About Prose Crisp While Banyan Storytellers Shine */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 52% 48% at 50% 38%, ${surfaceHex}90 0%, ${surfaceHex}36 58%, ${surfaceHex}00 100%)`,
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
});
