
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';

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
      toast({
        title: "Gerando PDF",
        description: "Aguarde enquanto o relatório é gerado...",
      });

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pages = Array.from(
        reportRef.current.querySelectorAll(".page")
      ) as HTMLElement[];

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          allowTaint: true,
          foreignObjectRendering: true,
        });
        const img = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage();
        pdf.addImage(
          img,
          "PNG",
          0,
          0,
          pdf.internal.pageSize.getWidth(),
          pdf.internal.pageSize.getHeight()
        );
      }

      const fileName = `Relatorio-${vistoria.numero_interno}-${vistoria.condominio?.nome?.replace(/\s+/g, "-")}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Gerado",
        description: "O relatório foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      });
    }
  };

  return {
    reportRef,
    generatePDF
  };
};
