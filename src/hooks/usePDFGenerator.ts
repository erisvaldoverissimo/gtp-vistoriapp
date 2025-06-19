
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
    console.log('🎯 === INICIANDO GERAÇÃO DO PDF ===');
    console.log('📊 Vistoria:', vistoria.numero_interno);
    console.log('📊 Grupos na vistoria:', vistoria.grupos?.length || 0);

    if (!reportRef.current) {
      console.error('❌ Referência do relatório não encontrada');
      toast({
        title: "Erro",
        description: "Referência do relatório não encontrada.",
        variant: "destructive",
      });
      return;
    }

    try {
      // NOVA VERIFICAÇÃO CRÍTICA: Garantir que reportRef.current não seja nulo
      const reportElement = reportRef.current;
      if (!reportElement) {
        throw new Error('Elemento do relatório é nulo ou não foi encontrado');
      }
      
      // Log da estrutura do DOM antes de começar
      console.log('🏗️ Estrutura inicial do reportRef:', {
        children: reportElement.children.length,
        className: reportElement.className,
        scrollHeight: reportElement.scrollHeight,
        scrollWidth: reportElement.scrollWidth,
        offsetHeight: reportElement.offsetHeight,
        offsetWidth: reportElement.offsetWidth,
        isConnected: reportElement.isConnected,
        innerHTML: reportElement.innerHTML.substring(0, 500) + '...'
      });
      
      toast({
        title: "Gerando PDF",
        description: "Preparando conteúdo...",
      });

      // Aguardar tempo suficiente para o DOM se estabilizar completamente
      console.log('⏳ Aguardando estabilização completa do DOM...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Verificar novamente se o elemento ainda existe após a espera
      if (!reportRef.current || !document.contains(reportRef.current)) {
        throw new Error('Elemento do relatório foi removido do DOM durante a espera');
      }

      // Verificar se há conteúdo nos grupos
      const gruposComFotos = vistoria.grupos?.filter(grupo => grupo.fotos && grupo.fotos.length > 0) || [];
      console.log(`📸 Grupos com fotos: ${gruposComFotos.length}`);
      
      if (gruposComFotos.length === 0) {
        throw new Error('Nenhum grupo com fotos encontrado para gerar o PDF');
      }

      // Aguardar que todas as imagens estejam carregadas
      toast({
        title: "Gerando PDF",
        description: "Aguardando carregamento das imagens...",
      });

      console.log('🖼️ Iniciando pré-carregamento de imagens...');
      await preloadImages(reportRef.current);
      console.log('✅ Pré-carregamento concluído');

      // Aguardar mais tempo após o carregamento das imagens
      console.log('⏳ Aguardando estabilização após carregamento das imagens...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Validar e buscar páginas com logs detalhados
      console.log('🔍 Iniciando validação das páginas...');
      const pages = validatePages(reportRef.current);
      console.log(`📄 Páginas validadas: ${pages.length}`);

      // VERIFICAÇÃO CRÍTICA: Verificar se cada página ainda é válida e não é nula
      const paginasValidas = pages.filter((page, index) => {
        console.log(`🔍 Verificando página ${index + 1}:`);
        
        // Verificação de nulidade crítica
        if (!page) {
          console.error(`❌ Página ${index + 1} é nula!`);
          return false;
        }
        
        const isInDOM = document.contains(page);
        const rect = page.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const hasContent = (page.textContent?.trim().length || 0) > 0;
        
        console.log(`📊 Página ${index + 1} - No DOM: ${isInDOM}, Visível: ${isVisible}, Tem conteúdo: ${hasContent}, Elemento válido: ${page !== null}`);
        
        const isValid = isInDOM && isVisible && hasContent;
        console.log(`${isValid ? '✅' : '❌'} Página ${index + 1} é ${isValid ? 'válida' : 'inválida'}`);
        
        return isValid;
      });

      if (paginasValidas.length === 0) {
        console.error('❌ === ERRO CRÍTICO ===');
        console.error('❌ Nenhuma página válida encontrada após validação final');
        throw new Error('Nenhuma página válida encontrada após validação final');
      }

      console.log(`✅ Páginas válidas para processamento: ${paginasValidas.length}/${pages.length}`);

      toast({
        title: "Gerando PDF",
        description: "Processando páginas...",
      });

      const pdf = createPDF();
      let paginasProcessadas = 0;
      const errosPorPagina = [];

      // Processar uma página por vez com pausas maiores
      for (let i = 0; i < paginasValidas.length; i++) {
        console.log(`🚀 === PROCESSANDO PÁGINA ${i + 1}/${paginasValidas.length} ===`);
        
        toast({
          title: "Gerando PDF",
          description: `Processando página ${i + 1} de ${paginasValidas.length}...`,
        });

        try {
          const page = paginasValidas[i];
          
          // VERIFICAÇÃO CRÍTICA FINAL: Garantir que a página não seja nula
          if (!page) {
            throw new Error(`Página ${i + 1} é nula durante o processamento`);
          }
          
          // Verificação final antes do processamento
          if (!document.contains(page)) {
            throw new Error(`Página ${i + 1} não está mais no DOM`);
          }
          
          const rect = page.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            throw new Error(`Página ${i + 1} não está visível`);
          }
          
          console.log(`✅ Página ${i + 1} validada para processamento:`, {
            elemento: page ? 'válido' : 'NULO',
            dimensoes: { width: rect.width, height: rect.height },
            conteudo: (page.textContent?.trim().length || 0) > 0,
            imagens: page.querySelectorAll('img').length,
            tagName: page.tagName,
            className: page.className
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
            console.error('❌ ERRO CRÍTICO: Primeira página falhou e nenhuma foi processada');
            throw pageError;
          }
        }
        
        // Pausa maior entre páginas para estabilização
        if (i < paginasValidas.length - 1) {
          console.log('⏳ Pausando entre páginas...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (paginasProcessadas === 0) {
        console.error('❌ === ERRO CRÍTICO ===');
        console.error('❌ Nenhuma página foi processada com sucesso!');
        console.error('❌ Erros detalhados:', errosPorPagina);
        throw new Error('Nenhuma página foi processada com sucesso. Detalhes: ' + errosPorPagina.join('; '));
      }

      const fileName = `Relatorio-${vistoria.numero_interno}-${vistoria.condominio?.nome?.replace(/\s+/g, "-") || 'Vistoria'}.pdf`;
      console.log('💾 Finalizando PDF:', fileName);
      
      console.log(`🎉 === PDF GERADO COM SUCESSO ===`);
      console.log(`📄 Páginas no PDF: ${pdf.getNumberOfPages()}`);
      console.log(`✅ Páginas processadas: ${paginasProcessadas}/${paginasValidas.length}`);
      
      if (errosPorPagina.length > 0) {
        console.warn('⚠️ Páginas com problemas:', errosPorPagina);
      }
      
      pdf.save(fileName);

      toast({
        title: "PDF Gerado",
        description: `Relatório gerado com ${paginasProcessadas} de ${paginasValidas.length} página(s) e baixado com sucesso.`,
      });

    } catch (error) {
      console.error('❌ === ERRO DETALHADO NA GERAÇÃO DO PDF ===');
      console.error('❌ Tipo do erro:', typeof error);
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Stack completa:', error.stack);
      console.error('❌ Erro completo:', error);
      
      // Log do estado atual do DOM
      if (reportRef.current) {
        console.error('❌ Estado do DOM no momento do erro:', {
          children: reportRef.current.children.length,
          className: reportRef.current.className,
          scrollHeight: reportRef.current.scrollHeight,
          visivel: reportRef.current.offsetWidth > 0 && reportRef.current.offsetHeight > 0,
          isConnected: reportRef.current.isConnected
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
