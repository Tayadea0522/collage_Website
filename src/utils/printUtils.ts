import { AdmissionApplication, CollegeInfo } from '../types';

export function generateSlipHtml(app: AdmissionApplication, collegeInfo: CollegeInfo): string {
  const collegeName = collegeInfo.name.includes('College') 
    ? collegeInfo.name 
    : `${collegeInfo.name} ${collegeInfo.tagline || 'College of Dairy Technology'}`;

  const attachedDocsHtml = app.attachedFiles && app.attachedFiles.length > 0
    ? app.attachedFiles.map(d => `
        <div style="background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0; display:flex; justify-between: space-between; align-items:center;">
          <div>
            <strong style="color:#0f172a; font-size:12px; display:block;">${d.title}</strong>
            <span style="color:#64748b; font-size:10px; font-family:monospace;">${d.fileName} (${d.fileSize})</span>
          </div>
          <span style="background:#dcfce7; color:#15803d; font-weight:bold; font-size:10px; padding:2px 8px; border-radius:4px;">VERIFIED / ATTACHED</span>
        </div>
      `).join('')
    : '<div style="color:#64748b; font-size:11px; italic">No certificates attached electronically.</div>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Slip - ${app.id}</title>
  <style>
    @page {
      size: A4;
      margin: 12mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    .no-print-bar {
      background: #0a2342;
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .no-print-bar button {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      font-weight: 800;
      font-size: 13px;
      padding: 8px 18px;
      border-radius: 8px;
      cursor: pointer;
      margin-left: 8px;
      transition: all 0.2s;
    }
    .no-print-bar button:hover {
      background: #d97706;
      color: white;
    }
    .slip-card {
      border: 2px solid #0a2342;
      border-radius: 16px;
      padding: 28px;
      background: #ffffff;
    }
    .header {
      text-align: center;
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-family: Georgia, serif;
      font-size: 22px;
      font-weight: 900;
      color: #0a2342;
      margin: 0 0 6px 0;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 3px 0;
      font-size: 12px;
      color: #475569;
    }
    .badge {
      display: inline-block;
      background: #0a2342;
      color: #fbbf24;
      font-weight: 800;
      font-size: 12px;
      padding: 5px 16px;
      border-radius: 6px;
      margin-top: 10px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .meta-item label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .meta-item span {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    .section {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 18px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      color: #0a2342;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .info-row {
      font-size: 12px;
      margin-bottom: 6px;
      color: #334155;
    }
    .info-row strong {
      color: #0f172a;
      min-width: 120px;
      display: inline-block;
    }
    .docs-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .sign-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
    }
    .sign-line {
      border-top: 1px solid #0f172a;
      margin-top: 40px;
      padding-top: 4px;
    }
    .footer-note {
      font-size: 11px;
      color: #64748b;
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    @media print {
      .no-print-bar { display: none !important; }
      body { padding: 0; background: white; }
      .slip-card { border-color: #000; border-radius: 0; padding: 0; border: none; }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <strong style="font-size:14px; display:block;">Admission Application Slip - ${app.id}</strong>
      <span style="font-size:11px; opacity:0.8;">Save as PDF or Print for Campus Submission</span>
    </div>
    <div>
      <button onclick="window.print()">🖨️ Print / Save as PDF</button>
      <button onclick="window.close()" style="background:#e2e8f0; color:#0f172a;">Close Window</button>
    </div>
  </div>

  <div class="slip-card">
    <div class="header" style="position: relative;">
      ${collegeInfo.logoImage ? `<img src="${collegeInfo.logoImage}" alt="College Logo" style="height: 60px; max-width: 120px; object-fit: contain; margin-bottom: 8px;" />` : ''}
      <h1>${collegeName}</h1>
      <p style="font-weight: 700; color: #0a2342; font-size: 13px;">Managed by: ${collegeInfo.trustName || 'Late. Madanlalji - Kisanlalji Sancheti Seva Samiti, Malkapur (Registration No. Maharashtra 2563/Date. 14/07/92 buldhana F2652/Date. 20/01/93)'}</p>
      <p><strong>Address:</strong> ${collegeInfo.address}</p>
      <p><strong>Affiliation:</strong> ${collegeInfo.affiliation}</p>
      <p><strong>Contact:</strong> ${collegeInfo.phone} | ${collegeInfo.email}</p>
      <div class="badge">OFFICIAL ADMISSION ACKNOWLEDGEMENT SLIP (2026-27)</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <label>Application ID</label>
        <span style="font-family:monospace; color:#0a2342;">${app.id}</span>
      </div>
      <div class="meta-item">
        <label>Submission Date</label>
        <span>${app.submissionDate}</span>
      </div>
      <div class="meta-item">
        <label>Seeking Year</label>
        <span style="color:#d97706;">${app.admissionYear || 'First Year'}</span>
      </div>
      <div class="meta-item">
        <label>Scrutiny Status</label>
        <span style="color:#15803d;">${app.status}</span>
      </div>
    </div>

    <div class="grid-2">
      <div class="section">
        <div class="section-title">1. Candidate Personal Profile</div>
        <div class="info-row"><strong>Full Name:</strong> ${app.fullName}</div>
        <div class="info-row"><strong>Father's Name:</strong> ${app.fatherName}</div>
        <div class="info-row"><strong>Mother's Name:</strong> ${app.motherName}</div>
        <div class="info-row"><strong>Category:</strong> ${app.category}</div>
        <div class="info-row"><strong>Gender / DOB:</strong> ${app.gender} | ${app.dob}</div>
        <div class="info-row"><strong>Mobile No:</strong> ${app.mobile}</div>
        <div class="info-row"><strong>Email ID:</strong> ${app.email}</div>
        <div class="info-row"><strong>Aadhar Number:</strong> ${app.aadharNumber || 'Provided'}</div>
        <div class="info-row"><strong>Full Address:</strong> ${app.address}, ${app.district} - ${app.pincode} (${app.state})</div>
      </div>

      <div class="section">
        <div class="section-title">2. Academic & Entrance Merit</div>
        <div class="info-row"><strong>Choice Program:</strong> ${app.admissionBranch || 'B.Tech (Dairy Technology)'}</div>
        <div class="info-row"><strong>Previous Qualification:</strong> ${app.previousQualification || '12th Science'}</div>
        <div class="info-row"><strong>Board / University:</strong> ${app.previousBoardUniversity || app.hscBoard}</div>
        <div class="info-row"><strong>Passing Year:</strong> ${app.previousPassingYear || app.hscPassingYear}</div>
        <div class="info-row"><strong>Marks Obtained:</strong> ${app.previousObtainedMarks || app.hscPcmMarks} / ${app.previousTotalMarks || app.hscTotalMarks} (${app.previousPercentage || app.hscPercentage}%)</div>
        <div class="info-row"><strong>Entrance Exam:</strong> ${app.entranceExam || 'MHT-CET'}</div>
        <div class="info-row"><strong>Entrance Roll No:</strong> ${app.entranceRollNo || 'N/A'}</div>
        <div class="info-row"><strong>Percentile Score:</strong> ${app.entrancePercentile} %ile</div>
        <div class="info-row"><strong>Agricultural Quota:</strong> ${app.isAgriculturalist ? 'YES (7% Weightage Claimed)' : 'NO'}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">3. Attached Documents Checklist</div>
      <div class="docs-grid">
        ${attachedDocsHtml}
      </div>
    </div>

    <div style="font-size: 11px; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0;">
      <strong>Declaration:</strong> I hereby declare that the information supplied in this online application is correct. I understand that my admission is subject to verification of original certificates by the College Admission Scrutiny Committee.
    </div>

    <div class="sign-box">
      <div>
        <div class="sign-line">Candidate Signature</div>
      </div>
      <div>
        <div class="sign-line">Authorized Admission Scrutiny Incharge</div>
      </div>
    </div>

    <div class="footer-note">
      <span>* Please retain this slip and bring original documents for campus reporting.</span>
      <span>Printed On: ${new Date().toLocaleString()}</span>
    </div>
  </div>

</body>
</html>`;
}

export function printApplicationSlip(app: AdmissionApplication, collegeInfo: CollegeInfo): void {
  const htmlContent = generateSlipHtml(app, collegeInfo);

  // Method 1: Try Opening a New Window
  try {
    const printWindow = window.open('', '_blank', 'width=850,height=950,scrollbars=yes');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      // Auto trigger print after render
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (e) {
          console.log('Window print deferred:', e);
        }
      }, 500);
      return;
    }
  } catch (e) {
    console.log('Window open blocked, trying hidden iframe fallback:', e);
  }

  // Method 2: Fallback to hidden iframe printing
  try {
    let iframe = document.getElementById('print-iframe-element') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe-element';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
    }

    const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 500);
      return;
    }
  } catch (err) {
    console.log('Iframe print error fallback:', err);
  }

  // Method 3: Final fallback to direct window.print()
  window.print();
}

export function downloadApplicationSlip(app: AdmissionApplication, collegeInfo: CollegeInfo): void {
  const htmlContent = generateSlipHtml(app, collegeInfo);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LSSCDT-Application-Slip-${app.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
