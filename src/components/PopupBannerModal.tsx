import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { PopupBanner } from '../types';

interface PopupBannerModalProps {
  popup: PopupBanner | null;
  isOpen: boolean;
  onClose: () => void;
  isPreview?: boolean;
}

export const PopupBannerModal: React.FC<PopupBannerModalProps> = ({
  popup,
  isOpen,
  onClose,
  isPreview = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [popup?.imageUrl, isOpen]);

  if (!isOpen || !popup) return null;

  // Don't display if disabled (unless in admin preview mode)
  if (!isPreview && !popup.isActive) return null;

  const handleActionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!popup.buttonUrl) return;

    // Handle hash links (e.g. #admissions, #contact)
    if (popup.buttonUrl.startsWith('#')) {
      e.preventDefault();
      onClose();
      const element = document.querySelector(popup.buttonUrl);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // External or document links - close modal first
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full flex flex-col my-auto max-h-[calc(100vh-2rem)] text-slate-800 animate-scaleUp overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close popup"
          className="absolute top-3 right-3 z-30 bg-slate-900/70 hover:bg-slate-900/90 text-white rounded-full p-2 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Preview Badge */}
        {isPreview && (
          <div className="absolute top-3 left-3 z-30 bg-amber-500 text-slate-900 font-bold px-3 py-1 rounded-full text-xs shadow-md border border-amber-300 flex items-center gap-1">
            <span>ADMIN PREVIEW MODE</span>
          </div>
        )}

        {/* Banner Image - Pure block flow with natural aspect ratio driving height */}
        {popup.imageUrl && !imageError ? (
          <div className="relative w-full bg-slate-50 shrink-0">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 z-10 py-12">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
              </div>
            )}
            <img
              src={popup.imageUrl}
              alt={popup.title || 'Announcement'}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              className={`w-full h-auto block transition-opacity duration-300 ${
                imageLoading ? 'opacity-0 min-h-[120px]' : 'opacity-100'
              }`}
            />
          </div>
        ) : (
          /* Subtle Header Banner when no image or image failed */
          <div className="w-full bg-[#0A2342] text-amber-400 p-6 pt-10 text-center border-b border-amber-500/20 shrink-0">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 mb-2">
              <ImageIcon className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300/80">College Announcement</p>
          </div>
        )}

        {/* Content Section */}
        <div className="p-5 sm:p-7 flex-1 space-y-3 sm:space-y-4">
          {popup.title && (
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#0A2342] leading-tight">
              {popup.title}
            </h3>
          )}

          {popup.description && (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
              {popup.description}
            </p>
          )}

          {/* Action Button */}
          {popup.buttonText && popup.buttonUrl && (
            <div className="pt-2">
              <a
                href={popup.buttonUrl}
                onClick={handleActionClick}
                target={popup.buttonUrl.startsWith('http') ? '_blank' : '_self'}
                rel={popup.buttonUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl bg-[#0A2342] text-amber-400 hover:bg-[#081c35] hover:text-amber-300 font-bold text-sm sm:text-base transition-all shadow-lg shadow-navy-900/20 text-center"
              >
                <span>{popup.buttonText}</span>
                {popup.buttonUrl.startsWith('http') ? (
                  <ExternalLink className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="bg-slate-50 border-t border-slate-100 px-5 sm:px-6 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-medium text-[#0A2342]">Late Shaktikumar Sancheti College of Dairy Technology</span>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 underline font-medium ml-2"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
