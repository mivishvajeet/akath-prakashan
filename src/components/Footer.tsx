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
} from 'lucide-react';
import { StorybookFooterLandscape } from './StorybookFooterLandscape';
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

  const emailInputRef = useRef<HTMLInputElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const wordmarkBannerRef = useRef<HTMLDivElement>(null);

  const handleWordmarkPointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = wordmarkBannerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--wordmark-spot-x', `${x}px`);
    el.style.setProperty('--wordmark-spot-y', `${y}px`);
  };

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
      { threshold: 0.08, rootMargin: '0px 0px -16px 0px' }
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
      className="last-page-footer relative text-[#F5EBDD] overflow-hidden mt-20 border-t border-[#E8BC69]/30"
      style={{
        background:
          'linear-gradient(180deg, #0C152C 0%, #132247 42%, #1D3162 76%, #2D4238 93%, #302C25 100%)',
      }}
    >
      {/* Subtle Top Literary Gold-Leaf Hairline */}
      <div
        aria-hidden="true"
        className="h-[2px] w-full"
        style={{
          background:
            'linear-gradient(90deg, #0C152C 0%, #E8BC69 50%, #0C152C 100%)',
        }}
      />

      {/* =====================================================================
          MINIMAL CELESTIAL TWILIGHT SKY BACKDROP (CLEAN TWINKLING STARS & MOON)
          ===================================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
      >
        <svg
          viewBox="0 0 1440 680"
          preserveAspectRatio="xMidYMin slice"
          shapeRendering="crispEdges"
          className="w-full h-full block"
        >
          <defs>
            {/* 4-Point Celestial Diamond Star (Large) */}
            <g id="akathCelestialStarLg">
              <rect x="-6" y="-1" width="12" height="2" fill="#FFD966" fillOpacity="0.28" />
              <rect x="-1" y="-6" width="2" height="12" fill="#FFD966" fillOpacity="0.28" />
              <rect x="-2" y="-2" width="4" height="4" fill="#FFD966" fillOpacity="0.88" />
              <rect x="-1" y="-1" width="2" height="2" fill="#FFFDF7" />
            </g>

            {/* 4-Point Celestial Cross Star (Medium) */}
            <g id="akathCelestialStarMd">
              <rect x="-4" y="-1" width="8" height="2" fill="#E8BC69" fillOpacity="0.38" />
              <rect x="-1" y="-4" width="2" height="8" fill="#E8BC69" fillOpacity="0.38" />
              <rect x="-1" y="-1" width="2" height="2" fill="#FFFDF7" fillOpacity="0.9" />
            </g>

            {/* Delicate Distant Star (Small) */}
            <g id="akathCelestialStarSm">
              <rect x="-1" y="-1" width="2" height="2" fill="#F5EBDD" fillOpacity="0.7" />
            </g>
          </defs>

          {/* Phase A Stars */}
          <g className="storybook-star-twinkle-a">
            <use href="#akathCelestialStarLg" x="110" y="38" />
            <use href="#akathCelestialStarSm" x="340" y="26" />
            <use href="#akathCelestialStarMd" x="560" y="34" />
            <use href="#akathCelestialStarSm" x="780" y="24" />
            <use href="#akathCelestialStarLg" x="980" y="32" />
            <use href="#akathCelestialStarSm" x="1190" y="28" />
          </g>

          {/* Phase B Stars */}
          <g className="storybook-star-twinkle-b">
            <use href="#akathCelestialStarMd" x="210" y="54" />
            <use href="#akathCelestialStarSm" x="456" y="48" />
            <use href="#akathCelestialStarLg" x="676" y="46" />
            <use href="#akathCelestialStarMd" x="880" y="52" />
            <use href="#akathCelestialStarSm" x="1110" y="58" />
          </g>

          {/* Phase C Stars */}
          <g className="storybook-star-twinkle-c">
            <use href="#akathCelestialStarSm" x="64" y="72" />
            <use href="#akathCelestialStarSm" x="518" y="74" />
            <use href="#akathCelestialStarMd" x="1042" y="70" />
            <use href="#akathCelestialStarSm" x="1360" y="56" />
          </g>

          {/* Subtle Crescent Moon (Upper Right Sky) */}
          <g transform="translate(1296, 30)">
            <rect x="-6" y="-2" width="28" height="28" fill="#FFD966" fillOpacity="0.08" />
            <rect x="8" y="0" width="10" height="3" fill="#FFD966" fillOpacity="0.9" />
            <rect x="4" y="3" width="10" height="3" fill="#FFD966" fillOpacity="0.9" />
            <rect x="0" y="6" width="8" height="10" fill="#FFD966" fillOpacity="0.9" />
            <rect x="4" y="16" width="10" height="3" fill="#FFD966" fillOpacity="0.9" />
            <rect x="8" y="19" width="10" height="3" fill="#FFD966" fillOpacity="0.9" />
          </g>
        </svg>
      </div>

      {/* =====================================================================
          UPPER & MIDDLE FOOTER CONTENT (MINIMAL REFINED MIDNIGHT-VELLUM PANEL)
          ===================================================================== */}
      <div className="relative z-20 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-4">
        {/* ROW 1: UNIFIED AKATH LITERARY NEWSLETTER & 4-COLUMN DIRECTORY */}
        <div className="rounded-xl bg-[#0F1B3A]/85 backdrop-blur-md border border-[#E8BC69]/25 p-6 sm:p-8 lg:p-9 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 shadow-[0_18px_42px_-20px_rgba(6,11,26,0.65)]">
          {/* Left 5 Columns: Akath Literary Newsletter */}
          <div className="lg:col-span-5 lg:border-r lg:border-[#E8BC69]/20 lg:pr-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-[#FFD966]">
                  {t.home.newsletterTitle}
                </p>
                <span className="inline-block w-2 h-2 rounded-full bg-[#E8BC69]" />
              </div>

              <p className="font-serif not-italic text-[16px] sm:text-[17.5px] text-[#F5EBDD] font-semibold leading-[1.52]">
                “
                {lang === 'mr'
                  ? PUBLISHER_IDENTITY.closingMottoMarathi
                  : PUBLISHER_IDENTITY.closingMottoEnglish}
                ”
              </p>

              <form
                onSubmit={handleSubscribe}
                noValidate
                action="/api/newsletter"
                method="post"
                className="space-y-2.5 pt-1"
              >
                <div className="flex flex-col sm:flex-row gap-2">
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
                      className={`w-full rounded-lg px-3.5 py-2.5 bg-[#0A1228]/90 border text-[13.5px] text-[#F5EBDD] placeholder:text-[#F5EBDD]/50 transition-colors focus:outline-none ${
                        emailError
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-[#E8BC69]/35 focus:border-[#FFD966]'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg px-4 py-2.5 bg-[#E8BC69] hover:bg-[#FFD966] text-[#1C1917] text-[12.5px] font-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
                  >
                    {t.home.newsletterSubmit}
                  </button>
                </div>

                <p
                  id="footer-email-privacy"
                  className="text-[11.5px] text-[#F5EBDD]/70"
                >
                  {t.home.newsletterPrivacyNote}
                </p>

                {emailError && (
                  <p
                    id="footer-email-error"
                    role="alert"
                    className="flex items-center gap-1.5 text-[12.5px] text-red-300 font-medium"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{emailError}</span>
                  </p>
                )}

                {successMessage && (
                  <p
                    role="status"
                    className="flex items-center gap-1.5 text-[12.5px] text-[#FFD966] font-medium"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{successMessage}</span>
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Right 7 Columns: Clean 4-Column Architectural Index inside the Harmonized Panel */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-7 pt-1">
            {/* Column I: Bookstore & Catalogue */}
            <nav
              aria-label={t.footer.booksAndCatalogue}
              className="space-y-3"
            >
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-[#FFD966]">
                {t.footer.booksAndCatalogue}
              </h4>
              <ul className="space-y-2 text-[13.5px] text-[#F5EBDD]/90">
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
              className="space-y-3"
            >
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-[#FFD966]">
                {t.footer.editorialJournal}
              </h4>
              <ul className="space-y-2 text-[13.5px] text-[#F5EBDD]/90">
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

            {/* Column III: Reader Services */}
            <nav
              aria-label={t.footer.readerServices}
              className="space-y-3"
            >
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-[#FFD966]">
                {t.footer.readerServices}
              </h4>
              <ul className="space-y-2 text-[13.5px] text-[#F5EBDD]/90">
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
            <div className="space-y-3">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-[#FFD966]">
                {t.nav.contact}
              </h4>
              <address className="not-italic space-y-2 text-[13px] text-[#F5EBDD]/90 leading-relaxed">
                <div className="flex items-start gap-2">
                  <MapPin
                    className="w-3.5 h-3.5 text-[#FFD966] shrink-0 mt-1"
                    aria-hidden="true"
                  />
                  <span>
                    {lang === 'mr'
                      ? 'नांदेड, महाराष्ट्र'
                      : 'Nanded, Maharashtra'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail
                    className="w-3.5 h-3.5 text-[#FFD966] shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href="mailto:akathpublication@gmail.com"
                    className="hover:text-[#FFD966] transition-colors break-all rounded"
                  >
                    akathpublication@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone
                    className="w-3.5 h-3.5 text-[#FFD966] shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href="tel:+919270282932"
                    className="tabular-nums hover:text-[#FFD966] transition-colors rounded"
                  >
                    +91 92702 82932
                  </a>
                </div>
                <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-[#FFD966]">
                  <a
                    href="/contact"
                    onClick={(e) => handleNavClick(e, '/contact')}
                    className="hover:text-[#FFFDF7] underline underline-offset-4 transition-colors rounded"
                  >
                    {lang === 'mr' ? 'संपर्क दालन' : 'Editorial Desk'}
                  </a>
                  <a
                    href={PUBLISHER_IDENTITY.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FFFDF7] inline-flex items-center gap-0.5 underline underline-offset-4 transition-colors rounded"
                  >
                    <span>WhatsApp</span>
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </a>
                </div>
              </address>
            </div>
          </div>
        </div>

        {/* ROW 2: EDITORIAL SIGNATURE COLOPHON FLOATING IN THE TWILIGHT SKY */}
        <div
          data-testid="footer-signature-colophon"
          className="pt-5 pb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
            <div
              data-testid="footer-animated-book-constellation"
              aria-hidden="true"
              className="shrink-0 flex items-center"
            >
              <svg
                viewBox="0 0 240 84"
                className="w-20 sm:w-24 h-auto overflow-visible"
              >
                <path
                  d="M28 66 Q120 46 212 66"
                  stroke="#FFD966"
                  strokeOpacity="0.35"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                  fill="none"
                />
                <g className="akath-footer-star">
                  <path
                    d="M120 12 L122 19 L129 21 L122 23 L120 30 L118 23 L111 21 L118 19 Z"
                    fill="#FFD966"
                  />
                </g>
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
                <line
                  x1="120"
                  y1="46"
                  x2="120"
                  y2="65"
                  stroke="#EF6855"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="120" cy="67" r="2.2" fill="#FFD966" />
              </svg>
            </div>

            <div
              data-testid="footer-closing-line"
              className={`last-page-closing-quote space-y-0.5 ${
                hasEnteredView ? 'is-entering' : ''
              }`}
            >
              <p className="font-serif not-italic text-[18px] sm:text-[20px] font-bold text-[#F5EBDD] leading-[1.3] tracking-[-0.01em]">
                Every story leaves a mark.
              </p>
              <p className="text-[12.5px] text-[#F5EBDD]/85 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>Thoughtfully crafted by</span>
                <a
                  href="https://github.com/mivishvajeet"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="footer-creator-credit"
                  className="last-page-creator-credit font-serif font-semibold text-[#FFD966] hover:text-[#FFFDF7]"
                >
                  <span>mivishvajeet</span>
                  <span aria-hidden="true" className="last-page-creator-mark sr-only">
                    ↗
                  </span>
                </a>
              </p>
            </div>
          </div>

          <p
            data-testid="footer-copyright"
            className="font-mono text-[12px] tracking-[0.08em] text-[#E8BC69]/90 tabular-nums"
          >
            Akath Prakashan · 2026
          </p>
        </div>
      </div>

      {/* =======================================================================
          MONUMENTAL MARATHI WORDMARK ("अकथ प्रकाशन") + 16-BIT PIXEL-ART PARALLAX
          COUNTRYSIDE & SPRITE TORTOISE STAGE (CLEAN HORIZON ALIGNMENT)
          ======================================================================= */}
      <div
        ref={wordmarkBannerRef}
        onMouseMove={handleWordmarkPointerMove}
        data-testid="footer-monumental-wordmark"
        className={`akath-sarvam-wordmark-stage ${
          hasEnteredView ? 'is-visible' : ''
        } group relative w-full overflow-hidden pt-2 sm:pt-3 pb-0 select-none`}
      >
        {/* Monumental Marathi Wordmark ("अकथ प्रकाशन") Framed Cleanly Above the Horizon */}
        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          aria-label="अकथ प्रकाशन — मुख्यपृष्ठ"
          className="relative z-10 block w-full text-center focus:outline-none px-4 sm:px-6 -mb-8 sm:-mb-12 lg:-mb-16"
        >
          <span
            data-testid="footer-monumental-marathi-text"
            className="akath-sarvam-wordmark-text inline-flex items-baseline justify-center gap-[0.18em] sm:gap-[0.22em] font-serif font-bold whitespace-nowrap tracking-[-0.02em] leading-[0.9] text-[clamp(2.6rem,11vw,8.5rem)] opacity-85"
          >
            <span className="akath-wordmark-part akath-wordmark-part-1 inline-block">
              अकथ
            </span>
            <span className="akath-wordmark-part akath-wordmark-part-2 inline-block">
              प्रकाशन
            </span>
          </span>
        </a>

        {/* Unified 16-Bit Pixel-Art Side-Scrolling Landscape & Sprite Tortoise Stage */}
        <div className="relative z-20">
          <StorybookFooterLandscape />
        </div>
      </div>
    </footer>
  );
};
