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
  Quote,
  GraduationCap
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
  isAdmin?: boolean;
  onUpdateCollegeInfo?: (updated: CollegeInfo) => void;
  onRequestAdminLogin?: () => void;
}

export const Home: React.FC<HomeProps> = ({
  collegeInfo,
  notices,
  events,
  onNavigate,
  onSelectNotice,
  isAdmin = false,
  onUpdateCollegeInfo,
  onRequestAdminLogin
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
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const nextSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const leaders = [
    {
      id: 'president' as const,
      roleKey: "President's Message",
      name: collegeInfo.presidentName || "Shri Madanlalji Sancheti",
      designation: collegeInfo.presidentDesignation || "President",
      education: collegeInfo.presidentEducation || "B.A., Philanthropist & Social Leader",
      institution: collegeInfo.presidentInstitution || "Late Shaktikumar Sancheti College of Dairy Technology, Malkapur",
      message: collegeInfo.presidentMessage || "Our mission is to build a modern center of excellence in dairy technology that empowers students with cutting-edge knowledge, practical skills, and moral values to lead and transform the dairy sector.",
      image: collegeInfo.presidentImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      badgeColor: "bg-[#0A2342] text-amber-400",
      accentBorder: "border-l-4 border-l-[#0A2342]",
      photoOnLeft: true
    },
    {
      id: 'secretary' as const,
      roleKey: "Secretary's Message",
      name: collegeInfo.secretaryName || "Suresh Kisanlal Sancheti",
      designation: collegeInfo.secretaryDesignation || "Secretary",
      education: collegeInfo.secretaryEducation || "B.Com., M.B.A. (Management)",
      institution: collegeInfo.secretaryInstitution || "Late Shaktikumar Sancheti College of Dairy Technology, Malkapur",
      message: collegeInfo.secretaryMessage || "It is our commitment to build an institution that not only imparts technical knowledge but also shapes the character and values of our students. LSSCDT stands as a symbol of our dedication to rural development and the dairy industry of India.",
      image: collegeInfo.secretaryImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
      badgeColor: "bg-indigo-900 text-amber-300",
      accentBorder: "border-l-4 border-l-indigo-900",
      photoOnLeft: false
    },
    {
      id: 'dean' as const,
      roleKey: "Dean's Message",
      name: collegeInfo.deanName || "Dr. P. L. Chaudhari",
      designation: collegeInfo.deanDesignation || "Dean",
      education: collegeInfo.deanEducation || "Ph.D., M.Tech (Dairy Technology)",
      institution: collegeInfo.deanInstitution || "Late Shaktikumar Sancheti College of Dairy Technology, Malkapur",
      message: collegeInfo.deanMessage || "Welcome to Late Shaktikumar Sancheti College of Dairy Technology. Our institution is committed to providing world-class education in dairy science and technology. We nurture students to become skilled professionals who contribute to India's dairy industry.",
      image: collegeInfo.deanImage || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
      badgeColor: "bg-[#D97706] text-white",
      accentBorder: "border-l-4 border-l-[#D97706]",
      photoOnLeft: true
    },
    {
      id: 'adminOfficer' as const,
      roleKey: "Administrative Officer's Message",
      name: collegeInfo.adminOfficerName || "Shri S. D. Lokhande",
      designation: collegeInfo.adminOfficerDesignation || "Administrative Officer",
      education: collegeInfo.adminOfficerEducation || "M.Sc., D.B.M.",
      institution: collegeInfo.adminOfficerInstitution || "Late Shaktikumar Sancheti College of Dairy Technology, Malkapur",
      message: collegeInfo.adminOfficerMessage || "Our administrative office is dedicated to providing seamless governance, student support, and operational excellence to foster a transparent and efficient academic environment.",
      image: collegeInfo.adminOfficerImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      badgeColor: "bg-emerald-800 text-white",
      accentBorder: "border-l-4 border-l-emerald-800",
      photoOnLeft: false
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Hero Carousel Banner */}
      <section className="relative w-full h-[400px] sm:h-[500px] md:h-[580px] bg-slate-900 overflow-hidden">
        {banners.map((banner, index) => (
          <div
            key={banner.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[7000ms] ease-out"
            />
            {/* Gradient Overlay for high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A2342]/95 via-[#0A2342]/75 to-transparent flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
                <div className="max-w-2xl space-y-4 text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-semibold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>LSSCDT Malkapur</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif leading-tight text-white drop-shadow-md">
                    {banner.title}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-slate-200 font-medium leading-relaxed max-w-xl">
                    {banner.subtitle}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => onNavigate('academics')}
                      className="bg-[#D97706] hover:bg-[#b46304] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-amber-600/30 transition-all flex items-center gap-2 group"
                    >
                      <span>{banner.ctaText || 'Apply Now'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => onNavigate('about')}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm px-6 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      Explore Campus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Nav Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full backdrop-blur-xs transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-3 rounded-full backdrop-blur-xs transition-colors"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'w-8 bg-[#D97706]' : 'w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2. Key Highlights / Stats Bar */}
      <section ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            rawValue={collegeInfo.stats?.placement || "100%"}
            label="Placement Record"
            isVisible={statsInView}
          />
          <StatCard
            rawValue={collegeInfo.stats?.labs || "10"}
            label="Specialized Labs"
            isVisible={statsInView}
          />
          <StatCard
            rawValue={collegeInfo.stats?.dairyPlant || "500 LPD"}
            label="Pilot Dairy Plant"
            isVisible={statsInView}
          />
          <StatCard
            rawValue={collegeInfo.stats?.faculty || "10+"}
            label="Expert Faculty"
            isVisible={statsInView}
          />
        </div>
      </section>

      {/* 3. Leadership Statements & Qualifications */}
      <section className="bg-[#F0F4F8] py-14 sm:py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10 sm:space-y-12">
          
          {/* Section Header */}
          <div className="text-center md:text-left space-y-1.5 border-b border-slate-300/70 pb-6">
            <div className="inline-flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] bg-amber-100/80 px-3 py-1 rounded-full">
                Institutional Leadership
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-white/80 border border-slate-200 px-2.5 py-0.5 rounded-full">
                Academic & Administrative Team
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0A2342] tracking-tight">
              College Leadership
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl font-medium">
              Guiding excellence in dairy science & technology education with distinguished qualifications and visionary leadership.
            </p>
          </div>

          {/* Leaders List - Vertical Display with Alternating Layout */}
          <div className="space-y-8 sm:space-y-10">
            {leaders.map((leader) => (
              <div 
                key={leader.id} 
                className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 relative group"
              >
                <div className={`flex flex-col md:flex-row items-center gap-8 lg:gap-12 ${leader.photoOnLeft ? '' : 'md:flex-row-reverse'}`}>
                  
                  {/* Photo Column */}
                  <div className="w-full md:w-5/12 lg:w-4/12 flex flex-col items-center shrink-0">
                    <div className="relative group/img w-full max-w-[260px] sm:max-w-[280px]">
                      <div className="absolute -inset-1.5 bg-gradient-to-r from-[#0A2342] to-[#D97706] rounded-3xl blur opacity-20 group-hover/img:opacity-35 transition duration-300"></div>
                      <div className="relative rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-xl aspect-[3/4] w-full">
                        <img
                          src={leader.image}
                          alt={leader.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Information Column */}
                  <div className="w-full md:w-7/12 lg:w-8/12 space-y-4 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${leader.badgeColor}`}>
                        {leader.roleKey}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0A2342] tracking-tight">
                        {leader.name}
                      </h3>

                      {/* Designation and Education Qualifications */}
                      <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                        <span className="text-[#D97706] font-bold text-base sm:text-lg">
                          {leader.designation}
                        </span>

                        {leader.education && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/90 border border-amber-200/90 rounded-lg text-amber-900 text-xs sm:text-sm font-semibold shadow-xs">
                            <GraduationCap className="w-4 h-4 text-[#D97706] shrink-0" />
                            <span>{leader.education}</span>
                          </span>
                        )}
                      </div>

                      {leader.institution && (
                        <p className="text-slate-600 text-xs sm:text-sm font-semibold flex items-center gap-1.5 pt-1">
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
              className="text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1"
            >
              View All Notices <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {(notices || []).slice(0, 5).map((n) => (
              <div
                key={n.id}
                onClick={() => onSelectNotice(n)}
                className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex items-start gap-3.5 group"
              >
                <div className="bg-[#F0F4F8] group-hover:bg-amber-50 p-2.5 rounded-lg shrink-0 transition-colors">
                  <FileText className="w-5 h-5 text-[#0A2342] group-hover:text-[#D97706]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">
                      {n.date}
                    </span>
                    {n.isNew && (
                      <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {n.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0A2342] group-hover:text-[#D97706] truncate mt-1">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                    {n.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events / Quick Calendar Column */}
        <div className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-3">
              <Calendar className="w-5 h-5 text-[#D97706]" />
              <h3 className="text-lg font-bold font-serif text-[#0A2342]">
                Upcoming Events
              </h3>
            </div>

            {(events || []).length === 0 ? (
              <div className="p-4 bg-white rounded-xl text-center text-xs text-slate-500">
                <p>No scheduled events at this time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(events || []).slice(0, 4).map((ev) => (
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
