
import { useToast } from '@/hooks/use-toast';
import { VistoriaAnalytics } from '@/hooks/useVistoriaAnalytics';
import { 
  createChatPDF, 
  createPDFConfig, 
  addPageFooters, 
  addSeparatorLine 
} from '@/utils/pdf/chatPdfUtils';
import { addChatPdfHeader, addReportInfo } from '@/utils/pdf/chatPdfHeader';
import { 
  addSummarySection, 
  addCondominiumSection, 
  addStatusSection, 
  addProblemsSection, 
  addActiveCondominiumsSection 
} from '@/utils/pdf/chatPdfAnalytics';
import { addTextContent, addTextReportInfo } from '@/utils/pdf/chatPdfText';

export const useChatPDFGenerator = () => {
  const { toast } = useToast();

  const generateAnalyticsPDF = async (analytics: VistoriaAnalytics, titulo: string = 'Relatório de Análise') => {
    try {
      toast({
        title: "Gerando PDF",
        description: "Preparando relatório de análise...",
      });

      const pdf = createChatPDF();
      const config = createPDFConfig(pdf);
      let currentY = 20; // margin

      // Cabeçalho
      currentY = addChatPdfHeader(
        pdf, 
        config, 
        'Relatório de Análise de Vistorias - GTP', 
        'Sistema de Vistorias Prediais'
      );

      // Informações do relatório
      currentY = addReportInfo(pdf, config, currentY, titulo);

      // Linha separadora
      currentY = addSeparatorLine(pdf, config, currentY);

      // Resumo Geral
      currentY = addSummarySection(pdf, config, currentY, analytics.totalVistorias);

      // Vistorias por Condomínio
      currentY = addCondominiumSection(pdf, config, currentY, analytics.vistoriasPorCondominio);

      // Vistorias por Status
      currentY = addStatusSection(pdf, config, currentY, analytics.vistoriasPorStatus);

      // Problemas Mais Frequentes
      currentY = addProblemsSection(pdf, config, currentY, analytics.problemasFrequentes);

      // Condomínios Mais Ativos
      addActiveCondominiumsSection(pdf, config, currentY, analytics.condominiosAtivos);

      // Rodapé em todas as páginas
      addPageFooters(pdf, config, 'Relatório gerado automaticamente pelo Sistema de Vistorias - Chat IA');

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

      const pdf = createChatPDF();
      const config = createPDFConfig(pdf);
      let currentY = 20; // margin

      // Cabeçalho
      currentY = addChatPdfHeader(
        pdf, 
        config, 
        'Relatório de Conversa - Chat IA', 
        'Sistema de Vistorias Prediais'
      );

      // Informações do relatório
      currentY = addTextReportInfo(pdf, config, currentY);

      // Linha separadora
      currentY = addSeparatorLine(pdf, config, currentY);

      // Conteúdo do texto
      addTextContent(pdf, config, currentY, content, titulo);

      // Rodapé em todas as páginas
      addPageFooters(pdf, config, 'Sistema de Vistorias - Chat IA');

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
