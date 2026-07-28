import React, { useState } from 'react';
import { DepartmentInfo } from '../types';
import { Microscope, CheckCircle2, User, BookOpen, Building2 } from 'lucide-react';

interface DepartmentsProps {
  departments: DepartmentInfo[];
}

export const Departments: React.FC<DepartmentsProps> = ({ departments }) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'dt');

  const selectedDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 rounded-2xl shadow-lg border border-amber-500/30">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
            Academic Divisions
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            Academic Departments & Research Labs
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Late Shaktikumar Sancheti College of Dairy Technology comprises five specialized academic departments equipped with modern research laboratories and expert faculty.
          </p>
        </div>
      </div>

      {/* Department Selector Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-200 no-scrollbar">
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDeptId(d.id)}
            className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
              selectedDeptId === d.id
                ? 'bg-blue-900 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span className="font-mono text-amber-400 font-extrabold">[{d.code}]</span>
            <span>{d.name.replace('Department of ', '')}</span>
          </button>
        ))}
      </div>

      {/* Selected Department Details View */}
      {selectedDept && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Text details - 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-800 text-xs font-mono font-bold px-3 py-1 rounded-full">
                    Department Code: {selectedDept.code}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
                  {selectedDept.name}
                </h2>
                <div className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <span>Head of Department: <strong>{selectedDept.head}</strong></span>
                </div>
              </div>

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedDept.description}
              </p>

              {/* Laboratories List */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-base font-serif flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Microscope className="w-5 h-5 text-emerald-600" />
                  Departmental Laboratories & Infrastructure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedDept.labs.map((lab, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{lab}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Courses / Subjects */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-base font-serif flex items-center gap-2 border-b border-slate-200 pb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Major Subjects Taught
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDept.keySubjects.map((subj, i) => (
                    <span key={i} className="bg-blue-50 text-blue-900 border border-blue-200 font-semibold text-xs px-3 py-1.5 rounded-lg">
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Department Image & Quick Info - 1 col */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-md border-2 border-amber-500">
                <img
                  src={selectedDept.image}
                  alt={selectedDept.name}
                  className="w-full h-56 object-cover"
                />
              </div>
              <div className="bg-slate-900 text-white p-5 rounded-2xl text-xs space-y-3">
                <h4 className="font-bold text-amber-300 font-serif">Department Highlights</h4>
                <p className="text-slate-300 leading-relaxed">
                  Equipped with commercial processing equipment and analytical instruments to support both undergraduate practical training and multi-disciplinary research projects.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
