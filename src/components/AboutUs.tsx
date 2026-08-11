import React, { useState } from 'react';
import { CollegeInfo } from '../types';
import { Award, CheckCircle2, Landmark, Heart, ShieldCheck, Info } from 'lucide-react';
import { InnerPageLayout, SidebarItem } from './InnerPageLayout';

interface AboutUsProps {
  collegeInfo: CollegeInfo;
  onNavigateTab?: (tab: string) => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ collegeInfo, onNavigateTab }) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('overview');

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Institutional Legacy', icon: Landmark },
    { id: 'memory', label: 'In Memory of Founder', icon: Heart },
    { id: 'vision_mission', label: 'Vision & Mission', icon: Award },
    { id: 'affiliations', label: 'Recognitions & Affiliation', icon: ShieldCheck },
    { id: 'glance', label: 'Institutional Quick Facts', icon: Info },
  ];

  return (
    <InnerPageLayout
      title="About LSSCDT Malkapur"
      categoryTag="About Institution"
      subtitle="Institutional Legacy, Vision, Mission & Recognition"
      breadcrumbPath={[
        { label: 'Home', tab: 'home' },
        { label: 'About Us' },
        { label: sidebarItems.find(s => s.id === activeSidebarItem)?.label || 'Institutional Legacy' }
      ]}
      sidebarItems={sidebarItems}
      activeItem={activeSidebarItem}
      onSelectSidebarItem={setActiveSidebarItem}
      onNavigateTab={onNavigateTab}
    >
      {/* 1. OVERVIEW & HISTORY */}
      {activeSidebarItem === 'overview' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <Landmark className="w-6 h-6 text-amber-600" />
              Institutional Background & Legacy
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Managed by {collegeInfo.trustName || 'Late. Madanlalji - Kisanlalji Sancheti Seva Samiti, Malkapur'}
            </p>
          </div>

          <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
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
      )}

      {/* 2. IN MEMORY OF */}
      {activeSidebarItem === 'memory' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <Heart className="w-6 h-6 text-amber-600" />
              In Memory of Late Shaktikumar Sancheti
            </h2>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
            <img
              src={collegeInfo.shaktikumarImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"}
              alt="Late Shaktikumar Sancheti"
              className="w-32 h-32 rounded-full object-cover border-4 border-amber-500 shadow shrink-0"
            />
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800 block">
                INSPIRING FOUNDER & VISIONARY
              </span>
              <h3 className="text-xl font-bold font-serif text-[#0A2342]">
                Late Shaktikumar Sancheti
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {collegeInfo.shaktikumarMessage || "A visionary philanthropist and dedicated patron of education, Late Shri Shaktikumar Sancheti believed that knowledge is the greatest gift one can give to society. This institution stands as a lasting tribute to his unwavering commitment to rural development and the empowerment of India's dairy sector."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. VISION & MISSION */}
      {activeSidebarItem === 'vision_mission' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-600" />
              Vision & Mission Statements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0A2342] text-white p-6 rounded-2xl shadow space-y-3">
              <h3 className="text-lg font-bold font-serif text-amber-400">Our Vision</h3>
              <p className="text-slate-200 text-xs leading-relaxed">
                {collegeInfo.vision}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-bold font-serif text-[#0A2342]">Our Mission</h3>
              <ul className="space-y-2 text-slate-700 text-xs">
                {(collegeInfo.mission || []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. RECOGNITION & AFFILIATIONS */}
      {activeSidebarItem === 'affiliations' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
              Recognitions & University Affiliations
            </h2>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold text-sm">MAFSU University Affiliation</strong>
                <p>{collegeInfo.affiliation || 'Affiliated to Maharashtra Animal & Fishery Sciences University (MAFSU), Nagpur ( मपाविवि/प.वि./शा./स.शा.अ.(60)/ नस्ती क्र. 281/739/26 17/07/2026)'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-slate-200 pt-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold text-sm">State Government Approval</strong>
                <p>{collegeInfo.approval || 'Approved by the State Government of Maharashtra (DAHD-12024/73/2026-AH(1696785) 16/07/2026)'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. QUICK FACTS */}
      {activeSidebarItem === 'glance' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <Info className="w-6 h-6 text-amber-600" />
              Institutional Quick Facts
            </h2>
          </div>

          <div className="bg-[#0A2342] text-white p-6 rounded-2xl shadow space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-blue-900/60">
              <span className="text-slate-300">Established Year:</span>
              <strong className="text-white font-mono">{collegeInfo.establishedYear}</strong>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-900/60">
              <span className="text-slate-300">Campus Area:</span>
              <strong className="text-white">{collegeInfo.campusArea}</strong>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-900/60">
              <span className="text-slate-300">Degree Program:</span>
              <strong className="text-amber-400">B.Tech (Dairy Technology)</strong>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-900/60">
              <span className="text-slate-300">Program Duration:</span>
              <strong className="text-white">4 Years (8 Semesters)</strong>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-blue-900/60">
              <span className="text-slate-300">Pilot Dairy Capacity:</span>
              <strong className="text-amber-400 font-mono">10,000 LPD</strong>
            </div>
          </div>
        </div>
      )}

    </InnerPageLayout>
  );
};
