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

export interface FacilityPhoto {
  id: string;
  url: string;
  title?: string;
  caption?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Facility {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  image: string;
  images?: string[];
  photos?: FacilityPhoto[];
  displayOrder?: number;
  isActive?: boolean;
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

export interface CareerOpportunity {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
}

export interface CoursesOfferedSection {
  isActive: boolean;
  degreeTitle: string;
  courseName: string;
  degreeType: string;
  duration: string;
  numberOfSemesters: number;
  affiliation: string;
  approvalInfo: string;
  curriculumPattern: string;
  careerScopeHeading: string;
  careerOpportunities: CareerOpportunity[];
  applyButtonText: string;
  applyButtonUrl: string;
}

export interface IntakeQuotaRow {
  id: string;
  title: string;
  seatsOrPercentage: string;
  badge: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export interface IntakeCapacitySection {
  isActive: boolean;
  sectionTitle: string;
  academicYear: string;
  totalIntake: number;
  totalIntakeLabel: string;
  stateQuotaPercentage: string;
  stateQuotaNote: string;
  institutionalQuotaPercentage: string;
  institutionalQuotaNote: string;
  quotas: IntakeQuotaRow[];
}

export interface EligibilityCriteriaItem {
  id: string;
  title: string;
  description: string;
  requiredSubjects?: string;
  minimumMarks?: string;
  entranceExams?: string;
  categoryRules?: string;
  notes?: string;
  externalLink?: string;
  badge?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface EligibilitySection {
  isActive: boolean;
  heading: string;
  subtitle?: string;
  items: EligibilityCriteriaItem[];
}

export interface AdmissionProcessStepItem {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  linkUrl?: string;
  linkText?: string;
  imageUrl?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface AdmissionProcessSection {
  isActive: boolean;
  introText: string;
  capRegistrationUrl: string;
  capRegistrationButtonText?: string;
  steps: AdmissionProcessStepItem[];
}

export interface RequiredDocumentItem {
  id: string;
  name: string;
  title?: string;
  description: string;
  isMandatory: boolean;
  pdfUrl?: string;
  storagePath?: string;
  fileName?: string;
  fileSize?: string;
  externalUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface DocumentsRequiredSection {
  isActive: boolean;
  heading: string;
  sectionTitle?: string;
  subtitle?: string;
  note?: string;
  documents: RequiredDocumentItem[];
  items?: RequiredDocumentItem[];
}

export interface FeeStructureRow {
  id: string;
  category: string;
  categoryName?: string;
  tuitionFee: string;
  otherFee: string;
  totalNetFee: string;
  totalFee?: string;
  concessionNote?: string;
  notes?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface FeeStructureSection {
  isActive: boolean;
  heading: string;
  subtitle?: string;
  academicYear: string;
  officialFeePdfUrl?: string;
  officialFeePdfStoragePath?: string;
  officialFeePdfFileName?: string;
  feeRows: FeeStructureRow[];
  categories?: FeeStructureRow[];
  notes?: string[];
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    branch?: string;
  };
}

export interface AdmissionEnquirySection {
  isActive: boolean;
  heading: string;
  subtitle?: string;
  description: string;
  phoneNumbers: string;
  helplinePhone?: string;
  email: string;
  helplineEmail?: string;
  officeAddress: string;
  workingHours: string;
  whatsappNumber?: string;
  whatsappLink?: string;
  externalEnquiryFormUrl?: string;
  coordinators?: {
    id: string;
    name: string;
    designation: string;
    phone: string;
    email?: string;
    isActive?: boolean;
  }[];
}

export interface AdmissionPortalSection {
  isActive: boolean;
  title: string;
  academicYear: string;
  description: string;
  buttonText: string;
  portalUrl?: string;
  statusBadge: string;
}

export interface AdmissionProspectusSection {
  isActive: boolean;
  title: string;
  heading?: string;
  subtitle?: string;
  description: string;
  pdfUrl?: string;
  brochureFileUrl?: string;
  storagePath?: string;
  fileName?: string;
  fileSize?: string;
  displayOrder?: number;
  highlights?: string[];
}

export interface TrackApplicationStatusSection {
  isActive: boolean;
  heading: string;
  subtitle?: string;
  description: string;
  buttonText: string;
  statusCheckUrl?: string;
  searchPlaceholder?: string;
  instructions?: string;
}

export interface ProgramOverviewSection {
  isActive: boolean;
  title?: string;
  subtitle?: string;
  degreeTitle?: string;
  programTitle: string;
  degreeName: string;
  duration: string;
  mediumOfInstruction: string;
  curriculumFramework: string;
  affiliation: string;
  approval: string;
  description: string;
  objectives: string[];
  highlights: string[];
  careerOpportunities: string[];
  keyOutcomes?: string[];
  imageUrl?: string;
  entryExitImageUrl?: string;
  entryExitOptions?: {
    title?: string;
    description?: string;
    imageUrl?: string;
    caption?: string;
    footnote?: string;
    isVisible?: boolean;
  };
  brochurePdfUrl?: string;
  brochurePdfStoragePath?: string;
  brochurePdfFileName?: string;
  externalLink?: string;
}

export interface SemesterCourseItem {
  id: string;
  code: string;
  name?: string;
  title?: string;
  credits: string;
  theoryCredits?: string;
  practicalCredits?: string;
  type?: 'Theory' | 'Practical' | 'Both' | 'Hands-on / In-Plant';
  description?: string;
  pdfSyllabusUrl?: string;
  externalUrl?: string;
  displayOrder?: number;
}

export interface SemesterCurriculum {
  id: string;
  sem?: number;
  semesterNumber?: number;
  title: string;
  academicYearLabel?: string;
  totalCredits?: string;
  description?: string;
  syllabusPdfUrl?: string;
  syllabusPdfStoragePath?: string;
  syllabusPdfFileName?: string;
  courses: SemesterCourseItem[];
}

export interface CurriculumSyllabusSection {
  isActive: boolean;
  heading: string;
  sectionTitle?: string;
  subtitle?: string;
  frameworkNote?: string;
  syllabusPdfUrl?: string;
  syllabusPdfStoragePath?: string;
  syllabusPdfFileName?: string;
  masterSyllabusPdfUrl?: string;
  masterSyllabusPdfStoragePath?: string;
  masterSyllabusPdfFileName?: string;
  semesters: SemesterCurriculum[];
}

export interface AcademicCalendarEventItem {
  id: string;
  eventName?: string;
  title?: string;
  dateRange?: string;
  dates?: string;
  semester?: string;
  badge?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface AcademicCalendarTerm {
  id: string;
  termTitle: string;
  commencementDate?: string;
  midTermDate?: string;
  semesterEndDate?: string;
  events: AcademicCalendarEventItem[];
  displayOrder?: number;
}

export interface AcademicCalendarSection {
  isActive: boolean;
  heading: string;
  subtitle?: string;
  academicYear: string;
  oddSemesterHeading?: string;
  oddSemesterEvents?: AcademicCalendarEventItem[];
  evenSemesterHeading?: string;
  evenSemesterEvents?: AcademicCalendarEventItem[];
  calendarPdfUrl?: string;
  calendarPdfStoragePath?: string;
  calendarPdfFileName?: string;
  terms?: AcademicCalendarTerm[];
  events?: AcademicCalendarEventItem[];
}

export interface AcademicRegulationItem {
  id: string;
  title: string;
  category?: string;
  description?: string;
  content?: string;
  displayOrder?: number;
  isActive: boolean;
}

export type CurriculumCourse = SemesterCourseItem;
export type AcademicCalendarEvent = AcademicCalendarEventItem;
export type AcademicRuleItem = AcademicRegulationItem;

export interface AcademicRegulationsSection {
  isActive: boolean;
  heading: string;
  subtitle?: string;
  officialPdfUrl?: string;
  officialPdfStoragePath?: string;
  officialPdfFileName?: string;
  regulationsPdfUrl?: string;
  regulationsPdfStoragePath?: string;
  regulationsPdfFileName?: string;
  externalOfficialLink?: string;
  attendancePolicy?: string;
  evaluationSystem?: string;
  gradingScheme?: string;
  rules?: AcademicRegulationItem[];
  regulations?: AcademicRegulationItem[];
  sections: AcademicRegulationItem[];
}

export interface AcademicsData {
  // Admissions Group
  coursesOffered: CoursesOfferedSection;
  intakeCapacity: IntakeCapacitySection;
  eligibility: EligibilitySection;
  admissionProcess: AdmissionProcessSection;
  documentsRequired: DocumentsRequiredSection;
  feesStructure: FeeStructureSection;
  admissionEnquiry: AdmissionEnquirySection;
  admissionPortal: AdmissionPortalSection;
  admissionProspectus: AdmissionProspectusSection;
  trackApplicationStatus: TrackApplicationStatusSection;

  // Academics Group
  programOverview: ProgramOverviewSection;
  curriculumSyllabus: CurriculumSyllabusSection;
  academicCalendar: AcademicCalendarSection;
  academicRegulations: AcademicRegulationsSection;
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
  deanEducation?: string;
  deanInstitution?: string;
  deanMessage: string;
  deanImage: string;
  secretaryName: string;
  secretaryDesignation: string;
  secretaryEducation?: string;
  secretaryInstitution?: string;
  secretaryMessage: string;
  secretaryImage: string;
  adminOfficerName?: string;
  adminOfficerDesignation?: string;
  adminOfficerEducation?: string;
  adminOfficerInstitution?: string;
  adminOfficerMessage?: string;
  adminOfficerImage?: string;
  presidentName?: string;
  presidentDesignation?: string;
  presidentEducation?: string;
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
  academicsData?: AcademicsData;
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

