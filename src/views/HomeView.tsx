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
  Sparkles,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  BookRecord,
  AuthorRecord,
  EditorialArticle,
  FirstPageExcerpt,
} from '../types/publishing';
import { BookCoverArt } from '../components/BookCoverArt';
import { AnimatedTortoiseEmblem } from '../components/SarvamIllustrations';
import {
  HeroPublicationWatermark,
  AuthorsLandscapeBackdrop,
  AboutLandscapeBackdrop,
  HeroInteractiveBookPlinth,
} from '../components/HeroInteractiveShowcase';
import {
  CapabilitySpecimenPlate,
  JourneyStageGlyph,
} from '../components/PublishingCraftVisuals';
import {
  ConcentricOrbitRings,
  RotatingBookOrbitStage,
  AuthorStudioExperience,
  HOMEPAGE_SECTION_THEMES,
  HomepageThemeSectionId,
} from '../components/AtmosphericOrbitBackdrop';
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
    descriptionEn: 'Cover design, typesetting, layout and print preparation.',
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
  const prefersReducedMotion = useReducedMotion();

  const heroRevealContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.11,
        delayChildren: prefersReducedMotion ? 0 : 0.04,
      },
    },
  };

  const heroRevealItem = {
    hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const heroHairlineItem = {
    hidden: prefersReducedMotion
      ? { opacity: 1, scaleX: 1 }
      : { opacity: 0, scaleX: 0.35 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const [selectedBookId, setSelectedBookId] = useState<string>(
    books[0]?.id || 'book-scholar-juice'
  );
  const [showFullSpread, setShowFullSpread] = useState<boolean>(false);
  const [activeBookRailIndex, setActiveBookRailIndex] = useState<number>(0);
  const [activeCapabilityIdx, setActiveCapabilityIdx] = useState<number>(0);
  const [activeJourneyIdx, setActiveJourneyIdx] = useState<number>(0);
  const [activeThemeSection, setActiveThemeSection] =
    useState<HomepageThemeSectionId>('hero');

  const catalogRailRef = useRef<HTMLDivElement | null>(null);
  const catalogScrollRafRef = useRef<number | null>(null);

  const [heroRef, isHeroVisible] = useIntersectionReveal<HTMLElement>();
  const [whatWeDoRef, isWhatWeDoVisible] = useIntersectionReveal<HTMLElement>();
  const [howWePublishRef, isHowWePublishVisible] =
    useIntersectionReveal<HTMLElement>();
  const [ourBooksRef, isOurBooksVisible] = useIntersectionReveal<HTMLElement>();
  const [forAuthorsRef, isForAuthorsVisible] =
    useIntersectionReveal<HTMLElement>();
  const [aboutAkathRef, isAboutAkathVisible] =
    useIntersectionReveal<HTMLElement>();

  // Smooth whole-page scroll theme engine: active on desktop lg+ only (zero scroll re-renders on mobile/tablet)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(max-width: 1023px)').matches) return;
    const sectionPairs: Array<[HomepageThemeSectionId, HTMLElement | null]> = [
      ['hero', heroRef.current],
      ['what-we-do', whatWeDoRef.current],
      ['how-we-publish', howWePublishRef.current],
      ['our-books', ourBooksRef.current],
      ['for-authors', forAuthorsRef.current],
      ['about-akath', aboutAkathRef.current],
    ];

    const ratios = new Map<HomepageThemeSectionId, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sectionId = entry.target.getAttribute(
            'data-theme-section'
          ) as HomepageThemeSectionId | null;
          if (!sectionId) continue;
          ratios.set(
            sectionId,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        }

        let bestId: HomepageThemeSectionId | null = null;
        let bestRatio = 0.08;
        ratios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });
        if (bestId) {
          setActiveThemeSection(bestId);
        }
      },
      {
        threshold: [0.05, 0.18, 0.35, 0.55],
        rootMargin: '-12% 0px -18% 0px',
      }
    );

    for (const [id, node] of sectionPairs) {
      if (node) {
        node.setAttribute('data-theme-section', id);
        observer.observe(node);
      }
    }

    return () => observer.disconnect();
  }, [
    heroRef,
    whatWeDoRef,
    howWePublishRef,
    ourBooksRef,
    forAuthorsRef,
    aboutAkathRef,
  ]);

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
      setActiveBookRailIndex((prev) =>
        prev !== closestIdx ? closestIdx : prev
      );
    });
  };

  const scrollToBookCard = (index: number) => {
    const clampedIdx = Math.max(0, Math.min(books.length - 1, index));
    setActiveBookRailIndex(clampedIdx);
    const container = catalogRailRef.current;
    if (!container) return;
    const targetCard = container.children[clampedIdx] as
      | HTMLElement
      | undefined;
    if (targetCard) {
      container.scrollTo({
        left: targetCard.offsetLeft,
        behavior: 'smooth',
      });
    }
  };

  const activeTheme =
    HOMEPAGE_SECTION_THEMES[activeThemeSection] || HOMEPAGE_SECTION_THEMES.hero;

  const activeHeroBook =
    books.find((b) => b.id === selectedBookId) || books[0];
  const activeHeroIndex = activeHeroBook
    ? Math.max(
        0,
        books.findIndex((b) => b.id === activeHeroBook.id)
      )
    : 0;
  const activeHeroAuthor = activeHeroBook
    ? authors.find((a) => a.id === activeHeroBook.authorId)
    : undefined;
  const activeHeroEnMeta = activeHeroBook
    ? BOOK_ENGLISH_META[activeHeroBook.id]
    : undefined;

  const secondaryBooks = books.filter((b) => b.id !== activeHeroBook?.id);

  return (
    <div
      style={{
        backgroundColor: activeTheme.canvasBg,
        transition: 'background-color 700ms cubic-bezier(0.22, 1, 0.36, 1)',
        overflowX: 'clip',
      }}
      className="relative text-[#1C1917] w-full max-w-[100vw] overflow-x-hidden"
    >
      {/* Continuous Ambient Concentric Orbit Backdrop (Desktop lg+ only — zero mobile/tablet full-viewport SVG overdraw) */}
      <div
        aria-hidden="true"
        className={`hidden lg:flex pointer-events-none fixed inset-0 z-0 overflow-hidden items-center justify-center transition-opacity duration-700 ${
          activeThemeSection === 'hero' ? 'opacity-0' : 'opacity-45'
        }`}
      >
        <div className="w-[1240px] h-[1240px]">
          <ConcentricOrbitRings
            primaryStroke={activeTheme.orbitPrimary}
            secondaryStroke={activeTheme.orbitSecondary}
            glowColor={activeTheme.glowColor}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* =====================================================================
          1. HERO — GODAVARI RIVERFRONT DUSK LANDSCAPE & FEATURED EDITION PLINTH
          ===================================================================== */}
      <section
        ref={heroRef}
        data-testid="home-publishing-hero"
        className={`akath-io-section ${
          isHeroVisible ? 'is-visible' : ''
        } relative z-10 w-full overflow-hidden border-b border-[#E5DEC9]/75 bg-gradient-to-b from-[#FAF8F0] via-[#FAF8F1] to-[#F3F6FC] pb-9 sm:pb-11 lg:pb-12`}
      >
        {/* Dedicated Full-Bleed Luminous Godavari River & Sahyadri Hero Stage (Richly Visible Across All Devices) */}
        <div className="relative w-full min-h-[600px] sm:min-h-[560px] lg:min-h-[610px] xl:min-h-[640px] flex flex-col justify-start pt-8 sm:pt-11 lg:pt-12 pb-56 sm:pb-36 lg:pb-40">
          <HeroPublicationWatermark />

          <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 min-w-0">
            {/* Center-Aligned Poised Literary Statement with Staggered Editorial Reveal */}
            <motion.div
              data-testid="home-hero-identity-column"
              variants={heroRevealContainer}
              initial="hidden"
              animate="visible"
              className="w-full max-w-2xl lg:max-w-[660px] mx-auto flex flex-col items-center text-center space-y-3.5 sm:space-y-4.5"
            >
              <h1
                data-testid="home-hero-main-headline"
                className="w-full font-serif not-italic text-[#1C1917] tracking-[-0.025em] text-center [text-wrap:balance] drop-shadow-[0_1px_12px_rgba(253,248,236,0.9)]"
              >
                <motion.span
                  variants={heroRevealItem}
                  className="block font-normal text-[clamp(1.85rem,6.4vw,2.75rem)] sm:text-[clamp(2.45rem,4.4vw,3.3rem)] lg:text-[clamp(2.8rem,3.5vw,3.6rem)] leading-[1.2] text-[#242220]"
                >
                  {isMr ? 'शब्दांना पुस्तकाचं रूप देणारी' : 'Every story deserves'}{' '}
                </motion.span>
                <motion.span
                  variants={heroRevealItem}
                  className="block mt-1 font-semibold text-[clamp(2.15rem,7.8vw,3.25rem)] sm:text-[clamp(2.9rem,5.2vw,3.9rem)] lg:text-[clamp(3.3rem,4.1vw,4.3rem)] leading-[1.12] text-[#1E357E]"
                >
                  {isMr ? 'प्रकाशन संस्था.' : 'a place on the shelf.'}
                </motion.span>
              </h1>

              {/* Quiet Minimal Gold Hairline */}
              <motion.div
                variants={heroHairlineItem}
                aria-hidden="true"
                className="pt-0.5 origin-center"
              >
                <span className="block w-14 h-px bg-[#C89D54]/80 mx-auto" />
              </motion.div>

              <motion.p
                variants={heroRevealItem}
                data-testid="home-hero-supporting-line"
                className="max-w-[42ch] mx-auto text-center text-[17px] sm:text-[19.5px] lg:text-[21.5px] font-serif not-italic font-medium text-[#1E357E] leading-[1.45]"
              >
                {isMr
                  ? 'नवे स्वर शोधतो. कथांना आकार देतो. पुस्तके प्रकाशित करतो.'
                  : 'Discovering voices. Shaping stories. Publishing books.'}
              </motion.p>

              <motion.p
                variants={heroRevealItem}
                className="text-[14.5px] sm:text-[16px] lg:text-[17px] font-sans not-italic font-normal text-[#37332F] leading-[1.7] max-w-[50ch] mx-auto text-center"
              >
                {isMr
                  ? 'अकथ प्रकाशनमध्ये आम्ही अर्थपूर्ण मराठी लेखनाला जिवंत रूप देतो — मूळ कथा, वैयक्तिक अनुभव आणि विचार वाचनीय, जपण्याजोग्या व इतरांपर्यंत पोहोचणाऱ्या पुस्तकांत घडवण्यासाठी लेखकांसोबत काम करतो.'
                  : 'At Akath Prakashan, we bring meaningful Marathi writing to life — working with authors to turn original stories, personal narratives and ideas into books worth reading, sharing and keeping.'}
              </motion.p>

              {/* Focused Dual Actions */}
              <motion.div
                variants={heroRevealItem}
                className="w-full flex flex-wrap items-center justify-center gap-3.5 pt-2"
              >
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] font-medium text-sm shadow-[0_12px_26px_-10px_rgba(36,59,138,0.5)] transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <BookOpen className="w-4 h-4 text-[#FFD966]" />
                  <span>{isMr ? 'आमची पुस्तके पहा' : 'Explore Our Books'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/submit-manuscript')}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#FFFDF7]/95 hover:bg-[#1C1917] text-[#1C1917] hover:text-[#FFFDF7] border border-[#1C1917]/25 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Feather className="w-4 h-4 text-[#EF6855]" />
                  <span>
                    {isMr ? 'आमच्यासोबत प्रकाशित करा' : 'Publish With Us'}
                  </span>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Featured Edition Selector Tabs & Interactive 3D Book Showcase Plinth (Cleanly Below the Godavari Riverfront Stage) */}
        <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-8 lg:px-12 relative z-20 -mt-6 sm:-mt-8 min-w-0 space-y-5 sm:space-y-6">
          <div className="w-full min-w-0">
            <div
              data-testid="home-hero-anchors-rail"
              className="akath-swipe-rail flex flex-wrap sm:flex-nowrap items-center justify-center gap-x-5 gap-y-2 overflow-x-auto sm:overflow-visible snap-x snap-mandatory w-full pb-1 sm:pb-0 border-b border-[#E5DEC9]/80 max-w-2xl mx-auto"
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
                    className={`snap-start shrink-0 pb-2.5 text-xs sm:text-[13px] font-serif transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 border-b-2 -mb-px ${
                      isSelected
                        ? 'border-[#243B8A] text-[#243B8A] font-semibold'
                        : 'border-transparent text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    <span className="font-mono text-[10.5px] opacity-70 tabular-nums">
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

          {/* Interactive 3D Tilt & Open-Page Folio Edition Showcase */}
          {activeHeroBook && (
            <HeroInteractiveBookPlinth
              books={books}
              authors={authors}
              activeHeroBook={activeHeroBook}
              activeHeroAuthor={activeHeroAuthor}
              activeHeroIndex={activeHeroIndex}
              activeHeroEnMeta={activeHeroEnMeta}
              secondaryBooks={secondaryBooks}
              bookEnglishMeta={BOOK_ENGLISH_META}
              isMr={isMr}
              showFullSpread={showFullSpread}
              setShowFullSpread={setShowFullSpread}
              setSelectedBookId={setSelectedBookId}
              onNavigate={onNavigate}
              onAddToCart={onAddToCart}
              recentlyAddedBookId={recentlyAddedBookId}
            />
          )}
        </div>
      </section>

      {/* =====================================================================
          2. WHAT WE DO — UNIFIED 4-STAGE TABBED CRAFT SHOWCASE (COMPACT)
          ===================================================================== */}
      <section
        ref={whatWeDoRef}
        data-testid="home-what-we-do"
        className={`akath-io-section akath-cv-section ${
          isWhatWeDoVisible ? 'is-visible' : ''
        } relative z-10 w-full overflow-hidden py-8 sm:py-11 lg:py-14 border-b border-[#E5DEC9]/65 bg-[#F3F6FC] lg:bg-transparent`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6 sm:space-y-7 min-w-0">
          {/* Center-Aligned Editorial Section Header */}
          <div className="max-w-3xl mx-auto text-center space-y-2">
            <div className="flex items-center justify-center gap-3">
              <p className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#174D3A]">
                {isMr ? '०१ · प्रकाशन कार्यकक्षा' : '01 · WHAT WE DO'}
              </p>
              <span className="md:hidden text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-[#243B8A]">
                {isMr ? 'निवडा / स्वाइप करा →' : 'Tap or Swipe →'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-serif not-italic font-medium text-[#1C1917] tracking-tight leading-tight">
              From Manuscript to Bookshelf.
            </h2>
            <p className="text-xs sm:text-[15px] text-[#525665] max-w-xl mx-auto leading-relaxed">
              {isMr
                ? 'हस्तलिखिताच्या पहिल्या मसुद्यापासून वाचकांच्या हातातील पुस्तकापर्यंत संपूर्ण संपादकीय आणि मुद्रण प्रक्रिया.'
                : 'Four editorial crafts guiding a writer’s raw manuscript to an enduring finished book in print.'}
            </p>
          </div>

          {/* Unified Horizontal 4-Stage Pill/Tab Selector -> Wide Interactive Landscape Showcase Below */}
          <div className="space-y-4 sm:space-y-5 min-w-0">
            <div
              data-testid="what-we-do-swipe-rail"
              className="akath-swipe-rail flex md:grid md:grid-cols-2 lg:grid-cols-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory gap-2.5 sm:gap-3.5 w-full max-w-full pb-1.5 md:pb-0"
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
                    className={`relative snap-start shrink-0 w-[235px] sm:w-[255px] md:w-full cursor-pointer transition-colors duration-200 rounded-2xl border p-3.5 sm:p-4 flex flex-col justify-between md:backdrop-blur-sm ${
                      isActive
                        ? 'bg-white border-[#243B8A]/45 shadow-[0_12px_28px_-16px_rgba(36,59,138,0.26)]'
                        : 'bg-white/90 md:bg-white/70 border-[#DCD4C0]/75 hover:bg-white/95'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="what-we-do-active-bar"
                        aria-hidden="true"
                        className="absolute inset-x-4 top-0 h-[2.5px] rounded-full bg-gradient-to-r from-[#243B8A] to-[#EF6855]"
                      />
                    )}

                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`font-mono text-xs font-bold tabular-nums px-2 py-0.5 rounded-full transition-colors ${
                          isActive
                            ? 'bg-[#243B8A] text-[#FFFDF7]'
                            : 'bg-[#FAF6EC] text-[#57534E]'
                        }`}
                      >
                        {item.number}
                      </span>
                      <IconComponent
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#EF6855]' : 'text-[#78716C]'
                        }`}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3
                        className={`text-[14.5px] sm:text-base font-serif not-italic font-medium leading-snug transition-colors ${
                          isActive ? 'text-[#243B8A]' : 'text-[#1C1917]'
                        }`}
                      >
                        {isMr ? item.titleMr : item.titleEn}
                      </h3>
                      <p className="text-[11px] font-mono uppercase tracking-[0.1em] text-[#174D3A] truncate">
                        {isMr ? item.deliverableMr : item.deliverableEn}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <CapabilitySpecimenPlate
              activeIndex={activeCapabilityIdx}
              isMr={isMr}
              onSelectIndex={setActiveCapabilityIdx}
              title={
                isMr
                  ? PUBLISHING_CAPABILITIES[activeCapabilityIdx]?.titleMr || ''
                  : PUBLISHING_CAPABILITIES[activeCapabilityIdx]?.titleEn || ''
              }
              deliverable={
                isMr
                  ? PUBLISHING_CAPABILITIES[activeCapabilityIdx]
                      ?.deliverableMr || ''
                  : PUBLISHING_CAPABILITIES[activeCapabilityIdx]
                      ?.deliverableEn || ''
              }
              description={
                isMr
                  ? PUBLISHING_CAPABILITIES[activeCapabilityIdx]
                      ?.descriptionMr || ''
                  : PUBLISHING_CAPABILITIES[activeCapabilityIdx]
                      ?.descriptionEn || ''
              }
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. HOW WE PUBLISH — DEEP INDIGO INK CONSTELLATION & SMOOTH COLOR SHIFT
          ===================================================================== */}
      <section
        ref={howWePublishRef}
        data-testid="home-how-we-publish"
        className={`akath-io-section akath-cv-section ${
          isHowWePublishVisible ? 'is-visible' : ''
        } relative z-10 w-full overflow-hidden py-8 sm:py-11 lg:py-14 border-b border-white/10 bg-[#121C45] lg:bg-[#121C45]/92 text-[#FFFDF7]`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 68% 58% at 50% 40%, rgba(255, 217, 102, 0.12) 0%, rgba(18, 28, 69, 0) 74%)',
          }}
        />

        <div className="max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 space-y-8 sm:space-y-10 lg:space-y-12 relative z-10 min-w-0">
          {/* Center-Aligned Lightweight Header */}
          <div className="max-w-3xl mx-auto text-center space-y-2.5">
            <div className="flex items-center justify-center gap-3">
              <p className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#FFD966]">
                {isMr ? '०२ · प्रकाशन प्रवास' : '02 · HOW WE PUBLISH'}
              </p>
              <span className="md:hidden text-[10px] font-mono font-medium uppercase tracking-[0.14em] text-[#FFD966]">
                {isMr ? 'स्वाइप करा →' : 'Swipe →'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-serif not-italic font-medium text-[#FFFDF7] tracking-tight leading-tight">
              An Idea Becomes a Book.
            </h2>
            <p className="hidden sm:block text-[10.5px] sm:text-xs font-mono uppercase tracking-[0.16em] text-[#FFFDF7]/70">
              01 DISCOVER → 02 REVIEW → 03 DEVELOP → 04 PRODUCE → 05 PUBLISH
            </p>
          </div>

          <div className="relative">
            {/* Tablet Continuous Thread */}
            <div
              aria-hidden="true"
              className="hidden md:block lg:hidden pointer-events-none absolute top-6 inset-x-[10%] h-[1.5px] bg-[#FFD966]/30 z-0"
            >
              <div
                className="h-full bg-[#FFD966] transition-all duration-300"
                style={{
                  width: `${
                    (activeJourneyIdx /
                      (PUBLISHING_JOURNEY_STAGES.length - 1)) *
                    100
                  }%`,
                }}
              />
            </div>

            {/* Desktop Undulating Ink Thread */}
            <svg
              aria-hidden="true"
              viewBox="0 0 1000 120"
              preserveAspectRatio="none"
              className="hidden lg:block pointer-events-none absolute top-[18px] inset-x-[7%] w-[86%] h-[88px] overflow-visible z-0"
            >
              <path
                d="M 0 28 C 110 28, 140 84, 250 84 C 360 84, 390 28, 500 28 C 610 28, 640 84, 750 84 C 860 84, 890 28, 1000 28"
                fill="none"
                stroke="#FFD966"
                strokeOpacity="0.25"
                strokeWidth="1.6"
                strokeDasharray="5 5"
              />
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
                  transition:
                    'stroke-dashoffset 380ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </svg>

            {/* Mobile Vertical Connected Milestone List (<md) & Tablet/Desktop 5-Col Constellation Wave (md+) */}
            <ol
              data-testid="how-we-publish-swipe-rail"
              className="relative z-10 flex flex-col gap-3 md:grid md:grid-cols-5 md:gap-4 lg:gap-6 items-stretch md:items-start w-full max-w-full"
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
                    className={`relative w-full md:w-auto flex flex-row md:flex-col items-start md:items-center md:text-center gap-3.5 md:gap-0 p-3.5 md:p-0 rounded-2xl md:rounded-none border md:border-0 transition-colors cursor-pointer group ${
                      isActive
                        ? 'bg-white/[0.08] md:bg-transparent border-[#FFD966]/50'
                        : 'bg-white/[0.02] md:bg-transparent border-white/10 hover:bg-white/[0.05] md:hover:bg-transparent'
                    } ${isLowerArc ? 'lg:pt-14' : 'lg:pt-0'}`}
                  >
                    {/* Mobile Vertical Connector Thread */}
                    {idx < PUBLISHING_JOURNEY_STAGES.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="md:hidden absolute left-[35px] top-[56px] bottom-[-18px] w-px bg-[#FFD966]/30 pointer-events-none"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveJourneyIdx(idx)}
                      aria-label={`${stage.step}. ${stage.label}`}
                      aria-current={isActive ? 'step' : undefined}
                      className={`relative z-10 w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border ${
                        isActive
                          ? 'bg-[#FFD966] border-[#FFD966] shadow-[0_0_24px_rgba(255,217,102,0.45)] scale-105'
                          : isReached
                          ? 'bg-[#243B8A] border-[#FFD966] text-[#FFD966]'
                          : 'bg-[#121C45] border-[#FFFDF7]/35 group-hover:border-[#FFD966]'
                      }`}
                    >
                      <JourneyStageGlyph index={idx} isActive={isActive} />
                    </button>

                    <span
                      aria-hidden="true"
                      className={`hidden md:block w-px h-4 lg:h-5 my-2 transition-colors ${
                        isActive ? 'bg-[#FFD966]' : 'bg-[#FFFDF7]/25'
                      }`}
                    />

                    <div className="flex-1 min-w-0 space-y-1 md:pt-0">
                      <div className="flex items-center justify-between md:justify-center gap-1.5 lg:gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-serif text-lg md:text-lg lg:text-2xl font-medium leading-none tabular-nums transition-colors ${
                              isActive ? 'text-[#FFD966]' : 'text-[#FFFDF7]/45'
                            }`}
                          >
                            {stage.step}
                          </span>
                          <h3 className="font-mono text-xs md:text-[11px] lg:text-sm font-semibold uppercase tracking-[0.12em] lg:tracking-[0.14em] text-[#FFFDF7] whitespace-nowrap">
                            {stage.step}. {stage.label}
                          </h3>
                        </div>
                        <span className="md:hidden text-[10px] font-mono uppercase tracking-[0.12em] text-[#FFD966]/85">
                          {isMr ? `टप्पा ${stage.step}` : `0${idx + 1}/05`}
                        </span>
                      </div>

                      <p className="text-[13px] md:text-[12px] lg:text-[13.5px] text-[#FFFDF7]/85 leading-relaxed max-w-none md:max-w-[24ch] md:mx-auto">
                        {isMr ? stage.descriptionMr : stage.descriptionEn}
                      </p>

                      <div className="pt-0.5 md:pt-1 flex items-center md:justify-center gap-2 text-[10px] lg:text-[10.5px] font-mono uppercase tracking-[0.1em] lg:tracking-[0.12em] text-[#FFD966]/90">
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

          {/* Rounded-Full Interactive Stage Stepper */}
          <div className="pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                className="min-h-[44px] flex-1 sm:flex-none px-4 py-2 rounded-full border border-[#FFFDF7]/25 hover:border-[#FFD966] text-[11px] font-mono uppercase tracking-[0.12em] text-[#FFFDF7] transition-colors cursor-pointer whitespace-nowrap"
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
                className="min-h-[44px] flex-1 sm:flex-none px-5 py-2 rounded-full bg-[#FFD966] hover:bg-[#ffe38a] text-[#1C1917] text-[11px] font-mono font-semibold uppercase tracking-[0.12em] transition-colors cursor-pointer whitespace-nowrap"
              >
                {isMr ? 'पुढील टप्पा →' : 'Next Stage →'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. OUR BOOKS — MIDDLE-OF-PAGE 3D ROTATING BOOK STAGE + SWIPEABLE FOLIO GRID
          ===================================================================== */}
      <section
        ref={ourBooksRef}
        data-testid="home-published-books"
        className={`akath-io-section akath-cv-section ${
          isOurBooksVisible ? 'is-visible' : ''
        } relative z-10 w-full overflow-hidden py-8 sm:py-11 lg:py-14 border-b border-[#E5DEC9]/75 bg-[#FFFDF7] lg:bg-transparent`}
      >
        <div className="max-w-[1340px] mx-auto px-4 sm:px-8 lg:px-12 space-y-5 sm:space-y-6 lg:space-y-7 min-w-0">
          {/* Center-Aligned Header */}
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <p className="text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#174D3A]">
                {isMr ? '०३ · प्रकाशित ग्रंथसूची' : '03 · OUR BOOKS'}
              </p>
              <span className="lg:hidden inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#DCD4C0] text-[10px] font-mono font-semibold text-[#243B8A] tabular-nums">
                {isMr
                  ? `०${activeBookRailIndex + 1} / ०${books.length}`
                  : `0${activeBookRailIndex + 1} / 0${books.length}`}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-serif not-italic font-medium text-[#1C1917] tracking-tight leading-tight">
              Books We Bring to Life.
            </h2>

            <div className="pt-1 flex flex-wrap items-center justify-center gap-3">
              {/* Mobile & Tablet Snap Stepper Controls */}
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
                  className="w-8 h-8 rounded-full bg-white/85 border border-[#DCD4C0] hover:border-[#243B8A] disabled:opacity-40 text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/85 border border-[#DCD4C0]">
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
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tabular-nums transition-colors cursor-pointer ${
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
                  className="w-8 h-8 rounded-full bg-white/85 border border-[#DCD4C0] hover:border-[#243B8A] disabled:opacity-40 text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/books')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shadow-sm"
              >
                <span>Explore the Catalogue →</span>
              </button>
            </div>
          </div>

          {/* 3D Orbital Rotating Book Cards Stage (Tablet & Desktop md+) */}
          <div className="hidden md:block">
            <RotatingBookOrbitStage
              books={books}
              authors={authors}
              isMr={isMr}
              bookEnglishMeta={BOOK_ENGLISH_META}
              activeIndex={activeBookRailIndex}
              onChangeIndex={setActiveBookRailIndex}
              onNavigate={onNavigate}
              onAddToCart={onAddToCart}
              recentlyAddedBookId={recentlyAddedBookId}
            />
          </div>

          {/* Synchronized Horizontal Swipe Rail (<lg) & Clean Glassmorphic 3-Col Ledger (lg+) */}
          <div
            ref={catalogRailRef}
            onScroll={handleCatalogRailScroll}
            data-testid="home-catalog-horizontal-scroll"
            className="akath-swipe-rail flex lg:grid lg:grid-cols-3 overflow-x-auto lg:overflow-visible snap-x snap-mandatory gap-4 sm:gap-5 lg:gap-8 items-stretch w-full max-w-full pb-2 lg:pb-0"
          >
            {books.map((book, idx) => {
              const bookAuthor = authors.find((a) => a.id === book.authorId);
              const enMeta = BOOK_ENGLISH_META[book.id];
              const isAdded = recentlyAddedBookId === book.id;
              const isHighlighted = idx === activeBookRailIndex;

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
                  onMouseEnter={() => setActiveBookRailIndex(idx)}
                  className={`snap-start shrink-0 w-[302px] sm:w-[368px] md:w-[388px] lg:w-auto h-full rounded-2xl overflow-hidden border md:backdrop-blur-sm flex flex-col justify-between transition-colors duration-200 ${
                    isHighlighted
                      ? 'border-[#243B8A]/40 bg-white shadow-[0_16px_40px_-22px_rgba(36,59,138,0.26)]'
                      : 'border-[#DCD4C0]/85 bg-white/95 md:bg-white/85 hover:border-[#243B8A]/35'
                  }`}
                >
                  <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-[#FAF6EC]/80 border-b border-[#E5DEC9]/80 flex items-center justify-between text-[10.5px] sm:text-[11px] font-mono text-[#57534E]">
                    <span className="font-semibold text-[#243B8A] tabular-nums">
                      EDITION 0{idx + 1}
                    </span>
                    <span>
                      {isMr ? book.format : enMeta?.formatEn || 'Paperback'}
                    </span>
                  </div>

                  <div className="flex flex-row lg:flex-col flex-1 min-w-0">
                    <div
                      onClick={() => onNavigate(`/books/${book.slug}`)}
                      className="w-[106px] sm:w-[126px] lg:w-full lg:h-[250px] shrink-0 bg-[#FAF6EC]/45 p-3 sm:p-4 lg:px-6 flex items-center justify-center border-r lg:border-r-0 lg:border-b border-[#E5DEC9]/80 cursor-pointer"
                    >
                      <div className="w-full max-w-[86px] sm:max-w-[102px] lg:max-w-[152px]">
                        <BookCoverArt
                          book={book}
                          author={bookAuthor}
                          size="md"
                          onClick={() => onNavigate(`/books/${book.slug}`)}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-5 lg:p-6 flex-1 min-w-0 flex flex-col justify-between space-y-3 lg:space-y-4">
                      <div className="space-y-1 sm:space-y-1.5 min-w-0">
                        <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#174D3A] font-semibold truncate">
                          {displayCategory}
                        </p>

                        <h3
                          onClick={() => onNavigate(`/books/${book.slug}`)}
                          className="text-base sm:text-lg lg:text-xl font-serif not-italic font-medium text-[#1C1917] hover:text-[#243B8A] transition-colors cursor-pointer leading-snug line-clamp-2"
                        >
                          {displayTitle}
                        </h3>

                        {bookAuthor && (
                          <button
                            type="button"
                            onClick={() =>
                              onNavigate(`/authors/${bookAuthor.slug}`)
                            }
                            className="text-xs sm:text-sm font-serif not-italic font-normal text-[#243B8A] hover:underline cursor-pointer text-left truncate block max-w-full"
                          >
                            {displayAuthor}
                          </button>
                        )}

                        <p className="text-[11.5px] sm:text-xs text-[#525665] leading-relaxed line-clamp-2 lg:line-clamp-3 pt-0.5">
                          {displayDescription}
                        </p>
                      </div>

                      <div className="pt-2.5 sm:pt-3.5 lg:pt-4 border-t border-[#E5DEC9]/80 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-base sm:text-lg font-semibold text-[#1C1917] tabular-nums">
                          ₹{book.price}
                        </span>

                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/books/${book.slug}`)}
                            className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium text-[#1C1917] hover:text-[#243B8A] border border-[#DCD4C0] hover:border-[#243B8A] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {isMr ? 'पहा' : 'View'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onAddToCart(book.id)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium transition-colors inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
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
          5. FOR AUTHORS — ILLUSTRATED ARCHIVAL LITERARY ATELIER & WRITER DESK
          ===================================================================== */}
      <section
        ref={forAuthorsRef}
        data-testid="home-manuscript-desk"
        className={`akath-io-section akath-cv-section ${
          isForAuthorsVisible ? 'is-visible' : ''
        } relative z-10 w-full overflow-hidden py-12 sm:py-16 lg:py-20 border-b border-[#DCD4C0]/80 bg-[#F4EDE0] text-[#1C1917]`}
      >
        {/* Layered Sahyadri Mountains & Nanded Godavari Dusk Landscape (20–25% Opacity SVG) */}
        <AuthorsLandscapeBackdrop />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 space-y-7 sm:space-y-8 min-w-0">
          {/* Center-Aligned High-Impact Editorial Header */}
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center justify-center gap-2 text-[11px] sm:text-xs font-mono font-semibold uppercase tracking-[0.18em] text-[#174D3A]">
              <Sparkles className="w-3.5 h-3.5 text-[#C89D54]" />
              <span>{isMr ? '०४ · लेखकांसाठी' : '04 · FOR AUTHORS'}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-serif not-italic font-semibold text-[#1C1917] tracking-tight leading-tight">
              Have a Manuscript? Let&apos;s Talk.
            </h2>

            <p className="text-sm sm:text-base font-normal text-[#44403C] leading-relaxed max-w-[54ch] mx-auto">
              {isMr
                ? 'प्रत्येक पुस्तकाची सुरुवात एका कल्पनेतून होते. आपल्या संहितेला प्रकाशनाच्या दिशेने नेऊ इच्छिणाऱ्या लेखकांचे आम्ही स्वागत करतो.'
                : 'Every book begins with an idea. Explore our editorial studio guide and share your manuscript with Akath Prakashan.'}
            </p>
          </div>

          {/* Interactive Warm Archival Writer Studio UI */}
          <div data-testid="home-authors-pillars-rail" className="min-w-0">
            <AuthorStudioExperience isMr={isMr} onNavigate={onNavigate} />
          </div>

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => onNavigate('/submit-manuscript')}
              className="inline-flex items-center gap-2 px-6.5 py-3 rounded-full bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-xs sm:text-sm font-medium shadow-[0_12px_28px_-10px_rgba(36,59,138,0.45)] transition-colors cursor-pointer"
            >
              <Feather className="w-4 h-4 text-[#FFD966]" />
              <span>
                {isMr ? 'संहिता पाठवा' : 'Submit Your Manuscript'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. ABOUT AKATH PRAKASHAN — STREAMLINED LITERARY ETHOS & IMPRINT SEAL
          ===================================================================== */}
      <section
        ref={aboutAkathRef}
        data-testid="home-about-akath"
        className={`akath-io-section akath-cv-section ${
          isAboutAkathVisible ? 'is-visible' : ''
        } relative z-10 w-full overflow-hidden pt-10 pb-56 sm:pt-14 sm:pb-44 lg:py-20 bg-[#FAF6EC]`}
      >
        {/* Layered Sahyadri Mountains & Nanded Godavari Dusk Landscape (20–25% Opacity SVG) */}
        <AboutLandscapeBackdrop />

        <div className="relative z-10 max-w-[960px] mx-auto px-4 sm:px-8 lg:px-12 space-y-6 min-w-0 pointer-events-none">
          <div className="py-4 sm:py-6 flex flex-col items-center text-center space-y-5">
            <AnimatedTortoiseEmblem
              variant="forest"
              animate={false}
              className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 pointer-events-auto"
            />

            <div className="space-y-2.5 max-w-2xl mx-auto pointer-events-auto">
              <p className="text-[11px] sm:text-xs font-mono not-italic font-semibold uppercase tracking-[0.2em] text-[#243B8A]">
                {isMr
                  ? '०५ · आमची ओळख · THE JOURNEY OF A STORY'
                  : '05 · ABOUT AKATH PRAKASHAN · THE JOURNEY OF A STORY'}
              </p>

              <h2 className="text-2xl sm:text-4xl font-serif not-italic font-medium text-[#1C1917] tracking-tight leading-tight">
                Rooted in Language. Driven by Stories.
              </h2>

              <p className="text-sm sm:text-[16.5px] font-sans not-italic font-normal text-[#44403C] leading-relaxed">
                {isMr
                  ? 'अकथ प्रकाशन ही विचारशील लेखन, अर्थपूर्ण कथा आणि नवे आवाज मुद्रित स्वरूपात वाचकांपर्यंत आणण्यासाठी बांधिलकी जपणारी मराठी प्रकाशन संस्था आहे.'
                  : 'Akath Prakashan is a Marathi publishing initiative committed to bringing thoughtful writing, meaningful stories and new voices into print.'}
              </p>

              <p className="font-serif text-base sm:text-lg font-medium text-[#174D3A] pt-1">
                {isMr
                  ? 'संथ पावले · सखोल अक्षरे · चिरंतन ग्रंथ'
                  : 'Slow steps. Deep letters. Enduring books.'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 pointer-events-auto">
              <button
                type="button"
                data-testid="brand-film-discover-books"
                onClick={() => onNavigate('/books')}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>{isMr ? 'आमची पुस्तके पहा' : 'Discover Our Books'}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/about')}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
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
      </section>
    </div>
  );
};
