import React, { useState, useEffect, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react';
import {
  EditorialArticle,
  FirstPageExcerpt,
  ReadingList,
  BookRecord,
  AuthorRecord,
} from '../types/publishing';
import { BookCoverArt } from '../components/BookCoverArt';
import { resolvePublicAssetUrl } from '../utils/githubPagesAdapter';
import {
  AnimatedTortoiseEmblem,
  ArchitecturalDivider,
} from '../components/SarvamIllustrations';
import { useLanguage } from '../i18n/translations';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShoppingBag,
  Check,
  Maximize2,
  Minimize2,
  BookOpen,
  SlidersHorizontal,
  List,
  X,
} from 'lucide-react';

// ============================================================================
// 1. VACHANKATTA HUB VIEW (/vachankatta & /vachankatta/:category)
// ============================================================================

interface VachankattaHubViewProps {
  articles: EditorialArticle[];
  excerpts: FirstPageExcerpt[];
  readingLists: ReadingList[];
  books: BookRecord[];
  authors: AuthorRecord[];
  activeSubRoute?: string;
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string) => void;
  onReactExcerpt: (
    excerptId: string,
    reactionType: 'readMore' | 'struckByLine' | 'wantContext'
  ) => void;
  recentlyAddedBookId: string | null;
}

export const VachankattaHubView: React.FC<VachankattaHubViewProps> = ({
  articles,
  excerpts,
  readingLists,
  books,
  authors,
  activeSubRoute = 'all',
  onNavigate,
  onAddToCart,
  onReactExcerpt,
  recentlyAddedBookId,
}) => {
  const { lang, t } = useLanguage();
  const [blindModeMap, setBlindModeMap] = useState<Record<string, boolean>>({});
  const [reactedMap, setReactedMap] = useState<Record<string, string>>({});
  const [activeFolioPageMap, setActiveFolioPageMap] = useState<Record<string, number>>({});
  const [showRawPdfMap, setShowRawPdfMap] = useState<Record<string, boolean>>({});

  const tabs = [
    { slug: 'all', label: t.vachankatta.allCategories, path: '/vachankatta' },
    { slug: 'articles', label: t.vachankatta.articles, path: '/vachankatta/articles' },
    { slug: 'reviews', label: t.vachankatta.reviews, path: '/vachankatta/reviews' },
    { slug: 'interviews', label: t.vachankatta.interviews, path: '/vachankatta/interviews' },
    { slug: 'first-page', label: t.vachankatta.firstPage, path: '/vachankatta/first-page' },
    {
      slug: 'reading-lists',
      label: t.vachankatta.readingLists,
      path: '/vachankatta/reading-lists',
    },
    {
      slug: 'literary-world',
      label: t.vachankatta.literaryWorld,
      path: '/vachankatta/literary-world',
    },
  ];

  const isBlind = (ex: FirstPageExcerpt) =>
    blindModeMap[ex.id] !== undefined ? blindModeMap[ex.id] : ex.blindModeDefault;

  const toggleBlind = (ex: FirstPageExcerpt) => {
    setBlindModeMap((prev) => ({ ...prev, [ex.id]: !isBlind(ex) }));
  };

  const handleReaction = (
    excerptId: string,
    reactionType: 'readMore' | 'struckByLine' | 'wantContext'
  ) => {
    const key = `${excerptId}:${reactionType}`;
    if (reactedMap[key]) return;
    setReactedMap((prev) => ({ ...prev, [key]: '1' }));
    onReactExcerpt(excerptId, reactionType);
  };

  const filteredArticles =
    activeSubRoute === 'all' ||
    activeSubRoute === 'first-page' ||
    activeSubRoute === 'reading-lists'
      ? articles
      : articles.filter((a) => a.categorySlug === activeSubRoute);

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
      {/* Editorial Masthead */}
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
            <span>{t.vachankatta.eyebrow}</span>
          </div>
          <h1 className="type-page-heading text-[#252832]">{t.vachankatta.title}</h1>
          <p className="mt-2.5 prose-marathi text-[#5A5F72] max-w-[64ch]">
            {t.vachankatta.subtitle}
          </p>

          {/* Segmented Editorial Section Controls with Layout Pill */}
          <div className="mt-7 inline-flex items-center gap-1 p-1 rounded-xl bg-[#F7F3E8] border border-[#E6DFCE] overflow-x-auto max-w-full">
            {tabs.map((tab) => {
              const active = activeSubRoute === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => onNavigate(tab.path)}
                  className={`relative px-4 py-2 rounded-lg text-[14px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'text-[#252832]'
                      : 'text-[#5A5F72] hover:text-[#252832]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="vachankatta-tab-pill"
                      className="absolute inset-0 bg-[#FFD966] rounded-lg shadow-2xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </section>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* ===================================================================
            FIRST PAGE EXCERPTS VIEW (/vachankatta/first-page or 'all')
            =================================================================== */}
        {(activeSubRoute === 'first-page' || activeSubRoute === 'all') && (
          <section className="space-y-8" data-testid="vachankatta-first-page-section">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <AnimatedTortoiseEmblem
                  className="w-10 h-10 shrink-0"
                  variant="indigo"
                  animate={true}
                />
                <div>
                  <p className="text-[12px] font-semibold text-[#243B8A]">
                    {t.home.firstPageEyebrow}
                  </p>
                  <h2 className="type-section-heading text-[#252832]">
                    {t.home.firstPageTitle}
                  </h2>
                </div>
              </div>
              <p className="text-[14px] text-[#5A5F72]">{t.vachankatta.blindModeToggle}</p>
            </div>

            <div className="space-y-8">
              {excerpts.map((ex, idx) => {
                const book = books.find((b) => b.id === ex.bookId);
                const author = authors.find((a) => a.id === ex.authorId);
                const blind = isBlind(ex);
                const folioPages = ex.folioPages || [];
                const currentFolioIdx = activeFolioPageMap[ex.id] ?? 0;
                const currentFolioPage = folioPages[currentFolioIdx];
                const showRawPdf = Boolean(showRawPdfMap[ex.id]);

                return (
                  <motion.article
                    key={ex.id}
                    data-testid={`first-page-card-${ex.id}`}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 space-y-6 shadow-[0_12px_36px_-18px_rgba(37,40,50,0.06)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#E6DFCE]">
                      <div className="flex items-start gap-4">
                        {!blind && book && (
                          <div className="w-16 sm:w-20 shrink-0 hidden xs:block sm:block">
                            <BookCoverArt
                              book={book}
                              author={author}
                              size="sm"
                              onClick={() => onNavigate(`/books/${book.slug}`)}
                            />
                          </div>
                        )}
                        <div>
                          <span className="text-[12px] font-semibold text-[#243B8A]">
                            {ex.genreMarathi}
                          </span>
                          <h3 className="type-section-heading text-[#252832] mt-1">
                            {blind ? ex.openingHook : `${ex.title} — ${book?.title}`}
                          </h3>
                          {!blind && author && (
                            <p className="text-[15px] text-[#5A5F72] mt-0.5 font-medium">
                              — {author.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {ex.pdfDocumentUrl && (
                          <a
                            href={resolvePublicAssetUrl(ex.pdfDocumentUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="first-page-pdf-download-link"
                            className="px-3.5 py-2 rounded-xl bg-[#FFD966] hover:bg-[#f5cb4d] text-[#252832] text-[13px] font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                          >
                            <BookOpen className="w-4 h-4 text-[#243B8A]" />
                            <span>
                              {lang === 'mr'
                                ? 'मूळ ६ पाने PDF उघडा ↗'
                                : 'Open 6-Page PDF ↗'}
                            </span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => toggleBlind(ex)}
                          className="px-4 py-2 rounded-xl bg-[#243B8A] hover:bg-[#1C2E6E] text-[#FFFDF7] text-[13px] font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                        >
                          {blind ? (
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
                      </div>
                    </div>

                    {/* Interactive 6-Page Preliminary Book Folio Viewer (Second PDF Integration) */}
                    {folioPages.length > 0 && currentFolioPage && (
                      <div
                        data-testid="first-page-pdf-folio-viewer"
                        className="rounded-2xl border border-[#E6DFCE] bg-[#F7F3E8]/90 p-4 sm:p-6 space-y-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DFCE] pb-3.5">
                          <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#243B8A] font-bold">
                              {lang === 'mr'
                                ? 'प्रारंभिक ६ पृष्ठे · मूळ मुद्रित संहिता (First Page PDF Folio)'
                                : 'Opening 6 Pages · Typeset Preliminary Folio'}
                            </span>
                            <h4 className="text-[16px] sm:text-[18px] font-serif font-bold text-[#252832] mt-0.5">
                              {lang === 'mr'
                                ? currentFolioPage.labelMarathi
                                : currentFolioPage.labelEnglish}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {ex.pdfDocumentUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowRawPdfMap((prev) => ({
                                    ...prev,
                                    [ex.id]: !prev[ex.id],
                                  }))
                                }
                                className="px-3 py-1.5 rounded-lg border border-[#E6DFCE] bg-white hover:border-[#243B8A] text-[12px] font-semibold text-[#243B8A] transition-colors cursor-pointer"
                              >
                                {showRawPdf
                                  ? lang === 'mr'
                                    ? 'पृष्ठनिहाय वाचन पहा'
                                    : 'Show Page Folio'
                                  : lang === 'mr'
                                  ? 'अंतर्गत PDF दर्शक'
                                  : 'Embedded PDF View'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setActiveFolioPageMap((prev) => ({
                                  ...prev,
                                  [ex.id]:
                                    (currentFolioIdx - 1 + folioPages.length) %
                                    folioPages.length,
                                }))
                              }
                              aria-label="Previous folio page"
                              className="w-8 h-8 rounded-lg border border-[#E6DFCE] bg-white hover:bg-[#FFD966]/40 inline-flex items-center justify-center text-[#252832] cursor-pointer"
                            >
                              <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span className="text-[12px] font-mono font-bold text-[#252832] px-1.5 tabular-nums">
                              {currentFolioPage.pageNumber} / {folioPages.length}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveFolioPageMap((prev) => ({
                                  ...prev,
                                  [ex.id]: (currentFolioIdx + 1) % folioPages.length,
                                }))
                              }
                              aria-label="Next folio page"
                              className="w-8 h-8 rounded-lg border border-[#E6DFCE] bg-white hover:bg-[#FFD966]/40 inline-flex items-center justify-center text-[#252832] cursor-pointer"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Page Number Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                          {folioPages.map((fp, pIdx) => {
                            const isActive = pIdx === currentFolioIdx;
                            return (
                              <button
                                key={fp.pageNumber}
                                type="button"
                                onClick={() =>
                                  setActiveFolioPageMap((prev) => ({
                                    ...prev,
                                    [ex.id]: pIdx,
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                                  isActive
                                    ? 'bg-[#243B8A] text-[#FFFDF7]'
                                    : 'bg-white text-[#5A5F72] hover:text-[#252832] border border-[#E6DFCE]'
                                }`}
                              >
                                {lang === 'mr' ? fp.labelMarathi : fp.labelEnglish}
                              </button>
                            );
                          })}
                        </div>

                        {showRawPdf && ex.pdfDocumentUrl ? (
                          <div className="rounded-xl overflow-hidden border border-[#E6DFCE] bg-white">
                            <iframe
                              src={resolvePublicAssetUrl(ex.pdfDocumentUrl)}
                              title={`${ex.title} PDF`}
                              className="w-full h-[480px]"
                            />
                          </div>
                        ) : (
                          /* Archival Book Page Sheet */
                          <div className="bg-[#FFFDF7] rounded-xl border border-[#E6DFCE] p-6 sm:p-8 shadow-2xs max-w-3xl mx-auto space-y-5">
                            {currentFolioPage.illustrationUrl && (
                              <div className="flex justify-center py-2">
                                <img
                                  src={resolvePublicAssetUrl(
                                    currentFolioPage.illustrationUrl
                                  )}
                                  alt={currentFolioPage.heading || 'Book illustration'}
                                  className="max-h-[290px] w-auto object-contain rounded-lg border border-[#E6DFCE] bg-white p-3"
                                />
                              </div>
                            )}

                            <div
                              className={`space-y-2 ${
                                currentFolioPage.pageNumber === 2 ||
                                currentFolioPage.pageNumber === 4
                                  ? 'text-center py-4'
                                  : ''
                              }`}
                            >
                              {currentFolioPage.heading && (
                                <h5 className="font-serif text-[22px] sm:text-[26px] font-bold text-[#252832]">
                                  {currentFolioPage.heading}
                                </h5>
                              )}
                              {currentFolioPage.sublines &&
                                currentFolioPage.sublines.map((sub, sIdx) => (
                                  <p
                                    key={sIdx}
                                    className="font-serif text-[16px] sm:text-[18px] font-semibold text-[#243B8A]"
                                  >
                                    {sub}
                                  </p>
                                ))}
                            </div>

                            {currentFolioPage.emblemUrl && (
                              <div className="flex justify-center py-2">
                                <img
                                  src={resolvePublicAssetUrl(
                                    currentFolioPage.emblemUrl
                                  )}
                                  alt="अकथ प्रकाशन बोधचिन्ह"
                                  className="h-24 w-auto object-contain"
                                />
                              </div>
                            )}

                            <div
                              className={`space-y-2.5 font-serif text-[15px] sm:text-[16.5px] text-[#252832] leading-relaxed ${
                                currentFolioPage.pageNumber === 2 ||
                                currentFolioPage.pageNumber === 4
                                  ? 'text-center'
                                  : ''
                              }`}
                            >
                              {currentFolioPage.bodyLines.map((line, lIdx) => (
                                <p
                                  key={lIdx}
                                  className={
                                    currentFolioPage.pageNumber === 6
                                      ? 'p-2.5 rounded-lg bg-[#F7F3E8] border border-[#E6DFCE] font-semibold text-[#252832]'
                                      : ''
                                  }
                                >
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <blockquote className="font-serif text-[21px] sm:text-[24px] text-[#252832] bg-[#FFD966]/20 border border-[#FFD966] rounded-2xl p-6 leading-[1.6]">
                      “{ex.highlightedLine}”
                    </blockquote>

                    <div className="prose-marathi text-[#252832] space-y-4">
                      {ex.excerptParagraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>

                    {/* Reader Literary Response Buttons & Book Reveal */}
                    <div className="pt-6 border-t border-[#E6DFCE] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleReaction(ex.id, 'readMore')}
                          className="px-3.5 py-2 rounded-xl text-[13px] font-medium border border-[#E6DFCE] bg-[#FFFDF7] hover:bg-[#FFD966]/35 text-[#252832] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                        >
                          <span>{t.vachankatta.reactionReadMore}</span>
                          <span className="font-bold text-[#243B8A] tabular-nums">
                            ({ex.reactions.readMore})
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReaction(ex.id, 'struckByLine')}
                          className="px-3.5 py-2 rounded-xl text-[13px] font-medium border border-[#E6DFCE] bg-[#FFFDF7] hover:bg-[#FFD966]/35 text-[#252832] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                        >
                          <span>{t.vachankatta.reactionStruckByLine}</span>
                          <span className="font-bold text-[#243B8A] tabular-nums">
                            ({ex.reactions.struckByLine})
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReaction(ex.id, 'wantContext')}
                          className="px-3.5 py-2 rounded-xl text-[13px] font-medium border border-[#E6DFCE] bg-[#FFFDF7] hover:bg-[#FFD966]/35 text-[#252832] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                        >
                          <span>{t.vachankatta.reactionWantContext}</span>
                          <span className="font-bold text-[#243B8A] tabular-nums">
                            ({ex.reactions.wantContext})
                          </span>
                        </button>
                      </div>

                      {book && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/books/${book.slug}`)}
                            className="text-[14px] font-semibold text-[#243B8A] hover:underline"
                          >
                            {book.title} (₹{book.price}) →
                          </button>
                          <button
                            type="button"
                            onClick={() => onAddToCart(book.id)}
                            className={`px-4 py-2 rounded-xl text-[13px] font-semibold text-[#FFFDF7] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                              recentlyAddedBookId === book.id
                                ? 'bg-[#15803D]'
                                : 'bg-[#EF6855] hover:bg-[#DE5542]'
                            }`}
                          >
                            {recentlyAddedBookId === book.id ? (
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
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
        )}

        {/* ===================================================================
            CURATED READING LISTS (/vachankatta/reading-lists or 'all')
            =================================================================== */}
        {(activeSubRoute === 'reading-lists' || activeSubRoute === 'all') && (
          <section className="space-y-8">
            <div>
              <p className="text-[12px] font-semibold text-[#243B8A]">
                {t.vachankatta.readingLists}
              </p>
              <h2 className="type-section-heading text-[#252832] mt-1">
                {lang === 'mr'
                  ? 'संपादक आणि लेखकांनी सुचवलेल्या वाचन याद्या'
                  : 'Thematic Reading Lists Curated by Editors & Authors'}
              </h2>
            </div>

            <div className="space-y-8">
              {readingLists.map((list) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-6"
                >
                  <div className="border-b border-[#E6DFCE] pb-4">
                    <span className="text-[12px] font-semibold text-[#243B8A]">
                      {list.themeTag} · {list.curatorName} ({list.curatorRole})
                    </span>
                    <h3 className="type-section-heading text-[#252832] mt-1">
                      {list.title}
                    </h3>
                    <p className="text-[15px] text-[#5A5F72] mt-2 max-w-[65ch]">
                      {list.introduction}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {list.items.map((item) => {
                      const b = books.find((bk) => bk.id === item.bookId);
                      const a = authors.find((au) => au.id === b?.authorId);
                      if (!b) return null;
                      return (
                        <div
                          key={item.bookId}
                          className="bg-[#FFFDF7] rounded-2xl border border-[#E6DFCE] p-4 flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-16 shrink-0">
                              <BookCoverArt
                                book={b}
                                author={a}
                                size="sm"
                                onClick={() => onNavigate(`/books/${b.slug}`)}
                              />
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => onNavigate(`/books/${b.slug}`)}
                                className="font-serif text-[18px] font-bold text-[#252832] hover:text-[#243B8A] text-left leading-snug"
                              >
                                {b.title}
                              </button>
                              {a && (
                                <p className="text-[13px] text-[#5A5F72] mt-0.5">{a.name}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-[14px] text-[#5A5F72] leading-relaxed">
                            “{item.curatorComment}”
                          </p>
                          <div className="pt-2 flex items-center justify-between border-t border-[#E6DFCE]">
                            <span className="text-[15px] font-bold text-[#252832] tabular-nums">
                              ₹{b.price}
                            </span>
                            <button
                              type="button"
                              onClick={() => onNavigate(`/books/${b.slug}`)}
                              className="text-[13px] font-semibold text-[#243B8A] hover:underline"
                            >
                              {t.book.viewDetails} →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ===================================================================
            EDITORIAL ESSAYS, REVIEWS & INTERVIEWS
            =================================================================== */}
        {activeSubRoute !== 'first-page' && activeSubRoute !== 'reading-lists' && (
          <section className="space-y-6">
            <h2 className="type-section-heading text-[#252832]">
              {lang === 'mr'
                ? 'दीर्घ निबंध, पुस्तक समीक्षा आणि मुलाखती'
                : 'Long-Form Essays, Critical Reviews & Author Conversations'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map((art, idx) => (
                <motion.article
                  key={art.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-7 hover:border-[#243B8A]/40 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[12px] text-[#5A5F72]">
                      <span className="font-semibold text-[#243B8A]">
                        {art.categoryMarathi}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {art.readingTimeMinutes} {t.vachankatta.readingTime}
                      </span>
                    </div>

                    <h3 className="type-section-heading text-[#252832] hover:text-[#243B8A] transition-colors">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                        className="text-left"
                      >
                        {art.title}
                      </button>
                    </h3>
                    <p className="font-serif text-[17px] text-[#5A5F72]">
                      {art.subtitle}
                    </p>
                    <p className="text-[15px] text-[#5A5F72] line-clamp-3 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E6DFCE] flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-[#252832]">
                      {art.contributorName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                      className="text-[14px] font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1"
                    >
                      <span>{t.vachankatta.readFullArticle}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. ARTICLE DETAIL VIEW (/vachankatta/:slug) — IMMERSIVE READING MODE
//    - Hides primary navigation and editorial sidebar on scroll (or manual lock)
//    - Dynamically computes Marathi line-height based on live viewport width
//      to protect Devanagari upper/lower matras across mobile, tablet & desktop
// ============================================================================

export function computeDynamicMarathiLineHeight(
  viewportWidth: number,
  isImmersive: boolean,
  leadingScale: 'compact' | 'adaptive' | 'spacious' = 'adaptive'
): number {
  const clampedRatio = Math.min(
    1,
    Math.max(0, (viewportWidth - 360) / (1440 - 360))
  );
  // Fluidly scales from 1.84 on 360px mobile to 2.04 on 1440px desktop
  let lh = 1.84 + clampedRatio * 0.2;
  if (isImmersive) {
    lh += 0.04;
  }
  if (leadingScale === 'compact') {
    lh -= 0.06;
  } else if (leadingScale === 'spacious') {
    lh += 0.08;
  }
  return Number(lh.toFixed(3));
}

interface ArticleDetailViewProps {
  article: EditorialArticle;
  allBooks: BookRecord[];
  allAuthors: AuthorRecord[];
  allArticles: EditorialArticle[];
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string) => void;
  onImmersiveChange?: (isImmersive: boolean) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  allBooks,
  allAuthors,
  allArticles,
  onNavigate,
  onAddToCart,
  onImmersiveChange,
}) => {
  const { lang, t } = useLanguage();
  const [immersivePreference, setImmersivePreference] = useState<
    'auto' | 'on' | 'off'
  >('auto');
  const [isScrollImmersive, setIsScrollImmersive] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const [leadingScale, setLeadingScale] = useState<
    'compact' | 'adaptive' | 'spacious'
  >('adaptive');
  const [readingSurface, setReadingSurface] = useState<
    'cream' | 'sepia' | 'ink'
  >('cream');
  const [copiedQuoteKey, setCopiedQuoteKey] = useState<string | null>(null);
  const [mobileOutlineOpen, setMobileOutlineOpen] = useState(false);
  const lastScrollYRef = useRef<number>(0);

  // Touch-gesture motion values for the mobile reading companion bottom-sheet drawer
  const sheetDragY = useMotionValue(0);
  const sheetBackdropOpacity = useTransform(sheetDragY, [0, 320], [1, 0.12]);
  const sheetTouchRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    trackingVertical: boolean | null;
  } | null>(null);

  const handleCopyPullQuote = (quoteText: string, key: string) => {
    const formatted = `“${quoteText}” — ${article.title} (${article.contributorName}, अकथ प्रकाशन वाचनकट्टा)`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formatted).catch(() => {});
    }
    setCopiedQuoteKey(key);
    window.setTimeout(() => setCopiedQuoteKey(null), 2200);
  };

  const isImmersiveActive =
    !mobileOutlineOpen &&
    (immersivePreference === 'on' ||
      (immersivePreference === 'auto' && isScrollImmersive));

  // Sync primary Navbar visibility with parent App
  useEffect(() => {
    onImmersiveChange?.(isImmersiveActive);
  }, [isImmersiveActive, onImmersiveChange]);

  useEffect(() => {
    return () => {
      onImmersiveChange?.(false);
    };
  }, [onImmersiveChange]);

  // Reset bottom-sheet drag offset and handle Escape key when open
  useEffect(() => {
    sheetDragY.set(0);
    if (!mobileOutlineOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOutlineOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOutlineOpen, sheetDragY]);

  const handleSheetDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.y > 72 || info.velocity.y > 380) {
      setMobileOutlineOpen(false);
    } else {
      sheetDragY.set(0);
    }
  };

  const handleSheetTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    sheetTouchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      trackingVertical: null,
    };
  };

  const handleSheetTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const state = sheetTouchRef.current;
    if (!state || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;

    if (state.trackingVertical === null) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      state.trackingVertical = Math.abs(deltaY) > Math.abs(deltaX) * 1.2;
    }

    if (state.trackingVertical && deltaY > 0) {
      sheetDragY.set(Math.min(380, deltaY));
    }
  };

  const handleSheetTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const state = sheetTouchRef.current;
    sheetTouchRef.current = null;
    if (!state || e.changedTouches.length === 0) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;
    const elapsed = Math.max(1, Date.now() - state.startTime);
    const velocityY = (deltaY / elapsed) * 1000;

    if (
      state.trackingVertical &&
      Math.abs(deltaY) > Math.abs(deltaX) * 1.15 &&
      (deltaY > 72 || velocityY > 380)
    ) {
      setMobileOutlineOpen(false);
    } else {
      sheetDragY.set(0);
    }
  };

  // Track viewport width to dynamically optimize Devanagari line-height
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll listener: hide primary navbar & sidebar when scrolling down into the essay
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;
    const updateScrollState = () => {
      rafId = null;
      const currentY = window.scrollY || 0;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        docHeight > 0
          ? Math.min(100, Math.max(0, Math.round((currentY / docHeight) * 100)))
          : 0;
      setReadingProgress((prev) =>
        progress === 0 || progress === 100 || Math.abs(prev - progress) >= 2
          ? progress
          : prev
      );

      const delta = currentY - lastScrollYRef.current;
      if (currentY <= 64) {
        setIsScrollImmersive((prev) => (prev ? false : prev));
      } else if (delta > 10 && currentY > 96) {
        setIsScrollImmersive((prev) => (prev ? prev : true));
      } else if (delta < -16) {
        setIsScrollImmersive((prev) => (prev ? false : prev));
      }
      lastScrollYRef.current = currentY;
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateScrollState);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const dynamicLineHeight = computeDynamicMarathiLineHeight(
    viewportWidth,
    isImmersiveActive,
    leadingScale
  );

  const viewportTierLabel =
    viewportWidth < 640
      ? lang === 'mr'
        ? 'मोबाईल वाचन मांडणी'
        : 'Mobile Reading Measure'
      : viewportWidth < 1024
      ? lang === 'mr'
        ? 'टॅब्लेट वाचन मांडणी'
        : 'Tablet Reading Measure'
      : lang === 'mr'
      ? 'विस्तृत संपादकीय मांडणी'
      : 'Wide Editorial Measure';

  const relatedBooks = allBooks.filter((b) =>
    article.relatedBookIds.includes(b.id)
  );
  const otherArticles = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const handleToggleImmersive = () => {
    setImmersivePreference((prev) => {
      if (prev === 'on') return 'off';
      if (prev === 'off') return 'on';
      return isScrollImmersive ? 'off' : 'on';
    });
  };

  const handleCycleLeading = () => {
    setLeadingScale((prev) =>
      prev === 'adaptive'
        ? 'spacious'
        : prev === 'spacious'
        ? 'compact'
        : 'adaptive'
    );
  };

  return (
    <div
      data-testid="immersive-article-container"
      data-immersive-active={isImmersiveActive ? 'true' : 'false'}
      data-dynamic-line-height={dynamicLineHeight}
      style={
        {
          '--dynamic-marathi-lh': String(dynamicLineHeight),
        } as React.CSSProperties
      }
      className="bg-[#FFFDF7] text-[#252832] min-h-screen relative transition-colors duration-300"
    >
      {/* Top 2px Reading Progress Hairline */}
      <div
        data-testid="immersive-reading-progress"
        aria-hidden="true"
        className="fixed top-0 inset-x-0 z-50 h-0.5 bg-[#E6DFCE]/60 pointer-events-none"
      >
        <div
          className="h-full bg-[#243B8A] transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Top Breadcrumb & Immersive Reading Toolbar (hides smoothly on scroll in immersive mode) */}
      <div
        data-testid="article-top- subbar"
        className={`bg-white border-b border-[#E6DFCE] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isImmersiveActive
            ? '-translate-y-full opacity-0 pointer-events-none max-h-0 overflow-hidden border-b-0'
            : 'translate-y-0 opacity-100 max-h-28'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-[13.5px] text-[#5A5F72]">
          <button
            type="button"
            onClick={() => onNavigate('/vachankatta')}
            className="inline-flex items-center gap-2 font-medium hover:text-[#243B8A] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav.vachankatta}</span>
          </button>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="hidden md:inline text-[12.5px] text-[#5A5F72]">
              {viewportTierLabel} · LH {dynamicLineHeight}
            </span>

            <button
              type="button"
              data-testid="immersive-leading-cycle-btn"
              onClick={handleCycleLeading}
              className="px-2.5 py-1 rounded-lg bg-[#F7F3E8] hover:bg-[#FFD966]/45 text-[#252832] text-[12px] font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title={
                lang === 'mr'
                  ? 'ओळींमधील अंतर बदला'
                  : 'Adjust Marathi line-height spacing'
              }
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#243B8A]" />
              <span>
                {leadingScale === 'adaptive'
                  ? lang === 'mr'
                    ? 'लवचिक उंची'
                    : 'Adaptive LH'
                  : leadingScale === 'spacious'
                  ? lang === 'mr'
                    ? 'मोकळी उंची'
                    : 'Spacious LH'
                  : lang === 'mr'
                  ? 'संक्षिप्त उंची'
                  : 'Compact LH'}
              </span>
            </button>

            {/* Reading Comfort Surface Switcher (Cream / Sepia / Ink) */}
            <div
              role="group"
              aria-label="Reading Paper Theme"
              className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-[#F7F3E8] border border-[#E6DFCE]"
            >
              {(
                [
                  { id: 'cream', label: lang === 'mr' ? 'कागद' : 'Cream' },
                  { id: 'sepia', label: lang === 'mr' ? 'सेपिया' : 'Sepia' },
                  { id: 'ink', label: lang === 'mr' ? 'रात्र' : 'Night' },
                ] as const
              ).map((surf) => (
                <button
                  key={surf.id}
                  type="button"
                  onClick={() => setReadingSurface(surf.id)}
                  className={`px-2 py-1 rounded-md text-[11.5px] font-medium transition-colors cursor-pointer ${
                    readingSurface === surf.id
                      ? 'bg-[#243B8A] text-[#FFFDF7]'
                      : 'text-[#5A5F72] hover:text-[#252832]'
                  }`}
                >
                  {surf.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              data-testid="mobile-article-drawer-trigger"
              aria-expanded={mobileOutlineOpen}
              aria-controls="akath-mobile-article-drawer"
              onClick={() => setMobileOutlineOpen(true)}
              className="lg:hidden px-2.5 py-1.5 rounded-lg bg-[#F7F3E8] hover:bg-[#FFD966]/45 border border-[#E6DFCE] text-[#243B8A] text-[12px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <List className="w-3.5 h-3.5 text-[#243B8A]" />
              <span>
                {lang === 'mr' ? 'लेखाची रूपरेषा' : 'Essay Outline'}
              </span>
            </button>

            <button
              type="button"
              data-testid="immersive-reading-toggle"
              aria-pressed={isImmersiveActive}
              onClick={handleToggleImmersive}
              className="px-3 py-1.5 rounded-lg bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#FFD966]" />
              <span>
                {lang === 'mr' ? 'एकाग्र वाचन मोड' : 'Immersive Reading'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 12-Column Editorial Layout: Essay Column + Hide-on-Scroll Sidebar */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Primary Long-Form Essay Column (expands & centers when sidebar hides on scroll) */}
          <article
            className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isImmersiveActive
                ? 'lg:col-span-12 max-w-[780px] mx-auto w-full'
                : 'lg:col-span-8 w-full'
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`rounded-3xl border p-6 sm:p-10 lg:p-12 transition-colors duration-200 ${
                readingSurface === 'ink'
                  ? 'bg-[#18181B] text-[#F4EFE4] border-[#27272A]'
                  : readingSurface === 'sepia'
                  ? 'bg-[#F3EAD8] text-[#1C1917] border-[#D6C7AE]'
                  : 'bg-white text-[#252832] border-[#E6DFCE]'
              }`}
            >
              <header className="space-y-4 border-b border-current/15 pb-8 mb-8">
                <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#243B8A]">
                  <span>{article.categoryMarathi}</span>
                  <span aria-hidden="true">·</span>
                  <span className="opacity-75 font-normal">
                    {article.publishedAt}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="opacity-75 font-normal">
                    {article.readingTimeMinutes} {t.vachankatta.readingTime}
                  </span>
                </div>

                <h1 className="type-article-headline">
                  {article.title}
                </h1>

                <p className="font-serif text-[20px] opacity-80 leading-[1.65]">
                  {article.subtitle}
                </p>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-4 text-[14px] opacity-80">
                  <div>
                    <span className="font-bold">
                      {article.contributorName}
                    </span>{' '}
                    — {article.contributorRole}
                  </div>
                  <span
                    data-testid="article-dynamic-lh-readout"
                    className="font-mono text-[12px] tabular-nums"
                  >
                    {viewportWidth}px · LH {dynamicLineHeight}
                  </span>
                </div>
              </header>

              {/* Lead Paragraph with Dynamic Viewport Marathi Line-Height */}
              <p
                data-testid="article-lead-paragraph"
                style={{ lineHeight: dynamicLineHeight }}
                className="font-serif text-[19px] sm:text-[21px] mb-8 transition-[line-height] duration-300"
              >
                {article.leadParagraph}
              </p>

              {/* Long-Form Marathi Essay Sections */}
              <div
                data-testid="article-immersive-prose"
                style={{ lineHeight: dynamicLineHeight }}
                className="space-y-10 prose-marathi-immersive"
              >
                {article.sections.map((sec) => (
                  <section key={sec.id} id={`section-${sec.id}`} className="space-y-5">
                    {sec.heading && (
                      <h2 className="type-section-heading pt-2">
                        {sec.heading}
                      </h2>
                    )}
                    {sec.paragraphs.map((p, idx) => (
                      <p key={idx} style={{ lineHeight: dynamicLineHeight }}>
                        {p}
                      </p>
                    ))}
                    {sec.pullQuote && (
                      <blockquote className="my-8 bg-[#FFD966]/20 border border-[#FFD966] rounded-2xl p-6 font-serif text-[21px] leading-[1.65] space-y-3">
                        <p>“{sec.pullQuote}”</p>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleCopyPullQuote(sec.pullQuote!, sec.id)}
                            className="text-[12px] font-mono font-semibold text-[#243B8A] hover:underline cursor-pointer"
                          >
                            {copiedQuoteKey === sec.id
                              ? lang === 'mr'
                                ? '✓ अवतरण कॉपी झाले'
                                : '✓ Quote Copied'
                              : lang === 'mr'
                              ? 'अवतरण शेअर / कॉपी करा'
                              : 'Copy Literary Quote'}
                          </button>
                        </div>
                      </blockquote>
                    )}
                  </section>
                ))}
              </div>

              {/* Tortoise Literary Colophon Stamp at the End of the Essay */}
              <div className="mt-12 pt-6">
                <ArchitecturalDivider />
                <p className="mt-3 text-center text-[12px] text-[#5A5F72] font-medium">
                  {lang === 'mr'
                    ? 'अकथ प्रकाशन · वाचनकट्टा संपादकीय मुद्रा'
                    : 'Akath Prakashan · Vachankatta Editorial Imprint'}
                </p>
              </div>
            </motion.div>
          </article>

          {/* Editorial Sidebar — Hides smoothly on scroll in Immersive Reading Mode */}
          <aside
            data-testid="article-reading-sidebar"
            data-sidebar-hidden={isImmersiveActive ? 'true' : 'false'}
            aria-hidden={isImmersiveActive ? true : undefined}
            className={`lg:col-span-4 space-y-6 lg:sticky lg:top-24 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isImmersiveActive
                ? 'opacity-0 translate-x-6 pointer-events-none lg:hidden'
                : 'opacity-100 translate-x-0'
            }`}
          >
            {/* 1. Essay Section Outline */}
            {article.sections.some((s) => Boolean(s.heading)) && (
              <div className="bg-white rounded-2xl border border-[#E6DFCE] p-5 space-y-3">
                <div className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.14em] text-[#243B8A] font-semibold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'mr' ? 'लेखातील विभाग' : 'Essay Outline'}
                  </span>
                </div>
                <ul className="space-y-2 text-[14px] text-[#5A5F72]">
                  {article.sections
                    .filter((s) => Boolean(s.heading))
                    .map((sec, idx) => (
                      <li key={sec.id}>
                        <a
                          href={`#section-${sec.id}`}
                          className="hover:text-[#243B8A] transition-colors inline-flex items-baseline gap-2"
                        >
                          <span className="font-mono text-[11px] text-[#243B8A]">
                            0{idx + 1}.
                          </span>
                          <span>{sec.heading}</span>
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* 2. Books Discussed in This Essay */}
            {relatedBooks.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E6DFCE] p-5 space-y-4">
                <h3 className="text-[15px] font-serif font-bold text-[#252832]">
                  {lang === 'mr'
                    ? 'या लेखाशी संबंधित पुस्तके'
                    : 'Books Discussed in This Essay'}
                </h3>
                <div className="space-y-4 divide-y divide-[#E6DFCE]">
                  {relatedBooks.map((book) => {
                    const author = allAuthors.find(
                      (a) => a.id === book.authorId
                    );
                    return (
                      <div
                        key={book.id}
                        className="pt-4 first:pt-0 flex flex-col gap-3"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-14 shrink-0">
                            <BookCoverArt
                              book={book}
                              author={author}
                              size="sm"
                              onClick={() => onNavigate(`/books/${book.slug}`)}
                            />
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => onNavigate(`/books/${book.slug}`)}
                              className="font-serif text-[16px] font-bold text-[#252832] hover:text-[#243B8A] text-left leading-snug"
                            >
                              {book.title}
                            </button>
                            {author && (
                              <p className="text-[13px] text-[#5A5F72]">
                                {author.name}
                              </p>
                            )}
                            <p className="text-[14px] font-bold text-[#252832] mt-1 tabular-nums">
                              ₹{book.price}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/books/${book.slug}`)}
                            className="text-[13px] text-[#243B8A] font-semibold hover:underline"
                          >
                            {t.book.viewDetails}
                          </button>
                          <button
                            type="button"
                            onClick={() => onAddToCart(book.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[12.5px] font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {t.book.addToCart}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Further Reading on Vachankatta */}
            {otherArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E6DFCE] p-5 space-y-3">
                <h3 className="text-[15px] font-serif font-bold text-[#252832]">
                  {lang === 'mr' ? 'वाचनकट्ट्यावरील इतर लेख' : 'Further Reading'}
                </h3>
                <div className="divide-y divide-[#E6DFCE]">
                  {otherArticles.map((art) => (
                    <div key={art.id} className="py-2.5 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                        className="font-serif text-[15px] font-semibold text-[#252832] hover:text-[#243B8A] text-left leading-snug cursor-pointer"
                      >
                        {art.title}
                      </button>
                      <p className="text-[12px] text-[#5A5F72] mt-0.5">
                        {art.contributorName} · {art.readingTimeMinutes}{' '}
                        {t.vachankatta.readingTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Floating Minimal Restore Dock when Immersive Reading Mode is Active */}
      <div
        data-testid="immersive-floating-controls"
        className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 transition-all duration-300 ${
          isImmersiveActive
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={() => setMobileOutlineOpen(true)}
          className="lg:hidden px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#E6DFCE] shadow-md text-[12px] font-semibold text-[#243B8A] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <List className="w-3.5 h-3.5" />
          <span>{lang === 'mr' ? 'रूपरेषा' : 'Outline'}</span>
        </button>
        <button
          type="button"
          onClick={handleCycleLeading}
          className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#E6DFCE] shadow-md text-[12px] font-mono text-[#252832] hover:border-[#243B8A] transition-colors cursor-pointer tabular-nums"
        >
          LH {dynamicLineHeight}
        </button>
        <button
          type="button"
          data-testid="immersive-floating-restore-btn"
          onClick={() => setImmersivePreference('off')}
          className="px-3.5 py-2 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] shadow-md text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Minimize2 className="w-3.5 h-3.5 text-[#FFD966]" />
          <span>
            {lang === 'mr' ? 'नेव्हिगेशन दाखवा' : 'Exit Immersive'}
          </span>
        </button>
      </div>

      {/* =====================================================================
          MOBILE & TABLET READING COMPANION BOTTOM-SHEET DRAWER (SWIPE DOWN TO DISMISS)
          ===================================================================== */}
      <AnimatePresence>
        {mobileOutlineOpen && (
          <div
            data-testid="mobile-article-drawer-overlay"
            className="fixed inset-0 z-[95] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={
              lang === 'mr'
                ? 'लेखाची रूपरेषा आणि वाचन साधने'
                : 'Essay Outline and Reading Companion'
            }
          >
            {/* Dynamic Frosted Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ opacity: sheetBackdropOpacity }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setMobileOutlineOpen(false)}
              className="fixed inset-0 archival-frosted-overlay"
              aria-hidden="true"
            />

            {/* Touch-Gesture Bottom Sheet */}
            <motion.div
              id="akath-mobile-article-drawer"
              data-testid="mobile-article-drawer"
              data-touch-gesture="swipe-down-to-close"
              style={{ y: sheetDragY }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 420 }}
              dragDirectionLock={true}
              dragElastic={{ top: 0.05, bottom: 0.55 }}
              onDragEnd={handleSheetDragEnd}
              onTouchStart={handleSheetTouchStart}
              onTouchMove={handleSheetTouchMove}
              onTouchEnd={handleSheetTouchEnd}
              transition={{
                type: 'spring',
                stiffness: 350,
                damping: 34,
                mass: 0.9,
              }}
              className="fixed inset-x-0 bottom-0 max-h-[82dvh] rounded-t-3xl akath-touch-bottom-sheet text-[#252832] flex flex-col overflow-hidden z-10"
            >
              {/* Tactile Top Grab Handle Bar */}
              <div
                data-testid="mobile-article-drawer-handle"
                className="pt-3 pb-2 px-5 flex flex-col items-center justify-center border-b border-[#E6DFCE] bg-[#FFFDF7] shrink-0 select-none"
              >
                <span className="w-12 h-1.5 rounded-full bg-[#243B8A]/25 mb-2.5" />
                <div className="w-full flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#243B8A]">
                    <BookOpen className="w-4 h-4" />
                    <span>
                      {lang === 'mr'
                        ? 'वाचनकट्टा सोबती · रूपरेषा व ग्रंथ'
                        : 'Reading Companion · Outline & Books'}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-testid="mobile-article-drawer-close"
                    onClick={() => setMobileOutlineOpen(false)}
                    aria-label={lang === 'mr' ? 'बंद करा' : 'Close companion drawer'}
                    className="p-1.5 rounded-xl bg-[#F7F3E8] hover:bg-[#FFD966]/40 text-[#252832] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Sheet Body */}
              <div className="p-5 space-y-5 overflow-y-auto overscroll-contain">
                {/* Reading Comfort Quick Bar */}
                <div className="p-3.5 rounded-2xl bg-[#F7F3E8] border border-[#E6DFCE] flex flex-wrap items-center justify-between gap-2.5">
                  <span className="text-[12px] font-semibold text-[#252832]">
                    {lang === 'mr' ? 'कागद व ओळींमधील अंतर' : 'Paper & Line Spacing'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(
                      [
                        { id: 'cream', label: lang === 'mr' ? 'कागद' : 'Cream' },
                        { id: 'sepia', label: lang === 'mr' ? 'सेपिया' : 'Sepia' },
                        { id: 'ink', label: lang === 'mr' ? 'रात्र' : 'Night' },
                      ] as const
                    ).map((surf) => (
                      <button
                        key={surf.id}
                        type="button"
                        onClick={() => setReadingSurface(surf.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11.5px] font-semibold transition-colors cursor-pointer ${
                          readingSurface === surf.id
                            ? 'bg-[#243B8A] text-[#FFFDF7]'
                            : 'bg-white text-[#5A5F72] border border-[#E6DFCE]'
                        }`}
                      >
                        {surf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Essay Section Outline */}
                {article.sections.some((s) => Boolean(s.heading)) && (
                  <div className="space-y-2.5">
                    <h4 className="text-[11.5px] font-mono uppercase tracking-[0.14em] text-[#243B8A] font-semibold">
                      {lang === 'mr' ? 'लेखातील विभाग' : 'Essay Sections'}
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {article.sections
                        .filter((s) => Boolean(s.heading))
                        .map((sec, idx) => (
                          <a
                            key={sec.id}
                            href={`#section-${sec.id}`}
                            onClick={() => setMobileOutlineOpen(false)}
                            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E6DFCE] hover:border-[#243B8A] text-[14px] text-[#252832] flex items-baseline gap-2.5 transition-colors"
                          >
                            <span className="font-mono text-[11px] font-bold text-[#243B8A]">
                              0{idx + 1}.
                            </span>
                            <span className="font-medium">{sec.heading}</span>
                          </a>
                        ))}
                    </div>
                  </div>
                )}

                {/* Books Discussed in This Essay */}
                {relatedBooks.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-[#E6DFCE]">
                    <h4 className="text-[13.5px] font-serif font-bold text-[#252832]">
                      {lang === 'mr'
                        ? 'या लेखाशी संबंधित पुस्तके'
                        : 'Books Discussed in This Essay'}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {relatedBooks.map((book) => {
                        const author = allAuthors.find(
                          (a) => a.id === book.authorId
                        );
                        return (
                          <div
                            key={book.id}
                            className="p-3 rounded-2xl bg-white border border-[#E6DFCE] flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setMobileOutlineOpen(false);
                                  onNavigate(`/books/${book.slug}`);
                                }}
                                className="font-serif text-[15px] font-bold text-[#252832] hover:text-[#243B8A] text-left block truncate cursor-pointer"
                              >
                                {book.title}
                              </button>
                              <span className="text-[12px] text-[#5A5F72] block">
                                {author?.name} · ₹{book.price}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => onAddToCart(book.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[12px] font-semibold shrink-0 cursor-pointer"
                            >
                              {t.book.addToCart}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
