import React, { useState } from 'react';
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
      detailMr: 'समकालीन जीवनजाणिवा आणि भाषिक प्रयोगशीलता असलेले गद्य.',
      detailEn: 'Prose with distinct regional cadence and structural depth.',
    },
    {
      mr: 'कवितासंग्रह',
      en: 'Poetry Collections',
      detailMr: 'स्वतःची लय, प्रतिमासृष्टी आणि संयत स्वर असलेली कविता.',
      detailEn: 'Original Marathi verse with disciplined imagery and voice.',
    },
    {
      mr: 'समीक्षा, चिंतन व वैचारिक निबंध',
      en: 'Criticism & Literary Essays',
      detailMr: 'साहित्य, समाज, कला आणि सौंदर्यशास्त्रावरील सखोल लेखन.',
      detailEn: 'Rigorous cultural criticism, aesthetics, and long-form essays.',
    },
    {
      mr: 'सांस्कृतिक इतिहास व अनुवादित साहित्य',
      en: 'Cultural History & Translations',
      detailMr: 'प्रादेशिक इतिहास आणि जागतिक/भारतीय अभिजात कृतींचे मराठी अनुवाद.',
      detailEn: 'Archival regional histories and translations into Marathi.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-[#252832]">
      {/* =====================================================================
          1. MONUMENTAL PUBLISHING HOUSE HERO & FEATURED IMPRINT EDITIONS
          ===================================================================== */}
      <section
        data-testid="home-publishing-hero"
        className="relative overflow-hidden sarvam-aura border-b border-[#E6E1D6] pt-8 pb-16 sm:pt-14 sm:pb-24"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          {/* Top Publishing House Imprint Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 sm:mb-10 border-b border-[#E6E1D6]/90">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-sm bg-[#FFFDF7] border border-[#E6E1D6] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#243B8A]" />
              <span className="ui-meta font-semibold text-[#243B8A] tracking-wide">
                {lang === 'mr'
                  ? 'अकथ प्रकाशन • स्वतंत्र मराठी साहित्य प्रकाशन संस्था (नांदेड • पुणे)'
                  : 'Akath Prakashan • Independent Marathi Literary Publishing House (Nanded • Pune)'}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 ui-meta text-[#525665]">
              <span>
                {lang === 'mr'
                  ? 'संहिता ते मुद्रित ग्रंथ'
                  : 'Manuscript to Archival Edition'}
              </span>
              <span className="text-[#E6E1D6]">•</span>
              <span>
                {lang === 'mr'
                  ? 'धागा-शिलाई बांधणी व संग्रहणीय कागद'
                  : 'Smyth-Sewn Binding & Archival Paper'}
              </span>
              <span className="text-[#E6E1D6]">•</span>
              <span>
                {lang === 'mr'
                  ? 'अधिकृत ISBN-13 नोंदणी'
                  : 'Official ISBN-13 Registration'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left 7 Columns: Publishing House Identity & Primary Publishing CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-sm bg-[#243B8A]/8 border border-[#243B8A]/20">
                <AnimatedTortoiseEmblem
                  className="w-7 h-7"
                  variant="indigo"
                  animate={true}
                />
                <span className="text-xs font-semibold text-[#243B8A]">
                  {lang === 'mr'
                    ? PUBLISHER_IDENTITY.taglineMarathi
                    : 'Marathi Literature • New Voices • Enduring Dialogue'}
                </span>
              </div>

              <h1 className="type-hero-headline text-[#252832]">
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

              <p className="prose-marathi text-[#525665]">
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
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-sm bg-[#FFFDF7] hover:bg-[#F7F3E8] text-[#252832] border border-[#E6E1D6] hover:border-[#243B8A]/40 font-semibold text-sm sm:text-base transition-all cursor-pointer"
                >
                  <span>
                    {lang === 'mr' ? 'सहा संपादकीय टप्पे पहा' : 'View 6 Publishing Stages'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right 5 Columns: Featured Imprint Edition Dossier */}
            {activeHeroBook && (
              <div className="lg:col-span-5">
                <div className="akath-card rounded-sm p-5 sm:p-7 bg-[#FFFDF7] relative">
                  <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E6E1D6]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#243B8A]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#243B8A]">
                        {lang === 'mr'
                          ? 'अकथ प्रकाशन • विशेष प्रकाशित ग्रंथ'
                          : 'Akath Imprint • Featured Published Edition'}
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
                      className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center"
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
                      <div className="sm:col-span-7 flex flex-col justify-between space-y-3.5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-[#243B8A]/10 text-[#243B8A] rounded-sm">
                              {activeHeroBook.category}
                            </span>
                            <span className="px-2.5 py-0.5 text-[11px] font-mono text-[#525665] bg-[#F7F3E8] rounded-sm">
                              {activeHeroBook.format} • {activeHeroBook.pageCount || 224} {t.book.pages}
                            </span>
                          </div>

                          <h2
                            onClick={() => onNavigate(`/books/${activeHeroBook.slug}`)}
                            className="text-xl sm:text-2xl font-serif font-bold text-[#252832] hover:text-[#243B8A] transition-colors cursor-pointer leading-snug"
                          >
                            {activeHeroBook.title}
                          </h2>
                          {activeHeroAuthor && (
                            <p className="text-sm text-[#525665] font-medium mt-1">
                              {t.book.byAuthor}{' '}
                              <span className="text-[#252832] font-semibold">
                                {activeHeroAuthor.name}
                              </span>
                            </p>
                          )}
                        </div>

                        <p className="text-sm text-[#252832]/90 font-serif italic bg-[#F7F3E8]/90 p-3 rounded-sm border-l-2 border-[#FFD966] line-clamp-3 leading-relaxed">
                          “{activeHeroBook.editorialContext || activeHeroBook.subtitle || activeHeroBook.description}”
                        </p>

                        <div className="text-[11px] font-mono text-[#525665] flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>ISBN: {activeHeroBook.isbn}</span>
                          <span>•</span>
                          <span>{activeHeroBook.edition}</span>
                        </div>

                        <div className="pt-2 border-t border-[#E6E1D6] flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-[#525665] block">
                              {lang === 'mr' ? 'ग्रंथ मूल्य' : 'Edition Price'}
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
                              className="px-3 py-2 text-xs font-semibold text-[#252832] hover:text-[#243B8A] border border-[#E6E1D6] hover:border-[#243B8A] rounded-sm transition-colors cursor-pointer"
                            >
                              {t.book.viewDetails}
                            </button>
                            <button
                              type="button"
                              onClick={() => onAddToCart(activeHeroBook.id)}
                              className={`px-3.5 py-2 text-xs font-semibold rounded-sm transition-all flex items-center gap-1.5 cursor-pointer ${
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

                  {/* Quick Switcher Strip for Featured Imprint Titles */}
                  <div className="mt-5 pt-4 border-t border-[#E6E1D6] grid grid-cols-3 gap-2">
                    {spotlightBooks.slice(0, 3).map((b, idx) => {
                      const bAuthor = authors.find((a) => a.id === b.authorId);
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setFeaturedBookIndex(idx)}
                          className={`text-left p-2 rounded-sm border transition-all cursor-pointer ${
                            featuredBookIndex === idx
                              ? 'bg-[#F7F3E8] border-[#243B8A]/45'
                              : 'bg-transparent border-transparent hover:bg-[#F7F3E8]/60'
                          }`}
                        >
                          <p className="text-xs font-serif font-semibold text-[#252832] truncate">
                            {b.title}
                          </p>
                          <p className="text-[11px] text-[#525665] truncate">
                            {bAuthor?.name || 'अकथ प्रकाशन'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. OPEN EDITORIAL DESK • FOR AUTHORS & TRANSLATORS (PLACED ABOVE)
          ===================================================================== */}
      <section
        data-testid="home-manuscript-desk"
        className="py-14 sm:py-20 bg-[#FFFDF7] border-b border-[#E6E1D6]"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-sm bg-[#243B8A] text-[#FFFDF7] p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-md border border-[#1B2D6B]"
          >
            {/* Top Editorial Gold & Coral Ribbon */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1.5"
              style={{
                background:
                  'linear-gradient(90deg, #FFD966 0%, #EF6855 50%, #FFD966 100%)',
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              {/* Left 7 Columns: Editorial Call for Manuscripts */}
              <div className="lg:col-span-7 space-y-5">
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

                <p className="text-sm sm:text-base text-[#FFFDF7]/85 leading-relaxed max-w-2xl">
                  {lang === 'mr'
                    ? 'आम्ही केवळ पैसे घेऊन पुस्तके छापणारी (Vanity Press) संस्था नाही. संहितेची साहित्यिक गुणवत्ता, भाषिक ताकद आणि वैचारिक खोली यांवरच पुस्तकाची निवड केली जाते. निवड झालेल्या पुस्तकाचा संपूर्ण संपादन, मुद्रण व वितरण खर्च अकथ प्रकाशन करते.'
                    : 'Akath Prakashan is a traditional, merit-based literary imprint—never a vanity press. Manuscripts are selected strictly on literary quality, linguistic depth, and originality, with full editorial, production, and distribution stewardship.'}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigate('/submit-manuscript')}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-sm bg-[#EF6855] hover:bg-[#d95643] text-[#FFFDF7] font-semibold text-sm sm:text-base transition-colors cursor-pointer shadow-sm"
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
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-sm bg-[#FFFDF7]/10 hover:bg-[#FFFDF7]/20 text-[#FFFDF7] border border-[#FFFDF7]/25 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                  >
                    <span>
                      {lang === 'mr'
                        ? 'संपादकीय भूमिका वाचा'
                        : 'Read Editorial Ethos'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Right 5 Columns: Accepted Literary Genres Ledger */}
              <div className="lg:col-span-5 bg-[#FFFDF7] text-[#252832] rounded-sm p-6 sm:p-7 border border-[#E6E1D6]">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6E1D6]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#243B8A]">
                    {lang === 'mr'
                      ? 'स्वीकारले जाणारे वाङ्मय प्रकार'
                      : 'Accepted Literary Genres'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#174D3A]">
                    {lang === 'mr' ? 'गुणवत्तानिष्ठ निवड' : 'Merit-Based Selection'}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {acceptedGenres.map((g, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-sm bg-[#F7F3E8]/80 border border-[#E6E1D6]"
                    >
                      <p className="text-sm font-serif font-bold text-[#243B8A]">
                        {lang === 'mr' ? g.mr : g.en}
                      </p>
                      <p className="text-xs text-[#525665] mt-0.5 leading-relaxed">
                        {lang === 'mr' ? g.detailMr : g.detailEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
          3. SIX EDITORIAL STAGES FROM MANUSCRIPT TO PRINTED BOOK (UNIFIED FOLIO)
          ===================================================================== */}
      <SixEditorialStages variant="home" onNavigate={onNavigate} />

      {/* =====================================================================
          4. PUBLISHED EDITIONS CATALOGUE (AKATH IMPRINT SHELF)
          ===================================================================== */}
      <section
        data-testid="home-published-books"
        className="py-16 sm:py-24 bg-[#F7F3E8]/55 border-b border-[#E6E1D6]"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#243B8A] mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t.home.featuredBooksEyebrow}</span>
              </div>
              <h2 className="type-page-heading text-[#252832]">
                {t.home.featuredBooksTitle}
              </h2>
              <p className="text-sm text-[#525665] mt-1">
                {lang === 'mr'
                  ? 'अकथ प्रकाशनने प्रकाशित केलेले निवडक साहित्यिक ग्रंथ — नांदेड व पुणे केंद्रातून थेट वाचकांपर्यंत.'
                  : 'Curated literary works published by Akath Prakashan — dispatched directly from our Nanded & Pune hubs.'}
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
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#E6E1D6] no-scrollbar">
            {categories.map((cat) => {
              const active = activeBookCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveBookCategory(cat)}
                  className={`px-4 py-2 rounded-sm text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#243B8A] text-[#FFFDF7] font-semibold shadow-2xs'
                      : 'bg-[#FFFDF7] text-[#525665] hover:text-[#252832] border border-[#E6E1D6]'
                  }`}
                >
                  {cat === 'सर्व' ? (lang === 'mr' ? 'सर्व प्रकार' : 'All Genres') : cat}
                </button>
              );
            })}
          </div>

          {/* Published Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.slice(0, 8).map((book) => {
              const bookAuthor = authors.find((a) => a.id === book.authorId);
              return (
                <BookCard
                  key={book.id}
                  book={book}
                  author={bookAuthor}
                  onSelectBook={(slug) => onNavigate(`/books/${slug}`)}
                  onSelectAuthor={(slug) => onNavigate(`/authors/${slug}`)}
                  onAddToCart={(bookId) => onAddToCart(bookId)}
                  justAdded={recentlyAddedBookId === book.id}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
