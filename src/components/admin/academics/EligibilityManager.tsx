import React, { useState } from 'react';
import { EligibilitySection, EligibilityCriteriaItem } from '../../../types';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Save, Award } from 'lucide-react';

interface EligibilityManagerProps {
  data: EligibilitySection;
  onSave: (updated: EligibilitySection) => Promise<void>;
}

export const EligibilityManager: React.FC<EligibilityManagerProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<EligibilitySection>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Item State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubjects, setNewSubjects] = useState('');
  const [newMarks, setNewMarks] = useState('');
  const [newExams, setNewExams] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newBadge, setNewBadge] = useState('');

  const handleFieldChange = (field: keyof EligibilitySection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    if (!newTitle.trim()) return;
    const newItem: EligibilityCriteriaItem = {
      id: `el-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      requiredSubjects: newSubjects.trim() || undefined,
      minimumMarks: newMarks.trim() || undefined,
      entranceExams: newExams.trim() || undefined,
      notes: newNotes.trim() || undefined,
      badge: newBadge.trim() || 'Eligibility Criteria',
      isActive: true,
      displayOrder: (formData.items?.length || 0) + 1
    };
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
    setNewTitle('');
    setNewDesc('');
    setNewSubjects('');
    setNewMarks('');
    setNewExams('');
    setNewNotes('');
    setNewBadge('');
  };

  const handleRemoveItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== id)
    }));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.items || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setFormData(prev => ({ ...prev, items: list }));
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
          <Award className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm font-serif">Eligibility & Criteria Configuration</h3>
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

      {/* Main Section Headings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Section Main Heading</label>
          <input
            type="text"
            value={formData.heading || ''}
            onChange={(e) => handleFieldChange('heading', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Section Subtitle / Prescribing Authority</label>
          <input
            type="text"
            value={formData.subtitle || ''}
            onChange={(e) => handleFieldChange('subtitle', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>
      </div>

      {/* Criteria Cards Management */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-xs font-serif uppercase tracking-wide">Eligibility Criteria Cards</h4>
            <p className="text-[11px] text-slate-500">Manage individual qualifying condition cards shown in the Eligibility section</p>
          </div>
        </div>

        {/* Existing Items */}
        <div className="space-y-3">
          {(formData.items || []).map((item, idx) => (
            <div key={item.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">#{idx + 1}</span>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const list = [...(formData.items || [])];
                      list[idx] = { ...list[idx], title: e.target.value };
                      setFormData(prev => ({ ...prev, items: list }));
                    }}
                    placeholder="Criteria Title"
                    className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 flex-1"
                  />
                  <input
                    type="text"
                    value={item.badge || ''}
                    onChange={(e) => {
                      const list = [...(formData.items || [])];
                      list[idx] = { ...list[idx], badge: e.target.value };
                      setFormData(prev => ({ ...prev, items: list }));
                    }}
                    placeholder="Badge (e.g. Mandatory)"
                    className="text-xs text-slate-700 bg-white border border-slate-300 rounded px-2 py-1 w-32"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveItem(idx, 'down')}
                    disabled={idx === (formData.items?.length || 0) - 1}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 rounded hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Core Description</label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => {
                      const list = [...(formData.items || [])];
                      list[idx] = { ...list[idx], description: e.target.value };
                      setFormData(prev => ({ ...prev, items: list }));
                    }}
                    className="text-xs text-slate-700 bg-white border border-slate-300 rounded p-2 w-full outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Required Subjects</label>
                  <textarea
                    rows={2}
                    value={item.requiredSubjects || ''}
                    onChange={(e) => {
                      const list = [...(formData.items || [])];
                      list[idx] = { ...list[idx], requiredSubjects: e.target.value };
                      setFormData(prev => ({ ...prev, items: list }));
                    }}
                    placeholder="e.g. Physics, Chemistry, Math/Biology"
                    className="text-xs text-slate-700 bg-white border border-slate-300 rounded p-2 w-full outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Minimum Qualifying Marks (%)</label>
                  <input
                    type="text"
                    value={item.minimumMarks || ''}
                    onChange={(e) => {
                      const list = [...(formData.items || [])];
                      list[idx] = { ...list[idx], minimumMarks: e.target.value };
                      setFormData(prev => ({ ...prev, items: list }));
                    }}
                    placeholder="e.g. 50% for Open, 40% for Reserved"
                    className="text-xs text-slate-700 bg-white border border-slate-300 rounded p-2 w-full outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Entrance Exam Rules</label>
                  <input
                    type="text"
                    value={item.entranceExams || ''}
                    onChange={(e) => {
                      const list = [...(formData.items || [])];
                      list[idx] = { ...list[idx], entranceExams: e.target.value };
                      setFormData(prev => ({ ...prev, items: list }));
                    }}
                    placeholder="e.g. Non-zero score in MHT-CET / NEET / JEE"
                    className="text-xs text-slate-700 bg-white border border-slate-300 rounded p-2 w-full outline-none"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600">Special Notes & Remedial Information</label>
                  <input
                    type="text"
                    value={item.notes || ''}
                    onChange={(e) => {
                      const list = [...(formData.items || [])];
                      list[idx] = { ...list[idx], notes: e.target.value };
                      setFormData(prev => ({ ...prev, items: list }));
                    }}
                    placeholder="e.g. Deficiency course details for non-maths/biology students"
                    className="text-xs text-slate-700 bg-white border border-slate-300 rounded p-2 w-full outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Box */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Add Eligibility Condition Card</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Card Title (e.g. Diploma / Direct Second Year Admission)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Badge Label (e.g. Lateral Entry)"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Eligibility Condition Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Required Subjects"
              value={newSubjects}
              onChange={(e) => setNewSubjects(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Minimum Marks (%)"
              value={newMarks}
              onChange={(e) => setNewMarks(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAddItem}
            disabled={!newTitle.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add Eligibility Card
          </button>
        </div>
      </div>
    </form>
  );
};
