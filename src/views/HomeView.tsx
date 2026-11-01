import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  BookOpen,
  Feather,
  Sparkles,
  Check,
  FileText,
  ShoppingBag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookRecord,
  AuthorRecord,
  EditorialArticle,
  FirstPageExcerpt,
} from '../types/publishing';
import { PUBLISHER_IDENTITY } from '../data/seedData';
import { BookCard } from '../components/BookCard';
import { BookCoverArt } from '../components/BookCoverArt';
import { AnimatedTortoiseEmblem } from '../components/SarvamIllustrations';
import { SixEditorialStages } from '../components/SixEditorialStages';
import { useLanguage } from '../i18n/translations';

/**
 * Custom IntersectionObserver hook for scroll-driven minimalist section fade-in reveals
 */
function useIntersectionReveal<T extends HTMLElement>(
  options: IntersectionObserverInit = {
    threshold: 0.12,
    rootMargin: '0px 0px -32px 0px',
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

export const HomeView: React.FC<HomeViewProps> = ({
  books,
  authors,
  onNavigate,
  onAddToCart,
  recentlyAddedBookId,
}) => {
  const { lang, t } = useLanguage();
  const [activeBookCategory, setActiveBookCategory] = useState<string>('सर्व');
  const [featuredBookIndex, setFeaturedBookIndex] = useState<number>(0);

  const [heroSectionRef, isHeroVisible] = useIntersectionReveal<HTMLElement>({
    threshold: 0.08,
    rootMargin: '0px 0px -16px 0px',
  });
  const [deskSectionRef, isDeskVisible] = useIntersectionReveal<HTMLElement>({
    threshold: 0.14,
    rootMargin: '0px 0px -32px 0px',
  });
  const [stagesWrapperRef, isStagesVisible] = useIntersectionReveal<HTMLDivElement>({
    threshold: 0.12,
    rootMargin: '0px 0px -32px 0px',
  });
  const [catalogSectionRef, isCatalogVisible] = useIntersectionReveal<HTMLElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -32px 0px',
  });

  const featuredBooks = books.filter((b) => b.isFeatured);
  const spotlightBooks = featuredBooks.length > 0 ? featuredBooks : books.slice(0, 3);
  const activeHeroBook = spotlightBooks[featuredBookIndex] || books[0];
  const activeHeroAuthor = activeHeroBook
    ? authors.find((a) => a.id === activeHeroBook.authorId)
    : undefined;

  const categories = [
    'सर्व',
    'कादंबरी',
    'कथासंग्रह',
    'कविता',
    'समीक्षा व निबंध',
    'चरित्र व आठवणी',
    'तत्त्वज्ञान व चिंतन',
  ];

  const filteredBooks =
    activeBookCategory === 'सर्व'
      ? books
      : books.filter((b) => b.category === activeBookCategory);

  // Accepted Literary Genres for Manuscript Submission
  const acceptedGenres = [
    {
      mr: 'साहित्यिक कादंबरी व दीर्घकथा',
      en: 'Literary Fiction & Novellas',
      detailMr: 'समकालीन जीवनजाणिवा आणि भाषिक प्रयोगशीलता असणारे गद्य.',
      detailEn: 'Contemporary prose with deep regional and linguistic cadence.',
    },
    {
      mr: 'कवितासंग्रह',
      en: 'Poetry Collections',
      detailMr: 'स्वतःची लय, प्रतिमासृष्टी आणि संयत स्वर असलेली कविता.',
      detailEn: 'Original Marathi verse with distinctive voice and imagery.',
    },
    {
      mr: 'समीक्षा, चिंतन व वैचारिक निबंध',
      en: 'Criticism & Philosophical Essays',
      detailMr: 'साहित्य, समाज, संस्कृती आणि सौंदर्यशास्त्रावरील सखोल लेखन.',
      detailEn: 'Substantive cultural criticism, literary essays, and thought.',
    },
    {
      mr: 'प्रादेशिक इतिहास व अनुवादित साहित्य',
      en: 'Regional History & Translations',
      detailMr: 'मराठवाडा-महाराष्ट्राचा दस्तऐवज आणि भारतीय/जागतिक साहित्याचे अनुवाद.',
      detailEn: 'Archival regional histories and translations into Marathi.',
    },
  ];

  return (
    <div className="bg-[#FFFDF7] text-[#252832]">
      {/* =====================================================================
          1. PUBLISHING HOUSE HERO & FEATURED IMPRINT EDITION
          ===================================================================== */}
      <section
        ref={heroSectionRef}
        data-testid="home-publishing-hero"
        className={`akath-io-section ${
          isHeroVisible ? 'is-visible' : ''
        } relative overflow-hidden sarvam-aura border-b border-[#E6E1D6] py-12 sm:py-16 lg:py-20`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          {/* Top Publishing House Imprint Ribbon */}
          <div className="akath-io-stagger-1 flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-[#E6E1D6]/90">
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-sm bg-[#FFFDF7] border border-[#E6E1D6]">
              <span className="w-2 h-2 rounded-full bg-[#243B8A]" />
              <span className="text-xs font-semibold text-[#243B8A] tracking-wide">
                {lang === 'mr'
                  ? 'अकथ प्रकाशन • स्वतंत्र मराठी साहित्य प्रकाशन संस्था (नांदेड • पुणे)'
                  : 'Akath Prakashan • Independent Marathi Literary Publishing House (Nanded • Pune)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left 7 Columns: Publishing House Identity & Primary Publishing CTAs */}
            <div className="akath-io-stagger-2 lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-sm bg-[#243B8A]/8 border border-[#243B8A]/20">
                <AnimatedTortoiseEmblem
                  className="w-6 h-6"
                  variant="indigo"
                  animate={true}
                />
                <span className="text-xs sm:text-sm font-semibold text-[#243B8A]">
                  {lang === 'mr'
                    ? PUBLISHER_IDENTITY.taglineMarathi
                    : 'Marathi Literature • New Voices • Enduring Dialogue'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-serif font-bold text-[#252832] leading-[1.22] tracking-tight">
                {lang === 'mr' ? (
                  <>
                    घाईच्या काळात संथ, सखोल आणि{' '}
                    <span className="text-[#243B8A] underline decoration-[#FFD966] decoration-2 underline-offset-8">
                      काळजात उतरणारे मराठी ग्रंथप्रकाशन.
                    </span>
                  </>
                ) : (
                  <>
                    Patient, Archival &{' '}
                    <span className="text-[#243B8A] underline decoration-[#FFD966] decoration-2 underline-offset-8">
                      Enduring Marathi Book Publishing.
                    </span>
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-[#525665] leading-relaxed max-w-2xl">
                {lang === 'mr'
                  ? PUBLISHER_IDENTITY.positioningMarathi
                  : PUBLISHER_IDENTITY.positioningEnglish}
              </p>

              {/* Primary Publishing CTA Cluster */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-sm bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] font-semibold text-sm sm:text-base shadow-sm transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#FFD966]" />
                  <span>{t.home.ctaExploreBooks}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('/submit-manuscript')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-sm bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] font-semibold text-sm sm:text-base shadow-sm transition-all cursor-pointer"
                >
                  <Feather className="w-4 h-4 text-[#FFFDF7]" />
                  <span>{t.nav.submitManuscript}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('six-editorial-stages-heading-home');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onNavigate('/about');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-sm bg-[#FFFDF7] hover:bg-[#F7F3E8] text-[#252832] border border-[#E6E1D6] hover:border-[#243B8A]/40 font-semibold text-sm transition-all cursor-pointer"
                >
                  <span>
                    {lang === 'mr' ? 'सहा संपादकीय टप्पे पहा' : 'View 6 Publishing Stages'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Featured Imprint Edition Dossier */}
            {activeHeroBook && (
              <div className="akath-io-stagger-3 lg:col-span-5">
                <div className="akath-card rounded-sm p-6 sm:p-8 bg-[#FFFDF7] relative">
                  <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E6E1D6]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#243B8A]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#243B8A]">
                        {lang === 'mr'
                          ? 'अकथ प्रकाशन • विशेष ग्रंथ आवृत्ती'
                          : 'Akath Imprint • Featured Edition'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {spotlightBooks.slice(0, 3).map((b, idx) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setFeaturedBookIndex(idx)}
                          aria-label={`Featured edition ${idx + 1}: ${b.title}`}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            featuredBookIndex === idx
                              ? 'w-7 bg-[#243B8A]'
                              : 'w-2 bg-[#E6E1D6] hover:bg-[#525665]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeHeroBook.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center"
                    >
                      {/* Book Cover Specimen */}
                      <div className="sm:col-span-5 flex justify-center">
                        <div className="w-full max-w-[175px]">
                          <BookCoverArt
                            book={activeHeroBook}
                            author={activeHeroAuthor}
                            size="md"
                            onClick={() => onNavigate(`/books/${activeHeroBook.slug}`)}
                          />
                        </div>
                      </div>

                      {/* Bibliographic & Publishing Metadata */}
                      <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#525665]">
                            <span className="font-semibold text-[#243B8A]">
                              {activeHeroBook.category}
                            </span>
                            <span>·</span>
                            <span className="font-mono">
                              {activeHeroBook.format} · {activeHeroBook.pageCount || 224} {t.book.pages}
                            </span>
                          </div>

                          <h2
                            onClick={() => onNavigate(`/books/${activeHeroBook.slug}`)}
                            className="text-xl sm:text-2xl font-serif font-bold text-[#252832] hover:text-[#243B8A] transition-colors cursor-pointer leading-snug"
                          >
                            {activeHeroBook.title}
                          </h2>
                          {activeHeroAuthor && (
                            <p className="text-sm text-[#525665] font-medium">
                              {t.book.byAuthor}{' '}
                              <span className="text-[#252832] font-semibold">
                                {activeHeroAuthor.name}
                              </span>
                            </p>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-[#252832]/90 font-serif italic bg-[#F7F3E8]/90 p-3 rounded-sm border-l-2 border-[#FFD966] line-clamp-3 leading-relaxed">
                          “{activeHeroBook.editorialContext || activeHeroBook.subtitle || activeHeroBook.description}”
                        </p>

                        <div className="pt-2 border-t border-[#E6E1D6] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-[#525665]">
                              ISBN: {activeHeroBook.isbn}
                            </span>
                            <div className="flex items-baseline gap-2 tabular-nums">
                              <span className="text-xl font-bold text-[#252832]">
                                ₹{activeHeroBook.price}
                              </span>
                              {activeHeroBook.listPrice && activeHeroBook.listPrice > activeHeroBook.price && (
                                <span className="text-xs text-[#525665] line-through">
                                  ₹{activeHeroBook.listPrice}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onNavigate(`/books/${activeHeroBook.slug}`)}
                              className="flex-1 px-3.5 py-2 text-xs font-semibold text-[#252832] hover:text-[#243B8A] border border-[#E6E1D6] hover:border-[#243B8A] rounded-sm transition-colors cursor-pointer"
                            >
                              {t.book.viewDetails}
                            </button>
                            <button
                              type="button"
                              onClick={() => onAddToCart(activeHeroBook.id)}
                              className={`flex-1 px-3.5 py-2 text-xs font-semibold rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                recentlyAddedBookId === activeHeroBook.id
                                  ? 'bg-[#15803D] text-white'
                                  : 'bg-[#EF6855] hover:bg-[#d95643] text-white'
                              }`}
                            >
                              {recentlyAddedBookId === activeHeroBook.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{t.book.addedToCart}</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>{t.book.addToCart}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. OPEN EDITORIAL DESK • FOR AUTHORS & TRANSLATORS (KEPT ABOVE)
          ===================================================================== */}
      <section
        ref={deskSectionRef}
        data-testid="home-manuscript-desk"
        className={`akath-io-section ${
          isDeskVisible ? 'is-visible' : ''
        } py-12 sm:py-16 bg-[#FFFDF7] border-b border-[#E6E1D6]`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="akath-io-stagger-1 rounded-sm bg-[#243B8A] text-[#FFFDF7] p-8 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm border border-[#1B2D6B]">
            {/* Top Editorial Gold & Coral Ribbon */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1.5"
              style={{
                background:
                  'linear-gradient(90deg, #FFD966 0%, #EF6855 50%, #FFD966 100%)',
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left 6 Columns: Editorial Call for Manuscripts */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#FFD966] text-[#252832] text-xs font-bold tracking-wider uppercase">
                  <Feather className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'mr'
                      ? 'नवीन संहिता आमंत्रण • लेखक व अनुवादकांसाठी'
                      : 'Open Editorial Desk • For Authors & Translators'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#FFFDF7] leading-tight">
                  {lang === 'mr'
                    ? 'तुमच्या हस्तलिखिताला अकथ प्रकाशनचे संपादकीय आणि मुद्रण अधिष्ठान द्या.'
                    : 'Publish Your Manuscript with Akath Prakashan.'}
                </h2>

                <p className="text-sm sm:text-base text-[#FFFDF7]/85 leading-relaxed">
                  {lang === 'mr'
                    ? 'अकथ प्रकाशन ही मूल्यनिष्ठ साहित्य प्रकाशन संस्था आहे. संहितेची साहित्यिक गुणवत्ता, भाषिक ताकद आणि मौलिक विचार यांवरच पुस्तकाची निवड केली जाते; निवडलेल्या संहितेचा संपूर्ण संपादन व मुद्रण खर्च अकथ प्रकाशन करते.'
                    : 'Akath Prakashan is a merit-based literary imprint. Manuscripts are selected strictly on literary depth and linguistic craft, with full editorial, design, and production stewardship provided by the house.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('/submit-manuscript')}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-sm bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>
                      {lang === 'mr'
                        ? 'प्रकाशनार्थ संहिता पाठवा'
                        : 'Submit Manuscript Proposal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('/about')}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-sm bg-[#FFFDF7]/10 hover:bg-[#FFFDF7]/20 text-[#FFFDF7] border border-[#FFFDF7]/25 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <span>
                      {lang === 'mr'
                        ? 'संपादकीय भूमिका वाचा'
                        : 'Read Editorial Ethos'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Right 6 Columns: Accepted Literary Genres & Submission Checklist */}
              <div className="akath-io-stagger-2 lg:col-span-6 bg-[#FFFDF7] text-[#252832] rounded-sm p-6 sm:p-8 border border-[#E6E1D6] space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D6]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#243B8A]">
                    {lang === 'mr'
                      ? 'स्वीकारले जाणारे वाङ्मय प्रकार'
                      : 'Accepted Literary Genres'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#174D3A]">
                    {lang === 'mr' ? 'गुणवत्तानिष्ठ निवड' : 'Merit-Based Selection'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {acceptedGenres.map((g, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-sm bg-[#F7F3E8]/80 border border-[#E6E1D6]"
                    >
                      <p className="text-sm font-serif font-bold text-[#243B8A]">
                        {lang === 'mr' ? g.mr : g.en}
                      </p>
                      <p className="mt-1 text-xs text-[#525665] leading-relaxed">
                        {lang === 'mr' ? g.detailMr : g.detailEn}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E6E1D6] grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-[#252832] font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#FFD966] text-[#252832] font-mono font-bold inline-flex items-center justify-center text-[11px]">
                      1
                    </span>
                    <span>
                      {lang === 'mr'
                        ? 'प्रस्ताव व नमुना प्रकरणे'
                        : 'Synopsis & Sample Chapters'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#252832] font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#FFD966] text-[#252832] font-mono font-bold inline-flex items-center justify-center text-[11px]">
                      2
                    </span>
                    <span>
                      {lang === 'mr'
                        ? 'द्विसदस्यीय संपादकीय वाचन'
                        : 'Two-Editor Literary Review'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#252832] font-medium">
                    <span className="w-5 h-5 rounded-full bg-[#FFD966] text-[#252832] font-mono font-bold inline-flex items-center justify-center text-[11px]">
                      3
                    </span>
                    <span>
                      {lang === 'mr'
                        ? 'पारदर्शक प्रकाशन करार'
                        : 'Transparent Author Contract'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SIX EDITORIAL STAGES FROM MANUSCRIPT TO PRINTED BOOK
          ===================================================================== */}
      <div
        ref={stagesWrapperRef}
        className={`akath-io-section ${isStagesVisible ? 'is-visible' : ''}`}
      >
        <SixEditorialStages variant="home" onNavigate={onNavigate} />
      </div>

      {/* =====================================================================
          4. PUBLISHED EDITIONS CATALOGUE (IMPRINT BOOKSHELF)
          ===================================================================== */}
      <section
        ref={catalogSectionRef}
        data-testid="home-published-books"
        className={`akath-io-section ${
          isCatalogVisible ? 'is-visible' : ''
        } py-16 sm:py-20 bg-[#F7F3E8]/55 border-b border-[#E6E1D6]`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="akath-io-stagger-1 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#243B8A]">
                <BookOpen className="w-4 h-4" />
                <span>{t.home.featuredBooksEyebrow}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#252832]">
                {t.home.featuredBooksTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#525665] max-w-2xl">
                {t.catalogue.subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/books')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#243B8A] hover:text-[#1B2D6B] cursor-pointer self-start md:self-auto"
            >
              <span>
                {t.home.viewAllBooks} ({books.length})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Genre Filter Bar */}
          <div className="akath-io-stagger-2 flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#E6E1D6] no-scrollbar">
            {categories.map((cat) => {
              const active = activeBookCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveBookCategory(cat)}
                  className={`px-4 py-2 rounded-sm text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#243B8A] text-[#FFFDF7] font-semibold'
                      : 'bg-[#FFFDF7] text-[#525665] hover:text-[#252832] border border-[#E6E1D6]'
                  }`}
                >
                  {cat === 'सर्व' ? (lang === 'mr' ? 'सर्व प्रकार' : 'All Genres') : cat}
                </button>
              );
            })}
          </div>

          {/* Mobile Horizontal Swipe Indicator Bar */}
          <div className="flex sm:hidden items-center justify-between px-3 py-1.5 rounded-sm bg-[#FFFDF7] border border-[#E6E1D6] text-[11px] font-mono text-[#252832] mb-3.5">
            <span className="font-semibold text-[#243B8A]">
              {lang === 'mr'
                ? '← पुस्तके पाहण्यासाठी आडवे स्वाइप करा →'
                : '← Swipe horizontally to browse editions →'}
            </span>
            <span className="tabular-nums font-bold px-2 py-0.5 rounded-sm bg-[#FFD966]/70 text-[#252832]">
              {filteredBooks.length} {lang === 'mr' ? 'पुस्तके' : 'Books'}
            </span>
          </div>

          {/* Published Books — Horizontal Swipeable Flexbox on Mobile, Grid on Tablet/Desktop */}
          <div
            data-testid="home-catalog-horizontal-scroll"
            className="akath-io-stagger-3 flex flex-nowrap sm:grid sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scroll-smooth overscroll-x-contain gap-4 sm:gap-7 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar"
          >
            {filteredBooks.map((book) => {
              const bookAuthor = authors.find((a) => a.id === book.authorId);
              return (
                <div
                  key={book.id}
                  className="w-[82vw] max-w-[295px] sm:w-auto sm:max-w-none shrink-0 snap-center sm:snap-start"
                >
                  <BookCard
                    book={book}
                    author={bookAuthor}
                    onSelectBook={(slug) => onNavigate(`/books/${slug}`)}
                    onSelectAuthor={(slug) => onNavigate(`/authors/${slug}`)}
                    onAddToCart={(bookId) => onAddToCart(bookId)}
                    justAdded={recentlyAddedBookId === book.id}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
