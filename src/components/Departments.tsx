import React, { useState } from 'react';
import { DepartmentInfo } from '../types';
import { Microscope, CheckCircle2, User, BookOpen } from 'lucide-react';

interface DepartmentsProps {
  departments: DepartmentInfo[];
}

export const Departments: React.FC<DepartmentsProps> = ({ departments }) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'dt');

  const selectedDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10 font-sans text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-[#0A2342] text-white p-8 sm:p-12 rounded-2xl shadow border-b-4 border-[#D97706]">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] bg-amber-500/10 px-3 py-1 rounded border border-[#D97706]/30">
            Academic Divisions
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            Academic Departments & Research Labs
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
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
                ? 'bg-[#0A2342] text-amber-400 shadow'
                : 'bg-[#F0F4F8] text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span className="font-mono text-[#D97706] font-extrabold">[{d.code}]</span>
            <span>{d.name.replace('Department of ', '')}</span>
          </button>
        ))}
      </div>

      {/* Selected Department Details View */}
      {selectedDept && (
        <div className="bg-[#F0F4F8] rounded-2xl p-6 sm:p-8 border border-slate-200/80 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Text details - 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0A2342] text-amber-400 text-xs font-mono font-bold px-3 py-1 rounded-full">
                    Department Code: {selectedDept.code}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#0A2342]">
                  {selectedDept.name}
                </h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed bg-white p-5 rounded-xl border border-slate-200">
                {selectedDept.description}
              </p>

              {/* Head of Department Info */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#0A2342] text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#D97706] uppercase">Head of Department (HOD)</div>
                  <div className="font-bold text-[#0A2342] text-base font-serif">{selectedDept.head || (selectedDept as any).headOfDepartment || 'Department Head'}</div>
                  <div className="text-xs text-slate-500">Senior Faculty & Research Supervisor</div>
                </div>
              </div>

              {/* Major Laboratories List */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#0A2342] text-base font-serif flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-[#D97706]" />
                  Laboratories & Practical Testing Facilities:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedDept.labs || []).map((lab, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800">{lab}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Courses Handled */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#0A2342] text-base font-serif flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#D97706]" />
                  Key Subjects & Courses Taught:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedDept.keySubjects || (selectedDept as any).keyCourses || []).map((course: string, idx: number) => (
                    <span key={idx} className="bg-white text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                      {course}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Department Image & Quick Summary */}
            <div className="space-y-4">
              <img
                src={selectedDept.image}
                alt={selectedDept.name}
                className="w-full h-64 object-cover rounded-2xl shadow border-2 border-slate-200"
              />
              <div className="bg-[#0A2342] text-white p-6 rounded-2xl shadow space-y-3 text-xs">
                <h4 className="font-bold text-amber-400 font-serif text-sm">
                  Department Statistics
                </h4>
                <div className="flex justify-between py-1.5 border-b border-blue-900/60">
                  <span className="text-slate-300">Teaching Faculty:</span>
                  <strong className="text-white">4 Expert Professors</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-blue-900/60">
                  <span className="text-slate-300">Dedicated Labs:</span>
                  <strong className="text-white">{selectedDept.labs.length} Special Labs</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-blue-900/60">
                  <span className="text-slate-300">Research Focus:</span>
                  <strong className="text-amber-400">ICAR Approved</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
