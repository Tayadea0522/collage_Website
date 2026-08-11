import React, { useState, useEffect, useRef } from 'react';
import { AdmissionApplication, CollegeInfo } from '../types';
import { storageService } from '../services/storageService';
import { supabaseStorageService } from '../services/supabaseStorageService';
import { printApplicationSlip, downloadApplicationSlip } from '../utils/printUtils';
import { InnerPageLayout, SidebarItem } from './InnerPageLayout';
import { AdmissionProcessWorkflow } from './AdmissionProcessWorkflow';
import { 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  UserCheck, 
  Upload, 
  Search, 
  Printer, 
  Download, 
  ShieldCheck, 
  AlertCircle, 
  GraduationCap, 
  Clock, 
  Calendar,
  Send,
  RefreshCw,
  Paperclip,
  Eye,
  Trash2,
  X,
  FileCheck,
  Building2,
  BookOpen,
  Loader2,
  Phone,
  HelpCircle,
  Award,
  IndianRupee,
  Layers
} from 'lucide-react';

interface AdmissionsProps {
  collegeInfo: CollegeInfo;
  applications: AdmissionApplication[];
  onRefreshApplications: () => void;
  onNavigateTab?: (tab: string) => void;
}

interface UploadedDoc {
  id: string;
  docType: string;
  title: string;
  fileName: string;
  fileSize: string;
  file: File;
  previewUrl: string;
  uploadedAt: string;
}

