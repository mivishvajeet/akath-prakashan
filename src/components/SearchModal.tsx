import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  ArrowRight,
  BookOpen,
  Feather,
  User,
  Clock,
  CornerDownLeft,
  Trash2,
} from 'lucide-react';
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

interface RecentSearchEntry {
  id: string;
  kind: 'query' | 'book' | 'author' | 'article';
  label: string;
  sublabel?: string;
  path?: string;
}

type NavigableItem =
  | {
      key: string;
      section: 'recent';
      entry: RecentSearchEntry;
    }
  | {
      key: string;
      section: 'book';
      book: BookRecord;
      path: string;
    }
  | {
      key: string;
      section: 'author';
      author: AuthorRecord;
      path: string;
    }
  | {
      key: string;
      section: 'article';
      article: EditorialArticle;
      path: string;
    };

const RECENT_SEARCHES_KEY = 'akath_recent_searches_v1';
const MAX_RECENT_SEARCHES = 6;

function loadRecentSearches(): RecentSearchEntry[] {
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is RecentSearchEntry =>
          item &&
          typeof item.id === 'string' &&
          typeof item.label === 'string' &&
          (item.kind === 'query' ||
            item.kind === 'book' ||
            item.kind === 'author' ||
            item.kind === 'article')
      )
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

