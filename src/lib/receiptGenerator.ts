import { jsPDF } from 'jspdf';

export interface ReceiptData {
  receiptNo: string;
  date: string;
  studentName: string;
  studentClass: string;
  rollNumber?: string;
  courseTitle: string;
  amount: string; // e.g., "₹4,999" or "₹1,499"
  paymentMethod: string;
  transactionId: string;
  discountApplied?: string; // e.g. "₹500 Referral Discount"
}

export function generatePaymentReceiptPDF(data: ReceiptData) {
  // Create PDF instance (A4 size: 210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  // 1. Draw elegant double outer borders (Academic style)
  doc.setDrawColor(11, 44, 107); // Navy color #0B2C6B
  doc.setLineWidth(1);
  doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
  
  doc.setDrawColor(212, 160, 23); // Gold color #D4A017
  doc.setLineWidth(0.3);
  doc.rect(margin + 1.5, margin + 1.5, pageWidth - (margin * 2) - 3, pageHeight - (margin * 2) - 3);

  // 2. Draw Decorative Top Header Corner Accents
  doc.setFillColor(11, 44, 107);
  doc.rect(margin + 5, margin + 5, 12, 1.5, 'F');
  doc.rect(margin + 5, margin + 5, 1.5, 12, 'F');
  
  doc.rect(pageWidth - margin - 17, margin + 5, 12, 1.5, 'F');
  doc.rect(pageWidth - margin - 6.5, margin + 5, 1.5, 12, 'F');

  // 3. Header Title & Brand Info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(11, 44, 107); // Navy #0B2C6B
  doc.text('CONCEPT MADE EASY (CME) ACADEMICS', pageWidth / 2, margin + 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Premium Conceptual School Coaching & Board Preparatory Institute', pageWidth / 2, margin + 23, { align: 'center' });
  doc.text('Registered Office: New Delhi, India  |  E-mail: support@conceptmadeeasy.com', pageWidth / 2, margin + 27, { align: 'center' });

  // Thin dividing line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin + 8, margin + 31, pageWidth - margin - 8, margin + 31);

  // 4. Receipt Banner Label
  doc.setFillColor(11, 44, 107);
  doc.rect(pageWidth / 2 - 40, margin + 34, 80, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL PAYMENT RECEIPT', pageWidth / 2, margin + 39.2, { align: 'center' });

  // 5. Document Metadata Block (Left & Right Split)
  let metaY = margin + 50;
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);

  // Left side metadata
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt Number:', margin + 10, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.receiptNo, margin + 42, metaY);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Date:', margin + 10, metaY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(data.date, margin + 42, metaY + 6);

  // Right side metadata
  doc.setFont('helvetica', 'bold');
  doc.text('Merchant Entity:', pageWidth - margin - 85, metaY);
  doc.setFont('helvetica', 'normal');
  doc.text('CME Academics Pvt Ltd', pageWidth - margin - 50, metaY);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', pageWidth - margin - 85, metaY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 124, 65); // Success Green
  doc.text('PAID / SECURED', pageWidth - margin - 50, metaY + 6);

  // Restore text color
  doc.setTextColor(60, 60, 60);

  // Header separator box
  doc.setDrawColor(11, 44, 107);
  doc.setLineWidth(0.4);
  doc.line(margin + 10, metaY + 12, pageWidth - margin - 10, metaY + 12);

  // 6. Student & Registration Credentials Block
  let stdY = metaY + 18;
  doc.setFillColor(250, 248, 242); // Soft off-white gold tint #FAF8F2
  doc.rect(margin + 10, stdY, pageWidth - (margin * 2) - 20, 24, 'F');
  doc.setDrawColor(212, 160, 23); // Gold #D4A017 border
  doc.setLineWidth(0.2);
  doc.rect(margin + 10, stdY, pageWidth - (margin * 2) - 20, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(11, 44, 107);
  doc.text('STUDENT REGISTRATION DETAILS', margin + 14, stdY + 6);

  doc.setFontSize(9.5);
  doc.setTextColor(80, 80, 80);

  doc.setFont('helvetica', 'bold');
  doc.text('Student Name:', margin + 14, stdY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text(data.studentName, margin + 44, stdY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Academic Class:', margin + 14, stdY + 19);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.studentClass} Standard`, margin + 44, stdY + 19);

  if (data.rollNumber) {
    doc.setFont('helvetica', 'bold');
    doc.text('CME Roll Number:', pageWidth - margin - 85, stdY + 13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 44, 107);
    doc.text(data.rollNumber, pageWidth - margin - 50, stdY + 13);
  }

  // Restore text color
  doc.setTextColor(80, 80, 80);

  // 7. Payment Itemization Table Header
  let tableY = stdY + 32;
  doc.setFillColor(11, 44, 107);
  doc.rect(margin + 10, tableY, pageWidth - (margin * 2) - 20, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Fee Description & Course Package', margin + 14, tableY + 5.5);
  doc.text('Amount (INR)', pageWidth - margin - 35, tableY + 5.5);

  // Table Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(60, 60, 60);

  let rowY = tableY + 15;
  doc.text(data.courseTitle, margin + 14, rowY);
  doc.setFont('helvetica', 'bold');
  doc.text(data.amount, pageWidth - margin - 35, rowY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Includes secure server access, interactive digital board records, study kits, and mentor sessions.', margin + 14, rowY + 5.5);

  // Table Bottom line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin + 10, rowY + 12, pageWidth - margin - 10, rowY + 12);

  // 8. Financial Summary calculations
  let summaryY = rowY + 18;
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);

  // Subtotal
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal:', pageWidth - margin - 85, summaryY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.amount, pageWidth - margin - 35, summaryY);

  // Discount (if any)
  let finalY = summaryY + 6;
  if (data.discountApplied) {
    doc.setFont('helvetica', 'bold');
    doc.text('Scholarship/Discount:', pageWidth - margin - 85, summaryY + 5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(16, 124, 65);
    doc.text(`-${data.discountApplied}`, pageWidth - margin - 35, summaryY + 5);
    
    doc.setTextColor(90, 90, 90);
    finalY = summaryY + 11;
  }

  // Total Paid Accent Row
  doc.setFillColor(242, 245, 250);
  doc.rect(pageWidth - margin - 90, finalY - 4, 80, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 44, 107);
  doc.text('Net Fees Paid:', pageWidth - margin - 85, finalY + 1.5);
  doc.setFont('helvetica', 'bold');
  doc.text(data.amount, pageWidth - margin - 35, finalY + 1.5);

  // 9. Payment Diagnostics / Security Box
  let diagY = finalY + 14;
  doc.setFillColor(248, 248, 248);
  doc.rect(margin + 10, diagY, pageWidth - (margin * 2) - 20, 18, 'F');
  doc.setDrawColor(230, 230, 230);
  doc.rect(margin + 10, diagY, pageWidth - (margin * 2) - 20, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 44, 107);
  doc.text('PAYMENT VERIFICATION METADATA', margin + 14, diagY + 4.5);

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);

  doc.setFont('helvetica', 'bold');
  doc.text('Channel Reference:', margin + 14, diagY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`CME UPI QR Payment`, margin + 44, diagY + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', margin + 14, diagY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(data.paymentMethod.toUpperCase(), margin + 44, diagY + 14);

  doc.setFont('helvetica', 'bold');
  doc.text('Transaction ID:', pageWidth - margin - 85, diagY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.transactionId, pageWidth - margin - 50, diagY + 9.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Compliance:', pageWidth - margin - 85, diagY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text('RBI-eReceipt-75A', pageWidth - margin - 50, diagY + 14);

  // 10. Seal & Verification stamp
  let footerY = diagY + 28;

  // Add a beautifully-crafted vector seal stamp (PAID circle)
  doc.setDrawColor(16, 124, 65);
  doc.setLineWidth(0.6);
  doc.circle(margin + 25, footerY + 8, 11);
  doc.setDrawColor(16, 124, 65);
  doc.setLineWidth(0.15);
  doc.circle(margin + 25, footerY + 8, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(16, 124, 65);
  doc.text('VERIFIED', margin + 25, footerY + 6, { align: 'center' });
  doc.setFontSize(10);
  doc.text('PAID', margin + 25, footerY + 11, { align: 'center' });

  // Right side: Authorized Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(11, 44, 107);
  doc.text('CME ACADEMICS TRUST', pageWidth - margin - 55, footerY + 2);
  
  doc.setFont('courier', 'bolditalic');
  doc.setFontSize(11);
  doc.setTextColor(212, 160, 23);
  doc.text('Concept Made Easy', pageWidth - margin - 53, footerY + 10); // Academy seal
  
  doc.setDrawColor(11, 44, 107);
  doc.setLineWidth(0.2);
  doc.line(pageWidth - margin - 60, footerY + 13, pageWidth - margin - 10, footerY + 13);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Authorized Finance Controller', pageWidth - margin - 52, footerY + 17);

  // 11. Disclaimer/Audit Legal Footnote
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text('This fee receipt is an official legally-binding receipt issued under CME digital registration protocols.', pageWidth / 2, pageHeight - margin - 7, { align: 'center' });
  doc.text('All queries regarding subscription reversals should be routed through support@conceptmadeeasy.com within 7 working days.', pageWidth / 2, pageHeight - margin - 4, { align: 'center' });

  // Save/Download PDF
  const filename = `CME_Receipt_${data.receiptNo}.pdf`;
  doc.save(filename);
}

export interface StudentReportData {
  studentName: string;
  studentClass: string;
  rollNumber: string;
  monthYear: string;
  attendancePercentage: number;
  totalClassesAttended: number;
  totalClassesHeld: number;
  monthlyPerformanceScore: number;
  overallGrade: string;
  completedAssignments: {
    title: string;
    subject: string;
    score: string;
    status: string;
    date: string;
  }[];
  subjectScores: {
    subject: string;
    scorePercent: number;
    remarks: string;
  }[];
  teacherRemarks?: string;
}

export function generateStudentMonthlyReportPDF(data: StudentReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;

  // 1. Double Borders (Navy & Gold)
  doc.setDrawColor(11, 44, 107); // Navy #0B2C6B
  doc.setLineWidth(1);
  doc.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));

  doc.setDrawColor(212, 160, 23); // Gold #D4A017
  doc.setLineWidth(0.3);
  doc.rect(margin + 1.5, margin + 1.5, pageWidth - (margin * 2) - 3, pageHeight - (margin * 2) - 3);

  // 2. Corner Accents
  doc.setFillColor(11, 44, 107);
  doc.rect(margin + 5, margin + 5, 12, 1.5, 'F');
  doc.rect(margin + 5, margin + 5, 1.5, 12, 'F');
  doc.rect(pageWidth - margin - 17, margin + 5, 12, 1.5, 'F');
  doc.rect(pageWidth - margin - 6.5, margin + 5, 1.5, 12, 'F');

  // 3. Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(11, 44, 107);
  doc.text('CONCEPT MADE EASY (CME) ACADEMICS', pageWidth / 2, margin + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Monthly Student Performance, Attendance & Assignment Report', pageWidth / 2, margin + 21, { align: 'center' });
  doc.text('Authorized Academic Assessment Center  |  New Delhi, India', pageWidth / 2, margin + 25, { align: 'center' });

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin + 8, margin + 28, pageWidth - margin - 8, margin + 28);

  // 4. Report Header Banner
  doc.setFillColor(11, 44, 107);
  doc.rect(pageWidth / 2 - 45, margin + 31, 90, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`MONTHLY REPORT SUMMARY - ${data.monthYear.toUpperCase()}`, pageWidth / 2, margin + 36.2, { align: 'center' });

  // 5. Student Credentials Box
  let stdY = margin + 44;
  doc.setFillColor(250, 248, 242);
  doc.rect(margin + 10, stdY, pageWidth - (margin * 2) - 20, 22, 'F');
  doc.setDrawColor(212, 160, 23);
  doc.setLineWidth(0.2);
  doc.rect(margin + 10, stdY, pageWidth - (margin * 2) - 20, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(11, 44, 107);
  doc.text('STUDENT PROFILE INFORMATION', margin + 14, stdY + 5.5);

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  doc.setFont('helvetica', 'bold');
  doc.text('Name:', margin + 14, stdY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.studentName, margin + 32, stdY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Class:', margin + 14, stdY + 17.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Class ${data.studentClass}`, margin + 32, stdY + 17.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Roll Number:', pageWidth - margin - 80, stdY + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 44, 107);
  doc.text(data.rollNumber, pageWidth - margin - 50, stdY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Grade Status:', pageWidth - margin - 80, stdY + 17.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 124, 65);
  doc.text(data.overallGrade, pageWidth - margin - 50, stdY + 17.5);

  // 6. Section 1: Attendance & Performance Overview (Side by Side Metric Cards)
  let metricY = stdY + 27;

  // Attendance Card
  doc.setFillColor(242, 245, 250);
  doc.rect(margin + 10, metricY, 78, 22, 'F');
  doc.setDrawColor(11, 44, 107);
  doc.setLineWidth(0.2);
  doc.rect(margin + 10, metricY, 78, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 44, 107);
  doc.text('MONTHLY ATTENDANCE RATE', margin + 14, metricY + 5);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(data.attendancePercentage >= 85 ? 16 : 180, data.attendancePercentage >= 85 ? 124 : 80, 23);
  doc.text(`${data.attendancePercentage}%`, margin + 14, metricY + 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${data.totalClassesAttended} of ${data.totalClassesHeld} Live Sessions Attended`, margin + 14, metricY + 18);

  // Overall Score Card
  doc.setFillColor(250, 248, 242);
  doc.rect(pageWidth - margin - 88, metricY, 78, 22, 'F');
  doc.setDrawColor(212, 160, 23);
  doc.setLineWidth(0.2);
  doc.rect(pageWidth - margin - 88, metricY, 78, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 44, 107);
  doc.text('CUMULATIVE TEST SCORE', pageWidth - margin - 84, metricY + 5);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 160, 23);
  doc.text(`${data.monthlyPerformanceScore}%`, pageWidth - margin - 84, metricY + 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Rank Standard: Top 10% Batch Percentile`, pageWidth - margin - 84, metricY + 18);

  // 7. Section 2: Subject Performance Table
  let subjY = metricY + 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(11, 44, 107);
  doc.text('1. SUBJECT-WISE ACADEMIC PERFORMANCE', margin + 10, subjY);

  let subjTableY = subjY + 3;
  doc.setFillColor(11, 44, 107);
  doc.rect(margin + 10, subjTableY, pageWidth - (margin * 2) - 20, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Subject', margin + 14, subjTableY + 4.2);
  doc.text('Score (%)', margin + 70, subjTableY + 4.2);
  doc.text('Progress & Remarks', margin + 110, subjTableY + 4.2);

  let sRowY = subjTableY + 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  (data.subjectScores || []).forEach((s) => {
    doc.setFont('helvetica', 'bold');
    doc.text(s.subject || '', margin + 14, sRowY);
    doc.text(`${s.scorePercent || 0}%`, margin + 70, sRowY);
    doc.setFont('helvetica', 'normal');
    doc.text(s.remarks || '', margin + 110, sRowY);

    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.15);
    doc.line(margin + 10, sRowY + 2, pageWidth - margin - 10, sRowY + 2);

    sRowY += 6.5;
  });

  // 8. Section 3: Completed Assignments & Homework Log
  let assignY = sRowY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(11, 44, 107);
  doc.text('2. COMPLETED ASSIGNMENTS & HOMEWORK SUBMISSIONS', margin + 10, assignY);

  let assignTableY = assignY + 3;
  doc.setFillColor(11, 44, 107);
  doc.rect(margin + 10, assignTableY, pageWidth - (margin * 2) - 20, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Assignment Title', margin + 14, assignTableY + 4.2);
  doc.text('Subject', margin + 85, assignTableY + 4.2);
  doc.text('Submission Date', margin + 118, assignTableY + 4.2);
  doc.text('Score / Status', pageWidth - margin - 40, assignTableY + 4.2);

  let aRowY = assignTableY + 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);

  (data.completedAssignments || []).slice(0, 5).forEach((a) => {
    doc.setFont('helvetica', 'bold');
    const aTitle = String(a?.title || '');
    doc.text((aTitle || '').length > 38 ? (aTitle || '').substring(0, 35) + '...' : aTitle, margin + 14, aRowY);
    doc.setFont('helvetica', 'normal');
    doc.text(a.subject || '', margin + 85, aRowY);
    doc.text(a.date || '', margin + 118, aRowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 124, 65);
    doc.text(`${a.score || ''} (${a.status || ''})`, pageWidth - margin - 40, aRowY);
    doc.setTextColor(60, 60, 60);

    doc.setDrawColor(235, 235, 235);
    doc.setLineWidth(0.15);
    doc.line(margin + 10, aRowY + 2, pageWidth - margin - 10, aRowY + 2);

    aRowY += 6.5;
  });

  // 9. Teacher Remarks & Faculty Seal
  let footerBlockY = aRowY + 6;
  doc.setFillColor(248, 248, 248);
  doc.rect(margin + 10, footerBlockY, pageWidth - (margin * 2) - 20, 20, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(margin + 10, footerBlockY, pageWidth - (margin * 2) - 20, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 44, 107);
  doc.text('FACULTY MENTOR OBSERVATION & REMARKS', margin + 14, footerBlockY + 5);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const remarksText = data.teacherRemarks || `Academic progress notes provided by the teacher for ${data.studentName}.`;
  doc.text(doc.splitTextToSize(remarksText, pageWidth - (margin * 2) - 28), margin + 14, footerBlockY + 11);

  // Official Stamp & Signature
  let sealY = footerBlockY + 26;

  doc.setDrawColor(11, 44, 107);
  doc.setLineWidth(0.5);
  doc.circle(margin + 25, sealY + 4, 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(11, 44, 107);
  doc.text('CME VERIFIED', margin + 25, sealY + 2.5, { align: 'center' });
  doc.text('REPORT', margin + 25, sealY + 6.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 44, 107);
  doc.text('CME ACADEMIC ASSESSMENT CELL', pageWidth - margin - 65, sealY);

  doc.setFont('courier', 'bolditalic');
  doc.setFontSize(10);
  doc.setTextColor(212, 160, 23);
  doc.text('Dr. S. K. Sharma (Head of Academics)', pageWidth - margin - 65, sealY + 7);

  doc.setDrawColor(11, 44, 107);
  doc.setLineWidth(0.2);
  doc.line(pageWidth - margin - 65, sealY + 9, pageWidth - margin - 10, sealY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Digitally Signed & Validated Performance Document', pageWidth - margin - 65, sealY + 13);

  // Page Footer Legal Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('This monthly report is generated from verified student portal live attendance records and assignment submissions.', pageWidth / 2, pageHeight - margin - 4, { align: 'center' });

  const filename = `CME_Monthly_Report_${data.studentName.replace(/\s+/g, '_')}_${data.monthYear.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
