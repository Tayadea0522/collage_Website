import React, { useState } from 'react';
import { AdmissionApplication, CollegeInfo } from '../types';
import { storageService } from '../services/storageService';
import { printApplicationSlip, downloadApplicationSlip } from '../utils/printUtils';
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
  BookOpen
} from 'lucide-react';

interface AdmissionsProps {
  collegeInfo: CollegeInfo;
  applications: AdmissionApplication[];
  onRefreshApplications: () => void;
}

interface UploadedDoc {
  id: string;
  docType: string;
  title: string;
  fileName: string;
  fileSize: string;
  dataUrl?: string;
  uploadedAt: string;
}

export const Admissions: React.FC<AdmissionsProps> = ({
  collegeInfo,
  applications,
  onRefreshApplications
}) => {
  const [activeTab, setActiveTab] = useState<'process' | 'apply' | 'track'>('apply');

  // Form Step State
  const [formStep, setFormStep] = useState(1);
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [previewModalDoc, setPreviewModalDoc] = useState<{ title: string; fileName: string; dataUrl?: string } | null>(null);

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

  // Real File Upload Handler
  const handleFileUpload = (docType: string, title: string, event: React.ChangeEvent<HTMLInputElement>) => {
    setDocUploadError('');
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setDocUploadError(`File '${file.name}' exceeds the maximum allowed size of 5 MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const formattedSize = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
        : `${(file.size / 1024).toFixed(1)} KB`;

      const newDoc: UploadedDoc = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        docType,
        title,
        fileName: file.name,
        fileSize: formattedSize,
        dataUrl,
        uploadedAt: new Date().toLocaleDateString('en-IN')
      };

      setAttachedFiles(prev => {
        const filtered = prev.filter(d => d.docType !== docType);
        return [...filtered, newDoc];
      });
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (docType: string) => {
    setAttachedFiles(prev => prev.filter(d => d.docType !== docType));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const appNumber = Math.floor(1000 + Math.random() * 9000);
      const newAppId = `LSSCDT-2026-${appNumber}`;

      const newApp: AdmissionApplication = {
        id: newAppId,
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        dob: formData.dob || '2007-06-15',
        gender: formData.gender,
        category: formData.category,
        email: formData.email,
        mobile: formData.mobile,
        aadharNumber: formData.aadharNumber,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,

        admissionYear: formData.admissionYear,
        admissionBranch: formData.admissionBranch,

        previousQualification: formData.previousQualification,
        previousInstitute: formData.previousInstitute || 'Previous School / College',
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
        entranceRollNo: formData.entranceRollNo || `EXAM-${Math.floor(100000 + Math.random() * 900000)}`,
        entrancePercentile: Number(formData.entrancePercentile),

        isAgriculturalist: formData.isAgriculturalist,
        isMaharashtraDomicile: formData.isMaharashtraDomicile,

        status: 'Submitted',
        submissionDate: new Date().toISOString().split('T')[0],
        remarks: 'Application submitted online with attached documents. Awaiting scrutiny verification.',
        documentsUploaded: {
          photo: attachedFiles.some(f => f.docType === 'photo'),
          signature: attachedFiles.some(f => f.docType === 'signature'),
          hscMarksheet: attachedFiles.some(f => f.docType === 'marksheet'),
          cetScoreCard: attachedFiles.some(f => f.docType === 'cetScoreCard'),
          casteCertificate: attachedFiles.some(f => f.docType === 'caste'),
          domicileCertificate: attachedFiles.some(f => f.docType === 'domicile'),
          agriculturalistCertificate: attachedFiles.some(f => f.docType === 'agriculturalist')
        },
        attachedFiles: attachedFiles.map(f => ({
          id: f.id,
          title: f.title,
          fileName: f.fileName,
          fileSize: f.fileSize,
          dataUrl: f.dataUrl,
          uploadedAt: f.uploadedAt
        }))
      };

      storageService.addApplication(newApp);
      onRefreshApplications();
      setSubmittedApp(newApp);
      setFormStep(4); // Success Slip View
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
      setSearchError(`No application found for '${searchQuery}'. Please check Application ID (e.g. LSSCDT-2026-1042) or Mobile Number.`);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      
      {/* Banner */}
      <div className="bg-[#0A2342] text-white p-8 sm:p-12 rounded-2xl shadow border-b-4 border-[#D97706]">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D97706] bg-amber-500/10 px-3 py-1 rounded border border-[#D97706]/30">
            Admissions 2026-27
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            Online Admission Portal & Document Attachment Form
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            Apply online for 4-Year B.Tech (Dairy Technology) degree program, upload document certificates, or track live application verification status.
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 font-sans">
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-6 py-3 font-bold text-sm sm:text-base transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'apply'
              ? 'border-[#D97706] text-[#0A2342] bg-[#F0F4F8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D97706]" />
          <span>Fill Online Application Form</span>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className={`px-6 py-3 font-bold text-sm sm:text-base transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'track'
              ? 'border-[#D97706] text-[#0A2342] bg-[#F0F4F8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4 text-[#0A2342]" />
          <span>Track Application Status</span>
        </button>

        <button
          onClick={() => setActiveTab('process')}
          className={`px-6 py-3 font-bold text-sm sm:text-base transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'process'
              ? 'border-[#D97706] text-[#0A2342] bg-[#F0F4F8]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Eligibility & Admission Guidelines</span>
        </button>
      </div>

      {/* TAB 1: ONLINE APPLICATION FORM */}
      {activeTab === 'apply' && (
        <div className="space-y-8">
          
          {/* Form Step Progress Bar */}
          {formStep < 4 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <span className="w-6 h-6 rounded-full bg-[#0A2342] text-white flex items-center justify-center font-mono text-xs">
                  {formStep}
                </span>
                <span>
                  Step {formStep} of 3: {
                    formStep === 1 ? 'Personal & Contact Info' : 
                    formStep === 2 ? 'Admission Year & Previous Academic Qualification' : 
                    'Document Attachments & Submission'
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(step => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      step === formStep ? 'w-12 bg-amber-500' : step < formStep ? 'w-6 bg-emerald-500' : 'w-6 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Form Content */}
          {formStep < 4 ? (
            <form onSubmit={handleSubmitApplication} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              
              {/* STEP 1: Personal Details */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#D97706]" />
                    Candidate Personal & Guardian Details
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Candidate Full Name (As per 10th / 12th Marksheet) *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="e.g. Aditi Ramesh Deshmukh"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold text-blue-900"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
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
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <input
                          type="text"
                          name="pincode"
                          required
                          maxLength={6}
                          placeholder="Pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="bg-[#0A2342] hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all"
                    >
                      Next: Admission Year & Academic Qualifications →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Admission Seeking Year, Branch & Previous Qualifications */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#D97706]" />
                    Admission Year, Branch Choice & Previous Academic Qualifications
                  </h2>

                  {/* 1. Admission Seeking Year & Branch */}
                  <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#D97706]" />
                      <h3 className="font-bold text-[#0A2342] text-sm">Admission Seeking Options</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-900 mb-1">
                          Admission Seeking Year *
                        </label>
                        <select
                          name="admissionYear"
                          value={formData.admissionYear}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-xl border border-amber-300 bg-white font-bold text-[#0A2342] focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                        >
                          <option value="First Year (1st Year)">First Year (1st Year - Fresh Regular Entry)</option>
                          <option value="Direct Second Year (2nd Year - Lateral Entry)">Direct Second Year (2nd Year - Lateral Entry)</option>
                          <option value="Third Year (3rd Year)">Third Year (3rd Year)</option>
                          <option value="Fourth Year (4th Year)">Fourth Year (4th Year)</option>
                        </select>
                        <p className="text-[11px] text-slate-500 mt-1">
                          * Note: Fresh 12th Science passouts select First Year. Candidates with Diploma or Graduate degree taking lateral entry select Direct Second Year.
                        </p>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-900 mb-1">
                          Branch / Program Choice *
                        </label>
                        <select
                          name="admissionBranch"
                          value={formData.admissionBranch}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-xl border border-amber-300 bg-white font-bold text-[#0A2342] focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                        >
                          <option value="B.Tech (Dairy Technology)">B.Tech (Dairy Technology) [Primary Degree Program]</option>
                          <option value="B.Tech (Dairy Engineering Specialization)">B.Tech (Dairy Engineering Specialization)</option>
                          <option value="B.Tech (Dairy Chemistry & Quality Assurance)">B.Tech (Dairy Chemistry & Quality Assurance)</option>
                        </select>
                        <p className="text-[11px] text-slate-500 mt-1">
                          * 4-Year Professional Degree Program approved by ICAR & MAFSU Nagpur.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Previous Qualification Details */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-900" />
                      <h3 className="font-bold text-[#0A2342] text-sm">Previous Qualification Details</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Previous Qualification Level *</label>
                        <select
                          name="previousQualification"
                          value={formData.previousQualification}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold text-blue-900"
                        >
                          <option value="12th Science / HSC">12th Science / HSC (10+2 PCM/PCMB)</option>
                          <option value="Diploma (Dairy Tech / Food Tech / Engg)">Diploma (Dairy Tech / Food Tech / Engineering)</option>
                          <option value="Graduate (B.Sc / B.Tech)">Graduate (B.Sc Dairy Science / Chemistry / B.Tech)</option>
                          <option value="Other">Other Equivalent Qualification</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">School / College / Institute Name *</label>
                        <input
                          type="text"
                          name="previousInstitute"
                          required
                          placeholder="e.g. Govt Polytechnic / High School"
                          value={formData.previousInstitute}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Board / University Name *</label>
                        <input
                          type="text"
                          name="previousBoardUniversity"
                          required
                          value={formData.previousBoardUniversity}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Stream / Specialization *</label>
                        <input
                          type="text"
                          name="previousStreamBranch"
                          required
                          placeholder="e.g. Science (PCM), Dairy Technology, Chemistry"
                          value={formData.previousStreamBranch}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Year of Passing *</label>
                        <input
                          type="text"
                          name="previousPassingYear"
                          required
                          value={formData.previousPassingYear}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Marks Obtained & Total Marks *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            name="previousObtainedMarks"
                            required
                            placeholder="Obtained"
                            value={formData.previousObtainedMarks}
                            onChange={handleInputChange}
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-bold text-blue-900"
                          />
                          <input
                            type="number"
                            name="previousTotalMarks"
                            required
                            placeholder="Total"
                            value={formData.previousTotalMarks}
                            onChange={handleInputChange}
                            className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-bold text-slate-700"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs">
                      <span className="font-bold text-blue-900">Previous Qualification Percentage / CGPA:</span>
                      <span className="text-base font-extrabold font-mono text-emerald-700 bg-white px-3 py-1 rounded border border-emerald-300">
                        {prevPct}%
                      </span>
                    </div>
                  </div>

                  {/* 3. Entrance Exam Matrix */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-[#0A2342] text-sm">Competitive Entrance Exam Details</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Entrance Exam Name *</label>
                        <select
                          name="entranceExam"
                          value={formData.entranceExam}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold text-slate-800"
                        >
                          <option value="MHT-CET">MHT-CET (PCM/PCB)</option>
                          <option value="ICAR AIEEA">ICAR AIEEA</option>
                          <option value="NEET">NEET UG</option>
                          <option value="JEE Main">JEE Main</option>
                          <option value="Not Applicable (Lateral Entry)">Not Applicable (Lateral Entry Candidate)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Exam Roll No / Seat No</label>
                        <input
                          type="text"
                          name="entranceRollNo"
                          placeholder="e.g. 26098412"
                          value={formData.entranceRollNo}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Percentile / Merit Score *</label>
                        <input
                          type="number"
                          step="0.01"
                          name="entrancePercentile"
                          required
                          value={formData.entrancePercentile}
                          onChange={handleInputChange}
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-extrabold text-amber-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-6 py-2.5 rounded-lg text-xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStep(3)}
                      className="bg-[#0A2342] hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs"
                    >
                      Next: Document Attachments & Quotas →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Real Interactive Document Uploads & Quota Declarations */}
              {formStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-[#D97706]" />
                    Document Uploads & Certificate Attachments
                  </h2>

                  {/* Quota Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        name="isAgriculturalist"
                        checked={formData.isAgriculturalist}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">7% Agriculturalist Quota Weightage</span>
                        <span className="text-[11px] text-slate-500">Father/Self possesses Agricultural Land in Maharashtra State</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        name="isMaharashtraDomicile"
                        checked={formData.isMaharashtraDomicile}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Maharashtra State Domicile Certificate</span>
                        <span className="text-[11px] text-slate-500">Required for 80% State Quota seat allocation</span>
                      </div>
                    </label>
                  </div>

                  {docUploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{docUploadError}</span>
                    </div>
                  )}

                  {/* Real Interactive Attachment Pickers */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Upload & Attach Certificate Documents:</h3>
                        <p className="text-[11px] text-slate-500">Accepted formats: PDF, JPG, PNG (Max 5 MB each)</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded">
                        {attachedFiles.length} File(s) Attached
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      {[
                        { docType: 'photo', title: 'Passport Size Photograph', req: true, accept: 'image/*' },
                        { docType: 'signature', title: 'Candidate Specimen Signature', req: true, accept: 'image/*' },
                        { docType: 'marksheet', title: '12th / Diploma / Degree Marksheet', req: true, accept: 'image/*,.pdf' },
                        { docType: 'cetScoreCard', title: 'MHT-CET / ICAR Score Card', req: true, accept: 'image/*,.pdf' },
                        { docType: 'domicile', title: 'Domicile / Birth Certificate', req: true, accept: 'image/*,.pdf' },
                        { docType: 'caste', title: 'Caste / Category Certificate', req: false, accept: 'image/*,.pdf' },
                        { docType: 'agriculturalist', title: '7% Agriculturalist Certificate', req: false, accept: 'image/*,.pdf' }
                      ].map((slot) => {
                        const fileMatch = attachedFiles.find(f => f.docType === slot.docType);

                        return (
                          <div 
                            key={slot.docType} 
                            className={`p-4 rounded-xl border transition-all ${
                              fileMatch 
                                ? 'bg-emerald-50/80 border-emerald-300 shadow-sm' 
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {slot.title} {slot.req && <span className="text-red-500">*</span>}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {slot.req ? 'Mandatory Attachment' : 'Optional (If applicable)'}
                                </span>
                              </div>
                              {fileMatch && (
                                <span className="bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                  <FileCheck className="w-3 h-3" /> Attached
                                </span>
                              )}
                            </div>

                            {fileMatch ? (
                              <div className="space-y-2 mt-3 pt-2 border-t border-emerald-200">
                                <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-emerald-200">
                                  <div className="truncate max-w-[140px] font-mono font-medium text-slate-800">
                                    {fileMatch.fileName}
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500">{fileMatch.fileSize}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {fileMatch.dataUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewModalDoc({ title: slot.title, fileName: fileMatch.fileName, dataUrl: fileMatch.dataUrl })}
                                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 rounded text-[11px] flex items-center justify-center gap-1"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> View
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(slot.docType)}
                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded border border-red-200"
                                    title="Remove document"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="mt-3 cursor-pointer bg-white hover:bg-amber-50 text-slate-800 hover:text-amber-900 font-bold p-2.5 rounded-lg border border-slate-300 hover:border-amber-400 text-[11px] flex items-center justify-center gap-2 transition-all shadow-sm">
                                <Upload className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>Attach {slot.title}</span>
                                <input
                                  type="file"
                                  accept={slot.accept}
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(slot.docType, slot.title, e)}
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-slate-900">Declaration by Candidate:</div>
                    <p className="text-slate-600 leading-relaxed">
                      I hereby declare that all statements made in this online application are true, complete, and correct to the best of my knowledge. I understand that attached files are submitted for scrutiny and any false information will result in cancellation of my admission to Late Shaktikumar Sancheti College of Dairy Technology.
                    </p>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-6 py-2.5 rounded-lg text-xs"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-8 py-3 rounded-xl text-sm shadow-md flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Application Online</span>
                    </button>
                  </div>
                </div>
              )}

            </form>
          ) : (
            /* STEP 4: SUBMITTED SUCCESS & APPLICATION SLIP PREVIEW */
            submittedApp && (
              <div className="space-y-6">
                <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-10 h-10 text-amber-300 shrink-0" />
                    <div>
                      <h2 className="text-xl font-bold font-serif">Application Submitted Successfully!</h2>
                      <p className="text-xs text-emerald-100">Your unique Application ID is <strong className="text-amber-300 font-mono text-sm">{submittedApp.id}</strong></p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePrintSlip(submittedApp)}
                      className="bg-white text-slate-900 hover:bg-amber-400 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors"
                    >
                      <Printer className="w-4 h-4 text-[#0A2342]" /> Print Application Slip
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSlip(submittedApp)}
                      className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download Slip (.html)
                    </button>
                  </div>
                </div>

                {/* Printable Admission Application Slip */}
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-md space-y-6 print:border-none print:shadow-none">
                  
                  {/* Slip Header */}
                  <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900 uppercase tracking-tight">
                      {collegeInfo.name.includes('College') ? collegeInfo.name : `${collegeInfo.name} ${collegeInfo.tagline || 'College of Dairy Technology'}`}
                    </h3>
                    <p className="text-xs text-slate-600">{collegeInfo.address}</p>
                    <p className="text-xs font-bold text-amber-700">{collegeInfo.affiliation}</p>
                    <div className="inline-block mt-2 bg-slate-900 text-amber-300 font-bold text-xs px-4 py-1 rounded uppercase tracking-wider">
                      ACKNOWLEDGEMENT SLIP - ONLINE ADMISSION 2026-27
                    </div>
                  </div>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block font-semibold">Application ID:</span>
                      <strong className="text-blue-900 font-mono text-sm">{submittedApp.id}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Submission Date:</span>
                      <strong className="text-slate-900 font-mono">{submittedApp.submissionDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Seeking Admission For:</span>
                      <strong className="text-amber-700">{submittedApp.admissionYear}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Current Status:</span>
                      <span className="bg-emerald-100 text-emerald-900 font-extrabold px-2 py-0.5 rounded uppercase text-[10px]">
                        {submittedApp.status}
                      </span>
                    </div>
                  </div>

                  {/* Candidate Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-800">
                    <div className="space-y-2 border p-4 rounded-xl border-slate-200">
                      <h4 className="font-bold text-slate-900 text-sm border-b pb-1 text-blue-900">1. Candidate Profile</h4>
                      <p><strong>Full Name:</strong> {submittedApp.fullName}</p>
                      <p><strong>Father Name:</strong> {submittedApp.fatherName}</p>
                      <p><strong>Mother Name:</strong> {submittedApp.motherName}</p>
                      <p><strong>Category:</strong> {submittedApp.category}</p>
                      <p><strong>Mobile:</strong> {submittedApp.mobile}</p>
                      <p><strong>Email:</strong> {submittedApp.email}</p>
                      <p><strong>Address:</strong> {submittedApp.address}, {submittedApp.district} - {submittedApp.pincode}</p>
                    </div>

                    <div className="space-y-2 border p-4 rounded-xl border-slate-200">
                      <h4 className="font-bold text-slate-900 text-sm border-b pb-1 text-blue-900">2. Academic Matrix & Previous Qualifications</h4>
                      <p><strong>Branch Choice:</strong> {submittedApp.admissionBranch}</p>
                      <p><strong>Previous Qualification:</strong> {submittedApp.previousQualification}</p>
                      <p><strong>Institute / Board:</strong> {submittedApp.previousBoardUniversity}</p>
                      <p><strong>Passing Year & Score:</strong> {submittedApp.previousPassingYear} ({submittedApp.previousPercentage}%)</p>
                      <p><strong>Entrance Exam:</strong> {submittedApp.entranceExam} ({submittedApp.entrancePercentile} Percentile)</p>
                      <p><strong>Agri Quota Claimed:</strong> {submittedApp.isAgriculturalist ? 'YES (7% Weightage)' : 'NO'}</p>
                    </div>
                  </div>

                  {/* Attached Documents List */}
                  {submittedApp.attachedFiles && submittedApp.attachedFiles.length > 0 && (
                    <div className="border p-4 rounded-xl border-slate-200 space-y-2 text-xs">
                      <h4 className="font-bold text-slate-900 text-sm border-b pb-1 text-blue-900">3. Attached Documents Checklist</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {submittedApp.attachedFiles.map((doc, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
                            <span className="font-medium text-slate-800 truncate">{doc.title}</span>
                            <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">ATTACHED</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>* Please preserve this slip for document verification at college campus.</span>
                    <span className="font-mono font-bold text-slate-800">Generated: {new Date().toLocaleString()}</span>
                  </div>

                </div>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setFormStep(1);
                      setSubmittedApp(null);
                      setAttachedFiles([]);
                    }}
                    className="text-xs font-bold text-blue-900 hover:underline"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            )
          )}

        </div>
      )}

      {/* TAB 2: TRACK APPLICATION STATUS */}
      {activeTab === 'track' && (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Check Live Application & Attachment Status
            </h2>

            <form onSubmit={handleSearchApp} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Application ID (e.g. LSSCDT-2026-1042) or Mobile Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-[#0A2342] hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shrink-0 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Status</span>
              </button>
            </form>

            {searchError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Application Result View */}
            {trackedApp && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-300 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Application ID</span>
                    <h3 className="text-xl font-extrabold font-mono text-blue-900">{trackedApp.id}</h3>
                    <p className="text-xs text-slate-600 font-medium">{trackedApp.fullName} | {trackedApp.mobile}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase block">Current Verification Status</span>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase mt-1 ${
                        trackedApp.status === 'Provisionally Selected' ? 'bg-emerald-600 text-white' :
                        trackedApp.status === 'Verified' ? 'bg-blue-600 text-white' :
                        trackedApp.status === 'Rejected' ? 'bg-red-600 text-white' :
                        'bg-amber-500 text-slate-950'
                      }`}>
                        {trackedApp.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => handlePrintSlip(trackedApp)}
                        className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Slip
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadSlip(trackedApp)}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download (.html)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block font-semibold">Admission Seeking For</span>
                    <strong className="text-amber-700">{trackedApp.admissionYear || 'First Year (1st Year)'}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block font-semibold">Previous Qualification</span>
                    <strong className="text-slate-800">{trackedApp.previousQualification || '12th Science'}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block font-semibold">Entrance Score</span>
                    <strong className="text-blue-900">{trackedApp.entranceExam}: {trackedApp.entrancePercentile} %ile</strong>
                  </div>
                </div>

                {/* Status Pipeline Visual */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  {[
                    { label: 'Submitted', done: true },
                    { label: 'Under Review', done: ['Under Review', 'Verified', 'Provisionally Selected'].includes(trackedApp.status) },
                    { label: 'Document Verified', done: ['Verified', 'Provisionally Selected'].includes(trackedApp.status) },
                    { label: 'Seat Allocated', done: trackedApp.status === 'Provisionally Selected' },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border font-bold ${
                        step.done ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono mb-0.5">Step {idx + 1}</div>
                      <div>{step.label}</div>
                    </div>
                  ))}
                </div>

                {/* Attached Documents Listing */}
                {trackedApp.attachedFiles && trackedApp.attachedFiles.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs border-b pb-1 text-blue-900">Attached Documents:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {trackedApp.attachedFiles.map((doc) => (
                        <div key={doc.id} className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-800 block">{doc.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{doc.fileName} ({doc.fileSize})</span>
                          </div>
                          {doc.dataUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewModalDoc({ title: doc.title, fileName: doc.fileName, dataUrl: doc.dataUrl })}
                              className="text-xs text-blue-900 hover:underline font-bold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Remarks from Admin */}
                {trackedApp.remarks && (
                  <div className="p-4 bg-white rounded-xl border border-amber-300 text-xs text-slate-800 space-y-1">
                    <span className="font-bold text-amber-800 uppercase block">Scrutiny Remarks:</span>
                    <p className="italic">{trackedApp.remarks}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* TAB 3: GUIDELINES & SEATS */}
      {activeTab === 'process' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-3">
            B.Tech (Dairy Technology) Admission Guidelines 2026-27
          </h2>

          <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
            <h3 className="font-bold text-slate-900 text-base">Admission Steps & Eligibility Matrix:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-blue-900 uppercase block">First Year Admission (1st Year)</span>
                <p>12th Science pass with Physics, Chemistry, Mathematics (PCM/PCMB) from recognized board + valid score in MHT-CET / ICAR AIEEA / NEET / JEE Main.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-amber-700 uppercase block">Direct Second Year (Lateral Entry)</span>
                <p>Passed 3-Year Diploma in Dairy Technology / Food Technology / Agriculture Engineering OR B.Sc degree from recognized board/university.</p>
              </div>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>Register online on LSSCDT College Portal or MAFSU / State CET Cell Admission Portal.</li>
              <li>Fill personal details, select admission seeking year (First Year or Direct Second Year Lateral Entry).</li>
              <li>Attach mandatory documents: Passport Photo, Signature, Marksheet, CET Scorecard & Domicile.</li>
              <li>Report to campus upon provisional merit allotment for physical document verification & fee deposit.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Document Lightbox / Modal Preview */}
      {previewModalDoc && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{previewModalDoc.title}</h3>
                <p className="text-xs text-slate-500 font-mono">{previewModalDoc.fileName}</p>
              </div>
              <button 
                onClick={() => setPreviewModalDoc(null)} 
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 rounded-xl p-2 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto">
              {previewModalDoc.dataUrl?.startsWith('data:image/') ? (
                <img 
                  src={previewModalDoc.dataUrl} 
                  alt={previewModalDoc.title} 
                  className="max-h-[450px] object-contain rounded"
                />
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-16 h-16 text-blue-900 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Document Attached (PDF or Binary File)</p>
                  <a
                    href={previewModalDoc.dataUrl}
                    download={previewModalDoc.fileName}
                    className="inline-flex items-center gap-1.5 bg-[#0A2342] text-amber-400 text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    <Download className="w-4 h-4" /> Download File Preview
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewModalDoc(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2 rounded-lg text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
