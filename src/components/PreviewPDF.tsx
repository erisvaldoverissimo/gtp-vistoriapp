
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Edit, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDownloadPDF = () => {
    // Simular download do PDF
    toast({
      title: "PDF Gerado",
      description: "O relatório foi gerado e está sendo baixado.",
    });
    console.log('Gerando PDF com dados:', data);
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
          <Button onClick={handleDownloadPDF} className="bg-teal-600 hover:bg-teal-700">
            <Download size={18} className="mr-2" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Preview do PDF */}
      <Card className="max-w-4xl mx-auto">
        <div className="p-8 bg-white">
          {/* Cabeçalho do Relatório */}
          <div className="bg-teal-700 text-white p-6 rounded-t-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-teal-700 font-bold text-xl">V</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Relatório de vistoria (fotográfico)</h1>
                  <p className="text-teal-100">Sistema de Vistorias Prediais</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações da Vistoria */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

          {/* Tabela de Detalhes */}
          <div className="mb-6">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left w-[15%]">Ambiente</th>
                  <th className="border border-gray-300 p-3 text-left w-[15%]">Grupo</th>
                  <th className="border border-gray-300 p-3 text-left w-[15%]">Item</th>
                  <th className="border border-gray-300 p-3 text-left w-[12%]">Status</th>
                  <th className="border border-gray-300 p-3 text-left w-[43%]">Parecer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 text-sm">{data.ambiente}</td>
                  <td className="border border-gray-300 p-3 text-sm">{data.grupo}</td>
                  <td className="border border-gray-300 p-3 text-sm">{data.item}</td>
                  <td className="border border-gray-300 p-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      data.status === 'N/A' ? 'bg-gray-200' :
                      data.status === 'Conforme' ? 'bg-green-200 text-green-800' :
                      data.status === 'Não Conforme' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {data.status}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-3 text-sm">{data.parecer}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Área de Fotos */}
          {data.fotos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Evidências Fotográficas</h3>
              <div className="space-y-6">
                {data.fotos.map((foto, index) => {
                  // Buscar descrição da foto no estado do componente UploadFotos
                  // Como não temos acesso direto, vamos usar uma estrutura que pode ser passada
                  const fotoComDescricao = foto as File & { descricao?: string };
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <img
                            src={URL.createObjectURL(foto)}
                            alt={`Foto ${index + 1}`}
                            className="w-full aspect-square object-cover rounded"
                          />
                          <p className="text-sm font-medium text-center mt-2">
                            Foto {String(index + 1).padStart(2, '0')}
                          </p>
                        </div>
                        <div className="flex flex-col justify-start">
                          <h4 className="font-semibold text-sm mb-2">Descrição:</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
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

          {/* Observações */}
          {data.observacoes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Observações</h3>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded">
                {data.observacoes}
              </p>
            </div>
          )}

          {/* Rodapé */}
          <div className="border-t pt-4 text-xs text-gray-600">
            <p>Relatório gerado automaticamente pelo Sistema de Vistorias - {formatDate(new Date().toISOString())} às {getCurrentTime()}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PreviewPDF;
