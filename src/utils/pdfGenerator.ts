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
    
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // If height fits within single A4 page or needs slight vertical adjustment
    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Multi-page handling if invoice has dozens of line items
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

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
