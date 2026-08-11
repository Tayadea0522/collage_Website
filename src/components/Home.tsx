import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Users,
  Quote
} from 'lucide-react';

interface ParsedStat {
  prefix: string;
  target: number;
  suffix: string;
}

function parseStatValue(raw: string): ParsedStat {
  if (!raw) return { prefix: '', target: 0, suffix: '' };
  const match = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!match) {
    return { prefix: '', target: 0, suffix: raw };
  }
  const prefix = match[1] || '';
  const target = parseFloat(match[2].replace(/,/g, '')) || 0;
  const suffix = match[3] || '';
  return { prefix, target, suffix };
}

interface StatCardProps {
  rawValue: string;
  label: string;
  isVisible: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ rawValue, label, isVisible }) => {
  const { prefix, target, suffix } = useMemo(() => parseStatValue(rawValue), [rawValue]);
  const [displayValue, setDisplayValue] = useState<number>(0);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isVisible || hasAnimatedRef.current) {
      return;
    }

    hasAnimatedRef.current = true;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      return;
    }

    const duration = 1800; // 1.8 seconds
    let animationFrameId: number;
    let startTime: number | null = null;

    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic ease-out
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easedProgress * target);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVisible, target]);

  return (
    <div className="bg-[#F0F4F8] p-6 sm:p-8 rounded-2xl text-center flex flex-col justify-center items-center shadow-sm hover:shadow transition-shadow">
      <div className="text-3xl sm:text-4xl font-extrabold text-[#D97706] font-serif tracking-tight">
        {prefix}{displayValue}{suffix}
      </div>
      <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
        {label}
      </div>
    </div>
  );
};

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
  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef<HTMLDivElement | null>(null);

  const banners = collegeInfo?.heroBanners || [];

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  useEffect(() => {
    const element = statsRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

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
          <div ref={statsRef} className="grid grid-cols-2 gap-4">
            <StatCard
              rawValue={collegeInfo.stats?.placement || "100%"}
              label="Placement Assistance"
              isVisible={statsInView}
            />

            <StatCard
              rawValue="500"
              label="Plant Capacity"
              isVisible={statsInView}
            />

            <StatCard
              rawValue="10"
              label="Labs"
              isVisible={statsInView}
            />

            <StatCard
              rawValue="10+"
              label="Expert Faculties"
              isVisible={statsInView}
            />
          </div>

        </div>
      </section>

      {/* 3. Leadership Statements */}
      <section className="bg-[#F0F4F8] py-14 sm:py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 sm:space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] bg-amber-100/80 px-3 py-1 rounded-full inline-block">
              Institutional Leadership
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0A2342] tracking-tight">
              College Leadership
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto font-medium">
              Guiding excellence in dairy science & technology education
            </p>
          </div>

          {/* Leaders List - Vertical Display with Alternating Layout */}
          <div className="space-y-8 sm:space-y-10">
            {[
              {
                id: 'president',
                roleKey: "President's Message",
                name: collegeInfo.presidentName || "Shri Madanlalji Sancheti",
                designation: collegeInfo.presidentDesignation || "President",
                institution: collegeInfo.presidentInstitution || "Late Shaktikumar Sancheti College of Dairy Technology, Malkapur",
                message: collegeInfo.presidentMessage || "Our mission is to build a modern center of excellence in dairy technology that empowers students with cutting-edge knowledge, practical skills, and moral values to lead and transform the dairy sector.",
                image: collegeInfo.presidentImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                badgeColor: "bg-[#0A2342] text-amber-400",
                accentBorder: "border-l-4 border-l-[#0A2342]",
                photoOnLeft: true
              },
              {
                id: 'dean',
                roleKey: "Dean's Message",
                name: collegeInfo.deanName || "Dr. P. L. Chaudhari",
                designation: collegeInfo.deanDesignation || "Dean",
                institution: collegeInfo.deanInstitution || "Late Shaktikumar Sancheti College of Dairy Technology, Malkapur",
                message: collegeInfo.deanMessage || "Welcome to Late Shaktikumar Sancheti College of Dairy Technology. Our institution is committed to providing world-class education in dairy science and technology. We nurture students to become skilled professionals who contribute to India's dairy industry.",
                image: collegeInfo.deanImage || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
                badgeColor: "bg-[#D97706] text-white",
                accentBorder: "border-l-4 border-l-[#D97706]",
                photoOnLeft: false
              },
              {
                id: 'secretary',
                roleKey: "Secretary's Message",
                name: collegeInfo.secretaryName || "Suresh Kisanlal Sancheti",
                designation: collegeInfo.secretaryDesignation || "Secretary",
                institution: collegeInfo.secretaryInstitution || "Late Shaktikumar Sancheti College of Dairy Technology, Malkapur",
                message: collegeInfo.secretaryMessage || "It is our commitment to build an institution that not only imparts technical knowledge but also shapes the character and values of our students. LSSCDT stands as a symbol of our dedication to rural development and the dairy industry of India.",
                image: collegeInfo.secretaryImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
                badgeColor: "bg-indigo-900 text-amber-300",
                accentBorder: "border-l-4 border-l-indigo-900",
                photoOnLeft: true
              },
              {
                id: 'adminOfficer',
                roleKey: "Administrative Officer's Message",
                name: collegeInfo.adminOfficerName || "Shri S. D. Lokhande",
                designation: collegeInfo.adminOfficerDesignation || "Administrative Officer",
                institution: collegeInfo.adminOfficerInstitution || "Late Shaktikumar Sancheti College of Dairy Technology, Malkapur",
                message: collegeInfo.adminOfficerMessage || "Our administrative office is dedicated to providing seamless governance, student support, and operational excellence to foster a transparent and efficient academic environment.",
                image: collegeInfo.adminOfficerImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                badgeColor: "bg-emerald-800 text-white",
                accentBorder: "border-l-4 border-l-emerald-800",
                photoOnLeft: false
              }
            ].map((leader) => (
              <div 
                key={leader.id} 
                className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className={`flex flex-col md:flex-row items-center gap-8 lg:gap-12 ${leader.photoOnLeft ? '' : 'md:flex-row-reverse'}`}>
                  
                  {/* Photo Column */}
                  <div className="w-full md:w-5/12 lg:w-4/12 flex flex-col items-center shrink-0">
                    <div className="relative group w-full max-w-[260px] sm:max-w-[280px]">
                      <div className="absolute -inset-1.5 bg-gradient-to-r from-[#0A2342] to-[#D97706] rounded-3xl blur opacity-20 group-hover:opacity-35 transition duration-300"></div>
                      <div className="relative rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-xl aspect-[3/4] w-full">
                        <img
                          src={leader.image}
                          alt={leader.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Information Column */}
                  <div className="w-full md:w-7/12 lg:w-8/12 space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${leader.badgeColor}`}>
                        {leader.roleKey}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0A2342] tracking-tight">
                        {leader.name}
                      </h3>
                      <p className="text-[#D97706] font-bold text-base sm:text-lg mt-0.5">
                        {leader.designation}
                      </p>
                      {leader.institution && (
                        <p className="text-slate-600 text-xs sm:text-sm font-semibold flex items-center gap-1.5 mt-1.5">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{leader.institution}</span>
                        </p>
                      )}
                    </div>

                    <div className={`mt-4 bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 relative shadow-inner ${leader.accentBorder}`}>
                      <Quote className="w-8 h-8 text-slate-300 absolute top-3 left-3 opacity-40 pointer-events-none" />
                      <p className="text-slate-700 italic text-sm sm:text-base leading-relaxed relative z-10 pl-4 sm:pl-6">
                        "{leader.message}"
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
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
              onClick={() => onNavigate('news')}
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
            onClick={() => onNavigate('gallery')}
            className="w-full bg-[#0A2342] hover:bg-[#071931] text-white text-xs font-bold py-2.5 rounded-lg text-center transition-colors mt-4"
          >
            Check Event Gallery
          </button>
        </div>

      </section>

    </div>
  );
};
