import React, { useState } from 'react';
import { AdmissionPortalSection, AdmissionProspectusSection, TrackApplicationStatusSection } from '../../../types';
import { supabaseStorageService } from '../../../services/supabaseStorageService';
import { CheckCircle2, Save, Download, Globe, Search, Upload, FileText, Loader2 } from 'lucide-react';

interface ProspectusAndPortalManagerProps {
  portalData: AdmissionPortalSection;
  prospectusData: AdmissionProspectusSection;
  trackData: TrackApplicationStatusSection;
  onSave: (updated: {
    admissionPortal: AdmissionPortalSection;
    admissionProspectus: AdmissionProspectusSection;
    trackApplicationStatus: TrackApplicationStatusSection;
  }) => Promise<void>;
}

export const ProspectusAndPortalManager: React.FC<ProspectusAndPortalManagerProps> = ({
  portalData,
  prospectusData,
  trackData,
  onSave
}) => {
  const [portal, setPortal] = useState<AdmissionPortalSection>(portalData);
  const [prospectus, setProspectus] = useState<AdmissionProspectusSection>(prospectusData);
  const [track, setTrack] = useState<TrackApplicationStatusSection>(trackData);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Upload Prospectus PDF to Supabase Storage
  const handleProspectusPdfUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25MB limit.');
      return;
    }
    setIsUploadingPdf(true);
    try {
      const uploadResult = await supabaseStorageService.uploadWebsiteDocument('downloads', file);
      if (uploadResult && (uploadResult.publicUrl || (uploadResult as any).url)) {
        const url = uploadResult.publicUrl || (uploadResult as any).url;
        setProspectus(prev => ({
          ...prev,
          pdfUrl: url,
          storagePath: uploadResult.storagePath,
          fileName: file.name,
          fileSize: uploadResult.fileSize || `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        }));
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleRemoveProspectusPdf = () => {
    setProspectus(prev => ({
      ...prev,
      pdfUrl: undefined,
      storagePath: undefined,
      fileName: undefined,
      fileSize: undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        admissionPortal: portal,
        admissionProspectus: prospectus,
        trackApplicationStatus: track
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
        <h3 className="font-bold text-slate-900 text-sm font-serif">Portal, Prospectus & Status Tracker Controls</h3>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-5 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
        >
          {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save All 3 Sections'}</span>
        </button>
      </div>

      {/* 1. ADMISSION PROSPECTUS PDF */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-900 text-sm font-serif">Admission Information Prospectus Brochure</h4>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={prospectus.isActive}
              onChange={(e) => setProspectus(p => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 rounded text-[#0A2342] focus:ring-amber-500"
            />
            <span>Active in Sidebar</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Prospectus Title</label>
            <input
              type="text"
              value={prospectus.title || ''}
              onChange={(e) => setProspectus(p => ({ ...p, title: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Prospectus Description</label>
            <input
              type="text"
              value={prospectus.description || ''}
              onChange={(e) => setProspectus(p => ({ ...p, description: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-2 md:col-span-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="text-xs font-bold text-slate-800 block">Prospectus PDF File (Supabase Storage Sync)</label>
            {prospectus.pdfUrl ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-emerald-900">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">{prospectus.fileName || 'Information Prospectus 2026-27.pdf'}</span>
                  {prospectus.fileSize && <span className="text-slate-500">({prospectus.fileSize})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={prospectus.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-700 hover:underline"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveProspectusPdf}
                    className="text-xs font-bold text-red-600 hover:text-red-800"
                  >
                    Delete PDF
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer border border-slate-300 transition-colors w-fit">
                {isUploadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Uploading Prospectus PDF...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-amber-600" />
                    <span>Upload Official Prospectus PDF</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleProspectusPdfUpload(file);
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* 2. ADMISSION PORTAL */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-900 text-sm font-serif">Direct Admission Application Portal</h4>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={portal.isActive}
              onChange={(e) => setPortal(p => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 rounded text-[#0A2342] focus:ring-amber-500"
            />
            <span>Active in Sidebar</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Portal Header Title</label>
            <input
              type="text"
              value={portal.title || ''}
              onChange={(e) => setPortal(p => ({ ...p, title: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Academic Year</label>
            <input
              type="text"
              value={portal.academicYear || ''}
              onChange={(e) => setPortal(p => ({ ...p, academicYear: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Status Badge Label</label>
            <input
              type="text"
              value={portal.statusBadge || ''}
              onChange={(e) => setPortal(p => ({ ...p, statusBadge: e.target.value }))}
              placeholder="e.g. Admissions Open"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Portal Description</label>
            <input
              type="text"
              value={portal.description || ''}
              onChange={(e) => setPortal(p => ({ ...p, description: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Submit Button Text</label>
            <input
              type="text"
              value={portal.buttonText || ''}
              onChange={(e) => setPortal(p => ({ ...p, buttonText: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. TRACK APPLICATION STATUS */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-600" />
            <h4 className="font-bold text-slate-900 text-sm font-serif">Track Application Status Section</h4>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={track.isActive}
              onChange={(e) => setTrack(t => ({ ...t, isActive: e.target.checked }))}
              className="w-4 h-4 rounded text-[#0A2342] focus:ring-amber-500"
            />
            <span>Active in Sidebar</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Search Section Heading</label>
            <input
              type="text"
              value={track.heading || ''}
              onChange={(e) => setTrack(t => ({ ...t, heading: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Search Button Text</label>
            <input
              type="text"
              value={track.buttonText || ''}
              onChange={(e) => setTrack(t => ({ ...t, buttonText: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-700">Candidate Search Instructions</label>
            <input
              type="text"
              value={track.instructions || track.description || ''}
              onChange={(e) => setTrack(t => ({ ...t, instructions: e.target.value, description: e.target.value }))}
              placeholder="e.g. Enter assigned Application ID (e.g. LSSCDT-2026-1042) or Mobile Number"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
