
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
        resolve(); // Continue mesmo com timeout
      }, 15000); // Aumentar timeout para 15 segundos

      img.onload = () => {
        console.log('Imagem carregada com sucesso:', img.src);
        clearTimeout(timeout);
        resolve();
      };
      
      img.onerror = (error) => {
        console.error('Erro ao carregar imagem, continuando mesmo assim:', img.src, error);
        clearTimeout(timeout);
        resolve(); // Continue mesmo com erro na imagem
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

    // Configurar todas as imagens com crossOrigin
    images.forEach((img, index) => {
      console.log(`Configurando imagem ${index + 1}:`, img.src);
      img.crossOrigin = 'anonymous';
      
      // Se a URL não tem parâmetros de cache, adicionar
      if (!img.src.includes('?t=')) {
        const separator = img.src.includes('?') ? '&' : '?';
        img.src = img.src + separator + 't=' + Date.now();
      }
    });

    // Aguardar todas as imagens carregarem em paralelo
    const imagePromises = images.map(async (img, index) => {
      console.log(`Aguardando carregamento da imagem ${index + 1}/${images.length}`);
      await waitForImage(img);
      console.log(`Imagem ${index + 1} processada`);
    });

    try {
      await Promise.all(imagePromises);
      console.log('Todas as imagens foram processadas');
    } catch (error) {
      console.warn('Erro durante pré-carregamento, mas continuando:', error);
    }
    
    // Aguardar tempo adicional para renderização
    console.log('Aguardando tempo adicional para renderização...');
    await new Promise(resolve => setTimeout(resolve, 2000));
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
        description: "Preparando imagens...",
      });

      // Verificar se há páginas para processar
      const pages = Array.from(
        reportRef.current.querySelectorAll(".page")
      ) as HTMLElement[];

      console.log(`Páginas encontradas: ${pages.length}`);

      if (pages.length === 0) {
        throw new Error('Nenhuma página encontrada para processar. Verifique se o conteúdo foi carregado corretamente.');
      }

      // Pré-carregar todas as imagens
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

      for (let i = 0; i < pages.length; i++) {
        console.log(`=== PROCESSANDO PÁGINA ${i + 1}/${pages.length} ===`);
        
        toast({
          title: "Gerando PDF",
          description: `Processando página ${i + 1} de ${pages.length}...`,
        });

        try {
          // Aguardar um pouco antes de processar cada página
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('Iniciando captura da página...');
          const canvas = await html2canvas(pages[i], {
            scale: 1.2, // Escala moderada para qualidade vs performance
            useCORS: true,
            allowTaint: false,
            backgroundColor: "#ffffff",
            foreignObjectRendering: false,
            logging: false,
            imageTimeout: 20000, // Timeout maior para imagens
            removeContainer: true,
            width: pages[i].scrollWidth,
            height: pages[i].scrollHeight,
            onclone: (clonedDoc) => {
              console.log('Clonando documento para captura...');
              // Garantir que todas as imagens no clone tenham configurações corretas
              const clonedImages = clonedDoc.querySelectorAll('img');
              clonedImages.forEach((img, idx) => {
                img.crossOrigin = 'anonymous';
                console.log(`Imagem clonada ${idx + 1}:`, img.src);
              });
            }
          });
          
          console.log('Canvas criado com sucesso, dimensões:', canvas.width, 'x', canvas.height);
          
          const img = canvas.toDataURL("image/jpeg", 0.85); // JPEG com qualidade boa
          
          if (i > 0) {
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
          console.log(`Página ${i + 1} processada com sucesso`);
          
        } catch (pageError) {
          console.error(`Erro ao processar página ${i + 1}:`, pageError);
          
          // Se apenas uma página falhou mas outras foram processadas, continuar
          if (paginasProcessadas > 0) {
            console.log('Continuando processamento apesar do erro na página');
            continue;
          } else {
            throw new Error(`Erro na primeira página: ${pageError.message}`);
          }
        }
      }

      if (paginasProcessadas === 0) {
        throw new Error('Nenhuma página foi processada com sucesso');
      }

      const fileName = `Relatorio-${vistoria.numero_interno}-${vistoria.condominio?.nome?.replace(/\s+/g, "-") || 'Vistoria'}.pdf`;
      console.log('Salvando PDF:', fileName);
      pdf.save(fileName);

      console.log(`PDF gerado com sucesso - ${paginasProcessadas} páginas`);
      toast({
        title: "PDF Gerado",
        description: `Relatório gerado com ${paginasProcessadas} página(s) e baixado com sucesso.`,
      });

    } catch (error) {
      console.error('=== ERRO DETALHADO AO GERAR PDF ===');
      console.error('Erro:', error);
      console.error('Stack:', error.stack);
      
      let errorMessage = "Não foi possível gerar o PDF.";
      
      if (error.message.includes('imagem')) {
        errorMessage = "Erro ao processar imagens. Verifique se todas as fotos foram carregadas corretamente.";
      } else if (error.message.includes('página')) {
        errorMessage = "Erro ao processar páginas do relatório. Tente novamente em alguns segundos.";
      } else if (error.message.includes('Nenhuma página')) {
        errorMessage = "Nenhum conteúdo encontrado para gerar o PDF. Verifique se a vistoria possui dados.";
      }
      
      toast({
        title: "Erro na Geração do PDF",
        description: errorMessage + " Se o problema persistir, tente recarregar a página.",
        variant: "destructive",
      });
    }
  };

  return {
    reportRef,
    generatePDF
  };
};
