

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

interface GrupoVistoria {
  id: string;
  ambiente: string;
  grupo: string;
  item: string;
  status: string;
  parecer: string;
  fotos: FotoComDescricao[];
}

interface VistoriaData {
  condominio: string;
  numeroInterno: string;
  dataVistoria: string;
  observacoes: string;
  responsavel: string;
  grupos: GrupoVistoria[];
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

  const slugify = (text: string) => {
    return text.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  };

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pages = Array.from(
      document.querySelectorAll(".page")
    ) as HTMLElement[];

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
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

    pdf.save(
      `Relatorio-${data.numeroInterno}-${data.condominio.replace(/\s+/g, "-")}.pdf`
    );
  };

  const handleSendEmail = () => {
    toast({
      title: "Email Enviado",
      description: "O relatório foi enviado por email com sucesso.",
    });
    console.log('Enviando email com dados:', data);
  };

  const calculateTotalPages = () => {
    let totalPages = 0;
    data.grupos.forEach(grupo => {
      totalPages += Math.ceil(grupo.fotos.length / 2);
    });
    return totalPages;
  };

  const totalPages = calculateTotalPages();

  const renderCabecalho = () => (
    <div className="bg-brand-purple text-white p-4 rounded-t-lg mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/9e07dcd0-b996-4996-9028-7daeb90e3140.png" 
            alt="GTP Logo Left" 
            className="w-16 h-16 object-contain"
          />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold">Relatório de Vistoria Técnica - GTP</h1>
          <p className="text-purple-200 text-sm">Sistema de Vistorias Prediais</p>
        </div>
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/bfe02df4-f545-4232-ad0a-e69690083a38.png" 
            alt="GTP Logo Right" 
            className="w-16 h-16 object-contain"
          />
        </div>
      </div>
    </div>
  );

  const renderInformacoesVistoria = () => (
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
        <div className="col-span-2">
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
  );

  const renderTabelaGrupo = (grupo: GrupoVistoria, grupoIndex: number) => (
    <div className="mb-4">
      <h3 className="text-base font-semibold mb-2 text-brand-purple">
        Sistema de Vistoria {grupoIndex + 1}
      </h3>
      <table className="w-full border-collapse border border-gray-300 text-xs">
        <thead>
          <tr className="bg-brand-purple text-white">
            <th className="border border-gray-300 p-2 text-center w-[15%]">Ambiente</th>
            <th className="border border-gray-300 p-2 text-center w-[15%]">Sistema</th>
            <th className="border border-gray-300 p-2 text-center w-[15%]">Subsistema</th>
            <th className="border border-gray-300 p-2 text-center w-[12%]">Status</th>
            <th className="border border-gray-300 p-2 text-center w-[43%]">Parecer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2 text-center">{grupo.ambiente}</td>
            <td className="border border-gray-300 p-2 text-center">{grupo.grupo}</td>
            <td className="border border-gray-300 p-2 text-center">{grupo.item}</td>
            <td className="border border-gray-300 p-2 text-center">
              <span className={`px-1 py-0.5 rounded text-xs ${
                grupo.status === 'N/A' ? 'bg-gray-200' :
                grupo.status === 'Conforme' ? 'bg-brand-green text-white' :
                grupo.status === 'Não Conforme' ? 'bg-red-200 text-red-800' :
                'bg-yellow-200 text-yellow-800'
              }`}>
                {grupo.status}
              </span>
            </td>
            <td className="border border-gray-300 p-2 text-center">{grupo.parecer}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderObservacoesGerais = () => (
    data.observacoes && (
      <div className="mb-4">
        <h3 className="text-base font-semibold mb-2 text-brand-purple">Observações Gerais</h3>
        <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded">
          {data.observacoes}
        </p>
      </div>
    )
  );

  const renderRodape = (currentPageNumber: number) => (
    <div className="mt-auto">
      {/* Observações Gerais no rodapé */}
      {renderObservacoesGerais()}
      
      {/* Rodapé com numeração */}
      <div className="border-t pt-2 text-xs text-gray-600 flex justify-between items-center">
        <p>Relatório gerado automaticamente pelo Sistema de Vistorias - {formatDate(new Date().toISOString())} às {getCurrentTime()}</p>
        <p className="font-medium">Página {currentPageNumber}/{totalPages}</p>
      </div>
    </div>
  );

  const renderFotoCard = (foto: FotoComDescricao, fotoIndex: number, grupoIndex: number) => {
    const fotoComDescricao = foto as File & { descricao?: string };
    const numeroFoto = fotoIndex + 1;
    
    return (
      <div className="border rounded-lg p-2 flex-1">
        <img
          src={URL.createObjectURL(foto)}
          alt={`Foto ${numeroFoto} - Sistema ${grupoIndex + 1}`}
          className="w-full aspect-square object-cover rounded mb-2"
        />
        <div>
          <p className="text-xs font-medium mb-1">
            Foto {String(numeroFoto).padStart(2, '0')} - Sistema {grupoIndex + 1}
          </p>
          <p className="text-xs text-gray-700 leading-relaxed">
            {fotoComDescricao.descricao || 'Evidência fotográfica da vistoria'}
          </p>
        </div>
      </div>
    );
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

      {/* Preview do PDF */}
      <Card className="max-w-none mx-auto" style={{ width: '210mm', maxWidth: '210mm' }}>
        <div ref={reportRef} className="bg-white">
          {(() => {
            let currentPageNumber = 0;
            
            return data.grupos.map((grupo, grupoIndex) => (
              <React.Fragment key={grupo.id}>
                {grupo.fotos.map((foto, idx) => {
                  const isFirstOfPair = idx % 2 === 0;
                  const isLastOfPair = idx % 2 === 1 || idx === grupo.fotos.length - 1;

                  if (isFirstOfPair) {
                    currentPageNumber++;
                  }

                  return (
                    <React.Fragment key={idx}>
                      {isFirstOfPair && (
                        <div className="page flex flex-col gap-3 min-h-screen">
                          {/* Cabeçalho + tabela só no idx === 0 */}
                          {idx === 0 && renderCabecalho()}
                          {idx === 0 && renderInformacoesVistoria()}
                          {idx === 0 && renderTabelaGrupo(grupo, grupoIndex)}
                          
                          {/* Título das evidências fotográficas */}
                          {idx === 0 ? (
                            <h4 className="text-sm font-semibold mb-3 text-brand-purple">
                              Evidências Fotográficas - Sistema {grupoIndex + 1}
                            </h4>
                          ) : (
                            <>
                              {renderCabecalho()}
                              <h4 className="text-sm font-semibold mb-3 text-brand-purple">
                                Evidências Fotográficas - Sistema {grupoIndex + 1} (Continuação)
                              </h4>
                            </>
                          )}
                          
                          <div className="flex gap-4 mb-4 flex-1">
                            {/* Renderizar a foto */}
                            {renderFotoCard(foto, idx, grupoIndex)}
                            
                            {/* Renderizar a segunda foto se existir */}
                            {!isLastOfPair && grupo.fotos[idx + 1] && renderFotoCard(grupo.fotos[idx + 1], idx + 1, grupoIndex)}
                          </div>
                          
                          {renderRodape(currentPageNumber)}
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ));
          })()}
        </div>
      </Card>
    </div>
  );
};

export default PreviewPDF;

