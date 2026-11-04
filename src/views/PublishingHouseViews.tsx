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

export const AboutAkathView: React.FC<AboutAkathViewProps> = () => {
  const { lang } = useLanguage();
  const aboutArticleRef = useRef<HTMLElement | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [activeFolioFilter, setActiveFolioFilter] = useState<
    'all' | 'language' | 'craft' | 'beginning' | 'tortoise'
  >('all');

  useAboutParagraphScrollReveal(aboutArticleRef, activeFolioFilter);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

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

  const folioFilterOptions: Array<{
    id: 'all' | 'language' | 'craft' | 'beginning' | 'tortoise';
    label: string;
  }> = [
    { id: 'all', label: lang === 'mr' ? 'सर्व' : 'All' },
    { id: 'language', label: '01 · Language' },
    { id: 'craft', label: '02 · Craft' },
    { id: 'beginning', label: '03 · Community' },
    { id: 'tortoise', label: '04 · Tortoise' },
  ];

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
      {/* ===================================================================
          0. MINIMAL ARCHIVAL DATELINE BAR
          =================================================================== */}
      <div
        data-testid="about-archival-dateline"
        className="border-b border-[#E6DFCE] bg-[#FFFDF7]"
      >
        <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#5A5F72]">
          <div className="flex items-center gap-2">
            <span className="uppercase tracking-[0.16em] text-[#252832] font-medium">
              Akath Prakashan
            </span>
            <span aria-hidden="true">·</span>
            <span>Nanded, Maharashtra</span>
          </div>

          <div className="flex items-center gap-2 tabular-nums">
            <span data-testid="about-live-date">{formattedDate}</span>
            <span aria-hidden="true">·</span>
            <span data-testid="about-live-time">{formattedTime} IST</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline font-editorial-prose text-[11.5px] text-[#5A5F72]">
              {literaryWatchLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          1. MINIMALIST EDITORIAL MONOGRAPH CONTAINER
          =================================================================== */}
      <article
        ref={aboutArticleRef}
        data-testid="about-editorial-essay"
        aria-label="About Akath Prakashan"
        className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-14 sm:space-y-16"
      >
        {/* =================================================================
            SECTION 1: LEAD EDITORIAL MANIFESTO (CLEAN 65ch READING COLUMN)
            ================================================================= */}
        <div
          data-testid="about-prose-measure"
          className="max-w-[65ch]"
        >
          <motion.section
            data-testid="about-hero-manifesto"
            data-about-io-block="lead-manifesto"
            variants={aboutSectionSequentialVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.04 }}
            className="akath-about-io-block space-y-6"
          >
            <motion.div
              variants={aboutItemSequentialVariants}
              className="space-y-3"
            >
              <p
                data-about-io-para="lead-eyebrow"
                style={{ '--io-stagger-index': 0 } as React.CSSProperties}
                className="akath-about-io-para text-[11px] font-mono uppercase tracking-[0.2em] text-[#243B8A] font-medium"
              >
                About Akath Prakashan · संपादकीय भूमिका
              </p>

              <h1
                data-testid="about-headline-breathe"
                className="akath-about-headline-breathe font-editorial-display text-[28px] sm:text-[36px] lg:text-[40px] font-bold text-[#252832] leading-[1.24]"
              >
                काही पुस्तकं वाचून संपतात. काही आपल्यासोबत राहतात.
              </h1>

              <p className="akath-about-lead-breathe font-editorial-display italic text-[19px] sm:text-[22px] text-[#5A5F72] leading-[1.45]">
                Some books end at the last page. Others stay with us.
              </p>
            </motion.div>

            <motion.div variants={aboutItemSequentialVariants}>
              <div
                data-testid="about-prose-breathe-block"
                style={{ '--breathe-phase': '0.4s' } as React.CSSProperties}
                className="akath-about-prose-breathe space-y-4 font-editorial-prose text-[16px] sm:text-[17px] text-[#252832] leading-[1.8]"
              >
                <p
                  data-about-io-para="lead-p1"
                  style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                  className="akath-about-io-para"
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

                <p
                  data-about-io-para="lead-callout"
                  style={{ '--io-stagger-index': 3 } as React.CSSProperties}
                  className="akath-about-io-para py-3 border-y border-[#E6DFCE] font-editorial-display italic text-[18px] sm:text-[20px] text-[#243B8A]"
                >
                  That is the kind of work we want to do. We don&apos;t think literature always needs to be loud to matter.
                </p>

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

        {/* =================================================================
            SECTION 2: CLEAN, BALANCED FOUNDER PROFILE & IMPRINT OVERVIEW
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
          className="akath-seq-step akath-about-io-block bg-white border border-[#E6DFCE] rounded-2xl p-6 sm:p-8 lg:p-10"
        >
          <motion.div variants={aboutItemSequentialVariants}>
            <div
              style={{ '--breathe-phase': '4.3s' } as React.CSSProperties}
              className="akath-about-prose-breathe grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center"
            >
              {/* Left 6 Cols: Founder Identity */}
              <div
                data-about-io-para="colophon-founder"
                style={{ '--io-stagger-index': 0 } as React.CSSProperties}
                className="akath-about-io-para md:col-span-6 space-y-2"
              >
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#243B8A] font-medium">
                  Founder &amp; Publisher · संस्थापक आणि प्रकाशक
                </p>
                <h2
                  data-testid="about-founder-name"
                  className="akath-about-headline-breathe font-editorial-display text-[26px] sm:text-[30px] font-bold text-[#252832] leading-tight"
                >
                  Pooja Vasantrao Dhawale
                </h2>
                <p className="font-serif text-[17px] text-[#174D3A] font-medium">
                  पूजा वसंतराव ढवळे
                </p>
                <p className="text-[14.5px] font-editorial-prose text-[#5A5F72] leading-relaxed pt-1">
                  Editorial Direction, Manuscript Selection &amp; Imprint Stewardship
                </p>
              </div>

              {/* Right 6 Cols: Balanced Minimal Imprint Details */}
              <dl
                data-about-io-para="colophon-header"
                style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                className="akath-about-io-para md:col-span-6 md:border-l md:border-[#E6DFCE] md:pl-10 space-y-3.5 text-[14px]"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3 border-b border-[#E6DFCE]">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#5A5F72]">
                    Imprint
                  </dt>
                  <dd className="font-editorial-prose font-medium text-[#252832]">
                    Akath Prakashan · अकथ प्रकाशन
                  </dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-3 border-b border-[#E6DFCE]">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#5A5F72]">
                    Location
                  </dt>
                  <dd className="font-editorial-prose font-medium text-[#252832]">
                    Nanded, Maharashtra · नांदेड
                  </dd>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <dt className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#5A5F72]">
                    Editorial Scope
                  </dt>
                  <dd className="font-editorial-prose font-medium text-[#252832]">
                    Fiction, Poetry, Essays &amp; Vachankatta
                  </dd>
                </div>
              </dl>
            </div>
          </motion.div>
        </motion.section>

        {/* =================================================================
            SECTION 3: REFINED 2x2 PROSE BLOCKS (CLEAR HEADINGS, CONSISTENT PADDING)
            ================================================================= */}
        <div className="space-y-6">
          <div
            data-about-io-block="folio-header"
            className="akath-about-io-block flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6DFCE] pb-4"
          >
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#5A5F72]">
                Editorial Philosophy · चार संपादकीय सूत्रे
              </p>
              <h2 className="font-editorial-display text-[24px] sm:text-[28px] font-bold text-[#252832]">
                Our Approach to Publishing
              </h2>
            </div>

            {/* Minimal Chapter Filter */}
            <div
              data-testid="about-folio-filter-bar"
              role="tablist"
              aria-label="Filter About Chapters"
              className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar max-w-full"
            >
              {folioFilterOptions.map((tab) => {
                const isActive = activeFolioFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveFolioFilter(tab.id)}
                    className={`pb-1 text-[11.5px] font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                      isActive
                        ? 'border-[#243B8A] text-[#243B8A] font-semibold'
                        : 'border-transparent text-[#5A5F72] hover:text-[#252832]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            data-testid="about-monograph-bento-grid"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Block 01: The language we live in */}
            <motion.section
              id="about-chapter-02"
              data-about-io-block="folio-01"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              style={{ '--io-block-delay': '0ms' } as React.CSSProperties}
              className={`akath-seq-step akath-about-io-block bg-white border border-[#E6DFCE] rounded-2xl p-6 sm:p-8 space-y-4 transition-opacity ${
                activeFolioFilter !== 'all' && activeFolioFilter !== 'language'
                  ? 'hidden md:block md:opacity-45'
                  : 'block opacity-100'
              }`}
            >
              <div className="space-y-1.5 border-b border-[#E6DFCE] pb-3.5">
                <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-[#243B8A]">
                  01 · भाषा आणि परिसर
                </span>
                <h3 className="akath-about-headline-breathe font-editorial-display text-[22px] sm:text-[25px] font-bold text-[#252832] leading-snug">
                  The language we live in
                </h3>
              </div>

              <div
                data-testid="about-prose-breathe-block"
                style={{ '--breathe-phase': '1.2s' } as React.CSSProperties}
                className="akath-about-prose-breathe space-y-3.5 font-editorial-prose text-[15.5px] text-[#252832] leading-[1.78]"
              >
                <p
                  data-about-io-para="folio-01-p1"
                  style={{ '--io-stagger-index': 0 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  Marathi carries many worlds within it. The language of a city is not always the language of a village. The words spoken at home may be different from those found in a classroom or a book. Marathwada has its own rhythms, memories, humour, silences, and ways of looking at life.
                </p>

                <p
                  data-about-io-para="folio-01-p2"
                  style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  We want those differences to find their way into print without being unnecessarily polished away.
                </p>

                <p
                  data-about-io-para="folio-01-p3"
                  style={{ '--io-stagger-index': 2 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  For us, publishing in Marathi is not simply about preserving a language. It is about making room for the people who speak it, the lives they lead, the questions they ask, and the worlds they are still imagining.
                </p>

                <p
                  data-about-io-para="folio-01-p4"
                  style={{ '--io-stagger-index': 3 } as React.CSSProperties}
                  className="akath-about-io-para text-[#5A5F72]"
                >
                  We are equally curious about what happens when one language meets another — through translation, conversation, and the exchange of ideas.
                </p>
              </div>
            </motion.section>

            {/* Block 02: Books take more than words */}
            <motion.section
              id="about-chapter-03"
              data-about-io-block="folio-02"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              style={{ '--io-block-delay': '60ms' } as React.CSSProperties}
              className={`akath-seq-step akath-about-io-block bg-white border border-[#E6DFCE] rounded-2xl p-6 sm:p-8 space-y-4 transition-opacity ${
                activeFolioFilter !== 'all' && activeFolioFilter !== 'craft'
                  ? 'hidden md:block md:opacity-45'
                  : 'block opacity-100'
              }`}
            >
              <div className="space-y-1.5 border-b border-[#E6DFCE] pb-3.5">
                <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-[#243B8A]">
                  02 · मुद्रण आणि संपादन
                </span>
                <h3 className="akath-about-headline-breathe font-editorial-display text-[22px] sm:text-[25px] font-bold text-[#252832] leading-snug">
                  Books take more than words
                </h3>
              </div>

              <div
                data-testid="about-prose-breathe-block"
                style={{ '--breathe-phase': '2.1s' } as React.CSSProperties}
                className="akath-about-prose-breathe space-y-3.5 font-editorial-prose text-[15.5px] text-[#252832] leading-[1.78]"
              >
                <p
                  data-about-io-para="folio-02-p1"
                  style={{ '--io-stagger-index': 0 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  There is a particular kind of care that goes into making a book. The sentence that needs another look. The comma that changes the rhythm. The cover that finally feels right. The Devanagari typeface that remains comfortable after a hundred pages. The paper, the binding, the quiet satisfaction of holding a finished book for the first time.
                </p>

                <p
                  data-about-io-para="folio-02-p2"
                  style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  These things may go unnoticed by a reader. That is partly the point.
                </p>

                <p
                  data-about-io-para="folio-02-p3"
                  style={{ '--io-stagger-index': 2 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  We want the work behind a book to serve the writing, not compete with it. We want authors to be heard, questions to be discussed honestly, and decisions to be made with care. Publishing should be a relationship built on trust, not a transaction that ends when a manuscript is accepted.
                </p>

                <p
                  data-about-io-para="folio-02-p4"
                  style={{ '--io-stagger-index': 3 } as React.CSSProperties}
                  className="akath-about-io-para text-[#5A5F72]"
                >
                  Not every manuscript will be right for us. But every decision deserves thought, and every author deserves clarity about the process.
                </p>
              </div>
            </motion.section>

            {/* Block 03: A book is only the beginning */}
            <motion.section
              id="about-chapter-04"
              data-about-io-block="folio-03"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              style={{ '--io-block-delay': '0ms' } as React.CSSProperties}
              className={`akath-seq-step akath-about-io-block bg-white border border-[#E6DFCE] rounded-2xl p-6 sm:p-8 space-y-4 transition-opacity ${
                activeFolioFilter !== 'all' && activeFolioFilter !== 'beginning'
                  ? 'hidden md:block md:opacity-45'
                  : 'block opacity-100'
              }`}
            >
              <div className="space-y-1.5 border-b border-[#E6DFCE] pb-3.5">
                <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-[#243B8A]">
                  03 · वाचनकट्टा आणि संवाद
                </span>
                <h3 className="akath-about-headline-breathe font-editorial-display text-[22px] sm:text-[25px] font-bold text-[#252832] leading-snug">
                  A book is only the beginning
                </h3>
              </div>

              <div
                data-testid="about-prose-breathe-block"
                style={{ '--breathe-phase': '2.9s' } as React.CSSProperties}
                className="akath-about-prose-breathe space-y-3.5 font-editorial-prose text-[15.5px] text-[#252832] leading-[1.78]"
              >
                <p
                  data-about-io-para="folio-03-p1"
                  style={{ '--io-stagger-index': 0 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  We don&apos;t want our relationship with a book to end when it leaves the printing press.
                </p>

                <p
                  data-about-io-para="folio-03-p2"
                  style={{ '--io-stagger-index': 1 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  Through our bookstore and <em>Vachankatta</em>, we hope to make space for the things that grow around reading: an excerpt that makes someone curious, a review that changes their mind, an essay that sends them looking for another book, or a conversation that continues long after everyone has gone home.
                </p>

                <p
                  data-about-io-para="folio-03-p3"
                  style={{ '--io-stagger-index': 2 } as React.CSSProperties}
                  className="akath-about-io-para"
                >
                  Perhaps someone will discover a writer they have never heard of. Perhaps a young reader will find a book that puts an old feeling into words. Perhaps a book published in a small room in Maharashtra will find its way to someone who needs it, somewhere far away.
                </p>

                <p
                  data-about-io-para="folio-03-p4"
                  style={{ '--io-stagger-index': 3 } as React.CSSProperties}
                  className="akath-about-io-para text-[#5A5F72]"
                >
                  We cannot promise what a book will mean to every reader. We can only give it the attention, honesty, and care it deserves before letting it find its way.
                </p>
              </div>
            </motion.section>

            {/* Block 04: Why the tortoise? */}
            <motion.section
              id="about-chapter-05"
              data-about-io-block="folio-04"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              style={{ '--io-block-delay': '60ms' } as React.CSSProperties}
              className={`akath-seq-step akath-about-io-block bg-white border border-[#E6DFCE] rounded-2xl p-6 sm:p-8 space-y-4 transition-opacity ${
                activeFolioFilter !== 'all' && activeFolioFilter !== 'tortoise'
                  ? 'hidden md:block md:opacity-45'
                  : 'block opacity-100'
              }`}
            >
              <div className="space-y-1.5 border-b border-[#E6DFCE] pb-3.5">
                <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-[#174D3A]">
                  04 · कासवाची संथ पावले
                </span>
                <h3 className="akath-about-headline-breathe font-editorial-display text-[22px] sm:text-[25px] font-bold text-[#252832] leading-snug">
                  Why the tortoise?
                </h3>
              </div>

              <div
                data-testid="about-prose-breathe-block"
                style={{ '--breathe-phase': '3.7s' } as React.CSSProperties}
                className="akath-about-prose-breathe space-y-3.5 font-editorial-prose text-[15.5px] text-[#252832] leading-[1.78]"
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
                  className="akath-about-io-para font-medium text-[#174D3A]"
                >
                  Akath Prakashan is our attempt to do just that — one manuscript, one book, one reader at a time.
                </p>
              </div>
            </motion.section>
          </div>
        </div>

        {/* =================================================================
            SECTION 4: CLOSING MOTTO & PATIENT TORTOISE TRAVERSE
            ================================================================= */}
        <motion.footer
          data-testid="about-closing-colophon"
          data-about-io-block="closing-colophon"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.04 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          aria-label="अकथ प्रकाशन समारोप ब्रीदवाक्य"
          className="akath-about-io-block pt-4 border-t border-[#E6DFCE] text-center space-y-5"
        >
          <div
            data-about-io-para="closing-motto"
            style={{ '--io-stagger-index': 0 } as React.CSSProperties}
            className="akath-about-io-para flex flex-wrap items-baseline justify-center gap-2.5"
          >
            <p className="font-editorial-display italic text-[19px] sm:text-[22px] text-[#243B8A] font-medium">
              अकथ प्रकाशन
            </p>
            <span aria-hidden="true" className="text-[#C89D54]">
              —
            </span>
            <p
              data-testid="about-final-marathi-line"
              className="font-editorial-display italic text-[20px] sm:text-[25px] font-bold text-[#174D3A] leading-snug"
            >
              वाचत राहू. विचारत राहू. लिहित राहू.
            </p>
          </div>

          <WalkingTortoise />
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

  const editorialEmail = 'sampark@akathprakashan.in';

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
                  href={`https://wa.me/${PUBLISHER_IDENTITY.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
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

