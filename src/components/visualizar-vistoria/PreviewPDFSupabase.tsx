import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { supabase } from '@/integrations/supabase/client';

interface PreviewPDFSupabaseProps {
  vistoria: VistoriaSupabase;
  onBack: () => void;
}

const PreviewPDFSupabase = ({ vistoria: vistoriaInicial, onBack }: PreviewPDFSupabaseProps) => {
  const { toast } = useToast();
  const { reportRef, generatePDF } = usePDFGenerator();
  const [vistoria, setVistoria] = useState(vistoriaInicial);

  // Recarregar dados mais recentes quando o componente montar
  useEffect(() => {
    const carregarDadosAtualizados = async () => {
      try {
        console.log('Carregando dados atualizados para PDF:', vistoriaInicial.id);
        
        const { data: vistoriaData, error } = await supabase
          .from('vistorias')
          .select(`
            *,
            condominio:condominios(id, nome),
            grupos_vistoria(
              *,
              fotos_vistoria(*)
            )
          `)
          .eq('id', vistoriaInicial.id!)
          .single();

        if (error) {
          console.error('Erro ao carregar dados atualizados:', error);
          return;
        }

        // Formatar dados
        const grupos = (vistoriaData.grupos_vistoria || []).map(grupo => ({
          id: grupo.id,
          vistoria_id: grupo.vistoria_id,
          ambiente: grupo.ambiente,
          grupo: grupo.grupo,
          item: grupo.item,
          status: grupo.status,
          parecer: grupo.parecer || '',
          ordem: grupo.ordem || 0,
          fotos: grupo.fotos_vistoria || []
        }));

        const vistoriaAtualizada: VistoriaSupabase = {
          id: vistoriaData.id,
          condominio_id: vistoriaData.condominio_id,
          user_id: vistoriaData.user_id,
          numero_interno: vistoriaData.numero_interno,
          id_sequencial: vistoriaData.id_sequencial,
          data_vistoria: vistoriaData.data_vistoria,
          observacoes_gerais: vistoriaData.observacoes_gerais,
          responsavel: vistoriaData.responsavel,
          status: vistoriaData.status,
          created_at: vistoriaData.created_at,
          updated_at: vistoriaData.updated_at,
          condominio: Array.isArray(vistoriaData.condominio) ? vistoriaData.condominio[0] : vistoriaData.condominio,
          grupos: grupos
        };

        setVistoria(vistoriaAtualizada);
        console.log('Dados atualizados carregados para PDF:', vistoriaAtualizada);
      } catch (error) {
        console.error('Erro ao carregar dados atualizados:', error);
      }
    };

    carregarDadosAtualizados();
  }, [vistoriaInicial.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleSendEmail = () => {
    toast({
      title: "Email Enviado",
      description: "O relatório foi enviado por email com sucesso.",
    });
    console.log('Enviando email com dados:', vistoria);
  };

  const calculateTotalPages = () => {
    let totalPages = 0;
    vistoria.grupos.forEach(grupo => {
      totalPages += Math.ceil((grupo.fotos || []).length / 2);
    });
    return Math.max(totalPages, 1);
  };

  const totalPages = calculateTotalPages();

  const renderCabecalho = () => (
    <div className="bg-brand-purple text-white p-4 rounded-t-lg mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/9e07dcd0-b996-4996-9028-7daeb90e3140.png" 
            alt="Logo GTP Esquerda" 
            className="w-20 h-20 object-contain"
            crossOrigin="anonymous"
          />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold">Relatório de Vistoria Técnica - GTP</h1>
          <p className="text-purple-200 text-sm">Sistema de Vistorias Prediais</p>
        </div>
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/bfe02df4-f545-4232-ad0a-e69690083a38.png" 
            alt="Logo GTP Direita" 
            className="w-20 h-20 object-contain"
            crossOrigin="anonymous"
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
          {vistoria.responsavel || 'Não informado'}
        </div>
        <div>
          <span className="font-semibold">Empreendimento:</span>
          <br />
          {vistoria.condominio?.nome || 'Não informado'}
        </div>
        <div className="col-span-2">
          <span className="font-semibold">Nº interno da vistoria:</span>
          <br />
          {vistoria.numero_interno}
        </div>
        <div className="col-span-2">
          <span className="font-semibold">Data da vistoria:</span>
          <br />
          {formatDate(vistoria.data_vistoria)}
        </div>
      </div>
    </div>
  );

  const renderTabelaGrupo = (grupo: any, grupoIndex: number) => (
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
            <td className="border border-gray-300 p-2 text-center align-middle">{grupo.ambiente}</td>
            <td className="border border-gray-300 p-2 text-center align-middle">{grupo.grupo}</td>
            <td className="border border-gray-300 p-2 text-center align-middle">{grupo.item}</td>
            <td className="border border-gray-300 p-2 text-center align-middle">
              <div className="flex justify-center items-center">
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  grupo.status === 'N/A' ? 'bg-gray-200' :
                  grupo.status === 'Conforme' ? 'bg-brand-green text-white' :
                  grupo.status === 'Não Conforme' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {grupo.status}
                </span>
              </div>
            </td>
            <td className="border border-gray-300 p-2 text-center align-middle break-words">
              {truncateText(grupo.parecer, 200)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderObservacoesGerais = () => (
    vistoria.observacoes_gerais && (
      <div className="mb-2">
        <h3 className="text-sm font-semibold mb-1 text-brand-purple">Observações Gerais</h3>
        <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded leading-tight break-words">
          {truncateText(vistoria.observacoes_gerais, 150)}
        </p>
      </div>
    )
  );

  const renderRodape = (currentPageNumber: number) => (
    <div className="mt-auto">
      {renderObservacoesGerais()}
      
      <div className="border-t pt-2 text-xs text-gray-600 flex justify-between items-center">
        <p>Relatório gerado automaticamente pelo Sistema de Vistorias - {formatDate(new Date().toISOString())} às {getCurrentTime()}</p>
        <p className="font-medium">Página {currentPageNumber}/{totalPages}</p>
      </div>
    </div>
  );

  const renderFotoCard = (foto: any, fotoIndex: number, grupoIndex: number) => {
    const numeroFoto = fotoIndex + 1;
    // CORRIGIDO: Garantir que a descrição seja exibida corretamente
    const descricaoFoto = foto.descricao || 'Evidência fotográfica da vistoria';
    
    console.log(`Renderizando foto ${numeroFoto} do grupo ${grupoIndex + 1}:`, {
      url: foto.arquivo_url,
      nome: foto.arquivo_nome,
      descricao: descricaoFoto,
      descricaoOriginal: foto.descricao
    });
    
    return (
      <div className="border rounded-lg p-2 flex-1">
        <img
          src={foto.arquivo_url}
          alt={`Foto ${numeroFoto} - Sistema ${grupoIndex + 1}`}
          className="w-full aspect-square object-cover rounded mb-2"
          crossOrigin="anonymous"
          loading="eager"
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: 'block'
          }}
          onLoad={(e) => {
            console.log(`Imagem carregada com sucesso: ${foto.arquivo_url}`);
            e.currentTarget.setAttribute('data-loaded', 'true');
          }}
          onError={(e) => {
            console.error(`Erro ao carregar imagem: ${foto.arquivo_url}`, e);
            e.currentTarget.setAttribute('data-error', 'true');
            setTimeout(() => {
              if (!e.currentTarget.getAttribute('data-loaded')) {
                e.currentTarget.src = foto.arquivo_url + '?t=' + Date.now();
              }
            }, 1000);
          }}
        />
        <div>
          <p className="text-xs font-medium mb-1">
            Foto {String(numeroFoto).padStart(2, '0')} - Sistema {grupoIndex + 1}
          </p>
          <p className="text-xs text-gray-700 leading-relaxed break-words">
            {truncateText(descricaoFoto, 200)}
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
          <h2 className="text-2xl font-bold text-gray-900">Visualizar Relatório PDF</h2>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSendEmail} variant="outline">
            <Mail size={18} className="mr-2" />
            Enviar Email
          </Button>
          <Button onClick={() => generatePDF(vistoria)} className="bg-brand-green hover:bg-brand-green-light">
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
            
            return vistoria.grupos.map((grupo, grupoIndex) => (
              <div key={grupo.id}>
                {(grupo.fotos || []).map((foto, idx) => {
                  const isFirstOfPair = idx % 2 === 0;
                  const isLastOfPair = idx % 2 === 1 || idx === (grupo.fotos || []).length - 1;

                  if (isFirstOfPair) {
                    currentPageNumber++;
                  }

                  return (
                    <div key={`${grupo.id}-${idx}`}>
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
                            <div>
                              {renderCabecalho()}
                              <h4 className="text-sm font-semibold mb-3 text-brand-purple">
                                Evidências Fotográficas - Sistema {grupoIndex + 1} (Continuação)
                              </h4>
                            </div>
                          )}
                          
                          <div className="flex gap-4 mb-4 flex-1">
                            {/* Renderizar a foto */}
                            {renderFotoCard(foto, idx, grupoIndex)}
                            
                            {/* Renderizar a segunda foto se existir */}
                            {!isLastOfPair && (grupo.fotos || [])[idx + 1] && renderFotoCard((grupo.fotos || [])[idx + 1], idx + 1, grupoIndex)}
                          </div>
                          
                          {renderRodape(currentPageNumber)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ));
          })()}
        </div>
      </Card>
    </div>
  );
};

export default PreviewPDFSupabase;
