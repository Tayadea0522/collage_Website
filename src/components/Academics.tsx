import React, { useState, useEffect, useRef } from 'react';
import { AdmissionApplication, CollegeInfo, AcademicsData } from '../types';
import { initialAcademicsData } from '../data/initialAcademicsData';
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
  Layers,
  Mail,
  MessageSquare,
  MapPin,
  Clock
} from 'lucide-react';

interface AcademicsProps {
  collegeInfo?: CollegeInfo;
  applications?: AdmissionApplication[];
  onRefreshApplications?: () => void;
  onNavigateTab?: (tab: string) => void;
  initialSection?: string;
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

const ADMISSION_DRAFT_KEY = 'lsscdt_admission_form_draft';
const ADMISSION_STEP_KEY = 'lsscdt_admission_form_step';
const ACADEMICS_SIDEBAR_KEY = 'lsscdt_academics_sidebar_tab';

const initialDefaultFormData = {
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
};

export const Academics: React.FC<AcademicsProps> = ({
  collegeInfo,
  applications = [],
  onRefreshApplications = () => {},
  onNavigateTab,
  initialSection
}) => {
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>(() => {
    if (initialSection) return initialSection;
    try {
      const saved = sessionStorage.getItem(ACADEMICS_SIDEBAR_KEY);
      if (saved) return saved;
    } catch (e) {}
    return 'overview';
  });

  useEffect(() => {
    if (initialSection) {
      setActiveSidebarItem(initialSection);
    }
  }, [initialSection]);

  const handleSelectSidebar = (item: string) => {
    setActiveSidebarItem(item);
    try {
      sessionStorage.setItem(ACADEMICS_SIDEBAR_KEY, item);
    } catch (e) {}
  };

  // Dynamic Academics & Admissions Content from Admin CMS
  const academicsData: AcademicsData = {
    coursesOffered: { ...initialAcademicsData.coursesOffered, ...collegeInfo?.academicsData?.coursesOffered },
    intakeCapacity: { ...initialAcademicsData.intakeCapacity, ...collegeInfo?.academicsData?.intakeCapacity },
    eligibility: { ...initialAcademicsData.eligibility, ...collegeInfo?.academicsData?.eligibility },
    admissionProcess: collegeInfo?.academicsData?.admissionProcess || collegeInfo?.admissionProcess || initialAcademicsData.admissionProcess,
    documentsRequired: { ...initialAcademicsData.documentsRequired, ...collegeInfo?.academicsData?.documentsRequired },
    feesStructure: { ...initialAcademicsData.feesStructure, ...collegeInfo?.academicsData?.feesStructure },
    admissionEnquiry: { ...initialAcademicsData.admissionEnquiry, ...collegeInfo?.academicsData?.admissionEnquiry },
    admissionPortal: { ...initialAcademicsData.admissionPortal, ...collegeInfo?.academicsData?.admissionPortal },
    admissionProspectus: { ...initialAcademicsData.admissionProspectus, ...collegeInfo?.academicsData?.admissionProspectus },
    trackApplicationStatus: { ...initialAcademicsData.trackApplicationStatus, ...collegeInfo?.academicsData?.trackApplicationStatus },
    programOverview: { ...initialAcademicsData.programOverview, ...collegeInfo?.academicsData?.programOverview },
    curriculumSyllabus: { ...initialAcademicsData.curriculumSyllabus, ...collegeInfo?.academicsData?.curriculumSyllabus },
    academicCalendar: { ...initialAcademicsData.academicCalendar, ...collegeInfo?.academicsData?.academicCalendar },
    academicRegulations: { ...initialAcademicsData.academicRegulations, ...collegeInfo?.academicsData?.academicRegulations }
  };

  const isEnquiryActive = academicsData.admissionEnquiry?.isActive !== false;
  const isPortalActive = academicsData.admissionPortal?.isActive === true;
  const isTrackActive = academicsData.trackApplicationStatus?.isActive === true;

  // Auto-redirect if on a hidden/disabled tab
  useEffect(() => {
    if (!isPortalActive && activeSidebarItem === 'portal') {
      setActiveSidebarItem('course');
    }
    if (!isTrackActive && activeSidebarItem === 'track') {
      setActiveSidebarItem('course');
    }
  }, [isPortalActive, isTrackActive, activeSidebarItem]);

  // Curricula Semesters
  const [activeSem, setActiveSem] = useState(1);
  const dynamicSemesters = academicsData.curriculumSyllabus?.semesters && academicsData.curriculumSyllabus.semesters.length > 0
    ? academicsData.curriculumSyllabus.semesters
    : initialAcademicsData.curriculumSyllabus.semesters;

  // Form Step State
  const [formStep, setFormStepState] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(ADMISSION_STEP_KEY);
      if (saved) {
        const stepNum = parseInt(saved, 10);
        if (stepNum >= 1 && stepNum <= 3) return stepNum;
      }
    } catch (e) {}
    return 1;
  });

  const setFormStep = (step: number) => {
    setFormStepState(step);
    try {
      sessionStorage.setItem(ADMISSION_STEP_KEY, String(step));
    } catch (e) {}
  };

  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Form State with automatic session persistence
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(ADMISSION_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialDefaultFormData, ...parsed };
      }
    } catch (e) {}
    return initialDefaultFormData;
  });

  const resetAdmissionDraft = () => {
    if (window.confirm('Are you sure you want to clear the draft and reset the form?')) {
      setFormData(initialDefaultFormData);
      setFormStep(1);
      attachedFiles.forEach(f => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
      setAttachedFiles([]);
      try {
        sessionStorage.removeItem(ADMISSION_DRAFT_KEY);
        sessionStorage.removeItem(ADMISSION_STEP_KEY);
      } catch (e) {}
    }
  };

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
      setFormData(prev => {
        const updated = { ...prev, [name]: checked };
        try {
          sessionStorage.setItem(ADMISSION_DRAFT_KEY, JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
    } else {
      setFormData(prev => {
        const updated = { ...prev, [name]: value };
        try {
          sessionStorage.setItem(ADMISSION_DRAFT_KEY, JSON.stringify(updated));
        } catch (err) {}
        return updated;
      });
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

      const prevCalculatedPct = formData.previousTotalMarks > 0 
        ? Number(((formData.previousObtainedMarks / formData.previousTotalMarks) * 100).toFixed(2)) 
        : 0;
      const hscCalculatedPct = formData.hscTotalMarks > 0 
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
        previousPercentage: prevCalculatedPct,

        hscPcmMarks: Number(formData.hscPcmMarks),
        hscTotalMarks: Number(formData.hscTotalMarks),
        hscPercentage: hscCalculatedPct,
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
      try {
        sessionStorage.removeItem(ADMISSION_DRAFT_KEY);
        sessionStorage.removeItem(ADMISSION_STEP_KEY);
      } catch (e) {}
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

  // Structured Grouped Sidebar Items
  const sidebarItems: SidebarItem[] = [
    // ADMISSIONS GROUP
    { id: 'course', label: 'Courses Offered', icon: GraduationCap, group: 'ADMISSIONS' },
    { id: 'intake', label: 'Intake Capacity', icon: Building2, group: 'ADMISSIONS' },
    { id: 'eligibility', label: 'Eligibility', icon: ShieldCheck, group: 'ADMISSIONS' },
    { id: 'process', label: 'Admission Process', icon: FileCheck, group: 'ADMISSIONS' },
    { id: 'documents', label: 'Documents Required', icon: Paperclip, group: 'ADMISSIONS' },
    { id: 'fees', label: 'Fees Structure', icon: IndianRupee, group: 'ADMISSIONS' },
    ...(isEnquiryActive ? [{ id: 'contact', label: 'Admission Enquiry', icon: Phone, group: 'ADMISSIONS' }] : []),
    ...(isPortalActive ? [{ id: 'portal', label: 'Admission Portal 2026–27', icon: FileText, badge: 'Online', group: 'ADMISSIONS' }] : []),
    ...(academicsData.admissionProspectus?.isActive !== false ? [{ id: 'prospectus', label: 'Admission Prospectus', icon: Download, group: 'ADMISSIONS' }] : []),
    ...(isTrackActive ? [{ id: 'track', label: 'Track Application Status', icon: Search, group: 'ADMISSIONS' }] : []),

    // ACADEMICS GROUP
    { id: 'overview', label: 'Program Overview', icon: Award, group: 'ACADEMICS' },
    { id: 'curriculum', label: 'Curriculum & Syllabus', icon: BookOpen, badge: '8 Sems', group: 'ACADEMICS' },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar, group: 'ACADEMICS' },
    { id: 'regulations', label: 'Academic Regulations', icon: ShieldCheck, group: 'ACADEMICS' },
  ];

  return (
    <InnerPageLayout
      title="Academics & Admissions"
      categoryTag="B.Tech (Dairy Technology)"
      subtitle="Comprehensive Academic Curricula, Course Structure, and Official Centralized Admission Portal"
      breadcrumbPath={[
        { label: 'Home', tab: 'home' },
        { label: 'Academics' },
        { label: sidebarItems.find(s => s.id === activeSidebarItem)?.label || 'Program Overview' }
      ]}
      sidebarItems={sidebarItems}
      activeItem={activeSidebarItem}
      onSelectSidebarItem={handleSelectSidebar}
      onNavigateTab={onNavigateTab}
      helplinePhone={academicsData.admissionEnquiry?.phoneNumbers || collegeInfo?.phone}
    >
      {/* ======================================================== */}
      {/* 1. ADMISSIONS GROUP SECTIONS */}
      {/* ======================================================== */}

      {/* 1.1 COURSES OFFERED */}
      {activeSidebarItem === 'course' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-amber-600" />
              {academicsData.coursesOffered?.degreeType || 'Undergraduate Professional Degree'}
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-amber-600" />
              {academicsData.coursesOffered?.degreeTitle || 'B.Tech (Dairy Technology) – 4-Year Degree'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {academicsData.coursesOffered?.affiliation || 'Affiliated to MAFSU Nagpur'} | {academicsData.coursesOffered?.approvalInfo || 'Approved by ICAR New Delhi | Govt of Maharashtra'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Degree Title</span>
              <p className="font-bold text-[#0A2342] text-sm">{academicsData.coursesOffered?.courseName || 'Bachelor of Technology (Dairy Technology)'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Duration</span>
              <p className="font-bold text-[#0A2342] text-sm">{academicsData.coursesOffered?.duration || '4 Academic Years (8 Semesters)'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Curriculum Pattern</span>
              <p className="font-bold text-amber-700 text-sm">{academicsData.coursesOffered?.curriculumPattern || "ICAR VIth Deans' Committee"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold font-serif text-slate-900">{academicsData.coursesOffered?.careerScopeHeading || 'Career Scope & Opportunities:'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              {(academicsData.coursesOffered?.careerOpportunities || []).map((co, idx) => (
                <div key={co.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">{co.title}</span>
                    <span className="text-slate-600">{co.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isPortalActive && (
            <div className="pt-2">
              <button
                onClick={() => setActiveSidebarItem(academicsData.coursesOffered?.applyButtonUrl || 'portal')}
                className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <FileText className="w-4 h-4" /> {academicsData.coursesOffered?.applyButtonText || 'Apply Online in Admission Portal 2026–27'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1.2 INTAKE CAPACITY */}
      {activeSidebarItem === 'intake' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-600" />
              {academicsData.intakeCapacity?.sectionTitle || 'Sanctioned Intake & Seat Matrix (2026–27)'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-[#0A2342] text-white rounded-2xl space-y-1">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Total Sanctioned Intake</span>
              <div className="text-3xl font-extrabold font-mono">{academicsData.intakeCapacity?.totalIntakeLabel || `${academicsData.intakeCapacity?.totalIntake || 64} Seats`}</div>
              <p className="text-[11px] text-slate-300">Annual approved intake capacity by MAFSU Nagpur</p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Maharashtra State Quota</span>
              <div className="text-3xl font-extrabold font-mono text-slate-900">{academicsData.intakeCapacity?.stateQuotaPercentage || '80%'}</div>
              <p className="text-[11px] text-slate-600">{academicsData.intakeCapacity?.stateQuotaNote || 'Allotted strictly via Centralized CAP rounds by MCAER'}</p>
            </div>
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
              <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">Institutional / NRI Quota</span>
              <div className="text-3xl font-extrabold font-mono text-amber-900">{academicsData.intakeCapacity?.institutionalQuotaPercentage || '20%'}</div>
              <p className="text-[11px] text-amber-700">{academicsData.intakeCapacity?.institutionalQuotaNote || 'As per Govt of Maharashtra & MAFSU directives'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold font-serif text-slate-900">Statutory Quotas & Weightages:</h3>
            <div className="space-y-2 text-xs text-slate-700">
              {(academicsData.intakeCapacity?.quotas || []).filter(q => q.isActive !== false).map((quota, idx) => (
                <div key={quota.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-900 block">{quota.title}</span>
                    {quota.description && <span className="text-slate-500 text-[11px]">{quota.description}</span>}
                  </div>
                  <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded shrink-0">{quota.seatsOrPercentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 1.3 ELIGIBILITY */}
      {activeSidebarItem === 'eligibility' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
              {academicsData.eligibility?.heading || 'Eligibility Criteria Matrix'}
            </h2>
            {academicsData.eligibility?.subtitle && (
              <p className="text-xs text-slate-600 mt-1">{academicsData.eligibility.subtitle}</p>
            )}
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            {(academicsData.eligibility?.items || []).filter(item => item.isActive !== false).map((item, idx) => (
              <div key={item.id || idx} className={`p-5 rounded-xl border space-y-2 ${idx % 2 === 1 ? 'bg-amber-50/80 border-amber-200/90' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-[#0A2342] uppercase text-xs block">{item.title}</span>
                  {item.badge && <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">{item.badge}</span>}
                </div>
                <p className="leading-relaxed text-slate-800">{item.description}</p>
                {item.requiredSubjects && (
                  <p className="text-xs text-slate-600"><strong>Required Subjects:</strong> {item.requiredSubjects}</p>
                )}
                {item.minimumMarks && (
                  <p className="text-xs text-slate-600"><strong>Minimum Marks:</strong> {item.minimumMarks}</p>
                )}
                {item.entranceExams && (
                  <p className="text-xs font-semibold text-blue-900"><strong>Entrance Exams:</strong> {item.entranceExams}</p>
                )}
                {item.notes && (
                  <p className="text-[11px] text-slate-500 italic">Note: {item.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1.4 ADMISSION PROCESS */}
      {activeSidebarItem === 'process' && (
        <AdmissionProcessWorkflow 
          admissionProcess={academicsData.admissionProcess} 
          helplinePhone={academicsData.admissionEnquiry?.phoneNumbers || collegeInfo?.phone}
        />
      )}

      {/* 1.5 DOCUMENTS REQUIRED */}
      {activeSidebarItem === 'documents' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Paperclip className="w-6 h-6 text-amber-600" />
              {academicsData.documentsRequired?.sectionTitle || 'Mandatory Documents Checklist'}
            </h2>
            {academicsData.documentsRequired?.subtitle && (
              <p className="text-xs text-slate-600 mt-1">{academicsData.documentsRequired.subtitle}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            {(academicsData.documentsRequired?.items || []).filter(item => item.isActive !== false).map((doc, idx) => (
              <div key={doc.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 block">{doc.title}</span>
                  {doc.description && <span className="text-slate-500 text-[11px] block">{doc.description}</span>}
                  {doc.isMandatory && <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded inline-block mt-1">Mandatory</span>}
                </div>
              </div>
            ))}
          </div>

          {academicsData.documentsRequired?.note && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong>Important Note: </strong>{academicsData.documentsRequired.note}
            </div>
          )}
        </div>
      )}

      {/* 1.6 FEES STRUCTURE */}
      {activeSidebarItem === 'fees' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-6 h-6 text-amber-600" />
              {academicsData.feesStructure?.heading || 'Approved Fee Structure'} {academicsData.feesStructure?.academicYear ? `(${academicsData.feesStructure.academicYear})` : ''}
            </h2>
            {academicsData.feesStructure?.subtitle && (
              <p className="text-xs text-slate-600 mt-1">{academicsData.feesStructure.subtitle}</p>
            )}
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
                {(academicsData.feesStructure?.categories || []).filter(cat => cat.isActive !== false).map((cat, idx) => (
                  <tr key={cat.id || idx} className={idx % 2 === 1 ? 'bg-slate-50' : ''}>
                    <td className="p-3 font-bold border border-slate-200">
                      <div>{cat.categoryName}</div>
                      {cat.concessionNote && <div className="text-[10px] font-normal text-slate-500">{cat.concessionNote}</div>}
                    </td>
                    <td className="p-3 border border-slate-200">{cat.tuitionFee}</td>
                    <td className="p-3 border border-slate-200">{cat.otherFee}</td>
                    <td className="p-3 font-bold text-blue-900 border border-slate-200">{cat.totalFee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {academicsData.feesStructure?.notes && academicsData.feesStructure.notes.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <strong className="text-slate-900 block font-bold">Important Fee Rules:</strong>
              <ul className="list-disc pl-5 space-y-1">
                {academicsData.feesStructure.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {academicsData.feesStructure?.bankDetails && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-slate-800 space-y-1">
              <strong className="text-blue-950 font-bold block">College Bank Account for Online Fee Transfer:</strong>
              <p><strong>Account Name:</strong> {academicsData.feesStructure.bankDetails.accountName}</p>
              <p><strong>Bank:</strong> {academicsData.feesStructure.bankDetails.bankName}, Branch: {academicsData.feesStructure.bankDetails.branch}</p>
              <p><strong>Account Number:</strong> {academicsData.feesStructure.bankDetails.accountNumber} | <strong>IFSC:</strong> {academicsData.feesStructure.bankDetails.ifscCode}</p>
            </div>
          )}
        </div>
      )}

      {/* 1.7 ADMISSION ENQUIRY */}
      {activeSidebarItem === 'contact' && isEnquiryActive && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Phone className="w-6 h-6 text-amber-600" />
              {academicsData.admissionEnquiry?.heading || 'Centralized Admission Counseling & Enquiry Cell'}
            </h2>
            {academicsData.admissionEnquiry?.description ? (
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {academicsData.admissionEnquiry.description}
              </p>
            ) : academicsData.admissionEnquiry?.subtitle ? (
              <p className="text-xs text-slate-600 mt-1">{academicsData.admissionEnquiry.subtitle}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-[#0A2342] block text-sm flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-600" /> Admission Helpline Phone
              </span>
              <p className="font-mono text-sm text-blue-900 font-bold break-words">
                {academicsData.admissionEnquiry?.phoneNumbers || academicsData.admissionEnquiry?.helplinePhone || collegeInfo?.phone || '+91 8625869560 / +91 9422880000'}
              </p>
              <p className="text-slate-500 text-[11px]">
                <span className="font-semibold text-slate-700">Working Hours: </span>
                {academicsData.admissionEnquiry?.workingHours || 'Monday to Saturday: 9:30 AM to 5:30 PM (Except Public Holidays)'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-[#0A2342] block text-sm flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-amber-600" /> Official Admissions Email
              </span>
              <p className="font-bold text-slate-800 break-words">
                {academicsData.admissionEnquiry?.email || academicsData.admissionEnquiry?.helplineEmail || collegeInfo?.email || 'admissions@lsscdt.edu.in'}
              </p>
              <p className="text-slate-600 leading-snug">
                <span className="font-semibold text-slate-700">Campus Office: </span>
                {academicsData.admissionEnquiry?.officeAddress || collegeInfo?.address || 'Admission Counseling Cell, Administrative Building, LSSCDT Campus, Dasarkhed MIDC Road, Malkapur – 443101, Dist. Buldhana (M.S.)'}
              </p>
            </div>
          </div>

          {/* WhatsApp Action Card if WhatsApp number or link is configured */}
          {(academicsData.admissionEnquiry?.whatsappNumber || academicsData.admissionEnquiry?.whatsappLink) && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-900 font-bold text-sm">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Admission Support</span>
                </div>
                <p className="text-xs text-emerald-800">
                  Connect directly with our admission counselor on WhatsApp for quick inquiries and guidance.
                </p>
                {academicsData.admissionEnquiry.whatsappNumber && (
                  <p className="text-xs font-mono font-bold text-emerald-900">
                    +{academicsData.admissionEnquiry.whatsappNumber.replace(/[^0-9]/g, '')}
                  </p>
                )}
              </div>
              <a
                href={
                  academicsData.admissionEnquiry.whatsappLink ||
                  `https://wa.me/${academicsData.admissionEnquiry.whatsappNumber?.replace(/[^0-9]/g, '')}?text=Hello%20LSSCDT%20Admissions,%20I%20would%20like%20to%20know%20more%20about%20B.Tech%20Dairy%20Technology%20admissions.`
                }
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow inline-flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          )}

          {academicsData.admissionEnquiry?.coordinators && academicsData.admissionEnquiry.coordinators.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0A2342] font-serif">Admission Nodal Officers & Counselors:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {academicsData.admissionEnquiry.coordinators.filter(c => c.isActive !== false).map((c, idx) => (
                  <div key={c.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="font-bold text-slate-900 block">{c.name}</span>
                    <span className="text-slate-600 text-[11px] block">{c.designation}</span>
                    <span className="font-mono text-blue-900 font-semibold block">{c.phone}</span>
                    {c.email && <span className="text-slate-500 text-[11px] block">{c.email}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1.8 ADMISSION PORTAL (3-STEP FORM) */}
      {activeSidebarItem === 'portal' && isPortalActive && (
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetAdmissionDraft}
                  className="text-[11px] font-semibold text-slate-500 hover:text-red-600 underline px-2 py-1 transition-colors"
                >
                  Reset Form
                </button>
                <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 shrink-0">
                  Step {formStep} of 3
                </span>
              </div>
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold text-xs"
                      >
                        <option value="OPEN">OPEN / General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="VJNT">VJNT</option>
                        <option value="EWS">EWS</option>
                        <option value="SBC">SBC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Number (WhatsApp) *</label>
                      <input
                        type="tel"
                        name="mobile"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="candidate@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Aadhaar Number (12 Digits) *</label>
                      <input
                        type="text"
                        name="aadharNumber"
                        required
                        maxLength={12}
                        placeholder="123456789012"
                        value={formData.aadharNumber}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block font-bold text-slate-700 text-xs">Residential Address *</label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      placeholder="House No, Village/City, Tehsil..."
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">District *</label>
                        <input
                          type="text"
                          name="district"
                          required
                          value={formData.district}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">State *</label>
                        <input
                          type="text"
                          name="state"
                          required
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          required
                          maxLength={6}
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.fullName || !formData.mobile || !formData.email || !formData.dob) {
                          alert('Please fill all mandatory fields (Name, DOB, Mobile, Email, Address).');
                          return;
                        }
                        setFormStep(2);
                      }}
                      className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow"
                    >
                      Next: Academic Scores & Entrance →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Academic Qualifications & Entrance */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold font-serif text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    Academic Qualification & Entrance Exam Scores
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Qualifying Exam</label>
                      <select
                        name="previousQualification"
                        value={formData.previousQualification}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold text-xs"
                      >
                        <option value="12th Science / HSC">12th Science / HSC</option>
                        <option value="Diploma in Dairy Technology">Diploma in Dairy Technology</option>
                        <option value="Diploma in Agriculture">Diploma in Agriculture</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Junior College / School Name *</label>
                      <input
                        type="text"
                        name="previousInstitute"
                        required
                        placeholder="Junior College Name"
                        value={formData.previousInstitute}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Board / University</label>
                      <input
                        type="text"
                        name="previousBoardUniversity"
                        value={formData.previousBoardUniversity}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">HSC (PCM) Marks Obtained *</label>
                      <input
                        type="number"
                        name="hscPcmMarks"
                        required
                        value={formData.hscPcmMarks}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">HSC (PCM) Total Marks *</label>
                      <input
                        type="number"
                        name="hscTotalMarks"
                        required
                        value={formData.hscTotalMarks}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">HSC PCM Percentage</label>
                      <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300 font-mono font-bold text-amber-800 text-xs">
                        {hscPct}%
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Entrance Examination *</label>
                      <select
                        name="entranceExam"
                        value={formData.entranceExam}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold text-xs"
                      >
                        <option value="MHT-CET">MHT-CET (PCB/PCM)</option>
                        <option value="ICAR-AIEEA">ICAR-AIEEA</option>
                        <option value="NEET">NEET</option>
                        <option value="JEE">JEE Main</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Entrance Roll No / Application No</label>
                      <input
                        type="text"
                        name="entranceRollNo"
                        placeholder="e.g. 26019482"
                        value={formData.entranceRollNo}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Entrance Percentile / Score *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="entrancePercentile"
                        required
                        value={formData.entrancePercentile}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="font-bold text-[#0A2342] text-xs uppercase block">Statutory Quotas</span>
                    <div className="flex flex-col sm:flex-row gap-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isAgriculturalist"
                          checked={formData.isAgriculturalist}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300"
                        />
                        <span className="font-semibold text-slate-800">Agriculturalist Quota (7/12 Land Record Holder)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isMaharashtraDomicile"
                          checked={formData.isMaharashtraDomicile}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300"
                        />
                        <span className="font-semibold text-slate-800">Maharashtra Domicile Candidate</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
                    >
                      ← Back to Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.previousInstitute) {
                          alert('Please enter your previous Junior College or Institute name.');
                          return;
                        }
                        setFormStep(3);
                      }}
                      className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow"
                    >
                      Next: Document Uploads →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Mandatory Document Uploads */}
              {formStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-base font-bold font-serif text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-amber-600" />
                    Mandatory Document Uploads (JPG, PNG, or PDF – Max 5 MB each)
                  </h3>

                  {docUploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{docUploadError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {[
                      { type: 'photo', label: 'Passport Size Photograph *', required: true },
                      { type: 'signature', label: 'Candidate Signature *', required: true },
                      { type: 'marksheet', label: '12th (HSC) Marksheet *', required: true },
                      { type: 'cetScoreCard', label: 'MHT-CET / ICAR Score Card *', required: true },
                      { type: 'domicile', label: 'Domicile / Birth Certificate *', required: true },
                      { type: 'caste', label: 'Caste Certificate (if applicable)', required: false },
                      { type: 'agriculturalist', label: '7/12 Land Extract (for Agri quota)', required: false }
                    ].map((slot) => {
                      const uploaded = attachedFiles.find(f => f.docType === slot.type);
                      return (
                        <div key={slot.type} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-800">{slot.label}</span>
                            {uploaded ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Attached
                              </span>
                            ) : slot.required ? (
                              <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">Required</span>
                            ) : null}
                          </div>

                          {uploaded ? (
                            <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200">
                              <div className="truncate max-w-[180px]">
                                <p className="font-bold text-slate-900 truncate">{uploaded.fileName}</p>
                                <p className="text-[10px] text-slate-500">{uploaded.fileSize}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setPreviewModalDoc({ title: uploaded.title, fileName: uploaded.fileName, url: uploaded.previewUrl })}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Preview"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(slot.type)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-lg p-3 text-center cursor-pointer block transition-colors bg-white">
                              <Upload className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                              <span className="text-[11px] font-bold text-[#0A2342]">Select File</span>
                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => handleFileUpload(slot.type, slot.label, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {uploadProgress && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin text-amber-600" />
                      <span>{uploadProgress}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-all"
                    >
                      ← Back to Academic
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-8 py-3 rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Official Application (2026–27)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>
          ) : (
            /* STEP 4: Success & Printable Acknowledgment */
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-2xl font-bold font-serif text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-600">
                  Your admission registration for B.Tech (Dairy Technology) 2026–27 has been successfully logged.
                </p>
                {submittedApp && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-blue-900">
                    Application ID: {submittedApp.id}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handlePrintSlip(submittedApp)}
                  className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow"
                >
                  <Printer className="w-4 h-4" /> Print Admission Slip
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSlip(submittedApp)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" /> Download Receipt (.html)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedApp(null);
                    setFormStep(1);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1.9 PROSPECTUS */}
      {activeSidebarItem === 'prospectus' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Download className="w-6 h-6 text-amber-600" />
              {academicsData.admissionProspectus?.heading || 'Information Prospectus 2026–27'}
            </h2>
            {academicsData.admissionProspectus?.subtitle && (
              <p className="text-xs text-slate-600 mt-1">{academicsData.admissionProspectus.subtitle}</p>
            )}
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-base">{academicsData.admissionProspectus?.description || 'Download Admission Information Brochure'}</h3>
              <p className="text-xs text-slate-600">Complete details on course structure, faculty profiles, campus facilities & scholarship rules.</p>
              {academicsData.admissionProspectus?.fileSize && (
                <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded inline-block mt-1">File Size: {academicsData.admissionProspectus.fileSize}</span>
              )}
            </div>

            {academicsData.admissionProspectus?.brochureFileUrl ? (
              <a
                href={academicsData.admissionProspectus.brochureFileUrl}
                target="_blank"
                rel="noreferrer"
                download="LSSCDT_Admission_Prospectus.pdf"
                className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 shadow shrink-0 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Prospectus PDF
              </a>
            ) : (
              <button
                onClick={() => alert("Downloading official LSSCDT Admission Prospectus 2026-27 PDF...")}
                className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-2 shadow shrink-0"
              >
                <Download className="w-4 h-4" /> Download Prospectus PDF
              </button>
            )}
          </div>

          {academicsData.admissionProspectus?.highlights && academicsData.admissionProspectus.highlights.length > 0 && (
            <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Brochure Key Contents:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {academicsData.admissionProspectus.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 1.10 TRACK APPLICATION STATUS */}
      {activeSidebarItem === 'track' && isTrackActive && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Search className="w-6 h-6 text-amber-600" />
              {academicsData.trackApplicationStatus?.heading || 'Track Live Application Verification Status'}
            </h2>
            {academicsData.trackApplicationStatus?.subtitle && (
              <p className="text-xs text-slate-600 mt-1">{academicsData.trackApplicationStatus.subtitle}</p>
            )}
          </div>

          <form onSubmit={handleSearchApp} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={academicsData.trackApplicationStatus?.searchPlaceholder || 'Enter Application ID (e.g. LSSCDT-2026-1042) or Mobile Number'}
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

      {/* ======================================================== */}
      {/* 2. ACADEMICS GROUP SECTIONS */}
      {/* ======================================================== */}

      {/* 2.1 PROGRAM OVERVIEW */}
      {activeSidebarItem === 'overview' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-600" />
              {academicsData.programOverview?.title || 'B.Tech (Dairy Technology) Degree Program Specifications'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {academicsData.programOverview?.subtitle || 'Approved by ICAR New Delhi and Affiliated to MAFSU Nagpur'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Degree Title</span>
              <div className="font-bold text-[#0A2342] text-sm">{academicsData.programOverview?.degreeTitle || 'B.Tech (Dairy Technology)'}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Course Duration</span>
              <div className="font-bold text-[#0A2342] text-sm">{academicsData.programOverview?.duration || '4 Years (8 Semesters)'}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Medium of Instruction</span>
              <div className="font-bold text-[#0A2342] text-sm">{academicsData.programOverview?.mediumOfInstruction || 'English'}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Curriculum Framework</span>
              <div className="font-bold text-amber-700 text-sm">{academicsData.programOverview?.curriculumFramework || "ICAR VIth Deans' Committee"}</div>
            </div>
          </div>

          {academicsData.programOverview?.highlights && academicsData.programOverview.highlights.length > 0 && (
            <div className="p-5 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-3">
              <h3 className="font-bold text-[#0A2342] text-sm font-serif">Key Program Highlights:</h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {academicsData.programOverview.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {academicsData.programOverview?.keyOutcomes && academicsData.programOverview.keyOutcomes.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-[#0A2342] text-sm font-serif">Program Learning Outcomes:</h3>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                {academicsData.programOverview.keyOutcomes.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Entry and Exit Options (Fig. 1) */}
          {(academicsData.programOverview?.entryExitOptions?.isVisible !== false) && (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold font-serif text-[#0A2342] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-600" />
                  {academicsData.programOverview?.entryExitOptions?.title || 'Entry and Exit Options'}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {academicsData.programOverview?.entryExitOptions?.description || 'The entry and exit options for the B. Tech. (Dairy Technology) Programme are shown in Figure 1 below:'}
                </p>
              </div>

              {/* High-Clarity Diagram Container */}
              <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-50/70 border border-slate-200 rounded-xl">
                <div className="w-full max-w-2xl bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex justify-center">
                  <img
                    src={academicsData.programOverview?.entryExitImageUrl || academicsData.programOverview?.entryExitOptions?.imageUrl || '/entry-and-exit-options.svg'}
                    alt="Entry and Exit options for the UG program in Dairy Technology"
                    loading="lazy"
                    decoding="async"
                    className="w-full max-w-xl h-auto object-contain rounded-lg"
                  />
                </div>

                <div className="text-center mt-4 space-y-1">
                  <p className="text-xs font-bold text-slate-900">
                    {academicsData.programOverview?.entryExitOptions?.caption || 'Fig.1 Entry and Exit options for the UG program in Dairy Technology'}
                  </p>
                  <p className="text-[11px] font-semibold text-amber-800">
                    {academicsData.programOverview?.entryExitOptions?.footnote || 'DE* Direct Entry in the respective year'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2.2 CURRICULUM & SYLLABUS */}
      {activeSidebarItem === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-600" />
                {academicsData.curriculumSyllabus?.heading || academicsData.curriculumSyllabus?.sectionTitle || 'Semester-Wise Syllabi & Course Scheme'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {academicsData.curriculumSyllabus?.subtitle || academicsData.curriculumSyllabus?.frameworkNote || "Select a semester below to view course codes, titles, and credit hours based on ICAR VIth Deans' Committee framework."}
              </p>
            </div>

            {/* Complete Syllabus PDF Download */}
            {academicsData.curriculumSyllabus?.syllabusPdfUrl && (
              <a
                href={academicsData.curriculumSyllabus.syllabusPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow shrink-0 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Complete Syllabus PDF
              </a>
            )}
          </div>

          {/* Semester Selector Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {dynamicSemesters.map((s, idx) => {
              const semNum = s.sem ?? s.semesterNumber ?? (idx + 1);
              return (
                <button
                  key={s.id || semNum}
                  onClick={() => setActiveSem(semNum)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                    activeSem === semNum
                      ? 'bg-[#0A2342] text-amber-400 shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Sem {semNum}
                </button>
              );
            })}
          </div>

          {/* Selected Semester Courses Table */}
          {(() => {
            const currentSemester = dynamicSemesters.find((s, idx) => (s.sem ?? s.semesterNumber ?? (idx + 1)) === activeSem) || dynamicSemesters[0];
            if (!currentSemester) return null;
            return (
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-amber-500 pl-3">
                  <h3 className="text-base font-bold text-[#0A2342] font-serif">
                    {currentSemester.title}
                  </h3>
                  {currentSemester.totalCredits && (
                    <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 w-fit">
                      Total: {currentSemester.totalCredits}
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0A2342] text-amber-400 font-bold">
                        <th className="p-3 rounded-tl-lg">Course Code</th>
                        <th className="p-3">Course Title</th>
                        <th className="p-3 rounded-tr-lg">Credit Hours (L+P)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {(currentSemester.courses || []).map((c, i) => (
                        <tr key={c.id || i} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-amber-700">{c.code}</td>
                          <td className="p-3 font-medium text-slate-900">{c.title || c.name}</td>
                          <td className="p-3 text-slate-600 font-mono">{c.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 2.3 ACADEMIC CALENDAR */}
      {activeSidebarItem === 'calendar' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                <Calendar className="w-6 h-6 text-amber-600" />
                {academicsData.academicCalendar?.heading || 'Academic Calendar & Examination Schedule'} {academicsData.academicCalendar?.academicYear ? `(${academicsData.academicCalendar.academicYear})` : ''}
              </h2>
              {academicsData.academicCalendar?.subtitle && (
                <p className="text-xs text-slate-600 mt-1">{academicsData.academicCalendar.subtitle}</p>
              )}
            </div>

            {academicsData.academicCalendar?.calendarPdfUrl && (
              <a
                href={academicsData.academicCalendar.calendarPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow shrink-0 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Academic Calendar PDF
              </a>
            )}
          </div>

          {/* Dynamic Events List if configured in CMS */}
          {academicsData.academicCalendar?.events && academicsData.academicCalendar.events.length > 0 ? (
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse bg-white rounded-xl border border-slate-200 shadow-xs">
                <thead>
                  <tr className="bg-[#0A2342] text-amber-400 font-bold">
                    <th className="p-3 rounded-tl-lg">Academic Event</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Scheduled Dates / Period</th>
                    <th className="p-3 rounded-tr-lg">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {academicsData.academicCalendar.events.filter(e => e.isActive !== false).map((e, idx) => (
                    <tr key={e.id || idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-[#0A2342]">{e.title}</td>
                      <td className="p-3 text-slate-600">{e.semester || 'All Semesters'}</td>
                      <td className="p-3 font-semibold text-amber-900">{e.dates}</td>
                      <td className="p-3">
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                          {e.badge || 'Academic'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-[#0A2342] uppercase block">{academicsData.academicCalendar?.oddSemesterHeading || 'Odd Semesters (Sem I, III, V, VII)'}</span>
                <ul className="space-y-1.5 text-slate-700">
                  {(academicsData.academicCalendar?.oddSemesterEvents || [
                    { event: 'Commencement of Classes', date: 'August 1, 2026' },
                    { event: 'Mid-Term Examinations', date: 'October 12–20, 2026' },
                    { event: 'Semester End Theory & Practicals', date: 'December 10–24, 2026' }
                  ]).map((e, idx) => (
                    <li key={idx}><strong>{e.event}:</strong> {e.date}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-[#0A2342] uppercase block">{academicsData.academicCalendar?.evenSemesterHeading || 'Even Semesters (Sem II, IV, VI, VIII)'}</span>
                <ul className="space-y-1.5 text-slate-700">
                  {(academicsData.academicCalendar?.evenSemesterEvents || [
                    { event: 'Commencement of Classes', date: 'January 5, 2027' },
                    { event: 'Mid-Term Examinations', date: 'March 15–22, 2027' },
                    { event: 'Semester End Theory & Practicals', date: 'May 10–25, 2027' }
                  ]).map((e, idx) => (
                    <li key={idx}><strong>{e.event}:</strong> {e.date}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2.4 ACADEMIC REGULATIONS */}
      {activeSidebarItem === 'regulations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
                {academicsData.academicRegulations?.heading || 'Academic Regulations & Attendance Rules'}
              </h2>
              {academicsData.academicRegulations?.subtitle && (
                <p className="text-xs text-slate-600 mt-1">{academicsData.academicRegulations.subtitle}</p>
              )}
            </div>

            {academicsData.academicRegulations?.regulationsPdfUrl && (
              <a
                href={academicsData.academicRegulations.regulationsPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow shrink-0 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Official Regulations PDF
              </a>
            )}
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-sm">Attendance Policy</strong>
              <p>{academicsData.academicRegulations?.attendancePolicy || 'Minimum 80% attendance in lectures and practicals is compulsory to appear for MAFSU end-term examinations.'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-sm">Evaluation System</strong>
              <p>{academicsData.academicRegulations?.evaluationSystem || 'Continuous internal evaluation (20% mid-term + 10% practicals) + 70% University End-Semester Theory Examination.'}</p>
            </div>

            {academicsData.academicRegulations?.gradingScheme && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-900 font-bold block text-sm">Grading & Passing Scheme</strong>
                <p>{academicsData.academicRegulations.gradingScheme}</p>
              </div>
            )}

            {((academicsData.academicRegulations?.rules && academicsData.academicRegulations.rules.length > 0) ||
              (academicsData.academicRegulations?.regulations && academicsData.academicRegulations.regulations.length > 0)) && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <strong className="text-amber-950 font-bold block text-sm">Key Academic Rules & Disciplinary Norms:</strong>
                <ul className="space-y-1.5 list-disc pl-5">
                  {(academicsData.academicRegulations?.rules || academicsData.academicRegulations?.regulations || [])
                    .filter((r: any) => r.isActive !== false)
                    .map((r: any, idx: number) => (
                      <li key={r.id || idx}>
                        <strong>{r.title}:</strong> {r.description}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
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
