import React, { useState } from 'react';
import { ChevronRight, ChevronDown, X } from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  group?: string;
}

export interface BreadcrumbItem {
  label: string;
  tab?: string;
}

interface InnerPageLayoutProps {
  title: string;
  categoryTag?: string;
  subtitle?: string;
  breadcrumbPath: BreadcrumbItem[];
  sidebarItems: SidebarItem[];
  activeItem: string;
  onSelectSidebarItem: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
  children: React.ReactNode;
}

export const InnerPageLayout: React.FC<InnerPageLayoutProps> = ({
  title,
  categoryTag,
  subtitle,
  breadcrumbPath,
  sidebarItems,
  activeItem,
  onSelectSidebarItem,
  onNavigateTab,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeSidebarObject = sidebarItems.find(item => item.id === activeItem) || sidebarItems[0];

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 pb-16">
      
      {/* 1. Full-width Page Banner Header */}
      <div className="relative bg-gradient-to-r from-[#071931] via-[#0A2342] to-[#0D2E57] text-white shadow-md border-b-4 border-amber-500 overflow-hidden">
        {/* Background Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12 relative z-10 space-y-3">
          
          {/* Breadcrumb Area */}
          <nav className="flex items-center flex-wrap gap-1.5 text-xs text-slate-300 font-medium">
            {breadcrumbPath.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />}
                {item.tab && onNavigateTab ? (
                  <button
                    onClick={() => onNavigateTab(item.tab!)}
                    className="hover:text-amber-400 transition-colors underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className={idx === breadcrumbPath.length - 1 ? 'text-amber-400 font-bold' : ''}>
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Tag & Title */}
          <div className="space-y-1.5 max-w-4xl">
            {categoryTag && (
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/15 px-3 py-1 rounded-md border border-amber-400/30 inline-block">
                {categoryTag}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-white tracking-wide leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl pt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Content Container with Left Sidebar & Right Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-10">
        
        {/* Mobile Sidebar Selector Dropdown / Accordion */}
        <div className="lg:hidden mb-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quick Menu
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-2 bg-[#0A2342] text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
            >
              <span className="truncate max-w-[180px]">{activeSidebarObject?.label}</span>
              {mobileMenuOpen ? <X className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2">
              {Array.from(new Set(sidebarItems.map(item => item.group || ''))).map((groupName) => {
                const itemsInGroup = sidebarItems.filter(item => (item.group || '') === groupName);
                return (
                  <div key={groupName || 'default'} className="space-y-1">
                    {groupName && (
                      <div className="px-2 pt-1.5 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 rounded-md">
                        {groupName}
                      </div>
                    )}
                    {itemsInGroup.map((item) => {
                      const Icon = item.icon;
                      const isActive = item.id === activeItem;
                      return (
                        <button
                          key={item.id}
                          id={`mobile-sidebar-${item.id}`}
                          onClick={() => {
                            onSelectSidebarItem(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                            isActive
                              ? 'bg-[#0A2342] text-amber-400 shadow-sm'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />}
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              isActive ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Layout Grid: Desktop Sidebar Left + Main Content Right */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* LEFT SIDEBAR (Desktop) */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-4">
            <div className="bg-gradient-to-b from-[#0A2342] to-[#071931] text-white rounded-2xl border border-slate-800 shadow-md p-4 space-y-3">
              <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-widest text-amber-400 border-b border-blue-900/80 mb-2 pb-2.5 flex items-center justify-between">
                <span>Navigation Menu</span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              </div>

              <div className="space-y-3">
                {Array.from(new Set(sidebarItems.map(item => item.group || ''))).map((groupName) => {
                  const itemsInGroup = sidebarItems.filter(item => (item.group || '') === groupName);
                  return (
                    <div key={groupName || 'default'} className="space-y-1">
                      {groupName && (
                        <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-400/90 flex items-center gap-1.5 border-b border-blue-900/40 mb-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{groupName}</span>
                        </div>
                      )}
                      {itemsInGroup.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === activeItem;
                        return (
                          <button
                            key={item.id}
                            id={`sidebar-item-${item.id}`}
                            onClick={() => onSelectSidebarItem(item.id)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                              isActive
                                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md transform scale-[1.02]'
                                : 'text-slate-200 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-1">
                              {Icon && (
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400 group-hover:scale-110 transition-transform'}`} />
                              )}
                              <span className="truncate">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {item.badge && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                  isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                isActive ? 'text-slate-950 translate-x-0.5' : 'text-slate-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5'
                              }`} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Contact Helpline Box */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                Helpline Support
              </span>
              <p className="text-xs font-bold text-slate-900">
                Need Assistance?
              </p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Contact LSSCDT Admission & Academic Cell for instant assistance.
              </p>
              <div className="pt-1 text-xs font-mono font-bold text-[#0A2342]">
                📞 +91 07267 222333
              </div>
            </div>
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="flex-1 w-full min-w-0 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
              {children}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};
