import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  BookOpen,
  Feather,
  Check,
  ShoppingBag,
  FileEdit,
  CheckCircle2,
  Layers,
  Library,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookRecord,
  AuthorRecord,
  EditorialArticle,
  FirstPageExcerpt,
} from '../types/publishing';
import { resolvePublicAssetUrl } from '../utils/githubPagesAdapter';
import { BookCoverArt } from '../components/BookCoverArt';
import { useLanguage } from '../i18n/translations';

/**
 * IntersectionObserver hook for subtle section reveals
 */
function useIntersectionReveal<T extends HTMLElement>(
  options: IntersectionObserverInit = {
    threshold: 0.08,
    rootMargin: '0px 0px -24px 0px',
  }
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
          break;
        }
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return [ref, isVisible];
}

interface HomeViewProps {
  books: BookRecord[];
  authors: AuthorRecord[];
  articles: EditorialArticle[];
  excerpts: FirstPageExcerpt[];
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string) => void;
  recentlyAddedBookId?: string | null;
}

/**
 * Clean English metadata for English mode (`lang === 'en'`).
 * In Marathi mode (`lang === 'mr'`), native Marathi fields are used directly
 * without appending literal English translations underneath.
 */
const BOOK_ENGLISH_META: Record<
  string,
  {
    titleEn: string;
    authorEn: string;
    categoryEn: string;
    descriptionEn: string;
    formatEn: string;
  }
> = {
  'book-scholar-juice': {
    titleEn: 'Scholar Juice',
    authorEn: 'G. K. Ainapure',
    categoryEn: 'Long Short Stories',
    descriptionEn:
      'A deeply layered collection of contemporary long short stories exploring social realities, intellectual life, and human relationships with rare narrative precision.',
    formatEn: 'Paperback',
  },
  'book-dhukyachi-dulai': {
    titleEn: 'Dhukyachi Dulai',
    authorEn: 'Anuratna Waghmare',
    categoryEn: 'Travelogue',
    descriptionEn:
      'An evocative literary journey through the mist-laden valleys, monasteries, and quiet human rhythms of Bhutan, seen through a contemplative lens.',
    formatEn: 'Paperback',
  },
  'book-lokshahimadhye-samajmadhyamancha-vapar': {
    titleEn: 'Social Media in Democracy',
    authorEn: 'Akhilesh Pandit Yelkadre',
    categoryEn: 'Non-Fiction & Research',
    descriptionEn:
      'A rigorous examination of how digital platforms and social media shape public opinion, civic participation, and contemporary democratic institutions.',
    formatEn: 'Paperback',
  },
};

const PUBLISHING_CAPABILITIES = [
  {
    number: '01',
    titleEn: 'Manuscript Development',
    titleMr: 'हस्तलिखित विकास',
    descriptionEn:
      'Working with authors to shape, review and prepare manuscripts.',
    descriptionMr:
      'लेखकांसोबत संवाद साधून हस्तलिखिताची रचना, आशय आणि मांडणी प्रकाशनयोग्य करणे.',
    deliverableEn: 'Developmental Review',
    deliverableMr: 'संहिता मार्गदर्शन',
    Icon: FileEdit,
  },
  {
    number: '02',
    titleEn: 'Editing & Proofreading',
    titleMr: 'संपादन आणि मुद्रितशोधन',
    descriptionEn:
      'Improving language, structure, consistency and readability.',
    descriptionMr:
      'भाषा, वाक्यरचना, सुसूत्रता आणि वाचनसुलभता अधिक अचूक व समृद्ध करणे.',
    deliverableEn: 'Editorial Precision',
    deliverableMr: 'भाषासंस्कार व मुद्रितशोधन',
    Icon: CheckCircle2,
  },
  {
    number: '03',
    titleEn: 'Book Design & Production',
    titleMr: 'पुस्तक आरेखन आणि निर्मिती',
    descriptionEn:
      'Cover design, typesetting, layout and print preparation.',
    descriptionMr:
      'आशयघन मुखपृष्ठ, देवनागरी अक्षरजुळणी, अंतर्गत मांडणी आणि छपाई पूर्वतयारी.',
    deliverableEn: 'Cover & Typesetting',
    deliverableMr: 'मुखपृष्ठ व अक्षरजुळणी',
    Icon: Layers,
  },
  {
    number: '04',
    titleEn: 'Publishing & Distribution',
    titleMr: 'प्रकाशन आणि वितरण',
    descriptionEn:
      'Publishing books and making them accessible to readers through available channels.',
    descriptionMr:
      'अधिकृत ISBN सह पुस्तके प्रकाशित करून ती उपलब्ध माध्यमांद्वारे वाचकांपर्यंत पोहोचवणे.',
    deliverableEn: 'ISBN-13 & Print Release',
    deliverableMr: 'ISBN व वाचक वितरण',
    Icon: Library,
  },
];

