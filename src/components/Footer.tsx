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
import {
  HorizonArchIllustration,
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

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        {/* =====================================================================
            ROW 1: MINIMALIST DISPATCH & 4-COLUMN DIRECTORY
            ===================================================================== */}
        <div className="pb-10 sm:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 border-b border-[#FFFDF7]/12">
          {/* Left 4 Columns: Minimal Literary Dispatch & Three-Word Motto */}
          <div className="lg:col-span-4 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#FFD966]/85">
                {t.home.newsletterTitle}
              </p>
              <p className="font-serif not-italic text-[17px] text-[#FFFDF7]/95 leading-[1.6]">
                “{PUBLISHER_IDENTITY.closingMottoMarathi}”
              </p>

              <form
                onSubmit={handleSubscribe}
                noValidate
                action="/api/newsletter"
                method="post"
                className="space-y-2 pt-1"
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
                      className={`w-full px-3.5 py-2 rounded-lg bg-[#152354]/90 border text-[13.5px] text-[#FFFDF7] placeholder:text-[#FFFDF7]/50 transition-colors ${
                        emailError
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-white/20 focus:border-[#FFD966]'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[13px] font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
                  >
                    {t.home.newsletterSubmit}
                  </button>
                </div>

                <p
                  id="footer-email-privacy"
                  className="text-[11.5px] text-[#FFFDF7]/60"
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

          {/* Right 8 Columns: Clean 4-Column Architectural Index */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column I: Bookstore & Catalogue */}
            <nav
              aria-label={t.footer.booksAndCatalogue}
              className="space-y-3"
            >
              <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#FFD966]/85">
                {t.footer.booksAndCatalogue}
              </h4>
              <ul className="space-y-2 text-[13.5px] text-[#FFFDF7]/85">
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
              <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#FFD966]/85">
                {t.footer.editorialJournal}
              </h4>
              <ul className="space-y-2 text-[13.5px] text-[#FFFDF7]/85">
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
              <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#FFD966]/85">
                {t.footer.readerServices}
              </h4>
              <ul className="space-y-2 text-[13.5px] text-[#FFFDF7]/85">
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
              <h4 className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#FFD966]/85">
                {t.nav.contact}
              </h4>
              <address className="not-italic space-y-2 text-[13px] text-[#FFFDF7]/85 leading-relaxed">
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

        {/* =====================================================================
            ROW 2: MINIMAL EDITORIAL SIGNATURE COLOPHON
            Every story leaves a mark.
            Thoughtfully crafted by mivishvajeet ↗
            Akath Prakashan · 2026
            ===================================================================== */}
        <div
          data-testid="footer-signature-colophon"
          className="pt-8 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div
              data-testid="footer-animated-book-constellation"
              aria-hidden="true"
              className="shrink-0 flex items-center"
            >
              <svg
                viewBox="0 0 240 84"
                className="w-24 sm:w-28 h-auto overflow-visible"
              >
                <path
                  d="M28 66 Q120 46 212 66"
                  stroke="#FFD966"
                  strokeOpacity="0.32"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                  fill="none"
                />
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
                <g className="akath-footer-star">
                  <path
                    d="M120 10 L122.5 18.5 L131 21 L122.5 23.5 L120 32 L117.5 23.5 L109 21 L117.5 18.5 Z"
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
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <circle cx="120" cy="67" r="2.5" fill="#FFD966" />
              </svg>
            </div>

            <div
              data-testid="footer-closing-line"
              className={`last-page-closing-quote space-y-1.5 ${
                hasEnteredView ? 'is-entering' : ''
              }`}
            >
              <p className="font-serif text-[20px] sm:text-[23px] font-medium text-[#FFFDF7] leading-[1.35] tracking-[-0.01em]">
                Every story leaves a mark.
              </p>
              <p className="text-[13.5px] text-[#FFFDF7]/80 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
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
            className="font-mono text-[12.5px] tracking-[0.06em] text-[#FFFDF7]/75 tabular-nums"
          >
            Akath Prakashan · 2026
          </p>
        </div>
      </div>

      {/* =======================================================================
          SARVAM-STYLE EDGE-TO-EDGE MONUMENTAL MARATHI WORDMARK ("अकथ प्रकाशन")
          Full-bleed architectural Devanagari display with animated Shirorekha beam,
          flowing gold-leaf shimmer, stepwell grid, and interactive pointer aura
          ======================================================================= */}
      <div
        ref={wordmarkBannerRef}
        onMouseMove={handleWordmarkPointerMove}
        data-testid="footer-monumental-wordmark"
        className={`akath-sarvam-wordmark-stage ${
          hasEnteredView ? 'is-visible' : ''
        } group relative w-full overflow-hidden pt-6 sm:pt-10 pb-0 select-none border-t border-[#FFFDF7]/12`}
      >
        {/* Animated Shirorekha Golden Light Beam gliding along top horizon */}
        <div
          aria-hidden="true"
          className="akath-wordmark-shirorekha-beam pointer-events-none absolute top-0 left-0 h-[2px] w-48 sm:w-80"
        />

        {/* Subtle Architectural Stepwell Lattice & Horizon Arc */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25 akath-wordmark-grid-backdrop"
        />

        {/* Ambient Breathing Horizon Glow + Interactive Cursor-Tracking Gold Spotlight */}
        <div
          aria-hidden="true"
          className="akath-wordmark-horizon-glow pointer-events-none absolute inset-x-0 bottom-0 h-full"
        />
        <div
          aria-hidden="true"
          className="akath-wordmark-cursor-spotlight pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />

        {/* Rising Golden Literary Ink Motes behind the Devanagari Wordmark */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 180"
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <circle
            cx="180"
            cy="120"
            r="2.5"
            fill="#FFD966"
            className="akath-footer-mote-a"
          />
          <circle
            cx="420"
            cy="95"
            r="2"
            fill="#EF6855"
            className="akath-footer-mote-b"
          />
          <circle
            cx="600"
            cy="75"
            r="3"
            fill="#FFD966"
            className="akath-footer-mote-c"
          />
          <circle
            cx="820"
            cy="105"
            r="2.2"
            fill="#EF6855"
            className="akath-footer-mote-a"
          />
          <circle
            cx="1040"
            cy="115"
            r="2.6"
            fill="#FFD966"
            className="akath-footer-mote-b"
          />
        </svg>

        <a
          href="/"
          onClick={(e) => handleNavClick(e, '/')}
          aria-label="अकथ प्रकाशन — मुख्यपृष्ठ"
          className="relative z-10 block w-full text-center focus:outline-none px-2 sm:px-6"
        >
          <span
            data-testid="footer-monumental-marathi-text"
            className="akath-sarvam-wordmark-text inline-flex items-baseline justify-center gap-[0.22em] font-serif font-bold whitespace-nowrap tracking-[-0.02em] leading-[0.88] text-[clamp(3.35rem,15.2vw,13.5rem)] translate-y-[6%]"
          >
            <span className="akath-wordmark-part akath-wordmark-part-1 inline-block">
              अकथ
            </span>
            <span className="akath-wordmark-part akath-wordmark-part-2 inline-block">
              प्रकाशन
            </span>
          </span>
        </a>
      </div>
    </footer>
  );
};
