import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportInvoiceToPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    window.print();
    return false;
  }

  try {
    // Generate high-resolution canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for ultra-sharp crisp text & vectors
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    
    // Scale accurately to fit perfectly on 1 standard A4 sheet
    let finalWidth = pdfWidth;
    let finalHeight = (canvas.height * pdfWidth) / canvas.width;

    // If finalHeight exceeds A4 height by any amount, scale proportionally to fit 1 page
    if (finalHeight > pdfHeight) {
      const scaleRatio = pdfHeight / finalHeight;
      finalHeight = pdfHeight;
      finalWidth = pdfWidth * scaleRatio;
    }

    const xOffset = (pdfWidth - finalWidth) / 2;
    const yOffset = (pdfHeight - finalHeight) / 2;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight, undefined, 'FAST');

    const sanitizedFilename = (filename || 'Invoice-otakatikide')
      .replace(/[/\\?%*:|"<>]/g, '-')
      .trim();

    pdf.save(`${sanitizedFilename}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF with html2canvas/jspdf, falling back to window.print():', error);
    window.print();
    return false;
  }
}
