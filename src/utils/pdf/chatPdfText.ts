
import jsPDF from 'jspdf';
import { PDFConfig, checkPageBreak } from './chatPdfUtils';

export const addTextContent = (
  pdf: jsPDF, 
  config: PDFConfig, 
  currentY: number, 
  content: string, 
  titulo: string
): number => {
  // Título do conteúdo
  pdf.setFillColor(34, 32, 117); // Mesma cor do cabeçalho
  pdf.rect(config.margin, currentY, config.contentWidth, 8, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(titulo, config.margin + 5, currentY + 6);
  currentY += 15;

  // Conteúdo
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  // Dividir o texto em linhas que cabem na página
  const lines = pdf.splitTextToSize(content, config.contentWidth);
  
  lines.forEach((line: string) => {
    // Verificar se precisa de nova página
    currentY = checkPageBreak(pdf, config, currentY, 30);
    
    pdf.text(line, config.margin, currentY);
    currentY += 6;
  });

  return currentY;
};

export const addTextReportInfo = (pdf: jsPDF, config: PDFConfig, currentY: number): number => {
  // Informações do relatório
  pdf.setFillColor(245, 245, 245);
  pdf.rect(config.margin, currentY, config.contentWidth, 20, 'F');
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data de emissão:', config.margin + 5, currentY + 8);
  pdf.text('Hora:', config.margin + 50, currentY + 8);
  pdf.text('Sistema:', config.margin + 90, currentY + 8);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date().toLocaleDateString('pt-BR'), config.margin + 5, currentY + 13);
  pdf.text(new Date().toLocaleTimeString('pt-BR'), config.margin + 50, currentY + 13);
  pdf.text('Chat IA - Conversa Completa', config.margin + 90, currentY + 13);
  
  return currentY + 30;
};
