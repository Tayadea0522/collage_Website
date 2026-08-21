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

  // Curricula Semesters
  const [activeSem, setActiveSem] = useState(1);
  const semesters = [
    {
      sem: 1,
      title: "Semester I - Foundational Dairy Science",
      courses: [
        { code: "DT-111", name: "Market Milk Processing", credits: "3 (2+1)" },
        { code: "DE-111", name: "Fluid Mechanics & Pumps", credits: "3 (2+1)" },
        { code: "DC-111", name: "Physical Chemistry of Milk", credits: "3 (2+1)" },
        { code: "DM-111", name: "Fundamentals of Microbiology", credits: "3 (2+1)" },
        { code: "DBM-111", name: "Milk Procurement & Supply Chain", credits: "2 (1+1)" },
        { code: "ENG-111", name: "Technical English & Communication", credits: "2 (1+1)" },
      ]
    },
    {
      sem: 2,
      title: "Semester II - Chemistry & Engineering Basics",
      courses: [
        { code: "DT-121", name: "Traditional Indian Dairy Products", credits: "3 (2+1)" },
        { code: "DE-121", name: "Thermodynamics & Steam Engineering", credits: "3 (2+1)" },
        { code: "DC-121", name: "Chemistry of Milk Constituents", credits: "3 (2+1)" },
        { code: "DM-121", name: "Starter Cultures & Fermented Milks", credits: "3 (2+1)" },
        { code: "DBM-121", name: "Dairy Economics & Statistics", credits: "3 (2+1)" },
      ]
    },
    {
      sem: 3,
      title: "Semester III - Processing Technology & Refrigeration",
      courses: [
        { code: "DT-211", name: "Fat-Rich Dairy Products (Ghee, Butter)", credits: "3 (2+1)" },
        { code: "DE-211", name: "Refrigeration & Air Conditioning", credits: "3 (2+1)" },
        { code: "DC-211", name: "Chemical Quality Assurance", credits: "3 (1+2)" },
        { code: "DM-211", name: "Microbiological Quality Assurance", credits: "3 (1+2)" },
        { code: "DBM-211", name: "Financial Management in Dairy Industry", credits: "2 (2+0)" },
      ]
    },
    {
      sem: 4,
      title: "Semester IV - Advanced Equipment & Products",
      courses: [
        { code: "DT-221", name: "Condensed & Dried Milks Technology", credits: "4 (3+1)" },
        { code: "DT-222", name: "Ice Cream & Frozen Desserts", credits: "3 (2+1)" },
        { code: "DE-221", name: "Dairy Process Engineering", credits: "3 (2+1)" },
        { code: "DC-221", name: "Food Chemistry & Human Nutrition", credits: "3 (2+1)" },
        { code: "DM-221", name: "Dairy Biotechnology & Enzymes", credits: "2 (2+0)" },
      ]
    },
    {
      sem: 5,
      title: "Semester V - Cheese & Plant Design",
      courses: [
        { code: "DT-311", name: "Cheese & Fermented Dairy Products", credits: "4 (3+1)" },
        { code: "DT-312", name: "Packaging of Dairy Products", credits: "3 (2+1)" },
        { code: "DE-311", name: "Instrumentation & Process Control", credits: "3 (2+1)" },
        { code: "DE-312", name: "Dairy Plant Design & Layout", credits: "3 (1+2)" },
        { code: "DBM-311", name: "Marketing & Export of Dairy Products", credits: "2 (2+0)" },
      ]
    },
    {
      sem: 6,
      title: "Semester VI - By-Products & Industrial Management",
      courses: [
        { code: "DT-321", name: "By-Product Technology & Effluent Treatment", credits: "3 (2+1)" },
        { code: "DT-322", name: "Sensory Evaluation of Dairy Products", credits: "2 (1+1)" },
        { code: "DE-321", name: "Food Engineering & Unit Operations", credits: "3 (2+1)" },
        { code: "DBM-321", name: "Entrepreneurship Development", credits: "3 (2+1)" },
        { code: "DBM-322", name: "Industrial Safety & Hygiene", credits: "2 (2+0)" },
      ]
    },
    {
      sem: 7,
      title: "Semester VII - In-Plant Hands-On Training (ELP)",
      courses: [
        { code: "ELP-411", name: "Commercial In-Plant Training in Commercial Dairy Plant (Amul / Katraj / Mother Dairy)", credits: "20 (0+20)" },
      ]
    },
    {
      sem: 8,
      title: "Semester VIII - Experiential Learning & Project",
      courses: [
        { code: "ELP-421", name: "Hands-on Processing at College Pilot Dairy Plant", credits: "10 (0+10)" },
        { code: "PRJ-422", name: "B.Tech Research Project & Seminar", credits: "10 (0+10)" },
      ]
    },
  ];

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
    { id: 'contact', label: 'Admission Enquiry', icon: Phone, group: 'ADMISSIONS' },
    { id: 'portal', label: 'Admission Portal 2026–27', icon: FileText, badge: 'Online', group: 'ADMISSIONS' },
    { id: 'prospectus', label: 'Admission Prospectus', icon: Download, group: 'ADMISSIONS' },
    { id: 'track', label: 'Track Application Status', icon: Search, group: 'ADMISSIONS' },

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
              Undergraduate Professional Degree
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-amber-600" />
              B.Tech (Dairy Technology) – 4-Year Degree
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Affiliated to MAFSU Nagpur | Approved by ICAR New Delhi | Govt of Maharashtra
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Degree Title</span>
              <p className="font-bold text-[#0A2342] text-sm">Bachelor of Technology (Dairy Technology)</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Duration</span>
              <p className="font-bold text-[#0A2342] text-sm">4 Academic Years (8 Semesters)</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Curriculum Pattern</span>
              <p className="font-bold text-amber-700 text-sm">ICAR VIth Deans' Committee</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold font-serif text-slate-900">Career Scope & Opportunities:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Dairy Plant Operations Executive & Quality Assurance Officer in Amul, Mother Dairy, Nestlé, Dynamix, Britannia, Danone.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Food Safety Officer (FSO / FSSAI) in Government Food & Drug Administration (FDA).</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>R&D Product Development Scientist, Packaging Technologist, and Dairy Microbiology Consultant.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Dairy Entrepreneurship, Milk Processing Startups, and Agricultural Supply Chain Management.</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveSidebarItem('portal')}
              className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <FileText className="w-4 h-4" /> Apply Online in Admission Portal 2026–27
            </button>
          </div>
        </div>
      )}

      {/* 1.2 INTAKE CAPACITY */}
      {activeSidebarItem === 'intake' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-600" />
              Sanctioned Intake & Seat Matrix (2026–27)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-[#0A2342] text-white rounded-2xl space-y-1">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Total Sanctioned Intake</span>
              <div className="text-3xl font-extrabold font-mono">64 Seats</div>
              <p className="text-[11px] text-slate-300">Annual approved intake capacity by MAFSU Nagpur</p>
            </div>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Maharashtra State Quota</span>
              <div className="text-3xl font-extrabold font-mono text-slate-900">80%</div>
              <p className="text-[11px] text-slate-600">Allotted strictly via Centralized CAP rounds by MCAER</p>
            </div>
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
              <span className="text-xs text-amber-800 font-bold uppercase tracking-wider">Institutional / NRI Quota</span>
              <div className="text-3xl font-extrabold font-mono text-amber-900">20%</div>
              <p className="text-[11px] text-amber-700">As per Govt of Maharashtra & MAFSU directives</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold font-serif text-slate-900">Statutory Quotas & Weightages:</h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="font-semibold">Agriculturalist Quota (7/12 Land Record Holder)</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">12% Weightage Points</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="font-semibold">Agricultural Diploma Holder Weightage</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Special Quota</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="font-semibold">Statutory Category Reservations (SC, ST, VJ/NT, OBC, EWS)</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">As Per Govt. Rules</span>
              </div>
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

      {/* 1.4 ADMISSION PROCESS */}
      {activeSidebarItem === 'process' && (
        <AdmissionProcessWorkflow admissionProcess={collegeInfo?.admissionProcess} />
      )}

      {/* 1.5 DOCUMENTS REQUIRED */}
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

      {/* 1.6 FEES STRUCTURE */}
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

      {/* 1.7 ADMISSION ENQUIRY */}
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

      {/* 1.8 ADMISSION PORTAL (3-STEP FORM) */}
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

      {/* 1.10 TRACK APPLICATION STATUS */}
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

      {/* ======================================================== */}
      {/* 2. ACADEMICS GROUP SECTIONS */}
      {/* ======================================================== */}

      {/* 2.1 PROGRAM OVERVIEW */}
      {activeSidebarItem === 'overview' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-600" />
              B.Tech (Dairy Technology) Degree Program Specifications
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Approved by ICAR New Delhi and Affiliated to MAFSU Nagpur
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Degree Title</span>
              <div className="font-bold text-[#0A2342] text-sm">B.Tech (Dairy Technology)</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Course Duration</span>
              <div className="font-bold text-[#0A2342] text-sm">4 Years (8 Semesters)</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Medium of Instruction</span>
              <div className="font-bold text-[#0A2342] text-sm">English</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Curriculum Framework</span>
              <div className="font-bold text-amber-700 text-sm">ICAR VIth Deans' Committee</div>
            </div>
          </div>

          <div className="p-5 bg-amber-50/80 rounded-xl border border-amber-200/90 space-y-3">
            <h3 className="font-bold text-[#0A2342] text-sm font-serif">Eligibility & Admission Criteria:</h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>XII Std. passed in 10+2 pattern from Maharashtra State Board of Higher Secondary Education or an equivalent examination with Physics, Chemistry and Biology/Mathematics and English.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>(Candidates, who had not offered Mathematics/biology, shall have to complete deficiency course as prescribed by respective University.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>In general Student with PCB/PCMB/PCM groups in HSC are eligible with valid score of MHTCET/NEET/JEE.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 2.2 CURRICULUM & SYLLABUS */}
      {activeSidebarItem === 'curriculum' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-600" />
              Semester-Wise Syllabi & Course Scheme
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Select a semester below to view course codes, titles, and credit hours based on ICAR VIth Deans' Committee framework.
            </p>
          </div>

          {/* Semester Selector Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {semesters.map((s) => (
              <button
                key={s.sem}
                onClick={() => setActiveSem(s.sem)}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center ${
                  activeSem === s.sem
                    ? 'bg-[#0A2342] text-amber-400 shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Sem {s.sem}
              </button>
            ))}
          </div>

          {/* Selected Semester Courses Table */}
          {semesters.find(s => s.sem === activeSem) && (
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-bold text-[#0A2342] font-serif border-l-4 border-amber-500 pl-3">
                {semesters.find(s => s.sem === activeSem)?.title}
              </h3>

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
                    {semesters.find(s => s.sem === activeSem)?.courses.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-amber-700">{c.code}</td>
                        <td className="p-3 font-medium text-slate-900">{c.name}</td>
                        <td className="p-3 text-slate-600 font-mono">{c.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2.3 ACADEMIC CALENDAR */}
      {activeSidebarItem === 'calendar' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <Calendar className="w-6 h-6 text-amber-600" />
              Academic Calendar & Examination Schedule (2026–27)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#0A2342] uppercase block">Odd Semesters (Sem I, III, V, VII)</span>
              <ul className="space-y-1 text-slate-700">
                <li><strong>Commencement of Classes:</strong> August 1, 2026</li>
                <li><strong>Mid-Term Examinations:</strong> October 12–20, 2026</li>
                <li><strong>Semester End Theory & Practicals:</strong> December 10–24, 2026</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-extrabold text-[#0A2342] uppercase block">Even Semesters (Sem II, IV, VI, VIII)</span>
              <ul className="space-y-1 text-slate-700">
                <li><strong>Commencement of Classes:</strong> January 5, 2027</li>
                <li><strong>Mid-Term Examinations:</strong> March 15–22, 2027</li>
                <li><strong>Semester End Theory & Practicals:</strong> May 10–25, 2027</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2.4 ACADEMIC REGULATIONS */}
      {activeSidebarItem === 'regulations' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
              Academic Regulations & Attendance Rules
            </h2>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-sm">Attendance Policy</strong>
              <p>Minimum 80% attendance in lectures and practicals is compulsory to appear for MAFSU end-term examinations.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <strong className="text-slate-900 font-bold block text-sm">Evaluation System</strong>
              <p>Continuous internal evaluation (20% mid-term + 10% practicals) + 70% University End-Semester Theory Examination.</p>
            </div>
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
