
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
      console.log('Grupos na vistoria:', vistoria.grupos?.length || 0);
      
      // Log da estrutura do DOM antes de começar
      console.log('Estrutura inicial do reportRef:', {
        children: reportRef.current.children.length,
        className: reportRef.current.className,
        scrollHeight: reportRef.current.scrollHeight,
        innerHTML: reportRef.current.innerHTML.substring(0, 500) + '...'
      });
      
      toast({
        title: "Gerando PDF",
        description: "Preparando conteúdo...",
      });

      // Aguardar tempo suficiente para o DOM se estabilizar completamente
      console.log('Aguardando estabilização completa do DOM...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verificar se há conteúdo nos grupos
      const gruposComFotos = vistoria.grupos?.filter(grupo => grupo.fotos && grupo.fotos.length > 0) || [];
      console.log(`Grupos com fotos: ${gruposComFotos.length}`);
      
      if (gruposComFotos.length === 0) {
        throw new Error('Nenhum grupo com fotos encontrado para gerar o PDF');
      }

      // Aguardar que todas as imagens estejam carregadas
      toast({
        title: "Gerando PDF",
        description: "Aguardando carregamento das imagens...",
      });

      console.log('Iniciando pré-carregamento de imagens...');
      await preloadImages(reportRef.current);
      console.log('Pré-carregamento concluído');

      // Aguardar mais um pouco após o carregamento das imagens
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Validar e buscar páginas com logs detalhados
      console.log('Iniciando validação das páginas...');
      const pages = validatePages(reportRef.current);
      console.log(`Páginas validadas: ${pages.length}`);

      // Verificar se cada página ainda está válida antes de processar
      const paginasValidas = pages.filter((page, index) => {
        const isInDOM = document.contains(page);
        const rect = page.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        console.log(`Página ${index + 1} - No DOM: ${isInDOM}, Visível: ${isVisible}`);
        
        return isInDOM && isVisible;
      });

      if (paginasValidas.length === 0) {
        throw new Error('Nenhuma página válida encontrada após validação final');
      }

      console.log(`Páginas válidas para processamento: ${paginasValidas.length}/${pages.length}`);

      toast({
        title: "Gerando PDF",
        description: "Processando páginas...",
      });

      const pdf = createPDF();
      let paginasProcessadas = 0;
      const errosPorPagina = [];

      // Processar uma página por vez com pausas maiores
      for (let i = 0; i < paginasValidas.length; i++) {
        console.log(`=== PROCESSANDO PÁGINA ${i + 1}/${paginasValidas.length} ===`);
        
        toast({
          title: "Gerando PDF",
          description: `Processando página ${i + 1} de ${paginasValidas.length}...`,
        });

        try {
          const page = paginasValidas[i];
          
          // Verificação final antes do processamento
          if (!document.contains(page)) {
            throw new Error(`Página ${i + 1} não está mais no DOM`);
          }
          
          const rect = page.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            throw new Error(`Página ${i + 1} não está visível`);
          }
          
          console.log(`Página ${i + 1} validada para processamento:`, {
            dimensoes: { width: rect.width, height: rect.height },
            conteudo: (page.textContent?.trim().length || 0) > 0,
            imagens: page.querySelectorAll('img').length
          });
          
          const imageData = await processPageWithFallback(page, i);
          addImageToPDF(pdf, imageData, i > 0);
          paginasProcessadas++;
          console.log(`✅ Página ${i + 1} processada com sucesso (Total: ${paginasProcessadas})`);
          
        } catch (pageError) {
          console.error(`❌ Erro na página ${i + 1}:`, pageError);
          errosPorPagina.push(`Página ${i + 1}: ${pageError.message}`);
          
          // Se é a primeira página e falhou, é erro crítico
          if (i === 0 && paginasProcessadas === 0) {
            console.error('ERRO CRÍTICO: Primeira página falhou e nenhuma foi processada');
            throw pageError;
          }
        }
        
        // Pausa maior entre páginas para estabilização
        if (i < paginasValidas.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (paginasProcessadas === 0) {
        console.error('=== ERRO CRÍTICO ===');
        console.error('Nenhuma página foi processada com sucesso!');
        console.error('Erros detalhados:', errosPorPagina);
        throw new Error('Nenhuma página foi processada com sucesso. Detalhes: ' + errosPorPagina.join('; '));
      }

      const fileName = `Relatorio-${vistoria.numero_interno}-${vistoria.condominio?.nome?.replace(/\s+/g, "-") || 'Vistoria'}.pdf`;
      console.log('Finalizando PDF:', fileName);
      
      console.log(`=== PDF GERADO COM SUCESSO ===`);
      console.log(`Páginas no PDF: ${pdf.getNumberOfPages()}`);
      console.log(`Páginas processadas: ${paginasProcessadas}/${paginasValidas.length}`);
      
      if (errosPorPagina.length > 0) {
        console.warn('Páginas com problemas:', errosPorPagina);
      }
      
      pdf.save(fileName);

      toast({
        title: "PDF Gerado",
        description: `Relatório gerado com ${paginasProcessadas} de ${paginasValidas.length} página(s) e baixado com sucesso.`,
      });

    } catch (error) {
      console.error('=== ERRO DETALHADO NA GERAÇÃO DO PDF ===');
      console.error('Tipo do erro:', typeof error);
      console.error('Mensagem:', error.message);
      console.error('Stack completa:', error.stack);
      console.error('Erro completo:', error);
      
      // Log do estado atual do DOM
      if (reportRef.current) {
        console.error('Estado do DOM no momento do erro:', {
          children: reportRef.current.children.length,
          className: reportRef.current.className,
          scrollHeight: reportRef.current.scrollHeight,
          visivel: reportRef.current.offsetWidth > 0 && reportRef.current.offsetHeight > 0
        });
      }
      
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: "Erro na Geração do PDF",
        description: errorMessage + " Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    }
  };

  return {
    reportRef,
    generatePDF
  };
};
