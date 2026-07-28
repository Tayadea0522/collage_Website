import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { CollegeInfo, Notice, DepartmentInfo, FacultyMember, AdmissionApplication, GalleryItem, CollegeEvent } from '../types';
import { storageService } from '../services/storageService';
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
  Settings,
  Phone,
  Shield,
  Sliders,
  Mail,
  MapPin,
  ChevronRight
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

  // 4. Applications Manager State
  const [appSearch, setAppSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);
  const [appStatusInput, setAppStatusInput] = useState<AdmissionApplication['status']>('Verified');
  const [appRemarksInput, setAppRemarksInput] = useState('');

  const filteredApps = (applications || []).filter(a => 
    a.id.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.mobile.includes(appSearch)
  );

  // Approved Students List
  const approvedStudents = (applications || []).filter(a => 
    a.status === 'Provisionally Selected' || a.status === 'Verified'
  );

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
                  {approvedStudents.length}
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#0A2342]">
                  Admission Applications ({filteredApps.length})
                </h2>
                <p className="text-xs text-slate-500">Review, verify and approve online admission candidates</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search candidate name or ID..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>
                <button
                  onClick={() => handleExportExcel(filteredApps, 'Filtered_Applications')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 shrink-0 shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Excel</span>
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
                  <button onClick={() => setSelectedApp(null)} className="p-1 text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
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
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-[#0A2342]">
                  Provisionally Selected Candidates ({approvedStudents.length})
                </h2>
                <p className="text-xs text-slate-500">Admitted candidates list ready for MAFSU University enrollment</p>
              </div>

              <button
                onClick={() => handleExportExcel(approvedStudents, 'Approved_Students_2026')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Approved List</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0A2342] text-white">
                    <th className="p-3 font-semibold">Sr. No.</th>
                    <th className="p-3 font-semibold">App ID</th>
                    <th className="p-3 font-semibold">Student Name</th>
                    <th className="p-3 font-semibold">Father Name</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">HSC %</th>
                    <th className="p-3 font-semibold">Aadhar Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {approvedStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-[#F0F4F8]">
                      <td className="p-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-[#D97706]">{s.id}</td>
                      <td className="p-3 font-bold text-slate-900">{s.fullName}</td>
                      <td className="p-3">{s.fatherName}</td>
                      <td className="p-3">{s.category}</td>
                      <td className="p-3 font-mono font-bold">{s.hscPercentage}%</td>
                      <td className="p-3 font-mono">{s.aadharNumber}</td>
                    </tr>
                  ))}
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

                <button
                  type="submit"
                  className="w-full bg-[#D97706] text-slate-950 font-bold py-2.5 rounded-lg text-xs"
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
                  <label className="block font-bold text-slate-700 mb-1">Upload Photo</label>
                  <label className="cursor-pointer bg-[#0A2342] text-amber-400 font-bold px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image File</span>
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
                    className="w-full p-2 rounded border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Tagline</label>
                  <input
                    type="text"
                    value={infoForm.tagline}
                    onChange={(e) => setInfoForm({ ...infoForm, tagline: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-3 bg-[#F0F4F8] p-5 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-[#0A2342]">Dean Message</h3>
                <div>
                  <label className="font-bold text-slate-700">Dean Name</label>
                  <input
                    type="text"
                    value={infoForm.deanName}
                    onChange={(e) => setInfoForm({ ...infoForm, deanName: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Dean Message Quote</label>
                  <textarea
                    rows={3}
                    value={infoForm.deanMessage}
                    onChange={(e) => setInfoForm({ ...infoForm, deanMessage: e.target.value })}
                    className="w-full p-2 rounded border border-slate-300"
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
        {activeTab === 'admin_users' && (
          <div className="space-y-6 max-w-xl">
            <h2 className="text-xl font-bold font-serif text-[#0A2342]">Admin Account & Security</h2>
            <div className="bg-[#F0F4F8] p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-[#0A2342]" />
                <div>
                  <div className="font-bold text-slate-900 text-sm">Super Administrator</div>
                  <div className="text-slate-500">Full system read/write privileges</div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <button
                  onClick={handleResetDefaults}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-lg transition-colors"
                >
                  Reset All College Data
                </button>
                <button
                  onClick={onLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors"
                >
                  Logout Admin Session
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
