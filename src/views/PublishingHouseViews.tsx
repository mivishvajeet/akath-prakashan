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
// 3. ABOUT AKATH PRAKASHAN VIEW (/about) — ARCHIVAL BROADSHEET MONOGRAPH,
//    LIVE THEMATIC DATE & TIME MASTHEAD, SEQUENTIAL SCROLL REVEAL &
//    WALKING TORTOISE COLOPHON (NO 6-STEPS DUPLICATION)
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
  hidden: { opacity: 0, y: 18 },
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
      id: 'about-chapter-01',
      roman: 'I',
      code: '01 · IMPRINT ORIGINS',
      titleEn: "We don't think literature always needs to be loud to matter.",
      titleMr: 'आवाज मोठा नसला तरी साहित्य अर्थपूर्ण असू शकते',
    },
    {
      id: 'about-chapter-02',
      roman: 'II',
      code: '02 · LIVING LANGUAGE',
      titleEn: 'The language we live in',
      titleMr: 'आपण ज्या भाषेत जगतो',
    },
    {
      id: 'about-chapter-03',
      roman: 'III',
      code: '03 · EDITORIAL CRAFT',
      titleEn: 'Books take more than words',
      titleMr: 'पुस्तक घडण्यासाठी केवळ शब्द पुरेसे नसतात',
    },
    {
      id: 'about-chapter-04',
      roman: 'IV',
      code: '04 · BEYOND THE PRESS',
      titleEn: 'A book is only the beginning',
      titleMr: 'पुस्तक ही केवळ सुरुवात आहे',
    },
    {
      id: 'about-chapter-05',
      roman: 'V',
      code: '05 · THE COLOPHON',
      titleEn: 'Why the tortoise?',
      titleMr: 'कासवच का?',
    },
  ];

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen pb-14 lg:pb-24">
      {/* ===================================================================
          0. ARCHIVAL IMPRINT DATELINE & LIVE HOROLOGY MASTHEAD
          =================================================================== */}
      <div
        data-testid="about-archival-dateline"
        className="bg-[#243B8A] text-[#FFFDF7] border-b border-[#1B2D6B]"
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
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
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono">
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
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#1B2D6B] border border-[#FFD966]/35 text-[#FFD966] font-semibold tabular-nums"
            >
              <span className="w-2 h-2 rounded-full bg-[#FFD966] animate-pulse" />
              <Clock className="w-3.5 h-3.5 text-[#FFD966]" />
              <span>{formattedTime} IST</span>
            </span>

            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-sm bg-[#FFFDF7]/10 text-[#FFFDF7]/90 font-serif text-[11px]">
              {literaryWatchLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-14 sm:space-y-20">
        {/* ===================================================================
            1. MONUMENTAL BROADSHEET HERO MANIFESTO (SEQUENTIAL SCROLL REVEAL)
            =================================================================== */}
        <motion.section
          data-testid="about-hero-manifesto"
          variants={aboutSectionSequentialVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="bg-white rounded-sm border border-[#E6E1D6] overflow-hidden shadow-2xs sarvam-aura"
        >
          {/* Top Broadsheet Masthead Strip */}
          <div className="px-6 sm:px-10 lg:px-14 py-4 bg-[#F7F3E8]/90 border-b border-[#E6E1D6] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#525665]">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded-sm bg-[#243B8A] text-[#FFD966] font-bold">
                FOLIO I
              </span>
              <span className="font-bold uppercase tracking-widest text-[#174D3A]">
                About Akath Prakashan
              </span>
            </div>
            <span>
              {lang === 'mr'
                ? 'स्वतंत्र मराठी साहित्य आणि बहुभाषिक प्रकाशन गृह'
                : 'Independent Literary Publishing House · Nanded & Pune'}
            </span>
          </div>

          <div className="p-7 sm:p-11 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left 7 Columns: Primary Literary Manifesto */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                variants={aboutItemSequentialVariants}
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm bg-[#243B8A]/8 border border-[#243B8A]/20 text-xs font-bold tracking-wider uppercase text-[#243B8A]"
              >
                <AnimatedTortoiseEmblem
                  className="w-6 h-6"
                  variant="indigo"
                  animate={true}
                />
                <span>
                  {lang === 'mr'
                    ? 'अकथ प्रकाशनची भूमिका · संथ आणि सखोल ग्रंथनिर्मिती'
                    : 'The Akath Imprint Manifesto · Patience Over Haste'}
                </span>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="space-y-3 border-b border-[#E6E1D6] pb-6"
              >
                <h1 className="type-page-heading text-[#252832] leading-[1.22]">
                  काही पुस्तकं वाचून संपतात. काही आपल्यासोबत राहतात.
                </h1>
                <p className="font-serif italic text-xl sm:text-2xl text-[#243B8A] font-medium">
                  Some books end at the last page. Others stay with us.
                </p>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="space-y-4 text-[16px] sm:text-[17px] text-[#252832] leading-[1.85] font-serif"
              >
                <p className="first-letter:float-left first-letter:font-serif first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:text-[#243B8A] first-letter:mr-3 first-letter:leading-none">
                  Akath Prakashan grew out of a simple feeling: there are books worth bringing into the world, and there should be people willing to take the time to do it properly.
                </p>
                <p className="text-[#525665]">
                  A manuscript is a strange, wonderful thing. Sometimes it arrives as a finished story. Sometimes it is a collection of scattered thoughts, a voice still finding its shape, or an experience that has waited years to be put into words. Before it becomes a book, it needs someone willing to read it carefully, ask the right questions, and understand what the writer is trying to say.
                </p>
                <div className="p-4 rounded-sm bg-[#F7F3E8] border-l-4 border-[#174D3A] font-semibold text-[#174D3A] text-base sm:text-lg">
                  That is the kind of work we want to do.
                </div>
                {lang === 'mr' && (
                  <p className="text-sm text-[#525665] pt-1">
                    अकथ प्रकाशन एका साध्या जाणिवेतून उभे राहिले: जगात आणण्यासारखी काही पुस्तके असतात आणि ती योग्य वेळ देऊन, निगुतीने घडवणारी माणसे असायला हवीत. हस्तलिखित ही एक अद्भुत गोष्ट आहे—पुस्तक होण्यापूर्वी त्याला काळजीपूर्वक वाचणाऱ्या, योग्य प्रश्न विचारणाऱ्या आणि लेखकाचे म्हणणे समजून घेणाऱ्या संपादकीय दृष्टीची गरज असते.
                  </p>
                )}
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="pt-2 flex flex-wrap gap-3.5"
              >
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-sm bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-sm sm:text-[15px] font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <BookOpen className="w-4 h-4 text-[#FFD966]" />
                  <span>{t.home.ctaExploreBooks}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/submit-manuscript')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-sm bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-sm sm:text-[15px] font-semibold transition-colors cursor-pointer shadow-2xs"
                >
                  <Feather className="w-4 h-4" />
                  <span>{t.nav.submitManuscript}</span>
                </button>
              </motion.div>
            </div>

            {/* Right 5 Columns: Archival Imprint Specimen & Tortoise Emblem */}
            <motion.div
              variants={aboutItemSequentialVariants}
              className="lg:col-span-5"
            >
              <div className="rounded-sm bg-[#F7F3E8]/90 border border-[#E6E1D6] p-6 sm:p-8 flex flex-col items-center text-center space-y-5">
                <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#525665] pb-3 border-b border-[#E6E1D6]">
                  <span>PLATE № 01 · AKATH SEAL</span>
                  <span className="text-[#174D3A] font-semibold">
                    नांदेड • पुणे
                  </span>
                </div>

                <TortoiseStageIllustration className="w-full max-w-[330px] h-auto" />

                <div className="w-full pt-4 border-t border-[#E6E1D6] space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-serif font-bold text-[#243B8A]">
                    <AnimatedTortoiseEmblem
                      className="w-6 h-6 shrink-0"
                      variant="cerulean"
                      animate={false}
                    />
                    <span>
                      {lang === 'mr'
                        ? 'कासव आणि उघडलेले पुस्तक — अकथ प्रकाशन मुद्रा'
                        : 'The Tortoise & Open Book — Official Akath Imprint'}
                    </span>
                  </div>
                  <p className="text-xs text-[#525665] font-serif italic leading-relaxed">
                    {lang === 'mr'
                      ? '“संथ गती, पण ठाम पावलांनी टिकणारे साहित्य घडवणे हाच आमचा धर्म.”'
                      : '“Getting somewhere slowly, thoughtfully, and with enduring craft.”'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ===================================================================
            2. TWO-COLUMN ARCHIVAL MONOGRAPH: STICKY INDEX + 5 LITERARY CHAPTERS
            =================================================================== */}
        <section
          data-testid="about-editorial-essay"
          aria-label="About Akath Prakashan Editorial Narrative"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
        >
          {/* Left 4 Columns: Sticky Monograph Chapter Index & Core Principles Ledger */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            {/* Chapter Table of Contents */}
            <div className="bg-white rounded-sm border border-[#E6E1D6] p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6E1D6]">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#243B8A]">
                  {lang === 'mr' ? 'निबंध अनुक्रमणिका' : 'Monograph Contents'}
                </span>
                <span className="font-mono text-[11px] text-[#525665]">
                  I — V
                </span>
              </div>

              <nav aria-label="About Monograph Chapters" className="space-y-2">
                {monographChapters.map((chap) => (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(chap.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="w-full text-left p-2.5 rounded-sm hover:bg-[#F7F3E8] border border-transparent hover:border-[#E6E1D6] transition-all flex items-start gap-3 group cursor-pointer"
                  >
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-sm bg-[#243B8A]/10 text-[#243B8A] group-hover:bg-[#243B8A] group-hover:text-[#FFD966] transition-colors shrink-0 mt-0.5">
                      {chap.roman}
                    </span>
                    <div className="min-w-0">
                      <p className="font-serif text-sm font-bold text-[#252832] group-hover:text-[#243B8A] transition-colors leading-snug">
                        {lang === 'mr' ? chap.titleMr : chap.titleEn}
                      </p>
                      <span className="block font-mono text-[10px] text-[#525665] mt-0.5">
                        {chap.code}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Core Editorial Principles Card */}
            <div className="bg-[#F7F3E8]/90 rounded-sm border border-[#E6E1D6] p-6 space-y-4">
              <div className="pb-3 border-b border-[#E6E1D6]">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#174D3A]">
                  {lang === 'mr' ? 'संपादकीय मूल्ये' : 'Editorial Principles'}
                </span>
                <h2 className="font-serif text-lg font-bold text-[#252832] mt-0.5">
                  {lang === 'mr'
                    ? 'अकथ प्रकाशनाची चतुःसूत्री'
                    : 'Core Editorial Principles'}
                </h2>
              </div>

              <div className="space-y-3">
                {PUBLISHER_IDENTITY.editorialPrinciples.map((principle, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-sm bg-[#FFFDF7] border border-[#E6E1D6] space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-[#FFD966]/75 text-[#252832]">
                        0{idx + 1}
                      </span>
                      <h3 className="font-serif text-sm font-bold text-[#252832]">
                        {lang === 'mr'
                          ? principle.title
                          : principle.titleEnglish || principle.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#525665] leading-relaxed pl-7">
                      {lang === 'mr'
                        ? principle.description
                        : principle.descriptionEnglish || principle.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right 8 Columns: Continuous 5-Chapter Literary Monograph */}
          <div className="lg:col-span-8 space-y-8">
            {/* Chapter 01: Independent Imprint in Nanded & Pune */}
            <motion.article
              id="about-chapter-01"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="akath-seq-step bg-white rounded-sm border border-[#E6E1D6] p-7 sm:p-10 lg:p-12 shadow-2xs"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E6E1D6]"
              >
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-sm bg-[#243B8A] text-[#FFD966]">
                  01 · IMPRINT ORIGINS
                </span>
                <span className="text-xs font-mono text-[#525665]">
                  {lang === 'mr'
                    ? 'नांदेड आणि पुणे · स्वतंत्र प्रकाशन'
                    : 'Nanded & Pune · Independent Literary House'}
                </span>
              </motion.div>

              <motion.div variants={aboutItemSequentialVariants} className="mb-5">
                <h2 className="type-section-heading text-[#252832]">
                  {lang === 'mr'
                    ? 'आवाज मोठा नसला तरी साहित्य अर्थपूर्ण असू शकते'
                    : "We don't think literature always needs to be loud to matter."}
                </h2>
                <p className="mt-1.5 text-xs font-mono text-[#174D3A]">
                  {lang === 'mr'
                    ? 'कथा · कविता · निबंध · समीक्षा · अनुवाद'
                    : 'Fiction · Poetry · Essays · Criticism · Translations'}
                </p>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="space-y-4 font-serif text-[16px] sm:text-[17px] text-[#252832] leading-[1.85]"
              >
                <p>
                  Based in Nanded and Pune, Akath Prakashan is an independent publishing house devoted to Marathi literature and writing across languages. We work with fiction, poetry, essays, criticism, and translations — not because every category needs to be represented, but because good writing can come from anywhere and speak to anyone.
                </p>
                <p className="text-[#525665]">
                  We are interested in writing that notices what others overlook. Stories that make familiar places feel different. Poems that find words for things we have felt but never quite known how to express. Essays that leave us with better questions than the ones we started with.
                </p>
                <blockquote className="p-4 rounded-sm bg-[#F7F3E8] border-l-3 border-[#243B8A] font-semibold text-[#243B8A]">
                  We don&apos;t think literature always needs to be loud to matter.
                </blockquote>
                {lang === 'mr' && (
                  <p className="text-sm text-[#525665] pt-2 border-t border-[#E6E1D6]">
                    नांदेड आणि पुणे येथून कार्यरत असलेले अकथ प्रकाशन हे मराठी साहित्याला आणि बहुभाषिक लेखनाला वाहिलेले स्वतंत्र प्रकाशन गृह आहे. इतरांच्या नजरेतून सुटणाऱ्या सूक्ष्म गोष्टी टिपणारे लेखन, परिचित जागांकडे नव्याने पाहायला लावणाऱ्या कथा आणि अधिक चांगले प्रश्न मागे ठेवणारे निबंध यांत आम्हाला रस आहे.
                  </p>
                )}
              </motion.div>
            </motion.article>

            {/* Chapter 02: The language we live in */}
            <motion.article
              id="about-chapter-02"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="akath-seq-step bg-white rounded-sm border border-[#E6E1D6] p-7 sm:p-10 lg:p-12 shadow-2xs"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E6E1D6]"
              >
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-sm bg-[#174D3A] text-[#FFFDF7]">
                  02 · LIVING LANGUAGE
                </span>
                <span className="text-xs font-mono text-[#525665]">
                  {lang === 'mr'
                    ? 'आपण ज्या भाषेत जगतो'
                    : 'Marathi, Regional Cadence & Translation'}
                </span>
              </motion.div>

              <motion.div variants={aboutItemSequentialVariants} className="mb-5">
                <h3 className="type-section-heading text-[#252832]">
                  The language we live in
                </h3>
                <p className="mt-1 font-serif text-sm text-[#174D3A] font-semibold">
                  आपण ज्या भाषेत जगतो
                </p>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="space-y-4 font-serif text-[16px] sm:text-[17px] text-[#252832] leading-[1.85]"
              >
                <p>
                  Marathi carries many worlds within it. The language of a city is not always the language of a village. The words spoken at home may be different from those found in a classroom or a book. Marathwada has its own rhythms, memories, humour, silences, and ways of looking at life.
                </p>
                <p className="font-semibold text-[#243B8A] bg-[#243B8A]/5 p-4 rounded-sm border-l-3 border-[#243B8A]">
                  We want those differences to find their way into print without being unnecessarily polished away.
                </p>
                <p className="text-[#525665]">
                  For us, publishing in Marathi is not simply about preserving a language. It is about making room for the people who speak it, the lives they lead, the questions they ask, and the worlds they are still imagining.
                </p>
                <p className="text-[#525665]">
                  We are equally curious about what happens when one language meets another — through translation, conversation, and the exchange of ideas.
                </p>
                {lang === 'mr' && (
                  <p className="text-sm text-[#525665] pt-2 border-t border-[#E6E1D6]">
                    मराठी भाषेत अनेक विश्वे सामावलेली आहेत. शहराची भाषा आणि गावाची भाषा नेहमीच एक नसते. मराठवाड्याची स्वतःची अशी लय, आठवणी, नर्मविनोद, शांतता आणि आयुष्याकडे पाहण्याची दृष्टी आहे. हे वेगळेपण अनावश्यकपणे गुळगुळीत न करता तसेच मुद्रित रूपात यावे, अशी आमची इच्छा आहे.
                  </p>
                )}
              </motion.div>
            </motion.article>

            {/* Chapter 03: Books take more than words */}
            <motion.article
              id="about-chapter-03"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="akath-seq-step bg-white rounded-sm border border-[#E6E1D6] p-7 sm:p-10 lg:p-12 shadow-2xs"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E6E1D6]"
              >
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-sm bg-[#243B8A] text-[#FFD966]">
                  03 · EDITORIAL CRAFT
                </span>
                <span className="text-xs font-mono text-[#525665]">
                  {lang === 'mr'
                    ? 'पुस्तक घडण्यासाठी केवळ शब्द पुरेसे नसतात'
                    : 'Typography, Paper, Binding & Trust'}
                </span>
              </motion.div>

              <motion.div variants={aboutItemSequentialVariants} className="mb-5">
                <h3 className="type-section-heading text-[#252832]">
                  Books take more than words
                </h3>
                <p className="mt-1 font-serif text-sm text-[#243B8A] font-semibold">
                  पुस्तक घडण्यासाठी केवळ शब्द पुरेसे नसतात
                </p>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="space-y-4 font-serif text-[16px] sm:text-[17px] text-[#252832] leading-[1.85]"
              >
                <p>
                  There is a particular kind of care that goes into making a book. The sentence that needs another look. The comma that changes the rhythm. The cover that finally feels right. The Devanagari typeface that remains comfortable after a hundred pages. The paper, the binding, the quiet satisfaction of holding a finished book for the first time.
                </p>
                <p className="italic text-[#174D3A] font-semibold bg-[#F7F3E8] p-4 rounded-sm border-l-3 border-[#174D3A]">
                  These things may go unnoticed by a reader. That is partly the point.
                </p>
                <p className="text-[#525665]">
                  We want the work behind a book to serve the writing, not compete with it. We want authors to be heard, questions to be discussed honestly, and decisions to be made with care. Publishing should be a relationship built on trust, not a transaction that ends when a manuscript is accepted.
                </p>
                <p className="text-[#525665]">
                  Not every manuscript will be right for us. But every decision deserves thought, and every author deserves clarity about the process.
                </p>
              </motion.div>
            </motion.article>

            {/* Chapter 04: A book is only the beginning */}
            <motion.article
              id="about-chapter-04"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="akath-seq-step bg-white rounded-sm border border-[#E6E1D6] p-7 sm:p-10 lg:p-12 shadow-2xs"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E6E1D6]"
              >
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-sm bg-[#F7F3E8] text-[#243B8A] border border-[#243B8A]/20">
                  04 · BEYOND THE PRESS
                </span>
                <span className="text-xs font-mono text-[#525665]">
                  पुस्तक ही केवळ सुरुवात आहे
                </span>
              </motion.div>

              <motion.div variants={aboutItemSequentialVariants} className="mb-5">
                <h3 className="type-section-heading text-[#252832]">
                  A book is only the beginning
                </h3>
                <p className="mt-1 font-serif text-sm text-[#243B8A] font-semibold">
                  पुस्तक ही केवळ सुरुवात आहे
                </p>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="space-y-4 font-serif text-[16px] sm:text-[17px] text-[#252832] leading-[1.85]"
              >
                <p>
                  We don&apos;t want our relationship with a book to end when it leaves the printing press.
                </p>
                <p className="text-[#525665]">
                  Through our bookstore and <em>Vachankatta</em>, we hope to make space for the things that grow around reading: an excerpt that makes someone curious, a review that changes their mind, an essay that sends them looking for another book, or a conversation that continues long after everyone has gone home.
                </p>
                <p className="text-[#525665]">
                  Perhaps someone will discover a writer they have never heard of. Perhaps a young reader will find a book that puts an old feeling into words. Perhaps a book published in a small room in Maharashtra will find its way to someone who needs it, somewhere far away.
                </p>
                <p className="font-medium text-[#174D3A]">
                  We cannot promise what a book will mean to every reader. We can only give it the attention, honesty, and care it deserves before letting it find its way.
                </p>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="mt-6 pt-4 border-t border-[#E6E1D6] flex items-center justify-between"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#525665]">
                  <Compass className="w-3.5 h-3.5 text-[#243B8A]" />
                  <span>{lang === 'mr' ? 'वाचनकट्टा व ग्रंथदालन' : 'Bookstore & Vachankatta'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/vachankatta')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#243B8A] hover:text-[#EF6855] transition-colors cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'वाचनकट्टा पहा' : 'Visit Vachankatta'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
              className="akath-seq-step bg-[#F7F3E8]/90 rounded-sm border border-[#174D3A]/35 p-7 sm:p-10 lg:p-12 shadow-2xs"
            >
              <motion.div
                variants={aboutItemSequentialVariants}
                className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E6E1D6]"
              >
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-sm bg-[#174D3A] text-[#FFFDF7]">
                  05 · THE COLOPHON
                </span>
                <span className="text-xs font-mono text-[#174D3A] font-semibold">
                  कासवच का?
                </span>
              </motion.div>

              <motion.div variants={aboutItemSequentialVariants} className="mb-5">
                <h3 className="type-section-heading text-[#252832]">
                  Why the tortoise?
                </h3>
                <p className="mt-1 font-serif text-sm text-[#174D3A] font-semibold">
                  कासवच का? — आमच्या बोधचिन्हामागील विचार
                </p>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="space-y-4 font-serif text-[16px] sm:text-[17px] text-[#252832] leading-[1.85]"
              >
                <p className="font-semibold text-[#174D3A]">
                  We chose a tortoise for a reason.
                </p>
                <p>
                  It isn&apos;t in a hurry. It carries its home with it. And it reminds us that getting somewhere slowly is still getting somewhere.
                </p>
                <p className="text-[#525665]">
                  Publishing has its own pressures to move faster, publish more, and follow what is already selling. We understand those realities. But we also believe there is value in pausing over a sentence, taking another look at a manuscript, and making a book we can stand behind years later.
                </p>
                <p className="text-[#525665]">
                  We would rather build a small list of books we believe in than fill a catalogue simply to make it bigger.
                </p>
                <div className="p-5 rounded-sm bg-[#FFFDF7] border-l-4 border-[#243B8A] shadow-2xs font-bold text-[#243B8A] text-base sm:text-lg">
                  Akath Prakashan is our attempt to do just that — one manuscript, one book, one reader at a time.
                </div>
              </motion.div>

              <motion.div
                variants={aboutItemSequentialVariants}
                className="mt-6 pt-4 border-t border-[#E6E1D6] flex items-center justify-between text-xs text-[#525665]"
              >
                <span>
                  {lang === 'mr'
                    ? PUBLISHER_IDENTITY.turtlePhilosophyMarathi
                    : PUBLISHER_IDENTITY.turtlePhilosophyEnglish}
                </span>
              </motion.div>
            </motion.article>
          </div>
        </section>

        {/* ===================================================================
            3. CLOSING LITERARY SIGNATURE & WALKING TORTOISE COLOPHON
            Placed after all About section text, immediately before the footer.
            =================================================================== */}
        <motion.section
          data-testid="about-closing-colophon"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          aria-label={
            lang === 'mr'
              ? 'अकथ प्रकाशन समारोप ब्रीदवाक्य आणि चालणारे कासव'
              : 'Akath Prakashan closing literary signature and walking tortoise'
          }
          className="pt-12 pb-10 sm:pt-16 sm:pb-12 border-t border-[#E6E1D6] text-center space-y-6"
        >
          <div className="max-w-2xl mx-auto space-y-2.5 px-2">
            <p className="font-serif italic text-base sm:text-lg text-[#243B8A] font-medium">
              अकथ प्रकाशन
            </p>
            <p
              data-testid="about-final-marathi-line"
              className="font-serif text-[22px] sm:text-[26px] font-bold text-[#174D3A] leading-snug tracking-normal"
            >
              “वाचत राहू. विचारत राहू. लिहित राहू.”
            </p>
            <p className="font-serif text-[15px] sm:text-[16.5px] italic text-[#525665]">
              “{PUBLISHER_IDENTITY.closingMottoEnglish}”
            </p>
          </div>

          {/* Walking Tortoise Closing Animation */}
          <WalkingTortoise className="mt-4" />
        </motion.section>
      </div>
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
