import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/translations';

/**
 * StorybookFooterLandscape — Seamless Side-Scrolling 16-Bit Pixel-Art Animated
 * Footer Stage with Sprite-Based Tortoise Animation & Multi-Layer Parallax
 *
 * Merged directly into the bottom stage of the Akath Prakashan footer so the
 * monumental "अकथ प्रकाशन" wordmark sits in the twilight sky background behind
 * the drifting 16-bit pixel clouds, Sahyadri hills, banyan tree, village reading
 * corner ("वाचन हाच प्रवास"), and sprite-animated walking tortoise.
 *
 * Responsive & Multi-Device Architecture (Mobile / Tablet / Desktop):
 * - Tortoise protagonist is centered at x=650 in the 1440px coordinate space
 *   so `preserveAspectRatio="xMidYMax slice"` keeps the tortoise and the scrolling
 *   landmarks (Banyan tree, Reading corner bookshelf, "वाचन हाच प्रवास" signboard)
 *   prominently framed on 360px mobile, 768px tablet, and 1440px+ desktop viewports.
 * - All 5 parallax layers use 1442px overlapping tiles with zero vertical border
 *   strokes at tile boundaries (x=0 / x=1440), guaranteeing seamless looping
 *   with zero visual seams or subpixel artifacts.
 * - Tortoise legs, body, books, head, and tail use integer-pixel stepped keyframes
 *   (`steps(1, end)` / `steps(2, end)` / `steps(4, end)`) with zero diagonal
 *   rotations, preserving razor-sharp 16-bit pixel-art geometry on every frame.
 *
 * Palette:
 * - Warm Parchment: #F5EBDD
 * - Muted Olive: #78845A
 * - Forest Green: #354B37
 * - Earth Brown: #997451
 * - Terracotta: #B86F50
 * - Soft Golden Yellow: #E8BC69
 * - Pixel Ink: #302C25
 */
