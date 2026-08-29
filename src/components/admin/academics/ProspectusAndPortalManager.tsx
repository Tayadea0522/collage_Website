import React, { useState, useEffect } from 'react';
import { AdmissionPortalSection, AdmissionProspectusSection, TrackApplicationStatusSection } from '../../../types';
import { supabaseStorageService } from '../../../services/supabaseStorageService';
import { 
  CheckCircle2, 
  Save, 
  Download, 
  Globe, 
  Search, 
  Upload, 
  FileText, 
  Loader2, 
  Eye, 
  EyeOff, 
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

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
  const [portal, setPortal] = useState<AdmissionPortalSection>(() => ({
    isActive: false,
    title: 'Official Direct Admission Application Portal',
    academicYear: '2026–27',
    description: 'Register online in 3 easy steps: Candidate Profile, Academic Marks Entry, and Mandatory Document Upload.',
    buttonText: 'Register Online Now',
    statusBadge: 'Admissions Open',
    ...(portalData || {})
  }));

  const [prospectus, setProspectus] = useState<AdmissionProspectusSection>(() => ({
    isActive: true,
    title: 'Official Information Prospectus & Academic Brochure 2026–27',
    description: 'Download the complete informational brochure detailing B.Tech (Dairy Technology) curriculum, pilot dairy plant features, career placements, and fee policies.',
    ...(prospectusData || {})
  }));

  const [track, setTrack] = useState<TrackApplicationStatusSection>(() => ({
    isActive: false,
    heading: 'Track Live Application Verification Status',
    description: 'Check the live verification status of your online registration using your Application ID or registered Mobile Number.',
    buttonText: 'Search Status',
    instructions: 'Enter your assigned Application ID (e.g. LSSCDT-2026-1042) or registered 10-digit mobile number.',
    ...(trackData || {})
  }));
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  useEffect(() => {
    if (portalData) {
      setPortal(prev => ({ ...prev, ...portalData }));
    }
  }, [portalData]);

  useEffect(() => {
    if (prospectusData) {
      setProspectus(prev => ({ ...prev, ...prospectusData }));
    }
  }, [prospectusData]);

  useEffect(() => {
    if (trackData) {
      setTrack(prev => ({ ...prev, ...trackData }));
    }
  }, [trackData]);

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
    } catch (err: any) {
      console.error('ProspectusAndPortal save error:', err);
      alert(`Failed to save portal & prospectus data: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isOnlineAdmissionOn = portal.isActive === true;
  const isTrackStatusOn = track.isActive === true;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Action & Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white font-serif">Portal, Prospectus & Application Tracking CMS</h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Manage public website visibility toggles, direct registration settings, and official prospectus files.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isSaving}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Saving to Database...</span>
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-slate-950" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MAIN WEBSITE VISIBILITY TOGGLES (USER MANDATE SECTION 1) */}
      {/* ========================================================================= */}
      <div className="p-6 bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border-2 border-amber-300/80 rounded-2xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-900 font-bold">
              <Sliders className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-slate-950 text-sm font-serif">Public Website Visibility Switches</h4>
              <p className="text-[11px] text-slate-600">Turn features ON or OFF on the live website without deleting existing data or configurations.</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-amber-100/60 border border-amber-300 text-amber-900 px-3 py-1 rounded-lg text-xs font-semibold">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Persisted directly in Supabase</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. TOGGLE: Show Online Admission on Website */}
          <div className={`p-5 rounded-2xl border-2 transition-all duration-200 ${
            isOnlineAdmissionOn 
              ? 'bg-emerald-50/60 border-emerald-300 shadow-sm' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className={`w-4 h-4 ${isOnlineAdmissionOn ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <label htmlFor="toggle-online-admission" className="font-bold text-slate-900 text-sm cursor-pointer">
                    Show Online Admission on Website
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Controls public visibility of the Online Admission Portal, Apply Online buttons, and registration CTA across the website.
                </p>
              </div>

              {/* Pill Switch */}
              <button
                type="button"
                id="toggle-online-admission"
                role="switch"
                aria-checked={isOnlineAdmissionOn}
                onClick={() => setPortal(p => ({ ...p, isActive: !p.isActive }))}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isOnlineAdmissionOn ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span className="sr-only">Toggle Online Admission</span>
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isOnlineAdmissionOn ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Current Status:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                isOnlineAdmissionOn
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                {isOnlineAdmissionOn ? (
                  <>
                    <Eye className="w-3 h-3 text-emerald-600" />
                    <span>ON — Visible to Public</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 text-slate-600" />
                    <span>OFF — Hidden from Public (Default)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* 2. TOGGLE: Show Track Application Status on Website */}
          <div className={`p-5 rounded-2xl border-2 transition-all duration-200 ${
            isTrackStatusOn 
              ? 'bg-emerald-50/60 border-emerald-300 shadow-sm' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Search className={`w-4 h-4 ${isTrackStatusOn ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <label htmlFor="toggle-track-status" className="font-bold text-slate-900 text-sm cursor-pointer">
                    Show Track Application Status on Website
                  </label>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Controls public visibility of the Application Status Tracker search form, sidebar navigation, and tracking cards.
                </p>
              </div>

              {/* Pill Switch */}
              <button
                type="button"
                id="toggle-track-status"
                role="switch"
                aria-checked={isTrackStatusOn}
                onClick={() => setTrack(t => ({ ...t, isActive: !t.isActive }))}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                  isTrackStatusOn ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span className="sr-only">Toggle Track Application Status</span>
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isTrackStatusOn ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Current Status:</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                isTrackStatusOn
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-200 text-slate-700 border border-slate-300'
              }`}>
                {isTrackStatusOn ? (
                  <>
                    <Eye className="w-3 h-3 text-emerald-600" />
                    <span>ON — Visible to Public</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 text-slate-600" />
                    <span>OFF — Hidden from Public (Default)</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: DIRECT ADMISSION APPLICATION PORTAL CONFIGURATION */}
      {/* ========================================================================= */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-serif">Direct Admission Application Portal Configuration</h4>
              <p className="text-[11px] text-slate-500">Configure portal headers, academic cycle, and submission action labels.</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
            isOnlineAdmissionOn ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}>
            {isOnlineAdmissionOn ? '● Portal Active on Live Site' : '○ Portal Inactive / Hidden'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Portal Header Title</label>
            <input
              type="text"
              value={portal.title || ''}
              onChange={(e) => setPortal(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Official Direct Admission Application Portal"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Academic Year / Cycle</label>
            <input
              type="text"
              value={portal.academicYear || ''}
              onChange={(e) => setPortal(p => ({ ...p, academicYear: e.target.value }))}
              placeholder="e.g. 2026–27"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Status Badge Label</label>
            <input
              type="text"
              value={portal.statusBadge || ''}
              onChange={(e) => setPortal(p => ({ ...p, statusBadge: e.target.value }))}
              placeholder="e.g. Admissions Open"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-bold text-slate-700">Submit Button Text</label>
            <input
              type="text"
              value={portal.buttonText || ''}
              onChange={(e) => setPortal(p => ({ ...p, buttonText: e.target.value }))}
              placeholder="e.g. Register Online Now"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1 sm:col-span-3">
            <label className="text-xs font-bold text-slate-700">Portal Description / Instructions</label>
            <textarea
              rows={2}
              value={portal.description || ''}
              onChange={(e) => setPortal(p => ({ ...p, description: e.target.value }))}
              placeholder="e.g. Register online in 3 easy steps: Candidate Profile, Academic Marks Entry, and Mandatory Document Upload."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: TRACK APPLICATION STATUS CONFIGURATION */}
      {/* ========================================================================= */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-serif">Track Application Status Configuration</h4>
              <p className="text-[11px] text-slate-500">Configure applicant search interface, prompt messages, and verification buttons.</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border self-start sm:self-auto ${
            isTrackStatusOn ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
          }`}>
            {isTrackStatusOn ? '● Tracker Active on Live Site' : '○ Tracker Inactive / Hidden'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Search Section Heading</label>
            <input
              type="text"
              value={track.heading || ''}
              onChange={(e) => setTrack(t => ({ ...t, heading: e.target.value }))}
              placeholder="e.g. Track Live Application Verification Status"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Search Button Text</label>
            <input
              type="text"
              value={track.buttonText || ''}
              onChange={(e) => setTrack(t => ({ ...t, buttonText: e.target.value }))}
              placeholder="e.g. Search Status"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-700">Candidate Search Instructions</label>
            <input
              type="text"
              value={track.instructions || track.description || ''}
              onChange={(e) => setTrack(t => ({ ...t, instructions: e.target.value, description: e.target.value }))}
              placeholder="e.g. Enter assigned Application ID (e.g. LSSCDT-2026-1042) or registered 10-digit mobile number."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: ADMISSION PROSPECTUS PDF BROCHURE */}
      {/* ========================================================================= */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm font-serif">Admission Information Prospectus Brochure</h4>
              <p className="text-[11px] text-slate-500">Upload official prospectus PDF and control its display in the admissions navigation.</p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors">
            <input
              type="checkbox"
              checked={prospectus.isActive}
              onChange={(e) => setProspectus(p => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 rounded text-[#0A2342] focus:ring-amber-500"
            />
            <span>Show Prospectus in Sidebar</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Prospectus Title</label>
            <input
              type="text"
              value={prospectus.title || ''}
              onChange={(e) => setProspectus(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Official Information Prospectus & Academic Brochure 2026–27"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Prospectus Description</label>
            <input
              type="text"
              value={prospectus.description || ''}
              onChange={(e) => setProspectus(p => ({ ...p, description: e.target.value }))}
              placeholder="e.g. Download complete brochure detailing curriculum, eligibility, and facilities."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-2 md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="text-xs font-bold text-slate-800 block">Prospectus PDF Document (Supabase Storage Cloud Sync)</label>
            {prospectus.pdfUrl ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2.5 text-xs text-emerald-900">
                  <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">{prospectus.fileName || 'Information Prospectus 2026-27.pdf'}</span>
                    {prospectus.fileSize && <span className="text-[11px] text-slate-500">{prospectus.fileSize} • Uploaded to Supabase Cloud</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <a
                    href={prospectus.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm"
                  >
                    View PDF
                  </a>
                  <button
                    type="button"
                    onClick={handleRemoveProspectusPdf}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-white px-3 py-1.5 rounded-lg border border-red-200 shadow-sm"
                  >
                    Remove PDF
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer border border-slate-300 transition-colors w-fit shadow-sm">
                {isUploadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Uploading Prospectus PDF to Supabase...</span>
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

      {/* Bottom Save Action Bar */}
      <div className="flex justify-end items-center p-4 bg-slate-100 border border-slate-200 rounded-xl">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow transition-all disabled:opacity-50 hover:scale-[1.01]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Saving Changes...</span>
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-amber-400" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
