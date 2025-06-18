
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';

export const usePDFGenerator = () => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const preloadImages = async (element: HTMLElement): Promise<void> => {
    const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
    
    const imagePromises = images.map((img) => {
      return new Promise<void>((resolve, reject) => {
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
          return;
        }
        
        const newImg = new Image();
        newImg.crossOrigin = 'anonymous';
        newImg.onload = () => {
          // Substituir a imagem original pela nova com crossOrigin
          img.src = newImg.src;
          img.crossOrigin = 'anonymous';
          resolve();
        };
        newImg.onerror = () => {
          console.warn('Erro ao carregar imagem:', img.src);
          resolve(); // Continuar mesmo com erro na imagem
        };
        newImg.src = img.src;
      });
    });

    await Promise.all(imagePromises);
    // Aguardar um tempo adicional para garantir que as imagens foram renderizadas
    await new Promise(resolve => setTimeout(resolve, 500));
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
      toast({
        title: "Gerando PDF",
        description: "Aguarde enquanto o relatório é gerado...",
      });

      console.log('Iniciando geração do PDF...');
      
      // Pré-carregar todas as imagens
      await preloadImages(reportRef.current);
      console.log('Imagens pré-carregadas');

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pages = Array.from(
        reportRef.current.querySelectorAll(".page")
      ) as HTMLElement[];

      console.log(`Processando ${pages.length} páginas`);

      for (let i = 0; i < pages.length; i++) {
        console.log(`Processando página ${i + 1}/${pages.length}`);
        
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          foreignObjectRendering: false,
          logging: false,
          imageTimeout: 15000,
          removeContainer: true
        });
        
        const img = canvas.toDataURL("image/png", 1.0);
        
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
      }

      const fileName = `Relatorio-${vistoria.numero_interno}-${vistoria.condominio?.nome?.replace(/\s+/g, "-")}.pdf`;
      pdf.save(fileName);

      console.log('PDF gerado com sucesso');
      toast({
        title: "PDF Gerado",
        description: "O relatório foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF. Verifique se todas as imagens foram carregadas.",
        variant: "destructive",
      });
    }
  };

  return {
    reportRef,
    generatePDF
  };
};
