import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  BookRecord,
  AuthorRecord,
  EditorialArticle,
  FirstPageExcerpt,
  PublicUserProfile,
  BookReviewRecord,
} from '../types/publishing';
import { BookCoverArt } from '../components/BookCoverArt';
import { resolvePublicAssetUrl } from '../utils/githubPagesAdapter';
import { BookCard } from '../components/BookCard';
import { AnimatedTortoiseEmblem } from '../components/SarvamIllustrations';
import { useLanguage } from '../i18n/translations';
import { authFetch } from './AuthAndRoleViews';
import { EditorialSelectDropdown } from './PublishingHouseViews';
import {
  Search,
  ShoppingBag,
  BookOpen,
  ArrowLeft,
  Check,
  Truck,
  ShieldCheck,
  Heart,
  Star,
  Trash2,
} from 'lucide-react';

// ============================================================================
// 1. BOOKS CATALOGUE VIEW (/books)
// ============================================================================

interface BooksCatalogueViewProps {
  books: BookRecord[];
  authors: AuthorRecord[];
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string, quantity?: number) => void;
  recentlyAddedBookId: string | null;
  initialCategory?: string;
}

export const BooksCatalogueView: React.FC<BooksCatalogueViewProps> = ({
  books,
  authors,
  onNavigate,
  onAddToCart,
  recentlyAddedBookId,
  initialCategory = 'all',
}) => {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    'featured' | 'newest' | 'price_asc' | 'price_desc'
  >('featured');

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    books.forEach((b) => map.set(b.categorySlug, b.category));
    return Array.from(map.entries());
  }, [books]);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books
      .filter((b) => {
        if (selectedCategory !== 'all' && b.categorySlug !== selectedCategory) {
          return false;
        }
        if (inStockOnly && (b.availability === 'out_of_stock' || b.stock <= 0)) {
          return false;
        }
        if (!q) return true;
        const author = authors.find((a) => a.id === b.authorId);
        return (
          b.title.toLowerCase().includes(q) ||
          (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
          b.transliteratedTitle.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.topics.some((topic) => topic.toLowerCase().includes(q)) ||
          (author &&
            (author.name.toLowerCase().includes(q) ||
              author.transliteratedName.toLowerCase().includes(q)))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'newest') {
          return b.publicationDate.localeCompare(a.publicationDate);
        }
        return Number(b.isFeatured) - Number(a.isFeatured);
      });
  }, [books, authors, searchQuery, selectedCategory, inStockOnly, sortBy]);

  const [bundleAdded, setBundleAdded] = useState(false);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setInStockOnly(false);
    setSortBy('featured');
  };

  const inStockBooks = useMemo(
    () => books.filter((b) => b.availability !== 'out_of_stock' && b.stock > 0),
    [books]
  );
  const bundleTotalPrice = useMemo(
    () => inStockBooks.reduce((sum, b) => sum + b.price, 0),
    [inStockBooks]
  );

  const handleAddCompleteBundle = () => {
    inStockBooks.forEach((b) => onAddToCart(b.id, 1));
    setBundleAdded(true);
    window.setTimeout(() => setBundleAdded(false), 2400);
  };

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
      {/* Page Header */}
      <section className="bg-white border-b border-[#E6E1D6] sarvam-aura">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14"
        >
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#243B8A] mb-1.5">
            <span className="font-mono">01</span>
            <span aria-hidden="true">·</span>
            <span>{t.catalogue.eyebrow}</span>
          </div>
          <h1 className="type-page-heading text-[#252832]">{t.catalogue.title}</h1>
          <p className="mt-2.5 prose-marathi text-[#525665] max-w-[62ch]">
            {t.catalogue.subtitle}
          </p>

          {/* Architectural Filter Toolbar (Mobile & Tablet Responsive) */}
          <div className="mt-8 bg-[#FFFDF7] rounded-2xl border border-[#E6E1D6] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 items-center">
            {/* Search Input */}
            <div className="sm:col-span-2 lg:col-span-7 relative">
              <Search className="w-4 h-4 text-[#243B8A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.catalogue.searchPlaceholder}
                aria-label={t.catalogue.searchPlaceholder}
                className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E6E1D6] text-[15px] text-[#252832] focus:border-[#243B8A] focus:outline-none"
              />
            </div>

            {/* Sort Selector */}
            <div className="sm:col-span-1 lg:col-span-3">
              <EditorialSelectDropdown
                id="catalogue-sort"
                testId="catalogue-sort-select"
                ariaLabel={t.catalogue.sortBy}
                value={sortBy}
                onChange={(val) => setSortBy(val as typeof sortBy)}
                options={[
                  { value: 'featured', label: t.catalogue.sortFeatured },
                  { value: 'newest', label: t.catalogue.sortNewest },
                  { value: 'price_asc', label: t.catalogue.sortPriceLow },
                  { value: 'price_desc', label: t.catalogue.sortPriceHigh },
                ]}
              />
            </div>

            {/* In-stock Toggle */}
            <div className="sm:col-span-1 lg:col-span-2 flex items-center justify-start lg:justify-end pt-1 lg:pt-0">
              <label className="inline-flex items-center gap-2 text-[14px] font-medium text-[#252832] cursor-pointer select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#243B8A]"
                />
                <span>{t.catalogue.inStockOnly}</span>
              </label>
            </div>
          </div>

          {/* Single Clean Category Filter Bar */}
          <div className="mt-4 inline-flex items-center gap-1 p-1 rounded-xl bg-[#F7F3E8] border border-[#E6E1D6] overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`relative px-3.5 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'text-[#252832]'
                  : 'text-[#525665] hover:text-[#243B8A]'
              }`}
            >
              {selectedCategory === 'all' && (
                <motion.span
                  layoutId="catalogue-category-pill"
                  className="absolute inset-0 bg-[#FFD966] rounded-lg shadow-2xs"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10">{t.catalogue.allCategories}</span>
            </button>
            {categories.map(([slug, label]) => (
              <button
                key={slug}
                type="button"
                onClick={() => setSelectedCategory(slug)}
                className={`relative px-3.5 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  selectedCategory === slug
                    ? 'text-[#252832]'
                    : 'text-[#525665] hover:text-[#243B8A]'
                }`}
              >
                {selectedCategory === slug && (
                  <motion.span
                    layoutId="catalogue-category-pill"
                    className="absolute inset-0 bg-[#FFD966] rounded-lg shadow-2xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Books Grid */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Curated Complete Akath Library Bundle Banner */}
        {inStockBooks.length > 1 && (
          <div
            data-testid="complete-library-bundle-banner"
            className="mb-8 bg-white rounded-2xl border border-[#E6E1D6] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5"
          >
            <div className="space-y-1.5">
              <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#243B8A] font-semibold">
                Curated Imprint Collection · संपूर्ण अकथ ग्रंथसंच
              </p>
              <h2 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#252832]">
                {lang === 'mr'
                  ? `अकथ प्रकाशनाची सर्व ${inStockBooks.length} उपलब्ध पुस्तके एकत्र मागवा`
                  : `Complete Akath Library Set (${inStockBooks.length} Published Editions)`}
              </h2>
              <p className="text-[13.5px] text-[#525665]">
                {lang === 'mr'
                  ? 'दीर्घकथा, प्रवासवर्णन आणि वैचारिक साहित्य — ₹५००+ ऑर्डरमुळे संपूर्ण भारतात मोफत ट्रॅक्ड बुक-पोस्ट वितरण लागू.'
                  : 'Includes fiction, travelogue, and civic scholarship with complimentary tracked book-post shipping across India.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="text-left md:text-right">
                <span className="block text-[11px] font-mono uppercase text-[#525665]">
                  {lang === 'mr' ? 'एकूण संच मूल्य' : 'Complete Set Total'}
                </span>
                <strong className="text-[22px] font-bold text-[#252832] tabular-nums">
                  ₹{bundleTotalPrice}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleAddCompleteBundle}
                className={`px-5 py-3 rounded-xl text-[13.5px] font-semibold text-[#FFFDF7] inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  bundleAdded
                    ? 'bg-[#15803D]'
                    : 'bg-[#243B8A] hover:bg-[#1B2D6B]'
                }`}
              >
                {bundleAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {lang === 'mr'
                        ? 'सर्व पुस्तके पिशवीत जोडली!'
                        : 'All Editions Added!'}
                    </span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {lang === 'mr'
                        ? 'संपूर्ण संच पिशवीत जोडा'
                        : 'Add Complete Set to Bag'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[14px] text-[#525665] mb-6">
          <span className="font-medium tabular-nums">
            {filteredBooks.length} {t.catalogue.resultsCount}
          </span>
          {(searchQuery || selectedCategory !== 'all' || inStockOnly) && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[#243B8A] hover:underline font-semibold"
            >
              {t.catalogue.resetFilters}
            </button>
          )}
        </div>

        {filteredBooks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E6E1D6] p-12 text-center max-w-xl mx-auto my-8 space-y-4">
            <div className="flex justify-center">
              <AnimatedTortoiseEmblem
                className="w-16 h-16"
                variant="forest"
                animate={true}
              />
            </div>
            <h2 className="type-section-heading text-[#252832]">
              {t.catalogue.noMatchesTitle}
            </h2>
            <p className="text-[15px] text-[#525665]">
              {t.catalogue.noMatchesBody}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[14px] font-semibold"
            >
              {t.catalogue.resetFilters}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Mobile Horizontal Swipe Indicator Bar */}
            <div className="flex sm:hidden items-center justify-between px-3 py-1.5 rounded-lg bg-[#F7F3E8] border border-[#E6E1D6] text-[11px] font-mono text-[#252832]">
              <span className="font-semibold text-[#243B8A]">
                {lang === 'mr'
                  ? '← ग्रंथसूची पाहण्यासाठी आडवे स्वाइप करा →'
                  : '← Swipe horizontally to explore catalogue →'}
              </span>
              <span className="tabular-nums font-bold px-2 py-0.5 rounded bg-[#FFD966]/70 text-[#252832]">
                {filteredBooks.length} {lang === 'mr' ? 'पुस्तके' : 'Books'}
              </span>
            </div>

            <motion.div
              layout
              data-testid="catalogue-mobile-horizontal-scroll"
              className="flex flex-nowrap sm:grid sm:grid-cols-2 lg:grid-cols-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scroll-smooth overscroll-x-contain gap-4 sm:gap-6 lg:gap-7 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar"
            >
              {filteredBooks.map((book) => {
                const author = authors.find((a) => a.id === book.authorId);
                return (
                  <div
                    key={book.id}
                    className="w-[82vw] max-w-[295px] sm:w-auto sm:max-w-none shrink-0 snap-center sm:snap-start"
                  >
                    <BookCard
                      book={book}
                      author={author}
                      onSelectBook={(slug) => onNavigate(`/books/${slug}`)}
                      onSelectAuthor={(slug) => onNavigate(`/authors/${slug}`)}
                      onAddToCart={(id) => onAddToCart(id, 1)}
                      onOpenExcerpt={() => onNavigate('/vachankatta/first-page')}
                      justAdded={recentlyAddedBookId === book.id}
                    />
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}
      </section>
    </div>
  );
};

// ============================================================================
// 2. BOOK DETAIL VIEW (/books/:slug)
// ============================================================================

interface BookDetailViewProps {
  book: BookRecord;
  author?: AuthorRecord;
  allBooks: BookRecord[];
  allAuthors: AuthorRecord[];
  excerpts: FirstPageExcerpt[];
  articles: EditorialArticle[];
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string, quantity?: number) => void;
  recentlyAddedBookId: string | null;
  user?: PublicUserProfile | null;
  csrfToken?: string | null;
  onUpdateUser?: (user: PublicUserProfile) => void;
}

export const BookDetailView: React.FC<BookDetailViewProps> = ({
  book,
  author,
  allBooks,
  allAuthors,
  excerpts,
  articles,
  onNavigate,
  onAddToCart,
  recentlyAddedBookId,
  user,
  csrfToken,
  onUpdateUser,
}) => {
  const { lang, t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('3d-cover');

  useEffect(() => {
    setSelectedGalleryId('3d-cover');
  }, [book.id]);

  // Reviews & Wishlist state
  const [reviews, setReviews] = useState<BookReviewRecord[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [wishlistNotice, setWishlistNotice] = useState<string | null>(null);

  const isWishlisted = Boolean(user?.wishlistBookIds?.includes(book.id));

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/books/${book.id}/reviews`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data.reviews || []);
    }
  }, [book.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleWishlist = async () => {
    if (!user) {
      setWishlistNotice(
        lang === 'mr'
          ? 'इच्छायादीत पुस्तक जतन करण्यासाठी कृपया लॉगिन करा.'
          : 'Please sign in to save this book to your wishlist.'
      );
      return;
    }
    const res = await authFetch(
      '/api/account/wishlist/toggle',
      {
        method: 'POST',
        body: JSON.stringify({ bookId: book.id }),
      },
      csrfToken
    );
    const data = await res.json();
    if (res.ok && data.user && onUpdateUser) {
      onUpdateUser(data.user);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewNotice(null);
    setSubmittingReview(true);
    try {
      const res = await authFetch(
        `/api/books/${book.id}/reviews`,
        {
          method: 'POST',
          body: JSON.stringify({
            rating: reviewRating,
            title: reviewTitle.trim(),
            comment: reviewComment.trim(),
          }),
        },
        csrfToken
      );
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Could not submit review.');
      } else {
        setReviewNotice(
          lang === 'mr'
            ? 'तुमचा अभिप्राय जतन झाला आहे!'
            : 'Your review has been saved!'
        );
        setReviewTitle('');
        setReviewComment('');
        await fetchReviews();
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const res = await authFetch(
      `/api/reviews/${reviewId}`,
      {
        method: 'DELETE',
      },
      csrfToken
    );
    if (res.ok) {
      await fetchReviews();
    }
  };

  const isAvailable = book.availability !== 'out_of_stock' && book.stock > 0;
  const maxQty = Math.min(book.stock || 1, 10);

  const linkedExcerpt = excerpts.find(
    (e) => e.id === book.firstPageExcerptId || e.bookId === book.id
  );
  const relatedBooks = allBooks
    .filter(
      (b) =>
        b.id !== book.id &&
        (book.relatedBookIds.includes(b.id) ||
          b.categorySlug === book.categorySlug)
    )
    .slice(0, 3);
  const relatedArticles = articles.filter((a) =>
    book.relatedArticleIds.includes(a.id)
  );

  const handleBuyNow = () => {
    onAddToCart(book.id, quantity);
    onNavigate('/cart');
  };

  const activeGalleryItem = (book.galleryImages || []).find(
    (g) => g.id === selectedGalleryId
  );

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-[#E6E1D6]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between text-[14px] text-[#525665]">
          <button
            type="button"
            onClick={() => onNavigate('/books')}
            className="inline-flex items-center gap-2 hover:text-[#243B8A] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav.books}</span>
          </button>
          <span className="truncate max-w-xs sm:max-w-md">
            {book.category} ·{' '}
            <strong className="text-[#252832]">{book.title}</strong>
          </span>
        </div>
      </div>

      {/* Main Book Monograph Layout */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Studio Pedestal for 3:4 Book Cover & Full Jacket Spread Switcher */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-5"
          >
            <div className="bg-white rounded-3xl border border-[#E6E1D6] p-6 sm:p-8 flex flex-col items-center space-y-5">
              {selectedGalleryId === '3d-cover' || !activeGalleryItem ? (
                <div className="w-full max-w-[270px] bg-gradient-to-b from-[#FFD966]/25 via-[#FFFDF7] to-[#F7F3E8] rounded-t-[130px] rounded-b-2xl pt-9 pb-7 px-6 border border-[#E6E1D6] flex justify-center">
                  <BookCoverArt book={book} author={author} size="lg" />
                </div>
              ) : (
                <div className="w-full rounded-2xl border border-[#E6E1D6] bg-[#F7F3E8] p-3 space-y-2.5">
                  <img
                    src={resolvePublicAssetUrl(activeGalleryItem.url)}
                    alt={activeGalleryItem.altText}
                    className="w-full max-h-[360px] object-contain rounded-xl mx-auto bg-white"
                  />
                  <p className="text-[12px] font-serif text-[#525665] text-center">
                    {activeGalleryItem.caption}
                  </p>
                </div>
              )}

              {/* Gallery Switcher (3D Cover + Full Jacket Spread + Interior Art) */}
              {book.galleryImages && book.galleryImages.length > 0 && (
                <div className="w-full space-y-2 pt-1">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGalleryId('3d-cover')}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                        selectedGalleryId === '3d-cover'
                          ? 'bg-[#243B8A] text-[#FFFDF7]'
                          : 'bg-[#F7F3E8] text-[#525665] hover:text-[#252832] border border-[#E6E1D6]'
                      }`}
                    >
                      {lang === 'mr' ? '३डी मुखपृष्ठ' : '3D Front Cover'}
                    </button>
                    {book.galleryImages.map((img, gIdx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setSelectedGalleryId(img.id)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors cursor-pointer ${
                          selectedGalleryId === img.id
                            ? 'bg-[#243B8A] text-[#FFFDF7]'
                            : 'bg-[#F7F3E8] text-[#525665] hover:text-[#252832] border border-[#E6E1D6]'
                        }`}
                      >
                        {gIdx === 0
                          ? lang === 'mr'
                            ? 'मुखपृष्ठ कला'
                            : 'Cover Art'
                          : gIdx === 1
                          ? lang === 'mr'
                            ? 'पूर्ण वेष्टन (Spread)'
                            : 'Full Jacket Spread'
                          : lang === 'mr'
                          ? `अंतर्गत चित्र`
                          : `Interior Art`}
                      </button>
                    ))}
                  </div>
                  {book.coverPdfUrl && (
                    <div className="text-center pt-1">
                      <a
                        href={resolvePublicAssetUrl(book.coverPdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-semibold text-[#243B8A] hover:underline"
                      >
                        {lang === 'mr'
                          ? 'मूळ हाय-रिझोल्यूशन कव्हर PDF उघडा ↗'
                          : 'Open Original High-Res Cover PDF ↗'}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[12px] text-[#525665] text-center">
                {book.provenanceLabel}
              </p>
            </div>
          </motion.div>

          {/* Right Column: Title, Literary Note, Contiguous Purchase Module & Metadata */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06 }}
            className="lg:col-span-7 space-y-8"
          >
            <div className="space-y-3">
              {/* Unboxed Category Eyebrow */}
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#525665]">
                <span className="text-[#243B8A] font-semibold">
                  {book.category}
                </span>
              </div>

              <h1 className="type-page-heading text-[#252832]">{book.title}</h1>
              {book.subtitle && (
                <p className="font-serif text-[19px] text-[#525665] leading-relaxed">
                  {book.subtitle}
                </p>
              )}

              {author && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/authors/${author.slug}`)}
                    className="text-[16px] font-semibold text-[#252832] hover:text-[#243B8A] underline underline-offset-4"
                  >
                    {author.name} ({author.transliteratedName})
                  </button>
                </div>
              )}
            </div>

            {/* Contiguous Purchase Card */}
            <div className="bg-white rounded-2xl border border-[#E6E1D6] p-6 space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <span className="text-[30px] font-bold text-[#252832] tabular-nums">
                    ₹{book.price}
                  </span>
                </div>

                <span
                  className={`text-[13px] font-semibold ${
                    !isAvailable
                      ? 'text-[#D93829]'
                      : book.stock <= 5
                      ? 'text-[#EF6855]'
                      : 'text-[#243B8A]'
                  }`}
                >
                  {!isAvailable
                    ? t.book.outOfStock
                    : book.stock <= 5
                    ? `${t.book.limitedStock} (${book.stock})`
                    : t.book.inStock}
                </span>
              </div>

              {isAvailable && (
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  {/* Quantity Selector */}
                  <div className="inline-flex items-center rounded-xl border border-[#E6E1D6] bg-[#FFFDF7] p-0.5">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label={t.cart.decreaseQty}
                      className="w-9 h-9 rounded-lg text-[16px] font-bold text-[#252832] hover:bg-white disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="min-w-[38px] text-center text-[15px] font-bold text-[#252832] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(maxQty, q + 1))
                      }
                      disabled={quantity >= maxQty}
                      aria-label={t.cart.increaseQty}
                      className="w-9 h-9 rounded-lg text-[16px] font-bold text-[#252832] hover:bg-white disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Cart in Coral Red (#EF6855) */}
                  <button
                    type="button"
                    onClick={() => onAddToCart(book.id, quantity)}
                    className={`px-6 py-3 rounded-xl text-[15px] font-semibold transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 ${
                      recentlyAddedBookId === book.id
                        ? 'bg-[#243B8A] text-[#FFFDF7]'
                        : 'bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7]'
                    }`}
                  >
                    {recentlyAddedBookId === book.id ? (
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

                  {/* Buy Now in Midnight Cobalt (#243B8A) */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="px-5 py-3 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[15px] font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    {t.book.buyNow}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    data-testid="book-wishlist-btn"
                    onClick={handleToggleWishlist}
                    className={`px-4 py-3 rounded-xl border text-[14px] font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                      isWishlisted
                        ? 'bg-[#EF6855]/15 border-[#EF6855] text-[#EF6855]'
                        : 'bg-[#FFFDF7] border-[#E6E1D6] text-[#252832] hover:border-[#243B8A]'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? 'fill-[#EF6855] text-[#EF6855]' : 'text-[#EF6855]'
                      }`}
                    />
                    <span>
                      {isWishlisted
                        ? lang === 'mr'
                          ? 'इच्छायादीत आहे'
                          : 'Saved'
                        : lang === 'mr'
                        ? 'इच्छायादी'
                        : 'Wishlist'}
                    </span>
                  </button>

                  {/* Open Dedicated First Page Excerpt Reading Room */}
                  {linkedExcerpt && (
                    <button
                      type="button"
                      onClick={() => onNavigate('/vachankatta/first-page')}
                      className="px-4 py-3 rounded-xl bg-[#FFD966]/35 hover:bg-[#FFD966] text-[14px] font-semibold text-[#252832] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                    >
                      <BookOpen className="w-4 h-4 text-[#243B8A]" />
                      <span>{t.book.readExcerpt}</span>
                    </button>
                  )}
                </div>
              )}

              {wishlistNotice && !user && (
                <div className="p-3.5 rounded-xl bg-[#FFD966]/25 border border-[#FFD966] flex items-center justify-between gap-3 text-[13px] text-[#252832]">
                  <span>{wishlistNotice}</span>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/login?redirect=/books/${book.slug}`)}
                    className="px-3 py-1.5 rounded-lg bg-[#243B8A] text-[#FFFDF7] font-semibold shrink-0"
                  >
                    {lang === 'mr' ? 'लॉगिन करा' : 'Sign In'}
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-[#E6E1D6] grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] text-[#525665]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#243B8A] shrink-0" />
                  <span>{book.shippingNote}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#243B8A] shrink-0" />
                  <span>
                    {lang === 'mr'
                      ? 'छापील पुस्तकांवर ०% जीएसटी · सुरक्षित पॅकेजिंग'
                      : '0% GST on printed books · Protective packaging'}
                  </span>
                </div>
              </div>
            </div>

            {/* About the Book & Editorial Context */}
            <div className="bg-white rounded-2xl border border-[#E6E1D6] p-6 space-y-6">
              <div>
                <h2 className="type-section-heading text-[#252832] mb-2.5">
                  {t.book.aboutBook}
                </h2>
                <p className="prose-marathi text-[#525665]">{book.description}</p>
              </div>

              <div className="bg-[#FFFDF7] border border-[#FFD966] rounded-xl p-5 space-y-1.5">
                <h3 className="text-[14px] font-bold text-[#243B8A]">
                  {t.book.editorialNote}
                </h3>
                <p className="prose-marathi text-[#525665]">
                  {book.editorialContext}
                </p>
              </div>
            </div>

            {/* Bibliographic Specifications Grid */}
            <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6">
              <h2 className="text-[16px] font-bold text-[#121316] mb-4">
                {t.book.specifications}
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[14px]">
                <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5]/70">
                  <dt className="text-[#52504C] text-[12px]">
                    {t.book.publisher}
                  </dt>
                  <dd className="font-semibold text-[#121316] mt-0.5">
                    {book.publisher}
                  </dd>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5]/70">
                  <dt className="text-[#52504C] text-[12px]">
                    {t.book.language}
                  </dt>
                  <dd className="font-semibold text-[#121316] mt-0.5">
                    {book.language}
                  </dd>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5]/70">
                  <dt className="text-[#52504C] text-[12px]">{t.book.format}</dt>
                  <dd className="font-semibold text-[#121316] mt-0.5">
                    {book.format}
                  </dd>
                </div>
                {book.pageCount && (
                  <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5]/70">
                    <dt className="text-[#52504C] text-[12px]">
                      {t.book.pages}
                    </dt>
                    <dd className="font-semibold text-[#121316] mt-0.5 tabular-nums">
                      {book.pageCount}
                    </dd>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5]/70">
                  <dt className="text-[#52504C] text-[12px]">
                    {t.book.edition}
                  </dt>
                  <dd className="font-semibold text-[#121316] mt-0.5">
                    {book.edition}
                  </dd>
                </div>
                {book.isbn && (
                  <div className="p-3 rounded-xl bg-[#FAF8F3] border border-[#E5E0D5]/70">
                    <dt className="text-[#52504C] text-[12px]">{t.book.isbn}</dt>
                    <dd className="font-mono text-[12px] text-[#121316] mt-0.5 tabular-nums">
                      {book.isbn}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Reader Reviews & Ratings Section */}
            <div className="bg-white rounded-2xl border border-[#E6E1D6] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#E6E1D6] pb-3">
                <h2 className="type-section-heading text-[#252832]">
                  {lang === 'mr' ? 'वाचक अभिप्राय आणि रेटिंग' : 'Reader Reviews & Ratings'} ({reviews.length})
                </h2>
              </div>

              {reviews.length === 0 ? (
                <p className="text-[14px] text-[#525665]">
                  {lang === 'mr'
                    ? 'अद्याप या पुस्तकावर कोणताही वाचक अभिप्राय नोंदवलेला नाही.'
                    : 'No reader reviews yet for this book.'}
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-[#FFFDF7] border border-[#E6E1D6] space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 text-[#243B8A] font-bold text-[13px]">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-[#FFD966] text-[#243B8A]" />
                            ))}
                          </span>
                          <strong className="text-[14px] text-[#252832]">{rev.title}</strong>
                        </div>
                        {(user?.id === rev.userId || user?.role === 'admin') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="text-[12px] font-semibold text-[#EF6855] inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{lang === 'mr' ? 'हटवा' : 'Delete'}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[14px] text-[#525665]">{rev.comment}</p>
                      <p className="text-[11px] text-[#525665]">
                        — {rev.reviewerName} · {new Date(rev.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <form onSubmit={handleSubmitReview} className="pt-4 border-t border-[#E6E1D6] space-y-3">
                  <h3 className="text-[14px] font-bold text-[#243B8A]">
                    {lang === 'mr' ? 'तुमचा अभिप्राय लिहा' : 'Write a Review'}
                  </h3>
                  {reviewError && (
                    <p className="text-[13px] text-[#EF6855] font-medium">{reviewError}</p>
                  )}
                  {reviewNotice && (
                    <p className="text-[13px] text-[#243B8A] font-medium">{reviewNotice}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <label className="text-[13px] font-semibold text-[#252832]">
                      {lang === 'mr' ? 'रेटिंग:' : 'Rating:'}
                    </label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg border border-[#E6E1D6] bg-[#FFFDF7] text-[13px]"
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n} ★
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder={lang === 'mr' ? 'अभिप्रायाचे शीर्षक' : 'Review headline'}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D6] bg-[#FFFDF7] text-[14px]"
                  />
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={
                      lang === 'mr'
                        ? 'या पुस्तकाबद्दल तुमचे विचार सविस्तर लिहा...'
                        : 'Share your thoughts on this book...'
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E6E1D6] bg-[#FFFDF7] text-[14px]"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[13px] font-semibold"
                  >
                    {lang === 'mr' ? 'अभिप्राय पाठवा' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-[#FFFDF7] border border-[#E6E1D6] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[13px] text-[#525665]">
                    {lang === 'mr'
                      ? 'अभिप्राय आणि रेटिंग नोंदवण्यासाठी कृपया लॉगिन करा.'
                      : 'Sign in to write a reader review or rate this book.'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/login?redirect=/books/${book.slug}`)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#243B8A] text-[#FFFDF7] text-[12px] font-semibold"
                  >
                    {lang === 'mr' ? 'लॉगिन करा' : 'Sign In'}
                  </button>
                </div>
              )}
            </div>

            {/* Related Editorial Essays */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 space-y-3">
                <h3 className="text-[15px] font-bold text-[#121316]">
                  {lang === 'mr'
                    ? 'या पुस्तकाशी संबंधित वाचनकट्टा लेख'
                    : 'Related Vachankatta Essays'}
                </h3>
                <div className="divide-y divide-[#E5E0D5]">
                  {relatedArticles.map((art) => (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                      className="w-full py-2.5 text-left flex items-center justify-between hover:text-[#312E81]"
                    >
                      <span className="font-serif text-[17px] font-semibold">
                        {art.title}
                      </span>
                      <span className="text-[13px] font-semibold text-[#312E81] shrink-0 ml-2">
                        {t.vachankatta.readFullArticle} →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#E5E0D5]">
            <h2 className="type-section-heading text-[#121316] mb-6">
              {t.book.relatedBooks}
            </h2>
            <div className="flex flex-nowrap sm:grid sm:grid-cols-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scroll-smooth overscroll-x-contain gap-4 sm:gap-7 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
              {relatedBooks.map((rel) => {
                const relAuthor = allAuthors.find((a) => a.id === rel.authorId);
                return (
                  <div
                    key={rel.id}
                    className="w-[82vw] max-w-[295px] sm:w-auto sm:max-w-none shrink-0 snap-center sm:snap-start"
                  >
                    <BookCard
                      book={rel}
                      author={relAuthor}
                      onSelectBook={(slug) => onNavigate(`/books/${slug}`)}
                      onSelectAuthor={(slug) => onNavigate(`/authors/${slug}`)}
                      onAddToCart={(id) => onAddToCart(id, 1)}
                      justAdded={recentlyAddedBookId === rel.id}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
