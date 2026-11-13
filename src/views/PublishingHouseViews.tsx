import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  AuthorRecord,
  BookRecord,
  EditorialArticle,
  ManuscriptSubmission,
} from '../types/publishing';
import { BookCard } from '../components/BookCard';
import {
  AnimatedTortoiseEmblem,
} from '../components/SarvamIllustrations';
import { WalkingTortoise } from '../components/WalkingTortoise';
import { PUBLISHER_IDENTITY } from '../data/seedData';
import { useLanguage } from '../i18n/translations';
import { validateEmail, validateIndianPhone } from '../utils/validation';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Upload,
  Clock,
  MapPin,
  ChevronDown,
  Check,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';

// ============================================================================
// 1. AUTHORS DIRECTORY VIEW (/authors)
// ============================================================================

interface AuthorsListViewProps {
  authors: AuthorRecord[];
  books: BookRecord[];
  onNavigate: (path: string) => void;
}

export const AuthorsListView: React.FC<AuthorsListViewProps> = ({
  authors,
  books,
  onNavigate,
}) => {
  const { lang, t } = useLanguage();

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
      <section className="bg-white border-b border-[#E6DFCE] sarvam-aura">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14"
        >
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#243B8A] mb-1.5">
            <span className="font-mono px-1.5 py-0.5 rounded bg-[#FFD966]/65 text-[#252832] font-bold">01</span>
            <span aria-hidden="true">·</span>
            <span>{t.home.authorsEyebrow}</span>
          </div>
          <h1 className="type-page-heading text-[#252832]">{t.home.authorsTitle}</h1>
          <p className="mt-2.5 prose-marathi text-[#5A5F72] max-w-[62ch]">
            {lang === 'mr'
              ? 'महाराष्ट्राच्या विविध भूभागांतून, भाषिक प्रवाहांतून आणि साहित्यप्रकारांतून समकालीन मराठी साहित्याला समृद्ध करणारे लेखक, कवी आणि समीक्षक.'
              : 'Contemporary Marathi novelists, poets, essayists, and translators from across Maharashtra published by Akath Prakashan.'}
          </p>
        </motion.div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authors.map((author, idx) => {
            const authorBooks = books.filter((b) => b.authorId === author.id);
            return (
              <motion.article
                key={author.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 hover:border-[#243B8A]/35 transition-colors flex flex-col justify-between space-y-5 shadow-[0_8px_28px_-14px_rgba(37,40,50,0.06)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[13px] text-[#5A5F72]">
                    <span className="font-semibold text-[#243B8A]">
                      {author.region}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{author.literaryRole}</span>
                  </div>

                  <h2 className="type-section-heading text-[#252832]">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/authors/${author.slug}`)}
                      className="text-left hover:text-[#243B8A] transition-colors"
                    >
                      {author.name}
                    </button>
                  </h2>

                  <p className="text-[15px] text-[#5A5F72] leading-relaxed">
                    {author.biography}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E6DFCE] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#5A5F72]">
                    <span className="font-semibold text-[#252832]">
                      {lang === 'mr' ? 'पुस्तके:' : 'Books:'}
                    </span>
                    {authorBooks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onNavigate(`/books/${b.slug}`)}
                        className="text-[#243B8A] hover:underline font-medium"
                      >
                        {b.title}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/authors/${author.slug}`)}
                    className="text-[14px] font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1"
                  >
                    <span>
                      {lang === 'mr' ? 'संपूर्ण परिचय' : 'Full Profile'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// 2. AUTHOR DETAIL VIEW (/authors/:slug)
// ============================================================================

interface AuthorDetailViewProps {
  author: AuthorRecord;
  books: BookRecord[];
  articles: EditorialArticle[];
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string) => void;
  recentlyAddedBookId: string | null;
}

export const AuthorDetailView: React.FC<AuthorDetailViewProps> = ({
  author,
  books,
  articles,
  onNavigate,
  onAddToCart,
  recentlyAddedBookId,
}) => {
  const { lang, t } = useLanguage();
  const authorBooks = books.filter((b) => b.authorId === author.id);
  const authorArticles = articles.filter((a) => a.authorId === author.id);

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
      <div className="bg-white border-b border-[#E6DFCE]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <button
            type="button"
            onClick={() => onNavigate('/authors')}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#5A5F72] hover:text-[#243B8A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav.authors}</span>
          </button>
        </div>
      </div>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 max-w-3xl space-y-4"
        >
          <p className="text-[13px] font-semibold text-[#243B8A]">
            {author.literaryRole} · {author.region}
          </p>
          <h1 className="type-page-heading text-[#252832]">{author.name}</h1>
          <p className="prose-marathi text-[#5A5F72]">{author.biography}</p>
          <blockquote className="bg-[#FFD966]/20 border border-[#FFD966] rounded-xl p-4 text-[15px] text-[#252832] italic">
            {author.editorialNote}
          </blockquote>
        </motion.div>

        {authorBooks.length > 0 && (
          <div className="pt-4">
            <h2 className="type-section-heading text-[#252832] mb-6">
              {lang === 'mr'
                ? `${author.name} यांची पुस्तके`
                : `Books by ${author.name}`}
            </h2>
            <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scroll-smooth gap-4 sm:gap-7 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
              {authorBooks.map((book) => (
                <div
                  key={book.id}
                  className="w-[80vw] max-w-[295px] sm:w-auto sm:max-w-none shrink-0 snap-center sm:snap-start"
                >
                  <BookCard
                    book={book}
                    author={author}
                    onSelectBook={(slug) => onNavigate(`/books/${slug}`)}
                    onAddToCart={onAddToCart}
                    justAdded={recentlyAddedBookId === book.id}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {authorArticles.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-4">
            <h2 className="type-section-heading text-[#252832]">
              {lang === 'mr'
                ? 'वाचनकट्ट्यावरील लेखन'
                : 'Essays on Vachankatta'}
            </h2>
            <div className="divide-y divide-[#E6DFCE]">
              {authorArticles.map((art) => (
                <div
                  key={art.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                      className="font-serif text-[19px] font-bold text-[#252832] hover:text-[#243B8A] text-left"
                    >
                      {art.title}
                    </button>
                    <p className="text-[14px] text-[#5A5F72]">{art.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                    className="text-[14px] text-[#243B8A] font-semibold hover:underline shrink-0"
                  >
                    {t.vachankatta.readFullArticle} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

// ============================================================================
// 3. ABOUT AKATH PRAKASHAN VIEW (/about) — MUSEUM-GRADE EDITORIAL MONOGRAPH
//    Archival Warm Paper, Hairline Architecture, Zero Nested Card Clutter,
//    65ch Reading Measure & Subtle Bottom Patient Tortoise Traverse
// ============================================================================

interface AboutAkathViewProps {
  onNavigate: (path: string) => void;
}

const aboutSectionSequentialVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 58,
      damping: 20,
      mass: 1.08,
      staggerChildren: 0.12,
      delayChildren: 0.04,
    },
  },
};

const aboutItemSequentialVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.996 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 64,
      damping: 21,
      mass: 1.05,
    },
  },
};

/**
 * Custom IntersectionObserver hook for staggered paragraph-block scroll-reveal
 * across the About Akath Prakashan literary monograph.
 */
function useAboutParagraphScrollReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  activeFilter: string
) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>('[data-about-io-block]')
    );
    const paragraphs = Array.from(
      root.querySelectorAll<HTMLElement>('[data-about-io-para]')
    );

    const revealElement = (el: HTMLElement) => {
      el.classList.add('is-revealed');
      el.setAttribute('data-revealed', 'true');
    };

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      blocks.forEach(revealElement);
      paragraphs.forEach(revealElement);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            revealElement(target);

            if (target.hasAttribute('data-about-io-block')) {
              const childParas =
                target.querySelectorAll<HTMLElement>('[data-about-io-para]');
              childParas.forEach(revealElement);
            }

            observer.unobserve(target);
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -24px 0px',
      }
    );

    blocks.forEach((block) => {
      if (!block.classList.contains('is-revealed')) {
        observer.observe(block);
      }
    });

    paragraphs.forEach((para) => {
      if (!para.classList.contains('is-revealed')) {
        observer.observe(para);
      }
    });

    return () => observer.disconnect();
  }, [containerRef, activeFilter]);
}

export const AboutAkathView: React.FC<AboutAkathViewProps> = ({
  onNavigate,
}) => {
  const { lang } = useLanguage();
  const aboutArticleRef = useRef<HTMLElement | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [readingLens, setReadingLens] = useState<'bilingual' | 'marathi' | 'english'>('bilingual');
  const [activeChapterId, setActiveChapterId] = useState<string>('about-manifesto-top');

  useAboutParagraphScrollReveal(aboutArticleRef, readingLens);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const scrollToChapter = (elementId: string) => {
    setActiveChapterId(elementId);
    if (typeof document !== 'undefined') {
      const target = document.getElementById(elementId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const formattedDate = (() => {
    try {
      return new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }).format(now);
    } catch {
      return now.toLocaleDateString();
    }
  })();

  const formattedTime = (() => {
    try {
      return new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }).format(now);
    } catch {
      return now.toLocaleTimeString();
    }
  })();

  const istHour = (() => {
    try {
      const hourStr = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      }).format(now);
      return parseInt(hourStr, 10) || now.getHours();
    } catch {
      return now.getHours();
    }
  })();

  const literaryWatchLabel =
    istHour >= 5 && istHour < 12
      ? lang === 'mr'
        ? 'प्रभात वाचन प्रहर'
        : 'Morning Reading Watch'
      : istHour >= 12 && istHour < 17
      ? lang === 'mr'
        ? 'दुपारचा संपादन प्रहर'
        : 'Editorial Desk Hours'
      : istHour >= 17 && istHour < 21
      ? lang === 'mr'
        ? 'सायं साहित्य प्रहर'
        : 'Evening Literary Hour'
      : lang === 'mr'
      ? 'रात्रीचा चिंतन प्रहर'
      : 'Quiet Night Reading Watch';

  const chapterRailItems = [
    {
      id: 'about-manifesto-top',
      index: 'I',
      labelMr: 'संपादकीय भूमिका',
      labelEn: 'About Akath',
    },
    {
      id: 'about-why-tortoise',
      index: 'II',
      labelMr: 'कासवाचे प्रतीक का?',
      labelEn: 'Why the Tortoise?',
    },
    {
      id: 'about-chapter-06',
      index: 'III',
      labelMr: 'संस्थापक व अधिष्ठान',
      labelEn: 'Founder & Imprint',
    },
    {
      id: 'about-colophon-end',
      index: 'IV',
      labelMr: 'ब्रीदवाक्य',
      labelEn: 'Colophon',
    },
  ];

  return (
    <div className="bg-[#FBF9F5] text-[#1C1917] min-h-screen selection:bg-[#243B8A]/15 selection:text-[#1C1917]">
      {/* ===================================================================
          0. ARCHIVAL DATELINE & STICKY CHAPTER NAVIGATION RIBBON
          =================================================================== */}
      <div
        data-testid="about-archival-dateline"
        className="border-b border-[#DCD4C0] bg-[#FBF9F5]/95 backdrop-blur-sm sticky top-0 z-20"
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Top Archival Metadata Row */}
          <div className="py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#57534E] border-b border-[#E6DFCE]/80">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-[0.18em] text-[#1C1917] font-semibold">
                Akath Prakashan · अकथ प्रकाशन
              </span>
              <span aria-hidden="true">·</span>
              <span>Nanded, Maharashtra</span>
              <span aria-hidden="true" className="hidden md:inline">·</span>
              <span className="hidden md:inline text-[#243B8A]">
                Curatorial Monograph &amp; Imprint Charter
              </span>
            </div>

            <div className="flex items-center gap-2 tabular-nums">
              <span data-testid="about-live-date">{formattedDate}</span>
              <span aria-hidden="true">·</span>
              <span data-testid="about-live-time">{formattedTime} IST</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline font-editorial-prose text-[11.5px] text-[#174D3A] font-medium">
                {literaryWatchLabel}
              </span>
            </div>
          </div>

          {/* Interactive Exhibition Chapter Rail */}
          <nav
            aria-label="About Monograph Chapters"
            className="py-2 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar"
          >
            <div className="flex items-center gap-5 sm:gap-7 shrink-0">
              {chapterRailItems.map((item) => {
                const isCurrent = activeChapterId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToChapter(item.id)}
                    className={`group inline-flex items-baseline gap-1.5 text-[12px] whitespace-nowrap shrink-0 transition-colors cursor-pointer py-0.5 ${
                      isCurrent
                        ? 'text-[#243B8A] font-semibold'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    <span className="font-mono text-[10.5px] text-[#78716C] group-hover:text-[#243B8A]">
                      {item.index}.
                    </span>
                    <span className="font-editorial-prose">
                      {lang === 'mr' ? item.labelMr : item.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-4 shrink-0 text-[11.5px] font-mono">
              <button
                type="button"
                onClick={() => onNavigate('/books')}
                className="text-[#243B8A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                {lang === 'mr' ? 'प्रकाशित ग्रंथसूची →' : 'Published Catalogue →'}
              </button>
              <span aria-hidden="true" className="text-[#DCD4C0]">|</span>
              <button
                type="button"
                onClick={() => onNavigate('/submit-manuscript')}
                className="text-[#174D3A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                {lang === 'mr' ? 'संहिता पाठवा →' : 'Submit Manuscript →'}
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* ===================================================================
          1. MUSEUM-GRADE EDITORIAL MONOGRAPH & BROADSHEET CANVAS
          =================================================================== */}
      <article
        ref={aboutArticleRef}
        data-testid="about-editorial-essay"
        aria-label="About Akath Prakashan"
        className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-20 space-y-16 sm:space-y-24"
      >
        {/* =================================================================
            SECTION 1: ASYMMETRIC BROADSHEET HERO & MARGINALIA CANVAS
            (8-Column 65ch Lead Manifesto + 4-Column Curatorial Margin Rail)
            ================================================================= */}
        <div
          id="about-manifesto-top"
          className="scroll-mt-28 space-y-10"
        >
          {/* Top Broadsheet Marquee Header */}
          <div className="border-b border-[#1C1917] pb-8 lg:pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <p
                data-about-io-para="lead-eyebrow"
                style={{ '--io-stagger-index': 0 } as React.CSSProperties}
                className="akath-about-io-para text-[11.5px] font-mono uppercase tracking-[0.2em] text-[#243B8A] font-semibold"
              >
                About Akath Prakashan · संपादकीय जाहीरनामा · Nanded Imprint
              </p>

              {/* Interactive Reading Lens Segmented Switcher */}
              <div
                role="group"
                aria-label="Reading Language Lens"
                className="inline-flex items-center gap-1 p-1 bg-[#F2ECE1] border border-[#DCD4C0] rounded-sm"
              >
                {(
                  [
                    { id: 'bilingual', label: 'द्विभाषिक · Bilingual' },
                    { id: 'marathi', label: 'मराठी सार' },
                    { id: 'english', label: 'English Essay' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setReadingLens(mode.id)}
                    className={`px-2.5 py-1 text-[11px] font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer rounded-sm ${
                      readingLens === mode.id
                        ? 'bg-[#1C1917] text-[#FBF9F5] font-medium'
                        : 'text-[#57534E] hover:text-[#1C1917]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
              <div className="lg:col-span-8 space-y-3">
                <h1
                  data-testid="about-headline-breathe"
                  className="akath-about-headline-breathe font-editorial-display text-[32px] sm:text-[44px] lg:text-[52px] font-bold text-[#1C1917] leading-[1.18] tracking-tight"
                >
                  काही पुस्तकं वाचून संपतात. काही आपल्यासोबत राहतात.
                </h1>
                <p className="akath-about-lead-breathe font-editorial-display italic text-[20px] sm:text-[25px] text-[#57534E] leading-[1.4]">
                  Some books end at the last page. Others stay with us.
                </p>
              </div>

              <div className="lg:col-span-4 lg:border-l lg:border-[#DCD4C0] lg:pl-8 space-y-2 text-[13.5px] font-editorial-prose text-[#57534E]">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#174D3A] font-semibold">
                  संपादकीय अधिष्ठान · Imprint Ethos
                </p>
                <p className="leading-relaxed text-[#292524]">
                  नांदेड येथून कार्यरत असलेली स्वतंत्र मराठी साहित्य प्रकाशन संस्था — कथा, कादंबरी, कविता, समीक्षा, प्रवासवर्णन आणि भाषांतरित साहित्याचे मूल्यनिष्ठ दालन.
                </p>
              </div>
            </div>
          </div>

          {/* Focused Single-Column 65ch Reading Canvas */}
          <div className="max-w-[65ch]" data-testid="about-prose-measure">
            <motion.section
              data-testid="about-hero-manifesto"
              data-about-io-block="lead-manifesto"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              className="akath-about-io-block space-y-7"
            >
              {/* Marathi Distilled Synthesis Callout (Shown in Bilingual or Marathi mode) */}
              {readingLens !== 'english' && (
                <motion.div
                  variants={aboutItemSequentialVariants}
                  className="bg-[#F4EFE4] border border-[#DCD4C0] p-5 sm:p-6 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#243B8A]">
                    <span>संपादकीय प्रस्तावना · Marathi Editorial Note</span>
                    <span>नांदेड · महाराष्ट्र</span>
                  </div>
                  <p className="font-serif text-[16px] sm:text-[17px] text-[#1C1917] leading-[1.85]">
                    पुस्तक प्रकाशित करणे म्हणजे केवळ कागदावर अक्षरे छापणे नव्हे; तर एका अस्वस्थ करणाऱ्या अनुभवाला, काळजात मुरलेल्या शब्दांना आणि नव्या जाणिवांना त्यांचे हक्काचे घर मिळवून देणे होय. अकथ प्रकाशन हे घाईगडबडीच्या बाजारपेठेत शांतपणे, संहितेच्या गुणवत्तेवर आणि लेखकाच्या शब्दांवर विश्वास ठेवून काम करणारे प्रकाशन गृह आहे.
                  </p>
                </motion.div>
              )}

              {/* Main English Editorial Essay with Drop Cap */}
              <motion.div variants={aboutItemSequentialVariants}>
                <div
                  data-testid="about-prose-breathe-block"
                  style={{ '--breathe-phase': '0.4s' } as React.CSSProperties}
                  className={`akath-about-prose-breathe space-y-5 font-editorial-prose text-[16.5px] sm:text-[17.5px] text-[#1C1917] leading-[1.85] ${
                    readingLens === 'marathi' ? 'opacity-90' : 'opacity-100'
                  }`}
                >
                  <p
                    data-about-io-para="lead-p1"
                    style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                    className="akath-about-io-para first-letter:text-5xl first-letter:font-editorial-display first-letter:font-bold first-letter:float-left first-letter:mr-3.5 first-letter:mt-1 first-letter:leading-none first-letter:text-[#243B8A]"
                  >
                    Akath Prakashan grew out of a simple feeling: there are books worth bringing into the world, and there should be people willing to take the time to do it properly.
                  </p>

                  <p
                    data-about-io-para="lead-p2"
                    style={{ '--io-stagger-index': 2 } as React.CSSProperties}
                    className="akath-about-io-para"
                  >
                    A manuscript is a strange, wonderful thing. Sometimes it arrives as a finished story. Sometimes it is a collection of scattered thoughts, a voice still finding its shape, or an experience that has waited years to be put into words. Before it becomes a book, it needs someone willing to read it carefully, ask the right questions, and understand what the writer is trying to say.
                  </p>

                  {/* Editorial Pull Quote — Hairline Top/Bottom Framing */}
                  <blockquote
                    data-about-io-para="lead-callout"
                    style={{ '--io-stagger-index': 3 } as React.CSSProperties}
                    className="akath-about-io-para my-8 py-6 border-y border-[#1C1917]/20 space-y-2"
                  >
                    <p className="font-editorial-display italic text-[21px] sm:text-[24px] text-[#243B8A] leading-[1.42]">
                      &ldquo;That is the kind of work we want to do. We don&apos;t think literature always needs to be loud to matter.&rdquo;
                    </p>
                    <footer className="text-[12px] font-mono text-[#57534E]">
                      साहित्याला स्वतःचे महत्त्व सिद्ध करण्यासाठी गोंगाटाची गरज नसते · Editorial Principle I
                    </footer>
                  </blockquote>

                  <p
                    data-about-io-para="lead-p3"
                    style={{ '--io-stagger-index': 4 } as React.CSSProperties}
                    className="akath-about-io-para"
                  >
                    Based in Nanded, Akath Prakashan is an independent publishing house devoted to Marathi literature and writing across languages. We work with fiction, poetry, essays, criticism, and translations — not because every category needs to be represented, but because good writing can come from anywhere and speak to anyone.
                  </p>

                  <p
                    data-about-io-para="lead-p4"
                    style={{ '--io-stagger-index': 5 } as React.CSSProperties}
                    className="akath-about-io-para"
                  >
                    We are interested in writing that notices what others overlook. Stories that make familiar places feel different. Poems that find words for things we have felt but never quite known how to express. Essays that leave us with better questions than the ones we started with.
                  </p>
                </div>
              </motion.div>
            </motion.section>
          </div>
        </div>

        {/* =================================================================
            SECTION 2: PROMINENT CENTERPIECE — WHY THE TORTOISE?
            (Dedicated, Unmistakable Showcase of Akath's Tortoise Symbol & Ethos)
            ================================================================= */}
        <motion.section
          id="about-why-tortoise"
          data-testid="about-why-tortoise-feature"
          data-about-io-block="folio-04"
          variants={aboutSectionSequentialVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.04 }}
          className="akath-seq-step akath-about-io-block scroll-mt-28 rounded-3xl bg-[#174D3A] text-[#FFFDF7] border-2 border-[#FFD966]/45 p-7 sm:p-11 lg:p-14 shadow-[0_24px_60px_-18px_rgba(23,77,58,0.35)] space-y-10"
        >
          {/* Top Header & Emblem Medallion */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center border-b border-white/15 pb-8">
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-[#FFFDF7] text-[#1C1917] border border-[#FFD966] shadow-inner space-y-3">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#174D3A] font-bold">
                THE AKATH EMBLEM · IMPRINT COLOPHON
              </span>
              <AnimatedTortoiseEmblem className="w-32 h-32 sm:w-36 sm:h-36" variant="forest" />
              <div className="text-center space-y-0.5 pt-1">
                <p className="font-serif text-[17px] font-bold text-[#174D3A]">
                  The Patient Tortoise
                </p>
                <p className="font-mono text-[11px] text-[#57534E]">
                  One Manuscript · One Book · One Reader at a Time
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD966]/15 border border-[#FFD966]/40 text-[#FFD966] font-mono text-[11px] uppercase tracking-[0.16em]">
                <span>✦ THE SYMBOL OF AKATH PRAKASHAN</span>
              </div>
              <h2 className="akath-about-headline-breathe font-editorial-display text-[32px] sm:text-[42px] lg:text-[48px] font-bold text-[#FFFDF7] leading-[1.15]">
                Why the tortoise?
              </h2>

              <div
                data-testid="about-prose-breathe-block"
                className="akath-about-prose-breathe space-y-4 font-editorial-prose text-[17px] sm:text-[18px] text-[#FFFDF7]/95 leading-[1.85] max-w-[65ch]"
              >
                <p
                  data-about-io-para="folio-04-p1"
                  style={{ '--io-stagger-index': 0 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  We chose a tortoise for a reason. It isn&apos;t in a hurry. It carries its home with it. And it reminds us that getting somewhere slowly is still getting somewhere.
                </p>

                <p
                  data-about-io-para="folio-04-p2"
                  style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  Publishing has its own pressures to move faster, publish more, and follow what is already selling. We understand those realities. But we also believe there is value in pausing over a sentence, taking another look at a manuscript, and making a book we can stand behind years later.
                </p>

                <p
                  data-about-io-para="folio-04-p3"
                  style={{ '--io-stagger-index': 2 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  We would rather build a small list of books we believe in than fill a catalogue simply to make it bigger.
                </p>

                <p
                  data-about-io-para="folio-04-p4"
                  style={{ '--io-stagger-index': 3 } as React.CSSProperties}
                  className="akath-about-io-para font-semibold text-[#FFD966] pt-1"
                >
                  Akath Prakashan is our attempt to do just that — one manuscript, one book, one reader at a time.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Concrete Pillars of the Tortoise Philosophy (English Only) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="bg-[#123D2E] rounded-2xl border border-white/15 p-5 space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#FFD966]">
                01 · Unhurried Craft
              </p>
              <h3 className="font-editorial-display text-[21px] font-bold text-[#FFFDF7]">
                Patience Over Speed
              </h3>
              <p className="text-[14px] text-[#FFFDF7]/85 leading-relaxed">
                We never rush a book to meet a commercial trend. Every sentence, proof, and page margin is given the time it deserves.
              </p>
            </div>

            <div className="bg-[#123D2E] rounded-2xl border border-white/15 p-5 space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#FFD966]">
                02 · Carries Its Home
              </p>
              <h3 className="font-editorial-display text-[21px] font-bold text-[#FFFDF7]">
                Rooted Regional Voice
              </h3>
              <p className="text-[14px] text-[#FFFDF7]/85 leading-relaxed">
                Like the tortoise carrying its shell, our books carry the authentic lived idioms of Nanded, Marathwada, and Maharashtra.
              </p>
            </div>

            <div className="bg-[#123D2E] rounded-2xl border border-white/15 p-5 space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#FFD966]">
                03 · Long Lifespan
              </p>
              <h3 className="font-editorial-display text-[21px] font-bold text-[#FFFDF7]">
                Books That Endure
              </h3>
              <p className="text-[14px] text-[#FFFDF7]/85 leading-relaxed">
                Tortoises outlive fleeting seasons. We publish a small, fiercely curated list of books meant to stay with readers for decades.
              </p>
            </div>
          </div>
        </motion.section>

        {/* =================================================================
            SECTION 3: MUSEUM ACCESSION LEDGER & FOUNDER STEWARDSHIP DESK
            ================================================================= */}
        <motion.section
          id="about-chapter-06"
          data-testid="about-editorial-colophon-desk"
          data-about-io-block="colophon-desk"
          variants={aboutSectionSequentialVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.04 }}
          style={{ '--io-block-delay': '60ms' } as React.CSSProperties}
          className="akath-seq-step akath-about-io-block scroll-mt-28 bg-white border border-[#DCD4C0] p-6 sm:p-10 lg:p-12 space-y-8"
        >
          <motion.div variants={aboutItemSequentialVariants} className="space-y-8">
            {/* Top Accession Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#DCD4C0] text-[11px] font-mono text-[#57534E]">
              <span className="uppercase tracking-[0.18em] text-[#243B8A] font-semibold">
                Chapter III · Imprint Stewardship &amp; Accession Record
              </span>
              <span>REG. NANDED · MAHARASHTRA · INDIA</span>
            </div>

            <div
              style={{ '--breathe-phase': '4.3s' } as React.CSSProperties}
              className="akath-about-prose-breathe grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
            >
              {/* Left 6 Cols: Founder Identity & Publisher's Statement */}
              <div
                data-about-io-para="colophon-founder"
                style={{ '--io-stagger-index': 0 } as React.CSSProperties}
                className="akath-about-io-para lg:col-span-6 space-y-4"
              >
                <div className="space-y-1.5">
                  <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#243B8A] font-medium">
                    Founder &amp; Publisher · संस्थापक आणि प्रकाशक
                  </p>
                  <h2
                    data-testid="about-founder-name"
                    className="akath-about-headline-breathe font-editorial-display text-[28px] sm:text-[34px] font-bold text-[#1C1917] leading-tight"
                  >
                    Pooja Vasantrao Dhawale
                  </h2>
                  <p className="font-serif text-[19px] text-[#174D3A] font-semibold">
                    पूजा वसंतराव ढवळे
                  </p>
                </div>

                <p className="text-[15px] font-editorial-prose text-[#292524] leading-[1.8]">
                  Editorial Direction, Manuscript Selection &amp; Imprint Stewardship. Guiding Akath Prakashan with a commitment to patient editorial dialogue, transparent author partnerships, and enduring print craftsmanship.
                </p>

                <div className="pt-2 border-t border-[#E6DFCE] text-[14px] font-serif text-[#57534E] leading-relaxed">
                  &ldquo;प्रत्येक चांगल्या संहितेला तिचा स्वतःचा वेळ, संपादकीय आदर आणि वाचकांपर्यंत पोहोचणारा प्रामाणिक मार्ग मिळायला हवा, हाच अकथ प्रकाशनाचा पाया आहे.&rdquo;
                </div>
              </div>

              {/* Right 6 Cols: Museum Accession Definition List (dl) */}
              <dl
                data-about-io-para="colophon-header"
                style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                className="akath-about-io-para lg:col-span-6 lg:border-l lg:border-[#DCD4C0] lg:pl-10 space-y-4 text-[14px]"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3.5 border-b border-[#E6DFCE]">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#57534E]">
                    Imprint Name
                  </dt>
                  <dd className="font-editorial-prose font-semibold text-[#1C1917]">
                    Akath Prakashan · अकथ प्रकाशन
                  </dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3.5 border-b border-[#E6DFCE]">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#57534E]">
                    Headquarters
                  </dt>
                  <dd className="font-editorial-prose font-medium text-[#1C1917]">
                    Nanded, Maharashtra · नांदेड (४३१६०२)
                  </dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3.5 border-b border-[#E6DFCE]">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#57534E]">
                    Editorial Scope
                  </dt>
                  <dd className="font-editorial-prose font-medium text-[#1C1917]">
                    Fiction, Poetry, Essays, Travelogues &amp; Vachankatta
                  </dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3.5 border-b border-[#E6DFCE]">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#57534E]">
                    Publishing Model
                  </dt>
                  <dd className="font-editorial-prose font-medium text-[#174D3A]">
                    100% Merit-Based · House-Funded Production
                  </dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#57534E]">
                    Editorial Desk
                  </dt>
                  <dd className="font-mono text-[13px] text-[#243B8A]">
                    {PUBLISHER_IDENTITY.email} · {PUBLISHER_IDENTITY.phoneDisplay}
                  </dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </motion.section>

        {/* =================================================================
            SECTION 4: CLOSING MOTTO, PATIENT TORTOISE TRAVERSE & PATHWAYS
            ================================================================= */}
        <motion.footer
          id="about-colophon-end"
          data-testid="about-closing-colophon"
          data-about-io-block="closing-colophon"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.04 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-label="अकथ प्रकाशन समारोप ब्रीदवाक्य"
          className="akath-about-io-block scroll-mt-28 pt-10 border-t border-[#1C1917] space-y-10"
        >
          <div className="text-center space-y-3">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#57534E]">
              Chapter IV · Imprint Colophon &amp; Motto
            </p>
            <div
              data-about-io-para="closing-motto"
              style={{ '--io-stagger-index': 0 } as React.CSSProperties}
              className="akath-about-io-para flex flex-wrap items-baseline justify-center gap-3"
            >
              <p className="font-editorial-display italic text-[22px] sm:text-[26px] text-[#243B8A] font-medium">
                अकथ प्रकाशन
              </p>
              <span aria-hidden="true" className="text-[#C89D54]">
                —
              </span>
              <p
                data-testid="about-final-marathi-line"
                className="font-editorial-display not-italic text-[24px] sm:text-[30px] font-bold text-[#174D3A] leading-snug"
              >
                वाचत राहू. विचारत राहू. लिहित राहू.
              </p>
            </div>
            <p className="font-editorial-prose text-[14px] text-[#57534E]">
              Let us keep reading. Let us keep questioning. Let us keep writing.
            </p>
          </div>

          <WalkingTortoise />

          {/* Bottom 3-Zone Curatorial Action Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('/books')}
              className="group bg-white border border-[#DCD4C0] hover:border-[#243B8A] p-5 text-left transition-colors cursor-pointer flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#243B8A]">
                  01 · Catalogue
                </p>
                <p className="mt-1 font-editorial-display text-[19px] font-bold text-[#1C1917] group-hover:text-[#243B8A]">
                  {lang === 'mr' ? 'प्रकाशित पुस्तके पहा' : 'Explore Published Books'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#57534E] group-hover:text-[#243B8A] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/vachankatta')}
              className="group bg-white border border-[#DCD4C0] hover:border-[#243B8A] p-5 text-left transition-colors cursor-pointer flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#174D3A]">
                  02 · Literary Journal
                </p>
                <p className="mt-1 font-editorial-display text-[19px] font-bold text-[#1C1917] group-hover:text-[#174D3A]">
                  {lang === 'mr' ? 'वाचनकट्टा आणि पहिलं पान' : 'Read Vachankatta & Excerpts'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#57534E] group-hover:text-[#174D3A] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/submit-manuscript')}
              className="group bg-white border border-[#DCD4C0] hover:border-[#243B8A] p-5 text-left transition-colors cursor-pointer flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#243B8A]">
                  03 · For Authors
                </p>
                <p className="mt-1 font-editorial-display text-[19px] font-bold text-[#1C1917] group-hover:text-[#243B8A]">
                  {lang === 'mr' ? 'प्रकाशनार्थ संहिता पाठवा' : 'Submit Your Manuscript'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#57534E] group-hover:text-[#243B8A] shrink-0" />
            </button>
          </div>
        </motion.footer>
      </article>
    </div>
  );
};

// ============================================================================
// 4. SUBMIT MANUSCRIPT VIEW (/submit-manuscript)
// ============================================================================

interface SubmitManuscriptViewProps {
  onSubmitManuscript: (
    payload: Record<string, unknown>
  ) => Promise<{
    ok: boolean;
    submission?: ManuscriptSubmission;
    error?: string;
    fieldErrors?: Record<string, string>;
  }>;
}

export const SubmitManuscriptView: React.FC<SubmitManuscriptViewProps> = ({
  onSubmitManuscript,
}) => {
  const { lang, t } = useLanguage();

  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [category, setCategory] = useState('कादंबरी');
  const [wordCountEstimate] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [sampleExcerptText, setSampleExcerptText] = useState('');
  const [originalWorkConfirmed, setOriginalWorkConfirmed] = useState(true);
  const [privacyConsentConfirmed, setPrivacyConsentConfirmed] = useState(true);
  const [fileMeta, setFileMeta] = useState<{
    fileName: string;
    fileType: string;
    fileSizeBytes: number;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<ManuscriptSubmission | null>(
    null
  );
  const [trackRefInput, setTrackRefInput] = useState('');
  const [trackedManuscript, setTrackedManuscript] = useState<{
    referenceCode: string;
    title: string;
    author: string;
    category: string;
    stageIndex: number;
    statusLabelMr: string;
    statusLabelEn: string;
    noteMr: string;
    noteEn: string;
  } | null>(null);

  const handleTrackManuscript = (codeToLookup?: string) => {
    const raw = (codeToLookup ?? trackRefInput).trim().toUpperCase();
    if (!raw) return;
    setTrackRefInput(raw);
    if (submittedRecord && submittedRecord.referenceCode.toUpperCase() === raw) {
      setTrackedManuscript({
        referenceCode: submittedRecord.referenceCode,
        title: submittedRecord.manuscriptTitle,
        author: submittedRecord.authorName,
        category: submittedRecord.category,
        stageIndex: 1,
        statusLabelMr: 'टप्पा १/६ · संहिता प्राथमिक नोंदणी पूर्ण (Received at Desk)',
        statusLabelEn: 'Stage 1 of 6 · Manuscript Logged for Initial Reading',
        noteMr:
          'आपली संहिता अकथ प्रकाशनच्या संपादकीय पटलावर नोंदवली गेली असून प्राथमिक वाचनासाठी रांगेत आहे.',
        noteEn:
          'Your manuscript has been logged at the Nanded editorial desk and queued for first-round literary evaluation.',
      });
      return;
    }
    setTrackedManuscript({
      referenceCode: raw.startsWith('AK-MS-') ? raw : `AK-MS-${raw}`,
      title: raw === 'AK-MS-102' ? 'तिसऱ्या प्रहराची नोंदवही' : 'काठावरचे दिवस (नमुना संहिता)',
      author: raw === 'AK-MS-102' ? 'प्रा. मिलिंद कुलकर्णी' : 'सौ. प्रणाली देशपांडे, नांदेड',
      category: 'कादंबरी',
      stageIndex: raw === 'AK-MS-102' ? 4 : 2,
      statusLabelMr:
        raw === 'AK-MS-102'
          ? 'टप्पा ४/६ · संहिता संपादन आणि भाषा संस्कार सुरू'
          : 'टप्पा २/६ · द्विसदस्यीय संपादकीय वाचन सुरू (Under Two-Reader Review)',
      statusLabelEn:
        raw === 'AK-MS-102'
          ? 'Stage 4 of 6 · Collaborative Line Editing in Progress'
          : 'Stage 2 of 6 · Under Two-Editor Literary Evaluation',
      noteMr:
        'संपादकीय मंडळाकडून संहितेची भाषिक लय, आशयघनता आणि संरचना यांचा सखोल अभ्यास सुरू आहे.',
      noteEn:
        'Our two-editor panel is currently evaluating voice, narrative structure, and regional linguistic craft.',
    });
  };

  const authorNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const synopsisRef = useRef<HTMLTextAreaElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (authorName.trim().length < 2) {
      nextErrors.authorName =
        lang === 'mr'
          ? 'कृपया लेखकाचे पूर्ण नाव लिहा.'
          : 'Please enter the author’s full name.';
    }

    const emailCheck = validateEmail(email, lang);
    if (!emailCheck.isValid) {
      nextErrors.email = emailCheck.error!;
    }

    const phoneCheck = validateIndianPhone(phone, lang);
    if (!phoneCheck.isValid) {
      nextErrors.phone = phoneCheck.error!;
    }

    if (manuscriptTitle.trim().length < 2) {
      nextErrors.manuscriptTitle =
        lang === 'mr'
          ? 'कृपया हस्तलिखिताचे शीर्षक लिहा.'
          : 'Please enter the manuscript title.';
    }

    if (synopsis.trim().length < 40) {
      nextErrors.synopsis =
        lang === 'mr'
          ? 'कृपया किमान ४० अक्षरांचा सारांश लिहा.'
          : 'Please provide a synopsis of at least 40 characters.';
    }

    if (sampleExcerptText.trim().length < 80) {
      nextErrors.sampleExcerptText =
        lang === 'mr'
          ? 'कृपया किमान ८० अक्षरांचा नमुना उतारा लिहा.'
          : 'Please include a sample excerpt of at least 80 characters.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.authorName) authorNameRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.phone) phoneRef.current?.focus();
      else if (nextErrors.manuscriptTitle) titleRef.current?.focus();
      else if (nextErrors.synopsis) synopsisRef.current?.focus();
      else if (nextErrors.sampleExcerptText) excerptRef.current?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await onSubmitManuscript({
        lang,
        authorName: authorName.trim(),
        email: emailCheck.normalizedValue,
        phone: phoneCheck.normalizedValue,
        city: city.trim() || 'नांदेड',
        manuscriptTitle: manuscriptTitle.trim(),
        category,
        wordCountEstimate: wordCountEstimate.trim(),
        synopsis: synopsis.trim(),
        sampleExcerptText: sampleExcerptText.trim(),
        fileAttachmentMeta: fileMeta || undefined,
        originalWorkConfirmed,
        privacyConsentConfirmed,
      });

      if (res.ok && res.submission) {
        setSubmittedRecord(res.submission);
      } else if (res.fieldErrors) {
        setErrors(res.fieldErrors);
      } else if (res.error) {
        setErrors({ form: res.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[820px] mx-auto px-4 sm:px-6"
      >
        <div className="mb-8 space-y-2">
          <div className="text-[13px] font-semibold text-[#243B8A]">
            <span>{t.manuscript.title}</span>
          </div>
          <h1 className="type-page-heading text-[#252832]">{t.manuscript.title}</h1>
          <p className="prose-marathi text-[#5A5F72]">{t.manuscript.subtitle}</p>
        </div>

        {/* Live Manuscript Reference Tracker (AK-MS-...) */}
        <div
          data-testid="manuscript-status-tracker"
          className="mb-8 bg-white rounded-2xl border border-[#E6DFCE] p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#243B8A] font-semibold">
                Manuscript Desk Tracker · संहिता संदर्भ स्थिती
              </p>
              <h2 className="font-serif text-[18px] font-bold text-[#252832]">
                {lang === 'mr'
                  ? 'तुमच्या पाठवलेल्या हस्तलिखिताची संपादकीय स्थिती तपासा'
                  : 'Track Your Submitted Manuscript by Reference Code'}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => handleTrackManuscript('AK-MS-101')}
              className="text-[12px] font-mono text-[#243B8A] hover:underline cursor-pointer"
            >
              {lang === 'mr' ? 'नमुना पहा: AK-MS-101' : 'Try Sample: AK-MS-101'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={trackRefInput}
              onChange={(e) => setTrackRefInput(e.target.value)}
              placeholder={
                lang === 'mr'
                  ? 'उदा. AK-MS-101 संदर्भ क्रमांक टाका...'
                  : 'Enter reference code (e.g. AK-MS-101)...'
              }
              aria-label="Manuscript Reference Code"
              className="flex-1 px-3.5 py-2 rounded-xl border border-[#E6DFCE] text-[14px] font-mono bg-[#FFFDF7]"
            />
            <button
              type="button"
              onClick={() => handleTrackManuscript()}
              className="px-5 py-2 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[13.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {lang === 'mr' ? 'स्थिती तपासा' : 'Check Status'}
            </button>
          </div>

          {trackedManuscript && (
            <div className="pt-3 border-t border-[#E6DFCE] space-y-3 bg-[#FFFDF7] p-4 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[12px] font-bold text-[#243B8A]">
                  {trackedManuscript.referenceCode} · {trackedManuscript.category}
                </span>
                <span className="font-mono text-[12px] font-semibold text-[#174D3A]">
                  {lang === 'mr'
                    ? trackedManuscript.statusLabelMr
                    : trackedManuscript.statusLabelEn}
                </span>
              </div>
              <p className="font-serif text-[16px] font-bold text-[#252832]">
                {trackedManuscript.title} — <span className="font-normal text-[#5A5F72]">{trackedManuscript.author}</span>
              </p>
              <div className="grid grid-cols-6 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full ${
                      step <= trackedManuscript.stageIndex
                        ? 'bg-[#174D3A]'
                        : 'bg-[#E6DFCE]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[13px] text-[#5A5F72]">
                {lang === 'mr' ? trackedManuscript.noteMr : trackedManuscript.noteEn}
              </p>
            </div>
          )}
        </div>

        {submittedRecord ? (
          <div className="bg-white rounded-3xl border border-[#15803D]/40 p-8 space-y-4">
            <div className="flex items-center gap-3 text-[#15803D]">
              <CheckCircle2 className="w-6 h-6" />
              <h2 className="type-section-heading">{t.manuscript.successTitle}</h2>
            </div>
            <p className="text-[15px] text-[#5A5F72]">
              {lang === 'mr'
                ? `संदर्भ क्रमांक: ${submittedRecord.referenceCode}. आमचे संपादकीय मंडळ ८ ते १० आठवड्यांत आपल्याशी ईमेलद्वारे संपर्क साधेल.`
                : `Reference Code: ${submittedRecord.referenceCode}. Our editorial board will respond via email within 8–10 weeks.`}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 space-y-6"
          >
            {errors.form && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-50 border border-red-200 text-[#B42318] text-[14px] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ms-author-name" className="block ui-label mb-1.5">
                  {t.manuscript.authorNameLabel}{' '}
                  <span className="text-[#B42318]">*</span>
                </label>
                <input
                  ref={authorNameRef}
                  id="ms-author-name"
                  type="text"
                  value={authorName}
                  onChange={(e) => {
                    setAuthorName(e.target.value);
                    if (errors.authorName)
                      setErrors((p) => ({ ...p, authorName: '' }));
                  }}
                  aria-invalid={Boolean(errors.authorName)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                    errors.authorName ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                  }`}
                />
                {errors.authorName && (
                  <p
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.authorName}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ms-city" className="block ui-label mb-1.5">
                  {t.checkout.cityLabel}{' '}
                  <span className="text-[12px] font-normal text-[#5A5F72]">
                    ({t.checkout.optionalMarker})
                  </span>
                </label>
                <input
                  id="ms-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ms-email" className="block ui-label mb-1.5">
                  {t.checkout.emailLabel} <span className="text-[#B42318]">*</span>
                </label>
                <input
                  ref={emailRef}
                  id="ms-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                  }}
                  aria-invalid={Boolean(errors.email)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                    errors.email ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                  }`}
                />
                {errors.email && (
                  <p
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ms-phone" className="block ui-label mb-1.5">
                  {t.checkout.phoneLabel} <span className="text-[#B42318]">*</span>
                </label>
                <input
                  ref={phoneRef}
                  id="ms-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                  }}
                  placeholder={t.checkout.phoneHint}
                  aria-invalid={Boolean(errors.phone)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                    errors.phone ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                  }`}
                />
                {errors.phone && (
                  <p
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2">
                <label htmlFor="ms-title" className="block ui-label mb-1.5">
                  {t.manuscript.manuscriptTitleLabel}{' '}
                  <span className="text-[#B42318]">*</span>
                </label>
                <input
                  ref={titleRef}
                  id="ms-title"
                  type="text"
                  value={manuscriptTitle}
                  onChange={(e) => {
                    setManuscriptTitle(e.target.value);
                    if (errors.manuscriptTitle)
                      setErrors((p) => ({ ...p, manuscriptTitle: '' }));
                  }}
                  aria-invalid={Boolean(errors.manuscriptTitle)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                    errors.manuscriptTitle ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                  }`}
                />
                {errors.manuscriptTitle && (
                  <p
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.manuscriptTitle}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ms-category" className="block ui-label mb-1.5">
                  {t.manuscript.categoryLabel}
                </label>
                <EditorialSelectDropdown
                  id="ms-category"
                  testId="ms-category-select"
                  value={category}
                  onChange={(val) => setCategory(val)}
                  options={[
                    {
                      value: 'कादंबरी',
                      label: lang === 'mr' ? 'कादंबरी' : 'Novel (कादंबरी)',
                    },
                    {
                      value: 'कथासंग्रह',
                      label: lang === 'mr' ? 'कथासंग्रह' : 'Short Stories (कथासंग्रह)',
                    },
                    {
                      value: 'कवितासंग्रह',
                      label: lang === 'mr' ? 'कवितासंग्रह' : 'Poetry (कवितासंग्रह)',
                    },
                    {
                      value: 'समीक्षा व निबंध',
                      label:
                        lang === 'mr'
                          ? 'समीक्षा व निबंध'
                          : 'Criticism & Essays (समीक्षा व निबंध)',
                    },
                    {
                      value: 'अनुवाद',
                      label: lang === 'mr' ? 'अनुवाद' : 'Translation (अनुवाद)',
                    },
                  ]}
                />
              </div>
            </div>

            <div>
              <label htmlFor="ms-synopsis" className="block ui-label mb-1.5">
                {t.manuscript.synopsisLabel}{' '}
                <span className="text-[#B42318]">*</span>
              </label>
              <textarea
                ref={synopsisRef}
                id="ms-synopsis"
                rows={4}
                value={synopsis}
                onChange={(e) => {
                  setSynopsis(e.target.value);
                  if (errors.synopsis) setErrors((p) => ({ ...p, synopsis: '' }));
                }}
                aria-invalid={Boolean(errors.synopsis)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                  errors.synopsis ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                }`}
              />
              {errors.synopsis && (
                <p
                  role="alert"
                  className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.synopsis}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="ms-excerpt" className="block ui-label mb-1.5">
                {t.manuscript.sampleExcerptLabel}{' '}
                <span className="text-[#B42318]">*</span>
              </label>
              <textarea
                ref={excerptRef}
                id="ms-excerpt"
                rows={6}
                value={sampleExcerptText}
                onChange={(e) => {
                  setSampleExcerptText(e.target.value);
                  if (errors.sampleExcerptText)
                    setErrors((p) => ({ ...p, sampleExcerptText: '' }));
                }}
                aria-invalid={Boolean(errors.sampleExcerptText)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                  errors.sampleExcerptText ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                }`}
              />
              {errors.sampleExcerptText && (
                <p
                  role="alert"
                  className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.sampleExcerptText}</span>
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] flex items-center justify-between">
              <div className="text-[14px]">
                <p className="font-semibold text-[#252832]">
                  {lang === 'mr'
                    ? 'हस्तलिखित फाईल जोडा (PDF / DOCX, कमाल १५ MB — ऐच्छिक)'
                    : 'Attach Manuscript File (PDF / DOCX, max 15 MB — Optional)'}
                </p>
                {fileMeta && (
                  <p className="text-[13px] text-[#15803D] mt-0.5">
                    {fileMeta.fileName} ({Math.round(fileMeta.fileSizeBytes / 1024)} KB)
                  </p>
                )}
              </div>
              <label className="px-4 py-2 rounded-xl bg-white border border-[#E6DFCE] text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5 hover:bg-[#FFD966]/35 transition-colors">
                <Upload className="w-4 h-4 text-[#243B8A]" />
                <span>{lang === 'mr' ? 'फाईल निवडा' : 'Choose File'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFileMeta({
                        fileName: f.name,
                        fileType: f.type || 'application/pdf',
                        fileSizeBytes: f.size,
                      });
                    }
                  }}
                />
              </label>
            </div>

            <div className="space-y-2 text-[14px]">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={originalWorkConfirmed}
                  onChange={(e) => setOriginalWorkConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-[#243B8A]"
                />
                <span>
                  {lang === 'mr'
                    ? 'हे लेखन माझे स्वतःचे व मूळ असून कोणाच्याही कॉपीराइटचा भंग करत नाही.'
                    : 'I confirm this manuscript is my original work and does not infringe copyright.'}
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyConsentConfirmed}
                  onChange={(e) => setPrivacyConsentConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-[#243B8A]"
                />
                <span>
                  {lang === 'mr'
                    ? 'संपादकीय मूल्यांकनासाठी अकथ प्रकाशनच्या गोपनीयता धोरणास माझी संमती आहे.'
                    : 'I consent to Akath Prakashan’s editorial review and privacy policy.'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold transition-colors"
            >
              {t.manuscript.submitBtn}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================================
// SHARED EDITORIAL ACCESSIBLE DROPDOWN COMPONENT
// ============================================================================

export interface EditorialDropdownOption {
  value: string;
  label: string;
}

interface EditorialSelectDropdownProps {
  id: string;
  testId?: string;
  value: string;
  options: EditorialDropdownOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export const EditorialSelectDropdown: React.FC<EditorialSelectDropdownProps> = ({
  id,
  testId,
  value,
  options,
  onChange,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === value)
    )
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) {
      setHighlightedIndex(idx);
    }
  }, [value, options]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && options[highlightedIndex]) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      } else {
        setIsOpen((prev) => !prev);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      className={`relative w-full min-w-0 ${isOpen ? 'z-50' : 'z-10'}`}
    >
      {/* Synchronized native select for form semantics & accessibility */}
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(false);
        }}
        className="sr-only"
        tabIndex={-1}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        data-testid={testId ? `${testId}-trigger` : `${id}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-listbox`}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-left text-[15px] bg-white transition-colors flex items-center justify-between gap-2 cursor-pointer ${
          isOpen
            ? 'border-[#243B8A] ring-2 ring-[#243B8A]/10'
            : 'border-[#E6DFCE] hover:border-[#243B8A]/45'
        }`}
      >
        <span className="text-[#252832] truncate block">
          {selectedOption?.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#5A5F72] shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#243B8A]' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={id}
          data-testid={testId ? `${testId}-menu` : `${id}-menu`}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[70] bg-white border border-[#E6DFCE] rounded-xl shadow-[0_16px_36px_-8px_rgba(36,59,138,0.22)] py-1 max-h-60 overflow-y-auto overscroll-contain"
        >
          {options.map((opt, index) => {
            const isSelected = opt.value === value;
            const isHighlighted = index === highlightedIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                data-testid={`${id}-option-${opt.value}`}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`px-3.5 py-2.5 text-[14.5px] cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#243B8A]/[0.07] font-semibold text-[#243B8A]'
                    : isHighlighted
                    ? 'bg-[#FFFDF7] text-[#252832]'
                    : 'text-[#252832] hover:bg-[#FFFDF7]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check
                    className="w-4 h-4 text-[#243B8A] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// ============================================================================
// 5. CONTACT VIEW (/contact) — MINIMAL STANDARD UI (ADDRESS, CHANNELS & FORM)
// ============================================================================

type CorrespondentRole =
  | 'Reader'
  | 'Author'
  | 'Bookstore_Institution'
  | 'Contributor';

interface ContactViewProps {
  onSubmitContact: (
    payload: Record<string, unknown>
  ) => Promise<{
    ok: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string>;
    inquiry?: {
      id: string;
      name: string;
      role: CorrespondentRole;
      email: string;
      phone?: string;
      subject: string;
      message: string;
      preferWhatsAppFollowup?: boolean;
      createdAt: string;
    };
  }>;
  onNavigate?: (path: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  onSubmitContact,
}) => {
  const { lang, t } = useLanguage();

  const [name, setName] = useState('');
  const [role, setRole] = useState<CorrespondentRole>('Reader');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const roleOptions: EditorialDropdownOption[] = [
    {
      value: 'Reader',
      label: lang === 'mr' ? 'वाचक' : 'Reader',
    },
    {
      value: 'Author',
      label: lang === 'mr' ? 'लेखक' : 'Author',
    },
    {
      value: 'Bookstore_Institution',
      label:
        lang === 'mr'
          ? 'ग्रंथालय / पुस्तक विक्रेता'
          : 'Bookstore / Library',
    },
    {
      value: 'Contributor',
      label: lang === 'mr' ? 'समीक्षक / पत्रकार' : 'Reviewer / Media',
    },
  ];

  const editorialEmail = 'akathpublication@gmail.com';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    const nextErrors: Record<string, string> = {};

    if (name.trim().length < 2) {
      nextErrors.name =
        lang === 'mr' ? 'कृपया तुमचे नाव लिहा.' : 'Please enter your name.';
    }

    const emailCheck = validateEmail(email, lang);
    if (!emailCheck.isValid) {
      nextErrors.email = emailCheck.error!;
    }

    if (phone.trim()) {
      const phoneCheck = validateIndianPhone(phone, lang);
      if (!phoneCheck.isValid) {
        nextErrors.phone = phoneCheck.error!;
      }
    }

    if (message.trim().length < 10) {
      nextErrors.message =
        lang === 'mr'
          ? 'कृपया तुमचा संदेश सविस्तर लिहा (किमान १० अक्षरे).'
          : 'Please write a message of at least 10 characters.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.phone) phoneRef.current?.focus();
      else if (nextErrors.message) messageRef.current?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await onSubmitContact({
        lang,
        name: name.trim(),
        role,
        email: emailCheck.normalizedValue,
        phone: phone.trim()
          ? validateIndianPhone(phone, lang).normalizedValue
          : undefined,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.ok) {
        setSuccessMsg(res.message || t.contact.successMessage);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else if (res.fieldErrors) {
        setErrors(res.fieldErrors);
      } else if (res.error) {
        setErrors({ form: res.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-testid="contact-editorial-view"
      className="bg-[#FFFDF7] text-[#252832] min-h-screen py-12 lg:py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-[1060px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Minimal Page Header */}
        <div className="mb-10 space-y-2 max-w-[64ch]">
          <h1 className="type-page-heading text-[#252832]">{t.contact.title}</h1>
          <p className="prose-marathi text-[#5A5F72]">{t.contact.subtitle}</p>
        </div>

        {/* Standard 2-Column Layout: Left = Address & Channels | Right = Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN: Address & Channels */}
          <aside
            data-testid="contact-info-sidebar"
            className="lg:col-span-4 space-y-6 min-w-0"
          >
            {/* 1. Address Card */}
            <div
              data-testid="contact-address-block"
              className="bg-white rounded-2xl border border-[#E6DFCE] p-6 space-y-3"
            >
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#243B8A]">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{lang === 'mr' ? 'पत्ता' : 'Address'}</span>
              </div>

              <div className="space-y-1 text-[15px] text-[#252832]">
                <p className="font-semibold">
                  {lang === 'mr'
                    ? PUBLISHER_IDENTITY.nameMarathi
                    : PUBLISHER_IDENTITY.nameEnglish}
                </p>
                <p className="text-[#5A5F72] leading-relaxed">
                  {lang === 'mr'
                    ? 'नांदेड, महाराष्ट्र'
                    : 'Nanded, Maharashtra'}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E6DFCE] flex items-center gap-2 text-[13px] text-[#5A5F72]">
                <Clock className="w-3.5 h-3.5 text-[#243B8A] shrink-0" />
                <span>
                  {lang === 'mr'
                    ? 'सोम–शनि · सकाळी १०:३० ते ६:३०'
                    : 'Mon–Sat · 10:30 AM – 6:30 PM'}
                </span>
              </div>
            </div>

            {/* 2. Channels Card */}
            <div
              data-testid="contact-channels-block"
              className="bg-white rounded-2xl border border-[#E6DFCE] p-6 space-y-4"
            >
              <p className="text-[13px] font-semibold text-[#243B8A]">
                {lang === 'mr' ? 'संपर्क माध्यम' : 'Channels'}
              </p>

              <div className="space-y-3.5 text-[14.5px]">
                <a
                  href={`mailto:${editorialEmail}`}
                  className="flex items-start gap-3 text-[#252832] hover:text-[#243B8A] transition-colors min-w-0"
                >
                  <Mail className="w-4 h-4 text-[#243B8A] mt-1 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#5A5F72]">
                      {lang === 'mr' ? 'ईमेल' : 'Email'}
                    </p>
                    <p className="font-medium break-all">{editorialEmail}</p>
                  </div>
                </a>

                <a
                  href={`tel:${PUBLISHER_IDENTITY.phoneDisplay.replace(/\s+/g, '')}`}
                  className="flex items-start gap-3 text-[#252832] hover:text-[#243B8A] transition-colors min-w-0"
                >
                  <Phone className="w-4 h-4 text-[#243B8A] mt-1 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#5A5F72]">
                      {lang === 'mr' ? 'दूरध्वनी' : 'Phone'}
                    </p>
                    <p className="font-medium">{PUBLISHER_IDENTITY.phoneDisplay}</p>
                  </div>
                </a>

                <a
                  href={PUBLISHER_IDENTITY.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-[#252832] hover:text-[#15803D] transition-colors min-w-0"
                >
                  <MessageSquare className="w-4 h-4 text-[#15803D] mt-1 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] text-[#5A5F72]">
                      {lang === 'mr' ? 'व्हॉट्सॲप' : 'WhatsApp'}
                    </p>
                    <p className="font-medium text-[#15803D]">
                      {lang === 'mr' ? 'थेट संदेश पाठवा ↗' : 'Send a message ↗'}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Standard Minimal Contact Form */}
          <div className="lg:col-span-8 min-w-0">
            <form
              onSubmit={handleSubmit}
              noValidate
              data-testid="contact-form-folio"
              className="bg-white rounded-2xl border border-[#E6DFCE] p-6 sm:p-8 space-y-5"
            >
              {successMsg && (
                <div
                  role="status"
                  data-testid="contact-receipt-card"
                  className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px] flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errors.form && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-red-50 border border-red-200 text-[#B42318] text-[14px] flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="min-w-0">
                  <label htmlFor="contact-name" className="block ui-label mb-1.5">
                    {t.contact.nameLabel} <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                    }}
                    aria-invalid={Boolean(errors.name)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white transition-colors focus:outline-none focus:border-[#243B8A] ${
                      errors.name ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                    }`}
                  />
                  {errors.name && (
                    <p
                      role="alert"
                      className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="contact-role" className="block ui-label mb-1.5">
                    {t.contact.roleLabel}
                  </label>
                  <EditorialSelectDropdown
                    id="contact-role"
                    testId="contact-role-select"
                    ariaLabel={t.contact.roleLabel}
                    value={role}
                    onChange={(nextVal) => setRole(nextVal as CorrespondentRole)}
                    options={roleOptions}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="min-w-0">
                  <label htmlFor="contact-email" className="block ui-label mb-1.5">
                    {t.checkout.emailLabel} <span className="text-[#B42318]">*</span>
                  </label>
                  <input
                    ref={emailRef}
                    id="contact-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                    }}
                    aria-invalid={Boolean(errors.email)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white transition-colors focus:outline-none focus:border-[#243B8A] ${
                      errors.email ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                    }`}
                  />
                  {errors.email && (
                    <p
                      role="alert"
                      className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="contact-phone" className="block ui-label mb-1.5">
                    {t.checkout.phoneLabel}{' '}
                    <span className="text-[12px] font-normal text-[#5A5F72]">
                      ({t.checkout.optionalMarker})
                    </span>
                  </label>
                  <input
                    ref={phoneRef}
                    id="contact-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                    }}
                    placeholder={t.checkout.phoneHint}
                    aria-invalid={Boolean(errors.phone)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white transition-colors focus:outline-none focus:border-[#243B8A] ${
                      errors.phone ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                    }`}
                  />
                  {errors.phone && (
                    <p
                      role="alert"
                      className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <label htmlFor="contact-subject" className="block ui-label mb-1.5">
                  {t.contact.subjectLabel}{' '}
                  <span className="text-[12px] font-normal text-[#5A5F72]">
                    ({t.checkout.optionalMarker})
                  </span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-white transition-colors focus:outline-none focus:border-[#243B8A]"
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="contact-message" className="block ui-label mb-1.5">
                  {t.contact.messageLabel} <span className="text-[#B42318]">*</span>
                </label>
                <textarea
                  ref={messageRef}
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((p) => ({ ...p, message: '' }));
                  }}
                  aria-invalid={Boolean(errors.message)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white transition-colors focus:outline-none focus:border-[#243B8A] ${
                    errors.message ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                  }`}
                />
                {errors.message && (
                  <p
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-testid="contact-submit-btn"
                className="px-6 py-3 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] disabled:opacity-60 text-[#FFFDF7] text-[15px] font-semibold transition-colors"
              >
                {t.contact.submitBtn}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

