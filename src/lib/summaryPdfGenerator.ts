import { jsPDF } from 'jspdf';

export interface LectureSummaryData {
  title: string;
  subject: string;
  teacherName: string;
  studentClass: string;
  recordedAt: string;
  executiveSummary: string;
  keyTakeaways: string[];
  criticalFormulas: string[];
  examTips: string[];
  studentName?: string;
}

export function generateLectureSummaryPDF(data: LectureSummaryData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const navy = '#0B2C6B';
  const gold = '#D4A017';
  const darkGray = '#1E293B';
  const lightBg = '#F8FAFC';

  // 1. TOP HEADER BANNER
  doc.setFillColor(11, 44, 107); // #0B2C6B
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Accent Line
  doc.setFillColor(212, 160, 23); // #D4A017
  doc.rect(0, 32, pageWidth, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CONCEPT MADE EASY CLASSES', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('REVISION CHEAT SHEET & LECTURE SUMMARY', margin, 18);

  doc.setFontSize(8);
  doc.setTextColor(212, 160, 23);
  doc.text(`Class ${data.studentClass} | ${data.subject} | Faculty: ${data.teacherName}`, margin, 25);

  const formattedDate = new Date(data.recordedAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Generated: ${formattedDate}`, pageWidth - margin - 35, 12);
  if (data.studentName) {
    doc.text(`Student: ${data.studentName}`, pageWidth - margin - 35, 18);
  }

  let yCursor = 42;

  // 2. LECTURE TITLE BOX
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, yCursor, contentWidth, 18, 3, 3, 'FD');

  doc.setTextColor(11, 44, 107);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  
  // Truncate or wrap title
  const rawTitle = (data.title || 'Lecture Summary').toUpperCase();
  const titleLines = doc.splitTextToSize(rawTitle, contentWidth - 10);
  doc.text(titleLines[0] || rawTitle, margin + 5, yCursor + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('AI-Synthesized High-Yield Lecture Takeaways for Fast Revision', margin + 5, yCursor + 14);

  yCursor += 24;

  // 3. EXECUTIVE SUMMARY
  doc.setFillColor(254, 243, 199); // Light yellow box
  doc.setDrawColor(212, 160, 23);
  
  const execLines = doc.splitTextToSize(data.executiveSummary || 'No executive summary provided.', contentWidth - 12);
  const execBoxHeight = Math.max(16, ((execLines || []).length * 4) + 10);

  doc.roundedRect(margin, yCursor, contentWidth, execBoxHeight, 2, 2, 'FD');

  doc.setTextColor(11, 44, 107);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CORE OVERVIEW', margin + 5, yCursor + 6);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(execLines, margin + 5, yCursor + 11);

  yCursor += execBoxHeight + 8;

  // 4. KEY TAKEAWAYS & CONCEPTS
  doc.setTextColor(11, 44, 107);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('KEY TAKEAWAYS & CONCEPTUAL BULLETS', margin, yCursor);
  
  doc.setDrawColor(212, 160, 23);
  doc.setLineWidth(0.5);
  doc.line(margin, yCursor + 2, margin + 80, yCursor + 2);

  yCursor += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  (data.keyTakeaways || []).forEach((item) => {
    if (yCursor > pageHeight - 25) {
      doc.addPage();
      yCursor = 20;
    }

    // Bullet point symbol
    doc.setFillColor(212, 160, 23);
    doc.circle(margin + 2, yCursor - 1, 1, 'F');

    const splitBullet = doc.splitTextToSize(item || '', contentWidth - 10);
    doc.text(splitBullet, margin + 6, yCursor);
    yCursor += ((splitBullet || []).length * 4) + 2;
  });

  yCursor += 4;

  // 5. CRITICAL FORMULAS & DEFINITIONS
  if (data.criticalFormulas && (data.criticalFormulas || []).length > 0) {
    if (yCursor > pageHeight - 45) {
      doc.addPage();
      yCursor = 20;
    }

    doc.setTextColor(11, 44, 107);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CRITICAL FORMULAS & DEFINITIONS', margin, yCursor);

    doc.setDrawColor(212, 160, 23);
    doc.line(margin, yCursor + 2, margin + 75, yCursor + 2);

    yCursor += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    (data.criticalFormulas || []).forEach((formula) => {
      if (yCursor > pageHeight - 25) {
        doc.addPage();
        yCursor = 20;
      }

      doc.setFillColor(238, 242, 255); // Indigo light
      doc.setDrawColor(199, 210, 254);
      
      const splitFormula = doc.splitTextToSize(formula || '', contentWidth - 12);
      const boxH = ((splitFormula || []).length * 4) + 4;

      doc.roundedRect(margin, yCursor - 3, contentWidth, boxH, 1.5, 1.5, 'FD');

      doc.setTextColor(11, 44, 107);
      doc.setFont('helvetica', 'bold');
      doc.text(splitFormula, margin + 4, yCursor + 1);

      yCursor += boxH + 3;
    });

    yCursor += 4;
  }

  // 6. HIGH-YIELD EXAM TIPS
  if (data.examTips && (data.examTips || []).length > 0) {
    if (yCursor > pageHeight - 40) {
      doc.addPage();
      yCursor = 20;
    }

    doc.setTextColor(11, 44, 107);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('HIGH-YIELD BOARD EXAM TIPS & TRAPS', margin, yCursor);

    doc.setDrawColor(212, 160, 23);
    doc.line(margin, yCursor + 2, margin + 75, yCursor + 2);

    yCursor += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9); // Amber text

    (data.examTips || []).forEach((tip) => {
      if (yCursor > pageHeight - 25) {
        doc.addPage();
        yCursor = 20;
      }

      doc.setFillColor(254, 243, 199);
      doc.setDrawColor(251, 191, 36);

      const splitTip = doc.splitTextToSize(`⚠️ ${tip || ''}`, contentWidth - 10);
      const tipBoxH = ((splitTip || []).length * 4) + 4;

      doc.roundedRect(margin, yCursor - 3, contentWidth, tipBoxH, 1.5, 1.5, 'FD');
      doc.text(splitTip, margin + 4, yCursor + 1);

      yCursor += tipBoxH + 3;
    });
  }

  // FOOTER AT BOTTOM
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(11, 44, 107);
    doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text('Concept Made Easy Classes | Academic Excellence & Revision Desk', margin, pageHeight - 4);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 4);
  }

  // Save the PDF
  const filename = `CME_Lecture_Summary_${(data.title || 'Summary').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.pdf`;
  doc.save(filename);
}
