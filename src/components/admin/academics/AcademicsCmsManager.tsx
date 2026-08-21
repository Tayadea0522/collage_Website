import React, { useState } from 'react';
import { AcademicsData, CollegeInfo } from '../../../types';
import { CoursesOfferedManager } from './CoursesOfferedManager';
import { IntakeCapacityManager } from './IntakeCapacityManager';
import { EligibilityManager } from './EligibilityManager';
import { AdmissionProcessManager } from './AdmissionProcessManager';
import { DocumentsRequiredManager } from './DocumentsRequiredManager';
import { FeesStructureManager } from './FeesStructureManager';
import { AdmissionEnquiryManager } from './AdmissionEnquiryManager';
import { ProspectusAndPortalManager } from './ProspectusAndPortalManager';
import { ProgramOverviewManager } from './ProgramOverviewManager';
import { CurriculumManager } from './CurriculumManager';
import { CalendarAndRegulationsManager } from './CalendarAndRegulationsManager';
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  FileCheck,
  FileText,
  CreditCard,
  Phone,
  Globe,
  Calendar,
  Layers
} from 'lucide-react';

interface AcademicsCmsManagerProps {
  collegeInfo: CollegeInfo;
  onSaveCollegeInfo: (updated: CollegeInfo) => Promise<CollegeInfo>;
}

type SubTab =
  | 'courses'
  | 'intake'
  | 'eligibility'
  | 'process'
  | 'documents'
  | 'fees'
  | 'enquiry'
  | 'portal-prospectus'
  | 'overview'
  | 'curriculum'
  | 'calendar-regulations';

export const AcademicsCmsManager: React.FC<AcademicsCmsManagerProps> = ({
  collegeInfo,
  onSaveCollegeInfo
}) => {
  const [activeTab, setActiveTab] = useState<SubTab>('courses');
  const academicsData: AcademicsData = collegeInfo.academicsData || {};

  const handleUpdateSection = async (sectionKey: keyof AcademicsData, data: any) => {
    const updatedAcademics: AcademicsData = {
      ...collegeInfo.academicsData,
      [sectionKey]: data
    };
    const updatedInfo: CollegeInfo = {
      ...collegeInfo,
      academicsData: updatedAcademics
    };
    await onSaveCollegeInfo(updatedInfo);
  };

  const handleUpdateMultiple = async (updates: Partial<AcademicsData>) => {
    const updatedAcademics: AcademicsData = {
      ...collegeInfo.academicsData,
      ...updates
    };
    const updatedInfo: CollegeInfo = {
      ...collegeInfo,
      academicsData: updatedAcademics
    };
    await onSaveCollegeInfo(updatedInfo);
  };

  const navItems = [
    {
      group: 'ADMISSIONS CMS',
      items: [
        { id: 'courses', label: 'Courses Offered', icon: BookOpen },
        { id: 'intake', label: 'Intake Capacity', icon: Users },
        { id: 'eligibility', label: 'Eligibility Criteria', icon: Award },
        { id: 'process', label: 'Admission Process', icon: FileCheck },
        { id: 'documents', label: 'Documents Required', icon: FileText },
        { id: 'fees', label: 'Fees Structure', icon: CreditCard },
        { id: 'enquiry', label: 'Admission Enquiry', icon: Phone },
        { id: 'portal-prospectus', label: 'Portal & Prospectus', icon: Globe }
      ]
    },
    {
      group: 'ACADEMICS CMS',
      items: [
        { id: 'overview', label: 'Program Overview', icon: Layers },
        { id: 'curriculum', label: 'Curriculum & Syllabus', icon: GraduationCap },
        { id: 'calendar-regulations', label: 'Calendar & Regulations', icon: Calendar }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A2342] to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-white">Academics & Admissions Page CMS</h2>
            <p className="text-xs text-slate-300">
              Manage complete content, eligibility rules, 8 semesters syllabus, category fee structures, PDF documents, and admission workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Sub-nav on Left / Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-4">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-extrabold font-serif tracking-wider text-slate-400 uppercase">
                  {group.group}
                </div>
                <div className="space-y-1">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id as SubTab)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-[#0A2342] text-amber-400 shadow-sm'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {activeTab === 'courses' && (
            <CoursesOfferedManager
              data={academicsData.coursesOffered || {}}
              onSave={(updated) => handleUpdateSection('coursesOffered', updated)}
            />
          )}

          {activeTab === 'intake' && (
            <IntakeCapacityManager
              data={academicsData.intakeCapacity || {}}
              onSave={(updated) => handleUpdateSection('intakeCapacity', updated)}
            />
          )}

          {activeTab === 'eligibility' && (
            <EligibilityManager
              data={academicsData.eligibility || {}}
              onSave={(updated) => handleUpdateSection('eligibility', updated)}
            />
          )}

          {activeTab === 'process' && (
            <AdmissionProcessManager
              data={academicsData.admissionProcess || {}}
              onSave={(updated) => handleUpdateSection('admissionProcess', updated)}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsRequiredManager
              data={academicsData.documentsRequired || {}}
              onSave={(updated) => handleUpdateSection('documentsRequired', updated)}
            />
          )}

          {activeTab === 'fees' && (
            <FeesStructureManager
              data={academicsData.feesStructure || {}}
              onSave={(updated) => handleUpdateSection('feesStructure', updated)}
            />
          )}

          {activeTab === 'enquiry' && (
            <AdmissionEnquiryManager
              data={academicsData.admissionEnquiry || {}}
              onSave={(updated) => handleUpdateSection('admissionEnquiry', updated)}
            />
          )}

          {activeTab === 'portal-prospectus' && (
            <ProspectusAndPortalManager
              portalData={academicsData.admissionPortal || {}}
              prospectusData={academicsData.admissionProspectus || {}}
              trackData={academicsData.trackApplicationStatus || {}}
              onSave={handleUpdateMultiple}
            />
          )}

          {activeTab === 'overview' && (
            <ProgramOverviewManager
              data={academicsData.programOverview || {}}
              onSave={(updated) => handleUpdateSection('programOverview', updated)}
            />
          )}

          {activeTab === 'curriculum' && (
            <CurriculumManager
              data={academicsData.curriculumSyllabus || {}}
              onSave={(updated) => handleUpdateSection('curriculumSyllabus', updated)}
            />
          )}

          {activeTab === 'calendar-regulations' && (
            <CalendarAndRegulationsManager
              calendarData={academicsData.academicCalendar || {}}
              regulationsData={academicsData.academicRegulations || {}}
              onSave={handleUpdateMultiple}
            />
          )}
        </div>
      </div>
    </div>
  );
};
