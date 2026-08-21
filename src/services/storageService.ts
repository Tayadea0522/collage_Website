import { CollegeInfo, DepartmentInfo, Facility, FacultyMember, Notice, AdmissionApplication, GalleryItem, CollegeEvent, AdminUser, DownloadableDocument, PopupBanner } from '../types';
import { initialCollegeInfo, initialDepartments, initialFacilities, initialFaculty, initialNotices, initialApplications, initialGallery, initialEvents, initialAdminUsers, initialDownloads, initialPopupBanner } from '../data/initialData';
import { supabase } from '../supabaseClient';
import { supabaseStorageService } from './supabaseStorageService';

const MIGRATION_KEY = 'lsscdt_storage_migration_v3';

export const cleanObsoleteLocalStorage = (): void => {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (localStorage.getItem(MIGRATION_KEY) !== 'v3_done') {
        const keysToRemove = [
          'lsscdt_college_info_v2',
          'lsscdt_notices_v2',
          'lsscdt_events_v2',
          'lsscdt_faculty_v2',
          'lsscdt_departments_v2',
          'lsscdt_facilities_v2',
          'lsscdt_applications_v2',
          'lsscdt_gallery_v2',
          'lsscdt_downloads_v2',
          'lsscdt_popup_banner_v2',
          'siteData',
          'websiteData'
        ];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(MIGRATION_KEY, 'v3_done');
      }
    }
  } catch (e) {
    console.warn('Storage cleanup notice:', e);
  }
};

const isInvalidOrPrivateUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  return url.startsWith('data:') || url.startsWith('blob:') || url.includes('/storage/v1/object/public/admissions/');
};

