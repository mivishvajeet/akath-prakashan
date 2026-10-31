import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, BookOpen, Feather, User } from 'lucide-react';
import { BookRecord, AuthorRecord, EditorialArticle } from '../types/publishing';
import { useLanguage } from '../i18n/translations';
import { AnimatedTortoiseEmblem } from './SarvamIllustrations';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: BookRecord[];
  authors: AuthorRecord[];
  articles: EditorialArticle[];
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  books,
  authors,
  articles,
  onNavigate,
}) => {
  const { lang, t } = useLanguage();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();

  const matchedBooks = q
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
          b.transliteratedTitle.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.topics.some((topic) => topic.toLowerCase().includes(q))
      )
    : books.slice(0, 3);

  const matchedAuthors = q
    ? authors.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.transliteratedName.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q)
      )
    : authors.slice(0, 2);

  const matchedArticles = q
    ? articles.filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          art.transliteratedTitle.toLowerCase().includes(q) ||
          art.contributorName.toLowerCase().includes(q) ||
          art.categoryMarathi.toLowerCase().includes(q)
      )
    : articles.slice(0, 2);

  const handleSelect = (path: string) => {
    onClose();
    onNavigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-[#252832]/45 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.searchAria}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-[#E6E1D6] w-full max-w-2xl shadow-[0_28px_70px_-15px_rgba(36,59,138,0.22)] overflow-hidden"
          >
            {/* Search Input Header */}
            <div className="flex items-center border-b border-[#E6E1D6] bg-[#FFFDF7] px-5 py-4 gap-3">
              <Search className="w-5 h-5 text-[#243B8A] shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.catalogue.searchPlaceholder}
                className="w-full text-[16px] text-[#252832] placeholder:text-[#525665] bg-transparent focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-[13px] font-semibold text-[#525665] hover:text-[#252832] px-2 whitespace-nowrap"
                >
                  {lang === 'mr' ? 'पुसा' : 'Clear'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-[#525665] hover:text-[#252832] hover:bg-[#FFD966]/30 border border-[#E6E1D6]"
                aria-label={lang === 'mr' ? 'बंद करा' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[68vh] overflow-y-auto p-5 space-y-6">
              {q &&
                matchedBooks.length === 0 &&
                matchedAuthors.length === 0 &&
                matchedArticles.length === 0 && (
                  <div className="py-10 text-center space-y-3">
                    <div className="flex justify-center">
                      <AnimatedTortoiseEmblem
                        className="w-14 h-14"
                        variant="forest"
                        animate={true}
                      />
                    </div>
                    <p className="text-[16px] text-[#252832] font-serif font-semibold">
                      {t.catalogue.noMatchesTitle}
                    </p>
                    <p className="text-[14px] text-[#525665]">
                      {t.catalogue.noMatchesBody}
                    </p>
                  </div>
                )}

              {/* Books */}
              {matchedBooks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#243B8A] mb-2 px-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t.nav.books}</span>
                  </div>
                  <div className="space-y-1">
                    {matchedBooks.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => handleSelect(`/books/${book.slug}`)}
                        className="w-full py-2.5 px-3.5 rounded-2xl flex items-center justify-between text-left hover:bg-[#FFFDF7] border border-transparent hover:border-[#FFD966] transition-colors group"
                      >
                        <div>
                          <p className="font-serif text-[17px] font-bold text-[#252832] group-hover:text-[#243B8A] transition-colors">
                            {book.title}
                          </p>
                          <p className="text-[13px] text-[#525665] tabular-nums">
                            {book.category} · ₹{book.price}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#243B8A] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Authors */}
              {matchedAuthors.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#243B8A] mb-2 px-2">
                    <User className="w-3.5 h-3.5" />
                    <span>{t.nav.authors}</span>
                  </div>
                  <div className="space-y-1">
                    {matchedAuthors.map((author) => (
                      <button
                        key={author.id}
                        type="button"
                        onClick={() => handleSelect(`/authors/${author.slug}`)}
                        className="w-full py-2.5 px-3.5 rounded-2xl flex items-center justify-between text-left hover:bg-[#FFFDF7] border border-transparent hover:border-[#FFD966] transition-colors group"
                      >
                        <div>
                          <p className="font-serif text-[16px] font-bold text-[#252832] group-hover:text-[#243B8A] transition-colors">
                            {author.name}
                          </p>
                          <p className="text-[13px] text-[#525665]">
                            {author.literaryRole} · {author.region}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#243B8A] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles */}
              {matchedArticles.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#243B8A] mb-2 px-2">
                    <Feather className="w-3.5 h-3.5" />
                    <span>{t.nav.vachankatta}</span>
                  </div>
                  <div className="space-y-1">
                    {matchedArticles.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => handleSelect(`/vachankatta/${art.slug}`)}
                        className="w-full py-2.5 px-3.5 rounded-2xl flex items-center justify-between text-left hover:bg-[#FFFDF7] border border-transparent hover:border-[#FFD966] transition-colors group"
                      >
                        <div>
                          <p className="font-serif text-[16px] font-bold text-[#252832] group-hover:text-[#243B8A] transition-colors">
                            {art.title}
                          </p>
                          <p className="text-[13px] text-[#525665]">
                            {art.categoryMarathi} · {art.contributorName}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#243B8A] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
