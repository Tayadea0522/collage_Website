import React from 'react';
import { CollegeInfo } from '../types';
import { Award, CheckCircle2, Landmark } from 'lucide-react';

interface AboutUsProps {
  collegeInfo: CollegeInfo;
}

export const AboutUs: React.FC<AboutUsProps> = ({ collegeInfo }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10 font-sans text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-[#0A2342] text-white p-8 sm:p-12 rounded-2xl shadow border-b-4 border-[#D97706]">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] bg-amber-500/10 px-3 py-1 rounded border border-[#D97706]/30">
            About Our Institution
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            {collegeInfo.name}
          </h1>
          <p className="text-amber-300 font-bold text-sm sm:text-base">
            Managed by {collegeInfo.trustName || 'Late. Madanlalji Kisanlalji Sancheti Seva Samiti, Malkapur'}
          </p>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            {collegeInfo.tagline}
          </p>
        </div>
      </div>

      {/* In Memory Of Card */}
      <div className="bg-[#F2F6FA] p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-10">
        <div className="shrink-0">
          <img
            src={collegeInfo.shaktikumarImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"}
            alt="Late Shaktikumar Sancheti"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[#D97706] shadow-md"
          />
        </div>
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#B45309] block">
            IN MEMORY OF
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0A2342]">
            Late Shaktikumar Sancheti
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl pt-1">
            {collegeInfo.shaktikumarMessage || "A visionary philanthropist and dedicated patron of education, Late Shri Shaktikumar Sancheti believed that knowledge is the greatest gift one can give to society. This institution stands as a lasting tribute to his unwavering commitment to rural development and the empowerment of India's dairy sector."}
          </p>
        </div>
      </div>

      {/* Overview & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-[#F0F4F8] p-8 rounded-2xl border border-slate-200/80 space-y-6">
          <h2 className="text-2xl font-bold font-serif text-[#0A2342] border-b border-slate-300/80 pb-3 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#D97706]" />
            Institutional Background & Legacy
          </h2>
          <div className="text-slate-700 text-sm leading-relaxed space-y-4">
            <p>
              Established in the year <strong>{collegeInfo.establishedYear}</strong>, Late Shaktikumar Sancheti College of Dairy Technology was founded to fulfill the critical national need for specialized professional manpower in the dairy processing sector. Situated in the fertile agricultural belt of Maharashtra, the college serves as a beacon of modern agricultural and food processing education.
            </p>
            <p>
              The college is officially affiliated to the <strong>Maharashtra Animal & Fishery Sciences University (MAFSU), Nagpur</strong> and approved by the <strong>Indian Council of Agricultural Research (ICAR), New Delhi</strong>. We follow the uniform syllabus formulated by the Fifth Deans' Committee of ICAR for the 4-Year B.Tech (Dairy Technology) degree program.
            </p>
            <p>
              Spread across a lush <strong>{collegeInfo.campusArea}</strong>, the institution houses fully equipped pilot dairy processing plants, microbiology and chemistry quality control laboratories, a modern digital library, computer networks, and comfortable student residences.
            </p>
          </div>
        </div>

        {/* Quick Facts Card */}
        <div className="bg-[#0A2342] text-white p-6 rounded-2xl shadow-md space-y-4">
          <h3 className="text-lg font-bold font-serif text-amber-400 border-b border-blue-900/80 pb-2">
            Institutional At A Glance
          </h3>
          <ul className="space-y-3 text-xs text-slate-200">
            <li className="flex justify-between items-center py-1.5 border-b border-blue-900/60">
              <span>Established Year:</span>
              <strong className="text-white font-mono">{collegeInfo.establishedYear}</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-blue-900/60">
              <span>Campus Area:</span>
              <strong className="text-white">{collegeInfo.campusArea}</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-blue-900/60">
              <span>Degree Awarded:</span>
              <strong className="text-amber-400">B.Tech (Dairy Technology)</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-blue-900/60">
              <span>Course Duration:</span>
              <strong className="text-white">4 Years (8 Semesters)</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-blue-900/60">
              <span>Pilot Dairy Capacity:</span>
              <strong className="text-amber-400 font-mono">50,000 Liters/Day</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-blue-900/60">
              <span>Primary Medium:</span>
              <strong className="text-white">English</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Recognition & Affiliation */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <Award className="w-7 h-7 text-[#D97706]" />
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#0A2342]">
            Recognition & Affiliation
          </h2>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            LSSCDT operates under strict academic and administrative guidelines ensuring the highest quality of education.
          </p>

          <ul className="space-y-3.5 text-slate-800 text-sm sm:text-base">
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] mt-2 shrink-0 shadow-sm" />
              <span className="font-semibold text-slate-900">
                Affiliated to Maharashtra Animal & Fishery Sciences University (MAFSU), Nagpur.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706] mt-2 shrink-0 shadow-sm" />
              <span className="font-semibold text-slate-900">
                Approved by the State Government of Maharashtra.
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vision */}
        <div className="bg-[#0A2342] text-white p-8 rounded-2xl shadow space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-400/30">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-serif text-amber-400">Our Vision</h3>
          <p className="text-slate-200 text-sm leading-relaxed">
            {collegeInfo.vision}
          </p>
        </div>

        {/* Mission */}
        <div className="bg-[#F0F4F8] p-8 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#0A2342] text-amber-400 flex items-center justify-center font-bold text-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-serif text-[#0A2342]">Our Mission</h3>
          <ul className="space-y-3 text-slate-700 text-sm">
            {(collegeInfo.mission || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#D97706] font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>



    </div>
  );
};
