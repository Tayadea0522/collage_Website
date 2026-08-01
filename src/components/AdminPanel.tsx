import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { CollegeInfo, Notice, DepartmentInfo, FacultyMember, AdmissionApplication, GalleryItem, CollegeEvent, AdminUser } from '../types';
import { storageService } from '../services/storageService';
import { printApplicationSlip, downloadApplicationSlip } from '../utils/printUtils';
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
  Filter
} from 'lucide-react';

interface AdminPanelProps {
  collegeInfo: CollegeInfo;
  notices: Notice[];
  events: CollegeEvent[];
  departments: DepartmentInfo[];
  faculty: FacultyMember[];
  applications: AdmissionApplication[];
  gallery: GalleryItem[];
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
    | 'info' 
    | 'contact' 
    | 'admin_users';

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin Users management state
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper for image file to base64 conversion
  const handleImageFileUpload = (file: File, callback: (base64Url: string) => void) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please select a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        callback(reader.result);
        showToast('Image uploaded and processed!');
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

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveCollegeInfo(infoForm);
    onRefreshAll();
    showToast('College details, banners & leadership images saved successfully!');
  };

  // Banner Actions
  const handleAddBanner = () => {
    const newBanner = {
      id: `b-${Date.now()}`,
      title: 'New College Banner',
      subtitle: 'ICAR Approved B.Tech (Dairy Technology) Program',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'Apply Now'
    };
    const updated = { ...infoForm, heroBanners: [...(infoForm.heroBanners || []), newBanner] };
    setInfoForm(updated);
    storageService.saveCollegeInfo(updated);
    onRefreshAll();
    showToast('New hero banner added!');
  };

  const handleRemoveBanner = (id: string) => {
    if ((infoForm.heroBanners || []).length <= 1) {
      alert('You must keep at least one banner image.');
      return;
    }
    const updatedBanners = infoForm.heroBanners.filter(b => b.id !== id);
    const updated = { ...infoForm, heroBanners: updatedBanners };
    setInfoForm(updated);
    storageService.saveCollegeInfo(updated);
    onRefreshAll();
    showToast('Banner removed.');
  };

  // 2. Notice Form State
  const [noticeList, setNoticeList] = useState<Notice[]>([...notices]);
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({
    title: '',
    category: 'Admission',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    isNew: true,
    content: ''
  });

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title) return;
    const item: Notice = {
      id: `n-${Date.now()}`,
      title: newNotice.title,
      category: (newNotice.category as Notice['category']) || 'General',
      date: newNotice.date || 'TODAY',
      isNew: newNotice.isNew ?? true,
      content: newNotice.content || ''
    };
    const updated = [item, ...noticeList];
    setNoticeList(updated);
    storageService.saveNotices(updated);
    onRefreshAll();
    setNewNotice({
      title: '',
      category: 'Admission',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      isNew: true,
      content: ''
    });
    showToast('New notice published successfully!');
  };

  const handleDeleteNotice = (id: string) => {
    const updated = noticeList.filter(n => n.id !== id);
    setNoticeList(updated);
    storageService.saveNotices(updated);
    onRefreshAll();
    showToast('Notice deleted.');
  };

  const handleToggleNoticeNew = (id: string) => {
    const updated = noticeList.map(n => n.id === id ? { ...n, isNew: !n.isNew } : n);
    setNoticeList(updated);
    storageService.saveNotices(updated);
    onRefreshAll();
  };

  // 3. Events Form State
  const [eventList, setEventList] = useState<CollegeEvent[]>([...events]);
  const [newEvent, setNewEvent] = useState<Partial<CollegeEvent>>({
    title: '',
    date: '',
    time: '10:00 AM',
    description: ''
  });

  const handleAddEvent = (e: React.FormEvent) => {
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
    storageService.saveEvents(updated);
    onRefreshAll();
    setNewEvent({ title: '', date: '', time: '10:00 AM', description: '' });
    showToast('Event added successfully!');
  };

  const handleDeleteEvent = (id: string) => {
    const updated = eventList.filter(e => e.id !== id);
    setEventList(updated);
    storageService.saveEvents(updated);
    onRefreshAll();
    showToast('Event removed.');
  };

  // 4. Applications & Students Filter State
  const [appSearch, setAppSearch] = useState('');
  const [appYearFilter, setAppYearFilter] = useState('All');
  const [appDeptFilter, setAppDeptFilter] = useState('All');
  const [appStatusFilter, setAppStatusFilter] = useState('All');

  const [studentSearch, setStudentSearch] = useState('');
  const [studentYearFilter, setStudentYearFilter] = useState('All');
  const [studentDeptFilter, setStudentDeptFilter] = useState('All');
  const [studentCategoryFilter, setStudentCategoryFilter] = useState('All');

  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [appStatusInput, setAppStatusInput] = useState<AdmissionApplication['status']>('Verified');
  const [appRemarksInput, setAppRemarksInput] = useState('');

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

  // Applications List with Filters
  const filteredApps = (applications || []).filter(a => {
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
    if (!matchesYear(a, appYearFilter)) return false;
    if (!matchesDept(a, appDeptFilter)) return false;
    return true;
  });

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
    department: 'Department of Dairy Technology',
    qualification: 'M.Tech (Dairy Technology)',
    experience: '5 Years',
    specialization: 'Dairy Processing',
    email: '',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  });

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name) return;
    const item: FacultyMember = {
      id: `f-${Date.now()}`,
      name: newFaculty.name,
      designation: newFaculty.designation || 'Assistant Professor',
      department: newFaculty.department || 'Department of Dairy Technology',
      qualification: newFaculty.qualification || 'M.Tech',
      experience: newFaculty.experience || '1 Year',
      specialization: newFaculty.specialization || 'Dairy Tech',
      email: newFaculty.email || 'faculty@lsscdt.edu.in',
      image: newFaculty.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    };
    const updated = [item, ...facultyList];
    setFacultyList(updated);
    storageService.saveFaculty(updated);
    onRefreshAll();
    setNewFaculty({ name: '', designation: 'Assistant Professor', department: 'Department of Dairy Technology', qualification: 'M.Tech', experience: '5 Years', specialization: '', email: '', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' });
    showToast('Faculty member added!');
  };

  const handleSaveEditFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    const updated = facultyList.map(f => f.id === editingFaculty.id ? editingFaculty : f);
    setFacultyList(updated);
    storageService.saveFaculty(updated);
    onRefreshAll();
    setEditingFaculty(null);
    showToast('Faculty profile updated successfully!');
  };

  const handleDeleteFaculty = (id: string) => {
    const updated = facultyList.filter(f => f.id !== id);
    setFacultyList(updated);
    storageService.saveFaculty(updated);
    onRefreshAll();
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

  const handleAddGalleryItem = (e: React.FormEvent) => {
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
    storageService.saveGallery(updated);
    onRefreshAll();
    setNewGallery({
      title: '',
      category: 'Campus',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
      date: new Date().getFullYear().toString()
    });
    showToast('Gallery image added!');
  };

  const handleDeleteGalleryItem = (id: string) => {
    const updated = galleryList.filter(g => g.id !== id);
    setGalleryList(updated);
    storageService.saveGallery(updated);
    onRefreshAll();
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
    { id: 'info', label: 'Content CMS', icon: Sliders },
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#0A2342]">
                  Admission Applications ({filteredApps.length})
                </h2>
                <p className="text-xs text-slate-500">Review, verify and approve online admission candidates</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search candidate, ID or mobile..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* Admission Year Filter */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#0A2342]" />
                  <select
                    value={appYearFilter}
                    onChange={(e) => setAppYearFilter(e.target.value)}
                    className="bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="All">All Years of Admission</option>
                    <option value="First Year (1st Year)">First Year (1st Year)</option>
                    <option value="Direct Second Year (2nd Year - Lateral Entry)">Direct Second Year (Lateral Entry)</option>
                    <option value="Third Year (3rd Year)">Third Year (3rd Year)</option>
                    <option value="Fourth Year (4th Year)">Fourth Year (4th Year)</option>
                    <option value="2026 Batch">2026 Academic Batch</option>
                    <option value="2025 Batch">2025 Academic Batch</option>
                  </select>
                </div>

                {/* Department / Branch Filter */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-[#0A2342]" />
                  <select
                    value={appDeptFilter}
                    onChange={(e) => setAppDeptFilter(e.target.value)}
                    className="bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="All">All Departments / Branches</option>
                    <option value="Department of Dairy Technology">Dairy Technology</option>
                    <option value="Department of Dairy Engineering">Dairy Engineering</option>
                    <option value="Department of Dairy Chemistry">Dairy Chemistry</option>
                    <option value="Department of Dairy Microbiology">Dairy Microbiology</option>
                    <option value="Department of Dairy Business Management">Dairy Business Management</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                    className="bg-transparent font-medium text-xs text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Verified">Verified</option>
                    <option value="Provisionally Selected">Provisionally Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {(appYearFilter !== 'All' || appDeptFilter !== 'All' || appStatusFilter !== 'All' || appSearch !== '') && (
                  <button
                    onClick={() => { setAppYearFilter('All'); setAppDeptFilter('All'); setAppStatusFilter('All'); setAppSearch(''); }}
                    className="px-2 py-1.5 text-slate-500 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold flex items-center gap-1"
                    title="Clear Filters"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  onClick={() => handleExportExcel(filteredApps, 'Filtered_Applications')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 shadow"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Application Details Modal */}
            {selectedApp && (
              <div className="bg-[#F0F4F8] p-6 rounded-2xl border-2 border-[#0A2342] space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#D97706] bg-amber-100 px-2 py-0.5 rounded">
                      Application ID: {selectedApp.id}
                    </span>
                    <h3 className="text-lg font-bold text-[#0A2342] font-serif mt-1">
                      {selectedApp.fullName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => printApplicationSlip(selectedApp, collegeInfo)}
                      className="bg-[#0A2342] hover:bg-slate-900 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Slip
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadApplicationSlip(selectedApp, collegeInfo)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download (.html)
                    </button>
                    <button onClick={() => setSelectedApp(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 ml-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 font-bold">Category</div>
                    <div className="font-bold text-slate-800">{selectedApp.category}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-slate-400 font-bold">Mobile / Email</div>
                    <div className="font-bold text-slate-800">{selectedApp.mobile}</div>
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
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-blue-900 border-b pb-1">Academic Qualification & Program</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 mt-1">
                    <div><strong>Course Branch:</strong> {selectedApp.admissionBranch || 'B.Tech (Dairy Technology)'}</div>
                    <div><strong>Previous Qualification:</strong> {selectedApp.previousQualification || '12th Science'}</div>
                    <div><strong>Previous Institute/Board:</strong> {selectedApp.previousBoardUniversity || selectedApp.hscBoard}</div>
                    <div><strong>Previous Score:</strong> {selectedApp.previousPercentage || selectedApp.hscPercentage}%</div>
                  </div>
                </div>

                {/* Attached Files List for Admin Review */}
                {selectedApp.attachedFiles && selectedApp.attachedFiles.length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="font-bold text-emerald-800 border-b pb-1 flex items-center justify-between">
                      <span>Attached Verification Certificates ({selectedApp.attachedFiles.length}):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedApp.attachedFiles.map((doc, idx) => (
                        <div key={idx} className="p-2 bg-emerald-50 rounded border border-emerald-200 flex justify-between items-center">
                          <div className="truncate max-w-[180px]">
                            <span className="font-bold text-slate-900 block text-[11px]">{doc.title}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{doc.fileName} ({doc.fileSize})</span>
                          </div>
                          {doc.dataUrl && (
                            <a
                              href={doc.dataUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[10px] flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View Document
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Updater */}
                <form onSubmit={handleUpdateAppStatus} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 space-y-1 w-full text-xs">
                    <label className="font-bold text-slate-700">Update Candidate Status</label>
                    <select
                      value={appStatusInput}
                      onChange={(e) => setAppStatusInput(e.target.value as any)}
                      className="w-full p-2 rounded-lg border border-slate-300 font-bold text-xs"
                    >
                      <option value="Submitted">Submitted (Under Review)</option>
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
                    Save Status
                  </button>
                </form>
              </div>
            )}

            {/* Applications Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0A2342] text-white">
                    <th className="p-3 font-semibold">App ID</th>
                    <th className="p-3 font-semibold">Student Name</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Mobile</th>
                    <th className="p-3 font-semibold">HSC %</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-[#F0F4F8]">
                      <td className="p-3 font-mono font-bold text-[#D97706]">{app.id}</td>
                      <td className="p-3 font-bold text-slate-900">{app.fullName}</td>
                      <td className="p-3">{app.category}</td>
                      <td className="p-3 font-mono">{app.mobile}</td>
                      <td className="p-3 font-mono font-bold">{app.hscPercentage}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.status === 'Provisionally Selected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-3 flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedApp(app); setAppStatusInput(app.status); setAppRemarksInput(app.remarks || ''); }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-[#0A2342] font-bold rounded"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleQuickApprove(app)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <h2 className="text-xl font-bold font-serif text-[#0A2342]">
              Academic Departments Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((d) => (
                <div key={d.id} className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs font-bold text-[#D97706] bg-amber-100 px-2 py-0.5 rounded">
                      [{d.code}]
                    </span>
                    <span className="text-xs text-slate-500 font-bold">5 Faculty Members</span>
                  </div>
                  <h3 className="font-bold text-[#0A2342] text-base font-serif">{d.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{d.description}</p>
                  <div className="text-xs text-slate-700 font-semibold border-t border-slate-200 pt-2">
                    HOD: {d.headOfDepartment}
                  </div>
                </div>
              ))}
            </div>
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
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={newFaculty.designation}
                    onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={newFaculty.department}
                    onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-white font-bold"
                  >
                    {(departments || []).map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualification & Experience</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="e.g. M.Tech (Dairy Tech)"
                      value={newFaculty.qualification || ''}
                      onChange={(e) => setNewFaculty({ ...newFaculty, qualification: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 8 Years"
                      value={newFaculty.experience || ''}
                      onChange={(e) => setNewFaculty({ ...newFaculty, experience: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. faculty@lsscdt.edu.in"
                    value={newFaculty.email || ''}
                    onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Faculty Photo</label>
                  <div className="space-y-2">
                    {newFaculty.image && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300">
                        <img src={newFaculty.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Image URL or upload"
                        value={newFaculty.image || ''}
                        onChange={(e) => setNewFaculty({ ...newFaculty, image: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs outline-none"
                      />
                      <label className="cursor-pointer bg-[#0A2342] text-amber-400 font-bold px-3 py-2 rounded-lg text-xs flex items-center shrink-0 hover:bg-slate-900 transition-colors">
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleImageFileUpload(e.target.files[0], (url) => setNewFaculty(prev => ({ ...prev, image: url })));
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D97706] text-slate-950 font-bold py-2.5 rounded-lg text-xs hover:bg-amber-600 transition-colors"
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
                  <div key={f.id} className="p-4 bg-[#F0F4F8] rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={f.image} alt={f.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#D97706]" />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">{f.name}</div>
                        <div className="text-slate-500 text-[11px]">{f.designation}</div>
                        <div className="text-[10px] text-[#D97706] font-bold">{f.department}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFaculty(f.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded"
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
            <form onSubmit={handleAddNotice} className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-4 h-fit">
              <h3 className="font-bold text-[#0A2342] text-base font-serif border-b pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D97706]" /> Publish New Notice
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule for In-Plant Training"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newNotice.category}
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
                    placeholder="Full text of notice..."
                    value={newNotice.content}
                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D97706] text-slate-950 font-bold py-2.5 rounded-lg text-xs"
                >
                  Publish Notice
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2">
                Published Circulars ({noticeList.length})
              </h3>

              <div className="divide-y divide-slate-100 space-y-2">
                {noticeList.map((n) => (
                  <div key={n.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                          {n.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{n.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    </div>

                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
            <h2 className="text-xl font-bold font-serif text-[#0A2342]">
              Downloadable Forms & Brochure CMS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Admission Prospectus 2026-27', size: '2.4 MB PDF' },
                { name: 'B.Tech Syllabus (ICAR Vth Deans)', size: '1.8 MB PDF' },
                { name: 'Offline Application Form', size: '450 KB PDF' },
                { name: 'Scholarship & Caste Claim Checklist', size: '320 KB PDF' },
              ].map((doc, idx) => (
                <div key={idx} className="bg-[#F0F4F8] p-5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-xs text-[#0A2342]">{doc.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{doc.size}</div>
                  </div>
                  <button className="p-2 bg-white text-[#D97706] rounded-lg border border-slate-200">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: CONTENT CMS */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold font-serif text-[#0A2342]">Website Content CMS</h2>
              <button type="submit" className="bg-[#D97706] text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow">
                Save All Changes
              </button>
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

              <div className="space-y-3 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-[#0A2342]">Dean Details</h3>
                <div>
                  <label className="font-bold text-slate-700">Dean Name</label>
                  <input
                    type="text"
                    value={infoForm.deanName}
                    onChange={(e) => setInfoForm({ ...infoForm, deanName: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Dean Designation</label>
                  <input
                    type="text"
                    value={infoForm.deanDesignation}
                    onChange={(e) => setInfoForm({ ...infoForm, deanDesignation: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Dean Photo</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={infoForm.deanImage}
                      onChange={(e) => setInfoForm({ ...infoForm, deanImage: e.target.value })}
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                      placeholder="Image URL or upload"
                    />
                    <label className="cursor-pointer bg-[#0A2342] text-white px-3 py-2 rounded text-xs font-bold hover:bg-slate-900 shrink-0 shadow-sm">
                      Upload
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
                <div>
                  <label className="font-bold text-slate-700">Dean Message Quote</label>
                  <textarea
                    rows={3}
                    value={infoForm.deanMessage}
                    onChange={(e) => setInfoForm({ ...infoForm, deanMessage: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-[#0A2342]">Secretary Details</h3>
                <div>
                  <label className="font-bold text-slate-700">Secretary Name</label>
                  <input
                    type="text"
                    value={infoForm.secretaryName}
                    onChange={(e) => setInfoForm({ ...infoForm, secretaryName: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Secretary Designation</label>
                  <input
                    type="text"
                    value={infoForm.secretaryDesignation}
                    onChange={(e) => setInfoForm({ ...infoForm, secretaryDesignation: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Secretary Photo</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={infoForm.secretaryImage}
                      onChange={(e) => setInfoForm({ ...infoForm, secretaryImage: e.target.value })}
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                      placeholder="Image URL or upload"
                    />
                    <label className="cursor-pointer bg-[#0A2342] text-white px-3 py-2 rounded text-xs font-bold hover:bg-slate-900 shrink-0 shadow-sm">
                      Upload
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
                <div>
                  <label className="font-bold text-slate-700">Secretary Message Quote</label>
                  <textarea
                    rows={3}
                    value={infoForm.secretaryMessage}
                    onChange={(e) => setInfoForm({ ...infoForm, secretaryMessage: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-[#0A2342]">Administrative Officer Details</h3>
                <div>
                  <label className="font-bold text-slate-700">Admin Officer Name</label>
                  <input
                    type="text"
                    value={infoForm.adminOfficerName || ''}
                    onChange={(e) => setInfoForm({ ...infoForm, adminOfficerName: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 font-bold bg-white"
                    placeholder="Shri S. D. Lokhande"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Admin Officer Designation</label>
                  <input
                    type="text"
                    value={infoForm.adminOfficerDesignation || ''}
                    onChange={(e) => setInfoForm({ ...infoForm, adminOfficerDesignation: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                    placeholder="Administrative Officer, LSSCDT"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Admin Officer Photo</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={infoForm.adminOfficerImage || ''}
                      onChange={(e) => setInfoForm({ ...infoForm, adminOfficerImage: e.target.value })}
                      className="w-full p-2 rounded border border-slate-300 bg-white"
                      placeholder="Image URL or upload photo"
                    />
                    <label className="cursor-pointer bg-[#0A2342] text-white px-3 py-2 rounded text-xs font-bold hover:bg-slate-900 shrink-0 shadow-sm">
                      Upload
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
                <div>
                  <label className="font-bold text-slate-700">Admin Officer Message Quote</label>
                  <textarea
                    rows={3}
                    value={infoForm.adminOfficerMessage || ''}
                    onChange={(e) => setInfoForm({ ...infoForm, adminOfficerMessage: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
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

        {/* TAB 12: ADMIN USERS */}
        {activeTab === 'admin_users' && (() => {
          const adminUsers = storageService.getAdminUsers();

          const handleAddAdminPanelUser = (e: React.FormEvent) => {
            e.preventDefault();
            if (!newAdminForm.name || !newAdminForm.username || !newAdminForm.email || !newAdminForm.password) {
              alert('Please fill in all required fields.');
              return;
            }
            if (adminUsers.some(u => u.username.toLowerCase() === newAdminForm.username.trim().toLowerCase())) {
              alert('An administrator with this username already exists.');
              return;
            }
            const newUser: AdminUser = {
              id: `admin-${Date.now()}`,
              name: newAdminForm.name,
              username: newAdminForm.username.trim(),
              email: newAdminForm.email.trim(),
              mobile: newAdminForm.mobile.trim() || '9822100000',
              role: newAdminForm.role,
              securityQuestion: newAdminForm.securityQuestion,
              securityAnswer: newAdminForm.securityAnswer.trim() || 'LSSCDT',
              password: newAdminForm.password,
              createdAt: new Date().toISOString().split('T')[0]
            };
            storageService.addAdminUser(newUser);
            showToast(`Administrator account for ${newUser.name} created!`);
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
          };

          const handleDeleteAdmin = (id: string, name: string) => {
            if (adminUsers.length <= 1) {
              alert('Cannot delete the last remaining administrator account.');
              return;
            }
            if (window.confirm(`Are you sure you want to delete administrator "${name}"?`)) {
              const updated = adminUsers.filter(u => u.id !== id);
              storageService.saveAdminUsers(updated);
              showToast(`Administrator account deleted.`);
              onRefreshAll();
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
                    Manage multiple college administrator accounts, roles, recovery credentials & passwords.
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

              {/* Administrators List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminUsers.map((u) => (
                  <div key={u.id} className="bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#0A2342] text-amber-400 font-bold flex items-center justify-center shrink-0 text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300/60">
                            {u.role}
                          </span>
                        </div>
                      </div>

                      {adminUsers.length > 1 && (
                        <button
                          onClick={() => handleDeleteAdmin(u.id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Administrator Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200/80">
                      <div><strong>Username:</strong> <code className="text-blue-900 font-bold font-mono">{u.username}</code></div>
                      <div><strong>Email:</strong> {u.email}</div>
                      <div><strong>Mobile:</strong> {u.mobile}</div>
                      <div><strong>Security Question:</strong> {u.securityQuestion}</div>
                      <div className="text-[10px] text-slate-400 pt-1">Password: •••••••• (Security Recoverable)</div>
                    </div>
                  </div>
                ))}
              </div>

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
