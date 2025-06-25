
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { VistoriaAnalytics } from '@/hooks/useVistoriaAnalytics';

export const useChatPDFGenerator = () => {
  const { toast } = useToast();

  const generateAnalyticsPDF = async (analytics: VistoriaAnalytics, titulo: string = 'Relatório de Análise') => {
    try {
      toast({
        title: "Gerando PDF",
        description: "Preparando relatório de análise...",
      });

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        compress: true
      });

      // Configurações de página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Cabeçalho
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(titulo, margin, currentY);
      currentY += 15;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, currentY);
      currentY += 20;

      // Linha separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Resumo Geral
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Geral', margin, currentY);
      currentY += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total de Vistorias: ${analytics.totalVistorias}`, margin, currentY);
      currentY += 15;

      // Vistorias por Condomínio
      if (Object.keys(analytics.vistoriasPorCondominio).length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Vistorias por Condomínio', margin, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        Object.entries(analytics.vistoriasPorCondominio)
          .sort(([,a], [,b]) => b - a)
          .forEach(([nome, count]) => {
            // Verificar se precisa de nova página
            if (currentY > pageHeight - 30) {
              pdf.addPage();
              currentY = margin;
            }
            
            const text = `• ${nome}: ${count} vistoria${count !== 1 ? 's' : ''}`;
            pdf.text(text, margin + 5, currentY);
            currentY += 6;
          });
        currentY += 10;
      }

      // Vistorias por Status
      if (Object.keys(analytics.vistoriasPorStatus).length > 0) {
        // Verificar se precisa de nova página
        if (currentY > pageHeight - 50) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Vistorias por Status', margin, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        Object.entries(analytics.vistoriasPorStatus).forEach(([status, count]) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
          
          const text = `• ${status}: ${count} vistoria${count !== 1 ? 's' : ''}`;
          pdf.text(text, margin + 5, currentY);
          currentY += 6;
        });
        currentY += 10;
      }

      // Problemas Mais Frequentes
      if (analytics.problemasFrequentes.length > 0) {
        // Verificar se precisa de nova página
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Problemas Mais Frequentes', margin, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        analytics.problemasFrequentes.slice(0, 10).forEach((problema, index) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
          
          const text = `${index + 1}. ${problema.item} (${problema.count} ocorrência${problema.count !== 1 ? 's' : ''})`;
          const lines = pdf.splitTextToSize(text, contentWidth - 10);
          
          lines.forEach((line: string) => {
            pdf.text(line, margin + 5, currentY);
            currentY += 6;
          });
          currentY += 2;
        });
        currentY += 10;
      }

      // Condomínios Mais Ativos
      if (analytics.condominiosAtivos.length > 0) {
        // Verificar se precisa de nova página
        if (currentY > pageHeight - 50) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Condomínios Mais Ativos', margin, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        analytics.condominiosAtivos.slice(0, 5).forEach((condominio, index) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
          
          const text = `${index + 1}. ${condominio.nome} (${condominio.totalVistorias} vistoria${condominio.totalVistorias !== 1 ? 's' : ''})`;
          pdf.text(text, margin + 5, currentY);
          currentY += 6;
        });
      }

      // Rodapé em todas as páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
        pdf.text('Sistema de Vistorias - Relatório Gerado Automaticamente', margin, pageHeight - 10);
      }

      // Salvar o PDF
      const fileName = `Relatorio_Analise_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Gerado",
        description: "Relatório de análise baixado com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro na Geração do PDF",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const generateTextReportPDF = async (content: string, titulo: string = 'Relatório do Chat') => {
    try {
      toast({
        title: "Gerando PDF",
        description: "Preparando relatório de texto...",
      });

      const pdf = new jsPDF({
        unit: "mm",
        format: "a4",
        compress: true
      });

      // Configurações de página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Cabeçalho
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text(titulo, margin, currentY);
      currentY += 12;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, currentY);
      currentY += 15;

      // Linha separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Conteúdo
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      // Dividir o texto em linhas que cabem na página
      const lines = pdf.splitTextToSize(content, contentWidth);
      
      lines.forEach((line: string) => {
        // Verificar se precisa de nova página
        if (currentY > pageHeight - 30) {
          pdf.addPage();
          currentY = margin;
        }
        
        pdf.text(line, margin, currentY);
        currentY += 6;
      });

      // Rodapé em todas as páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
        pdf.text('Sistema de Vistorias - Chat IA', margin, pageHeight - 10);
      }

      // Salvar o PDF
      const fileName = `Relatorio_Chat_${new Date().getTime()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Gerado",
        description: "Relatório de texto baixado com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro na Geração do PDF",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return {
    generateAnalyticsPDF,
    generateTextReportPDF
  };
};
