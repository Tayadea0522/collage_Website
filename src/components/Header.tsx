import React, { useState } from 'react';
import { CollegeInfo } from '../types';
import { 
  Phone, 
  Mail, 
  ShieldCheck, 
  Menu, 
  X, 
  GraduationCap, 
  Lock, 
  Award, 
  FileText, 
  Search, 
  Building2, 
  BookOpen, 
  Microscope, 
  UserCheck, 
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  collegeInfo: CollegeInfo;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  collegeInfo,
  currentTab,
  setCurrentTab,
  onOpenAdmin,
  isAdminLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'academics', label: 'Academics' },
    { id: 'departments', label: 'Departments' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'admissions', label: 'Online Admission 2026', highlight: true },
    { id: 'faculty', label: 'Faculty' },
    { id: 'placements', label: 'Placements & Research' },
    { id: 'notices', label: 'Notices & Gallery' },
    { id: 'contact', label: 'Contact Us' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="w-full shadow-md z-40 bg-white border-b border-slate-200 sticky top-0">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          {/* Left info */}
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <a href={`tel:${collegeInfo.admissionHelpline}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Helpline: <strong className="text-white">{collegeInfo.admissionHelpline}</strong></span>
            </a>
            <span className="hidden sm:inline text-slate-600">|</span>
            <a href={`mailto:${collegeInfo.email.split('/')[0].trim()}`} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{collegeInfo.email.split('/')[0].trim()}</span>
            </a>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Anti-Ragging Helpline: 1800-180-5522
            </span>
          </div>

          {/* Right Links & Admin Button */}
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded">
              ICAR Approved & MAFSU Affiliated
            </span>
            <button
              onClick={() => handleNavClick('admissions')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 shadow-sm"
            >
              <Sparkles className="w-3 h-3" /> Apply 2026-27
            </button>
            <button
              onClick={onOpenAdmin}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isAdminLoggedIn 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <Lock className="w-3 h-3 text-amber-400" />
              {isAdminLoggedIn ? 'Admin Panel (Logged In)' : 'Admin Portal'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-4 px-4 sm:px-8 border-b border-amber-500/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => handleNavClick('home')}>
            <div className="relative">
              {/* College Logo Emulation */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-500 to-blue-600 p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-900 rounded-full flex flex-col items-center justify-center text-center p-1 border border-white/20">
                  <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 mb-0.5" />
                  <span className="text-[8px] font-black tracking-tighter uppercase text-slate-200 leading-none">LSSCDT</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Est. {collegeInfo.establishedYear}
                </span>
                <span className="text-slate-300 text-xs hidden sm:inline">Code: LSSCDT</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-serif leading-tight group-hover:text-amber-200 transition-colors">
                {collegeInfo.name}
              </h1>
              <p className="text-xs sm:text-sm text-amber-300 font-medium mt-0.5">
                {collegeInfo.affiliation}
              </p>
              <p className="text-[11px] text-slate-300 hidden md:block">
                {collegeInfo.approval}
              </p>
            </div>
          </div>

          {/* Quick Badges / Accreditation */}
          <div className="hidden lg:flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-center px-3 border-r border-white/10">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-white">4-Yr B.Tech</div>
              <div className="text-[10px] text-slate-400">Dairy Technology</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <Building2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-white">50,000 LPD</div>
              <div className="text-[10px] text-slate-400">Dairy Plant</div>
            </div>
            <div className="text-center px-3">
              <UserCheck className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-white">100% Support</div>
              <div className="text-[10px] text-slate-400">In-Plant Training</div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-800 text-slate-200 hover:text-white rounded-lg border border-slate-700"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="hidden md:block bg-slate-900 text-white shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center space-x-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    item.highlight
                      ? active
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                        : 'bg-amber-400/90 text-slate-950 hover:bg-amber-400 font-bold animate-pulse'
                      : active
                      ? 'bg-blue-700 text-white font-bold shadow-sm'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-amber-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-white border-t border-slate-800 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-between ${
                  item.highlight
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : active
                    ? 'bg-blue-700 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.highlight && <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">Apply</span>}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Admin Helpline: {collegeInfo.phone}</span>
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="text-amber-400 font-bold underline"
            >
              Admin Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
