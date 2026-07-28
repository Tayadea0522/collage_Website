import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Award, Download, Clock, DollarSign, Calendar, Sparkles, FileText } from 'lucide-react';

export const Academics: React.FC = () => {
  const [activeSem, setActiveSem] = useState(1);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 sm:p-12 rounded-2xl shadow-lg border border-amber-500/30">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
            Academic Degree Program
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            Bachelor of Technology (B.Tech - Dairy Technology)
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A comprehensive 4-Year (8-Semester) professional degree program approved by ICAR and affiliated to MAFSU Nagpur, designed to generate industry-ready Dairy Technologists and Plant Managers.
          </p>
        </div>
      </div>

      {/* Program Overview & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            Degree Program Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Degree Title</span>
              <div className="font-bold text-slate-900 text-base">B.Tech (Dairy Technology)</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Course Duration</span>
              <div className="font-bold text-slate-900 text-base">4 Academic Years (8 Semesters)</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Medium of Instruction</span>
              <div className="font-bold text-slate-900 text-base">English</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Curriculum Framework</span>
              <div className="font-bold text-amber-600 text-base">ICAR Vth Deans' Committee</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-base font-serif">Eligibility & Admission Criteria:</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Passed 10+2 / HSC Science stream with Physics, Chemistry, Mathematics, and English (PCM / PCMB).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Minimum 50% aggregate marks for Open Category (40% for SC/ST/OBC/Differently Abled candidates of Maharashtra State).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Valid scorecard in <strong>MHT-CET (PCM/PCB)</strong> / <strong>ICAR AIEEA</strong> / <strong>NEET</strong> / <strong>JEE Main</strong>.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Seat Matrix & Intake */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold font-serif text-amber-300 border-b border-slate-800 pb-2">
            Annual Intake & Seat Matrix
          </h3>

          <div className="text-center bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-xs font-bold uppercase text-slate-400">Total Sanctioned Intake</div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">60 Seats / Year</div>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex justify-between items-center py-2 border-b border-slate-800">
              <span>State CAP Quota (Maharashtra):</span>
              <strong className="text-white font-mono">80% (48 Seats)</strong>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-slate-800">
              <span>ICAR All-India Quota:</span>
              <strong className="text-white font-mono">15% (9 Seats)</strong>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-slate-800">
              <span>Management / NRI Quota:</span>
              <strong className="text-white font-mono">5% (3 Seats)</strong>
            </li>
          </ul>

          <div className="pt-2">
            <a
              href="#syllabi"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 rounded-lg text-xs text-center block transition-all shadow"
            >
              Explore Semester-Wise Syllabus
            </a>
          </div>
        </div>
      </div>

      {/* Syllabus & Curriculum Tabs */}
      <div id="syllabi" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase text-amber-600">ICAR Approved Scheme</span>
            <h2 className="text-2xl font-bold font-serif text-slate-900">
              Semester-Wise Syllabi & Course Structure
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Select Semester:</span>
          </div>
        </div>

        {/* Semester Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {semesters.map((s) => (
            <button
              key={s.sem}
              onClick={() => setActiveSem(s.sem)}
              className={`py-2 px-3 rounded-lg text-xs font-extrabold transition-all text-center ${
                activeSem === s.sem
                  ? 'bg-blue-900 text-white shadow-md scale-105'
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
            <h3 className="text-lg font-bold text-blue-900 font-serif border-l-4 border-amber-500 pl-3">
              {semesters.find(s => s.sem === activeSem)?.title}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-3 font-semibold rounded-tl-lg">Course Code</th>
                    <th className="p-3 font-semibold">Course Title</th>
                    <th className="p-3 font-semibold rounded-tr-lg">Credit Hours (L+P)</th>
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

      {/* Fee Structure Table */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-3">
          Fee Structure (Academic Year 2026-27)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 font-semibold rounded-tl-lg">Category</th>
                <th className="p-3 font-semibold">Tuition Fee (Annual)</th>
                <th className="p-3 font-semibold">Other Fees (Lab/Lib/Exam)</th>
                <th className="p-3 font-semibold rounded-tr-lg">Net Payable (Approx)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">OPEN Category</td>
                <td className="p-3 font-mono">₹ 45,000</td>
                <td className="p-3 font-mono">₹ 12,500</td>
                <td className="p-3 font-mono font-bold text-emerald-700">₹ 57,500 / Year</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">OBC / EWS Category</td>
                <td className="p-3 font-mono">₹ 22,500 (50% Concession)</td>
                <td className="p-3 font-mono">₹ 12,500</td>
                <td className="p-3 font-mono font-bold text-emerald-700">₹ 35,000 / Year</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">SC / ST / VJNT Category</td>
                <td className="p-3 font-mono">₹ 0 (100% Scholarship)</td>
                <td className="p-3 font-mono">₹ 5,000</td>
                <td className="p-3 font-mono font-bold text-emerald-700">₹ 5,000 / Year</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-500 italic">
          * Government DBATU/MAHA-DBT scholarship schemes applicable for eligible Maharashtra state domicile students.
        </p>
      </div>

    </div>
  );
};
