import React, { useState } from 'react';
import { AcademicCalendarSection, AcademicRegulationsSection, AcademicCalendarEvent, AcademicRuleItem } from '../../../types';
import { supabaseStorageService } from '../../../services/supabaseStorageService';
import { Plus, Trash2, CheckCircle2, Save, Calendar, ShieldCheck, Upload, FileText, Loader2 } from 'lucide-react';

interface CalendarAndRegulationsManagerProps {
  calendarData: AcademicCalendarSection;
  regulationsData: AcademicRegulationsSection;
  onSave: (updated: {
    academicCalendar: AcademicCalendarSection;
    academicRegulations: AcademicRegulationsSection;
  }) => Promise<void>;
}

export const CalendarAndRegulationsManager: React.FC<CalendarAndRegulationsManagerProps> = ({
  calendarData,
  regulationsData,
  onSave
}) => {
  const [calendar, setCalendar] = useState<AcademicCalendarSection>(calendarData);
  const [regulations, setRegulations] = useState<AcademicRegulationsSection>(regulationsData);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingCalPdf, setIsUploadingCalPdf] = useState(false);
  const [isUploadingRegPdf, setIsUploadingRegPdf] = useState(false);

  // New Calendar Event state
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDates, setNewEventDates] = useState('');
  const [newEventSemester, setNewEventSemester] = useState('');
  const [newEventBadge, setNewEventBadge] = useState('');

  // New Regulation Rule state
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('Examination');

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) return;
    const newEvt: AcademicCalendarEvent = {
      id: `cal-evt-${Date.now()}`,
      title: newEventTitle.trim(),
      dates: newEventDates.trim(),
      semester: newEventSemester.trim() || undefined,
      badge: newEventBadge.trim() || undefined,
      isActive: true,
      displayOrder: (calendar.events?.length || 0) + 1
    };
    setCalendar(prev => ({
      ...prev,
      events: [...(prev.events || []), newEvt]
    }));
    setNewEventTitle('');
    setNewEventDates('');
    setNewEventSemester('');
    setNewEventBadge('');
  };

  const handleRemoveEvent = (id: string) => {
    setCalendar(prev => ({
      ...prev,
      events: (prev.events || []).filter(e => e.id !== id)
    }));
  };

  const handleAddRule = () => {
    if (!newRuleTitle.trim()) return;
    const newRule: AcademicRuleItem = {
      id: `rule-${Date.now()}`,
      title: newRuleTitle.trim(),
      description: newRuleDesc.trim(),
      category: newRuleCategory.trim() || undefined,
      isActive: true,
      displayOrder: (regulations.rules?.length || 0) + 1
    };
    setRegulations(prev => ({
      ...prev,
      rules: [...(prev.rules || []), newRule]
    }));
    setNewRuleTitle('');
    setNewRuleDesc('');
  };

  const handleRemoveRule = (id: string) => {
    setRegulations(prev => ({
      ...prev,
      rules: (prev.rules || []).filter(r => r.id !== id)
    }));
  };

  // Upload Calendar PDF
  const handleCalendarPdfUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingCalPdf(true);
    try {
      const uploadResult = await supabaseStorageService.uploadWebsiteDocument('downloads', file);
      if (uploadResult && (uploadResult.publicUrl || (uploadResult as any).url)) {
        const url = uploadResult.publicUrl || (uploadResult as any).url;
        setCalendar(prev => ({
          ...prev,
          calendarPdfUrl: url,
          calendarPdfStoragePath: uploadResult.storagePath,
          calendarPdfFileName: file.name
        }));
      }
    } catch (err: any) {
      alert(`Calendar PDF upload failed: ${err.message || err}`);
    } finally {
      setIsUploadingCalPdf(false);
    }
  };

  // Upload Regulations PDF
  const handleRegulationsPdfUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingRegPdf(true);
    try {
      const uploadResult = await supabaseStorageService.uploadWebsiteDocument('downloads', file);
      if (uploadResult && (uploadResult.publicUrl || (uploadResult as any).url)) {
        const url = uploadResult.publicUrl || (uploadResult as any).url;
        setRegulations(prev => ({
          ...prev,
          officialPdfUrl: url,
          officialPdfStoragePath: uploadResult.storagePath,
          officialPdfFileName: file.name
        }));
      }
    } catch (err: any) {
      alert(`Regulations PDF upload failed: ${err.message || err}`);
    } finally {
      setIsUploadingRegPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        academicCalendar: calendar,
        academicRegulations: regulations
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h3 className="font-bold text-slate-900 text-sm font-serif">Academic Calendar & University Regulations</h3>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Calendar & Regulations'}</span>
        </button>
      </div>

      {/* 1. ACADEMIC CALENDAR */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-900 text-sm font-serif">Academic Calendar Events</h4>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={calendar.isActive}
              onChange={(e) => setCalendar(c => ({ ...c, isActive: e.target.checked }))}
              className="w-4 h-4 rounded text-[#0A2342] focus:ring-amber-500"
            />
            <span>Active in Sidebar</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Calendar Title</label>
            <input
              type="text"
              value={calendar.title || ''}
              onChange={(e) => setCalendar(c => ({ ...c, title: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Academic Year / Term</label>
            <input
              type="text"
              value={calendar.academicYear || ''}
              onChange={(e) => setCalendar(c => ({ ...c, academicYear: e.target.value }))}
              placeholder="e.g. 2026–27"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-2 sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="text-xs font-bold text-slate-800 block">Official Academic Calendar PDF (MAFSU Circular)</label>
            {calendar.calendarPdfUrl ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-emerald-900">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">{calendar.calendarPdfFileName || 'MAFSU Academic Calendar.pdf'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href={calendar.calendarPdfUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-700 hover:underline">
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => setCalendar(c => ({ ...c, calendarPdfUrl: undefined, calendarPdfFileName: undefined }))}
                    className="text-xs font-bold text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 transition-colors w-fit">
                {isUploadingCalPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Uploading PDF...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>Upload Calendar PDF</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCalendarPdfUpload(file);
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-800">Academic Schedule Milestones</div>
          <div className="space-y-2">
            {(calendar.events || []).map((evt, idx) => (
              <div key={evt.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <input
                  type="text"
                  value={evt.title}
                  onChange={(e) => {
                    const list = [...(calendar.events || [])];
                    list[idx] = { ...list[idx], title: e.target.value };
                    setCalendar(c => ({ ...c, events: list }));
                  }}
                  className="flex-1 font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1"
                />
                <input
                  type="text"
                  value={evt.dates}
                  onChange={(e) => {
                    const list = [...(calendar.events || [])];
                    list[idx] = { ...list[idx], dates: e.target.value };
                    setCalendar(c => ({ ...c, events: list }));
                  }}
                  placeholder="Dates"
                  className="w-44 text-amber-800 font-bold bg-white border border-slate-300 rounded px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveEvent(evt.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Milestone (e.g. Mid-Term Theory Examinations)"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 min-w-[200px] p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Dates (e.g. Oct 15 – Oct 22, 2026)"
              value={newEventDates}
              onChange={(e) => setNewEventDates(e.target.value)}
              className="w-48 p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleAddEvent}
              disabled={!newEventTitle.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Add Milestone
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACADEMIC REGULATIONS */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-900 text-sm font-serif">Academic Regulations & Examination Rules</h4>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={regulations.isActive}
              onChange={(e) => setRegulations(r => ({ ...r, isActive: e.target.checked }))}
              className="w-4 h-4 rounded text-[#0A2342] focus:ring-amber-500"
            />
            <span>Active in Sidebar</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Regulations Title</label>
            <input
              type="text"
              value={regulations.title || ''}
              onChange={(e) => setRegulations(r => ({ ...r, title: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Prescribing University / Authority</label>
            <input
              type="text"
              value={regulations.prescribingAuthority || ''}
              onChange={(e) => setRegulations(r => ({ ...r, prescribingAuthority: e.target.value }))}
              placeholder="e.g. MAFSU Nagpur Academic Council"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-2 sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="text-xs font-bold text-slate-800 block">Complete Academic Regulations Rulebook PDF</label>
            {regulations.regulationsPdfUrl ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-emerald-900">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">{regulations.regulationsPdfFileName || 'MAFSU Academic Regulations.pdf'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href={regulations.regulationsPdfUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-700 hover:underline">
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => setRegulations(r => ({ ...r, regulationsPdfUrl: undefined, regulationsPdfFileName: undefined }))}
                    className="text-xs font-bold text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 transition-colors w-fit">
                {isUploadingRegPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Uploading Rulebook PDF...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>Upload Regulations PDF</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleRegulationsPdfUpload(file);
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Regulations Rules List */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-800">Key Academic Regulations & Standards</div>
          <div className="space-y-2">
            {(regulations.rules || []).map((rule, idx) => (
              <div key={rule.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={rule.title}
                    onChange={(e) => {
                      const list = [...(regulations.rules || [])];
                      list[idx] = { ...list[idx], title: e.target.value };
                      setRegulations(r => ({ ...r, rules: list }));
                    }}
                    className="flex-1 font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(rule.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={rule.description}
                  onChange={(e) => {
                    const list = [...(regulations.rules || [])];
                    list[idx] = { ...list[idx], description: e.target.value };
                    setRegulations(r => ({ ...r, rules: list }));
                  }}
                  className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded p-2 outline-none"
                />
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>Add Regulation Rule</span>
            </div>
            <input
              type="text"
              placeholder="Rule Title (e.g. Mandatory Attendance Standard)"
              value={newRuleTitle}
              onChange={(e) => setNewRuleTitle(e.target.value)}
              className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <textarea
              rows={2}
              placeholder="Regulation detailed text and penalties"
              value={newRuleDesc}
              onChange={(e) => setNewRuleDesc(e.target.value)}
              className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <button
              type="button"
              onClick={handleAddRule}
              disabled={!newRuleTitle.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Add Rule
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
