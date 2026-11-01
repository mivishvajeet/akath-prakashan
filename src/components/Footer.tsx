import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/translations';
import { validateEmail } from '../utils/validation';
import {
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  MapPin,
  Mail,
  Phone,
  BookOpen,
  Feather,
  Clock,
} from 'lucide-react';
import {
  HorizonArchIllustration,
  AnimatedTortoiseEmblem,
} from './SarvamIllustrations';
import { PUBLISHER_IDENTITY } from '../data/seedData';

interface FooterProps {
  onNavigate: (path: string) => void;
  onSubscribeNewsletter?: (
    email: string,
    name?: string
  ) => Promise<{
    ok: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string>;
  }>;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onSubscribeNewsletter,
}) => {
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [now, setNow] = useState<Date>(() => new Date());

  const emailInputRef = useRef<HTMLInputElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const currentYear = new Date().getFullYear();

  // Live ticking IST clock for the Colophon folio header
  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const colophonDateTime = (() => {
    try {
      const dateStr = new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }).format(now);
      const timeStr = new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }).format(now);
      return `${dateStr} • ${timeStr} IST`;
    } catch {
      return now.toLocaleTimeString();
    }
  })();

  // Trigger a one-time, restrained entrance animation when the footer enters the viewport
  useEffect(() => {
    const node = footerRef.current;
    if (!node) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasEnteredView(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -16px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    onNavigate(path);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    const validation = validateEmail(email, lang);
    if (!validation.isValid) {
      setEmailError(validation.error || null);
      emailInputRef.current?.focus();
      return;
    }

    setEmailError(null);
    setSubmitting(true);
    try {
      if (onSubscribeNewsletter) {
        const res = await onSubscribeNewsletter(validation.normalizedValue);
        if (!res.ok) {
          setEmailError(res.fieldErrors?.email || res.error || 'Error');
          emailInputRef.current?.focus();
        } else {
          setSuccessMessage(
            res.message ||
              (lang === 'mr'
                ? 'आपली नोंदणी यशस्वी झाली आहे.'
                : 'Subscribed successfully.')
          );
          setEmail('');
        }
      } else {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: validation.normalizedValue, lang }),
        });
        const data = await response.json();
        if (!response.ok) {
          setEmailError(data.error || 'Error');
          emailInputRef.current?.focus();
        } else {
          setSuccessMessage(
            data.message ||
              (lang === 'mr'
                ? 'आपली नोंदणी यशस्वी झाली आहे.'
                : 'Subscribed successfully.')
          );
          setEmail('');
        }
      }
    } catch {
      setEmailError(
        lang === 'mr'
          ? 'नेटवर्क अडचण आली. कृपया पुन्हा प्रयत्न करा.'
          : 'Network error. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      ref={footerRef}
      aria-label={
        lang === 'mr'
          ? 'शेवटचे पान — अकथ प्रकाशन तळटीप आणि संपादकीय मुद्रा'
          : 'The Last Page — Akath Prakashan Editorial Footer & Colophon'
      }
      data-testid="the-last-page-footer"
      className="last-page-footer relative bg-[#243B8A] text-[#FFFDF7] overflow-hidden mt-24 border-t border-[#1B2D6B]"
    >
      {/* Top Book-Edge Binding Ribbon */}
      <div
        aria-hidden="true"
        className="h-1.5 w-full"
        style={{
          background:
            'linear-gradient(90deg, #243B8A 0%, #FFD966 42%, #EF6855 72%, #243B8A 100%)',
        }}
      />

      {/* Subtle Architectural Stepwell Arch Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 text-[#FFFDF7]/10 flex justify-center"
      >
        <HorizonArchIllustration className="w-full max-w-[1160px] h-[300px]" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        {/* =====================================================================
            ROW 1: RUNNING BOOK HEADER & LIVE IST DATE/TIME STAMP
            ===================================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-[#FFFDF7]/15 text-[12px] font-mono uppercase tracking-[0.14em] text-[#FFD966]/90">
          <span className="inline-flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#FFD966]" aria-hidden="true" />
            <span>
              {lang === 'mr'
                ? 'द लास्ट पेज · शेवटचे पान — ग्रंथ-समाप्ती मुद्रा'
                : 'THE LAST PAGE · शेवटचे पान — COLOPHON & ENDPAPER'}
            </span>
          </span>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5">
            <span
              data-testid="footer-live-datetime"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#1B2D6B]/90 border border-[#FFD966]/25 text-[#FFD966] tabular-nums"
            >
              <Clock className="w-3 h-3 text-[#FFD966]" aria-hidden="true" />
              <span>{colophonDateTime}</span>
            </span>
            <span className="tabular-nums text-[#FFFDF7]/75 hidden md:inline">
              {lang === 'mr'
                ? 'पृष्ठ क्र. ∞ · अकथ ग्रंथमाला'
                : 'FOLIO № ∞ · AKATH LITERARY EDITIONS'}
            </span>
          </div>
        </div>

        {/* =====================================================================
            ROW 2: LITERARY EPILOGUE CENTERPIECE, ANIMATED OPEN BOOK & TORTOISE
            ===================================================================== */}
        <div className="py-12 sm:py-16 border-b border-[#FFFDF7]/15">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Animated Open Book & Floating Golden Ink Starlight Vignette */}
            <div
              data-testid="footer-animated-book-constellation"
              aria-hidden="true"
              className="flex items-center justify-center mb-2"
            >
              <svg
                viewBox="0 0 240 84"
                className="w-48 sm:w-56 h-auto overflow-visible"
              >
                {/* Subtle golden horizon arc */}
                <path
                  d="M28 66 Q120 46 212 66"
                  stroke="#FFD966"
                  strokeOpacity="0.32"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                  fill="none"
                />

                {/* Rising literary starlight motes */}
                <circle
                  cx="66"
                  cy="44"
                  r="2.4"
                  fill="#FFD966"
                  className="akath-footer-mote-a"
                />
                <circle
                  cx="120"
                  cy="28"
                  r="3"
                  fill="#EF6855"
                  className="akath-footer-mote-b"
                />
                <circle
                  cx="174"
                  cy="42"
                  r="2.2"
                  fill="#FFD966"
                  className="akath-footer-mote-c"
                />

                {/* Four-point literary star above the open book */}
                <g className="akath-footer-star">
                  <path
                    d="M120 10 L122.5 18.5 L131 21 L122.5 23.5 L120 32 L117.5 23.5 L109 21 L117.5 18.5 Z"
                    fill="#FFD966"
                  />
                </g>

                {/* Open Book Left Page Wing */}
                <g className="akath-footer-wing-left">
                  <path
                    d="M120 62 C102 52 78 50 58 56 L62 40 C82 34 104 38 120 48 Z"
                    fill="#FFFDF7"
                    fillOpacity="0.92"
                    stroke="#FFD966"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M72 46 Q94 42 112 50"
                    stroke="#243B8A"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* Open Book Right Page Wing */}
                <g className="akath-footer-wing-right">
                  <path
                    d="M120 62 C138 52 162 50 182 56 L178 40 C158 34 136 38 120 48 Z"
                    fill="#FFFDF7"
                    fillOpacity="0.92"
                    stroke="#FFD966"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M168 46 Q146 42 128 50"
                    stroke="#243B8A"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* Book Spine & Binding Bookmark */}
                <line
                  x1="120"
                  y1="46"
                  x2="120"
                  y2="65"
                  stroke="#EF6855"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <circle cx="120" cy="67" r="2.5" fill="#FFD966" />
              </svg>
            </div>

            {/* Restrained Entrance Animation for the Closing Line */}
            <blockquote
              data-testid="footer-closing-line"
              className={`last-page-closing-quote ${
                hasEnteredView ? 'is-entering' : ''
              } space-y-4`}
            >
              <p className="font-serif text-[23px] sm:text-[32px] lg:text-[36px] font-medium text-[#FFFDF7] leading-[1.35] tracking-[-0.015em]">
                “Every story ends somewhere. Ours continues, one curious reader at a time.”
              </p>
              <p className="font-serif text-[16px] sm:text-[18px] text-[#FFD966]/90 leading-[1.8] max-w-2xl mx-auto">
                {lang === 'mr'
                  ? 'प्रत्येक कथेचा कुठेतरी शेवट होतो; पण जिज्ञासू वाचकाच्या सोबतीने आपला संवाद प्रत्येक पानागणिक पुढे सुरूच राहतो.'
                  : 'प्रत्येक कथेचा कुठेतरी शेवट होतो — आमचा प्रवास प्रत्येक जिज्ञासू वाचकासोबत पुढे सुरू राहतो.'}
              </p>
            </blockquote>

            {/* Ornamental Colophon Rule + Peeking Tortoise Mascot */}
            <div className="pt-4 flex flex-col items-center justify-center gap-3">
              <div className="flex items-center justify-center gap-4 w-full max-w-md">
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-gradient-to-r from-transparent via-[#FFD966]/55 to-[#FFD966]"
                />

                <div
                  data-testid="footer-tortoise-mascot"
                  className={`last-page-tortoise-peek ${
                    hasEnteredView ? 'is-entering' : ''
                  } group inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#1B2D6B]/90 border border-[#FFD966]/35 shadow-sm`}
                  title={
                    lang === 'mr'
                      ? 'अकथ कासव मुद्रा — संथ, चिंतनशील आणि चिरंतन वाचन'
                      : 'Akath Tortoise Mascot — Slow, thoughtful, enduring reading'
                  }
                >
                  <AnimatedTortoiseEmblem
                    className="w-8 h-8 shrink-0"
                    variant="light"
                    animate={true}
                    hideAndSeekOnHover={true}
                  />
                  <span className="text-[12px] font-serif text-[#FFFDF7]/90 tracking-wide">
                    {lang === 'mr'
                      ? 'संथ पावले · सखोल अक्षरे'
                      : 'The Patient Tortoise'}
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-gradient-to-l from-transparent via-[#FFD966]/55 to-[#FFD966]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            ROW 3: EDITORIAL HOUSE IDENTITY, NEWSLETTER & 4-COLUMN BOOK INDEX
            ===================================================================== */}
        <div className="py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-[#FFFDF7]/15">
          {/* Left 5 Columns: Publisher Story & Literary Dispatch Subscription */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <a
                href="/"
                onClick={(e) => handleNavClick(e, '/')}
                className="group inline-flex items-center gap-3.5 text-left rounded-lg"
                aria-label="अकथ प्रकाशन — मुख्यपृष्ठ (Akath Prakashan Home)"
              >
                <span className="font-serif text-[26px] font-bold text-[#FFD966] group-hover:text-[#FFFDF7] transition-colors">
                  अकथ प्रकाशन
                </span>
                <span className="text-[13px] font-medium text-[#FFFDF7]/75 tracking-wide">
                  · Akath Prakashan
                </span>
              </a>

              <p className="text-[15px] text-[#FFFDF7]/85 leading-[1.8] max-w-[46ch]">
                {t.footer.aboutBlurb}
              </p>

              <p className="font-serif text-[15px] text-[#FFD966] italic">
                “{PUBLISHER_IDENTITY.closingMottoMarathi}” —{' '}
                <span className="not-italic text-[13px] text-[#FFFDF7]/80">
                  {PUBLISHER_IDENTITY.closingMottoEnglish}
                </span>
              </p>
            </div>

            {/* Fortnightly Literary Dispatch (Works with JS and has standard form attributes) */}
            <div className="bg-[#1B2D6B]/90 rounded-2xl p-5 sm:p-6 border border-[#FFFDF7]/15 space-y-3">
              <div className="space-y-1">
                <h3 className="font-serif text-[18px] font-semibold text-[#FFFDF7]">
                  {t.home.newsletterTitle}
                </h3>
                <p className="text-[13px] text-[#FFFDF7]/80 leading-relaxed">
                  {t.home.newsletterBody}
                </p>
              </div>

              <form
                onSubmit={handleSubscribe}
                noValidate
                action="/api/newsletter"
                method="post"
                className="space-y-2.5 pt-1"
              >
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="flex-1">
                    <label htmlFor="footer-newsletter-email" className="sr-only">
                      {t.home.newsletterEmailPlaceholder}
                    </label>
                    <input
                      ref={emailInputRef}
                      id="footer-newsletter-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      placeholder={t.home.newsletterEmailPlaceholder}
                      aria-invalid={Boolean(emailError)}
                      aria-describedby={
                        emailError ? 'footer-email-error' : 'footer-email-privacy'
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#152354] border text-[14px] text-[#FFFDF7] placeholder:text-[#FFFDF7]/55 transition-colors ${
                        emailError
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-white/25 focus:border-[#FFD966]'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[14px] font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
                  >
                    {t.home.newsletterSubmit}
                  </button>
                </div>

                <p
                  id="footer-email-privacy"
                  className="text-[12px] text-[#FFFDF7]/70"
                >
                  {t.home.newsletterPrivacyNote}
                </p>

                {emailError && (
                  <p
                    id="footer-email-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-[13px] text-red-300 font-medium"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{emailError}</span>
                  </p>
                )}

                {successMessage && (
                  <p
                    role="status"
                    className="flex items-center gap-1.5 text-[13px] text-[#FFD966] font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{successMessage}</span>
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right 7 Columns: 4-Column Editorial Navigation & Contact Index */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
            {/* Column I: Bookstore & Catalogue */}
            <nav
              aria-label={t.footer.booksAndCatalogue}
              className="space-y-3.5"
            >
              <h4 className="text-[12px] font-mono uppercase tracking-[0.14em] font-semibold text-[#FFD966]">
                I · {t.footer.booksAndCatalogue}
              </h4>
              <ul className="space-y-2.5 text-[14px] text-[#FFFDF7]/90">
                <li>
                  <a
                    href="/books"
                    onClick={(e) => handleNavClick(e, '/books')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.nav.books}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/authors"
                    onClick={(e) => handleNavClick(e, '/authors')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.nav.authors}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    onClick={(e) => handleNavClick(e, '/about')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.nav.about}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/submit-manuscript"
                    onClick={(e) => handleNavClick(e, '/submit-manuscript')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.nav.submitManuscript}</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 text-[#FFD966]"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              </ul>
            </nav>

            {/* Column II: Vachankatta Literary Journal */}
            <nav
              aria-label={t.footer.editorialJournal}
              className="space-y-3.5"
            >
              <h4 className="text-[12px] font-mono uppercase tracking-[0.14em] font-semibold text-[#FFD966]">
                II · {t.footer.editorialJournal}
              </h4>
              <ul className="space-y-2.5 text-[14px] text-[#FFFDF7]/90">
                <li>
                  <a
                    href="/vachankatta/first-page"
                    onClick={(e) => handleNavClick(e, '/vachankatta/first-page')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.vachankatta.firstPage}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/vachankatta/articles"
                    onClick={(e) => handleNavClick(e, '/vachankatta/articles')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.vachankatta.articles}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/vachankatta/reviews"
                    onClick={(e) => handleNavClick(e, '/vachankatta/reviews')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.vachankatta.reviews}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/vachankatta/reading-lists"
                    onClick={(e) =>
                      handleNavClick(e, '/vachankatta/reading-lists')
                    }
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.vachankatta.readingLists}</span>
                  </a>
                </li>
              </ul>
            </nav>

            {/* Column III: Reader Services, Privacy Policy & Terms */}
            <nav
              aria-label={t.footer.readerServices}
              className="space-y-3.5"
            >
              <h4 className="text-[12px] font-mono uppercase tracking-[0.14em] font-semibold text-[#FFD966]">
                III · {t.footer.readerServices}
              </h4>
              <ul className="space-y-2.5 text-[14px] text-[#FFFDF7]/90">
                <li>
                  <a
                    href="/track-order"
                    onClick={(e) => handleNavClick(e, '/track-order')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.nav.trackOrder}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping-returns"
                    onClick={(e) => handleNavClick(e, '/shipping-returns')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.footer.shippingPolicy}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    onClick={(e) => handleNavClick(e, '/privacy')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.footer.privacyPolicy}</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    onClick={(e) => handleNavClick(e, '/terms')}
                    className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 rounded"
                  >
                    <span>{t.footer.termsOfUse}</span>
                  </a>
                </li>
              </ul>
            </nav>

            {/* Column IV: Contact & Editorial Correspondence */}
            <div className="space-y-3.5">
              <h4 className="text-[12px] font-mono uppercase tracking-[0.14em] font-semibold text-[#FFD966]">
                IV · {t.nav.contact}
              </h4>
              <address className="not-italic space-y-2.5 text-[13.5px] text-[#FFFDF7]/90 leading-relaxed">
                <div className="flex items-start gap-2">
                  <MapPin
                    className="w-4 h-4 text-[#FFD966] shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <span>
                    {lang === 'mr'
                      ? 'नांदेड (४३१६०२) व पुणे (४११०३०), महाराष्ट्र'
                      : 'Nanded (431602) & Pune (411030), Maharashtra'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail
                    className="w-4 h-4 text-[#FFD966] shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href="mailto:sampark@akathprakashan.in"
                    className="hover:text-[#FFD966] transition-colors break-all rounded"
                  >
                    sampark@akathprakashan.in
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone
                    className="w-4 h-4 text-[#FFD966] shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href="tel:+919422178430"
                    className="tabular-nums hover:text-[#FFD966] transition-colors rounded"
                  >
                    +91 94221 78430
                  </a>
                </div>
                <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-[#FFD966]">
                  <a
                    href="/contact"
                    onClick={(e) => handleNavClick(e, '/contact')}
                    className="hover:text-[#FFFDF7] underline underline-offset-4 transition-colors rounded"
                  >
                    {lang === 'mr' ? 'संपर्क दालन' : 'Editorial Desk'}
                  </a>
                  <a
                    href={`https://wa.me/${PUBLISHER_IDENTITY.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FFFDF7] inline-flex items-center gap-0.5 underline underline-offset-4 transition-colors rounded"
                  >
                    <span>WhatsApp</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                  <a
                    href={PUBLISHER_IDENTITY.existingLiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FFFDF7] inline-flex items-center gap-0.5 underline underline-offset-4 transition-colors rounded"
                  >
                    <span>
                      {lang === 'mr' ? 'मूळ संग्रह' : 'Original Archive'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </address>
            </div>
          </div>
        </div>

        {/* =====================================================================
            ROW 4: FINAL COLOPHON IMPRINT, DYNAMIC COPYRIGHT & CREATOR CREDIT
            ===================================================================== */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#FFFDF7]/85">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
            <p data-testid="footer-copyright">
              © {currentYear} अकथ प्रकाशन (Akath Prakashan).{' '}
              {lang === 'mr' ? 'सर्व हक्क राखीव.' : 'All rights reserved.'}
            </p>
            <span
              aria-hidden="true"
              className="hidden sm:inline text-[#FFD966]/50"
            >
              ·
            </span>
            <p className="text-[#FFFDF7]/75">
              {lang === 'mr'
                ? 'मराठी भाषा, साहित्य आणि विचारविश्वासाठी समर्पित'
                : 'Dedicated to Marathi Literature, Thought & Print Craftsmanship'}
            </p>
          </div>

          {/* Creator Credit with Gentle Hover Interaction */}
          <p className="text-[13px] text-[#FFFDF7]/90">
            <span
              data-testid="footer-creator-credit"
              tabIndex={0}
              className="last-page-creator-credit font-serif text-[#FFFDF7] rounded px-1.5 py-0.5"
            >
              <Feather
                className="w-3.5 h-3.5 text-[#FFD966] last-page-creator-mark"
                aria-hidden="true"
              />
              <span>
                {lang === 'mr'
                  ? 'built by Mivishvajeet · साकारले — विश्वजीत'
                  : 'built by Mivishvajeet'}
              </span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
