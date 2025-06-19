
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
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar se há grupos com fotos
      const gruposComFotos = vistoria.grupos?.filter(grupo => grupo.fotos && grupo.fotos.length > 0) || [];
      console.log(`📸 Grupos com fotos: ${gruposComFotos.length}`);
      
      if (gruposComFotos.length === 0) {
        throw new Error('Nenhum grupo com fotos encontrado para gerar o PDF');
      }

      // Aguardar carregamento das imagens
      toast({
        title: "Gerando PDF",
        description: "Aguardando carregamento das imagens...",
      });

      console.log('🖼️ Iniciando pré-carregamento de imagens...');
      await preloadImages(reportElement);
      console.log('✅ Pré-carregamento concluído');

      // Aguardar mais tempo após o carregamento das imagens
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Buscar páginas de forma mais simples
      console.log('🔍 Buscando páginas do relatório...');
      let pages = Array.from(reportElement.querySelectorAll(".page")) as HTMLElement[];
      
      if (pages.length === 0) {
        console.log('❌ Nenhuma página com classe .page encontrada, tentando busca alternativa...');
        // Tentar buscar por divs com min-h-screen
        pages = Array.from(reportElement.querySelectorAll('[class*="min-h-screen"]')) as HTMLElement[];
      }

      if (pages.length === 0) {
        console.log('❌ Tentando usar children diretos do reportElement...');
        pages = Array.from(reportElement.children).filter(child => {
          const element = child as HTMLElement;
          return element.offsetHeight > 200;
        }) as HTMLElement[];
      }

      console.log(`📄 Páginas encontradas: ${pages.length}`);

      if (pages.length === 0) {
        throw new Error('Nenhuma página encontrada para processar. Verifique se o conteúdo foi carregado corretamente.');
      }

      // Filtrar apenas páginas válidas
      const paginasValidas = pages.filter((page, index) => {
        if (!page) {
          console.error(`❌ Página ${index + 1} é nula!`);
          return false;
        }
        
        const isInDOM = document.contains(page);
        const rect = page.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        console.log(`📊 Página ${index + 1} - No DOM: ${isInDOM}, Visível: ${isVisible}`);
        
        return isInDOM && isVisible;
      });

      if (paginasValidas.length === 0) {
        throw new Error('Nenhuma página válida encontrada após validação');
      }

      console.log(`✅ Páginas válidas: ${paginasValidas.length}/${pages.length}`);

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
          
          if (!page || !document.contains(page)) {
            console.error(`❌ Página ${i + 1} não está válida para processamento`);
            continue;
          }
          
          console.log(`✅ Processando página ${i + 1}...`);
          
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
