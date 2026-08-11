import React, { useState, useMemo } from 'react';
import { Notice } from '../types';
import { FileText, Search, Calendar, FileDown, Eye, Bell, Filter } from 'lucide-react';
import { supabaseStorageService } from '../services/supabaseStorageService';

interface NewsProps {
  notices: Notice[];
  onSelectNotice: (notice: Notice) => void;
}

export const News: React.FC<NewsProps> = ({ notices, onSelectNotice }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Admission', 'Academic', 'Exam', 'Tender', 'General'];

  const filteredNotices = useMemo(() => {
    return (notices || []).filter((notice) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        notice.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        searchTerm === '' ||
        notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notice.category?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [notices, selectedCategory, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#071931] via-[#0A2342] to-[#071931] text-white p-8 sm:p-12 rounded-2xl shadow-lg border border-amber-500/30">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 inline-flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-400" /> Official Announcements & Updates
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            News & Official Notices
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Stay updated with the latest circulars, admission notifications, academic schedules, examination timetables, and official press releases from LSSCDT Malkapur.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search news, notices, circulars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-slate-900"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0A2342] text-amber-300 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notices List Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600" />
            All Official Bulletins & Circulars
          </h2>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {filteredNotices.length} {filteredNotices.length === 1 ? 'Notice' : 'Notices'}
          </span>
        </div>

        {filteredNotices.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No notices found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No official notices or announcements match your search criteria. Try clearing filters or searching for another term.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotices.map((n) => {
              const pdfUrl = n.attachment?.fileUrl || (n.attachment?.storagePath ? supabaseStorageService.getWebsiteDocumentUrl(n.attachment.storagePath) : undefined);

              return (
                <div
                  key={n.id}
                  className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-slate-50/80 -mx-3 px-3 rounded-xl transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {n.date}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900">
                        {n.category}
                      </span>
                      {n.isNew && (
                        <span className="text-[9px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                          NEW
                        </span>
                      )}
                      {n.attachment && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          📄 PDF Attached
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onSelectNotice(n)}
                      className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 cursor-pointer transition-colors leading-snug"
                    >
                      {n.title}
                    </h3>

                    {n.content && (
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {n.content}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
                        title="Download PDF attachment"
                      >
                        <FileDown className="w-3.5 h-3.5 text-red-600" />
                        <span className="hidden sm:inline">PDF</span>
                      </a>
                    )}
                    <button
                      onClick={() => onSelectNotice(n)}
                      className="bg-[#0A2342] hover:bg-[#D97706] text-white hover:text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
