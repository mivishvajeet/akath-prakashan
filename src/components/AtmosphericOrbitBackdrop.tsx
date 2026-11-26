import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Copy,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  Feather,
  BookOpen,
} from 'lucide-react';
import { AuthorRecord, BookRecord } from '../types/publishing';
import { BookCoverArt } from './BookCoverArt';

export type HomepageThemeSectionId =
  | 'hero'
  | 'what-we-do'
  | 'how-we-publish'
  | 'our-books'
  | 'for-authors'
  | 'about-akath';

export interface HomepageSectionTheme {
  id: HomepageThemeSectionId;
  canvasBg: string;
  orbitPrimary: string;
  orbitSecondary: string;
  glowColor: string;
  isDark: boolean;
}

export const HOMEPAGE_SECTION_THEMES: Record<
  HomepageThemeSectionId,
  HomepageSectionTheme
> = {
  hero: {
    id: 'hero',
    canvasBg: '#FAF8F0',
    orbitPrimary: 'rgba(36, 59, 138, 0.24)',
    orbitSecondary: 'rgba(184, 128, 42, 0.32)',
    glowColor: 'rgba(200, 157, 84, 0.14)',
    isDark: false,
  },
  'what-we-do': {
    id: 'what-we-do',
    canvasBg: '#F3F6FC',
    orbitPrimary: 'rgba(36, 59, 138, 0.24)',
    orbitSecondary: 'rgba(23, 77, 58, 0.28)',
    glowColor: 'rgba(36, 59, 138, 0.11)',
    isDark: false,
  },
  'how-we-publish': {
    id: 'how-we-publish',
    canvasBg: '#121C45',
    orbitPrimary: 'rgba(255, 217, 102, 0.32)',
    orbitSecondary: 'rgba(147, 197, 253, 0.30)',
    glowColor: 'rgba(255, 217, 102, 0.16)',
    isDark: true,
  },
  'our-books': {
    id: 'our-books',
    canvasBg: '#FFFDF7',
    orbitPrimary: 'rgba(184, 128, 42, 0.34)',
    orbitSecondary: 'rgba(36, 59, 138, 0.24)',
    glowColor: 'rgba(255, 217, 102, 0.20)',
    isDark: false,
  },
  'for-authors': {
    id: 'for-authors',
    canvasBg: '#F4EDE0',
    orbitPrimary: 'rgba(36, 59, 138, 0.22)',
    orbitSecondary: 'rgba(184, 128, 42, 0.32)',
    glowColor: 'rgba(200, 157, 84, 0.18)',
    isDark: false,
  },
  'about-akath': {
    id: 'about-akath',
    canvasBg: '#FAF6EC',
    orbitPrimary: 'rgba(23, 77, 58, 0.24)',
    orbitSecondary: 'rgba(184, 128, 42, 0.32)',
    glowColor: 'rgba(200, 157, 84, 0.16)',
    isDark: false,
  },
};

interface ConcentricOrbitRingsProps {
  primaryStroke: string;
  secondaryStroke: string;
  glowColor: string;
  className?: string;
}

/**
 * Lightweight, compositor-friendly concentric orbital circle lines
 * inspired by modern fintech landing experiences — pauses automatically
 * when outside the viewport via IntersectionObserver.
 */
