
import jsPDF from 'jspdf';

interface Vistoria {
  id: string;
  condominio: string;
  numeroInterno: string;
  dataVistoria: string;
  ambiente: string;
  status: string;
  responsavel: string;
  fotosCount: number;
  observacoes?: string;
  condominioId?: string;
  idSequencial?: number;
}

export const generateVistoriaPDF = (vistoria: Vistoria) => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Formatação de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Cabeçalho com fundo roxo (mesmo padrão do PreviewPDF)
  pdf.setFillColor(88, 69, 159); // Purple color
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text('Relatório de Vistoria Técnica - GTP', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text('Sistema de Vistorias Prediais', pageWidth / 2, 32, { align: 'center' });
  
  // Informações da vistoria em formato de grid (mesmo padrão do PreviewPDF)
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(20, 50, pageWidth - 40, 30, 'F');
  
  pdf.setFontSize(10);
  let yPos = 58;
  
  // Primeira linha
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data de emissão:', 25, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(new Date().toISOString()), 25, yPos + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Hora:', 70, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(getCurrentTime(), 70, yPos + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Usuário:', 115, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(vistoria.responsavel, 115, yPos + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Empreendimento:', 160, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(vistoria.condominio, 160, yPos + 5);
  
  // Segunda linha
  yPos += 15;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Nº interno da vistoria:', 25, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(vistoria.numeroInterno, 25, yPos + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data da vistoria:', 115, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(vistoria.dataVistoria), 115, yPos + 5);
  
  // Sistema de Vistoria (mesmo padrão do PreviewPDF)
  yPos = 95;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(88, 69, 159);
  pdf.text('Sistema de Vistoria 1', 20, yPos);
  
  yPos += 10;
  
  // Cabeçalho da tabela (mesmo padrão do PreviewPDF)
  pdf.setFillColor(88, 69, 159);
  pdf.rect(20, yPos, pageWidth - 40, 8, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  
  const colWidths = [30, 30, 30, 24, 56];
  let xPos = 20;
  
  pdf.text('Ambiente', xPos + colWidths[0]/2, yPos + 5, { align: 'center' });
  xPos += colWidths[0];
  pdf.text('Sistema', xPos + colWidths[1]/2, yPos + 5, { align: 'center' });
  xPos += colWidths[1];
  pdf.text('Subsistema', xPos + colWidths[2]/2, yPos + 5, { align: 'center' });
  xPos += colWidths[2];
  pdf.text('Status', xPos + colWidths[3]/2, yPos + 5, { align: 'center' });
  xPos += colWidths[3];
  pdf.text('Parecer', xPos + colWidths[4]/2, yPos + 5, { align: 'center' });
  
  // Linha de dados
  yPos += 8;
  pdf.setFillColor(255, 255, 255);
  pdf.rect(20, yPos, pageWidth - 40, 12, 'F');
  
  // Bordas da tabela
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.1);
  xPos = 20;
  for (let i = 0; i <= colWidths.length; i++) {
    pdf.line(xPos, yPos - 8, xPos, yPos + 12);
    if (i < colWidths.length) xPos += colWidths[i];
  }
  pdf.line(20, yPos - 8, pageWidth - 20, yPos - 8);
  pdf.line(20, yPos + 12, pageWidth - 20, yPos + 12);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  
  xPos = 20;
  pdf.text(vistoria.ambiente, xPos + colWidths[0]/2, yPos + 6, { align: 'center' });
  xPos += colWidths[0];
  pdf.text('Sistema Geral', xPos + colWidths[1]/2, yPos + 6, { align: 'center' });
  xPos += colWidths[1];
  pdf.text('Subsistema Geral', xPos + colWidths[2]/2, yPos + 6, { align: 'center' });
  xPos += colWidths[2];
  
  // Status com cor
  const statusColor = vistoria.status === 'Conforme' ? [76, 175, 80] : 
                     vistoria.status === 'Não Conforme' ? [244, 67, 54] : 
                     vistoria.status === 'N/A' ? [158, 158, 158] : [255, 193, 7];
  pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.rect(xPos + 2, yPos + 2, colWidths[3] - 4, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.text(vistoria.status, xPos + colWidths[3]/2, yPos + 6, { align: 'center' });
  
  xPos += colWidths[3];
  pdf.setTextColor(0, 0, 0);
  const parecer = vistoria.observacoes || 'Vistoria realizada conforme procedimentos';
  const parecerLines = pdf.splitTextToSize(parecer, colWidths[4] - 4);
  pdf.text(parecerLines, xPos + 2, yPos + 4);
  
  // Observações gerais se existirem
  if (vistoria.observacoes) {
    yPos += 25;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(88, 69, 159);
    pdf.text('Observações Gerais', 20, yPos);
    
    yPos += 8;
    pdf.setFillColor(248, 249, 250);
    pdf.rect(20, yPos, pageWidth - 40, 20, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const obsLines = pdf.splitTextToSize(vistoria.observacoes, pageWidth - 50);
    pdf.text(obsLines, 25, yPos + 5);
  }
  
  // Rodapé
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    `Relatório gerado automaticamente pelo Sistema de Vistorias - ${formatDate(new Date().toISOString())} às ${getCurrentTime()}`,
    20,
    pageHeight - 20
  );
  pdf.text('Página 1/1', pageWidth - 40, pageHeight - 20);
  
  // Salvar o PDF
  const fileName = `Vistoria_${vistoria.numeroInterno}_${vistoria.condominio.replace(/\s+/g, '_')}.pdf`;
  pdf.save(fileName);
  
  return fileName;
};
