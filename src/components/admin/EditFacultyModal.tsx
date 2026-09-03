import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Crown, 
  Eye, 
  EyeOff, 
  Check, 
  Image as ImageIcon, 
  Loader2, 
  GraduationCap, 
  Briefcase, 
  BookOpen, 
  Mail, 
  Phone,
  User
} from 'lucide-react';
import { FacultyMember } from '../../types';
import { supabaseStorageService } from '../../services/supabaseStorageService';

interface EditFacultyModalProps {
  isOpen: boolean;
  faculty: FacultyMember | null;
  onClose: () => void;
  onSave: (updated: FacultyMember) => Promise<boolean>;
}

export function parseQualifications(qual?: string, quals?: string[]): string[] {
  if (quals && Array.isArray(quals) && quals.length > 0) {
    const cleaned = quals.filter(q => typeof q === 'string').map(q => q.trim()).filter(Boolean);
    if (cleaned.length > 0) return cleaned;
  }
  if (!qual || !qual.trim()) return [''];

  const cleaned = qual.trim();
  // Check if string contains numbered items like 1) ... 2) ... or 1. ... 2. ...
  if (/\d+[\)\.]/.test(cleaned)) {
    const parts = cleaned.split(/(?:^|\s+)\d+[\)\.]\s*/).map(p => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts;
  }
  // Check for newlines
  if (cleaned.includes('\n')) {
    const parts = cleaned.split('\n').map(p => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts;
  }
  return [cleaned];
}

export function formatQualifications(quals: string[]): string {
  const valid = quals.map(q => q.trim()).filter(Boolean);
  if (valid.length === 0) return '';
  if (valid.length === 1) return valid[0];
  return valid.map((q, i) => `${i + 1}) ${q}`).join('  ');
}

const DEPARTMENT_SUGGESTIONS = [
  'Dairy Technology',
  'Dairy Engineering',
  'Dairy Chemistry',
  'Dairy Microbiology',
  'Dairy Business Management',
  'Dairy Science & Technology',
  'Basic Sciences & Humanities'
];

