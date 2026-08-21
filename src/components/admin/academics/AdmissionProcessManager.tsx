import React, { useState, useEffect } from 'react';
import { AdmissionProcessSection, AdmissionProcessStepItem } from '../../../types';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Save, FileCheck, ExternalLink } from 'lucide-react';

interface AdmissionProcessManagerProps {
  data: AdmissionProcessSection;
  onSave: (updated: AdmissionProcessSection) => Promise<void>;
}

export const AdmissionProcessManager: React.FC<AdmissionProcessManagerProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<AdmissionProcessSection>(data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  // New Step State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkText, setNewLinkText] = useState('');

  const handleFieldChange = (field: keyof AdmissionProcessSection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStep = () => {
    if (!newTitle.trim()) return;
    const currentSteps = formData.steps || [];
    const nextStepNumber = currentSteps.length + 1;
    const newStep: AdmissionProcessStepItem = {
      id: `step-${Date.now()}`,
      stepNumber: nextStepNumber,
      title: newTitle.trim(),
      description: newDesc.trim(),
      linkUrl: newLinkUrl.trim() || undefined,
      linkText: newLinkText.trim() || undefined,
      isActive: true,
      displayOrder: nextStepNumber
    };
    setFormData(prev => ({
      ...prev,
      steps: [...currentSteps, newStep]
    }));
    setNewTitle('');
    setNewDesc('');
    setNewLinkUrl('');
    setNewLinkText('');
  };

  const handleRemoveStep = (id: string) => {
    const remaining = (formData.steps || []).filter(s => s.id !== id);
    const renumbered = remaining.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
      displayOrder: idx + 1
    }));
    setFormData(prev => ({ ...prev, steps: renumbered }));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.steps || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    const renumbered = list.map((s, idx) => ({
      ...s,
      stepNumber: idx + 1,
      displayOrder: idx + 1
    }));
    setFormData(prev => ({ ...prev, steps: renumbered }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('AdmissionProcess save error:', err);
      alert(`Failed to save admission process: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header & Active Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm font-serif">Admission Process & Workflow</h3>
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

      {/* Main Process Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Introductory Workflow Description</label>
          <textarea
            rows={2}
            value={formData.introText || ''}
            onChange={(e) => handleFieldChange('introText', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">CAP / State CET Registration Portal URL</label>
          <input
            type="text"
            value={formData.capRegistrationUrl || ''}
            onChange={(e) => handleFieldChange('capRegistrationUrl', e.target.value)}
            placeholder="https://cetcell.mahacet.org/"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">CAP Portal Button Label</label>
          <input
            type="text"
            value={formData.capRegistrationButtonText || ''}
            onChange={(e) => handleFieldChange('capRegistrationButtonText', e.target.value)}
            placeholder="e.g. Visit State CET Cell Portal"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-xs font-serif uppercase tracking-wide">Admission Workflow Steps</h4>
            <p className="text-[11px] text-slate-500">Add, edit, reorder or remove individual steps from the centralized admission sequence</p>
          </div>
        </div>

        {/* Existing Steps */}
        <div className="space-y-2.5">
          {(formData.steps || []).map((step, idx) => (
            <div key={step.id || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-extrabold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                    Step {step.stepNumber || idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const list = [...(formData.steps || [])];
                      list[idx] = { ...list[idx], title: e.target.value };
                      setFormData(prev => ({ ...prev, steps: list }));
                    }}
                    placeholder="Step Title"
                    className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 flex-1"
                  />
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveStep(idx, 'down')}
                    disabled={idx === (formData.steps?.length || 0) - 1}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(step.id)}
                    className="p-1 rounded hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                value={step.description || ''}
                onChange={(e) => {
                  const list = [...(formData.steps || [])];
                  list[idx] = { ...list[idx], description: e.target.value };
                  setFormData(prev => ({ ...prev, steps: list }));
                }}
                placeholder="Step Detailed Description"
                className="text-xs text-slate-700 bg-white border border-slate-300 rounded p-2 w-full outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={step.linkUrl || ''}
                  onChange={(e) => {
                    const list = [...(formData.steps || [])];
                    list[idx] = { ...list[idx], linkUrl: e.target.value };
                    setFormData(prev => ({ ...prev, steps: list }));
                  }}
                  placeholder="Optional Link URL (https://...)"
                  className="text-xs text-slate-700 bg-white border border-slate-300 rounded px-2 py-1 outline-none"
                />
                <input
                  type="text"
                  value={step.linkText || ''}
                  onChange={(e) => {
                    const list = [...(formData.steps || [])];
                    list[idx] = { ...list[idx], linkText: e.target.value };
                    setFormData(prev => ({ ...prev, steps: list }));
                  }}
                  placeholder="Optional Link Text (e.g. Visit Portal)"
                  className="text-xs text-slate-700 bg-white border border-slate-300 rounded px-2 py-1 outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add New Step Box */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Add New Admission Step</span>
          </div>
          <input
            type="text"
            placeholder="Step Title (e.g. Special Spot Allotment Round)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
          />
          <textarea
            rows={2}
            placeholder="Step Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Optional Link URL (https://...)"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Optional Link Text (e.g. Click Here)"
              value={newLinkText}
              onChange={(e) => setNewLinkText(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAddStep}
            disabled={!newTitle.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add Step
          </button>
        </div>
      </div>
    </form>
  );
};
