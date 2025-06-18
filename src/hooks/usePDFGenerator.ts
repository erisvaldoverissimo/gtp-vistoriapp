
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import { preloadImages } from '@/utils/pdf/imageUtils';
import { createPDF, processPageWithFallback, addImageToPDF } from '@/utils/pdf/pdfUtils';
import { getErrorMessage, validatePages } from '@/utils/pdf/errorUtils';

export const usePDFGenerator = () => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async (vistoria: VistoriaSupabase) => {
    if (!reportRef.current) {
      toast({
        title: "Erro",
        description: "Referência do relatório não encontrada.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('=== INICIANDO GERAÇÃO DO PDF ===');
      console.log('Vistoria:', vistoria.numero_interno);
      
      toast({
        title: "Gerando PDF",
        description: "Preparando conteúdo...",
      });

      // Aguardar um momento para o DOM se estabilizar
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validar e buscar páginas
      const pages = validatePages(reportRef.current);

      toast({
        title: "Gerando PDF",
        description: "Carregando imagens...",
      });

      await preloadImages(reportRef.current);

      toast({
        title: "Gerando PDF",
        description: "Processando páginas...",
      });

      const pdf = createPDF();
      let paginasProcessadas = 0;
      const errosPorPagina = [];

      for (let i = 0; i < pages.length; i++) {
        toast({
          title: "Gerando PDF",
          description: `Processando página ${i + 1} de ${pages.length}...`,
        });

        try {
          const imageData = await processPageWithFallback(pages[i], i);
          addImageToPDF(pdf, imageData, i > 0);
          paginasProcessadas++;
          console.log(`✅ Página ${i + 1} processada com sucesso (Total processadas: ${paginasProcessadas})`);
        } catch (pageError) {
          errosPorPagina.push(`Página ${i + 1}: ${pageError.message}`);
          
          // Se é a primeira página e falhou, é erro crítico
          if (i === 0 && paginasProcessadas === 0) {
            throw pageError;
          }
        }
      }

      if (paginasProcessadas === 0) {
        console.error('=== ERRO CRÍTICO ===');
        console.error('Erros por página:', errosPorPagina);
        throw new Error('Nenhuma página foi processada com sucesso. Erros: ' + errosPorPagina.join('; '));
      }

      const fileName = `Relatorio-${vistoria.numero_interno}-${vistoria.condominio?.nome?.replace(/\s+/g, "-") || 'Vistoria'}.pdf`;
      console.log('Salvando PDF:', fileName);
      
      console.log(`=== PDF FINALIZADO ===`);
      console.log(`Total de páginas no PDF: ${pdf.getNumberOfPages()}`);
      console.log(`Páginas processadas: ${paginasProcessadas}/${pages.length}`);
      
      if (errosPorPagina.length > 0) {
        console.warn('Páginas com erro:', errosPorPagina);
      }
      
      pdf.save(fileName);

      toast({
        title: "PDF Gerado",
        description: `Relatório gerado com ${paginasProcessadas} de ${pages.length} página(s) e baixado com sucesso.`,
      });

    } catch (error) {
      console.error('=== ERRO DETALHADO AO GERAR PDF ===');
      console.error('Erro:', error);
      console.error('Stack:', error.stack);
      
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: "Erro na Geração do PDF",
        description: errorMessage + " Se o problema persistir, tente recarregar a página ou contacte o suporte.",
        variant: "destructive",
      });
    }
  };

  return {
    reportRef,
    generatePDF
  };
};
