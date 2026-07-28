import React, { useState } from 'react';
import { AdmissionApplication, CollegeInfo } from '../types';
import { storageService } from '../services/storageService';
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
  RefreshCw
} from 'lucide-react';

interface AdmissionsProps {
  collegeInfo: CollegeInfo;
  applications: AdmissionApplication[];
  onRefreshApplications: () => void;
}

export const Admissions: React.FC<AdmissionsProps> = ({
  collegeInfo,
  applications,
  onRefreshApplications
}) => {
  const [activeTab, setActiveTab] = useState<'process' | 'apply' | 'track'>('apply');

  // Form State
  const [formStep, setFormStep] = useState(1);
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);

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
    district: 'Amravati',
    state: 'Maharashtra',
    pincode: '',
    
    // Academic
    hscPcmMarks: 250,
    hscTotalMarks: 300,
    hscBoard: 'Maharashtra State Board (MSBSHSE)',
    hscPassingYear: '2026',
    
    // Entrance
    entranceExam: 'MHT-CET' as AdmissionApplication['entranceExam'],
    entranceRollNo: '',
    entrancePercentile: 88.5,
    
    // Quota
    isAgriculturalist: true,
    isMaharashtraDomicile: true,

    // Simulated files
    photoUploaded: true,
    signatureUploaded: true,
    hscMarksheetUploaded: true,
    cetScoreCardUploaded: true,
    casteCertificateUploaded: false,
    domicileCertificateUploaded: true,
  });

  // Track State
  const [searchQuery, setSearchQuery] = useState('');
  const [trackedApp, setTrackedApp] = useState<AdmissionApplication | null>(null);
  const [searchError, setSearchError] = useState('');

  const hscPct = Number(((formData.hscPcmMarks / formData.hscTotalMarks) * 100).toFixed(2));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
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

      hscPcmMarks: Number(formData.hscPcmMarks),
      hscTotalMarks: Number(formData.hscTotalMarks),
      hscPercentage: hscPct,
      hscBoard: formData.hscBoard,
      hscPassingYear: formData.hscPassingYear,

      entranceExam: formData.entranceExam,
      entranceRollNo: formData.entranceRollNo || `CET-${Math.floor(100000 + Math.random() * 900000)}`,
      entrancePercentile: Number(formData.entrancePercentile),

      isAgriculturalist: formData.isAgriculturalist,
      isMaharashtraDomicile: formData.isMaharashtraDomicile,

      status: 'Submitted',
      submissionDate: new Date().toISOString().split('T')[0],
      remarks: 'Application submitted online successfully. Awaiting document verification by college scrutiny committee.',
      documentsUploaded: {
        photo: formData.photoUploaded,
        signature: formData.signatureUploaded,
        hscMarksheet: formData.hscMarksheetUploaded,
        cetScoreCard: formData.cetScoreCardUploaded,
        casteCertificate: formData.casteCertificateUploaded,
        domicileCertificate: formData.domicileCertificateUploaded
      }
    };

    storageService.addApplication(newApp);
    onRefreshApplications();
    setSubmittedApp(newApp);
    setFormStep(4); // Success Slip View
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
      setSearchError(`No application found for '${searchQuery}'. Please check Application ID (e.g. LSSCDT-2026-0012) or Mobile Number.`);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-8 sm:p-12 rounded-2xl shadow-lg border border-amber-500/30">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
            Admissions 2026-27
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
            Online Admission Portal & Application Form
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Apply online for 4-Year B.Tech (Dairy Technology) degree program or track the real-time status of your submitted application.
          </p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-6 py-3 font-bold text-sm sm:text-base transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'apply'
              ? 'border-amber-500 text-blue-900 bg-amber-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-600" />
          <span>Fill Online Application Form</span>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className={`px-6 py-3 font-bold text-sm sm:text-base transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'track'
              ? 'border-amber-500 text-blue-900 bg-amber-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4 text-blue-600" />
          <span>Track Application Status</span>
        </button>

        <button
          onClick={() => setActiveTab('process')}
          className={`px-6 py-3 font-bold text-sm sm:text-base transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'process'
              ? 'border-amber-500 text-blue-900 bg-amber-50/50'
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
          
          {/* Form Step Progress Bar (if not submitted) */}
          {formStep < 4 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <span className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center font-mono text-xs">
                  {formStep}
                </span>
                <span>Step {formStep} of 3: {formStep === 1 ? 'Personal & Contact Info' : formStep === 2 ? 'Academic & Entrance Score' : 'Quota & Documents Review'}</span>
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
                  <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-2">
                    Personal & Guardian Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Candidate Full Name (As per 10th Marksheet) *</label>
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Permanent Residential Address *</label>
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
                          className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="bg-blue-900 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition-all"
                    >
                      Next: Academic Scores →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Academic Qualifications */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-2">
                    Academic Qualifications & Entrance Exam
                  </h2>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <strong>Eligibility Note:</strong> Candidate must have passed 12th Science with Physics, Chemistry, and Mathematics (PCM/PCMB).
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">12th/HSC Education Board *</label>
                      <input
                        type="text"
                        name="hscBoard"
                        required
                        value={formData.hscBoard}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">12th Passing Year *</label>
                      <input
                        type="text"
                        name="hscPassingYear"
                        required
                        value={formData.hscPassingYear}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">PCM Total Obtained Marks (Out of 300) *</label>
                      <input
                        type="number"
                        name="hscPcmMarks"
                        required
                        min={120}
                        max={300}
                        value={formData.hscPcmMarks}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-bold text-blue-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">HSC PCM Percentage (Calculated)</label>
                      <div className="w-full p-2.5 rounded-lg bg-slate-100 font-extrabold text-emerald-700 text-sm border border-slate-300 font-mono">
                        {hscPct}%
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Entrance Exam Appeared *</label>
                      <select
                        name="entranceExam"
                        value={formData.entranceExam}
                        onChange={handleInputChange}
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold"
                      >
                        <option value="MHT-CET">MHT-CET (PCM/PCB)</option>
                        <option value="ICAR AIEEA">ICAR AIEEA</option>
                        <option value="NEET">NEET UG</option>
                        <option value="JEE Main">JEE Main</option>
                      </select>
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
                        className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-bold text-amber-600"
                      />
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
                      className="bg-blue-900 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-lg text-xs"
                    >
                      Next: Quotas & Document Review →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Quotas & Final Submit */}
              {formStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-2">
                    Weightage Quotas & Document Checklist
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        name="isAgriculturalist"
                        checked={formData.isAgriculturalist}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">7% Agriculturalist Quota Certificate</span>
                        <span className="text-[11px] text-slate-500">Father/Self possesses Agricultural Land in Maharashtra</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        name="isMaharashtraDomicile"
                        checked={formData.isMaharashtraDomicile}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-amber-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Maharashtra Domicile Certificate</span>
                        <span className="text-[11px] text-slate-500">State candidate for 80% State Quota seat allocation</span>
                      </div>
                    </label>
                  </div>

                  {/* Document upload checklist simulation */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-900 text-sm">Required Document Upload Status:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {[
                        { label: 'Passport Photo & Signature', key: 'photoUploaded' },
                        { label: '12th/HSC Marksheet PDF', key: 'hscMarksheetUploaded' },
                        { label: 'MHT-CET / ICAR Score Card', key: 'cetScoreCardUploaded' },
                        { label: 'Domicile / Birth Certificate', key: 'domicileCertificateUploaded' },
                        { label: 'Caste Certificate (If applicable)', key: 'casteCertificateUploaded' },
                      ].map((doc, idx) => (
                        <div key={idx} className="p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 flex items-center justify-between">
                          <span className="font-medium">{doc.label}</span>
                          <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">ATTACHED</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Declaration */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-slate-900">Declaration by Candidate:</div>
                    <p className="text-slate-600 leading-relaxed">
                      I hereby declare that all statements made in this online application are true, complete, and correct to the best of my knowledge. I understand that in the event of any information being found false or ineligible, my admission to Late Shaktikumar Sancheti College of Dairy Technology will be cancelled.
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
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-8 py-3 rounded-lg text-sm shadow-md flex items-center gap-2"
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintSlip}
                      className="bg-white text-slate-900 hover:bg-amber-400 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow"
                    >
                      <Printer className="w-4 h-4" /> Print / Save Slip
                    </button>
                  </div>
                </div>

                {/* Printable Admission Application Slip */}
                <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-md space-y-6 print:border-none print:shadow-none">
                  
                  {/* Slip Header */}
                  <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                    <h3 className="text-xl font-black font-serif text-slate-900 uppercase">
                      {collegeInfo.name}
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
                      <span className="text-slate-500 block font-semibold">Course Applied:</span>
                      <strong className="text-amber-700">B.Tech (Dairy Technology)</strong>
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
                      <h4 className="font-bold text-slate-900 text-sm border-b pb-1 text-blue-900">2. Academic & Score Matrix</h4>
                      <p><strong>12th Board:</strong> {submittedApp.hscBoard}</p>
                      <p><strong>HSC PCM Marks:</strong> {submittedApp.hscPcmMarks} / {submittedApp.hscTotalMarks} ({submittedApp.hscPercentage}%)</p>
                      <p><strong>Entrance Exam:</strong> {submittedApp.entranceExam}</p>
                      <p><strong>Roll No:</strong> {submittedApp.entranceRollNo}</p>
                      <p><strong>Percentile Score:</strong> <strong className="text-amber-700">{submittedApp.entrancePercentile}</strong></p>
                      <p><strong>Agri Quota Claimed:</strong> {submittedApp.isAgriculturalist ? 'YES (7% Weightage)' : 'NO'}</p>
                    </div>
                  </div>

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
              Check Live Application Status
            </h2>

            <form onSubmit={handleSearchApp} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter Application ID (e.g. LSSCDT-2026-0012) or Mobile Number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
              <button
                type="submit"
                className="bg-blue-900 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shrink-0 flex items-center justify-center gap-2"
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
                    <p className="text-xs text-slate-600">{trackedApp.fullName} | {trackedApp.mobile}</p>
                  </div>
                  <div className="text-right">
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
            <h3 className="font-bold text-slate-900 text-base">Admission Steps for CAP Round Candidates:</h3>
            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li>Register online on MAFSU / State CET Cell Admission Portal or LSSCDT College Portal.</li>
              <li>Upload 10th, 12th PCM Marksheets, CET Score Card, and Domicile/Caste Certificates.</li>
              <li>Choice filling: Select <strong>Late Shaktikumar Sancheti College of Dairy Technology</strong> as Preference #1.</li>
              <li>Report to campus upon provisional merit allotment for physical document verification & fee deposit.</li>
            </ol>
          </div>
        </div>
      )}

    </div>
  );
};
