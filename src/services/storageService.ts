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
      if (error || !data || data.length === 0) return initialAdminUsers;
      return data.map(row => ({ ...(row.data || row), id: row.id || row.data?.id }));
    } catch {
      return initialAdminUsers;
    }
  },

  getAdminUsers: (): AdminUser[] => initialAdminUsers,

  saveAdminUsers: async (users: AdminUser[]): Promise<AdminUser[]> => {
    try {
      await supabase.from('admin_users').upsert(users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        data: u
      })));
    } catch (err) {
      console.warn('saveAdminUsers error:', err);
    }
    return await storageService.fetchAdminUsers();
  },

  addAdminUser: async (user: AdminUser): Promise<AdminUser[]> => {
    const current = await storageService.fetchAdminUsers();
    const updated = [...current, user];
    return await storageService.saveAdminUsers(updated);
  },

  updateAdminPassword: async (identifier: string, newPassword: string): Promise<boolean> => {
    const users = await storageService.fetchAdminUsers();
    const query = identifier.trim().toLowerCase();
    let updated = false;
    const newUsers = users.map(u => {
      if (u.username.toLowerCase() === query || u.email.toLowerCase() === query || u.mobile === identifier.trim()) {
        updated = true;
        return { ...u, password: newPassword };
      }
      return u;
    });
    if (updated) {
      await storageService.saveAdminUsers(newUsers);
    }
    return updated;
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
        loadedInfo.presidentInstitution = initialCollegeInfo.presidentInstitution;
        loadedInfo.presidentMessage = initialCollegeInfo.presidentMessage;
        loadedInfo.presidentImage = initialCollegeInfo.presidentImage;
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
      const { error } = await supabase.from('departments').upsert(depts.map(d => ({
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
      if (error || !data) return [];
      return data.map(row => ({ ...(row.data || row), id: row.id || row.data?.id }));
    } catch {
      return [];
    }
  },
  getDownloads: (): DownloadableDocument[] => initialDownloads,

  saveDownloads: async (downloads: DownloadableDocument[]): Promise<DownloadableDocument[]> => {
    try {
      const { error } = await supabase.from('downloads').upsert(downloads.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        description: d.description || '',
        file_name: d.fileName,
        storage_path: d.storagePath || '',
        file_size: d.fileSize,
        display_order: d.displayOrder,
        is_active: d.isActive,
        created_at: d.createdAt,
        updated_at: new Date().toISOString(),
        data: d
      })));
      if (error) console.warn('Supabase downloads save warning:', error.message);
    } catch (err) {
      console.warn('saveDownloads exception:', err);
    }
    return await storageService.fetchDownloads();
  },

  deleteDownload: async (id: string): Promise<DownloadableDocument[]> => {
    try {
      const current = await storageService.fetchDownloads();
      const target = current.find(d => d.id === id);
      if (target?.storagePath) {
        await supabaseStorageService.deleteWebsiteDocument(target.storagePath);
      }
      const { error } = await supabase.from('downloads').delete().eq('id', id);
      if (error) console.warn('Supabase deleteDownload error:', error.message);
    } catch (err) {
      console.warn('deleteDownload exception:', err);
    }
    return await storageService.fetchDownloads();
  },

  // --- Facilities ---
  fetchFacilities: async (): Promise<Facility[]> => {
    try {
      const { data, error } = await supabase.from('facilities').select('*');
      if (error || !data) return [];
      return data.map(row => ({ ...(row.data || row), id: row.id || row.data?.id }));
    } catch {
      return [];
    }
  },
  getFacilities: (): Facility[] => initialFacilities,

  saveFacilities: async (facs: Facility[]): Promise<Facility[]> => {
    try {
      const processed = await Promise.all(
        facs.map(async f => {
          if (isInvalidOrPrivateUrl(f.image)) {
            const cloudUrl = await supabaseStorageService.uploadImage(f.image, 'facilities');
            if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
              return { ...f, image: cloudUrl };
            }
          }
          return f;
        })
      );

      const { error } = await supabase.from('facilities').upsert(processed.map(f => ({
        id: f.id,
        title: f.title,
        category: f.category,
        data: f,
        updated_at: new Date().toISOString()
      })));
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
