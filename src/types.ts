export interface NoticeAttachment {
  fileName: string;
  fileSize: string;
  storagePath: string;
  fileUrl?: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  category: 'Admission' | 'Academic' | 'Tender' | 'General' | 'Exam';
  isNew?: boolean;
  link?: string;
  content?: string;
  attachment?: NoticeAttachment;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification: string;
  experience: string;
  specialization: string;
  email: string;
  phone?: string;
  image: string;
  isHOD?: boolean;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  head: string;
  headOfDepartment?: string;
  description: string;
  labs: string[];
  keySubjects: string[];
  image: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface DownloadableDocument {
  id: string;
  title: string;
  category: string;
  description?: string;
  fileName: string;
  storagePath?: string;
  fileSize: string;
  fileUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Facility {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  image: string;
}

export interface AdmissionApplication {
  id: string; // e.g. LSSCDT-2026-1042
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  category: 'OPEN' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'NT/VJ' | 'SBC';
  email: string;
  mobile: string;
  aadharNumber: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  
  // Admission Seeking Details
  admissionYear: string; // e.g., 'First Year (1st Year)', 'Direct Second Year (2nd Year - Lateral Entry)', 'Third Year', 'Fourth Year'
  admissionBranch: string; // e.g., 'B.Tech (Dairy Technology)'

  // Previous Academic Qualification (12th, Diploma, Graduate)
  previousQualification: '12th Science / HSC' | 'Diploma (Dairy Tech / Food Tech / Engg)' | 'Graduate (B.Sc / B.Tech)' | 'Other';
  previousInstitute?: string;
  previousBoardUniversity?: string;
  previousPassingYear?: string;
  previousStreamBranch?: string;
  previousObtainedMarks?: number;
  previousTotalMarks?: number;
  previousPercentage?: number;

  // HSC & PCM / Diploma Scores
  hscPcmMarks: number;
  hscTotalMarks: number;
  hscPercentage: number;
  hscBoard: string;
  hscPassingYear: string;
  
  // Entrance Exam
  entranceExam: 'MHT-CET' | 'ICAR AIEEA' | 'Not Applicable (Lateral Entry)';
  entranceRollNo: string;
  entrancePercentile: number;
  
  // Quota & Certificates
  isAgriculturalist: boolean;
  isMaharashtraDomicile: boolean;
  
  // Status & Attachments
  status: 'Submitted' | 'Under Review' | 'Verified' | 'Provisionally Selected' | 'Rejected';
  submissionDate: string;
  remarks?: string;
  documentsUploaded: {
    photo: boolean;
    signature: boolean;
    hscMarksheet: boolean;
    cetScoreCard: boolean;
    casteCertificate?: boolean;
    domicileCertificate: boolean;
    agriculturalistCertificate?: boolean;
  };
  attachedFiles?: {
    id: string;
    docType: string;
    title: string;
    fileName: string;
    fileSize: string;
    storagePath?: string; // Supabase Storage Path: admissions/{app_id}/{docType}_{filename}
    dataUrl?: string; // Optional legacy or fallback URL
    mimeType?: string;
    uploadedAt: string;
  }[];
  statusHistory?: {
    status: string;
    remarks?: string;
    updatedAt: string;
    updatedBy?: string;
  }[];
}

export interface CollegeEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description: string;
}

export interface AdmissionProcessStep {
  id: string;
  stepNumber: number;
  title: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
}

export interface AdmissionProcessData {
  introText: string;
  capRegistrationUrl: string;
  steps: AdmissionProcessStep[];
}

export interface CollegeInfo {
  name: string;
  shortName: string;
  tagline: string;
  logoImage?: string;
  leftLogoImage?: string;
  rightLogoImage?: string;
  trustName?: string;
  affiliation: string;
  approval: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  admissionHelpline: string;
  deanName: string;
  deanDesignation: string;
  deanInstitution?: string;
  deanMessage: string;
  deanImage: string;
  secretaryName: string;
  secretaryDesignation: string;
  secretaryInstitution?: string;
  secretaryMessage: string;
  secretaryImage: string;
  adminOfficerName?: string;
  adminOfficerDesignation?: string;
  adminOfficerInstitution?: string;
  adminOfficerMessage?: string;
  adminOfficerImage?: string;
  presidentName?: string;
  presidentDesignation?: string;
  presidentInstitution?: string;
  presidentMessage?: string;
  presidentImage?: string;
  shaktikumarImage?: string;
  shaktikumarMessage?: string;
  aboutText1: string;
  aboutText2: string;
  stats: {
    placement: string;
    labs: string;
    dairyPlant: string;
    faculty: string;
  };
  establishedYear: string;
  campusArea: string;
  vision: string;
  mission: string[];
  heroBanners: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
  }[];
  admissionProcess?: AdmissionProcessData;
}

export interface PlacementPartner {
  name: string;
  logo: string;
  packageRange: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Campus' | 'Dairy Plant' | 'Lab' | 'Events' | 'Sports';
  image: string;
  date: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'Admission Incharge' | 'Academic Admin' | 'System Administrator';
  mobile: string;
  securityQuestion?: string;
  securityAnswer?: string;
  auth_user_id?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PopupBanner {
  id: string;
  isActive: boolean;
  title?: string;
  description?: string;
  imageUrl?: string;
  storagePath?: string;
  buttonText?: string;
  buttonUrl?: string;
  displayFrequency: 'every_visit' | 'once_per_session' | 'once_per_day';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

