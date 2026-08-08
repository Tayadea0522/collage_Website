import { CollegeInfo, DepartmentInfo, Facility, FacultyMember, Notice, AdmissionApplication, GalleryItem, CollegeEvent, AdminUser } from '../types';
import { initialCollegeInfo, initialDepartments, initialFacilities, initialFaculty, initialNotices, initialApplications, initialGallery, initialEvents, initialAdminUsers } from '../data/initialData';
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
  ADMIN_USERS: 'lsscdt_admin_users_v2'
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
      if (!parsed.affiliation?.includes('मपाविवि') || !parsed.approval?.includes('DAHD')) {
        const updated = {
          ...parsed,
          affiliation: initialCollegeInfo.affiliation,
          approval: initialCollegeInfo.approval,
          trustName: parsed.trustName || initialCollegeInfo.trustName
        };
        localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(updated));
        return updated;
      }
      return parsed;
    } catch {
      return initialCollegeInfo;
    }
  },
  saveCollegeInfo: (info: CollegeInfo): void => {
    localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(info));
    (async () => {
      try {
        let updatedInfo = { ...info };

        if (updatedInfo.logoImage?.startsWith('data:')) {
          updatedInfo.logoImage = await supabaseStorageService.uploadImage(updatedInfo.logoImage, 'college');
        }
        if (updatedInfo.shaktikumarImage?.startsWith('data:')) {
          updatedInfo.shaktikumarImage = await supabaseStorageService.uploadImage(updatedInfo.shaktikumarImage, 'college');
        }
        if (updatedInfo.deanImage?.startsWith('data:')) {
          updatedInfo.deanImage = await supabaseStorageService.uploadImage(updatedInfo.deanImage, 'college');
        }
        if (updatedInfo.secretaryImage?.startsWith('data:')) {
          updatedInfo.secretaryImage = await supabaseStorageService.uploadImage(updatedInfo.secretaryImage, 'college');
        }
        if (updatedInfo.adminOfficerImage?.startsWith('data:')) {
          updatedInfo.adminOfficerImage = await supabaseStorageService.uploadImage(updatedInfo.adminOfficerImage, 'college');
        }
        if (updatedInfo.heroBanners && updatedInfo.heroBanners.length > 0) {
          updatedInfo.heroBanners = await Promise.all(
            updatedInfo.heroBanners.map(async b => {
              if (b.image?.startsWith('data:')) {
                const cloudUrl = await supabaseStorageService.uploadImage(b.image, 'hero');
                return { ...b, image: cloudUrl };
              }
              return b;
            })
          );
        }

        localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(updatedInfo));

        const { error } = await supabase.from('college_info').upsert([{ id: 'default', data: updatedInfo }]);
        if (error) console.log('Supabase college_info sync:', error.message);
      } catch (err) {}
    })();
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
  saveFaculty: (faculty: FacultyMember[]): void => {
    localStorage.setItem(KEYS.FACULTY, JSON.stringify(faculty));
    (async () => {
      try {
        const processed = await Promise.all(
          faculty.map(async f => {
            if (f.image?.startsWith('data:')) {
              const cloudUrl = await supabaseStorageService.uploadImage(f.image, 'faculty');
              if (cloudUrl && !cloudUrl.startsWith('data:')) {
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
        if (error) console.log('Supabase faculty sync:', error.message);
      } catch (err) {}
    })();
  },

  getDepartments: (): DepartmentInfo[] => {
    const data = localStorage.getItem(KEYS.DEPARTMENTS);
    if (!data) return initialDepartments;
    try {
      const parsed: DepartmentInfo[] = JSON.parse(data);
      const updated = initialDepartments.map(init => {
        const found = parsed.find(p => p.id === init.id);
        if (found) {
          return {
            ...found,
            name: init.name,
            code: init.code
          };
        }
        return init;
      });
      const customDepts = parsed.filter(p => !initialDepartments.some(init => init.id === p.id));
      const result = [...updated, ...customDepts];
      localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(result));
      return result;
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
  saveFacilities: (facs: Facility[]): void => {
    localStorage.setItem(KEYS.FACILITIES, JSON.stringify(facs));
    (async () => {
      try {
        const processed = await Promise.all(
          facs.map(async f => {
            if (f.image?.startsWith('data:')) {
              const cloudUrl = await supabaseStorageService.uploadImage(f.image, 'facilities');
              if (cloudUrl && !cloudUrl.startsWith('data:')) {
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
        if (error) console.log('Supabase facilities sync:', error.message);
      } catch (err) {}
    })();
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
        console.error('Supabase applications DB upsert error:', error.message);
        return { error: error.message };
      }
      return {};
    } catch (err: any) {
      console.error('Database applications save exception:', err);
      return { error: err.message || 'Failed to save application to database' };
    }
  },
  addApplication: async (app: AdmissionApplication): Promise<{ error?: string }> => {
    const apps = storageService.getApplications();
    const updated = [app, ...apps];
    return await storageService.saveApplications(updated);
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
  saveGallery: (items: GalleryItem[]): void => {
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(items));
    (async () => {
      try {
        const processed = await Promise.all(
          items.map(async item => {
            if (item.image?.startsWith('data:')) {
              const cloudUrl = await supabaseStorageService.uploadImage(item.image, 'gallery');
              if (cloudUrl && !cloudUrl.startsWith('data:')) {
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
        if (error) console.log('Supabase gallery sync:', error.message);
      } catch (err) {}
    })();
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
        adminRes
      ] = await Promise.allSettled([
        supabase.from('admission_applications').select('*'),
        supabase.from('notices').select('*'),
        supabase.from('events').select('*'),
        supabase.from('faculty').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('facilities').select('*'),
        supabase.from('gallery').select('*'),
        supabase.from('college_info').select('*'),
        supabase.from('admin_users').select('*')
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
        const loadedInfo = row.data || row;
        localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(loadedInfo));
      }
      if (adminRes.status === 'fulfilled' && adminRes.value.data && adminRes.value.data.length > 0) {
        const loadedAdmins = adminRes.value.data.map(row => row.data || row);
        localStorage.setItem(KEYS.ADMIN_USERS, JSON.stringify(loadedAdmins));
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
  }
};