export const ConcentricOrbitRings: React.FC<ConcentricOrbitRingsProps> = React.memo(({
  primaryStroke,
  secondaryStroke,
  glowColor,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting);
        }
      },
      { threshold: 0.02 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none select-none ${
        inView ? '' : 'akath-orbit-paused'
      } ${className}`}
    >
      {/* Ambient Radial Aura */}
      <div
        className="akath-ring-breathe absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 66%)`,
          transition: 'background 900ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      {/* Counter-Rotating Concentric SVG Circles */}
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        className="w-full h-full overflow-visible"
      >
        {/* Outer Giant Circle */}
        <g className="akath-orbit-ring-slow">
          <circle
            cx="500"
            cy="500"
            r="468"
            stroke={primaryStroke}
            strokeWidth="1.35"
            strokeDasharray="8 10"
            style={{
              transition: 'stroke 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <circle cx="500" cy="32" r="5" fill={secondaryStroke} />
          <circle cx="500" cy="968" r="4" fill={primaryStroke} />
        </g>

        {/* Secondary Solid + Dotted Harmonic Ring */}
        <g className="akath-orbit-ring-ccw">
          <circle
            cx="500"
            cy="500"
            r="360"
            stroke={secondaryStroke}
            strokeWidth="1.3"
            style={{
              transition: 'stroke 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <circle
            cx="500"
            cy="500"
            r="348"
            stroke={primaryStroke}
            strokeWidth="1"
            strokeDasharray="3 12"
            style={{
              transition: 'stroke 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <circle cx="860" cy="500" r="5.5" fill={secondaryStroke} />
          <circle cx="140" cy="500" r="4.5" fill={primaryStroke} />
        </g>

        {/* Inner Focus Orbit */}
        <g className="akath-orbit-ring-cw">
          <circle
            cx="500"
            cy="500"
            r="248"
            stroke={primaryStroke}
            strokeWidth="1.35"
            strokeDasharray="12 8"
            style={{
              transition: 'stroke 900ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
          <circle cx="500" cy="252" r="4.5" fill={primaryStroke} />
        </g>

        {/* Whisper Inner Core Ring */}
        <circle
          cx="500"
          cy="500"
          r="142"
          stroke={secondaryStroke}
          strokeWidth="1.1"
          strokeDasharray="4 7"
          style={{
            transition: 'stroke 900ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </svg>
    </div>
  );
});

interface BookMetaLookup {
  titleEn: string;
  authorEn: string;
  categoryEn: string;
  descriptionEn: string;
  formatEn: string;
}

interface RotatingBookOrbitStageProps {
  books: BookRecord[];
  authors: AuthorRecord[];
  isMr: boolean;
  bookEnglishMeta: Record<string, BookMetaLookup>;
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string) => void;
  recentlyAddedBookId?: string | null;
}

/**
 * 3D Perspective Rotating Book Carousel positioned in the middle of the homepage
 * ("03 · OUR BOOKS"), encircled by subtle animated circle lines.
 * Supports auto-rotation, pause on hover / button toggle, and direct click-to-focus.
 */
export const RotatingBookOrbitStage: React.FC<RotatingBookOrbitStageProps> = ({
  books,
  authors,
  isMr,
  bookEnglishMeta,
  activeIndex,
  onChangeIndex,
  onNavigate,
  onAddToCart,
  recentlyAddedBookId,
}) => {
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isAutoRotating || isHovered || books.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      onChangeIndex((activeIndex + 1) % books.length);
    }, 4400);
    return () => window.clearInterval(timer);
  }, [activeIndex, books.length, isAutoRotating, isHovered, onChangeIndex]);

  if (books.length === 0) return null;

  const activeBook = books[activeIndex] || books[0];
  const activeAuthor = authors.find((a) => a.id === activeBook.authorId);
  const activeEn = bookEnglishMeta[activeBook.id];
  const isAdded = recentlyAddedBookId === activeBook.id;

  return (
    <div
      data-testid="home-rotating-books-stage"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full py-2 sm:py-3 overflow-hidden"
    >
      {/* Orbital Rings Halo Behind Rotating Cards */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] sm:w-[540px] sm:h-[540px] lg:w-[660px] lg:h-[660px] opacity-90">
        <ConcentricOrbitRings
          primaryStroke="rgba(36, 59, 138, 0.25)"
          secondaryStroke="rgba(184, 128, 42, 0.36)"
          glowColor="rgba(255, 217, 102, 0.22)"
          className="w-full h-full"
        />
      </div>

      {/* Top Orbit Playback & Controls Strip */}
      <div className="relative z-20 flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <button
          type="button"
          onClick={() =>
            onChangeIndex((activeIndex - 1 + books.length) % books.length)
          }
          aria-label={isMr ? 'मागील पुस्तक' : 'Previous rotating book'}
          className="w-8 h-8 rounded-full bg-white/95 md:bg-white/85 md:backdrop-blur-sm border border-[#DCD4C0] hover:border-[#243B8A] text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 md:bg-white/85 md:backdrop-blur-sm border border-[#DCD4C0] text-[11px] font-mono text-[#57534E]">
          {books.map((b, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onChangeIndex(idx)}
                aria-label={`Focus ${b.title}`}
                className={`px-2 py-0.5 rounded-full font-bold tabular-nums transition-all cursor-pointer ${
                  active
                    ? 'bg-[#243B8A] text-[#FFFDF7]'
                    : 'text-[#57534E] hover:text-[#243B8A]'
                }`}
              >
                0{idx + 1}
              </button>
            );
          })}
          <span className="h-3 w-px bg-[#DCD4C0] mx-0.5" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setIsAutoRotating((prev) => !prev)}
            aria-label={
              isAutoRotating ? 'Pause book rotation' : 'Play book rotation'
            }
            className="inline-flex items-center gap-1 text-[#243B8A] font-semibold hover:opacity-80 cursor-pointer"
          >
            {isAutoRotating ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onChangeIndex((activeIndex + 1) % books.length)}
          aria-label={isMr ? 'पुढील पुस्तक' : 'Next rotating book'}
          className="w-8 h-8 rounded-full bg-white/95 md:bg-white/85 md:backdrop-blur-sm border border-[#DCD4C0] hover:border-[#243B8A] text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3D Orbital Cards Track (Desktop & Tablet md+) */}
      <div className="akath-3d-perspective relative z-10 h-[275px] sm:h-[315px] flex items-center justify-center">
        {books.map((book, idx) => {
          const total = books.length;
          let rel = idx - activeIndex;
          if (rel > Math.floor(total / 2)) rel -= total;
          if (rel < -Math.floor(total / 2)) rel += total;

          const isCenter = rel === 0;
          const xOffset =
            rel === 0
              ? '0%'
              : rel < 0
              ? '-78%'
              : '78%';
          const scale = isCenter ? 1 : 0.8;
          const rotateY = rel === 0 ? 0 : rel < 0 ? 22 : -22;
          const rotateZ = rel === 0 ? 0 : rel < 0 ? -4 : 4;
          const opacity = isCenter ? 1 : 0.72;
          const zIndex = isCenter ? 30 : 15;

          const bookAuthor = authors.find((a) => a.id === book.authorId);
          const enMeta = bookEnglishMeta[book.id];

          return (
            <motion.div
              key={book.id}
              onClick={() => {
                if (!isCenter) {
                  onChangeIndex(idx);
                } else {
                  onNavigate(`/books/${book.slug}`);
                }
              }}
              animate={{
                x: xOffset,
                scale,
                rotateY,
                rotateZ,
                opacity,
                zIndex,
              }}
              whileHover={{
                scale: isCenter ? 1.03 : 0.85,
                y: -6,
              }}
              transition={{
                type: 'spring',
                stiffness: 210,
                damping: 26,
                mass: 0.9,
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className={`absolute w-[180px] sm:w-[220px] rounded-2xl p-3 sm:p-3.5 cursor-pointer select-none transition-shadow ${
                isCenter
                  ? 'bg-white border border-[#243B8A]/25 shadow-[0_24px_60px_-16px_rgba(36,59,138,0.28)]'
                  : 'bg-[#FFFDF7]/95 border border-[#DCD4C0]/80 shadow-[0_14px_34px_-14px_rgba(28,25,23,0.16)]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#57534E] pb-2 mb-2 border-b border-[#E5DEC9]/80">
                <span className="font-bold text-[#243B8A] tabular-nums">
                  0{idx + 1}
                </span>
                <span className="truncate max-w-[115px] text-[#174D3A] font-medium">
                  {isMr
                    ? book.category
                    : enMeta?.categoryEn || book.category}
                </span>
              </div>

              <div className="mx-auto w-[124px] sm:w-[150px] drop-shadow-md">
                <BookCoverArt
                  book={book}
                  author={bookAuthor}
                  size="md"
                  priority={isCenter}
                />
              </div>

              <div className="pt-2.5 text-center space-y-0.5">
                <p className="font-serif font-medium text-xs sm:text-sm text-[#1C1917] truncate">
                  {isMr ? book.title : enMeta?.titleEn || book.title}
                </p>
                <p className="font-mono text-[11px] font-semibold text-[#243B8A] tabular-nums">
                  ₹{book.price}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Centered Spotlight Focus Bar Below Orbiting Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`orbit-meta-${activeBook.id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="relative z-20 max-w-xl mx-auto mt-3 sm:mt-4 rounded-2xl bg-white/95 md:bg-white/88 md:backdrop-blur-sm border border-[#DCD4C0] px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm"
        >
          <div className="text-center sm:text-left min-w-0">
            <h3 className="font-serif text-base sm:text-lg font-medium text-[#1C1917] truncate">
              {isMr ? activeBook.title : activeEn?.titleEn || activeBook.title}
            </h3>
            <p className="text-xs text-[#57534E] truncate">
              {isMr
                ? activeAuthor?.name
                : activeEn?.authorEn || activeAuthor?.transliteratedName}{' '}
              · ₹{activeBook.price}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate(`/books/${activeBook.slug}`)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#1C1917] border border-[#DCD4C0] hover:border-[#243B8A] hover:text-[#243B8A] transition-colors cursor-pointer whitespace-nowrap"
            >
              {isMr ? 'पहा' : 'Read Details'}
            </button>
            <button
              type="button"
              onClick={() => onAddToCart(activeBook.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                isAdded
                  ? 'bg-[#174D3A] text-[#FFFDF7]'
                  : 'bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isMr ? 'जोडले' : 'Added'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isMr ? 'खरेदी करा' : 'Buy Book'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

interface AuthorStudioExperienceProps {
  isMr: boolean;
  onNavigate: (path: string) => void;
}

const WRITER_DESK_WORKFLOW = [
  {
    id: 'manuscript',
    step: '01',
    panelTitleEn: 'Manuscript Submission Guide',
    panelTitleMr: 'संहिता सादरीकरण मार्गदर्शक',
    labelEn: 'Preparing Your Draft',
    labelMr: 'हस्तलिखित पूर्वतयारी',
    summaryEn: 'Clean Unicode Marathi or English draft submission essentials.',
    summaryMr: 'युनीकोड मराठी किंवा इंग्रजी हस्तलिखित सादरीकरणाची सोपी रचना.',
    items: [
      {
        titleEn: 'Accepted Genres',
        titleMr: 'स्वीकारले जाणारे साहित्यप्रकार',
        detailEn: 'Literary Fiction, Long Short Stories, Poetry, Travelogues & Research Essays',
        detailMr: 'कथा, कादंबरी, दीर्घकथा, कविता, प्रवासवर्णन आणि वैचारिक ललित लेखन',
      },
      {
        titleEn: 'Manuscript Package',
        titleMr: 'संहिता स्वरूप',
        detailEn: 'Unicode Word (.docx) or PDF file with a short synopsis and author note',
        detailMr: 'युनीकोड वर्ड (.docx) किंवा PDF प्रत, संक्षिप्त गोषवारा व लेखक परिचय',
      },
      {
        titleEn: 'Editorial Reading',
        titleMr: 'वाङ्मयीन वाचन व मूल्यांकन',
        detailEn: 'Patient human reading focused on literary voice, originality, and craft',
        detailMr: 'भाषिक पोत, आशयसंपन्नता आणि साहित्यिक मूल्यांवर आधारित सखोल वाचन',
      },
      {
        titleEn: 'Transparent Publishing Rights',
        titleMr: 'स्पष्ट व पारदर्शक करार',
        detailEn: 'Clear written author agreement with full credit and royalty structure',
        detailMr: 'लेखक हक्क, मानधन आणि प्रसिद्धीबाबत पारदर्शक व सन्माननीय करार',
      },
    ],
  },
  {
    id: 'editorial',
    step: '02',
    panelTitleEn: 'Inside the Editorial Desk',
    panelTitleMr: 'संपादन व भाषासंस्कार प्रक्रिया',
    labelEn: 'Editorial Collaboration',
    labelMr: 'संपादकीय संवाद',
    summaryEn: 'Close line editing, Devanagari proofing, and classical book layout.',
    summaryMr: 'सखोल वाङ्मयीन संपादन, अचूक मुद्रितशोधन आणि देवनागरी अक्षरजुळणी.',
    items: [
      {
        titleEn: 'Developmental Conversation',
        titleMr: 'संरचना व कथाविकास',
        detailEn: 'Thoughtful dialogue on pacing, chapter structure, and thematic resonance',
        detailMr: 'प्रकरण रचना, प्रवाह आणि आशयातील सुसंगतीवर लेखकाशी थेट संवाद',
      },
      {
        titleEn: 'Devanagari & Proof Precision',
        titleMr: 'शुद्धलेखन आणि मुद्रितशोधन',
        detailEn: 'Multi-pass proofreading honoring Marathi grammar and literary cadence',
        detailMr: 'मराठी व्याकरण, विरामचिन्हे आणि लयबद्ध गद्याची अनेक टप्प्यांत तपासणी',
      },
      {
        titleEn: 'Bespoke Typesetting',
        titleMr: 'अभिजात अक्षरजुळणी',
        detailEn: 'Classical eye-friendly book margins and legible Devanagari typography',
        detailMr: 'डोळ्यांना सुखद असे समास आणि वाचनीय देवनागरी मुद्रण मांडणी',
      },
      {
        titleEn: 'Original Cover Design',
        titleMr: 'आशयघन मुखपृष्ठ आरेखन',
        detailEn: 'Tailored cover art and jacket typography reflecting the book’s soul',
        detailMr: 'पुस्तकाच्या आशयाला साजेसे स्वतंत्र चित्र आणि कलात्मक मुखपृष्ठ',
      },
    ],
  },
  {
    id: 'release',
    step: '03',
    panelTitleEn: 'From Print to Readers',
    panelTitleMr: 'मुद्रण आणि वाचक वितरण',
    labelEn: 'Publication & Reach',
    labelMr: 'प्रकाशन व वितरण',
    summaryEn: 'Official ISBN-13 registration, fine cream paper print, and reader delivery.',
    summaryMr: 'अधिकृत ISBN-13 नोंदणी, दर्जेदार छपाई आणि थेट वाचकांपर्यंत वितरण.',
    items: [
      {
        titleEn: 'Official ISBN-13 Imprint',
        titleMr: 'अधिकृत ISBN-13 नोंदणी',
        detailEn: 'Registered archival edition under Akath Prakashan, Nanded',
        detailMr: 'अकथ प्रकाशन, नांदेडतर्फे अधिकृत ISBN क्रमांकासह ग्रंथ नोंदणी',
      },
      {
        titleEn: 'Tactile Cream Book Paper',
        titleMr: 'दर्जेदार कागद व टिकाऊ बांधणी',
        detailEn: 'Warm, durable natural-shade paper crafted for unhurried reading',
        detailMr: 'वाचनाचा आनंद द्विगुणित करणारा पिवळसर टिकाऊ कागद व उत्तम बांधणी',
      },
      {
        titleEn: 'Vachankatta & Features',
        titleMr: 'वाचनकट्टा व ग्रंथ परिचय',
        detailEn: 'Dedicated author page, first-page reading excerpts, and essays',
        detailMr: 'स्वतंत्र लेखक दालन, पुस्तकाचा पहिला उतारा आणि वाचनकट्टा लेख',
      },
      {
        titleEn: 'Direct Reader Delivery',
        titleMr: 'महाराष्ट्र व भारतभर वितरण',
        detailEn: 'Secure doorstep shipping across Maharashtra and throughout India',
        detailMr: 'महाराष्ट्र आणि देशभरातील वाचकांच्या घरी सुरक्षित पुस्तक वितरण',
      },
    ],
  },
];

/**
 * Interactive Dark Obsidian Writer Studio Console built for "04 · FOR AUTHORS".
 * Retains Cashfree-inspired sleek obsidian glass UI, glowing progress beam, and
 * animated tabs while displaying clear literary publishing guidance instead of code.
 */
export const AuthorStudioExperience: React.FC<AuthorStudioExperienceProps> = ({
  isMr,
  onNavigate,
}) => {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeTab = WRITER_DESK_WORKFLOW[activeTabIdx] || WRITER_DESK_WORKFLOW[0];

  const handleCopyChecklist = async () => {
    const checklistText = activeTab.items
      .map(
        (item, idx) =>
          `0${idx + 1}. ${isMr ? item.titleMr : item.titleEn} — ${
            isMr ? item.detailMr : item.detailEn
          }`
      )
      .join('\n');
    try {
      await navigator.clipboard.writeText(checklistText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div
      data-testid="home-author-studio-console"
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Tactile Warm Archival Editorial Folio Desk */}
      <div className="relative rounded-3xl border border-[#D8CEBA] bg-[#FFFDF7]/97 md:bg-[#FFFDF7]/94 md:backdrop-blur-sm shadow-[0_24px_64px_-30px_rgba(36,59,138,0.2)] overflow-hidden">
        {/* Top Literary Gold & Royal Indigo Hairline Accent */}
        <div className="relative h-[3px] w-full bg-[#EFE7D6] overflow-hidden">
          <div
            className="akath-studio-beam-line h-full w-1/3"
            style={{
              background:
                'linear-gradient(90deg, transparent, #243B8A, #C89D54, #EF6855, transparent)',
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left 5 Columns: Editorial Stage Selector & Direct Submission Invite */}
          <div className="lg:col-span-5 bg-[#FAF5EA]/90 p-5 sm:p-7 border-b lg:border-b-0 lg:border-r border-[#E4DAC6] flex flex-col justify-between space-y-5">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#174D3A]">
                <Feather className="w-3.5 h-3.5 text-[#EF6855]" />
                <span>
                  {isMr ? 'लेखक प्रकाशन कार्यकक्षा' : 'AUTHOR EDITORIAL DESK'}
                </span>
              </div>

              <p className="text-sm text-[#44403C] leading-relaxed">
                {isMr ? activeTab.summaryMr : activeTab.summaryEn}
              </p>
            </div>

            {/* Interactive 3-Stage Tab Switcher */}
            <div className="flex lg:flex-col gap-2.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {WRITER_DESK_WORKFLOW.map((tab, idx) => {
                const isSelected = idx === activeTabIdx;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTabIdx(idx)}
                    className={`shrink-0 lg:w-full px-4 py-3 rounded-xl text-left transition-all cursor-pointer border flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-[#243B8A] border-[#243B8A] text-[#FFFDF7] shadow-[0_10px_24px_-12px_rgba(36,59,138,0.5)]'
                        : 'bg-[#FFFDF7] border-[#E4DAC6] text-[#292524] hover:border-[#243B8A]/45 hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`font-mono text-[10.5px] px-1.5 py-0.5 rounded tabular-nums font-bold ${
                          isSelected
                            ? 'bg-[#FFD966] text-[#1C1917]'
                            : 'bg-[#F2EAD8] text-[#243B8A]'
                        }`}
                      >
                        {tab.step}
                      </span>
                      <span className="text-xs sm:text-sm font-serif font-medium truncate">
                        {isMr ? tab.labelMr : tab.labelEn}
                      </span>
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isSelected
                          ? 'text-[#FFD966] translate-x-0.5'
                          : 'text-[#78716C]'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Submission CTA */}
            <div className="pt-3 border-t border-[#E4DAC6] flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/submit-manuscript')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] font-medium text-xs sm:text-sm shadow-[0_10px_24px_-10px_rgba(239,104,85,0.55)] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Feather className="w-4 h-4 shrink-0" />
                <span>
                  {isMr ? 'संहिता पाठवा' : 'Submit Your Manuscript'}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* Right 7 Columns: Clean Archival Editorial Checklist Cards */}
          <div className="lg:col-span-7 bg-[#FFFDF7] p-5 sm:p-7 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-[#E8E0CE]">
              <div className="flex items-center gap-2.5 min-w-0">
                <BookOpen className="w-4 h-4 text-[#243B8A] shrink-0" />
                <span className="text-sm sm:text-base font-serif font-semibold text-[#1C1917] truncate">
                  {isMr ? activeTab.panelTitleMr : activeTab.panelTitleEn}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyChecklist}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EA] hover:bg-[#F1E8D5] border border-[#DCD2BC] text-[11px] font-medium text-[#243B8A] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#174D3A]" />
                    <span>{isMr ? 'कॉपी झाले' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isMr ? 'मार्गदर्शक कॉपी करा' : 'Copy Guide'}</span>
                  </>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
              >
                {activeTab.items.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[#E8E0CE] bg-[#FAF6EC]/65 hover:border-[#243B8A]/35 hover:bg-[#FAF6EC] transition-colors p-4 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10.5px] font-bold text-[#9A3412] tabular-nums">
                        0{i + 1}
                      </span>
                      <h4 className="font-serif text-sm font-semibold text-[#1C1917] truncate">
                        {isMr ? item.titleMr : item.titleEn}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-[13px] text-[#525665] leading-relaxed">
                      {isMr ? item.detailMr : item.detailEn}
                    </p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="pt-3.5 border-t border-[#E8E0CE] flex flex-wrap items-center justify-between gap-2 text-[10.5px] sm:text-[11px] font-mono uppercase tracking-[0.12em] text-[#57534E]">
              <span>
                {isMr
                  ? 'कथा · कादंबरी · कविता · प्रवासवर्णन · ललित'
                  : 'Fiction · Poetry · Travelogue · Non-Fiction'}
              </span>
              <span className="text-[#243B8A] font-semibold">
                AKATH EDITORIAL DESK · NANDED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
