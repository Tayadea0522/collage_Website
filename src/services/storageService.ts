import { CollegeInfo, DepartmentInfo, Facility, FacultyMember, Notice, AdmissionApplication, GalleryItem, CollegeEvent, AdminUser } from '../types';
import { initialCollegeInfo, initialDepartments, initialFacilities, initialFaculty, initialNotices, initialApplications, initialGallery, initialEvents, initialAdminUsers } from '../data/initialData';

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
    return data ? JSON.parse(data) : initialCollegeInfo;
  },
  saveCollegeInfo: (info: CollegeInfo): void => {
    localStorage.setItem(KEYS.COLLEGE_INFO, JSON.stringify(info));
  },

  getNotices: (): Notice[] => {
    const data = localStorage.getItem(KEYS.NOTICES);
    return data ? JSON.parse(data) : initialNotices;
  },
  saveNotices: (notices: Notice[]): void => {
    localStorage.setItem(KEYS.NOTICES, JSON.stringify(notices));
  },

  getEvents: (): CollegeEvent[] => {
    const data = localStorage.getItem(KEYS.EVENTS);
    return data ? JSON.parse(data) : initialEvents;
  },
  saveEvents: (events: CollegeEvent[]): void => {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  },

  getFaculty: (): FacultyMember[] => {
    const data = localStorage.getItem(KEYS.FACULTY);
    return data ? JSON.parse(data) : initialFaculty;
  },
  saveFaculty: (faculty: FacultyMember[]): void => {
    localStorage.setItem(KEYS.FACULTY, JSON.stringify(faculty));
  },

  getDepartments: (): DepartmentInfo[] => {
    const data = localStorage.getItem(KEYS.DEPARTMENTS);
    return data ? JSON.parse(data) : initialDepartments;
  },
  saveDepartments: (depts: DepartmentInfo[]): void => {
    localStorage.setItem(KEYS.DEPARTMENTS, JSON.stringify(depts));
  },

  getFacilities: (): Facility[] => {
    const data = localStorage.getItem(KEYS.FACILITIES);
    return data ? JSON.parse(data) : initialFacilities;
  },
  saveFacilities: (facs: Facility[]): void => {
    localStorage.setItem(KEYS.FACILITIES, JSON.stringify(facs));
  },

  getApplications: (): AdmissionApplication[] => {
    const data = localStorage.getItem(KEYS.APPLICATIONS);
    return data ? JSON.parse(data) : initialApplications;
  },
  saveApplications: (apps: AdmissionApplication[]): void => {
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  },
  addApplication: (app: AdmissionApplication): void => {
    const apps = storageService.getApplications();
    const updated = [app, ...apps];
    storageService.saveApplications(updated);
  },
  updateApplicationStatus: (id: string, status: AdmissionApplication['status'], remarks?: string): void => {
    const apps = storageService.getApplications();
    const updated = apps.map(a => a.id === id ? { ...a, status, remarks: remarks !== undefined ? remarks : a.remarks } : a);
    storageService.saveApplications(updated);
  },

  getGallery: (): GalleryItem[] => {
    const data = localStorage.getItem(KEYS.GALLERY);
    return data ? JSON.parse(data) : initialGallery;
  },
  saveGallery: (items: GalleryItem[]): void => {
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(items));
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

