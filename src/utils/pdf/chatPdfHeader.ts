
import jsPDF from 'jspdf';
import { PDFConfig } from './chatPdfUtils';

export const addChatPdfHeader = (
  pdf: jsPDF, 
  config: PDFConfig, 
  title: string, 
  subtitle: string
): number => {
  // Cabeçalho com fundo GTP
  pdf.setFillColor(34, 32, 117); // #222075 convertido para RGB
  pdf.rect(0, 0, config.pageWidth, 40, 'F');
  
  // Adicionar logos GTP
  try {
    // Logo esquerda
    const logoLeft = '/lovable-uploads/9e07dcd0-b996-4996-9028-7daeb90e3140.png';
    pdf.addImage(logoLeft, 'PNG', 10, 8, 24, 24);
    
    // Logo direita
    const logoRight = '/lovable-uploads/bfe02df4-f545-4232-ad0a-e69690083a38.png';
    pdf.addImage(logoRight, 'PNG', config.pageWidth - 34, 8, 24, 24);
  } catch (logoError) {
    console.warn('Erro ao carregar logos:', logoError);
  }
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, config.pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(subtitle, config.pageWidth / 2, 30, { align: 'center' });
  
  return 50; // Retorna a posição Y após o cabeçalho
};

export const addReportInfo = (pdf: jsPDF, config: PDFConfig, currentY: number, reportTitle: string): number => {
  // Informações do relatório
  pdf.setFillColor(245, 245, 245);
  pdf.rect(config.margin, currentY, config.contentWidth, 25, 'F');
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  // Grid de informações
  const infoY = currentY + 8;
  pdf.text('Data de emissão:', config.margin + 5, infoY);
  pdf.text('Hora:', config.margin + 50, infoY);
  pdf.text('Sistema:', config.margin + 90, infoY);
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(new Date().toLocaleDateString('pt-BR'), config.margin + 5, infoY + 5);
  pdf.text(new Date().toLocaleTimeString('pt-BR'), config.margin + 50, infoY + 5);
  pdf.text('Chat IA - Análise de Dados', config.margin + 90, infoY + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Título do Relatório:', config.margin + 5, infoY + 12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(reportTitle, config.margin + 5, infoY + 17);
  
  return currentY + 35;
};
