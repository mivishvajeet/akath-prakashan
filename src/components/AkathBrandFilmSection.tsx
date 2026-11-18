import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Film, Pause, Play } from 'lucide-react';
import { resolvePublicAssetUrl } from '../utils/githubPagesAdapter';
import { useLanguage } from '../i18n/translations';

interface AkathBrandFilmSectionProps {
  onNavigate: (path: string) => void;
}

interface BrandFilmShot {
  id: string;
  indexLabel: string;
  startSec: number;
  endSec: number;
  titleEn: string;
  titleMr: string;
  cameraNoteEn: string;
  captionEn: string;
  captionMr: string;
}

const BRAND_FILM_SHOTS: BrandFilmShot[] = [
  {
    id: 'shot-01',
    indexLabel: '01',
    startSec: 0,
    endSec: 3,
    titleEn: 'The Origin',
    titleMr: 'शब्दांचा उगम · हस्तलिखित',
    cameraNoteEn: 'Macro Dolly Pan · Fountain Nib & Ink Fibre',
    captionEn:
      'Macro camera glides across textured archival paper as a fountain pen writes in Marathi and ink spreads into paper fibres.',
    captionMr:
      'पोत असलेल्या कागदावर फाउंटन पेनने उमटणारे मराठी शब्द आणि कागदाच्या धाग्यांत भिनणारी शाई.',
  },
  {
    id: 'shot-02',
    indexLabel: '02',
    startSec: 3,
    endSec: 6,
    titleEn: 'The Craft',
    titleMr: 'मुद्रण कला आणि अचूकता',
    cameraNoteEn: '3 Macro Press Cuts · Rollers & Signatures',
    captionEn:
      'Clean mechanical close-ups: rotating ink rollers, archival sheets feeding in registration, and printed jackets emerging.',
    captionMr:
      'फिरणारे शाईचे रोलर्स, अचूकतेने पुढे सरकणारी मुद्रित पाने आणि तयार होणारे पुस्तक कव्हर.',
  },
  {
    id: 'shot-03',
    indexLabel: '03',
    startSec: 6,
    endSec: 10,
    titleEn: 'The Book',
    titleMr: 'अकथची अस्सल ग्रंथसंपदा',
    cameraNoteEn: 'Controlled 3D Studio Dolly · Original Covers',
    captionEn:
      'Smyth-sewn binding transitions into a controlled 3D showcase of Scholar Juice, Dhukyachi Dulai & Social Media in Democracy.',
    captionMr:
      'स्कॉलर ज्यूस, धुक्याची दुलई आणि लोकशाहीमध्ये समाजमाध्यमांचा वापर — मूळ कव्हरसह त्रिमितीय पुस्तके.',
  },
  {
    id: 'shot-04',
    indexLabel: '04',
    startSec: 10,
    endSec: 12.5,
    titleEn: 'The Literary World',
    titleMr: 'साहित्यविश्व आणि अकथ कासव',
    cameraNoteEn: 'Multi-Plane SVG Parallax · Open Book Universe',
    captionEn:
      'An Akath book opens as a layered SVG literary landscape and the official Akath tortoise emerge with subtle parallax depth.',
    captionMr:
      'उघडलेल्या पुस्तकातून उमलणारे बहुस्तरीय साहित्यविश्व आणि संयमाने चालणारे अकथचे अधिकृत कासव.',
  },
  {
    id: 'shot-05',
    indexLabel: '05',
    startSec: 12.5,
    endSec: 15,
    titleEn: 'The Brand Reveal',
    titleMr: 'अकथ प्रकाशन मुद्रा',
    cameraNoteEn: 'Warm Studio Light Sweep · Official Logo Lockup',
    captionEn:
      'Understated editorial reveal of the official Akath Prakashan emblem and typography on textured archival linen.',
    captionMr:
      'उबदार प्रकाशात शांत आणि आत्मविश्वासपूर्ण रीतीने उजळणारी अकथ प्रकाशनची अधिकृत मुद्रा.',
  },
];

const FILM_CACHE_REV = 'v=akath-story-2026';

