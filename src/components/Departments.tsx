import React, { useState } from 'react';
import { DepartmentInfo } from '../types';
import { Microscope, CheckCircle2, User, BookOpen, Building2 } from 'lucide-react';
import { InnerPageLayout, SidebarItem } from './InnerPageLayout';

interface DepartmentsProps {
  departments: DepartmentInfo[];
  onNavigateTab?: (tab: string) => void;
}

export const Departments: React.FC<DepartmentsProps> = ({ departments, onNavigateTab }) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'dt');

  const selectedDept = departments.find(d => d.id === selectedDeptId) || departments[0];

  const sidebarItems: SidebarItem[] = departments.map(d => ({
    id: d.id,
    label: d.name.startsWith('Department of') ? d.name.replace('Department of ', '') : d.name,
    icon: Building2,
    badge: d.code
  }));

  return (
    <InnerPageLayout
      title="Academic Departments"
      categoryTag="Academic Divisions"
      subtitle="Specialized Departments, Testing Laboratories & Research Equipment"
      breadcrumbPath={[
        { label: 'Home', tab: 'home' },
        { label: 'Departments' },
        { label: selectedDept ? selectedDept.name : 'Department' }
      ]}
      sidebarItems={sidebarItems}
      activeItem={selectedDeptId}
      onSelectSidebarItem={setSelectedDeptId}
      onNavigateTab={onNavigateTab}
    >
      {selectedDept && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block mb-1">
                Department Code: {selectedDept.code}
              </span>
              <h2 className="text-2xl font-bold font-serif text-[#0A2342]">
                {selectedDept.name.startsWith('Department') ? selectedDept.name : `Department of ${selectedDept.name}`}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left 2 Cols: Details */}
            <div className="lg:col-span-2 space-y-6">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedDept.description}
              </p>

              {/* Head of Department Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0A2342] text-amber-400 flex items-center justify-center font-bold shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-amber-800 uppercase text-[10px]">Head of Department (HOD)</div>
                  <div className="font-bold text-[#0A2342] text-sm font-serif">{selectedDept.head || (selectedDept as any).headOfDepartment || 'Department Head'}</div>
                  <div className="text-slate-500 text-[11px]">Senior Faculty & Research Supervisor</div>
                </div>
              </div>

              {/* Major Laboratories List */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#0A2342] text-sm font-serif flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-amber-600" />
                  Laboratories & Practical Testing Facilities:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(selectedDept.labs || []).map((lab, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800">{lab}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Courses Handled */}
              <div className="space-y-3">
                <h3 className="font-bold text-[#0A2342] text-sm font-serif flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  Key Subjects & Courses Taught:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedDept.keySubjects || (selectedDept as any).keyCourses || []).map((course: string, idx: number) => (
                    <span key={idx} className="bg-slate-100 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200">
                      {course}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: Image & Stats */}
            <div className="space-y-4">
              <img
                src={selectedDept.image}
                alt={selectedDept.name}
                className="w-full h-52 object-cover rounded-xl shadow border border-slate-200"
              />
              <div className="bg-[#0A2342] text-white p-5 rounded-xl shadow space-y-2.5 text-xs">
                <h4 className="font-bold text-amber-400 font-serif text-xs uppercase tracking-wider">
                  Department Profile
                </h4>
                <div className="flex justify-between py-1 border-b border-blue-900/60">
                  <span className="text-slate-300">Teaching Faculty:</span>
                  <strong className="text-white">4 Expert Professors</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-900/60">
                  <span className="text-slate-300">Dedicated Labs:</span>
                  <strong className="text-white">{selectedDept.labs.length} Special Labs</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-900/60">
                  <span className="text-slate-300">Research Standard:</span>
                  <strong className="text-amber-400">ICAR Approved</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </InnerPageLayout>
  );
};
