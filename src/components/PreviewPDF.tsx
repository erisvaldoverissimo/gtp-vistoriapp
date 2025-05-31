import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Edit, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FotoComDescricao extends File {
  descricao?: string;
}

interface VistoriaData {
  condominio: string;
  numeroInterno: string;
  dataVistoria: string;
  ambiente: string;
  grupo: string;
  item: string;
  status: string;
  parecer: string;
  observacoes: string;
  responsavel: string;
  fotos: FotoComDescricao[];
}

interface PreviewPDFProps {
  data: VistoriaData;
  onBack: () => void;
}

const PreviewPDF = ({ data, onBack }: PreviewPDFProps) => {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      toast({
        title: "Gerando PDF",
        description: "Por favor, aguarde enquanto o relatório está sendo gerado...",
      });

      // Configurações para captura
      const canvas = await html2canvas(reportRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // Se a imagem for muito alta, dividir em páginas
      const totalPages = Math.ceil((imgHeight * ratio) / pdfHeight);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        const yOffset = -i * pdfHeight / ratio;
        pdf.addImage(
          imgData,
          'PNG',
          imgX,
          imgY + yOffset * ratio,
          imgWidth * ratio,
          imgHeight * ratio
        );
      }

      // Nome do arquivo
      const fileName = `Relatorio-${data.numeroInterno}-${data.condominio.replace(/\s+/g, '-')}.pdf`;
      
      // Fazer download
      pdf.save(fileName);

      toast({
        title: "PDF Gerado com Sucesso",
        description: "O relatório foi baixado com sucesso.",
      });

      console.log('PDF gerado e baixado:', fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao Gerar PDF",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = () => {
    // Simular envio por email
    toast({
      title: "Email Enviado",
      description: "O relatório foi enviado por email com sucesso.",
    });
    console.log('Enviando email com dados:', data);
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft size={18} className="mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">Preview do Relatório</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Edit size={18} className="mr-2" />
            Editar
          </Button>
          <Button onClick={handleSendEmail} variant="outline">
            <Mail size={18} className="mr-2" />
            Enviar Email
          </Button>
          <Button onClick={handleDownloadPDF} className="bg-brand-green hover:bg-brand-green-light">
            <Download size={18} className="mr-2" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Preview do PDF - Ajustado para A4 */}
      <Card className="max-w-none mx-auto" style={{ width: '210mm', maxWidth: '210mm' }}>
        <div ref={reportRef} className="bg-white" style={{ width: '210mm', minHeight: '297mm', padding: '10mm' }}>
          {/* Cabeçalho do Relatório - Compacto */}
          <div className="bg-brand-purple text-white p-4 rounded-t-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-brand-green rounded-lg flex items-center justify-center">
                  <span className="text-brand-purple font-bold text-lg">V</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Relatório de vistoria (fotográfico)</h1>
                  <p className="text-purple-200 text-sm">Sistema de Vistorias Prediais</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Vistoria - Compacto */}
          <div className="bg-gray-100 p-3 rounded-lg mb-4">
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div>
                <span className="font-semibold">Data de emissão:</span>
                <br />
                {formatDate(new Date().toISOString())}
              </div>
              <div>
                <span className="font-semibold">Hora:</span>
                <br />
                {getCurrentTime()}
              </div>
              <div>
                <span className="font-semibold">Usuário:</span>
                <br />
                {data.responsavel || 'Não informado'}
              </div>
              <div>
                <span className="font-semibold">Empreendimento:</span>
                <br />
                {data.condominio}
              </div>
              <div>
                <span className="font-semibold">Área:</span>
                <br />
                {data.ambiente || 'COMUM'}
              </div>
              <div>
                <span className="font-semibold">Nº interno da vistoria:</span>
                <br />
                {data.numeroInterno}
              </div>
              <div className="col-span-2">
                <span className="font-semibold">Data da vistoria:</span>
                <br />
                {formatDate(data.dataVistoria)}
              </div>
            </div>
          </div>

          {/* Tabela de Detalhes - Compacta */}
          <div className="mb-4">
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-brand-purple text-white">
                  <th className="border border-gray-300 p-2 text-left w-[15%]">Ambiente</th>
                  <th className="border border-gray-300 p-2 text-left w-[15%]">Grupo</th>
                  <th className="border border-gray-300 p-2 text-left w-[15%]">Item</th>
                  <th className="border border-gray-300 p-2 text-left w-[12%]">Status</th>
                  <th className="border border-gray-300 p-2 text-left w-[43%]">Parecer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">{data.ambiente}</td>
                  <td className="border border-gray-300 p-2">{data.grupo}</td>
                  <td className="border border-gray-300 p-2">{data.item}</td>
                  <td className="border border-gray-300 p-2">
                    <span className={`px-1 py-0.5 rounded text-xs ${
                      data.status === 'N/A' ? 'bg-gray-200' :
                      data.status === 'Conforme' ? 'bg-brand-green text-white' :
                      data.status === 'Não Conforme' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {data.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2">{data.parecer}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Área de Fotos - Otimizada para 3 fotos por página */}
          {data.fotos.length > 0 && (
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-3 text-brand-purple">Evidências Fotográficas</h3>
              <div className="space-y-4">
                {data.fotos.map((foto, index) => {
                  const fotoComDescricao = foto as File & { descricao?: string };
                  
                  return (
                    <div key={index} className="border rounded-lg p-3" style={{ breakInside: 'avoid' }}>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <img
                            src={URL.createObjectURL(foto)}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                          <p className="text-xs font-medium text-center mt-1">
                            Foto {String(index + 1).padStart(2, '0')}
                          </p>
                        </div>
                        <div className="flex flex-col justify-start">
                          <h4 className="font-semibold text-xs mb-1">Descrição:</h4>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {fotoComDescricao.descricao || 'Evidência fotográfica da vistoria'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observações - Compacto */}
          {data.observacoes && (
            <div className="mb-4">
              <h3 className="text-base font-semibold mb-2 text-brand-purple">Observações</h3>
              <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded">
                {data.observacoes}
              </p>
            </div>
          )}

          {/* Rodapé - Compacto */}
          <div className="border-t pt-2 text-xs text-gray-600">
            <p>Relatório gerado automaticamente pelo Sistema de Vistorias - {formatDate(new Date().toISOString())} às {getCurrentTime()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PreviewPDF;
