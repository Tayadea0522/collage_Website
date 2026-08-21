import React, { useState, useEffect } from 'react';
import { ProgramOverviewSection } from '../../../types';
import { supabaseStorageService } from '../../../services/supabaseStorageService';
import { Plus, Trash2, CheckCircle2, Save, Award, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ProgramOverviewManagerProps {
  data: ProgramOverviewSection;
  onSave: (updated: ProgramOverviewSection) => Promise<void>;
}

export const ProgramOverviewManager: React.FC<ProgramOverviewManagerProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<ProgramOverviewSection>(data || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingEntryExitImage, setIsUploadingEntryExitImage] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  // New list items
  const [newObjective, setNewObjective] = useState('');
  const [newHighlight, setNewHighlight] = useState('');

  const handleFieldChange = (field: keyof ProgramOverviewSection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    setFormData(prev => ({
      ...prev,
      objectives: [...(prev.objectives || []), newObjective.trim()]
    }));
    setNewObjective('');
  };

  const handleRemoveObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: (prev.objectives || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    setFormData(prev => ({
      ...prev,
      highlights: [...(prev.highlights || []), newHighlight.trim()]
    }));
    setNewHighlight('');
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData(prev => ({
      ...prev,
      highlights: (prev.highlights || []).filter((_, idx) => idx !== index)
    }));
  };

  // Image Upload
  const handleImageFile = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size exceeds 10MB limit.');
      return;
    }
    setIsUploadingImage(true);
    try {
      const uploadUrl = await supabaseStorageService.uploadImage(file, 'general');
      if (uploadUrl) {
        setFormData(prev => ({ ...prev, imageUrl: uploadUrl }));
      }
    } catch (err: any) {
      alert(`Image upload failed: ${err.message || err}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Entry and Exit Diagram Image Upload
  const handleEntryExitImageFile = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size exceeds 10MB limit.');
      return;
    }
    setIsUploadingEntryExitImage(true);
    try {
      const uploadUrl = await supabaseStorageService.uploadImage(file, 'general');
      if (uploadUrl) {
        setFormData(prev => ({
          ...prev,
          entryExitImageUrl: uploadUrl,
          entryExitOptions: {
            ...prev.entryExitOptions,
            imageUrl: uploadUrl
          }
        }));
      }
    } catch (err: any) {
      alert(`Entry & Exit diagram upload failed: ${err.message || err}`);
    } finally {
      setIsUploadingEntryExitImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('ProgramOverview save error:', err);
      alert(`Failed to save program overview: ${err?.message || err}`);
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
          <h3 className="font-bold text-slate-900 text-sm font-serif">Program Overview & Specifications</h3>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Program Title</label>
          <input
            type="text"
            value={formData.programTitle || ''}
            onChange={(e) => handleFieldChange('programTitle', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Degree Name</label>
          <input
            type="text"
            value={formData.degreeName || ''}
            onChange={(e) => handleFieldChange('degreeName', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Course Duration</label>
          <input
            type="text"
            value={formData.duration || ''}
            onChange={(e) => handleFieldChange('duration', e.target.value)}
            placeholder="e.g. 4 Years (8 Semesters)"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700">Medium of Instruction</label>
          <input
            type="text"
            value={formData.mediumOfInstruction || ''}
            onChange={(e) => handleFieldChange('mediumOfInstruction', e.target.value)}
            placeholder="e.g. English"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Curriculum Framework</label>
          <input
            type="text"
            value={formData.curriculumFramework || ''}
            onChange={(e) => handleFieldChange('curriculumFramework', e.target.value)}
            placeholder="e.g. ICAR VIth Deans' Committee"
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">University Affiliation</label>
          <input
            type="text"
            value={formData.affiliation || ''}
            onChange={(e) => handleFieldChange('affiliation', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700">Government Approval</label>
          <input
            type="text"
            value={formData.approval || ''}
            onChange={(e) => handleFieldChange('approval', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>

        <div className="space-y-1 sm:col-span-4">
          <label className="text-xs font-bold text-slate-700">Comprehensive Program Description</label>
          <textarea
            rows={3}
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none"
          />
        </div>
      </div>

      {/* Program Image Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
        <label className="text-xs font-bold text-slate-800 block">Program Feature Image</label>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {formData.imageUrl && (
            <img 
              src={formData.imageUrl} 
              alt="Program Preview" 
              className="w-32 h-20 object-cover rounded-lg border border-slate-300 shrink-0" 
            />
          )}
          <div className="flex-1 space-y-2 w-full">
            <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 transition-colors w-fit">
              {isUploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Uploading Image...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>Choose Image File (JPG, PNG, WEBP max 5MB)</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageFile(file);
                }}
              />
            </label>
            <input
              type="text"
              value={formData.imageUrl || ''}
              onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
              placeholder="Or paste external image URL (https://...)"
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* Entry and Exit Options Diagram Card */}
      <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">NEP / ICAR Framework</span>
            <h4 className="text-sm font-bold text-[#0A2342] font-serif">Entry and Exit Options Diagram (Fig. 1)</h4>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.entryExitOptions?.isVisible !== false}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                entryExitOptions: {
                  ...prev.entryExitOptions,
                  isVisible: e.target.checked
                }
              }))}
              className="w-4 h-4 rounded text-[#0A2342] focus:ring-amber-500"
            />
            <span>Show Diagram in Public View</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Section Title</label>
            <input
              type="text"
              value={formData.entryExitOptions?.title || 'Entry and Exit Options'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                entryExitOptions: {
                  ...prev.entryExitOptions,
                  title: e.target.value
                }
              }))}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Figure Caption</label>
            <input
              type="text"
              value={formData.entryExitOptions?.caption || 'Fig.1 Entry and Exit options for the UG program in Dairy Technology'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                entryExitOptions: {
                  ...prev.entryExitOptions,
                  caption: e.target.value
                }
              }))}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Description / Intro Text</label>
            <input
              type="text"
              value={formData.entryExitOptions?.description || 'The entry and exit options for the B. Tech. (Dairy Technology) Programme are shown in Figure 1 below:'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                entryExitOptions: {
                  ...prev.entryExitOptions,
                  description: e.target.value
                }
              }))}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Footnote Text</label>
            <input
              type="text"
              value={formData.entryExitOptions?.footnote || 'DE* Direct Entry in the respective year'}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                entryExitOptions: {
                  ...prev.entryExitOptions,
                  footnote: e.target.value
                }
              }))}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>
        </div>

        {/* Diagram Image Upload & Preview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 border-t border-amber-200/60">
          <div className="w-40 h-28 bg-white rounded-lg border border-slate-300 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
            <img 
              src={formData.entryExitImageUrl || formData.entryExitOptions?.imageUrl || '/entry-and-exit-options.svg'} 
              alt="Entry and Exit Diagram" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex-1 space-y-2 w-full">
            <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer border border-slate-300 transition-colors w-fit">
              {isUploadingEntryExitImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Uploading Diagram...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Upload New Diagram Image (PNG, JPG, SVG)</span>
                </>
              )}
              <input
                type="file"
                accept="image/*,.svg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleEntryExitImageFile(file);
                }}
              />
            </label>
            <input
              type="text"
              value={formData.entryExitImageUrl || formData.entryExitOptions?.imageUrl || '/entry-and-exit-options.svg'}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  entryExitImageUrl: val,
                  entryExitOptions: {
                    ...prev.entryExitOptions,
                    imageUrl: val
                  }
                }));
              }}
              placeholder="Diagram image URL (default: /entry-and-exit-options.svg)"
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* Program Objectives & Highlights Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
        {/* Objectives */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-xs font-serif uppercase tracking-wide">Key Educational Objectives</h4>
          <div className="space-y-2">
            {(formData.objectives || []).map((obj, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={obj}
                  onChange={(e) => {
                    const list = [...(formData.objectives || [])];
                    list[idx] = e.target.value;
                    setFormData(prev => ({ ...prev, objectives: list }));
                  }}
                  className="text-xs text-slate-800 bg-white border border-slate-300 rounded p-1.5 flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveObjective(idx)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New educational objective..."
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              className="p-2 bg-white border border-slate-300 rounded-lg text-xs flex-1 outline-none"
            />
            <button
              type="button"
              onClick={handleAddObjective}
              disabled={!newObjective.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-xs font-serif uppercase tracking-wide">Infrastructure & Campus Highlights</h4>
          <div className="space-y-2">
            {(formData.highlights || []).map((hl, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={hl}
                  onChange={(e) => {
                    const list = [...(formData.highlights || [])];
                    list[idx] = e.target.value;
                    setFormData(prev => ({ ...prev, highlights: list }));
                  }}
                  className="text-xs text-slate-800 bg-white border border-slate-300 rounded p-1.5 flex-1"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(idx)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New campus highlight..."
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              className="p-2 bg-white border border-slate-300 rounded-lg text-xs flex-1 outline-none"
            />
            <button
              type="button"
              onClick={handleAddHighlight}
              disabled={!newHighlight.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
