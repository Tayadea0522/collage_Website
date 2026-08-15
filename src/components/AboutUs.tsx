import React from 'react';
import { CollegeInfo } from '../types';
import { 
  Award, 
  CheckCircle2, 
  Landmark, 
  Heart, 
  ShieldCheck, 
  Building2, 
  Factory, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface AboutUsProps {
  collegeInfo: CollegeInfo;
  onNavigateTab?: (tab: string) => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ collegeInfo, onNavigateTab }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      
      {/* 1. Page Header Banner */}
      <div className="relative bg-gradient-to-r from-[#071931] via-[#0A2342] to-[#0D2E57] text-white shadow-md border-b-4 border-amber-500 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 relative z-10 space-y-3">
          {/* Breadcrumb */}
          <nav className="flex items-center flex-wrap gap-2 text-xs text-slate-300 font-medium">
            {onNavigateTab ? (
              <button
                onClick={() => onNavigateTab('home')}
                className="hover:text-amber-400 transition-colors"
              >
                Home
              </button>
            ) : (
              <span>Home</span>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-amber-400/70" />
            <span className="text-amber-400 font-bold">About Us</span>
          </nav>

          <div className="space-y-2 max-w-4xl">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/15 px-3 py-1 rounded-md border border-amber-400/30 inline-block">
              Institutional Profile & Legacy
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-white tracking-wide leading-tight">
              About LSSCDT Malkapur
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-3xl pt-1">
              Late Shaktikumar Sancheti College of Dairy Technology — A premier center of academic excellence, technological innovation, and professional leadership in Dairy Technology.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-12">

        {/* 2. Institutional Background & Legacy */}
        <section className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Landmark className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0A2342]">
                  Institutional Background & Legacy
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Managed by {collegeInfo.trustName || 'Late. Madanlalji - Kisanlalji Sancheti Seva Samiti, Malkapur'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4 text-slate-700 text-sm leading-relaxed">
              <p>
                Established in the year <strong>{collegeInfo.establishedYear}</strong>, <strong>Late Shaktikumar Sancheti College of Dairy Technology (LSSCDT)</strong> was founded with a forward-looking mission: to address the growing national requirement for highly skilled, technologically proficient professionals in the dairy and food processing sectors.
              </p>
              <p>
                Situated in the agrarian heartland of Malkapur (District Buldhana, Maharashtra), our college provides an integrated learning environment that combines rigorous academic coursework with hands-on industrial plant operations. The college is affiliated with the prestigious <strong>Maharashtra Animal & Fishery Sciences University (MAFSU), Nagpur</strong> and approved by the <strong>Government of Maharashtra</strong>, strictly implementing the nationwide uniform curriculum designed by the Fifth Deans' Committee of the <strong>Indian Council of Agricultural Research (ICAR), New Delhi</strong>.
              </p>
              <p>
                Spanning a serene and verdant <strong>{collegeInfo.campusArea || '35-Acre'}</strong> campus, LSSCDT features a fully operational 500 LPD experimental pilot dairy processing plant, state-of-the-art analytical chemistry and microbiology laboratories, smart digital classrooms, a comprehensive technical library, and secure on-campus residences for students.
              </p>
            </div>

            <div className="lg:col-span-4 bg-gradient-to-br from-[#0A2342] to-[#0D2E57] text-white p-6 rounded-2xl shadow-md space-y-4 border border-blue-900">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>At A Glance</span>
              </div>
              
              <div className="space-y-3 text-xs divide-y divide-blue-800/60">
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-300">Established</span>
                  <strong className="text-white font-mono">{collegeInfo.establishedYear}</strong>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-300">Campus Area</span>
                  <strong className="text-amber-400">{collegeInfo.campusArea || '35 Acres'}</strong>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-300">Degree Program</span>
                  <strong className="text-white">B.Tech (Dairy Tech)</strong>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-300">Program Duration</span>
                  <strong className="text-white">4 Years (8 Semesters)</strong>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-300">University</span>
                  <strong className="text-amber-400">MAFSU, Nagpur</strong>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-slate-300">Pilot Dairy Plant</span>
                  <strong className="text-white font-mono">500 LPD</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. In Memory of Late Shaktikumar Sancheti */}
        <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50/40 rounded-2xl p-6 sm:p-10 border border-amber-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-amber-200/60 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow">
              <Heart className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 block">
                Inspiring Founder & Visionary
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0A2342]">
                In Memory of Late Shaktikumar Sancheti
              </h2>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="shrink-0 text-center space-y-2">
              <div className="relative inline-block">
                <img
                  src={collegeInfo.shaktikumarImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"}
                  alt="Late Shaktikumar Sancheti"
                  className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl object-cover border-4 border-amber-400 shadow-lg"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0A2342] text-amber-400 text-[10px] font-extrabold px-3 py-1 rounded-full whitespace-nowrap border border-amber-400 shadow">
                  VISIONARY FOUNDER
                </div>
              </div>
              <div className="pt-2 text-xs font-bold text-slate-700 font-serif">
                Late Shri Shaktikumar Sancheti
              </div>
            </div>

            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
              <blockquote className="border-l-4 border-amber-500 pl-4 py-1 italic font-serif text-slate-800 text-base sm:text-lg">
                "{collegeInfo.shaktikumarMessage || "Empowerment through education and scientific knowledge is the truest service one can render to the rural community and our nation."}"
              </blockquote>
              <p>
                Late Shri Shaktikumar Sancheti was an inspiring philanthropist and visionary whose life was dedicated to social upliftment, rural development, and education. Recognizing that the dairy industry represents the economic lifeblood of millions of farming families across Maharashtra and India, he envisioned establishing a world-class center of technical learning right in Malkapur.
              </p>
              <p>
                This institution stands as an enduring monument to his noble aspirations, continuously molding young technocrats who drive modernization, food security, and rural prosperity across the country.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Vision & Mission */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0A2342] flex items-center justify-center gap-2">
              <Award className="w-7 h-7 text-amber-600" />
              <span>Vision & Mission</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Guiding our pursuit of academic excellence and societal transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision Card */}
            <div className="bg-[#0A2342] text-white p-8 rounded-2xl shadow-lg border border-blue-900 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>OUR VISION</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  Shaping the Future of Dairy Technology
                </h3>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {collegeInfo.vision || "To emerge as a premier center of excellence in Dairy Technology education, research, and extension, producing globally competent professionals and innovative entrepreneurs who transform the dairy and food processing industry."}
                </p>
              </div>

              <div className="pt-4 border-t border-blue-900/80 text-xs text-amber-300/80 font-medium">
                Affiliated with MAFSU Nagpur & Approved by ICAR
              </div>
            </div>

            {/* Mission Card */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full border border-slate-300">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>OUR MISSION</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#0A2342]">
                  Core Commitments & Objectives
                </h3>
                <ul className="space-y-3 text-slate-700 text-xs sm:text-sm">
                  {(collegeInfo.mission && collegeInfo.mission.length > 0 ? collegeInfo.mission : [
                    "Provide high-standard technical education in dairy processing, engineering, chemistry, and quality management.",
                    "Impart rigorous hands-on practical training through fully operational commercial pilot dairy processing plants.",
                    "Foster cutting-edge research, product development, and sustainable by-product utilization.",
                    "Bridge the gap between academia and India's leading dairy cooperatives, multinational companies, and research institutions.",
                    "Instill ethical values, leadership qualities, and entrepreneurial mindset among graduates."
                  ]).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
                Uniform ICAR 5th Deans' Committee Curriculum
              </div>
            </div>
          </div>
        </section>

        {/* 5. Affiliations, Recognitions & Approvals */}
        <section className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0A2342]">
                  Recognitions & University Affiliations
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Officially approved and recognized by statutory educational bodies
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h4 className="font-bold font-serif text-slate-900 text-base">
                  University Affiliation
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {collegeInfo.affiliation || 'Affiliated to Maharashtra Animal & Fishery Sciences University (MAFSU), Nagpur (मपाविवि/प.वि./शा./स.शा.अ.(60)/ नस्ती क्र. 281/739/26 17/07/2026)'}
              </p>
              <div className="text-[11px] font-semibold text-slate-500">
                Authorized granting university for 4-Year B.Tech (Dairy Technology)
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <h4 className="font-bold font-serif text-slate-900 text-base">
                  Government & ICAR Approvals
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {collegeInfo.approval || 'Approved by the State Government of Maharashtra (DAHD-12024/73/2026-AH(1696785) 16/07/2026) and strictly conforming to ICAR Fifth Deans\' Committee standards.'}
              </p>
              <div className="text-[11px] font-semibold text-slate-500">
                Recognized professional degree for national and state-level recruitment
              </div>
            </div>
          </div>
        </section>

        {/* 6. Key Campus Infrastructure Pillars */}
        <section className="bg-slate-100/80 rounded-2xl p-6 sm:p-10 border border-slate-200 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0A2342]">
              Institutional Infrastructure Highlights
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              World-class learning environment engineered for practical mastery
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
                <Factory className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="font-bold font-serif text-[#0A2342] text-sm">500 LPD Experimental Pilot Plant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated experimental pilot processing facility for milk processing, product formulation, testing, and practical student training.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 mx-auto flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="font-bold font-serif text-[#0A2342] text-sm">35-Acre Green Campus</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sprawling eco-friendly campus with modern academic blocks, sports grounds, and student amenities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-bold font-serif text-[#0A2342] text-sm">QC & QA Laboratories</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Advanced chemistry, microbiology, and sensory evaluation labs with certified analytical instruments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2 text-center">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-700" />
              </div>
              <h3 className="font-bold font-serif text-[#0A2342] text-sm">Digital Central Library</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thousands of textbooks, international dairy science journals, e-books, and high-speed internet access.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
