import React, { useState } from 'react';
import { CoursesOfferedSection, CareerOpportunity } from '../../../types';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Save, BookOpen } from 'lucide-react';

interface CoursesOfferedManagerProps {
  data: CoursesOfferedSection;
  onSave: (updated: CoursesOfferedSection) => Promise<void>;
}

export const CoursesOfferedManager: React.FC<CoursesOfferedManagerProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<CoursesOfferedSection>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Career Opportunity state
  const [newCareerTitle, setNewCareerTitle] = useState('');
  const [newCareerDesc, setNewCareerDesc] = useState('');

  const handleFieldChange = (field: keyof CoursesOfferedSection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCareer = () => {
    if (!newCareerTitle.trim()) return;
    const newOpportunity: CareerOpportunity = {
      id: `career-${Date.now()}`,
      title: newCareerTitle.trim(),
      description: newCareerDesc.trim(),
      displayOrder: (formData.careerOpportunities?.length || 0) + 1
    };
    setFormData(prev => ({
      ...prev,
      careerOpportunities: [...(prev.careerOpportunities || []), newOpportunity]
    }));
    setNewCareerTitle('');
    setNewCareerDesc('');
  };

  const handleRemoveCareer = (id: string) => {
    setFormData(prev => ({
      ...prev,
      careerOpportunities: (prev.careerOpportunities || []).filter(c => c.id !== id)
    }));
  };

  const handleMoveCareer = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.careerOpportunities || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setFormData(prev => ({ ...prev, careerOpportunities: list }));
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
          <h3 className="font-bold text-slate-900 text-sm font-serif">Courses Offered Configuration</h3>
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

      {/* Main Course Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Degree Title (Short)</label>
          <input
            type="text"
            value={formData.degreeTitle || ''}
            onChange={(e) => handleFieldChange('degreeTitle', e.target.value)}
            placeholder="e.g. B.Tech (Dairy Technology)"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Full Course / Program Name</label>
          <input
            type="text"
            value={formData.courseName || ''}
            onChange={(e) => handleFieldChange('courseName', e.target.value)}
            placeholder="e.g. Bachelor of Technology in Dairy Technology"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Degree Type / Classification</label>
          <input
            type="text"
            value={formData.degreeType || ''}
            onChange={(e) => handleFieldChange('degreeType', e.target.value)}
            placeholder="e.g. 4-Year Full-Time Professional Degree Program"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Course Duration & Semesters</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.duration || ''}
              onChange={(e) => handleFieldChange('duration', e.target.value)}
              placeholder="e.g. 4 Years (8 Semesters)"
              className="w-2/3 p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <input
              type="number"
              value={formData.numberOfSemesters || 8}
              onChange={(e) => handleFieldChange('numberOfSemesters', parseInt(e.target.value) || 8)}
              placeholder="8"
              className="w-1/3 p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Affiliation Information</label>
          <input
            type="text"
            value={formData.affiliation || ''}
            onChange={(e) => handleFieldChange('affiliation', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Approval & Accreditation Information</label>
          <input
            type="text"
            value={formData.approvalInfo || ''}
            onChange={(e) => handleFieldChange('approvalInfo', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Curriculum Framework / Dean Committee Pattern</label>
          <input
            type="text"
            value={formData.curriculumPattern || ''}
            onChange={(e) => handleFieldChange('curriculumPattern', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Apply Button Text</label>
          <input
            type="text"
            value={formData.applyButtonText || ''}
            onChange={(e) => handleFieldChange('applyButtonText', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Apply Button Target URL / Action</label>
          <input
            type="text"
            value={formData.applyButtonUrl || ''}
            onChange={(e) => handleFieldChange('applyButtonUrl', e.target.value)}
            placeholder="'portal' or https://..."
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Career Opportunities List Management */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-xs font-serif uppercase tracking-wide">Career Scope & Placement Roles</h4>
            <p className="text-[11px] text-slate-500">Manage individual career pathways shown in the Courses Offered section</p>
          </div>
        </div>

        {/* Existing Career items */}
        <div className="space-y-2">
          {(formData.careerOpportunities || []).map((opp, idx) => (
            <div key={opp.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
              <div className="space-y-1 flex-1">
                <input
                  type="text"
                  value={opp.title}
                  onChange={(e) => {
                    const list = [...(formData.careerOpportunities || [])];
                    list[idx] = { ...list[idx], title: e.target.value };
                    setFormData(prev => ({ ...prev, careerOpportunities: list }));
                  }}
                  className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 w-full"
                />
                <textarea
                  value={opp.description}
                  rows={2}
                  onChange={(e) => {
                    const list = [...(formData.careerOpportunities || [])];
                    list[idx] = { ...list[idx], description: e.target.value };
                    setFormData(prev => ({ ...prev, careerOpportunities: list }));
                  }}
                  className="text-[11px] text-slate-600 bg-white border border-slate-300 rounded px-2 py-1 w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 pt-1">
                <button
                  type="button"
                  onClick={() => handleMoveCareer(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveCareer(idx, 'down')}
                  disabled={idx === (formData.careerOpportunities?.length || 0) - 1}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveCareer(opp.id)}
                  className="p-1 rounded hover:bg-red-50 text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Career Item Box */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Add Career Opportunity</span>
          </div>
          <input
            type="text"
            placeholder="Role Title (e.g. Dairy Plant Quality Assurance Executive)"
            value={newCareerTitle}
            onChange={(e) => setNewCareerTitle(e.target.value)}
            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
          />
          <textarea
            rows={2}
            placeholder="Role Description / Industry Scope"
            value={newCareerDesc}
            onChange={(e) => setNewCareerDesc(e.target.value)}
            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
          />
          <button
            type="button"
            onClick={handleAddCareer}
            disabled={!newCareerTitle.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add to List
          </button>
        </div>
      </div>
    </form>
  );
};