function persistRecentSearches(entries: RecentSearchEntry[]): void {
  try {
    window.localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(entries.slice(0, MAX_RECENT_SEARCHES))
    );
  } catch {
    // Ignore storage quota or private-mode restrictions
  }
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
  const [recentSearches, setRecentSearches] = useState<RecentSearchEntry[]>(() =>
    typeof window !== 'undefined' ? loadRecentSearches() : []
  );
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const isKeyboardNavRef = useRef(false);

  const q = query.trim().toLowerCase();

  const matchedBooks = useMemo(
    () =>
      q
        ? books.filter(
            (b) =>
              b.title.toLowerCase().includes(q) ||
              (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
              b.transliteratedTitle.toLowerCase().includes(q) ||
              b.category.toLowerCase().includes(q) ||
              b.topics.some((topic) => topic.toLowerCase().includes(q))
          )
        : books.slice(0, 3),
    [books, q]
  );

  const matchedAuthors = useMemo(
    () =>
      q
        ? authors.filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              a.transliteratedName.toLowerCase().includes(q) ||
              a.region.toLowerCase().includes(q)
          )
        : authors.slice(0, 2),
    [authors, q]
  );

  const matchedArticles = useMemo(
    () =>
      q
        ? articles.filter(
            (art) =>
              art.title.toLowerCase().includes(q) ||
              art.transliteratedTitle.toLowerCase().includes(q) ||
              art.contributorName.toLowerCase().includes(q) ||
              art.categoryMarathi.toLowerCase().includes(q)
          )
        : articles.slice(0, 2),
    [articles, q]
  );

  const showRecentSection = !q && recentSearches.length > 0;

  // Build unified flat list of keyboard-navigable rows in exact visual order
  const navigableItems = useMemo<NavigableItem[]>(() => {
    const items: NavigableItem[] = [];
    if (showRecentSection) {
      for (const entry of recentSearches) {
        items.push({
          key: `recent-${entry.id}`,
          section: 'recent',
          entry,
        });
      }
    }
    for (const book of matchedBooks) {
      items.push({
        key: `book-${book.id}`,
        section: 'book',
        book,
        path: `/books/${book.slug}`,
      });
    }
    for (const author of matchedAuthors) {
      items.push({
        key: `author-${author.id}`,
        section: 'author',
        author,
        path: `/authors/${author.slug}`,
      });
    }
    for (const article of matchedArticles) {
      items.push({
        key: `article-${article.id}`,
        section: 'article',
        article,
        path: `/vachankatta/${article.slug}`,
      });
    }
    return items;
  }, [
    showRecentSection,
    recentSearches,
    matchedBooks,
    matchedAuthors,
    matchedArticles,
  ]);

  const recordRecentSearch = useCallback((entry: RecentSearchEntry) => {
    setRecentSearches((prev) => {
      const normalizedLabel = entry.label.trim().toLowerCase();
      const filtered = prev.filter(
        (item) =>
          item.id !== entry.id &&
          !(item.kind === entry.kind && item.label.trim().toLowerCase() === normalizedLabel)
      );
      const next = [entry, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      persistRecentSearches(next);
      return next;
    });
  }, []);

  const removeRecentSearch = useCallback((id: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item.id !== id);
      persistRecentSearches(next);
      return next;
    });
  }, []);

  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
    persistRecentSearches([]);
    inputRef.current?.focus();
  }, []);

  const handleSelectItem = useCallback(
    (item: NavigableItem) => {
      const trimmedQuery = query.trim();

      if (item.section === 'recent') {
        if (item.entry.kind === 'query' || !item.entry.path) {
          setQuery(item.entry.label);
          setActiveIndex(0);
          inputRef.current?.focus();
          return;
        }
        recordRecentSearch(item.entry);
        onClose();
        onNavigate(item.entry.path);
        return;
      }

      if (trimmedQuery.length >= 2) {
        recordRecentSearch({
          id: `query:${trimmedQuery.toLowerCase()}`,
          kind: 'query',
          label: trimmedQuery,
        });
      } else if (item.section === 'book') {
        recordRecentSearch({
          id: item.path,
          kind: 'book',
          label: item.book.title,
          sublabel: `${item.book.category} · ₹${item.book.price}`,
          path: item.path,
        });
      } else if (item.section === 'author') {
        recordRecentSearch({
          id: item.path,
          kind: 'author',
          label: item.author.name,
          sublabel: `${item.author.literaryRole} · ${item.author.region}`,
          path: item.path,
        });
      } else if (item.section === 'article') {
        recordRecentSearch({
          id: item.path,
          kind: 'article',
          label: item.article.title,
          sublabel: `${item.article.categoryMarathi} · ${item.article.contributorName}`,
          path: item.path,
        });
      }

      onClose();
      onNavigate(item.path);
    },
    [query, recordRecentSearch, onClose, onNavigate]
  );

  // Sync focus and reset active highlight when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(loadRecentSearches());
      setActiveIndex(0);
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  // Keep activeIndex in bounds whenever query or results change
  useEffect(() => {
    if (navigableItems.length === 0) {
      setActiveIndex(-1);
    } else {
      setActiveIndex(0);
    }
  }, [q, navigableItems.length]);

  // Auto-scroll highlighted option into view during keyboard navigation
  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !isKeyboardNavRef.current) return;
    const activeEl = optionRefs.current.get(activeIndex);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex, isOpen]);

  // Keyboard-only navigation & modal shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (navigableItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        isKeyboardNavRef.current = true;
        setActiveIndex((prev) =>
          prev < 0 || prev >= navigableItems.length - 1 ? 0 : prev + 1
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        isKeyboardNavRef.current = true;
        setActiveIndex((prev) =>
          prev <= 0 ? navigableItems.length - 1 : prev - 1
        );
        return;
      }

      if (e.key === 'Enter') {
        const activeEl = document.activeElement;
        const isUtilityButton =
          activeEl instanceof HTMLButtonElement &&
          activeEl.getAttribute('role') !== 'option';
        if (isUtilityButton) return;

        const targetIndex =
          activeIndex >= 0 && activeIndex < navigableItems.length
            ? activeIndex
            : 0;
        const targetItem = navigableItems[targetIndex];
        if (targetItem) {
          e.preventDefault();
          handleSelectItem(targetItem);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, navigableItems, activeIndex, handleSelectItem]);

  // Compute starting index offsets for each section to map directly to navigableItems
  const recentOffset = 0;
  const booksOffset = showRecentSection ? recentSearches.length : 0;
  const authorsOffset = booksOffset + matchedBooks.length;
  const articlesOffset = authorsOffset + matchedAuthors.length;

  const activeDescendantId =
    activeIndex >= 0 && activeIndex < navigableItems.length
      ? `akath-search-option-${activeIndex}`
      : undefined;

  const setOptionRef = (idx: number, el: HTMLButtonElement | null) => {
    if (el) {
      optionRefs.current.set(idx, el);
    } else {
      optionRefs.current.delete(idx);
    }
  };

  const renderRecentIcon = (kind: RecentSearchEntry['kind']) => {
    if (kind === 'book') return <BookOpen className="w-4 h-4 text-[#243B8A] shrink-0" />;
    if (kind === 'author') return <User className="w-4 h-4 text-[#174D3A] shrink-0" />;
    if (kind === 'article') return <Feather className="w-4 h-4 text-[#EF6855] shrink-0" />;
    return <Clock className="w-4 h-4 text-[#57534E] shrink-0" />;
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
          className="fixed inset-0 z-50 bg-[#1C1917]/50 flex items-start justify-center pt-6 sm:pt-16 px-3 sm:px-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.searchAria}
          data-testid="search-modal"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-[#E6E1D6] w-full max-w-2xl shadow-[0_28px_70px_-15px_rgba(36,59,138,0.22)] overflow-hidden flex flex-col max-h-[86vh]"
          >
            {/* Search Input Header */}
            <div className="flex items-center border-b border-[#E6E1D6] bg-[#FFFDF7] px-4 sm:px-5 py-3.5 sm:py-4 gap-3 shrink-0">
              <Search className="w-5 h-5 text-[#243B8A] shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls="akath-search-listbox"
                aria-autocomplete="list"
                aria-activedescendant={activeDescendantId}
                data-testid="search-modal-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.catalogue.searchPlaceholder}
                className="w-full min-w-0 text-[15.5px] sm:text-[16px] text-[#252832] placeholder:text-[#525665] bg-transparent focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="min-h-[36px] text-[13px] font-semibold text-[#525665] hover:text-[#252832] px-2 whitespace-nowrap cursor-pointer"
                >
                  {lang === 'mr' ? 'पुसा' : 'Clear'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-[#525665] hover:text-[#252832] hover:bg-[#FFD966]/30 border border-[#E6E1D6] cursor-pointer shrink-0"
                aria-label={lang === 'mr' ? 'बंद करा' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results & Recent Searches Listbox */}
            <div
              id="akath-search-listbox"
              role="listbox"
              aria-label={lang === 'mr' ? 'शोध परिणाम' : 'Search results'}
              className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-5"
            >
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

              {/* Recent Searches */}
              {showRecentSection && (
                <div data-testid="search-recent-section">
                  <div className="flex items-center justify-between gap-2 mb-2 px-2">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#174D3A]">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {lang === 'mr' ? 'अलीकडील शोध' : 'Recent Searches'}
                      </span>
                    </div>
                    <button
                      type="button"
                      data-testid="search-clear-recent"
                      onClick={clearAllRecentSearches}
                      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#525665] hover:text-[#B42318] transition-colors cursor-pointer px-1.5 py-0.5 rounded-md"
                    >
                      <Trash2 className="w-3 h-3" aria-hidden="true" />
                      <span>{lang === 'mr' ? 'सर्व पुसा' : 'Clear all'}</span>
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((entry, idx) => {
                      const flatIndex = recentOffset + idx;
                      const isActive = flatIndex === activeIndex;
                      const navItem = navigableItems[flatIndex];
                      return (
                        <div
                          key={entry.id}
                          className={`group flex items-center gap-1 rounded-2xl border transition-colors ${
                            isActive
                              ? 'bg-[#FAF6EC] border-[#243B8A]/45 shadow-[inset_3px_0_0_#243B8A]'
                              : 'border-transparent hover:bg-[#FFFDF7] hover:border-[#E6E1D6]'
                          }`}
                        >
                          <button
                            ref={(el) => setOptionRef(flatIndex, el)}
                            id={`akath-search-option-${flatIndex}`}
                            role="option"
                            aria-selected={isActive}
                            type="button"
                            data-testid={`search-recent-item-${idx}`}
                            onMouseMove={() => {
                              isKeyboardNavRef.current = false;
                              if (activeIndex !== flatIndex) setActiveIndex(flatIndex);
                            }}
                            onClick={() => navItem && handleSelectItem(navItem)}
                            className="flex-1 min-w-0 py-2.5 pl-3.5 pr-2 flex items-center justify-between gap-3 text-left cursor-pointer focus:outline-none"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {renderRecentIcon(entry.kind)}
                              <div className="min-w-0">
                                <p
                                  className={`font-serif text-[15px] sm:text-[15.5px] font-semibold truncate transition-colors ${
                                    isActive ? 'text-[#243B8A]' : 'text-[#252832]'
                                  }`}
                                >
                                  {entry.label}
                                </p>
                                {entry.sublabel && (
                                  <p className="text-[12px] text-[#525665] truncate">
                                    {entry.sublabel}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isActive && (
                              <CornerDownLeft
                                className="w-3.5 h-3.5 text-[#243B8A] shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(entry.id);
                            }}
                            aria-label={
                              lang === 'mr'
                                ? `"${entry.label}" अलीकडील शोधातून काढा`
                                : `Remove "${entry.label}" from recent searches`
                            }
                            className="min-w-[34px] min-h-[34px] mr-1.5 rounded-lg flex items-center justify-center text-[#78716C] hover:text-[#B42318] hover:bg-white/80 transition-colors cursor-pointer shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Books */}
              {matchedBooks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#243B8A] mb-2 px-2">
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.nav.books}</span>
                  </div>
                  <div className="space-y-1">
                    {matchedBooks.map((book, idx) => {
                      const flatIndex = booksOffset + idx;
                      const isActive = flatIndex === activeIndex;
                      const navItem = navigableItems[flatIndex];
                      return (
                        <button
                          key={book.id}
                          ref={(el) => setOptionRef(flatIndex, el)}
                          id={`akath-search-option-${flatIndex}`}
                          role="option"
                          aria-selected={isActive}
                          type="button"
                          onMouseMove={() => {
                            isKeyboardNavRef.current = false;
                            if (activeIndex !== flatIndex) setActiveIndex(flatIndex);
                          }}
                          onClick={() => navItem && handleSelectItem(navItem)}
                          className={`w-full py-2.5 px-3.5 rounded-2xl flex items-center justify-between gap-3 text-left border transition-colors cursor-pointer focus:outline-none ${
                            isActive
                              ? 'bg-[#FAF6EC] border-[#243B8A]/45 shadow-[inset_3px_0_0_#243B8A]'
                              : 'border-transparent hover:bg-[#FFFDF7] hover:border-[#FFD966]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p
                              className={`font-serif text-[16.5px] sm:text-[17px] font-bold truncate transition-colors ${
                                isActive ? 'text-[#243B8A]' : 'text-[#252832]'
                              }`}
                            >
                              {book.title}
                            </p>
                            <p className="text-[13px] text-[#525665] tabular-nums truncate">
                              {book.category} · ₹{book.price}
                            </p>
                          </div>
                          {isActive ? (
                            <CornerDownLeft
                              className="w-4 h-4 text-[#243B8A] shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowRight
                              className="w-4 h-4 text-[#243B8A]/70 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Authors */}
              {matchedAuthors.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#243B8A] mb-2 px-2">
                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.nav.authors}</span>
                  </div>
                  <div className="space-y-1">
                    {matchedAuthors.map((author, idx) => {
                      const flatIndex = authorsOffset + idx;
                      const isActive = flatIndex === activeIndex;
                      const navItem = navigableItems[flatIndex];
                      return (
                        <button
                          key={author.id}
                          ref={(el) => setOptionRef(flatIndex, el)}
                          id={`akath-search-option-${flatIndex}`}
                          role="option"
                          aria-selected={isActive}
                          type="button"
                          onMouseMove={() => {
                            isKeyboardNavRef.current = false;
                            if (activeIndex !== flatIndex) setActiveIndex(flatIndex);
                          }}
                          onClick={() => navItem && handleSelectItem(navItem)}
                          className={`w-full py-2.5 px-3.5 rounded-2xl flex items-center justify-between gap-3 text-left border transition-colors cursor-pointer focus:outline-none ${
                            isActive
                              ? 'bg-[#FAF6EC] border-[#243B8A]/45 shadow-[inset_3px_0_0_#243B8A]'
                              : 'border-transparent hover:bg-[#FFFDF7] hover:border-[#FFD966]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p
                              className={`font-serif text-[16px] font-bold truncate transition-colors ${
                                isActive ? 'text-[#243B8A]' : 'text-[#252832]'
                              }`}
                            >
                              {author.name}
                            </p>
                            <p className="text-[13px] text-[#525665] truncate">
                              {author.literaryRole} · {author.region}
                            </p>
                          </div>
                          {isActive ? (
                            <CornerDownLeft
                              className="w-4 h-4 text-[#243B8A] shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowRight
                              className="w-4 h-4 text-[#243B8A]/70 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Articles */}
              {matchedArticles.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#243B8A] mb-2 px-2">
                    <Feather className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t.nav.vachankatta}</span>
                  </div>
                  <div className="space-y-1">
                    {matchedArticles.map((art, idx) => {
                      const flatIndex = articlesOffset + idx;
                      const isActive = flatIndex === activeIndex;
                      const navItem = navigableItems[flatIndex];
                      return (
                        <button
                          key={art.id}
                          ref={(el) => setOptionRef(flatIndex, el)}
                          id={`akath-search-option-${flatIndex}`}
                          role="option"
                          aria-selected={isActive}
                          type="button"
                          onMouseMove={() => {
                            isKeyboardNavRef.current = false;
                            if (activeIndex !== flatIndex) setActiveIndex(flatIndex);
                          }}
                          onClick={() => navItem && handleSelectItem(navItem)}
                          className={`w-full py-2.5 px-3.5 rounded-2xl flex items-center justify-between gap-3 text-left border transition-colors cursor-pointer focus:outline-none ${
                            isActive
                              ? 'bg-[#FAF6EC] border-[#243B8A]/45 shadow-[inset_3px_0_0_#243B8A]'
                              : 'border-transparent hover:bg-[#FFFDF7] hover:border-[#FFD966]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p
                              className={`font-serif text-[16px] font-bold truncate transition-colors ${
                                isActive ? 'text-[#243B8A]' : 'text-[#252832]'
                              }`}
                            >
                              {art.title}
                            </p>
                            <p className="text-[13px] text-[#525665] truncate">
                              {art.categoryMarathi} · {art.contributorName}
                            </p>
                          </div>
                          {isActive ? (
                            <CornerDownLeft
                              className="w-4 h-4 text-[#243B8A] shrink-0"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowRight
                              className="w-4 h-4 text-[#243B8A]/70 shrink-0"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts Hint Bar (Desktop/Tablet) */}
            <div className="hidden sm:flex items-center justify-between border-t border-[#E6E1D6] bg-[#FFFDF7] px-5 py-2.5 text-[11.5px] text-[#525665] shrink-0">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DCD4C0] font-mono text-[10.5px] text-[#252832]">
                    ↑
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DCD4C0] font-mono text-[10.5px] text-[#252832]">
                    ↓
                  </kbd>
                  <span>{lang === 'mr' ? 'निवडा' : 'Navigate'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DCD4C0] font-mono text-[10.5px] text-[#252832]">
                    ↵
                  </kbd>
                  <span>{lang === 'mr' ? 'उघडा' : 'Open'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#DCD4C0] font-mono text-[10.5px] text-[#252832]">
                    Esc
                  </kbd>
                  <span>{lang === 'mr' ? 'बंद करा' : 'Close'}</span>
                </span>
              </div>
              <span className="font-mono text-[10.5px] text-[#57534E] tabular-nums">
                {navigableItems.length}{' '}
                {lang === 'mr' ? 'पर्याय' : navigableItems.length === 1 ? 'result' : 'results'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
