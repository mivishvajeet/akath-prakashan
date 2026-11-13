import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  CartQuoteResponse,
  BookRecord,
  AuthorRecord,
  OrderRecord,
} from '../types/publishing';
import { BookCoverArt } from '../components/BookCoverArt';
import {
  OpenFolioIllustration,
  AnimatedTortoiseEmblem,
} from '../components/SarvamIllustrations';
import { useLanguage } from '../i18n/translations';
import {
  validateEmail,
  validateIndianPhone,
  validateIndianPinCode,
} from '../utils/validation';
import {
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Search,
} from 'lucide-react';

// ============================================================================
// 1. CART VIEW (/cart) — SARVAM AI SOVEREIGN EDITORIAL THEME
// ============================================================================

interface CartViewProps {
  cartQuote: CartQuoteResponse | null;
  loadingQuote: boolean;
  allBooks: BookRecord[];
  allAuthors: AuthorRecord[];
  onUpdateQuantity: (bookId: string, newQuantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  onClearCart: () => void;
  onAddToCart: (bookId: string, quantity?: number) => void;
  onNavigate: (path: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cartQuote,
  loadingQuote,
  allBooks,
  allAuthors,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onAddToCart,
  onNavigate,
}) => {
  const { lang, t } = useLanguage();
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'ok' | 'err';
    msg: string;
  } | null>(null);

