import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  ShoppingBag,
  Check,
  Sparkles,
  Eye,
} from 'lucide-react';
import { AuthorRecord, BookRecord } from '../types/publishing';
import { BookCoverArt } from './BookCoverArt';
import { resolvePublicAssetUrl } from '../utils/githubPagesAdapter';

export {
  HeroPublicationWatermark,
  AuthorsLandscapeBackdrop,
  AboutLandscapeBackdrop,
} from './AkathLandscapeIllustrations';


interface BookMetaLookup {
  titleEn: string;
  authorEn: string;
  categoryEn: string;
  descriptionEn: string;
  formatEn: string;
}

interface HeroInteractiveBookPlinthProps {
  books: BookRecord[];
  authors: AuthorRecord[];
  activeHeroBook: BookRecord;
  activeHeroAuthor?: AuthorRecord;
  activeHeroIndex: number;
  activeHeroEnMeta?: BookMetaLookup;
  secondaryBooks: BookRecord[];
  bookEnglishMeta: Record<string, BookMetaLookup>;
  isMr: boolean;
  showFullSpread: boolean;
  setShowFullSpread: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBookId: React.Dispatch<React.SetStateAction<string>>;
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string) => void;
  recentlyAddedBookId?: string | null;
}

type InspectionMode = 'cover3d' | 'jacket' | 'pages';

export const HeroInteractiveBookPlinth: React.FC<
  HeroInteractiveBookPlinthProps
