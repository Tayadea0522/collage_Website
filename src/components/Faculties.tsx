import React, { useState } from 'react';
import { Users, GraduationCap, Briefcase, BookOpen, Mail, Phone, Search, Crown, Sparkles } from 'lucide-react';
import { FacultyMember } from '../types';
import { storageService } from '../services/storageService';

interface FacultiesProps {
  faculty?: FacultyMember[];
}

export const Faculties: React.FC<FacultiesProps> = ({ faculty: propsFaculty }) => {
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hodOnlyFilter, setHodOnlyFilter] = useState(false);

  const allFaculty = propsFaculty && propsFaculty.length > 0 ? propsFaculty : storageService.getFaculty();

  const filteredFaculty = allFaculty.filter((f) => {
    // Dept match
    if (selectedDept !== 'All' && !f.department?.toLowerCase().includes(selectedDept.toLowerCase())) {
      return false;
    }
    // HOD filter
    if (hodOnlyFilter && !f.isHOD) {
      return false;
    }
    // Search match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name?.toLowerCase().includes(q);
      const matchDesig = f.designation?.toLowerCase().includes(q);
      const matchDept = f.department?.toLowerCase().includes(q);
      const matchQual = f.qualification?.toLowerCase().includes(q);
      const matchSpec = f.specialization?.toLowerCase().includes(q);
      return matchName || matchDesig || matchDept || matchQual || matchSpec;
    }
    return true;
  });

  const departments = [
    'All',
    'Dairy Technology',
    'Dairy Engineering',
    'Dairy Chemistry',
    'Dairy Microbiology',
    'Dairy Business Management',
  ];

  const totalHODs = allFaculty.filter(f => f.isHOD).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 font-sans space-y-8">
      {/* Hero Header */}
      <div className="bg-[#0A2342] text-white p-8 sm:p-10 rounded-3xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold border border-amber-400/30">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Academic Excellence & Leadership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">
            Teaching Faculty & Department Heads
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Meet our esteemed professors, associate professors, and Heads of Departments (HODs) dedicated to empowering future leaders in Dairy Science and Technology.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search faculty by name, qualification, specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] bg-slate-50/50"
            />
          </div>

          {/* HOD Toggle Filter Pill */}
          <button
            type="button"
            onClick={() => setHodOnlyFilter(!hodOnlyFilter)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-2xs border ${
              hodOnlyFilter
                ? 'bg-[#0A2342] text-amber-300 border-[#0A2342] shadow-sm'
                : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Crown className={`w-4 h-4 ${hodOnlyFilter ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>{hodOnlyFilter ? 'Showing HODs Only' : `Show Heads of Dept (HODs) (${totalHODs})`}</span>
          </button>
        </div>

        {/* Department Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDept === dept
                  ? 'bg-[#0A2342] text-amber-400 shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {dept === 'All' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((f) => (
          <div
            key={f.id}
            className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
              f.isHOD ? 'border-amber-400/80 ring-1 ring-amber-400/40 bg-gradient-to-b from-amber-50/30 to-white' : 'border-slate-200'
            }`}
          >
            {f.isHOD && (
              <div className="absolute top-0 right-0 bg-[#0A2342] text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl border-l border-b border-amber-400/40 flex items-center gap-1 shadow-2xs">
                <Crown className="w-3 h-3 text-amber-400" /> HOD
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 w-fit inline-block">
                  {f.department || 'Teaching Faculty'}
                </span>
                <h3 className="text-xl font-extrabold text-[#0A2342] font-serif pt-1">{f.name}</h3>
                <div className="text-xs font-bold text-[#D97706]">{f.designation}</div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                {f.qualification && (
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div><strong className="text-slate-900">Qualification:</strong> {f.qualification}</div>
                  </div>
                )}

                {f.experience && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div><strong className="text-slate-900">Experience:</strong> {f.experience}</div>
                  </div>
                )}

                {f.specialization && (
                  <div className="flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div><strong className="text-slate-900">Specialization:</strong> {f.specialization}</div>
                  </div>
                )}
              </div>
            </div>

            {(f.email || f.phone) && (
              <div className="pt-3 border-t border-slate-100 mt-4 text-xs text-slate-600 space-y-1 font-mono">
                {f.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${f.email}`} className="hover:text-blue-900 hover:underline">{f.email}</a>
                  </div>
                )}
                {f.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{f.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm space-y-2">
          <p className="font-bold text-slate-700">No faculty members found matching your search or filters.</p>
          <p className="text-xs">Try selecting 'All Departments' or resetting search filters.</p>
        </div>
      )}
    </div>
  );
};