  const items = cartQuote?.items || [];
  const isEmpty = items.length === 0;
  const totalCopies = items.reduce((sum, item) => sum + item.approvedQuantity, 0);
  const subtotal = cartQuote?.subtotal || 0;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / 600) * 100));

  const missingCatalogueBooks = allBooks.filter(
    (b) =>
      b.availability !== 'out_of_stock' &&
      b.stock > 0 &&
      !items.some((line) => line.bookId === b.id)
  );

  const computedDiscount = (() => {
    if (appliedCoupon === 'AKATH10' && subtotal >= 400) {
      return Math.round(subtotal * 0.1);
    }
    if (appliedCoupon === 'GRANTH100' && subtotal >= 900) {
      return 100;
    }
    return cartQuote?.discountAmount || 0;
  })();

  const effectiveGrandTotal = Math.max(
    0,
    (cartQuote?.grandTotal || 0) - computedDiscount
  );

  const handleApplyCoupon = (codeToApply?: string) => {
    const normalized = (codeToApply ?? couponInput).trim().toUpperCase();
    setCouponInput(normalized);
    if (!normalized) {
      setAppliedCoupon(null);
      setCouponFeedback(null);
      return;
    }
    if (normalized === 'AKATH10') {
      if (subtotal < 400) {
        setCouponFeedback({
          type: 'err',
          msg:
            lang === 'mr'
              ? 'AKATH10 कोडसाठी किमान ₹४०० ची पुस्तके पिशवीत असावीत.'
              : 'AKATH10 requires a minimum bag subtotal of ₹400.',
        });
        return;
      }
      setAppliedCoupon('AKATH10');
      setCouponFeedback({
        type: 'ok',
        msg:
          lang === 'mr'
            ? '✓ AKATH10 लागू: १०% वाचक स्नेह सवलत समाविष्ट!'
            : '✓ AKATH10 applied: 10% Reader Patronage privilege active!',
      });
      return;
    }
    if (normalized === 'GRANTH100') {
      if (subtotal < 900) {
        setCouponFeedback({
          type: 'err',
          msg:
            lang === 'mr'
              ? 'GRANTH100 कोडसाठी किमान ₹९०० ची पुस्तके पिशवीत असावीत.'
              : 'GRANTH100 requires a minimum bag subtotal of ₹900.',
        });
        return;
      }
      setAppliedCoupon('GRANTH100');
      setCouponFeedback({
        type: 'ok',
        msg:
          lang === 'mr'
            ? '✓ GRANTH100 लागू: ₹१०० संग्रह सवलत समाविष्ट!'
            : '✓ GRANTH100 applied: ₹100 Library Set rebate active!',
      });
      return;
    }
    setCouponFeedback({
      type: 'err',
      msg:
        lang === 'mr'
          ? 'हा सवलत कोड उपलब्ध नाही. (AKATH10 किंवा GRANTH100 वापरा)'
          : 'Invalid code. Try AKATH10 (₹400+) or GRANTH100 (₹900+).',
    });
  };

  const handleStepQuantity = (bookId: string, targetQty: number, maxStock: number) => {
    if (targetQty < 1 || targetQty > Math.min(maxStock, 20)) return;
    onUpdateQuantity(bookId, targetQty);
  };

  const suggestedBooks = allBooks
    .filter((b) => b.availability !== 'out_of_stock' && b.stock > 0)
    .slice(0, 3);

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-10 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Page Header */}
        <div className="pb-6 border-b border-[#E6E1D6] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold text-[#243B8A] mb-1">
              {lang === 'mr' ? 'अकथ प्रकाशन' : 'Akath Prakashan'} · {t.nav.cart}
            </p>
            <h1 className="type-page-heading text-[#252832]">{t.cart.title}</h1>
          </div>

          {!isEmpty && (
            <div className="flex items-center gap-4 text-[14px]">
              <span className="font-semibold text-[#525665] tabular-nums">
                {totalCopies} {t.cart.itemCountLabel}
              </span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onClearCart}
                className="text-[#EF6855] hover:underline font-semibold inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.cart.clearCart}</span>
              </button>
            </div>
          )}
        </div>

        {/* ===================================================================
            DESIGNED EMPTY CART STATE WITH TORTOISE + FOLIO ILLUSTRATION
            =================================================================== */}
        {isEmpty ? (
          <div className="mt-10 space-y-14">
            <div
              data-testid="empty-cart-state"
              className="bg-white rounded-3xl border border-[#E6E1D6] p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-5"
            >
              <div className="flex items-center justify-center gap-4 text-[#243B8A]">
                <AnimatedTortoiseEmblem
                  className="w-16 h-16"
                  variant="forest"
                  animate={true}
                />
                <OpenFolioIllustration className="w-36 h-20" />
              </div>
              <h2 className="type-section-heading text-[#252832]">
                {t.cart.emptyTitle}
              </h2>
              <p className="text-[16px] text-[#525665] max-w-md mx-auto leading-relaxed">
                {t.cart.emptySubtitle}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="px-6 py-3.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <span>{t.cart.emptyCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Real Catalogue Suggestions */}
            {suggestedBooks.length > 0 && (
              <section className="pt-8 border-t border-[#E6E1D6]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="type-section-heading text-[#252832]">
                    {t.cart.recommendationsTitle}
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('/books')}
                    className="text-[14px] font-semibold text-[#243B8A] hover:underline"
                  >
                    {t.home.viewAllBooks} →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {suggestedBooks.map((book) => {
                    const author = allAuthors.find((a) => a.id === book.authorId);
                    return (
                      <div
                        key={book.id}
                        className="bg-white rounded-2xl border border-[#E6E1D6] p-5 flex gap-4 items-start hover:border-[#243B8A]/35 transition-colors"
                      >
                        <div className="w-20 shrink-0">
                          <BookCoverArt
                            book={book}
                            author={author}
                            size="sm"
                            onClick={() => onNavigate(`/books/${book.slug}`)}
                          />
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/books/${book.slug}`)}
                            className="font-serif text-[18px] font-bold text-[#252832] hover:text-[#243B8A] text-left block"
                          >
                            {book.title}
                          </button>
                          {author && (
                            <p className="text-[13px] text-[#525665]">{author.name}</p>
                          )}
                          <p className="text-[17px] font-bold text-[#252832] pt-1 tabular-nums">
                            ₹{book.price}
                          </p>
                          <button
                            type="button"
                            onClick={() => onAddToCart(book.id, 1)}
                            className="mt-2 px-3.5 py-2 rounded-lg bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[13px] font-semibold transition-colors"
                          >
                            {t.book.addToCart}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* =================================================================
             POPULATED CART: 2-COLUMN DESKTOP / STACKED MOBILE LAYOUT
             ================================================================= */
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* LEFT COLUMN: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Progress Bar Banner */}
              <div className="bg-white rounded-2xl border border-[#E6E1D6] p-4 sm:p-5 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="font-semibold text-[#252832] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#243B8A] shrink-0" />
                    <span>
                      {subtotal >= 600
                        ? lang === 'mr'
                          ? '₹६००+ ऑर्डर: संपूर्ण भारतात मोफत स्पीड पोस्ट वितरण लागू!'
                          : '₹600+ order: Free India Post Speed Post shipping unlocked!'
                        : lang === 'mr'
                        ? `मोफत वितरणासाठी अजून ₹${Math.max(0, 600 - subtotal)} ची पुस्तके जोडा (सध्या ₹45 स्पीड पोस्ट शुल्क).`
                        : `Add ₹${Math.max(0, 600 - subtotal)} more for free shipping (currently ₹45 India Post dispatch).`}
                    </span>
                  </span>
                  <span className="text-[12px] font-bold text-[#243B8A]">
                    {freeShippingProgress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F7F3E8] overflow-hidden">
                  <div
                    className="h-full bg-[#243B8A] transition-all duration-300 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Server Validation Warnings */}
              {cartQuote?.validationMessages &&
                cartQuote.validationMessages.length > 0 && (
                  <div
                    role="alert"
                    className="bg-red-50 rounded-2xl border border-red-200 p-4 space-y-1 text-[14px] text-red-800"
                  >
                    {cartQuote.validationMessages.map((msg, i) => (
                      <p key={i} className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{msg}</span>
                      </p>
                    ))}
                  </div>
                )}

              {/* Cart Items Surface */}
              <div className="bg-white rounded-3xl border border-[#E6E1D6] shadow-xs divide-y divide-[#E6E1D6] overflow-hidden">
                {items.map((line) => {
                  const fullBook = allBooks.find((b) => b.id === line.bookId);
                  const fullAuthor = allAuthors.find((a) => a.id === fullBook?.authorId);
                  const isLineAvailable =
                    line.availableStock > 0 && line.approvedQuantity > 0;
                  const maxAllowed = Math.min(line.availableStock, 20);

                  return (
                    <article
                      key={line.bookId}
                      data-testid={`cart-item-${line.bookId}`}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start"
                    >
                      {/* 1. Book Cover Art */}
                      {fullBook && (
                        <div className="w-24 sm:w-28 shrink-0 bg-[#FFFDF7] p-2 rounded-xl border border-[#E6E1D6]">
                          <BookCoverArt
                            book={fullBook}
                            author={fullAuthor}
                            size="sm"
                            onClick={() => onNavigate(`/books/${line.slug}`)}
                          />
                        </div>
                      )}

                      {/* 2. Title, Author, Unit Price, Availability & Controls */}
                      <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <h2 className="type-book-title text-[#252832]">
                              <button
                                type="button"
                                onClick={() => onNavigate(`/books/${line.slug}`)}
                                className="text-left hover:text-[#243B8A] transition-colors"
                              >
                                {line.title}
                              </button>
                            </h2>
                            <p className="text-[14px] text-[#525665] mt-0.5">
                              {line.authorName} · {line.format}
                            </p>
                          </div>

                          {/* Line Total */}
                          <div className="sm:text-right">
                            <span className="text-[12px] text-[#525665] block">
                              {t.cart.lineTotal}
                            </span>
                            <span
                              data-testid={`cart-line-total-${line.bookId}`}
                              className="text-[20px] font-bold text-[#252832]"
                            >
                              ₹{line.lineTotal}
                            </span>
                          </div>
                        </div>

                        {/* Unit Price & Availability Badge */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                          <span className="text-[#525665]">
                            {t.cart.unitPrice}:{' '}
                            <strong className="text-[#252832] font-semibold">
                              ₹{line.unitPrice}
                            </strong>
                          </span>
                          <span className="text-[#E6E1D6]">·</span>
                          <span
                            className={
                              !isLineAvailable
                                ? 'text-[#D93829] font-semibold'
                                : line.availableStock <= 5
                                ? 'text-[#EF6855] font-semibold'
                                : 'text-[#243B8A] font-semibold'
                            }
                          >
                            ● {t.cart.availability}:{' '}
                            {!isLineAvailable
                              ? t.book.outOfStock
                              : line.availableStock <= 5
                              ? `${t.book.limitedStock} (${line.availableStock})`
                              : t.book.inStock}
                          </span>
                        </div>

                        {line.stockWarning && (
                          <p className="text-[13px] text-[#252832] bg-[#FFD966]/35 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#EF6855]" />
                            <span>{line.stockWarning}</span>
                          </p>
                        )}

                        {/* Quantity Stepper (Prevents < 1) & Explicit Remove Button */}
                        <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-[#E6E1D6]">
                          <div className="flex items-center gap-3">
                            <span className="text-[13px] font-medium text-[#525665]">
                              {t.cart.quantity}:
                            </span>
                            <div className="inline-flex items-center rounded-xl border border-[#E6E1D6] bg-[#FFFDF7] p-0.5">
                              <button
                                type="button"
                                data-testid={`cart-dec-${line.bookId}`}
                                onClick={() =>
                                  handleStepQuantity(
                                    line.bookId,
                                    line.approvedQuantity - 1,
                                    line.availableStock
                                  )
                                }
                                disabled={line.approvedQuantity <= 1}
                                aria-label={`${t.cart.decreaseQty} — ${line.title}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] font-bold text-[#252832] hover:bg-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                −
                              </button>
                              <span
                                data-testid={`cart-qty-${line.bookId}`}
                                className="min-w-[36px] h-8 px-2 flex items-center justify-center text-[14px] font-bold text-[#252832]"
                              >
                                {line.approvedQuantity}
                              </span>
                              <button
                                type="button"
                                data-testid={`cart-inc-${line.bookId}`}
                                onClick={() =>
                                  handleStepQuantity(
                                    line.bookId,
                                    line.approvedQuantity + 1,
                                    line.availableStock
                                  )
                                }
                                disabled={line.approvedQuantity >= maxAllowed}
                                aria-label={`${t.cart.increaseQty} — ${line.title}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] font-bold text-[#252832] hover:bg-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Explicit Remove Action */}
                          <button
                            type="button"
                            data-testid={`cart-remove-${line.bookId}`}
                            onClick={() => onRemoveItem(line.bookId)}
                            aria-label={`${t.cart.removeAria} — ${line.title}`}
                            className="px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#525665] hover:text-[#EF6855] hover:bg-[#EF6855]/10 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t.cart.remove}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* 1-Click Complete Your Akath Library Set Upsell */}
              {missingCatalogueBooks.length > 0 && (
                <div className="bg-[#FFFDF7] rounded-3xl border border-[#243B8A]/25 p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#243B8A]">
                        {lang === 'mr'
                          ? 'अकथ ग्रंथसंग्रह पूर्ण करा'
                          : 'Complete Your Akath Imprint Set'}
                      </p>
                      <h3 className="font-serif text-[18px] font-bold text-[#252832] mt-0.5">
                        {lang === 'mr'
                          ? `अजून ${missingCatalogueBooks.length} प्रकाशित ग्रंथ पिशवीत जोडून संपूर्ण संच पूर्ण करा`
                          : `Add the remaining ${missingCatalogueBooks.length} Akath edition(s) to your bag`}
                      </h3>
                    </div>
                    {missingCatalogueBooks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          missingCatalogueBooks.forEach((b) => onAddToCart(b.id, 1));
                        }}
                        className="px-4 py-2 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[13px] font-semibold transition-colors cursor-pointer"
                      >
                        {lang === 'mr'
                          ? `+ सर्व ${missingCatalogueBooks.length} पुस्तके एकत्र जोडा`
                          : `+ Add All ${missingCatalogueBooks.length} Missing Books`}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {missingCatalogueBooks.map((book) => {
                      const author = allAuthors.find((a) => a.id === book.authorId);
                      return (
                        <div
                          key={book.id}
                          className="bg-white rounded-2xl border border-[#E6E1D6] p-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-serif text-[15px] font-bold text-[#252832] truncate">
                              {book.title}
                            </p>
                            <p className="text-[12.5px] text-[#525665] truncate">
                              {author?.name} · <strong className="text-[#252832]">₹{book.price}</strong>
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onAddToCart(book.id, 1)}
                            className="px-3 py-1.5 rounded-lg bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[12.5px] font-semibold shrink-0 transition-colors cursor-pointer"
                          >
                            + {t.book.addToCart}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="text-[14px] font-semibold text-[#252832] hover:text-[#243B8A] inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.cart.continueShopping}</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary ("तुमचा ऑर्डर तपशील") */}
            <aside className="lg:col-span-4 bg-white rounded-3xl border border-[#E6E1D6] shadow-[0_12px_32px_-10px_rgba(36,59,138,0.08)] p-6 sm:p-7 space-y-5 sticky top-24">
              <h2 className="type-section-heading text-[#252832] border-b border-[#E6E1D6] pb-3">
                {t.cart.orderSummary}
              </h2>

              {/* Reader Privilege / Coupon Code Box */}
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#E6E1D6] space-y-2.5">
                <label
                  htmlFor="cart-coupon-input"
                  className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[#525665]"
                >
                  {lang === 'mr'
                    ? 'वाचक सवलत कोड (Reader Privilege Code)'
                    : 'Reader Privilege / Promo Code'}
                </label>
                <div className="flex gap-2">
                  <input
                    id="cart-coupon-input"
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder={lang === 'mr' ? 'उदा. AKATH10' : 'e.g. AKATH10'}
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-xl border border-[#E6E1D6] bg-white font-mono text-[13px] text-[#252832] uppercase focus:border-[#243B8A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    className="px-3.5 py-1.5 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[12.5px] font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    {lang === 'mr' ? 'लागू करा' : 'Apply'}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('AKATH10')}
                    className="px-2 py-0.5 rounded-md bg-[#243B8A]/8 hover:bg-[#243B8A]/15 text-[#243B8A] font-mono text-[10.5px] font-semibold cursor-pointer"
                  >
                    AKATH10 (10% off ₹400+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('GRANTH100')}
                    className="px-2 py-0.5 rounded-md bg-[#243B8A]/8 hover:bg-[#243B8A]/15 text-[#243B8A] font-mono text-[10.5px] font-semibold cursor-pointer"
                  >
                    GRANTH100 (₹100 off ₹900+)
                  </button>
                </div>
                {couponFeedback && (
                  <p
                    className={`text-[12px] font-medium ${
                      couponFeedback.type === 'ok' ? 'text-[#15803D]' : 'text-[#D93829]'
                    }`}
                  >
                    {couponFeedback.msg}
                  </p>
                )}
              </div>

              <dl className="space-y-3 text-[15px]">
                <div className="flex items-center justify-between">
                  <dt className="text-[#525665]">{t.cart.subtotal}</dt>
                  <dd
                    data-testid="cart-subtotal"
                    className="font-semibold text-[#252832] tabular-nums"
                  >
                    ₹{cartQuote?.subtotal || 0}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-[#525665]">
                    {t.cart.discount}
                    {appliedCoupon ? ` (${appliedCoupon})` : ''}
                  </dt>
                  <dd
                    className={`tabular-nums ${
                      computedDiscount > 0
                        ? 'text-[#15803D] font-bold'
                        : 'text-[#525665]'
                    }`}
                  >
                    {computedDiscount > 0 ? `−₹${computedDiscount}` : '₹0'}
                  </dd>
                </div>

                <div className="flex items-center justify-between">
                  <dt className="text-[#525665]">{t.cart.shipping}</dt>
                  <dd
                    data-testid="cart-shipping"
                    className="font-semibold text-[#252832] tabular-nums"
                  >
                    {cartQuote?.shippingCost === 0 ? (
                      <span className="text-[#243B8A] font-bold">
                        {t.cart.freeShipping} (₹0)
                      </span>
                    ) : (
                      `₹${cartQuote?.shippingCost || 0}`
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between text-[13px] text-[#525665]">
                  <dt>{t.cart.taxNote}</dt>
                  <dd className="tabular-nums">₹0</dd>
                </div>

                <div className="pt-3 border-t border-[#E6E1D6] flex items-baseline justify-between">
                  <dt className="text-[16px] font-bold text-[#252832]">
                    {t.cart.grandTotal}
                  </dt>
                  <dd
                    data-testid="cart-grand-total"
                    className="text-[26px] font-bold text-[#252832] tabular-nums"
                  >
                    ₹{effectiveGrandTotal}
                  </dd>
                </div>
              </dl>

              {/* Primary Checkout CTA in Coral Red (#EF6855) */}
              <button
                type="button"
                data-testid="proceed-to-checkout-btn"
                disabled={!cartQuote?.isValidForCheckout}
                onClick={() => onNavigate('/checkout')}
                className="w-full py-3.5 px-5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] disabled:bg-slate-200 disabled:text-slate-500 text-[#FFFDF7] text-[16px] font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.cart.proceedToCheckout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-[12px] text-[#525665] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#243B8A] shrink-0" />
                <span>
                  {lang === 'mr'
                    ? 'सर्व्हरद्वारे पडताळलेले सुरक्षित पेमेंट आणि स्पीड पोस्ट ट्रॅकिंग'
                    : 'Server-verified payment & tracked registered post delivery'}
                </span>
              </div>
            </aside>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================================
// 2. CHECKOUT VIEW (/checkout) — RIGOROUS INLINE EMAIL & INDIAN PHONE VALIDATION
// ============================================================================

interface CheckoutViewProps {
  cartQuote: CartQuoteResponse | null;
  onPlaceOrder: (payload: {
    idempotencyKey: string;
    customer: {
      fullName: string;
      phone: string;
      email: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      district: string;
      state: string;
      postalCode: string;
      orderNotes?: string;
      isInstitutionalOrder: boolean;
      institutionName?: string;
    };
    paymentMethod: 'upi_verified' | 'razorpay_standard' | 'institutional_invoice';
  }) => Promise<{
    ok: boolean;
    order?: OrderRecord;
    error?: string;
    fieldErrors?: Record<string, string>;
  }>;
  onVerifyPayment: (
    orderId: string,
    outcome: 'success' | 'failed',
    guestAccessToken?: string
  ) => Promise<{ ok: boolean; order?: OrderRecord; error?: string }>;
  onNavigate: (path: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cartQuote,
  onPlaceOrder,
  onVerifyPayment,
  onNavigate,
}) => {
  const { lang, t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('महाराष्ट्र');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isInstitutionalOrder, setIsInstitutionalOrder] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'upi_verified' | 'razorpay_standard' | 'institutional_invoice'
  >('upi_verified');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<OrderRecord | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(
    () => `idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const addressLine1Ref = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const postalCodeRef = useRef<HTMLInputElement>(null);

  const handleFieldBlur = (field: 'email' | 'phone' | 'postalCode') => {
    if (field === 'email' && email.trim()) {
      const check = validateEmail(email, lang);
      setErrors((prev) => ({ ...prev, email: check.isValid ? '' : check.error! }));
    }
    if (field === 'phone' && phone.trim()) {
      const check = validateIndianPhone(phone, lang);
      setErrors((prev) => ({ ...prev, phone: check.isValid ? '' : check.error! }));
    }
    if (field === 'postalCode' && postalCode.trim()) {
      const check = validateIndianPinCode(postalCode, lang);
      setErrors((prev) => ({
        ...prev,
        postalCode: check.isValid ? '' : check.error!,
      }));
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors: Record<string, string> = {};

    if (fullName.trim().length < 2) {
      nextErrors.fullName = t.checkout.errors.fullNameRequired;
    }

    const phoneCheck = validateIndianPhone(phone, lang);
    if (!phoneCheck.isValid) {
      nextErrors.phone = phoneCheck.error!;
    }

    const emailCheck = validateEmail(email, lang);
    if (!emailCheck.isValid) {
      nextErrors.email = emailCheck.error!;
    }

    if (addressLine1.trim().length < 5) {
      nextErrors.addressLine1 = t.checkout.errors.addressRequired;
    }

    if (city.trim().length < 2) {
      nextErrors.city = t.checkout.errors.cityRequired;
    }

    const pinCheck = validateIndianPinCode(postalCode, lang);
    if (!pinCheck.isValid) {
      nextErrors.postalCode = pinCheck.error!;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.fullName) fullNameRef.current?.focus();
      else if (nextErrors.phone) phoneRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.addressLine1) addressLine1Ref.current?.focus();
      else if (nextErrors.city) cityRef.current?.focus();
      else if (nextErrors.postalCode) postalCodeRef.current?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await onPlaceOrder({
        idempotencyKey,
        customer: {
          fullName: fullName.trim(),
          phone: phoneCheck.normalizedValue,
          email: emailCheck.normalizedValue,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          district: district.trim() || city.trim(),
          state: stateName.trim() || 'महाराष्ट्र',
          postalCode: pinCheck.normalizedValue,
          orderNotes: orderNotes.trim() || undefined,
          isInstitutionalOrder,
          institutionName: isInstitutionalOrder ? institutionName.trim() : undefined,
        },
        paymentMethod,
      });

      if (res.ok && res.order) {
        setPendingOrder(res.order);
      } else {
        if (res.fieldErrors) {
          setErrors(res.fieldErrors);
          if (res.fieldErrors.fullName) fullNameRef.current?.focus();
          else if (res.fieldErrors.phone) phoneRef.current?.focus();
          else if (res.fieldErrors.email) emailRef.current?.focus();
          else if (res.fieldErrors.addressLine1) addressLine1Ref.current?.focus();
          else if (res.fieldErrors.city) cityRef.current?.focus();
          else if (res.fieldErrors.postalCode) postalCodeRef.current?.focus();
        } else if (res.error) {
          setErrors({ form: res.error });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentVerification = async (outcome: 'success' | 'failed') => {
    if (!pendingOrder || submitting) return;
    setSubmitting(true);
    try {
      const res = await onVerifyPayment(
        pendingOrder.id,
        outcome,
        pendingOrder.guestAccessToken
      );
      if (res.ok && res.order) {
        if (res.order.paymentStatus === 'verified') {
          setCompletedOrder({
            ...res.order,
            customer: pendingOrder.customer,
            guestAccessToken: pendingOrder.guestAccessToken,
          });
          setPendingOrder(null);
        } else {
          setPendingOrder({
            ...res.order,
            customer: pendingOrder.customer,
            guestAccessToken: pendingOrder.guestAccessToken,
          });
          setIdempotencyKey(`idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
        }
      } else if (res.error) {
        setErrors({ form: res.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Verified Order Confirmation Screen
  if (completedOrder) {
    return (
      <div className="bg-[#FAF9F6] text-slate-900 min-h-screen py-14">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border-2 border-emerald-600/40 shadow-lg p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle2 className="w-8 h-8 shrink-0" />
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wider">
                  {lang === 'mr'
                    ? 'अकथ प्रकाशन · पावती'
                    : 'Akath Prakashan · Order Receipt'}
                </p>
                <h1 className="type-section-heading text-slate-900">
                  {lang === 'mr'
                    ? 'तुमची ऑर्डर आणि पेमेंट यशस्वीरीत्या पूर्ण झाले आहे!'
                    : 'Your Order and Payment Have Been Verified!'}
                </h1>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[14px]">
              <div>
                <span className="text-slate-500 block">
                  {lang === 'mr' ? 'ऑर्डर क्रमांक' : 'Order Number'}
                </span>
                <strong className="font-mono text-[16px] text-slate-900">
                  {completedOrder.orderNumber}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">
                  {lang === 'mr' ? 'पेमेंट संदर्भ' : 'Payment Reference'}
                </span>
                <strong className="font-mono text-[14px] text-slate-900">
                  {completedOrder.paymentReference}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">
                  {lang === 'mr' ? 'एकूण रक्कम' : 'Amount Paid'}
                </span>
                <strong className="text-[16px] text-slate-900">
                  ₹{completedOrder.grandTotal}
                </strong>
              </div>
            </div>

            {completedOrder.guestAccessToken && (
              <div className="p-4 rounded-2xl bg-[#FFD966]/25 border border-[#FFD966] space-y-2 text-[13px] text-[#252832]">
                <p className="font-bold text-[#243B8A]">
                  {lang === 'mr'
                    ? 'अतिथी ऑर्डर सुरक्षा टोकन (Guest Order Token):'
                    : 'Guest Order Security Token:'}
                </p>
                <code className="block px-3 py-2 rounded-lg bg-white border border-[#E6E1D6] font-mono text-[12px] text-[#243B8A] select-all">
                  {completedOrder.guestAccessToken}
                </code>
                <p className="text-[12px] text-[#525665]">
                  {lang === 'mr'
                    ? 'आपण लॉगिन न करता ऑर्डर दिली असल्यास, हा टोकन किंवा आपला ईमेल/मोबाईल क्रमांक वापरून ऑर्डर ट्रॅक करू शकता किंवा आपल्या खात्याशी जोडू शकता.'
                    : 'Use this token or your email/phone to track your guest order or link it to your reader account.'}
                </p>
              </div>
            )}

            <div className="space-y-2 text-[14px] text-slate-600">
              <p>
                <strong className="text-slate-900">
                  {lang === 'mr' ? 'वितरण पत्ता:' : 'Shipping Address:'}
                </strong>{' '}
                {completedOrder.customer.fullName}, {completedOrder.customer.addressLine1},{' '}
                {completedOrder.customer.city} - {completedOrder.customer.postalCode} (
                {completedOrder.customer.phone})
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/track-order')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[14px] font-semibold"
              >
                {t.nav.trackOrder}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/account/orders')}
                className="px-5 py-2.5 rounded-xl bg-[#243B8A] text-[#FFFDF7] text-[14px] font-semibold"
              >
                {lang === 'mr' ? 'खात्यात ऑर्डर जोडा / पाहा' : 'Save / View in Account'}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/books')}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-[14px] font-semibold"
              >
                {t.cart.continueShopping}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart guard
  if (!cartQuote || cartQuote.items.length === 0) {
    return (
      <div className="bg-[#FAF9F6] text-slate-900 min-h-screen py-16">
        <div className="max-w-xl mx-auto px-4 text-center space-y-4">
          <h1 className="type-section-heading">{t.cart.emptyTitle}</h1>
          <p className="text-slate-600">{t.cart.emptySubtitle}</p>
          <button
            type="button"
            onClick={() => onNavigate('/books')}
            className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[15px] font-semibold"
          >
            {t.cart.emptyCta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] text-slate-900 min-h-screen py-10 sm:py-14">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => onNavigate('/cart')}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.checkout.backToCart}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN: Single-Column Logical Checkout Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h1 className="type-page-heading text-slate-900">{t.checkout.title}</h1>
                <p className="text-[15px] text-slate-600 mt-1">{t.checkout.subtitle}</p>
              </div>

              {pendingOrder ? (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] space-y-2">
                    <p className="text-[13px] font-bold text-[#312E81]">
                      {lang === 'mr'
                        ? 'पायरी २: सर्व्हर पेमेंट पडताळणी'
                        : 'Step 2: Server Payment Verification'}
                    </p>
                    <h2 className="type-section-heading text-slate-900">
                      {lang === 'mr'
                        ? `ऑर्डर क्र. ${pendingOrder.orderNumber} — देय रक्कम ₹${pendingOrder.grandTotal}`
                        : `Order #${pendingOrder.orderNumber} — Payable ₹${pendingOrder.grandTotal}`}
                    </h2>
                    <p className="text-[14px] text-slate-600">
                      {lang === 'mr'
                        ? 'खालील बटणाद्वारे पेमेंट गेटवे पडताळणी पूर्ण करा. पेमेंट अयशस्वी झाल्यास तुमचा फॉर्म आणि पिशवीतील पुस्तके सुरक्षित राहतील.'
                        : 'Complete server-verified payment below. If payment fails, your cart and entered address remain intact for retry.'}
                    </p>
                  </div>

                  {pendingOrder.paymentStatus === 'failed' && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[14px] flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        {lang === 'mr'
                          ? 'पेमेंट व्यवहार पूर्ण झाला नाही. साठा वजा केलेला नाही. आपण खाली पुन्हा प्रयत्न करू शकता किंवा तपशील संपादित करू शकता.'
                          : 'Payment was not completed. Stock was not deducted. You may retry payment below or edit your details.'}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handlePaymentVerification('success')}
                      className="px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[15px] font-semibold transition-colors shadow-xs"
                    >
                      {lang === 'mr'
                        ? `पेमेंट यशस्वी करा (₹${pendingOrder.grandTotal})`
                        : `Complete Verified Payment (₹${pendingOrder.grandTotal})`}
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handlePaymentVerification('failed')}
                      className="px-5 py-3.5 rounded-xl bg-white border border-red-300 text-red-700 text-[14px] font-semibold"
                    >
                      {lang === 'mr'
                        ? 'पेमेंट अपयश तपासा (Retry चाचणी)'
                        : 'Simulate Payment Failure (Test Retry)'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingOrder(null)}
                      className="text-[14px] font-medium text-slate-600 hover:text-slate-900 underline"
                    >
                      {lang === 'mr' ? 'पत्ता संपादित करा' : 'Edit Shipping Address'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrder} noValidate className="space-y-8">
                  {errors.form && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[14px] flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errors.form}</span>
                    </div>
                  )}

                  {/* Section 1: Reader Contact Details */}
                  <div className="space-y-5">
                    <h2 className="type-section-heading text-slate-900">
                      {t.checkout.contactSection}
                    </h2>

                    <div>
                      <label
                        htmlFor="checkout-fullName"
                        className="block ui-label text-slate-900 mb-1.5"
                      >
                        {t.checkout.fullNameLabel}{' '}
                        <span className="text-red-700">*</span>
                      </label>
                      <input
                        ref={fullNameRef}
                        id="checkout-fullName"
                        type="text"
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName)
                            setErrors((p) => ({ ...p, fullName: '' }));
                        }}
                        placeholder={t.checkout.fullNamePlaceholder}
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={
                          errors.fullName ? 'checkout-fullName-error' : undefined
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-[15px] text-slate-900 focus:outline-none ${
                          errors.fullName
                            ? 'border-red-600 bg-red-50/20'
                            : 'border-slate-300 focus:border-slate-900'
                        }`}
                      />
                      {errors.fullName && (
                        <p
                          id="checkout-fullName-error"
                          role="alert"
                          className="mt-1.5 text-[13px] font-medium text-red-700 flex items-center gap-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="checkout-phone"
                          className="block ui-label text-slate-900 mb-1.5"
                        >
                          {t.checkout.phoneLabel}{' '}
                          <span className="text-red-700">*</span>
                        </label>
                        <input
                          ref={phoneRef}
                          id="checkout-phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errors.phone)
                              setErrors((p) => ({ ...p, phone: '' }));
                          }}
                          onBlur={() => handleFieldBlur('phone')}
                          placeholder={t.checkout.phonePlaceholder}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={
                            errors.phone
                              ? 'checkout-phone-error'
                              : 'checkout-phone-hint'
                          }
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-[15px] text-slate-900 focus:outline-none ${
                            errors.phone
                              ? 'border-red-600 bg-red-50/20'
                              : 'border-slate-300 focus:border-slate-900'
                          }`}
                        />
                        <p
                          id="checkout-phone-hint"
                          className="mt-1 text-[12px] text-slate-500"
                        >
                          {t.checkout.phoneHint}
                        </p>
                        {errors.phone && (
                          <p
                            id="checkout-phone-error"
                            role="alert"
                            className="mt-1.5 text-[13px] font-medium text-red-700 flex items-center gap-1.5"
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.phone}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="checkout-email"
                          className="block ui-label text-slate-900 mb-1.5"
                        >
                          {t.checkout.emailLabel}{' '}
                          <span className="text-red-700">*</span>
                        </label>
                        <input
                          ref={emailRef}
                          id="checkout-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email)
                              setErrors((p) => ({ ...p, email: '' }));
                          }}
                          onBlur={() => handleFieldBlur('email')}
                          placeholder={t.checkout.emailPlaceholder}
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={
                            errors.email
                              ? 'checkout-email-error'
                              : 'checkout-email-hint'
                          }
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-[15px] text-slate-900 focus:outline-none ${
                            errors.email
                              ? 'border-red-600 bg-red-50/20'
                              : 'border-slate-300 focus:border-slate-900'
                          }`}
                        />
                        <p
                          id="checkout-email-hint"
                          className="mt-1 text-[12px] text-slate-500"
                        >
                          {t.checkout.emailHint}
                        </p>
                        {errors.email && (
                          <p
                            id="checkout-email-error"
                            role="alert"
                            className="mt-1.5 text-[13px] font-medium text-red-700 flex items-center gap-1.5"
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.email}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Shipping Address */}
                  <div className="space-y-5 pt-6 border-t border-slate-100">
                    <h2 className="type-section-heading text-slate-900">
                      {t.checkout.shippingSection}
                    </h2>

                    <div>
                      <label
                        htmlFor="checkout-address1"
                        className="block ui-label text-slate-900 mb-1.5"
                      >
                        {t.checkout.addressLine1Label}{' '}
                        <span className="text-red-700">*</span>
                      </label>
                      <input
                        ref={addressLine1Ref}
                        id="checkout-address1"
                        type="text"
                        autoComplete="street-address"
                        value={addressLine1}
                        onChange={(e) => {
                          setAddressLine1(e.target.value);
                          if (errors.addressLine1)
                            setErrors((p) => ({ ...p, addressLine1: '' }));
                        }}
                        placeholder={t.checkout.addressLine1Placeholder}
                        aria-invalid={Boolean(errors.addressLine1)}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-[15px] text-slate-900 focus:outline-none ${
                          errors.addressLine1
                            ? 'border-red-600 bg-red-50/20'
                            : 'border-slate-300 focus:border-slate-900'
                        }`}
                      />
                      {errors.addressLine1 && (
                        <p
                          role="alert"
                          className="mt-1.5 text-[13px] font-medium text-red-700 flex items-center gap-1.5"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.addressLine1}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-address2"
                        className="block ui-label text-slate-900 mb-1.5"
                      >
                        {t.checkout.addressLine2Label}{' '}
                        <span className="text-[12px] font-normal text-slate-500">
                          ({t.checkout.optionalMarker})
                        </span>
                      </label>
                      <input
                        id="checkout-address2"
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-[15px] text-slate-900 focus:border-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="checkout-city"
                          className="block ui-label text-slate-900 mb-1.5"
                        >
                          {t.checkout.cityLabel}{' '}
                          <span className="text-red-700">*</span>
                        </label>
                        <input
                          ref={cityRef}
                          id="checkout-city"
                          type="text"
                          value={city}
                          onChange={(e) => {
                            setCity(e.target.value);
                            if (errors.city)
                              setErrors((p) => ({ ...p, city: '' }));
                          }}
                          aria-invalid={Boolean(errors.city)}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-[15px] text-slate-900 focus:outline-none ${
                            errors.city
                              ? 'border-red-600 bg-red-50/20'
                              : 'border-slate-300 focus:border-slate-900'
                          }`}
                        />
                        {errors.city && (
                          <p
                            role="alert"
                            className="mt-1.5 text-[13px] font-medium text-red-700 flex items-center gap-1.5"
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.city}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="checkout-district"
                          className="block ui-label text-slate-900 mb-1.5"
                        >
                          {t.checkout.districtLabel}{' '}
                          <span className="text-[12px] font-normal text-slate-500">
                            ({t.checkout.optionalMarker})
                          </span>
                        </label>
                        <input
                          id="checkout-district"
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-[15px] text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="checkout-state"
                          className="block ui-label text-slate-900 mb-1.5"
                        >
                          {t.checkout.stateLabel}
                        </label>
                        <input
                          id="checkout-state"
                          type="text"
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-[15px] text-slate-900 focus:border-slate-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="checkout-pin"
                          className="block ui-label text-slate-900 mb-1.5"
                        >
                          {t.checkout.postalCodeLabel}{' '}
                          <span className="text-red-700">*</span>
                        </label>
                        <input
                          ref={postalCodeRef}
                          id="checkout-pin"
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          value={postalCode}
                          onChange={(e) => {
                            setPostalCode(e.target.value);
                            if (errors.postalCode)
                              setErrors((p) => ({ ...p, postalCode: '' }));
                          }}
                          onBlur={() => handleFieldBlur('postalCode')}
                          placeholder={t.checkout.postalCodePlaceholder}
                          aria-invalid={Boolean(errors.postalCode)}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-[15px] text-slate-900 focus:outline-none ${
                            errors.postalCode
                              ? 'border-red-600 bg-red-50/20'
                              : 'border-slate-300 focus:border-slate-900'
                          }`}
                        />
                        {errors.postalCode && (
                          <p
                            role="alert"
                            className="mt-1.5 text-[13px] font-medium text-red-700 flex items-center gap-1.5"
                          >
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.postalCode}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 space-y-3">
                      <div className="flex flex-wrap items-center gap-6">
                        <label className="inline-flex items-center gap-2.5 text-[14px] text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isInstitutionalOrder}
                            onChange={(e) => setIsInstitutionalOrder(e.target.checked)}
                            className="w-4 h-4 rounded accent-slate-900"
                          />
                          <span>{t.checkout.institutionalToggle}</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const giftPrefix =
                              lang === 'mr'
                                ? '[भेटप्रत व साहित्यिक बुकमार्क सह] स्नेहपूर्वक भेट: '
                                : '[Include Complimentary Literary Gift Bookmark] Gift Note: ';
                            if (!orderNotes.includes(giftPrefix)) {
                              setOrderNotes((prev) =>
                                prev ? `${giftPrefix}${prev}` : giftPrefix
                              );
                            }
                          }}
                          className="text-[13px] font-semibold text-[#243B8A] hover:underline cursor-pointer"
                        >
                          {lang === 'mr'
                            ? '+ भेटप्रत बुकमार्क व शुभेच्छा संदेश जोडा (मोफत)'
                            : '+ Add Complimentary Literary Gift Bookmark & Note'}
                        </button>
                      </div>

                      {isInstitutionalOrder && (
                        <div>
                          <label
                            htmlFor="checkout-institution"
                            className="block ui-label text-slate-900 mb-1.5"
                          >
                            {t.checkout.institutionNameLabel}
                          </label>
                          <input
                            id="checkout-institution"
                            type="text"
                            value={institutionName}
                            onChange={(e) => setInstitutionName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-[15px]"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="checkout-notes"
                        className="block ui-label text-slate-900 mb-1.5"
                      >
                        {t.checkout.orderNotesLabel}{' '}
                        <span className="text-[12px] font-normal text-slate-500">
                          ({t.checkout.optionalMarker})
                        </span>
                      </label>
                      <textarea
                        id="checkout-notes"
                        rows={2}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-[15px]"
                      />
                    </div>
                  </div>

                  {/* Section 3: Payment Method */}
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h2 className="type-section-heading text-slate-900">
                      {t.checkout.paymentSection}
                    </h2>

                    <div className="space-y-2.5">
                      {(
                        [
                          { id: 'upi_verified', label: t.checkout.paymentUpi },
                          { id: 'razorpay_standard', label: t.checkout.paymentCard },
                          {
                            id: 'institutional_invoice',
                            label: t.checkout.paymentInstitutional,
                          },
                        ] as const
                      ).map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                            paymentMethod === opt.id
                              ? 'border-slate-900 bg-slate-50'
                              : 'border-slate-200 bg-white hover:bg-slate-50/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={paymentMethod === opt.id}
                            onChange={() => setPaymentMethod(opt.id)}
                            className="w-4 h-4 accent-slate-900"
                          />
                          <span className="text-[15px] font-semibold text-slate-900">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    data-testid="submit-checkout-btn"
                    disabled={submitting}
                    className="w-full py-4 px-6 rounded-xl bg-[#121316] hover:bg-[#312E81] text-white text-[16px] font-semibold transition-all shadow-sm"
                  >
                    {submitting
                      ? t.checkout.submittingBtn
                      : `${t.checkout.placeOrderBtn} — ₹${cartQuote.grandTotal}`}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Authoritative Order Summary */}
          <aside className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-5 sticky top-24">
            <h2 className="type-section-heading text-slate-900 border-b border-slate-100 pb-3">
              {t.cart.orderSummary}
            </h2>

            <div className="divide-y divide-slate-100 text-[14px]">
              {cartQuote.items.map((item) => (
                <div
                  key={item.bookId}
                  className="py-3 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="font-serif font-bold text-slate-900 text-[16px]">
                      {item.title}
                    </p>
                    <p className="text-slate-500 text-[13px]">
                      {item.approvedQuantity} × ₹{item.unitPrice}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ₹{item.lineTotal}
                  </span>
                </div>
              ))}
            </div>

            <dl className="pt-3 border-t border-slate-100 space-y-2.5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-slate-600">{t.cart.subtotal}</dt>
                <dd className="font-semibold text-slate-900">
                  ₹{cartQuote.subtotal}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">{t.cart.shipping}</dt>
                <dd className="font-semibold text-slate-900">
                  {cartQuote.shippingCost === 0
                    ? `${t.cart.freeShipping} (₹0)`
                    : `₹${cartQuote.shippingCost}`}
                </dd>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <dt className="text-[16px] font-bold text-slate-900">
                  {t.cart.grandTotal}
                </dt>
                <dd className="text-[24px] font-bold text-slate-900">
                  ₹{cartQuote.grandTotal}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. ORDER TRACKING VIEW (/track-order)
// ============================================================================

interface OrderTrackingViewProps {
  onLookupOrder: (
    orderNumber: string,
    contact: string
  ) => Promise<{ ok: boolean; order?: OrderRecord; error?: string }>;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  onLookupOrder,
}) => {
  const { lang, t } = useLanguage();
  const [orderNumber, setOrderNumber] = useState('AK-2026-1041');
  const [contact, setContact] = useState('9823011223');
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await onLookupOrder(orderNumber.trim(), contact.trim());
      if (res.ok && res.order) {
        setOrder(res.order);
      } else {
        setOrder(null);
        setError(res.error || 'Order not found.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF8F3] text-[#121316] min-h-screen py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32 }}
        className="max-w-[760px] mx-auto px-4 sm:px-6 space-y-8"
      >
        <div>
          <h1 className="type-page-heading text-[#121316]">
            {t.trackOrder.title}
          </h1>
          <p className="text-[16px] text-[#52504C] mt-1">
            {t.trackOrder.subtitle}
          </p>
        </div>

        <form
          onSubmit={handleLookup}
          className="bg-white rounded-3xl border border-[#E5E0D5] shadow-xs p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="track-order-num" className="block ui-label mb-1.5">
                {t.trackOrder.orderNumberLabel} <span className="text-[#B42318]">*</span>
              </label>
              <input
                id="track-order-num"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] text-[15px] bg-white"
              />
            </div>

            <div>
              <label htmlFor="track-contact" className="block ui-label mb-1.5">
                {t.trackOrder.contactLabel} <span className="text-[#B42318]">*</span>
              </label>
              <input
                id="track-contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0D5] text-[15px] bg-white"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[14px] font-medium text-[#B42318] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#121316] hover:bg-[#312E81] text-white text-[15px] font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>{t.trackOrder.searchBtn}</span>
          </button>
        </form>

        {order && (
          <div className="bg-white rounded-3xl border border-[#E5E0D5] shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E0D5] pb-4">
              <div>
                <span className="text-[13px] text-[#52504C]">
                  {lang === 'mr' ? 'ऑर्डर क्रमांक' : 'Order Number'}
                </span>
                <h2 className="font-mono text-[20px] font-bold text-[#121316]">
                  {order.orderNumber}
                </h2>
              </div>
              <span className="text-[13px] font-bold text-[#15803D]">
                ● {order.orderStatus}
              </span>
            </div>

            {order.fulfilment.trackingNumber && (
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E5E0D5] text-[14px]">
                <p>
                  <strong>{lang === 'mr' ? 'कुरिअर / पोस्ट:' : 'Courier:'}</strong>{' '}
                  {order.fulfilment.courierPartner} ·{' '}
                  <strong>{lang === 'mr' ? 'ट्रॅकिंग क्र.:' : 'Tracking #:'}</strong>{' '}
                  <span className="font-mono">{order.fulfilment.trackingNumber}</span>
                </p>
              </div>
            )}

            <div className="divide-y divide-[#E5E0D5] text-[14px]">
              {order.items.map((item) => (
                <div key={item.bookId} className="py-2.5 flex justify-between">
                  <span>
                    {item.title} × {item.approvedQuantity}
                  </span>
                  <span className="font-semibold tabular-nums">₹{item.lineTotal}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================================
// 4. POLICY DOCUMENT VIEW (/privacy, /terms, /shipping-returns)
//    Tailored specifically for Akath Prakashan as a Small-Scale Independent
//    Regional Publishing House based in Nanded, Maharashtra.
// ============================================================================

export const PolicyDocumentView: React.FC<{
  policyType: 'privacy' | 'terms' | 'shipping-returns';
  onNavigate: (path: string) => void;
}> = ({ policyType, onNavigate }) => {
  const { lang, t } = useLanguage();

  const titles = {
    privacy: t.footer.privacyPolicy,
    terms: t.footer.termsOfUse,
    'shipping-returns': t.footer.shippingPolicy,
  };

  const subtitles = {
    privacy:
      lang === 'mr'
        ? 'लहान व स्वतंत्र प्रकाशन संस्थेचे पारदर्शक वाचक-गोपनीयता धोरण (नांदेड, महाराष्ट्र)'
        : 'Honest, Human-Scale Reader & Author Privacy Charter for an Independent Small Publishing House',
    terms:
      lang === 'mr'
        ? 'स्वतंत्र प्रादेशिक ग्रंथप्रकाशन, थेट वाचक खरेदी आणि कॉपीराइट संबंधी सेवा अटी'
        : 'Small-Business Terms of Sale, Print-Run Fulfilment, Literary Copyright & Reader Charter',
    'shipping-returns':
      lang === 'mr'
        ? 'नांदेड संपादकीय कक्षातून भारतीय स्पीड पोस्ट वितरण आणि प्रामाणिक बदली प्रत हमी'
        : 'Direct Dispatch from Our Nanded Desk via India Post Speed Post & Damaged-Copy Replacement Policy',
  };

  return (
    <div className="bg-[#FAF8F3] text-[#1C1917] min-h-screen py-12 lg:py-16">
      <div className="max-w-[880px] mx-auto px-4 sm:px-6 space-y-6">
        {/* Top Back Link & Policy Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#57534E] hover:text-[#243B8A] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'mr' ? 'अकथ प्रकाशन मुख्यपृष्ठ' : 'Back to Akath Prakashan'}</span>
          </button>

          <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white border border-[#DCD4C0]">
            {(
              [
                { id: 'privacy', path: '/privacy', label: t.footer.privacyPolicy },
                { id: 'terms', path: '/terms', label: t.footer.termsOfUse },
                {
                  id: 'shipping-returns',
                  path: '/shipping-returns',
                  label: t.footer.shippingPolicy,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.path)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${
                  policyType === tab.id
                    ? 'bg-[#243B8A] text-[#FFFDF7]'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Archival Policy Folio */}
        <article
          data-testid={`policy-document-${policyType}`}
          className="bg-white rounded-3xl border border-[#DCD4C0] shadow-xs overflow-hidden"
        >
          {/* Folio Header Banner */}
          <header className="bg-[#152354] text-[#FFFDF7] p-7 sm:p-10 border-b border-[#DCD4C0] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#FFD966]">
              <span>
                {lang === 'mr'
                  ? 'अकथ प्रकाशन · स्वतंत्र लहान प्रकाशन संस्था · नांदेड'
                  : 'AKATH PRAKASHAN · SMALL-SCALE INDEPENDENT PRESS · NANDED'}
              </span>
              <span>EFFECTIVE: 2026 EDITION</span>
            </div>
            <h1 className="font-serif text-[28px] sm:text-[36px] font-bold text-[#FFFDF7] leading-tight">
              {titles[policyType]}
            </h1>
            <p className="text-[15px] text-[#FFFDF7]/85 max-w-2xl leading-relaxed">
              {subtitles[policyType]}
            </p>
          </header>

          {/* Small-Business Context Callout */}
          <div className="bg-[#FFFDF7] border-b border-[#E6E1D6] px-7 sm:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#243B8A] font-semibold">
                {lang === 'mr'
                  ? 'आमच्या स्वतंत्र प्रकाशनाचे स्वरूप (Small-Business Note)'
                  : 'A Note on Our Independent Small-Business Scale'}
              </p>
              <p className="text-[13.5px] text-[#44403C] leading-relaxed">
                {lang === 'mr'
                  ? 'अकथ प्रकाशन ही कोणतीही कॉर्पोरेट ई-कॉमर्स कंपनी नसून नांदेड (महाराष्ट्र) येथून चालणारी एक लहान, स्वतंत्र मराठी साहित्यिक प्रकाशन संस्था आहे. प्रत्येक पुस्तक आम्ही स्वतः तपासून, बांधून आणि पॅक करून वाचकांपर्यंत पाठवतो.'
                  : 'Akath Prakashan is not a giant algorithmic marketplace. We are an independent, small-scale regional publishing house in Nanded, Maharashtra. Every manuscript is read by human editors, and every book parcel is inspected and packed by hand at our desk.'}
              </p>
            </div>
          </div>

          {/* Policy Body Sections */}
          <div className="p-7 sm:p-10 space-y-8 text-[15.5px] text-[#292524] leading-[1.8]">
            {policyType === 'privacy' && (
              <>
                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '१. आम्ही कोण आहोत आणि कोणता डेटा गोळा करतो?'
                      : '1. Who We Are & What Minimal Data We Collect'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'अकथ प्रकाशन (संस्थापक व प्रकाशक: पूजा वसंतराव ढवळे, पवार कॉम्प्लेक्स, मालेगाव रोड, तरोडा नाका, नांदेड – ४३१६०५) येथे आम्ही वाचकांच्या आणि लेखकांच्या खाजगी माहितीचा पूर्ण आदर करतो. एक लहान स्वतंत्र व्यवसाय म्हणून आमच्याकडे फक्त खालील कामांसाठी आवश्यक तेवढीच माहिती घेतली जाते:'
                      : 'Operated directly from our publishing office at Pawar Complex, Malegaon Road, Taroda Naka, Nanded – 431605, Maharashtra (Founder & Publisher: Pooja Vasantrao Dhawale), we collect only the bare minimum personal information needed to run an honest small book press:'}
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-[14.5px] text-[#44403C]">
                    <li>
                      <strong>
                        {lang === 'mr' ? 'पुस्तक ऑर्डर व पोस्टल वितरण:' : 'Book Orders & Postal Dispatch:'}
                      </strong>{' '}
                      {lang === 'mr'
                        ? 'तुमचे पूर्ण नाव, घरचा/संस्थेचा पत्ता, पिनकोड, मोबाईल क्रमांक (भारतीय पोस्टमन किंवा कुरिअर प्रतिनिधीला घरपोच वितरणासाठी आवश्यक) आणि ईमेल पत्ता (पावती व ट्रॅकिंग क्रमांक पाठवण्यासाठी).'
                        : 'Your full name, delivery address, PIN code, mobile number (required by India Post Speed Post / Registered Book Post and regional couriers to coordinate doorstep delivery), and email address (to send your order receipt and tracking number).'}
                    </li>
                    <li>
                      <strong>
                        {lang === 'mr' ? 'सुरक्षित पेमेंट तपशील:' : 'Payment Processing:'}
                      </strong>{' '}
                      {lang === 'mr'
                        ? 'तुमचे UPI किंवा कार्ड पेमेंट अधिकृत पेमेंट गेटवेद्वारे (Razorpay / UPI) हाताळले जाते. आम्ही तुमचा कार्ड नंबर, CVV किंवा UPI पिन आमच्या सर्व्हरवर कधीही पाहत किंवा साठवत नाही.'
                        : 'Payments are processed through verified UPI and standard Razorpay payment rails. We never see, handle, or store your debit/credit card numbers, CVV, or UPI PINs.'}
                    </li>
                    <li>
                      <strong>
                        {lang === 'mr' ? 'हस्तलिखित प्रस्ताव (/submit-manuscript):' : 'Manuscript Submissions (/submit-manuscript):'}
                      </strong>{' '}
                      {lang === 'mr'
                        ? 'लेखकांनी पाठवलेले हस्तलिखित, सारांश आणि संपर्क माहिती अत्यंत गोपनीय ठेवली जाते. ती केवळ आमच्या संपादकीय मंडळाकडून वाचली जाते आणि कोणत्याही बाह्य व्यक्तीस किंवा AI प्रणालीला दिली जात नाही.'
                        : 'Author synopses, sample chapters, and contact details submitted to our desk are treated as strictly confidential literary correspondence. They are read solely by our Nanded editorial team and never shared externally or fed into automated training systems.'}
                    </li>
                  </ul>
                </section>

                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '२. जाहिरात ट्रॅकर्स नाहीत आणि डेटाची विक्री नाही (Zero Data Brokering)'
                      : '2. Zero Ad-Tech Surveillance & Zero Data Selling'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'मोठ्या वेबसाइट्सप्रमाणे आम्ही तुमच्या वाचनाच्या सवयी ट्रॅक करणारे थर्ड-पार्टी जाहिरात पिक्सेल (Ad Pixels) वापरत नाही. वाचकांचे नाव, मोबाईल क्रमांक किंवा ईमेल पत्ता कोणत्याही मार्केटिंग कंपनीला किंवा तिसऱ्या पक्षास कधीही विकला, भाड्याने दिला किंवा शेअर केला जात नाही.'
                      : 'Unlike large commercial platforms, we do not run third-party advertising trackers, behavioral profiling pixels, or cross-site retargeting scripts. Reader names, phone numbers, and addresses are never sold, rented, or traded with any marketing agency or third party.'}
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '३. ब्राउझर लोकल स्टोरेज (Local Storage) चा वापर'
                      : '3. How Your Browser Stores Cart & Reading Preferences'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'तुमचा वाचनाचा आणि खरेदीचा अनुभव सहज व्हावा म्हणून हे संकेतस्थळ तुमच्या ब्राउझरमधील LocalStorage चा वापर फक्त तीन गोष्टींसाठी करते: (अ) तुमची निवडलेली भाषा (English / मराठी), (ब) तुमच्या पिशवीतील पुस्तके (Cart items), आणि (क) वाचनकट्ट्यावरील अक्षरांचा आकार व कागदाचा रंग. ही माहिती तुमच्या स्वतःच्या डिव्हाइसवरच राहते.'
                      : 'To keep the site fast and respectful of your privacy, we use local browser storage only for functional essentials: (a) remembering your chosen language (English or Marathi), (b) keeping your selected books in your shopping bag across page refreshes, and (c) saving your reading typography preferences on Vachankatta.'}
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '४. डेटा जतन, बदल किंवा हटवण्याचा तुमचा अधिकार'
                      : '4. Data Retention, Correction & Direct Human Contact'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'तुमच्या ऑर्डरची माहिती केवळ भारतीय कर व लेखा नियमांनुसार (Accounting & Bookkeeping) आणि तुम्हाला भविष्यात ऑर्डर संदर्भ लागल्यास उपयोगी पडावी म्हणूनच ठेवली जाते. तुम्हाला तुमचा ईमेल वाचनपत्रिकेतून काढून टाकायचा असल्यास किंवा तुमची माहिती बदलायची/हटवायची असल्यास आम्हाला थेट ईमेल (akathpublication@gmail.com) किंवा व्हॉट्सॲप (+91 92702 82932) वर कळवा; आम्ही ४८ तासांत ती विनंती पूर्ण करू.'
                      : 'Order invoices are retained strictly for small-business bookkeeping and statutory tax records. Because you are dealing directly with a small independent publisher—not an automated bot—you can email us at akathpublication@gmail.com or message +91 92702 82932 at any time to update your delivery address, unsubscribe from literary dispatches, or request deletion of your personal profile.'}
                  </p>
                </section>
              </>
            )}

            {policyType === 'terms' && (
              <>
                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '१. स्वतंत्र लहान प्रकाशन संस्थेसोबतचा व्यवहार'
                      : '1. About Our Small-Scale Independent Publishing Operations'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'हे संकेतस्थळ अकथ प्रकाशन (नांदेड, महाराष्ट्र) द्वारे चालवले जाते. आमच्याकडून पुस्तक खरेदी करताना किंवा वाचनकट्ट्यावरील साहित्य वाचताना तुम्ही एका स्वतंत्र, प्रादेशिक साहित्यिक प्रकाशन संस्थेशी थेट जोडले जाता. आमची पुस्तके निवडक आणि मर्यादित मुद्रण आवृत्त्यांमध्ये (Small Print Runs) छापली जातात.'
                      : 'This website and bookstore are operated directly by Akath Prakashan, an independent small-scale publishing house headquartered in Nanded, Maharashtra. When you order a book from this site, you are buying directly from the publisher’s own dispatch desk, directly supporting regional Marathi authors and independent print craftsmanship.'}
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '२. पुस्तकांच्या किमती, कर (०% GST) आणि उपलब्ध साठा'
                      : '2. Book Pricing, Printed Book GST Exemption & Order Limits'}
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 text-[14.5px] text-[#44403C]">
                    <li>
                      {lang === 'mr'
                        ? 'संकेतस्थळावरील सर्व पुस्तकांच्या किमती भारतीय रुपयांत (INR) दर्शविल्या आहेत. भारतीय कर प्रणालीनुसार छापील पुस्तकांवर (HSN 4901) ०% वस्तू व सेवा कर (0% GST) लागू असतो.'
                        : 'All prices are listed in Indian Rupees (INR). Under Indian tax regulations (HSN 4901), printed books are exempt from GST (0% GST), so the cover price shown is the exact book price.'}
                    </li>
                    <li>
                      {lang === 'mr'
                        ? 'लहान मुद्रण आवृत्त्या असल्यामुळे, एका किरकोळ ऑनलाइन ऑर्डरमध्ये एका पुस्तकाच्या जास्तीत जास्त २० प्रती मागवता येतात. महाविद्यालये, ग्रंथालये किंवा पुस्तक विक्रेत्यांना २० पेक्षा अधिक प्रती हव्या असल्यास त्यांनी थेट संपर्क कक्षाशी (/contact) किंवा +91 92702 82932 वर संपर्क साधावा.'
                        : 'Because we print in curated small editions, individual online checkout is capped at 20 copies per title. Colleges, public libraries, reading circles, and independent bookshops ordering in bulk are warmly invited to select "Institutional Invoice" at checkout or contact us directly for trade terms.'}
                    </li>
                  </ul>
                </section>

                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '३. वितरण, प्रवासातील हानी आणि प्रामाणिक बदली प्रत धोरण'
                      : '3. Dispatch, Transit Damage & Small-Business Replacement Policy'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'ऑर्डर मिळाल्यानंतर १ ते २ कामकाजाच्या दिवसांत नांदेड कार्यालयातून भारतीय स्पीड पोस्ट (India Post Speed Post / Registered Book Post) किंवा विश्वासू कुरिअरने पुस्तके पाठवली जातात. एक लहान प्रकाशन संस्था म्हणून पुस्तक वाचून झाल्यानंतर किंवा केवळ मन बदलले म्हणून परतावा (Return) स्वीकारणे आम्हाला शक्य नसते. मात्र, पोस्टाच्या प्रवासात पुस्तकाचे कव्हर फाटल्यास, बांधणी खराब झाल्यास किंवा छपाईत कोणतीही त्रुटी आढळल्यास ७ दिवसांच्या आत पुस्तकाचा फोटो व्हॉट्सॲप (+91 92702 82932) किंवा ईमेलवर पाठवावा — आम्ही कोणतेही अतिरिक्त शुल्क न घेता नवीन बदली प्रत पाठवतो किंवा पूर्ण रक्कम परत करतो.'
                      : 'Orders are packed by hand in protective book-board mailers and dispatched within 1–2 working days via India Post (Registered Book Post / Speed Post) or regional courier. As a small independent press, we cannot accept arbitrary "change-of-mind" returns once a book has been delivered and read. However, we stand 100% behind the physical craft of our editions: if your parcel arrives with severe transit damage, water damage, or a printing/binding defect (such as missing signatures or blank pages), simply share a clear photograph or brief unboxing clip on WhatsApp (+91 92702 82932) or email within 7 days of delivery for a free replacement copy or full refund.'}
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '४. साहित्यिक कॉपीराइट, ‘पहिले पान’ आणि लेखक हक्क'
                      : '4. Literary Copyright, "First Page" Folios & Author Rights'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'या संकेतस्थळावरील सर्व पुस्तके, मुखपृष्ठे, ‘पहिले पान’ (First Page) मधील ६ पानांचे PDF उतारे आणि ‘वाचनकट्टा’ वरील लेख यांचे सर्व हक्क संबंधित लेखक आणि अकथ प्रकाशनकडे राखीव आहेत. पुस्तक परीक्षण, शैक्षणिक अभ्यास किंवा महाविद्यालयीन चर्चेसाठी योग्य संदर्भासह लहान उतारे वापरण्यास आमचे प्रोत्साहन आहे; परंतु पूर्वपरवानगीशिवाय संपूर्ण मजकूर किंवा PDF चे व्यावसायिक पुनर्मुद्रण किंवा वितरण करण्यास मनाई आहे.'
                      : 'All books, cover designs, 6-page "First Page" (पहिले पान) PDF folios, and Vachankatta essays remain the copyrighted intellectual property of their respective Marathi authors and Akath Prakashan. Brief quotations for book reviews, scholarly citations, or reading-group discussions are warmly welcomed with credit, but unauthorized commercial reproduction or redistribution of full texts or PDF folios is prohibited.'}
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '५. हस्तलिखित मूल्यांकन आणि न्यायक्षेत्र (नांदेड, महाराष्ट्र)'
                      : '5. Manuscript Evaluation & Local Jurisdiction (Nanded, Maharashtra)'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'लेखकांनी ‘हस्तलिखित पाठवा’ (/submit-manuscript) द्वारे पाठवलेल्या साहित्याचे कॉपीराइट १००% लेखकाकडेच राहतात; जोपर्यंत दोन्ही बाजूंनी अधिकृत प्रकाशन करार स्वाक्षरीत होत नाही तोपर्यंत अकथ प्रकाशन केवळ संपादकीय वाचनाचा अधिकार ठेवते. कोणत्याही वादाचे निराकरण परस्पर संवादाने केले जाईल आणि न्यायालयीन कार्यक्षेत्र केवळ नांदेड (महाराष्ट्र) येथील न्यायालयांचे राहील.'
                      : 'Submitting a manuscript through our portal grants Akath Prakashan only a confidential right to read and evaluate the work; 100% of copyright remains with the author unless and until a formal written publishing agreement is signed by both parties. Any legal disputes arising from website use or book orders shall be governed by Indian law and subject exclusively to the local jurisdiction of the courts in Nanded, Maharashtra.'}
                  </p>
                </section>
              </>
            )}

            {policyType === 'shipping-returns' && (
              <>
                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '१. नांदेड कार्यालयातून थेट स्पीड पोस्ट व कुरिअर वितरण'
                      : '1. Direct Dispatch from Nanded via India Post & Regional Courier'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'अकथ प्रकाशनकडून सर्व ऑर्डर १ ते २ कामकाजाच्या दिवसांत मजबूत कार्डबोर्ड पॅकेजिंगमध्ये भारतीय स्पीड पोस्ट (India Post Speed Post / Registered Book Post) किंवा नोंदणीकृत कुरिअरद्वारे पाठवल्या जातात. ₹६०० किंवा त्याहून अधिक मूल्याच्या ऑर्डरवर संपूर्ण भारतात मोफत वितरण दिले जाते (₹६०० खालील ऑर्डरसाठी ₹४५ इतके नाममात्र पोस्टल शुल्क आकारले जाते).'
                      : 'All orders placed with Akath Prakashan are carefully wrapped in moisture-resistant layers and corrugated book-board corners at our Nanded desk and dispatched within 1–2 working days via India Post Registered/Speed Post or courier. Orders of ₹600 and above receive free shipping across India (a flat ₹45 postal contribution applies to orders under ₹600).'}
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h2 className="font-serif text-[20px] font-bold text-[#1C1917]">
                    {lang === 'mr'
                      ? '२. प्रवासातील हानी किंवा मुद्रण दोष असल्यास मोफत बदली प्रत'
                      : '2. Damaged or Defective Copies: 7-Day Free Replacement'}
                  </h2>
                  <p>
                    {lang === 'mr'
                      ? 'प्रवासात पुस्तकास कोणतीही मुद्रण किंवा बांधणीची हानी झाल्यास पुस्तक मिळाल्यापासून ७ दिवसांच्या आत पुस्तकाच्या फोटोसह व्हॉट्सॲप (+91 92702 82932) किंवा ईमेल (akathpublication@gmail.com) वर संपर्क साधल्यास विनाशुल्क बदली प्रत पाठवली जाते.'
                      : 'If a book arrives with transit damage or a printing defect, please contact us within 7 days with a quick photo on WhatsApp (+91 92702 82932) or email (akathpublication@gmail.com) for a free replacement copy.'}
                  </p>
                </section>
              </>
            )}

            {/* Direct Small-Business Contact Footer Card inside Policy */}
            <div className="mt-8 pt-6 border-t border-[#E6E1D6] bg-[#FAF8F3] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-[13.5px] text-[#44403C]">
                <p className="font-serif font-bold text-[16px] text-[#1C1917]">
                  {lang === 'mr'
                    ? 'अकथ प्रकाशन · संपादकीय व वितरण कक्ष'
                    : 'Akath Prakashan · Editorial & Dispatch Desk'}
                </p>
                <p>
                  {lang === 'mr'
                    ? 'पवार कॉम्प्लेक्स, मालेगाव रोड, तरोडा नाका, नांदेड – ४३१६०५, महाराष्ट्र'
                    : 'Pawar Complex, Malegaon Road, Taroda Naka, Nanded – 431605, Maharashtra'}
                </p>
                <p className="font-mono text-[12.5px] text-[#243B8A]">
                  akathpublication@gmail.com · +91 92702 82932
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="px-4 py-2.5 rounded-xl bg-[#243B8A] hover:bg-[#1B2D6B] text-[#FFFDF7] text-[13.5px] font-semibold transition-colors cursor-pointer shrink-0"
              >
                {lang === 'mr' ? 'थेट संपर्क साधा →' : 'Contact Our Desk →'}
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
