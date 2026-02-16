/**
 * PDF Generator Utility
 * Generate PDFs from HTML using Puppeteer
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temp directory for PDFs if it doesn't exist
const PDF_DIR = path.join(__dirname, '../../temp/pdfs');
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

/**
 * Generate PDF from HTML content
 * @param {string} htmlContent - HTML content to convert
 * @param {object} options - PDF generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generatePdfFromHtml = async (htmlContent, options = {}) => {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set content with base styles
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            h1, h2, h3 { margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f4f4f4; font-weight: bold; }
            .header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 10pt; }
            .critical { color: #d32f2f; font-weight: bold; }
            .abnormal { color: #f57c00; }
            .normal { color: #388e3c; }
            @media print {
              body { margin: 0; }
              .page-break { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    await page.setContent(styledHtml, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      margin: {
        top: options.marginTop || '20mm',
        right: options.marginRight || '15mm',
        bottom: options.marginBottom || '20mm',
        left: options.marginLeft || '15mm'
      },
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || ''
    });

    return pdfBuffer;

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * Generate diagnostic report PDF
 * @param {object} reportData - Report data
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateDiagnosticReportPdf = async (reportData) => {
  const htmlContent = `
    <div class="header">
      <h1>${reportData.hospitalName || 'Hospital Name'}</h1>
      <p>${reportData.hospitalAddress || ''}</p>
      <p>Phone: ${reportData.hospitalPhone || ''} | Email: ${reportData.hospitalEmail || ''}</p>
    </div>

    <h2 style="text-align: center; margin: 20px 0;">DIAGNOSTIC REPORT</h2>

    <table style="border: none; margin-bottom: 20px;">
      <tr>
        <td style="border: none;"><strong>Report Number:</strong> ${reportData.reportNumber || 'N/A'}</td>
        <td style="border: none;"><strong>Date:</strong> ${reportData.reportDate || new Date().toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="border: none;"><strong>Patient Name:</strong> ${reportData.patientName || 'N/A'}</td>
        <td style="border: none;"><strong>Patient ID:</strong> ${reportData.patientId || 'N/A'}</td>
      </tr>
      <tr>
        <td style="border: none;"><strong>Age/Gender:</strong> ${reportData.patientAge || 'N/A'} / ${reportData.patientGender || 'N/A'}</td>
        <td style="border: none;"><strong>Referred By:</strong> ${reportData.referringDoctor || 'Self'}</td>
      </tr>
    </table>

    <h3>Test Results</h3>
    <table>
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Result</th>
          <th>Unit</th>
          <th>Reference Range</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${(reportData.results || []).map(result => `
          <tr>
            <td>${result.testName || ''}</td>
            <td class="${result.status === 'CRITICAL' ? 'critical' : result.status === 'ABNORMAL' ? 'abnormal' : 'normal'}">
              ${result.value || 'N/A'}
            </td>
            <td>${result.unit || ''}</td>
            <td>${result.referenceRange || ''}</td>
            <td>${result.status || 'NORMAL'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    ${reportData.interpretation ? `
      <h3>Interpretation</h3>
      <p>${reportData.interpretation}</p>
    ` : ''}

    ${reportData.technician || reportData.pathologist ? `
      <div style="margin-top: 40px;">
        <table style="border: none;">
          <tr>
            ${reportData.technician ? `<td style="border: none; width: 50%;"><strong>Lab Technician:</strong><br>${reportData.technician}</td>` : ''}
            ${reportData.pathologist ? `<td style="border: none; width: 50%; text-align: right;"><strong>Pathologist:</strong><br>Dr. ${reportData.pathologist}</td>` : ''}
          </tr>
        </table>
      </div>
    ` : ''}

    <div class="footer">
      <p style="text-align: center; font-size: 9pt;">
        This is a computer-generated report. For any queries, please contact the hospital.
        <br>Report generated on: ${new Date().toLocaleString()}
      </p>
    </div>
  `;

  return generatePdfFromHtml(htmlContent, {
    displayHeaderFooter: false
  });
};

/**
 * Save PDF to file system
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} filename - Filename
 * @returns {Promise<string>} File path
 */
export const savePdfToFile = async (pdfBuffer, filename) => {
  const filePath = path.join(PDF_DIR, filename);
  await fs.promises.writeFile(filePath, pdfBuffer);
  return filePath;
};

/**
 * Clean up old PDF files (older than 24 hours)
 */
export const cleanupOldPdfs = async () => {
  try {
    const files = await fs.promises.readdir(PDF_DIR);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const file of files) {
      const filePath = path.join(PDF_DIR, file);
      const stats = await fs.promises.stat(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        await fs.promises.unlink(filePath);
        console.log(`Cleaned up old PDF: ${file}`);
      }
    }
  } catch (error) {
    console.error('PDF cleanup error:', error);
  }
};

// Schedule cleanup every hour
setInterval(cleanupOldPdfs, 60 * 60 * 1000);
