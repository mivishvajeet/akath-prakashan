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

  const emailInputRef = useRef<HTMLInputElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const currentYear = new Date().getFullYear();

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
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Progressive-enhancement navigation handler: works with standard href if JS is disabled,
  // and uses SPA navigation on normal left-click.
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
      {/* Top Book-Edge Binding Ribbon (Midnight Cobalt, Butter Yellow, Coral Red) */}
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
        <HorizonArchIllustration className="w-full max-w-[1200px] h-[340px]" />
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 sm:pt-16 sm:pb-14">
        {/* =====================================================================
            SECTION I: "THE LAST PAGE" — RUNNING BOOK HEADER & EPILOGUE FOLIO
            ===================================================================== */}
        <div className="pb-12 sm:pb-14 border-b border-[#FFFDF7]/15">
          {/* Running Book Header / Folio Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-8 border-b border-[#FFFDF7]/12 text-[11.5px] font-mono uppercase tracking-[0.14em] text-[#FFD966]/90">
            <span className="inline-flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#FFD966]" aria-hidden="true" />
              <span>
                {lang === 'mr'
                  ? 'द लास्ट पेज · शेवटचे पान — ग्रंथ-समाप्ती मुद्रा'
                  : 'THE LAST PAGE · शेवटचे पान — COLOPHON & ENDPAPER'}
              </span>
            </span>
            <span className="tabular-nums text-[#FFFDF7]/75">
              {lang === 'mr'
                ? 'पृष्ठ क्र. ∞ · अकथ ग्रंथमाला'
                : 'FOLIO № ∞ · AKATH LITERARY EDITIONS'}
            </span>
          </div>

          {/* Centerpiece Epilogue Quote & Peeking Tortoise Mascot */}
          <div className="pt-10 sm:pt-12 max-w-4xl mx-auto text-center space-y-6">
            <blockquote
              data-testid="footer-closing-line"
              className={`last-page-closing-quote ${
                hasEnteredView ? 'is-entering' : ''
              } space-y-4`}
            >
              <p className="font-serif text-[clamp(1.55rem,3.3vw,2.65rem)] font-medium text-[#FFFDF7] leading-[1.32] tracking-normal">
                “Every story ends somewhere. Ours continues, one curious reader at a time.”
              </p>
              <p className="font-serif text-[15px] sm:text-[17px] text-[#FFD966]/90 leading-relaxed max-w-2xl mx-auto">
                {lang === 'mr'
                  ? 'प्रत्येक कथेचा कुठेतरी शेवट होतो; पण जिज्ञासू वाचकाच्या सोबतीने आपला संवाद प्रत्येक पानागणिक पुढे सुरूच राहतो.'
                  : 'प्रत्येक कथेचा कुठेतरी शेवट होतो — आमचा प्रवास प्रत्येक जिज्ञासू वाचकासोबत पुढे सुरू राहतो.'}
              </p>
            </blockquote>

            {/* Small, Tasteful Tortoise Mascot Walking / Peeking Along the Endpaper Rule */}
            <div className="pt-4 flex items-center justify-center gap-4 sm:gap-6">
              <div
                aria-hidden="true"
                className="h-px flex-1 max-w-[140px] sm:max-w-[220px] bg-gradient-to-r from-transparent via-[#FFD966]/45 to-[#FFD966]/65"
              />

              <div
                data-testid="footer-tortoise-mascot"
                className={`last-page-tortoise-peek ${
                  hasEnteredView ? 'is-entering' : ''
                } group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#1B2D6B]/90 border border-[#FFD966]/35 shadow-sm`}
                title={
                  lang === 'mr'
                    ? 'अकथ कासव मुद्रा — संथ, चिंतनशील आणि चिरंतन वाचन'
                    : 'Akath Tortoise Mascot — Slow, thoughtful, enduring reading'
                }
              >
                {/* Tiny walking trail dots */}
                <span
                  aria-hidden="true"
                  className="hidden sm:inline-flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-[#FFD966]/35" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD966]/60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF6855]/85" />
                </span>

                <AnimatedTortoiseEmblem
                  className="w-9 h-9 shrink-0"
                  variant="light"
                  animate={false}
                  hideAndSeekOnHover={true}
                />

                <span className="text-[11.5px] font-serif text-[#FFFDF7]/90 tracking-wide">
                  {lang === 'mr' ? 'कासव मुद्रा · मंद व चिरंतन' : 'The Patient Tortoise'}
                </span>
              </div>

              <div
                aria-hidden="true"
                className="h-px flex-1 max-w-[140px] sm:max-w-[220px] bg-gradient-to-l from-transparent via-[#FFD966]/45 to-[#FFD966]/65"
              />
            </div>
          </div>
        </div>

        {/* =====================================================================
            SECTION II: PUBLISHER COLOPHON NOTE & READER'S DISPATCH (NEWSLETTER)
            ===================================================================== */}
        <div className="py-12 border-b border-[#FFFDF7]/15 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Publisher Imprint & Tortoise Philosophy */}
          <div className="lg:col-span-7 space-y-4">
            <a
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
              className="group inline-flex items-center gap-3.5 text-left rounded-lg"
              aria-label="अकथ प्रकाशन — मुख्यपृष्ठ (Akath Prakashan Home)"
            >
              <AnimatedTortoiseEmblem
                className="w-12 h-12 shrink-0"
                variant="light"
                animate={false}
                hideAndSeekOnHover={true}
              />
              <div>
                <span className="font-serif text-[24px] sm:text-[26px] font-bold text-[#FFFDF7] group-hover:text-[#FFD966] transition-colors block leading-tight">
                  अकथ प्रकाशन
                </span>
                <span className="text-[12px] text-[#FFD966] font-medium block">
                  {lang === 'mr'
                    ? 'Akath Prakashan · स्वतंत्र मराठी साहित्य आणि प्रकाशन गृह'
                    : 'Akath Prakashan · Independent Marathi Literary Publishing House'}
                </span>
              </div>
            </a>

            <p className="text-[15px] text-[#FFFDF7]/90 max-w-xl leading-[1.8]">
              {t.footer.aboutBlurb}
            </p>

            {/* The Tortoise Colophon Philosophy Note */}
            <div className="p-4 rounded-xl bg-[#1B2D6B]/85 border-l-2 border-[#FFD966] border-t border-r border-b border-white/10 max-w-xl">
              <p className="font-serif text-[14px] text-[#FFFDF7]/95 leading-relaxed">
                {lang === 'mr'
                  ? PUBLISHER_IDENTITY.turtlePhilosophyMarathi
                  : PUBLISHER_IDENTITY.turtlePhilosophyEnglish}
              </p>
            </div>
          </div>

          {/* Literary Dispatch / Newsletter Form */}
          <div className="lg:col-span-5 bg-[#1B2D6B]/90 rounded-2xl p-6 border border-[#FFFDF7]/15 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-[18px] font-semibold text-[#FFFDF7]">
                {t.home.newsletterTitle}
              </h3>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFD966]">
                {lang === 'mr' ? 'पाक्षिक पत्रिका' : 'FORTNIGHTLY'}
              </span>
            </div>

            <p className="text-[13.5px] text-[#FFFDF7]/85 leading-relaxed">
              {t.home.newsletterBody}
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
                  className="px-5 py-2.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[13.5px] font-semibold transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
                >
                  {t.home.newsletterSubmit}
                </button>
              </div>

              <p
                id="footer-email-privacy"
                className="text-[11.5px] text-[#FFFDF7]/70"
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

        {/* =====================================================================
            SECTION III: EDITORIAL INDEX — NAVIGATION, POLICIES & CORRESPONDENCE
            ===================================================================== */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 border-b border-[#FFFDF7]/15 text-[14px]">
          {/* Column I: Bookstore & Catalogue */}
          <nav
            aria-label={t.footer.booksAndCatalogue}
            className="space-y-3.5"
          >
            <h4 className="text-[12px] font-mono uppercase tracking-[0.12em] font-semibold text-[#FFD966]">
              I · {t.footer.booksAndCatalogue}
            </h4>
            <ul className="space-y-2.5 text-[#FFFDF7]/90">
              <li>
                <a
                  href="/books"
                  onClick={(e) => handleNavClick(e, '/books')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
                >
                  <span>{t.nav.books}</span>
                </a>
              </li>
              <li>
                <a
                  href="/authors"
                  onClick={(e) => handleNavClick(e, '/authors')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
                >
                  <span>{t.nav.authors}</span>
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleNavClick(e, '/about')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
                >
                  <span>{t.nav.about}</span>
                </a>
              </li>
              <li>
                <a
                  href="/submit-manuscript"
                  onClick={(e) => handleNavClick(e, '/submit-manuscript')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1.5 py-0.5 rounded"
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
            <h4 className="text-[12px] font-mono uppercase tracking-[0.12em] font-semibold text-[#FFD966]">
              II · {t.footer.editorialJournal}
            </h4>
            <ul className="space-y-2.5 text-[#FFFDF7]/90">
              <li>
                <a
                  href="/vachankatta/first-page"
                  onClick={(e) => handleNavClick(e, '/vachankatta/first-page')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
                >
                  <span>{t.vachankatta.firstPage}</span>
                </a>
              </li>
              <li>
                <a
                  href="/vachankatta/articles"
                  onClick={(e) => handleNavClick(e, '/vachankatta/articles')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
                >
                  <span>{t.vachankatta.articles}</span>
                </a>
              </li>
              <li>
                <a
                  href="/vachankatta/reviews"
                  onClick={(e) => handleNavClick(e, '/vachankatta/reviews')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
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
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
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
            <h4 className="text-[12px] font-mono uppercase tracking-[0.12em] font-semibold text-[#FFD966]">
              III · {t.footer.readerServices}
            </h4>
            <ul className="space-y-2.5 text-[#FFFDF7]/90">
              <li>
                <a
                  href="/track-order"
                  onClick={(e) => handleNavClick(e, '/track-order')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
                >
                  <span>{t.nav.trackOrder}</span>
                </a>
              </li>
              <li>
                <a
                  href="/shipping-returns"
                  onClick={(e) => handleNavClick(e, '/shipping-returns')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
                >
                  <span>{t.footer.shippingPolicy}</span>
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleNavClick(e, '/privacy')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
                >
                  <span>{t.footer.privacyPolicy}</span>
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleNavClick(e, '/terms')}
                  className="hover:text-[#FFD966] transition-colors inline-flex items-center gap-1 py-0.5 rounded"
                >
                  <span>{t.footer.termsOfUse}</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Column IV: Contact & Editorial Correspondence */}
          <div className="space-y-3.5">
            <h4 className="text-[12px] font-mono uppercase tracking-[0.12em] font-semibold text-[#FFD966]">
              IV · {t.nav.contact}
            </h4>
            <address className="not-italic space-y-2.5 text-[#FFFDF7]/90 text-[13.5px]">
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="w-4 h-4 text-[#FFD966] shrink-0 mt-1"
                  aria-hidden="true"
                />
                <span>
                  {lang === 'mr'
                    ? 'नांदेड (४३१६०२) व सदाशिव पेठ, पुणे (४११०३०), महाराष्ट्र'
                    : 'Nanded (431602) & Sadashiv Peth, Pune (411030), Maharashtra'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail
                  className="w-4 h-4 text-[#FFD966] shrink-0"
                  aria-hidden="true"
                />
                <a
                  href="mailto:sampark@akathprakashan.in"
                  className="hover:text-[#FFD966] transition-colors rounded"
                >
                  sampark@akathprakashan.in
                </a>
              </div>
              <div className="flex items-center gap-2.5">
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
              <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-[#FFD966]">
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
                  className="hover:text-[#FFFDF7] inline-flex items-center gap-1 underline underline-offset-4 transition-colors rounded"
                >
                  <span>WhatsApp</span>
                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                </a>
                <a
                  href={PUBLISHER_IDENTITY.existingLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FFFDF7] inline-flex items-center gap-1 underline underline-offset-4 transition-colors rounded"
                >
                  <span>{lang === 'mr' ? 'मूळ संग्रह' : 'Archive'}</span>
                  <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </address>
          </div>
        </div>

        {/* =====================================================================
            SECTION IV: FINAL COLOPHON IMPRINT, DYNAMIC COPYRIGHT & CREATOR CREDIT
            ===================================================================== */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#FFFDF7]/85">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
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
            <p className="text-[#FFFDF7]/75 text-[12.5px]">
              {lang === 'mr'
                ? 'मराठी भाषा, साहित्य आणि विचारविश्वासाठी समर्पित'
                : 'Dedicated to Marathi Literature, Thought & Print Craftsmanship'}
            </p>
          </div>

          {/* Creator Credit with Gentle Hover Interaction (No external/profile link, no invented surname) */}
          <p className="text-[13px] text-[#FFFDF7]/90">
            <span
              data-testid="footer-creator-credit"
              tabIndex={0}
              className="last-page-creator-credit font-serif text-[#FFFDF7] rounded px-1 py-0.5"
            >
              <Feather
                className="w-3.5 h-3.5 text-[#FFD966] last-page-creator-mark"
                aria-hidden="true"
              />
              <span>
                {lang === 'mr'
                  ? 'साकारले — विश्वजीत'
                  : 'Thoughtfully built by विश्वजीत.'}
              </span>
            </span>
          </p>
        </div>

        {/* Monumental Devanagari Endpaper Watermark */}
        <div
          aria-hidden="true"
          className="mt-8 pt-4 select-none pointer-events-none text-center overflow-hidden"
        >
          <span className="font-serif font-bold text-[clamp(3rem,10.5vw,8rem)] leading-none text-white/[0.05] block">
            अकथ प्रकाशन
          </span>
        </div>
      </div>
    </footer>
  );
};
