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

      // Cabeçalho com fundo GTP
      pdf.setFillColor(34, 32, 117); // #222075 convertido para RGB
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Adicionar logos GTP
      try {
        // Logo esquerda
        const logoLeft = '/lovable-uploads/9e07dcd0-b996-4996-9028-7daeb90e3140.png';
        pdf.addImage(logoLeft, 'PNG', 10, 8, 24, 24);
        
        // Logo direita
        const logoRight = '/lovable-uploads/bfe02df4-f545-4232-ad0a-e69690083a38.png';
        pdf.addImage(logoRight, 'PNG', pageWidth - 34, 8, 24, 24);
      } catch (logoError) {
        console.warn('Erro ao carregar logos:', logoError);
      }
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Análise de Vistorias - GTP', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sistema de Vistorias Prediais', pageWidth / 2, 30, { align: 'center' });
      
      currentY = 50;

      // Informações do relatório (similar ao layout de vistoria)
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, currentY, contentWidth, 25, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      
      // Grid de informações
      const infoY = currentY + 8;
      pdf.text('Data de emissão:', margin + 5, infoY);
      pdf.text('Hora:', margin + 50, infoY);
      pdf.text('Sistema:', margin + 90, infoY);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date().toLocaleDateString('pt-BR'), margin + 5, infoY + 5);
      pdf.text(new Date().toLocaleTimeString('pt-BR'), margin + 50, infoY + 5);
      pdf.text('Chat IA - Análise de Dados', margin + 90, infoY + 5);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Título do Relatório:', margin + 5, infoY + 12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(titulo, margin + 5, infoY + 17);
      
      currentY += 35;

      // Linha separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Resumo Geral com destaque
      pdf.setFillColor(34, 32, 117); // Mesma cor do cabeçalho
      pdf.rect(margin, currentY, contentWidth, 8, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Geral', margin + 5, currentY + 6);
      currentY += 15;

      // Caixa destacada para total de vistorias
      pdf.setDrawColor(34, 32, 117); // Mesma cor do cabeçalho
      pdf.setLineWidth(1);
      pdf.rect(margin, currentY, contentWidth, 20);
      
      pdf.setTextColor(34, 32, 117); // Mesma cor do cabeçalho
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(analytics.totalVistorias.toString(), pageWidth / 2, currentY + 10, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Total de Vistorias', pageWidth / 2, currentY + 16, { align: 'center' });
      currentY += 30;

      // Vistorias por Condomínio
      if (Object.keys(analytics.vistoriasPorCondominio).length > 0) {
        // Verificar se precisa de nova página
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = margin;
        }

        // Cabeçalho da seção
        pdf.setFillColor(30, 144, 255);
        pdf.rect(margin, currentY, contentWidth, 8, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Vistorias por Condomínio', margin + 5, currentY + 6);
        currentY += 15;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        Object.entries(analytics.vistoriasPorCondominio)
          .sort(([,a], [,b]) => b - a)
          .forEach(([nome, count]) => {
            if (currentY > pageHeight - 30) {
              pdf.addPage();
              currentY = margin;
            }
            
            // Linha com fundo alternado
            pdf.setFillColor(248, 249, 250);
            pdf.rect(margin, currentY - 2, contentWidth, 6, 'F');
            
            pdf.text(`• ${nome}`, margin + 5, currentY + 2);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${count} vistoria${count !== 1 ? 's' : ''}`, pageWidth - margin - 30, currentY + 2);
            pdf.setFont('helvetica', 'normal');
            currentY += 8;
          });
        currentY += 10;
      }

      // Vistorias por Status
      if (Object.keys(analytics.vistoriasPorStatus).length > 0) {
        if (currentY > pageHeight - 50) {
          pdf.addPage();
          currentY = margin;
        }

        // Cabeçalho da seção
        pdf.setFillColor(147, 51, 234);
        pdf.rect(margin, currentY, contentWidth, 8, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Vistorias por Status', margin + 5, currentY + 6);
        currentY += 15;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        Object.entries(analytics.vistoriasPorStatus).forEach(([status, count]) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
          
          // Cor do status
          let statusColor = [128, 128, 128]; // Cinza padrão
          if (status.toLowerCase().includes('conclu')) statusColor = [34, 197, 94]; // Verde
          else if (status.toLowerCase().includes('andamento')) statusColor = [234, 179, 8]; // Amarelo
          else if (status.toLowerCase().includes('pendente')) statusColor = [239, 68, 68]; // Vermelho
          
          pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2], 0.1);
          pdf.rect(margin, currentY - 2, contentWidth, 6, 'F');
          
          pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
          pdf.text(`• ${status}`, margin + 5, currentY + 2);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${count} vistoria${count !== 1 ? 's' : ''}`, pageWidth - margin - 30, currentY + 2);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          currentY += 8;
        });
        currentY += 10;
      }

      // Problemas Mais Frequentes
      if (analytics.problemasFrequentes.length > 0) {
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = margin;
        }

        // Cabeçalho da seção
        pdf.setFillColor(239, 68, 68);
        pdf.rect(margin, currentY, contentWidth, 8, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Problemas Mais Frequentes', margin + 5, currentY + 6);
        currentY += 15;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        analytics.problemasFrequentes.slice(0, 10).forEach((problema, index) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
          
          // Fundo destacado para problemas
          pdf.setFillColor(254, 242, 242);
          pdf.rect(margin, currentY - 2, contentWidth, 8, 'F');
          
          pdf.setTextColor(185, 28, 28);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}.`, margin + 5, currentY + 2);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          
          const text = `${problema.item}`;
          const lines = pdf.splitTextToSize(text, contentWidth - 40);
          
          lines.forEach((line: string, lineIndex: number) => {
            pdf.text(line, margin + 15, currentY + 2 + (lineIndex * 4));
          });
          
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(185, 28, 28);
          pdf.text(`${problema.count} ocorrência${problema.count !== 1 ? 's' : ''}`, pageWidth - margin - 35, currentY + 2);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          
          currentY += Math.max(8, lines.length * 4 + 4);
        });
        currentY += 10;
      }

      // Condomínios Mais Ativos
      if (analytics.condominiosAtivos.length > 0) {
        if (currentY > pageHeight - 50) {
          pdf.addPage();
          currentY = margin;
        }

        // Cabeçalho da seção
        pdf.setFillColor(34, 197, 94);
        pdf.rect(margin, currentY, contentWidth, 8, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Condomínios Mais Ativos', margin + 5, currentY + 6);
        currentY += 15;

        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        analytics.condominiosAtivos.slice(0, 5).forEach((condominio, index) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }
          
          // Fundo destacado para condomínios ativos
          pdf.setFillColor(240, 253, 244);
          pdf.rect(margin, currentY - 2, contentWidth, 6, 'F');
          
          pdf.setTextColor(34, 197, 94);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}.`, margin + 5, currentY + 2);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          pdf.text(`${condominio.nome}`, margin + 15, currentY + 2);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(34, 197, 94);
          pdf.text(`${condominio.totalVistorias} vistoria${condominio.totalVistorias !== 1 ? 's' : ''}`, pageWidth - margin - 35, currentY + 2);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          currentY += 8;
        });
      }

      // Rodapé em todas as páginas (similar ao relatório de vistoria)
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
        pdf.text('Relatório gerado automaticamente pelo Sistema de Vistorias - Chat IA', margin, pageHeight - 10);
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

      // Cabeçalho com fundo GTP
      pdf.setFillColor(34, 32, 117); // #222075 convertido para RGB
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Adicionar logos GTP
      try {
        // Logo esquerda
        const logoLeft = '/lovable-uploads/9e07dcd0-b996-4996-9028-7daeb90e3140.png';
        pdf.addImage(logoLeft, 'PNG', 10, 8, 24, 24);
        
        // Logo direita
        const logoRight = '/lovable-uploads/bfe02df4-f545-4232-ad0a-e69690083a38.png';
        pdf.addImage(logoRight, 'PNG', pageWidth - 34, 8, 24, 24);
      } catch (logoError) {
        console.warn('Erro ao carregar logos:', logoError);
      }
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Conversa - Chat IA', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Sistema de Vistorias Prediais', pageWidth / 2, 30, { align: 'center' });
      
      currentY = 50;

      // Informações do relatório
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, currentY, contentWidth, 20, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data de emissão:', margin + 5, currentY + 8);
      pdf.text('Hora:', margin + 50, currentY + 8);
      pdf.text('Sistema:', margin + 90, currentY + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date().toLocaleDateString('pt-BR'), margin + 5, currentY + 13);
      pdf.text(new Date().toLocaleTimeString('pt-BR'), margin + 50, currentY + 13);
      pdf.text('Chat IA - Conversa Completa', margin + 90, currentY + 13);
      
      currentY += 30;

      // Linha separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      // Título do conteúdo
      pdf.setFillColor(34, 32, 117); // Mesma cor do cabeçalho
      pdf.rect(margin, currentY, contentWidth, 8, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(titulo, margin + 5, currentY + 6);
      currentY += 15;

      // Conteúdo
      pdf.setTextColor(0, 0, 0);
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
        description: "Relatório de conversa baixado com sucesso.",
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
