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
  const [activeFolioFilter, setActiveFolioFilter] = useState<
    'all' | 'language' | 'craft' | 'beginning' | 'tortoise'
  >('all');
  const [readingLens, setReadingLens] = useState<'bilingual' | 'marathi' | 'english'>('bilingual');
  const [activeCraftStage, setActiveCraftStage] = useState<number>(0);
  const [activeChapterId, setActiveChapterId] = useState<string>('about-manifesto-top');
  const [specimenPaper, setSpecimenPaper] = useState<'cream' | 'sepia' | 'ink'>('cream');
  const [specimenScale, setSpecimenScale] = useState<'16' | '18' | '20'>('18');
  const [selectedArchiveBookIdx, setSelectedArchiveBookIdx] = useState<number>(0);

  useAboutParagraphScrollReveal(aboutArticleRef, activeFolioFilter);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
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

  const folioFilterOptions: Array<{
    id: 'all' | 'language' | 'craft' | 'beginning' | 'tortoise';
    label: string;
  }> = [
    { id: 'all', label: lang === 'mr' ? 'सर्व प्रकरणे (All)' : 'All Folios' },
    { id: 'language', label: '01 · Language' },
    { id: 'craft', label: '02 · Craft' },
    { id: 'beginning', label: '03 · Community' },
    { id: 'tortoise', label: '04 · Tortoise' },
  ];

  const chapterRailItems = [
    {
      id: 'about-manifesto-top',
      index: 'I',
      labelMr: 'संपादकीय भूमिका',
      labelEn: 'The Manifesto',
    },
    {
      id: 'about-chapter-06',
      index: 'II',
      labelMr: 'संस्थापक व अधिष्ठान',
      labelEn: 'Founder & Imprint',
    },
    {
      id: 'about-pillars-section',
      index: 'III',
      labelMr: 'चार संपादकीय सूत्रे',
      labelEn: 'Four Folios',
    },
    {
      id: 'about-craft-anatomy',
      index: 'IV',
      labelMr: 'पुस्तकाची घडण',
      labelEn: 'Anatomy of Craft',
    },
    {
      id: 'about-colophon-end',
      index: 'V',
      labelMr: 'कासवाची पावले',
      labelEn: 'Colophon',
    },
  ];

  const craftStages = [
    {
      number: '01',
      kickerMr: 'पहिला टप्पा · संहिता निवड',
      kickerEn: 'Stage 01 · Manuscript Reading',
      titleMr: 'शांत, पूर्वग्रहमुक्त संपादकीय वाचन',
      titleEn: 'Unhurried Two-Reader Literary Evaluation',
      specCode: '6–8 Weeks Reading Window · Merit-Only Selection',
      summaryMr:
        'प्रत्येक हस्तलिखित केवळ बाजारातील मागणीवरून नव्हे, तर त्यातील भाषिक अस्सलपणा, प्रादेशिक जगण्याचे भान आणि लेखकाच्या स्वतंत्र आवाजावरून वाचले जाते.',
      summaryEn:
        'Every submission is read independently by two editors for voice, structural honesty, and regional texture—never judged by algorithmic trends or commercial formulas.',
      detailPoints: [
        lang === 'mr'
          ? 'लेखकाकडून कोणतेही प्रकाशन किंवा संपादन शुल्क घेतले जात नाही.'
          : 'Zero author fees or vanity publishing charges—100% house-funded stewardship.',
        lang === 'mr'
          ? 'प्रत्येक निवडलेल्या संहितेवर सविस्तर संपादकीय टिपण दिले जाते.'
          : 'Detailed editorial notes and structural feedback shared directly with the author.',
      ],
      ctaLabel: lang === 'mr' ? 'संहिता पाठवा' : 'Submit a Manuscript',
      ctaPath: '/submit-manuscript',
    },
    {
      number: '02',
      kickerMr: 'दुसरा टप्पा · संहिता संवाद',
      kickerEn: 'Stage 02 · Editorial Dialogue',
      titleMr: 'मूळ बोली आणि लय न मोडता संपादन',
      titleEn: 'Line Editing That Preserves Regional Voice',
      specCode: 'Marathwada & Regional Cadence Fidelity',
      summaryMr:
        'मराठवाडा आणि महाराष्ट्रातील विविध बोलींचा गोडवा, घरगुती शब्दांची लय आणि संवादांतील जिवंतपणा प्रमाणभाषेच्या साच्यात न बसवता जपला जातो.',
      summaryEn:
        'We edit to sharpen clarity without sanding down the distinct cadence of Marathwada and regional Marathi speech, preserving the vernacular music of the manuscript.',
      detailPoints: [
        lang === 'mr'
          ? 'लेखक आणि संपादक यांच्यात प्रत्येक प्रकरणावर थेट संवाद.'
          : 'Collaborative chapter-by-chapter dialogue between author and editor.',
        lang === 'mr'
          ? 'अनुवादित साहित्यासाठी मूळ भाषेच्या सांस्कृतिक संदर्भांची जपणूक.'
          : 'Cross-lingual sensitivity for translations entering Marathi literary discourse.',
      ],
      ctaLabel: lang === 'mr' ? 'आमचे लेखक पहा' : 'Meet Our Authors',
      ctaPath: '/authors',
    },
    {
      number: '03',
      kickerMr: 'तिसरा टप्पा · मुद्रण व रूपबंध',
      kickerEn: 'Stage 03 · Typography & Materiality',
      titleMr: 'दीर्घ वाचनासाठी सुकर देवनागरी मुद्रणकला',
      titleEn: 'Archival Paper & Eye-Restful Devanagari Type',
      specCode: '60–65ch Measure · 80 GSM Natural Shade Cream Stock',
      summaryMr:
        'शंभर पानांनंतरही डोळ्यांना थकवा येऊ नये अशी देवनागरी अक्षरजुळणी, पुरेसा समास (margins), टिकाऊ बांधणी आणि आशयाला समर्पक मुखपृष्ठ कला.',
      summaryEn:
        'Generous page margins, optical Devanagari line-height (1.78–1.85), natural-shade archival paper, and bespoke cover compositions crafted for decades on the shelf.',
      detailPoints: [
        lang === 'mr'
          ? 'प्रत्येक पुस्तकासाठी स्वतंत्र मुखपृष्ठ संकल्पना आणि मुद्रण पूर्वतपासणी.'
          : 'Bespoke cover art direction and multi-pass Devanagari proof verification.',
        lang === 'mr'
          ? 'संपूर्ण भारतात ट्रॅक केलेल्या बुक-पोस्टने सुरक्षित घरपोच वितरण.'
          : 'Protective book-post packaging dispatched directly from Nanded across India.',
      ],
      ctaLabel: lang === 'mr' ? 'प्रकाशित पुस्तके पहा' : 'Explore Published Editions',
      ctaPath: '/books',
    },
    {
      number: '04',
      kickerMr: 'चौथा टप्पा · वाचनकट्टा आणि संवाद',
      kickerEn: 'Stage 04 · Living Literary Commons',
      titleMr: 'छपाईनंतर सुरू होणारा दीर्घकालीन वाचक संवाद',
      titleEn: 'First-Page Excerpts, Critical Essays & Reader Circles',
      specCode: '6-Page Public Previews · Vachankatta Journal',
      summaryMr:
        'पुस्तक छापून आल्यानंतर आमचे काम संपत नाही; "पहिलं पान" मधील ६ पृष्ठांचे उतारे आणि "वाचनकट्टा" वरील समीक्षेमधून पुस्तक वाचकांच्या चर्चेत जिवंत राहते.',
      summaryEn:
        'Every edition is accompanied by a 6-page public reading excerpt on First Page and long-form essays on Vachankatta so books spark enduring dialogue.',
      detailPoints: [
        lang === 'mr'
          ? 'पुस्तक खरेदीपूर्वी ६ पृष्ठे शांतपणे वाचण्याची खुली सुविधा.'
          : 'Read 6 full pages online before ordering via our First Page room.',
        lang === 'mr'
          ? 'वाचक, समीक्षक आणि लेखकांचे दीर्घ वैचारिक लेख.'
          : 'Curated critical essays, author interviews, and thematic reading lists.',
      ],
      ctaLabel: lang === 'mr' ? 'पहिलं पान उतारे वाचा' : 'Read First Page Excerpts',
      ctaPath: '/vachankatta/first-page',
    },
  ];

  const currentCraft = craftStages[activeCraftStage] || craftStages[0];

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

          {/* Two-Column Asymmetric Reading Canvas (Pattern D: 70% Essay / 30% Margin Notes) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left 8 Columns: 65ch Reading Column */}
            <div className="lg:col-span-8">
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

                      {/* Editorial Pull Quote — Hairline Top/Bottom Framing (No Left Bar) */}
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

            {/* Right 4 Columns: Curatorial Margin Notes & Archival Figures */}
            <aside
              aria-label="Curatorial Margin Notes"
              className="lg:col-span-4 lg:border-l lg:border-[#DCD4C0] lg:pl-8 space-y-8"
            >
              {/* Fig. 01 — Imprint Seal & Tortoise Emblem */}
              <div className="bg-white border border-[#DCD4C0] p-6 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#57534E] border-b border-[#E6DFCE] pb-2.5">
                  <span>FIG. 01 · IMPRINT SEAL</span>
                  <span>ACC. AK-2025-ND</span>
                </div>

                <div className="py-4 flex flex-col items-center justify-center bg-[#FBF9F5] border border-[#E6DFCE]">
                  <AnimatedTortoiseEmblem className="w-24 h-24" />
                  <p className="mt-2 font-serif text-[13px] text-[#174D3A] font-medium">
                    संथ पावले · दीर्घकालीन साहित्य
                  </p>
                </div>

                <p className="text-[12.5px] font-editorial-prose text-[#57534E] italic leading-relaxed">
                  Fig. 1 — The Akath Tortoise colophon mark: carrying its home quietly, choosing permanence over haste.
                </p>
              </div>

              {/* Fig. 02 — Literary Geography Marginalia */}
              <div className="border-t border-[#DCD4C0] pt-5 space-y-2.5">
                <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#243B8A]">
                  Marginalia 01 · साहित्यिक भूगोल
                </p>
                <h3 className="font-editorial-display text-[19px] font-bold text-[#1C1917]">
                  Why Nanded &amp; Marathwada?
                </h3>
                <p className="text-[14px] font-editorial-prose text-[#57534E] leading-relaxed">
                  Great literary publishing does not belong solely to metropolitan capitals. Rooted in Nanded, we publish voices from across Maharashtra whose lived idioms enrich contemporary Marathi prose and poetry.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/authors')}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#243B8A] hover:underline pt-1 cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'लेखक परिचय दालन पहा' : 'Explore Published Authors'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Fig. 03 — Open Reading Room Marginalia */}
              <div className="border-t border-[#DCD4C0] pt-5 space-y-2.5">
                <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#174D3A]">
                  Marginalia 02 · खुली वाचन संस्कृती
                </p>
                <h3 className="font-editorial-display text-[19px] font-bold text-[#1C1917]">
                  Read Before You Collect
                </h3>
                <p className="text-[14px] font-editorial-prose text-[#57534E] leading-relaxed">
                  Through our <em>First Page (पहिलं पान)</em> archive, readers can read a curated 6-page opening excerpt of every book before ordering the physical edition.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/vachankatta/first-page')}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#174D3A] hover:underline pt-1 cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'पहिलं पान उतारे वाचा' : 'Enter First Page Reading Room'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </aside>
          </div>
        </div>

        {/* =================================================================
            SECTION 2: MUSEUM ACCESSION LEDGER & FOUNDER STEWARDSHIP DESK
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
          className="akath-seq-step akath-about-io-block scroll-mt-28 bg-white border border-[#DCD4C0] p-6 sm:p-10 lg:p-12 space-y-10"
        >
          <motion.div variants={aboutItemSequentialVariants} className="space-y-8">
            {/* Top Accession Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#DCD4C0] text-[11px] font-mono text-[#57534E]">
              <span className="uppercase tracking-[0.18em] text-[#243B8A] font-semibold">
                Chapter II · Imprint Stewardship &amp; Accession Record
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

            {/* Bottom 4-Column Imprint Charter Strip */}
            <div className="pt-6 border-t border-[#DCD4C0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#243B8A] font-semibold">
                  01 · संहिता निवड
                </p>
                <p className="mt-1 font-editorial-display text-[17px] font-bold text-[#1C1917]">
                  Merit-Only Curation
                </p>
                <p className="mt-1 text-[13px] text-[#57534E] leading-relaxed">
                  Selected solely on literary craft and voice; zero author subventions.
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#243B8A] font-semibold">
                  02 · भाषिक भान
                </p>
                <p className="mt-1 font-editorial-display text-[17px] font-bold text-[#1C1917]">
                  Vernacular Honesty
                </p>
                <p className="mt-1 text-[13px] text-[#57534E] leading-relaxed">
                  Honoring regional rhythms, dialects, and lived Marathi idioms.
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#243B8A] font-semibold">
                  03 · पारदर्शक व्यवहार
                </p>
                <p className="mt-1 font-editorial-display text-[17px] font-bold text-[#1C1917]">
                  Clear Author Royalties
                </p>
                <p className="mt-1 text-[13px] text-[#57534E] leading-relaxed">
                  Honest contracts, clear timelines, and long-term edition availability.
                </p>
              </div>

              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#174D3A] font-semibold">
                  04 · वाचक संवाद
                </p>
                <p className="mt-1 font-editorial-display text-[17px] font-bold text-[#1C1917]">
                  Vachankatta &amp; Excerpts
                </p>
                <p className="mt-1 text-[13px] text-[#57534E] leading-relaxed">
                  Keeping books alive in critical essays and public reading rooms.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* =================================================================
            SECTION 3: FOUR EDITORIAL FOLIOS — ARCHITECTURAL HAIRLINE MATRIX
            ================================================================= */}
        <div
          id="about-pillars-section"
          className="scroll-mt-28 space-y-8"
        >
          <div
            data-about-io-block="folio-header"
            className="akath-about-io-block flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1C1917] pb-5"
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#243B8A] font-semibold">
                Chapter III · Editorial Philosophy · चार संपादकीय सूत्रे
              </p>
              <h2 className="font-editorial-display text-[28px] sm:text-[36px] font-bold text-[#1C1917] leading-tight">
                Our Approach to Publishing
              </h2>
            </div>

            {/* Interactive Chapter Filter Tabs */}
            <div
              data-testid="about-folio-filter-bar"
              role="tablist"
              aria-label="Filter About Chapters"
              className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar max-w-full"
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
                    className={`px-3 py-1.5 text-[11.5px] font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer rounded-sm border ${
                      isActive
                        ? 'bg-[#243B8A] border-[#243B8A] text-[#FBF9F5] font-semibold'
                        : 'bg-white border-[#DCD4C0] text-[#57534E] hover:text-[#1C1917]'
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
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
          >
            {/* Folio 01: The language we live in */}
            <motion.section
              id="about-chapter-02"
              data-about-io-block="folio-01"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              style={{ '--io-block-delay': '0ms' } as React.CSSProperties}
              className={`akath-seq-step akath-about-io-block bg-white border border-[#DCD4C0] p-6 sm:p-9 flex flex-col justify-between space-y-6 transition-opacity ${
                activeFolioFilter !== 'all' && activeFolioFilter !== 'language'
                  ? 'hidden md:block md:opacity-45'
                  : 'block opacity-100'
              }`}
            >
              <div className="space-y-5">
                <div className="space-y-2 border-b border-[#E6DFCE] pb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#243B8A]">
                    <span className="uppercase tracking-[0.16em] font-semibold">
                      FOLIO I · 01 · भाषा आणि परिसर
                    </span>
                    <span className="text-[#78716C]">मराठवाडा व बहुभाषिक संवेदनशीलता</span>
                  </div>
                  <h3 className="akath-about-headline-breathe font-editorial-display text-[24px] sm:text-[28px] font-bold text-[#1C1917] leading-snug">
                    The language we live in
                  </h3>
                  <p className="font-serif text-[14.5px] text-[#174D3A] font-medium">
                    बोलीभाषेचा जिवंतपणा आणि जगण्यातून आलेली मराठी अधिक अस्सल असते.
                  </p>
                </div>

                <div
                  data-testid="about-prose-breathe-block"
                  style={{ '--breathe-phase': '1.2s' } as React.CSSProperties}
                  className="akath-about-prose-breathe space-y-3.5 font-editorial-prose text-[15.5px] text-[#292524] leading-[1.8]"
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
                    className="akath-about-io-para text-[#57534E]"
                  >
                    We are equally curious about what happens when one language meets another — through translation, conversation, and the exchange of ideas.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6DFCE] flex items-center justify-between text-[12.5px]">
                <span className="font-mono text-[11px] text-[#78716C]">
                  Ref. 01 / Linguistic Pluralism
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/authors')}
                  className="font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'आमचे लेखक पहा' : 'View Published Voices'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.section>

            {/* Folio 02: Books take more than words */}
            <motion.section
              id="about-chapter-03"
              data-about-io-block="folio-02"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              style={{ '--io-block-delay': '60ms' } as React.CSSProperties}
              className={`akath-seq-step akath-about-io-block bg-white border border-[#DCD4C0] p-6 sm:p-9 flex flex-col justify-between space-y-6 transition-opacity ${
                activeFolioFilter !== 'all' && activeFolioFilter !== 'craft'
                  ? 'hidden md:block md:opacity-45'
                  : 'block opacity-100'
              }`}
            >
              <div className="space-y-5">
                <div className="space-y-2 border-b border-[#E6DFCE] pb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#243B8A]">
                    <span className="uppercase tracking-[0.16em] font-semibold">
                      FOLIO II · 02 · मुद्रण आणि संपादन
                    </span>
                    <span className="text-[#78716C]">संपादकीय विश्वास व कारागिरी</span>
                  </div>
                  <h3 className="akath-about-headline-breathe font-editorial-display text-[24px] sm:text-[28px] font-bold text-[#1C1917] leading-snug">
                    Books take more than words
                  </h3>
                  <p className="font-serif text-[14.5px] text-[#174D3A] font-medium">
                    वाक्यरचना, देवनागरी टाइपोग्राफी, कागद आणि बांधणी यांतून पुस्तकाचे आयुष्य ठरते.
                  </p>
                </div>

                <div
                  data-testid="about-prose-breathe-block"
                  style={{ '--breathe-phase': '2.1s' } as React.CSSProperties}
                  className="akath-about-prose-breathe space-y-3.5 font-editorial-prose text-[15.5px] text-[#292524] leading-[1.8]"
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
                    className="akath-about-io-para text-[#57534E]"
                  >
                    Not every manuscript will be right for us. But every decision deserves thought, and every author deserves clarity about the process.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6DFCE] flex items-center justify-between text-[12.5px]">
                <span className="font-mono text-[11px] text-[#78716C]">
                  Ref. 02 / Editorial Craftsmanship
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/submit-manuscript')}
                  className="font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'प्रकाशन प्रक्रिया व संहिता' : 'Manuscript Desk'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.section>

            {/* Folio 03: A book is only the beginning */}
            <motion.section
              id="about-chapter-04"
              data-about-io-block="folio-03"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              style={{ '--io-block-delay': '0ms' } as React.CSSProperties}
              className={`akath-seq-step akath-about-io-block bg-white border border-[#DCD4C0] p-6 sm:p-9 flex flex-col justify-between space-y-6 transition-opacity ${
                activeFolioFilter !== 'all' && activeFolioFilter !== 'beginning'
                  ? 'hidden md:block md:opacity-45'
                  : 'block opacity-100'
              }`}
            >
              <div className="space-y-5">
                <div className="space-y-2 border-b border-[#E6DFCE] pb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#243B8A]">
                    <span className="uppercase tracking-[0.16em] font-semibold">
                      FOLIO III · 03 · वाचनकट्टा आणि संवाद
                    </span>
                    <span className="text-[#78716C]">वाचक, समीक्षा आणि सहवास</span>
                  </div>
                  <h3 className="akath-about-headline-breathe font-editorial-display text-[24px] sm:text-[28px] font-bold text-[#1C1917] leading-snug">
                    A book is only the beginning
                  </h3>
                  <p className="font-serif text-[14.5px] text-[#174D3A] font-medium">
                    छपाईनंतर वाचनकट्ट्यावरील लेख, उतारे आणि चर्चांमधून पुस्तकाचा खरा प्रवास सुरू होतो.
                  </p>
                </div>

                <div
                  data-testid="about-prose-breathe-block"
                  style={{ '--breathe-phase': '2.9s' } as React.CSSProperties}
                  className="akath-about-prose-breathe space-y-3.5 font-editorial-prose text-[15.5px] text-[#292524] leading-[1.8]"
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
                    className="akath-about-io-para text-[#57534E]"
                  >
                    We cannot promise what a book will mean to every reader. We can only give it the attention, honesty, and care it deserves before letting it find its way.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6DFCE] flex items-center justify-between text-[12.5px]">
                <span className="font-mono text-[11px] text-[#78716C]">
                  Ref. 03 / Vachankatta Literary Forum
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/vachankatta')}
                  className="font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'वाचनकट्टा लेख वाचा' : 'Visit Vachankatta'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.section>

            {/* Folio 04: Why the tortoise? */}
            <motion.section
              id="about-chapter-05"
              data-about-io-block="folio-04"
              variants={aboutSectionSequentialVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.04 }}
              style={{ '--io-block-delay': '60ms' } as React.CSSProperties}
              className={`akath-seq-step akath-about-io-block bg-white border border-[#DCD4C0] p-6 sm:p-9 flex flex-col justify-between space-y-6 transition-opacity ${
                activeFolioFilter !== 'all' && activeFolioFilter !== 'tortoise'
                  ? 'hidden md:block md:opacity-45'
                  : 'block opacity-100'
              }`}
            >
              <div className="space-y-5">
                <div className="space-y-2 border-b border-[#E6DFCE] pb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#174D3A]">
                    <span className="uppercase tracking-[0.16em] font-semibold">
                      FOLIO IV · 04 · कासवाची संथ पावले
                    </span>
                    <span className="text-[#78716C]">संथ गती आणि चिरंतन मूल्य</span>
                  </div>
                  <h3 className="akath-about-headline-breathe font-editorial-display text-[24px] sm:text-[28px] font-bold text-[#1C1917] leading-snug">
                    Why the tortoise?
                  </h3>
                  <p className="font-serif text-[14.5px] text-[#174D3A] font-medium">
                    संख्येने अधिक पुस्तके छापण्यापेक्षा, वर्षानुवर्षे टिकणारी मोजकीच पुस्तके घडवण्याचा आमचा आग्रह आहे.
                  </p>
                </div>

                <div
                  data-testid="about-prose-breathe-block"
                  style={{ '--breathe-phase': '3.7s' } as React.CSSProperties}
                  className="akath-about-prose-breathe space-y-3.5 font-editorial-prose text-[15.5px] text-[#292524] leading-[1.8]"
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
                    className="akath-about-io-para font-semibold text-[#174D3A]"
                  >
                    Akath Prakashan is our attempt to do just that — one manuscript, one book, one reader at a time.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6DFCE] flex items-center justify-between text-[12.5px]">
                <span className="font-mono text-[11px] text-[#78716C]">
                  Ref. 04 / Slow Publishing Ethos
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="font-semibold text-[#174D3A] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'mr' ? 'निवडक ग्रंथसूची पहा' : 'Browse Our Curated List'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.section>
          </div>
        </div>

        {/* =================================================================
            SECTION 4: INTERACTIVE ANATOMY OF AN AKATH EDITION
            (4-Stage Curatorial Craft & Materiality Inspector)
            ================================================================= */}
        <section
          id="about-craft-anatomy"
          aria-label="Anatomy of an Akath Edition"
          className="scroll-mt-28 bg-[#F4EFE4] border border-[#DCD4C0] p-6 sm:p-10 lg:p-12 space-y-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#DCD4C0] pb-6">
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#174D3A] font-semibold">
                Chapter IV · Materiality &amp; Editorial Process · पुस्तकाची घडण
              </p>
              <h2 className="font-editorial-display text-[26px] sm:text-[34px] font-bold text-[#1C1917] leading-tight">
                {lang === 'mr'
                  ? 'हस्तलिखितापासून वाचकाच्या हातातील पुस्तकापर्यंत'
                  : 'The Anatomy of an Akath Edition'}
              </h2>
            </div>

            <p className="text-[14px] font-editorial-prose text-[#57534E] max-w-[48ch]">
              {lang === 'mr'
                ? 'प्रत्येक संहिता खालील चार संपादकीय व मुद्रण टप्प्यांमधून शांतपणे आणि बारकाईने घडवली जाते.'
                : 'Select any stage below to inspect how manuscripts are evaluated, edited, typeset in Devanagari, and brought into reader conversation.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left 5 Columns: Interactive Stage Selector Rail */}
            <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-[#DCD4C0] border border-[#DCD4C0] bg-[#FBF9F5]">
              {craftStages.map((stage, idx) => {
                const isSelected = activeCraftStage === idx;
                return (
                  <button
                    key={stage.number}
                    type="button"
                    onClick={() => setActiveCraftStage(idx)}
                    className={`w-full text-left p-5 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#243B8A] text-[#FBF9F5]'
                        : 'bg-[#FBF9F5] text-[#1C1917] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    <div className="space-y-1">
                      <p
                        className={`text-[11px] font-mono uppercase tracking-[0.14em] ${
                          isSelected ? 'text-[#FFD966]' : 'text-[#57534E]'
                        }`}
                      >
                        {lang === 'mr' ? stage.kickerMr : stage.kickerEn}
                      </p>
                      <h3 className="font-editorial-display text-[18px] sm:text-[20px] font-bold leading-snug">
                        {lang === 'mr' ? stage.titleMr : stage.titleEn}
                      </h3>
                    </div>
                    <span
                      className={`font-mono text-[13px] tabular-nums shrink-0 mt-0.5 ${
                        isSelected ? 'text-[#FFD966] font-bold' : 'text-[#78716C]'
                      }`}
                    >
                      {stage.number} →
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right 7 Columns: Selected Stage Curatorial Specification Sheet */}
            <div className="lg:col-span-7 bg-white border border-[#DCD4C0] p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E6DFCE]">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#243B8A] font-semibold">
                    {lang === 'mr' ? currentCraft.kickerMr : currentCraft.kickerEn}
                  </span>
                  <span className="font-mono text-[11.5px] text-[#174D3A]">
                    {currentCraft.specCode}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-editorial-display text-[24px] sm:text-[28px] font-bold text-[#1C1917] leading-snug">
                    {currentCraft.titleMr}
                  </h3>
                  <p className="font-editorial-display italic text-[17px] text-[#57534E]">
                    {currentCraft.titleEn}
                  </p>
                </div>

                <p className="font-serif text-[16px] text-[#1C1917] leading-[1.82]">
                  {currentCraft.summaryMr}
                </p>

                <p className="font-editorial-prose text-[15px] text-[#57534E] leading-[1.78]">
                  {currentCraft.summaryEn}
                </p>

                <div className="pt-2 space-y-2.5 border-t border-[#E6DFCE]">
                  {currentCraft.detailPoints.map((pt, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-[14px] font-editorial-prose text-[#292524]"
                    >
                      <Check className="w-4 h-4 text-[#174D3A] shrink-0 mt-1" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-[#DCD4C0] flex flex-wrap items-center justify-between gap-4">
                <span className="font-mono text-[11px] text-[#78716C] tabular-nums">
                  STAGE {currentCraft.number} OF 04 · AKATH EDITORIAL STANDARD
                </span>

                <button
                  type="button"
                  onClick={() => onNavigate(currentCraft.ctaPath)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] hover:bg-[#243B8A] text-[#FBF9F5] text-[13px] font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{currentCraft.ctaLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Devanagari Type & Paper Specimen */}
          <div
            data-testid="about-type-paper-specimen"
            className="pt-8 border-t border-[#DCD4C0] space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#243B8A] font-semibold">
                  Interactive Print Specimen · देवनागरी अक्षरजुळणी आणि कागद चाचणी
                </p>
                <h3 className="font-editorial-display text-[20px] sm:text-[23px] font-bold text-[#1C1917]">
                  {lang === 'mr'
                    ? 'अकथ प्रकाशनाची देवनागरी मुद्रण संवेदनशीलता अनुभवा'
                    : 'Test Our Devanagari Typesetting & Paper Stock'}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Paper Stock Selector */}
                <div className="inline-flex items-center gap-1 p-1 bg-[#FBF9F5] border border-[#DCD4C0] rounded-sm">
                  {(
                    [
                      { id: 'cream', label: '80 GSM Cream' },
                      { id: 'sepia', label: 'Archival Sepia' },
                      { id: 'ink', label: 'Night Ink' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSpecimenPaper(p.id)}
                      className={`px-2.5 py-1 text-[11px] font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer rounded-sm ${
                        specimenPaper === p.id
                          ? 'bg-[#243B8A] text-[#FBF9F5] font-semibold'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Type Scale Selector */}
                <div className="inline-flex items-center gap-1 p-1 bg-[#FBF9F5] border border-[#DCD4C0] rounded-sm">
                  {(
                    [
                      { id: '16', label: '16px · LH 1.75' },
                      { id: '18', label: '18px · LH 1.85' },
                      { id: '20', label: '20px · LH 1.92' },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSpecimenScale(s.id)}
                      className={`px-2.5 py-1 text-[11px] font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer rounded-sm ${
                        specimenScale === s.id
                          ? 'bg-[#174D3A] text-[#FBF9F5] font-semibold'
                          : 'text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`p-6 sm:p-8 lg:p-10 border transition-colors duration-200 ${
                specimenPaper === 'ink'
                  ? 'bg-[#18181B] text-[#F4EFE4] border-[#27272A]'
                  : specimenPaper === 'sepia'
                  ? 'bg-[#F3EAD8] text-[#1C1917] border-[#D6C7AE]'
                  : 'bg-[#FBF9F5] text-[#1C1917] border-[#DCD4C0]'
              }`}
            >
              <div className="max-w-[65ch] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono opacity-75 border-b border-current/15 pb-2.5">
                  <span>SPECIMEN FOLIO · NOTO SERIF DEVANAGARI · 65CH MEASURE</span>
                  <span className="tabular-nums">
                    {specimenScale}PX /{' '}
                    {specimenScale === '16'
                      ? '1.75'
                      : specimenScale === '18'
                      ? '1.85'
                      : '1.92'}{' '}
                    LEADING
                  </span>
                </div>
                <p
                  className={`font-serif transition-all duration-200 ${
                    specimenScale === '16'
                      ? 'text-[16px] leading-[1.75]'
                      : specimenScale === '18'
                      ? 'text-[18px] leading-[1.85]'
                      : 'text-[20px] leading-[1.92]'
                  }`}
                >
                  काही वाक्ये वाचताना आपल्याला थांबावेसे वाटते. पानावरचा मोकळा अवकाश, दोन ओळींमधील शांत अंतर आणि डोळ्यांना न बोचणारा कागदाचा उबदार रंग यांमुळे वाचक आणि लेखकाच्या शब्दांमध्ये कोणतीही भिंत उरत नाही.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            SECTION 4B: INTERACTIVE IMPRINT CATALOGUE ARCHIVE
            ("Why We Published This Edition" Curatorial Notes)
            ================================================================= */}
        <section
          aria-label="Published Editions Curatorial Archive"
          className="bg-white border border-[#DCD4C0] p-6 sm:p-10 lg:p-12 space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DCD4C0] pb-5">
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#243B8A] font-semibold">
                Curatorial Archive · संपादकीय निवड आणि प्रकाशित पुस्तके
              </p>
              <h2 className="font-editorial-display text-[26px] sm:text-[32px] font-bold text-[#1C1917]">
                {lang === 'mr'
                  ? 'आम्ही ही पुस्तके का प्रकाशित केली?'
                  : 'Why We Published These Editions'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { title: '०१ · स्कॉलर ज्यूस', slug: 'scholar-juice' },
                { title: '०२ · धुक्याची दुलई', slug: 'dhukyachi-dulai' },
                {
                  title: '०३ · लोकशाहीमध्ये समाजमाध्यमांचा वापर',
                  slug: 'lokshahimadhye-samajmadhyamancha-vapar',
                },
              ].map((bk, idx) => (
                <button
                  key={bk.slug}
                  type="button"
                  onClick={() => setSelectedArchiveBookIdx(idx)}
                  className={`px-3.5 py-1.5 text-[12px] font-serif whitespace-nowrap shrink-0 transition-colors cursor-pointer rounded-sm border ${
                    selectedArchiveBookIdx === idx
                      ? 'bg-[#1C1917] border-[#1C1917] text-[#FBF9F5] font-semibold'
                      : 'bg-[#FBF9F5] border-[#DCD4C0] text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  {bk.title}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const archiveEditions = [
              {
                accession: 'AK-ED-001 · दीर्घकथा संग्रह (Long Stories)',
                title: 'स्कॉलर ज्यूस (Scholar Juice)',
                author: 'जी. के. ऐनापुरे (G. K. Ainapure)',
                slug: 'scholar-juice',
                specs: 'Paperback · ₹549 · 6-Page Excerpt Available',
                whyMr:
                  'समकालीन शहरी आणि निमशहरी जगण्यातील सूक्ष्म तणाव, मानवी नात्यांचे अनपेक्षित कंगोरे आणि दीर्घकथेचा सशक्त आकृतिबंध यांमुळे "स्कॉलर ज्यूस" ही संहिता मराठी कथाविश्वात वेगळी ठरते.',
                whyEn:
                  'Selected for its commanding mastery of the Marathi long-story form—unflinching psychological depth, layered urban-regional idioms, and characters that linger long after the final page.',
              },
              {
                accession: 'AK-ED-002 · प्रवासवर्णन (Literary Travelogue)',
                title: 'धुक्याची दुलई — भूतान प्रवासवर्णन',
                author: 'अनुरत्न वाघमारे (Anuratna Waghmare)',
                slug: 'dhukyachi-dulai',
                specs: 'Paperback · ₹250 · Illustrated Cultural Monograph',
                whyMr:
                  'केवळ पर्यटनस्थळांची माहिती न देता, भूतानच्या शांत बौद्ध संस्कृतीचा, निसर्गाचा आणि मानवी समाधानाचा संवेदनशील वेध घेणारे हे प्रवासवर्णन मराठी वाचकाला अंतर्मुख करते.',
                whyEn:
                  'Chosen because it transcends tourist reportage—offering a meditative, lyrical Marathi encounter with Bhutan’s monastic silences, ecology, and philosophy of Gross National Happiness.',
              },
              {
                accession: 'AK-ED-003 · वैचारिक व माध्यम अभ्यास (Media & Democracy)',
                title: 'लोकशाहीमध्ये समाजमाध्यमांचा वापर',
                author: 'आखिलेश पंडित येलकदरे (Akhilesh Pandit Yelkadre)',
                slug: 'lokshahimadhye-samajmadhyamancha-vapar',
                specs: 'Paperback · ₹220 · Contemporary Civic Essay',
                whyMr:
                  'डिजिटल युगात लोकशाही, जनमत आणि समाजमाध्यमे यांच्यातील गुंतागुंतीचा संबंध मराठीतून अभ्यासपूर्ण आणि परखडपणे मांडणारे हे महत्त्वाचे वैचारिक पुस्तक आहे.',
                whyEn:
                  'Published to bring rigorous, accessible Marathi scholarship to urgent contemporary questions of algorithmic public spheres, misinformation, and democratic citizenship.',
              },
            ];
            const ed = archiveEditions[selectedArchiveBookIdx] || archiveEditions[0];
            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FBF9F5] border border-[#E6DFCE] p-6 sm:p-8">
                <div className="lg:col-span-8 space-y-3.5">
                  <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#174D3A] font-semibold">
                    {ed.accession}
                  </p>
                  <h3 className="font-editorial-display text-[24px] sm:text-[28px] font-bold text-[#1C1917]">
                    {ed.title}
                  </h3>
                  <p className="font-serif text-[16px] text-[#243B8A] font-semibold">
                    लेखक: {ed.author} · <span className="font-mono text-[13px] text-[#57534E] font-normal">{ed.specs}</span>
                  </p>
                  <p className="font-serif text-[16px] text-[#1C1917] leading-[1.82]">
                    {ed.whyMr}
                  </p>
                  <p className="font-editorial-prose text-[14.5px] text-[#57534E] leading-[1.75]">
                    {ed.whyEn}
                  </p>
                </div>

                <div className="lg:col-span-4 lg:border-l lg:border-[#DCD4C0] lg:pl-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/books/${ed.slug}`)}
                    className="w-full px-5 py-3 bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FBF9F5] text-[13.5px] font-semibold rounded-sm transition-colors cursor-pointer inline-flex items-center justify-between"
                  >
                    <span>{lang === 'mr' ? 'पुस्तक तपशील आणि खरेदी' : 'Inspect Edition & Order'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/vachankatta/first-page')}
                    className="w-full px-5 py-3 bg-white hover:bg-[#F2ECE1] text-[#1C1917] border border-[#DCD4C0] text-[13.5px] font-semibold rounded-sm transition-colors cursor-pointer inline-flex items-center justify-between"
                  >
                    <span>{lang === 'mr' ? 'पहिलं पान उतारा वाचा' : 'Read Opening Excerpt'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </section>

        {/* =================================================================
            SECTION 5: CLOSING MOTTO, PATIENT TORTOISE TRAVERSE & PATHWAYS
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
              Chapter V · Imprint Colophon &amp; Motto
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
                className="font-editorial-display italic text-[24px] sm:text-[30px] font-bold text-[#174D3A] leading-snug"
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

