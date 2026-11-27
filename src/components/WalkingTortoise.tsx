import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../i18n/translations';

interface WalkingTortoiseProps {
  className?: string;
  variant?: 'default' | 'hero';
}

const TORTOISE_WIDTH_PX = 84;
const TRACK_EDGE_PADDING_PX = 4;

/** Smooth cubic ease-in-out matching cubic-bezier(0.42, 0, 0.58, 1) */
function easeInOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/**
 * Akath Patient Tortoise Traverse — requestAnimationFrame GPU-Composited Engine
 *
 * Refactored away from multi-layer CSS keyframes to a single `requestAnimationFrame`
 * clock inside ONE `will-change: transform` GPU container (`.akath-patient-tortoise-runner`)
 * within a layout-contained track (`contain: layout style paint`):
 * - Track bounds are measured once via ResizeObserver (never inside rAF — zero layout thrash).
 * - Off-screen instances automatically suspend their rAF loop via IntersectionObserver.
 * - Full `prefers-reduced-motion: reduce` support centers the tortoise in a calm static pose.
 * - Pointer-fine hover pause + explicit Pause/Walk toggle for touch devices.
 */
export const WalkingTortoise: React.FC<WalkingTortoiseProps> = ({
  className = '',
  variant = 'default',
}) => {
  const { lang } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);
  const isHero = variant === 'hero';

  const stageRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const runnerRef = useRef<HTMLDivElement | null>(null);
  const flipRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<SVGGElement | null>(null);
  const legARef = useRef<SVGGElement | null>(null);
  const legBRef = useRef<SVGGElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const pageLeftRef = useRef<SVGGElement | null>(null);
  const pageRightRef = useRef<SVGGElement | null>(null);
  const glyphARef = useRef<SVGGElement | null>(null);
  const glyphBRef = useRef<SVGGElement | null>(null);
  const glyphCRef = useRef<SVGGElement | null>(null);

  const isPausedRef = useRef(isPaused);
  const isHoveredRef = useRef(false);
  const isVisibleRef = useRef(true);
  const trackWidthRef = useRef(320);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const trackEl = trackRef.current;
    const stageEl = stageRef.current;
    const runnerEl = runnerRef.current;
    if (!trackEl || !stageEl || !runnerEl) return;

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const updateTrackWidth = () => {
      const measured = trackEl.clientWidth;
      if (measured > 0) {
        trackWidthRef.current = measured;
      }
      if (reducedMotionQuery.matches && runnerRef.current) {
        const centerX = Math.max(
          TRACK_EDGE_PADDING_PX,
          (trackWidthRef.current - TORTOISE_WIDTH_PX) / 2
        );
        runnerRef.current.style.transform = `translate3d(${centerX.toFixed(2)}px, 0, 0)`;
        if (flipRef.current) {
          flipRef.current.style.transform = 'scaleX(1)';
        }
      }
    };

    updateTrackWidth();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateTrackWidth);
      resizeObserver.observe(trackEl);
    } else {
      window.addEventListener('resize', updateTrackWidth, { passive: true });
    }

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          isVisibleRef.current = entries.some((entry) => entry.isIntersecting);
        },
        { threshold: 0.01 }
      );
      intersectionObserver.observe(stageEl);
    }

    const onMouseEnter = () => {
      if (finePointerQuery.matches) {
        isHoveredRef.current = true;
      }
    };
    const onMouseLeave = () => {
      isHoveredRef.current = false;
    };
    stageEl.addEventListener('mouseenter', onMouseEnter);
    stageEl.addEventListener('mouseleave', onMouseLeave);

    if (reducedMotionQuery.matches) {
      return () => {
        resizeObserver?.disconnect();
        if (!resizeObserver) window.removeEventListener('resize', updateTrackWidth);
        intersectionObserver?.disconnect();
        stageEl.removeEventListener('mouseenter', onMouseEnter);
        stageEl.removeEventListener('mouseleave', onMouseLeave);
      };
    }

    let rafId = 0;
    let lastTs = performance.now();
    let elapsedMs = 0;

    const getCycleDurationMs = (width: number) => {
      if (width >= 1024) return 32000;
      if (width >= 640) return 26000;
      return 20000;
    };

    const tick = (now: number) => {
      const rawDt = now - lastTs;
      lastTs = now;
      // Clamp frame delta to prevent large visual jumps after tab switches
      const dt = Math.min(Math.max(rawDt, 0), 50);

      const running =
        !isPausedRef.current &&
        !isHoveredRef.current &&
        isVisibleRef.current &&
        !document.hidden;

      if (running) {
        elapsedMs += dt;
        const width = trackWidthRef.current;
        const durationMs = getCycleDurationMs(width);
        const phase = (elapsedMs % durationMs) / durationMs;

        // Horizontal traverse: 0..44% forward, 44..50% pause+turn, 50..94% return, 94..100% pause+turn
        const maxX = Math.max(
          TRACK_EDGE_PADDING_PX,
          width - TORTOISE_WIDTH_PX - TRACK_EDGE_PADDING_PX
        );
        let progress = 0;
        let isTurningOrPaused = false;
        let facing = 1;

        if (phase < 0.44) {
          progress = easeInOutCubic(phase / 0.44);
          facing = 1;
        } else if (phase < 0.5) {
          progress = 1;
          isTurningOrPaused = true;
          const turnT = Math.min(1, Math.max(0, (phase - 0.45) / 0.04));
          facing = 1 - 2 * easeInOutCubic(turnT);
        } else if (phase < 0.94) {
          progress = 1 - easeInOutCubic((phase - 0.5) / 0.44);
          facing = -1;
        } else {
          progress = 0;
          isTurningOrPaused = true;
          const turnT = Math.min(1, Math.max(0, (phase - 0.95) / 0.04));
          facing = -1 + 2 * easeInOutCubic(turnT);
        }

        const x = TRACK_EDGE_PADDING_PX + progress * (maxX - TRACK_EDGE_PADDING_PX);
        if (runnerRef.current) {
          runnerRef.current.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
        }
        if (flipRef.current) {
          const safeScaleX = Math.abs(facing) < 0.06 ? (facing >= 0 ? 0.06 : -0.06) : facing;
          flipRef.current.style.transform = `scaleX(${safeScaleX.toFixed(3)})`;
        }

        // Synchronized stride, body sway, head nod, page breathe & rising Akshara glyphs
        const tSec = elapsedMs * 0.001;
        const strideAmp = isTurningOrPaused ? 0.2 : 1;
        const strideWave = Math.sin((tSec * Math.PI * 2) / 1.8) * strideAmp;
        const swayY = -0.65 * (1 - Math.cos((tSec * Math.PI * 2) / 1.8)) * strideAmp;
        const headWave = 0.5 - 0.5 * Math.cos((tSec * Math.PI * 2) / 3.6);
        const pageWave = Math.sin((tSec * Math.PI * 2) / 4.8);

        if (legARef.current) {
          const deg = (strideWave * 7).toFixed(2);
          const lift = ((-0.6 - 0.6 * strideWave) * strideAmp).toFixed(2);
          legARef.current.style.transform = `translate3d(0, ${lift}px, 0) rotate(${deg}deg)`;
        }
        if (legBRef.current) {
          const deg = (-strideWave * 7).toFixed(2);
          const lift = ((-0.6 + 0.6 * strideWave) * strideAmp).toFixed(2);
          legBRef.current.style.transform = `translate3d(0, ${lift}px, 0) rotate(${deg}deg)`;
        }
        if (bodyRef.current) {
          bodyRef.current.style.transform = `translate3d(0, ${swayY.toFixed(2)}px, 0)`;
        }
        if (headRef.current) {
          const hx = (headWave * 1.0).toFixed(2);
          const hy = (-headWave * 0.8).toFixed(2);
          const hRot = (-headWave * 1.5).toFixed(2);
          headRef.current.style.transform = `translate3d(${hx}px, ${hy}px, 0) rotate(${hRot}deg)`;
        }
        if (pageLeftRef.current) {
          pageLeftRef.current.style.transform = `rotate(${(pageWave * -2.2).toFixed(2)}deg)`;
        }
        if (pageRightRef.current) {
          pageRightRef.current.style.transform = `rotate(${(pageWave * 2.2).toFixed(2)}deg)`;
        }

        const updateGlyph = (
          el: SVGGElement | null,
          period: number,
          delay: number
        ) => {
          if (!el) return;
          const gWave = 0.5 - 0.5 * Math.cos(((tSec + delay) * Math.PI * 2) / period);
          el.style.transform = `translate3d(0, ${(-gWave * 3.2).toFixed(2)}px, 0)`;
          el.style.opacity = (0.48 + gWave * 0.44).toFixed(3);
        };
        updateGlyph(glyphARef.current, 4.2, 0);
        updateGlyph(glyphBRef.current, 4.8, 1.1);
        updateGlyph(glyphCRef.current, 5.3, 2.2);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', updateTrackWidth);
      intersectionObserver?.disconnect();
      stageEl.removeEventListener('mouseenter', onMouseEnter);
      stageEl.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const stations =
    lang === 'mr'
      ? ['हस्तलिखित', 'संपादन', 'अक्षरजुळणी', 'वाचक संवाद']
      : ['MANUSCRIPT', 'EDITING', 'PRESSWORK', 'READER'];

  return (
    <div
      ref={stageRef}
      data-testid={isHero ? 'hero-walking-tortoise' : 'about-walking-tortoise'}
      aria-label={
        lang === 'mr'
          ? 'अकथ प्रकाशन संपादकीय कासव भ्रमण — संथ पावले, सखोल अक्षरे, चिरंतन ग्रंथ'
          : 'Akath Prakashan Patient Tortoise Traverse — Slow Steps, Deep Letters, Enduring Books'
      }
      className={`akath-patient-traverse-stage ${
        isPaused ? 'is-paused' : ''
      } relative w-full ${
        isHero ? 'pt-1 pb-0' : 'max-w-[960px] mx-auto pt-3 pb-1'
      } select-none overflow-hidden ${className}`}
    >
      {/* Top Margin Header with Mobile-Friendly Pause/Walk Control */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 px-0.5 text-[10px] font-mono uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#5A5F72]">
        <span className="text-[#174D3A] font-semibold truncate">
          {lang === 'mr'
            ? 'संथ पावले · सखोल अक्षरे · चिरंतन ग्रंथ'
            : 'SLOW STEPS · DEEP LETTERS · ENDURING BOOKS'}
        </span>

        <div className="flex items-center gap-3 ml-auto">
          {!isHero && (
            <span className="text-[#5A5F72] hidden min-[380px]:inline">
              {lang === 'mr' ? 'नांदेड, महाराष्ट्र' : 'NANDED, MAHARASHTRA'}
            </span>
          )}
          <button
            type="button"
            data-testid={
              isHero ? 'hero-tortoise-play-toggle' : 'about-tortoise-play-toggle'
            }
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

      {/* Horizontal Marginalia Traverse Track (Layout-Contained for Zero Mobile Shift) */}
      <div
        ref={trackRef}
        data-testid={
          isHero
            ? 'hero-tortoise-colophon-seal'
            : 'about-tortoise-colophon-seal'
        }
        className={`akath-patient-traverse-track relative w-full px-3 sm:px-4 overflow-hidden flex flex-col justify-end ${
          isHero
            ? 'h-[66px] sm:h-[70px] rounded-xl border border-[#DCD4C0] bg-[#FFFDF7]/80 shadow-xs'
            : 'h-[72px] sm:h-[74px] border-y border-[#E6DFCE] bg-[#F7F3E8]/30'
        }`}
      >
        {/* Editorial Waypoints along the Margin — Visible on Mobile, Tablet & Desktop */}
        <div
          aria-hidden="true"
          className="absolute inset-x-3 sm:inset-x-6 top-2 flex items-center justify-between pointer-events-none"
        >
          {stations.map((station) => (
            <span
              key={station}
              className="inline-flex items-center gap-1 font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.1em] sm:tracking-[0.16em] text-[#5A5F72]/85"
            >
              <span className="w-1 h-1 rounded-full bg-[#174D3A]/60 shrink-0" />
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
          <div className="flex items-center justify-between px-4 sm:px-8 mb-1 opacity-55">
            {Array.from({ length: 9 }).map((_, idx) => (
              <span
                key={idx}
                className="w-1 h-1 rounded-full bg-[#C89D54]"
              />
            ))}
          </div>

          {/* Primary Archival Horizon Hairline */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#174D3A]/50 to-transparent" />
        </div>

        {/* Single will-change: transform GPU Container Driven by requestAnimationFrame */}
        <div
          ref={runnerRef}
          data-testid="about-tortoise-traverse-runner"
          className="akath-patient-tortoise-runner pointer-events-none"
          aria-hidden="true"
        >
          <div ref={flipRef} className="akath-patient-tortoise-flip">
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
              <g ref={glyphARef} className="akath-tortoise-svg-part">
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
              <g ref={glyphBRef} className="akath-tortoise-svg-part">
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
              <g ref={glyphCRef} className="akath-tortoise-svg-part">
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
                <g
                  ref={pageLeftRef}
                  className="akath-tortoise-svg-part"
                  style={{ transformOrigin: 'right bottom' }}
                >
                  <path
                    d="M50 20 C42 16 33 16 26 19 L28 13 C35 10 43 11 50 15 Z"
                    fill="#FFFDF7"
                    stroke="#243B8A"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />
                </g>
                <g
                  ref={pageRightRef}
                  className="akath-tortoise-svg-part"
                  style={{ transformOrigin: 'left bottom' }}
                >
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
              <g
                ref={bodyRef}
                className="akath-tortoise-svg-part"
                style={{ transformOrigin: 'center center' }}
              >
                {/* Tail */}
                <path
                  d="M22 41 C17 41 13 43 11 45 C15 45.5 19 44 23 43 Z"
                  fill="#8C7355"
                  stroke="#252832"
                  strokeWidth="1.1"
                />

                {/* Back Leg B & Front Leg B (Far-side stride pair) */}
                <g
                  ref={legBRef}
                  className="akath-tortoise-svg-part"
                  style={{ transformOrigin: 'top center' }}
                >
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
                <g
                  ref={legARef}
                  className="akath-tortoise-svg-part"
                  style={{ transformOrigin: 'top center' }}
                >
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
                <g
                  ref={headRef}
                  className="akath-tortoise-svg-part"
                  style={{ transformOrigin: 'left center' }}
                >
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
                <g>
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
