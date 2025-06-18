
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';

export const usePDFGenerator = () => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const waitForImage = (img: HTMLImageElement): Promise<void> => {
    return new Promise((resolve) => {
      if (img.complete && img.naturalHeight !== 0) {
        console.log('Imagem já carregada:', img.src);
        resolve();
        return;
      }
      
      const timeout = setTimeout(() => {
        console.warn('Timeout ao carregar imagem, continuando mesmo assim:', img.src);
        resolve();
      }, 15000); // Reduzido de 20s para 15s

      img.onload = () => {
        console.log('Imagem carregada com sucesso:', img.src);
        clearTimeout(timeout);
        resolve();
      };
      
      img.onerror = (error) => {
        console.error('Erro ao carregar imagem, continuando mesmo assim:', img.src, error);
        clearTimeout(timeout);
        resolve();
      };
    });
  };

  const preloadImages = async (element: HTMLElement): Promise<void> => {
    console.log('=== INICIANDO PRÉ-CARREGAMENTO DE IMAGENS ===');
    const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
    console.log(`Encontradas ${images.length} imagens para carregar`);
    
    if (images.length === 0) {
      console.log('Nenhuma imagem encontrada, prosseguindo');
      return;
    }

    // Configurar todas as imagens primeiro
    images.forEach((img, index) => {
      console.log(`Configurando imagem ${index + 1}:`, img.src);
      img.crossOrigin = 'anonymous';
      
      // Cache busting mais simples
      if (!img.src.includes('?t=')) {
        const separator = img.src.includes('?') ? '&' : '?';
        img.src = img.src + separator + 't=' + Date.now();
      }
    });

    // Aguardar carregamento em lotes menores para evitar sobrecarga
    const batchSize = 3;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      console.log(`Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(images.length/batchSize)}`);
      
      const batchPromises = batch.map(async (img, batchIndex) => {
        const globalIndex = i + batchIndex;
        console.log(`Aguardando carregamento da imagem ${globalIndex + 1}/${images.length}`);
        await waitForImage(img);
        console.log(`Imagem ${globalIndex + 1} processada`);
      });

      await Promise.allSettled(batchPromises); // allSettled em vez de all para não falhar tudo
      
      // Pequena pausa entre lotes
      if (i + batchSize < images.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log('Aguardando tempo adicional para renderização...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Reduzido de 3s para 2s
    console.log('Pré-carregamento concluído');
  };

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

      // Buscar páginas com seletor mais específico e logs detalhados
      console.log('DOM do reportRef:', reportRef.current.innerHTML.substring(0, 200) + '...');
      
      const pages = Array.from(
        reportRef.current.querySelectorAll(".page")
      ) as HTMLElement[];

      console.log(`=== ANÁLISE DAS PÁGINAS ===`);
      console.log(`Páginas encontradas: ${pages.length}`);
      
      // Log mais detalhado das páginas
      pages.forEach((page, index) => {
        const pageInfo = {
          index: index + 1,
          className: page.className,
          scrollHeight: page.scrollHeight,
          scrollWidth: page.scrollWidth,
          offsetHeight: page.offsetHeight,
          offsetWidth: page.offsetWidth,
          childrenCount: page.children.length,
          hasImages: page.querySelectorAll('img').length,
          visibility: window.getComputedStyle(page).visibility,
          display: window.getComputedStyle(page).display
        };
        console.log(`Página ${index + 1} detalhes:`, pageInfo);
      });

      if (pages.length === 0) {
        console.error('ERRO: Nenhuma página encontrada!');
        console.log('Tentando buscar elementos alternativos...');
        
        // Buscar elementos alternativos
        const allDivs = Array.from(reportRef.current.querySelectorAll('div'));
        console.log(`Total de divs encontradas: ${allDivs.length}`);
        
        const possiblePages = allDivs.filter(div => 
          div.offsetHeight > 500 || 
          div.scrollHeight > 500 ||
          div.className.includes('min-h-screen')
        );
        console.log(`Possíveis páginas encontradas: ${possiblePages.length}`);
        
        throw new Error('Nenhuma página encontrada para processar. Verifique se o conteúdo foi carregado corretamente.');
      }

      toast({
        title: "Gerando PDF",
        description: "Carregando imagens...",
      });

      await preloadImages(reportRef.current);

      toast({
        title: "Gerando PDF",
        description: "Processando páginas...",
      });

      const pdf = new jsPDF({ 
        unit: "mm", 
        format: "a4",
        compress: true
      });

      let paginasProcessadas = 0;
      const errosPorPagina = [];

      for (let i = 0; i < pages.length; i++) {
        console.log(`=== PROCESSANDO PÁGINA ${i + 1}/${pages.length} ===`);
        
        toast({
          title: "Gerando PDF",
          description: `Processando página ${i + 1} de ${pages.length}...`,
        });

        try {
          // Verificar se a página é visível
          const pageStyle = window.getComputedStyle(pages[i]);
          if (pageStyle.display === 'none' || pageStyle.visibility === 'hidden') {
            console.warn(`Página ${i + 1} está oculta, pulando...`);
            continue;
          }

          // Aguardar mais tempo entre páginas
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('Iniciando captura da página...', {
            scrollWidth: pages[i].scrollWidth,
            scrollHeight: pages[i].scrollHeight,
            offsetWidth: pages[i].offsetWidth,
            offsetHeight: pages[i].offsetHeight,
            clientWidth: pages[i].clientWidth,
            clientHeight: pages[i].clientHeight
          });

          // Configurações mais conservadoras para html2canvas
          const canvas = await html2canvas(pages[i], {
            scale: 1.2, // Reduzido de 1.5 para 1.2
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            foreignObjectRendering: false,
            logging: false, // Desabilitar logs do html2canvas para reduzir ruído
            imageTimeout: 20000, // Reduzido de 30s para 20s
            removeContainer: true,
            width: pages[i].scrollWidth,
            height: pages[i].scrollHeight,
            windowWidth: Math.max(pages[i].scrollWidth, 800),
            windowHeight: Math.max(pages[i].scrollHeight, 600),
            onclone: (clonedDoc) => {
              console.log('Clonando documento para captura...');
              const clonedImages = clonedDoc.querySelectorAll('img');
              clonedImages.forEach((img) => {
                img.crossOrigin = 'anonymous';
              });
            }
          });
          
          console.log(`Canvas da página ${i + 1} criado:`, {
            width: canvas.width,
            height: canvas.height,
            dataLength: canvas.toDataURL("image/jpeg", 0.8).length // Reduzida qualidade para 0.8
          });
          
          const img = canvas.toDataURL("image/jpeg", 0.8);
          
          if (i > 0) {
            console.log(`Adicionando nova página ${i + 1} ao PDF`);
            pdf.addPage();
          }
          
          pdf.addImage(
            img,
            "JPEG",
            0,
            0,
            pdf.internal.pageSize.getWidth(),
            pdf.internal.pageSize.getHeight(),
            undefined,
            'FAST'
          );

          paginasProcessadas++;
          console.log(`✅ Página ${i + 1} processada com sucesso (Total processadas: ${paginasProcessadas})`);
          
        } catch (pageError) {
          console.error(`❌ Erro ao processar página ${i + 1}:`, pageError);
          errosPorPagina.push(`Página ${i + 1}: ${pageError.message}`);
          
          // Se é a primeira página e falhou, tentar uma abordagem mais simples
          if (i === 0 && paginasProcessadas === 0) {
            console.log('Tentando abordagem simplificada para a primeira página...');
            try {
              const simpleCanvas = await html2canvas(pages[i], {
                scale: 1,
                useCORS: false,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false
              });
              
              const simpleImg = simpleCanvas.toDataURL("image/jpeg", 0.7);
              pdf.addImage(
                simpleImg,
                "JPEG",
                0,
                0,
                pdf.internal.pageSize.getWidth(),
                pdf.internal.pageSize.getHeight(),
                undefined,
                'FAST'
              );
              
              paginasProcessadas++;
              console.log('✅ Primeira página processada com abordagem simplificada');
            } catch (simpleError) {
              console.error('❌ Falhou mesmo com abordagem simplificada:', simpleError);
              throw new Error(`Erro crítico na primeira página: ${simpleError.message}`);
            }
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
      
      let errorMessage = "Não foi possível gerar o PDF.";
      
      if (error.message.includes('imagem') || error.message.includes('image')) {
        errorMessage = "Erro ao processar imagens. Algumas fotos podem estar corrompidas ou inacessíveis.";
      } else if (error.message.includes('página') || error.message.includes('page')) {
        errorMessage = "Erro ao processar páginas do relatório. Tente aguardar o carregamento completo antes de gerar o PDF.";
      } else if (error.message.includes('Nenhuma página')) {
        errorMessage = "Nenhum conteúdo encontrado para gerar o PDF. Verifique se a vistoria possui dados e fotos.";
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        errorMessage = "Timeout durante o processamento. Tente novamente com uma conexão mais estável.";
      } else if (error.message.includes('canvas') || error.message.includes('Canvas')) {
        errorMessage = "Erro na renderização do conteúdo. Tente recarregar a página e gerar novamente.";
      }
      
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
