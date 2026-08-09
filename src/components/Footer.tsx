import React from 'react';
import { CollegeInfo } from '../types';
import { 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  GraduationCap,
  BookOpen,
  Building2,
  Image as ImageIcon,
  Award
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
    <footer className="w-full font-sans bg-[#071931] text-white">
      
      {/* "Explore LSSCDT" Grid Section - From Attachment 1 */}
      <div className="bg-[#0A2342] py-12 px-4 sm:px-8 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
              Explore LSSCDT
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { id: 'admissions', label: 'Admissions' },
              { id: 'academics', label: 'Academics' },
              { id: 'departments', label: 'Departments' },
              { id: 'facilities', label: 'Results' },
              { id: 'notices', label: 'Gallery' },
              { id: 'contact', label: 'Contact' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#123158]/90 hover:bg-[#183B6B] border border-blue-400/20 rounded-xl p-6 text-center transition-all group hover:scale-[1.03] shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white group-hover:text-amber-300">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer - Deep Navy (#071931) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: LSSCDT Branding & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {collegeInfo.logoImage && (
                <img 
                  src={collegeInfo.logoImage} 
                  alt={collegeInfo.name} 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 object-contain bg-white/10 rounded-lg p-1"
                />
              )}
              <div>
                <h3 className="text-xl font-extrabold text-[#EAB308] font-serif tracking-wide leading-tight">
                  LSSCDT
                </h3>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                  Malkapur, MH
                </p>
                <p className="text-[10px] text-amber-300 font-medium">
                  Managed by {collegeInfo.trustName || 'Late. Madanlalji - Kisanlalji Sancheti Seva Samiti, Malkapur (Registration No. Maharashtra 2563/Date. 14/07/92 buldhana F2652/Date. 20/01/93)'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
              Late Shaktikumar Sancheti College of Dairy Technology is a premier institution dedicated to creating leaders in dairy science and technology in Maharashtra.
            </p>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-[#123158] hover:bg-[#D97706] hover:text-slate-950 text-slate-200 flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#123158] hover:bg-[#D97706] hover:text-slate-950 text-slate-200 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#123158] hover:bg-[#D97706] hover:text-slate-950 text-slate-200 flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#123158] hover:bg-[#D97706] hover:text-slate-950 text-slate-200 flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white font-serif">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {[
                { id: 'about', label: 'About College' },
                { id: 'academics', label: 'Academics' },
                { id: 'departments', label: 'Departments' },
                { id: 'facilities', label: 'College Facilities' },
                { id: 'notices', label: 'Gallery & Notices' },
                { id: 'admissions', label: 'Online Admissions' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      onNavigate(link.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white font-serif">
              Contact Us
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#EAB308] shrink-0 mt-0.5" />
                <span>{collegeInfo.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#EAB308] shrink-0" />
                <span>{collegeInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#EAB308] shrink-0" />
                <span>{collegeInfo.email.split('/')[0].trim()}</span>
              </div>
            </div>
          </div>

          {/* Column 4: Location Map */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-white font-serif">
              Location
            </h4>
            <div className="w-full h-36 rounded-xl overflow-hidden border border-blue-900/60 bg-[#123158]">
              <iframe
                title="College Location Map"
                src="https://maps.google.com/maps?q=Dasarkhed%20MIDC%20Road,%20Malkapur&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-blue-900/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Late Shaktikumar Sancheti College of Dairy Technology. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('contact')} className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </button>
            <span>|</span>
            <button onClick={onOpenAdmin} className="hover:text-amber-400 transition-colors">
              Admin Console
            </button>
          </div>
        </div>

      </div>

    </footer>
  );
};
