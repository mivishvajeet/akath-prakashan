import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  AuthorRecord,
  BookRecord,
  EditorialArticle,
  ManuscriptSubmission,
} from '../types/publishing';
import { BookCard } from '../components/BookCard';
import {
  TortoiseStageIllustration,
  AnimatedTortoiseEmblem,
} from '../components/SarvamIllustrations';
import { WalkingTortoise } from '../components/WalkingTortoise';
import { PUBLISHER_IDENTITY } from '../data/seedData';
import { useLanguage } from '../i18n/translations';
import { validateEmail, validateIndianPhone } from '../utils/validation';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Upload,
} from 'lucide-react';

// ============================================================================
// 1. AUTHORS DIRECTORY VIEW (/authors)
// ============================================================================

interface AuthorsListViewProps {
  authors: AuthorRecord[];
  books: BookRecord[];
  onNavigate: (path: string) => void;
}

export const AuthorsListView: React.FC<AuthorsListViewProps> = ({
  authors,
  books,
  onNavigate,
}) => {
  const { lang, t } = useLanguage();

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
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
            <span>{t.home.authorsEyebrow}</span>
          </div>
          <h1 className="type-page-heading text-[#252832]">{t.home.authorsTitle}</h1>
          <p className="mt-2.5 prose-marathi text-[#5A5F72] max-w-[62ch]">
            {lang === 'mr'
              ? 'महाराष्ट्राच्या विविध भूभागांतून, भाषिक प्रवाहांतून आणि साहित्यप्रकारांतून समकालीन मराठी साहित्याला समृद्ध करणारे लेखक, कवी आणि समीक्षक.'
              : 'Contemporary Marathi novelists, poets, essayists, and translators from across Maharashtra published by Akath Prakashan.'}
          </p>
        </motion.div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authors.map((author, idx) => {
            const authorBooks = books.filter((b) => b.authorId === author.id);
            return (
              <motion.article
                key={author.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 hover:border-[#243B8A]/35 transition-colors flex flex-col justify-between space-y-5 shadow-[0_8px_28px_-14px_rgba(37,40,50,0.06)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[13px] text-[#5A5F72]">
                    <span className="font-semibold text-[#243B8A]">
                      {author.region}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{author.literaryRole}</span>
                  </div>

                  <h2 className="type-section-heading text-[#252832]">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/authors/${author.slug}`)}
                      className="text-left hover:text-[#243B8A] transition-colors"
                    >
                      {author.name}
                    </button>
                  </h2>

                  <p className="text-[15px] text-[#5A5F72] leading-relaxed">
                    {author.biography}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E6DFCE] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#5A5F72]">
                    <span className="font-semibold text-[#252832]">
                      {lang === 'mr' ? 'पुस्तके:' : 'Books:'}
                    </span>
                    {authorBooks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onNavigate(`/books/${b.slug}`)}
                        className="text-[#243B8A] hover:underline font-medium"
                      >
                        {b.title}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate(`/authors/${author.slug}`)}
                    className="text-[14px] font-semibold text-[#243B8A] hover:underline inline-flex items-center gap-1"
                  >
                    <span>
                      {lang === 'mr' ? 'संपूर्ण परिचय' : 'Full Profile'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// 2. AUTHOR DETAIL VIEW (/authors/:slug)
// ============================================================================

interface AuthorDetailViewProps {
  author: AuthorRecord;
  books: BookRecord[];
  articles: EditorialArticle[];
  onNavigate: (path: string) => void;
  onAddToCart: (bookId: string) => void;
  recentlyAddedBookId: string | null;
}

export const AuthorDetailView: React.FC<AuthorDetailViewProps> = ({
  author,
  books,
  articles,
  onNavigate,
  onAddToCart,
  recentlyAddedBookId,
}) => {
  const { lang, t } = useLanguage();
  const authorBooks = books.filter((b) => b.authorId === author.id);
  const authorArticles = articles.filter((a) => a.authorId === author.id);

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen">
      <div className="bg-white border-b border-[#E6DFCE]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <button
            type="button"
            onClick={() => onNavigate('/authors')}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-[#5A5F72] hover:text-[#243B8A]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.nav.authors}</span>
          </button>
        </div>
      </div>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 max-w-3xl space-y-4"
        >
          <p className="text-[13px] font-semibold text-[#243B8A]">
            {author.literaryRole} · {author.region}
          </p>
          <h1 className="type-page-heading text-[#252832]">{author.name}</h1>
          <p className="prose-marathi text-[#5A5F72]">{author.biography}</p>
          <blockquote className="bg-[#FFD966]/20 border border-[#FFD966] rounded-xl p-4 text-[15px] text-[#252832] italic">
            {author.editorialNote}
          </blockquote>
        </motion.div>

        {authorBooks.length > 0 && (
          <div className="pt-4">
            <h2 className="type-section-heading text-[#252832] mb-6">
              {lang === 'mr'
                ? `${author.name} यांची पुस्तके`
                : `Books by ${author.name}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {authorBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  author={author}
                  onSelectBook={(slug) => onNavigate(`/books/${slug}`)}
                  onAddToCart={onAddToCart}
                  justAdded={recentlyAddedBookId === book.id}
                />
              ))}
            </div>
          </div>
        )}

        {authorArticles.length > 0 && (
          <div className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-8 space-y-4">
            <h2 className="type-section-heading text-[#252832]">
              {lang === 'mr'
                ? 'वाचनकट्ट्यावरील लेखन'
                : 'Essays on Vachankatta'}
            </h2>
            <div className="divide-y divide-[#E6DFCE]">
              {authorArticles.map((art) => (
                <div
                  key={art.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                      className="font-serif text-[19px] font-bold text-[#252832] hover:text-[#243B8A] text-left"
                    >
                      {art.title}
                    </button>
                    <p className="text-[14px] text-[#5A5F72]">{art.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/vachankatta/${art.slug}`)}
                    className="text-[14px] text-[#243B8A] font-semibold hover:underline shrink-0"
                  >
                    {t.vachankatta.readFullArticle} →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

// ============================================================================
// 3. ABOUT AKATH PRAKASHAN VIEW (/about) — WITH ANIMATED TORTOISE & 6-STEP CRAFT
// ============================================================================

interface AboutAkathViewProps {
  onNavigate: (path: string) => void;
}

export const AboutAkathView: React.FC<AboutAkathViewProps> = ({ onNavigate }) => {
  const { lang, t } = useLanguage();

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-12 lg:py-16">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Monumental Card with Animated Tortoise Stage */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[32px] border border-[#E6DFCE] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center sarvam-aura"
        >
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-[#243B8A]">
              <AnimatedTortoiseEmblem
                className="w-8 h-8"
                variant="indigo"
                animate={true}
              />
              <span>
                {lang === 'mr'
                  ? 'अकथ प्रकाशन · नांदेड / पुणे · महाराष्ट्र'
                  : 'Akath Prakashan · Nanded / Pune · Maharashtra'}
              </span>
            </div>

            <h1 className="type-page-heading text-[#252832]">
              {lang === 'mr'
                ? 'कमी पुस्तके, पण पिढ्यानपिढ्या टिकणारी पुस्तके.'
                : 'Fewer Books, Crafted to Endure for Generations.'}
            </h1>

            <p className="prose-marathi text-[#5A5F72]">
              {lang === 'mr'
                ? PUBLISHER_IDENTITY.positioningMarathi
                : PUBLISHER_IDENTITY.positioningEnglish}
            </p>

            <blockquote className="p-5 rounded-2xl bg-[#FFD966]/20 border border-[#FFD966] font-serif text-[18px] text-[#252832] leading-relaxed">
              “
              {lang === 'mr'
                ? PUBLISHER_IDENTITY.turtlePhilosophyMarathi
                : PUBLISHER_IDENTITY.turtlePhilosophyEnglish}
              ”
            </blockquote>

            <div className="pt-2 flex flex-wrap gap-3.5">
              <button
                type="button"
                onClick={() => onNavigate('/books')}
                className="px-6 py-3 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                {t.home.ctaExploreBooks}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/submit-manuscript')}
                className="px-6 py-3 rounded-xl bg-white border border-[#E6DFCE] text-[#252832] text-[15px] font-semibold hover:bg-[#FFD966]/35 whitespace-nowrap shrink-0 transition-colors"
              >
                {t.nav.submitManuscript}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center text-[#243B8A]">
            <TortoiseStageIllustration className="w-full max-w-[360px] h-auto" />
            <div className="mt-4 flex items-center gap-2.5 text-[12px] text-[#5A5F72]">
              <AnimatedTortoiseEmblem
                className="w-7 h-7 shrink-0"
                variant="cerulean"
                animate={false}
              />
              <span>
                {lang === 'mr'
                  ? 'कासव आणि उघडलेले पुस्तक — अकथ प्रकाशन मुद्रा'
                  : 'The Tortoise & Open Book — Official Akath Imprint'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 6-Step Publishing Craft Grid */}
        <section className="space-y-6">
          <div>
            <p className="text-[12px] font-semibold text-[#243B8A]">
              {lang === 'mr'
                ? '02 · संपादकीय आणि मुद्रण प्रक्रिया'
                : '02 · Editorial & Print Production Process'}
            </p>
            <h2 className="type-section-heading text-[#252832] mt-1">
              {lang === 'mr'
                ? 'अकथ प्रकाशनची ६-टप्प्यांची पुस्तक निर्मिती'
                : 'Akath’s Six-Stage Bookmaking Craft'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PUBLISHER_IDENTITY.preservedCapabilities.map((cap, idx) => (
              <motion.div
                key={cap.step}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-[#E6DFCE] p-6 space-y-2.5"
              >
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#FFD966] text-[#252832]">
                    {cap.step}
                  </span>
                  <span className="text-[#5A5F72]">
                    {lang === 'mr' ? cap.titleEnglish : cap.titleMarathi}
                  </span>
                </div>
                <h3 className="type-book-title text-[#252832]">
                  {lang === 'mr' ? cap.titleMarathi : cap.titleEnglish}
                </h3>
                <p className="text-[14px] text-[#5A5F72] leading-relaxed">
                  {lang === 'mr'
                    ? cap.description
                    : cap.descriptionEnglish || cap.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Editorial Principles */}
        <section className="bg-white rounded-[32px] border border-[#E6DFCE] p-8 sm:p-10 space-y-6">
          <div>
            <p className="text-[12px] font-semibold text-[#243B8A]">
              {lang === 'mr' ? '03 · संपादकीय मूल्ये' : '03 · Editorial Principles'}
            </p>
            <h2 className="type-section-heading text-[#252832] mt-1">
              {lang === 'mr'
                ? 'अकथ प्रकाशनाची पंचसूत्री'
                : 'Core Editorial Principles of Akath Prakashan'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PUBLISHER_IDENTITY.editorialPrinciples.map((principle, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] flex items-start gap-3"
              >
                <span className="font-mono text-[12px] font-bold px-1.5 py-0.5 rounded bg-[#FFD966]/75 text-[#252832] mt-0.5">
                  0{idx + 1}.
                </span>
                <div className="space-y-1">
                  <h3 className="font-serif text-[16px] font-bold text-[#252832]">
                    {lang === 'mr'
                      ? principle.title
                      : principle.titleEnglish || principle.title}
                  </h3>
                  <p className="text-[14px] text-[#5A5F72] leading-relaxed">
                    {lang === 'mr'
                      ? principle.description
                      : principle.descriptionEnglish || principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================================
            CLOSING LITERARY SIGNATURE & WALKING TORTOISE COLOPHON
            Placed after all About section text, immediately before the footer.
            =================================================================== */}
        <section
          data-testid="about-closing-colophon"
          aria-label={
            lang === 'mr'
              ? 'अकथ प्रकाशन समारोप ब्रीदवाक्य आणि चालणारे कासव'
              : 'Akath Prakashan closing literary signature and walking tortoise'
          }
          className="pt-12 pb-10 sm:pt-16 sm:pb-12 border-t border-[#E6DFCE]/80 text-center space-y-6"
        >
          <div className="max-w-2xl mx-auto space-y-2.5 px-2">
            <p
              data-testid="about-final-marathi-line"
              className="font-serif text-[22px] sm:text-[26px] font-bold text-[#174D3A] leading-snug tracking-normal"
            >
              “वाचत राहू. विचारत राहू. लिहित राहू.”
            </p>
            {lang === 'en' && (
              <p className="font-serif text-[15px] sm:text-[16.5px] italic text-[#5A5F72]">
                “{PUBLISHER_IDENTITY.closingMottoEnglish}”
              </p>
            )}
          </div>

          {/* Walking Tortoise Closing Animation */}
          <WalkingTortoise className="mt-4" />
        </section>
      </div>
    </div>
  );
};

// ============================================================================
// 4. SUBMIT MANUSCRIPT VIEW (/submit-manuscript)
// ============================================================================

interface SubmitManuscriptViewProps {
  onSubmitManuscript: (
    payload: Record<string, unknown>
  ) => Promise<{
    ok: boolean;
    submission?: ManuscriptSubmission;
    error?: string;
    fieldErrors?: Record<string, string>;
  }>;
}

export const SubmitManuscriptView: React.FC<SubmitManuscriptViewProps> = ({
  onSubmitManuscript,
}) => {
  const { lang, t } = useLanguage();

  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [category, setCategory] = useState('कादंबरी');
  const [wordCountEstimate] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [sampleExcerptText, setSampleExcerptText] = useState('');
  const [originalWorkConfirmed, setOriginalWorkConfirmed] = useState(true);
  const [privacyConsentConfirmed, setPrivacyConsentConfirmed] = useState(true);
  const [fileMeta, setFileMeta] = useState<{
    fileName: string;
    fileType: string;
    fileSizeBytes: number;
  } | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<ManuscriptSubmission | null>(
    null
  );

  const authorNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const synopsisRef = useRef<HTMLTextAreaElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (authorName.trim().length < 2) {
      nextErrors.authorName =
        lang === 'mr'
          ? 'कृपया लेखकाचे पूर्ण नाव लिहा.'
          : 'Please enter the author’s full name.';
    }

    const emailCheck = validateEmail(email, lang);
    if (!emailCheck.isValid) {
      nextErrors.email = emailCheck.error!;
    }

    const phoneCheck = validateIndianPhone(phone, lang);
    if (!phoneCheck.isValid) {
      nextErrors.phone = phoneCheck.error!;
    }

    if (manuscriptTitle.trim().length < 2) {
      nextErrors.manuscriptTitle =
        lang === 'mr'
          ? 'कृपया हस्तलिखिताचे शीर्षक लिहा.'
          : 'Please enter the manuscript title.';
    }

    if (synopsis.trim().length < 40) {
      nextErrors.synopsis =
        lang === 'mr'
          ? 'कृपया किमान ४० अक्षरांचा सारांश लिहा.'
          : 'Please provide a synopsis of at least 40 characters.';
    }

    if (sampleExcerptText.trim().length < 80) {
      nextErrors.sampleExcerptText =
        lang === 'mr'
          ? 'कृपया किमान ८० अक्षरांचा नमुना उतारा लिहा.'
          : 'Please include a sample excerpt of at least 80 characters.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.authorName) authorNameRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.phone) phoneRef.current?.focus();
      else if (nextErrors.manuscriptTitle) titleRef.current?.focus();
      else if (nextErrors.synopsis) synopsisRef.current?.focus();
      else if (nextErrors.sampleExcerptText) excerptRef.current?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await onSubmitManuscript({
        lang,
        authorName: authorName.trim(),
        email: emailCheck.normalizedValue,
        phone: phoneCheck.normalizedValue,
        city: city.trim() || 'पुणे',
        manuscriptTitle: manuscriptTitle.trim(),
        category,
        wordCountEstimate: wordCountEstimate.trim(),
        synopsis: synopsis.trim(),
        sampleExcerptText: sampleExcerptText.trim(),
        fileAttachmentMeta: fileMeta || undefined,
        originalWorkConfirmed,
        privacyConsentConfirmed,
      });

      if (res.ok && res.submission) {
        setSubmittedRecord(res.submission);
      } else if (res.fieldErrors) {
        setErrors(res.fieldErrors);
      } else if (res.error) {
        setErrors({ form: res.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[820px] mx-auto px-4 sm:px-6"
      >
        <div className="mb-8 space-y-2">
          <div className="text-[13px] font-semibold text-[#243B8A]">
            <span>{t.manuscript.title}</span>
          </div>
          <h1 className="type-page-heading text-[#252832]">{t.manuscript.title}</h1>
          <p className="prose-marathi text-[#5A5F72]">{t.manuscript.subtitle}</p>
        </div>

        {submittedRecord ? (
          <div className="bg-white rounded-3xl border border-[#15803D]/40 p-8 space-y-4">
            <div className="flex items-center gap-3 text-[#15803D]">
              <CheckCircle2 className="w-6 h-6" />
              <h2 className="type-section-heading">{t.manuscript.successTitle}</h2>
            </div>
            <p className="text-[15px] text-[#5A5F72]">
              {lang === 'mr'
                ? `संदर्भ क्रमांक: ${submittedRecord.referenceCode}. आमचे संपादकीय मंडळ ८ ते १० आठवड्यांत आपल्याशी ईमेलद्वारे संपर्क साधेल.`
                : `Reference Code: ${submittedRecord.referenceCode}. Our editorial board will respond via email within 8–10 weeks.`}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 space-y-6"
          >
            {errors.form && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-50 border border-red-200 text-[#B42318] text-[14px] flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ms-author-name" className="block ui-label mb-1.5">
                  {t.manuscript.authorNameLabel}{' '}
                  <span className="text-[#B42318]">*</span>
                </label>
                <input
                  ref={authorNameRef}
                  id="ms-author-name"
                  type="text"
                  value={authorName}
                  onChange={(e) => {
                    setAuthorName(e.target.value);
                    if (errors.authorName)
                      setErrors((p) => ({ ...p, authorName: '' }));
                  }}
                  aria-invalid={Boolean(errors.authorName)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                    errors.authorName ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                  }`}
                />
                {errors.authorName && (
                  <p
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.authorName}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ms-city" className="block ui-label mb-1.5">
                  {t.checkout.cityLabel}{' '}
                  <span className="text-[12px] font-normal text-[#5A5F72]">
                    ({t.checkout.optionalMarker})
                  </span>
                </label>
                <input
                  id="ms-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ms-email" className="block ui-label mb-1.5">
                  {t.checkout.emailLabel} <span className="text-[#B42318]">*</span>
                </label>
                <input
                  ref={emailRef}
                  id="ms-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                  }}
                  aria-invalid={Boolean(errors.email)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                    errors.email ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                  }`}
                />
                {errors.email && (
                  <p
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ms-phone" className="block ui-label mb-1.5">
                  {t.checkout.phoneLabel} <span className="text-[#B42318]">*</span>
                </label>
                <input
                  ref={phoneRef}
                  id="ms-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                  }}
                  placeholder={t.checkout.phoneHint}
                  aria-invalid={Boolean(errors.phone)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                    errors.phone ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                  }`}
                />
                {errors.phone && (
                  <p
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2">
                <label htmlFor="ms-title" className="block ui-label mb-1.5">
                  {t.manuscript.manuscriptTitleLabel}{' '}
                  <span className="text-[#B42318]">*</span>
                </label>
                <input
                  ref={titleRef}
                  id="ms-title"
                  type="text"
                  value={manuscriptTitle}
                  onChange={(e) => {
                    setManuscriptTitle(e.target.value);
                    if (errors.manuscriptTitle)
                      setErrors((p) => ({ ...p, manuscriptTitle: '' }));
                  }}
                  aria-invalid={Boolean(errors.manuscriptTitle)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                    errors.manuscriptTitle ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                  }`}
                />
                {errors.manuscriptTitle && (
                  <p
                    role="alert"
                    className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.manuscriptTitle}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ms-category" className="block ui-label mb-1.5">
                  {t.manuscript.categoryLabel}
                </label>
                <select
                  id="ms-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-white"
                >
                  <option value="कादंबरी">
                    {lang === 'mr' ? 'कादंबरी' : 'Novel (कादंबरी)'}
                  </option>
                  <option value="कथासंग्रह">
                    {lang === 'mr' ? 'कथासंग्रह' : 'Short Stories (कथासंग्रह)'}
                  </option>
                  <option value="कवितासंग्रह">
                    {lang === 'mr' ? 'कवितासंग्रह' : 'Poetry (कवितासंग्रह)'}
                  </option>
                  <option value="समीक्षा व निबंध">
                    {lang === 'mr'
                      ? 'समीक्षा व निबंध'
                      : 'Criticism & Essays (समीक्षा व निबंध)'}
                  </option>
                  <option value="अनुवाद">
                    {lang === 'mr' ? 'अनुवाद' : 'Translation (अनुवाद)'}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ms-synopsis" className="block ui-label mb-1.5">
                {t.manuscript.synopsisLabel}{' '}
                <span className="text-[#B42318]">*</span>
              </label>
              <textarea
                ref={synopsisRef}
                id="ms-synopsis"
                rows={4}
                value={synopsis}
                onChange={(e) => {
                  setSynopsis(e.target.value);
                  if (errors.synopsis) setErrors((p) => ({ ...p, synopsis: '' }));
                }}
                aria-invalid={Boolean(errors.synopsis)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                  errors.synopsis ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                }`}
              />
              {errors.synopsis && (
                <p
                  role="alert"
                  className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.synopsis}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="ms-excerpt" className="block ui-label mb-1.5">
                {t.manuscript.sampleExcerptLabel}{' '}
                <span className="text-[#B42318]">*</span>
              </label>
              <textarea
                ref={excerptRef}
                id="ms-excerpt"
                rows={6}
                value={sampleExcerptText}
                onChange={(e) => {
                  setSampleExcerptText(e.target.value);
                  if (errors.sampleExcerptText)
                    setErrors((p) => ({ ...p, sampleExcerptText: '' }));
                }}
                aria-invalid={Boolean(errors.sampleExcerptText)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                  errors.sampleExcerptText ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                }`}
              />
              {errors.sampleExcerptText && (
                <p
                  role="alert"
                  className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.sampleExcerptText}</span>
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E6DFCE] flex items-center justify-between">
              <div className="text-[14px]">
                <p className="font-semibold text-[#252832]">
                  {lang === 'mr'
                    ? 'हस्तलिखित फाईल जोडा (PDF / DOCX, कमाल १५ MB — ऐच्छिक)'
                    : 'Attach Manuscript File (PDF / DOCX, max 15 MB — Optional)'}
                </p>
                {fileMeta && (
                  <p className="text-[13px] text-[#15803D] mt-0.5">
                    {fileMeta.fileName} ({Math.round(fileMeta.fileSizeBytes / 1024)} KB)
                  </p>
                )}
              </div>
              <label className="px-4 py-2 rounded-xl bg-white border border-[#E6DFCE] text-[13px] font-semibold cursor-pointer inline-flex items-center gap-1.5 hover:bg-[#FFD966]/35 transition-colors">
                <Upload className="w-4 h-4 text-[#243B8A]" />
                <span>{lang === 'mr' ? 'फाईल निवडा' : 'Choose File'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFileMeta({
                        fileName: f.name,
                        fileType: f.type || 'application/pdf',
                        fileSizeBytes: f.size,
                      });
                    }
                  }}
                />
              </label>
            </div>

            <div className="space-y-2 text-[14px]">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={originalWorkConfirmed}
                  onChange={(e) => setOriginalWorkConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-[#243B8A]"
                />
                <span>
                  {lang === 'mr'
                    ? 'हे लेखन माझे स्वतःचे व मूळ असून कोणाच्याही कॉपीराइटचा भंग करत नाही.'
                    : 'I confirm this manuscript is my original work and does not infringe copyright.'}
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyConsentConfirmed}
                  onChange={(e) => setPrivacyConsentConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-[#243B8A]"
                />
                <span>
                  {lang === 'mr'
                    ? 'संपादकीय मूल्यांकनासाठी अकथ प्रकाशनच्या गोपनीयता धोरणास माझी संमती आहे.'
                    : 'I consent to Akath Prakashan’s editorial review and privacy policy.'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold transition-colors"
            >
              {t.manuscript.submitBtn}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

// ============================================================================
// 5. CONTACT VIEW (/contact)
// ============================================================================

interface ContactViewProps {
  onSubmitContact: (
    payload: Record<string, unknown>
  ) => Promise<{
    ok: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string>;
  }>;
}

export const ContactView: React.FC<ContactViewProps> = ({ onSubmitContact }) => {
  const { lang, t } = useLanguage();

  const [name, setName] = useState('');
  const [role, setRole] = useState<
    'Reader' | 'Author' | 'Bookstore_Institution' | 'Contributor'
  >('Reader');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    const nextErrors: Record<string, string> = {};

    if (name.trim().length < 2) {
      nextErrors.name =
        lang === 'mr' ? 'कृपया तुमचे नाव लिहा.' : 'Please enter your name.';
    }

    const emailCheck = validateEmail(email, lang);
    if (!emailCheck.isValid) {
      nextErrors.email = emailCheck.error!;
    }

    if (phone.trim()) {
      const phoneCheck = validateIndianPhone(phone, lang);
      if (!phoneCheck.isValid) {
        nextErrors.phone = phoneCheck.error!;
      }
    }

    if (message.trim().length < 10) {
      nextErrors.message =
        lang === 'mr'
          ? 'कृपया तुमचा संदेश सविस्तर लिहा (किमान १० अक्षरे).'
          : 'Please write a message of at least 10 characters.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.email) emailRef.current?.focus();
      else if (nextErrors.phone) phoneRef.current?.focus();
      else if (nextErrors.message) messageRef.current?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await onSubmitContact({
        lang,
        name: name.trim(),
        role,
        email: emailCheck.normalizedValue,
        phone: phone.trim()
          ? validateIndianPhone(phone, lang).normalizedValue
          : undefined,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.ok) {
        setSuccessMsg(res.message || t.contact.successMessage);
        setName('');
        setEmail('');
        setPhone('');
        setSubject('');
        setMessage('');
      } else if (res.fieldErrors) {
        setErrors(res.fieldErrors);
      } else if (res.error) {
        setErrors({ form: res.error });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FFFDF7] text-[#252832] min-h-screen py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[780px] mx-auto px-4 sm:px-6"
      >
        <div className="mb-8 space-y-2">
          <h1 className="type-page-heading text-[#252832]">{t.contact.title}</h1>
          <p className="prose-marathi text-[#5A5F72]">{t.contact.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white rounded-3xl border border-[#E6DFCE] p-6 sm:p-10 space-y-6"
        >
          {successMsg && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[14px] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errors.form && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-[#B42318] text-[14px] flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact-name" className="block ui-label mb-1.5">
                {t.contact.nameLabel} <span className="text-[#B42318]">*</span>
              </label>
              <input
                ref={nameRef}
                id="contact-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                }}
                aria-invalid={Boolean(errors.name)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                  errors.name ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                }`}
              />
              {errors.name && (
                <p
                  role="alert"
                  className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="contact-role" className="block ui-label mb-1.5">
                {t.contact.roleLabel}
              </label>
              <select
                id="contact-role"
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-white"
              >
                <option value="Reader">
                  {lang === 'mr' ? 'वाचक' : 'Reader'}
                </option>
                <option value="Author">
                  {lang === 'mr' ? 'लेखक' : 'Author'}
                </option>
                <option value="Bookstore_Institution">
                  {lang === 'mr'
                    ? 'ग्रंथालय / पुस्तक विक्रेता'
                    : 'Bookstore / Library'}
                </option>
                <option value="Contributor">
                  {lang === 'mr'
                    ? 'समीक्षक / पत्रकार'
                    : 'Reviewer / Media'}
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contact-email" className="block ui-label mb-1.5">
                {t.checkout.emailLabel} <span className="text-[#B42318]">*</span>
              </label>
              <input
                ref={emailRef}
                id="contact-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                }}
                aria-invalid={Boolean(errors.email)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                  errors.email ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                }`}
              />
              {errors.email && (
                <p
                  role="alert"
                  className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="contact-phone" className="block ui-label mb-1.5">
                {t.checkout.phoneLabel}{' '}
                <span className="text-[12px] font-normal text-[#5A5F72]">
                  ({t.checkout.optionalMarker})
                </span>
              </label>
              <input
                ref={phoneRef}
                id="contact-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                }}
                placeholder={t.checkout.phoneHint}
                aria-invalid={Boolean(errors.phone)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                  errors.phone ? 'border-[#B42318]' : 'border-[#E6DFCE]'
                }`}
              />
              {errors.phone && (
                <p
                  role="alert"
                  className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="contact-subject" className="block ui-label mb-1.5">
              {t.contact.subjectLabel}{' '}
              <span className="text-[12px] font-normal text-[#5A5F72]">
                ({t.checkout.optionalMarker})
              </span>
            </label>
            <input
              id="contact-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DFCE] text-[15px] bg-white"
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="block ui-label mb-1.5">
              {t.contact.messageLabel} <span className="text-[#B42318]">*</span>
            </label>
            <textarea
              ref={messageRef}
              id="contact-message"
              rows={5}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors((p) => ({ ...p, message: '' }));
              }}
              aria-invalid={Boolean(errors.message)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-[15px] bg-white ${
                errors.message ? 'border-[#B42318]' : 'border-[#E6DFCE]'
              }`}
            />
            {errors.message && (
              <p
                role="alert"
                className="mt-1.5 text-[13px] font-medium text-[#B42318] flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.message}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3.5 rounded-xl bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7] text-[15px] font-semibold transition-colors"
          >
            {t.contact.submitBtn}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