> = ({
  books,
  authors,
  activeHeroBook,
  activeHeroAuthor,
  activeHeroIndex,
  activeHeroEnMeta,
  secondaryBooks,
  bookEnglishMeta,
  isMr,
  showFullSpread,
  setShowFullSpread,
  setSelectedBookId,
  onNavigate,
  onAddToCart,
  recentlyAddedBookId,
}) => {
  const [inspectMode, setInspectMode] = useState<InspectionMode>('cover3d');
  const [tilt, setTilt] = useState<{ rx: number; ry: number; gx: number; gy: number }>({
    rx: 0,
    ry: 0,
    gx: 50,
    gy: 40,
  });
  const stageRef = useRef<HTMLDivElement | null>(null);

  const effectiveMode: InspectionMode = showFullSpread ? 'jacket' : inspectMode;

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el || effectiveMode !== 'cover3d') return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 18;
    const rx = (0.5 - py) * 14;
    setTilt({
      rx,
      ry,
      gx: Math.round(px * 100),
      gy: Math.round(py * 100),
    });
  };

  const handleStageMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 40 });
  };

  const switchBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setShowFullSpread(false);
    setInspectMode('cover3d');
  };

  const isAdded = recentlyAddedBookId === activeHeroBook.id;
  const activeTitle = isMr
    ? activeHeroBook.title
    : activeHeroEnMeta?.titleEn || activeHeroBook.title;
  const activeAuthorName = activeHeroAuthor
    ? isMr
      ? activeHeroAuthor.name
      : activeHeroEnMeta?.authorEn || activeHeroAuthor.transliteratedName
    : '';
  const activeCategory = isMr
    ? activeHeroBook.category
    : activeHeroEnMeta?.categoryEn || activeHeroBook.category;
  const activeBlurb = isMr
    ? activeHeroBook.description
    : activeHeroEnMeta?.descriptionEn || activeHeroBook.description;

  return (
    <div
      data-testid="home-featured-edition-dossier"
      className="w-full max-w-5xl mx-auto min-w-0"
    >
      <div className="relative rounded-3xl bg-white/98 border border-[#E5DEC9] p-4 sm:p-7 lg:p-8 shadow-[0_24px_60px_-30px_rgba(36,59,138,0.2)] overflow-hidden">
        {/* Top Interactive Control Ribbon */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pb-4 border-b border-[#E5DEC9]/80">
          <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.14em] text-[#174D3A] truncate">
              {activeCategory}
            </span>

            {/* Mobile Prev / Counter / Next inline with category */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => {
                  const prevIdx =
                    (activeHeroIndex - 1 + books.length) % books.length;
                  if (books[prevIdx]) switchBook(books[prevIdx].id);
                }}
                aria-label={isMr ? 'मागील पुस्तक' : 'Previous edition'}
                className="w-9 h-9 rounded-full border border-[#DCD4C0] hover:border-[#243B8A] text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="tabular-nums font-semibold text-[#243B8A] px-1">
                0{activeHeroIndex + 1} / 0{books.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextIdx = (activeHeroIndex + 1) % books.length;
                  if (books[nextIdx]) switchBook(books[nextIdx].id);
                }}
                aria-label={isMr ? 'पुढील पुस्तक' : 'Next edition'}
                className="w-9 h-9 rounded-full border border-[#DCD4C0] hover:border-[#243B8A] text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Inspection Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#FAF6EC] border border-[#E5DEC9] max-w-full overflow-x-auto no-scrollbar self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setShowFullSpread(false);
                setInspectMode('cover3d');
              }}
              className={`min-h-[34px] px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                effectiveMode === 'cover3d'
                  ? 'bg-[#243B8A] text-[#FFFDF7] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>{isMr ? '३डी पुस्तक' : '3D Edition'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowFullSpread(false);
                setInspectMode('pages');
              }}
              className={`min-h-[34px] px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                effectiveMode === 'pages'
                  ? 'bg-[#243B8A] text-[#FFFDF7] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Eye className="w-3 h-3 shrink-0" />
              <span>{isMr ? 'आत डोकावून पहा' : 'Peek Inside'}</span>
            </button>

            {activeHeroBook.coverSpreadUrl && (
              <button
                type="button"
                data-testid="toggle-featured-jacket-spread"
                onClick={() => {
                  const next = !showFullSpread;
                  setShowFullSpread(next);
                  setInspectMode(next ? 'jacket' : 'cover3d');
                }}
                className={`min-h-[34px] px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  effectiveMode === 'jacket'
                    ? 'bg-[#243B8A] text-[#FFFDF7] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                <Layers className="w-3 h-3 shrink-0" />
                <span>{isMr ? 'पूर्ण वेष्टन' : 'Full Jacket'}</span>
              </button>
            )}
          </div>

          {/* Desktop/Tablet Prev / Counter / Next */}
          <div className="hidden sm:flex items-center gap-2 shrink-0 text-[11px] font-mono">
            <button
              type="button"
              onClick={() => {
                const prevIdx =
                  (activeHeroIndex - 1 + books.length) % books.length;
                if (books[prevIdx]) switchBook(books[prevIdx].id);
              }}
              aria-label={isMr ? 'मागील पुस्तक' : 'Previous edition'}
              className="w-9 h-9 rounded-full border border-[#DCD4C0] hover:border-[#243B8A] text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="tabular-nums font-semibold text-[#243B8A]">
              0{activeHeroIndex + 1} / 0{books.length}
            </span>
            <button
              type="button"
              onClick={() => {
                const nextIdx = (activeHeroIndex + 1) % books.length;
                if (books[nextIdx]) switchBook(books[nextIdx].id);
              }}
              aria-label={isMr ? 'पुढील पुस्तक' : 'Next edition'}
              className="w-9 h-9 rounded-full border border-[#DCD4C0] hover:border-[#243B8A] text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Interactive Plinth Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8 pt-6">
          {/* Left/Center 6 Cols: Interactive 3D Tilt Stage / Full Spread / Open-Book Peek */}
          <div
            ref={stageRef}
            onMouseMove={handleStageMouseMove}
            onMouseLeave={handleStageMouseLeave}
            className="lg:col-span-6 relative rounded-2xl bg-gradient-to-b from-[#FAF6EC]/85 to-[#F3EDE0]/60 border border-[#E5DEC9]/80 px-4 py-6 sm:py-8 min-h-[275px] sm:min-h-[320px] flex items-center justify-center overflow-hidden [perspective:1200px]"
          >
            {/* Soft Studio Floor Grounding Shadow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 w-[58%] h-5 rounded-full bg-[#1C1917]/15 blur-lg"
            />

            <AnimatePresence mode="wait">
              {effectiveMode === 'jacket' && activeHeroBook.coverSpreadUrl ? (
                <motion.div
                  key={`spread-showcase-${activeHeroBook.id}`}
                  initial={{ opacity: 0, rotateX: 8, scale: 0.96 }}
                  animate={{ opacity: 1, rotateX: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateX: -8, scale: 0.96 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-30 w-full space-y-2.5"
                >
                  <img
                    src={resolvePublicAssetUrl(activeHeroBook.coverSpreadUrl)}
                    alt={activeHeroBook.title}
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[215px] object-contain mx-auto rounded-lg shadow-md"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#57534E] px-1">
                    <span>
                      {activeHeroBook.isbn ? `ISBN ${activeHeroBook.isbn}` : 'Print Wraparound Spread'}
                    </span>
                    {activeHeroBook.coverPdfUrl && (
                      <a
                        href={resolvePublicAssetUrl(activeHeroBook.coverPdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#243B8A] hover:underline"
                      >
                        {isMr ? 'मूळ कव्हर PDF ↗' : 'Open Press PDF ↗'}
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : effectiveMode === 'pages' ? (
                <motion.div
                  key={`open-pages-${activeHeroBook.id}`}
                  initial={{ opacity: 0, rotateY: -18, scale: 0.95 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 18, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-30 w-full max-w-[440px] rounded-xl bg-[#FFFDF7] border border-[#DCD4C0] shadow-[0_18px_36px_-18px_rgba(28,25,23,0.28)] grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DEC9]"
                >
                  {/* Left Folio Page */}
                  <div className="p-4 sm:p-5 space-y-2.5 text-left">
                    <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#9A3412] font-semibold">
                      {isMr ? 'अकथ ग्रंथ परिचय' : 'Inside the Edition'}
                    </p>
                    <p className="font-serif text-base font-bold text-[#1C1917] leading-snug">
                      {activeTitle}
                    </p>
                    <p className="text-xs font-serif text-[#57534E]">
                      {activeAuthorName}
                    </p>
                    <div className="pt-2 border-t border-[#E5DEC9]/70 space-y-1 text-[11px] font-mono text-[#57534E] tabular-nums">
                      <p>
                        {isMr ? 'पृष्ठसंख्या' : 'Extent'}:{' '}
                        <strong className="text-[#1C1917]">
                          {activeHeroBook.pageCount || '—'} {isMr ? 'पृष्ठे' : 'pp.'}
                        </strong>
                      </p>
                      <p>
                        {isMr ? 'आवृत्ती' : 'Imprint'}:{' '}
                        <strong className="text-[#1C1917]">Nanded First Print</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right Folio Excerpt Page */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-[#FAF6EC]/50 text-left">
                    <div className="space-y-2">
                      <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#243B8A] font-semibold">
                        {isMr ? 'पुस्तकाविषयी' : 'Editorial Note'}
                      </p>
                      <p className="text-[12.5px] font-serif text-[#292524] leading-relaxed line-clamp-4">
                        {activeBlurb}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/books/${activeHeroBook.slug}`)}
                      className="text-left text-[11.5px] font-semibold text-[#243B8A] hover:underline cursor-pointer"
                    >
                      {isMr ? 'प्रथम पृष्ठ व नमुना वाचा →' : 'Read full details & sample →'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`hero-book-3d-${activeHeroBook.id}`}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-20 w-full flex items-center justify-center"
                >
                  {/* Flanking Left Companion Edition (Clickable 3D Wing) */}
                  {secondaryBooks[0] && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05, rotateY: -6, x: -4 }}
                      onClick={() => switchBook(secondaryBooks[0].id)}
                      aria-label={
                        isMr
                          ? `${secondaryBooks[0].title} पहा`
                          : `Switch to ${
                              bookEnglishMeta[secondaryBooks[0].id]?.titleEn ||
                              secondaryBooks[0].title
                            }`
                      }
                      className="hidden sm:block absolute left-3 lg:left-4 w-[96px] lg:w-[108px] -rotate-6 opacity-75 hover:opacity-100 transition-opacity cursor-pointer z-10 rounded-sm shadow-[0_14px_26px_-10px_rgba(28,25,23,0.34)]"
                    >
                      <BookCoverArt
                        book={secondaryBooks[0]}
                        author={authors.find(
                          (a) => a.id === secondaryBooks[0].authorId
                        )}
                        size="md"
                      />
                    </motion.button>
                  )}

                  {/* Center Interactive 3D Physical Hard-Spine Book */}
                  <div
                    className="relative z-30 transition-transform duration-200 ease-out cursor-pointer"
                    style={{
                      transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                      transformStyle: 'preserve-3d',
                    }}
                    onClick={() => onNavigate(`/books/${activeHeroBook.slug}`)}
                  >
                    <div className="relative w-[150px] sm:w-[178px] rounded-r-md shadow-[0_26px_38px_-14px_rgba(28,25,23,0.34)]">
                      {/* Tactile Book Spine & Page Edge Depth */}
                      <div
                        aria-hidden="true"
                        className="absolute -right-2 top-1 bottom-1 w-2.5 rounded-r-sm bg-gradient-to-r from-[#EFE9DB] via-[#FAF6EC] to-[#DCD4C0] border-y border-r border-[#C8BFA8]"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent rounded-l-sm pointer-events-none z-20"
                      />

                      <BookCoverArt
                        book={activeHeroBook}
                        author={activeHeroAuthor}
                        size="lg"
                        priority={true}
                      />

                      {/* Dynamic Cursor Light Sheen */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-sm z-20 transition-opacity duration-200"
                        style={{
                          background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.28) 0%, transparent 58%)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Flanking Right Companion Edition (Clickable 3D Wing) */}
                  {secondaryBooks[1] && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05, rotateY: 6, x: 4 }}
                      onClick={() => switchBook(secondaryBooks[1].id)}
                      aria-label={
                        isMr
                          ? `${secondaryBooks[1].title} पहा`
                          : `Switch to ${
                              bookEnglishMeta[secondaryBooks[1].id]?.titleEn ||
                              secondaryBooks[1].title
                            }`
                      }
                      className="hidden sm:block absolute right-3 lg:right-4 w-[96px] lg:w-[108px] rotate-6 opacity-75 hover:opacity-100 transition-opacity cursor-pointer z-20 rounded-sm shadow-[0_14px_26px_-10px_rgba(28,25,23,0.34)]"
                    >
                      <BookCoverArt
                        book={secondaryBooks[1]}
                        author={authors.find(
                          (a) => a.id === secondaryBooks[1].authorId
                        )}
                        size="md"
                      />
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subtle Interactive Hint Strip */}
            <p className="pointer-events-none hidden sm:block absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.14em] text-[#78716C]/80 whitespace-nowrap">
              {effectiveMode === 'cover3d'
                ? isMr
                  ? 'पुस्तक फिरवण्यासाठी कर्सर हलवा किंवा कव्हरवर क्लिक करा'
                  : 'Move cursor to tilt · Click side books to switch'
                : isMr
                ? 'अधिक तपशीलासाठी आवृत्ती निवडा'
                : 'Switch views above or select another edition'}
            </p>
          </div>

          {/* Right 6 Cols: Editorial Synopsis, Specs & Instant Reader Actions */}
          <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`hero-copy-${activeHeroBook.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <h2
                    onClick={() => onNavigate(`/books/${activeHeroBook.slug}`)}
                    className="text-xl sm:text-2xl lg:text-[26px] font-serif not-italic font-semibold text-[#1C1917] hover:text-[#243B8A] transition-colors cursor-pointer leading-snug"
                  >
                    {activeTitle}
                  </h2>
                  {activeAuthorName && (
                    <p className="text-sm font-serif not-italic text-[#57534E]">
                      {activeAuthorName}
                    </p>
                  )}
                </div>

                <p
                  data-testid="featured-edition-blurb"
                  className="text-[14px] sm:text-[15px] text-[#525665] font-serif not-italic leading-relaxed line-clamp-3 max-w-[48ch] mx-auto lg:mx-0"
                >
                  {activeBlurb}
                </p>

                {/* Clean Typographic Metadata Strip */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-xs text-[#57534E] font-mono tabular-nums pt-0.5">
                  <span>
                    {isMr
                      ? 'पेपरबॅक'
                      : activeHeroEnMeta?.formatEn || 'Paperback'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {activeHeroBook.pageCount
                      ? `${activeHeroBook.pageCount} ${isMr ? 'पृष्ठे' : 'Pages'}`
                      : '—'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#243B8A]">
                    ₹{activeHeroBook.price}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Primary Actions: Add to Bag & View Full Edition */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => onNavigate(`/books/${activeHeroBook.slug}`)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-medium bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#FFD966]" />
                <span>{isMr ? 'पुस्तक पहा →' : 'View Edition →'}</span>
              </button>

              <button
                type="button"
                onClick={() => onAddToCart(activeHeroBook.id)}
                className={`inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-full text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isAdded
                    ? 'bg-[#174D3A] text-[#FFFDF7] border-[#174D3A]'
                    : 'bg-[#FAF6EC] hover:bg-[#E5DEC9]/65 text-[#1C1917] border-[#DCD4C0]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isMr ? 'पिशवीत जोडले' : 'Added to Bag'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#243B8A]" />
                    <span>{isMr ? 'पिशवीत जोडा' : 'Add to Bag'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