export const StorybookFooterLandscape: React.FC = React.memo(() => {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isBlinkingNow, setIsBlinkingNow] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setIsInViewport(entry.isIntersecting);
        }
      },
      { rootMargin: '140px 0px 140px 0px', threshold: 0.01 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleTortoiseInteract = () => {
    setIsBlinkingNow(true);
    window.setTimeout(() => setIsBlinkingNow(false), 900);
  };

  const isAnimationPaused = !isInViewport || isUserPaused;

  return (
    <div
      ref={containerRef}
      data-testid="storybook-footer-landscape"
      data-render-mode="16bit-pixel-art-parallax"
      data-responsive-modes="mobile-tablet-desktop"
      data-viewport-active={isInViewport ? 'true' : 'false'}
      data-animation-paused={isAnimationPaused ? 'true' : 'false'}
      role="region"
      aria-label={
        lang === 'mr'
          ? 'कासवाचा १६-बिट पिक्सेल साहित्यिक प्रवास — वाचन हाच प्रवास'
          : "The Tortoise's 16-Bit Pixel-Art Literary Journey — Animated Marathi Countryside"
      }
      style={{ contain: 'layout style paint' }}
      className={`akath-storybook-landscape akath-pixel-art-stage relative w-full overflow-hidden select-none pointer-events-none ${
        isAnimationPaused ? 'is-paused' : ''
      }`}
    >
      {/* Subtle 16-Bit Pixel Pause/Resume Control (Bottom-Right Corner — Safe on Mobile/Tablet/Desktop) */}
      <div className="pointer-events-none absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-5 z-30 flex items-center gap-2">
        <button
          type="button"
          data-testid="storybook-footer-motion-toggle"
          aria-pressed={isUserPaused}
          onClick={() => setIsUserPaused((prev) => !prev)}
          title={
            isUserPaused
              ? lang === 'mr'
                ? 'अ‍ॅनिमेशन सुरू करा'
                : 'Resume pixel animation'
              : lang === 'mr'
              ? 'अ‍ॅनिमेशन थांबवा'
              : 'Pause pixel animation'
          }
          className="pointer-events-auto px-2.5 py-1 rounded-md border border-[#E8BC69]/50 bg-[#302C25]/85 hover:bg-[#302C25] text-[#F5EBDD] font-mono text-[9.5px] sm:text-[10px] tracking-[0.08em] transition-colors cursor-pointer"
        >
          {isUserPaused
            ? lang === 'mr'
              ? '▶ सुरू ठेवा'
              : '▶ Resume'
            : lang === 'mr'
            ? '❚❚ थांबवा'
            : '❚❚ Pause'}
        </button>
      </div>

      {/* =====================================================================
          16-BIT PIXEL-ART SIDE-SCROLLING PARALLAX SVG (shape-rendering="crispEdges")
          Upper sky (y=0..136) is transparent so the monumental "अकथ प्रकाशन"
          wordmark in Footer.tsx merges directly into the twilight sky behind
          the drifting pixel clouds and Sahyadri mountains!
          ===================================================================== */}
      <svg
        data-testid="storybook-landscape-svg"
        viewBox="0 0 1440 300"
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        className="akath-pixel-svg block w-full h-[215px] sm:h-[255px] lg:h-[300px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 16-Bit Bayer Checkerboard Dither Patterns for Horizon Glow */}
          <pattern
            id="pixelDitherSkyHorizonA"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="4" height="4" fill="#E8BC69" fillOpacity="0.22" />
            <rect x="4" y="4" width="4" height="4" fill="#B86F50" fillOpacity="0.22" />
          </pattern>

          <pattern
            id="pixelDitherSkyHorizonB"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="8" height="8" fill="#E8BC69" fillOpacity="0.28" />
            <rect x="0" y="0" width="4" height="4" fill="#F5EBDD" fillOpacity="0.48" />
            <rect x="4" y="4" width="4" height="4" fill="#F5EBDD" fillOpacity="0.48" />
          </pattern>

          <pattern
            id="pixelDitherPathSoil"
            width="16"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <rect width="16" height="8" fill="#997451" />
            <rect x="0" y="0" width="4" height="4" fill="#B86F50" />
            <rect x="8" y="4" width="4" height="4" fill="#7A5A3C" />
            <rect x="12" y="0" width="2" height="2" fill="#E8BC69" fillOpacity="0.65" />
          </pattern>

          {/* Reusable 16-Bit Pixel Grass Tuft */}
          <g id="pxGrassTuft">
            <rect x="0" y="-8" width="2" height="8" fill="#354B37" />
            <rect x="-2" y="-12" width="2" height="4" fill="#354B37" />
            <rect x="3" y="-14" width="2" height="14" fill="#78845A" />
            <rect x="5" y="-16" width="2" height="4" fill="#E8BC69" />
            <rect x="7" y="-10" width="2" height="10" fill="#354B37" />
            <rect x="9" y="-12" width="2" height="4" fill="#78845A" />
          </g>

          {/* Reusable 16-Bit Pixel Wildflower Cluster */}
          <g id="pxWildflower">
            <rect x="0" y="-12" width="2" height="12" fill="#354B37" />
            <rect x="6" y="-14" width="2" height="14" fill="#354B37" />
            <rect x="-4" y="-8" width="2" height="8" fill="#78845A" />
            <rect x="-2" y="-16" width="6" height="6" fill="#E8BC69" />
            <rect x="0" y="-14" width="2" height="2" fill="#B86F50" />
            <rect x="4" y="-18" width="6" height="6" fill="#B86F50" />
            <rect x="6" y="-16" width="2" height="2" fill="#F5EBDD" />
          </g>

          {/* Reusable 16-Bit Pixel Cloud A */}
          <g id="pxCloudA">
            <rect x="16" y="0" width="36" height="4" fill="#302C25" fillOpacity="0.7" />
            <rect x="8" y="4" width="56" height="4" fill="#302C25" fillOpacity="0.7" />
            <rect x="0" y="8" width="76" height="12" fill="#302C25" fillOpacity="0.7" />
            <rect x="16" y="4" width="36" height="4" fill="#F5EBDD" />
            <rect x="8" y="8" width="56" height="8" fill="#F5EBDD" />
            <rect x="4" y="12" width="68" height="4" fill="#F5EBDD" />
            <rect x="4" y="16" width="68" height="4" fill="#E8BC69" />
          </g>

          {/* Reusable 16-Bit Pixel Cloud B */}
          <g id="pxCloudB">
            <rect x="12" y="0" width="28" height="4" fill="#302C25" fillOpacity="0.7" />
            <rect x="4" y="4" width="48" height="12" fill="#302C25" fillOpacity="0.7" />
            <rect x="12" y="4" width="28" height="4" fill="#F5EBDD" />
            <rect x="8" y="8" width="40" height="4" fill="#F5EBDD" />
            <rect x="8" y="12" width="40" height="4" fill="#E8BC69" />
          </g>

          {/* =================================================================
              PARALLAX TILE 1: 16-BIT PIXEL CLOUDS & BIRDS (1440px repeatable)
              Drifts across the monumental "अकथ प्रकाशन" sky wordmark
              ================================================================= */}
          <g id="sbCloudsTile">
            <use href="#pxCloudA" x="72" y="34" />
            <use href="#pxCloudB" x="340" y="64" />
            <use href="#pxCloudA" x="590" y="24" />
            <use href="#pxCloudB" x="860" y="54" />
            <use href="#pxCloudA" x="1160" y="38" />

            {/* 16-Bit Pixel Birds */}
            <g transform="translate(250, 48)" fill="#E8BC69">
              <rect x="0" y="2" width="4" height="2" />
              <rect x="4" y="4" width="4" height="2" />
              <rect x="8" y="2" width="4" height="2" />
              <rect x="18" y="0" width="4" height="2" />
              <rect x="22" y="2" width="4" height="2" />
              <rect x="26" y="0" width="4" height="2" />
            </g>
            <g transform="translate(760, 42)" fill="#E8BC69">
              <rect x="0" y="2" width="4" height="2" />
              <rect x="4" y="4" width="4" height="2" />
              <rect x="8" y="2" width="4" height="2" />
            </g>
          </g>

          {/* =================================================================
              PARALLAX TILE 2: FAR SAHYADRI FORTS & DECCAN PLATEAU PEAKS
              (1442px overlap — zero vertical boundary stroke -> zero seam!)
              ================================================================= */}
          <g id="sbFarPeaksTile">
            <path
              d="M0 184 H56 V176 H112 V164 H196 V156 H284 V168 H360 V180 H456 V168 H540 V152 H644 V164 H728 V176 H824 V160 H920 V148 H1028 V160 H1120 V172 H1224 V164 H1320 V176 H1442 V240 H0 Z"
              fill="#3A4B6E"
              fillOpacity="0.72"
            />
            {/* Sunlit Pixel Rim along Distant Sahyadri Plateaus */}
            <rect x="196" y="156" width="88" height="4" fill="#E8BC69" fillOpacity="0.45" />
            <rect x="540" y="152" width="104" height="4" fill="#E8BC69" fillOpacity="0.45" />
            <rect x="920" y="148" width="108" height="4" fill="#E8BC69" fillOpacity="0.45" />

            {/* 16-Bit Sahyadri Hill-Fort Bastions (गड-किल्ले तटबंदी — Flag-Free Stonework) */}
            <g transform="translate(566, 136)">
              <rect x="0" y="6" width="44" height="10" fill="#302C25" fillOpacity="0.82" />
              <rect x="0" y="2" width="6" height="4" fill="#302C25" fillOpacity="0.82" />
              <rect x="10" y="2" width="6" height="4" fill="#302C25" fillOpacity="0.82" />
              <rect x="20" y="2" width="6" height="4" fill="#302C25" fillOpacity="0.82" />
              <rect x="30" y="2" width="6" height="4" fill="#302C25" fillOpacity="0.82" />
              <rect x="38" y="2" width="6" height="4" fill="#302C25" fillOpacity="0.82" />
              <rect x="20" y="10" width="4" height="4" fill="#E8BC69" fillOpacity="0.85" />
            </g>

            {/* Second Distant Fort Watchtower at x=956 */}
            <g transform="translate(956, 134)">
              <rect x="0" y="4" width="32" height="10" fill="#302C25" fillOpacity="0.78" />
              <rect x="0" y="0" width="6" height="4" fill="#302C25" fillOpacity="0.78" />
              <rect x="12" y="0" width="6" height="4" fill="#302C25" fillOpacity="0.78" />
              <rect x="24" y="0" width="8" height="4" fill="#302C25" fillOpacity="0.78" />
              <rect x="14" y="6" width="4" height="4" fill="#E8BC69" />
            </g>
          </g>

          {/* =================================================================
              PARALLAX TILE 3: 16-BIT STEPPED SAHYADRI HILLS & DISTANT VILLAGE
              HOUSES (1442px overlap — identical y=208 at x=0 and x=1440)
              ================================================================= */}
          <g id="sbBackgroundHillsTile">
            {/* Far Sahyadri Stepped Pixel Ridge (#78845A) */}
            <path
              d="M0 208 H64 V196 H128 V184 H216 V176 H308 V188 H384 V200 H472 V188 H556 V172 H664 V180 H748 V192 H840 V204 H932 V188 H1024 V176 H1132 V188 H1220 V200 H1328 V192 H1442 V256 H0 Z"
              fill="#78845A"
            />
            {/* Golden Pixel Ridge Highlights (#E8BC69) */}
            <rect x="216" y="176" width="92" height="4" fill="#E8BC69" fillOpacity="0.7" />
            <rect x="556" y="172" width="108" height="4" fill="#E8BC69" fillOpacity="0.7" />
            <rect x="1024" y="176" width="108" height="4" fill="#E8BC69" fillOpacity="0.7" />

            {/* Mid-Distance Stepped Sahyadri Foothills (#354B37) */}
            <path
              d="M0 224 H88 V216 H184 V208 H312 V216 H408 V224 H512 V212 H624 V204 H744 V212 H856 V220 H968 V208 H1096 V200 H1208 V212 H1320 V220 H1442 V264 H0 Z"
              fill="#354B37"
            />

            {/* Distant 16-Bit Marathi Village Houses Cluster 1 (कौलारू घरे + तुळशी वृंदावन) */}
            <g transform="translate(216, 178)">
              {/* Animated Pixel Chimney Smoke */}
              <g className="storybook-chimney-smoke" fill="#F5EBDD" fillOpacity="0.65">
                <rect x="28" y="-6" width="4" height="4" />
                <rect x="32" y="-12" width="4" height="4" />
                <rect x="30" y="-18" width="6" height="4" fillOpacity="0.4" />
              </g>
              <rect x="26" y="0" width="6" height="6" fill="#302C25" />
              <rect x="2" y="12" width="32" height="20" fill="#F5EBDD" />
              <rect x="0" y="10" width="36" height="2" fill="#302C25" />
              <path d="M-4 12 H4 V8 H12 V4 H24 V8 H32 V12 H40 V14 H-4 Z" fill="#B86F50" />
              <rect x="6" y="18" width="6" height="6" fill="#E8BC69" className="storybook-lantern-glow" />
              <rect x="24" y="18" width="6" height="6" fill="#E8BC69" className="storybook-lantern-glow" />
              <rect x="15" y="20" width="6" height="12" fill="#997451" />

              <rect x="42" y="16" width="26" height="16" fill="#F5EBDD" />
              <path d="M38 16 H46 V12 H52 V8 H60 V12 H66 V16 H72 V18 H38 Z" fill="#997451" />
              <rect x="52" y="20" width="6" height="6" fill="#E8BC69" className="storybook-lantern-glow" />

              {/* Courtyard Tulsi Vrindavan (तुळशी वृंदावन) */}
              <rect x="76" y="22" width="8" height="10" fill="#F5EBDD" />
              <rect x="74" y="20" width="12" height="2" fill="#B86F50" />
              <rect x="78" y="14" width="4" height="6" fill="#354B37" />
              <rect x="84" y="24" width="2" height="2" fill="#E8BC69" className="storybook-lantern-glow" />
            </g>

            {/* Distant 16-Bit Marathi Village Houses Cluster 2 (Near Center-Right) */}
            <g transform="translate(576, 174)">
              <g className="storybook-chimney-smoke" fill="#F5EBDD" fillOpacity="0.65">
                <rect x="10" y="-6" width="4" height="4" />
                <rect x="8" y="-12" width="6" height="4" fillOpacity="0.45" />
              </g>
              <rect x="8" y="0" width="6" height="6" fill="#302C25" />
              <rect x="2" y="12" width="32" height="20" fill="#F5EBDD" />
              <path d="M-4 12 H4 V8 H12 V4 H24 V8 H32 V12 H40 V14 H-4 Z" fill="#B86F50" />
              <rect x="8" y="18" width="6" height="6" fill="#E8BC69" className="storybook-lantern-glow" />
              <rect x="20" y="20" width="6" height="12" fill="#997451" />
            </g>

            {/* Distant 16-Bit Marathi Village Houses Cluster 3 */}
            <g transform="translate(1044, 178)">
              <rect x="2" y="12" width="34" height="20" fill="#F5EBDD" />
              <path d="M-4 12 H4 V8 H12 V4 H26 V8 H34 V12 H42 V14 H-4 Z" fill="#B86F50" />
              <rect x="8" y="18" width="6" height="6" fill="#E8BC69" className="storybook-lantern-glow" />
              <rect x="22" y="18" width="6" height="6" fill="#E8BC69" className="storybook-lantern-glow" />
              <rect x="15" y="22" width="6" height="10" fill="#997451" />
            </g>
          </g>

          {/* =================================================================
              PARALLAX TILE 4: 16-BIT MIDDLE GROUND — PIXEL BANYAN TREE,
              VILLAGE READING CORNER, BOOK STACK & SIGNBOARD "वाचन हाच प्रवास"
              (1442px overlap — zero vertical strokes at x=0/1440)
              ================================================================= */}
          <g id="sbMidgroundTile">
            {/* Stepped Olive Midground Meadow Terrace (#78845A) */}
            <path
              d="M0 240 H180 V236 H440 V240 H780 V236 H1100 V240 H1442 V268 H0 Z"
              fill="#78845A"
            />
            <rect x="0" y="240" width="1442" height="4" fill="#302C25" fillOpacity="0.24" />

            {/* ---------------------------------------------------------------
                1. 16-BIT PIXEL BANYAN TREE (प्राचीन वटवृक्ष) & STACK OF BOOKS
                --------------------------------------------------------------- */}
            <g transform="translate(140, 90)" className="storybook-banyan-tree">
              {/* Pixel Aerial Prop Roots (पारंब्या) */}
              <g className="storybook-banyan-roots" fill="#997451">
                <rect x="32" y="72" width="4" height="78" />
                <rect x="44" y="76" width="3" height="74" fill="#7A5A3C" />
                <rect x="144" y="72" width="4" height="78" />
                <rect x="132" y="78" width="3" height="72" fill="#7A5A3C" />
              </g>

              {/* Hanging Warm Pixel Reading Lanterns (कंदील) Under the Banyan Branches */}
              <g className="storybook-hanging-lantern" transform="translate(50, 76)">
                <rect x="3" y="0" width="2" height="12" fill="#302C25" />
                <rect x="0" y="12" width="8" height="10" fill="#302C25" />
                <rect x="2" y="14" width="4" height="6" fill="#E8BC69" className="storybook-lantern-glow" />
                <rect x="-4" y="10" width="16" height="14" fill="#E8BC69" fillOpacity="0.22" className="storybook-lantern-glow" />
              </g>
              <g className="storybook-hanging-lantern" transform="translate(136, 78)">
                <rect x="3" y="0" width="2" height="10" fill="#302C25" />
                <rect x="0" y="10" width="8" height="10" fill="#302C25" />
                <rect x="2" y="12" width="4" height="6" fill="#E8BC69" className="storybook-lantern-glow" />
                <rect x="-4" y="8" width="16" height="14" fill="#E8BC69" fillOpacity="0.22" className="storybook-lantern-glow" />
              </g>

              {/* Stepped Pixel Banyan Trunk & Branches (#997451 + #302C25) */}
              <path
                d="M66 150 V110 H58 V90 H38 V82 H62 V74 H74 V64 H110 V74 H126 V82 H150 V90 H126 V110 H118 V150 Z"
                fill="#302C25"
              />
              <path
                d="M68 150 V110 H60 V90 H40 V84 H64 V76 H76 V66 H108 V76 H124 V84 H148 V90 H124 V110 H116 V150 Z"
                fill="#997451"
              />
              <rect x="80" y="84" width="4" height="64" fill="#302C25" fillOpacity="0.38" />
              <rect x="96" y="78" width="4" height="70" fill="#7A5A3C" />
              <rect x="104" y="92" width="4" height="56" fill="#302C25" fillOpacity="0.38" />

              {/* Swaying 16-Bit Pixel Foliage Canopy */}
              <g className="storybook-tree-canopy-sway">
                <path
                  d="M10 78 H-2 V50 H10 V34 H26 V22 H50 V10 H78 V2 H110 V10 H138 V22 H162 V34 H178 V50 H190 V78 H170 V86 H18 V78 Z"
                  fill="#302C25"
                />
                <path
                  d="M12 76 H0 V52 H12 V36 H28 V24 H52 V12 H80 V4 H108 V12 H136 V24 H160 V36 H176 V52 H188 V76 H168 V84 H20 V76 Z"
                  fill="#354B37"
                />
                <path
                  d="M24 68 H16 V48 H32 V32 H60 V20 H128 V32 H156 V48 H172 V68 H24 Z"
                  fill="#78845A"
                />
                <rect x="64" y="12" width="60" height="8" fill="#E8BC69" />
                <rect x="36" y="28" width="32" height="8" fill="#E8BC69" />
                <rect x="120" y="28" width="32" height="8" fill="#E8BC69" />
                <rect x="44" y="48" width="8" height="8" fill="#B86F50" />
                <rect x="96" y="40" width="8" height="8" fill="#E8BC69" />
                <rect x="136" y="48" width="8" height="8" fill="#B86F50" />
              </g>

              {/* Stack of Old Pixel Books Near the Banyan Trunk */}
              <g transform="translate(120, 126)" className="storybook-tree-book-stack">
                <rect x="-2" y="14" width="36" height="10" fill="#302C25" />
                <rect x="0" y="16" width="32" height="8" fill="#B86F50" />
                <rect x="4" y="18" width="24" height="4" fill="#F5EBDD" />
                <rect x="2" y="6" width="32" height="10" fill="#302C25" />
                <rect x="4" y="8" width="28" height="8" fill="#354B37" />
                <rect x="8" y="10" width="20" height="4" fill="#F5EBDD" />
                <rect x="4" y="-2" width="28" height="10" fill="#302C25" />
                <rect x="6" y="0" width="24" height="8" fill="#E8BC69" />
                <rect x="10" y="2" width="16" height="4" fill="#F5EBDD" />
              </g>
            </g>

            {/* ---------------------------------------------------------------
                2. 16-BIT VILLAGE READING CORNER WITH WOODEN BOOKSHELF & DEEPMAL
                --------------------------------------------------------------- */}
            <g transform="translate(420, 180)" className="storybook-reading-corner">
              {/* Pixel Stone Plinth (दगडी पार) */}
              <rect x="-14" y="50" width="128" height="14" fill="#302C25" />
              <rect x="-12" y="52" width="124" height="10" fill="#997451" />
              <rect x="20" y="52" width="2" height="10" fill="#302C25" />
              <rect x="56" y="52" width="2" height="10" fill="#302C25" />
              <rect x="90" y="52" width="2" height="10" fill="#302C25" />

              {/* 16-Bit Wooden Bookshelf */}
              <rect x="-2" y="-2" width="72" height="54" fill="#302C25" />
              <rect x="0" y="0" width="68" height="52" fill="#997451" />
              {/* Stepped Pixel Roof over Bookshelf */}
              <path
                d="M-10 -2 H2 V-8 H14 V-14 H54 V-8 H66 V-2 H78 V4 H-10 Z"
                fill="#302C25"
              />
              <path
                d="M-8 0 H4 V-6 H16 V-12 H52 V-6 H64 V0 H76 V2 H-8 Z"
                fill="#B86F50"
              />
              {/* Shelf Recesses */}
              <rect x="6" y="6" width="56" height="18" fill="#302C25" />
              <rect x="6" y="28" width="56" height="18" fill="#302C25" />

              {/* Top Row Pixel Books */}
              <rect x="8" y="8" width="6" height="16" fill="#B86F50" />
              <rect x="16" y="8" width="6" height="16" fill="#E8BC69" />
              <rect x="24" y="10" width="6" height="14" fill="#F5EBDD" />
              <rect x="32" y="8" width="8" height="16" fill="#78845A" />
              <rect x="42" y="8" width="6" height="16" fill="#B86F50" />
              <rect x="50" y="10" width="10" height="14" fill="#E8BC69" />

              {/* Bottom Row Pixel Books */}
              <rect x="8" y="30" width="8" height="16" fill="#E8BC69" />
              <rect x="18" y="32" width="6" height="14" fill="#B86F50" />
              <rect x="26" y="30" width="6" height="16" fill="#F5EBDD" />
              <rect x="34" y="30" width="8" height="16" fill="#78845A" />
              <rect x="44" y="32" width="6" height="14" fill="#B86F50" />
              <rect x="52" y="30" width="8" height="16" fill="#E8BC69" />

              {/* Reading Stool & Open Book */}
              <rect x="72" y="36" width="20" height="16" fill="#302C25" />
              <rect x="74" y="38" width="16" height="14" fill="#B86F50" />
              <rect x="76" y="34" width="12" height="4" fill="#F5EBDD" />

              {/* Traditional Marathi Stone Lamp Pillar (दीपमाळ) with Glowing Lamps */}
              <g transform="translate(98, 4)">
                <rect x="2" y="6" width="8" height="46" fill="#302C25" />
                <rect x="4" y="8" width="4" height="42" fill="#7A5A3C" />
                <rect x="0" y="16" width="12" height="2" fill="#302C25" />
                <rect x="0" y="28" width="12" height="2" fill="#302C25" />
                <rect x="4" y="2" width="4" height="4" fill="#E8BC69" className="storybook-lantern-glow" />
                <rect x="-2" y="12" width="4" height="4" fill="#E8BC69" className="storybook-lantern-glow" />
                <rect x="10" y="12" width="4" height="4" fill="#E8BC69" className="storybook-lantern-glow" />
                <rect x="-2" y="24" width="4" height="4" fill="#E8BC69" className="storybook-lantern-glow" />
                <rect x="10" y="24" width="4" height="4" fill="#E8BC69" className="storybook-lantern-glow" />
              </g>
            </g>

            {/* ---------------------------------------------------------------
                3. 16-BIT WOODEN SIGNBOARD SAYING "वाचन हाच प्रवास"
                --------------------------------------------------------------- */}
            <g
              transform="translate(820, 174)"
              data-testid="storybook-marathi-signboard"
              className="storybook-wooden-signboard"
            >
              {/* Pixel Timber Post */}
              <rect x="56" y="28" width="14" height="40" fill="#302C25" />
              <rect x="58" y="28" width="10" height="38" fill="#997451" />
              {/* Stepped Pixel Signboard Plaque */}
              <path
                d="M-2 2 H120 V6 H126 V10 H130 V22 H126 V26 H120 V30 H-2 Z"
                fill="#302C25"
              />
              <path
                d="M0 4 H118 V8 H124 V12 H128 V20 H124 V24 H118 V28 H0 Z"
                fill="#F5EBDD"
              />
              <rect x="4" y="8" width="110" height="16" fill="#E8BC69" fillOpacity="0.34" />
              <rect x="61" y="6" width="4" height="4" fill="#302C25" />
              <rect x="61" y="22" width="4" height="4" fill="#302C25" />

              {/* Marathi Inscription: "वाचन हाच प्रवास" */}
              <text
                x="59"
                y="20.5"
                textAnchor="middle"
                fill="#302C25"
                fontSize="13.5"
                fontWeight="700"
                fontFamily="Noto Serif Devanagari, Tiro Devanagari Marathi, serif"
              >
                वाचन हाच प्रवास
              </text>

              <use href="#pxWildflower" x="48" y="68" />
              <use href="#pxGrassTuft" x="72" y="68" />
            </g>

            {/* ---------------------------------------------------------------
                4. EASTERN 16-BIT PIXEL TREE
                --------------------------------------------------------------- */}
            <g transform="translate(1190, 128)" className="storybook-tree-canopy-sway">
              <rect x="34" y="60" width="18" height="52" fill="#302C25" />
              <rect x="36" y="60" width="14" height="52" fill="#997451" />
              <path
                d="M6 66 H-2 V42 H10 V26 H26 V14 H58 V26 H74 V42 H86 V66 Z"
                fill="#302C25"
              />
              <path
                d="M8 64 H0 V44 H12 V28 H28 V16 H56 V28 H72 V44 H84 V64 Z"
                fill="#354B37"
              />
              <rect x="16" y="32" width="52" height="24" fill="#78845A" />
              <rect x="28" y="20" width="28" height="8" fill="#E8BC69" />
              <rect x="24" y="40" width="6" height="6" fill="#B86F50" />
              <rect x="54" y="42" width="6" height="6" fill="#E8BC69" />
            </g>
          </g>

          {/* =================================================================
              PARALLAX TILE 5: 16-BIT FOREGROUND WINDING PATH, PIXEL GRASS,
              WILDFLOWERS, PEBBLES & FALLEN LEAVES (1442px overlap)
              ================================================================= */}
          <g id="sbForegroundPathTile">
            {/* Upper Forest Grass Border (#354B37) */}
            <rect x="0" y="250" width="1442" height="2" fill="#302C25" />
            <rect x="0" y="252" width="1442" height="8" fill="#354B37" />

            {/* 16-Bit Pixel Earth Village Path (#997451 + Dither Texture) */}
            <rect x="0" y="260" width="1442" height="26" fill="url(#pixelDitherPathSoil)" />
            <rect x="0" y="260" width="1442" height="4" fill="#E8BC69" fillOpacity="0.58" />
            <rect x="0" y="282" width="1442" height="4" fill="#7A5A3C" />

            {/* Pixel Stepping Stones & Fallen Leaves along the Path */}
            <g fill="#E8BC69">
              <rect x="84" y="268" width="10" height="4" />
              <rect x="216" y="274" width="8" height="4" fill="#B86F50" />
              <rect x="372" y="266" width="12" height="4" />
              <rect x="516" y="272" width="8" height="4" fill="#F5EBDD" />
              <rect x="676" y="268" width="10" height="4" fill="#B86F50" />
              <rect x="836" y="274" width="10" height="4" />
              <rect x="1008" y="267" width="10" height="4" fill="#B86F50" />
              <rect x="1172" y="273" width="8" height="4" fill="#F5EBDD" />
              <rect x="1328" y="269" width="10" height="4" />
            </g>

            {/* 16-Bit Village Path Milestone Stone (मैलाचा दगड) */}
            <g transform="translate(996, 236)">
              <path d="M0 24 V8 H4 V4 H16 V8 H20 V24 Z" fill="#302C25" />
              <path d="M2 22 V10 H6 V6 H14 V10 H18 V22 Z" fill="#F5EBDD" />
              <rect x="2" y="6" width="16" height="6" fill="#E8BC69" />
              <rect x="6" y="14" width="8" height="2" fill="#302C25" />
              <rect x="8" y="18" width="4" height="2" fill="#B86F50" />
            </g>

            {/* Bottom Dark Forest Base Anchoring the Footer */}
            <rect x="0" y="286" width="1442" height="4" fill="#354B37" />
            <rect x="0" y="290" width="1442" height="10" fill="#302C25" />

            {/* Swaying 16-Bit Pixel Grass Tufts & Wildflowers */}
            <g className="storybook-grass-sway-a">
              <use href="#pxGrassTuft" x="48" y="258" />
              <use href="#pxWildflower" x="156" y="258" />
              <use href="#pxGrassTuft" x="284" y="258" />
              <use href="#pxWildflower" x="468" y="258" />
              <use href="#pxGrassTuft" x="612" y="258" />
              <use href="#pxWildflower" x="758" y="258" />
              <use href="#pxGrassTuft" x="924" y="258" />
              <use href="#pxWildflower" x="1112" y="258" />
              <use href="#pxGrassTuft" x="1296" y="258" />
            </g>

            <g className="storybook-grass-sway-b">
              <use href="#pxWildflower" x="84" y="288" />
              <use href="#pxGrassTuft" x="216" y="288" />
              <use href="#pxGrassTuft" x="384" y="288" />
              <use href="#pxWildflower" x="548" y="288" />
              <use href="#pxGrassTuft" x="724" y="288" />
              <use href="#pxWildflower" x="868" y="288" />
              <use href="#pxGrassTuft" x="1032" y="288" />
              <use href="#pxWildflower" x="1212" y="288" />
              <use href="#pxGrassTuft" x="1380" y="288" />
            </g>
          </g>
        </defs>

        {/* ===================================================================
            LAYER 0: CLEAN TRANSPARENT UPPER SKY
            Allows the twilight gradient and "अकथ प्रकाशन" wordmark in Footer.tsx
            to sit cleanly behind the Sahyadri hills without washed-out dither bands!
            =================================================================== */}

        {/* Multi-Point Twinkling Celestial Stars in the Horizon Twilight Sky */}
        <g className="storybook-star-twinkle-a">
          <g transform="translate(116, 18)">
            <rect x="-5" y="-1" width="10" height="2" fill="#FFD966" fillOpacity="0.45" />
            <rect x="-1" y="-5" width="2" height="10" fill="#FFD966" fillOpacity="0.45" />
            <rect x="-2" y="-2" width="4" height="4" fill="#FFFDF7" />
          </g>
          <g transform="translate(528, 14)">
            <rect x="-6" y="-1" width="12" height="2" fill="#E8BC69" fillOpacity="0.45" />
            <rect x="-1" y="-6" width="2" height="12" fill="#E8BC69" fillOpacity="0.45" />
            <rect x="-2" y="-2" width="4" height="4" fill="#FFD966" />
          </g>
          <g transform="translate(892, 16)">
            <rect x="-5" y="-1" width="10" height="2" fill="#FFD966" fillOpacity="0.45" />
            <rect x="-1" y="-5" width="2" height="10" fill="#FFD966" fillOpacity="0.45" />
            <rect x="-2" y="-2" width="4" height="4" fill="#FFFDF7" />
          </g>
          <g transform="translate(1340, 14)">
            <rect x="-5" y="-1" width="10" height="2" fill="#E8BC69" fillOpacity="0.45" />
            <rect x="-1" y="-5" width="2" height="10" fill="#E8BC69" fillOpacity="0.45" />
            <rect x="-2" y="-2" width="4" height="4" fill="#FFD966" />
          </g>
        </g>

        <g className="storybook-star-twinkle-b">
          <g transform="translate(312, 26)">
            <rect x="-4" y="-1" width="8" height="2" fill="#F5EBDD" fillOpacity="0.45" />
            <rect x="-1" y="-4" width="2" height="8" fill="#F5EBDD" fillOpacity="0.45" />
            <rect x="-1" y="-1" width="2" height="2" fill="#FFD966" />
          </g>
          <g transform="translate(684, 22)">
            <rect x="-5" y="-1" width="10" height="2" fill="#FFD966" fillOpacity="0.4" />
            <rect x="-1" y="-5" width="2" height="10" fill="#FFD966" fillOpacity="0.4" />
            <rect x="-2" y="-2" width="4" height="4" fill="#F5EBDD" />
          </g>
          <g transform="translate(1188, 22)">
            <rect x="-4" y="-1" width="8" height="2" fill="#F5EBDD" fillOpacity="0.45" />
            <rect x="-1" y="-4" width="2" height="8" fill="#F5EBDD" fillOpacity="0.45" />
            <rect x="-1" y="-1" width="2" height="2" fill="#FFD966" />
          </g>
        </g>

        {/* 16-Bit Stepped Pixel Golden Sun (#E8BC69 & #B86F50) */}
        <g
          data-testid="storybook-golden-sun"
          className="storybook-sun-group"
          transform="translate(1040, 108)"
        >
          <g className="storybook-sun-halo" fill="#E8BC69" fillOpacity="0.24">
            <rect x="-36" y="-20" width="72" height="40" />
            <rect x="-20" y="-36" width="40" height="72" />
            <rect x="-28" y="-28" width="56" height="56" />
          </g>
          <rect x="-20" y="-12" width="40" height="24" fill="#B86F50" />
          <rect x="-12" y="-20" width="24" height="40" fill="#B86F50" />
          <rect x="-16" y="-16" width="32" height="32" fill="#E8BC69" />
          <rect x="-8" y="-8" width="16" height="16" fill="#F5EBDD" />
        </g>

        {/* ===================================================================
            LAYER 1: FAR SAHYADRI PEAKS (120s Seamless Loop)
            =================================================================== */}
        <g
          data-testid="storybook-layer-far-peaks"
          className="storybook-layer-far-peaks"
        >
          <use href="#sbFarPeaksTile" x="0" y="0" />
          <use href="#sbFarPeaksTile" x="1440" y="0" />
        </g>

        {/* ===================================================================
            LAYER 2: 16-BIT DRIFTING PIXEL CLOUDS (88s Seamless Loop)
            =================================================================== */}
        <g
          data-testid="storybook-layer-clouds"
          className="storybook-layer-clouds"
        >
          <use href="#sbCloudsTile" x="0" y="0" />
          <use href="#sbCloudsTile" x="1440" y="0" />
        </g>

        {/* ===================================================================
            LAYER 3: 16-BIT STEPPED SAHYADRI HILLS & VILLAGE HOUSES (56s Loop)
            =================================================================== */}
        <g
          data-testid="storybook-layer-hills"
          className="storybook-layer-hills"
        >
          <use href="#sbBackgroundHillsTile" x="0" y="0" />
          <use href="#sbBackgroundHillsTile" x="1440" y="0" />
        </g>

        {/* ===================================================================
            LAYER 4: 16-BIT MIDDLE GROUND — BANYAN TREE, READING CORNER,
            BOOK STACK & WOODEN SIGNBOARD "वाचन हाच प्रवास" (28s Loop)
            =================================================================== */}
        <g
          data-testid="storybook-layer-midground"
          className="storybook-layer-midground"
        >
          <use href="#sbMidgroundTile" x="0" y="0" />
          <use href="#sbMidgroundTile" x="1440" y="0" />
        </g>

        {/* ===================================================================
            LAYER 5: 16-BIT FOREGROUND WINDING PATH, GRASS & WILDFLOWERS (14s Loop)
            =================================================================== */}
        <g
          data-testid="storybook-layer-foreground"
          className="storybook-layer-foreground"
        >
          <use href="#sbForegroundPathTile" x="0" y="0" />
          <use href="#sbForegroundPathTile" x="1440" y="0" />
        </g>

        {/* ===================================================================
            LAYER 6: 16-BIT FLOATING PIXEL LEAVES & SPRITE BUTTERFLIES
            =================================================================== */}
        <g
          data-testid="storybook-layer-atmosphere"
          className="storybook-layer-atmosphere pointer-events-none"
        >
          <g className="storybook-floating-leaf-a">
            <rect x="0" y="0" width="8" height="4" fill="#B86F50" />
            <rect x="2" y="-2" width="4" height="2" fill="#E8BC69" />
            <rect x="-2" y="2" width="4" height="2" fill="#302C25" />
          </g>

          <g className="storybook-floating-leaf-b hidden sm:inline">
            <rect x="0" y="0" width="8" height="4" fill="#E8BC69" />
            <rect x="2" y="-2" width="4" height="2" fill="#B86F50" />
          </g>

          {/* Evening Firefly Pixel Motes (काजवे) */}
          <g className="storybook-firefly-pulse" fill="#FFD966">
            <rect x="348" y="218" width="4" height="4" />
            <rect x="520" y="196" width="4" height="4" />
            <rect x="784" y="208" width="4" height="4" />
            <rect x="940" y="222" width="4" height="4" />
          </g>

          {/* Ambient 16-Bit Sprite Butterfly (Visible inside mobile/tablet/desktop center frame) */}
          <g transform="translate(560, 210)" className="storybook-butterfly-ambient">
            <g className="storybook-butterfly-wings">
              <rect x="-8" y="-6" width="6" height="6" fill="#E8BC69" />
              <rect x="2" y="-6" width="6" height="6" fill="#E8BC69" />
              <rect x="-6" y="0" width="4" height="4" fill="#B86F50" />
              <rect x="2" y="0" width="4" height="4" fill="#B86F50" />
              <rect x="-2" y="-4" width="4" height="8" fill="#302C25" />
            </g>
          </g>
        </g>

        {/* ===================================================================
            LAYER 7: 16-BIT SPRITE-BASED TORTOISE PROTAGONIST & CHOREOGRAPHED
            BUTTERFLY ENCOUNTER
            Centered at x=646 so it stays centered on Mobile (360px), Tablet (768px),
            and Desktop (1440px) viewports!
            =================================================================== */}
        <g
          data-testid="storybook-tortoise-protagonist"
          data-sprite-engine="16bit-stepped-sprite"
          className={`storybook-tortoise-stage pointer-events-auto cursor-pointer ${
            isBlinkingNow ? 'is-manual-blink' : ''
          }`}
          onClick={handleTortoiseInteract}
        >
          <g className="storybook-tortoise-journey">
            {/* Centered at x=646, y=200 on the 16-bit foreground village path */}
            <g transform="translate(646, 200)" className="storybook-tortoise-responsive-rig">
              {/* 16-Bit Stepped Pixel Ground Shadow */}
              <rect x="18" y="70" width="110" height="6" fill="#302C25" fillOpacity="0.38" />
              <rect x="10" y="72" width="126" height="2" fill="#302C25" fillOpacity="0.22" />

              {/* =============================================================
                  FAR-SIDE 16-BIT SPRITE LEGS (Back-Left & Front-Left)
                  Pure integer-pixel stepped walk keyframes (zero rotation aliasing)
                  ============================================================= */}
              <g data-testid="storybook-tortoise-legs-far">
                {/* Back-Left Pixel Leg */}
                <g className="storybook-tortoise-leg-bl">
                  <rect x="32" y="52" width="16" height="22" fill="#302C25" />
                  <rect x="34" y="54" width="12" height="18" fill="#7A5A3C" />
                  <rect x="42" y="68" width="6" height="4" fill="#F5EBDD" />
                </g>

                {/* Front-Left Pixel Leg */}
                <g className="storybook-tortoise-leg-fl">
                  <rect x="94" y="52" width="16" height="22" fill="#302C25" />
                  <rect x="96" y="54" width="12" height="18" fill="#7A5A3C" />
                  <rect x="104" y="68" width="6" height="4" fill="#F5EBDD" />
                </g>
              </g>

              {/* =============================================================
                  16-BIT TORTOISE BODY, TAIL, NECK/HEAD, SHELL & STACKED BOOKS
                  ============================================================= */}
              <g
                data-testid="storybook-tortoise-body"
                className="storybook-tortoise-body"
              >
                {/* 16-Bit Pixel Tail */}
                <g
                  data-testid="storybook-tortoise-tail"
                  className="storybook-tortoise-tail"
                >
                  <path d="M26 48 H14 V52 H8 V60 H26 Z" fill="#302C25" />
                  <path d="M26 50 H16 V54 H10 V58 H26 Z" fill="#997451" />
                </g>

                {/* ===========================================================
                    16-BIT PIXEL NECK & HEAD WITH BLINKING EYE SPRITE
                    =========================================================== */}
                <g
                  data-testid="storybook-tortoise-head"
                  className="storybook-tortoise-head"
                >
                  {/* Pixel Ink Outline (#302C25) */}
                  <path
                    d="M106 44 H116 V38 H124 V30 H150 V34 H154 V52 H146 V56 H122 V60 H106 Z"
                    fill="#302C25"
                  />
                  {/* Stepped 16-Bit Pixel Neck & Wise Head (#997451) */}
                  <path
                    d="M108 46 H118 V40 H126 V32 H148 V36 H152 V50 H144 V54 H122 V58 H108 Z"
                    fill="#997451"
                  />
                  {/* Crown Pixel Highlight (#E8BC69) */}
                  <rect x="128" y="34" width="18" height="2" fill="#E8BC69" fillOpacity="0.68" />
                  {/* Neck Pixel Folds */}
                  <rect x="116" y="48" width="2" height="6" fill="#7A5A3C" />
                  <rect x="122" y="46" width="2" height="8" fill="#7A5A3C" />
                  {/* Warm Terracotta Pixel Cheek (#B86F50) */}
                  <rect x="140" y="44" width="6" height="4" fill="#B86F50" />
                  {/* Gentle Pixel Smile */}
                  <rect x="142" y="48" width="8" height="2" fill="#302C25" />

                  {/* 16-Bit Pixel Eye & Blinking Eyelid Sprite */}
                  <g data-testid="storybook-tortoise-eye" transform="translate(136, 36)">
                    <rect x="0" y="0" width="6" height="6" fill="#302C25" />
                    <rect x="2" y="0" width="2" height="2" fill="#F5EBDD" />
                    {/* Sprite Eyelid (Closes on blink frames) */}
                    <rect
                      x="0"
                      y="0"
                      width="6"
                      height="6"
                      fill="#997451"
                      className="storybook-tortoise-eyelid"
                    />
                  </g>
                </g>

                {/* ===========================================================
                    16-BIT PIXEL BOOKS CARRIED ON SHELL + BRASS READING LANTERN
                    =========================================================== */}
                <g
                  data-testid="storybook-tortoise-books"
                  className="storybook-tortoise-books"
                >
                  {/* Pixel Saddle Cloth */}
                  <rect x="46" y="18" width="52" height="8" fill="#302C25" />
                  <rect x="48" y="20" width="48" height="6" fill="#F5EBDD" />

                  {/* Bottom Tome: Terracotta Hardcover (#B86F50) */}
                  <rect x="42" y="8" width="60" height="12" fill="#302C25" />
                  <rect x="44" y="10" width="56" height="10" fill="#B86F50" />
                  <rect x="48" y="12" width="48" height="6" fill="#F5EBDD" />
                  <rect x="52" y="14" width="40" height="2" fill="#E8BC69" />

                  {/* Middle Tome: Forest Green Hardcover (#354B37) */}
                  <rect x="48" y="-2" width="48" height="12" fill="#302C25" />
                  <rect x="50" y="0" width="44" height="10" fill="#354B37" />
                  <rect x="54" y="2" width="36" height="6" fill="#F5EBDD" />
                  {/* Pixel Bookmark Ribbon (#E8BC69) */}
                  <rect x="40" y="2" width="10" height="6" fill="#302C25" />
                  <rect x="42" y="4" width="8" height="4" fill="#E8BC69" />

                  {/* Top Open Pixel Storybook with Stepped Fluttering Pages */}
                  <g transform="translate(72, 0)">
                    <g className="storybook-top-book-wing-l">
                      <path d="M0 2 H-26 V-8 H-18 V-12 H-4 V-8 H0 Z" fill="#302C25" />
                      <path d="M0 0 H-24 V-6 H-16 V-10 H-4 V-6 H0 Z" fill="#F5EBDD" />
                    </g>
                    <g className="storybook-top-book-wing-r">
                      <path d="M0 2 H26 V-8 H18 V-12 H4 V-8 H0 Z" fill="#302C25" />
                      <path d="M0 0 H24 V-6 H16 V-10 H4 V-6 H0 Z" fill="#F5EBDD" />
                    </g>
                    <rect x="-2" y="-8" width="4" height="8" fill="#B86F50" />
                  </g>

                  {/* Warm 16-Bit Brass Lantern Perched by the Books */}
                  <g transform="translate(96, -8)">
                    <rect x="-4" y="-4" width="16" height="16" fill="#E8BC69" fillOpacity="0.26" className="storybook-lantern-glow" />
                    <rect x="0" y="0" width="8" height="10" fill="#302C25" />
                    <rect x="2" y="-2" width="4" height="2" fill="#302C25" />
                    <rect x="2" y="2" width="4" height="6" fill="#E8BC69" className="storybook-lantern-glow" />
                  </g>

                  {/* Pixel Twine Binding Strap */}
                  <rect x="70" y="0" width="4" height="24" fill="#E8BC69" />
                </g>

                {/* ===========================================================
                    16-BIT AKATH PRAKASHAN TORTOISE CARAPACE (SHELL)
                    Stepped Forest Green Dome (#354B37) + Golden Pixel Spiral
                    =========================================================== */}
                <g
                  data-testid="storybook-tortoise-shell"
                  className="storybook-tortoise-shell"
                >
                  {/* Pixel Ink Outer Carapace Outline (#302C25) */}
                  <path
                    d="M22 52 V38 H30 V28 H42 V20 H102 V28 H114 V38 H122 V52 Z"
                    fill="#302C25"
                  />
                  {/* Stepped 16-Bit Pixel Dome Carapace (#354B37) */}
                  <path
                    d="M24 52 V40 H32 V30 H44 V22 H100 V30 H112 V40 H120 V52 Z"
                    fill="#354B37"
                  />
                  {/* Upper Olive Pixel Shading (#78845A) */}
                  <rect x="46" y="24" width="52" height="6" fill="#78845A" />
                  <rect x="34" y="32" width="76" height="6" fill="#78845A" />

                  {/* Signature Akath Golden Pixel Spiral & Scute Seams (#E8BC69) */}
                  <rect x="46" y="30" width="4" height="20" fill="#E8BC69" />
                  <rect x="94" y="30" width="4" height="20" fill="#E8BC69" />
                  <rect x="50" y="28" width="44" height="4" fill="#E8BC69" />
                  {/* Left Pixel Spiral Motif */}
                  <rect x="56" y="36" width="12" height="3" fill="#E8BC69" />
                  <rect x="56" y="36" width="3" height="10" fill="#E8BC69" />
                  <rect x="56" y="44" width="10" height="3" fill="#E8BC69" />
                  <rect x="63" y="40" width="3" height="6" fill="#E8BC69" />
                  {/* Right Pixel Spiral Motif */}
                  <rect x="76" y="36" width="12" height="3" fill="#E8BC69" />
                  <rect x="85" y="36" width="3" height="10" fill="#E8BC69" />
                  <rect x="78" y="44" width="10" height="3" fill="#E8BC69" />
                  <rect x="78" y="40" width="3" height="6" fill="#E8BC69" />

                  {/* Golden-Ochre Pixel Rim Band (#E8BC69 & #B86F50) */}
                  <rect x="18" y="48" width="108" height="12" fill="#302C25" />
                  <rect x="20" y="50" width="104" height="8" fill="#E8BC69" />
                  <rect x="24" y="52" width="96" height="2" fill="#B86F50" fillOpacity="0.6" />
                  {/* Rim Pixel Notches */}
                  <rect x="38" y="50" width="2" height="8" fill="#302C25" />
                  <rect x="56" y="50" width="2" height="8" fill="#302C25" />
                  <rect x="72" y="50" width="2" height="8" fill="#302C25" />
                  <rect x="88" y="50" width="2" height="8" fill="#302C25" />
                  <rect x="106" y="50" width="2" height="8" fill="#302C25" />
                </g>
              </g>

              {/* =============================================================
                  NEAR-SIDE 16-BIT SPRITE LEGS (Back-Right & Front-Right)
                  Pure integer-pixel stepped walk keyframes (zero rotation aliasing)
                  ============================================================= */}
              <g data-testid="storybook-tortoise-legs-near">
                {/* Back-Right Pixel Leg */}
                <g className="storybook-tortoise-leg-br">
                  <rect x="24" y="54" width="18" height="22" fill="#302C25" />
                  <rect x="26" y="56" width="14" height="18" fill="#997451" />
                  <rect x="32" y="70" width="4" height="4" fill="#F5EBDD" />
                  <rect x="37" y="70" width="4" height="4" fill="#F5EBDD" />
                </g>

                {/* Front-Right Pixel Leg */}
                <g className="storybook-tortoise-leg-fr">
                  <rect x="86" y="54" width="18" height="22" fill="#302C25" />
                  <rect x="88" y="56" width="14" height="18" fill="#997451" />
                  <rect x="94" y="70" width="4" height="4" fill="#F5EBDD" />
                  <rect x="99" y="70" width="4" height="4" fill="#F5EBDD" />
                </g>
              </g>

              {/* =============================================================
                  CHOREOGRAPHED 16-BIT SPRITE BUTTERFLY
                  ============================================================= */}
              <g
                data-testid="storybook-choreographed-butterfly"
                className="storybook-butterfly-choreographed"
              >
                <g className="storybook-butterfly-wings">
                  <rect x="-11" y="-9" width="10" height="10" fill="#302C25" />
                  <rect x="1" y="-9" width="10" height="10" fill="#302C25" />
                  <rect x="-10" y="-8" width="8" height="8" fill="#B86F50" />
                  <rect x="2" y="-8" width="8" height="8" fill="#B86F50" />
                  <rect x="-8" y="-6" width="4" height="4" fill="#E8BC69" />
                  <rect x="4" y="-6" width="4" height="4" fill="#E8BC69" />
                  <rect x="-8" y="0" width="6" height="6" fill="#E8BC69" />
                  <rect x="2" y="0" width="6" height="6" fill="#E8BC69" />
                  <rect x="-2" y="-6" width="4" height="12" fill="#302C25" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
});

export default StorybookFooterLandscape;
