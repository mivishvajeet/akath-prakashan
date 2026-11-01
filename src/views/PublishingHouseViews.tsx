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
  TortoiseStageIllustration,
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
  Calendar,
  MapPin,
  BookOpen,
  Feather,
  Compass,
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {authorBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  author={author}
                  onSelectBook={(slug) => onNavigate(`/books/${slug}`)}
                  onAddToCart={onAddToCart}
                  justAdded={recentlyAddedBookId === book.id}
                />
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
// 3. ABOUT AKATH PRAKASHAN VIEW (/about) — ARCHIVAL LITERARY MONOGRAPH,
//    LIVE THEMATIC DATE & TIME MASTHEAD, SEQUENTIAL SCROLL REVEALS &
//    WALKING TORTOISE CLOSING COLOPHON
// ============================================================================

interface AboutAkathViewProps {
  onNavigate: (path: string) => void;
}

const aboutSectionSequentialVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const aboutItemSequentialVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export const AboutAkathView: React.FC<AboutAkathViewProps> = ({ onNavigate }) => {
  const { lang, t } = useLanguage();
  const [now, setNow] = useState<Date>(() => new Date());

  // Live ticking editorial clock (updates every second)
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Format current Date & Time in Indian Standard Time (Asia/Kolkata) per theme
  const formattedDate = (() => {
    try {
      return new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
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

  // Determine thematic literary hour ("वाचन प्रहर" / "Reading Watch") in IST
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

  const monographChapters = [
    {
      num: '01',
      roman: 'I',
      anchor: 'about-chapter-01',
      mr: 'प्रकाशनाची पायाभरणी',
      en: 'Imprint Origins',
    },
    {
      num: '02',
      roman: 'II',
      anchor: 'about-chapter-02',
      mr: 'आपण ज्या भाषेत जगतो',
      en: 'The language we live in',
    },
    {
      num: '03',
      roman: 'III',
      anchor: 'about-chapter-03',
      mr: 'शब्दांपलीकडची पुस्तके',
      en: 'Books take more than words',
    },
    {
      num: '04',
      roman: 'IV',
      anchor: 'about-chapter-04',
      mr: 'पुस्तक ही फक्त सुरुवात',
      en: 'A book is only the beginning',
    },
    {
      num: '05',
      roman: 'V',
      anchor: 'about-chapter-05',
      mr: 'कासवच का?',
      en: 'Why the tortoise?',
    },
  ];

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
      {/* ===================================================================
          0. ARCHIVAL IMPRINT DATELINE & LIVE HOROLOGY MASTHEAD
          =================================================================== */}
      <div
        data-testid="about-archival-dateline"
        className="bg-[#243B8A] text-[#FFFDF7] border-b border-[#1B2D6B]"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          {/* Left: Imprint Folio & Location */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider text-[#FFD966]">
              <BookOpen className="w-3.5 h-3.5 text-[#FFD966]" />
              <span>
                {lang === 'mr'
                  ? 'अकथ प्रकाशन जाहीरनामा • संग्रह प्रत'
                  : 'AKATH MONOGRAPH • ARCHIVAL EDITION'}
              </span>
            </span>
            <span className="hidden sm:inline text-[#FFFDF7]/35">|</span>
            <span className="inline-flex items-center gap-1.5 text-[#FFFDF7]/90">
              <MapPin className="w-3.5 h-3.5 text-[#EF6855]" />
              <span>
                {lang === 'mr'
                  ? 'नांदेड • पुणे, महाराष्ट्र (IST)'
                  : 'Nanded • Pune, Maharashtra (IST)'}
              </span>
            </span>
          </div>

          {/* Right: Live Date & Current Time per Theme */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11.5px]">
            <span
              data-testid="about-live-date"
              className="inline-flex items-center gap-1.5 text-[#FFFDF7]/90"
            >
              <Calendar className="w-3.5 h-3.5 text-[#FFD966]" />
              <span>{formattedDate}</span>
            </span>

            <span className="text-[#FFFDF7]/30">•</span>

            <span
              data-testid="about-live-time"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#1B2D6B] border border-[#FFD966]/35 text-[#FFD966] font-semibold tabular-nums"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD966] animate-pulse" />
              <Clock className="w-3.5 h-3.5 text-[#FFD966]" />
              <span>{formattedTime} IST</span>
            </span>

            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-sm bg-[#FFFDF7]/10 text-[#FFFDF7]/90 font-serif text-[11px]">
              {literaryWatchLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          1. HERO MANIFESTO — LITERARY MONOGRAPH TITLE PAGE
          =================================================================== */}
      <section
        data-testid="about-hero-manifesto"
        className="relative overflow-hidden bg-white border-b border-[#E6DFCE] sarvam-aura"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left 7 Columns: Editorial Manifesto & Opening Essay */}
            <motion.div
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              className="lg:col-span-7 space-y-6"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-sm bg-[#FFFDF7] border border-[#E6DFCE]"
              >
                <AnimatedTortoiseEmblem
                  className="w-6 h-6"
                  variant="indigo"
                  animate={true}
                />
                <span className="text-[12px] font-mono uppercase tracking-[0.14em] text-[#174D3A] font-semibold">
                  About Akath Prakashan · नांदेड आणि पुणे
                </span>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="space-y-3"
              >
                <h1 className="font-serif text-[28px] sm:text-[38px] lg:text-[44px] font-bold text-[#252832] leading-[1.22] tracking-tight">
                  काही पुस्तकं वाचून संपतात. काही आपल्यासोबत राहतात.
                </h1>
                <p className="font-serif italic text-[19px] sm:text-[23px] text-[#243B8A] font-medium leading-relaxed">
                  Some books end at the last page. Others stay with us.
                </p>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="space-y-4 pt-2 border-t border-[#E6DFCE] text-[16px] sm:text-[17px] text-[#252832] leading-[1.85] font-serif"
              >
                <p>
                  Akath Prakashan grew out of a simple feeling: there are books worth bringing into the world, and there should be people willing to take the time to do it properly.
                </p>
                <p className="text-[#4A4E5D]">
                  A manuscript is a strange, wonderful thing. Sometimes it arrives as a finished story. Sometimes it is a collection of scattered thoughts, a voice still finding its shape, or an experience that has waited years to be put into words. Before it becomes a book, it needs someone willing to read it carefully, ask the right questions, and understand what the writer is trying to say.
                </p>
                <p className="font-semibold text-[#174D3A] text-[18px]">
                  That is the kind of work we want to do.
                </p>
              </motion.div>
            </motion.div>

            {/* Right 5 Columns: Archival Collector's Edition Plate */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 18 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              <div className="bg-[#FFFDF7] rounded-sm border border-[#243B8A]/25 p-6 sm:p-8 shadow-xs space-y-6 relative overflow-hidden">
                {/* Top Corner Archival Stamp */}
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#E6DFCE]">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#243B8A]">
                    PLATE № 01 · OFFICIAL IMPRINT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#FFD966]/65 text-[#252832] font-mono text-[11px] font-bold">
                    EST. NANDED & PUNE
                  </span>
                </div>

                <div className="py-2">
                  <TortoiseStageIllustration className="w-full h-auto" />
                </div>

                <div className="pt-4 border-t border-[#E6DFCE] space-y-3">
                  <div className="flex items-center justify-between text-[12px] font-mono text-[#5A5F72]">
                    <span>प्रतीक (Emblem)</span>
                    <span className="font-semibold text-[#174D3A]">
                      कासव आणि उघडलेले पुस्तक
                    </span>
                  </div>
                  <p className="text-[14px] text-[#4A4E5D] leading-relaxed font-serif">
                    {lang === 'mr'
                      ? PUBLISHER_IDENTITY.turtlePhilosophyMarathi
                      : 'Like the patient tortoise carrying its home along its own steady path, we choose editorial depth over commercial haste.'}
                  </p>

                  {/* Live Imprint Time Stamp inside the Collector's Plate */}
                  <div className="pt-3 border-t border-[#E6DFCE]/80 flex items-center justify-between text-[11px] font-mono text-[#243B8A]">
                    <span>ARCHIVAL CLOCK (IST)</span>
                    <span className="tabular-nums font-bold">{formattedTime}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. SEQUENTIAL EDITORIAL NARRATIVE — 5 MONOGRAPH CHAPTERS
          =================================================================== */}
      <section
        data-testid="about-editorial-essay"
        aria-label="About Akath Prakashan Editorial Narrative"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left 4 Columns: Sticky Literary Monograph Index & Imprint Ledger */}
          <motion.aside
            variants={aboutSectionSequentialVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="lg:col-span-4 lg:sticky lg:top-28 space-y-6"
          >
            <div className="bg-white rounded-sm border border-[#E6DFCE] p-6 space-y-5 shadow-2xs">
              <div className="pb-3 border-b border-[#E6DFCE]">
                <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#243B8A] font-bold">
                  {lang === 'mr'
                    ? 'संपादकीय अनुक्रमणिका'
                    : 'MONOGRAPH TABLE OF CONTENTS'}
                </p>
                <h2 className="mt-1 font-serif text-lg font-bold text-[#252832]">
                  {lang === 'mr'
                    ? 'अकथ प्रकाशन : पाच अध्याय'
                    : 'Five Chapters of Our Ethos'}
                </h2>
              </div>

              {/* Clickable Chapter Index */}
              <nav aria-label="About chapters navigation" className="space-y-2">
                {monographChapters.map((ch) => (
                  <a
                    key={ch.num}
                    href={`#${ch.anchor}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(ch.anchor);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group flex items-center justify-between gap-2 px-3 py-2 rounded-sm hover:bg-[#F7F3E8] border border-transparent hover:border-[#E6DFCE] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#243B8A] px-1.5 py-0.5 rounded-sm bg-[#FFD966]/45">
                        {ch.num}
                      </span>
                      <span className="font-serif text-sm font-semibold text-[#252832] group-hover:text-[#243B8A] truncate">
                        {lang === 'mr' ? ch.mr : ch.en}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[#5A5F72]">
                      {ch.roman}
                    </span>
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-[#E6DFCE] space-y-3 text-xs">
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#5A5F72]">
                    {lang === 'mr' ? 'केंद्रस्थाने' : 'Imprint Centres'}
                  </span>
                  <span className="font-serif font-semibold text-[#252832]">
                    Nanded (Marathwada) & Pune, Maharashtra
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#5A5F72]">
                    {lang === 'mr' ? 'वाङ्मय प्रकार' : 'Literary Scope'}
                  </span>
                  <span className="font-serif font-semibold text-[#252832]">
                    Fiction · Poetry · Essays · Criticism · Translations
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-[#5A5F72]">
                    {lang === 'mr' ? 'संपादन वेळ (IST)' : 'Current Imprint Time'}
                  </span>
                  <span className="font-mono font-bold text-[#174D3A] tabular-nums">
                    {formattedDate} · {formattedTime}
                  </span>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Right 8 Columns: Sequential Editorial Essay Chapters */}
          <div className="lg:col-span-8 space-y-12">
            {/* Chapter 01: Independent Publishing House & Quiet Literature */}
            <motion.article
              id="about-chapter-01"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="akath-seq-step bg-white rounded-sm border border-[#E6DFCE] p-7 sm:p-10 space-y-5 shadow-2xs"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex items-center justify-between gap-2 pb-3 border-b border-[#E6DFCE]"
              >
                <span className="px-2.5 py-0.5 rounded-sm bg-[#243B8A] text-[#FFD966] font-mono text-[11px] font-bold">
                  CHAPTER 01 · IMPRINT ORIGINS
                </span>
                <span className="font-mono text-xs text-[#5A5F72]">FOLIO I</span>
              </motion.div>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[18px] text-[#252832] leading-[1.85]"
              >
                Based in Nanded and Pune, Akath Prakashan is an independent publishing house devoted to Marathi literature and writing across languages. We work with fiction, poetry, essays, criticism, and translations — not because every category needs to be represented, but because good writing can come from anywhere and speak to anyone.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[18px] text-[#4A4E5D] leading-[1.85]"
              >
                We are interested in writing that notices what others overlook. Stories that make familiar places feel different. Poems that find words for things we have felt but never quite known how to express. Essays that leave us with better questions than the ones we started with.
              </motion.p>

              <motion.blockquote
                variants={aboutItemSequentialVariants}
                className="my-4 p-5 sm:p-6 rounded-sm bg-[#FFFDF7] border-l-4 border-[#174D3A] font-serif text-[19px] sm:text-[22px] font-semibold text-[#174D3A] leading-snug"
              >
                “We don&apos;t think literature always needs to be loud to matter.”
              </motion.blockquote>
            </motion.article>

            {/* Chapter 02: The language we live in */}
            <motion.article
              id="about-chapter-02"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="akath-seq-step bg-white rounded-sm border border-[#E6DFCE] p-7 sm:p-10 space-y-5 shadow-2xs"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E6DFCE]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#174D3A] text-[#FFFDF7] font-mono text-[11px] font-bold">
                    CHAPTER 02 · LIVING LANGUAGE
                  </span>
                  <span className="text-[13px] font-serif text-[#174D3A] font-semibold">
                    आपण ज्या भाषेत जगतो
                  </span>
                </div>
                <span className="font-mono text-xs text-[#5A5F72]">FOLIO II</span>
              </motion.div>

              <motion.h3
                variants={aboutItemSequentialVariants}
                className="font-serif text-[24px] sm:text-[28px] font-bold text-[#252832]"
              >
                The language we live in
              </motion.h3>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#252832] leading-[1.85]"
              >
                Marathi carries many worlds within it. The language of a city is not always the language of a village. The words spoken at home may be different from the ones found in textbooks. Each region has its own rhythms, memories, humour, silences, and ways of looking at life.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#4A4E5D] leading-[1.85]"
              >
                Because our roots are in Marathwada, we feel this closely. We want those differences to find their way into print without being unnecessarily polished away.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#252832] leading-[1.85]"
              >
                For us, working in Marathi is not about narrowing our world. It is about paying attention to the world right in front of us — and making room for the people who speak it, read it, question it, and carry it forward. When languages meet through translation or conversation, that world only grows wider.
              </motion.p>
            </motion.article>

            {/* Chapter 03: Books take more than words */}
            <motion.article
              id="about-chapter-03"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="akath-seq-step bg-white rounded-sm border border-[#E6DFCE] p-7 sm:p-10 space-y-5 shadow-2xs"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E6DFCE]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#243B8A] text-[#FFD966] font-mono text-[11px] font-bold">
                    CHAPTER 03 · EDITORIAL CRAFT
                  </span>
                  <span className="text-[13px] font-serif text-[#243B8A] font-semibold">
                    पुस्तक घडण्यासाठी केवळ शब्द पुरेसे नसतात
                  </span>
                </div>
                <span className="font-mono text-xs text-[#5A5F72]">FOLIO III</span>
              </motion.div>

              <motion.h3
                variants={aboutItemSequentialVariants}
                className="font-serif text-[24px] sm:text-[28px] font-bold text-[#252832]"
              >
                Books take more than words
              </motion.h3>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#252832] leading-[1.85]"
              >
                A good book depends on many quiet decisions.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#4A4E5D] leading-[1.85]"
              >
                The sentence that needs another look. The comma that changes the rhythm of a paragraph. A typeface that feels comfortable to read in Devanagari. Margins that give the page room to breathe. A cover that understands the spirit of the book instead of merely decorating it. Paper and binding that make the book a pleasure to hold and return to.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#252832] leading-[1.85]"
              >
                None of these things should call attention to themselves, yet a reader feels their presence on every page. We want the work behind a book to serve the writing, not compete with it.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#4A4E5D] leading-[1.85]"
              >
                Publishing, at its best, is a relationship built on trust. Writers should know how their manuscript is being edited, designed, produced, and shared with readers. We believe in clear conversations, honest feedback, and doing every stage of the work with care.
              </motion.p>
            </motion.article>

            {/* Chapter 04: A book is only the beginning */}
            <motion.article
              id="about-chapter-04"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="akath-seq-step bg-white rounded-sm border border-[#E6DFCE] p-7 sm:p-10 space-y-5 shadow-2xs"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E6DFCE]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#FFD966]/75 text-[#252832] font-mono text-[11px] font-bold">
                    CHAPTER 04 · BEYOND THE PRESS
                  </span>
                  <span className="text-[13px] font-serif text-[#243B8A] font-semibold">
                    पुस्तक ही केवळ सुरुवात असते
                  </span>
                </div>
                <span className="font-mono text-xs text-[#5A5F72]">FOLIO IV</span>
              </motion.div>

              <motion.h3
                variants={aboutItemSequentialVariants}
                className="font-serif text-[24px] sm:text-[28px] font-bold text-[#252832]"
              >
                A book is only the beginning
              </motion.h3>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#252832] leading-[1.85]"
              >
                We don&apos;t want our relationship with a book to end when it leaves the printing press.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#4A4E5D] leading-[1.85]"
              >
                A book lives when it is read, discussed, argued with, recommended to a friend, or picked up years later by someone who needed it at just that moment. Through our bookstore and <em>Vachankatta</em> — our space for excerpts, reviews, essays, and literary conversation — we want to create a place where readers and writers can meet around books, ideas, and the habit of reading.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#252832] leading-[1.85]"
              >
                Sometimes that begins with a single first page. Sometimes with a review. Sometimes with a conversation that continues long after everyone has gone home.
              </motion.p>

              <motion.div variants={aboutItemSequentialVariants} className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/vachankatta')}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#243B8A] hover:text-[#EF6855] transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>
                    {lang === 'mr'
                      ? 'वाचनकट्टा साहित्य नियतकालिकाला भेट द्या →'
                      : 'Explore Vachankatta Literary Journal →'}
                  </span>
                </button>
              </motion.div>
            </motion.article>

            {/* Chapter 05: Why the tortoise? */}
            <motion.article
              id="about-chapter-05"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="akath-seq-step bg-[#FFFDF7] rounded-sm border-2 border-[#174D3A]/30 p-7 sm:p-10 space-y-5 shadow-xs relative overflow-hidden"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#174D3A]/20"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#174D3A] text-[#FFFDF7] font-mono text-[11px] font-bold">
                    CHAPTER 05 · THE COLOPHON
                  </span>
                  <span className="text-[13px] font-serif text-[#174D3A] font-semibold">
                    कासवच का?
                  </span>
                </div>
                <span className="font-mono text-xs text-[#174D3A]">FOLIO V</span>
              </motion.div>

              <motion.h3
                variants={aboutItemSequentialVariants}
                className="font-serif text-[24px] sm:text-[28px] font-bold text-[#252832]"
              >
                Why the tortoise?
              </motion.h3>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#252832] leading-[1.85]"
              >
                We chose a tortoise for a reason.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#4A4E5D] leading-[1.85]"
              >
                It isn&apos;t in a hurry. It carries its home with it. It moves at its own pace and stays on its path.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[16.5px] sm:text-[17.5px] text-[#4A4E5D] leading-[1.85]"
              >
                In a time when everything is expected to be fast, constant, and immediately visible, we feel drawn to a slower way of working. We would rather build a small list of books we believe in than fill a catalogue simply to make it bigger. We would rather give a book the time it needs than rush it into print and forget it a week later.
              </motion.p>

              <motion.p
                variants={aboutItemSequentialVariants}
                className="font-serif text-[17px] sm:text-[19px] font-semibold text-[#243B8A] leading-[1.8] pt-2 border-t border-[#E6DFCE]"
              >
                Akath Prakashan is our attempt to do just that — one manuscript, one book, one reader at a time.
              </motion.p>
            </motion.article>
          </div>
        </div>
      </section>

      {/* ===================================================================
          3. CORE EDITORIAL PRINCIPLES & CLOSING LITERARY SIGNATURE
          =================================================================== */}
      <section className="bg-white border-t border-[#E6DFCE] py-14 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={aboutSectionSequentialVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="space-y-8"
          >
            <motion.div
              variants={aboutItemSequentialVariants}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6DFCE] pb-6"
            >
              <div>
                <p className="text-[12px] font-mono uppercase tracking-[0.14em] text-[#243B8A] font-semibold">
                  {lang === 'mr'
                    ? 'संपादकीय बांधिलकी'
                    : 'Core Editorial Principles'}
                </p>
                <h2 className="mt-1 font-serif text-[26px] sm:text-[32px] font-bold text-[#252832]">
                  {lang === 'mr'
                    ? 'अकथ प्रकाशनाची चतुःसूत्री'
                    : 'Four Commitments to Writers & Readers'}
                </h2>
              </div>
              <span className="text-xs font-mono text-[#5A5F72]">
                AKATH LITERARY CHARTER • NANDED & PUNE
              </span>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PUBLISHER_IDENTITY.editorialPrinciples.map((principle, idx) => (
                <motion.div
                  key={idx}
                  variants={aboutItemSequentialVariants}
                  className="bg-[#FFFDF7] rounded-sm border border-[#E6DFCE] p-6 sm:p-8 space-y-3 hover:border-[#243B8A]/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-sm bg-[#FFD966]/65 text-[#252832] font-bold">
                      0{idx + 1}
                    </span>
                    <span className="text-xs font-mono text-[#5A5F72]">
                      {lang === 'mr'
                        ? principle.titleEnglish
                        : principle.title}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#252832]">
                    {lang === 'mr'
                      ? principle.title
                      : principle.titleEnglish || principle.title}
                  </h3>
                  <p className="text-[15px] text-[#5A5F72] leading-relaxed">
                    {lang === 'mr'
                      ? principle.description
                      : principle.descriptionEnglish || principle.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Literary Invitation Banner */}
            <motion.div
              variants={aboutItemSequentialVariants}
              className="rounded-sm bg-[#243B8A] text-[#FFFDF7] p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
            >
              <div className="space-y-2 max-w-2xl">
                <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FFD966]">
                  <Feather className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'mr'
                      ? 'लेखक, अनुवादक आणि वाचकांसाठी'
                      : 'For Authors, Translators & Curious Readers'}
                  </span>
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FFFDF7]">
                  {lang === 'mr'
                    ? 'अकथच्या साहित्यप्रवासात सहभागी व्हा'
                    : 'Join the Akath Literary Journey'}
                </h3>
                <p className="text-sm sm:text-base text-[#FFFDF7]/85 leading-relaxed">
                  {lang === 'mr'
                    ? 'आमची प्रकाशित पुस्तके वाचा किंवा तुमच्या नवीन हस्तलिखिताचा प्रस्ताव संपादकीय मंडळाकडे पाठवा.'
                    : 'Explore our published Marathi editions or submit your manuscript proposal to our editorial desk.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="px-6 py-3 rounded-sm bg-[#FFD966] hover:bg-[#f5cb4d] text-[#252832] text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t.home.ctaExploreBooks}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/submit-manuscript')}
                  className="px-6 py-3 rounded-sm bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t.nav.submitManuscript}
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* =================================================================
              4. CLOSING LITERARY SIGNATURE & WALKING TORTOISE COLOPHON
              Placed after all About section text, including the final Marathi
              line: “वाचत राहू. विचारत राहू. लिहित राहू.” and immediately before
              the footer.
              ================================================================= */}
          <motion.div
            data-testid="about-closing-colophon"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            aria-label={
              lang === 'mr'
                ? 'अकथ प्रकाशन समारोप ब्रीदवाक्य आणि चालणारे कासव'
                : 'Akath Prakashan closing literary signature and walking tortoise'
            }
            className="mt-16 pt-14 pb-8 border-t border-[#E6DFCE] text-center"
          >
            <p
              data-testid="about-final-marathi-line"
              className="font-serif text-[24px] sm:text-[32px] font-bold text-[#174D3A] tracking-wide leading-snug"
            >
              “वाचत राहू. विचारत राहू. लिहित राहू.”
            </p>
            <p className="mt-2 font-serif text-[15px] sm:text-[17px] italic text-[#5A5F72]">
              “{PUBLISHER_IDENTITY.closingMottoEnglish}”
            </p>

            {/* Walking Tortoise Closing Animation */}
            <WalkingTortoise />
          </motion.div>
        </div>
      </section>
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
        city: city.trim() || 'पुणे',
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
                <select
                  id="ms-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-white"
                >
                  <option value="कादंबरी">
                    {lang === 'mr' ? 'कादंबरी' : 'Novel (कादंबरी)'}
                  </option>
                  <option value="कथासंग्रह">
                    {lang === 'mr' ? 'कथासंग्रह' : 'Short Stories (कथासंग्रह)'}
                  </option>
                  <option value="कवितासंग्रह">
                    {lang === 'mr' ? 'कवितासंग्रह' : 'Poetry (कवितासंग्रह)'}
                  </option>
                  <option value="समीक्षा व निबंध">
                    {lang === 'mr'
                      ? 'समीक्षा व निबंध'
                      : 'Criticism & Essays (समीक्षा व निबंध)'}
                  </option>
                  <option value="अनुवाद">
                    {lang === 'mr' ? 'अनुवाद' : 'Translation (अनुवाद)'}
                  </option>
                </select>
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
// 5. CONTACT VIEW (/contact)
// ============================================================================

interface ContactViewProps {
  onSubmitContact: (
    payload: Record<string, unknown>
  ) => Promise<{
    ok: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string>;
  }>;
}

export const ContactView: React.FC<ContactViewProps> = ({ onSubmitContact }) => {
  const { lang, t } = useLanguage();

  const [name, setName] = useState('');
  const [role, setRole] = useState<
    'Reader' | 'Author' | 'Bookstore_Institution' | 'Contributor'
  >('Reader');
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
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[780px] mx-auto px-4 sm:px-6"
      >
        <div className="mb-8 space-y-2">
          <h1 className="type-page-heading text-[#252832]">{t.contact.title}</h1>
          <p className="prose-marathi text-[#5A5F72]">{t.contact.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 space-y-6"
        >
          {successMsg && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px] flex items-center gap-2"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
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
                className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
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

            <div>
              <label htmlFor="contact-role" className="block ui-label mb-1.5">
                {t.contact.roleLabel}
              </label>
              <select
                id="contact-role"
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-white"
              >
                <option value="Reader">
                  {lang === 'mr' ? 'वाचक' : 'Reader'}
                </option>
                <option value="Author">
                  {lang === 'mr' ? 'लेखक' : 'Author'}
                </option>
                <option value="Bookstore_Institution">
                  {lang === 'mr'
                    ? 'ग्रंथालय / पुस्तक विक्रेता'
                    : 'Bookstore / Library'}
                </option>
                <option value="Contributor">
                  {lang === 'mr'
                    ? 'समीक्षक / पत्रकार'
                    : 'Reviewer / Media'}
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
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

          <div>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-white"
            />
          </div>

          <div>
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
              className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
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
            className="px-6 py-3.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold transition-colors"
          >
            {t.contact.submitBtn}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