export const storageService = {
  // --- Admin Users ---
  fetchAdminUsers: async (): Promise<AdminUser[]> => {
    try {
      const { data, error } = await supabase.from('admin_users').select('*');
      if (error) {
        console.warn('Error fetching admin_users from Supabase:', error.message);
        return [];
      }
      if (!data || data.length === 0) return [];

      return data.map(row => {
        const d = (row.data && typeof row.data === 'object') ? row.data : {};
        return {
          id: String(row.id || d.id || `admin-${Date.now()}`),
          name: row.name || d.name || row.username || 'Administrator',
          username: row.username || d.username || 'admin',
          email: row.email || d.email || '',
          mobile: row.mobile || d.mobile || '9822100000',
          role: row.role || d.role || 'Super Admin',
          securityQuestion: row.security_question || row.securityQuestion || d.securityQuestion || 'What is the college code?',
          securityAnswer: row.security_answer || row.securityAnswer || d.securityAnswer || 'LSSCDT',
          password: row.password || d.password || '',
          auth_user_id: row.auth_user_id || d.auth_user_id || '',
          createdAt: row.created_at || row.createdAt || d.createdAt || new Date().toISOString().split('T')[0],
          updatedAt: row.updated_at || row.updatedAt || d.updatedAt || new Date().toISOString().split('T')[0]
        };
      });
    } catch (err) {
      console.warn('fetchAdminUsers exception:', err);
      return [];
    }
  },

  getAdminUsers: (): AdminUser[] => [],

  saveAdminUsers: async (users: AdminUser[]): Promise<{ success: boolean; data?: AdminUser[]; error?: string }> => {
    try {
      const recordsToUpsert = users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        mobile: u.mobile,
        role: u.role,
        security_question: u.securityQuestion,
        security_answer: u.securityAnswer,
        auth_user_id: u.auth_user_id || null,
        created_at: u.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: u
      }));

      const { error } = await supabase.from('admin_users').upsert(recordsToUpsert);
      if (error) {
        console.error('saveAdminUsers error:', error.message);
        return { success: false, error: error.message };
      }
      const refreshed = await storageService.fetchAdminUsers();
      return { success: true, data: refreshed };
    } catch (err: any) {
      console.error('saveAdminUsers exception:', err);
      return { success: false, error: err?.message || 'Failed to save admin user records' };
    }
  },

  deleteAdminUser: async (id: string): Promise<{ success: boolean; data?: AdminUser[]; error?: string }> => {
    try {
      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (error) {
        console.error('deleteAdminUser database error:', error.message);
        return { success: false, error: error.message };
      }
      const refreshed = await storageService.fetchAdminUsers();
      return { success: true, data: refreshed };
    } catch (err: any) {
      console.error('deleteAdminUser exception:', err);
      return { success: false, error: err?.message || 'Failed to delete administrator from database' };
    }
  },

  addAdminUser: async (user: AdminUser): Promise<{ success: boolean; data?: AdminUser[]; error?: string }> => {
    try {
      const dbRecord = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        security_question: user.securityQuestion,
        security_answer: user.securityAnswer,
        auth_user_id: user.auth_user_id || null,
        created_at: user.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: user
      };
      const { error } = await supabase.from('admin_users').insert([dbRecord]);
      if (error) {
        console.error('addAdminUser database error:', error.message);
        return { success: false, error: error.message };
      }
      const refreshed = await storageService.fetchAdminUsers();
      return { success: true, data: refreshed };
    } catch (err: any) {
      console.error('addAdminUser exception:', err);
      return { success: false, error: err?.message || 'Failed to add administrator record' };
    }
  },

  updateAdminPassword: async (identifier: string, newPassword: string): Promise<boolean> => {
    const users = await storageService.fetchAdminUsers();
    const query = identifier.trim().toLowerCase();
    let target = users.find(u => u.username.toLowerCase() === query || u.email.toLowerCase() === query || u.mobile === identifier.trim());
    if (target) {
      const updatedUser = { ...target, password: newPassword, updatedAt: new Date().toISOString() };
      const res = await storageService.saveAdminUsers([updatedUser]);
      return res.success;
    }
    return false;
  },

  // --- College Information ---
  fetchCollegeInfo: async (): Promise<CollegeInfo> => {
    try {
      const { data, error } = await supabase.from('college_info').select('*').limit(1);
      if (error || !data || data.length === 0) return initialCollegeInfo;
      const row = data[0];
      const loadedInfo = { ...(row.data || row) };
      if (!loadedInfo.trustName) {
        loadedInfo.trustName = initialCollegeInfo.trustName;
      }
      if (!loadedInfo.leftLogoImage) {
        loadedInfo.leftLogoImage = loadedInfo.logoImage || initialCollegeInfo.leftLogoImage || '/logo.svg';
      }
      if (!loadedInfo.rightLogoImage) {
        loadedInfo.rightLogoImage = initialCollegeInfo.rightLogoImage || '/logo.svg';
      }
      if (!loadedInfo.presidentName) {
        loadedInfo.presidentName = initialCollegeInfo.presidentName;
        loadedInfo.presidentDesignation = initialCollegeInfo.presidentDesignation;
        loadedInfo.presidentEducation = initialCollegeInfo.presidentEducation;
        loadedInfo.presidentInstitution = initialCollegeInfo.presidentInstitution;
        loadedInfo.presidentMessage = initialCollegeInfo.presidentMessage;
        loadedInfo.presidentImage = initialCollegeInfo.presidentImage;
      }
      if (!loadedInfo.presidentEducation) {
        loadedInfo.presidentEducation = initialCollegeInfo.presidentEducation;
      }
      if (!loadedInfo.deanEducation) {
        loadedInfo.deanEducation = initialCollegeInfo.deanEducation;
      }
      if (!loadedInfo.secretaryEducation) {
        loadedInfo.secretaryEducation = initialCollegeInfo.secretaryEducation;
      }
      if (!loadedInfo.adminOfficerEducation) {
        loadedInfo.adminOfficerEducation = initialCollegeInfo.adminOfficerEducation;
      }
      if (!loadedInfo.deanInstitution) {
        loadedInfo.deanInstitution = initialCollegeInfo.deanInstitution;
      }
      if (!loadedInfo.secretaryInstitution) {
        loadedInfo.secretaryInstitution = initialCollegeInfo.secretaryInstitution;
      }
      if (!loadedInfo.adminOfficerInstitution) {
        loadedInfo.adminOfficerInstitution = initialCollegeInfo.adminOfficerInstitution;
      }
      if (!loadedInfo.admissionProcess || !loadedInfo.admissionProcess.steps || loadedInfo.admissionProcess.steps.length === 0) {
        loadedInfo.admissionProcess = initialCollegeInfo.admissionProcess;
      }
      if (!loadedInfo.academicsData) {
        loadedInfo.academicsData = initialCollegeInfo.academicsData;
      } else {
        loadedInfo.academicsData = {
          ...initialCollegeInfo.academicsData,
          ...loadedInfo.academicsData,
          coursesOffered: { ...initialCollegeInfo.academicsData?.coursesOffered, ...loadedInfo.academicsData.coursesOffered },
          intakeCapacity: { ...initialCollegeInfo.academicsData?.intakeCapacity, ...loadedInfo.academicsData.intakeCapacity },
          eligibility: { ...initialCollegeInfo.academicsData?.eligibility, ...loadedInfo.academicsData.eligibility },
          admissionProcess: { ...initialCollegeInfo.academicsData?.admissionProcess, ...loadedInfo.academicsData.admissionProcess },
          documentsRequired: { ...initialCollegeInfo.academicsData?.documentsRequired, ...loadedInfo.academicsData.documentsRequired },
          feesStructure: { ...initialCollegeInfo.academicsData?.feesStructure, ...loadedInfo.academicsData.feesStructure },
          admissionEnquiry: { ...initialCollegeInfo.academicsData?.admissionEnquiry, ...loadedInfo.academicsData.admissionEnquiry },
          admissionPortal: { ...initialCollegeInfo.academicsData?.admissionPortal, ...loadedInfo.academicsData.admissionPortal },
          admissionProspectus: { ...initialCollegeInfo.academicsData?.admissionProspectus, ...loadedInfo.academicsData.admissionProspectus },
          trackApplicationStatus: { ...initialCollegeInfo.academicsData?.trackApplicationStatus, ...loadedInfo.academicsData.trackApplicationStatus },
          programOverview: { ...initialCollegeInfo.academicsData?.programOverview, ...loadedInfo.academicsData.programOverview },
          curriculumSyllabus: { ...initialCollegeInfo.academicsData?.curriculumSyllabus, ...loadedInfo.academicsData.curriculumSyllabus },
          academicCalendar: { ...initialCollegeInfo.academicsData?.academicCalendar, ...loadedInfo.academicsData.academicCalendar },
          academicRegulations: { ...initialCollegeInfo.academicsData?.academicRegulations, ...loadedInfo.academicsData.academicRegulations },
        } as any;
      }
      return loadedInfo;
    } catch {
      return initialCollegeInfo;
    }
  },
  getCollegeInfo: (): CollegeInfo => initialCollegeInfo,

    saveCollegeInfo: async (info: CollegeInfo): Promise<CollegeInfo> => {
      try {
        let updatedInfo = { ...info };

        if (isInvalidOrPrivateUrl(updatedInfo.logoImage)) {
          const cloudUrl = await supabaseStorageService.uploadImage(updatedInfo.logoImage!, 'college');
          if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) updatedInfo.logoImage = cloudUrl;
        }
        if (isInvalidOrPrivateUrl(updatedInfo.leftLogoImage)) {
          const cloudUrl = await supabaseStorageService.uploadImage(updatedInfo.leftLogoImage!, 'college');
          if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
            updatedInfo.leftLogoImage = cloudUrl;
            if (!updatedInfo.logoImage || isInvalidOrPrivateUrl(updatedInfo.logoImage)) {
              updatedInfo.logoImage = cloudUrl;
            }
          }
        }
        if (isInvalidOrPrivateUrl(updatedInfo.rightLogoImage)) {
          const cloudUrl = await supabaseStorageService.uploadImage(updatedInfo.rightLogoImage!, 'college');
          if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) updatedInfo.rightLogoImage = cloudUrl;
        }
        if (isInvalidOrPrivateUrl(updatedInfo.shaktikumarImage)) {
          const cloudUrl = await supabaseStorageService.uploadImage(updatedInfo.shaktikumarImage!, 'college');
          if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) updatedInfo.shaktikumarImage = cloudUrl;
        }
        if (isInvalidOrPrivateUrl(updatedInfo.deanImage)) {
          const cloudUrl = await supabaseStorageService.uploadImage(updatedInfo.deanImage!, 'college');
          if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) updatedInfo.deanImage = cloudUrl;
        }
        if (isInvalidOrPrivateUrl(updatedInfo.secretaryImage)) {
          const cloudUrl = await supabaseStorageService.uploadImage(updatedInfo.secretaryImage!, 'college');
          if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) updatedInfo.secretaryImage = cloudUrl;
        }
        if (isInvalidOrPrivateUrl(updatedInfo.adminOfficerImage)) {
          const cloudUrl = await supabaseStorageService.uploadImage(updatedInfo.adminOfficerImage!, 'college');
          if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) updatedInfo.adminOfficerImage = cloudUrl;
        }
        if (isInvalidOrPrivateUrl(updatedInfo.presidentImage)) {
          const cloudUrl = await supabaseStorageService.uploadImage(updatedInfo.presidentImage!, 'college');
          if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) updatedInfo.presidentImage = cloudUrl;
        }
        if (updatedInfo.heroBanners && updatedInfo.heroBanners.length > 0) {
          updatedInfo.heroBanners = await Promise.all(
            updatedInfo.heroBanners.map(async b => {
              if (isInvalidOrPrivateUrl(b.image)) {
                const cloudUrl = await supabaseStorageService.uploadImage(b.image, 'hero');
                if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
                  return { ...b, image: cloudUrl };
                }
              }
              return b;
            })
          );
        }

        const { error } = await supabase.from('college_info').upsert([{ id: 'default', data: updatedInfo, updated_at: new Date().toISOString() }]);
        if (error) console.warn('Supabase college_info save warning:', error.message);
      } catch (err) {
        console.warn('saveCollegeInfo exception:', err);
      }
      return await storageService.fetchCollegeInfo();
    },

  saveAcademicsData: async (academicsData: any): Promise<CollegeInfo> => {
    try {
      const current = await storageService.fetchCollegeInfo();
      const updated = {
        ...current,
        academicsData: {
          ...current.academicsData,
          ...academicsData
        }
      };
      return await storageService.saveCollegeInfo(updated);
    } catch (err) {
      console.warn('saveAcademicsData exception:', err);
      return await storageService.fetchCollegeInfo();
    }
  },

  // --- Notices ---
  fetchNotices: async (): Promise<Notice[]> => {
    try {
      const { data, error } = await supabase.from('notices').select('*').order('date', { ascending: false });
      if (error || !data) return [];
      return data.map(row => ({ ...(row.data || row), id: row.id || row.data?.id }));
    } catch {
      return [];
    }
  },
  getNotices: (): Notice[] => initialNotices,

  saveNotices: async (notices: Notice[]): Promise<Notice[]> => {
    try {
      const dbRows = notices.map(n => ({
        id: n.id,
        title: n.title,
        category: n.category,
        date: n.date,
        data: n,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase.from('notices').upsert(dbRows);
      if (error) console.warn('Supabase notices save warning:', error.message);
    } catch (err) {
      console.warn('saveNotices exception:', err);
    }
    return await storageService.fetchNotices();
  },

  deleteNotice: async (id: string): Promise<Notice[]> => {
    try {
      const current = await storageService.fetchNotices();
      const target = current.find(n => n.id === id);
      if (target?.attachment?.storagePath) {
        await supabaseStorageService.deleteWebsiteDocument(target.attachment.storagePath);
      }
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) console.warn('Supabase deleteNotice error:', error.message);
    } catch (err) {
      console.warn('deleteNotice exception:', err);
    }
    return await storageService.fetchNotices();
  },

  // --- Events ---
  fetchEvents: async (): Promise<CollegeEvent[]> => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
      if (error || !data) return [];
      return data.map(row => ({ ...(row.data || row), id: row.id || row.data?.id }));
    } catch {
      return [];
    }
  },
  getEvents: (): CollegeEvent[] => initialEvents,

  saveEvents: async (events: CollegeEvent[]): Promise<CollegeEvent[]> => {
    try {
      const dbRows = events.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        data: e,
        updated_at: new Date().toISOString()
      }));
      const { error } = await supabase.from('events').upsert(dbRows);
      if (error) console.warn('Supabase events save warning:', error.message);
    } catch (err) {
      console.warn('saveEvents exception:', err);
    }
    return await storageService.fetchEvents();
  },

  deleteEvent: async (id: string): Promise<CollegeEvent[]> => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) console.warn('Supabase deleteEvent error:', error.message);
    } catch (err) {
      console.warn('deleteEvent exception:', err);
    }
    return await storageService.fetchEvents();
  },

  // --- Faculty ---
  fetchFaculty: async (): Promise<FacultyMember[]> => {
    try {
      const { data, error } = await supabase.from('faculty').select('*');
      if (error || !data) return [];
      return data.map(row => ({ ...(row.data || row), id: row.id || row.data?.id }));
    } catch {
      return [];
    }
  },
  getFaculty: (): FacultyMember[] => initialFaculty,

  saveFaculty: async (faculty: FacultyMember[]): Promise<FacultyMember[]> => {
    try {
      const processed = await Promise.all(
        faculty.map(async f => {
          if (isInvalidOrPrivateUrl(f.image)) {
            const cloudUrl = await supabaseStorageService.uploadImage(f.image, 'faculty');
            if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
              return { ...f, image: cloudUrl };
            }
          }
          return f;
        })
      );

      const { error } = await supabase.from('faculty').upsert(processed.map(f => ({
        id: f.id,
        name: f.name,
        department: f.department,
        data: f,
        updated_at: new Date().toISOString()
      })));
      if (error) console.warn('Supabase faculty save warning:', error.message);
    } catch (err) {
      console.warn('saveFaculty exception:', err);
    }
    return await storageService.fetchFaculty();
  },

  deleteFaculty: async (id: string): Promise<FacultyMember[]> => {
    try {
      const { error } = await supabase.from('faculty').delete().eq('id', id);
      if (error) console.warn('Supabase deleteFaculty error:', error.message);
    } catch (err) {
      console.warn('deleteFaculty exception:', err);
    }
    return await storageService.fetchFaculty();
  },

  // --- Departments ---
  fetchDepartments: async (): Promise<DepartmentInfo[]> => {
    try {
      const { data, error } = await supabase.from('departments').select('*');
      if (error || !data) return [];
      return data.map(row => ({ ...(row.data || row), id: row.id || row.data?.id }));
    } catch {
      return [];
    }
  },
  getDepartments: (): DepartmentInfo[] => initialDepartments,

  saveDepartments: async (depts: DepartmentInfo[]): Promise<DepartmentInfo[]> => {
    try {
      const processed = await Promise.all(
        depts.map(async (d) => {
          if (isInvalidOrPrivateUrl(d.image)) {
            const cloudUrl = await supabaseStorageService.uploadImage(d.image, 'departments');
            if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
              return { ...d, image: cloudUrl };
            }
          }
          return d;
        })
      );

      const { error } = await supabase.from('departments').upsert(processed.map(d => ({
        id: d.id,
        name: d.name,
        data: d,
        updated_at: new Date().toISOString()
      })));
      if (error) console.warn('Supabase departments save warning:', error.message);
    } catch (err) {
      console.warn('saveDepartments exception:', err);
    }
    return await storageService.fetchDepartments();
  },

  deleteDepartment: async (id: string): Promise<DepartmentInfo[]> => {
    try {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) console.warn('Supabase deleteDepartment error:', error.message);
    } catch (err) {
      console.warn('deleteDepartment exception:', err);
    }
    return await storageService.fetchDepartments();
  },

  // --- Downloads ---
  fetchDownloads: async (): Promise<DownloadableDocument[]> => {
    try {
      const { data, error } = await supabase.from('downloads').select('*');
      if (error) {
        console.warn('Supabase downloads fetch warning (table may not exist in database yet):', error.message);
        return initialDownloads;
      }
      if (!data) return [];
      if (data.length === 0) return [];

      return data.map(row => {
        const d = row.data || {};
        const storagePath = row.storage_path || row.storagePath || d.storagePath || '';
        const fallbackUrl = row.file_url || row.fileUrl || d.fileUrl || '';
        const fileUrl = fallbackUrl || (storagePath ? supabaseStorageService.getWebsiteDocumentUrl(storagePath) : '');
        
        return {
          id: String(row.id || d.id || `dl-${Date.now()}`),
          title: row.title || d.title || 'Untitled Document',
          category: row.category || d.category || 'General',
          description: row.description || d.description || '',
          fileName: row.file_name || row.fileName || d.fileName || 'document.pdf',
          storagePath,
          fileSize: row.file_size || row.fileSize || d.fileSize || '1.0 MB',
          fileUrl,
          displayOrder: Number(row.display_order ?? row.displayOrder ?? d.displayOrder ?? 1),
          isActive: Boolean(row.is_active ?? row.isActive ?? d.isActive ?? true),
          createdAt: row.created_at || row.createdAt || d.createdAt || new Date().toISOString().split('T')[0],
          updatedAt: row.updated_at || row.updatedAt || d.updatedAt || new Date().toISOString().split('T')[0]
        };
      }).sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));
    } catch (err) {
      console.warn('fetchDownloads exception:', err);
      return initialDownloads;
    }
  },
  getDownloads: (): DownloadableDocument[] => initialDownloads,

  saveDownloads: async (downloads: DownloadableDocument[]): Promise<{ success: boolean; data?: DownloadableDocument[]; error?: string }> => {
    try {
      const recordsFull = downloads.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category || 'General',
        description: d.description || '',
        file_name: d.fileName || 'document.pdf',
        storage_path: d.storagePath || '',
        file_size: d.fileSize || '1.0 MB',
        file_url: d.fileUrl || '',
        display_order: Number(d.displayOrder) || 1,
        is_active: d.isActive !== false,
        created_at: d.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: d
      }));

      let { error } = await supabase.from('downloads').upsert(recordsFull);

      if (error) {
        console.warn('Primary downloads upsert error, trying compatibility fallback without file_url:', error.message);
        const recordsFallback = downloads.map(d => ({
          id: d.id,
          title: d.title,
          category: d.category || 'General',
          description: d.description || '',
          file_name: d.fileName || 'document.pdf',
          storage_path: d.storagePath || '',
          file_size: d.fileSize || '1.0 MB',
          display_order: Number(d.displayOrder) || 1,
          is_active: d.isActive !== false,
          created_at: d.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data: d
        }));
        const res2 = await supabase.from('downloads').upsert(recordsFallback);
        error = res2.error;
      }

      if (error) {
        console.warn('Secondary downloads upsert error, trying data-only fallback:', error.message);
        const recordsDataOnly = downloads.map(d => ({
          id: d.id,
          data: d
        }));
        const res3 = await supabase.from('downloads').upsert(recordsDataOnly);
        error = res3.error;
      }

      if (error) {
        console.error('saveDownloads ultimate failure:', error);
        return { success: false, error: `${error.message}` };
      }

      const refreshed = await storageService.fetchDownloads();
      return { success: true, data: refreshed };
    } catch (err: any) {
      console.error('saveDownloads exception:', err);
      return { success: false, error: err.message || 'Database transaction error' };
    }
  },

  deleteDownload: async (id: string): Promise<{ success: boolean; data?: DownloadableDocument[]; error?: string }> => {
    try {
      const current = await storageService.fetchDownloads();
      const target = current.find(d => d.id === id);
      if (target?.storagePath) {
        await supabaseStorageService.deleteWebsiteDocument(target.storagePath);
      }
      const { error } = await supabase.from('downloads').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteDownload error:', error.message);
        return { success: false, error: `Database Delete Failed: ${error.message}` };
      }
      const refreshed = await storageService.fetchDownloads();
      return { success: true, data: refreshed };
    } catch (err: any) {
      console.error('deleteDownload exception:', err);
      return { success: false, error: err.message || 'Failed to delete record from database' };
    }
  },

  // --- Facilities ---
  fetchFacilities: async (): Promise<Facility[]> => {
    try {
      const { data, error } = await supabase.from('facilities').select('*');
      if (error || !data || data.length === 0) return initialFacilities;
      
      const dbFacilities: Facility[] = data.map(row => {
        const d = row.data || {};
        const base: Facility = {
          ...(d || {}),
          id: row.id || d.id,
          title: row.title || d.title || 'Campus Facility',
          category: row.category || d.category || 'General',
          description: d.description || '',
          features: Array.isArray(d.features) ? d.features : [],
          image: d.image || row.image || '',
          photos: Array.isArray(d.photos) ? d.photos : []
        };

        // If photos is empty but image is present, construct initial photo item
        if ((!base.photos || base.photos.length === 0) && base.image) {
          base.photos = [
            {
              id: `p-${base.id}-1`,
              url: base.image,
              title: base.title,
              caption: base.description || base.title,
              displayOrder: 1,
              isActive: true
            }
          ];
        }

        return base;
      });

      // Merge with initialFacilities to ensure all 6 core categories exist if not yet seeded
      const existingIds = new Set(dbFacilities.map(f => f.id));
      const missingInitial = initialFacilities.filter(initF => !existingIds.has(initF.id));
      
      return [...dbFacilities, ...missingInitial];
    } catch (err) {
      console.warn('fetchFacilities exception:', err);
      return initialFacilities;
    }
  },
  getFacilities: (): Facility[] => initialFacilities,

  saveFacilities: async (facs: Facility[]): Promise<Facility[]> => {
    try {
      const processed: Facility[] = await Promise.all(
        facs.map(async f => {
          let updatedCover = f.image || '';
          if (isInvalidOrPrivateUrl(updatedCover)) {
            const cloudUrl = await supabaseStorageService.uploadImage(updatedCover, 'facilities');
            if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
              updatedCover = cloudUrl;
            }
          }

          let updatedPhotos = f.photos && f.photos.length > 0 
            ? await Promise.all(
                f.photos.map(async (p, idx) => {
                  let pUrl = p.url;
                  if (isInvalidOrPrivateUrl(pUrl)) {
                    const cloudUrl = await supabaseStorageService.uploadImage(pUrl, 'facilities');
                    if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
                      pUrl = cloudUrl;
                    }
                  }
                  return {
                    ...p,
                    id: p.id || `p-${f.id}-${idx + 1}-${Date.now()}`,
                    url: pUrl,
                    displayOrder: typeof p.displayOrder === 'number' ? p.displayOrder : (idx + 1),
                    isActive: p.isActive !== false
                  };
                })
              )
            : [];

          // Sort photos by displayOrder
          updatedPhotos.sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

          // Ensure cover image aligns with first active photo if empty or updated
          const firstActive = updatedPhotos.find(p => p.isActive !== false);
          if (firstActive && (!updatedCover || isInvalidOrPrivateUrl(updatedCover))) {
            updatedCover = firstActive.url;
          }

          return {
            ...f,
            image: updatedCover || (firstActive ? firstActive.url : ''),
            photos: updatedPhotos
          };
        })
      );

      const dbRows = processed.map(f => ({
        id: f.id,
        title: f.title,
        category: f.category,
        data: f,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('facilities').upsert(dbRows);
      if (error) console.warn('Supabase facilities save warning:', error.message);
    } catch (err) {
      console.warn('saveFacilities exception:', err);
    }
    return await storageService.fetchFacilities();
  },

  deleteFacility: async (id: string): Promise<Facility[]> => {
    try {
      const { error } = await supabase.from('facilities').delete().eq('id', id);
      if (error) console.warn('Supabase deleteFacility error:', error.message);
    } catch (err) {
      console.warn('deleteFacility exception:', err);
    }
    return await storageService.fetchFacilities();
  },

  // --- Admission Applications ---
  fetchApplications: async (): Promise<AdmissionApplication[]> => {
    try {
      const { data, error } = await supabase.from('admission_applications').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(row => ({ ...(row.data || row), id: row.id || row.data?.id }));
    } catch {
      return [];
    }
  },
  getApplications: (): AdmissionApplication[] => initialApplications,

  saveApplications: async (apps: AdmissionApplication[]): Promise<{ error?: string }> => {
    const sanitizedApps = apps.map(a => {
      const sanitizedAttachedFiles = (a.attachedFiles || []).map(f => ({
        id: f.id,
        docType: f.docType,
        title: f.title,
        fileName: f.fileName,
        fileSize: f.fileSize,
        storagePath: f.storagePath || '',
        uploadedAt: f.uploadedAt
      }));
      return {
        ...a,
        attachedFiles: sanitizedAttachedFiles
      };
    });

    try {
      const dbApps = sanitizedApps.map(a => ({
        id: a.id,
        full_name: a.fullName,
        email: a.email,
        mobile: a.mobile,
        status: a.status,
        data: a,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('admission_applications').upsert(dbApps);
      if (error) {
        return { error: `[DB ${error.code || 'Error'}]: ${error.message}` };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to save application to database' };
    }
  },

  addApplication: async (app: AdmissionApplication): Promise<{ error?: string }> => {
    const sanitizedAttachedFiles = (app.attachedFiles || []).map(f => ({
      id: f.id,
      docType: f.docType,
      title: f.title,
      fileName: f.fileName,
      fileSize: f.fileSize,
      storagePath: f.storagePath || '',
      uploadedAt: f.uploadedAt
    }));

    const sanitizedApp: AdmissionApplication = {
      ...app,
      attachedFiles: sanitizedAttachedFiles
    };

    const dbRecord = {
      id: sanitizedApp.id,
      full_name: sanitizedApp.fullName,
      email: sanitizedApp.email,
      mobile: sanitizedApp.mobile,
      status: sanitizedApp.status,
      data: sanitizedApp,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('admission_applications').insert([dbRecord]);
      if (error) {
        return { error: `[DB ${error.code || 'Error'}]: ${error.message}` };
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to save application record into database' };
    }
  },

  updateApplicationStatus: async (id: string, status: AdmissionApplication['status'], remarks?: string, updatedBy = 'Admin'): Promise<void> => {
    try {
      const apps = await storageService.fetchApplications();
      const target = apps.find(a => a.id === id);
      if (target) {
        const history = target.statusHistory || [];
        const newHistoryItem = {
          status,
          remarks: remarks !== undefined ? remarks : target.remarks,
          updatedAt: new Date().toISOString(),
          updatedBy
        };
        const updatedApp = {
          ...target,
          status,
          remarks: remarks !== undefined ? remarks : target.remarks,
          statusHistory: [newHistoryItem, ...history]
        };
        await storageService.saveApplications([updatedApp]);
      }
    } catch (err) {
      console.warn('updateApplicationStatus exception:', err);
    }
  },

  deleteApplication: async (id: string): Promise<void> => {
    try {
      const apps = await storageService.fetchApplications();
      const target = apps.find(a => a.id === id);
      if (target) {
        await supabaseStorageService.deleteCandidateDocuments(target);
      }
      await supabase.from('admission_applications').delete().eq('id', id);
    } catch (e) {
      console.warn('deleteApplication warning:', e);
    }
  },

  resetAdmissionsData: async (): Promise<void> => {
    await supabaseStorageService.deleteAllStorageFiles();
    try {
      await supabase.from('admission_applications').delete().neq('id', 'EMPTY_DUMMY_KEY');
    } catch (e) {
      console.warn('Supabase DB clear warning:', e);
    }
  },

  // --- Gallery ---
  fetchGallery: async (): Promise<GalleryItem[]> => {
    try {
      const { data, error } = await supabase.from('gallery').select('*');
      if (error || !data) return [];
      return data.map(row => ({ ...(row.data || row), id: row.id || row.data?.id }));
    } catch {
      return [];
    }
  },
  getGallery: (): GalleryItem[] => initialGallery,

  saveGallery: async (items: GalleryItem[]): Promise<GalleryItem[]> => {
    try {
      const processed = await Promise.all(
        items.map(async item => {
          if (isInvalidOrPrivateUrl(item.image)) {
            const cloudUrl = await supabaseStorageService.uploadImage(item.image, 'gallery');
            if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
              return { ...item, image: cloudUrl };
            }
          }
          return item;
        })
      );

      const { error } = await supabase.from('gallery').upsert(processed.map(g => ({
        id: g.id,
        title: g.title,
        category: g.category,
        data: g,
        updated_at: new Date().toISOString()
      })));
      if (error) console.warn('Supabase gallery save warning:', error.message);
    } catch (err) {
      console.warn('saveGallery exception:', err);
    }
    return await storageService.fetchGallery();
  },

  deleteGalleryItem: async (id: string): Promise<GalleryItem[]> => {
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) console.warn('Supabase deleteGalleryItem error:', error.message);
    } catch (err) {
      console.warn('deleteGalleryItem exception:', err);
    }
    return await storageService.fetchGallery();
  },

  // --- Popup Banner ---
  fetchPopupBanner: async (): Promise<PopupBanner> => {
    try {
      const { data, error } = await supabase.from('popup_banners').select('*').limit(1);
      if (error || !data || data.length === 0) return initialPopupBanner;
      const row = data[0];
      const d = (row.data && typeof row.data === 'object') ? row.data : {};
      return {
        id: row.id || d.id || 'banner-default',
        isActive: row.is_active !== undefined && row.is_active !== null ? Boolean(row.is_active) : (d.isActive ?? false),
        title: row.title || d.title || '',
        description: row.description || d.description || '',
        imageUrl: row.image_url || d.imageUrl || '',
        buttonText: row.button_text || d.buttonText || '',
        buttonUrl: row.button_url || d.buttonUrl || '',
        displayFrequency: row.display_frequency || d.displayFrequency || 'once_per_session',
        startDate: row.start_date || d.startDate || '',
        endDate: row.end_date || d.endDate || '',
        createdAt: row.created_at || d.createdAt || new Date().toISOString(),
        updatedAt: row.updated_at || d.updatedAt || new Date().toISOString()
      };
    } catch {
      return initialPopupBanner;
    }
  },
  getPopupBanner: (): PopupBanner => initialPopupBanner,

  savePopupBanner: async (banner: PopupBanner): Promise<PopupBanner> => {
    const updatedBanner = {
      ...banner,
      updatedAt: new Date().toISOString()
    };

    let processedBanner = { ...updatedBanner };
    try {
      if (isInvalidOrPrivateUrl(processedBanner.imageUrl)) {
        const cloudUrl = await supabaseStorageService.uploadImage(processedBanner.imageUrl, 'banners');
        if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
          processedBanner.imageUrl = cloudUrl;
        }
      }

      let targetId = processedBanner.id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
      if (!isUuid) {
        const { data: existingRows } = await supabase.from('popup_banners').select('id').limit(1);
        if (existingRows && existingRows.length > 0 && existingRows[0].id) {
          targetId = existingRows[0].id;
          processedBanner.id = targetId;
        }
      }

      const recordToUpsert: any = {
        is_active: Boolean(processedBanner.isActive),
        title: processedBanner.title || '',
        description: processedBanner.description || '',
        image_url: processedBanner.imageUrl || '',
        button_text: processedBanner.buttonText || '',
        button_url: processedBanner.buttonUrl || '',
        display_frequency: processedBanner.displayFrequency || 'once_per_session',
        start_date: processedBanner.startDate ? processedBanner.startDate : null,
        end_date: processedBanner.endDate ? processedBanner.endDate : null,
        created_at: processedBanner.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: processedBanner
      };

      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) {
        recordToUpsert.id = targetId;
      }

      const { error } = await supabase.from('popup_banners').upsert([recordToUpsert]);
      if (error) console.warn('Supabase popup_banners save warning:', error.message);
    } catch (err) {
      console.warn('savePopupBanner exception:', err);
    }

    return await storageService.fetchPopupBanner();
  },

  deletePopupBanner: async (): Promise<PopupBanner> => {
    try {
      const { data: existingRows } = await supabase.from('popup_banners').select('id').limit(1);
      if (existingRows && existingRows.length > 0 && existingRows[0].id) {
        await supabase.from('popup_banners').update({
          is_active: false,
          title: '',
          description: '',
          image_url: '',
          button_text: '',
          button_url: '',
          start_date: null,
          end_date: null,
          updated_at: new Date().toISOString(),
          data: { ...initialPopupBanner, isActive: false }
        }).eq('id', existingRows[0].id);
      }
    } catch (err) {
      console.warn('deletePopupBanner exception:', err);
    }
    return await storageService.fetchPopupBanner();
  },

  // --- Fetch All Data directly from Supabase ---
  fetchAllFromSupabase: async () => {
    cleanObsoleteLocalStorage();

    const [
      collegeInfo,
      notices,
      events,
      faculty,
      departments,
      facilities,
      gallery,
      downloads,
      popupBanner,
      applications
    ] = await Promise.all([
      storageService.fetchCollegeInfo(),
      storageService.fetchNotices(),
      storageService.fetchEvents(),
      storageService.fetchFaculty(),
      storageService.fetchDepartments(),
      storageService.fetchFacilities(),
      storageService.fetchGallery(),
      storageService.fetchDownloads(),
      storageService.fetchPopupBanner(),
      storageService.fetchApplications()
    ]);

    return {
      collegeInfo,
      notices,
      events,
      faculty,
      departments,
      facilities,
      gallery,
      downloads,
      popupBanner,
      applications
    };
  },

  syncFromSupabase: async (): Promise<boolean> => {
    await storageService.fetchAllFromSupabase();
    return true;
  },

  resetAllToDefaults: (): void => {
    // Reset local migration marker if needed
    localStorage.removeItem(MIGRATION_KEY);
  }
};
