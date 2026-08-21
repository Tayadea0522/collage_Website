import React, { useState } from 'react';
import { IntakeCapacitySection, IntakeQuotaRow } from '../../../types';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Save, Users } from 'lucide-react';

interface IntakeCapacityManagerProps {
  data: IntakeCapacitySection;
  onSave: (updated: IntakeCapacitySection) => Promise<void>;
}

export const IntakeCapacityManager: React.FC<IntakeCapacityManagerProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<IntakeCapacitySection>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Quota Row state
  const [newTitle, setNewTitle] = useState('');
  const [newSeats, setNewSeats] = useState('');
  const [newBadge, setNewBadge] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleFieldChange = (field: keyof IntakeCapacitySection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddQuota = () => {
    if (!newTitle.trim()) return;
    const newRow: IntakeQuotaRow = {
      id: `quota-${Date.now()}`,
      title: newTitle.trim(),
      seatsOrPercentage: newSeats.trim(),
      badge: newBadge.trim() || 'Quota',
      description: newDesc.trim(),
      isActive: true,
      displayOrder: (formData.quotas?.length || 0) + 1
    };
    setFormData(prev => ({
      ...prev,
      quotas: [...(prev.quotas || []), newRow]
    }));
    setNewTitle('');
    setNewSeats('');
    setNewBadge('');
    setNewDesc('');
  };

  const handleRemoveQuota = (id: string) => {
    setFormData(prev => ({
      ...prev,
      quotas: (prev.quotas || []).filter(q => q.id !== id)
    }));
  };

  const handleMoveQuota = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.quotas || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setFormData(prev => ({ ...prev, quotas: list }));
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
          <Users className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm font-serif">Intake Capacity & Seat Matrix</h3>
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

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <label className="text-xs font-bold text-slate-700">Academic Year</label>
          <input
            type="text"
            value={formData.academicYear || ''}
            onChange={(e) => handleFieldChange('academicYear', e.target.value)}
            placeholder="e.g. 2026–27"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Total Sanctioned Seats</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.totalIntake || 64}
              onChange={(e) => handleFieldChange('totalIntake', parseInt(e.target.value) || 0)}
              className="w-1/3 p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              value={formData.totalIntakeLabel || ''}
              onChange={(e) => handleFieldChange('totalIntakeLabel', e.target.value)}
              placeholder="e.g. 64 Sanctioned Seats"
              className="w-2/3 p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">State Quota %</label>
          <input
            type="text"
            value={formData.stateQuotaPercentage || ''}
            onChange={(e) => handleFieldChange('stateQuotaPercentage', e.target.value)}
            placeholder="e.g. 80%"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">State Quota Description / Note</label>
          <input
            type="text"
            value={formData.stateQuotaNote || ''}
            onChange={(e) => handleFieldChange('stateQuotaNote', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Institutional Quota %</label>
          <input
            type="text"
            value={formData.institutionalQuotaPercentage || ''}
            onChange={(e) => handleFieldChange('institutionalQuotaPercentage', e.target.value)}
            placeholder="e.g. 20%"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-700">Institutional Quota Description / Note</label>
          <input
            type="text"
            value={formData.institutionalQuotaNote || ''}
            onChange={(e) => handleFieldChange('institutionalQuotaNote', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>
      </div>

      {/* Quotas & Weightages Table */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-xs font-serif uppercase tracking-wide">Category Quotas & Weightages</h4>
            <p className="text-[11px] text-slate-500">Manage individual seat distribution rows, weightage rules & percentages</p>
          </div>
        </div>

        {/* Existing Quota items */}
        <div className="space-y-2">
          {(formData.quotas || []).map((q, idx) => (
            <div key={q.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => {
                      const list = [...(formData.quotas || [])];
                      list[idx] = { ...list[idx], title: e.target.value };
                      setFormData(prev => ({ ...prev, quotas: list }));
                    }}
                    placeholder="Quota Title"
                    className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    value={q.seatsOrPercentage}
                    onChange={(e) => {
                      const list = [...(formData.quotas || [])];
                      list[idx] = { ...list[idx], seatsOrPercentage: e.target.value };
                      setFormData(prev => ({ ...prev, quotas: list }));
                    }}
                    placeholder="Seats or %"
                    className="text-xs text-amber-800 font-bold bg-white border border-slate-300 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    value={q.badge}
                    onChange={(e) => {
                      const list = [...(formData.quotas || [])];
                      list[idx] = { ...list[idx], badge: e.target.value };
                      setFormData(prev => ({ ...prev, quotas: list }));
                    }}
                    placeholder="Badge Label"
                    className="text-xs text-slate-700 bg-white border border-slate-300 rounded px-2 py-1"
                  />
                </div>
                <textarea
                  value={q.description}
                  rows={2}
                  onChange={(e) => {
                    const list = [...(formData.quotas || [])];
                    list[idx] = { ...list[idx], description: e.target.value };
                    setFormData(prev => ({ ...prev, quotas: list }));
                  }}
                  placeholder="Quota Description"
                  className="text-[11px] text-slate-600 bg-white border border-slate-300 rounded px-2 py-1 w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 pt-1">
                <button
                  type="button"
                  onClick={() => handleMoveQuota(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveQuota(idx, 'down')}
                  disabled={idx === (formData.quotas?.length || 0) - 1}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveQuota(q.id)}
                  className="p-1 rounded hover:bg-red-50 text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Quota Box */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Add Quota / Weightage Rule</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Quota Name (e.g. Sports / PwD Quota)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Seats or % (e.g. 5% Horizontal)"
              value={newSeats}
              onChange={(e) => setNewSeats(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Badge (e.g. Special Reservation)"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
          </div>
          <textarea
            rows={2}
            placeholder="Eligibility & rules description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
          />
          <button
            type="button"
            onClick={handleAddQuota}
            disabled={!newTitle.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add Quota Row
          </button>
        </div>
      </div>
    </form>
  );
};
