import React, { useState, useEffect, memo } from 'react';
import { BookRecord, AuthorRecord } from '../types/publishing';
import { resolvePublicAssetUrl } from '../utils/githubPagesAdapter';

export interface BookCoverArtProps {
  book: BookRecord;
  author?: AuthorRecord;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showSpine?: boolean;
  interactive?: boolean;
  priority?: boolean;
  sizes?: string;
}

interface ResponsiveCoverSources {
  avifSrcSet: string;
  webpSrcSet: string;
  jpgSrcSet: string;
  defaultSrc: string;
}

const KNOWN_RESPONSIVE_COVERS: Record<string, string> = {
  '/assets/aistudio/scholar-juice-cover.jpg': '/assets/aistudio/scholar-juice-cover',
  '/assets/aistudio/book2_b40a45e1.jpeg': '/assets/aistudio/book2_b40a45e1',
  '/assets/aistudio/lokshahi-cover.jpg': '/assets/aistudio/lokshahi-cover',
};

function getResponsiveCoverSources(rawSrc: string): ResponsiveCoverSources | null {
  const cleanPath = rawSrc.split('?')[0];
  const basePrefix = KNOWN_RESPONSIVE_COVERS[cleanPath];
  if (!basePrefix) return null;

  const resolvedPrefix = resolvePublicAssetUrl(basePrefix);
  return {
    avifSrcSet: `${resolvedPrefix}-320w.avif 320w, ${resolvedPrefix}-640w.avif 640w, ${resolvedPrefix}-960w.avif 960w`,
    webpSrcSet: `${resolvedPrefix}-320w.webp 320w, ${resolvedPrefix}-640w.webp 640w, ${resolvedPrefix}-960w.webp 960w`,
    jpgSrcSet: `${resolvedPrefix}-320w.jpg 320w, ${resolvedPrefix}-640w.jpg 640w, ${resolvedPrefix}-960w.jpg 960w`,
    defaultSrc: `${resolvedPrefix}-640w.jpg`,
  };
}

