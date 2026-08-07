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
    { id: 'departments', label: 'Departments' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'notices', label: 'Gallery' },
    { id: 'about', label: 'About' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

          {/* Right Admin Access Area (Website Sign In / Sign Up Removed) */}
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

      {/* Main Navbar - White */}
      <div className="bg-white py-3.5 px-4 sm:px-8 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {collegeInfo.logoImage ? (
              <img
                src={collegeInfo.logoImage}
                alt={collegeInfo.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain shrink-0 group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#0A2342] text-amber-400 flex items-center justify-center font-bold shadow shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#0A2342] leading-tight font-serif tracking-tight">
                Late Shaktikumar Sancheti
              </h1>
              <p className="text-xs sm:text-sm font-bold text-[#D97706] tracking-wide">
                College of Dairy Technology
              </p>
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-600 tracking-tight">
                Managed by {collegeInfo.trustName || 'Late. Madanlalji Kisanlalji Sancheti Seva Samiti, Malkapur'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3.5 py-1.5 text-xs lg:text-sm font-semibold rounded-md transition-colors ${
                    active
                      ? 'bg-slate-100 text-[#0A2342] font-bold'
                      : 'text-slate-700 hover:text-[#0A2342] hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Apply Now Button */}
            <button
              onClick={() => handleNavClick('admissions')}
              className="ml-2 bg-[#D97706] hover:bg-[#b86202] text-slate-950 font-bold px-4 py-2 rounded-md text-xs shadow transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>Apply Now</span>
            </button>
          </nav>

          {/* Mobile Toggle Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#0A2342]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 shadow-lg">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-slate-100 text-[#0A2342] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleNavClick('admissions')}
              className="w-full bg-[#D97706] hover:bg-[#b86202] text-slate-950 font-bold py-2.5 rounded-lg text-xs text-center shadow"
            >
              Apply Now
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
