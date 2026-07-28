import React from 'react';
import { Notice } from '../types';
import { Bell, ChevronRight } from 'lucide-react';

interface NoticeTickerProps {
  notices: Notice[];
  onSelectNotice: (notice: Notice) => void;
  onViewAllNotices: () => void;
}

export const NoticeTicker: React.FC<NoticeTickerProps> = ({
  notices,
  onSelectNotice,
  onViewAllNotices
}) => {
  const activeNotices = (notices || []).slice(0, 8);
  const MarqueeTag = 'marquee' as any;

  return (
    <div className="bg-[#0A2342] text-white text-xs sm:text-sm py-2.5 px-4 sm:px-8 border-b border-blue-900/60 shadow-sm flex items-center gap-3 overflow-hidden font-sans">
      
      {/* Fixed Label */}
      <div className="flex items-center gap-1.5 bg-[#D97706] text-slate-950 font-extrabold px-3 py-1 rounded-full shrink-0 text-xs shadow z-10">
        <Bell className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
        <span className="uppercase tracking-wider">Latest Alerts</span>
      </div>

      {/* Marquee Ticker Container */}
      <div className="flex-1 overflow-hidden relative">
        <MarqueeTag
          scrollamount="6"
          scrolldelay="10"
          direction="left"
          onMouseOver={(e: any) => e.currentTarget.stop()}
          onMouseOut={(e: any) => e.currentTarget.start()}
          className="cursor-pointer flex items-center space-x-8"
        >
          {activeNotices.map((notice) => (
            <button
              key={notice.id}
              onClick={() => onSelectNotice(notice)}
              className="inline-flex items-center gap-2 hover:underline hover:text-amber-300 text-slate-100 font-medium mr-8 transition-colors"
            >
              {notice.isNew && (
                <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  NEW
                </span>
              )}
              <span className="text-amber-400 font-bold">[{notice.category}]</span>
              <span>{notice.title}</span>
              <span className="text-slate-300 text-xs font-mono">({notice.date})</span>
              <span className="text-slate-500 ml-4">•</span>
            </button>
          ))}
        </MarqueeTag>
      </div>

      {/* View All Button */}
      <button
        onClick={onViewAllNotices}
        className="shrink-0 flex items-center gap-1 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3 py-1 rounded transition-colors shadow-sm z-10"
      >
        <span>All Circulars</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

    </div>
  );
};
