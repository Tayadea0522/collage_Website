import React, { useState } from 'react';
import { CurriculumSyllabusSection, SemesterCurriculum, CurriculumCourse } from '../../../types';
import { supabaseStorageService } from '../../../services/supabaseStorageService';
import { Plus, Trash2, CheckCircle2, Save, BookOpen, Upload, FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface CurriculumManagerProps {
  data: CurriculumSyllabusSection;
  onSave: (updated: CurriculumSyllabusSection) => Promise<void>;
}

export const CurriculumManager: React.FC<CurriculumManagerProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<CurriculumSyllabusSection>(data);
  const [activeSemIndex, setActiveSemIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState(false);

  // New Course state for active semester
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCredits, setNewCredits] = useState('');
  const [newTheory, setNewTheory] = useState('');
  const [newPractical, setNewPractical] = useState('');

  const currentSem = (formData.semesters || [])[activeSemIndex] || (formData.semesters || [])[0];

  const handleFieldChange = (field: keyof CurriculumSyllabusSection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Upload Syllabus PDF
  const handleSyllabusUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      alert('Syllabus PDF exceeds 30MB limit.');
      return;
    }
    setIsUploadingSyllabus(true);
    try {
      const uploadResult = await supabaseStorageService.uploadWebsiteDocument('downloads', file);
      if (uploadResult && (uploadResult.publicUrl || (uploadResult as any).url)) {
        const url = uploadResult.publicUrl || (uploadResult as any).url;
        setFormData(prev => ({
          ...prev,
          syllabusPdfUrl: url,
          syllabusPdfStoragePath: uploadResult.storagePath,
          syllabusPdfFileName: file.name
        }));
      }
    } catch (err: any) {
      alert(`Syllabus upload failed: ${err.message || err}`);
    } finally {
      setIsUploadingSyllabus(false);
    }
  };

  const handleRemoveSyllabusPdf = () => {
    setFormData(prev => ({
      ...prev,
      syllabusPdfUrl: undefined,
      syllabusPdfStoragePath: undefined,
      syllabusPdfFileName: undefined
    }));
  };

  const handleAddCourseToActiveSem = () => {
    if (!newTitle.trim()) return;
    const newCourse: CurriculumCourse = {
      id: `course-${Date.now()}`,
      code: newCode.trim() || 'DT-100',
      title: newTitle.trim(),
      credits: newCredits.trim() || '3 (2+1)',
      theoryCredits: newTheory.trim() || '2',
      practicalCredits: newPractical.trim() || '1'
    };

    const sems = [...(formData.semesters || [])];
    if (sems[activeSemIndex]) {
      sems[activeSemIndex] = {
        ...sems[activeSemIndex],
        courses: [...(sems[activeSemIndex].courses || []), newCourse]
      };
      setFormData(prev => ({ ...prev, semesters: sems }));
    }

    setNewCode('');
    setNewTitle('');
    setNewCredits('');
    setNewTheory('');
    setNewPractical('');
  };

  const handleRemoveCourse = (courseId: string) => {
    const sems = [...(formData.semesters || [])];
    if (sems[activeSemIndex]) {
      sems[activeSemIndex] = {
        ...sems[activeSemIndex],
        courses: (sems[activeSemIndex].courses || []).filter(c => c.id !== courseId)
      };
      setFormData(prev => ({ ...prev, semesters: sems }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header & Active Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm font-serif">Curriculum & 8-Semester Syllabus Manager</h3>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleFieldChange('isActive', e.target.checked)}
              className="w-4 h-4 rounded text-[#0A2342] focus:ring-amber-500"
            />
            <span>Active in Public Sidebar</span>
          </label>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Headings & Full Syllabus PDF */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Section Title</label>
          <input
            type="text"
            value={formData.sectionTitle || ''}
            onChange={(e) => handleFieldChange('sectionTitle', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Framework / Deans' Committee Version</label>
          <input
            type="text"
            value={formData.frameworkNote || ''}
            onChange={(e) => handleFieldChange('frameworkNote', e.target.value)}
            placeholder="e.g. As per ICAR VIth Deans' Committee Recommended Syllabus"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-2 md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="text-xs font-bold text-slate-800 block">Complete Academic Syllabus PDF</label>
          {formData.syllabusPdfUrl ? (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-emerald-900">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{formData.syllabusPdfFileName || 'Complete B.Tech Syllabus.pdf'}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={formData.syllabusPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={handleRemoveSyllabusPdf}
                  className="text-xs font-bold text-red-600 hover:text-red-800"
                >
                  Delete PDF
                </button>
              </div>
            </div>
          ) : (
            <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 transition-colors w-fit">
              {isUploadingSyllabus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Uploading Syllabus PDF...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Upload Complete Syllabus PDF</span>
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleSyllabusUpload(file);
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Semester Tabs Navigation */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs font-serif uppercase tracking-wide">Semester-Wise Subject Breakdown</h4>
          <span className="text-xs text-slate-500 font-medium">Click a semester to view and manage its subjects</span>
        </div>

        {/* Semester Buttons */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          {(formData.semesters || []).map((sem, idx) => (
            <button
              key={sem.semesterNumber || idx}
              type="button"
              onClick={() => setActiveSemIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSemIndex === idx
                  ? 'bg-[#0A2342] text-amber-400 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sem {sem.semesterNumber}
            </button>
          ))}
        </div>

        {/* Active Semester Editor */}
        {currentSem && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Semester Title</label>
                <input
                  type="text"
                  value={currentSem.title}
                  onChange={(e) => {
                    const sems = [...(formData.semesters || [])];
                    sems[activeSemIndex] = { ...sems[activeSemIndex], title: e.target.value };
                    setFormData(prev => ({ ...prev, semesters: sems }));
                  }}
                  className="w-full text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Academic Year</label>
                <input
                  type="text"
                  value={currentSem.academicYearLabel || ''}
                  onChange={(e) => {
                    const sems = [...(formData.semesters || [])];
                    sems[activeSemIndex] = { ...sems[activeSemIndex], academicYearLabel: e.target.value };
                    setFormData(prev => ({ ...prev, semesters: sems }));
                  }}
                  placeholder="e.g. First Year"
                  className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Total Credits</label>
                <input
                  type="text"
                  value={currentSem.totalCredits || ''}
                  onChange={(e) => {
                    const sems = [...(formData.semesters || [])];
                    sems[activeSemIndex] = { ...sems[activeSemIndex], totalCredits: e.target.value };
                    setFormData(prev => ({ ...prev, semesters: sems }));
                  }}
                  placeholder="e.g. 21 Credits"
                  className="w-full text-xs font-bold text-amber-700 bg-white border border-slate-300 rounded px-2 py-1"
                />
              </div>
            </div>

            {/* Courses Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">Course List for Semester {currentSem.semesterNumber}</div>
              <div className="space-y-1.5">
                {(currentSem.courses || []).map((c, cIdx) => (
                  <div key={c.id || cIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 text-xs">
                    <input
                      type="text"
                      value={c.code}
                      onChange={(e) => {
                        const sems = [...(formData.semesters || [])];
                        const courses = [...(sems[activeSemIndex].courses || [])];
                        courses[cIdx] = { ...courses[cIdx], code: e.target.value };
                        sems[activeSemIndex] = { ...sems[activeSemIndex], courses };
                        setFormData(prev => ({ ...prev, semesters: sems }));
                      }}
                      className="w-24 font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={c.title}
                      onChange={(e) => {
                        const sems = [...(formData.semesters || [])];
                        const courses = [...(sems[activeSemIndex].courses || [])];
                        courses[cIdx] = { ...courses[cIdx], title: e.target.value };
                        sems[activeSemIndex] = { ...sems[activeSemIndex], courses };
                        setFormData(prev => ({ ...prev, semesters: sems }));
                      }}
                      className="flex-1 font-medium text-slate-900 bg-white border border-slate-300 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={c.credits}
                      onChange={(e) => {
                        const sems = [...(formData.semesters || [])];
                        const courses = [...(sems[activeSemIndex].courses || [])];
                        courses[cIdx] = { ...courses[cIdx], credits: e.target.value };
                        sems[activeSemIndex] = { ...sems[activeSemIndex], courses };
                        setFormData(prev => ({ ...prev, semesters: sems }));
                      }}
                      placeholder="Credits"
                      className="w-24 font-bold text-amber-800 bg-white border border-slate-300 rounded px-2 py-1 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(c.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Course Row */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. DT-111)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-28 p-1.5 bg-white border border-amber-300 rounded text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Course Title (e.g. Market Milk)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 min-w-[180px] p-1.5 bg-white border border-amber-300 rounded text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Credits (e.g. 3 (2+1))"
                  value={newCredits}
                  onChange={(e) => setNewCredits(e.target.value)}
                  className="w-28 p-1.5 bg-white border border-amber-300 rounded text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCourseToActiveSem}
                  disabled={!newTitle.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Course
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