const PUBLISHING_JOURNEY_STAGES = [
  {
    step: '01',
    label: 'DISCOVER',
    descriptionEn: 'An author shares an idea or manuscript.',
    descriptionMr: 'लेखक आपली कल्पना किंवा हस्तलिखित संपादकीय कक्षाकडे पाठवतो.',
    milestoneEn: 'Stage 01 · Submission',
    milestoneMr: 'टप्पा ०१ · संहिता सादरीकरण',
  },
  {
    step: '02',
    label: 'REVIEW',
    descriptionEn: 'The manuscript is evaluated for publishing suitability.',
    descriptionMr: 'प्रकाशनयोग्यता आणि वाङ्मयीन गुणवत्तेसाठी संहितेचे परीक्षण केले जाते.',
    milestoneEn: 'Stage 02 · Evaluation',
    milestoneMr: 'टप्पा ०२ · वाङ्मयीन मूल्यमापन',
  },
  {
    step: '03',
    label: 'DEVELOP',
    descriptionEn: 'Editing, proofreading and manuscript preparation.',
    descriptionMr: 'संपादन, मुद्रितशोधन आणि अंतिम संहिता सज्जता केली जाते.',
    milestoneEn: 'Stage 03 · Editorial',
    milestoneMr: 'टप्पा ०३ · संपादन संस्कार',
  },
  {
    step: '04',
    label: 'PRODUCE',
    descriptionEn: 'Design, typesetting and printing.',
    descriptionMr: 'मुखपृष्ठ आरेखन, अक्षरजुळणी आणि दर्जेदार छपाई केली जाते.',
    milestoneEn: 'Stage 04 · Production',
    milestoneMr: 'टप्पा ०४ · मुद्रण निर्मिती',
  },
  {
    step: '05',
    label: 'PUBLISH',
    descriptionEn: 'The finished book reaches readers.',
    descriptionMr: 'तयार झालेले पुस्तक वाचकांच्या हाती पोहोचते.',
    milestoneEn: 'Stage 05 · Release',
    milestoneMr: 'टप्पा ०५ · ग्रंथ प्रकाशन',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  books,
  authors,
  onNavigate,
  onAddToCart,
  recentlyAddedBookId,
}) => {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';

  const [selectedBookId, setSelectedBookId] = useState<string>(
    books[0]?.id || 'book-scholar-juice'
  );
  const [showFullSpread, setShowFullSpread] = useState<boolean>(false);

  const [heroRef, isHeroVisible] = useIntersectionReveal<HTMLElement>();
  const [whatWeDoRef, isWhatWeDoVisible] = useIntersectionReveal<HTMLElement>();
  const [howWePublishRef, isHowWePublishVisible] =
    useIntersectionReveal<HTMLElement>();
  const [ourBooksRef, isOurBooksVisible] = useIntersectionReveal<HTMLElement>();
  const [forAuthorsRef, isForAuthorsVisible] =
    useIntersectionReveal<HTMLElement>();
  const [aboutAkathRef, isAboutAkathVisible] =
    useIntersectionReveal<HTMLElement>();

  const activeHeroBook =
    books.find((b) => b.id === selectedBookId) || books[0];
  const activeHeroAuthor = activeHeroBook
    ? authors.find((a) => a.id === activeHeroBook.authorId)
    : undefined;
  const activeHeroEnMeta = activeHeroBook
    ? BOOK_ENGLISH_META[activeHeroBook.id]
    : undefined;

  // Arrange books for the non-grid sculptural hero composition:
  // Center spotlight is activeHeroBook; flanking wings are the remaining books
  const secondaryBooks = books.filter((b) => b.id !== activeHeroBook?.id);

  return (
    <div className="bg-[#FFFDF7] text-[#1C1917]">
      {/* =====================================================================
          1. HERO — FULL-PRESENCE DESKTOP & ABOVE-THE-FOLD LITERARY PUBLISHER STAGE
          ===================================================================== */}
      <section
        ref={heroRef}
        data-testid="home-publishing-hero"
        className={`akath-io-section ${
          isHeroVisible ? 'is-visible' : ''
        } relative overflow-hidden border-b border-[#DCD4C0] bg-[#FAF6EC] pt-4 sm:pt-6 lg:pt-10 xl:pt-12 pb-6 sm:pb-8 lg:pb-12 xl:pb-14 lg:min-h-[600px] xl:min-h-[650px] flex items-center`}
      >
        {/* Subtle Warm Editorial Atmosphere */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 58% 65% at 74% 46%, rgba(255, 217, 102, 0.20) 0%, rgba(36, 59, 138, 0.05) 52%, transparent 80%)',
          }}
        />

        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          {/* Top Literary Imprint Eyebrow (Clean Single-Line Editorial Metadata) */}
          <div className="flex items-center justify-between gap-4 pb-3 lg:pb-4 mb-4 sm:mb-6 lg:mb-8 border-b border-[#DCD4C0]">
            <div className="inline-flex items-center gap-2.5">
              <span className="text-[11px] sm:text-xs font-mono not-italic font-bold uppercase tracking-[0.18em] text-[#243B8A]">
                मराठी प्रकाशन संस्था
              </span>
              <span aria-hidden="true" className="text-[#C89D54]">
                ·
              </span>
              <span className="text-[11px] sm:text-xs font-mono not-italic font-semibold uppercase tracking-[0.15em] text-[#57534E]">
                {isMr ? 'नांदेड, महाराष्ट्र' : 'AKATH PRAKASHAN · NANDED'}
              </span>
            </div>
          </div>

          {/* Free-Flowing Asymmetric Publisher Composition */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 lg:gap-12 xl:gap-14">
            {/* Left Literary Identity Column */}
            <div className="w-full lg:w-[54%] shrink-0 space-y-4 sm:space-y-5 lg:space-y-6">
              <div className="space-y-2.5 sm:space-y-3.5 lg:space-y-4">
                {/* Signature Marathi Publisher Identity Headline (Bold, Upright Editorial Serif — Zero Italics) */}
                <h1
                  data-testid="home-hero-main-headline"
                  className="text-[2rem] sm:text-[2.75rem] lg:text-[3.7rem] xl:text-[4.25rem] font-serif not-italic font-extrabold text-[#1C1917] leading-[1.08] tracking-[-0.025em] [text-wrap:balance]"
                >
                  शब्दांना पुस्तकाचं रूप देणारी{' '}
                  <span className="text-[#243B8A]">प्रकाशन संस्था.</span>
                </h1>

                {/* Bold Upright Editorial Supporting Line (Zero Italics) */}
                <p
                  data-testid="home-hero-supporting-line"
                  className="text-[17px] sm:text-xl lg:text-2xl xl:text-[26px] font-serif not-italic font-bold tracking-[-0.01em] text-[#243B8A] leading-[1.3]"
                >
                  Discovering stories. Developing manuscripts. Publishing books.
                </p>
              </div>

              {/* Concise Editorial Lead (Bold Upright Readability — Zero Italics) */}
              <p className="text-sm sm:text-base lg:text-[17px] font-sans not-italic font-medium text-[#292524] leading-[1.65] max-w-[54ch]">
                {isMr
                  ? 'आम्ही लेखकांसोबत काम करून त्यांच्या कल्पना आणि हस्तलिखितांचे विचारपूर्वक घडवलेल्या पुस्तकांत रूपांतर करतो.'
                  : 'We work with writers to transform ideas and manuscripts into thoughtfully produced books.'}
              </p>

              {/* Primary & Secondary Publisher Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="inline-flex items-center gap-2.5 px-5 sm:px-6 lg:px-7 py-2.5 sm:py-3 lg:py-3.5 rounded-lg bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] font-semibold text-xs sm:text-sm lg:text-[15px] shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-4 h-4 text-[#FFD966]" />
                  <span>{isMr ? 'आमची पुस्तके पहा' : 'Explore Our Books'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/submit-manuscript')}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 lg:px-7 py-2.5 sm:py-3 lg:py-3.5 rounded-lg bg-transparent hover:bg-[#1C1917] text-[#1C1917] hover:text-[#FFFDF7] border border-[#1C1917] font-semibold text-xs sm:text-sm lg:text-[15px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Feather className="w-4 h-4 text-[#EF6855]" />
                  <span>
                    {isMr ? 'आमच्यासोबत प्रकाशित करा' : 'Publish With Us'}
                  </span>
                </button>
              </div>

              {/* Interactive Edition Selector Strip */}
              <div className="pt-3.5 lg:pt-4 border-t border-[#DCD4C0] flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] lg:text-[11px] font-mono uppercase tracking-[0.16em] text-[#57534E] mr-1">
                  {isMr ? 'प्रकाशित पुस्तके:' : 'Catalogue Anchors:'}
                </span>
                {books.map((book, idx) => {
                  const isSelected = book.id === activeHeroBook?.id;
                  const enMeta = BOOK_ENGLISH_META[book.id];
                  return (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => {
                        setSelectedBookId(book.id);
                        setShowFullSpread(false);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-serif transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#243B8A] text-[#FFFDF7] font-semibold shadow-2xs'
                          : 'bg-[#FFFDF7] text-[#1C1917] border border-[#DCD4C0] hover:border-[#243B8A]'
                      }`}
                    >
                      <span className="font-mono text-[10px] opacity-75 tabular-nums">
                        0{idx + 1}
                      </span>
                      <span>
                        {isMr ? book.title : enMeta?.titleEn || book.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Visual Anchor: Sculptural Non-Grid Book Cover Installation */}
            {activeHeroBook && (
              <div
                data-testid="home-featured-edition-dossier"
                className="w-full lg:w-[44%] relative flex flex-col items-center"
              >
                {/* Warm Archival Pedestal Halo */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 w-[250px] h-[250px] sm:w-[290px] sm:h-[290px] lg:w-[360px] lg:h-[360px] xl:w-[390px] xl:h-[390px] rounded-full border border-[#DCD4C0] bg-gradient-to-b from-[#FFFDF7] via-[#F7F3E8] to-[#EFE7D4] shadow-inner"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[274px] h-[274px] sm:w-[318px] sm:h-[318px] lg:w-[392px] lg:h-[392px] xl:w-[424px] xl:h-[424px] rounded-full border border-dashed border-[#C89D54]/50"
                />

                <AnimatePresence mode="wait">
                  {showFullSpread && activeHeroBook.coverSpreadUrl ? (
                    <motion.div
                      key="spread-showcase"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-30 w-full max-w-[460px] lg:max-w-[520px] rounded-xl bg-[#FFFDF7] border border-[#DCD4C0] p-4 sm:p-5 shadow-lg space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5DEC9]">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#243B8A]">
                          {isMr
                            ? `${activeHeroBook.title} — पूर्ण वेष्टन`
                            : `${
                                activeHeroEnMeta?.titleEn ||
                                activeHeroBook.title
                              } — Full Print Jacket`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFullSpread(false)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#243B8A] text-[#FFFDF7] cursor-pointer"
                        >
                          {isMr ? 'मुखपृष्ठ पहा' : 'Back to Covers'}
                        </button>
                      </div>

                      <img
                        src={resolvePublicAssetUrl(
                          activeHeroBook.coverSpreadUrl
                        )}
                        alt={activeHeroBook.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto max-h-[220px] lg:max-h-[270px] object-contain mx-auto"
                      />

                      <div className="flex items-center justify-between text-[11px] text-[#57534E] pt-0.5">
                        <span>
                          {activeHeroBook.isbn
                            ? `ISBN ${activeHeroBook.isbn}`
                            : ''}
                        </span>
                        {activeHeroBook.coverPdfUrl && (
                          <a
                            href={resolvePublicAssetUrl(
                              activeHeroBook.coverPdfUrl
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#243B8A] hover:underline"
                          >
                            {isMr ? 'मूळ कव्हर PDF ↗' : 'Open Press PDF ↗'}
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sculptural-book-triptych"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-20 w-full max-w-[460px] lg:max-w-[540px] xl:max-w-[580px] h-[230px] sm:h-[268px] lg:h-[345px] xl:h-[375px] flex items-center justify-center"
                    >
                      {/* Secondary Cover Anchor 1 (Left Tilted Wing) */}
                      {secondaryBooks[0] && (
                        <div
                          onClick={() => {
                            setSelectedBookId(secondaryBooks[0].id);
                            setShowFullSpread(false);
                          }}
                          title={
                            isMr
                              ? secondaryBooks[0].title
                              : BOOK_ENGLISH_META[secondaryBooks[0].id]
                                  ?.titleEn || secondaryBooks[0].title
                          }
                          className="absolute left-3 sm:left-8 lg:left-6 top-6 lg:top-8 w-[108px] sm:w-[130px] lg:w-[158px] xl:w-[172px] -rotate-8 opacity-90 hover:opacity-100 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer z-10"
                        >
                          <BookCoverArt
                            book={secondaryBooks[0]}
                            author={authors.find(
                              (a) => a.id === secondaryBooks[0].authorId
                            )}
                            size="md"
                          />
                        </div>
                      )}

                      {/* Primary Foreground Cover Anchor (Center Elevated) */}
                      <div className="relative z-30 w-[148px] sm:w-[176px] lg:w-[212px] xl:w-[228px] -translate-y-2 transition-transform duration-300 hover:-translate-y-3">
                        <BookCoverArt
                          book={activeHeroBook}
                          author={activeHeroAuthor}
                          size="lg"
                          onClick={() =>
                            onNavigate(`/books/${activeHeroBook.slug}`)
                          }
                        />
                      </div>

                      {/* Secondary Cover Anchor 2 (Right Tilted Wing) */}
                      {secondaryBooks[1] && (
                        <div
                          onClick={() => {
                            setSelectedBookId(secondaryBooks[1].id);
                            setShowFullSpread(false);
                          }}
                          title={
                            isMr
                              ? secondaryBooks[1].title
                              : BOOK_ENGLISH_META[secondaryBooks[1].id]
                                  ?.titleEn || secondaryBooks[1].title
                          }
                          className="absolute right-3 sm:right-8 lg:right-6 top-8 lg:top-10 w-[108px] sm:w-[130px] lg:w-[158px] xl:w-[172px] rotate-8 opacity-90 hover:opacity-100 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer z-20"
                        >
                          <BookCoverArt
                            book={secondaryBooks[1]}
                            author={authors.find(
                              (a) => a.id === secondaryBooks[1].authorId
                            )}
                            size="md"
                          />
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating Literary Caption Plaque Under the Book Covers */}
                <div className="relative z-30 w-full max-w-[440px] lg:max-w-[500px] -mt-2 rounded-xl bg-[#FFFDF7] border border-[#DCD4C0] px-4 sm:px-5 py-3 sm:py-3.5 shadow-sm space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-[#174D3A]">
                        <Sparkles className="w-3 h-3 text-[#243B8A]" />
                        <span>
                          {isMr
                            ? activeHeroBook.category
                            : activeHeroEnMeta?.categoryEn ||
                              activeHeroBook.category}
                        </span>
                      </div>
                      <h2
                        onClick={() =>
                          onNavigate(`/books/${activeHeroBook.slug}`)
                        }
                        className="text-base sm:text-lg lg:text-xl font-serif not-italic font-bold text-[#1C1917] hover:text-[#243B8A] transition-colors cursor-pointer leading-tight"
                      >
                        {isMr
                          ? activeHeroBook.title
                          : activeHeroEnMeta?.titleEn || activeHeroBook.title}
                      </h2>
                      {activeHeroAuthor && (
                        <p className="text-[11.5px] lg:text-xs font-serif not-italic text-[#57534E]">
                          {isMr
                            ? activeHeroAuthor.name
                            : activeHeroEnMeta?.authorEn ||
                              activeHeroAuthor.transliteratedName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {activeHeroBook.coverSpreadUrl && (
                        <button
                          type="button"
                          data-testid="toggle-featured-jacket-spread"
                          onClick={() => setShowFullSpread((prev) => !prev)}
                          className="px-2.5 py-1.5 rounded-md text-[10.5px] font-mono font-semibold uppercase tracking-wider bg-[#F7F3E8] hover:bg-[#FFD966]/40 text-[#243B8A] border border-[#DCD4C0] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {showFullSpread
                            ? isMr
                              ? 'मुखपृष्ठ'
                              : 'Cover'
                            : isMr
                            ? 'पूर्ण वेष्टन'
                            : 'Full Jacket'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(`/books/${activeHeroBook.slug}`)
                        }
                        className="px-3 py-1.5 rounded-md text-[11.5px] font-semibold bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {isMr ? 'पुस्तक पहा →' : 'View Edition →'}
                      </button>
                    </div>
                  </div>

                  <p
                    data-testid="featured-edition-blurb"
                    className="text-xs text-[#525665] font-serif not-italic leading-snug line-clamp-1 pt-1.5 border-t border-[#E5DEC9]"
                  >
                    {isMr
                      ? activeHeroBook.description
                      : activeHeroEnMeta?.descriptionEn ||
                        activeHeroBook.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. WHAT WE DO — PUBLISHING CAPABILITIES
          (Horizontally Swipable Snap-Point Rail on Mobile/Tablet, 4 Cols on Desktop)
          ===================================================================== */}
      <section
        ref={whatWeDoRef}
        data-testid="home-what-we-do"
        className={`akath-io-section ${
          isWhatWeDoVisible ? 'is-visible' : ''
        } py-9 sm:py-12 lg:py-16 border-b border-[#E5DEC9] bg-[#FFFDF7]`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-4 border-b border-[#E5DEC9] pb-3.5 sm:pb-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between md:justify-start gap-3">
                <p className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#174D3A]">
                  {isMr ? '०१ · प्रकाशन कार्यकक्षा' : '01 · WHAT WE DO'}
                </p>
                <span className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF6EC] border border-[#DCD4C0] text-[10px] font-mono font-semibold text-[#243B8A]">
                  {isMr ? 'स्वाइप करा →' : 'Swipe →'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif not-italic font-bold text-[#1C1917] tracking-tight">
                From Manuscript to Bookshelf.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#525665] max-w-md">
              {isMr
                ? 'हस्तलिखिताच्या पहिल्या मसुद्यापासून वाचकांच्या हातातील पुस्तकापर्यंत संपूर्ण संपादकीय आणि मुद्रण प्रक्रिया.'
                : 'Four core capabilities that take a writer’s manuscript from raw draft to a finished book in print.'}
            </p>
          </div>

          {/* Horizontally Swipable Touch-Friendly Snap Rail on Mobile & Tablet (<lg), 4-Col Grid on Desktop (lg+) */}
          <div
            data-testid="what-we-do-swipe-rail"
            className="akath-swipe-rail flex lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory touch-pan-x scroll-smooth no-scrollbar gap-3.5 sm:gap-4 lg:gap-6 items-stretch -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 pb-2 lg:pb-0"
          >
            {PUBLISHING_CAPABILITIES.map((item) => {
              const IconComponent = item.Icon;
              return (
                <article
                  key={item.number}
                  data-testid={`capability-card-${item.number}`}
                  className="snap-start shrink-0 w-[80vw] max-w-[290px] sm:w-[300px] sm:max-w-[310px] lg:w-auto lg:max-w-none h-full min-h-[168px] sm:min-h-[188px] lg:min-h-[225px] rounded-xl border border-[#DCD4C0] hover:border-[#243B8A] bg-[#FAF6EC] p-4 sm:p-5 lg:p-6 flex flex-col justify-between transition-colors"
                >
                  {/* Top Row: Step Number + Icon */}
                  <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#E5DEC9]">
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#243B8A] tabular-nums">
                      {item.number} —
                    </span>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FFFDF7] border border-[#DCD4C0] flex items-center justify-center text-[#243B8A] shrink-0">
                      <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                  </div>

                  {/* Middle Row: Equalized Title & Single Description */}
                  <div className="py-3 sm:py-4 flex-1 flex flex-col justify-start space-y-1.5">
                    <h3 className="text-base sm:text-lg lg:text-xl font-serif not-italic font-bold text-[#1C1917] leading-snug">
                      {isMr ? item.titleMr : item.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#525665] leading-relaxed">
                      {isMr ? item.descriptionMr : item.descriptionEn}
                    </p>
                  </div>

                  {/* Bottom Pinned Row */}
                  <div className="pt-2.5 border-t border-[#E5DEC9] flex items-center justify-between text-[10.5px] sm:text-[11px] font-mono uppercase tracking-[0.12em] text-[#174D3A]">
                    <span className="truncate">
                      {isMr ? item.deliverableMr : item.deliverableEn}
                    </span>
                    <span aria-hidden="true" className="shrink-0 ml-1">
                      →
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. HOW WE PUBLISH — HORIZONTAL SNAP-POINT RAIL ON MOBILE/TABLET, 5 COLS ON DESKTOP
          ===================================================================== */}
      <section
        ref={howWePublishRef}
        data-testid="home-how-we-publish"
        className={`akath-io-section ${
          isHowWePublishVisible ? 'is-visible' : ''
        } py-9 sm:py-12 lg:py-16 border-b border-[#1B2D6B] bg-[#1D2F6F] text-[#FFFDF7]`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-4 border-b border-[#FFFDF7]/15 pb-3.5 sm:pb-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between md:justify-start gap-3">
                <p className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#FFD966]">
                  {isMr ? '०२ · प्रकाशन प्रवास' : '02 · HOW WE PUBLISH'}
                </p>
                <span className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#243B8A] border border-[#FFD966]/40 text-[10px] font-mono font-semibold text-[#FFD966]">
                  {isMr ? 'स्वाइप करा →' : 'Swipe →'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif not-italic font-bold text-[#FFFDF7] tracking-tight">
                An Idea Becomes a Book.
              </h2>
            </div>

            <p className="text-[10.5px] sm:text-xs font-mono uppercase tracking-[0.14em] text-[#FFFDF7]/75">
              01 DISCOVER → 02 REVIEW → 03 DEVELOP → 04 PRODUCE → 05 PUBLISH
            </p>
          </div>

          {/* Horizontally Swipable Snap Rail on Mobile & Tablet (<lg), 5-Col Equal Grid on Desktop (lg+) */}
          <ol
            data-testid="how-we-publish-swipe-rail"
            className="akath-swipe-rail flex lg:grid lg:grid-cols-5 overflow-x-auto lg:overflow-visible snap-x snap-mandatory touch-pan-x scroll-smooth no-scrollbar gap-3 sm:gap-4 lg:gap-5 items-stretch -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 pb-2 lg:pb-0"
          >
            {PUBLISHING_JOURNEY_STAGES.map((stage, idx) => (
              <li
                key={stage.step}
                data-testid={`publishing-journey-step-${stage.step}`}
                className="snap-start shrink-0 w-[75vw] max-w-[260px] sm:w-[250px] sm:max-w-[260px] lg:w-auto lg:max-w-none h-full flex flex-col"
              >
                <div className="h-full min-h-[152px] sm:min-h-[172px] lg:min-h-[205px] rounded-xl bg-[#243B8A] border border-[#FFFDF7]/20 hover:border-[#FFD966] p-4 sm:p-5 flex flex-col justify-between transition-colors">
                  {/* Top Row: Step Badge & Connector */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#FFFDF7]/15">
                    <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#FFD966] text-[#1C1917] font-mono text-xs font-bold tabular-nums">
                      {stage.step}
                    </span>
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#FFD966]/90">
                      {idx < PUBLISHING_JOURNEY_STAGES.length - 1
                        ? `STEP ${stage.step} →`
                        : `STEP ${stage.step} ✓`}
                    </span>
                  </div>

                  {/* Middle Row: Stage Title & 1-Sentence Explanation */}
                  <div className="py-3 flex-1 flex flex-col justify-start space-y-1.5">
                    <h3 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.12em] text-[#FFFDF7]">
                      {stage.step}. {stage.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#FFFDF7]/85 leading-relaxed">
                      {isMr ? stage.descriptionMr : stage.descriptionEn}
                    </p>
                  </div>

                  {/* Bottom Pinned Row: Milestone Tag */}
                  <div className="pt-2.5 border-t border-[#FFFDF7]/15 text-[10.5px] font-mono uppercase tracking-[0.12em] text-[#FFD966]/85 truncate">
                    {isMr ? stage.milestoneMr : stage.milestoneEn}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* =====================================================================
          4. OUR BOOKS — SWIPABLE SNAP RAIL ON MOBILE/TABLET, 3 EQUAL CARDS ON DESKTOP
          ===================================================================== */}
      <section
        ref={ourBooksRef}
        data-testid="home-published-books"
        className={`akath-io-section ${
          isOurBooksVisible ? 'is-visible' : ''
        } py-10 sm:py-14 lg:py-20 border-b border-[#E5DEC9] bg-[#FFFDF7]`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6 sm:space-y-8 lg:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3.5 sm:gap-4 border-b border-[#E5DEC9] pb-4 sm:pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#174D3A]">
                  {isMr ? '०३ · प्रकाशित ग्रंथसूची' : '03 · OUR BOOKS'}
                </p>
                <span className="lg:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF6EC] border border-[#DCD4C0] text-[10px] font-mono font-semibold text-[#243B8A]">
                  {isMr ? 'स्वाइप करा →' : 'Swipe →'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif not-italic font-bold text-[#1C1917] tracking-tight">
                Books We Bring to Life.
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/books')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-xs sm:text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
            >
              <span>Explore the Catalogue →</span>
            </button>
          </div>

          {/* Horizontally Swipable Snap Rail on Mobile & Tablet (<lg), 3 Equal Columns on Desktop (lg+) */}
          <div
            data-testid="home-catalog-horizontal-scroll"
            className="akath-swipe-rail flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory touch-pan-x scroll-smooth no-scrollbar gap-4 sm:gap-5 lg:gap-8 items-stretch -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 pb-2 lg:pb-0"
          >
            {books.map((book, idx) => {
              const bookAuthor = authors.find((a) => a.id === book.authorId);
              const enMeta = BOOK_ENGLISH_META[book.id];
              const isAdded = recentlyAddedBookId === book.id;

              const displayTitle = isMr
                ? book.title
                : enMeta?.titleEn || book.title;
              const displayAuthor = isMr
                ? bookAuthor?.name || ''
                : enMeta?.authorEn ||
                  bookAuthor?.transliteratedName ||
                  bookAuthor?.name ||
                  '';
              const displayCategory = isMr
                ? book.category
                : enMeta?.categoryEn || book.category;
              const displayDescription = isMr
                ? book.description
                : enMeta?.descriptionEn || book.description;

              return (
                <article
                  key={book.id}
                  data-testid={`home-book-showcase-${book.id}`}
                  className="snap-start shrink-0 w-[82vw] max-w-[310px] sm:w-[320px] sm:max-w-[330px] lg:w-auto lg:max-w-none h-full rounded-xl overflow-hidden border border-[#DCD4C0] hover:border-[#243B8A] bg-[#FFFDF7] flex flex-col justify-between transition-colors"
                >
                  {/* Top Edition Header */}
                  <div className="px-5 py-3 bg-[#F7F3E8] border-b border-[#E5DEC9] flex items-center justify-between text-[11px] font-mono text-[#57534E]">
                    <span className="font-bold text-[#243B8A] tabular-nums">
                      EDITION 0{idx + 1}
                    </span>
                    <span>
                      {isMr ? book.format : enMeta?.formatEn || 'Paperback'}
                    </span>
                  </div>

                  {/* Fixed-Height Book Cover Pedestal */}
                  <div
                    onClick={() => onNavigate(`/books/${book.slug}`)}
                    className="h-[235px] sm:h-[255px] bg-[#F7F3E8]/55 px-6 flex items-center justify-center border-b border-[#E5DEC9] cursor-pointer"
                  >
                    <div className="w-full max-w-[148px] sm:max-w-[155px]">
                      <BookCoverArt
                        book={book}
                        author={bookAuthor}
                        size="md"
                        onClick={() => onNavigate(`/books/${book.slug}`)}
                      />
                    </div>
                  </div>

                  {/* Equalized Card Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#174D3A] font-semibold">
                        {displayCategory}
                      </p>

                      <h3
                        onClick={() => onNavigate(`/books/${book.slug}`)}
                        className="text-lg sm:text-xl font-serif not-italic font-bold text-[#1C1917] hover:text-[#243B8A] transition-colors cursor-pointer leading-snug"
                      >
                        {displayTitle}
                      </h3>

                      {bookAuthor && (
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate(`/authors/${bookAuthor.slug}`)
                          }
                          className="text-sm font-serif not-italic font-medium text-[#243B8A] hover:underline cursor-pointer text-left"
                        >
                          {displayAuthor}
                        </button>
                      )}

                      <p className="text-xs text-[#525665] leading-relaxed line-clamp-3 pt-1">
                        {displayDescription}
                      </p>
                    </div>

                    {/* Pinned Bottom Price & Action Bar */}
                    <div className="pt-4 border-t border-[#E5DEC9] flex items-center justify-between gap-3">
                      <span className="font-mono text-lg font-bold text-[#1C1917] tabular-nums">
                        ₹{book.price}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/books/${book.slug}`)}
                          className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#1C1917] hover:text-[#243B8A] border border-[#DCD4C0] hover:border-[#243B8A] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          {isMr ? 'पुस्तक पहा' : 'View Book'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddToCart(book.id)}
                          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. FOR AUTHORS — INVITE WRITERS TO PUBLISH
          ===================================================================== */}
      <section
        ref={forAuthorsRef}
        data-testid="home-manuscript-desk"
        className={`akath-io-section ${
          isForAuthorsVisible ? 'is-visible' : ''
        } py-14 sm:py-20 border-b border-[#E5DEC9] bg-[#F7F3E8]/65`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left 7 Columns: Author Invitation Box */}
            <div className="lg:col-span-7 rounded-xl border border-[#DCD4C0] bg-[#FFFDF7] p-7 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#243B8A]">
                  {isMr ? '०४ · लेखकांसाठी' : '04 · FOR AUTHORS'}
                </p>

                <h2 className="text-3xl sm:text-4xl font-serif not-italic font-bold text-[#1C1917] tracking-tight">
                  Have a Manuscript? Let&apos;s Talk.
                </h2>

                <p className="text-base sm:text-lg text-[#525665] leading-relaxed max-w-[54ch]">
                  {isMr
                    ? 'प्रत्येक पुस्तकाची सुरुवात एका कल्पनेतून होते. आपल्या संहितेला प्रकाशनाच्या दिशेने नेऊ इच्छिणाऱ्या लेखकांचे आम्ही स्वागत करतो.'
                    : 'Every book begins with an idea. We welcome writers who want to take their manuscripts towards publication.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('/submit-manuscript')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] font-semibold text-sm sm:text-base transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Feather className="w-4 h-4" />
                  <span>
                    {isMr ? 'संहिता पाठवा' : 'Submit Your Manuscript'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono uppercase tracking-[0.14em] text-[#57534E]">
                  {isMr
                    ? 'कथा · कादंबरी · कविता · प्रवासवर्णन · ललित'
                    : 'Fiction · Poetry · Travelogue · Non-Fiction'}
                </span>
              </div>
            </div>

            {/* Right 5 Columns: Equal-Height Manuscript-to-Book Diagram Box */}
            <div className="lg:col-span-5 rounded-xl border border-[#1B2D6B] bg-[#243B8A] text-[#FFFDF7] p-7 sm:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#FFFDF7]/15 pb-3 text-[11px] font-mono uppercase tracking-[0.16em] text-[#FFD966]">
                <span>
                  {isMr
                    ? 'हस्तलिखित ते प्रकाशित पुस्तक'
                    : 'MANUSCRIPT TO PUBLISHED BOOK'}
                </span>
                <span>AKATH DESK</span>
              </div>

              <div className="py-4 flex items-center justify-center">
                <svg
                  viewBox="0 0 340 150"
                  fill="none"
                  className="w-full max-w-[340px] h-auto"
                  aria-label="Manuscript transitioning into a finished book"
                >
                  {/* Manuscript Box */}
                  <rect
                    x="12"
                    y="16"
                    width="104"
                    height="118"
                    rx="4"
                    fill="#FFFDF7"
                    stroke="#FFD966"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="28"
                    y1="40"
                    x2="94"
                    y2="40"
                    stroke="#243B8A"
                    strokeWidth="1.6"
                  />
                  <line
                    x1="28"
                    y1="54"
                    x2="100"
                    y2="54"
                    stroke="#243B8A"
                    strokeOpacity="0.5"
                    strokeWidth="1.4"
                  />
                  <line
                    x1="28"
                    y1="68"
                    x2="86"
                    y2="68"
                    stroke="#EF6855"
                    strokeWidth="1.6"
                  />
                  <text
                    x="64"
                    y="112"
                    textAnchor="middle"
                    fill="#243B8A"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    01. MANUSCRIPT
                  </text>

                  {/* Arrow */}
                  <line
                    x1="128"
                    y1="75"
                    x2="202"
                    y2="75"
                    stroke="#FFD966"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <circle cx="165" cy="75" r="12" fill="#EF6855" />
                  <path
                    d="M161 75 L169 75 M166 71 L170 75 L166 79"
                    stroke="#FFFDF7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Published Book Box */}
                  <rect
                    x="216"
                    y="16"
                    width="112"
                    height="118"
                    rx="4"
                    fill="#FFFDF7"
                    stroke="#FFD966"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="226"
                    y1="16"
                    x2="226"
                    y2="134"
                    stroke="#EF6855"
                    strokeWidth="2"
                  />
                  <rect
                    x="242"
                    y="34"
                    width="70"
                    height="44"
                    rx="2"
                    fill="#F7F3E8"
                    stroke="#243B8A"
                    strokeWidth="1.2"
                  />
                  <text
                    x="277"
                    y="60"
                    textAnchor="middle"
                    fill="#243B8A"
                    fontSize="10"
                    fontFamily="serif"
                    fontWeight="700"
                  >
                    {isMr ? 'अकथ ग्रंथ' : 'AKATH BOOK'}
                  </text>
                  <text
                    x="277"
                    y="112"
                    textAnchor="middle"
                    fill="#174D3A"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="700"
                  >
                    02. PUBLISHED
                  </text>
                </svg>
              </div>

              <div className="pt-3 border-t border-[#FFFDF7]/15 text-[11px] font-mono uppercase tracking-[0.14em] text-[#FFFDF7]/80">
                {isMr
                  ? 'संहिता मूल्यमापन · संपादन · मुद्रण'
                  : 'Editorial Evaluation · Production · Print'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. ABOUT AKATH PRAKASHAN — CENTERED EDITORIAL SHOWCASE
          ===================================================================== */}
      <section
        ref={aboutAkathRef}
        data-testid="home-about-akath"
        className={`akath-io-section ${
          isAboutAkathVisible ? 'is-visible' : ''
        } py-14 sm:py-20 bg-[#FFFDF7]`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Centered Editorial Brand Introduction */}
          <div className="max-w-3xl mx-auto rounded-xl border border-[#DCD4C0] bg-[#FAF6EC] px-6 py-10 sm:px-12 sm:py-12 text-center space-y-4">
            <p className="text-xs font-mono not-italic font-bold uppercase tracking-[0.2em] text-[#243B8A]">
              {isMr ? '०५ · आमची ओळख' : '05 · ABOUT AKATH PRAKASHAN'}
            </p>

            <h2 className="text-2xl sm:text-4xl font-serif not-italic font-extrabold text-[#1C1917] tracking-tight">
              Rooted in Language. Driven by Stories.
            </h2>

            <p className="text-base sm:text-[17.5px] font-sans not-italic font-medium text-[#292524] leading-relaxed max-w-[60ch] mx-auto">
              {isMr
                ? 'अकथ प्रकाशन ही विचारशील लेखन, अर्थपूर्ण कथा आणि नवे आवाज मुद्रित स्वरूपात वाचकांपर्यंत आणण्यासाठी बांधिलकी जपणारी मराठी प्रकाशन संस्था आहे.'
                : 'Akath Prakashan is a Marathi publishing initiative committed to bringing thoughtful writing, meaningful stories and new voices into print.'}
            </p>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => onNavigate('/about')}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>
                  {isMr ? 'अकथ प्रकाशनविषयी' : 'About Akath Prakashan'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
