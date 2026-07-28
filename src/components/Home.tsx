import React, { useState, useEffect } from 'react';
import { CollegeInfo, Notice, DepartmentInfo, Facility, CollegeEvent } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Building2, 
  Users, 
  BookOpen, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ExternalLink,
  GraduationCap,
  Microscope,
  TrendingUp,
  FileText,
  UserCheck,
  Image as ImageIcon,
  Phone,
  Mail,
  MapPin,
  ChevronDown
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
  departments,
  facilities,
  onNavigate,
  onSelectNotice
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!collegeInfo.heroBanners || collegeInfo.heroBanners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % collegeInfo.heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [collegeInfo.heroBanners]);

  return (
    <div className="space-y-10 pb-12 bg-slate-50">
      
      {/* 1. Hero Image Slider */}
      <section className="relative bg-slate-950 text-white overflow-hidden shadow-md min-h-[380px] sm:min-h-[460px] flex items-center">
        {collegeInfo.heroBanners.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image with Dark Gradient Overlay */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-7000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/40" />

            {/* Slide Text Content */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 h-full flex flex-col justify-center py-10">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Late Shaktikumar Sancheti College of Dairy Technology</span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif text-white leading-tight drop-shadow-md">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-200 font-sans leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onNavigate('admissions')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-5 py-2.5 rounded-md text-sm flex items-center gap-2 transition-all shadow-md"
                  >
                    <span>{slide.ctaText || 'Apply Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('academics')}
                    className="bg-slate-900/80 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-md text-sm border border-slate-700 hover:border-amber-400 transition-all backdrop-blur-md"
                  >
                    B.Tech Curriculum
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + collegeInfo.heroBanners.length) % collegeInfo.heroBanners.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-900/60 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors border border-white/20"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % collegeInfo.heroBanners.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-slate-900/60 text-white hover:bg-amber-500 hover:text-slate-950 transition-colors border border-white/20"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {collegeInfo.heroBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. About LSSCDT & 4 Stat Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            About Late Shaktikumar Sancheti College of Dairy Technology
          </h2>
          <div className="text-sm text-slate-700 leading-relaxed space-y-3">
            <p>{collegeInfo.aboutText1}</p>
            <p>{collegeInfo.aboutText2}</p>
          </div>
          <div>
            <button
              onClick={() => onNavigate('about')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
            >
              <span>Read More</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-t-4 border-t-amber-500 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 font-serif">{collegeInfo.stats?.placement || "100%"}</div>
              <div className="text-xs font-medium text-slate-600">Placement Assistance</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-t-4 border-t-blue-600 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Microscope className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 font-serif">{collegeInfo.stats?.labs || "15+"}</div>
              <div className="text-xs font-medium text-slate-600">Advanced Labs</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-t-4 border-t-emerald-600 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 font-serif">{collegeInfo.stats?.dairyPlant || "50k"} LPD</div>
              <div className="text-xs font-medium text-slate-600">Dairy Plant Capacity</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-t-4 border-t-purple-600 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900 font-serif">{collegeInfo.stats?.faculty || "20+"}</div>
              <div className="text-xs font-medium text-slate-600">Expert Faculty</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dean's Message & Secretary's Message (Side-by-side) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dean Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-blue-700 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-lg font-serif">Dean's Message</h3>
            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-lg border-l-2 border-blue-600">
              "{collegeInfo.deanMessage}"
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <img
              src={collegeInfo.deanImage}
              alt={collegeInfo.deanName}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-600 shrink-0"
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">{collegeInfo.deanName}</div>
              <div className="text-[11px] text-slate-500">{collegeInfo.deanDesignation}</div>
            </div>
          </div>
        </div>

        {/* Secretary Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-amber-500 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-lg font-serif">Secretary's Message</h3>
            <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-4 rounded-lg border-l-2 border-amber-500">
              "{collegeInfo.secretaryMessage}"
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <img
              src={collegeInfo.secretaryImage}
              alt={collegeInfo.secretaryName}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shrink-0"
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">{collegeInfo.secretaryName}</div>
              <div className="text-[11px] text-slate-500">{collegeInfo.secretaryDesignation}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Latest Notices & Events (Side-by-side) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notices Column - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-lg font-serif">Latest Notices</h3>
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 space-y-1 max-h-[380px] overflow-y-auto pr-1">
            {notices.map((n) => (
              <div
                key={n.id}
                onClick={() => onSelectNotice(n)}
                className="py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
              >
                <div className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2.5 py-1 rounded text-center shrink-0 w-24">
                  {n.date}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    {n.isNew && (
                      <span className="text-[9px] font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded">NEW</span>
                    )}
                    <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {n.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 hover:text-amber-600">
                    {n.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Column - 1 col */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-lg font-serif">Upcoming Events</h3>
            </div>

            {events.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 italic space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No upcoming events.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => (
                  <div key={ev.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <div className="text-[10px] font-bold text-amber-600">{ev.date} {ev.time && `• ${ev.time}`}</div>
                    <div className="font-bold text-xs text-slate-900">{ev.title}</div>
                    <div className="text-[11px] text-slate-600 line-clamp-2">{ev.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('notices')}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-lg text-center transition-colors"
          >
            Check Event Calendar
          </button>
        </div>
      </section>

      {/* 5. Explore LSSCDT Quick Links Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            Explore LSSCDT Portal
          </h2>
          <p className="text-xs text-slate-500">Quick access to essential college services & departments</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { id: 'admissions', name: 'Admissions', icon: GraduationCap, color: 'text-amber-600 bg-amber-50' },
            { id: 'academics', name: 'Academics', icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
            { id: 'departments', name: 'Departments', icon: Building2, color: 'text-emerald-600 bg-emerald-50' },
            { id: 'facilities', name: 'Dairy Plant', icon: Microscope, color: 'text-purple-600 bg-purple-50' },
            { id: 'notices', name: 'Gallery', icon: ImageIcon, color: 'text-rose-600 bg-rose-50' },
            { id: 'contact', name: 'Contact', icon: MapPin, color: 'text-indigo-600 bg-indigo-50' },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-2 group hover:border-amber-400"
              >
                <div className={`w-10 h-10 rounded-lg mx-auto flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-amber-600">
                  {item.name}
                </div>
              </button>
            );
          })}
        </div>
      </section>

    </div>
  );
};