export const AkathBrandFilmSection: React.FC<AkathBrandFilmSectionProps> = ({
  onNavigate,
}) => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeShotIdx, setActiveShotIdx] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const logoUrl = resolvePublicAssetUrl('/assets/akath/akath-logo-256w.webp');
  const logoFallbackUrl = resolvePublicAssetUrl('/assets/akath/akath-logo.png');
  const desktopPosterWebp = `${resolvePublicAssetUrl(
    '/assets/akath/akath-brand-film-poster-16x9.webp'
  )}?${FILM_CACHE_REV}`;
  const mobilePosterWebp = `${resolvePublicAssetUrl(
    '/assets/akath/akath-brand-film-poster-9x16.webp'
  )}?${FILM_CACHE_REV}`;
  const desktopWebm = `${resolvePublicAssetUrl(
    '/assets/akath/akath-brand-film-16x9.webm'
  )}?${FILM_CACHE_REV}`;
  const desktopMp4 = `${resolvePublicAssetUrl(
    '/assets/akath/akath-brand-film-16x9.mp4'
  )}?${FILM_CACHE_REV}`;
  const mobileWebm = `${resolvePublicAssetUrl(
    '/assets/akath/akath-brand-film-9x16.webm'
  )}?${FILM_CACHE_REV}`;
  const mobileMp4 = `${resolvePublicAssetUrl(
    '/assets/akath/akath-brand-film-9x16.mp4'
  )}?${FILM_CACHE_REV}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMq = window.matchMedia('(max-width: 767px)');
    setPrefersReducedMotion(motionMq.matches);
    setIsMobileViewport(mobileMq.matches);

    const handleMotionChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    const handleMobileChange = (e: MediaQueryListEvent) =>
      setIsMobileViewport(e.matches);
    motionMq.addEventListener?.('change', handleMotionChange);
    mobileMq.addEventListener?.('change', handleMobileChange);
    return () => {
      motionMq.removeEventListener?.('change', handleMotionChange);
      mobileMq.removeEventListener?.('change', handleMobileChange);
    };
  }, []);

  // Viewport-aware autoplay & pause when scrolled out of view
  useEffect(() => {
    const sectionEl = sectionRef.current;
    const videoEl = videoRef.current;
    if (
      !sectionEl ||
      !videoEl ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && !prefersReducedMotion) {
          videoEl
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        } else {
          videoEl.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.2, rootMargin: '120px 0px' }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const handleTimeUpdate = () => {
    const videoEl = videoRef.current;
    if (!videoEl || !videoEl.duration) return;
    const t = videoEl.currentTime;
    const pct = Math.min(100, Math.max(0, (t / 15) * 100));
    setProgressPct(pct);

    const foundIdx = BRAND_FILM_SHOTS.findIndex(
      (s) => t >= s.startSec && t < s.endSec
    );
    if (foundIdx !== -1 && foundIdx !== activeShotIdx) {
      setActiveShotIdx(foundIdx);
    }
  };

  const togglePlayPause = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      videoEl.pause();
      setIsPlaying(false);
    }
  };

  const jumpToShot = (shotIdx: number) => {
    const shot = BRAND_FILM_SHOTS[shotIdx];
    if (!shot) return;
    setActiveShotIdx(shotIdx);
    const videoEl = videoRef.current;
    if (videoEl) {
      try {
        videoEl.currentTime = shot.startSec + 0.05;
        if (videoEl.paused && !prefersReducedMotion) {
          videoEl
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      } catch {
        // Ignore if metadata not yet loaded
      }
      setProgressPct(((shot.startSec + 0.05) / 15) * 100);
    }
  };

  const activeShot = BRAND_FILM_SHOTS[activeShotIdx] || BRAND_FILM_SHOTS[0];

  return (
    <section
      ref={sectionRef}
      data-testid="home-about-akath"
      className="w-full overflow-hidden py-10 sm:py-16 lg:py-20 bg-[#FFFDF7] border-t border-[#E5DEC9]"
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6 sm:space-y-8 min-w-0">
        {/* Centered Editorial Brand Introduction Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <p className="text-xs font-mono not-italic font-bold uppercase tracking-[0.2em] text-[#243B8A]">
            {isMr
              ? '०५ · आमची ओळख · THE JOURNEY OF A STORY'
              : '05 · ABOUT AKATH PRAKASHAN · THE JOURNEY OF A STORY'}
          </p>

          <h2 className="text-2xl sm:text-4xl font-serif not-italic font-extrabold text-[#1C1917] tracking-tight">
            Rooted in Language. Driven by Stories.
          </h2>

          <p className="text-sm sm:text-[17px] font-sans not-italic font-medium text-[#292524] leading-relaxed max-w-[62ch] mx-auto">
            {isMr
              ? 'अकथ प्रकाशन ही विचारशील लेखन, अर्थपूर्ण कथा आणि नवे आवाज मुद्रित स्वरूपात वाचकांपर्यंत आणण्यासाठी बांधिलकी जपणारी मराठी प्रकाशन संस्था आहे.'
              : 'Akath Prakashan is a Marathi publishing initiative committed to bringing thoughtful writing, meaningful stories and new voices into print.'}
          </p>
        </div>

        {/* 15-Second 3D Motion-Picture Stage + 5-Shot Director Reel Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          {/* Left 8 Columns: 3D Motion-Picture Cinema Frame */}
          <div className="lg:col-span-8 flex flex-col">
            <div
              data-testid="akath-brand-film-stage"
              className="relative rounded-xl overflow-hidden border border-[#DCD4C0] bg-[#120E0B] shadow-lg flex-1 flex flex-col"
            >
              {/* Top Motion-Picture Telemetry Strip */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#191410] border-b border-[#33281E] text-[10.5px] sm:text-[11px] font-mono uppercase tracking-[0.15em] text-[#D8CBB8]">
                <div className="flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-[#EF6855]" />
                  <span>AKATH 3D MOTION PICTURE · 24 FPS · 00:15</span>
                </div>
                <span className="text-[#FFD966] font-semibold">
                  {isMobileViewport
                    ? '9:16 PORTRAIT 3D MASTER'
                    : '16:9 CINEMA 3D MASTER'}
                </span>
              </div>

              {/* Video Viewport */}
              <div className="relative w-full aspect-[9/16] max-h-[500px] md:max-h-none md:aspect-video bg-[#120E0B] mx-auto overflow-hidden flex-1">
                <video
                  ref={videoRef}
                  data-testid="akath-brand-film-video"
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  loop
                  preload="none"
                  poster={isMobileViewport ? mobilePosterWebp : desktopPosterWebp}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  aria-label="Akath Prakashan 15-second 3D cinematic brand film: The World Inside a Book"
                >
                  <source
                    media="(max-width: 767px)"
                    src={mobileWebm}
                    type="video/webm"
                  />
                  <source
                    media="(max-width: 767px)"
                    src={mobileMp4}
                    type="video/mp4"
                  />
                  <source src={desktopWebm} type="video/webm" />
                  <source src={desktopMp4} type="video/mp4" />
                </video>

                {/* Subtle Anamorphic Letterbox Vignette for Readability */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0E0B08]/90 via-transparent to-[#0E0B08]/35"
                />

                {/* Top-Left Clickable Official Logo Badge */}
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  title="Akath Prakashan Homepage"
                  className="absolute top-3 left-3 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14100C]/85 hover:bg-[#14100C] border border-[#FFD966]/45 transition-colors cursor-pointer"
                >
                  <picture>
                    <source srcSet={logoUrl} type="image/webp" />
                    <img
                      src={logoFallbackUrl}
                      alt="Akath Prakashan Official Logo"
                      width={26}
                      height={26}
                      loading="lazy"
                      decoding="async"
                      className="w-6.5 h-6.5 rounded-full object-contain bg-[#FFFDF7] p-0.5"
                    />
                  </picture>
                  <span className="font-serif text-xs font-bold text-[#FFFDF7] tracking-wide">
                    अकथ प्रकाशन
                  </span>
                </button>

                {/* Top-Right Active Camera Movement Tag */}
                <div className="hidden sm:flex absolute top-3 right-3 z-20 items-center gap-1.5 px-2.5 py-1 rounded bg-[#14100C]/80 border border-[#FFFDF7]/15 text-[10px] font-mono uppercase tracking-[0.14em] text-[#FFD966]">
                  <span>{activeShot.cameraNoteEn}</span>
                </div>

                {/* Bottom Active Shot Caption + Accessible Play/Pause Control */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-3.5 sm:p-5 space-y-2.5">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FFD966] font-semibold">
                        SHOT {activeShot.indexLabel} / 05 ·{' '}
                        {activeShot.titleEn.toUpperCase()} · {activeShot.titleMr}
                      </div>
                      <p className="mt-0.5 text-xs sm:text-sm text-[#FFFDF7] font-serif not-italic leading-snug line-clamp-2 max-w-xl">
                        {isMr ? activeShot.captionMr : activeShot.captionEn}
                      </p>
                    </div>

                    <button
                      type="button"
                      data-testid="brand-film-play-pause"
                      onClick={togglePlayPause}
                      aria-label={isPlaying ? 'Pause brand film' : 'Play brand film'}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFFDF7] text-[#1C1917] hover:bg-[#FFD966] text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                  </div>

                  {/* 15s Continuous Timeline Scrubber Bar */}
                  <div className="w-full h-1.5 bg-[#3A2E23] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FFD966] transition-all duration-150"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Interactive 5-Shot Motion Breakdown & CTAs */}
          <div className="lg:col-span-4 rounded-xl border border-[#DCD4C0] bg-[#FAF6EC] p-4 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2.5 mb-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-[#243B8A]">
                  {isMr ? '५ सिनेमॅटिक शॉट्स (15s)' : '5 CINEMATIC SHOTS (15s)'}
                </span>
                <span className="text-[10.5px] font-mono text-[#57534E]">
                  24 FPS · 3D REEL
                </span>
              </div>

              <div
                data-testid="brand-film-scene-scrubber"
                className="space-y-2"
                role="tablist"
                aria-label="Brand film shots"
              >
                {BRAND_FILM_SHOTS.map((shot, idx) => {
                  const isActive = idx === activeShotIdx;
                  return (
                    <button
                      key={shot.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      data-testid={`brand-film-scene-${shot.indexLabel}`}
                      onClick={() => jumpToShot(idx)}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-2.5 ${
                        isActive
                          ? 'bg-[#243B8A] border-[#243B8A] text-[#FFFDF7]'
                          : 'bg-[#FFFDF7] border-[#DCD4C0] text-[#1C1917] hover:border-[#243B8A]'
                      }`}
                    >
                      <span
                        className={`font-mono text-[11px] px-1.5 py-0.5 rounded shrink-0 tabular-nums font-bold ${
                          isActive
                            ? 'bg-[#FFD966] text-[#1C1917]'
                            : 'bg-[#F7F3E8] text-[#243B8A]'
                        }`}
                      >
                        {shot.indexLabel}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-serif not-italic font-bold truncate">
                            {shot.titleEn}
                          </span>
                          <span
                            className={`text-[10px] font-mono tabular-nums shrink-0 ${
                              isActive ? 'text-[#FFD966]' : 'text-[#57534E]'
                            }`}
                          >
                            {shot.startSec.toFixed(1)}s–{shot.endSec.toFixed(1)}s
                          </span>
                        </div>
                        <p
                          className={`text-[11px] font-serif not-italic truncate mt-0.5 ${
                            isActive ? 'text-[#FFFDF7]/90' : 'text-[#57534E]'
                          }`}
                        >
                          {shot.titleMr}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pinned Bottom CTAs */}
            <div className="pt-3 border-t border-[#E5DEC9] flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <button
                type="button"
                data-testid="brand-film-discover-books"
                onClick={() => onNavigate('/books')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>{isMr ? 'आमची पुस्तके पहा' : 'Discover Our Books'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/about')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>
                  {isMr
                    ? 'अकथ प्रकाशनविषयी · About Akath Prakashan'
                    : 'About Akath Prakashan'}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
