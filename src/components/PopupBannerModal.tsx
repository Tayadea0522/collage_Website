import React from 'react';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-w-lg sm:max-w-xl w-full flex flex-col my-auto max-h-[90vh] text-slate-800 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close popup"
          className="absolute top-3 right-3 z-30 bg-slate-900/60 hover:bg-slate-900/90 text-white rounded-full p-2 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Preview Badge */}
        {isPreview && (
          <div className="absolute top-3 left-3 z-30 bg-amber-500 text-slate-900 font-bold px-3 py-1 rounded-full text-xs shadow-md border border-amber-300 flex items-center gap-1">
            <span>ADMIN PREVIEW MODE</span>
          </div>
        )}

        {/* Banner Image */}
        {popup.imageUrl && (
          <div className="relative w-full bg-slate-900 max-h-64 sm:max-h-80 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={popup.imageUrl}
              alt={popup.title || 'Announcement'}
              className="w-full h-full object-cover max-h-64 sm:max-h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 sm:p-7 flex-1 overflow-y-auto space-y-4">
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
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-[#0A2342]">Late Shaktikumar Sancheti College of Dairy Technology</span>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
