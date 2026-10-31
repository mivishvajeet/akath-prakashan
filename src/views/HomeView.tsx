import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookRecord,
  AuthorRecord,
  EditorialArticle,
  FirstPageExcerpt,
} from '../types/publishing';
import { BookCoverArt } from '../components/BookCoverArt';
import { BookCard } from '../components/BookCard';
import {
  HorizonArchIllustration,
  GatewayArchIllustration,
  OpenFolioIllustration,
  ArchitecturalDivider,
  AnimatedTortoiseEmblem,
  TortoiseStageIllustration,
} from '../components/SarvamIllustrations';
import { PUBLISHER_IDENTITY } from '../data/seedData';
import { useLanguage } from '../i18n/translations';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Eye,
  EyeOff,
  ShoppingBag,
  Check,
  Feather,
} from 'lucide-react';

interface HomeViewProps {
  books: BookRecord[];
  authors: AuthorRecord[];
  articles: EditorialArticle[];
  excerpts: FirstPageExcerpt[];
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string) => void;
  recentlyAddedBookId: string | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  books,
  authors,
  articles,
  excerpts,
  onNavigate,
  onAddToCart,
  recentlyAddedBookId,
}) => {
  const { lang, t } = useLanguage();
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [blindExcerptMode, setBlindExcerptMode] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [activeExcerptIndex, setActiveExcerptIndex] = useState<number>(0);
  const [activeCraftStep, setActiveCraftStep] = useState<number>(0);

  const spotlightBooks = useMemo(() => {
    const featured = books.filter((b) => b.isFeatured || b.isEditorSelection);
    return (featured.length >= 3 ? featured : books).slice(0, 3);
  }, [books]);

  const activeSpotlightBook = spotlightBooks[spotlightIndex] || books[0];
  const activeSpotlightAuthor = authors.find(
    (a) => a.id === activeSpotlightBook?.authorId
  );

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    books.forEach((b) => map.set(b.categorySlug, b.category));
    return Array.from(map.entries());
  }, [books]);

  const filteredShelfBooks = useMemo(() => {
    const list =
      activeCategoryFilter === 'all'
        ? books
        : books.filter((b) => b.categorySlug === activeCategoryFilter);
    return list.slice(0, 4);
  }, [books, activeCategoryFilter]);

  const leadExcerpt = excerpts[activeExcerptIndex] || excerpts[0];
  const leadExcerptBook = books.find((b) => b.id === leadExcerpt?.bookId);
  const leadExcerptAuthor = authors.find((a) => a.id === leadExcerpt?.authorId);

  const leadArticle = articles[0];
  const secondaryArticles = articles.slice(1, 3);

  return (
    <div className="bg-[#FFFDF7] text-[#252832]">
      {/* =====================================================================
           1. SARVAM-STYLE CENTERED MONUMENTAL HERO & INTERACTIVE 3-BOOK STAGE
           ===================================================================== */}
      <section className="relative overflow-hidden pt-8 sm:pt-12 pb-16 lg:pb-24 border-b border-[#E6E1D6]">
        {/* Soft Midnight Cobalt & Butter Yellow Horizon Aura */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[540px]"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(255, 217, 102, 0.22) 0%, rgba(36, 59, 138, 0.08) 45%, transparent 100%)',
          }}
        />

        {/* Panoramic Concentric Indian Arch Horizon Vector */}
        <div className="pointer-events-none absolute inset-x-0 top-6 text-[#243B8A] flex justify-center">
          <HorizonArchIllustration className="w-full max-w-[1280px] h-[380px] sm:h-[420px]" />
        </div>

        <div className="relative z-10 max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered Monumental Typography Stack */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto text-center space-y-5"
          >
            {/* Centered Animated Tortoise Emblem + Unboxed Literary Kicker */}
            <div className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-[#243B8A]">
              <AnimatedTortoiseEmblem
                className="w-8 h-8"
                variant="forest"
                animate={true}
              />
              <span>{t.home.heroEyebrow}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#525665] font-medium">नांदेड / पुणे</span>
            </div>

            <h1 className="type-hero-headline text-[#252832] mx-auto">
              {t.home.heroHeadline}
            </h1>

            <p className="font-serif text-[19px] sm:text-[22px] text-[#243B8A] font-medium">
              “{t.home.heroSubheadline}”
            </p>

            <p className="prose-marathi text-[#525665] mx-auto text-center">
              {t.home.heroLead}
            </p>

            {/* Centered Action Buttons: Coral Red Primary CTA + Warm White Secondary */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => onNavigate('/books')}
                className="px-6 py-3.5 rounded-2xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold transition-colors inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 shadow-xs"
              >
                <span>{t.home.ctaExploreBooks}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('/vachankatta/first-page')}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#FFD966]/25 text-[#243B8A] border border-[#E6E1D6] text-[15px] font-semibold transition-colors inline-flex items-center gap-2.5 whitespace-nowrap shrink-0"
              >
                <BookOpen className="w-4 h-4 text-[#243B8A]" />
                <span>{t.home.ctaStartReading}</span>
              </button>
            </div>
          </motion.div>

          {/* Interactive 3-Book Architectural Stage Below Centered Hero */}
          {activeSpotlightBook && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 sm:mt-14 bg-white rounded-[32px] border border-[#E6E1D6] shadow-[0_24px_60px_-18px_rgba(36,59,138,0.12)] overflow-hidden"
            >
              {/* Top Interactive Selector Rail for the 3 Spotlight Books */}
              <div className="bg-[#FFFDF7] border-b border-[#E6E1D6] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#243B8A]">
                  <span className="font-mono">01</span>
                  <span aria-hidden="true">·</span>
                  <span>{t.home.editorSelectionEyebrow}</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                  {spotlightBooks.map((b, idx) => {
                    const active = idx === spotlightIndex;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSpotlightIndex(idx)}
                        className={`relative px-3.5 py-1.5 rounded-xl text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                          active
                            ? 'text-[#252832]'
                            : 'bg-white text-[#525665] hover:text-[#243B8A] border border-[#E6E1D6]'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="hero-spotlight-tab"
                            className="absolute inset-0 bg-[#FFD966] rounded-xl"
                            transition={{
                              type: 'spring',
                              stiffness: 420,
                              damping: 34,
                            }}
                          />
                        )}
                        <span className="relative z-10">
                          0{idx + 1}. {b.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Morphing Spotlight Stage Body */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSpotlightBook.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                >
                  {/* Arch-Dome Book Cover Stage */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-[260px] bg-gradient-to-b from-[#FFD966]/25 via-[#FFFDF7] to-[#F7F3E8] rounded-t-[120px] rounded-b-3xl pt-9 pb-7 px-8 border border-[#E6E1D6] flex justify-center relative">
                      <motion.div
                        whileHover={{ y: -5, rotate: -0.5 }}
                        transition={{ duration: 0.2 }}
                        className="w-[175px] sm:w-[190px]"
                      >
                        <BookCoverArt
                          book={activeSpotlightBook}
                          author={activeSpotlightAuthor}
                          size="md"
                          onClick={() =>
                            onNavigate(`/books/${activeSpotlightBook.slug}`)
                          }
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Book Monograph Details & Direct Actions */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#525665]">
                      <span className="font-semibold text-[#243B8A]">
                        {activeSpotlightBook.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{activeSpotlightBook.edition}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#243B8A] font-semibold">
                        {t.book.inStock}
                      </span>
                    </div>

                    <h2 className="type-page-heading text-[#252832]">
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(`/books/${activeSpotlightBook.slug}`)
                        }
                        className="text-left hover:text-[#243B8A] transition-colors"
                      >
                        {activeSpotlightBook.title}
                      </button>
                    </h2>

                    {activeSpotlightBook.subtitle && (
                      <p className="font-serif text-[18px] text-[#525665]">
                        {activeSpotlightBook.subtitle}
                      </p>
                    )}

                    {activeSpotlightAuthor && (
                      <p className="text-[15px] font-semibold text-[#252832]">
                        — {activeSpotlightAuthor.name} (
                        {activeSpotlightAuthor.region})
                      </p>
                    )}

                    <p className="prose-marathi text-[#525665]">
                      {activeSpotlightBook.editorSelectionNote?.personalNote ||
                        activeSpotlightBook.description}
                    </p>

                    <div className="pt-4 border-t border-[#E6E1D6] flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-[28px] font-bold text-[#252832] tabular-nums">
                          ₹{activeSpotlightBook.price}
                        </span>
                        <span className="ml-2.5 text-[13px] text-[#525665]">
                          ({activeSpotlightBook.format.split('(')[0]})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate(`/books/${activeSpotlightBook.slug}`)
                          }
                          className="px-4 py-2.5 rounded-xl bg-[#FFFDF7] hover:bg-[#FFD966]/30 text-[#243B8A] border border-[#E6E1D6] text-[14px] font-semibold transition-colors whitespace-nowrap shrink-0"
                        >
                          {t.book.viewDetails}
                        </button>

                        <button
                          type="button"
                          onClick={() => onAddToCart(activeSpotlightBook.id)}
                          className={`px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 ${
                            recentlyAddedBookId === activeSpotlightBook.id
                              ? 'bg-[#243B8A] text-[#FFFDF7]'
                              : 'bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7]'
                          }`}
                        >
                          {recentlyAddedBookId === activeSpotlightBook.id ? (
                            <>
                              <Check className="w-4 h-4 text-[#FFD966]" />
                              <span>{t.book.addedToCart}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span>{t.book.addToCart}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* =====================================================================
           2. CURATED BOOKSTORE SHOWCASE WITH ARCH-PEDESTAL CARDS
           ===================================================================== */}
      <section className="py-16 lg:py-22 border-b border-[#E6E1D6]">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.35 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
          >
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#243B8A] mb-1">
                <span className="font-mono">02</span>
                <span aria-hidden="true">·</span>
                <span>{t.home.featuredBooksEyebrow}</span>
              </div>
              <h2 className="type-page-heading text-[#252832]">
                {t.home.featuredBooksTitle}
              </h2>
            </div>

            {/* Segmented Filter Dock */}
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[#F7F3E8] border border-[#E6E1D6] overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                  activeCategoryFilter === 'all'
                    ? 'bg-[#243B8A] text-[#FFFDF7]'
                    : 'text-[#525665] hover:text-[#243B8A]'
                }`}
              >
                {t.catalogue.allCategories} ({books.length})
              </button>
              {categories.map(([slug, label]) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setActiveCategoryFilter(slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                    activeCategoryFilter === slug
                      ? 'bg-[#243B8A] text-[#FFFDF7]'
                      : 'text-[#525665] hover:text-[#243B8A]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategoryFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredShelfBooks.map((book) => {
                const bookAuthor = authors.find((a) => a.id === book.authorId);
                return (
                  <BookCard
                    key={book.id}
                    book={book}
                    author={bookAuthor}
                    onSelectBook={(slug) => onNavigate(`/books/${slug}`)}
                    onSelectAuthor={(slug) => onNavigate(`/authors/${slug}`)}
                    onAddToCart={onAddToCart}
                    onOpenExcerpt={() => onNavigate('/vachankatta/first-page')}
                    justAdded={recentlyAddedBookId === book.id}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => onNavigate('/books')}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-[#243B8A] text-[#243B8A] hover:text-[#FFFDF7] border border-[#E6E1D6] text-[14px] font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <span>{t.home.viewAllBooks}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
           3. CREATIVE ANIMATED TORTOISE PHILOSOPHY & 6-STEP CRAFT SECTION
           ("कासवाची संथ लय आणि पुस्तकाची निर्मिती" / Tortoise + Open Book Emblem)
           ===================================================================== */}
      <section className="py-16 lg:py-24 border-b border-[#E6E1D6] bg-white sarvam-aura">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left 5 Cols: Animated Tortoise & Open Book Architectural Stage */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-5 flex flex-col items-center"
            >
              <div className="w-full max-w-[420px] bg-[#FFFDF7] rounded-[32px] border border-[#E6E1D6] p-6 text-[#243B8A] shadow-[0_20px_50px_-20px_rgba(36,59,138,0.1)]">
                <TortoiseStageIllustration className="w-full h-auto" />

                {/* Official Logo Seal & Symbol Explanation Bar */}
                <div className="mt-4 pt-4 border-t border-[#E6E1D6] flex items-center justify-between gap-3 text-[12.5px] text-[#525665]">
                  <div className="flex items-center gap-2.5">
                    <AnimatedTortoiseEmblem
                      className="w-9 h-9 shrink-0"
                      variant="cerulean"
                      animate={false}
                    />
                    <div>
                      <span className="font-bold text-[#252832] block">
                        कासव + द्वि-चक्र + उघडलेले पुस्तक
                      </span>
                      <span>अकथ प्रकाशन अधिकृत बोधचिन्ह</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('/about')}
                    className="font-semibold text-[#243B8A] hover:underline whitespace-nowrap"
                  >
                    {t.nav.about} →
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right 7 Cols: Turtle Philosophy Manifesto + Interactive 6-Step Craft */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#243B8A]">
                <span className="font-mono">03</span>
                <span aria-hidden="true">·</span>
                <span>
                  {lang === 'mr'
                    ? 'अकथ बोधचिन्हाचे तत्त्वज्ञान · कासवाची संथ व चिरंतन लय'
                    : 'The Akath Tortoise Emblem · Slow, Enduring Craft'}
                </span>
              </div>

              <h2 className="type-page-heading text-[#252832]">
                {lang === 'mr'
                  ? 'कासवाप्रमाणे संथ, सखोल आणि पिढ्यानपिढ्या टिकणारी पुस्तक-निर्मिती.'
                  : 'Like the Tortoise: Unhurried Editorial Craft Built to Last Generations.'}
              </h2>

              <blockquote className="p-5 sm:p-6 rounded-2xl bg-[#FFD966]/20 border border-[#FFD966] font-serif text-[18px] sm:text-[20px] text-[#252832] leading-[1.65]">
                “
                {lang === 'mr'
                  ? PUBLISHER_IDENTITY.turtlePhilosophyMarathi
                  : PUBLISHER_IDENTITY.turtlePhilosophyEnglish}
                ”
              </blockquote>

              {/* Interactive 6-Step Publishing Craft Selector */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#525665]">
                    {lang === 'mr'
                      ? 'हस्तलिखितापासून पुस्तकापर्यंतचे ६ संपादकीय टप्पे:'
                      : 'Six Editorial Stages from Manuscript to Printed Book:'}
                  </span>
                  <span className="font-mono text-[12px] text-[#243B8A] font-semibold">
                    0{activeCraftStep + 1} / 06
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PUBLISHER_IDENTITY.preservedCapabilities.map((cap, idx) => {
                    const isSelected = activeCraftStep === idx;
                    return (
                      <motion.button
                        key={cap.step}
                        type="button"
                        onClick={() => setActiveCraftStep(idx)}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.16 }}
                        className={`text-left p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-[#243B8A] text-[#FFFDF7] border-[#243B8A] shadow-sm'
                            : 'bg-[#FFFDF7] hover:bg-[#FFD966]/20 text-[#252832] border-[#E6E1D6]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              isSelected ? 'text-[#FFD966]' : 'text-[#243B8A]'
                            }`}
                          >
                            टप्पा {cap.step}
                          </span>
                          <span
                            className={`text-[11px] ${
                              isSelected ? 'text-[#FFFDF7]/80' : 'text-[#525665]'
                            }`}
                          >
                            {cap.titleEnglish}
                          </span>
                        </div>
                        <p
                          className={`font-serif text-[16px] font-bold ${
                            isSelected ? 'text-[#FFFDF7]' : 'text-[#252832]'
                          }`}
                        >
                          {cap.titleMarathi}
                        </p>
                        {isSelected && (
                          <p className="mt-1.5 text-[13px] text-[#FFFDF7]/85 leading-relaxed">
                            {cap.description}
                          </p>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
           4. SARVAM-STYLE ASYMMETRIC BENTO GRID: FIRST PAGE + VACHANKATTA
           ===================================================================== */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Bento Header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.35 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#243B8A] mb-1">
                <span className="font-mono">04</span>
                <span aria-hidden="true">·</span>
                <span>{t.home.vachankattaEyebrow}</span>
              </div>
              <h2 className="type-page-heading text-[#252832]">
                {lang === 'mr'
                  ? 'पहिले पान आणि वाचनकट्टा संपादकीय विश्व'
                  : 'First Page Studio & Vachankatta Literary Journal'}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/vachankatta')}
              className="px-4 py-2 rounded-xl bg-white border border-[#E6E1D6] hover:border-[#243B8A] text-[14px] font-semibold text-[#243B8A] inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap shrink-0 transition-colors"
            >
              <span>{t.home.viewAllArticles}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* 12-Column Asymmetric Architectural Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* BENTO CELL 1 (7 Cols): Open-Book First Page Excerpt Reader */}
            {leadExcerpt && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38 }}
                className="lg:col-span-7 bg-white rounded-[32px] border border-[#E6E1D6] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E6E1D6]">
                    <div className="flex items-center gap-3">
                      <AnimatedTortoiseEmblem
                        className="w-9 h-9 shrink-0"
                        variant="forest"
                        animate={false}
                      />
                      <div>
                        <span className="text-[12px] font-semibold text-[#243B8A] block">
                          {t.home.firstPageEyebrow}
                        </span>
                        <h3 className="type-section-heading text-[#252832]">
                          {t.home.firstPageTitle}
                        </h3>
                      </div>
                    </div>

                    {/* Excerpt Switcher Pills */}
                    <div className="flex items-center gap-1.5">
                      {excerpts.map((ex, idx) => (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => setActiveExcerptIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
                            activeExcerptIndex === idx
                              ? 'bg-[#243B8A] text-[#FFFDF7]'
                              : 'bg-[#F7F3E8] text-[#525665] hover:text-[#243B8A]'
                          }`}
                        >
                          0{idx + 1}. {ex.genreMarathi}
                        </button>
                      ))}
                    </div>
                  </div>

                  <blockquote className="font-serif text-[20px] sm:text-[23px] font-medium text-[#252832] leading-[1.6] bg-[#FFD966]/20 p-5 sm:p-6 rounded-2xl border border-[#FFD966]">
                    “{leadExcerpt.highlightedLine}”
                  </blockquote>

                  <div className="prose-marathi text-[#252832] space-y-4">
                    {leadExcerpt.excerptParagraphs.slice(0, 2).map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Blind Reading Reveal + Full Reader Link */}
                <div className="mt-8 pt-5 border-t border-[#E6E1D6] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBlindExcerptMode(!blindExcerptMode)}
                      className="px-4 py-2 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[13px] font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                    >
                      {blindExcerptMode ? (
                        <>
                          <Eye className="w-4 h-4 text-[#FFD966]" />
                          <span>{t.vachankatta.revealIdentity}</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4 text-[#FFD966]" />
                          <span>{t.vachankatta.hideIdentity}</span>
                        </>
                      )}
                    </button>

                    {!blindExcerptMode && leadExcerptBook && (
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(`/books/${leadExcerptBook.slug}`)
                        }
                        className="text-[14px] font-serif font-bold text-[#252832] hover:text-[#243B8A] underline"
                      >
                        {leadExcerptBook.title} — {leadExcerptAuthor?.name}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('/vachankatta/first-page')}
                    className="text-[13px] font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t.home.ctaStartReading}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* BENTO CELL 2 (5 Cols): Midnight Cobalt Lead Essay Card */}
            {leadArticle && (
              <motion.article
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: 0.08 }}
                className="lg:col-span-5 bg-[#243B8A] text-[#FFFDF7] rounded-[32px] p-6 sm:p-9 flex flex-col justify-between relative overflow-hidden border border-[#1B2D6B]"
              >
                <div className="pointer-events-none absolute -right-14 -bottom-14 w-64 h-64 text-[#FFD966]/20">
                  <GatewayArchIllustration className="w-full h-full" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-[12px] text-[#FFD966] font-medium">
                    <span>{leadArticle.categoryMarathi}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {leadArticle.readingTimeMinutes} {t.vachankatta.readingTime}
                    </span>
                  </div>

                  <h3 className="type-page-heading text-[#FFFDF7]">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/vachankatta/${leadArticle.slug}`)}
                      className="text-left hover:text-[#FFD966] transition-colors"
                    >
                      {leadArticle.title}
                    </button>
                  </h3>

                  <p className="font-serif text-[17px] text-[#FFFDF7]/90 leading-[1.6]">
                    {leadArticle.subtitle}
                  </p>

                  <p className="text-[14.5px] text-[#FFFDF7]/80 line-clamp-4 leading-[1.75]">
                    {leadArticle.leadParagraph}
                  </p>
                </div>

                <div className="relative z-10 mt-8 pt-5 border-t border-white/15 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[#FFFDF7] font-semibold text-[14px] block">
                      {leadArticle.contributorName}
                    </span>
                    <span className="text-[#FFD966]/90 text-[12px]">
                      {leadArticle.contributorRole}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/vachankatta/${leadArticle.slug}`)}
                    className="px-4 py-2 rounded-xl bg-[#FFD966] text-[#252832] hover:bg-[#F5CC52] text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>{t.vachankatta.readFullArticle}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            )}

            {/* BENTO ROW 2: 2 Secondary Essay Cells + 1 Open Manuscript Studio Cell */}
            {secondaryArticles.map((art, idx) => (
              <motion.article
                key={art.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.32, delay: idx * 0.06 }}
                whileHover={{ y: -3 }}
                className="lg:col-span-4 bg-white rounded-[28px] border border-[#E6E1D6] p-6 flex flex-col justify-between hover:border-[#243B8A]/40 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-[12px] text-[#525665]">
                    <span className="font-semibold text-[#243B8A]">
                      {art.categoryMarathi}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {art.readingTimeMinutes} {t.vachankatta.readingTime}
                    </span>
                  </div>
                  <h4 className="type-book-title text-[#252832] hover:text-[#243B8A] transition-colors">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                      className="text-left"
                    >
                      {art.title}
                    </button>
                  </h4>
                  <p className="text-[14px] text-[#525665] line-clamp-3 leading-[1.65]">
                    {art.summary}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#E6E1D6] flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#252832]">
                    {art.contributorName}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                    className="font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{t.vachankatta.readFullArticle}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.article>
            ))}

            {/* BENTO CELL: Open Manuscript Invitation */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.32, delay: 0.12 }}
              className="lg:col-span-4 bg-gradient-to-b from-[#FFD966]/25 to-white rounded-[28px] border border-[#E6E1D6] p-6 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#243B8A] inline-flex items-center gap-1.5">
                    <Feather className="w-3.5 h-3.5" />
                    <span>{t.home.manuscriptTitle}</span>
                  </span>
                  <OpenFolioIllustration className="w-16 h-10 text-[#243B8A]" />
                </div>
                <h3 className="type-book-title text-[#252832]">
                  {lang === 'mr'
                    ? 'तुमचे मूळ मराठी लेखन संपादकीय वाचनासाठी पाठवा.'
                    : 'Submit your original Marathi manuscript for editorial reading.'}
                </h3>
                <p className="text-[13.5px] text-[#525665] leading-[1.65]">
                  {t.home.manuscriptBody}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-[#E6E1D6]">
                <button
                  type="button"
                  onClick={() => onNavigate('/submit-manuscript')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{t.home.manuscriptCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>

          <ArchitecturalDivider className="py-2" />

          {/* =================================================================
              5. AUTHORS & LITERARY VOICES DIRECTORY STRIP
              ================================================================= */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#243B8A] mb-1">
                  <span className="font-mono">05</span>
                  <span aria-hidden="true">·</span>
                  <span>{t.home.authorsEyebrow}</span>
                </div>
                <h2 className="type-page-heading text-[#252832]">
                  {t.home.authorsTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('/authors')}
                className="text-[14px] font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1"
              >
                <span>{t.nav.authors}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {authors.slice(0, 6).map((author, idx) => {
                const authorBooks = books.filter((b) => b.authorId === author.id);
                return (
                  <motion.article
                    key={author.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.28, delay: idx * 0.04 }}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl border border-[#E6E1D6] p-5 flex flex-col justify-between hover:border-[#243B8A]/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[12px] text-[#525665]">
                        <span className="font-semibold text-[#243B8A]">
                          {author.region}
                        </span>
                        <span>{author.literaryRole}</span>
                      </div>

                      <h3 className="type-book-title text-[#252832]">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/authors/${author.slug}`)}
                          className="text-left hover:text-[#243B81] transition-colors"
                        >
                          {author.name}
                        </button>
                      </h3>

                      <p className="text-[13.5px] text-[#525665] line-clamp-2 leading-[1.6]">
                        {author.biography}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E6E1D6] flex items-center justify-between text-[12.5px]">
                      <span className="text-[#525665] truncate max-w-[180px]">
                        {authorBooks[0]?.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigate(`/authors/${author.slug}`)}
                        className="font-semibold text-[#243B8A] hover:underline shrink-0"
                      >
                        {lang === 'mr' ? 'परिचय →' : 'Profile →'}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
