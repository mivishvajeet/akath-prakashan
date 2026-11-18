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
  ChevronLeft,
  ChevronRight,
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
import { AnimatedTortoiseEmblem } from '../components/SarvamIllustrations';
import {
  CapabilitySpecimenPlate,
  JourneyStageGlyph,
} from '../components/PublishingCraftVisuals';
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
  const [activeBookRailIndex, setActiveBookRailIndex] = useState<number>(0);
  const [activeCapabilityIdx, setActiveCapabilityIdx] = useState<number>(0);
  const [activeJourneyIdx, setActiveJourneyIdx] = useState<number>(0);
  const catalogRailRef = useRef<HTMLDivElement | null>(null);
  const catalogScrollRafRef = useRef<number | null>(null);

  const handleCatalogRailScroll = () => {
    if (catalogScrollRafRef.current !== null) return;
    catalogScrollRafRef.current = window.requestAnimationFrame(() => {
      catalogScrollRafRef.current = null;
      const container = catalogRailRef.current;
      if (!container || books.length === 0) return;
      const cards = Array.from(container.children) as HTMLElement[];
      if (cards.length === 0) return;
      const scrollLeft = container.scrollLeft;
      let closestIdx = 0;
      let minDistance = Number.POSITIVE_INFINITY;
      cards.forEach((card, idx) => {
        const distance = Math.abs(card.offsetLeft - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });
      setActiveBookRailIndex((prev) => (prev !== closestIdx ? closestIdx : prev));
    });
  };

  const scrollToBookCard = (index: number) => {
    const clampedIdx = Math.max(0, Math.min(books.length - 1, index));
    setActiveBookRailIndex(clampedIdx);
    const container = catalogRailRef.current;
    if (!container) return;
    const targetCard = container.children[clampedIdx] as HTMLElement | undefined;
    if (targetCard) {
      container.scrollTo({
        left: targetCard.offsetLeft,
        behavior: 'smooth',
      });
    }
  };

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
  const activeHeroIndex = activeHeroBook
    ? Math.max(0, books.findIndex((b) => b.id === activeHeroBook.id))
    : 0;
  const activeHeroAuthor = activeHeroBook
    ? authors.find((a) => a.id === activeHeroBook.authorId)
    : undefined;
  const activeHeroEnMeta = activeHeroBook
    ? BOOK_ENGLISH_META[activeHeroBook.id]
    : undefined;

  // Arrange books for the sculptural hero exhibition composition:
  // Center spotlight is activeHeroBook; flanking wings are the remaining books
  const secondaryBooks = books.filter((b) => b.id !== activeHeroBook?.id);

  return (
    <div className="bg-[#FFFDF7] text-[#1C1917] w-full max-w-[100vw] overflow-x-hidden">
      {/* =====================================================================
          1. HERO — EXHIBITION POSTER & SCULPTURAL BOOK STAGE (MOBILE, TABLET & DESKTOP)
          ===================================================================== */}
      <section
        ref={heroRef}
        data-testid="home-publishing-hero"
        className={`akath-io-section ${
          isHeroVisible ? 'is-visible' : ''
        } relative w-full overflow-hidden border-b border-[#E5DEC9] bg-[#FAF6EC] pt-5 sm:pt-7 lg:pt-9 pb-6 sm:pb-8 lg:pb-10`}
      >
        {/* Minimal Archival Paper Dot-Matrix & Warm Sunlit Spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.22]"
          style={{
            backgroundImage:
              'radial-gradient(#C89D54 0.85px, transparent 0.85px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 68% 64% at 72% 45%, rgba(255, 217, 102, 0.26) 0%, rgba(250, 246, 236, 0.72) 56%, rgba(250, 246, 236, 0.92) 86%)',
          }}
        />

        {/* Subtle Architectural Folio Corner Marks (Minimal Press Registration) */}
        <div
          aria-hidden="true"
          className="pointer-events-none hidden lg:block absolute inset-x-8 top-4 bottom-4 border-x border-[#DCD4C0]/55"
        />

        <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 min-w-0">
          <div className="flex flex-col lg:grid lg:grid-cols-12 items-center gap-7 sm:gap-9 lg:gap-10 xl:gap-12">
            {/* LEFT COLUMN (7 Cols Desktop): Centered Poster Typography (Mobile/Tablet) -> Left-Aligned Broadsheet (Desktop) */}
            <div
              data-testid="home-hero-identity-column"
              className="w-full lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left space-y-5 sm:space-y-6"
            >
              {/* Upper Identity, Actions & Edition Switcher */}
              <div className="w-full flex flex-col items-center lg:items-start space-y-4 sm:space-y-5">
                {/* Monumental Marathi Publisher Headline + Ornamental Divider */}
                <div className="w-full space-y-3 sm:space-y-3.5 flex flex-col items-center lg:items-start">
                  <h1
                    data-testid="home-hero-main-headline"
                    className="w-full font-serif not-italic font-extrabold text-[#1C1917] tracking-[-0.015em] text-center lg:text-left [text-wrap:balance]"
                  >
                    <span className="block text-[clamp(1.7rem,6.5vw,2.55rem)] sm:text-[clamp(2.25rem,4.5vw,3rem)] lg:text-[clamp(2.35rem,3.15vw,3.3rem)] leading-[1.24] text-[#1C1917] drop-shadow-[0_2px_0_rgba(255,217,102,0.45)]">
                      शब्दांना पुस्तकाचं रूप देणारी
                    </span>
                    <span className="block mt-1 text-[clamp(2.2rem,8.4vw,3.2rem)] sm:text-[clamp(2.85rem,5.8vw,3.85rem)] lg:text-[clamp(3.05rem,4.2vw,4.35rem)] leading-[1.15] text-[#243B8A] drop-shadow-[0_3px_0_rgba(255,217,102,0.65)]">
                      प्रकाशन संस्था.
                    </span>
                  </h1>

                  {/* Editorial SVG Flourish & Diamond Rule */}
                  <div
                    aria-hidden="true"
                    className="flex items-center justify-center lg:justify-start gap-2.5 pt-0.5"
                  >
                    <span className="w-10 sm:w-14 h-[2px] rounded-full bg-gradient-to-r from-[#EF6855] to-[#FFD966]" />
                    <svg
                      viewBox="0 0 64 14"
                      className="w-14 h-3.5 text-[#243B8A] shrink-0"
                      fill="none"
                    >
                      <path
                        d="M2 7 Q 10 2, 18 7 T 32 7 T 46 7 T 62 7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <rect
                        x="29.5"
                        y="4.5"
                        width="5"
                        height="5"
                        transform="rotate(45 32 7)"
                        fill="#FFD966"
                        stroke="#243B8A"
                        strokeWidth="1.2"
                      />
                    </svg>
                    <span className="w-10 sm:w-14 h-[2px] rounded-full bg-gradient-to-l from-[#174D3A]/60 to-[#FFD966] lg:hidden" />
                  </div>

                  <p
                    data-testid="home-hero-supporting-line"
                    className="max-w-[36ch] sm:max-w-[46ch] mx-auto lg:mx-0 text-center lg:text-left text-[17px] sm:text-[20px] lg:text-[21px] font-serif not-italic font-bold text-[#243B8A] leading-[1.4]"
                  >
                    Discovering stories. Developing manuscripts. Publishing books.
                  </p>

                  <p className="text-[14.5px] sm:text-[16px] lg:text-[16.5px] font-sans not-italic text-[#44403C] leading-relaxed max-w-[42ch] sm:max-w-[52ch] mx-auto lg:mx-0 text-center lg:text-left">
                    {isMr
                      ? 'आम्ही लेखकांसोबत काम करून त्यांच्या कल्पना आणि हस्तलिखितांचे विचारपूर्वक घडवलेल्या पुस्तकांत रूपांतर करतो.'
                      : 'We work with writers to transform ideas and manuscripts into thoughtfully produced books.'}
                  </p>
                </div>

                {/* Primary & Secondary Editorial Actions */}
                <div className="w-full sm:w-auto flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('/books')}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] font-semibold text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-4 h-4 text-[#FFD966]" />
                    <span>{isMr ? 'आमची पुस्तके पहा' : 'Explore Our Books'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('/submit-manuscript')}
                    className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#FFFDF7] hover:bg-[#1C1917] text-[#1C1917] hover:text-[#FFFDF7] border border-[#1C1917]/25 font-semibold text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Feather className="w-4 h-4 text-[#EF6855]" />
                    <span>
                      {isMr ? 'आमच्यासोबत प्रकाशित करा' : 'Publish With Us'}
                    </span>
                  </button>
                </div>

                {/* Sculptural Edition Anchor Selector Rail */}
                <div className="w-full pt-1 space-y-2 min-w-0">
                  <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.16em] text-[#57534E]">
                    {isMr ? 'ग्रंथ दालन निवड' : 'Select Edition'}
                  </p>
                  <div
                    data-testid="home-hero-anchors-rail"
                    className="akath-swipe-rail flex flex-wrap sm:flex-nowrap items-center justify-center lg:justify-start gap-2.5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory w-full pb-1 sm:pb-0"
                  >
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
                          className={`snap-start shrink-0 max-w-full px-3 sm:px-3.5 py-2 rounded-lg text-xs font-serif transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                            isSelected
                              ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A] shadow-sm font-bold'
                              : 'bg-[#FFFDF7] text-[#1C1917] border-[#DCD4C0] hover:border-[#243B8A]/60 hover:bg-[#FFF9E6]'
                          }`}
                        >
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded tabular-nums shrink-0 ${
                              isSelected
                                ? 'bg-[#FFD966] text-[#1C1917] font-bold'
                                : 'bg-[#FAF6EC] text-[#57534E]'
                            }`}
                          >
                            0{idx + 1}
                          </span>
                          <span className="max-w-[215px] sm:max-w-none truncate">
                            {isMr ? book.title : enMeta?.titleEn || book.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (5 Cols Desktop): Bordered Exhibition Box & Concentric Orbital Book Stage */}
            {activeHeroBook && (
              <div
                data-testid="home-featured-edition-dossier"
                className="w-full lg:col-span-5 min-w-0"
              >
                <div className="relative rounded-2xl bg-[#FFFDF7] border border-[#DCD4C0] p-4 sm:p-6 shadow-[0_20px_50px_-24px_rgba(28,25,23,0.18)] overflow-hidden">
                  {/* Top Exhibition Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9] text-[11px] font-mono uppercase tracking-[0.14em] text-[#57534E]">
                    <span className="font-bold text-[#174D3A]">
                      {isMr
                        ? activeHeroBook.category
                        : activeHeroEnMeta?.categoryEn ||
                          activeHeroBook.category}
                    </span>
                    <span className="tabular-nums font-semibold text-[#243B8A]">
                      0{activeHeroIndex + 1} / 0{books.length}
                    </span>
                  </div>

                  {/* Sculptural Stage with Concentric Dashed Exhibition Rings */}
                  <div className="relative py-4 sm:py-6 flex items-center justify-center min-h-[225px] sm:min-h-[275px] lg:min-h-[290px]">
                    {/* Concentric Orbital Rings */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute w-[205px] h-[205px] sm:w-[255px] sm:h-[255px] rounded-full border border-dashed border-[#C89D54]/45"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute w-[268px] h-[268px] sm:w-[330px] sm:h-[330px] rounded-full border border-dashed border-[#243B8A]/15"
                    />

                    <AnimatePresence mode="wait">
                      {showFullSpread && activeHeroBook.coverSpreadUrl ? (
                        <motion.div
                          key="spread-showcase"
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.97 }}
                          transition={{ duration: 0.22 }}
                          className="relative z-30 w-full rounded-xl bg-[#FAF6EC] border border-[#DCD4C0] p-3 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#243B8A] truncate">
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
                              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#243B8A] text-[#FFFDF7] cursor-pointer whitespace-nowrap shrink-0"
                            >
                              {isMr ? 'मुखपृष्ठ पहा' : 'Back to Cover'}
                            </button>
                          </div>

                          <img
                            src={resolvePublicAssetUrl(
                              activeHeroBook.coverSpreadUrl
                            )}
                            alt={activeHeroBook.title}
                            width={800}
                            height={600}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-auto max-h-[210px] object-contain mx-auto"
                          />

                          <div className="flex items-center justify-between text-[11px] text-[#57534E] tabular-nums">
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
                                {isMr
                                  ? 'मूळ कव्हर PDF ↗'
                                  : 'Open Press PDF ↗'}
                              </a>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key={`hero-book-stage-${activeHeroBook.id}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.22 }}
                          className="relative z-20 w-full flex items-center justify-center"
                        >
                          {/* Left Secondary Wing */}
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
                              className="absolute left-1.5 sm:left-5 bottom-2 w-[88px] sm:w-[114px] -rotate-6 opacity-85 hover:opacity-100 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer z-10 drop-shadow-md"
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

                          {/* Centerpiece Featured Book */}
                          <div className="relative z-30 w-[144px] sm:w-[180px] lg:w-[188px] transition-transform duration-300 hover:-translate-y-2 drop-shadow-[0_22px_28px_rgba(28,25,23,0.24)]">
                            <BookCoverArt
                              book={activeHeroBook}
                              author={activeHeroAuthor}
                              size="lg"
                              priority={true}
                              onClick={() =>
                                onNavigate(`/books/${activeHeroBook.slug}`)
                              }
                            />
                          </div>

                          {/* Right Secondary Wing */}
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
                              className="absolute right-1.5 sm:right-5 bottom-2 w-[88px] sm:w-[114px] rotate-6 opacity-85 hover:opacity-100 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer z-20 drop-shadow-md"
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
                  </div>

                  {/* Exhibition Book Details & Action Row */}
                  <div className="pt-3.5 border-t border-[#E5DEC9] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="min-w-0 text-center sm:text-left">
                        <h2
                          onClick={() =>
                            onNavigate(`/books/${activeHeroBook.slug}`)
                          }
                          className="text-lg sm:text-xl font-serif not-italic font-bold text-[#1C1917] hover:text-[#243B8A] transition-colors cursor-pointer truncate"
                        >
                          {isMr
                            ? activeHeroBook.title
                            : activeHeroEnMeta?.titleEn || activeHeroBook.title}
                        </h2>
                        {activeHeroAuthor && (
                          <p className="text-xs font-serif not-italic text-[#57534E]">
                            {isMr
                              ? activeHeroAuthor.name
                              : activeHeroEnMeta?.authorEn ||
                                activeHeroAuthor.transliteratedName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
                        {activeHeroBook.coverSpreadUrl && (
                          <button
                            type="button"
                            data-testid="toggle-featured-jacket-spread"
                            onClick={() => setShowFullSpread((prev) => !prev)}
                            className="px-2.5 py-1.5 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider bg-[#FAF6EC] hover:bg-[#FFD966]/40 text-[#243B8A] border border-[#DCD4C0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
                          className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                        >
                          {isMr ? 'पुस्तक पहा →' : 'View Edition →'}
                        </button>
                      </div>
                    </div>

                    <p
                      data-testid="featured-edition-blurb"
                      className="text-[13px] text-[#525665] font-serif not-italic leading-relaxed line-clamp-2 text-center sm:text-left"
                    >
                      {isMr
                        ? activeHeroBook.description
                        : activeHeroEnMeta?.descriptionEn ||
                          activeHeroBook.description}
                    </p>

                    {/* 3-Column Edition Ledger */}
                    <div className="grid grid-cols-3 divide-x divide-[#E5DEC9] rounded-lg bg-[#FAF6EC] border border-[#E5DEC9] py-2 text-center">
                      <div className="px-2">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#57534E]">
                          {isMr ? 'स्वरूप' : 'Format'}
                        </p>
                        <p className="text-xs font-serif font-semibold text-[#1C1917]">
                          {isMr
                            ? 'पेपरबॅक'
                            : activeHeroEnMeta?.formatEn || 'Paperback'}
                        </p>
                      </div>
                      <div className="px-2">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#57534E]">
                          {isMr ? 'पृष्ठे' : 'Pages'}
                        </p>
                        <p className="text-xs font-mono font-semibold text-[#1C1917] tabular-nums">
                          {activeHeroBook.pageCount
                            ? `${activeHeroBook.pageCount}`
                            : '—'}
                        </p>
                      </div>
                      <div className="px-2">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#57534E]">
                          {isMr ? 'मूल्य' : 'Price'}
                        </p>
                        <p className="text-xs font-mono font-bold text-[#243B8A] tabular-nums">
                          ₹{activeHeroBook.price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. WHAT WE DO — SPLIT EDITORIAL FOLIO LEDGER & INTERACTIVE CRAFT SPECIMEN
          (Zero Boxy Cards: Unboxed Hairline Index + Live Bespoke Craft Plate)
          ===================================================================== */}
      <section
        ref={whatWeDoRef}
        data-testid="home-what-we-do"
        className={`akath-io-section ${
          isWhatWeDoVisible ? 'is-visible' : ''
        } w-full overflow-hidden py-10 sm:py-14 lg:py-20 border-b border-[#E5DEC9] bg-[#FFFDF7]`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6 sm:space-y-8 lg:space-y-10 min-w-0">
          {/* Editorial Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-[#DCD4C0] pb-4 sm:pb-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between md:justify-start gap-3">
                <p className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#174D3A]">
                  {isMr ? '०१ · प्रकाशन कार्यकक्षा' : '01 · WHAT WE DO'}
                </p>
                <span className="md:hidden text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[#243B8A]">
                  {isMr ? 'निवडा / स्वाइप करा →' : 'Tap or Swipe →'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif not-italic font-bold text-[#1C1917] tracking-tight">
                From Manuscript to Bookshelf.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#525665] max-w-md leading-relaxed">
              {isMr
                ? 'हस्तलिखिताच्या पहिल्या मसुद्यापासून वाचकांच्या हातातील पुस्तकापर्यंत संपूर्ण संपादकीय आणि मुद्रण प्रक्रिया.'
                : 'Four editorial crafts guiding a writer’s raw manuscript to an enduring finished book in print.'}
            </p>
          </div>

          {/* Interactive Non-Boxy 12-Column Split: Mobile Swipe Rail (<md), Tablet 2x2 Ledger (md), Desktop 6+6 Split (lg+) */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-7 lg:gap-12 items-stretch">
            {/* LEFT 6 COLS: Unboxed Editorial Ledger Rows */}
            <div
              data-testid="what-we-do-swipe-rail"
              className="akath-swipe-rail lg:col-span-6 flex md:grid md:grid-cols-2 lg:flex lg:flex-col overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 md:gap-5 lg:gap-0 w-full max-w-full pb-2 md:pb-0 lg:border-b lg:border-[#DCD4C0]"
            >
              {PUBLISHING_CAPABILITIES.map((item, idx) => {
                const IconComponent = item.Icon;
                const isActive = activeCapabilityIdx === idx;
                return (
                  <article
                    key={item.number}
                    data-testid={`capability-card-${item.number}`}
                    onClick={() => setActiveCapabilityIdx(idx)}
                    onMouseEnter={() => setActiveCapabilityIdx(idx)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveCapabilityIdx(idx);
                      }
                    }}
                    className={`snap-start shrink-0 w-[244px] sm:w-[272px] md:w-full cursor-pointer transition-colors duration-200 border-t-2 md:border-t lg:border-b-0 pt-3.5 pb-3.5 md:px-3 lg:py-5 lg:px-4 flex flex-col justify-between ${
                      isActive
                        ? 'border-[#243B8A] md:border-[#243B8A] lg:border-[#DCD4C0] bg-[#FAF6EC]/85'
                        : 'border-[#DCD4C0] bg-transparent hover:bg-[#FAF6EC]/45'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Large Unboxed Archival Numeral */}
                      <span
                        className={`font-serif text-2xl sm:text-3xl font-bold leading-none tabular-nums shrink-0 transition-colors ${
                          isActive ? 'text-[#243B8A]' : 'text-[#A8A29E]'
                        }`}
                      >
                        {item.number}
                      </span>

                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className={`text-[15px] sm:text-lg lg:text-xl font-serif not-italic font-bold leading-snug transition-colors ${
                              isActive ? 'text-[#243B8A]' : 'text-[#1C1917]'
                            }`}
                          >
                            {isMr ? item.titleMr : item.titleEn}
                          </h3>
                          <IconComponent
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-[#EF6855]' : 'text-[#78716C]'
                            }`}
                            aria-hidden="true"
                          />
                        </div>

                        <p className="text-xs sm:text-[13.5px] text-[#525665] leading-relaxed">
                          {isMr ? item.descriptionMr : item.descriptionEn}
                        </p>

                        <div className="pt-1 flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.14em]">
                          <span
                            className={`inline-block h-[1.5px] transition-all duration-200 shrink-0 ${
                              isActive
                                ? 'w-6 bg-[#EF6855]'
                                : 'w-3 bg-[#DCD4C0]'
                            }`}
                            aria-hidden="true"
                          />
                          <span
                            className={
                              isActive
                                ? 'text-[#174D3A] font-semibold'
                                : 'text-[#78716C]'
                            }
                          >
                            {isMr ? item.deliverableMr : item.deliverableEn}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* RIGHT 6 COLS: Live Gallery-Mounted Craft Illustration Plate + Mobile/Tablet Selector Bar */}
            <div className="lg:col-span-6 min-w-0 flex flex-col gap-3">
              {/* Mobile/Tablet Quick Plate Selector Dots */}
              <div className="lg:hidden flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#57534E]">
                <div className="flex items-center gap-1.5">
                  {PUBLISHING_CAPABILITIES.map((cap, idx) => (
                    <button
                      key={cap.number}
                      type="button"
                      onClick={() => setActiveCapabilityIdx(idx)}
                      aria-label={`${isMr ? cap.titleMr : cap.titleEn}`}
                      className={`px-2.5 py-1.5 rounded text-[11px] font-bold tabular-nums transition-colors cursor-pointer ${
                        activeCapabilityIdx === idx
                          ? 'bg-[#243B8A] text-[#FFFDF7]'
                          : 'bg-[#FAF6EC] text-[#57534E] border border-[#DCD4C0]'
                      }`}
                    >
                      {cap.number}
                    </button>
                  ))}
                </div>
                <span className="truncate text-[#174D3A] font-semibold">
                  {isMr
                    ? PUBLISHING_CAPABILITIES[activeCapabilityIdx]?.titleMr
                    : PUBLISHING_CAPABILITIES[activeCapabilityIdx]?.titleEn}
                </span>
              </div>

              <CapabilitySpecimenPlate
                activeIndex={activeCapabilityIdx}
                isMr={isMr}
                title={
                  isMr
                    ? PUBLISHING_CAPABILITIES[activeCapabilityIdx]?.titleMr ||
                      ''
                    : PUBLISHING_CAPABILITIES[activeCapabilityIdx]?.titleEn ||
                      ''
                }
                deliverable={
                  isMr
                    ? PUBLISHING_CAPABILITIES[activeCapabilityIdx]
                        ?.deliverableMr || ''
                    : PUBLISHING_CAPABILITIES[activeCapabilityIdx]
                        ?.deliverableEn || ''
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. HOW WE PUBLISH — CONTINUOUS LIVING INK ARC & CONSTELLATION JOURNEY
          (Zero Boxy Cards: Mobile Swipe Rail -> Tablet 5-Col Line -> Desktop Undulating Curve)
          ===================================================================== */}
      <section
        ref={howWePublishRef}
        data-testid="home-how-we-publish"
        className={`akath-io-section ${
          isHowWePublishVisible ? 'is-visible' : ''
        } relative w-full overflow-hidden py-10 sm:py-14 lg:py-20 border-b border-[#1B2D6B] bg-[#192961] text-[#FFFDF7]`}
      >
        {/* Subtle Warm Starlight Radial Halo Behind Publishing Arc */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 64% 55% at 50% 42%, rgba(255, 217, 102, 0.1) 0%, rgba(25, 41, 97, 0) 74%)',
          }}
        />

        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6 sm:space-y-8 lg:space-y-10 relative z-10 min-w-0">
          {/* Editorial Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 border-b border-[#FFFDF7]/15 pb-4 sm:pb-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between md:justify-start gap-3">
                <p className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#FFD966]">
                  {isMr ? '०२ · प्रकाशन प्रवास' : '02 · HOW WE PUBLISH'}
                </p>
                <span className="md:hidden text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-[#FFD966]">
                  {isMr ? 'स्वाइप करा →' : 'Swipe →'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif not-italic font-bold text-[#FFFDF7] tracking-tight">
                An Idea Becomes a Book.
              </h2>
            </div>

            <p className="hidden sm:block text-[10.5px] sm:text-xs font-mono uppercase tracking-[0.14em] text-[#FFFDF7]/75">
              01 DISCOVER → 02 REVIEW → 03 DEVELOP → 04 PRODUCE → 05 PUBLISH
            </p>
          </div>

          {/* Continuous Ink Arc Constellation Stage */}
          <div className="relative">
            {/* Tablet Continuous Straight Golden Horizon Thread (md to lg) */}
            <div
              aria-hidden="true"
              className="hidden md:block lg:hidden pointer-events-none absolute top-6 inset-x-[10%] h-[1.5px] bg-[#FFD966]/30 z-0"
            >
              <div
                className="h-full bg-[#FFD966] transition-all duration-300"
                style={{
                  width: `${
                    (activeJourneyIdx / (PUBLISHING_JOURNEY_STAGES.length - 1)) *
                    100
                  }%`,
                }}
              />
            </div>

            {/* Desktop Organic Undulating Golden Ink Thread Behind Nodes */}
            <svg
              aria-hidden="true"
              viewBox="0 0 1000 120"
              preserveAspectRatio="none"
              className="hidden lg:block pointer-events-none absolute top-[18px] inset-x-[7%] w-[86%] h-[88px] overflow-visible z-0"
            >
              {/* Faint Base Thread Across All 5 Milestones */}
              <path
                d="M 0 28 C 110 28, 140 84, 250 84 C 360 84, 390 28, 500 28 C 610 28, 640 84, 750 84 C 860 84, 890 28, 1000 28"
                fill="none"
                stroke="#FFD966"
                strokeOpacity="0.25"
                strokeWidth="1.8"
                strokeDasharray="5 5"
              />
              {/* Active Illuminated Gold-Leaf Ink Progress Path */}
              <path
                d="M 0 28 C 110 28, 140 84, 250 84 C 360 84, 390 28, 500 28 C 610 28, 640 84, 750 84 C 860 84, 890 28, 1000 28"
                fill="none"
                stroke="#FFD966"
                strokeWidth="2.4"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={
                  100 -
                  (activeJourneyIdx / (PUBLISHING_JOURNEY_STAGES.length - 1)) *
                    100
                }
                style={{
                  transition: 'stroke-dashoffset 380ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </svg>

            {/* Mobile Swipe Rail (<md), Tablet 5-Col Aligned Timeline (md), Desktop 5-Col Undulating Wave (lg+) */}
            <ol
              data-testid="how-we-publish-swipe-rail"
              className="akath-swipe-rail relative z-10 flex md:grid md:grid-cols-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-6 sm:gap-7 md:gap-4 lg:gap-6 items-start w-full max-w-full pb-3 md:pb-0"
            >
              {PUBLISHING_JOURNEY_STAGES.map((stage, idx) => {
                const isActive = idx === activeJourneyIdx;
                const isReached = idx <= activeJourneyIdx;
                const isLowerArc = idx % 2 === 1;
                return (
                  <li
                    key={stage.step}
                    data-testid={`publishing-journey-step-${stage.step}`}
                    onClick={() => setActiveJourneyIdx(idx)}
                    onMouseEnter={() => setActiveJourneyIdx(idx)}
                    className={`snap-start shrink-0 w-[220px] sm:w-[240px] md:w-auto relative flex flex-col items-start md:items-center md:text-center cursor-pointer group ${
                      isLowerArc ? 'lg:pt-14' : 'lg:pt-0'
                    }`}
                  >
                    {/* Mobile-Only Continuous Horizontal Thread Behind Each Node */}
                    {idx < PUBLISHING_JOURNEY_STAGES.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="md:hidden absolute top-6 left-12 right-[-24px] sm:right-[-28px] h-[1.5px] bg-[#FFD966]/30 pointer-events-none"
                      />
                    )}

                    {/* Circular Brass/Gold Craft Medallion Node */}
                    <button
                      type="button"
                      onClick={() => setActiveJourneyIdx(idx)}
                      aria-label={`${stage.step}. ${stage.label}`}
                      aria-current={isActive ? 'step' : undefined}
                      className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                        isActive
                          ? 'bg-[#FFD966] border-[#FFD966] shadow-[0_0_24px_rgba(255,217,102,0.45)] scale-105'
                          : isReached
                          ? 'bg-[#243B8A] border-[#FFD966] text-[#FFD966]'
                          : 'bg-[#192961] border-[#FFFDF7]/35 group-hover:border-[#FFD966]'
                      }`}
                    >
                      <JourneyStageGlyph index={idx} isActive={isActive} />
                    </button>

                    {/* Vertical Astronomical Stem Tick (Tablet & Desktop) */}
                    <span
                      aria-hidden="true"
                      className={`hidden md:block w-px h-4 lg:h-5 my-2 transition-colors ${
                        isActive ? 'bg-[#FFD966]' : 'bg-[#FFFDF7]/25'
                      }`}
                    />

                    {/* Unboxed Open Typography Block */}
                    <div className="pt-3 md:pt-0 space-y-1.5">
                      <div className="flex items-center md:justify-center gap-1.5 lg:gap-2">
                        <span
                          className={`font-serif text-xl md:text-lg lg:text-2xl font-bold leading-none tabular-nums transition-colors ${
                            isActive ? 'text-[#FFD966]' : 'text-[#FFFDF7]/45'
                          }`}
                        >
                          {stage.step}
                        </span>
                        <h3 className="font-mono text-xs md:text-[11px] lg:text-sm font-bold uppercase tracking-[0.12em] lg:tracking-[0.14em] text-[#FFFDF7] whitespace-nowrap">
                          {stage.step}. {stage.label}
                        </h3>
                      </div>

                      <p className="text-xs md:text-[12px] lg:text-[13.5px] text-[#FFFDF7]/85 leading-relaxed max-w-[24ch] md:mx-auto">
                        {isMr ? stage.descriptionMr : stage.descriptionEn}
                      </p>

                      <div className="pt-1 flex items-center md:justify-center gap-2 text-[10px] lg:text-[10.5px] font-mono uppercase tracking-[0.1em] lg:tracking-[0.12em] text-[#FFD966]/90">
                        <span
                          aria-hidden="true"
                          className={`hidden sm:inline-block w-3 lg:w-4 h-px ${
                            isActive ? 'bg-[#EF6855]' : 'bg-[#FFFDF7]/30'
                          }`}
                        />
                        <span>
                          {isMr ? stage.milestoneMr : stage.milestoneEn}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Unboxed Interactive Stage Navigation & Invitation Strip */}
          <div className="pt-4 border-t border-[#FFFDF7]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-baseline sm:items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-serif text-[#FFFDF7]/90">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#FFD966] tabular-nums shrink-0">
                {PUBLISHING_JOURNEY_STAGES[activeJourneyIdx]?.step} / 05
              </span>
              <span aria-hidden="true" className="text-[#FFFDF7]/30 shrink-0">
                ·
              </span>
              <span>
                {isMr
                  ? PUBLISHING_JOURNEY_STAGES[activeJourneyIdx]?.descriptionMr
                  : PUBLISHING_JOURNEY_STAGES[activeJourneyIdx]?.descriptionEn}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  setActiveJourneyIdx((prev) =>
                    prev === 0
                      ? PUBLISHING_JOURNEY_STAGES.length - 1
                      : prev - 1
                  )
                }
                className="min-h-[40px] px-3.5 py-2 rounded-md border border-[#FFFDF7]/25 hover:border-[#FFD966] text-[11px] font-mono uppercase tracking-[0.12em] text-[#FFFDF7] transition-colors cursor-pointer whitespace-nowrap"
              >
                {isMr ? '← मागे' : '← Prev'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveJourneyIdx(
                    (prev) => (prev + 1) % PUBLISHING_JOURNEY_STAGES.length
                  )
                }
                className="min-h-[40px] px-4 py-2 rounded-md bg-[#FFD966] hover:bg-[#ffe38a] text-[#1C1917] text-[11px] font-mono font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap"
              >
                {isMr ? 'पुढील टप्पा →' : 'Next Stage →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. OUR BOOKS — COMPACT TOUCH-FRIENDLY HORIZONTAL SNAP-POINT RAIL ON MOBILE/TABLET,
             3 EQUAL PEDESTAL CARDS ON DESKTOP
          ===================================================================== */}
      <section
        ref={ourBooksRef}
        data-testid="home-published-books"
        className={`akath-io-section ${
          isOurBooksVisible ? 'is-visible' : ''
        } w-full overflow-hidden py-7 sm:py-10 lg:py-20 border-b border-[#E5DEC9] bg-[#FFFDF7]`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 space-y-4 sm:space-y-6 lg:space-y-10 min-w-0">
          {/* Section Header + Mobile/Tablet Snap Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-[#E5DEC9] pb-3.5 sm:pb-5">
            <div className="space-y-1">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <p className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#174D3A]">
                  {isMr ? '०३ · प्रकाशित ग्रंथसूची' : '03 · OUR BOOKS'}
                </p>
                <span className="lg:hidden inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FAF6EC] border border-[#DCD4C0] text-[10px] font-mono font-semibold text-[#243B8A] tabular-nums">
                  {isMr
                    ? `०${activeBookRailIndex + 1} / ०${books.length} · स्वाइप करा →`
                    : `0${activeBookRailIndex + 1} / 0${books.length} · Swipe →`}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif not-italic font-bold text-[#1C1917] tracking-tight">
                Books We Bring to Life.
              </h2>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              {/* Mobile & Tablet Snap-Point Stepper Controls */}
              <div
                data-testid="home-books-snap-controls"
                className="lg:hidden inline-flex items-center gap-1.5"
              >
                <button
                  type="button"
                  data-testid="home-books-rail-prev"
                  onClick={() => scrollToBookCard(activeBookRailIndex - 1)}
                  disabled={activeBookRailIndex <= 0}
                  aria-label={isMr ? 'मागील पुस्तक' : 'Previous book'}
                  className="w-8 h-8 rounded-lg bg-[#FAF6EC] border border-[#DCD4C0] hover:border-[#243B8A] disabled:opacity-40 text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="inline-flex items-center gap-1 px-1.5 py-1 rounded-lg bg-[#FAF6EC] border border-[#DCD4C0]">
                  {books.map((b, idx) => {
                    const isActiveSnap = idx === activeBookRailIndex;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        data-testid={`home-books-snap-dot-${idx}`}
                        onClick={() => scrollToBookCard(idx)}
                        aria-label={`${isMr ? 'पुस्तक' : 'Edition'} 0${idx + 1}`}
                        aria-current={isActiveSnap ? 'true' : undefined}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tabular-nums transition-colors cursor-pointer ${
                          isActiveSnap
                            ? 'bg-[#243B8A] text-[#FFFDF7]'
                            : 'text-[#57534E] hover:text-[#1C1917]'
                        }`}
                      >
                        0{idx + 1}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  data-testid="home-books-rail-next"
                  onClick={() => scrollToBookCard(activeBookRailIndex + 1)}
                  disabled={activeBookRailIndex >= books.length - 1}
                  aria-label={isMr ? 'पुढील पुस्तक' : 'Next book'}
                  className="w-8 h-8 rounded-lg bg-[#FAF6EC] border border-[#DCD4C0] hover:border-[#243B8A] disabled:opacity-40 text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/books')}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Explore the Catalogue →</span>
              </button>
            </div>
          </div>

          {/* Horizontally Swipable Snap Rail on Mobile & Tablet (<lg), 3 Equal Columns on Desktop (lg+) */}
          <div
            ref={catalogRailRef}
            onScroll={handleCatalogRailScroll}
            data-testid="home-catalog-horizontal-scroll"
            className="akath-swipe-rail flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory gap-3.5 sm:gap-5 lg:gap-8 items-stretch w-full max-w-full pb-2 lg:pb-0"
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
                  className="snap-start shrink-0 w-[302px] sm:w-[368px] md:w-[388px] lg:w-auto h-full rounded-xl overflow-hidden border border-[#DCD4C0] hover:border-[#243B8A] bg-[#FFFDF7] flex flex-col justify-between transition-colors"
                >
                  {/* Top Edition Header */}
                  <div className="px-4 sm:px-5 py-2 sm:py-3 bg-[#F7F3E8] border-b border-[#E5DEC9] flex items-center justify-between text-[10.5px] sm:text-[11px] font-mono text-[#57534E]">
                    <span className="font-bold text-[#243B8A] tabular-nums">
                      EDITION 0{idx + 1}
                    </span>
                    <span>
                      {isMr ? book.format : enMeta?.formatEn || 'Paperback'}
                    </span>
                  </div>

                  {/* Responsive Body: Side-by-Side Folio on Mobile/Tablet (<lg) to Minimize Vertical Scroll Depth; Stacked Pedestal on Desktop (lg+) */}
                  <div className="flex flex-row lg:flex-col flex-1 min-w-0">
                    {/* Book Cover Column (Compact Left Folio on <lg, Top Pedestal on lg+) */}
                    <div
                      onClick={() => onNavigate(`/books/${book.slug}`)}
                      className="w-[106px] sm:w-[126px] lg:w-full lg:h-[255px] shrink-0 bg-[#F7F3E8]/55 p-3 sm:p-4 lg:px-6 flex items-center justify-center border-r lg:border-r-0 lg:border-b border-[#E5DEC9] cursor-pointer"
                    >
                      <div className="w-full max-w-[86px] sm:max-w-[102px] lg:max-w-[155px]">
                        <BookCoverArt
                          book={book}
                          author={bookAuthor}
                          size="md"
                          onClick={() => onNavigate(`/books/${book.slug}`)}
                        />
                      </div>
                    </div>

                    {/* Equalized Card Content & Action Bar */}
                    <div className="p-3.5 sm:p-5 lg:p-6 flex-1 min-w-0 flex flex-col justify-between space-y-3 lg:space-y-4">
                      <div className="space-y-1 sm:space-y-1.5 min-w-0">
                        <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#174D3A] font-semibold truncate">
                          {displayCategory}
                        </p>

                        <h3
                          onClick={() => onNavigate(`/books/${book.slug}`)}
                          className="text-base sm:text-lg lg:text-xl font-serif not-italic font-bold text-[#1C1917] hover:text-[#243B8A] transition-colors cursor-pointer leading-snug line-clamp-2"
                        >
                          {displayTitle}
                        </h3>

                        {bookAuthor && (
                          <button
                            type="button"
                            onClick={() =>
                              onNavigate(`/authors/${bookAuthor.slug}`)
                            }
                            className="text-xs sm:text-sm font-serif not-italic font-medium text-[#243B8A] hover:underline cursor-pointer text-left truncate block max-w-full"
                          >
                            {displayAuthor}
                          </button>
                        )}

                        <p className="text-[11.5px] sm:text-xs text-[#525665] leading-relaxed line-clamp-2 lg:line-clamp-3 pt-0.5">
                          {displayDescription}
                        </p>
                      </div>

                      {/* Pinned Bottom Price & Action Bar */}
                      <div className="pt-2.5 sm:pt-3.5 lg:pt-4 border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-base sm:text-lg font-bold text-[#1C1917] tabular-nums">
                          ₹{book.price}
                        </span>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/books/${book.slug}`)}
                            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold text-[#1C1917] hover:text-[#243B8A] border border-[#DCD4C0] hover:border-[#243B8A] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {isMr ? 'पहा' : 'View'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onAddToCart(book.id)}
                            className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
                              isAdded
                                ? 'bg-[#174D3A] text-[#FFFDF7]'
                                : 'bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7]'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span>{isMr ? 'जोडले' : 'Added'}</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                                <span>{isMr ? 'खरेदी करा' : 'Buy Book'}</span>
                              </>
                            )}
                          </button>
                        </div>
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
          5. FOR AUTHORS — INVITE WRITERS TO PUBLISH (SWIPABLE RAIL ON MOBILE/TABLET)
          ===================================================================== */}
      <section
        ref={forAuthorsRef}
        data-testid="home-manuscript-desk"
        className={`akath-io-section ${
          isForAuthorsVisible ? 'is-visible' : ''
        } w-full overflow-hidden py-10 sm:py-16 lg:py-20 border-b border-[#E5DEC9] bg-[#F7F3E8]/65`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 min-w-0">
          <div
            data-testid="home-authors-pillars-rail"
            className="akath-swipe-rail flex md:grid md:grid-cols-12 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-4 sm:gap-5 lg:gap-8 items-stretch w-full max-w-full pb-2 md:pb-0"
          >
            {/* Left 7 Columns: Author Invitation Box */}
            <div className="snap-start shrink-0 w-[284px] sm:w-[390px] md:w-auto md:col-span-7 rounded-xl border border-[#DCD4C0] bg-[#FFFDF7] p-5 sm:p-7 lg:p-10 flex flex-col justify-between space-y-5 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-[#243B8A]">
                    {isMr ? '०४ · लेखकांसाठी' : '04 · FOR AUTHORS'}
                  </p>
                  <span className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF6EC] border border-[#DCD4C0] text-[10px] font-mono font-semibold text-[#243B8A]">
                    {isMr ? 'स्वाइप करा →' : 'Swipe →'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif not-italic font-bold text-[#1C1917] tracking-tight">
                  Have a Manuscript? Let&apos;s Talk.
                </h2>

                <p className="text-sm sm:text-base lg:text-lg text-[#525665] leading-relaxed max-w-[54ch]">
                  {isMr
                    ? 'प्रत्येक पुस्तकाची सुरुवात एका कल्पनेतून होते. आपल्या संहितेला प्रकाशनाच्या दिशेने नेऊ इच्छिणाऱ्या लेखकांचे आम्ही स्वागत करतो.'
                    : 'Every book begins with an idea. We welcome writers who want to take their manuscripts towards publication.'}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/submit-manuscript')}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-lg bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] font-semibold text-xs sm:text-sm lg:text-base transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Feather className="w-4 h-4 shrink-0" />
                  <span>
                    {isMr ? 'संहिता पाठवा' : 'Submit Your Manuscript'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.12em] text-[#57534E]">
                  {isMr
                    ? 'कथा · कादंबरी · कविता · प्रवासवर्णन · ललित'
                    : 'Fiction · Poetry · Travelogue · Non-Fiction'}
                </span>
              </div>
            </div>

            {/* Right 5 Columns: Equal-Height Manuscript-to-Book Diagram Box */}
            <div className="snap-start shrink-0 w-[274px] sm:w-[340px] md:w-auto md:col-span-5 rounded-xl border border-[#1B2D6B] bg-[#243B8A] text-[#FFFDF7] p-5 sm:p-6 lg:p-8 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 border-b border-[#FFFDF7]/15 pb-3 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.12em] text-[#FFD966]">
                <span className="truncate">
                  {isMr
                    ? 'हस्तलिखित ते प्रकाशित पुस्तक'
                    : 'MANUSCRIPT TO PUBLISHED BOOK'}
                </span>
                <span className="shrink-0">AKATH DESK</span>
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

              <div className="pt-3 border-t border-[#FFFDF7]/15 text-[10.5px] sm:text-[11px] font-mono uppercase tracking-[0.12em] text-[#FFFDF7]/80">
                {isMr
                  ? 'संहिता मूल्यमापन · संपादन · मुद्रण'
                  : 'Editorial Evaluation · Production · Print'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. ABOUT AKATH PRAKASHAN — LITERARY ETHOS & IMPRINT SEAL (NO VIDEO)
          ===================================================================== */}
      <section
        ref={aboutAkathRef}
        data-testid="home-about-akath"
        className={`akath-io-section ${
          isAboutAkathVisible ? 'is-visible' : ''
        } w-full overflow-hidden py-10 sm:py-16 lg:py-20 bg-[#FFFDF7] border-t border-[#E5DEC9]`}
      >
        <div className="max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6 sm:space-y-8 min-w-0">
          {/* Editorial Imprint Header */}
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

          {/* 12-Column Editorial Philosophy & Imprint Tortoise Seal Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-stretch">
            {/* Left 7 Columns: Three Literary Pillars & Invitations */}
            <div className="lg:col-span-7 rounded-xl border border-[#DCD4C0] bg-[#FAF6EC] p-5 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg border border-[#E5DEC9] bg-[#FFFDF7] p-4 space-y-1.5">
                  <p className="text-[10.5px] font-mono font-bold uppercase tracking-[0.16em] text-[#243B8A]">
                    01 · {isMr ? 'भाषा आणि आशय' : 'Language & Voice'}
                  </p>
                  <p className="text-xs sm:text-[13px] text-[#525665] leading-relaxed">
                    {isMr
                      ? 'मराठी साहित्याची जिवंत परंपरा जपत नव्या दमाच्या लेखकांना व्यासपीठ.'
                      : 'Honoring the living depth of Marathi writing while welcoming distinctive contemporary voices.'}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E5DEC9] bg-[#FFFDF7] p-4 space-y-1.5">
                  <p className="text-[10.5px] font-mono font-bold uppercase tracking-[0.16em] text-[#174D3A]">
                    02 · {isMr ? 'संथ संपादकीय संस्कार' : 'Patient Editing'}
                  </p>
                  <p className="text-xs sm:text-[13px] text-[#525665] leading-relaxed">
                    {isMr
                      ? 'प्रत्येक संहितेवर सखोल संवाद, मुद्रितशोधन आणि अचूक देवनागरी अक्षरजुळणी.'
                      : 'Close editorial collaboration, careful proofreading, and crisp Devanagari typesetting.'}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E5DEC9] bg-[#FFFDF7] p-4 space-y-1.5">
                  <p className="text-[10.5px] font-mono font-bold uppercase tracking-[0.16em] text-[#EF6855]">
                    03 · {isMr ? 'चिरंतन ग्रंथनिर्मिती' : 'Enduring Print'}
                  </p>
                  <p className="text-xs sm:text-[13px] text-[#525665] leading-relaxed">
                    {isMr
                      ? 'हातात घ्यावेसे वाटणारे कागद, आशयघन मुखपृष्ठे आणि टिकाऊ बांधणी.'
                      : 'Tactile archival paper, thoughtful cover design, and durable print editions.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5DEC9] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    data-testid="brand-film-discover-books"
                    onClick={() => onNavigate('/books')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>{isMr ? 'आमची पुस्तके पहा' : 'Discover Our Books'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('/about')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
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

            {/* Right 5 Columns: Official Tortoise Emblem & Literary Colophon Plate */}
            <div className="lg:col-span-5 rounded-xl border border-[#DCD4C0] bg-[#FFFDF7] p-6 sm:p-8 flex flex-col md:flex-row lg:flex-col items-center justify-center md:justify-start lg:justify-center text-center md:text-left lg:text-center gap-4 md:gap-6 lg:gap-4">
              <AnimatedTortoiseEmblem
                variant="forest"
                animate={false}
                className="w-24 h-24 sm:w-28 sm:h-28 shrink-0"
              />
              <div className="space-y-1.5">
                <p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[#174D3A]">
                  {isMr
                    ? 'अकथ प्रकाशन बोधचिन्ह'
                    : 'THE AKATH TORTOISE EMBLEM'}
                </p>
                <p className="font-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                  {isMr
                    ? 'संथ पावले · सखोल अक्षरे · चिरंतन ग्रंथ'
                    : 'Slow steps. Deep letters. Enduring books.'}
                </p>
                <p className="text-xs sm:text-[13px] text-[#57534E] max-w-[38ch] mx-auto md:mx-0 lg:mx-auto leading-relaxed">
                  {isMr
                    ? 'घाई न करता, प्रत्येक शब्द आणि पुस्तक आयुष्यभर सोबत राहील अशा निष्ठेने घडवण्याची आमची भूमिका.'
                    : 'Every story deserves unhurried editorial care—shaped patiently until it becomes a book worth keeping.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