const BookCoverArtInner: React.FC<BookCoverArtProps> = ({
  book,
  author,
  className = '',
  size = 'md',
  onClick,
  showSpine = true,
  interactive = true,
  priority = false,
  sizes,
}) => {
  const style = book.coverStyle || {
    backgroundHex: '#241B15',
    accentHex: '#C5A059',
    textHex: '#F6F1E7',
    borderPattern: 'classic_frame' as const,
    emblemText: 'अकथ',
  };
  const customCoverSrc = book.coverImageUrl || book.coverUploadMeta?.dataUrl;
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    setImgLoaded(false);
  }, [customCoverSrc]);

  const defaultSizes =
    sizes ||
    (size === 'sm'
      ? '(max-width: 640px) 110px, 140px'
      : size === 'lg' || size === 'xl'
        ? '(max-width: 640px) 180px, (max-width: 1024px) 240px, 320px'
        : '(max-width: 640px) 140px, (max-width: 1024px) 190px, 240px');

  const sizeClasses = {
    sm: {
      title: 'text-sm leading-tight',
      subtitle: 'text-[8px]',
      author: 'text-[9px]',
      imprint: 'text-[7px]',
      padding: 'p-3',
      borderOffset: 'inset-1.5',
    },
    md: {
      title: 'text-xl leading-snug',
      subtitle: 'text-[10px]',
      author: 'text-xs',
      imprint: 'text-[8px]',
      padding: 'p-5',
      borderOffset: 'inset-2.5',
    },
    lg: {
      title: 'text-2xl sm:text-3xl leading-snug',
      subtitle: 'text-xs',
      author: 'text-sm',
      imprint: 'text-[9px]',
      padding: 'p-6 sm:p-7',
      borderOffset: 'inset-3',
    },
    xl: {
      title: 'text-3xl sm:text-4xl leading-tight',
      subtitle: 'text-xs sm:text-sm',
      author: 'text-base',
      imprint: 'text-[10px]',
      padding: 'p-8 sm:p-10',
      borderOffset: 'inset-4',
    },
  }[size];

  const authorDisplayName = author?.name || 'अकथ प्रकाशन';

  // If the book has a custom uploaded cover image or realistic cover URL and it hasn't errored, render it with hardcover spine & paper texture
  if (customCoverSrc && !imgFailed) {
    const resolvedSrc = resolvePublicAssetUrl(customCoverSrc);
    const responsiveSources = getResponsiveCoverSources(customCoverSrc);

    return (
      <div
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={`relative aspect-[3/4] select-none overflow-hidden rounded-r-sm transition-transform duration-300 ${
          onClick ? 'cursor-pointer' : ''
        } ${
          interactive ? 'group-hover:-translate-y-1' : ''
        } ${className}`}
        style={{
          backgroundColor: style.backgroundHex || '#241B15',
          boxShadow:
            '0 20px 40px -15px rgba(20, 15, 10, 0.38), 0 4px 12px -2px rgba(20, 15, 10, 0.22)',
        }}
      >
        {/* Warm Editorial Placeholder while loading */}
        {!imgLoaded && (
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-gradient-to-br from-[#2B2119] via-[#3A2D22] to-[#1F1712]"
          />
        )}

        {/* Hardcover Spine Crease & Hinge Shadow */}
        {showSpine && (
          <>
            <div
              className="absolute inset-y-0 left-0 w-3.5 z-20 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,0,0,0.48) 0%, rgba(255,255,255,0.18) 28%, rgba(0,0,0,0.32) 65%, rgba(255,255,255,0.08) 85%, transparent 100%)',
              }}
            />
            <div className="absolute inset-y-0 left-3.5 w-[1px] bg-black/25 z-20 pointer-events-none" />
          </>
        )}

        {responsiveSources ? (
          <picture className="block w-full h-full relative z-10">
            <source
              type="image/avif"
              srcSet={responsiveSources.avifSrcSet}
              sizes={defaultSizes}
            />
            <source
              type="image/webp"
              srcSet={responsiveSources.webpSrcSet}
              sizes={defaultSizes}
            />
            <img
              src={responsiveSources.defaultSrc}
              srcSet={responsiveSources.jpgSrcSet}
              sizes={defaultSizes}
              alt={`${book.title} — ${book.transliteratedTitle} (${authorDisplayName})`}
              width={600}
              height={800}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding={priority ? 'sync' : 'async'}
              referrerPolicy="no-referrer"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgFailed(true)}
              className={`w-full h-full object-cover relative z-10 transition-opacity duration-300 ${
                imgLoaded ? 'opacity-100' : 'opacity-95'
              }`}
            />
          </picture>
        ) : (
          <img
            src={resolvedSrc}
            alt={`${book.title} — ${book.transliteratedTitle} (${authorDisplayName})`}
            width={600}
            height={800}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgFailed(true)}
            className={`w-full h-full object-cover relative z-10 transition-opacity duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-95'
            }`}
          />
        )}

        {/* Matte paper sheen overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background:
              'linear-gradient(125deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 42%, rgba(0,0,0,0.18) 100%)',
          }}
        />
        <div className="absolute inset-y-1 right-0 w-1 bg-gradient-to-l from-[#E8DFD1]/30 to-transparent pointer-events-none z-20" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`relative aspect-[3/4] select-none overflow-hidden rounded-r-sm transition-transform duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${interactive ? 'group-hover:-translate-y-1' : ''} ${className}`}
      style={{
        background: style.backgroundHex,
        color: style.textHex,
        boxShadow:
          '0 20px 40px -15px rgba(20, 15, 10, 0.35), 0 4px 12px -2px rgba(20, 15, 10, 0.2)',
      }}
    >
      {/* Hardcover Spine Crease & Hinge Shadow */}
      {showSpine && (
        <>
          <div
            className="absolute inset-y-0 left-0 w-3.5 z-20 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.12) 25%, rgba(0,0,0,0.28) 65%, rgba(255,255,255,0.06) 85%, transparent 100%)',
            }}
          />
          <div className="absolute inset-y-0 left-3.5 w-[1px] bg-black/20 z-20 pointer-events-none" />
        </>
      )}

      {/* Inner Editorial Frame */}
      <div
        className={`absolute ${sizeClasses.borderOffset} pointer-events-none z-10 flex flex-col justify-between`}
        style={{
          border: `1px solid ${style.accentHex}40`,
        }}
      >
        <div className="flex justify-between p-1">
          <span
            className="w-1.5 h-1.5 border-t border-l"
            style={{ borderColor: style.accentHex }}
          />
          <span
            className="w-1.5 h-1.5 border-t border-r"
            style={{ borderColor: style.accentHex }}
          />
        </div>
        <div className="flex justify-between p-1">
          <span
            className="w-1.5 h-1.5 border-b border-l"
            style={{ borderColor: style.accentHex }}
          />
          <span
            className="w-1.5 h-1.5 border-b border-r"
            style={{ borderColor: style.accentHex }}
          />
        </div>
      </div>

      {/* Content Layout */}
      <div
        className={`relative z-10 h-full flex flex-col justify-between ${sizeClasses.padding} pl-6`}
      >
        <div className="text-center pt-1">
          <div
            className={`uppercase tracking-[0.25em] font-sans font-medium opacity-80 ${sizeClasses.subtitle}`}
            style={{ color: style.accentHex }}
          >
            {book.category}
          </div>
          <div
            className="w-6 h-[1px] mx-auto mt-1.5 opacity-50"
            style={{ backgroundColor: style.accentHex }}
          />
        </div>

        <div className="my-auto text-center py-2">
          <div className={`font-serif font-bold tracking-normal ${sizeClasses.title}`}>
            {book.title}
          </div>
          {size !== 'sm' && book.subtitle && (
            <p
              className={`mt-2 font-serif opacity-75 line-clamp-2 ${sizeClasses.subtitle}`}
              style={{ color: style.textHex }}
            >
              {book.subtitle}
            </p>
          )}
        </div>

        <div className="text-center pb-0.5">
          <div
            className="w-8 h-[1px] mx-auto mb-2 opacity-40"
            style={{ backgroundColor: style.accentHex }}
          />
          <p className={`font-serif font-medium tracking-wide ${sizeClasses.author}`}>
            {authorDisplayName}
          </p>
          <p
            className={`mt-1.5 uppercase tracking-[0.3em] font-sans opacity-60 ${sizeClasses.imprint}`}
            style={{ color: style.accentHex }}
          >
            {style.emblemText || 'अकथ प्रकाशन'}
          </p>
        </div>
      </div>

      {/* Page Edge Effect on Right */}
      <div className="absolute inset-y-1 right-0 w-1 bg-gradient-to-l from-[#E8DFD1]/40 to-transparent pointer-events-none z-20" />
    </div>
  );
};

export const BookCoverArt = memo(BookCoverArtInner);
