import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  AuthorRecord,
  BookRecord,
  EditorialArticle,
  ManuscriptSubmission,
} from '../types/publishing';
import { BookCard } from '../components/BookCard';
import { AnimatedTortoiseEmblem } from '../components/SarvamIllustrations';
import { PUBLISHER_IDENTITY } from '../data/seedData';
import { useLanguage } from '../i18n/translations';
import { validateEmail, validateIndianPhone } from '../utils/validation';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Upload,
  ChevronDown,
  Check,
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
  const [activeChapterId, setActiveChapterId] = useState<string>('about-manifesto-top');

  useAboutParagraphScrollReveal(aboutArticleRef, lang);

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
  ];

  return (
    <div className="bg-[#FFFDF7] text-[#1C1917] min-h-screen w-full max-w-[100vw] overflow-x-hidden selection:bg-[#243B8A]/15 selection:text-[#1C1917]">
      {/* ===================================================================
          0. ARCHIVAL DATELINE & STICKY CHAPTER NAVIGATION RIBBON
          =================================================================== */}
      <div
        data-testid="about-archival-dateline"
        className="border-b border-[#DCD4C0] bg-[#FAF6EC]/95 backdrop-blur-sm sticky top-0 z-20 w-full"
      >
        <div className="max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-10 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Interactive Exhibition Chapter Rail */}
          <nav
            aria-label="About Monograph Chapters"
            className="akath-swipe-rail flex items-center gap-3.5 sm:gap-6 overflow-x-auto no-scrollbar min-w-0 flex-1"
          >
            {chapterRailItems.map((item) => {
              const isCurrent = activeChapterId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToChapter(item.id)}
                  className={`group inline-flex items-baseline gap-1 sm:gap-1.5 text-[11.5px] sm:text-[12px] whitespace-nowrap shrink-0 transition-colors cursor-pointer py-0.5 ${
                    isCurrent
                      ? 'text-[#243B8A] font-semibold'
                      : 'text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  <span className="font-mono text-[10px] sm:text-[10.5px] text-[#78716C] group-hover:text-[#243B8A]">
                    {item.index}.
                  </span>
                  <span className="font-editorial-prose not-italic">
                    {lang === 'mr' ? item.labelMr : item.labelEn}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Compact Archival Clock & Imprint Location */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-[#57534E] tabular-nums shrink-0">
            <span className="hidden md:inline uppercase tracking-[0.16em] text-[#1C1917] font-semibold">
              Nanded, Maharashtra
            </span>
            <span aria-hidden="true" className="hidden md:inline">·</span>
            <span data-testid="about-live-date">{formattedDate}</span>
            <span aria-hidden="true" className="hidden xs:inline sm:inline">·</span>
            <span data-testid="about-live-time" className="hidden sm:inline">{formattedTime} IST</span>
            <span aria-hidden="true" className="hidden lg:inline">·</span>
            <span className="hidden lg:inline text-[#174D3A] font-medium">
              {literaryWatchLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          1. MUSEUM-GRADE EDITORIAL MONOGRAPH & BROADSHEET CANVAS
          =================================================================== */}
      <article
        ref={aboutArticleRef}
        data-testid="about-editorial-essay"
        aria-label="About Akath Prakashan"
        className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-14 lg:py-20 space-y-12 sm:space-y-20 min-w-0"
      >
        {/* =================================================================
            SECTION 1: CENTERED UPRIGHT EDITORIAL MANIFESTO
            ================================================================= */}
        <div
          id="about-manifesto-top"
          className="scroll-mt-28 space-y-6 sm:space-y-10 min-w-0"
        >
          {/* Centered Upright Editorial Header */}
          <div className="border-b border-[#DCD4C0] pb-6 sm:pb-8 lg:pb-10 space-y-3 sm:space-y-4 max-w-4xl mx-auto text-center">
            <p
              data-about-io-para="lead-eyebrow"
              style={{ '--io-stagger-index': 0 } as React.CSSProperties}
              className="akath-about-io-para text-[10.5px] sm:text-[11.5px] font-mono uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#243B8A] font-bold"
            >
              About Akath Prakashan · संपादकीय भूमिका · Nanded Imprint
            </p>

            <h1
              data-testid="about-headline-breathe"
              className="akath-about-headline-breathe font-editorial-display not-italic text-[26px] sm:text-[40px] lg:text-[50px] font-extrabold text-[#1C1917] leading-[1.18] tracking-tight"
            >
              काही पुस्तकं वाचून संपतात. काही आपल्यासोबत राहतात.
            </h1>

            <p className="akath-about-lead-breathe font-editorial-display not-italic font-bold text-[18px] sm:text-[24px] lg:text-[26px] text-[#243B8A] leading-[1.35]">
              Some books end at the last page. Others stay with us.
            </p>
          </div>

          {/* Centered Single-Column 65ch Reading Canvas */}
          <div
            className="max-w-[65ch] mx-auto text-center px-1 sm:px-0"
            data-testid="about-prose-measure"
          >
            <motion.section
              data-testid="about-hero-manifesto"
              data-about-io-block="lead-manifesto"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              className="akath-about-io-block"
            >
              <motion.div variants={aboutItemSequentialVariants}>
                <div
                  data-testid="about-prose-breathe-block"
                  style={{ '--breathe-phase': '0.4s' } as React.CSSProperties}
                  className="akath-about-prose-breathe space-y-4 sm:space-y-5 font-editorial-prose not-italic text-[15.5px] sm:text-[18px] text-[#1C1917] leading-[1.82]"
                >
                  <p
                    data-about-io-para="lead-p1"
                    style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                    className="akath-about-io-para font-semibold text-[#1C1917] text-[16.5px] sm:text-[19.5px] leading-[1.7]"
                  >
                    Akath Prakashan grew out of a simple feeling: there are books worth bringing into the world, and there should be people willing to take the time to do it properly.
                  </p>

                  <p
                    data-about-io-para="lead-p2"
                    style={{ '--io-stagger-index': 2 } as React.CSSProperties}
                    className="akath-about-io-para text-[#292524]"
                  >
                    A manuscript is a strange, wonderful thing. Sometimes it arrives as a finished story. Sometimes it is a collection of scattered thoughts, a voice still finding its shape, or an experience that has waited years to be put into words. Before it becomes a book, it needs someone willing to read it carefully, ask the right questions, and understand what the writer is trying to say.
                  </p>

                  <p
                    data-about-io-para="lead-callout"
                    style={{ '--io-stagger-index': 3 } as React.CSSProperties}
                    className="akath-about-io-para font-editorial-display not-italic font-bold text-[18px] sm:text-[22px] text-[#243B8A] leading-[1.45] py-1"
                  >
                    That is the kind of work we want to do. We don&apos;t think literature always needs to be loud to matter.
                  </p>

                  <p
                    data-about-io-para="lead-p3"
                    style={{ '--io-stagger-index': 4 } as React.CSSProperties}
                    className="akath-about-io-para text-[#292524]"
                  >
                    Based in Nanded, Akath Prakashan is an independent publishing house devoted to Marathi literature and writing across languages. We work with fiction, poetry, essays, criticism, and translations — not because every category needs to be represented, but because good writing can come from anywhere and speak to anyone.
                  </p>

                  <p
                    data-about-io-para="lead-p4"
                    style={{ '--io-stagger-index': 5 } as React.CSSProperties}
                    className="akath-about-io-para text-[#292524]"
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
            (Fully Responsive on Mobile 360px, Tablet 768px & Desktop)
            ================================================================= */}
        <motion.section
          id="about-why-tortoise"
          data-testid="about-why-tortoise-feature"
          data-about-io-block="folio-04"
          variants={aboutSectionSequentialVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.04 }}
          className="akath-seq-step akath-about-io-block scroll-mt-28 max-w-5xl mx-auto w-full min-w-0 rounded-xl bg-[#FAF6EC] text-[#1C1917] border border-[#DCD4C0] p-4 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 overflow-hidden"
        >
          {/* Centered Header */}
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <p className="font-mono text-[10.5px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#243B8A] font-bold">
              Chapter II · Imprint Symbol &amp; Philosophy
            </p>
            <h2 className="akath-about-headline-breathe font-editorial-display not-italic text-[26px] sm:text-[38px] lg:text-[44px] font-extrabold text-[#1C1917] leading-[1.15] tracking-tight">
              Why the tortoise?
            </h2>
          </div>

          {/* Central Animated Tortoise Literary Stage (Single Logo Medallion + Responsive Walking Track) */}
          <div className="rounded-xl bg-[#FFFDF7] border border-[#DCD4C0] p-4 sm:p-7 space-y-5 min-w-0">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              {/* Single Orbital Tortoise Medallion Seal */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#FAF6EC] border border-[#C89D54] flex items-center justify-center shrink-0 shadow-2xs">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-2 rounded-full border border-dashed border-[#243B8A]/30"
                />
                <AnimatedTortoiseEmblem
                  className="w-18 h-18 sm:w-24 sm:h-24"
                  variant="indigo"
                  animate={true}
                  hideAndSeekOnHover={true}
                />
              </div>

              <div className="space-y-1 px-2">
                <p className="font-editorial-display not-italic text-[17px] sm:text-[20px] font-bold text-[#243B8A]">
                  The Patient Tortoise · संथ आणि ठाम पावले
                </p>
                <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.16em] text-[#57534E]">
                  One Manuscript · One Book · One Reader at a Time
                </p>
              </div>
            </div>

            {/* Live Animated Walking Tortoise Horizon Track (Responsive 2x2 Grid on Mobile, 4 Cols on sm+) */}
            <div className="rounded-lg bg-[#FAF6EC] border border-[#E5DEC9] p-3 sm:px-5 sm:py-4 space-y-3 min-w-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-[9.5px] sm:text-[10.5px] font-mono font-bold uppercase tracking-[0.08em] sm:tracking-[0.14em] text-[#243B8A]">
                <span className="px-2 py-1 rounded bg-[#FFFDF7] border border-[#E5DEC9] text-center truncate">
                  01 · MANUSCRIPT
                </span>
                <span className="px-2 py-1 rounded bg-[#FFFDF7] border border-[#E5DEC9] text-center truncate">
                  02 · EDITING
                </span>
                <span className="px-2 py-1 rounded bg-[#FFFDF7] border border-[#E5DEC9] text-center truncate">
                  03 · PRESSWORK
                </span>
                <span className="px-2 py-1 rounded bg-[#FFFDF7] border border-[#E5DEC9] text-center truncate">
                  04 · READER
                </span>
              </div>
              <div className="akath-patient-traverse-track relative h-10 w-full overflow-hidden flex items-center">
                <div className="absolute inset-x-0 bottom-1.5 border-b border-dashed border-[#C89D54]" />
                <div className="akath-patient-tortoise-runner relative z-10 inline-flex items-center">
                  <svg
                    viewBox="0 0 68 38"
                    className="w-14 h-8 overflow-visible"
                    aria-label="Animated tortoise carrying a manuscript"
                  >
                    <g className="akath-walking-tortoise-body">
                      {/* Open Book Carried on Shell */}
                      <path
                        d="M19 11 L30 14 L41 11 L41 16 L30 19 L19 16 Z"
                        fill="#FFFDF7"
                        stroke="#243B8A"
                        strokeWidth="1.3"
                      />
                      {/* Tortoise Dome Shell */}
                      <path
                        d="M14 27 C14 14, 45 14, 45 27 Z"
                        fill="#243B8A"
                        stroke="#1C1917"
                        strokeWidth="1.4"
                      />
                      <path
                        d="M21 26 C22 18, 37 18, 38 26"
                        fill="none"
                        stroke="#FFD966"
                        strokeWidth="1.4"
                      />
                      <line
                        x1="30"
                        y1="16"
                        x2="30"
                        y2="26"
                        stroke="#FFD966"
                        strokeWidth="1.4"
                      />
                      {/* Head */}
                      <g className="akath-walking-tortoise-head">
                        <path
                          d="M44 24 C49 24, 54 20, 56 22 C58 24, 55 27, 45 27 Z"
                          fill="#C89D54"
                          stroke="#1C1917"
                          strokeWidth="1.3"
                        />
                        <circle cx="53" cy="22.5" r="1.2" fill="#1C1917" />
                      </g>
                      {/* Legs */}
                      <rect
                        x="18"
                        y="27"
                        width="4.5"
                        height="5.5"
                        rx="1.5"
                        fill="#C89D54"
                        stroke="#1C1917"
                        strokeWidth="1.2"
                        className="akath-walking-tortoise-leg-a"
                      />
                      <rect
                        x="36"
                        y="27"
                        width="4.5"
                        height="5.5"
                        rx="1.5"
                        fill="#C89D54"
                        stroke="#1C1917"
                        strokeWidth="1.2"
                        className="akath-walking-tortoise-leg-b"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Centered 4-Paragraph Tortoise Philosophy */}
          <div
            data-testid="about-prose-breathe-block"
            className="akath-about-prose-breathe space-y-3.5 sm:space-y-4 font-editorial-prose not-italic text-[15.5px] sm:text-[17.5px] text-[#292524] leading-[1.78] max-w-[65ch] mx-auto text-center px-1 sm:px-0"
          >
            <p
              data-about-io-para="folio-04-p1"
              style={{ '--io-stagger-index': 0 } as React.CSSProperties}
              className="akath-about-io-para font-semibold text-[#1C1917]"
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
              className="akath-about-io-para font-bold text-[#243B8A] pt-1"
            >
              Akath Prakashan is our attempt to do just that — one manuscript, one book, one reader at a time.
            </p>
          </div>
        </motion.section>

        {/* =================================================================
            SECTION 3: REDESIGNED FOUNDER & IMPRINT STEWARDSHIP SHOWCASE
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
          className="akath-seq-step akath-about-io-block scroll-mt-28 max-w-5xl mx-auto w-full min-w-0 rounded-xl bg-white border border-[#DCD4C0] overflow-hidden shadow-[0_14px_36px_-22px_rgba(28,25,23,0.12)]"
        >
          {/* Top Editorial Accent Bar */}
          <div className="bg-[#243B8A] text-[#FFFDF7] px-5 sm:px-8 lg:px-10 py-3.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px] sm:text-[11px] font-mono">
            <span className="uppercase tracking-[0.16em] text-[#FFD966] font-bold">
              Chapter III · Founder &amp; Editorial Leadership
            </span>
            <span className="uppercase tracking-[0.14em] text-[#FFFDF7]/85">
              AKATH PRAKASHAN · NANDED
            </span>
          </div>

          <motion.div
            variants={aboutItemSequentialVariants}
            className="p-5 sm:p-8 lg:p-10 space-y-8 min-w-0"
          >
            <div
              style={{ '--breathe-phase': '4.3s' } as React.CSSProperties}
              className="akath-about-prose-breathe grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-stretch"
            >
              {/* Left 7 Cols: Founder Portrait Badge, Name & Publisher's Vision */}
              <div
                data-about-io-para="colophon-founder"
                style={{ '--io-stagger-index': 0 } as React.CSSProperties}
                className="akath-about-io-para lg:col-span-7 rounded-xl bg-[#FAF6EC] border border-[#DCD4C0] p-5 sm:p-7 flex flex-col justify-between space-y-5 min-w-0"
              >
                <div className="space-y-4">
                  {/* Founder Identity Header with Monogram Crest */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#243B8A] text-[#FFD966] border-2 border-[#C89D54] flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="font-serif text-[20px] sm:text-[22px] font-bold leading-none">
                        अकथ
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <span className="inline-block text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.16em] text-[#243B8A] font-bold">
                        Founder &amp; Publisher · संस्थापक आणि प्रकाशक
                      </span>
                      <h2
                        data-testid="about-founder-name"
                        className="akath-about-headline-breathe font-editorial-display not-italic text-[24px] sm:text-[32px] lg:text-[36px] font-extrabold text-[#1C1917] leading-[1.15] tracking-tight"
                      >
                        Pooja Vasantrao Dhawale
                      </h2>
                      <p className="font-editorial-display not-italic text-[19px] sm:text-[22px] text-[#174D3A] font-bold">
                        पूजा वसंतराव ढवळे
                      </p>
                    </div>
                  </div>

                  {/* Publisher's Editorial Note Pull-Quote */}
                  <blockquote className="rounded-lg bg-[#FFFDF7] border-l-4 border-[#243B8A] p-3.5 sm:p-4 font-editorial-prose not-italic text-[14.5px] sm:text-[15.5px] text-[#1C1917] font-medium leading-[1.7]">
                    “Every manuscript deserves patient reading, thoughtful editorial dialogue, and enduring print craftsmanship before it reaches a reader’s hands.”
                  </blockquote>

                  <p className="text-[15px] sm:text-[16px] font-editorial-prose not-italic text-[#292524] leading-[1.78]">
                    Guiding editorial direction, manuscript selection, and imprint stewardship at Akath Prakashan with a commitment to meaningful Marathi literature and lasting author partnerships.
                  </p>
                </div>

                <div className="pt-3.5 border-t border-[#DCD4C0] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#57534E]">
                  <span>EDITORIAL STEWARDSHIP</span>
                  <span className="text-[#243B8A] font-semibold">
                    NANDED, MAHARASHTRA
                  </span>
                </div>
              </div>

              {/* Right 5 Cols: Clean 4-Row Imprint Fact Sheet */}
              <div
                data-about-io-para="colophon-header"
                style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                className="akath-about-io-para lg:col-span-5 rounded-xl bg-[#FFFDF7] border border-[#DCD4C0] p-5 sm:p-7 flex flex-col justify-between min-w-0"
              >
                <div className="pb-3 border-b border-[#DCD4C0]">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[#243B8A] font-bold">
                    Imprint Directory · प्रकाशन तपशील
                  </p>
                </div>

                <dl className="divide-y divide-[#E6DFCE] text-[14px] sm:text-[14.5px] my-auto">
                  <div className="py-3.5 flex flex-col gap-0.5">
                    <dt className="text-[10.5px] font-mono uppercase tracking-[0.15em] text-[#57534E] font-semibold">
                      Imprint Name
                    </dt>
                    <dd className="font-editorial-display not-italic text-[17px] font-bold text-[#1C1917]">
                      Akath Prakashan · अकथ प्रकाशन
                    </dd>
                  </div>

                  <div className="py-3.5 flex flex-col gap-0.5">
                    <dt className="text-[10.5px] font-mono uppercase tracking-[0.15em] text-[#57534E] font-semibold">
                      Headquarters
                    </dt>
                    <dd className="font-editorial-prose not-italic font-semibold text-[#1C1917]">
                      Nanded, Maharashtra · नांदेड (४३१६०२)
                    </dd>
                  </div>

                  <div className="py-3.5 flex flex-col gap-0.5">
                    <dt className="text-[10.5px] font-mono uppercase tracking-[0.15em] text-[#57534E] font-semibold">
                      Editorial Scope
                    </dt>
                    <dd className="font-editorial-prose not-italic font-medium text-[#1C1917]">
                      Fiction, Poetry, Essays, Travelogues &amp; Vachankatta
                    </dd>
                  </div>

                  <div className="pt-3.5 flex flex-col gap-0.5">
                    <dt className="text-[10.5px] font-mono uppercase tracking-[0.15em] text-[#57534E] font-semibold">
                      Editorial Correspondence
                    </dt>
                    <dd className="font-mono text-[12.5px] text-[#243B8A] font-medium break-all">
                      {PUBLISHER_IDENTITY.email} · {PUBLISHER_IDENTITY.phoneDisplay}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Bottom 3-Zone Curatorial Action Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-4 border-t border-[#E6DFCE]">
              <button
                type="button"
                onClick={() => onNavigate('/books')}
                className="group rounded-lg bg-[#FAF6EC] border border-[#DCD4C0] hover:border-[#243B8A] p-4 sm:p-5 text-left transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#243B8A] font-bold">
                    01 · Catalogue
                  </p>
                  <p className="mt-1 font-editorial-display not-italic text-[17px] sm:text-[18px] font-bold text-[#1C1917] group-hover:text-[#243B8A]">
                    {lang === 'mr' ? 'प्रकाशित पुस्तके पहा' : 'Explore Published Books'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#57534E] group-hover:text-[#243B8A] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/vachankatta')}
                className="group rounded-lg bg-[#FAF6EC] border border-[#DCD4C0] hover:border-[#243B8A] p-4 sm:p-5 text-left transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#174D3A] font-bold">
                    02 · Literary Journal
                  </p>
                  <p className="mt-1 font-editorial-display not-italic text-[17px] sm:text-[18px] font-bold text-[#1C1917] group-hover:text-[#174D3A]">
                    {lang === 'mr' ? 'वाचनकट्टा आणि साहित्य' : 'Read Vachankatta Journal'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#57534E] group-hover:text-[#174D3A] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/submit-manuscript')}
                className="group rounded-lg bg-[#FAF6EC] border border-[#DCD4C0] hover:border-[#243B8A] p-4 sm:p-5 text-left transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#243B8A] font-bold">
                    03 · For Authors
                  </p>
                  <p className="mt-1 font-editorial-display not-italic text-[17px] sm:text-[18px] font-bold text-[#1C1917] group-hover:text-[#243B8A]">
                    {lang === 'mr' ? 'प्रकाशनार्थ संहिता पाठवा' : 'Submit Your Manuscript'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#57534E] group-hover:text-[#243B8A] shrink-0" />
              </button>
            </div>
          </motion.div>
        </motion.section>
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
  const [discussionTopic, setDiscussionTopic] = useState<
    'Manuscript Submission' | 'Book Enquiry' | 'Collaboration' | 'General Enquiry'
  >('Book Enquiry');
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

  const topicToRoleMap: Record<
    'Manuscript Submission' | 'Book Enquiry' | 'Collaboration' | 'General Enquiry',
    CorrespondentRole
  > = {
    'Manuscript Submission': 'Author',
    'Book Enquiry': 'Reader',
    Collaboration: 'Bookstore_Institution',
    'General Enquiry': 'Contributor',
  };

  const discussionOptions: EditorialDropdownOption[] = [
    {
      value: 'Manuscript Submission',
      label: lang === 'mr' ? 'हस्तलिखित सादरीकरण' : 'Manuscript Submission',
    },
    {
      value: 'Book Enquiry',
      label: lang === 'mr' ? 'पुस्तकाविषयी चौकशी' : 'Book Enquiry',
    },
    {
      value: 'Collaboration',
      label: lang === 'mr' ? 'पुस्तक विक्री व सहकार्य' : 'Collaboration',
    },
    {
      value: 'General Enquiry',
      label: lang === 'mr' ? 'सर्वसाधारण संवाद' : 'General Enquiry',
    },
  ];

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
      const resolvedSubject = subject.trim() || discussionTopic;
      const res = await onSubmitContact({
        lang,
        name: name.trim(),
        role,
        email: emailCheck.normalizedValue,
        phone: phone.trim()
          ? validateIndianPhone(phone, lang).normalizedValue
          : undefined,
        subject: resolvedSubject,
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
      className="bg-[#F5EBDD] text-[#252832] min-h-screen py-10 sm:py-14 lg:py-16"
    >
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Editorial Room Headline (Static — Zero Animation) */}
        <header className="space-y-3">
          <p className="font-mono text-[11.5px] tracking-[0.16em] uppercase font-bold text-[#243B8A]">
            {lang === 'mr'
              ? 'अकथ प्रकाशन · संपादकीय कक्ष'
              : 'AKATH PRAKASHAN · THE EDITORIAL ROOM'}
          </p>
          <h1 className="font-serif text-[30px] sm:text-[38px] font-bold leading-[1.15] tracking-[-0.02em] text-[#252832]">
            {lang === 'mr'
              ? 'प्रत्येक पुस्तकाची सुरुवात एका संवादातून होते.'
              : 'Every book begins with a conversation.'}
          </h1>
          <p className="text-[15.5px] sm:text-[16.5px] leading-[1.65] text-[#4E4A42] max-w-[60ch]">
            {lang === 'mr'
              ? 'तुमच्याकडे हस्तलिखित आहे, एखादा प्रश्न आहे, कल्पना आहे किंवा एखाद्या पुस्तकाबद्दल बोलायचे आहे? आमचा संपादकीय कक्ष खुला आहे.'
              : 'Have a manuscript, a question, an idea or simply a book you would like to talk about? Our editorial room is open.'}
          </p>
        </header>

        {/* Editorial Room Correspondence Form (Static — Zero Animation) */}
        <form
          onSubmit={handleSubmit}
          noValidate
          data-testid="contact-form-folio"
          className="bg-[#FFFDF7] rounded-2xl border-2 border-[#302C25] p-6 sm:p-9 space-y-6 shadow-[6px_6px_0px_#302C25]"
        >
          <div className="pb-4 border-b-2 border-dashed border-[#D8CEB8] flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#243B8A] font-semibold">
                {lang === 'mr'
                  ? 'संपादकीय पत्रव्यवहार'
                  : 'EDITORIAL CORRESPONDENCE'}
              </p>
              <h2 className="mt-0.5 font-serif text-[22px] sm:text-[25px] font-bold text-[#252832]">
                {lang === 'mr'
                  ? 'संपादकांना पत्र लिहा'
                  : 'Write a Letter to Our Editors'}
              </h2>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#78845A]">
              {lang === 'mr' ? 'नांदेड कार्यालय' : 'NANDED STUDIO'}
            </span>
          </div>

          {successMsg && (
            <div
              role="status"
              data-testid="contact-receipt-card"
              className="p-4 rounded-xl bg-[#F5EBDD] border-2 border-[#354B37] text-[#252832] text-[14px] flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-[#354B37] shrink-0" />
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
                {lang === 'mr' ? 'तुमचे नाव' : 'Your Name'}{' '}
                <span className="text-[#B42318]">*</span>
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
                placeholder={
                  lang === 'mr' ? 'पूर्ण नाव लिहा' : 'Enter your full name'
                }
                aria-invalid={Boolean(errors.name)}
                className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-[15px] bg-[#FAF5E8] focus:bg-[#FFFDF7] focus:outline-none focus:border-[#243B8A] ${
                  errors.name ? 'border-[#B42318]' : 'border-[#D8CEB8]'
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
              <label htmlFor="contact-email" className="block ui-label mb-1.5">
                {lang === 'mr' ? 'तुमचा ईमेल' : 'Your Email'}{' '}
                <span className="text-[#B42318]">*</span>
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
                placeholder="you@example.com"
                aria-invalid={Boolean(errors.email)}
                className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-[15px] bg-[#FAF5E8] focus:bg-[#FFFDF7] focus:outline-none focus:border-[#243B8A] ${
                  errors.email ? 'border-[#B42318]' : 'border-[#D8CEB8]'
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="min-w-0">
              <label htmlFor="contact-role" className="block ui-label mb-1.5">
                {lang === 'mr'
                  ? 'तुम्हाला कोणत्या विषयावर चर्चा करायची आहे?'
                  : 'What would you like to discuss?'}
              </label>
              <EditorialSelectDropdown
                id="contact-role"
                testId="contact-role-select"
                ariaLabel={
                  lang === 'mr'
                    ? 'तुम्हाला कोणत्या विषयावर चर्चा करायची आहे?'
                    : 'What would you like to discuss?'
                }
                value={discussionTopic}
                onChange={(nextVal) => {
                  const topic = nextVal as
                    | 'Manuscript Submission'
                    | 'Book Enquiry'
                    | 'Collaboration'
                    | 'General Enquiry';
                  setDiscussionTopic(topic);
                  setRole(topicToRoleMap[topic] || 'Reader');
                }}
                options={discussionOptions}
              />
            </div>

            <div className="min-w-0">
              <label htmlFor="contact-phone" className="block ui-label mb-1.5">
                {lang === 'mr' ? 'मोबाईल क्रमांक' : 'Mobile Number'}{' '}
                <span className="text-[12px] font-normal text-[#5A5F72]">
                  ({lang === 'mr' ? 'ऐच्छिक' : 'Optional'})
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
                placeholder={
                  lang === 'mr' ? '१० अंकी मोबाईल नंबर' : '10-digit mobile number'
                }
                aria-invalid={Boolean(errors.phone)}
                className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-[15px] bg-[#FAF5E8] focus:bg-[#FFFDF7] focus:outline-none focus:border-[#243B8A] ${
                  errors.phone ? 'border-[#B42318]' : 'border-[#D8CEB8]'
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
              {lang === 'mr' ? 'विषय' : 'Subject'}{' '}
              <span className="text-[12px] font-normal text-[#5A5F72]">
                ({lang === 'mr' ? 'ऐच्छिक' : 'Optional'})
              </span>
            </label>
            <input
              id="contact-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={
                lang === 'mr'
                  ? 'उदा. हस्तलिखिताबाबत किंवा पुस्तकाच्या मागणीबाबत'
                  : 'e.g. Regarding a manuscript submission or book enquiry'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#D8CEB8] text-[15px] bg-[#FAF5E8] focus:bg-[#FFFDF7] focus:outline-none focus:border-[#243B8A]"
            />
          </div>

          <div className="min-w-0">
            <label htmlFor="contact-message" className="block ui-label mb-1.5">
              {lang === 'mr' ? 'तुमचा संदेश' : 'Your Message'}{' '}
              <span className="text-[#B42318]">*</span>
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
              placeholder={
                lang === 'mr'
                  ? 'तुमचा संदेश येथे लिहा...'
                  : 'Write your message to our editorial room...'
              }
              aria-invalid={Boolean(errors.message)}
              className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-[15px] bg-[#FAF5E8] focus:bg-[#FFFDF7] focus:outline-none focus:border-[#243B8A] ${
                errors.message ? 'border-[#B42318]' : 'border-[#D8CEB8]'
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

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <button
              type="submit"
              disabled={submitting}
              data-testid="contact-submit-btn"
              className="px-7 py-3.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] disabled:opacity-60 text-[#FFFDF7] text-[15px] font-semibold cursor-pointer shadow-[3px_3px_0px_#302C25]"
            >
              {submitting
                ? lang === 'mr'
                  ? 'पाठवत आहे...'
                  : 'Sending...'
                : lang === 'mr'
                  ? 'तुमचे पत्र पाठवा →'
                  : 'Send Your Letter →'}
            </button>

            <span className="font-mono text-[11.5px] text-[#5A5F72]">
              akathpublication@gmail.com · {PUBLISHER_IDENTITY.phoneDisplay}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};


