import React from 'react';
import { CollegeInfo } from '../types';
import { Award, CheckCircle2, ShieldCheck, Landmark, Building2, BookOpen, Users } from 'lucide-react';

interface AboutUsProps {
  collegeInfo: CollegeInfo;
}

export const AboutUs: React.FC<AboutUsProps> = ({ collegeInfo }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 rounded-2xl shadow-lg border border-amber-500/30">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
            About Our Institution
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            {collegeInfo.name}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {collegeInfo.tagline}
          </p>
        </div>
      </div>

      {/* Overview & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-amber-600" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase">Affiliation</div>
              <div className="font-bold text-slate-900 text-sm mt-1">{collegeInfo.affiliation}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase">Approval & Accreditation</div>
              <div className="font-bold text-slate-900 text-sm mt-1">{collegeInfo.approval}</div>
            </div>
          </div>
        </div>

        {/* Quick Facts Card */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold font-serif text-amber-300 border-b border-slate-800 pb-2">
            Institutional At A Glance
          </h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span>Established Year:</span>
              <strong className="text-white font-mono">{collegeInfo.establishedYear}</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span>Campus Area:</span>
              <strong className="text-white">{collegeInfo.campusArea}</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span>Degree Awarded:</span>
              <strong className="text-amber-300">B.Tech (Dairy Technology)</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span>Course Duration:</span>
              <strong className="text-white">4 Years (8 Semesters)</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span>Pilot Dairy Capacity:</span>
              <strong className="text-emerald-400 font-mono">50,000 Liters/Day</strong>
            </li>
            <li className="flex justify-between items-center py-1.5 border-b border-slate-800">
              <span>Primary Medium:</span>
              <strong className="text-white">English</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vision */}
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-8 rounded-2xl shadow-md border border-blue-800 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-400/30">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-serif text-amber-300">Our Vision</h3>
          <p className="text-slate-200 text-sm leading-relaxed">
            {collegeInfo.vision}
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold font-serif text-slate-900">Our Mission</h3>
          <ul className="space-y-3 text-slate-700 text-sm">
            {collegeInfo.mission.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Leadership & Principal Profile */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-3">
          Institutional Leadership
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <img
            src={collegeInfo.deanImage}
            alt={collegeInfo.deanName}
            className="w-48 h-60 object-cover rounded-2xl shadow-md border-4 border-amber-500 shrink-0"
          />
          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">{collegeInfo.deanName}</h3>
              <p className="text-sm font-semibold text-amber-600">{collegeInfo.deanDesignation}</p>
              <p className="text-xs text-slate-500 font-mono">Ph.D. (Dairy Technology) - National Dairy Research Institute (NDRI)</p>
            </div>
            <p>
              Dr. Deshmukh brings over two decades of distinguished experience in dairy technology education, research, and pilot plant commissioning. He has guided dozens of post-graduate scholars, published research papers in international journals of food science, and spearheaded technology transfers for indigenous milk product automation.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-amber-500 italic text-slate-800 font-serif">
              "{collegeInfo.deanMessage}"
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
