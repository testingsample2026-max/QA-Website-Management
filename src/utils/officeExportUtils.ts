/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';

// Robust helpers to resolve the actual constructor functions across any bundler/ESM/CJS context
const getJsPDF = (): any => {
  if (typeof jsPDF === 'function') return jsPDF;
  if (jsPDF && typeof (jsPDF as any).jsPDF === 'function') return (jsPDF as any).jsPDF;
  if (jsPDF && typeof (jsPDF as any).default === 'function') return (jsPDF as any).default;
  const win = window as any;
  if (win.jspdf && typeof win.jspdf.jsPDF === 'function') return win.jspdf.jsPDF;
  if (win.jsPDF && typeof win.jsPDF === 'function') return win.jsPDF;
  return jsPDF;
};

const getPptxGen = (): any => {
  if (typeof pptxgen === 'function') return pptxgen;
  if (pptxgen && typeof (pptxgen as any).default === 'function') return (pptxgen as any).default;
  const win = window as any;
  if (win.PptxGenJS && typeof win.PptxGenJS === 'function') return win.PptxGenJS;
  return pptxgen;
};

// Helper to escape special HTML characters for Word (MIME HTML) export
const escapeHTML = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Exports data to a beautifully styled Microsoft Word Document (.doc/.docx)
 * using HTML Office Schemas for maximum visual rendering compatibility.
 */
export const exportToWord = (
  title: string,
  sections: { heading: string; content: string | string[][]; isTable?: boolean; headers?: string[] }[],
  filename: string,
  websiteName: string = 'TestEngine'
) => {
  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>${escapeHTML(title)}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>90</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 8.5in 11in;
          margin: 1.0in 1.0in 1.0in 1.0in;
          mso-header-margin: .5in;
          mso-footer-margin: .5in;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          color: #1e293b;
          line-height: 1.5;
        }
        .header-title {
          font-size: 26px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 5px;
          border-bottom: 2px solid #4f46e5;
          padding-bottom: 10px;
        }
        .meta-info {
          font-size: 11px;
          color: #64748b;
          margin-bottom: 30px;
        }
        h2 {
          font-size: 18px;
          color: #0f172a;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
          margin-top: 25px;
          margin-bottom: 12px;
        }
        p {
          font-size: 13px;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
          margin-bottom: 25px;
        }
        th {
          background-color: #f1f5f9;
          color: #334155;
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
          border: 1px solid #cbd5e1;
          padding: 8px 10px;
          text-align: left;
        }
        td {
          font-size: 11px;
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          vertical-align: top;
        }
        .footer {
          margin-top: 50px;
          border-top: 1px dashed #cbd5e1;
          padding-top: 10px;
          font-size: 10px;
          color: #94a3b8;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header-title">${escapeHTML(title)}</div>
      <div class="meta-info">
        <strong>Source Platform:</strong> ${escapeHTML(websiteName)} | 
        <strong>Generated:</strong> ${new Date().toLocaleString()}
      </div>
  `;

  sections.forEach(sec => {
    htmlContent += `<h2>${escapeHTML(sec.heading)}</h2>`;

    if (sec.isTable && Array.isArray(sec.content)) {
      htmlContent += `<table><thead><tr>`;
      if (sec.headers) {
        sec.headers.forEach(h => {
          htmlContent += `<th>${escapeHTML(h)}</th>`;
        });
      }
      htmlContent += `</tr></thead><tbody>`;

      sec.content.forEach((row) => {
        htmlContent += `<tr>`;
        row.forEach(cell => {
          htmlContent += `<td>${escapeHTML(cell)}</td>`;
        });
        htmlContent += `</tr>`;
      });

      htmlContent += `</tbody></table>`;
    } else if (typeof sec.content === 'string') {
      // Split by newlines and replace with paragraphs
      const paragraphs = sec.content.split('\n');
      paragraphs.forEach(p => {
        if (p.trim()) {
          htmlContent += `<p>${escapeHTML(p)}</p>`;
        }
      });
    }
  });

  htmlContent += `
      <div class="footer">
        Quality Assurance Document | Generated securely inside the ${escapeHTML(websiteName)} Workspace Ledger.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", filename.endsWith('.doc') || filename.endsWith('.docx') ? filename : `${filename}.docx`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
};

/**
 * Exports data to a professional, multi-page, formatted PDF document.
 * Leverages native jsPDF grids, styling headers, wrapping, and table drawing.
 */
