import { CollegeInfo, DepartmentInfo, Facility, FacultyMember, Notice, AdmissionApplication, GalleryItem, CollegeEvent, AdminUser, DownloadableDocument, PopupBanner } from '../types';
import { initialCollegeInfo, initialDepartments, initialFacilities, initialFaculty, initialNotices, initialApplications, initialGallery, initialEvents, initialAdminUsers, initialDownloads, initialPopupBanner } from '../data/initialData';
import { supabase } from '../supabaseClient';
import { supabaseStorageService } from './supabaseStorageService';

const KEYS = {
  COLLEGE_INFO: 'lsscdt_college_info_v2',
  NOTICES: 'lsscdt_notices_v2',
  EVENTS: 'lsscdt_events_v2',
  FACULTY: 'lsscdt_faculty_v2',
  DEPARTMENTS: 'lsscdt_departments_v2',
  FACILITIES: 'lsscdt_facilities_v2',
  APPLICATIONS: 'lsscdt_applications_v2',
  GALLERY: 'lsscdt_gallery_v2',
  ADMIN_USERS: 'lsscdt_admin_users_v2',
  DOWNLOADS: 'lsscdt_downloads_v2',
  POPUP_BANNER: 'lsscdt_popup_banner_v2'
};

const isInvalidOrPrivateUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  return url.startsWith('data:') || url.startsWith('blob:') || url.includes('/storage/v1/object/public/admissions/');
};

