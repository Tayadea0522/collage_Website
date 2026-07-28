import React from 'react';
import { Notice } from '../types';
import { Bell, ChevronRight, Sparkles } from 'lucide-react';

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
  const activeNotices = notices.slice(0, 5);

  return (
    <div className="bg-amber-500 text-slate-950 font-medium text-xs sm:text-sm py-2 px-4 sm:px-8 border-b border-amber-600 shadow-sm flex items-center gap-3 overflow-hidden">
      {/* Label */}
      <div className="flex items-center gap-1.5 bg-slate-900 text-amber-300 font-bold px-3 py-1 rounded-full shrink-0 text-xs shadow">
        <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
        <span className="uppercase tracking-wider">Latest Alerts</span>
      </div>

      {/* Marquee or List */}
      <div className="flex-1 overflow-x-auto no-scrollbar whitespace-nowrap flex items-center space-x-6">
        {activeNotices.map((notice) => (
          <button
            key={notice.id}
            onClick={() => onSelectNotice(notice)}
            className="inline-flex items-center gap-2 hover:underline hover:text-slate-900 text-slate-950 font-semibold cursor-pointer shrink-0"
          >
            {notice.isNew && (
              <span className="bg-red-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                NEW
              </span>
            )}
            <span className="text-slate-900 font-bold">[{notice.category}]</span>
            <span>{notice.title}</span>
            <span className="text-slate-800 text-xs font-mono">({notice.date})</span>
          </button>
        ))}
      </div>

      {/* View All button */}
      <button
        onClick={onViewAllNotices}
        className="shrink-0 flex items-center gap-1 text-xs font-extrabold text-slate-900 hover:text-white bg-amber-400 hover:bg-slate-900 px-2.5 py-1 rounded transition-colors shadow-sm"
      >
        <span>All Circulars</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