export const exportToPDF = (
  title: string,
  sections: { heading: string; content: string | string[][]; isTable?: boolean; headers?: string[] }[],
  filename: string,
  websiteName: string = 'TestEngine'
) => {
  let doc: any;
  try {
    const jsPDFClass = getJsPDF();
    doc = new jsPDFClass({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  } catch (err) {
    console.warn('Failed to construct jsPDF with getJsPDF helper, trying default...', err);
    try {
      doc = new (jsPDF as any)({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
    } catch (err2) {
      const win = window as any;
      const jsPDFLib = win.jsPDF || (win.jspdf && win.jspdf.jsPDF);
      if (jsPDFLib) {
        doc = new jsPDFLib({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
      } else {
        throw new Error('jsPDF library could not be loaded or instantiated: ' + String(err2));
      }
    }
  }

  let y = 20;
  const margin = 15;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const contentWidth = pageWidth - (margin * 2);

  const addNewPageIfNeeded = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - 15) {
      doc.addPage();
      y = 20;
      drawPageBorderAndHeader();
    }
  };

  const drawPageBorderAndHeader = () => {
    // Top fine slate line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
    
    // Header running brand text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(websiteName.toUpperCase() + ' // QUALITY COMPLIANCE LEDGER', margin, 10);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin - 20, 10);
  };

  // Main Page 1 Title
  drawPageBorderAndHeader();

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text(title, margin, y);
  y += 8;

  // Metadata block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Generated: ${new Date().toLocaleString()} | System Host: ${websiteName}`, margin, y);
  y += 12;

  sections.forEach(sec => {
    addNewPageIfNeeded(15);
    
    // Heading
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(sec.heading, margin, y);
    y += 4;
    
    // Underline
    doc.setDrawColor(79, 70, 229, 0.3);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 6;

    if (sec.isTable && Array.isArray(sec.content)) {
      const headers = sec.headers || [];
      const rows = sec.content;
      const colWidth = contentWidth / Math.max(headers.length, 1);

      // Draw Headers
      addNewPageIfNeeded(10);
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, 8, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85); // slate-700
      
      headers.forEach((h, colIdx) => {
        const truncatedHeader = h.substring(0, Math.max(10, Math.floor(colWidth / 2)));
        doc.text(truncatedHeader, margin + (colIdx * colWidth) + 3, y + 5.5);
      });
      y += 8;

      // Draw Rows
      rows.forEach((row) => {
        // Calculate max lines needed for the row cells
        let maxLines = 1;
        const cellLinesArr = row.map(cell => {
          const lines = doc.splitTextToSize(cell || '', colWidth - 5);
          if (lines.length > maxLines) maxLines = lines.length;
          return lines;
        });

        const rowHeight = (maxLines * 4.5) + 3;
        addNewPageIfNeeded(rowHeight);

        // Background alternate shading optionally (let's do simple clean borders)
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.rect(margin, y, contentWidth, rowHeight, 'S');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59); // slate-800

        cellLinesArr.forEach((lines, colIdx) => {
          lines.forEach((lineText, lineIdx) => {
            doc.text(lineText, margin + (colIdx * colWidth) + 3, y + 4.5 + (lineIdx * 4.5));
          });
        });

        y += rowHeight;
      });
      y += 6; // gap after table
    } else if (typeof sec.content === 'string') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59); // slate-800

      const paragraphs = sec.content.split('\n');
      paragraphs.forEach(p => {
        if (!p.trim()) return;
        const wrappedLines = doc.splitTextToSize(p, contentWidth);
        const paragraphHeight = wrappedLines.length * 5;
        addNewPageIfNeeded(paragraphHeight + 4);

        wrappedLines.forEach((lineText: string) => {
          doc.text(lineText, margin, y);
          y += 5;
        });
        y += 2.5; // spacing between paragraphs
      });
      y += 4; // space after section content
    }
  });

  // Footer on all pages (simply draw page count or brand info)
  const pageCount = (doc.internal as any).pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 15, pageHeight - 8);
    doc.text(`Quality Assurance Workspace | Ledger Security Verification Enforced`, margin, pageHeight - 8);
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};

/**
 * Exports data to a fully native, beautifully designed PowerPoint presentation deck (.pptx).
 * Creates custom styled master slide, bento grids, and metrics tables.
 */
