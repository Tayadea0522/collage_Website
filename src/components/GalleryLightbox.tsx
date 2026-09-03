import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  ExternalLink, 
  Loader2, 
  Calendar, 
  Tag, 
  Sparkles 
} from 'lucide-react';
import { GalleryItem } from '../types';
import { getOriginalImageUrl } from '../utils/imageUtils';

interface GalleryLightboxProps {
  isOpen: boolean;
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  isOpen,
  items,
  currentIndex,
  onClose,
  onNavigate
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const currentItem = items[currentIndex];
  const hasMultiple = items.length > 1;

  // Navigate to previous image
  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    setIsLoading(true);
    setImageDimensions(null);
    const prevIndex = (currentIndex - 1 + items.length) % items.length;
    onNavigate(prevIndex);
  }, [currentIndex, hasMultiple, items.length, onNavigate]);

  // Navigate to next image
  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    setIsLoading(true);
    setImageDimensions(null);
    const nextIndex = (currentIndex + 1) % items.length;
    onNavigate(nextIndex);
  }, [currentIndex, hasMultiple, items.length, onNavigate]);

  // Reset loading state when currentIndex changes
  useEffect(() => {
    setIsLoading(true);
    setImageDimensions(null);
  }, [currentIndex]);

  // Keyboard navigation (ESC to close, Left/Right arrows to navigate)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock scroll on background body
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  // Touch handlers for mobile swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Only register as horizontal swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Close when clicking directly on backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !currentItem) return null;

  const originalUrl = getOriginalImageUrl(currentItem.image);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.title || 'Gallery image fullscreen viewer'}
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Lightbox Top Header Bar */}
      <div 
        className="w-full px-4 sm:px-6 py-3 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-transparent flex items-center justify-between text-white z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {currentItem.category && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
              <Tag className="w-3 h-3" />
              {currentItem.category}
            </span>
          )}

          {currentItem.date && (
            <span className="text-slate-400 text-xs hidden md:flex items-center gap-1 shrink-0 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {currentItem.date}
            </span>
          )}

          <span className="text-xs text-slate-300 font-mono bg-slate-900/80 px-2.5 py-0.5 rounded-md border border-slate-800 shrink-0">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Keyboard Hint on desktop */}
          <span className="text-[11px] text-slate-400 font-mono hidden lg:inline mr-2">
            Use <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700">←</kbd> <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700">→</kbd> to browse &bull; <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700">ESC</kbd> to exit
          </span>

          {/* Open original image in new tab */}
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Open Original Image in New Tab"
          >
            <ExternalLink className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Original Size</span>
          </a>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            className="p-2 sm:p-2 rounded-xl bg-slate-900/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-colors flex items-center justify-center shadow-xs min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Lightbox Center Canvas (Image Display Area) */}
      <div 
        className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden"
        onClick={handleBackdropClick}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none text-slate-300">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="text-xs font-medium text-slate-400">Loading original high-res image...</span>
          </div>
        )}

        {/* Previous Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous Image"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-700/80 shadow-2xl backdrop-blur-sm transition-all duration-200 hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Previous image (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next Image"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-3.5 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 border border-slate-700/80 shadow-2xl backdrop-blur-sm transition-all duration-200 hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Next image (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* The Original Full-Resolution Image:
            - Preserves ORIGINAL aspect ratio strictly
            - No cropping, stretching, or distortion
            - Fits within available viewport with object-fit: contain
            - Scales down proportionally if larger than screen
            - If smaller than viewport, does not unnecessarily enlarge
        */}
        <div 
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={originalUrl}
            src={originalUrl}
            alt={currentItem.title}
            onLoad={(e) => {
              setIsLoading(false);
              const img = e.currentTarget;
              setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
            }}
            onError={() => {
              setIsLoading(false);
            }}
            className={`max-w-full max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-130px)] w-auto h-auto object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            style={{
              maxWidth: imageDimensions ? `${imageDimensions.width}px` : '100%',
              maxHeight: imageDimensions ? `min(${imageDimensions.height}px, calc(100vh - 140px))` : undefined,
              aspectRatio: imageDimensions ? `${imageDimensions.width} / ${imageDimensions.height}` : 'auto'
            }}
          />
        </div>
      </div>

      {/* 3. Lightbox Bottom Caption & Meta Footer */}
      <div 
        className="w-full px-4 sm:px-8 py-3.5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent text-white z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-baseline justify-between gap-2 text-center sm:text-left">
          <div className="space-y-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold font-serif text-white tracking-wide">
              {currentItem.title}
            </h3>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 flex-wrap">
              <span>Category: <strong className="text-amber-300 font-semibold">{currentItem.category}</strong></span>
              {currentItem.date && <span>&bull; Date: {currentItem.date}</span>}
              {imageDimensions && (
                <span className="text-slate-400 font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {imageDimensions.width} × {imageDimensions.height} px (Original Resolution)
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-mono shrink-0">
            Photo {currentIndex + 1} of {items.length}
          </div>
        </div>
      </div>
    </div>
  );
};
