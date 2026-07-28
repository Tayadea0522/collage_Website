import React from 'react';
import { CollegeInfo } from '../types';
import { 
  GraduationCap, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Lock 
} from 'lucide-react';

interface FooterProps {
  collegeInfo: CollegeInfo;
  onNavigate: (tab: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  collegeInfo,
  onNavigate,
  onOpenAdmin
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-6 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        
        {/* Col 1: College Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight font-serif">
                {collegeInfo.shortName}
              </h3>
              <p className="text-xs text-amber-400 font-medium">College of Dairy Technology</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {collegeInfo.tagline}
          </p>
          <div className="text-xs space-y-1 text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <p className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> MAFSU Nagpur Affiliated
            </p>
            <p className="font-semibold text-amber-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> ICAR New Delhi Approved
            </p>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-amber-500/40 pb-2">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs">
            {[
              { id: 'home', label: 'Home Page' },
              { id: 'about', label: 'About College & History' },
              { id: 'academics', label: 'B.Tech (Dairy Technology) Program' },
              { id: 'admissions', label: 'Online Admission Portal 2026-27' },
              { id: 'departments', label: 'Departments & Laboratories' },
              { id: 'facilities', label: 'Experimental Dairy Plant' },
              { id: 'faculty', label: 'Faculty Directory' },
              { id: 'placements', label: 'Training & Placement Cell' },
            ].map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => {
                    onNavigate(link.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-1 duration-200"
                >
                  <span className="text-amber-500">›</span> {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Academic Programs */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-amber-500/40 pb-2">
            Academic Specializations
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>4-Year B.Tech (Dairy Technology) Degree</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Market Milk & Dairy Plant Engineering</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Cheese, Butter & Fermented Foods Tech</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Dairy Chemistry & Quality Assurance QC</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Microbiology & Probiotic Foods</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Hands-on Experiential In-Plant Training (ELP)</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={onOpenAdmin}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-400 px-3 py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Management Login</span>
            </button>
          </div>
        </div>

        {/* Col 4: Contact & Help */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-amber-500/40 pb-2">
            College Address & Contact
          </h4>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{collegeInfo.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{collegeInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{collegeInfo.email}</span>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200">
              <div className="font-bold text-xs text-amber-400 mb-0.5">Online Admission Enquiry:</div>
              <div className="text-xs font-mono font-bold text-white">{collegeInfo.admissionHelpline}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Legal & Affiliation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
        <div>
          © {new Date().getFullYear()} <strong className="text-white">{collegeInfo.name}</strong>. All Rights Reserved.
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <a href="https://mafsu.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
            MAFSU Website <ExternalLink className="w-3 h-3" />
          </a>
          <span>|</span>
          <a href="https://icar.org.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center gap-1 transition-colors">
            ICAR Portal <ExternalLink className="w-3 h-3" />
          </a>
          <span>|</span>
          <button onClick={() => onNavigate('contact')} className="hover:text-amber-400 transition-colors">
            Campus Location
          </button>
        </div>
      </div>
    </footer>
  );
};