export const exportToPPTX = (
  title: string,
  subtitle: string,
  slides: { title: string; bullets?: string[]; tableHeaders?: string[]; tableRows?: string[][] }[],
  filename: string,
  websiteName: string = 'TestEngine'
) => {
  let pptx: any;
  try {
    const PptxClass = getPptxGen();
    pptx = new PptxClass();
  } catch (err) {
    console.warn('Failed to construct pptxgen with getPptxGen helper, trying default...', err);
    try {
      pptx = new (pptxgen as any)();
    } catch (err2) {
      const win = window as any;
      const PptxGenLib = win.PptxGenJS || win.pptxgen;
      if (PptxGenLib) {
        pptx = new PptxGenLib();
      } else {
        throw new Error('pptxgenjs library could not be loaded or instantiated: ' + String(err2));
      }
    }
  }
  pptx.layout = 'LAYOUT_16x9';

  // Define brand styling options
  const BG_SLATE = '0F172A'; // Deep obsidian
  const BG_LIGHT = 'F8FAFC'; // Clean off-white
  const TEXT_WHITE = 'FFFFFF';
  const TEXT_DARK = '1E293B';
  const TEXT_MUTED = '64748B';
  const COLOR_INDIGO = '4F46E5';

  // Slide 1: Premium Dark Cover Slide
  const slide1 = pptx.addSlide();
  slide1.background = { color: BG_SLATE };

  // Decorative Accent Block (Indigo sidebar bar)
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.4,
    h: '100%',
    fill: { color: COLOR_INDIGO }
  });

  // Brand header text
  slide1.addText(websiteName.toUpperCase() + ' QA WORKSPACE PRESENTS', {
    x: 1.0,
    y: 1.2,
    w: '80%',
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: COLOR_INDIGO,
    fontFace: 'Arial'
  });

  // Main Slide Title
  slide1.addText(title, {
    x: 1.0,
    y: 1.8,
    w: '80%',
    h: 1.5,
    fontSize: 36,
    bold: true,
    color: TEXT_WHITE,
    fontFace: 'Arial'
  });

  // Slide Subtitle
  slide1.addText(subtitle || 'Executive Quality Status & Assurance Audit Report', {
    x: 1.0,
    y: 3.4,
    w: '80%',
    h: 0.8,
    fontSize: 16,
    color: TEXT_MUTED,
    fontFace: 'Arial'
  });

  // Date & Generation stamp in footer
  slide1.addText(`Generated on: ${new Date().toLocaleDateString()} | Access Level: Administrator Approved`, {
    x: 1.0,
    y: 4.8,
    w: '80%',
    h: 0.4,
    fontSize: 10,
    color: TEXT_MUTED,
    fontFace: 'Arial',
    italic: true
  });

  // Slides 2+: Content Slides
  slides.forEach((slideData) => {
    const s = pptx.addSlide();
    s.background = { color: BG_LIGHT };

    // Decorative top thin colored border
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { color: COLOR_INDIGO }
    });

    // Content slide Header Title
    s.addText(slideData.title, {
      x: 0.8,
      y: 0.4,
      w: '85%',
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: TEXT_DARK,
      fontFace: 'Arial'
    });

    // Fine underline
    s.addShape(pptx.ShapeType.line, {
      x: 0.8,
      y: 1.0,
      w: 2.0,
      h: 0,
      line: { color: COLOR_INDIGO, width: 2 }
    });

    // Render Table if available
    if (slideData.tableHeaders && slideData.tableRows) {
      const headers = slideData.tableHeaders;
      const rows = slideData.tableRows;

      // Construct table rows with pptxgen specifications
      const formattedRows: any[] = [];
      
      // Header row
      const headerRowCells = headers.map(h => ({
        text: h,
        options: {
          fill: COLOR_INDIGO,
          color: TEXT_WHITE,
          bold: true,
          fontSize: 9,
          align: 'left',
          valign: 'middle'
        }
      }));
      formattedRows.push(headerRowCells);

      // Data rows
      rows.forEach((row, rIdx) => {
        const rowCells = row.map(cell => ({
          text: cell || '',
          options: {
            fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F1F5F9', // Zebra layout shading
            color: TEXT_DARK,
            fontSize: 8,
            align: 'left',
            valign: 'top'
          }
        }));
        formattedRows.push(rowCells);
      });

      // Add Table to Slide (limit height and scale)
      s.addTable(formattedRows, {
        x: 0.8,
        y: 1.4,
        w: 8.4,
        colW: Array(headers.length).fill(8.4 / headers.length),
        border: { type: 'solid', color: 'CBD5E1', pt: 1 }
      });
    } else if (slideData.bullets) {
      // Bullet points content
      const bulletObjects = slideData.bullets.map(b => ({
        text: b,
        options: { bullet: true, fontSize: 13, color: TEXT_DARK, fontFace: 'Arial' }
      }));

      s.addText(bulletObjects, {
        x: 0.8,
        y: 1.4,
        w: 8.5,
        h: 3.5,
        valign: 'top'
      });
    }

    // Running footer
    s.addText(`${websiteName} Quality Portal`, {
      x: 0.8,
      y: 5.2,
      w: 4.0,
      h: 0.3,
      fontSize: 8,
      color: TEXT_MUTED,
      fontFace: 'Arial'
    });
  });

  pptx.writeFile({ fileName: filename.endsWith('.pptx') ? filename : `${filename}.pptx` });
};
