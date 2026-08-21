import React, { useState } from 'react';
import { FeeStructureSection, FeeStructureRow } from '../../../types';
import { supabaseStorageService } from '../../../services/supabaseStorageService';
import { Plus, Trash2, ArrowUp, ArrowDown, CheckCircle2, Save, CreditCard, Upload, FileText, Loader2 } from 'lucide-react';

interface FeesStructureManagerProps {
  data: FeeStructureSection;
  onSave: (updated: FeeStructureSection) => Promise<void>;
}

export const FeesStructureManager: React.FC<FeesStructureManagerProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<FeeStructureSection>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // New Fee Row state
  const [newCategory, setNewCategory] = useState('');
  const [newTuition, setNewTuition] = useState('');
  const [newOther, setNewOther] = useState('');
  const [newTotal, setNewTotal] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleFieldChange = (field: keyof FeeStructureSection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRow = () => {
    if (!newCategory.trim()) return;
    const newRow: FeeStructureRow = {
      id: `fee-${Date.now()}`,
      category: newCategory.trim(),
      tuitionFee: newTuition.trim() || '₹ 0',
      otherFee: newOther.trim() || '₹ 0',
      totalNetFee: newTotal.trim() || '₹ 0',
      notes: newNotes.trim() || undefined,
      isActive: true,
      displayOrder: (formData.feeRows?.length || 0) + 1
    };
    setFormData(prev => ({
      ...prev,
      feeRows: [...(prev.feeRows || []), newRow]
    }));
    setNewCategory('');
    setNewTuition('');
    setNewOther('');
    setNewTotal('');
    setNewNotes('');
  };

  const handleRemoveRow = (id: string) => {
    setFormData(prev => ({
      ...prev,
      feeRows: (prev.feeRows || []).filter(r => r.id !== id)
    }));
  };

  const handleMoveRow = (index: number, direction: 'up' | 'down') => {
    const list = [...(formData.feeRows || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setFormData(prev => ({ ...prev, feeRows: list }));
  };

  // Upload Official Fee PDF
  const handleOfficialPdfUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit.');
      return;
    }
    setIsUploadingPdf(true);
    try {
      const uploadResult = await supabaseStorageService.uploadWebsiteDocument('downloads', file);
      if (uploadResult && (uploadResult.publicUrl || (uploadResult as any).url)) {
        const url = uploadResult.publicUrl || (uploadResult as any).url;
        setFormData(prev => ({
          ...prev,
          officialFeePdfUrl: url,
          officialFeePdfStoragePath: uploadResult.storagePath,
          officialFeePdfFileName: file.name
        }));
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleRemoveOfficialPdf = () => {
    setFormData(prev => ({
      ...prev,
      officialFeePdfUrl: undefined,
      officialFeePdfStoragePath: undefined,
      officialFeePdfFileName: undefined
    }));
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
          <CreditCard className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm font-serif">Fees Structure & Category Concessions</h3>
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

      {/* Main Section Headings & PDF Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Section Heading</label>
          <input
            type="text"
            value={formData.heading || ''}
            onChange={(e) => handleFieldChange('heading', e.target.value)}
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

        <div className="space-y-2 md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <label className="text-xs font-bold text-slate-800 block">Official Fee Structure Notification PDF (FRA / MAFSU)</label>
          {formData.officialFeePdfUrl ? (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-emerald-900">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{formData.officialFeePdfFileName || 'Official Fee Structure PDF'}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveOfficialPdf}
                className="text-xs font-bold text-red-600 hover:text-red-800"
              >
                Delete PDF
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 transition-colors w-fit">
              {isUploadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Uploading PDF to Supabase...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Upload Official Fee PDF</span>
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleOfficialPdfUpload(file);
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Fee Table Rows */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-slate-900 text-xs font-serif uppercase tracking-wide">Category-Wise Annual Fee Matrix</h4>
            <p className="text-[11px] text-slate-500">Manage rows for General, Reserved, EBC, NRI, and Management Quota breakdown</p>
          </div>
        </div>

        {/* Existing Rows */}
        <div className="space-y-3">
          {(formData.feeRows || []).map((row, idx) => (
            <div key={row.id || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                <input
                  type="text"
                  value={row.category}
                  onChange={(e) => {
                    const list = [...(formData.feeRows || [])];
                    list[idx] = { ...list[idx], category: e.target.value };
                    setFormData(prev => ({ ...prev, feeRows: list }));
                  }}
                  placeholder="Category Name"
                  className="font-bold text-xs text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 flex-1"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveRow(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveRow(idx, 'down')}
                    disabled={idx === (formData.feeRows?.length || 0) - 1}
                    className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="p-1 rounded hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tuition Fee</label>
                  <input
                    type="text"
                    value={row.tuitionFee}
                    onChange={(e) => {
                      const list = [...(formData.feeRows || [])];
                      list[idx] = { ...list[idx], tuitionFee: e.target.value };
                      setFormData(prev => ({ ...prev, feeRows: list }));
                    }}
                    className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded px-2 py-1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Other / Univ Fee</label>
                  <input
                    type="text"
                    value={row.otherFee}
                    onChange={(e) => {
                      const list = [...(formData.feeRows || [])];
                      list[idx] = { ...list[idx], otherFee: e.target.value };
                      setFormData(prev => ({ ...prev, feeRows: list }));
                    }}
                    className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded px-2 py-1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-700 uppercase">Total Net Fee</label>
                  <input
                    type="text"
                    value={row.totalNetFee}
                    onChange={(e) => {
                      const list = [...(formData.feeRows || [])];
                      list[idx] = { ...list[idx], totalNetFee: e.target.value };
                      setFormData(prev => ({ ...prev, feeRows: list }));
                    }}
                    className="w-full text-xs font-extrabold text-amber-900 bg-amber-50 border border-amber-300 rounded px-2 py-1"
                  />
                </div>
              </div>

              <input
                type="text"
                value={row.notes || ''}
                onChange={(e) => {
                  const list = [...(formData.feeRows || [])];
                  list[idx] = { ...list[idx], notes: e.target.value };
                  setFormData(prev => ({ ...prev, feeRows: list }));
                }}
                placeholder="Scholarship / MahaDBT / FRA subsidy notes"
                className="w-full text-xs text-slate-700 bg-white border border-slate-300 rounded px-2 py-1 outline-none"
              />
            </div>
          ))}
        </div>

        {/* Add New Row Box */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-700" />
            <span>Add New Fee Category Row</span>
          </div>
          <input
            type="text"
            placeholder="Category Name (e.g. TFWS - Tuition Fee Waiver Scheme)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Tuition Fee (e.g. ₹ 0)"
              value={newTuition}
              onChange={(e) => setNewTuition(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Other Fee (e.g. ₹ 15,000)"
              value={newOther}
              onChange={(e) => setNewOther(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Total (e.g. ₹ 15,000)"
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
              className="p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
            />
          </div>
          <input
            type="text"
            placeholder="Special scholarship conditions / notes"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs outline-none"
          />
          <button
            type="button"
            onClick={handleAddRow}
            disabled={!newCategory.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> Add Fee Row
          </button>
        </div>
      </div>
    </form>
  );
};