export const Admissions: React.FC<AdmissionsProps> = ({
  collegeInfo,
  applications,
  onRefreshApplications,
  onNavigateTab
}) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('portal');

  // Form Step State
  const [formStep, setFormStep] = useState(1);
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    category: 'OPEN' as AdmissionApplication['category'],
    email: '',
    mobile: '',
    aadharNumber: '',
    address: '',
    district: 'Buldhana',
    state: 'Maharashtra',
    pincode: '',
    
    // Admission Seeking
    admissionYear: 'First Year (1st Year)',
    admissionBranch: 'B.Tech (Dairy Technology)',

    // Previous Academic Qualification
    previousQualification: '12th Science / HSC' as AdmissionApplication['previousQualification'],
    previousInstitute: '',
    previousBoardUniversity: 'Maharashtra State Board (MSBSHSE)',
    previousPassingYear: '2026',
    previousStreamBranch: 'Science (PCM)',
    previousObtainedMarks: 250,
    previousTotalMarks: 300,

    // HSC PCM Scores
    hscPcmMarks: 250,
    hscTotalMarks: 300,
    hscBoard: 'Maharashtra State Board (MSBSHSE)',
    hscPassingYear: '2026',
    
    // Entrance Exam
    entranceExam: 'MHT-CET' as AdmissionApplication['entranceExam'],
    entranceRollNo: '',
    entrancePercentile: 88.5,
    
    // Quota
    isAgriculturalist: true,
    isMaharashtraDomicile: true,
  });

  // Document Attachments State
  const [attachedFiles, setAttachedFiles] = useState<UploadedDoc[]>([]);
  const [docUploadError, setDocUploadError] = useState('');
  const [previewModalDoc, setPreviewModalDoc] = useState<{ title: string; fileName: string; url: string } | null>(null);

  // Reference for cleanup on unmount
  const attachedFilesRef = useRef(attachedFiles);
  attachedFilesRef.current = attachedFiles;

  useEffect(() => {
    return () => {
      attachedFilesRef.current.forEach(f => {
        if (f.previewUrl) {
          URL.revokeObjectURL(f.previewUrl);
        }
      });
    };
  }, []);

  // Track State
  const [searchQuery, setSearchQuery] = useState('');
  const [trackedApp, setTrackedApp] = useState<AdmissionApplication | null>(null);
  const [searchError, setSearchError] = useState('');

  // Calculations
  const prevPct = formData.previousTotalMarks > 0 
    ? Number(((formData.previousObtainedMarks / formData.previousTotalMarks) * 100).toFixed(2)) 
    : 0;
  
  const hscPct = formData.hscTotalMarks > 0 
    ? Number(((formData.hscPcmMarks / formData.hscTotalMarks) * 100).toFixed(2)) 
    : 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Direct File Selection Handler
  const handleFileUpload = (docType: string, title: string, event: React.ChangeEvent<HTMLInputElement>) => {
    setDocUploadError('');
    setSubmitError('');
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';

    if (file.size > 5 * 1024 * 1024) {
      setDocUploadError(`File '${file.name}' exceeds maximum allowed size of 5 MB. Please choose a smaller file.`);
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['jpg', 'jpeg', 'png', 'pdf'];
    const isAllowedMime = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!allowedExts.includes(ext) && !isAllowedMime) {
      setDocUploadError(`Invalid format for '${file.name}'. Attach JPG, PNG, or PDF files only.`);
      return;
    }

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
      : `${(file.size / 1024).toFixed(1)} KB`;

    setAttachedFiles(prev => {
      const existing = prev.find(d => d.docType === docType);
      if (existing && existing.previewUrl) {
        URL.revokeObjectURL(existing.previewUrl);
      }

      const filtered = prev.filter(d => d.docType !== docType);
      const previewUrl = URL.createObjectURL(file);

      const newDoc: UploadedDoc = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        docType,
        title,
        fileName: file.name,
        fileSize: formattedSize,
        file,
        previewUrl,
        uploadedAt: new Date().toLocaleDateString('en-IN')
      };

      return [...filtered, newDoc];
    });
  };

  const handleRemoveFile = (docType: string) => {
    setAttachedFiles(prev => {
      const target = prev.find(d => d.docType === docType);
      if (target && target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(d => d.docType !== docType);
    });
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError('');
    setDocUploadError('');
    setIsSubmitting(true);

    let uploadedAttachedFiles: {
      id: string;
      docType: string;
      title: string;
      fileName: string;
      fileSize: string;
      storagePath: string;
      uploadedAt: string;
    }[] = [];

    let currentAppId = '';

    try {
      const mandatorySlots = [
        { docType: 'photo', title: 'Passport Size Photograph' },
        { docType: 'signature', title: 'Candidate Specimen Signature' },
        { docType: 'marksheet', title: '12th / Diploma / Degree Marksheet' },
        { docType: 'cetScoreCard', title: 'MHT-CET / ICAR Score Card' },
        { docType: 'domicile', title: 'Domicile / Birth Certificate' }
      ];

      const missing = mandatorySlots.filter(s => !attachedFiles.some(f => f.docType === s.docType));
      if (missing.length > 0) {
        const missingTitles = missing.map(m => m.title).join(', ');
        setSubmitError(`Please attach all mandatory documents before submitting: ${missingTitles}.`);
        setIsSubmitting(false);
        return;
      }

      const appNumber = Math.floor(1000 + Math.random() * 9000);
      currentAppId = `LSSCDT-2026-${appNumber}`;

      const prevPct = formData.previousTotalMarks > 0 
        ? Number(((formData.previousObtainedMarks / formData.previousTotalMarks) * 100).toFixed(2)) 
        : 0;
      const hscPct = formData.hscTotalMarks > 0 
        ? Number(((formData.hscPcmMarks / formData.hscTotalMarks) * 100).toFixed(2)) 
        : 0;

      for (let i = 0; i < attachedFiles.length; i++) {
        const doc = attachedFiles[i];
        setUploadProgress(`Uploading document ${i + 1} of ${attachedFiles.length}: ${doc.title}...`);

        const uploadRes = await supabaseStorageService.uploadDocument(
          currentAppId,
          doc.docType,
          doc.file,
          doc.fileName
        );

        if (uploadRes.error || !uploadRes.storagePath) {
          const errDetail = uploadRes.error || 'Failed to upload document file';
          const pathsToClean = uploadedAttachedFiles.map(f => f.storagePath).filter(Boolean);
          if (pathsToClean.length > 0) {
            await supabaseStorageService.deleteUploadedFiles(pathsToClean);
          }
          setSubmitError(`Document upload failed for ${doc.title}: ${errDetail}.`);
          setUploadProgress('');
          setIsSubmitting(false);
          return;
        }

        uploadedAttachedFiles.push({
          id: doc.id,
          docType: doc.docType,
          title: doc.title,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          storagePath: uploadRes.storagePath,
          uploadedAt: doc.uploadedAt
        });
      }

      const nowIso = new Date().toISOString();
      const newApp: AdmissionApplication = {
        id: currentAppId,
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        dob: formData.dob,
        gender: formData.gender,
        category: formData.category,
        email: formData.email,
        mobile: formData.mobile,
        aadharNumber: formData.aadharNumber,
        address: `${formData.address}, ${formData.district}, ${formData.state} - ${formData.pincode}`,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,

        admissionYear: formData.admissionYear,
        admissionBranch: formData.admissionBranch,

        previousQualification: formData.previousQualification,
        previousInstitute: formData.previousInstitute,
        previousBoardUniversity: formData.previousBoardUniversity,
        previousPassingYear: formData.previousPassingYear,
        previousStreamBranch: formData.previousStreamBranch,
        previousObtainedMarks: Number(formData.previousObtainedMarks),
        previousTotalMarks: Number(formData.previousTotalMarks),
        previousPercentage: prevPct,

        hscPcmMarks: Number(formData.hscPcmMarks),
        hscTotalMarks: Number(formData.hscTotalMarks),
        hscPercentage: hscPct,
        hscBoard: formData.hscBoard,
        hscPassingYear: formData.hscPassingYear,

        entranceExam: formData.entranceExam,
        entranceRollNo: formData.entranceRollNo,
        entrancePercentile: Number(formData.entrancePercentile),

        isAgriculturalist: formData.isAgriculturalist,
        isMaharashtraDomicile: formData.isMaharashtraDomicile,

        submissionDate: nowIso,
        status: 'Submitted',
        remarks: 'Online application submitted successfully with verified storage documents.',
        statusHistory: [
          {
            status: 'Submitted',
            remarks: 'Application submitted online with attached documents.',
            updatedAt: nowIso,
            updatedBy: 'Candidate'
          }
        ],
        documentsUploaded: {
          photo: attachedFiles.some(f => f.docType === 'photo'),
          signature: attachedFiles.some(f => f.docType === 'signature'),
          hscMarksheet: attachedFiles.some(f => f.docType === 'marksheet'),
          cetScoreCard: attachedFiles.some(f => f.docType === 'cetScoreCard'),
          casteCertificate: attachedFiles.some(f => f.docType === 'caste'),
          domicileCertificate: attachedFiles.some(f => f.docType === 'domicile'),
          agriculturalistCertificate: attachedFiles.some(f => f.docType === 'agriculturalist')
        },
        attachedFiles: uploadedAttachedFiles
      };

      const saveResult = await storageService.addApplication(newApp);

      if (saveResult?.error) {
        const uploadedPaths = uploadedAttachedFiles.map(f => f.storagePath).filter(Boolean);
        if (uploadedPaths.length > 0) {
          setUploadProgress('Cleaning up storage files due to database error...');
          await supabaseStorageService.deleteUploadedFiles(uploadedPaths);
        }

        setSubmitError(`Database insertion failed: ${saveResult.error}`);
        setUploadProgress('');
        setIsSubmitting(false);
        return;
      }

      attachedFiles.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      setAttachedFiles([]);
      setUploadProgress('');
      onRefreshApplications();
      setSubmittedApp(newApp);
      setFormStep(4);
    } catch (err: any) {
      console.error('Submission process exception:', err);
      const uploadedPaths = uploadedAttachedFiles.map(f => f.storagePath).filter(Boolean);
      if (uploadedPaths.length > 0) {
        try {
          await supabaseStorageService.deleteUploadedFiles(uploadedPaths);
        } catch (cleanupErr) {
          console.error('Cleanup exception:', cleanupErr);
        }
      }
      setSubmitError(err.message || 'An unexpected error occurred during submission.');
      setUploadProgress('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchApp = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const found = applications.find(a => 
      a.id.toLowerCase() === query || 
      a.mobile.includes(query) || 
      a.email.toLowerCase() === query ||
      a.fullName.toLowerCase().includes(query)
    );

    if (found) {
      setTrackedApp(found);
    } else {
      setTrackedApp(null);
      setSearchError(`No application found for '${searchQuery}'. Please check Application ID or Mobile Number.`);
    }
  };

  const handlePrintSlip = (appToPrint?: AdmissionApplication | null) => {
    const target = appToPrint || submittedApp || trackedApp;
    if (target) {
      printApplicationSlip(target, collegeInfo);
    } else {
      window.print();
    }
  };

  const handleDownloadSlip = (appToDownload?: AdmissionApplication | null) => {
    const target = appToDownload || submittedApp || trackedApp;
    if (target) {
      downloadApplicationSlip(target, collegeInfo);
    }
  };

  const sidebarItems: SidebarItem[] = [
    { id: 'portal', label: 'Admission Portal 2026–27', icon: FileText, badge: 'Online' },
    { id: 'course', label: 'Course Offered', icon: GraduationCap },
    { id: 'intake', label: 'Intake Capacity', icon: Building2 },
    { id: 'eligibility', label: 'Eligibility', icon: ShieldCheck },
    { id: 'process', label: 'Admission Process', icon: FileCheck },
    { id: 'documents', label: 'Documents Required', icon: Paperclip },
    { id: 'fees', label: 'Fees Structure', icon: IndianRupee },
    { id: 'prospectus', label: 'Admission Prospectus', icon: Download },
    { id: 'contact', label: 'Admission Enquiry', icon: Phone },
    { id: 'track', label: 'Track Application Status', icon: Search }
  ];

  return (
    <InnerPageLayout
      title="Admissions 2026–27"
      categoryTag="Academic Admissions"
      subtitle="Online Application Portal, Eligibility Matrix, Intake Capacity & Admission Verification"
      breadcrumbPath={[
        { label: 'Home', tab: 'home' },
        { label: 'Admissions' },
        { label: sidebarItems.find(s => s.id === activeSidebarItem)?.label || 'Admission Portal' }
      ]}
      sidebarItems={sidebarItems}
      activeItem={activeSidebarItem}
      onSelectSidebarItem={setActiveSidebarItem}
      onNavigateTab={onNavigateTab}
    >
      {/* 1. ADMISSION PORTAL (FORM) */}
      {activeSidebarItem === 'portal' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-600" />
                Online Admission Application Form (2026–27)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                4-Year B.Tech (Dairy Technology) | MAFSU Nagpur Affiliated
              </p>
            </div>
            {formStep < 4 && (
              <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 shrink-0">
                Step {formStep} of 3
              </span>
            )}
          </div>

          {formStep < 4 ? (
            <form onSubmit={handleSubmitApplication} className="space-y-6">
              
              {/* STEP 1: Personal Details */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold font-serif text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-600" />
                    Candidate Personal & Guardian Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Candidate Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="e.g. Aditi Ramesh Deshmukh"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Father / Guardian Name *</label>
                      <input
                        type="text"
                        name="fatherName"
                        required
                        placeholder="Father Name"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mother Name *</label>
                      <input
                        type="text"
                        name="motherName"
                        required
                        placeholder="Mother Name"
                        value={formData.motherName}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        name="dob"
                        required
                        value={formData.dob}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold text-xs"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Social Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold text-blue-900 text-xs"
                      >
                        <option value="OPEN">OPEN (General)</option>
                        <option value="OBC">OBC (Other Backward Class)</option>
                        <option value="EWS">EWS (Economically Weaker Section)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="NT/VJ">NT / VJ (Nomadic Tribe)</option>
                        <option value="SBC">SBC (Special Backward Category)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        name="mobile"
                        required
                        pattern="[0-9]{10}"
                        placeholder="10 digit mobile number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="student@gmail.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Aadhar Card Number *</label>
                      <input
                        type="text"
                        name="aadharNumber"
                        required
                        maxLength={12}
                        placeholder="12 digit Aadhar No"
                        value={formData.aadharNumber}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Permanent Address *</label>
                      <input
                        type="text"
                        name="address"
                        required
                        placeholder="House No, Street, Village/Town"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">District & Pincode *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="district"
                          required
                          value={formData.district}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                        />
                        <input
                          type="text"
                          name="pincode"
                          required
                          maxLength={6}
                          placeholder="Pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="bg-[#0A2342] hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow"
                    >
                      Next: Academic Qualification →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Academic Qualifications */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold font-serif text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-600" />
                    Academic Qualification & Entrance Exam Scores
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Admission Seeking Year *</label>
                      <select
                        name="admissionYear"
                        value={formData.admissionYear}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold text-blue-900 text-xs"
                      >
                        <option value="First Year (1st Year)">First Year B.Tech (4 Years Degree)</option>
                        <option value="Direct Second Year (2nd Year)">Direct Second Year Lateral Entry (3 Years)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Previous Qualification *</label>
                      <select
                        name="previousQualification"
                        value={formData.previousQualification}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold text-xs"
                      >
                        <option value="12th Science / HSC">12th Science / HSC (PCM / PCMB)</option>
                        <option value="Diploma Dairy Technology">3-Year Diploma in Dairy Technology</option>
                        <option value="Diploma Food Tech / Agri">Diploma Food Tech / Agriculture</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Entrance Exam Taken *</label>
                      <select
                        name="entranceExam"
                        value={formData.entranceExam}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold text-amber-800 text-xs"
                      >
                        <option value="MHT-CET">MHT-CET (PCM/PCB Maharashtra)</option>
                        <option value="ICAR-AIEEA">ICAR-AIEEA (All India Entrance)</option>
                        <option value="JEE Main">JEE Main / NEET</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Entrance Roll No *</label>
                      <input
                        type="text"
                        name="entranceRollNo"
                        required
                        placeholder="e.g. 24010582"
                        value={formData.entranceRollNo}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Entrance Percentile Score *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="entrancePercentile"
                        required
                        placeholder="e.g. 88.50"
                        value={formData.entrancePercentile}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono text-xs font-bold text-amber-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStep(3)}
                      className="bg-[#0A2342] hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow"
                    >
                      Next: Attach Documents →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Document Attachments */}
              {formStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold font-serif text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-amber-600" />
                    Attach Document Certificates
                  </h3>

                  {docUploadError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{docUploadError}</span>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {[
                      { docType: 'photo', title: 'Passport Size Photograph *' },
                      { docType: 'signature', title: 'Candidate Specimen Signature *' },
                      { docType: 'marksheet', title: '12th / Diploma Marksheet *' },
                      { docType: 'cetScoreCard', title: 'MHT-CET / ICAR Score Card *' },
                      { docType: 'domicile', title: 'Domicile / Birth Certificate *' },
                      { docType: 'caste', title: 'Caste / Validity Certificate' }
                    ].map((slot) => {
                      const attached = attachedFiles.find(f => f.docType === slot.docType);

                      return (
                        <div key={slot.docType} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <span className="font-bold text-slate-900 block">{slot.title}</span>
                          {attached ? (
                            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-emerald-900">
                              <span className="font-mono truncate max-w-[180px]">{attached.fileName} ({attached.fileSize})</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(slot.docType)}
                                className="text-red-600 hover:text-red-800 font-bold ml-2"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-amber-50 hover:border-amber-400 transition-all text-slate-600">
                              <Upload className="w-4 h-4 text-amber-600" />
                              <span className="font-bold text-xs">Choose File (PDF/JPG, Max 5MB)</span>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(slot.docType, slot.title, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {uploadProgress && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>{uploadProgress}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-2.5 rounded-xl text-xs transition-all shadow flex items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>Submit Application Online</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* Success View */
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-xl font-bold font-serif text-emerald-950">Application Submitted Successfully!</h3>
              <p className="text-xs text-emerald-800 font-mono">Application ID: {submittedApp?.id}</p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handlePrintSlip(submittedApp)}
                  className="bg-[#0A2342] text-amber-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" /> Print Acknowledgment Slip
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSlip(submittedApp)}
                  className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Download className="w-4 h-4" /> Download Slip (.html)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. COURSE OFFERED */}
      {activeSidebarItem === 'course' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-amber-600" />
              B.Tech (Dairy Technology) Program Overview
            </h2>
            <p className="text-xs text-slate-600">
              Undergraduate Degree Program affiliated with Maharashtra Animal & Fishery Sciences University (MAFSU), Nagpur
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#0A2342] uppercase block text-sm">Degree Title</span>
              <p className="font-bold text-slate-800">Bachelor of Technology (Dairy Technology)</p>
              <p className="text-slate-600">4-Year Full Time Professional Undergraduate Program (8 Semesters)</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#0A2342] uppercase block text-sm">Affiliations & Approval</span>
              <p className="font-bold text-slate-800">MAFSU Nagpur & State CET Cell Maharashtra</p>
              <p className="text-slate-600">Recognized by Indian Council of Agricultural Research (ICAR)</p>
            </div>
          </div>

          <div className="p-5 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Key Program Highlights:</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700">
              <li>Comprehensive coverage of Dairy Processing, Chemistry, Engineering, Microbiology & Business Management.</li>
              <li>Hands-on practical training in campus Experimental Commercial Dairy Processing Plant (10,000 LPD).</li>
              <li>In-Plant Training (IPT) in leading national & multinational dairy plants (Amul, Mother Dairy, Dynamix, NDDB).</li>
              <li>100% placement assistance & career opportunities in food/dairy manufacturing & QA labs.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 3. INTAKE CAPACITY */}
      {activeSidebarItem === 'intake' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-600" />
              Approved Seat Matrix & Intake Capacity (2026–27)
            </h2>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Total Sanctioned Seat Intake:</span>
              <span className="text-xl font-extrabold font-mono text-[#0A2342] bg-amber-400 px-3 py-1 rounded-lg">80 Seats</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-blue-900 block text-sm">State Quota (80%)</span>
                <p className="text-slate-600 font-mono text-base font-bold">64 Seats</p>
                <p className="text-[11px] text-slate-500">Filled via State CET Cell Maharashtra CAP Counseling rounds.</p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-amber-800 block text-sm">ICAR / All India Quota (20%)</span>
                <p className="text-slate-600 font-mono text-base font-bold">16 Seats</p>
                <p className="text-[11px] text-slate-500">Filled through ICAR AIEEA Counseling at All-India level.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ELIGIBILITY */}
      {activeSidebarItem === 'eligibility' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
              Eligibility Criteria Matrix
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#0A2342] uppercase text-xs block">Qualifying Examination & Board</span>
              <p className="leading-relaxed">
                XII Std. passed in 10+2 pattern from Maharashtra State Board of Higher Secondary Education or an equivalent examination with Physics, Chemistry and Biology/Mathematics and English.
              </p>
            </div>

            <div className="p-5 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-2">
              <span className="font-extrabold text-[#0A2342] uppercase text-xs block">Deficiency Course Provision</span>
              <p className="leading-relaxed font-medium text-slate-800">
                (Candidates, who had not offered Mathematics/biology, shall have to complete deficiency course as prescribed by respective University.)
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#0A2342] uppercase text-xs block">Eligible HSC Groups & Entrance Exams</span>
              <p className="leading-relaxed font-semibold text-slate-900">
                In general Student with PCB/PCMB/PCM groups in HSC are eligible with valid score of MHTCET/NEET/JEE.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADMISSION PROCESS */}
      {activeSidebarItem === 'process' && (
        <AdmissionProcessWorkflow admissionProcess={collegeInfo.admissionProcess} />
      )}

      {/* 6. DOCUMENTS REQUIRED */}
      {activeSidebarItem === 'documents' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Paperclip className="w-6 h-6 text-amber-600" />
              Mandatory Documents Checklist
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            {[
              '10th (SSC) Marksheet & Passing Certificate',
              '12th (HSC) Marksheet & Passing Certificate',
              'MHT-CET / ICAR Score Card 2026',
              'College Leaving Certificate (TC)',
              'Domicile / Birth Certificate of Maharashtra',
              'Caste Certificate & Caste Validity (if applicable)',
              'Non-Creamy Layer Certificate (OBC/VJNT/SBC valid upto March 2027)',
              'Aadhaar Card Copy & 4 Passport Photographs',
              'Agriculturalist Certificate (for 12% agri quota weightage)',
              'Migration Certificate (for non-MSBSHSE students)'
            ].map((doc, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. FEES STRUCTURE */}
      {activeSidebarItem === 'fees' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-amber-600" />
              Approved Fee Structure 2026–27
            </h2>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-[#0A2342] text-amber-400 font-bold">
                  <th className="p-3 border border-slate-300">Category</th>
                  <th className="p-3 border border-slate-300">Tuition Fee (Per Annum)</th>
                  <th className="p-3 border border-slate-300">Other / University Fees</th>
                  <th className="p-3 border border-slate-300">Total Net Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3 font-bold border border-slate-200">OPEN / General</td>
                  <td className="p-3 border border-slate-200">₹ 75,000</td>
                  <td className="p-3 border border-slate-200">₹ 15,000</td>
                  <td className="p-3 font-bold text-blue-900 border border-slate-200">₹ 90,000</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 font-bold border border-slate-200">OBC / EWS (50% Concession)</td>
                  <td className="p-3 border border-slate-200">₹ 37,500</td>
                  <td className="p-3 border border-slate-200">₹ 15,000</td>
                  <td className="p-3 font-bold text-blue-900 border border-slate-200">₹ 52,500</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold border border-slate-200">SC / ST / VJNT (100% Govt Scholarship)</td>
                  <td className="p-3 border border-slate-200">₹ 0 (Reimbursed by Govt)</td>
                  <td className="p-3 border border-slate-200">₹ 15,000</td>
                  <td className="p-3 font-bold text-emerald-700 border border-slate-200">₹ 15,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. PROSPECTUS */}
      {activeSidebarItem === 'prospectus' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Download className="w-6 h-6 text-amber-600" />
              Information Prospectus 2026–27
            </h2>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Download Admission Information Brochure</h3>
              <p className="text-xs text-slate-600">Complete details on course structure, faculty profiles, campus facilities & scholarship rules.</p>
            </div>

            <button
              onClick={() => alert("Downloading official LSSCDT Admission Prospectus 2026-27 PDF...")}
              className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 shadow shrink-0"
            >
              <Download className="w-4 h-4" /> Download Prospectus PDF
            </button>
          </div>
        </div>
      )}

      {/* 9. CONTACT / ENQUIRY */}
      {activeSidebarItem === 'contact' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Phone className="w-6 h-6 text-amber-600" />
              Admission Enquiry & Helpline
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-[#0A2342] block text-sm">Admission Helpline Phone</span>
              <p className="font-mono text-sm text-blue-900 font-bold">+91 07267 222333 / +91 94228 81234</p>
              <p className="text-slate-500 text-[11px]">Timing: Monday to Saturday (10:00 AM – 5:00 PM)</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-[#0A2342] block text-sm">Email & Address</span>
              <p className="font-bold text-slate-800">admissions@cdtmalkapur.edu.in</p>
              <p className="text-slate-600">Campus: CDTM Malkapur, NH-6, Buldhana District, Maharashtra - 443101</p>
            </div>
          </div>
        </div>
      )}

      {/* 10. TRACK APPLICATION STATUS */}
      {activeSidebarItem === 'track' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Search className="w-6 h-6 text-amber-600" />
              Track Live Application Verification Status
            </h2>
          </div>

          <form onSubmit={handleSearchApp} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter Application ID (e.g. LSSCDT-2026-1042) or Mobile Number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
            />
            <button
              type="submit"
              className="bg-[#0A2342] hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shrink-0 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Status</span>
            </button>
          </form>

          {searchError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {trackedApp && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Application ID</span>
                  <h3 className="text-lg font-extrabold font-mono text-blue-900">{trackedApp.id}</h3>
                  <p className="text-xs text-slate-700">{trackedApp.fullName} | {trackedApp.mobile}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                  trackedApp.status === 'Provisionally Selected' ? 'bg-emerald-600 text-white' :
                  trackedApp.status === 'Verified' ? 'bg-blue-600 text-white' :
                  'bg-amber-500 text-slate-950'
                }`}>
                  {trackedApp.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSlip(trackedApp)}
                  className="bg-[#0A2342] text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Slip
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSlip(trackedApp)}
                  className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Download (.html)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Lightbox Preview Modal */}
      {previewModalDoc && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{previewModalDoc.title}</h3>
                <p className="text-xs text-slate-500 font-mono">{previewModalDoc.fileName}</p>
              </div>
              <button 
                onClick={() => setPreviewModalDoc(null)} 
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 rounded-xl p-2 flex items-center justify-center min-h-[350px] max-h-[550px] overflow-auto">
              {previewModalDoc.fileName.toLowerCase().endsWith('.pdf') || previewModalDoc.url.startsWith('data:application/pdf') ? (
                <iframe 
                  src={previewModalDoc.url} 
                  title={previewModalDoc.title} 
                  className="w-full h-[500px] rounded border-0 bg-white"
                />
              ) : (
                <img 
                  src={previewModalDoc.url} 
                  alt={previewModalDoc.title} 
                  className="max-h-[500px] object-contain rounded shadow-sm"
                />
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <a
                href={previewModalDoc.url}
                target="_blank"
                rel="noreferrer"
                download={previewModalDoc.fileName}
                className="inline-flex items-center gap-1.5 bg-[#0A2342] hover:bg-slate-900 text-amber-400 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" /> Download Original File
              </a>
              <button
                onClick={() => setPreviewModalDoc(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2 rounded-lg text-xs transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </InnerPageLayout>
  );
};
