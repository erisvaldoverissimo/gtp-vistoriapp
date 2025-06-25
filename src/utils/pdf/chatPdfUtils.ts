
import jsPDF from 'jspdf';

export interface PDFConfig {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
}

export const createPDFConfig = (pdf: jsPDF): PDFConfig => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  return { pageWidth, pageHeight, margin, contentWidth };
};

export const createChatPDF = (): jsPDF => {
  return new jsPDF({
    unit: "mm",
    format: "a4",
    compress: true
  });
};

export const addPageFooters = (pdf: jsPDF, config: PDFConfig, footerText: string): void => {
  const totalPages = pdf.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Página ${i} de ${totalPages}`, config.pageWidth - config.margin - 20, config.pageHeight - 10);
    pdf.text(footerText, config.margin, config.pageHeight - 10);
  }
};

export const addSeparatorLine = (pdf: jsPDF, config: PDFConfig, currentY: number): number => {
  pdf.setDrawColor(200, 200, 200);
  pdf.line(config.margin, currentY, config.pageWidth - config.margin, currentY);
  return currentY + 10;
};

export const checkPageBreak = (pdf: jsPDF, config: PDFConfig, currentY: number, requiredSpace: number): number => {
  if (currentY > config.pageHeight - requiredSpace) {
    pdf.addPage();
    return config.margin;
  }
  return currentY;
};
