import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  EditorialArticle,
  FirstPageExcerpt,
  ReadingList,
  BookRecord,
  AuthorRecord,
} from '../types/publishing';
import { BookCoverArt } from '../components/BookCoverArt';
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
          <section className="space-y-8">
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

                return (
                  <motion.article
                    key={ex.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 space-y-6 shadow-[0_12px_36px_-18px_rgba(37,40,50,0.06)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E6DFCE]">
                      <div>
                        <span className="text-[12px] font-semibold text-[#243B8A]">
                          {ex.genreMarathi}
                        </span>
                        <h3 className="type-section-heading text-[#252832] mt-1">
                          {blind ? ex.openingHook : `${ex.title} — ${book?.title}`}
                        </h3>
                        {!blind && author && (
                          <p className="text-[15px] text-[#5A5F72] mt-0.5">
                            {author.name}
                          </p>
                        )}
                      </div>

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
                          <div>
                            <button
                              type="button"
                              onClick={() => onNavigate(`/books/${b.slug}`)}
                              className="font-serif text-[18px] font-bold text-[#252832] hover:text-[#243B8A] text-left"
                            >
                              {b.title}
                            </button>
                            {a && (
                              <p className="text-[13px] text-[#5A5F72]">{a.name}</p>
                            )}
                            <p className="text-[14px] text-[#5A5F72] mt-2 leading-relaxed">
                              “{item.curatorComment}”
                            </p>
                          </div>
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
// 2. ARTICLE DETAIL VIEW (/vachankatta/:slug)
// ============================================================================

interface ArticleDetailViewProps {
  article: EditorialArticle;
  allBooks: BookRecord[];
  allAuthors: AuthorRecord[];
  allArticles: EditorialArticle[];
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  allBooks,
  allAuthors,
  onNavigate,
  onAddToCart,
}) => {
  const { lang, t } = useLanguage();
  const relatedBooks = allBooks.filter((b) =>
    article.relatedBookIds.includes(b.id)
  );

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-[#E6DFCE]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-[14px] text-[#5A5F72]">
          <button
            type="button"
            onClick={() => onNavigate('/vachankatta')}
            className="inline-flex items-center gap-2 font-medium hover:text-[#243B8A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav.vachankatta}</span>
          </button>
          <span>
            {article.categoryMarathi} · {article.readingTimeMinutes}{' '}
            {t.vachankatta.readingTime}
          </span>
        </div>
      </div>

      {/* Long-form Literary Essay Container */}
      <article className="max-w-[820px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 lg:p-12"
        >
          <header className="space-y-4 border-b border-[#E6DFCE] pb-8 mb-8">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#243B8A]">
              <span>{article.categoryMarathi}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#5A5F72] font-normal">
                {article.publishedAt}
              </span>
            </div>

            <h1 className="type-article-headline text-[#252832]">
              {article.title}
            </h1>

            <p className="font-serif text-[20px] text-[#5A5F72] leading-[1.6]">
              {article.subtitle}
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-between gap-4 text-[14px] text-[#5A5F72]">
              <div>
                <span className="font-bold text-[#252832]">
                  {article.contributorName}
                </span>{' '}
                — {article.contributorRole}
              </div>
              <span>
                {article.readingTimeMinutes} {t.vachankatta.readingTime}
              </span>
            </div>
          </header>

          {/* Lead Paragraph */}
          <p className="font-serif text-[20px] text-[#252832] leading-[1.85] mb-8">
            {article.leadParagraph}
          </p>

          {/* Sections */}
          <div className="space-y-10 prose-marathi text-[#252832]">
            {article.sections.map((sec) => (
              <section key={sec.id} className="space-y-5">
                {sec.heading && (
                  <h2 className="type-section-heading text-[#252832] pt-2">
                    {sec.heading}
                  </h2>
                )}
                {sec.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
                {sec.pullQuote && (
                  <blockquote className="my-8 bg-[#FFD966]/20 border border-[#FFD966] rounded-2xl p-6 font-serif text-[21px] text-[#252832] leading-[1.6]">
                    “{sec.pullQuote}”
                  </blockquote>
                )}
              </section>
            ))}
          </div>

          {/* Tortoise Literary Colophon Stamp at the End of the Essay */}
          <div className="mt-12 pt-6">
            <ArchitecturalDivider />
            <p className="mt-3 text-center text-[12px] text-[#5A5F72] font-medium">
              अकथ प्रकाशन · वाचनकट्टा संपादकीय मुद्रा
            </p>
          </div>
        </motion.div>

        {/* Related Books Mentioned in Essay */}
        {relatedBooks.length > 0 && (
          <aside className="mt-10 space-y-4">
            <h3 className="type-section-heading text-[#252832]">
              {lang === 'mr'
                ? 'या लेखाशी संबंधित पुस्तके'
                : 'Books Discussed in This Essay'}
            </h3>
            <div className="space-y-4">
              {relatedBooks.map((book) => {
                const author = allAuthors.find((a) => a.id === book.authorId);
                return (
                  <div
                    key={book.id}
                    className="bg-white rounded-2xl border border-[#E6DFCE] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 shrink-0">
                        <BookCoverArt
                          book={book}
                          author={author}
                          size="sm"
                          onClick={() => onNavigate(`/books/${book.slug}`)}
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => onNavigate(`/books/${book.slug}`)}
                          className="font-serif text-[18px] font-bold text-[#252832] hover:text-[#243B8A] text-left"
                        >
                          {book.title}
                        </button>
                        {author && (
                          <p className="text-[14px] text-[#5A5F72]">
                            {author.name}
                          </p>
                        )}
                        <p className="text-[16px] font-bold text-[#252832] mt-1 tabular-nums">
                          ₹{book.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/books/${book.slug}`)}
                        className="text-[14px] text-[#243B8A] font-semibold hover:underline"
                      >
                        {t.book.viewDetails}
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToCart(book.id)}
                        className="px-4 py-2 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[13px] font-semibold whitespace-nowrap shrink-0"
                      >
                        {t.book.addToCart}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </article>
    </div>
  );
};
