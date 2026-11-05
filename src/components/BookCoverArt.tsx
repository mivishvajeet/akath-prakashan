import React from 'react';
import { BookRecord, AuthorRecord } from '../types/publishing';
import { resolvePublicAssetUrl } from '../utils/githubPagesAdapter';

export interface BookCoverArtProps {
  book: BookRecord;
  author?: AuthorRecord;
  authorName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const BookCoverArt: React.FC<BookCoverArtProps> = ({
  book,
  author,
  authorName,
  size = 'md',
  className = '',
  onClick,
}) => {
  const { coverStyle } = book;
  const resolvedAuthorName = author?.name || authorName || 'अकथ लेखक';
  const customCoverSrc = book.coverImageUrl || book.coverUploadMeta?.dataUrl;

  const containerPadding =
    size === 'sm'
      ? 'p-2.5 pl-3.5'
      : size === 'lg'
      ? 'p-5 sm:p-6 pl-6 sm:pl-7'
      : 'p-3.5 sm:p-4 pl-4 sm:pl-5';

  const titleSizeClass =
    size === 'sm'
      ? 'text-[11.5px] leading-[1.32] line-clamp-3'
      : size === 'lg'
      ? 'text-[19px] sm:text-[22px] leading-[1.34] line-clamp-4'
      : 'text-[14.5px] sm:text-[15.5px] leading-[1.36] line-clamp-3';

  const subtitleSizeClass =
    size === 'sm'
      ? 'hidden'
      : size === 'lg'
      ? 'text-[12.5px] leading-[1.45] line-clamp-2 mt-2'
      : 'text-[11px] leading-[1.4] line-clamp-2 mt-1.5';

  const content = (
    <div
      className={`relative aspect-[3/4] w-full select-none rounded-r-lg rounded-l-[3px] overflow-hidden transition-all duration-300 ${
        customCoverSrc ? 'p-0' : containerPadding
      } flex flex-col justify-between text-left shadow-[6px_12px_24px_-6px_rgba(18,19,22,0.26),0_2px_6px_-1px_rgba(18,19,22,0.12)] ${
        onClick
          ? 'cursor-pointer group-hover:-translate-y-1 group-hover:shadow-[10px_18px_32px_-6px_rgba(18,19,22,0.32)]'
          : ''
      } ${className}`}
      style={{
        backgroundColor: coverStyle.backgroundHex,
        color: coverStyle.textHex,
      }}
      role="img"
      aria-label={`${book.title} — ${resolvedAuthorName} या पुस्तकाचे मुखपृष्ठ`}
    >
      {/* Realistic 3D Hardcover Spine Hinge & Crease on Left */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-3.5 z-20"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(255,255,255,0.2) 36%, rgba(0,0,0,0.25) 72%, rgba(255,255,255,0.05) 100%)',
        }}
      />

      {/* Subtle Paper Page-Edge Highlight on Right */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[3px] z-20 opacity-60"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(245,240,230,0.85))',
        }}
      />

      {customCoverSrc ? (
        <img
          src={resolvePublicAssetUrl(customCoverSrc)}
          alt={`${book.title} — ${resolvedAuthorName}`}
          className="w-full h-full object-cover relative z-10"
        />
      ) : (
        <>
          {/* Subtle Top Lighting Sheen */}
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-20"
            style={{
              background:
                'radial-gradient(circle at 80% 15%, rgba(255,255,255,0.35) 0%, transparent 60%)',
            }}
          />

          {/* Archival Inner Hairline Frame */}
          <div
            className="pointer-events-none absolute inset-2 left-3.5 border opacity-35 rounded-xs"
            style={{ borderColor: coverStyle.accentHex }}
          />

          {/* Top Literary Series Header */}
          <div
            className="relative z-10 flex items-center justify-between border-b pb-1 opacity-90 gap-1"
            style={{ borderColor: `${coverStyle.accentHex}45` }}
          >
            <span className="text-[9.5px] font-medium truncate leading-tight">
              {coverStyle.emblemText}
            </span>
            <span
              className="h-1.5 w-1.5 rotate-45 shrink-0"
              style={{ backgroundColor: coverStyle.accentHex }}
            />
          </div>

          {/* Center Typographic Composition */}
          <div className="relative z-10 my-auto py-1.5 overflow-hidden">
            <div
              className="mb-2 h-[2px] w-7 rounded-full"
              style={{ backgroundColor: coverStyle.accentHex }}
            />
            <p className={`font-serif font-bold break-words ${titleSizeClass}`}>
              {book.title}
            </p>
            {book.subtitle && size !== 'sm' && (
              <p className={`font-normal opacity-85 ${subtitleSizeClass}`}>
                {book.subtitle}
              </p>
            )}
          </div>

          {/* Bottom Author & Publisher Colophon */}
          <div
            className="relative z-10 flex items-end justify-between border-t pt-1.5 gap-1.5"
            style={{ borderColor: `${coverStyle.accentHex}45` }}
          >
            <div className="min-w-0 flex-1">
              <p
                className={`font-serif font-semibold truncate ${
                  size === 'sm' ? 'text-[9.5px]' : 'text-[11px]'
                }`}
              >
                {resolvedAuthorName}
              </p>
            </div>
            {size !== 'sm' && (
              <div className="text-right shrink-0">
                <p
                  className="font-serif text-[10px] font-bold"
                  style={{ color: coverStyle.accentHex }}
                >
                  अकथ
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left focus:outline-none group"
      >
        {content}
      </button>
    );
  }

  return content;
};
