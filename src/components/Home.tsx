import React, { useState, useEffect } from 'react';
import { CollegeInfo, Notice, DepartmentInfo, Facility, CollegeEvent } from '../types';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Sparkles,
  FileText,
  UserCheck,
  Building2,
  Microscope,
  Briefcase,
  Users
} from 'lucide-react';

interface HomeProps {
  collegeInfo: CollegeInfo;
  notices: Notice[];
  events: CollegeEvent[];
  departments: DepartmentInfo[];
  facilities: Facility[];
  onNavigate: (tab: string) => void;
  onSelectNotice: (notice: Notice) => void;
}

export const Home: React.FC<HomeProps> = ({
  collegeInfo,
  notices,
  events,
  onNavigate,
  onSelectNotice
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = collegeInfo?.heroBanners || [];

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  return (
    <div className="space-y-12 pb-16 bg-white font-sans text-slate-800">
      
      {/* 1. Hero Image Slider (Image 2 style) */}
      <section className="relative w-full bg-slate-900 text-white overflow-hidden min-h-[380px] sm:min-h-[480px] flex items-center">
        {banners.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* College Building Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/50 to-transparent" />

            {/* Slide Text Overlay */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 h-full flex flex-col justify-center py-12">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D97706]/90 text-slate-950 rounded font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Late Shaktikumar Sancheti College of Dairy Technology</span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif text-white leading-tight drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed drop-shadow">
                  {slide.subtitle}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onNavigate('admissions')}
                    className="bg-[#D97706] hover:bg-[#b86202] text-slate-950 font-bold px-6 py-2.5 rounded-md text-sm transition-colors shadow-md flex items-center gap-2"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('academics')}
                    className="bg-[#0A2342]/90 hover:bg-[#0A2342] text-white font-semibold px-6 py-2.5 rounded-md text-sm border border-white/20 transition-colors"
                  >
                    Explore Programs
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-950/40 text-white hover:bg-[#D97706] hover:text-slate-950 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-950/40 text-white hover:bg-[#D97706] hover:text-slate-950 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Carousel Indicators */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-[#D97706]' : 'w-2.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. About LSSCDT + 2x2 Stat Cards Grid (Attachment 2 style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left: About Text */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0A2342] tracking-tight">
              About LSSCDT
            </h2>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>{collegeInfo.aboutText1}</p>
              <p>{collegeInfo.aboutText2}</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('about')}
                className="bg-[#0A2342] hover:bg-[#071931] text-white text-xs font-bold px-5 py-2.5 rounded-md transition-colors inline-flex items-center gap-2"
              >
                <span>Read Full History</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>

          {/* Right: 2x2 Stat Cards Grid (#F0F4F8 bg cards with gold text) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F0F4F8] p-6 sm:p-8 rounded-2xl text-center flex flex-col justify-center items-center shadow-sm hover:shadow transition-shadow">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#D97706] font-serif">
                {collegeInfo.stats?.placement || "100%"}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
                Placement Assistance
              </div>
            </div>

            <div className="bg-[#F0F4F8] p-6 sm:p-8 rounded-2xl text-center flex flex-col justify-center items-center shadow-sm hover:shadow transition-shadow">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#D97706] font-serif">
                {collegeInfo.stats?.labs || "15+"}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
                Advanced Labs
              </div>
            </div>

            <div className="bg-[#F0F4F8] p-6 sm:p-8 rounded-2xl text-center flex flex-col justify-center items-center shadow-sm hover:shadow transition-shadow">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#D97706] font-serif">
                {collegeInfo.stats?.dairyPlant || "50k"}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
                LPD Dairy Plant
              </div>
            </div>

            <div className="bg-[#F0F4F8] p-6 sm:p-8 rounded-2xl text-center flex flex-col justify-center items-center shadow-sm hover:shadow transition-shadow">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#D97706] font-serif">
                {collegeInfo.stats?.faculty || "20+"}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
                Expert Faculty
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Leadership Statements */}
      <section className="bg-[#F0F4F8] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0A2342]">
              College Leadership
            </h2>
            <p className="text-xs text-slate-500">Guiding excellence in dairy science & technology</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Dean Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 border-t-4 border-t-[#0A2342] shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={collegeInfo.deanImage}
                    alt={collegeInfo.deanName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 bg-slate-100 shadow-sm border border-slate-200"
                  />
                  <div className="space-y-0.5">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-[#0A2342]">
                      Dean's Message
                    </h3>
                    <div className="text-slate-600 font-semibold text-xs sm:text-sm">
                      {collegeInfo.deanName}
                    </div>
                    <div className="text-slate-500 text-xs leading-tight">
                      {collegeInfo.deanDesignation}
                    </div>
                  </div>
                </div>
                <p className="mt-5 sm:mt-6 text-slate-600 italic text-xs sm:text-sm leading-relaxed">
                  "{collegeInfo.deanMessage}"
                </p>
              </div>
            </div>

            {/* Secretary Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 border-t-4 border-t-[#D97706] shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={collegeInfo.secretaryImage}
                    alt={collegeInfo.secretaryName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 bg-slate-100 shadow-sm border border-slate-200"
                  />
                  <div className="space-y-0.5">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-[#0A2342]">
                      Secretary's Message
                    </h3>
                    <div className="text-slate-600 font-semibold text-xs sm:text-sm">
                      {collegeInfo.secretaryName}
                    </div>
                    <div className="text-slate-500 text-xs leading-tight">
                      {collegeInfo.secretaryDesignation}
                    </div>
                  </div>
                </div>
                <p className="mt-5 sm:mt-6 text-slate-600 italic text-xs sm:text-sm leading-relaxed">
                  "{collegeInfo.secretaryMessage}"
                </p>
              </div>
            </div>

            {/* Administrative Officer Card */}
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 border-t-4 border-t-emerald-700 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={collegeInfo.adminOfficerImage || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80"}
                    alt={collegeInfo.adminOfficerName || "Shri. M. V. Kulkarni"}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 bg-slate-100 shadow-sm border border-slate-200"
                  />
                  <div className="space-y-0.5">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-[#0A2342]">
                      Administrative Officer's Message
                    </h3>
                    <div className="text-slate-600 font-semibold text-xs sm:text-sm">
                      {collegeInfo.adminOfficerName || "Shri. M. V. Kulkarni"}
                    </div>
                    <div className="text-slate-500 text-xs leading-tight">
                      {collegeInfo.adminOfficerDesignation || "Administrative Officer, Late Shaktikumar Sancheti College of Dairy Technology"}
                    </div>
                  </div>
                </div>
                <p className="mt-5 sm:mt-6 text-slate-600 italic text-xs sm:text-sm leading-relaxed">
                  "{collegeInfo.adminOfficerMessage || "Our administrative office is dedicated to providing seamless governance, student support, and operational excellence to foster a transparent and efficient academic environment."}"
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Latest Notices & Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Notices Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-xl font-bold font-serif text-[#0A2342]">
              Latest Notices & Updates
            </h3>
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-bold text-[#D97706] hover:underline"
            >
              View All Notices
            </button>
          </div>

          <div className="space-y-3">
            {(notices || []).slice(0, 5).map((n) => (
              <div
                key={n.id}
                onClick={() => onSelectNotice(n)}
                className="p-4 bg-[#F0F4F8] hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200/60 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {n.isNew && (
                      <span className="text-[9px] font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded">NEW</span>
                    )}
                    <span className="text-[10px] font-bold text-[#0A2342] uppercase tracking-wider">
                      {n.category}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {n.content}
                  </p>
                </div>
                <div className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md shrink-0 border border-slate-200">
                  {n.date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Column */}
        <div className="space-y-4 bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-serif text-[#0A2342] border-b border-slate-200 pb-3">
              Upcoming Events
            </h3>

            {(!events || events.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-500 italic space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p>No scheduled events at this time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(events || []).map((ev) => (
                  <div key={ev.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-sm">
                    <div className="text-[10px] font-bold text-[#D97706]">
                      {ev.date} {ev.time && `• ${ev.time}`}
                    </div>
                    <div className="font-bold text-xs text-[#0A2342]">
                      {ev.title}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {ev.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('notices')}
            className="w-full bg-[#0A2342] hover:bg-[#071931] text-white text-xs font-bold py-2.5 rounded-lg text-center transition-colors mt-4"
          >
            Check Event Gallery
          </button>
        </div>

      </section>

    </div>
  );
};
