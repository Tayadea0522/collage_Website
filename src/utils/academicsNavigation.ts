/**
 * Academics Section Routing & Normalization Utilities
 * Ensures Courses Offered is the primary default, while supporting explicit direct links.
 */

export const ACADEMICS_SECTION_MAPPINGS: Record<string, string> = {
  // Courses Offered (DEFAULT)
  'courses-offered': 'course',
  'courses': 'course',
  'course': 'course',

  // Program Overview
  'program-overview': 'overview',
  'overview': 'overview',

  // Admissions Sections
  'intake-capacity': 'intake',
  'intake': 'intake',
  'eligibility': 'eligibility',
  'admission-process': 'process',
  'process': 'process',
  'documents-required': 'documents',
  'documents': 'documents',
  'fees-structure': 'fees',
  'fees': 'fees',
  'admission-enquiry': 'contact',
  'enquiry': 'contact',
  'contact': 'contact',
  'admission-portal': 'portal',
  'portal': 'portal',
  'admission-prospectus': 'prospectus',
  'prospectus': 'prospectus',
  'track-application-status': 'track',
  'track': 'track',

  // Academics Sections
  'curriculum-syllabus': 'curriculum',
  'curriculum': 'curriculum',
  'syllabus': 'curriculum',
  'academic-calendar': 'calendar',
  'calendar': 'calendar',
  'academic-regulations': 'regulations',
  'regulations': 'regulations',
};

/**
 * Normalizes any URL param, slug, or hash into an internal Academics section ID.
 * Defaults strictly to 'course' (Courses Offered).
 */
export function normalizeAcademicsSection(rawSection?: string | null): string {
  if (!rawSection) return 'course';
  const clean = rawSection.toLowerCase().trim().replace(/^#/, '');
  return ACADEMICS_SECTION_MAPPINGS[clean] || 'course';
}

/**
 * Maps an internal section ID to a clean URL slug.
 */
export function getAcademicsSectionSlug(sectionId: string): string {
  switch (sectionId) {
    case 'course':
      return 'courses-offered';
    case 'overview':
      return 'program-overview';
    case 'intake':
      return 'intake-capacity';
    case 'eligibility':
      return 'eligibility';
    case 'process':
      return 'admission-process';
    case 'documents':
      return 'documents-required';
    case 'fees':
      return 'fees-structure';
    case 'contact':
      return 'admission-enquiry';
    case 'portal':
      return 'admission-portal';
    case 'prospectus':
      return 'admission-prospectus';
    case 'track':
      return 'track-application-status';
    case 'curriculum':
      return 'curriculum-syllabus';
    case 'calendar':
      return 'academic-calendar';
    case 'regulations':
      return 'academic-regulations';
    default:
      return sectionId;
  }
}

/**
 * Inspects the current browser URL search params (?section=...) or hash (#...)
 * Returns null if no explicit section parameter was passed.
 */
export function getAcademicsSectionFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const sectionParam = params.get('section');
    if (sectionParam) {
      return normalizeAcademicsSection(sectionParam);
    }
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      return normalizeAcademicsSection(hash);
    }
  } catch (e) {}
  return null;
}
