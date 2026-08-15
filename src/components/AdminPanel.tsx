import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { CollegeInfo, Notice, DepartmentInfo, FacultyMember, AdmissionApplication, GalleryItem, CollegeEvent, AdminUser, DownloadableDocument, NoticeAttachment, PopupBanner, AdmissionProcessStep, AdmissionProcessData } from '../types';
import { storageService } from '../services/storageService';
import { zipService } from '../services/zipService';
import { supabaseStorageService } from '../services/supabaseStorageService';
import { supabase } from '../supabaseClient.js';
import { printApplicationSlip, downloadApplicationSlip } from '../utils/printUtils';
import { PopupBannerManager } from './PopupBannerManager';
import { PopupBannerModal } from './PopupBannerModal';
import { 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Users, 
  Building2, 
  Search, 
  Eye, 
  Image as ImageIcon,
  Sparkles,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Upload,
  UserCheck,
  X,
  LayoutGrid,
  GraduationCap,
  Download,
  Bell,
  Printer,
  Settings,
  Phone,
  Shield,
  Sliders,
  Mail,
  MapPin,
  ChevronRight,
  UserPlus,
  KeyRound,
  User,
  Filter,
  Crown,
  Star,
  FileCheck,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react';

interface AdminPanelProps {
  collegeInfo: CollegeInfo;
  notices: Notice[];
  events: CollegeEvent[];
  departments: DepartmentInfo[];
  faculty: FacultyMember[];
  applications: AdmissionApplication[];
  gallery: GalleryItem[];
  downloads: DownloadableDocument[];
  currentAdminUser?: AdminUser | null;
  onRefreshAll: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  collegeInfo,
  notices,
  events,
  departments,
  faculty,
  applications,
  gallery,
  downloads,
  currentAdminUser,
  onRefreshAll,
  onLogout
}) => {
  type AdminTab = 
    | 'dashboard' 
    | 'applications' 
    | 'approved' 
    | 'departments' 
    | 'faculty' 
    | 'gallery' 
    | 'notices' 
    | 'events' 
    | 'downloads' 
    | 'popup'
    | 'info' 
    | 'admission_process'
    | 'contact' 
    | 'admin_users';

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Popup Banner state
  const [popupBanner, setPopupBanner] = useState<PopupBanner>(() => storageService.getPopupBanner());
  const [previewPopup, setPreviewPopup] = useState<PopupBanner | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Admin Users management state
  const [adminUsersList, setAdminUsersList] = useState<AdminUser[]>([]);
  const [isLoadingAdminUsers, setIsLoadingAdminUsers] = useState<boolean>(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    username: '',
    email: '',
    mobile: '',
    role: 'Admission Incharge' as AdminUser['role'],
    securityQuestion: 'What is the college code?',
    securityAnswer: 'LSSCDT',
    password: ''
  });

  const loadAdminUsers = useCallback(async () => {
    setIsLoadingAdminUsers(true);
    try {
      const list = await storageService.fetchAdminUsers();
      setAdminUsersList(list);
    } catch (err) {
      console.warn('Error loading admin users:', err);
    } finally {
      setIsLoadingAdminUsers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'admin_users') {
      loadAdminUsers();
    }
  }, [activeTab, loadAdminUsers]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper for image file to base64 & Supabase cloud storage conversion
  const handleImageFileUpload = (file: File, callback: (url: string) => void, folder: string = 'general') => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please select a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const localBase64 = reader.result;
        callback(localBase64); // Fast local UI preview
        showToast('Processing image...');

        // Asynchronously upload to Supabase Storage for multi-browser cloud sync
        try {
          const cloudUrl = await supabaseStorageService.uploadImage(file, folder);
          if (cloudUrl && !cloudUrl.startsWith('data:')) {
            callback(cloudUrl);
            showToast('Image uploaded and synced to cloud storage!');
          } else {
            showToast('Image saved locally!');
          }
        } catch (e) {
          console.warn('Cloud image upload fallback:', e);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper Excel Export
  const handleExportExcel = (data: AdmissionApplication[], filename: string) => {
    if (data.length === 0) {
      alert('No student records to export.');
      return;
    }

    const formattedData = data.map((app, index) => ({
      'Sr. No.': index + 1,
      'Application ID': app.id,
      'Student Name': app.fullName,
      'Father Name': app.fatherName,
      'Mother Name': app.motherName,
      'Date of Birth': app.dob,
      'Gender': app.gender,
      'Category': app.category,
      'Mobile': app.mobile,
      'Email': app.email,
      'Aadhar No': app.aadharNumber,
      'District': app.district,
      'State': app.state,
      'HSC Total Marks': app.hscTotalMarks,
      'HSC PCM %': app.hscPercentage,
      'HSC Board': app.hscBoard,
      'Entrance Exam': app.entranceExam,
      'Entrance Percentile': app.entrancePercentile,
      'Agri Quota': app.isAgriculturalist ? 'Yes' : 'No',
      'MH Domicile': app.isMaharashtraDomicile ? 'Yes' : 'No',
      'Status': app.status,
      'Submission Date': app.submissionDate,
      'Remarks': app.remarks || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    showToast(`Excel file ${filename}.xlsx exported successfully!`);
  };

  // 1. College Info Form State
  const [infoForm, setInfoForm] = useState<CollegeInfo>({ ...collegeInfo });

  // Admission Process Workflow State
  const [procIntro, setProcIntro] = useState<string>(
    collegeInfo?.admissionProcess?.introText || 
    "Online centralized admission process is conducted by Maharashtra Council of Agriculture Education & Research (MCAER), Pune and CET Cell after the declaration of results of MHT-CET/NEET/JEE and the procedure of admission is as follows:"
  );

  const [procCapUrl, setProcCapUrl] = useState<string>(
    collegeInfo?.admissionProcess?.capRegistrationUrl || "https://cetcell.mahacet.org/"
  );

  const [procSteps, setProcSteps] = useState<AdmissionProcessStep[]>(
    collegeInfo?.admissionProcess?.steps && collegeInfo.admissionProcess.steps.length > 0
      ? collegeInfo.admissionProcess.steps
      : [
          { id: "step-1", stepNumber: 1, title: "Declaration of results of MHT-CET / NEET / JEE", description: "Results and scorecards are officially declared by state and national exam bodies (CET Cell / NTA)." },
          { id: "step-2", stepNumber: 2, title: "Online CAP registration (application) form filling", description: "Eligible candidates must complete online registration on the official Maharashtra State CET Cell portal.", linkUrl: "https://cetcell.mahacet.org/", linkText: "Visit CET Cell Portal" },
          { id: "step-3", stepNumber: 3, title: "Complete the CAP registration form", description: "Fill personal details, academic scores, category specifications, and upload necessary certificates." },
          { id: "step-4", stepNumber: 4, title: "Display of Merit List", description: "Provisional and Final merit lists are published online after scrutiny of submitted application forms." },
          { id: "step-5", stepNumber: 5, title: "Submission of College Preferences", description: "Candidates submit online option forms listing preferred institutes (LSSCDT Malkapur) and courses." },
          { id: "step-6", stepNumber: 6, title: "Display of Round-wise Allotment List", description: "Seat allotment results published for CAP Round I, Round II, and subsequent institutional rounds." },
          { id: "step-7", stepNumber: 7, title: "Reporting by Students to Respective College", description: "Allotted candidates report physically to LSSCDT Malkapur with all original documents within specified dates." },
          { id: "step-8", stepNumber: 8, title: "Document Verification", description: "Physical verification of original academic marksheets, scorecards, caste, and domicile certificates." },
          { id: "step-9", stepNumber: 9, title: "Admission Confirmation", description: "Final fee payment and issuance of official admission confirmation receipt by the institute." }
        ]
  );

  useEffect(() => {
    if (collegeInfo) {
      setInfoForm(collegeInfo);
      if (collegeInfo.admissionProcess) {
        if (collegeInfo.admissionProcess.introText) setProcIntro(collegeInfo.admissionProcess.introText);
        if (collegeInfo.admissionProcess.capRegistrationUrl) setProcCapUrl(collegeInfo.admissionProcess.capRegistrationUrl);
        if (collegeInfo.admissionProcess.steps && collegeInfo.admissionProcess.steps.length > 0) {
          setProcSteps(collegeInfo.admissionProcess.steps);
        }
      }
    }
  }, [collegeInfo]);

  const handleUpdateStep = (index: number, field: keyof AdmissionProcessStep, val: any) => {
    const updated = [...procSteps];
    updated[index] = { ...updated[index], [field]: val };
    setProcSteps(updated);
  };

  const handleAddStep = () => {
    const newStepNum = procSteps.length + 1;
    const newStep: AdmissionProcessStep = {
      id: `step-${Date.now()}`,
      stepNumber: newStepNum,
      title: `New Admission Step ${newStepNum}`,
      description: `Description for step ${newStepNum}`
    };
    setProcSteps([...procSteps, newStep]);
  };

  const handleDeleteStep = (index: number) => {
    if (procSteps.length <= 1) {
      alert("At least one step is required in the admission process.");
      return;
    }
    const updated = procSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 }));
    setProcSteps(updated);
  };

  const handleMoveStep = (index: number, dir: 'up' | 'down') => {
    if ((dir === 'up' && index === 0) || (dir === 'down' && index === procSteps.length - 1)) return;
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    const updated = [...procSteps];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    const renumbered = updated.map((s, i) => ({ ...s, stepNumber: i + 1 }));
    setProcSteps(renumbered);
  };

  const handleSaveAdmissionProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProcess: AdmissionProcessData = {
      introText: procIntro,
      capRegistrationUrl: procCapUrl,
      steps: procSteps.map((s, i) => ({ ...s, stepNumber: i + 1 }))
    };
    const updatedInfo = { ...infoForm, admissionProcess: updatedProcess };
    setInfoForm(updatedInfo);
    const saved = await storageService.saveCollegeInfo(updatedInfo);
    if (saved) setInfoForm(saved);
    onRefreshAll();
    showToast("Admission Process workflow saved to cloud database!");
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Uploading images to permanent cloud storage...');
    const saved = await storageService.saveCollegeInfo(infoForm);
    if (saved) setInfoForm(saved);
    onRefreshAll();
    showToast('College details, banners & leadership images saved successfully!');
  };

  // Banner Actions
  const handleAddBanner = async () => {
    const newBanner = {
      id: `b-${Date.now()}`,
      title: 'New College Banner',
      subtitle: 'ICAR Approved B.Tech (Dairy Technology) Program',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Apply Now'
    };
    const updated = { ...infoForm, heroBanners: [...(infoForm.heroBanners || []), newBanner] };
    setInfoForm(updated);
    const saved = await storageService.saveCollegeInfo(updated);
    if (saved) setInfoForm(saved);
    onRefreshAll();
    showToast('New hero banner added!');
  };

  const handleRemoveBanner = async (id: string) => {
    if ((infoForm.heroBanners || []).length <= 1) {
      alert('You must keep at least one banner image.');
      return;
    }
    const updatedBanners = infoForm.heroBanners.filter(b => b.id !== id);
    const updated = { ...infoForm, heroBanners: updatedBanners };
    setInfoForm(updated);
    const saved = await storageService.saveCollegeInfo(updated);
    if (saved) setInfoForm(saved);
    onRefreshAll();
    showToast('Banner removed.');
  };

  // 2. Notice Form State
  const [noticeList, setNoticeList] = useState<Notice[]>([...notices]);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({
    title: '',
    category: 'Admission',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    isNew: true,
    content: ''
  });
  const [selectedNoticePdf, setSelectedNoticePdf] = useState<File | null>(null);
  const [isUploadingNoticePdf, setIsUploadingNoticePdf] = useState<boolean>(false);
  const [noticePdfError, setNoticePdfError] = useState<string>('');
  const [existingNoticeAttachment, setExistingNoticeAttachment] = useState<NoticeAttachment | undefined>(undefined);

  const handleOpenNoticeEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setNewNotice({
      title: notice.title,
      category: notice.category,
      date: notice.date,
      isNew: notice.isNew ?? true,
      content: notice.content || ''
    });
    setExistingNoticeAttachment(notice.attachment);
    setSelectedNoticePdf(null);
    setNoticePdfError('');
  };

  const handleCancelNoticeEdit = () => {
    setEditingNotice(null);
    setNewNotice({
      title: '',
      category: 'Admission',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      isNew: true,
      content: ''
    });
    setExistingNoticeAttachment(undefined);
    setSelectedNoticePdf(null);
    setNoticePdfError('');
  };

  const handleSaveNoticeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticePdfError('');

    if (!newNotice.title?.trim()) {
      setNoticePdfError('Notice title is required.');
      return;
    }

    let attachment: NoticeAttachment | undefined = existingNoticeAttachment;

    if (selectedNoticePdf) {
      if (selectedNoticePdf.size > 10 * 1024 * 1024) {
        setNoticePdfError('Attachment PDF size exceeds 10 MB limit.');
        return;
      }
      if (selectedNoticePdf.type !== 'application/pdf' && !selectedNoticePdf.name.toLowerCase().endsWith('.pdf')) {
        setNoticePdfError('Only PDF files (.pdf) are allowed as attachments.');
        return;
      }

      setIsUploadingNoticePdf(true);
      const uploadRes = await supabaseStorageService.uploadWebsiteDocument('notices', selectedNoticePdf);
      setIsUploadingNoticePdf(false);

      if (uploadRes.error) {
        setNoticePdfError(`PDF upload failed: ${uploadRes.error}`);
        return;
      }

      if (existingNoticeAttachment?.storagePath && existingNoticeAttachment.storagePath !== uploadRes.storagePath) {
        await supabaseStorageService.deleteWebsiteDocument(existingNoticeAttachment.storagePath);
      }

      attachment = {
        fileName: uploadRes.fileName,
        fileSize: uploadRes.fileSize,
        storagePath: uploadRes.storagePath,
        fileUrl: uploadRes.publicUrl
      };
    }

    const item: Notice = {
      id: editingNotice ? editingNotice.id : `n-${Date.now()}`,
      title: newNotice.title.trim(),
      category: (newNotice.category as Notice['category']) || 'General',
      date: newNotice.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      isNew: newNotice.isNew ?? true,
      content: newNotice.content || '',
      attachment
    };

    let updated: Notice[];
    if (editingNotice) {
      updated = noticeList.map(n => n.id === editingNotice.id ? item : n);
    } else {
      updated = [item, ...noticeList];
    }

    setNoticeList(updated);
    await storageService.saveNotices(updated);
    await onRefreshAll();
    handleCancelNoticeEdit();
    showToast(editingNotice ? 'Notice updated successfully!' : 'New notice published successfully!');
  };

  const handleRemoveNoticeAttachment = async () => {
    if (existingNoticeAttachment?.storagePath) {
      await supabaseStorageService.deleteWebsiteDocument(existingNoticeAttachment.storagePath);
    }
    setExistingNoticeAttachment(undefined);
    setSelectedNoticePdf(null);
    showToast('Attachment removed.');
  };

  const handleDeleteNotice = async (id: string) => {
    await storageService.deleteNotice(id);
    const updated = noticeList.filter(n => n.id !== id);
    setNoticeList(updated);
    await onRefreshAll();
    showToast('Notice deleted.');
  };

  const handleToggleNoticeNew = async (id: string) => {
    const updated = noticeList.map(n => n.id === id ? { ...n, isNew: !n.isNew } : n);
    setNoticeList(updated);
    await storageService.saveNotices(updated);
    await onRefreshAll();
  };

  // Downloads CMS State
  const [downloadsList, setDownloadsList] = useState<DownloadableDocument[]>(downloads || []);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState<DownloadableDocument | null>(null);
  const [downloadForm, setDownloadForm] = useState<{
    title: string;
    category: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
  }>({
    title: '',
    category: 'Admission',
    description: '',
    displayOrder: 1,
    isActive: true
  });
  const [selectedDownloadFile, setSelectedDownloadFile] = useState<File | null>(null);
  const [downloadUploadProgress, setDownloadUploadProgress] = useState<number>(0);
  const [isUploadingDownload, setIsUploadingDownload] = useState<boolean>(false);
  const [downloadFormError, setDownloadFormError] = useState<string>('');

  useEffect(() => {
    if (downloads && downloads.length >= 0) {
      setDownloadsList(downloads);
    }
  }, [downloads]);

  const handleOpenNewDownloadModal = () => {
    setEditingDownload(null);
    setDownloadForm({
      title: '',
      category: 'Admission',
      description: '',
      displayOrder: downloadsList.length + 1,
      isActive: true
    });
    setSelectedDownloadFile(null);
    setDownloadFormError('');
    setDownloadUploadProgress(0);
    setIsDownloadModalOpen(true);
  };

  const handleOpenEditDownloadModal = (doc: DownloadableDocument) => {
    setEditingDownload(doc);
    setDownloadForm({
      title: doc.title,
      category: doc.category || 'Admission',
      description: doc.description || '',
      displayOrder: doc.displayOrder || 1,
      isActive: doc.isActive ?? true
    });
    setSelectedDownloadFile(null);
    setDownloadFormError('');
    setDownloadUploadProgress(0);
    setIsDownloadModalOpen(true);
  };

  const handleSaveDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setDownloadFormError('');

    if (!downloadForm.title.trim()) {
      setDownloadFormError('Document title is required.');
      return;
    }

    if (!editingDownload && !selectedDownloadFile) {
      setDownloadFormError('Please select a PDF file to upload.');
      return;
    }

    if (selectedDownloadFile) {
      if (selectedDownloadFile.size > 10 * 1024 * 1024) {
        setDownloadFormError('File size exceeds the maximum allowed limit of 10 MB.');
        return;
      }
      if (selectedDownloadFile.type !== 'application/pdf' && !selectedDownloadFile.name.toLowerCase().endsWith('.pdf')) {
        setDownloadFormError('Only PDF documents (.pdf) are allowed.');
        return;
      }

      const duplicate = downloadsList.find(
        d => (!editingDownload || d.id !== editingDownload.id) &&
             (d.title.toLowerCase().trim() === downloadForm.title.toLowerCase().trim() ||
              d.fileName.toLowerCase() === selectedDownloadFile.name.toLowerCase())
      );
      if (duplicate) {
        setDownloadFormError('A document with this title or file name already exists.');
        return;
      }
    }

    setIsUploadingDownload(true);
    setDownloadUploadProgress(15);

    let storagePath = editingDownload?.storagePath || '';
    let publicUrl = editingDownload?.fileUrl || '';
    let fileName = editingDownload?.fileName || '';
    let fileSize = editingDownload?.fileSize || '';

    if (selectedDownloadFile) {
      const uploadRes = await supabaseStorageService.uploadWebsiteDocument(
        'downloads',
        selectedDownloadFile,
        (percent) => setDownloadUploadProgress(15 + Math.floor(percent * 0.55))
      );

      if (uploadRes.error) {
        setIsUploadingDownload(false);
        setDownloadUploadProgress(0);
        setDownloadFormError(`Storage upload failed: ${uploadRes.error}`);
        return;
      }

      if (editingDownload?.storagePath && editingDownload.storagePath !== uploadRes.storagePath) {
        await supabaseStorageService.deleteWebsiteDocument(editingDownload.storagePath);
      }

      storagePath = uploadRes.storagePath;
      publicUrl = uploadRes.publicUrl;
      fileName = uploadRes.fileName;
      fileSize = uploadRes.fileSize;
    }

    setDownloadUploadProgress(75);

    const docItem: DownloadableDocument = {
      id: editingDownload ? editingDownload.id : `dl-${Date.now()}`,
      title: downloadForm.title.trim(),
      category: downloadForm.category,
      description: downloadForm.description.trim(),
      fileName: fileName || 'document.pdf',
      storagePath,
      fileSize: fileSize || '1.0 MB',
      fileUrl: publicUrl,
      displayOrder: Number(downloadForm.displayOrder) || 1,
      isActive: downloadForm.isActive,
      createdAt: editingDownload ? editingDownload.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    let updatedList: DownloadableDocument[];
    if (editingDownload) {
      updatedList = downloadsList.map(d => d.id === editingDownload.id ? docItem : d);
    } else {
      updatedList = [docItem, ...downloadsList];
    }

    setDownloadUploadProgress(85);

    const dbResult = await storageService.saveDownloads(updatedList);

    if (!dbResult.success) {
      setIsUploadingDownload(false);
      setDownloadUploadProgress(0);
      setDownloadFormError(`Database save failed: ${dbResult.error || 'Unknown error saving record to Supabase database.'}`);
      return;
    }

    setDownloadUploadProgress(100);
    setIsUploadingDownload(false);
    setIsDownloadModalOpen(false);

    if (dbResult.data) {
      setDownloadsList(dbResult.data);
    }
    await onRefreshAll();

    showToast(editingDownload ? 'Document updated & saved to database!' : 'New PDF document uploaded & saved to database successfully!');
  };

  const handleDeleteDownload = async (doc: DownloadableDocument) => {
    const confirmed = window.confirm(`Are you sure you want to delete this document?\n\nTitle: "${doc.title}"\nFile: ${doc.fileName}\n\nThis action will delete the file from website storage and remove its record from the database.`);
    if (!confirmed) return;

    if (doc.storagePath) {
      await supabaseStorageService.deleteWebsiteDocument(doc.storagePath);
    }

    const dbResult = await storageService.deleteDownload(doc.id);
    if (!dbResult.success) {
      showToast(`Delete failed: ${dbResult.error || 'Could not delete document from database'}`);
      return;
    }

    if (dbResult.data) {
      setDownloadsList(dbResult.data);
    } else {
      setDownloadsList(prev => prev.filter(d => d.id !== doc.id));
    }
    await onRefreshAll();
    showToast('Document deleted successfully from storage and database.');
  };

  const handleToggleDownloadActive = async (doc: DownloadableDocument) => {
    const updated = downloadsList.map(d => d.id === doc.id ? { ...d, isActive: !d.isActive } : d);
    setDownloadsList(updated);
    const dbResult = await storageService.saveDownloads(updated);
    if (!dbResult.success) {
      showToast(`Update failed: ${dbResult.error || 'Failed to update document status'}`);
      return;
    }
    if (dbResult.data) {
      setDownloadsList(dbResult.data);
    }
    await onRefreshAll();
    showToast(`Document ${!doc.isActive ? 'activated' : 'deactivated'}.`);
  };

  // Department Management State
  const [deptList, setDeptList] = useState<DepartmentInfo[]>([...departments]);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState<boolean>(false);
  const [editingDept, setEditingDept] = useState<DepartmentInfo | null>(null);
  const [deptForm, setDeptForm] = useState<{
    name: string;
    code: string;
    head: string;
    description: string;
    labsStr: string;
    keySubjectsStr: string;
    image: string;
    isActive: boolean;
    displayOrder: number;
  }>({
    name: '',
    code: '',
    head: '',
    description: '',
    labsStr: '',
    keySubjectsStr: '',
    image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80',
    isActive: true,
    displayOrder: 1
  });

  const handleOpenNewDeptModal = () => {
    setEditingDept(null);
    setDeptForm({
      name: '',
      code: '',
      head: '',
      description: '',
      labsStr: '',
      keySubjectsStr: '',
      image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      displayOrder: deptList.length + 1
    });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDeptModal = (dept: DepartmentInfo) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      head: dept.head || dept.headOfDepartment || '',
      description: dept.description,
      labsStr: (dept.labs || []).join(', '),
      keySubjectsStr: (dept.keySubjects || []).join(', '),
      image: dept.image || 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80',
      isActive: dept.isActive ?? true,
      displayOrder: dept.displayOrder || 1
    });
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim() || !deptForm.code.trim()) return;

    const labs = deptForm.labsStr.split(',').map(s => s.trim()).filter(Boolean);
    const keySubjects = deptForm.keySubjectsStr.split(',').map(s => s.trim()).filter(Boolean);

    const deptItem: DepartmentInfo = {
      id: editingDept ? editingDept.id : (deptForm.code.toLowerCase().replace(/[^a-z0-9]/g, '') || `dept-${Date.now()}`),
      name: deptForm.name.trim(),
      code: deptForm.code.trim().toUpperCase(),
      head: deptForm.head.trim(),
      headOfDepartment: deptForm.head.trim(),
      description: deptForm.description.trim(),
      labs: labs.length > 0 ? labs : ['Specialized Practical Laboratory'],
      keySubjects: keySubjects.length > 0 ? keySubjects : ['Core Dairy Course'],
      image: deptForm.image.trim() || 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80',
      isActive: deptForm.isActive,
      displayOrder: Number(deptForm.displayOrder) || 1
    };

    let updated: DepartmentInfo[];
    if (editingDept) {
      updated = deptList.map(d => d.id === editingDept.id ? deptItem : d);
    } else {
      updated = [...deptList, deptItem];
    }

    setDeptList(updated);
    await storageService.saveDepartments(updated);
    await onRefreshAll();
    setIsDeptModalOpen(false);
    showToast(editingDept ? 'Department updated successfully!' : 'New department added successfully!');
  };

  const handleToggleDeptActive = async (dept: DepartmentInfo) => {
    const updated = deptList.map(d => d.id === dept.id ? { ...d, isActive: !(d.isActive ?? true) } : d);
    setDeptList(updated);
    await storageService.saveDepartments(updated);
    await onRefreshAll();
    showToast(`Department '${dept.name}' ${dept.isActive ? 'deactivated' : 'activated'}.`);
  };

  const handleDeleteDepartmentConfirm = async (dept: DepartmentInfo) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the department '${dept.name}'?\n\nTip: Deactivating the department is recommended to safely hide it from the public website while preserving academic records.\n\nClick OK to permanently delete.`
    );
    if (!confirmed) return;

    await storageService.deleteDepartment(dept.id);
    const updated = deptList.filter(d => d.id !== dept.id);
    setDeptList(updated);
    await onRefreshAll();
    showToast(`Department '${dept.name}' deleted.`);
  };

  // 3. Events Form State
  const [eventList, setEventList] = useState<CollegeEvent[]>([...events]);
  const [newEvent, setNewEvent] = useState<Partial<CollegeEvent>>({
    title: '',
    date: '',
    time: '10:00 AM',
    description: ''
  });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    const item: CollegeEvent = {
      id: `ev-${Date.now()}`,
      title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      description: newEvent.description || ''
    };
    const updated = [item, ...eventList];
    setEventList(updated);
    await storageService.saveEvents(updated);
    await onRefreshAll();
    setNewEvent({ title: '', date: '', time: '10:00 AM', description: '' });
    showToast('Event added successfully!');
  };

  const handleDeleteEvent = async (id: string) => {
    await storageService.deleteEvent(id);
    const updated = eventList.filter(e => e.id !== id);
    setEventList(updated);
    await onRefreshAll();
    showToast('Event removed.');
  };

  // 4. Applications & Students Filter State
  const [appSearch, setAppSearch] = useState('');
  const [appYearFilter, setAppYearFilter] = useState('All');
  const [appDeptFilter, setAppDeptFilter] = useState('All');
  const [appStatusFilter, setAppStatusFilter] = useState('All');
  const [appDateFilter, setAppDateFilter] = useState('');
  const [appSortBy, setAppSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'hsc_desc'>('date_desc');
  const [appPage, setAppPage] = useState(1);
  const [appPageSize, setAppPageSize] = useState(10);

  // Selection state for Bulk Operations
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Modals & Action States
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [appStatusInput, setAppStatusInput] = useState<AdmissionApplication['status']>('Verified');
  const [appRemarksInput, setAppRemarksInput] = useState('');

  const [deleteConfirmApp, setDeleteConfirmApp] = useState<AdmissionApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveProgress, setArchiveProgress] = useState('');

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [zipProcessing, setZipProcessing] = useState(false);
  const [zipProgressText, setZipProgressText] = useState('');

  const [docPreviewModal, setDocPreviewModal] = useState<{ title: string; fileName: string; url: string; isPdf: boolean } | null>(null);

  const [studentSearch, setStudentSearch] = useState('');
  const [studentYearFilter, setStudentYearFilter] = useState('All');
  const [studentDeptFilter, setStudentDeptFilter] = useState('All');
  const [studentCategoryFilter, setStudentCategoryFilter] = useState('All');

  // Helper matcher for Year of Admission
  const matchesYear = (app: AdmissionApplication, selectedYear: string) => {
    if (!selectedYear || selectedYear === 'All') return true;
    const target = selectedYear.toLowerCase();
    const admYr = (app.admissionYear || '').toLowerCase();
    const subYr = (app.submissionDate || '');
    const passYr = (app.hscPassingYear || '');
    
    if (target.includes('first') || target.includes('1st')) {
      return admYr.includes('first') || admYr.includes('1st');
    }
    if (target.includes('second') || target.includes('2nd') || target.includes('lateral')) {
      return admYr.includes('second') || admYr.includes('2nd') || admYr.includes('lateral');
    }
    if (target.includes('third') || target.includes('3rd')) {
      return admYr.includes('third') || admYr.includes('3rd');
    }
    if (target.includes('fourth') || target.includes('4th')) {
      return admYr.includes('fourth') || admYr.includes('4th');
    }
    if (target.includes('2026')) {
      return subYr.startsWith('2026') || admYr.includes('2026') || passYr === '2026';
    }
    if (target.includes('2025')) {
      return subYr.startsWith('2025') || admYr.includes('2025') || passYr === '2025';
    }
    return admYr === target || admYr.includes(target);
  };

  // Helper matcher for Department / Course Branch
  const matchesDept = (app: AdmissionApplication, selectedDept: string) => {
    if (!selectedDept || selectedDept === 'All') return true;
    const target = selectedDept.toLowerCase();
    const branch = (app.admissionBranch || 'B.Tech (Dairy Technology)').toLowerCase();

    if (target.includes('technology') || target.includes('tech')) {
      return branch.includes('technology') || branch.includes('tech');
    }
    if (target.includes('engineering') || target.includes('engg')) {
      return branch.includes('engineering') || branch.includes('engg');
    }
    if (target.includes('chemistry')) {
      return branch.includes('chemistry');
    }
    if (target.includes('microbiology')) {
      return branch.includes('microbiology');
    }
    if (target.includes('business') || target.includes('management')) {
      return branch.includes('business') || branch.includes('management');
    }
    return branch.includes(target);
  };

  // Applications List with Filters, Date, Search and Sorting
  const filteredApps = (applications || [])
    .filter(a => {
      if (appSearch.trim()) {
        const q = appSearch.toLowerCase().trim();
        const matchName = a.fullName.toLowerCase().includes(q);
        const matchId = a.id.toLowerCase().includes(q);
        const matchMobile = a.mobile.includes(q);
        const matchBranch = (a.admissionBranch || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchMobile && !matchBranch) return false;
      }
      if (appStatusFilter !== 'All' && a.status !== appStatusFilter) {
        return false;
      }
      if (appDateFilter && a.submissionDate !== appDateFilter) {
        return false;
      }
      if (!matchesYear(a, appYearFilter)) return false;
      if (!matchesDept(a, appDeptFilter)) return false;
      return true;
    })
    .sort((a, b) => {
      if (appSortBy === 'date_desc') {
        return new Date(b.submissionDate || 0).getTime() - new Date(a.submissionDate || 0).getTime();
      }
      if (appSortBy === 'date_asc') {
        return new Date(a.submissionDate || 0).getTime() - new Date(b.submissionDate || 0).getTime();
      }
      if (appSortBy === 'name_asc') {
        return a.fullName.localeCompare(b.fullName);
      }
      if (appSortBy === 'hsc_desc') {
        return (b.hscPercentage || 0) - (a.hscPercentage || 0);
      }
      return 0;
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredApps.length / appPageSize) || 1;
  const paginatedApps = filteredApps.slice((appPage - 1) * appPageSize, appPage * appPageSize);

  // Bulk Select Toggle Handlers
  const handleSelectAllOnPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedApps.map(a => a.id);
      setSelectedAppIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedApps.map(a => a.id));
      setSelectedAppIds(prev => prev.filter(id => !pageIds.has(id)));
    }
  };

  const handleToggleSelectApp = (id: string) => {
    setSelectedAppIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Actions
  const handleSingleZipDownload = async (app: AdmissionApplication) => {
    setZipProcessing(true);
    setZipProgressText(`Preparing ZIP package for ${app.fullName}...`);
    try {
      await zipService.downloadSingleApplicationZip(app, collegeInfo, (status) => setZipProgressText(status));
      showToast(`ZIP Package for ${app.fullName} downloaded successfully!`);
    } catch (e: any) {
      showToast(`Download error: ${e.message || 'Failed to generate ZIP'}`);
    } finally {
      setZipProcessing(false);
      setZipProgressText('');
    }
  };

  const handleBulkZipDownload = async () => {
    const selectedApps = (applications || []).filter(a => selectedAppIds.includes(a.id));
    if (selectedApps.length === 0) {
      showToast('Please select at least one application to download bulk ZIP.');
      return;
    }
    setZipProcessing(true);
    setZipProgressText(`Packaging ${selectedApps.length} applications into ZIP...`);
    try {
      await zipService.downloadBulkApplicationsZip(selectedApps, collegeInfo, 'Admissions_2026_Bulk_Selected', (status) => setZipProgressText(status));
      showToast(`Bulk ZIP for ${selectedApps.length} candidates downloaded!`);
    } catch (e: any) {
      showToast(`Bulk download error: ${e.message || 'Failed to download bulk ZIP'}`);
    } finally {
      setZipProcessing(false);
      setZipProgressText('');
    }
  };

  const handleArchiveAcademicYear = async () => {
    setIsArchiving(true);
    setArchiveProgress('Initializing Academic Year Master Archive...');
    try {
      await zipService.downloadAcademicYearArchive(applications || [], collegeInfo, '2026-27', (status) => setArchiveProgress(status));
      showToast('Academic Year Master Archive created and downloaded successfully!');
      setArchiveModalOpen(false);
    } catch (e: any) {
      showToast(`Archive error: ${e.message || 'Failed to create archive'}`);
    } finally {
      setIsArchiving(false);
      setArchiveProgress('');
    }
  };

  const handleDeleteCandidate = async () => {
    if (!deleteConfirmApp) return;
    setIsDeleting(true);
    try {
      await storageService.deleteApplication(deleteConfirmApp.id);
      onRefreshAll();
      showToast(`Candidate ${deleteConfirmApp.fullName} (${deleteConfirmApp.id}) permanently deleted.`);
      setDeleteConfirmApp(null);
      if (selectedApp?.id === deleteConfirmApp.id) setSelectedApp(null);
    } catch (e: any) {
      showToast(`Delete error: ${e.message || 'Failed to delete candidate'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetAdmissions = async () => {
    if (resetConfirmInput.trim() !== 'CONFIRM RESET') {
      showToast('Please type CONFIRM RESET exactly to proceed.');
      return;
    }
    setIsResetting(true);
    try {
      await storageService.resetAdmissionsData();
      onRefreshAll();
      showToast('Admission data permanently wiped and reset for new academic year!');
      setResetModalOpen(false);
      setResetConfirmInput('');
    } catch (e: any) {
      showToast(`Reset error: ${e.message || 'Failed to reset admissions'}`);
    } finally {
      setIsResetting(false);
    }
  };

  // Approved Students List
  const approvedStudentsAll = (applications || []).filter(a => 
    a.status === 'Provisionally Selected' || a.status === 'Verified'
  );

  const filteredApprovedStudents = approvedStudentsAll.filter(a => {
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      const matchName = a.fullName.toLowerCase().includes(q);
      const matchId = a.id.toLowerCase().includes(q);
      const matchMobile = a.mobile.includes(q);
      const matchAadhar = a.aadharNumber.includes(q);
      const matchBranch = (a.admissionBranch || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchMobile && !matchAadhar && !matchBranch) return false;
    }
    if (studentCategoryFilter !== 'All' && a.category?.toUpperCase() !== studentCategoryFilter.toUpperCase()) {
      return false;
    }
    if (!matchesYear(a, studentYearFilter)) return false;
    if (!matchesDept(a, studentDeptFilter)) return false;
    return true;
  });

  const handleUpdateAppStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    storageService.updateApplicationStatus(selectedApp.id, appStatusInput, appRemarksInput);
    onRefreshAll();
    setSelectedApp(prev => prev ? { ...prev, status: appStatusInput, remarks: appRemarksInput } : null);
    showToast(`Application ${selectedApp.id} status updated to ${appStatusInput}!`);
  };

  const handleQuickApprove = (app: AdmissionApplication) => {
    storageService.updateApplicationStatus(app.id, 'Provisionally Selected', 'Approved for Admission');
    onRefreshAll();
    showToast(`Student ${app.fullName} (${app.id}) approved for admission!`);
  };

  // 5. Faculty Manager State
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([...faculty]);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [newFaculty, setNewFaculty] = useState<Partial<FacultyMember>>({
    name: '',
    designation: 'Assistant Professor',
    qualification: '',
    experience: '',
    specialization: '',
    email: '',
    phone: '',
    isHOD: false
  });

  const handleToggleHOD = async (id: string) => {
    const updated = facultyList.map(f => {
      if (f.id === id) {
        const nextStatus = !f.isHOD;
        showToast(`${f.name} is now ${nextStatus ? 'Head of Department (HOD)' : 'Regular Faculty'}`);
        return { ...f, isHOD: nextStatus };
      }
      return f;
    });
    setFacultyList(updated);
    await storageService.saveFaculty(updated);
    await onRefreshAll();
  };

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name) return;
    const item: FacultyMember = {
      id: `f-${Date.now()}`,
      name: newFaculty.name,
      designation: newFaculty.designation || 'Assistant Professor',
      department: '',
      qualification: newFaculty.qualification || '',
      experience: newFaculty.experience || '',
      specialization: newFaculty.specialization || '',
      email: newFaculty.email || '',
      phone: newFaculty.phone || '',
      image: '',
      isHOD: !!newFaculty.isHOD
    };
    const updated = [item, ...facultyList];
    setFacultyList(updated);
    await storageService.saveFaculty(updated);
    await onRefreshAll();
    setNewFaculty({
      name: '',
      designation: 'Assistant Professor',
      qualification: '',
      experience: '',
      specialization: '',
      email: '',
      phone: '',
      isHOD: false
    });
    showToast('Faculty member added!');
  };

  const handleSaveEditFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    const updated = facultyList.map(f => f.id === editingFaculty.id ? editingFaculty : f);
    setFacultyList(updated);
    await storageService.saveFaculty(updated);
    await onRefreshAll();
    setEditingFaculty(null);
    showToast('Faculty profile updated successfully!');
  };

  const handleDeleteFaculty = async (id: string) => {
    await storageService.deleteFaculty(id);
    const updated = facultyList.filter(f => f.id !== id);
    setFacultyList(updated);
    await onRefreshAll();
    showToast('Faculty deleted.');
  };

  // 6. Gallery Manager State
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([...gallery]);
  const [newGallery, setNewGallery] = useState<Partial<GalleryItem>>({
    title: '',
    category: 'Campus',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    date: new Date().getFullYear().toString()
  });

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGallery.title) return;
    const item: GalleryItem = {
      id: `g-${Date.now()}`,
      title: newGallery.title,
      category: (newGallery.category as GalleryItem['category']) || 'Campus',
      image: newGallery.image || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
      date: newGallery.date || '2026'
    };
    const updated = [item, ...galleryList];
    setGalleryList(updated);
    await storageService.saveGallery(updated);
    await onRefreshAll();
    setNewGallery({
      title: '',
      category: 'Campus',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
      date: new Date().getFullYear().toString()
    });
    showToast('Gallery image added!');
  };

  const handleDeleteGalleryItem = async (id: string) => {
    await storageService.deleteGalleryItem(id);
    const updated = galleryList.filter(g => g.id !== id);
    setGalleryList(updated);
    await onRefreshAll();
    showToast('Gallery item removed.');
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all website data to default Malkapur college records?')) {
      storageService.resetAllToDefaults();
      onRefreshAll();
      showToast('Website reset to default state.');
    }
  };

  // Navigation Items matching attachment image list
  const sidebarItems: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'applications', label: 'Admissions', icon: FileText },
    { id: 'approved', label: 'Students', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'faculty', label: 'Faculty', icon: GraduationCap },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'notices', label: 'Notices', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'popup', label: 'Popup Banner', icon: Bell },
    { id: 'info', label: 'Content CMS', icon: Sliders },
    { id: 'admission_process', label: 'Admission Process', icon: FileCheck },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'admin_users', label: 'Admin Users', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A2342] text-amber-400 px-5 py-3 rounded-xl shadow-2xl border border-amber-500/50 flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Vertical Sidebar - Matching Attachment */}
      <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-slate-200 shrink-0 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-[#0A2342] font-serif tracking-tight">
              LSSCDT Admin
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Super Administrator
            </p>
          </div>

          {/* Vertical Menu Navigation */}
          <nav className="p-3 space-y-0.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    active
                      ? 'bg-slate-100 text-[#0A2342] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#0A2342]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout & Reset */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={handleResetDefaults}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset System Defaults</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Administrator</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white min-h-screen p-6 sm:p-10">
        
        {/* Top Title Bar - Command Center */}
        <div className="border-b border-slate-100 pb-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">
              Command Center
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Welcome, <span className="font-bold text-[#0A2342]">Super Administrator</span>
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div 
                onClick={() => setActiveTab('applications')} 
                className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-md transition-shadow space-y-2"
              >
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase">Applications</span>
                  <FileText className="w-5 h-5 text-[#0A2342]" />
                </div>
                <div className="text-3xl font-extrabold text-[#0A2342] font-serif">
                  {applications.length}
                </div>
                <div className="text-xs text-slate-600">Total Submitted Forms</div>
              </div>

              <div 
                onClick={() => setActiveTab('approved')} 
                className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-md transition-shadow space-y-2"
              >
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase">Enrolled Students</span>
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-700 font-serif">
                  {approvedStudentsAll.length}
                </div>
                <div className="text-xs text-slate-600">Provisionally Selected</div>
              </div>

              <div 
                onClick={() => setActiveTab('notices')} 
                className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-md transition-shadow space-y-2"
              >
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase">Notices</span>
                  <FileText className="w-5 h-5 text-[#D97706]" />
                </div>
                <div className="text-3xl font-extrabold text-[#D97706] font-serif">
                  {noticeList.length}
                </div>
                <div className="text-xs text-slate-600">Active Circulars</div>
              </div>

              <div 
                onClick={() => setActiveTab('faculty')} 
                className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 cursor-pointer hover:shadow-md transition-shadow space-y-2"
              >
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase">Faculty</span>
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-blue-900 font-serif">
                  {facultyList.length}
                </div>
                <div className="text-xs text-slate-600">Teaching Professors</div>
              </div>

            </div>

            {/* Quick Actions & Recent Records */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="font-bold text-[#0A2342] text-base font-serif border-b border-slate-200 pb-2">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleExportExcel(applications, 'LSSCDT_All_Applications')}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1 shadow-sm transition-colors"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <div className="font-bold text-xs text-slate-900">Export All Students</div>
                    <div className="text-[10px] text-slate-500">Download Excel Report</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('notices')}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1 shadow-sm transition-colors"
                  >
                    <Plus className="w-5 h-5 text-[#D97706]" />
                    <div className="font-bold text-xs text-slate-900">Publish Notice</div>
                    <div className="text-[10px] text-slate-500">New Ticker Circular</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('info')}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1 shadow-sm transition-colors"
                  >
                    <Sliders className="w-5 h-5 text-blue-600" />
                    <div className="font-bold text-xs text-slate-900">Update Banners</div>
                    <div className="text-[10px] text-slate-500">Hero Slider Images</div>
                  </button>

                  <button
                    onClick={() => setActiveTab('gallery')}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 text-left space-y-1 shadow-sm transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                    <div className="font-bold text-xs text-slate-900">Upload Photo</div>
                    <div className="text-[10px] text-slate-500">Gallery Media</div>
                  </button>
                </div>
              </div>

              {/* Recent Applications List */}
              <div className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-[#0A2342] text-base font-serif">
                    Recent Applications ({applications.length})
                  </h3>
                  <button onClick={() => setActiveTab('applications')} className="text-xs text-[#D97706] font-bold hover:underline">
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {applications.slice(0, 4).map((app) => (
                    <div key={app.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center gap-2">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{app.fullName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{app.id} • HSC: {app.hscPercentage}%</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        app.status === 'Provisionally Selected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ADMISSIONS / APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Top Toolbar & Action Cards */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                  <span>Admission Applications Portal</span>
                  <span className="text-xs bg-amber-100 text-[#D97706] font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {filteredApps.length} Records
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Manage candidate storage, verification status, bulk ZIP downloads & year reset</p>
              </div>

              {/* Master System Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* Bulk Download Selected ZIP */}
                <button
                  type="button"
                  onClick={handleBulkZipDownload}
                  disabled={selectedAppIds.length === 0}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    selectedAppIds.length > 0 
                      ? 'bg-[#0A2342] text-amber-400 hover:bg-slate-900 cursor-pointer' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                  title="Download selected applications and documents in a single ZIP file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Bulk ZIP ({selectedAppIds.length})</span>
                </button>

                {/* Academic Year Master Archive */}
                <button
                  type="button"
                  onClick={() => setArchiveModalOpen(true)}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Export all data, excel summaries and uploaded files into a master ZIP archive"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Archive Year</span>
                </button>

                {/* Reset Admissions for New Academic Year */}
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Securely wipe admission records while preserving site configuration"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Admissions</span>
                </button>

                {/* Excel Export */}
                <button
                  type="button"
                  onClick={() => handleExportExcel(filteredApps, 'Admission_Applications_2026')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Zip Processing Banner */}
            {zipProcessing && (
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl flex items-center gap-3 text-xs text-amber-900 font-bold animate-pulse">
                <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                <span>{zipProgressText || 'Processing ZIP download archive... Please wait.'}</span>
              </div>
            )}

            {/* Filtering & Sorting Controls */}
            <div className="bg-[#F0F4F8] p-4 rounded-2xl border border-slate-200/90 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* Search */}
                <div className="relative col-span-1 sm:col-span-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search name, App ID, mobile or branch..."
                    value={appSearch}
                    onChange={(e) => { setAppSearch(e.target.value); setAppPage(1); }}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* Class / Year Filter */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#0A2342] shrink-0" />
                  <select
                    value={appYearFilter}
                    onChange={(e) => { setAppYearFilter(e.target.value); setAppPage(1); }}
                    className="w-full bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer truncate"
                  >
                    <option value="All">All Seeking Years</option>
                    <option value="First Year (1st Year)">First Year (1st Year)</option>
                    <option value="Direct Second Year (2nd Year - Lateral Entry)">Direct Second Year (Lateral Entry)</option>
                    <option value="Third Year (3rd Year)">Third Year (3rd Year)</option>
                    <option value="Fourth Year (4th Year)">Fourth Year (4th Year)</option>
                    <option value="2026 Batch">2026 Batch</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <select
                    value={appStatusFilter}
                    onChange={(e) => { setAppStatusFilter(e.target.value); setAppPage(1); }}
                    className="w-full bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Submitted">Submitted (Pending)</option>
                    <option value="Verified">Verified</option>
                    <option value="Provisionally Selected">Approved / Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <input
                    type="date"
                    value={appDateFilter}
                    onChange={(e) => { setAppDateFilter(e.target.value); setAppPage(1); }}
                    className="w-full bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer"
                    title="Filter by submission date"
                  />
                </div>

                {/* Sorting */}
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs">
                  <Sliders className="w-3.5 h-3.5 text-[#0A2342] shrink-0" />
                  <select
                    value={appSortBy}
                    onChange={(e) => setAppSortBy(e.target.value as any)}
                    className="w-full bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="date_desc">Date (Newest First)</option>
                    <option value="date_asc">Date (Oldest First)</option>
                    <option value="name_asc">Name (A to Z)</option>
                    <option value="hsc_desc">HSC % (Highest First)</option>
                  </select>
                </div>
              </div>

              {/* Secondary Filter Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Page Size:</span>
                  <select
                    value={appPageSize}
                    onChange={(e) => { setAppPageSize(Number(e.target.value)); setAppPage(1); }}
                    className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs outline-none cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                {(appYearFilter !== 'All' || appDeptFilter !== 'All' || appStatusFilter !== 'All' || appDateFilter !== '' || appSearch !== '') && (
                  <button
                    onClick={() => {
                      setAppYearFilter('All');
                      setAppDeptFilter('All');
                      setAppStatusFilter('All');
                      setAppDateFilter('');
                      setAppSearch('');
                      setAppPage(1);
                    }}
                    className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear All Filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Application Details Modal */}
            {selectedApp && (
              <div className="bg-[#F0F4F8] p-6 rounded-2xl border-2 border-[#0A2342] space-y-4 shadow-xl">
                <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-3 gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#D97706] bg-amber-100 px-2.5 py-0.5 rounded">
                      Application ID: {selectedApp.id}
                    </span>
                    <h3 className="text-xl font-bold text-[#0A2342] font-serif mt-1">
                      {selectedApp.fullName}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Option A: Download Application PDF */}
                    <button
                      type="button"
                      onClick={() => printApplicationSlip(selectedApp, collegeInfo)}
                      className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors"
                      title="Print or Save Application Slip as PDF"
                    >
                      <Printer className="w-3.5 h-3.5" /> PDF Slip
                    </button>

                    {/* Option B: Download Individual Candidate ZIP */}
                    <button
                      type="button"
                      onClick={() => handleSingleZipDownload(selectedApp)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors"
                      title="Download Application PDF and all uploaded documents in a single ZIP file"
                    >
                      <Download className="w-3.5 h-3.5" /> Candidate ZIP
                    </button>

                    <button 
                      onClick={() => setSelectedApp(null)} 
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 ml-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 font-bold">Category</div>
                    <div className="font-bold text-slate-800">{selectedApp.category}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 font-bold">Mobile / Email</div>
                    <div className="font-bold text-slate-800 truncate">{selectedApp.mobile}</div>
                    <div className="text-[10px] text-slate-500 truncate">{selectedApp.email}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 font-bold">Admission Year</div>
                    <div className="font-bold text-[#D97706]">{selectedApp.admissionYear || 'First Year (1st Year)'}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 font-bold">Entrance Exam</div>
                    <div className="font-bold text-slate-800">{selectedApp.entranceExam || 'MHT-CET'} ({selectedApp.entrancePercentile} %ile)</div>
                  </div>
                </div>

                {/* Additional Qualification & Branch Details */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-blue-900 border-b pb-1">Academic Qualification & Program</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 mt-1">
                    <div><strong>Course Branch:</strong> {selectedApp.admissionBranch || 'B.Tech (Dairy Technology)'}</div>
                    <div><strong>Previous Qualification:</strong> {selectedApp.previousQualification || '12th Science'}</div>
                    <div><strong>Previous Institute/Board:</strong> {selectedApp.previousBoardUniversity || selectedApp.hscBoard}</div>
                    <div><strong>HSC Percentage / PCM:</strong> {selectedApp.previousPercentage || selectedApp.hscPercentage}% ({selectedApp.hscPcmMarks} PCM)</div>
                    <div><strong>Address:</strong> {selectedApp.address}, {selectedApp.district} - {selectedApp.pincode} ({selectedApp.state})</div>
                    <div><strong>Aadhaar Number:</strong> {selectedApp.aadharNumber || 'Provided'}</div>
                  </div>
                </div>

                {/* Attached Files List for Admin Review */}
                {selectedApp.attachedFiles && selectedApp.attachedFiles.length > 0 && (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-emerald-800 border-b pb-1 flex items-center justify-between">
                      <span>Attached Documents in Supabase Storage ({selectedApp.attachedFiles.length}):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedApp.attachedFiles.map((doc, idx) => {
                        const isPdf = doc.fileName.toLowerCase().endsWith('.pdf');
                        return (
                          <div key={idx} className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 flex justify-between items-center gap-2">
                            <div className="truncate flex-1">
                              <span className="font-bold text-slate-900 block text-[11px] truncate">{doc.title}</span>
                              <span className="text-[10px] text-slate-500 font-mono block truncate">
                                {doc.storagePath ? `Bucket Path: ${doc.storagePath}` : doc.fileName} ({doc.fileSize})
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={async () => {
                                  const url = await supabaseStorageService.getSignedUrl(doc.storagePath || '', doc.dataUrl);
                                  setDocPreviewModal({ title: doc.title, fileName: doc.fileName, url, isPdf });
                                }}
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <Eye className="w-3 h-3" /> Preview
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Application Status History Timeline */}
                {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-[#0A2342] border-b pb-1">
                      Status Workflow History ({selectedApp.statusHistory.length} logs)
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedApp.statusHistory.map((item, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-[#0A2342]">{item.status}</span>
                            {item.remarks && <span className="text-slate-600 ml-2">— "{item.remarks}"</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {new Date(item.updatedAt).toLocaleString('en-IN')} ({item.updatedBy || 'Admin'})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Updater Form */}
                <form onSubmit={handleUpdateAppStatus} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 space-y-1 w-full text-xs">
                    <label className="font-bold text-slate-700">Update Application Status</label>
                    <select
                      value={appStatusInput}
                      onChange={(e) => setAppStatusInput(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-bold text-xs"
                    >
                      <option value="Submitted">Submitted (Pending Review)</option>
                      <option value="Verified">Verified (Documents Checked)</option>
                      <option value="Provisionally Selected">Provisionally Selected (Seat Allotted)</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="flex-1 space-y-1 w-full text-xs">
                    <label className="font-bold text-slate-700">Admin Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Documents verified against original HSC mark sheet"
                      value={appRemarksInput}
                      onChange={(e) => setAppRemarksInput(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0A2342] text-amber-400 font-bold px-4 py-2 rounded-lg text-xs shrink-0 hover:bg-[#071931]"
                  >
                    Save Status & Log
                  </button>
                </form>
              </div>
            )}

            {/* Applications Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#0A2342] text-white">
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          onChange={handleSelectAllOnPage}
                          checked={paginatedApps.length > 0 && paginatedApps.every(a => selectedAppIds.includes(a.id))}
                          className="rounded border-slate-300 text-[#D97706] focus:ring-[#D97706] cursor-pointer"
                          title="Select all on this page"
                        />
                      </th>
                      <th className="p-3 font-semibold">App ID</th>
                      <th className="p-3 font-semibold">Student Name</th>
                      <th className="p-3 font-semibold">Seeking Year</th>
                      <th className="p-3 font-semibold">Category</th>
                      <th className="p-3 font-semibold">Mobile</th>
                      <th className="p-3 font-semibold">HSC %</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {paginatedApps.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500 text-xs">
                          No admission applications found matching the selected filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedApps.map((app) => {
                        const isSelected = selectedAppIds.includes(app.id);
                        return (
                          <tr key={app.id} className={`hover:bg-[#F0F4F8] transition-colors ${isSelected ? 'bg-amber-50/60' : ''}`}>
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectApp(app.id)}
                                className="rounded border-slate-300 text-[#D97706] focus:ring-[#D97706] cursor-pointer"
                              />
                            </td>
                            <td className="p-3 font-mono font-bold text-[#D97706]">{app.id}</td>
                            <td className="p-3 font-bold text-slate-900">{app.fullName}</td>
                            <td className="p-3 text-slate-600 font-medium">{app.admissionYear || '1st Year'}</td>
                            <td className="p-3">{app.category}</td>
                            <td className="p-3 font-mono">{app.mobile}</td>
                            <td className="p-3 font-mono font-bold">{app.hscPercentage}%</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                app.status === 'Provisionally Selected' ? 'bg-emerald-100 text-emerald-800' :
                                app.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                                app.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* View Details */}
                                <button
                                  type="button"
                                  onClick={() => { setSelectedApp(app); setAppStatusInput(app.status); setAppRemarksInput(app.remarks || ''); }}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[#0A2342] font-bold rounded text-[11px] transition-colors"
                                  title="View Candidate Full Profile & Status History"
                                >
                                  View
                                </button>

                                {/* Option A: PDF Download */}
                                <button
                                  type="button"
                                  onClick={() => printApplicationSlip(app, collegeInfo)}
                                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded text-[11px] flex items-center gap-0.5 transition-colors"
                                  title="Download / Print Application PDF"
                                >
                                  <FileText className="w-3 h-3 text-blue-700" />
                                  <span>PDF</span>
                                </button>

                                {/* Option B: ZIP Download */}
                                <button
                                  type="button"
                                  onClick={() => handleSingleZipDownload(app)}
                                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded text-[11px] flex items-center gap-0.5 transition-colors"
                                  title="Download Application ZIP (PDF + all uploaded documents)"
                                >
                                  <Download className="w-3 h-3 text-amber-800" />
                                  <span>ZIP</span>
                                </button>

                                {/* Delete Candidate */}
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmApp(app)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Delete candidate permanently from database & storage"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
                  <div className="text-slate-500 font-medium">
                    Showing <strong className="text-slate-800">{((appPage - 1) * appPageSize) + 1}</strong> to <strong className="text-slate-800">{Math.min(appPage * appPageSize, filteredApps.length)}</strong> of <strong className="text-slate-800">{filteredApps.length}</strong> applications
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={appPage === 1}
                      onClick={() => setAppPage(p => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-700"
                    >
                      Previous
                    </button>
                    <span className="font-bold text-slate-700 px-2">
                      Page {appPage} of {totalPages}
                    </span>
                    <button
                      disabled={appPage === totalPages}
                      onClick={() => setAppPage(p => Math.min(totalPages, p + 1))}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 text-slate-700"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DELETE CANDIDATE CONFIRMATION MODAL */}
            {deleteConfirmApp && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border-2 border-rose-500 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 text-rose-600 border-b border-rose-100 pb-3">
                    <div className="p-2 bg-rose-100 rounded-xl">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 font-serif">Permanently Delete Candidate?</h3>
                      <p className="text-xs text-rose-600 font-semibold">This action cannot be undone</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-800">
                    <div><strong>Candidate Name:</strong> {deleteConfirmApp.fullName}</div>
                    <div><strong>Application ID:</strong> {deleteConfirmApp.id}</div>
                    <div><strong>Mobile Number:</strong> {deleteConfirmApp.mobile}</div>
                    <div><strong>Seeking Year:</strong> {deleteConfirmApp.admissionYear || '1st Year'}</div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Are you sure you want to delete this application? This will permanently remove the record from the Supabase PostgreSQL database AND purge all uploaded documents (photo, Aadhaar, marksheets) from Supabase Storage.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setDeleteConfirmApp(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDeleteCandidate}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow"
                    >
                      {isDeleting ? 'Deleting Record & Storage...' : 'Yes, Delete Candidate'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ACADEMIC YEAR ARCHIVE MODAL */}
            {archiveModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border-2 border-indigo-600 max-w-lg w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center gap-3 text-indigo-700 border-b border-indigo-100 pb-3">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 font-serif">Academic Year Master Archive</h3>
                      <p className="text-xs text-indigo-700 font-semibold">Package all applications, spreadsheets & documents</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    This will create and download a single compressed ZIP archive <strong className="text-slate-900">Admissions_2026-27_Archive.zip</strong> containing:
                  </p>

                  <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-700 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                    <li><strong className="text-slate-900">applications.xlsx</strong> (Complete spreadsheet of candidate records)</li>
                    <li><strong className="text-slate-900">documents.xlsx</strong> (Summary metadata of all uploaded certificates)</li>
                    <li><strong className="text-slate-900">Folders for every candidate</strong> with Application PDF and attached document files</li>
                  </ul>

                  {archiveProgress && (
                    <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl text-xs text-indigo-900 font-bold flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>{archiveProgress}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isArchiving}
                      onClick={() => setArchiveModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={isArchiving}
                      onClick={handleArchiveAcademicYear}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white shadow"
                    >
                      {isArchiving ? 'Generating Archive ZIP...' : 'Generate & Download Archive'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* RESET ADMISSIONS FOR NEW ACADEMIC YEAR MODAL */}
            {resetModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border-2 border-rose-600 max-w-md w-full p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center gap-3 text-rose-600 border-b border-rose-100 pb-3">
                    <div className="p-2 bg-rose-100 rounded-xl">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 font-serif">Reset Admissions for New Year</h3>
                      <p className="text-xs text-rose-600 font-bold">Wipe student records & storage</p>
                    </div>
                  </div>

                  <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-bold leading-relaxed">
                    Notice: This action will permanently delete all admission records and uploaded documents after the archive has been created. This action cannot be undone.
                  </p>

                  <p className="text-xs text-slate-600">
                    Note: Your Admin users, Faculty list, College Info, Notices, Events, Facilities, Gallery, and site settings will remain 100% intact.
                  </p>

                  <div className="space-y-1 text-xs">
                    <label className="font-bold text-slate-800">
                      Type <span className="font-mono bg-slate-200 px-1 py-0.5 rounded text-rose-700">CONFIRM RESET</span> to confirm:
                    </label>
                    <input
                      type="text"
                      placeholder="CONFIRM RESET"
                      value={resetConfirmInput}
                      onChange={(e) => setResetConfirmInput(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-300 font-mono text-xs outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isResetting}
                      onClick={() => { setResetModalOpen(false); setResetConfirmInput(''); }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isResetting || resetConfirmInput.trim() !== 'CONFIRM RESET'}
                      onClick={handleResetAdmissions}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white shadow"
                    >
                      {isResetting ? 'Wiping Admissions...' : 'Wipe & Reset Admissions'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* INLINE DOCUMENT PREVIEW OVERLAY MODAL */}
            {docPreviewModal && (
              <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
                  <div className="p-4 bg-[#0A2342] text-white flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm">{docPreviewModal.title}</h4>
                      <p className="text-[10px] text-slate-300 font-mono">{docPreviewModal.fileName}</p>
                    </div>
                    <button
                      onClick={() => setDocPreviewModal(null)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 p-4 overflow-auto bg-slate-100 flex items-center justify-center min-h-[350px]">
                    {docPreviewModal.isPdf ? (
                      <iframe
                        src={docPreviewModal.url}
                        title={docPreviewModal.title}
                        className="w-full h-[550px] rounded-xl border border-slate-300 bg-white"
                      />
                    ) : (
                      <img
                        src={docPreviewModal.url}
                        alt={docPreviewModal.title}
                        className="max-h-[500px] max-w-full object-contain rounded-xl shadow-md"
                      />
                    )}
                  </div>
                  <div className="p-3 bg-white border-t border-slate-200 flex justify-end">
                    <a
                      href={docPreviewModal.url}
                      download={docPreviewModal.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" /> Download File
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPROVED STUDENTS LIST */}
        {activeTab === 'approved' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                  <span>Enrolled & Selected Students</span>
                  <span className="text-xs bg-[#0A2342] text-amber-400 font-mono px-2 py-0.5 rounded-full font-bold">
                    {filteredApprovedStudents.length} / {approvedStudentsAll.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Admitted candidates list filtered by Year of Admission, Department and Category</p>
              </div>

              <button
                onClick={() => handleExportExcel(filteredApprovedStudents, `Students_Filtered_${studentYearFilter}_${studentDeptFilter}`)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Filtered List ({filteredApprovedStudents.length})</span>
              </button>
            </div>

            {/* Comprehensive Student Filter Bar */}
            <div className="bg-[#F0F4F8] p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#0A2342]">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-[#D97706]" />
                  <span>Filter Students Directory</span>
                </div>
                {(studentYearFilter !== 'All' || studentDeptFilter !== 'All' || studentCategoryFilter !== 'All' || studentSearch !== '') && (
                  <button
                    onClick={() => {
                      setStudentYearFilter('All');
                      setStudentDeptFilter('All');
                      setStudentCategoryFilter('All');
                      setStudentSearch('');
                    }}
                    className="text-slate-500 hover:text-red-600 text-[11px] font-bold flex items-center gap-1 underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset All Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Search */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Search Candidate</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Name, ID, Mobile, Aadhar..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-[#D97706]"
                    />
                  </div>
                </div>

                {/* Year of Admission Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Year of Admission</label>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#0A2342]" />
                    <select
                      value={studentYearFilter}
                      onChange={(e) => setStudentYearFilter(e.target.value)}
                      className="w-full bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="All">All Admission Years</option>
                      <option value="First Year (1st Year)">First Year (1st Year)</option>
                      <option value="Direct Second Year (2nd Year - Lateral Entry)">Direct Second Year (Lateral Entry)</option>
                      <option value="Third Year (3rd Year)">Third Year (3rd Year)</option>
                      <option value="Fourth Year (4th Year)">Fourth Year (4th Year)</option>
                      <option value="2026 Batch">2026 Academic Batch</option>
                      <option value="2025 Batch">2025 Academic Batch</option>
                    </select>
                  </div>
                </div>

                {/* Department / Branch Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Department / Course Branch</label>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-[#0A2342]" />
                    <select
                      value={studentDeptFilter}
                      onChange={(e) => setStudentDeptFilter(e.target.value)}
                      className="w-full bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer text-ellipsis overflow-hidden"
                    >
                      <option value="All">All Departments / Branches</option>
                      <option value="Department of Dairy Technology">Dairy Technology</option>
                      <option value="Department of Dairy Engineering">Dairy Engineering</option>
                      <option value="Department of Dairy Chemistry">Dairy Chemistry & QA</option>
                      <option value="Department of Dairy Microbiology">Dairy Microbiology</option>
                      <option value="Department of Dairy Business Management">Dairy Business Management</option>
                    </select>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Reservation Category</label>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={studentCategoryFilter}
                      onChange={(e) => setStudentCategoryFilter(e.target.value)}
                      className="w-full bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      <option value="OPEN">OPEN (Unreserved)</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="VJ/NT">VJ / NT</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0A2342] text-white">
                    <th className="p-3 font-semibold">Sr.</th>
                    <th className="p-3 font-semibold">App ID</th>
                    <th className="p-3 font-semibold">Student Name</th>
                    <th className="p-3 font-semibold">Admission Year</th>
                    <th className="p-3 font-semibold">Department / Branch</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">HSC %</th>
                    <th className="p-3 font-semibold">Contact & Aadhar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredApprovedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                        No students match the selected filter criteria. Try resetting filters.
                      </td>
                    </tr>
                  ) : (
                    filteredApprovedStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-[#F0F4F8]">
                        <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-[#D97706]">{s.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{s.fullName}</div>
                          <div className="text-[11px] text-slate-500">Father: {s.fatherName}</div>
                        </td>
                        <td className="p-3 font-medium text-[#0A2342]">
                          <span className="bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                            {s.admissionYear || 'First Year (1st Year)'}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          {s.admissionBranch || 'B.Tech (Dairy Technology)'}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-700">
                            {s.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-[#D97706]">{s.hscPercentage}%</td>
                        <td className="p-3 font-mono text-[11px]">
                          <div>Mob: {s.mobile}</div>
                          <div className="text-slate-500">Aadhar: {s.aadharNumber}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DEPARTMENTS */}
        {activeTab === 'departments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#D97706]" />
                  Academic Department Management
                </h2>
                <p className="text-xs text-slate-500">
                  Manage specialized academic divisions, HOD details, laboratories, and courses
                </p>
              </div>

              <button
                onClick={handleOpenNewDeptModal}
                className="bg-[#D97706] hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Department
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {deptList.map((d) => (
                <div key={d.id} className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between shadow-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-[#D97706] bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200">
                        [{d.code}]
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                        {d.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#0A2342] text-base font-serif">{d.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{d.description}</p>

                    <div className="text-xs text-slate-700 font-semibold border-t border-slate-200 pt-2 space-y-1">
                      <div><strong className="text-slate-900">HOD:</strong> {d.head || d.headOfDepartment || 'Not assigned'}</div>
                      <div className="text-[11px] text-slate-500">
                        Labs: {d.labs?.length || 0} testing facilities
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleDeptActive(d)}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-xs border ${d.isActive !== false ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'}`}
                    >
                      {d.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDeptModal(d)}
                        className="p-1.5 bg-white text-slate-700 hover:text-blue-600 rounded-lg border border-slate-300"
                        title="Edit department"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteDepartmentConfirm(d)}
                        className="p-1.5 bg-white text-slate-700 hover:text-red-600 rounded-lg border border-slate-300"
                        title="Delete department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Department Add/Edit Modal */}
            {isDeptModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 relative space-y-5 max-h-[90vh] overflow-y-auto">
                  <button
                    onClick={() => setIsDeptModalOpen(false)}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-lg font-bold font-serif text-[#0A2342]">
                    {editingDept ? 'Edit Academic Department' : 'Create New Academic Department'}
                  </h3>

                  <form onSubmit={handleSaveDepartmentSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dairy Microbiology"
                          value={deptForm.name}
                          onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. DM"
                          value={deptForm.code}
                          onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Head of Department (HOD) Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Ramesh C. Deshmukh"
                        value={deptForm.head}
                        onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department Overview / Description</label>
                      <textarea
                        rows={3}
                        placeholder="Detailed explanation of research focus, specialized technology, and academic scope..."
                        value={deptForm.description}
                        onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Laboratories (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Quality Control Lab, Starter Culture Lab, Microbial Fermentation Room"
                        value={deptForm.labsStr}
                        onChange={(e) => setDeptForm({ ...deptForm, labsStr: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Key Courses / Subjects Taught (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Dairy Microbiology, Starter Cultures, Fermented Milks, Quality Assurance"
                        value={deptForm.keySubjectsStr}
                        onChange={(e) => setDeptForm({ ...deptForm, keySubjectsStr: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department Banner Image URL</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={deptForm.image}
                        onChange={(e) => setDeptForm({ ...deptForm, image: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-600 font-mono text-[11px]"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="deptActiveCheck"
                        checked={deptForm.isActive}
                        onChange={(e) => setDeptForm({ ...deptForm, isActive: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-600"
                      />
                      <label htmlFor="deptActiveCheck" className="font-bold text-slate-800 cursor-pointer">
                        Active (Visible on public website)
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setIsDeptModalOpen(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#D97706] hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow"
                      >
                        {editingDept ? 'Save Department Changes' : 'Create Department'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FACULTY MANAGER */}
        {activeTab === 'faculty' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleAddFaculty} className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-4 h-fit">
              <h3 className="font-bold text-[#0A2342] text-base font-serif border-b pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D97706]" /> Add Faculty Member
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={newFaculty.name || ''}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor & Head / Assistant Professor"
                    value={newFaculty.designation || ''}
                    onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="e.g. Ph.D. (Dairy Tech) / M.Tech"
                    value={newFaculty.qualification || ''}
                    onChange={(e) => setNewFaculty({ ...newFaculty, qualification: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Experience</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Years"
                      value={newFaculty.experience || ''}
                      onChange={(e) => setNewFaculty({ ...newFaculty, experience: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. Membrane Tech"
                      value={newFaculty.specialization || ''}
                      onChange={(e) => setNewFaculty({ ...newFaculty, specialization: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. faculty@lsscdt.ac.in"
                    value={newFaculty.email || ''}
                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone / Mobile</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={newFaculty.phone || ''}
                    onChange={(e) => setNewFaculty({ ...newFaculty, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white font-mono"
                  />
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Head of Department (HOD)</div>
                      <div className="text-[10px] text-slate-600">Mark if faculty leads this department</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!newFaculty.isHOD}
                    onChange={(e) => setNewFaculty({ ...newFaculty, isHOD: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D97706] text-slate-950 font-bold py-2.5 rounded-lg text-xs hover:bg-amber-600 transition-colors shadow"
                >
                  Save Faculty Member
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2">
                Current Teaching Faculty ({facultyList.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {facultyList.map((f) => (
                  <div key={f.id} className="p-4 bg-[#F0F4F8] rounded-xl border border-slate-200 flex items-start justify-between gap-3 shadow-2xs">
                    <div className="space-y-1.5 text-xs flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                        {f.isHOD && (
                          <span className="bg-[#0A2342] text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <Crown className="w-3 h-3 text-amber-400" /> HOD
                          </span>
                        )}
                      </div>
                      <div className="text-[#D97706] font-bold text-[11px]">{f.designation}</div>
                      {f.department && (
                        <div className="text-slate-600 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] w-fit">
                          {f.department}
                        </div>
                      )}
                      {f.qualification && (
                        <div className="text-slate-700 text-[11px]">
                          <strong>Qualification:</strong> {f.qualification}
                        </div>
                      )}
                      {f.experience && (
                        <div className="text-slate-700 text-[11px]">
                          <strong>Experience:</strong> {f.experience}
                        </div>
                      )}
                      {f.specialization && (
                        <div className="text-slate-600 text-[10px]">
                          <strong>Specialization:</strong> {f.specialization}
                        </div>
                      )}
                      {f.email && (
                        <div className="text-slate-500 text-[10px]">
                          ✉ {f.email}
                        </div>
                      )}

                      {/* HOD Toggle Button */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleToggleHOD(f.id)}
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                            f.isHOD
                              ? 'bg-amber-500 text-slate-950 hover:bg-amber-600'
                              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Crown className={`w-3.5 h-3.5 ${f.isHOD ? 'text-slate-950' : 'text-amber-600'}`} />
                          <span>{f.isHOD ? 'HOD Status: ON' : 'Make HOD'}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteFaculty(f.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded shrink-0 hover:bg-red-50 transition-colors"
                      title="Delete Faculty"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GALLERY MANAGER */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleAddGalleryItem} className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-4 h-fit">
              <h3 className="font-bold text-[#0A2342] text-base font-serif border-b pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D97706]" /> Add Gallery Photo
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title / Caption *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Dairy Processing Plant"
                    value={newGallery.title}
                    onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload Photo from Device</label>
                  <div className="space-y-2">
                    {newGallery.image && (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-300">
                        <img src={newGallery.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Image URL or upload file"
                        value={newGallery.image || ''}
                        onChange={(e) => setNewGallery({ ...newGallery, image: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 outline-none text-xs bg-white"
                      />
                      <label className="cursor-pointer bg-[#0A2342] text-amber-400 font-bold px-3 py-2 rounded-lg text-xs flex items-center shrink-0 hover:bg-slate-900 transition-colors">
                        <Upload className="w-4 h-4 mr-1" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageFileUpload(e.target.files[0], (url) => setNewGallery(prev => ({ ...prev, image: url })));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D97706] text-slate-950 font-bold py-2.5 rounded-lg text-xs"
                >
                  Add to Gallery
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2">
                Website Gallery ({galleryList.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {galleryList.map((g) => (
                  <div key={g.id} className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-200">
                    <img src={g.image} alt={g.title} className="w-full h-36 object-cover" />
                    <div className="p-2 bg-slate-900 text-white flex justify-between items-center text-xs">
                      <span className="font-bold truncate">{g.title}</span>
                      <button onClick={() => handleDeleteGalleryItem(g.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: NOTICES MANAGER */}
        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleSaveNoticeSubmit} className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-4 h-fit">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-[#0A2342] text-base font-serif flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#D97706]" /> {editingNotice ? 'Edit Notice / Circular' : 'Publish New Notice'}
                </h3>
                {editingNotice && (
                  <button
                    type="button"
                    onClick={handleCancelNoticeEdit}
                    className="text-[10px] bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold px-2 py-0.5 rounded"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {noticePdfError && (
                <div className="bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{noticePdfError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule for In-Plant Training"
                    value={newNotice.title || ''}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newNotice.category || 'Admission'}
                    onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as Notice['category'] })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white font-bold"
                  >
                    <option value="Admission">Admission</option>
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                    <option value="Exam">Exam</option>
                    <option value="Tender">Tender</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Description</label>
                  <textarea
                    rows={3}
                    placeholder="Full text content of circular..."
                    value={newNotice.content || ''}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white"
                  />
                </div>

                {/* Notice Attachment PDF Field */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-bold text-[#0A2342] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#D97706]" />
                    Attachment PDF (Optional)
                  </label>

                  {existingNoticeAttachment && !selectedNoticePdf && (
                    <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between gap-2 text-[11px]">
                      <div className="truncate">
                        <span className="font-bold text-slate-800 block truncate">{existingNoticeAttachment.fileName}</span>
                        <span className="text-slate-500 font-mono">{existingNoticeAttachment.fileSize} PDF attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveNoticeAttachment}
                        className="text-red-600 hover:text-red-800 font-bold shrink-0 text-[10px] underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => setSelectedNoticePdf(e.target.files?.[0] || null)}
                    className="w-full p-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50"
                  />
                  <p className="text-[10px] text-slate-500">Allowed format: PDF only. Maximum size: 10 MB.</p>

                  {selectedNoticePdf && (
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-[11px] flex justify-between items-center text-emerald-900">
                      <span className="font-semibold truncate">{selectedNoticePdf.name}</span>
                      <span className="font-mono font-bold">{(selectedNoticePdf.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUploadingNoticePdf}
                  className="w-full bg-[#D97706] hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-bold py-2.5 rounded-lg text-xs shadow transition-all flex items-center justify-center gap-1.5"
                >
                  {isUploadingNoticePdf ? 'Uploading PDF...' : editingNotice ? 'Update Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2">
                Published Circulars & Notices ({noticeList.length})
              </h3>

              <div className="divide-y divide-slate-100 space-y-2">
                {noticeList.map((n) => (
                  <div key={n.id} className="py-3.5 flex items-start justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                          {n.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{n.date}</span>
                        {n.isNew && (
                          <span className="text-[9px] font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded uppercase">NEW</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      {n.content && <p className="text-[11px] text-slate-600 line-clamp-2">{n.content}</p>}

                      {n.attachment && (n.attachment.fileUrl || n.attachment.storagePath) && (
                        <div className="pt-1">
                          <a
                            href={n.attachment.fileUrl || supabaseStorageService.getWebsiteDocumentUrl(n.attachment.storagePath)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0A2342] hover:text-[#D97706] bg-amber-50 px-2.5 py-1 rounded border border-amber-200 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#D97706]" />
                            📄 View PDF ({n.attachment.fileSize || 'PDF'})
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenNoticeEdit(n)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200"
                        title="Edit Notice"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete notice "${n.title}"?`)) {
                            handleDeleteNotice(n.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-600 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: EVENTS */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleAddEvent} className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-4 h-fit">
              <h3 className="font-bold text-[#0A2342] text-base font-serif border-b pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D97706]" /> Add College Event
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Dairy Seminar 2026"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 AUG 2026"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D97706] text-slate-950 font-bold py-2.5 rounded-lg text-xs"
                >
                  Save Event
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2">
                College Events ({eventList.length})
              </h3>

              <div className="space-y-3">
                {eventList.map((e) => (
                  <div key={e.id} className="p-4 bg-[#F0F4F8] rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] font-bold text-[#D97706]">{e.date}</div>
                      <div className="font-bold text-xs text-[#0A2342]">{e.title}</div>
                    </div>
                    <button onClick={() => handleDeleteEvent(e.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: DOWNLOADS */}
        {activeTab === 'downloads' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#D97706]" />
                  Downloadable Documents & Forms Management
                </h2>
                <p className="text-xs text-slate-500">
                  Upload and manage public prospectus, syllabi, application forms, and checklists (PDF only, max 10MB)
                </p>
              </div>

              <button
                onClick={handleOpenNewDownloadModal}
                className="bg-[#D97706] hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Upload New Document
              </button>
            </div>

            {/* Downloads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {downloadsList.map((doc) => (
                <div key={doc.id} className="bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200 space-y-4 flex flex-col justify-between shadow-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#D97706] bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200">
                        {doc.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${doc.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                          {doc.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {doc.fileSize}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-[#0A2342] text-base font-serif">{doc.title}</h3>
                    {doc.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{doc.description}</p>
                    )}
                    <div className="text-[10px] text-slate-400 font-mono">
                      File: {doc.fileName}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <a
                      href={doc.fileUrl || supabaseStorageService.getWebsiteDocumentUrl(doc.storagePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white text-[#0A2342] hover:bg-slate-100 font-bold text-xs rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#D97706]" /> View / Download
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleDownloadActive(doc)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-xs border ${doc.isActive ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'}`}
                        title={doc.isActive ? 'Deactivate document' : 'Activate document'}
                      >
                        {doc.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleOpenEditDownloadModal(doc)}
                        className="p-1.5 bg-white text-slate-700 hover:text-blue-600 rounded-lg border border-slate-300"
                        title="Edit metadata / replace file"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteDownload(doc)}
                        className="p-1.5 bg-white text-slate-700 hover:text-red-600 rounded-lg border border-slate-300"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload/Edit Download Modal */}
            {isDownloadModalOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative space-y-5">
                  <button
                    onClick={() => setIsDownloadModalOpen(false)}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-lg font-bold font-serif text-[#0A2342]">
                    {editingDownload ? 'Edit Document Details' : 'Upload New Downloadable PDF'}
                  </h3>

                  {downloadFormError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{downloadFormError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveDownload} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Document Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Admission Prospectus 2026-27"
                        value={downloadForm.title}
                        onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Category *</label>
                        <select
                          value={downloadForm.category}
                          onChange={(e) => setDownloadForm({ ...downloadForm, category: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-bold bg-white"
                        >
                          <option value="Admission">Admission</option>
                          <option value="Academic">Academic</option>
                          <option value="Form">Form</option>
                          <option value="Checklist">Checklist</option>
                          <option value="General">General</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                        <input
                          type="number"
                          min="1"
                          value={downloadForm.displayOrder}
                          onChange={(e) => setDownloadForm({ ...downloadForm, displayOrder: parseInt(e.target.value) || 1 })}
                          className="w-full p-2.5 rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Brief summary or details about this document..."
                        value={downloadForm.description}
                        onChange={(e) => setDownloadForm({ ...downloadForm, description: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        PDF File {editingDownload ? '(Optional - upload to replace current file)' : '*'}
                      </label>
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        required={!editingDownload}
                        onChange={(e) => setSelectedDownloadFile(e.target.files?.[0] || null)}
                        className="w-full p-2 rounded-lg border border-slate-300 bg-slate-50 text-xs"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Allowed format: PDF only. Maximum file size: 10 MB.</p>
                      {selectedDownloadFile && (
                        <div className="mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200 text-slate-800 text-[11px] flex justify-between items-center">
                          <span className="font-semibold truncate">{selectedDownloadFile.name}</span>
                          <span className="font-mono font-bold text-amber-800">{(selectedDownloadFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="docActiveCheck"
                        checked={downloadForm.isActive}
                        onChange={(e) => setDownloadForm({ ...downloadForm, isActive: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-600"
                      />
                      <label htmlFor="docActiveCheck" className="font-bold text-slate-800 cursor-pointer">
                        Active (Visible on public website)
                      </label>
                    </div>

                    {isUploadingDownload && (
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>Uploading PDF file to storage...</span>
                          <span>{downloadUploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#D97706] h-full transition-all duration-300" style={{ width: `${downloadUploadProgress}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setIsDownloadModalOpen(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUploadingDownload}
                        className="px-5 py-2 bg-[#D97706] hover:bg-amber-600 disabled:bg-slate-300 text-slate-950 font-bold rounded-lg text-xs shadow flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {isUploadingDownload ? 'Uploading...' : editingDownload ? 'Update Document' : 'Upload & Save Document'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 10: CONTENT CMS */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold font-serif text-[#0A2342]">Website Content CMS</h2>
              <button type="submit" className="bg-[#D97706] text-slate-950 hover:bg-amber-600 font-bold px-5 py-2 rounded-lg text-xs shadow flex items-center gap-1.5">
                <Save className="w-4 h-4" /> Save All Changes
              </button>
            </div>

            {/* HEADER / WEBSITE BRANDING SECTION */}
            <div className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-5">
              <div className="border-b border-slate-200/80 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#0A2342] text-base font-serif flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                    HEADER / WEBSITE BRANDING
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure the two independent college logos displayed on the left and right sides of the main header banner.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* LEFT LOGO */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#0A2342]" />
                        LEFT LOGO
                      </h4>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                        Header Left Position
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Current Logo Preview
                      </label>
                      <div className="w-full h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 p-3 flex items-center justify-center relative group">
                        {(infoForm.leftLogoImage || infoForm.logoImage) ? (
                          <img
                            src={infoForm.leftLogoImage || infoForm.logoImage}
                            alt="Left Logo Preview"
                            className="max-h-28 max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-slate-400 text-xs">
                            No Left Logo Set
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-800">Recommended Specifications:</div>
                      <div>Format: PNG / JPG / SVG</div>
                      <div>Transparent PNG preferred for best appearance.</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-3 py-2 rounded-lg text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{(infoForm.leftLogoImage || infoForm.logoImage) ? 'Replace Left Logo' : 'Upload New Left Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageFileUpload(file, (url) => {
                                setInfoForm(prev => ({
                                  ...prev,
                                  leftLogoImage: url,
                                  logoImage: url
                                }));
                              }, 'header_logos');
                            }
                          }}
                        />
                      </label>

                      {(infoForm.leftLogoImage || infoForm.logoImage) && (
                        <button
                          type="button"
                          onClick={() => {
                            setInfoForm(prev => ({ ...prev, leftLogoImage: '', logoImage: '' }));
                            showToast('Left logo removed. Click "Save All Changes" to update.');
                          }}
                          className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs border border-rose-200 transition-colors shrink-0"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT LOGO */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#0A2342]" />
                        RIGHT LOGO
                      </h4>
                      <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded border border-amber-200">
                        Header Right Position
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                        Current Logo Preview
                      </label>
                      <div className="w-full h-32 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 p-3 flex items-center justify-center relative group">
                        {infoForm.rightLogoImage ? (
                          <img
                            src={infoForm.rightLogoImage}
                            alt="Right Logo Preview"
                            className="max-h-28 max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-slate-400 text-xs">
                            No Right Logo Set
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div className="font-bold text-slate-800">Recommended Specifications:</div>
                      <div>Format: PNG / JPG / SVG</div>
                      <div>Transparent PNG preferred for best appearance.</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-3 py-2 rounded-lg text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{infoForm.rightLogoImage ? 'Replace Right Logo' : 'Upload New Right Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageFileUpload(file, (url) => {
                                setInfoForm(prev => ({
                                  ...prev,
                                  rightLogoImage: url
                                }));
                              }, 'header_logos');
                            }
                          }}
                        />
                      </label>

                      {infoForm.rightLogoImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setInfoForm(prev => ({ ...prev, rightLogoImage: '' }));
                            showToast('Right logo removed. Click "Save All Changes" to update.');
                          }}
                          className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs border border-rose-200 transition-colors shrink-0"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-[#0A2342]">General College Info</h3>
                <div>
                  <label className="font-bold text-slate-700">College Name</label>
                  <input
                    type="text"
                    value={infoForm.name}
                    onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">College Emblem / Logo</label>
                  <div className="space-y-2 mt-1">
                    {infoForm.logoImage && (
                      <div className="w-16 h-16 rounded-lg bg-white p-1 border border-slate-300 flex items-center justify-center">
                        <img src={infoForm.logoImage} alt="College Logo Preview" className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={infoForm.logoImage || ''}
                        onChange={(e) => setInfoForm({ ...infoForm, logoImage: e.target.value })}
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                        placeholder="Logo image URL or upload file"
                      />
                      <label className="cursor-pointer bg-[#0A2342] text-amber-400 font-bold px-3 py-2 rounded text-xs hover:bg-slate-900 shrink-0 shadow-sm flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageFileUpload(file, (url) => setInfoForm(prev => ({ ...prev, logoImage: url })));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Managing Trust / Samiti Details</label>
                  <textarea
                    rows={2}
                    value={infoForm.trustName || ''}
                    onChange={(e) => setInfoForm({ ...infoForm, trustName: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 font-medium bg-white text-slate-800"
                    placeholder="Managing Trust Name & Registration details..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Tagline</label>
                  <input
                    type="text"
                    value={infoForm.tagline}
                    onChange={(e) => setInfoForm({ ...infoForm, tagline: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">About College Summary (Paragraph 1)</label>
                  <textarea
                    rows={3}
                    value={infoForm.aboutText1}
                    onChange={(e) => setInfoForm({ ...infoForm, aboutText1: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Patron / Late Shri Shaktikumar Sancheti Details */}
              <div className="space-y-3 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-[#0A2342]">Patron Details (Late Shri Shaktikumar Sancheti)</h3>
                <div>
                  <label className="font-bold text-slate-700">Patron Message / Tribute</label>
                  <textarea
                    rows={3}
                    value={infoForm.shaktikumarMessage || ''}
                    onChange={(e) => setInfoForm({ ...infoForm, shaktikumarMessage: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Patron Photo</label>
                  <div className="space-y-2">
                    {infoForm.shaktikumarImage && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300">
                        <img src={infoForm.shaktikumarImage} alt="Patron" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={infoForm.shaktikumarImage || ''}
                        onChange={(e) => setInfoForm({ ...infoForm, shaktikumarImage: e.target.value })}
                        className="w-full p-2 rounded border border-slate-300 bg-white"
                        placeholder="Image URL or upload photo"
                      />
                      <label className="cursor-pointer bg-[#0A2342] text-amber-400 font-bold px-3 py-2 rounded text-xs hover:bg-slate-900 shrink-0 shadow-sm flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageFileUpload(file, (url) => setInfoForm(prev => ({ ...prev, shaktikumarImage: url })));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Banner Carousel Sliders */}
              <div className="lg:col-span-2 space-y-4 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-[#0A2342] text-sm font-serif">Hero Slider Banners</h3>
                    <p className="text-[11px] text-slate-500">Upload high-resolution banner images for homepage main slider</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBanner}
                    className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Banner
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(infoForm.heroBanners || []).map((banner, index) => (
                    <div key={banner.id || index} className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-bold text-[#0A2342]">Banner #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBanner(banner.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 text-[11px]">Title</label>
                        <input
                          type="text"
                          value={banner.title}
                          onChange={(e) => {
                            const updated = [...(infoForm.heroBanners || [])];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setInfoForm({ ...infoForm, heroBanners: updated });
                          }}
                          className="w-full p-2 rounded border border-slate-300 font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 text-[11px]">Subtitle</label>
                        <input
                          type="text"
                          value={banner.subtitle}
                          onChange={(e) => {
                            const updated = [...(infoForm.heroBanners || [])];
                            updated[index] = { ...updated[index], subtitle: e.target.value };
                            setInfoForm({ ...infoForm, heroBanners: updated });
                          }}
                          className="w-full p-2 rounded border border-slate-300"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-600 text-[11px]">Banner Image</label>
                        <div className="space-y-2">
                          {banner.image && (
                            <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200">
                              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={banner.image}
                              onChange={(e) => {
                                const updated = [...(infoForm.heroBanners || [])];
                                updated[index] = { ...updated[index], image: e.target.value };
                                setInfoForm({ ...infoForm, heroBanners: updated });
                              }}
                              className="w-full p-2 rounded border border-slate-300 text-xs"
                              placeholder="Image URL or upload file"
                            />
                            <label className="cursor-pointer bg-[#0A2342] text-amber-400 font-bold px-3 py-2 rounded text-xs hover:bg-slate-900 shrink-0 shadow-sm flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileUpload(file, (url) => {
                                      const updated = [...(infoForm.heroBanners || [])];
                                      updated[index] = { ...updated[index], image: url };
                                      setInfoForm(prev => ({ ...prev, heroBanners: updated }));
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COLLEGE LEADERSHIP SECTION */}
              <div className="space-y-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-serif text-[#0A2342]">College Leadership</h3>
                    <p className="text-xs text-slate-500">Manage names, designations, institution info, messages, and photos for the 4 key college leaders.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. President Details */}
                  <div className="space-y-4 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                        <span className="font-extrabold text-[#0A2342] text-base">1. President</span>
                        <span className="text-xs bg-[#0A2342] text-amber-400 font-bold px-2.5 py-0.5 rounded-full">Leader 1</span>
                      </div>

                      {/* Photo Preview & Upload */}
                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Photo Preview & Upload</label>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                          <img
                            src={infoForm.presidentImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                            alt={infoForm.presidentName || "President"}
                            referrerPolicy="no-referrer"
                            className="w-20 h-24 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={infoForm.presidentImage || ''}
                              onChange={(e) => setInfoForm({ ...infoForm, presidentImage: e.target.value })}
                              className="w-full p-2 text-xs rounded border border-slate-300 bg-white"
                              placeholder="Image URL or upload"
                            />
                            <label className="cursor-pointer inline-flex items-center gap-1 bg-[#0A2342] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-900 shadow-sm">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageFileUpload(file, (url) => setInfoForm(prev => ({ ...prev, presidentImage: url })));
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                                           <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Name</label>
                        <input
                          type="text"
                          value={infoForm.presidentName || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, presidentName: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 font-bold bg-white"
                          placeholder="Shri Madanlalji Sancheti"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Designation</label>
                        <input
                          type="text"
                          value={infoForm.presidentDesignation || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, presidentDesignation: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="President"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Education / Qualification</label>
                        <input
                          type="text"
                          value={infoForm.presidentEducation || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, presidentEducation: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="e.g. B.A., Philanthropist & Social Leader"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">College / Institution</label>
                        <input
                          type="text"
                          value={infoForm.presidentInstitution || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, presidentInstitution: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Late Shaktikumar Sancheti College of Dairy Technology, Malkapur"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Message / Details</label>
                        <textarea
                          rows={3}
                          value={infoForm.presidentMessage || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, presidentMessage: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="President's message quote..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Secretary Details */}
                  <div className="space-y-4 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                        <span className="font-extrabold text-[#0A2342] text-base">2. Secretary</span>
                        <span className="text-xs bg-[#0A2342] text-amber-400 font-bold px-2.5 py-0.5 rounded-full">Leader 2</span>
                      </div>

                      {/* Photo Preview & Upload */}
                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Photo Preview & Upload</label>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                          <img
                            src={infoForm.secretaryImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80"}
                            alt={infoForm.secretaryName}
                            referrerPolicy="no-referrer"
                            className="w-20 h-24 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={infoForm.secretaryImage}
                              onChange={(e) => setInfoForm({ ...infoForm, secretaryImage: e.target.value })}
                              className="w-full p-2 text-xs rounded border border-slate-300 bg-white"
                              placeholder="Image URL or upload"
                            />
                            <label className="cursor-pointer inline-flex items-center gap-1 bg-[#0A2342] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-900 shadow-sm">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) {
                                     handleImageFileUpload(file, (url) => setInfoForm(prev => ({ ...prev, secretaryImage: url })));
                                   }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Name</label>
                        <input
                          type="text"
                          value={infoForm.secretaryName}
                          onChange={(e) => setInfoForm({ ...infoForm, secretaryName: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 font-bold bg-white"
                          placeholder="Suresh Kisanlal Sancheti"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Designation</label>
                        <input
                          type="text"
                          value={infoForm.secretaryDesignation}
                          onChange={(e) => setInfoForm({ ...infoForm, secretaryDesignation: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Secretary"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Education / Qualification</label>
                        <input
                          type="text"
                          value={infoForm.secretaryEducation || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, secretaryEducation: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="e.g. B.Com., M.B.A. (Management)"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">College / Institution</label>
                        <input
                          type="text"
                          value={infoForm.secretaryInstitution || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, secretaryInstitution: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Late Shaktikumar Sancheti College of Dairy Technology, Malkapur"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Message / Details</label>
                        <textarea
                          rows={3}
                          value={infoForm.secretaryMessage}
                          onChange={(e) => setInfoForm({ ...infoForm, secretaryMessage: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Secretary's message quote..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Dean Details */}
                  <div className="space-y-4 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                        <span className="font-extrabold text-[#0A2342] text-base">3. Dean</span>
                        <span className="text-xs bg-[#0A2342] text-amber-400 font-bold px-2.5 py-0.5 rounded-full">Leader 3</span>
                      </div>

                      {/* Photo Preview & Upload */}
                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Photo Preview & Upload</label>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                          <img
                            src={infoForm.deanImage || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"}
                            alt={infoForm.deanName}
                            referrerPolicy="no-referrer"
                            className="w-20 h-24 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={infoForm.deanImage}
                              onChange={(e) => setInfoForm({ ...infoForm, deanImage: e.target.value })}
                              className="w-full p-2 text-xs rounded border border-slate-300 bg-white"
                              placeholder="Image URL or upload"
                            />
                            <label className="cursor-pointer inline-flex items-center gap-1 bg-[#0A2342] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-900 shadow-sm">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) {
                                     handleImageFileUpload(file, (url) => setInfoForm(prev => ({ ...prev, deanImage: url })));
                                   }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Name</label>
                        <input
                          type="text"
                          value={infoForm.deanName}
                          onChange={(e) => setInfoForm({ ...infoForm, deanName: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 font-bold bg-white"
                          placeholder="Dr. P. L. Chaudhari"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Designation</label>
                        <input
                          type="text"
                          value={infoForm.deanDesignation}
                          onChange={(e) => setInfoForm({ ...infoForm, deanDesignation: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Dean"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Education / Qualification</label>
                        <input
                          type="text"
                          value={infoForm.deanEducation || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, deanEducation: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="e.g. Ph.D., M.Tech (Dairy Technology)"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">College / Institution</label>
                        <input
                          type="text"
                          value={infoForm.deanInstitution || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, deanInstitution: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Late Shaktikumar Sancheti College of Dairy Technology, Malkapur"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Message / Details</label>
                        <textarea
                          rows={3}
                          value={infoForm.deanMessage}
                          onChange={(e) => setInfoForm({ ...infoForm, deanMessage: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Dean's message quote..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Administrative Officer Details */}
                  <div className="space-y-4 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                        <span className="font-extrabold text-[#0A2342] text-base">4. Administrative Officer</span>
                        <span className="text-xs bg-[#0A2342] text-amber-400 font-bold px-2.5 py-0.5 rounded-full">Leader 4</span>
                      </div>

                      {/* Photo Preview & Upload */}
                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Photo Preview & Upload</label>
                        <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200">
                          <img
                            src={infoForm.adminOfficerImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"}
                            alt={infoForm.adminOfficerName || "Administrative Officer"}
                            referrerPolicy="no-referrer"
                            className="w-20 h-24 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={infoForm.adminOfficerImage || ''}
                              onChange={(e) => setInfoForm({ ...infoForm, adminOfficerImage: e.target.value })}
                              className="w-full p-2 text-xs rounded border border-slate-300 bg-white"
                              placeholder="Image URL or upload"
                            />
                            <label className="cursor-pointer inline-flex items-center gap-1 bg-[#0A2342] text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-slate-900 shadow-sm">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) {
                                     handleImageFileUpload(file, (url) => setInfoForm(prev => ({ ...prev, adminOfficerImage: url })));
                                   }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Name</label>
                        <input
                          type="text"
                          value={infoForm.adminOfficerName || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, adminOfficerName: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 font-bold bg-white"
                          placeholder="Shri S. D. Lokhande"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Designation</label>
                        <input
                          type="text"
                          value={infoForm.adminOfficerDesignation || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, adminOfficerDesignation: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Administrative Officer"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Education / Qualification</label>
                        <input
                          type="text"
                          value={infoForm.adminOfficerEducation || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, adminOfficerEducation: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="e.g. M.Sc., D.B.M."
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">College / Institution</label>
                        <input
                          type="text"
                          value={infoForm.adminOfficerInstitution || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, adminOfficerInstitution: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Late Shaktikumar Sancheti College of Dairy Technology, Malkapur"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 text-xs block mb-1">Message / Details</label>
                        <textarea
                          rows={3}
                          value={infoForm.adminOfficerMessage || ''}
                          onChange={(e) => setInfoForm({ ...infoForm, adminOfficerMessage: e.target.value })}
                          className="w-full p-2 text-sm rounded border border-slate-300 bg-white"
                          placeholder="Administrative officer's message quote..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 11: CONTACT INFO */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-serif text-[#0A2342]">Contact Information</h2>
            <div className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-4 max-w-xl text-xs">
              <div>
                <label className="font-bold text-slate-700">Campus Address</label>
                <input
                  type="text"
                  value={collegeInfo.address}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Admission Phone Helpline</label>
                <input
                  type="text"
                  value={collegeInfo.phone}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Official Email</label>
                <input
                  type="text"
                  value={collegeInfo.email}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: ADMISSION PROCESS WORKFLOW MANAGER */}
        {activeTab === 'admission_process' && (
          <form onSubmit={handleSaveAdmissionProcess} className="space-y-6 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-amber-600" />
                  Admission Process Workflow Manager
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Configure the 9-step MCAER & CET Cell admission workflow shown on the Admissions page.
                </p>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Workflow Changes</span>
              </button>
            </div>

            {/* Intro & Links Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#0A2342] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Introductory Information & Registration Link
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Introductory Statement *
                </label>
                <textarea
                  rows={3}
                  required
                  value={procIntro}
                  onChange={(e) => setProcIntro(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0A2342] focus:border-transparent"
                  placeholder="Introductory description displayed at the top of the workflow..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official CAP Registration URL *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    value={procCapUrl}
                    onChange={(e) => setProcCapUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono text-teal-800 font-bold"
                    placeholder="https://cetcell.mahacet.org/"
                  />
                  <a
                    href={procCapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 shrink-0"
                    title="Test Link in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Workflow Steps Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0A2342] font-serif">
                  Sequential Workflow Steps ({procSteps.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="space-y-4">
                {procSteps.map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-[#0A2342] text-amber-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-extrabold uppercase text-slate-600">
                          Step {idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'down')}
                          disabled={idx === procSteps.length - 1}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-30"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(idx)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 ml-1"
                          title="Delete Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          Step Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={step.title}
                          onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900 text-xs sm:text-sm"
                          placeholder="e.g. Declaration of results of MHT-CET / NEET / JEE"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={step.description || ''}
                          onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-700"
                          placeholder="Step explanation or guidance..."
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Action Link URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={step.linkUrl || ''}
                          onChange={(e) => handleUpdateStep(idx, 'linkUrl', e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-mono text-teal-800"
                          placeholder="e.g. https://cetcell.mahacet.org/"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Action Link Button Label (Optional)
                        </label>
                        <input
                          type="text"
                          value={step.linkText || ''}
                          onChange={(e) => handleUpdateStep(idx, 'linkText', e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs font-medium"
                          placeholder="e.g. Visit CET Cell Portal"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save All Workflow Steps</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 11: WEBSITE POPUP / ANNOUNCEMENT BANNER */}
        {activeTab === 'popup' && (
          <div className="space-y-6">
            <PopupBannerManager
              popup={popupBanner}
              onSave={async (updated) => {
                setPopupBanner(updated);
                const saved = await storageService.savePopupBanner(updated);
                if (saved) setPopupBanner(saved);
                onRefreshAll();
              }}
              onDelete={async () => {
                await storageService.deletePopupBanner();
                const fresh = storageService.getPopupBanner();
                setPopupBanner(fresh);
                onRefreshAll();
              }}
              onPreview={(b) => {
                setPreviewPopup(b);
                setShowPreviewModal(true);
              }}
              showToast={showToast}
            />

            {/* Admin Popup Preview Modal */}
            <PopupBannerModal
              popup={previewPopup}
              isOpen={showPreviewModal}
              onClose={() => setShowPreviewModal(false)}
              isPreview={true}
            />
          </div>
        )}

        {/* TAB 12: ADMIN USERS */}
        {activeTab === 'admin_users' && (() => {

          const handleAddAdminPanelUser = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!newAdminForm.name || !newAdminForm.username || !newAdminForm.email || !newAdminForm.password) {
              alert('Please fill in all required fields (Name, Username, Email, Password).');
              return;
            }

            const cleanUsername = newAdminForm.username.trim().toLowerCase();
            const cleanEmail = newAdminForm.email.trim().toLowerCase();

            if (adminUsersList.some(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail)) {
              alert('An administrator with this username or email already exists.');
              return;
            }

            showToast('Creating administrator account in database...');

            // Optionally create Supabase Auth user if possible
            let authUserId = '';
            try {
              const { data: authData } = await supabase.auth.signUp({
                email: cleanEmail,
                password: newAdminForm.password,
                options: {
                  data: {
                    name: newAdminForm.name.trim(),
                    username: cleanUsername,
                    role: newAdminForm.role
                  }
                }
              });
              if (authData?.user?.id) {
                authUserId = authData.user.id;
              }
            } catch (e) {
              console.warn('Supabase Auth sign up note:', e);
            }

            const newUser: AdminUser = {
              id: authUserId || `admin-${Date.now()}`,
              name: newAdminForm.name.trim(),
              username: cleanUsername,
              email: cleanEmail,
              mobile: newAdminForm.mobile.trim() || '9822100000',
              role: newAdminForm.role,
              securityQuestion: newAdminForm.securityQuestion,
              securityAnswer: newAdminForm.securityAnswer.trim() || 'LSSCDT',
              password: newAdminForm.password,
              auth_user_id: authUserId,
              createdAt: new Date().toISOString().split('T')[0]
            };

            const res = await storageService.addAdminUser(newUser);
            if (res.success) {
              showToast(`Administrator account for ${newUser.name} created!`);
              if (res.data) {
                setAdminUsersList(res.data);
              } else {
                setAdminUsersList(prev => [...prev, newUser]);
              }
              setShowAddAdminModal(false);
              setNewAdminForm({
                name: '',
                username: '',
                email: '',
                mobile: '',
                role: 'Admission Incharge',
                securityQuestion: 'What is the college code?',
                securityAnswer: 'LSSCDT',
                password: ''
              });
              onRefreshAll();
            } else {
              alert(`Failed to create administrator account: ${res.error || 'Database insert error.'}`);
            }
          };

          const handleDeleteAdmin = async (u: AdminUser) => {
            const currentId = currentAdminUser?.id;
            const currentUsername = currentAdminUser?.username?.toLowerCase()?.trim();
            const currentEmail = currentAdminUser?.email?.toLowerCase()?.trim();
            const currentAuthId = currentAdminUser?.auth_user_id;

            const targetId = u.id;
            const targetUsername = u.username?.toLowerCase()?.trim();
            const targetEmail = u.email?.toLowerCase()?.trim();
            const targetAuthId = u.auth_user_id;

            const isCurrentAdmin =
              (currentId && currentId === targetId) ||
              (currentUsername && currentUsername === targetUsername) ||
              (currentEmail && currentEmail === targetEmail) ||
              (currentAuthId && targetAuthId && currentAuthId === targetAuthId);

            if (isCurrentAdmin) {
              alert("You cannot delete the administrator account currently logged in.");
              return;
            }

            const superAdmins = adminUsersList.filter(user => user.role === 'Super Admin');
            if (u.role === 'Super Admin' && superAdmins.length <= 1) {
              alert("Cannot delete the last remaining Super Admin account.");
              return;
            }

            if (!window.confirm(`Are you sure you want to permanently delete administrator "${u.name}" (${u.username})?\n\nThis will remove the account record directly from public.admin_users.`)) {
              return;
            }

            showToast('Deleting administrator record from public.admin_users...');
            const res = await storageService.deleteAdminUser(u.id);

            if (res.success) {
              showToast(`Administrator account for ${u.name} deleted successfully!`);
              if (res.data) {
                setAdminUsersList(res.data);
              } else {
                setAdminUsersList(prev => prev.filter(item => item.id !== u.id));
              }
              onRefreshAll();
            } else {
              alert(`Database Delete Failed: ${res.error || 'Unable to delete row from public.admin_users.'}`);
            }
          };

          return (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-[#0A2342] flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-600" />
                    Administrator Accounts & Security Desk
                  </h2>
                  <p className="text-xs text-slate-500">
                    Source of truth: <code className="font-mono text-blue-900 font-bold">public.admin_users</code> table in Supabase Database.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Administrator</span>
                </button>
              </div>

              {isLoadingAdminUsers ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
                  <div className="text-xs text-slate-600 font-medium">Fetching verified accounts from public.admin_users...</div>
                </div>
              ) : adminUsersList.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                  <div className="font-bold text-slate-800 text-sm">No administrator accounts found in database.</div>
                  <p className="text-xs text-slate-500">
                    Click "Add New Administrator" to create an administrator record in <code className="font-mono">public.admin_users</code>.
                  </p>
                </div>
              ) : (
                /* Administrators List Cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminUsersList.map((u) => {
                    const isSelf = currentAdminUser?.email?.toLowerCase() === u.email?.toLowerCase() ||
                                  currentAdminUser?.username?.toLowerCase() === u.username?.toLowerCase();

                    return (
                      <div key={u.id} className="bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-[#0A2342] text-amber-400 font-bold flex items-center justify-center shrink-0 text-sm">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                                    You (Current)
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300/60">
                                {u.role}
                              </span>
                            </div>
                          </div>

                          {!isSelf && (
                            <button
                              onClick={() => handleDeleteAdmin(u)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete Administrator Account permanently from public.admin_users"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200/80 font-mono text-[11px]">
                          <div><strong>Username:</strong> <code className="text-blue-900 font-bold">{u.username}</code></div>
                          <div><strong>Email:</strong> {u.email}</div>
                          <div><strong>Mobile:</strong> {u.mobile}</div>
                          {u.auth_user_id && (
                            <div className="truncate text-[10px] text-slate-500">
                              <strong>Auth UID:</strong> {u.auth_user_id}
                            </div>
                          )}
                          <div><strong>Security Question:</strong> {u.securityQuestion}</div>
                          <div className="text-[10px] text-slate-400 pt-1 font-sans">
                            Created: {u.createdAt || 'Registered'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick System Actions */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 max-w-xl">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">System Reset & Session Control</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleResetDefaults}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" /> Reset College Defaults
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout Session
                  </button>
                </div>
              </div>

              {/* Add New Administrator Modal inside Panel */}
              {showAddAdminModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative space-y-4">
                    <button
                      onClick={() => setShowAddAdminModal(false)}
                      className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 border-b pb-3">
                      <UserPlus className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-bold font-serif text-slate-900">Add New College Administrator</h3>
                    </div>

                    <form onSubmit={handleAddAdminPanelUser} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Prof. S. N. Wankhede"
                          value={newAdminForm.name}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Username *</label>
                          <input
                            type="text"
                            required
                            placeholder="wankhede_admin"
                            value={newAdminForm.username}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                            className="w-full p-2.5 rounded-lg border border-slate-300 font-mono outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Role *</label>
                          <select
                            value={newAdminForm.role}
                            onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value as AdminUser['role'] })}
                            className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-bold"
                          >
                            <option value="Super Admin">Super Admin</option>
                            <option value="Admission Incharge">Admission Incharge</option>
                            <option value="Academic Admin">Academic Admin</option>
                            <option value="System Administrator">System Administrator</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="wankhede@lsscdt.ac.in"
                          value={newAdminForm.email}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Password *</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={newAdminForm.password}
                          onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                          className="w-full p-2.5 rounded-lg border border-slate-300 font-mono outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddAdminModal(false)}
                          className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg shadow"
                        >
                          Create Admin Account
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

      </main>

    </div>
  );
};