export const EditFacultyModal: React.FC<EditFacultyModalProps> = ({
  isOpen,
  faculty,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FacultyMember | null>(null);
  const [qualificationsList, setQualificationsList] = useState<string[]>(['']);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (faculty && isOpen) {
      setFormData({ ...faculty });
      const parsed = parseQualifications(faculty.qualification, faculty.qualifications);
      setQualificationsList(parsed.length > 0 ? parsed : ['']);
      setErrorMessage(null);
      setIsUploadingPhoto(false);
      setIsSaving(false);
      setShowUrlInput(false);
    }
  }, [faculty, isOpen]);

  if (!isOpen || !formData) return null;

  // Qualifications list handlers
  const handleAddQualification = () => {
    setQualificationsList(prev => [...prev, '']);
  };

  const handleUpdateQualification = (index: number, val: string) => {
    setQualificationsList(prev => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleRemoveQualification = (index: number) => {
    if (qualificationsList.length <= 1) {
      setQualificationsList(['']);
      return;
    }
    setQualificationsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveQualification = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= qualificationsList.length) return;
    setQualificationsList(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Photo Upload Handler
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Photo size exceeds 10MB. Please choose a smaller image.');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setErrorMessage(null);
      const cloudUrl = await supabaseStorageService.uploadImage(file, 'faculty');
      if (cloudUrl) {
        setFormData(prev => prev ? { ...prev, image: cloudUrl } : null);
      } else {
        setErrorMessage('Failed to upload photo. Please try again.');
      }
    } catch (err: any) {
      console.error('Error uploading faculty photo:', err);
      setErrorMessage('Photo upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => prev ? { ...prev, image: '' } : null);
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Faculty full name is required.');
      return;
    }
    if (!formData.designation.trim()) {
      setErrorMessage('Faculty designation is required.');
      return;
    }

    const cleanQuals = qualificationsList.map(q => q.trim()).filter(Boolean);
    const formattedQualString = formatQualifications(cleanQuals);

    const payload: FacultyMember = {
      ...formData,
      name: formData.name.trim(),
      designation: formData.designation.trim(),
      department: (formData.department || '').trim(),
      qualification: formattedQualString,
      qualifications: cleanQuals,
      experience: (formData.experience || '').trim(),
      specialization: (formData.specialization || '').trim(),
      email: (formData.email || '').trim(),
      phone: (formData.phone || '').trim(),
      image: (formData.image || '').trim(),
      isHOD: !!formData.isHOD,
      isActive: formData.isActive !== false
    };

    setIsSaving(true);
    setErrorMessage(null);

    const success = await onSave(payload);
    setIsSaving(false);
    if (!success) {
      setErrorMessage('Could not save changes to Supabase. Please check your network and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0A2342] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif leading-tight">
                Edit Faculty Member
              </h2>
              <p className="text-xs text-slate-300">
                Update profile, credentials, qualifications, photo, and website visibility
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Photo & Visibility Controls */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Faculty Photo Container */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-xs overflow-hidden flex items-center justify-center group">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt={formData.name || 'Faculty photo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <User className="w-8 h-8 mb-1 text-slate-300" />
                    <span className="text-[10px] font-semibold">No Photo</span>
                  </div>
                )}

                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white gap-1 text-[10px] font-bold">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <Upload className="w-3 h-3 text-amber-600" />
                  <span>{formData.image ? 'Replace' : 'Upload'}</span>
                </button>

                {formData.image && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[10px] text-slate-500 hover:text-[#0A2342] underline"
              >
                {showUrlInput ? 'Hide URL input' : 'Or use Image URL'}
              </button>
            </div>

            {/* Right side of photo: URL Input (if open) & Status Badges */}
            <div className="flex-1 space-y-3 w-full">
              {showUrlInput && (
                <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-700">Image Web URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full p-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-[#0A2342] bg-slate-50 font-mono"
                  />
                </div>
              )}

              {/* Status Toggles: HOD and Website Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* HOD Status Toggle */}
                <div 
                  onClick={() => setFormData({ ...formData, isHOD: !formData.isHOD })}
                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                    formData.isHOD
                      ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300/60 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    formData.isHOD ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Head of Dept (HOD)</span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        formData.isHOD ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {formData.isHOD ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      Designate as Head of Department
                    </p>
                  </div>
                </div>

                {/* Website Visibility Toggle */}
                <div 
                  onClick={() => setFormData({ ...formData, isActive: formData.isActive === false ? true : false })}
                  className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                    formData.isActive !== false
                      ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300/60 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    formData.isActive !== false ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {formData.isActive !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">Website Visibility</span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        formData.isActive !== false ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {formData.isActive !== false ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      {formData.isActive !== false ? 'Shown on public faculty page' : 'Hidden from public website'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Core Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mr. Rishabh Sahu / Dr. P. L. Chaudhari"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Assistant Professor / Professor & Head"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] bg-white font-medium"
              />
            </div>
          </div>

          {/* Section 3: Department & Specialization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Department
              </label>
              <input
                type="text"
                list="department-suggestions"
                placeholder="e.g. Dairy Business Management"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0A2342] bg-white"
              />
              <datalist id="department-suggestions">
                {DEPARTMENT_SUGGESTIONS.map(dept => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. Dairy Business, Membrane Processing, Cheese Tech"
                value={formData.specialization || ''}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0A2342] bg-white"
              />
            </div>
          </div>

          {/* Section 4: QUALIFICATIONS (Interactive Multi-item Manager) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900 text-xs">Educational Qualifications</span>
              </div>
              <button
                type="button"
                onClick={handleAddQualification}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Qualification</span>
              </button>
            </div>

            <div className="space-y-2">
              {qualificationsList.map((qual, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="w-6 text-center font-mono font-bold text-slate-400 text-[11px]">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    placeholder={`e.g. ${idx === 0 ? 'B.Tech (Dairy Technology)' : idx === 1 ? 'M.Tech (Dairy Engineering)' : 'Ph.D.'}`}
                    value={qual}
                    onChange={(e) => handleUpdateQualification(idx, e.target.value)}
                    className="flex-1 p-1.5 text-xs rounded border border-slate-200 outline-none focus:border-[#0A2342]"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveQualification(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveQualification(idx, 'down')}
                      disabled={idx === qualificationsList.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 rounded hover:bg-slate-100 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveQualification(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      title="Remove qualification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Add individual degrees or certifications. They will be formatted cleanly across all public faculty listings.
            </p>
          </div>

          {/* Section 5: Experience & Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Experience
              </label>
              <input
                type="text"
                placeholder="e.g. 12 Years Teaching & Research"
                value={formData.experience || ''}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0A2342] bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. faculty@lsscdt.ac.in"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0A2342] bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Phone / Mobile
              </label>
              <input
                type="text"
                placeholder="e.g. +91 9876543210"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0A2342] bg-white font-mono"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Saves directly to Supabase cloud database</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-5 py-2 bg-[#0A2342] hover:bg-[#0d2e57] text-amber-300 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
