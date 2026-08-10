import React, { useState, useEffect } from 'react';
import { 
  CollegeInfo, 
  Notice, 
  DepartmentInfo, 
  FacultyMember, 
  Facility, 
  AdmissionApplication, 
  GalleryItem,
  CollegeEvent,
  AdminUser,
  DownloadableDocument,
  PopupBanner
} from './types';
import { storageService } from './services/storageService';
import { supabaseStorageService } from './services/supabaseStorageService';
import { supabase } from './supabaseClient.js';

// Layout & Core Pages
import { Header } from './components/Header';
import { NoticeTicker } from './components/NoticeTicker';
import { Footer } from './components/Footer';

import { Home } from './components/Home';
import { AboutUs } from './components/AboutUs';
import { Academics } from './components/Academics';
import { Departments } from './components/Departments';
import { Facilities } from './components/Facilities';
import { Faculties } from './components/Faculties';
import { Admissions } from './components/Admissions';
import { AdminPanel } from './components/AdminPanel';
import { AdminAuthModal } from './components/AdminAuthModal';
import { PopupBannerModal } from './components/PopupBannerModal';

import { 
  X, 
  Lock, 
  Calendar, 
  FileText, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  CheckCircle2, 
  Building2,
  Users,
  Image as ImageIcon,
  Download,
  Eye,
  FileCheck
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  
  // Data State
  const [collegeInfo, setCollegeInfo] = useState<CollegeInfo>(storageService.getCollegeInfo());
  const [notices, setNotices] = useState<Notice[]>(storageService.getNotices());
  const [events, setEvents] = useState<CollegeEvent[]>(storageService.getEvents());
  const [departments, setDepartments] = useState<DepartmentInfo[]>(storageService.getDepartments());
  const [faculty, setFaculty] = useState<FacultyMember[]>(storageService.getFaculty());
  const [facilities, setFacilities] = useState<Facility[]>(storageService.getFacilities());
  const [applications, setApplications] = useState<AdmissionApplication[]>(storageService.getApplications());
  const [gallery, setGallery] = useState<GalleryItem[]>(storageService.getGallery());

  const [downloads, setDownloads] = useState<DownloadableDocument[]>(storageService.getDownloads());

  // Public Website Popup State
  const [popupBanner, setPopupBanner] = useState<PopupBanner | null>(() => storageService.getPopupBanner());
  const [showPublicPopup, setShowPublicPopup] = useState<boolean>(false);

  // Multi-Admin Auth State
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  // Notice Detail Modal State
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<Notice | null>(null);

  // Gallery Filter State
  const [galleryFilter, setGalleryFilter] = useState<string>('All');

  // Sync from Supabase on load & manage Supabase Auth session
  useEffect(() => {
    const syncAuthUser = async (session: any) => {
      if (session?.user) {
        try {
          const { data: adminRows } = await supabase
            .from('admin_users')
            .select('*')
            .or(`auth_user_id.eq.${session.user.id},email.ilike.${session.user.email}`);

          if (adminRows && adminRows.length > 0) {
            const dbAdmin = adminRows[0];
            const matchedUser: AdminUser = {
              id: dbAdmin.id || session.user.id,
              name: dbAdmin.name || session.user.email?.split('@')[0] || 'Administrator',
              username: dbAdmin.username || session.user.email?.split('@')[0] || 'admin',
              email: dbAdmin.email || session.user.email || '',
              mobile: dbAdmin.mobile || '9822100001',
              role: dbAdmin.role || 'Super Admin',
              securityQuestion: 'What is the college code?',
              securityAnswer: 'LSSCDT',
              password: '',
              createdAt: dbAdmin.created_at || new Date().toISOString().split('T')[0]
            };
            setCurrentAdminUser(matchedUser);
            setIsAdminLoggedIn(true);
          }
        } catch (e) {
          console.warn('Admin user sync error:', e);
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) syncAuthUser(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        syncAuthUser(session);
      } else {
        setIsAdminLoggedIn(false);
        setCurrentAdminUser(null);
      }
    });

    storageService.fetchAllFromSupabase().then(data => {
      setCollegeInfo(data.collegeInfo);
      setNotices(data.notices);
      setEvents(data.events);
      setFaculty(data.faculty);
      setDepartments(data.departments);
      setFacilities(data.facilities);
      setGallery(data.gallery);
      setDownloads(data.downloads);
      setApplications(data.applications);
      setPopupBanner(data.popupBanner);
      checkAndShowPopup(data.popupBanner);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAndShowPopup = (bannerOverride?: PopupBanner | null) => {
    const popup = bannerOverride !== undefined ? bannerOverride : popupBanner;
    setPopupBanner(popup);

    if (!popup || !popup.isActive) {
      setShowPublicPopup(false);
      return;
    }

    // Schedule dates check
    const today = new Date().toISOString().split('T')[0];
    if (popup.startDate && today < popup.startDate) {
      setShowPublicPopup(false);
      return;
    }
    if (popup.endDate && today > popup.endDate) {
      setShowPublicPopup(false);
      return;
    }

    // Display frequency check
    if (popup.displayFrequency === 'once_per_session') {
      const isDismissed = sessionStorage.getItem('lsscdt_popup_dismissed');
      if (isDismissed === 'true') {
        setShowPublicPopup(false);
        return;
      }
    } else if (popup.displayFrequency === 'once_per_day') {
      const dismissedDate = localStorage.getItem('lsscdt_popup_dismissed_date');
      if (dismissedDate === today) {
        setShowPublicPopup(false);
        return;
      }
    }

    // Show popup after slight delay
    setTimeout(() => {
      setShowPublicPopup(true);
    }, 800);
  };

  const handleClosePublicPopup = () => {
    setShowPublicPopup(false);
    if (popupBanner) {
      const today = new Date().toISOString().split('T')[0];
      if (popupBanner.displayFrequency === 'once_per_session') {
        sessionStorage.setItem('lsscdt_popup_dismissed', 'true');
      } else if (popupBanner.displayFrequency === 'once_per_day') {
        localStorage.setItem('lsscdt_popup_dismissed_date', today);
      }
    }
  };

  const refreshAllData = async () => {
    try {
      const data = await storageService.fetchAllFromSupabase();
      setCollegeInfo(data.collegeInfo);
      setNotices(data.notices);
      setEvents(data.events);
      setFaculty(data.faculty);
      setDepartments(data.departments);
      setFacilities(data.facilities);
      setGallery(data.gallery);
      setDownloads(data.downloads);
      setApplications(data.applications);
      setPopupBanner(data.popupBanner);
      checkAndShowPopup(data.popupBanner);
    } catch (err) {
      console.warn('refreshAllData error:', err);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setIsAdminLoggedIn(false);
    setCurrentAdminUser(null);
    setCurrentTab('home');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Fixed Sticky Header */}
      <Header
        collegeInfo={collegeInfo}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setCurrentTab('admin');
          } else {
            setAdminModalOpen(true);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        currentAdminName={currentAdminUser?.name || 'Administrator'}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Ticker for Latest Alerts */}
      <NoticeTicker
        notices={notices}
        onSelectNotice={(notice) => setSelectedNoticeModal(notice)}
        onViewAllNotices={() => setCurrentTab('notices')}
      />

      {/* Main Page View Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <Home
            collegeInfo={collegeInfo}
            notices={notices}
            events={events}
            departments={departments}
            facilities={facilities}
            onNavigate={setCurrentTab}
            onSelectNotice={(notice) => setSelectedNoticeModal(notice)}
          />
        )}

        {currentTab === 'about' && (
          <AboutUs collegeInfo={collegeInfo} />
        )}

        {currentTab === 'academics' && (
          <Academics faculty={faculty} />
        )}

        {currentTab === 'departments' && (
          <Departments departments={departments} />
        )}

        {currentTab === 'facilities' && (
          <Facilities facilities={facilities} />
        )}

        {currentTab === 'admissions' && (
          <Admissions
            collegeInfo={collegeInfo}
            applications={applications}
            onRefreshApplications={refreshAllData}
          />
        )}

        {(currentTab === 'faculties' || currentTab === 'faculty') && (
          <Faculties faculty={faculty} />
        )}

        {currentTab === 'placements' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 rounded-2xl shadow-lg border border-amber-500/30">
              <div className="max-w-3xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                  Career Success
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
                  Training, Research & Placements Cell
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  100% placement assistance record with India's leading dairy cooperatives, multinational food corporations, and research labs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'AMUL Dairy Anand', role: 'Assistant Manager - Quality Assurance', package: '₹ 8.5 LPA' },
                { title: 'Mother Dairy Delhi', role: 'Technical Officer - Milk Processing', package: '₹ 7.2 LPA' },
                { title: 'Katraj Milk Union Pune', role: 'Dairy Engineer & Plant Supervisor', package: '₹ 5.8 LPA' },
                { title: 'Dynamix Dairy Baramati', role: 'QC Chemist & Product Developer', package: '₹ 6.5 LPA' },
                { title: 'Nestlé Food Processing', role: 'Production Trainee', package: '₹ 9.0 LPA' },
                { title: 'Mahanand Dairy Mumbai', role: 'Plant Executive', package: '₹ 5.5 LPA' },
              ].map((p, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="font-extrabold text-blue-900 text-lg font-serif">{p.title}</div>
                  <div className="text-xs text-slate-700 font-semibold">{p.role}</div>
                  <div className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">{p.package}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'notices' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h1 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                <FileText className="w-6 h-6 text-amber-600" />
                All Official Notices & Circulars
              </h1>

              <div className="divide-y divide-slate-100 space-y-3">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNoticeModal(n)}
                    className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded">
                          {n.date}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                          {n.category}
                        </span>
                        {n.isNew && (
                          <span className="text-[9px] font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded uppercase">
                            NEW
                          </span>
                        )}
                        {n.attachment && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                            📄 PDF
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 hover:text-amber-600">
                        {n.title}
                      </h3>
                      {n.content && (
                        <p className="text-xs text-slate-600 line-clamp-2">{n.content}</p>
                      )}
                    </div>
                    <button className="text-xs font-bold text-blue-900 hover:underline shrink-0">
                      Read Circular →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery Section */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3">
                <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                  Campus & Dairy Plant Gallery
                </h2>
                
                <div className="flex gap-1 text-xs">
                  {['All', 'Campus', 'Dairy Plant', 'Lab', 'Events'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setGalleryFilter(cat)}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                        galleryFilter === cat ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {gallery
                  .filter(item => galleryFilter === 'All' || item.category === galleryFilter)
                  .map((item) => (
                    <div key={item.id} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                      <div className="relative h-44 overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <span className="absolute top-2 left-2 bg-slate-950/80 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-3 bg-white">
                        <div className="font-bold text-xs text-slate-900">{item.title}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {currentTab === 'downloads' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div className="bg-gradient-to-r from-[#071931] via-[#0A2342] to-[#071931] text-white p-8 sm:p-12 rounded-2xl shadow-lg border border-amber-500/30">
              <div className="max-w-3xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                  Official Downloads Corner
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-white">
                  Downloadable Forms, Syllabus & Prospectus
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Access official academic documents, ICAR Deans Vth syllabus, offline admission forms, and scholarship claim checklists.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {downloads.filter(d => d.isActive !== false).map((doc) => (
                <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-lg border border-amber-200">
                        {doc.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono font-semibold bg-slate-100 px-2.5 py-1 rounded">
                        {doc.fileSize}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold font-serif text-[#0A2342]">{doc.title}</h2>
                    {doc.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{doc.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {doc.fileName}
                    </span>

                    <a
                      href={doc.fileUrl || supabaseStorageService.getWebsiteDocumentUrl(doc.storagePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0A2342] hover:bg-[#D97706] text-white hover:text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow transition-all"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'contact' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <h1 className="text-2xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-3">
                  Campus Address & Contact Desk
                </h1>

                <div className="space-y-4 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
                    <div>
                      <strong className="block text-slate-900 font-serif text-base">{collegeInfo.name}</strong>
                      <p>{collegeInfo.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong>Admission Helpline:</strong> {collegeInfo.phone}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <strong>Email:</strong> {collegeInfo.email}
                    </div>
                  </div>
                </div>

                {/* Google Map Embed for Malkapur */}
                <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-300 shadow-inner">
                  <iframe
                    title="College Location Map"
                    src="https://maps.google.com/maps?q=Malkapur%20Buldhana%20Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Quick Inquiry Form */}
              <form onSubmit={(e) => { e.preventDefault(); alert('Inquiry submitted! College desk will contact you soon.'); }} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold font-serif text-slate-900 border-b border-slate-200 pb-2">
                  Send Admission Enquiry
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input type="text" required placeholder="Full Name" className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                    <input type="tel" required placeholder="Mobile Number" className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input type="email" placeholder="Email Address" className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Inquiry Details</label>
                    <textarea rows={4} placeholder="Ask about admissions, fee structure, hostel facilities..." className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>

                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-lg text-xs shadow">
                    Submit Enquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            collegeInfo={collegeInfo}
            notices={notices}
            events={events}
            departments={departments}
            faculty={faculty}
            applications={applications}
            gallery={gallery}
            onRefreshAll={refreshAllData}
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {/* Footer Component */}
      <Footer
        collegeInfo={collegeInfo}
        onNavigate={setCurrentTab}
        onOpenAdmin={() => setAdminModalOpen(true)}
      />

      {/* MULTI-ADMIN AUTHENTICATION & RECOVERY MODAL */}
      <AdminAuthModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onLoginSuccess={(user: AdminUser) => {
          setCurrentAdminUser(user);
          setIsAdminLoggedIn(true);
          setCurrentTab('admin');
        }}
      />

      {/* NOTICE DETAIL MODAL */}
      {selectedNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative space-y-4">
            <button
              onClick={() => setSelectedNoticeModal(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded">
                {selectedNoticeModal.date}
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                {selectedNoticeModal.category}
              </span>
            </div>

            <h3 className="text-lg font-bold font-serif text-slate-900">
              {selectedNoticeModal.title}
            </h3>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {selectedNoticeModal.content || "Official circular issued by Office of Dean, Late Shaktikumar Sancheti College of Dairy Technology."}
            </p>

            {selectedNoticeModal.attachment && (selectedNoticeModal.attachment.fileUrl || selectedNoticeModal.attachment.storagePath) && (
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3">
                <div className="truncate">
                  <span className="font-bold text-slate-800 text-xs block truncate">
                    📄 {selectedNoticeModal.attachment.fileName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {selectedNoticeModal.attachment.fileSize || 'PDF Document'}
                  </span>
                </div>
                <a
                  href={selectedNoticeModal.attachment.fileUrl || supabaseStorageService.getWebsiteDocumentUrl(selectedNoticeModal.attachment.storagePath)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0A2342] hover:bg-[#D97706] text-white hover:text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 shadow transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> View / Download PDF
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNoticeModal(null)}
                className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs"
              >
                Close Circular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Website Popup Modal */}
      <PopupBannerModal
        popup={popupBanner}
        isOpen={showPublicPopup}
        onClose={handleClosePublicPopup}
      />

    </div>
  );
}
