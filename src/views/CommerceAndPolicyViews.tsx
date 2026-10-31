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
  const [busyBookId, setBusyBookId] = useState<string | null>(null);

  const items = cartQuote?.items || [];
  const isEmpty = items.length === 0;
  const totalCopies = items.reduce((sum, item) => sum + item.approvedQuantity, 0);
  const subtotal = cartQuote?.subtotal || 0;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / 600) * 100));

  const handleStepQuantity = (bookId: string, targetQty: number, maxStock: number) => {
    if (targetQty < 1 || targetQty > Math.min(maxStock, 20)) return;
    if (busyBookId === bookId) return;
    setBusyBookId(bookId);
    onUpdateQuantity(bookId, targetQty);
    setTimeout(() => setBusyBookId(null), 120);
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
              अकथ प्रकाशन · {t.nav.cart}
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
                    <span>{cartQuote?.shippingRuleNote}</span>
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
                                disabled={
                                  line.approvedQuantity <= 1 ||
                                  busyBookId === line.bookId ||
                                  loadingQuote
                                }
                                aria-label={`${t.cart.decreaseQty} — ${line.title}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] font-bold text-[#252832] hover:bg-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
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
                                disabled={
                                  line.approvedQuantity >= maxAllowed ||
                                  busyBookId === line.bookId ||
                                  loadingQuote
                                }
                                aria-label={`${t.cart.increaseQty} — ${line.title}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] font-bold text-[#252832] hover:bg-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
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
                            className="px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#525665] hover:text-[#EF6855] hover:bg-[#EF6855]/10 inline-flex items-center gap-1.5 transition-colors"
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

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="text-[14px] font-semibold text-[#252832] hover:text-[#243B8A] inline-flex items-center gap-2"
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
                  <dt className="text-[#525665]">{t.cart.discount}</dt>
                  <dd className="text-[#525665] tabular-nums">₹0</dd>
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
                    ₹{cartQuote?.grandTotal || 0}
                  </dd>
                </div>
              </dl>

              {/* Primary Checkout CTA in Coral Red (#EF6855) */}
              <button
                type="button"
                data-testid="proceed-to-checkout-btn"
                disabled={!cartQuote?.isValidForCheckout || loadingQuote}
                onClick={() => onNavigate('/checkout')}
                className="w-full py-3.5 px-5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] disabled:bg-slate-200 disabled:text-slate-500 text-[#FFFDF7] text-[16px] font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
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
    outcome: 'success' | 'failed'
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
      const res = await onVerifyPayment(pendingOrder.id, outcome);
      if (res.ok && res.order) {
        if (res.order.paymentStatus === 'verified') {
          setCompletedOrder(res.order);
          setPendingOrder(null);
        } else {
          setPendingOrder(res.order);
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
                  अकथ प्रकाशन · पावती
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
                      <label className="inline-flex items-center gap-2.5 text-[14px] text-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInstitutionalOrder}
                          onChange={(e) => setIsInstitutionalOrder(e.target.checked)}
                          className="w-4 h-4 rounded accent-slate-900"
                        />
                        <span>{t.checkout.institutionalToggle}</span>
                      </label>

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
// 4. POLICY DOCUMENT VIEW (/policies/:slug)
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

  return (
    <div className="bg-[#FAF9F6] text-slate-900 min-h-screen py-12 lg:py-16">
      <div className="max-w-[780px] mx-auto px-4 sm:px-6 space-y-6">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>अकथ प्रकाशन</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-8 sm:p-10 space-y-5">
          <h1 className="type-page-heading text-slate-900">
            {titles[policyType]}
          </h1>
          <div className="prose-marathi text-slate-700 space-y-4">
            {policyType === 'shipping-returns' && (
              <>
                <p>
                  {lang === 'mr'
                    ? 'अकथ प्रकाशनकडून सर्व ऑर्डर २ कामकाजाच्या दिवसांत भारतीय स्पीड पोस्ट किंवा नोंदणीकृत कुरिअरद्वारे पाठवल्या जातात. ₹६०० किंवा त्याहून अधिक मूल्याच्या ऑर्डरवर संपूर्ण भारतात मोफत वितरण दिले जाते.'
                    : 'All orders placed with Akath Prakashan are dispatched within 2 working days via India Post Registered/Speed Post or courier. Orders of ₹600 and above receive free shipping across India.'}
                </p>
                <p>
                  {lang === 'mr'
                    ? 'प्रवासात पुस्तकास कोणतीही मुद्रण किंवा बांधणीची हानी झाल्यास ७ दिवसांच्या आत फोटोसह संपर्क साधल्यास विनाशुल्क बदली प्रत पाठवली जाते.'
                    : 'If a book arrives with transit damage or a printing defect, please contact us within 7 days for a free replacement copy.'}
                </p>
              </>
            )}
            {policyType === 'privacy' && (
              <p>
                {lang === 'mr'
                  ? 'वाचकांचे नाव, ईमेल, मोबाईल क्रमांक आणि पत्ता फक्त पुस्तक वितरण आणि निवडलेल्या वाचनपत्रिकेपुरताच वापरला जातो. आम्ही कोणताही डेटा तिसऱ्या पक्षास विकत किंवा शेअर करत नाही.'
                  : 'Reader names, email addresses, mobile numbers, and shipping addresses are used strictly for order fulfilment and opted-in literary newsletters. We never sell or share reader data.'}
              </p>
            )}
            {policyType === 'terms' && (
              <p>
                {lang === 'mr'
                  ? 'अकथ प्रकाशनच्या संकेतस्थळावरील सर्व पुस्तके, उतारे (पहिले पान) आणि वाचनकट्टा लेख यांचे कॉपीराइट संबंधित लेखक आणि अकथ प्रकाशनकडे राखीव आहेत.'
                  : 'All books, First Page excerpts, and Vachankatta essays on this website are copyright protected by their respective authors and Akath Prakashan.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
