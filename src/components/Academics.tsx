import React, { useState } from 'react';
import { CheckCircle2, Award, Users, BookOpen, GraduationCap, Mail, Phone, Briefcase, Calendar, ShieldCheck, FileText } from 'lucide-react';
import { FacultyMember } from '../types';
import { InnerPageLayout, SidebarItem } from './InnerPageLayout';

interface AcademicsProps {
  faculty?: FacultyMember[];
  onNavigateTab?: (tab: string) => void;
}

export const Academics: React.FC<AcademicsProps> = ({ faculty: propsFaculty, onNavigateTab }) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('overview');
  const [activeSem, setActiveSem] = useState(1);
  const [facultyDeptFilter, setFacultyDeptFilter] = useState('All');

  const facultyList = propsFaculty || [];

  const filteredFaculty = facultyList.filter(f => {
    if (facultyDeptFilter === 'All') return true;
    return f.department?.toLowerCase().includes(facultyDeptFilter.toLowerCase());
  });

  const semesters = [
    {
      sem: 1,
      title: "Semester I - Foundational Dairy Science",
      courses: [
        { code: "DT-111", name: "Market Milk Processing", credits: "3 (2+1)" },
        { code: "DE-111", name: "Fluid Mechanics & Pumps", credits: "3 (2+1)" },
        { code: "DC-111", name: "Physical Chemistry of Milk", credits: "3 (2+1)" },
        { code: "DM-111", name: "Fundamentals of Microbiology", credits: "3 (2+1)" },
        { code: "DBM-111", name: "Milk Procurement & Supply Chain", credits: "2 (1+1)" },
        { code: "ENG-111", name: "Technical English & Communication", credits: "2 (1+1)" },
      ]
    },
    {
      sem: 2,
      title: "Semester II - Chemistry & Engineering Basics",
      courses: [
        { code: "DT-121", name: "Traditional Indian Dairy Products", credits: "3 (2+1)" },
        { code: "DE-121", name: "Thermodynamics & Steam Engineering", credits: "3 (2+1)" },
        { code: "DC-121", name: "Chemistry of Milk Constituents", credits: "3 (2+1)" },
        { code: "DM-121", name: "Starter Cultures & Fermented Milks", credits: "3 (2+1)" },
        { code: "DBM-121", name: "Dairy Economics & Statistics", credits: "3 (2+1)" },
      ]
    },
    {
      sem: 3,
      title: "Semester III - Processing Technology & Refrigeration",
      courses: [
        { code: "DT-211", name: "Fat-Rich Dairy Products (Ghee, Butter)", credits: "3 (2+1)" },
        { code: "DE-211", name: "Refrigeration & Air Conditioning", credits: "3 (2+1)" },
        { code: "DC-211", name: "Chemical Quality Assurance", credits: "3 (1+2)" },
        { code: "DM-211", name: "Microbiological Quality Assurance", credits: "3 (1+2)" },
        { code: "DBM-211", name: "Financial Management in Dairy Industry", credits: "2 (2+0)" },
      ]
    },
    {
      sem: 4,
      title: "Semester IV - Advanced Equipment & Products",
      courses: [
        { code: "DT-221", name: "Condensed & Dried Milks Technology", credits: "4 (3+1)" },
        { code: "DT-222", name: "Ice Cream & Frozen Desserts", credits: "3 (2+1)" },
        { code: "DE-221", name: "Dairy Process Engineering", credits: "3 (2+1)" },
        { code: "DC-221", name: "Food Chemistry & Human Nutrition", credits: "3 (2+1)" },
        { code: "DM-221", name: "Dairy Biotechnology & Enzymes", credits: "2 (2+0)" },
      ]
    },
    {
      sem: 5,
      title: "Semester V - Cheese & Plant Design",
      courses: [
        { code: "DT-311", name: "Cheese & Fermented Dairy Products", credits: "4 (3+1)" },
        { code: "DT-312", name: "Packaging of Dairy Products", credits: "3 (2+1)" },
        { code: "DE-311", name: "Instrumentation & Process Control", credits: "3 (2+1)" },
        { code: "DE-312", name: "Dairy Plant Design & Layout", credits: "3 (1+2)" },
        { code: "DBM-311", name: "Marketing & Export of Dairy Products", credits: "2 (2+0)" },
      ]
    },
    {
      sem: 6,
      title: "Semester VI - By-Products & Industrial Management",
      courses: [
        { code: "DT-321", name: "By-Product Technology & Effluent Treatment", credits: "3 (2+1)" },
        { code: "DT-322", name: "Sensory Evaluation of Dairy Products", credits: "2 (1+1)" },
        { code: "DE-321", name: "Food Engineering & Unit Operations", credits: "3 (2+1)" },
        { code: "DBM-321", name: "Entrepreneurship Development", credits: "3 (2+1)" },
        { code: "DBM-322", name: "Industrial Safety & Hygiene", credits: "2 (2+0)" },
      ]
    },
    {
      sem: 7,
      title: "Semester VII - In-Plant Hands-On Training (ELP)",
      courses: [
        { code: "ELP-411", name: "Commercial In-Plant Training in Commercial Dairy Plant (Amul / Katraj / Mother Dairy)", credits: "20 (0+20)" },
      ]
    },
    {
      sem: 8,
      title: "Semester VIII - Experiential Learning & Project",
      courses: [
        { code: "ELP-421", name: "Hands-on Processing at College Pilot Dairy Plant", credits: "10 (0+10)" },
        { code: "PRJ-422", name: "B.Tech Research Project & Seminar", credits: "10 (0+10)" },
      ]
    },
  ];

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Program Overview', icon: Award },
    { id: 'curriculum', label: 'Semester Curricula', icon: BookOpen, badge: '8 Sems' },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'faculties', label: 'Academic Faculty', icon: Users },
    { id: 'regulations', label: 'Academic Regulations', icon: ShieldCheck },
  ];

  return (
    <InnerPageLayout
      title="Academics & Curricula"
      categoryTag="Academic Programs"
      subtitle="B.Tech (Dairy Technology) Degree Program, ICAR Curricula & Academic Faculty"
      breadcrumbPath={[
        { label: 'Home', tab: 'home' },
        { label: 'Academics' },
        { label: sidebarItems.find(s => s.id === activeSidebarItem)?.label || 'Program Overview' }
      ]}
      sidebarItems={sidebarItems}
      activeItem={activeSidebarItem}
      onSelectSidebarItem={setActiveSidebarItem}
      onNavigateTab={onNavigateTab}
    >
      {/* 1. PROGRAM OVERVIEW */}
      {activeSidebarItem === 'overview' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-600" />
              B.Tech (Dairy Technology) Degree Program Specifications
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Approved by ICAR and affiliated to MAFSU Nagpur
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Degree Title</span>
              <div className="font-bold text-[#0A2342] text-sm">B.Tech (Dairy Technology)</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Course Duration</span>
              <div className="font-bold text-[#0A2342] text-sm">4 Years (8 Semesters)</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Medium of Instruction</span>
              <div className="font-bold text-[#0A2342] text-sm">English</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Curriculum Framework</span>
              <div className="font-bold text-amber-700 text-sm">ICAR VIth Deans' Committee</div>
            </div>
          </div>

          <div className="p-5 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-3">
            <h3 className="font-bold text-[#0A2342] text-sm font-serif">Eligibility & Admission Criteria:</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>XII Std. passed in 10+2 pattern from Maharashtra State Board of Higher Secondary Education or an equivalent examination with Physics, Chemistry and Biology/Mathematics and English.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>(Candidates, who had not offered Mathematics/biology, shall have to complete deficiency course as prescribed by respective University.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>In general Student with PCB/PCMB/PCM groups in HSC are eligible with valid score of MHTCET/NEET/JEE.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 2. CURRICULUM & SYLLABUS */}
      {activeSidebarItem === 'curriculum' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600" />
              Semester-Wise Syllabi & Course Scheme
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select a semester below to view course codes, titles, and credit hours.
            </p>
          </div>

          {/* Semester Selector Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {semesters.map((s) => (
              <button
                key={s.sem}
                onClick={() => setActiveSem(s.sem)}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                  activeSem === s.sem
                    ? 'bg-[#0A2342] text-amber-400 shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Sem {s.sem}
              </button>
            ))}
          </div>

          {/* Selected Semester Courses Table */}
          {semesters.find(s => s.sem === activeSem) && (
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-[#0A2342] font-serif border-l-4 border-amber-500 pl-3">
                {semesters.find(s => s.sem === activeSem)?.title}
              </h3>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0A2342] text-amber-400 font-bold">
                      <th className="p-3 rounded-tl-lg">Course Code</th>
                      <th className="p-3">Course Title</th>
                      <th className="p-3 rounded-tr-lg">Credit Hours (L+P)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {semesters.find(s => s.sem === activeSem)?.courses.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-amber-700">{c.code}</td>
                        <td className="p-3 font-medium text-slate-900">{c.name}</td>
                        <td className="p-3 text-slate-600 font-mono">{c.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ACADEMIC CALENDAR */}
      {activeSidebarItem === 'calendar' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-600" />
              Academic Calendar & Examination Schedule (2026–27)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#0A2342] uppercase block">Odd Semesters (Sem I, III, V, VII)</span>
              <ul className="space-y-1 text-slate-700">
                <li><strong>Commencement of Classes:</strong> August 1, 2026</li>
                <li><strong>Mid-Term Examinations:</strong> October 12–20, 2026</li>
                <li><strong>Semester End Theory & Practicals:</strong> December 10–24, 2026</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#0A2342] uppercase block">Even Semesters (Sem II, IV, VI, VIII)</span>
              <ul className="space-y-1 text-slate-700">
                <li><strong>Commencement of Classes:</strong> January 5, 2027</li>
                <li><strong>Mid-Term Examinations:</strong> March 15–22, 2027</li>
                <li><strong>Semester End Theory & Practicals:</strong> May 10–25, 2027</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACADEMIC FACULTY */}
      {activeSidebarItem === 'faculties' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                <Users className="w-6 h-6 text-amber-600" />
                Academic Faculty Directory
              </h2>
              <p className="text-xs text-slate-600">
                Experienced professors, associate professors & research scientists
              </p>
            </div>

            {/* Department Filter */}
            <select
              value={facultyDeptFilter}
              onChange={(e) => setFacultyDeptFilter(e.target.value)}
              className="p-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Technology">Dairy Technology</option>
              <option value="Chemistry">Dairy Chemistry</option>
              <option value="Microbiology">Dairy Microbiology</option>
              <option value="Engineering">Dairy Engineering</option>
              <option value="Business">Business Management</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFaculty.map((f) => (
              <div key={f.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-4 items-center">
                <img
                  src={f.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                  alt={f.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <h3 className="font-bold text-slate-900 text-sm">{f.name}</h3>
                  <span className="text-amber-800 font-extrabold block">{f.designation}</span>
                  <span className="text-slate-500 font-mono text-[11px] block">{f.department}</span>
                  <p className="text-slate-600 text-[11px]">Qualification: {f.qualification}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ACADEMIC REGULATIONS */}
      {activeSidebarItem === 'regulations' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
              Academic Regulations & Attendance Rules
            </h2>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-sm">Attendance Policy</strong>
              <p>Minimum 80% attendance in lectures and practicals is compulsory to appear for MAFSU end-term examinations.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-sm">Evaluation System</strong>
              <p>Continuous internal evaluation (20% mid-term + 10% practicals) + 70% University End-Semester Theory Examination.</p>
            </div>
          </div>
        </div>
      )}

    </InnerPageLayout>
  );
};
