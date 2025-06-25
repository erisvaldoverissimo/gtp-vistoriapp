
import jsPDF from 'jspdf';
import { PDFConfig, checkPageBreak } from './chatPdfUtils';
import { VistoriaAnalytics } from '@/hooks/useVistoriaAnalytics';

export const addSummarySection = (
  pdf: jsPDF, 
  config: PDFConfig, 
  currentY: number, 
  totalVistorias: number
): number => {
  // Resumo Geral com destaque
  pdf.setFillColor(34, 32, 117); // Mesma cor do cabeçalho
  pdf.rect(config.margin, currentY, config.contentWidth, 8, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumo Geral', config.margin + 5, currentY + 6);
  currentY += 15;

  // Caixa destacada para total de vistorias
  pdf.setDrawColor(34, 32, 117); // Mesma cor do cabeçalho
  pdf.setLineWidth(1);
  pdf.rect(config.margin, currentY, config.contentWidth, 20);
  
  pdf.setTextColor(34, 32, 117); // Mesma cor do cabeçalho
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(totalVistorias.toString(), config.pageWidth / 2, currentY + 10, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Total de Vistorias', config.pageWidth / 2, currentY + 16, { align: 'center' });
  
  return currentY + 30;
};

export const addCondominiumSection = (
  pdf: jsPDF, 
  config: PDFConfig, 
  currentY: number, 
  vistoriasPorCondominio: { [key: string]: number }
): number => {
  if (Object.keys(vistoriasPorCondominio).length === 0) return currentY;

  currentY = checkPageBreak(pdf, config, currentY, 60);

  // Cabeçalho da seção
  pdf.setFillColor(30, 144, 255);
  pdf.rect(config.margin, currentY, config.contentWidth, 8, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Vistorias por Condomínio', config.margin + 5, currentY + 6);
  currentY += 15;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  Object.entries(vistoriasPorCondominio)
    .sort(([,a], [,b]) => b - a)
    .forEach(([nome, count]) => {
      currentY = checkPageBreak(pdf, config, currentY, 30);
      
      // Linha com fundo alternado
      pdf.setFillColor(248, 249, 250);
      pdf.rect(config.margin, currentY - 2, config.contentWidth, 6, 'F');
      
      pdf.text(`• ${nome}`, config.margin + 5, currentY + 2);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${count} vistoria${count !== 1 ? 's' : ''}`, config.pageWidth - config.margin - 30, currentY + 2);
      pdf.setFont('helvetica', 'normal');
      currentY += 8;
    });
  
  return currentY + 10;
};

export const addStatusSection = (
  pdf: jsPDF, 
  config: PDFConfig, 
  currentY: number, 
  vistoriasPorStatus: { [key: string]: number }
): number => {
  if (Object.keys(vistoriasPorStatus).length === 0) return currentY;

  currentY = checkPageBreak(pdf, config, currentY, 50);

  // Cabeçalho da seção
  pdf.setFillColor(147, 51, 234);
  pdf.rect(config.margin, currentY, config.contentWidth, 8, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Vistorias por Status', config.margin + 5, currentY + 6);
  currentY += 15;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  Object.entries(vistoriasPorStatus).forEach(([status, count]) => {
    currentY = checkPageBreak(pdf, config, currentY, 30);
    
    // Cor do status
    let statusColor = [128, 128, 128]; // Cinza padrão
    if (status.toLowerCase().includes('conclu')) statusColor = [34, 197, 94]; // Verde
    else if (status.toLowerCase().includes('andamento')) statusColor = [234, 179, 8]; // Amarelo
    else if (status.toLowerCase().includes('pendente')) statusColor = [239, 68, 68]; // Vermelho
    
    pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2], 0.1);
    pdf.rect(config.margin, currentY - 2, config.contentWidth, 6, 'F');
    
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(`• ${status}`, config.margin + 5, currentY + 2);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${count} vistoria${count !== 1 ? 's' : ''}`, config.pageWidth - config.margin - 30, currentY + 2);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    currentY += 8;
  });
  
  return currentY + 10;
};

export const addProblemsSection = (
  pdf: jsPDF, 
  config: PDFConfig, 
  currentY: number, 
  problemasFrequentes: { item: string; count: number }[]
): number => {
  if (problemasFrequentes.length === 0) return currentY;

  currentY = checkPageBreak(pdf, config, currentY, 60);

  // Cabeçalho da seção
  pdf.setFillColor(239, 68, 68);
  pdf.rect(config.margin, currentY, config.contentWidth, 8, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Problemas Mais Frequentes', config.margin + 5, currentY + 6);
  currentY += 15;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  problemasFrequentes.slice(0, 10).forEach((problema, index) => {
    currentY = checkPageBreak(pdf, config, currentY, 30);
    
    // Fundo destacado para problemas
    pdf.setFillColor(254, 242, 242);
    pdf.rect(config.margin, currentY - 2, config.contentWidth, 8, 'F');
    
    pdf.setTextColor(185, 28, 28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}.`, config.margin + 5, currentY + 2);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const text = `${problema.item}`;
    const lines = pdf.splitTextToSize(text, config.contentWidth - 40);
    
    lines.forEach((line: string, lineIndex: number) => {
      pdf.text(line, config.margin + 15, currentY + 2 + (lineIndex * 4));
    });
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(185, 28, 28);
    pdf.text(`${problema.count} ocorrência${problema.count !== 1 ? 's' : ''}`, config.pageWidth - config.margin - 35, currentY + 2);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    currentY += Math.max(8, lines.length * 4 + 4);
  });
  
  return currentY + 10;
};

export const addActiveCondominiumsSection = (
  pdf: jsPDF, 
  config: PDFConfig, 
  currentY: number, 
  condominiosAtivos: { id: string; nome: string; totalVistorias: number }[]
): number => {
  if (condominiosAtivos.length === 0) return currentY;

  currentY = checkPageBreak(pdf, config, currentY, 50);

  // Cabeçalho da seção
  pdf.setFillColor(34, 197, 94);
  pdf.rect(config.margin, currentY, config.contentWidth, 8, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Condomínios Mais Ativos', config.margin + 5, currentY + 6);
  currentY += 15;

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  condominiosAtivos.slice(0, 5).forEach((condominio, index) => {
    currentY = checkPageBreak(pdf, config, currentY, 30);
    
    // Fundo destacado para condomínios ativos
    pdf.setFillColor(240, 253, 244);
    pdf.rect(config.margin, currentY - 2, config.contentWidth, 6, 'F');
    
    pdf.setTextColor(34, 197, 94);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}.`, config.margin + 5, currentY + 2);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${condominio.nome}`, config.margin + 15, currentY + 2);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(34, 197, 94);
    pdf.text(`${condominio.totalVistorias} vistoria${condominio.totalVistorias !== 1 ? 's' : ''}`, config.pageWidth - config.margin - 35, currentY + 2);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    currentY += 8;
  });

  return currentY;
};
