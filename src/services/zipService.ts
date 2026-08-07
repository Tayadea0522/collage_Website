import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { AdmissionApplication, CollegeInfo } from '../types';
import { generateSlipHtml } from '../utils/printUtils';
import { supabaseStorageService } from './supabaseStorageService';

export const zipService = {
  /**
   * Helper: Generate HTML/PDF file Blob for an application
   */
  generateAppPdfBlob: (app: AdmissionApplication, collegeInfo: CollegeInfo): Blob => {
    const html = generateSlipHtml(app, collegeInfo);
    return new Blob([html], { type: 'text/html' });
  },

  /**
   * Option B: Download Individual Candidate ZIP
   * Contains:
   * - Application.pdf / Application_Slip.html
   * - Student Photo
   * - Aadhaar Certificate
   * - Birth / Domicile Certificate
   * - Marksheets & Score Cards
   */
  downloadSingleApplicationZip: async (
    app: AdmissionApplication,
    collegeInfo: CollegeInfo,
    onProgress?: (status: string) => void
  ): Promise<void> => {
    onProgress?.('Initializing ZIP archive...');
    const zip = new JSZip();
    const cleanName = app.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const folderName = `${cleanName}_${app.id}`;
    const folder = zip.folder(folderName) || zip;

    // 1. Application PDF/HTML Slip
    const slipBlob = zipService.generateAppPdfBlob(app, collegeInfo);
    folder.file(`Application_Slip_${app.id}.html`, slipBlob);

    // 2. Add attached files
    if (app.attachedFiles && app.attachedFiles.length > 0) {
      for (let i = 0; i < app.attachedFiles.length; i++) {
        const doc = app.attachedFiles[i];
        onProgress?.(`Fetching document ${i + 1}/${app.attachedFiles.length}: ${doc.title}...`);
        
        const blob = await supabaseStorageService.getFileBlob(doc.storagePath, doc.dataUrl);
        if (blob) {
          const docTypeStr = doc.docType || 'Document';
          const extMatch = doc.fileName.match(/\.[a-zA-Z0-9]+$/);
          const ext = extMatch ? extMatch[0] : '.pdf';
          const docFileName = `${docTypeStr}_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
          folder.file(docFileName, blob);
        }
      }
    }

    onProgress?.('Generating ZIP file...');
    const zipContent = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(zipContent);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${folderName}_Package.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    onProgress?.('Download complete!');
  },

  /**
   * Feature 6: Bulk ZIP Download
   * Select multiple or all applications -> Download as Admissions_2026_Bulk.zip
   */
  downloadBulkApplicationsZip: async (
    applications: AdmissionApplication[],
    collegeInfo: CollegeInfo,
    zipFilename = 'Admissions_2026_Bulk',
    onProgress?: (status: string) => void
  ): Promise<void> => {
    if (applications.length === 0) {
      alert('No applications selected for bulk download.');
      return;
    }

    const zip = new JSZip();

    for (let index = 0; index < applications.length; index++) {
      const app = applications[index];
      onProgress?.(`Processing application ${index + 1}/${applications.length}: ${app.fullName}...`);

      const cleanName = app.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const folderName = `${cleanName}_${app.id}`;
      const folder = zip.folder(folderName);

      if (folder) {
        // Application Slip
        const slipBlob = zipService.generateAppPdfBlob(app, collegeInfo);
        folder.file(`Application_Slip_${app.id}.html`, slipBlob);

        // Attached Files
        if (app.attachedFiles && app.attachedFiles.length > 0) {
          for (const doc of app.attachedFiles) {
            const blob = await supabaseStorageService.getFileBlob(doc.storagePath, doc.dataUrl);
            if (blob) {
              const docTypeStr = doc.docType || 'Document';
              const extMatch = doc.fileName.match(/\.[a-zA-Z0-9]+$/);
              const ext = extMatch ? extMatch[0] : '.pdf';
              const docFileName = `${docTypeStr}_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
              folder.file(docFileName, blob);
            }
          }
        }
      }
    }

    onProgress?.('Packaging ZIP archive...');
    const zipContent = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(zipContent);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${zipFilename}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    onProgress?.('Bulk ZIP download completed successfully!');
  },

  /**
   * Feature 7: Academic Year Archive
   * Creates Admissions_2026_Archive.zip containing:
   * - applications.xlsx
   * - documents_summary.xlsx
   * - Student folders with Application.pdf and uploaded files
   */
  downloadAcademicYearArchive: async (
    applications: AdmissionApplication[],
    collegeInfo: CollegeInfo,
    academicYear = '2026-27',
    onProgress?: (status: string) => void
  ): Promise<void> => {
    onProgress?.('Building Academic Year Excel spreadsheets...');
    const zip = new JSZip();

    // 1. Applications Excel Export
    const formattedApps = applications.map((app, index) => ({
      'Sr. No.': index + 1,
      'Application ID': app.id,
      'Student Name': app.fullName,
      'Father Name': app.fatherName,
      'Mother Name': app.motherName,
      'Date of Birth': app.dob,
      'Gender': app.gender,
      'Category': app.category,
      'Mobile': app.mobile,
      'Email': app.email,
      'Aadhar No': app.aadharNumber,
      'Address': app.address,
      'District': app.district,
      'Pincode': app.pincode,
      'State': app.state,
      'Admission Seeking Year': app.admissionYear || 'First Year',
      'Branch Program': app.admissionBranch || 'B.Tech (Dairy Technology)',
      'Previous Qualification': app.previousQualification || '12th Science',
      'Board/University': app.previousBoardUniversity || app.hscBoard,
      'Passing Year': app.previousPassingYear || app.hscPassingYear,
      'HSC PCM Marks': app.hscPcmMarks,
      'HSC Total Marks': app.hscTotalMarks,
      'HSC Percentage': `${app.hscPercentage}%`,
      'Entrance Exam': app.entranceExam || 'MHT-CET',
      'Entrance Percentile': app.entrancePercentile,
      '7% Agri Quota': app.isAgriculturalist ? 'Yes' : 'No',
      'MH Domicile': app.isMaharashtraDomicile ? 'Yes' : 'No',
      'Status': app.status,
      'Submission Date': app.submissionDate,
      'Remarks': app.remarks || ''
    }));

    const worksheetApps = XLSX.utils.json_to_sheet(formattedApps);
    const workbookApps = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbookApps, worksheetApps, 'Applications');
    const appsXlsxBuffer = XLSX.write(workbookApps, { bookType: 'xlsx', type: 'array' });
    zip.file('applications.xlsx', appsXlsxBuffer);

    // 2. Documents Summary Excel Export
    const docSummaryRows: any[] = [];
    applications.forEach((app, idx) => {
      if (app.attachedFiles && app.attachedFiles.length > 0) {
        app.attachedFiles.forEach(doc => {
          docSummaryRows.push({
            'Sr. No.': docSummaryRows.length + 1,
            'Application ID': app.id,
            'Student Name': app.fullName,
            'Document Type': doc.docType || 'Document',
            'Document Title': doc.title,
            'File Name': doc.fileName,
            'File Size': doc.fileSize,
            'Storage Path': doc.storagePath || 'Local DataUrl',
            'Uploaded At': doc.uploadedAt
          });
        });
      } else {
        docSummaryRows.push({
          'Sr. No.': docSummaryRows.length + 1,
          'Application ID': app.id,
          'Student Name': app.fullName,
          'Document Type': 'None',
          'Document Title': 'No Certificates Attached',
          'File Name': 'N/A',
          'File Size': 'N/A',
          'Storage Path': 'N/A',
          'Uploaded At': app.submissionDate
        });
      }
    });

    const worksheetDocs = XLSX.utils.json_to_sheet(docSummaryRows);
    const workbookDocs = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbookDocs, worksheetDocs, 'Documents Summary');
    const docsXlsxBuffer = XLSX.write(workbookDocs, { bookType: 'xlsx', type: 'array' });
    zip.file('documents.xlsx', docsXlsxBuffer);

    // 3. Student Folders with Application PDF & Attached Documents
    for (let index = 0; index < applications.length; index++) {
      const app = applications[index];
      onProgress?.(`Archiving candidate ${index + 1}/${applications.length}: ${app.fullName}...`);

      const cleanName = app.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const folderName = `${cleanName}_${app.id}`;
      const folder = zip.folder(folderName);

      if (folder) {
        // Application Slip HTML/PDF
        const slipBlob = zipService.generateAppPdfBlob(app, collegeInfo);
        folder.file(`Application_${app.id}.html`, slipBlob);

        // Uploaded Document Files
        if (app.attachedFiles && app.attachedFiles.length > 0) {
          for (const doc of app.attachedFiles) {
            const blob = await supabaseStorageService.getFileBlob(doc.storagePath, doc.dataUrl);
            if (blob) {
              const docTypeStr = doc.docType || 'Document';
              const extMatch = doc.fileName.match(/\.[a-zA-Z0-9]+$/);
              const ext = extMatch ? extMatch[0] : '.pdf';
              const docFileName = `${docTypeStr}_${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
              folder.file(docFileName, blob);
            }
          }
        }
      }
    }

    onProgress?.('Finalizing Master Archive ZIP...');
    const archiveZipBlob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(archiveZipBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Admissions_${academicYear.replace(/[^a-zA-Z0-9]/g, '_')}_Archive.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    onProgress?.('Academic Year Archive created and downloaded successfully!');
  }
};
