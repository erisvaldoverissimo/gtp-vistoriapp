
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';

export const usePDFGenerator = () => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const waitForImage = (img: HTMLImageElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (img.complete && img.naturalHeight !== 0) {
        resolve();
        return;
      }
      
      const timeout = setTimeout(() => {
        console.warn('Timeout ao carregar imagem:', img.src);
        resolve(); // Continue mesmo com timeout
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        console.error('Erro ao carregar imagem:', img.src);
        resolve(); // Continue mesmo com erro na imagem
      };
    });
  };

  const preloadImages = async (element: HTMLElement): Promise<void> => {
    console.log('Iniciando pré-carregamento de imagens...');
    const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
    console.log(`Encontradas ${images.length} imagens para carregar`);
    
    if (images.length === 0) {
      console.log('Nenhuma imagem encontrada');
      return;
    }

    // Aguardar todas as imagens carregarem
    const imagePromises = images.map(async (img, index) => {
      console.log(`Carregando imagem ${index + 1}/${images.length}:`, img.src);
      
      // Se a imagem já está carregada, pular
      if (img.complete && img.naturalHeight !== 0) {
        console.log(`Imagem ${index + 1} já carregada`);
        return;
      }

      // Aguardar o carregamento da imagem
      await waitForImage(img);
      console.log(`Imagem ${index + 1} carregada com sucesso`);
    });

    await Promise.all(imagePromises);
    console.log('Todas as imagens foram processadas');
    
    // Aguardar um tempo adicional para garantir que as imagens foram renderizadas
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Aguardou tempo adicional para renderização');
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
      console.log('Iniciando geração do PDF para vistoria:', vistoria.numero_interno);
      
      toast({
        title: "Gerando PDF",
        description: "Pré-carregando imagens...",
      });

      // Pré-carregar todas as imagens
      await preloadImages(reportRef.current);
      console.log('Imagens pré-carregadas com sucesso');

      toast({
        title: "Gerando PDF",
        description: "Processando páginas...",
      });

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pages = Array.from(
        reportRef.current.querySelectorAll(".page")
      ) as HTMLElement[];

      console.log(`Processando ${pages.length} páginas`);

      if (pages.length === 0) {
        throw new Error('Nenhuma página encontrada para processar');
      }

      for (let i = 0; i < pages.length; i++) {
        console.log(`Processando página ${i + 1}/${pages.length}`);
        
        toast({
          title: "Gerando PDF",
          description: `Processando página ${i + 1} de ${pages.length}...`,
        });

        // Aguardar um pouco antes de processar cada página
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(pages[i], {
          scale: 1.5, // Reduzir escala para melhor performance
          useCORS: true,
          allowTaint: true, // Permitir imagens de diferentes origens
          backgroundColor: "#ffffff",
          foreignObjectRendering: false,
          logging: false,
          imageTimeout: 15000,
          removeContainer: true,
          onclone: (clonedDoc) => {
            // Garantir que todas as imagens no clone tenham crossOrigin
            const clonedImages = clonedDoc.querySelectorAll('img');
            clonedImages.forEach(img => {
              img.crossOrigin = 'anonymous';
            });
          }
        });
        
        const img = canvas.toDataURL("image/png", 0.9);
        
        if (i > 0) pdf.addPage();
        
        pdf.addImage(
          img,
          "PNG",
          0,
          0,
          pdf.internal.pageSize.getWidth(),
          pdf.internal.pageSize.getHeight(),
          undefined,
          'FAST'
        );

        console.log(`Página ${i + 1} processada com sucesso`);
      }

      const fileName = `Relatorio-${vistoria.numero_interno}-${vistoria.condominio?.nome?.replace(/\s+/g, "-") || 'Vistoria'}.pdf`;
      console.log('Salvando PDF:', fileName);
      pdf.save(fileName);

      console.log('PDF gerado com sucesso');
      toast({
        title: "PDF Gerado",
        description: "O relatório foi gerado e baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro detalhado ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Tente novamente ou verifique se há imagens corrompidas.",
        variant: "destructive",
      });
    }
  };

  return {
    reportRef,
    generatePDF
  };
};