export const storageService = {
  getAdminUsers: (): AdminUser[] => {
    const data = localStorage.getItem(KEYS.ADMIN_USERS);
    if (!data) {
      localStorage.setItem(KEYS.ADMIN_USERS, JSON.stringify(initialAdminUsers));
      return initialAdminUsers;
    }
    return JSON.parse(data);
  },

  saveAdminUsers: (users: AdminUser[]): void => {
    localStorage.setItem(KEYS.ADMIN_USERS, JSON.stringify(users));
    (async () => {
      try {
        const { error } = await supabase.from('admin_users').upsert(users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          data: u
        })));
        if (error) console.log('Supabase admin_users sync:', error.message);
      } catch (err) {
        // silent fallback
      }
    })();
  },

  addAdminUser: (user: AdminUser): void => {
    const users = storageService.getAdminUsers();
    const updated = [...users, user];
    storageService.saveAdminUsers(updated);
  },

  updateAdminPassword: (identifier: string, newPassword: string): boolean => {
    const users = storageService.getAdminUsers();
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
      storageService.saveAdminUsers(newUsers);
    }
    return updated;
  },

  getCollegeInfo: (): CollegeInfo => {
    const data = localStorage.getItem(KEYS.COLLEGE_INFO);
    if (!data) return initialCollegeInfo;
    try {
      const parsed: CollegeInfo = JSON.parse(data);
      if (
        !parsed.affiliation?.includes('मपाविवि') || 
        !parsed.approval?.includes('DAHD') || 
        !parsed.trustName || 
        !parsed.trustName.includes('Registration No')
      ) {
        const updated = {
          ...parsed,
          affiliation: initialCollegeInfo.affiliation,
          approval: initialCollegeInfo.approval,
          trustName: initialCollegeInfo.trustName
        };
        localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(updated));
        return updated;
      }
      return parsed;
    } catch {
      return initialCollegeInfo;
    }
  },
  saveCollegeInfo: async (info: CollegeInfo): Promise<CollegeInfo> => {
    localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(info));
    try {
      let updatedInfo = { ...info };

      if (isInvalidOrPrivateUrl(updatedInfo.logoImage)) {
        const cloudUrl = await supabaseStorageService.uploadImage(updatedInfo.logoImage!, 'college');
        if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) updatedInfo.logoImage = cloudUrl;
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

      localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(updatedInfo));

      const { error } = await supabase.from('college_info').upsert([{ id: 'default', data: updatedInfo }]);
      if (error) console.warn('Supabase college_info sync:', error.message);
      return updatedInfo;
    } catch (err) {
      console.warn('saveCollegeInfo error:', err);
      return info;
    }
  },

  getNotices: (): Notice[] => {
    const data = localStorage.getItem(KEYS.NOTICES);
    return data ? JSON.parse(data) : initialNotices;
  },
  saveNotices: (notices: Notice[]): void => {
    localStorage.setItem(KEYS.NOTICES, JSON.stringify(notices));
    (async () => {
      try {
        const { error } = await supabase.from('notices').upsert(notices.map(n => ({
          id: n.id,
          title: n.title,
          category: n.category,
          date: n.date,
          data: n
        })));
        if (error) console.log('Supabase notices sync:', error.message);
      } catch (err) {}
    })();
  },
  deleteNotice: (id: string): void => {
    const notices = storageService.getNotices();
    const target = notices.find(n => n.id === id);
    const filtered = notices.filter(n => n.id !== id);
    localStorage.setItem(KEYS.NOTICES, JSON.stringify(filtered));

    if (target?.attachment?.storagePath) {
      supabaseStorageService.deleteWebsiteDocument(target.attachment.storagePath);
    }

    (async () => {
      try {
        await supabase.from('notices').delete().eq('id', id);
      } catch (err) {}
    })();
  },

  getEvents: (): CollegeEvent[] => {
    const data = localStorage.getItem(KEYS.EVENTS);
    return data ? JSON.parse(data) : initialEvents;
  },
  saveEvents: (events: CollegeEvent[]): void => {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
    (async () => {
      try {
        const { error } = await supabase.from('events').upsert(events.map(e => ({
          id: e.id,
          title: e.title,
          date: e.date,
          data: e
        })));
        if (error) console.log('Supabase events sync:', error.message);
      } catch (err) {}
    })();
  },

  getFaculty: (): FacultyMember[] => {
    const data = localStorage.getItem(KEYS.FACULTY);
    if (!data) return initialFaculty;
    try {
      const parsed: FacultyMember[] = JSON.parse(data);
      // Ensure initial HOD flags exist if missing
      return parsed.map(f => {
        const match = initialFaculty.find(i => i.id === f.id);
        if (match && f.isHOD === undefined) {
          return { ...f, isHOD: match.isHOD };
        }
        return f;
      });
    } catch {
      return initialFaculty;
    }
  },
  saveFaculty: async (faculty: FacultyMember[]): Promise<FacultyMember[]> => {
    localStorage.setItem(KEYS.FACULTY, JSON.stringify(faculty));
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
      localStorage.setItem(KEYS.FACULTY, JSON.stringify(processed));

      const { error } = await supabase.from('faculty').upsert(processed.map(f => ({
        id: f.id,
        name: f.name,
        department: f.department,
        data: f
      })));
      if (error) console.warn('Supabase faculty sync:', error.message);
      return processed;
    } catch (err) {
      return faculty;
    }
  },

  getDepartments: (): DepartmentInfo[] => {
    const data = localStorage.getItem(KEYS.DEPARTMENTS);
    if (!data) {
      localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(initialDepartments));
      return initialDepartments;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialDepartments;
    }
  },
  saveDepartments: (depts: DepartmentInfo[]): void => {
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(depts));
    (async () => {
      try {
        const { error } = await supabase.from('departments').upsert(depts.map(d => ({
          id: d.id,
          name: d.name,
          data: d
        })));
        if (error) console.log('Supabase departments sync:', error.message);
      } catch (err) {}
    })();
  },
  deleteDepartment: (id: string): void => {
    const depts = storageService.getDepartments();
    const filtered = depts.filter(d => d.id !== id);
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(filtered));
    (async () => {
      try {
        await supabase.from('departments').delete().eq('id', id);
      } catch (err) {}
    })();
  },

  getDownloads: (): DownloadableDocument[] => {
    const data = localStorage.getItem(KEYS.DOWNLOADS);
    if (!data) {
      localStorage.setItem(KEYS.DOWNLOADS, JSON.stringify(initialDownloads));
      return initialDownloads;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialDownloads;
    }
  },
  saveDownloads: (downloads: DownloadableDocument[]): void => {
    localStorage.setItem(KEYS.DOWNLOADS, JSON.stringify(downloads));
    (async () => {
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
          updated_at: d.updatedAt || new Date().toISOString(),
          data: d
        })));
        if (error) console.log('Supabase downloads sync:', error.message);
      } catch (err) {}
    })();
  },
  deleteDownload: (id: string): void => {
    const downloads = storageService.getDownloads();
    const target = downloads.find(d => d.id === id);
    const filtered = downloads.filter(d => d.id !== id);
    localStorage.setItem(KEYS.DOWNLOADS, JSON.stringify(filtered));

    if (target?.storagePath) {
      supabaseStorageService.deleteWebsiteDocument(target.storagePath);
    }

    (async () => {
      try {
        await supabase.from('downloads').delete().eq('id', id);
      } catch (err) {}
    })();
  },

  getFacilities: (): Facility[] => {
    const data = localStorage.getItem(KEYS.FACILITIES);
    if (!data) return initialFacilities;
    try {
      const parsed: Facility[] = JSON.parse(data);
      const existingIds = new Set(parsed.map(f => f.id));
      const missing = initialFacilities.filter(f => !existingIds.has(f.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        localStorage.setItem(KEYS.FACILITIES, JSON.stringify(merged));
        return merged;
      }
      // Also update any title changes like 500 LPD plant
      const updated = parsed.map(f => {
        const match = initialFacilities.find(i => i.id === f.id);
        if (match && (f.title.includes('50,000') || f.title.includes('15+ Advanced'))) {
          return { ...f, title: match.title, description: match.description, features: match.features };
        }
        return f;
      });
      return updated;
    } catch {
      return initialFacilities;
    }
  },
  saveFacilities: async (facs: Facility[]): Promise<Facility[]> => {
    localStorage.setItem(KEYS.FACILITIES, JSON.stringify(facs));
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
      localStorage.setItem(KEYS.FACILITIES, JSON.stringify(processed));

      const { error } = await supabase.from('facilities').upsert(processed.map(f => ({
        id: f.id,
        title: f.title,
        category: f.category,
        data: f
      })));
      if (error) console.warn('Supabase facilities sync:', error.message);
      return processed;
    } catch (err) {
      return facs;
    }
  },

  getApplications: (): AdmissionApplication[] => {
    const data = localStorage.getItem(KEYS.APPLICATIONS);
    return data ? JSON.parse(data) : initialApplications;
  },
  saveApplications: async (apps: AdmissionApplication[]): Promise<{ error?: string }> => {
    // Sanitize attachedFiles to remove Base64 dataUrl before local or DB storage
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

    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(sanitizedApps));

    try {
      const dbApps = sanitizedApps.map(a => ({
        id: a.id,
        full_name: a.fullName,
        email: a.email,
        mobile: a.mobile,
        status: a.status,
        data: a
      }));

      const { error } = await supabase.from('admission_applications').upsert(dbApps);
      if (error) {
        console.error('Supabase applications DB upsert error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        const errStr = `[DB ${error.code || 'Error'}]: ${error.message}${error.details ? ` (${error.details})` : ''}${error.hint ? ` - Hint: ${error.hint}` : ''}`;
        return { error: errStr };
      }
      return {};
    } catch (err: any) {
      console.error('Database applications save exception:', err);
      return { error: err.message || 'Failed to save application to database' };
    }
  },
  addApplication: async (app: AdmissionApplication): Promise<{ error?: string }> => {
    // Sanitize attachedFiles for database storage
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
      data: sanitizedApp
    };

    try {
      // Use INSERT for new candidate application submission
      const { error } = await supabase
        .from('admission_applications')
        .insert([dbRecord]);

      if (error) {
        console.error('Supabase application INSERT error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        const fullErr = `[DB ${error.code || 'Error'}]: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (Hint: ${error.hint})` : ''}`;
        return { error: fullErr };
      }

      // Sync to localStorage only after DB insert succeeds
      const apps = storageService.getApplications();
      const updated = [sanitizedApp, ...apps];
      localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(updated));

      return {};
    } catch (err: any) {
      console.error('Database application insert exception:', err);
      return { error: err.message || 'Failed to save application record into database' };
    }
  },
  updateApplicationStatus: (id: string, status: AdmissionApplication['status'], remarks?: string, updatedBy = 'Admin'): void => {
    const apps = storageService.getApplications();
    const updated = apps.map(a => {
      if (a.id === id) {
        const history = a.statusHistory || [];
        const newHistoryItem = {
          status,
          remarks: remarks !== undefined ? remarks : a.remarks,
          updatedAt: new Date().toISOString(),
          updatedBy
        };
        return {
          ...a,
          status,
          remarks: remarks !== undefined ? remarks : a.remarks,
          statusHistory: [newHistoryItem, ...history]
        };
      }
      return a;
    });
    storageService.saveApplications(updated);
  },
  deleteApplication: async (id: string): Promise<void> => {
    const apps = storageService.getApplications();
    const target = apps.find(a => a.id === id);
    if (target) {
      // 1. Remove documents from Supabase Storage bucket
      await supabaseStorageService.deleteCandidateDocuments(target);
    }
    
    // 2. Remove row from Supabase Database
    try {
      await supabase.from('admission_applications').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase DB delete warning:', e);
    }

    // 3. Remove from local state
    const updated = apps.filter(a => a.id !== id);
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(updated));
  },
  resetAdmissionsData: async (): Promise<void> => {
    // 1. Delete all storage files in Supabase bucket
    await supabaseStorageService.deleteAllStorageFiles();

    // 2. Delete all records from Supabase admission_applications table
    try {
      await supabase.from('admission_applications').delete().neq('id', 'EMPTY_DUMMY_KEY');
    } catch (e) {
      console.warn('Supabase DB clear warning:', e);
    }

    // 3. Clear local applications
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify([]));
  },

  getGallery: (): GalleryItem[] => {
    const data = localStorage.getItem(KEYS.GALLERY);
    return data ? JSON.parse(data) : initialGallery;
  },
  saveGallery: async (items: GalleryItem[]): Promise<GalleryItem[]> => {
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(items));
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
      localStorage.setItem(KEYS.GALLERY, JSON.stringify(processed));

      const { error } = await supabase.from('gallery').upsert(processed.map(g => ({
        id: g.id,
        title: g.title,
        category: g.category,
        data: g
      })));
      if (error) console.warn('Supabase gallery sync:', error.message);
      return processed;
    } catch (err) {
      return items;
    }
  },

  getPopupBanner: (): PopupBanner => {
    const data = localStorage.getItem(KEYS.POPUP_BANNER);
    if (!data) {
      localStorage.setItem(KEYS.POPUP_BANNER, JSON.stringify(initialPopupBanner));
      return initialPopupBanner;
    }
    try {
      return JSON.parse(data);
    } catch {
      return initialPopupBanner;
    }
  },
  savePopupBanner: async (banner: PopupBanner): Promise<PopupBanner> => {
    const updatedBanner = {
      ...banner,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(KEYS.POPUP_BANNER, JSON.stringify(updatedBanner));

    let processedBanner = { ...updatedBanner };
    try {
      if (isInvalidOrPrivateUrl(processedBanner.imageUrl)) {
        const cloudUrl = await supabaseStorageService.uploadImage(processedBanner.imageUrl, 'banners');
        if (cloudUrl && !isInvalidOrPrivateUrl(cloudUrl)) {
          processedBanner.imageUrl = cloudUrl;
        }
      }
      localStorage.setItem(KEYS.POPUP_BANNER, JSON.stringify(processedBanner));

      // Check if ID is a valid UUID or find an existing row in Supabase
      let targetId = processedBanner.id;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
      if (!isUuid) {
        const { data: existingRows } = await supabase.from('popup_banners').select('id').limit(1);
        if (existingRows && existingRows.length > 0 && existingRows[0].id) {
          targetId = existingRows[0].id;
          processedBanner.id = targetId;
          localStorage.setItem(KEYS.POPUP_BANNER, JSON.stringify(processedBanner));
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

      const { data: savedRows, error } = await supabase
        .from('popup_banners')
        .upsert([recordToUpsert])
        .select();

      if (error) {
        console.warn('Supabase popup_banners sync warning:', error.message);
      } else if (savedRows && savedRows.length > 0) {
        const row = savedRows[0];
        const d = (row.data && typeof row.data === 'object') ? row.data : {};
        const savedPopup: PopupBanner = {
          id: row.id || d.id || processedBanner.id,
          isActive: Boolean(row.is_active),
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
        localStorage.setItem(KEYS.POPUP_BANNER, JSON.stringify(savedPopup));
        return savedPopup;
      }
    } catch (err) {
      console.warn('savePopupBanner error:', err);
    }

    return processedBanner;
  },
  deletePopupBanner: async (): Promise<void> => {
    const defaultOff: PopupBanner = {
      ...initialPopupBanner,
      isActive: false,
      title: '',
      description: '',
      imageUrl: '',
      buttonText: '',
      buttonUrl: '',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(KEYS.POPUP_BANNER, JSON.stringify(defaultOff));
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
          data: defaultOff
        }).eq('id', existingRows[0].id);
      }
    } catch (err) {}
  },

  // Fetch and hydrate state from Supabase
  syncFromSupabase: async (): Promise<boolean> => {
    try {
      const [
        appsRes,
        noticesRes,
        eventsRes,
        facultyRes,
        deptsRes,
        facsRes,
        galleryRes,
        infoRes,
        adminRes,
        downloadsRes,
        popupRes
      ] = await Promise.allSettled([
        supabase.from('admission_applications').select('*'),
        supabase.from('notices').select('*'),
        supabase.from('events').select('*'),
        supabase.from('faculty').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('facilities').select('*'),
        supabase.from('gallery').select('*'),
        supabase.from('college_info').select('*'),
        supabase.from('admin_users').select('*'),
        supabase.from('downloads').select('*'),
        supabase.from('popup_banners').select('*')
      ]);

      if (appsRes.status === 'fulfilled' && appsRes.value.data && appsRes.value.data.length > 0) {
        const loadedApps = appsRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(loadedApps));
      }
      if (noticesRes.status === 'fulfilled' && noticesRes.value.data && noticesRes.value.data.length > 0) {
        const loadedNotices = noticesRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.NOTICES, JSON.stringify(loadedNotices));
      }
      if (eventsRes.status === 'fulfilled' && eventsRes.value.data && eventsRes.value.data.length > 0) {
        const loadedEvents = eventsRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.EVENTS, JSON.stringify(loadedEvents));
      }
      if (facultyRes.status === 'fulfilled' && facultyRes.value.data && facultyRes.value.data.length > 0) {
        const loadedFaculty = facultyRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.FACULTY, JSON.stringify(loadedFaculty));
      }
      if (deptsRes.status === 'fulfilled' && deptsRes.value.data && deptsRes.value.data.length > 0) {
        const loadedDepts = deptsRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(loadedDepts));
      }
      if (facsRes.status === 'fulfilled' && facsRes.value.data && facsRes.value.data.length > 0) {
        const loadedFacs = facsRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.FACILITIES, JSON.stringify(loadedFacs));
      }
      if (galleryRes.status === 'fulfilled' && galleryRes.value.data && galleryRes.value.data.length > 0) {
        const loadedGallery = galleryRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.GALLERY, JSON.stringify(loadedGallery));
      }
      if (infoRes.status === 'fulfilled' && infoRes.value.data && infoRes.value.data.length > 0) {
        const row = infoRes.value.data[0];
        const loadedInfo = { ...(row.data || row) };
        if (!loadedInfo.trustName || !loadedInfo.trustName.includes('Registration No')) {
          loadedInfo.trustName = initialCollegeInfo.trustName;
        }
        localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(loadedInfo));
      }
      if (adminRes.status === 'fulfilled' && adminRes.value.data && adminRes.value.data.length > 0) {
        const loadedAdmins = adminRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.ADMIN_USERS, JSON.stringify(loadedAdmins));
      }
      if (downloadsRes.status === 'fulfilled' && downloadsRes.value.data && downloadsRes.value.data.length > 0) {
        const loadedDownloads = downloadsRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.DOWNLOADS, JSON.stringify(loadedDownloads));
      }
      if (popupRes.status === 'fulfilled' && popupRes.value.data && popupRes.value.data.length > 0) {
        const rows = popupRes.value.data;
        const sortedRows = [...rows].sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
        const activeRow = sortedRows[0];
        const d = (activeRow.data && typeof activeRow.data === 'object' && Object.keys(activeRow.data).length > 0) ? activeRow.data : {};
        
        const loadedPopup: PopupBanner = {
          id: activeRow.id || d.id || 'banner-default',
          isActive: activeRow.is_active !== undefined && activeRow.is_active !== null ? Boolean(activeRow.is_active) : (d.isActive ?? false),
          title: activeRow.title || d.title || '',
          description: activeRow.description || d.description || '',
          imageUrl: activeRow.image_url || d.imageUrl || '',
          buttonText: activeRow.button_text || d.buttonText || '',
          buttonUrl: activeRow.button_url || d.buttonUrl || '',
          displayFrequency: activeRow.display_frequency || d.displayFrequency || 'once_per_session',
          startDate: activeRow.start_date || d.startDate || '',
          endDate: activeRow.end_date || d.endDate || '',
          createdAt: activeRow.created_at || d.createdAt || new Date().toISOString(),
          updatedAt: activeRow.updated_at || d.updatedAt || new Date().toISOString()
        };
        localStorage.setItem(KEYS.POPUP_BANNER, JSON.stringify(loadedPopup));
      }

      return true;
    } catch (err) {
      console.log('Supabase sync initial load:', err);
      return false;
    }
  },

  resetAllToDefaults: (): void => {
    localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(initialCollegeInfo));
    localStorage.setItem(KEYS.NOTICES, JSON.stringify(initialNotices));
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(initialEvents));
    localStorage.setItem(KEYS.FACULTY, JSON.stringify(initialFaculty));
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(initialDepartments));
    localStorage.setItem(KEYS.FACILITIES, JSON.stringify(initialFacilities));
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(initialApplications));
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(initialGallery));
    localStorage.setItem(KEYS.ADMIN_USERS, JSON.stringify(initialAdminUsers));
    localStorage.setItem(KEYS.POPUP_BANNER, JSON.stringify(initialPopupBanner));
  }
};

