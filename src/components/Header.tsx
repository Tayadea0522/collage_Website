import React, { useState } from 'react';
import { CollegeInfo } from '../types';
import { 
  Phone, 
  Mail, 
  Menu, 
  X, 
  GraduationCap, 
  Lock, 
  Sparkles,
  User,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  collegeInfo: CollegeInfo;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  currentAdminName?: string;
  onLogoutAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  collegeInfo,
  currentTab,
  setCurrentTab,
  onOpenAdmin,
  isAdminLoggedIn,
  currentAdminName = 'Administrator',
  onLogoutAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'academics', label: 'Academics' },
    { id: 'faculties', label: 'Faculties' },
    { id: 'departments', label: 'Departments' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'notices', label: 'Gallery' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const leftLogoUrl = collegeInfo.leftLogoImage || collegeInfo.logoImage || '/logo.svg';
  const rightLogoUrl = collegeInfo.rightLogoImage || '/logo.svg';

  const mainName = collegeInfo.name?.includes('College of Dairy Technology')
    ? collegeInfo.name.replace('College of Dairy Technology', '').trim()
    : (collegeInfo.name || 'Late Shaktikumar Sancheti');

  const locationCity = collegeInfo.location ? collegeInfo.location.split(',')[0].trim() : 'Malkapur';
  const collegeSubName = `College of Dairy Technology, ${locationCity}`;

  return (
    <header className="w-full shadow-sm z-50 bg-white sticky top-0 border-b border-slate-200 font-sans">
      
      {/* Top Bar - Deep Navy (#071931) */}
      <div className="bg-[#071931] text-white text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          
          {/* Left Contact Info */}
          <div className="flex items-center gap-6 text-slate-200">
            <a href={`tel:${collegeInfo.admissionHelpline}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>+{collegeInfo.admissionHelpline.replace(/[^0-9]/g, '') || '918625869560'}</span>
            </a>
            <a href={`mailto:${collegeInfo.email.split('/')[0].trim()}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{collegeInfo.email.split('/')[0].trim()}</span>
            </a>
          </div>

          {/* Right Admin Access Area */}
          <div className="flex items-center gap-4 text-xs">
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Welcome, {currentAdminName}
                </span>
                <button
                  onClick={onOpenAdmin}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-0.5 rounded text-[11px] shadow-sm"
                >
                  Admin Portal
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="text-slate-300 hover:text-red-300 flex items-center gap-1 text-[11px] transition-colors"
                >
                  <LogOut className="w-3 h-3" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenAdmin}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-3 py-1 rounded-md border border-amber-400/30 hover:text-amber-200 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Login</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Header Banner - Three Column Layout (Left Logo | College Details | Right Logo) */}
      <div className="bg-white py-3.5 px-4 sm:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          {/* Desktop & Tablet Layout (3 Columns) */}
          <div className="hidden md:flex items-center justify-between gap-4 lg:gap-8">
            
            {/* LEFT LOGO */}
            <div 
              onClick={() => handleNavClick('home')}
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-start shrink-0 cursor-pointer group"
              title="Return to Home"
            >
              {leftLogoUrl ? (
                <img
                  src={leftLogoUrl}
                  alt="College Left Logo"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#0A2342] text-amber-400 flex items-center justify-center font-bold shadow group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* CENTER COLLEGE DETAILS */}
            <div className="flex-1 text-center space-y-1 sm:space-y-1.5 px-2">
              {/* 1. FIRST LINE - MAIN NAME */}
              <h1 
                onClick={() => handleNavClick('home')}
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0A2342] leading-tight font-serif tracking-tight cursor-pointer hover:text-[#06172d] transition-colors"
              >
                {mainName}
              </h1>

              {/* 2. SECOND LINE - COLLEGE NAME */}
              <h2 
                onClick={() => handleNavClick('home')}
                className="text-lg sm:text-xl lg:text-2xl font-bold text-[#D97706] tracking-wide font-serif cursor-pointer hover:text-amber-700 transition-colors"
              >
                {collegeSubName}
              </h2>

              {/* 3. THIRD SECTION - MANAGEMENT INFORMATION */}
              <p className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight leading-snug max-w-3xl mx-auto pt-0.5">
                Managed by {collegeInfo.trustName || 'Late. Madanlalji - Kisanlalji Sancheti Seva Samiti, Malkapur'}
              </p>



              {/* 5. FIFTH SECTION - AFFILIATION */}
              {collegeInfo.affiliation && (
                <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium leading-tight max-w-3xl mx-auto pt-0.5">
                  {collegeInfo.affiliation}
                </p>
              )}

              {/* 6. SIXTH SECTION - APPROVAL */}
              {collegeInfo.approval && (
                <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium leading-tight max-w-3xl mx-auto">
                  {collegeInfo.approval}
                </p>
              )}
            </div>

            {/* RIGHT LOGO */}
            <div 
              onClick={() => handleNavClick('home')}
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-end shrink-0 cursor-pointer group"
              title="Return to Home"
            >
              {rightLogoUrl ? (
                <img
                  src={rightLogoUrl}
                  alt="College Right Logo"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#0A2342] text-amber-400 flex items-center justify-center font-bold shadow group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-8 h-8" />
                </div>
              )}
            </div>

          </div>

          {/* Mobile Responsive Layout */}
          <div className="md:hidden flex flex-col items-center gap-3.5 py-1">
            <div className="flex items-center justify-between w-full px-1">
              <div onClick={() => handleNavClick('home')} className="cursor-pointer">
                <img
                  src={leftLogoUrl}
                  alt="Left Logo"
                  referrerPolicy="no-referrer"
                  className="h-14 w-auto max-w-[110px] object-contain"
                />
              </div>
              <div onClick={() => handleNavClick('home')} className="cursor-pointer">
                <img
                  src={rightLogoUrl}
                  alt="Right Logo"
                  referrerPolicy="no-referrer"
                  className="h-14 w-auto max-w-[110px] object-contain"
                />
              </div>
            </div>

            <div className="text-center space-y-1 px-1">
              {/* 1. FIRST LINE - MAIN NAME */}
              <h1 
                onClick={() => handleNavClick('home')}
                className="text-base font-extrabold text-[#0A2342] leading-tight font-serif cursor-pointer"
              >
                {mainName}
              </h1>

              {/* 2. SECOND LINE - COLLEGE NAME */}
              <h2 
                onClick={() => handleNavClick('home')}
                className="text-xs font-bold text-[#D97706] tracking-wide font-serif cursor-pointer"
              >
                {collegeSubName}
              </h2>

              {/* 3. THIRD SECTION - MANAGEMENT INFORMATION */}
              <p className="text-[10px] font-semibold text-slate-700 leading-tight">
                Managed by {collegeInfo.trustName || 'Late. Madanlalji - Kisanlalji Sancheti Seva Samiti, Malkapur'}
              </p>



              {/* 5. FIFTH SECTION - AFFILIATION */}
              {collegeInfo.affiliation && (
                <p className="text-[9px] text-slate-600 font-medium leading-tight pt-0.5">
                  {collegeInfo.affiliation}
                </p>
              )}

              {/* 6. SIXTH SECTION - APPROVAL */}
              {collegeInfo.approval && (
                <p className="text-[9px] text-slate-600 font-medium leading-tight">
                  {collegeInfo.approval}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Primary Navigation Menu Bar (Deep Navy #0A2342) */}
      <div className="bg-[#0A2342] text-white py-1.5 px-4 sm:px-8 border-t border-amber-500/20 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 overflow-x-auto py-0.5">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 text-xs lg:text-sm font-semibold rounded-md transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Apply Now CTA Button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => handleNavClick('admissions')}
              className="bg-[#D97706] hover:bg-amber-600 text-slate-950 font-bold px-4 py-1.5 rounded-md text-xs shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Apply Now</span>
            </button>
          </div>

          {/* Mobile Header Menu Toggle */}
          <div className="md:hidden flex items-center justify-between w-full py-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {navItems.find(n => n.id === currentTab)?.label || 'Navigation'}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-amber-300 hover:text-white rounded bg-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#071931] border-t border-slate-700 px-4 py-3 space-y-2 shadow-xl">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-700">
            <button
              onClick={() => handleNavClick('admissions')}
              className="w-full bg-[#D97706] hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs text-center shadow"
            >
              Apply Now
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
