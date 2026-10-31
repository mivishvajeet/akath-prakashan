import React from 'react';
import { motion } from 'motion/react';
import { BookRecord, AuthorRecord } from '../types/publishing';
import { BookCoverArt } from './BookCoverArt';
import { useLanguage } from '../i18n/translations';
import { Check, ShoppingBag, BookOpen, ArrowUpRight } from 'lucide-react';

interface BookCardProps {
  book: BookRecord;
  author?: AuthorRecord;
  onSelectBook: (slug: string) => void;
  onSelectAuthor?: (slug: string) => void;
  onAddToCart: (bookId: string) => void;
  onOpenExcerpt?: (excerptId: string) => void;
  justAdded?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  author,
  onSelectBook,
  onSelectAuthor,
  onAddToCart,
  onOpenExcerpt,
  justAdded = false,
}) => {
  const { lang, t } = useLanguage();
  const isAvailable = book.availability !== 'out_of_stock' && book.stock > 0;

  const availabilityLabel =
    book.availability === 'out_of_stock' || book.stock <= 0
      ? t.book.outOfStock
      : book.availability === 'limited_stock' || book.stock <= 5
      ? `${t.book.limitedStock} (${book.stock})`
      : t.book.inStock;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="group bg-white rounded-[24px] border border-[#E6E1D6] p-4 sm:p-5 flex flex-col justify-between transition-all hover:border-[#243B8A]/45 hover:shadow-[0_20px_40px_-15px_rgba(36,59,138,0.12)]"
    >
      <div>
        {/* Top Metadata Row Above Arch Stage */}
        <div className="flex items-center justify-between gap-2 text-[12px] text-[#525665] mb-3 px-1">
          <span className="font-semibold text-[#243B8A] truncate">
            {book.category}
          </span>
          <span
            className={`shrink-0 ${
              !isAvailable
                ? 'text-[#D93829] font-medium'
                : book.stock <= 5
                ? 'text-[#EF6855] font-semibold'
                : 'text-[#243B8A] font-medium'
            }`}
          >
            {availabilityLabel}
          </span>
        </div>

        {/* Sarvam Architectural Arch-Dome Pedestal for 3D Book Cover */}
        <div className="relative bg-gradient-to-b from-[#FFD966]/22 via-[#FFFDF7] to-[#F7F3E8] rounded-t-[92px] rounded-b-2xl pt-7 pb-5 px-4 mb-4 flex items-center justify-center border border-[#E6E1D6] overflow-hidden">
          {/* Minimal SVG Arch Hairline Frame Inside Pedestal */}
          <div className="pointer-events-none absolute inset-x-3.5 top-3 bottom-2 rounded-t-[80px] rounded-b-xl border border-[#243B8A]/12" />

          <div className="w-[78%] max-w-[172px] relative z-10">
            <BookCoverArt
              book={book}
              author={author}
              size="md"
              onClick={() => onSelectBook(book.slug)}
            />
          </div>
        </div>

        {/* Book Title & Author */}
        <div className="px-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="type-book-title text-[#252832] group-hover:text-[#243B8A] transition-colors">
              <button
                type="button"
                onClick={() => onSelectBook(book.slug)}
                className="text-left focus:outline-none"
              >
                {book.title}
              </button>
            </h3>
            <button
              type="button"
              onClick={() => onSelectBook(book.slug)}
              aria-label={book.title}
              className="p-1 text-[#525665] group-hover:text-[#243B8A] transition-colors shrink-0"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {author && (
            <div className="mt-0.5">
              {onSelectAuthor ? (
                <button
                  type="button"
                  onClick={() => onSelectAuthor(author.slug)}
                  className="text-[13px] font-medium text-[#525665] hover:text-[#243B8A] transition-colors text-left"
                >
                  {lang === 'mr'
                    ? author.name
                    : `${author.name} (${author.transliteratedName})`}
                </button>
              ) : (
                <span className="text-[13px] text-[#525665]">{author.name}</span>
              )}
            </div>
          )}

          <p className="mt-2 text-[13.5px] text-[#525665] line-clamp-2 leading-[1.6]">
            {book.description}
          </p>
        </div>
      </div>

      {/* Bottom Dock Bar inside Card */}
      <div className="mt-4 pt-3.5 border-t border-[#E6E1D6] flex items-center justify-between gap-2 px-1">
        <div>
          <span className="text-[19px] font-bold text-[#252832] tabular-nums">
            ₹{book.price}
          </span>
          <span className="block text-[11px] text-[#525665] truncate max-w-[105px]">
            {book.format.split('(')[0]}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {book.firstPageExcerptId && onOpenExcerpt && (
            <button
              type="button"
              onClick={() => onOpenExcerpt(book.firstPageExcerptId!)}
              className="p-2.5 rounded-xl text-[13px] font-medium text-[#252832] hover:text-[#243B8A] hover:bg-[#FFD966]/25 border border-[#E6E1D6] bg-[#FFFDF7] transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              title={t.book.readExcerpt}
              aria-label={`${t.book.readExcerpt} — ${book.title}`}
            >
              <BookOpen className="w-4 h-4 text-[#243B8A]" />
            </button>
          )}

          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => onAddToCart(book.id)}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              !isAvailable
                ? 'bg-[#F7F3E8] text-[#525665]/60 cursor-not-allowed'
                : justAdded
                ? 'bg-[#243B8A] text-[#FFFDF7]'
                : 'bg-[#EF6855] hover:bg-[#DE5542] text-[#FFFDF7]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4 text-[#FFD966]" />
                <span>{t.book.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isAvailable ? t.book.addToCart : t.book.outOfStock}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
};
