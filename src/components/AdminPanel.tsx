import React, { useState } from 'react';
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
  AlertCircle
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
  const [activeTab, setActiveTab] = useState<'info' | 'notices' | 'events' | 'applications' | 'faculty' | 'gallery'>('notices');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. College Info Form State
  const [infoForm, setInfoForm] = useState<CollegeInfo>({ ...collegeInfo });

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveCollegeInfo(infoForm);
    onRefreshAll();
    showToast('College details & leadership messages updated successfully!');
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

  const filteredApps = applications.filter(a => 
    a.id.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
    a.mobile.includes(appSearch)
  );

  const handleUpdateAppStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    storageService.updateApplicationStatus(selectedApp.id, appStatusInput, appRemarksInput);
    onRefreshAll();
    setSelectedApp(prev => prev ? { ...prev, status: appStatusInput, remarks: appRemarksInput } : null);
    showToast(`Application ${selectedApp.id} status updated to ${appStatusInput}!`);
  };

  // 5. Faculty Manager State
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([...faculty]);
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

  const handleDeleteFaculty = (id: string) => {
    const updated = facultyList.filter(f => f.id !== id);
    setFacultyList(updated);
    storageService.saveFaculty(updated);
    onRefreshAll();
    showToast('Faculty deleted.');
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all website data to default Malkapur college records?')) {
      storageService.resetAllToDefaults();
      onRefreshAll();
      showToast('Website reset to default state.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-amber-300 px-5 py-3 rounded-xl shadow-2xl border border-amber-500/50 flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-amber-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">ADMIN CONTROL PANEL</span>
            <span className="text-xs text-slate-400">Complete Editing Freedom</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-white">
            {collegeInfo.shortName} Website Administrator
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-lg text-xs border border-slate-700 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'notices', label: 'Notices & Circulars', icon: FileText, count: notices.length },
          { id: 'events', label: 'Upcoming Events', icon: Calendar, count: events.length },
          { id: 'applications', label: 'Admission Forms', icon: CheckCircle2, count: applications.length },
          { id: 'info', label: 'College Info & Leadership', icon: Building2 },
          { id: 'faculty', label: 'Faculty Directory', icon: Users, count: faculty.length },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                active
                  ? 'bg-blue-900 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <IconComponent className="w-4 h-4 text-amber-400" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${active ? 'bg-amber-500 text-slate-950 font-extrabold' : 'bg-slate-200 text-slate-800'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. NOTICES MANAGER */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Notice Form - 1 col */}
          <form onSubmit={handleAddNotice} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" /> Publish New Notice
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
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={newNotice.category}
                  onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as Notice['category'] })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-bold"
                >
                  <option value="Admission">Admission</option>
                  <option value="Academic">Academic</option>
                  <option value="General">General</option>
                  <option value="Exam">Exam</option>
                  <option value="Tender">Tender</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Date *</label>
                <input
                  type="text"
                  required
                  value={newNotice.date}
                  onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Description / Details</label>
                <textarea
                  rows={3}
                  placeholder="Full text of notice..."
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newNotice.isNew}
                  onChange={(e) => setNewNotice({ ...newNotice, isNew: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="font-bold text-slate-800">Show Red 'NEW' Badge</span>
              </label>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 rounded-lg text-xs transition-colors shadow-sm"
              >
                Publish Notice
              </button>
            </div>
          </form>

          {/* Existing Notices List - 2 cols */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2">
              Published Circulars ({noticeList.length})
            </h3>

            <div className="divide-y divide-slate-100 space-y-2 max-h-[500px] overflow-y-auto">
              {noticeList.map((n) => (
                <div key={n.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        {n.category}
                      </span>
                      <button
                        onClick={() => handleToggleNoticeNew(n.id)}
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded transition-all ${
                          n.isNew ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {n.isNew ? 'NEW (Active)' : 'Toggle NEW'}
                      </button>
                      <span className="text-xs text-slate-400 font-mono">{n.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    {n.content && <p className="text-[11px] text-slate-600 line-clamp-2">{n.content}</p>}
                  </div>

                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. EVENTS MANAGER */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleAddEvent} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" /> Add College Event
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
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 JUL 2026"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Details about time, venue..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 rounded-lg text-xs transition-colors"
              >
                Save Event
              </button>
            </div>
          </form>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2">
              Event Calendar ({eventList.length})
            </h3>

            {eventList.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No events posted. Use form on left to post upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {eventList.map((e) => (
                  <div key={e.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-bold text-amber-600">{e.date} {e.time && `• ${e.time}`}</div>
                      <div className="font-bold text-xs text-slate-900">{e.title}</div>
                      <p className="text-[11px] text-slate-600 mt-1">{e.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(e.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ADMISSION APPLICATIONS MANAGER */}
      {activeTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications Search & List - 1 col */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-base font-serif">Submitted Forms ({applications.length})</h3>
              <input
                type="text"
                placeholder="Filter by ID, name, or phone..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto space-y-1">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setAppStatusInput(app.status);
                    setAppRemarksInput(app.remarks || '');
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    selectedApp?.id === app.id ? 'bg-amber-100 border border-amber-400' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-blue-900">{app.id}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      app.status === 'Provisionally Selected' ? 'bg-emerald-600 text-white' :
                      app.status === 'Verified' ? 'bg-blue-600 text-white' :
                      'bg-amber-500 text-slate-950'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 mt-1">{app.fullName}</div>
                  <div className="text-[10px] text-slate-500">CET: {app.entrancePercentile}%ile | HSC: {app.hscPercentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Application View & Status Update - 2 cols */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            {selectedApp ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Selected Candidate</span>
                    <h2 className="text-xl font-extrabold text-slate-900">{selectedApp.fullName}</h2>
                    <p className="text-xs text-blue-900 font-mono font-bold">App ID: {selectedApp.id} | Mobile: {selectedApp.mobile}</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1"
                  >
                    Print Application
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div><strong>Father:</strong> {selectedApp.fatherName}</div>
                  <div><strong>Mother:</strong> {selectedApp.motherName}</div>
                  <div><strong>Category:</strong> {selectedApp.category}</div>
                  <div><strong>Email:</strong> {selectedApp.email}</div>
                  <div><strong>HSC PCM %:</strong> {selectedApp.hscPercentage}%</div>
                  <div><strong>Entrance ({selectedApp.entranceExam}):</strong> {selectedApp.entrancePercentile}%ile</div>
                  <div><strong>Agri Quota:</strong> {selectedApp.isAgriculturalist ? 'YES' : 'NO'}</div>
                  <div><strong>Submission Date:</strong> {selectedApp.submissionDate}</div>
                </div>

                {/* Status Update Form */}
                <form onSubmit={handleUpdateAppStatus} className="bg-amber-50 p-5 rounded-xl border border-amber-300 space-y-4">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-amber-900">
                    Scrutiny Committee Action
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Update Status *</label>
                      <select
                        value={appStatusInput}
                        onChange={(e) => setAppStatusInput(e.target.value as any)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 font-bold bg-white outline-none"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Verified">Verified (Recommended)</option>
                        <option value="Provisionally Selected">Provisionally Selected (Seat Allocated)</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Scrutiny Remarks / Instructions</label>
                      <input
                        type="text"
                        value={appRemarksInput}
                        onChange={(e) => setAppRemarksInput(e.target.value)}
                        placeholder="e.g. Merit position #12. Report to college on June 20."
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2 rounded-lg text-xs transition-colors shadow"
                  >
                    Save Status & Remarks
                  </button>
                </form>

              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300" />
                <p>Select an application form from the left list to review and update status.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. COLLEGE INFO & MESSAGES EDITOR */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveInfo} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-slate-900 text-lg font-serif">
              Edit College Details, Leadership Messages & Contact Info
            </h3>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow"
            >
              <Save className="w-4 h-4" /> Save College Settings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">College Full Name</label>
              <input
                type="text"
                value={infoForm.name}
                onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Helpline / Phone Number</label>
              <input
                type="text"
                value={infoForm.phone}
                onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value, admissionHelpline: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">College Official Email</label>
              <input
                type="email"
                value={infoForm.email}
                onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Postal Address</label>
              <input
                type="text"
                value={infoForm.address}
                onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          {/* Dean & Secretary Messages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            {/* Dean */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-blue-900 font-serif text-sm">Dean Details & Message</h4>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dean Name</label>
                <input
                  type="text"
                  value={infoForm.deanName}
                  onChange={(e) => setInfoForm({ ...infoForm, deanName: e.target.value })}
                  className="w-full p-2 rounded border border-slate-300 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dean Message</label>
                <textarea
                  rows={4}
                  value={infoForm.deanMessage}
                  onChange={(e) => setInfoForm({ ...infoForm, deanMessage: e.target.value })}
                  className="w-full p-2 rounded border border-slate-300"
                />
              </div>
            </div>

            {/* Secretary */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-amber-900 font-serif text-sm">Secretary Details & Message</h4>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Secretary Name</label>
                <input
                  type="text"
                  value={infoForm.secretaryName}
                  onChange={(e) => setInfoForm({ ...infoForm, secretaryName: e.target.value })}
                  className="w-full p-2 rounded border border-slate-300 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Secretary Message</label>
                <textarea
                  rows={4}
                  value={infoForm.secretaryMessage}
                  onChange={(e) => setInfoForm({ ...infoForm, secretaryMessage: e.target.value })}
                  className="w-full p-2 rounded border border-slate-300"
                />
              </div>
            </div>
          </div>

        </form>
      )}

      {/* 5. FACULTY DIRECTORY MANAGER */}
      {activeTab === 'faculty' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleAddFaculty} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-600" /> Add Faculty Member
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh K. Patil"
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={newFaculty.designation}
                  onChange={(e) => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <select
                  value={newFaculty.department}
                  onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Qualification & Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D. Dairy Tech"
                  value={newFaculty.qualification}
                  onChange={(e) => setNewFaculty({ ...newFaculty, qualification: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-2.5 rounded-lg text-xs"
              >
                Save Faculty
              </button>
            </div>
          </form>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-serif border-b pb-2">
              Faculty Roster ({facultyList.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {facultyList.map((f) => (
                <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={f.image} alt={f.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">{f.name}</div>
                      <div className="text-slate-500 text-[11px]">{f.designation}</div>
                      <div className="text-[10px] text-amber-700">{f.department}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFaculty(f.id)}
                    className="p-1 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
