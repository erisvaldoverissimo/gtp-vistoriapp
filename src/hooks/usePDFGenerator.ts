
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import { preloadImages } from '@/utils/pdf/imageUtils';
import { createPDF, processPageWithFallback, addImageToPDF } from '@/utils/pdf/pdfUtils';
import { getErrorMessage } from '@/utils/pdf/errorUtils';

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
      const reportElement = reportRef.current;
      
      console.log('🏗️ Estrutura do reportRef:', {
        children: reportElement.children.length,
        className: reportElement.className,
        scrollHeight: reportElement.scrollHeight,
        scrollWidth: reportElement.scrollWidth,
        isConnected: reportElement.isConnected
      });
      
      toast({
        title: "Gerando PDF",
        description: "Preparando conteúdo...",
      });

      // Aguardar estabilização do DOM
      console.log('⏳ Aguardando estabilização do DOM...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Se não houver grupos, seguir com uma página de resumo (tratado no componente)
      if (!vistoria.grupos || vistoria.grupos.length === 0) {
        console.warn('Nenhum grupo de vistoria encontrado - gerando PDF apenas com página de resumo.');
      }

      console.log(`📋 Grupos encontrados: ${vistoria.grupos.length}`);
      
      // Contar grupos com fotos para informação
      const gruposComFotos = vistoria.grupos?.filter(grupo => grupo.fotos && grupo.fotos.length > 0) || [];
      console.log(`📸 Grupos com fotos: ${gruposComFotos.length}`);
      console.log(`📝 Grupos sem fotos: ${vistoria.grupos.length - gruposComFotos.length}`);

      // Se há fotos, aguardar carregamento das imagens
      if (gruposComFotos.length > 0) {
        toast({
          title: "Gerando PDF",
          description: "Aguardando carregamento das imagens...",
        });

        console.log('🖼️ Iniciando pré-carregamento de imagens...');
        await preloadImages(reportElement);
        console.log('✅ Pré-carregamento concluído');

        // Aguardar mais tempo após o carregamento das imagens
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log('ℹ️ Nenhuma imagem para pré-carregar');
      }

      // Busca por páginas - busca mais flexível
      console.log('🔍 Iniciando busca por páginas...');
      
      let pages = Array.from(reportElement.querySelectorAll(".page")) as HTMLElement[];
      console.log(`📄 Páginas encontradas com classe .page: ${pages.length}`);

      // Se não encontrou páginas com .page, buscar por outros seletores
      if (pages.length === 0) {
        console.log('⚠️ Tentando seletores alternativos...');
        
        // Tentar min-h-screen
        pages = Array.from(reportElement.querySelectorAll('[class*="min-h-screen"]')) as HTMLElement[];
        console.log(`📄 Páginas encontradas com min-h-screen: ${pages.length}`);
        
        // Se ainda não encontrou, tentar divs grandes
        if (pages.length === 0) {
          const allDivs = Array.from(reportElement.querySelectorAll('div')) as HTMLElement[];
          pages = allDivs.filter(div => {
            const rect = div.getBoundingClientRect();
            const hasHeight = div.offsetHeight > 200 || div.scrollHeight > 200;
            const hasContent = (div.textContent?.trim().length || 0) > 10;
            return hasHeight && hasContent && rect.width > 0;
          });
          console.log(`📄 Páginas encontradas por altura/conteúdo: ${pages.length}`);
        }
        
        // Último recurso: usar o próprio reportElement como página única
        if (pages.length === 0) {
          console.log('🆘 Usando reportElement como página única');
          pages = [reportElement];
        }
      }

      console.log(`📋 Total de páginas encontradas: ${pages.length}`);

      // Validar e filtrar páginas
      const paginasValidas = pages.filter((page, index) => {
        if (!page || !document.contains(page)) {
          console.warn(`❌ Página ${index + 1} não está no DOM`);
          return false;
        }
        
        const rect = page.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        if (!isVisible) {
          console.warn(`❌ Página ${index + 1} não está visível`);
          return false;
        }
        
        console.log(`✅ Página ${index + 1} válida - ${Math.round(rect.width)}x${Math.round(rect.height)}`);
        return true;
      });

      console.log(`✅ Páginas válidas após filtro: ${paginasValidas.length}/${pages.length}`);

      if (paginasValidas.length === 0) {
        throw new Error('Nenhuma página válida encontrada. Verifique se o conteúdo está carregado e visível.');
      }

      toast({
        title: "Gerando PDF",
        description: "Processando páginas...",
      });

      const pdf = createPDF();
      let paginasProcessadas = 0;

      // Processar páginas uma por vez
      for (let i = 0; i < paginasValidas.length; i++) {
        console.log(`🚀 === PROCESSANDO PÁGINA ${i + 1}/${paginasValidas.length} ===`);
        
        toast({
          title: "Gerando PDF",
          description: `Processando página ${i + 1} de ${paginasValidas.length}...`,
        });

        try {
          const page = paginasValidas[i];
          
          // Verificação adicional antes de processar
          if (!page || !document.contains(page)) {
            console.error(`❌ Página ${i + 1} não está mais válida`);
            continue;
          }
          
          const rect = page.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            console.error(`❌ Página ${i + 1} perdeu visibilidade`);
            continue;
          }
          
          console.log(`✅ Processando página ${i + 1} (${Math.round(rect.width)}x${Math.round(rect.height)})...`);
          
          const imageData = await processPageWithFallback(page, i);
          addImageToPDF(pdf, imageData, i > 0);
          paginasProcessadas++;
          
          console.log(`✅ Página ${i + 1} processada com sucesso`);
          
        } catch (pageError) {
          console.error(`❌ Erro na página ${i + 1}:`, pageError);
          
          // Se é a primeira página e falhou, é erro crítico
          if (i === 0 && paginasProcessadas === 0) {
            throw new Error(`Erro crítico na primeira página: ${pageError.message}`);
          }
        }
        
        // Pausa entre páginas
        if (i < paginasValidas.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (paginasProcessadas === 0) {
        throw new Error('Nenhuma página foi processada com sucesso');
      }

      const fileName = `Relatorio-${vistoria.numero_interno}-${vistoria.condominio?.nome?.replace(/\s+/g, "-") || 'Vistoria'}.pdf`;
      console.log('💾 Finalizando PDF:', fileName);
      
      console.log(`🎉 === PDF GERADO COM SUCESSO ===`);
      console.log(`📄 Páginas no PDF: ${pdf.getNumberOfPages()}`);
      console.log(`✅ Páginas processadas: ${paginasProcessadas}/${paginasValidas.length}`);
      
      pdf.save(fileName);

      toast({
        title: "PDF Gerado",
        description: `Relatório gerado com ${paginasProcessadas} página(s) e baixado com sucesso.`,
      });

    } catch (error) {
      console.error('❌ === ERRO DETALHADO NA GERAÇÃO DO PDF ===');
      console.error('❌ Erro:', error);
      
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: "Erro na Geração do PDF",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    reportRef,
    generatePDF
  };
};
