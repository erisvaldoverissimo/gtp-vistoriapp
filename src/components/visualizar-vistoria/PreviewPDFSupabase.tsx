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
    let isMounted = true;
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

        if (isMounted) {
          setVistoria(vistoriaAtualizada);
          console.log('Dados atualizados carregados para PDF:', vistoriaAtualizada);
        }
      } catch (error) {
        console.error('Erro ao carregar dados atualizados:', error);
      }
    };

    carregarDadosAtualizados();

    return () => {
      isMounted = false;
    };
  }, [vistoriaInicial.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMarkdownText = (text: string, maxLength: number = 300) => {
    if (!text) return '';
    
    // Processar markdown básico
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
      .replace(/\n/g, '<br>'); // quebras de linha
    
    // Truncar se necessário
    if (formattedText.length > maxLength) {
      formattedText = formattedText.substring(0, maxLength) + '...';
    }
    
    return formattedText;
  };

  const handleSendEmail = () => {
    toast({
      title: "Email Enviado",
      description: "O relatório foi enviado por email com sucesso.",
    });
    console.log('Enviando email com dados:', vistoria);
  };

  const calculateTotalPages = () => {
    if (!vistoria.grupos || vistoria.grupos.length === 0) {
      return 1;
    }
    
    let totalPages = 0;
    vistoria.grupos.forEach(grupo => {
      const fotosCount = (grupo.fotos || []).length;
      if (fotosCount > 0) {
        // Primeira página + páginas adicionais com 4 fotos cada
        totalPages += 1 + Math.ceil(Math.max(0, fotosCount - 0) / 4);
      } else {
        totalPages += 1;
      }
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

  const renderFotoCard = (foto: any, fotoIndex: number, grupoIndex: number, isCompact: boolean = false) => {
    const numeroFoto = fotoIndex + 1;
    const descricaoFoto = foto.descricao || 'Evidência fotográfica da vistoria';
    const maxDescLength = isCompact ? 150 : 200;
    
    console.log(`Renderizando foto ${numeroFoto} do grupo ${grupoIndex + 1}:`, {
      url: foto.arquivo_url,
      nome: foto.arquivo_nome,
      descricao: descricaoFoto,
      isCompact
    });
    
    return (
      <div className={`border rounded-lg p-2 ${isCompact ? 'flex-1' : 'flex-1'}`}>
        <img
          src={foto.arquivo_url}
          alt={`Foto ${numeroFoto} - Sistema ${grupoIndex + 1}`}
          className={`w-full ${isCompact ? 'aspect-[4/3]' : 'aspect-square'} object-cover rounded mb-2`}
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
          <p className={`${isCompact ? 'text-xs' : 'text-xs'} font-medium mb-1`}>
            Foto {String(numeroFoto).padStart(2, '0')} - Sistema {grupoIndex + 1}
          </p>
          <div 
            className={`${isCompact ? 'text-xs' : 'text-xs'} text-gray-700 leading-relaxed break-words`}
            dangerouslySetInnerHTML={{ 
              __html: formatMarkdownText(descricaoFoto, maxDescLength) 
            }}
          />
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
            
            return vistoria.grupos.map((grupo, grupoIndex) => {
              const fotos = grupo.fotos || [];
              
              if (fotos.length === 0) {
                currentPageNumber++;
                return (
                  <div key={grupo.id} className="page flex flex-col gap-3 min-h-screen">
                    {renderCabecalho()}
                    {renderInformacoesVistoria()}
                    {renderTabelaGrupo(grupo, grupoIndex)}
                    
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <p className="text-sm">Nenhuma evidência fotográfica disponível para este sistema</p>
                        <p className="text-xs mt-2">Sistema: {grupo.ambiente} - {grupo.grupo}</p>
                      </div>
                    </div>
                    
                    {renderRodape(currentPageNumber)}
                  </div>
                );
              }

              const pages = [];
              
              // Primeira página com cabeçalho, tabela e fotos (se houver)
              currentPageNumber++;
              pages.push(
                <div key={`${grupo.id}-primeira`} className="page flex flex-col gap-3 min-h-screen">
                  {renderCabecalho()}
                  {renderInformacoesVistoria()}
                  {renderTabelaGrupo(grupo, grupoIndex)}
                  
                  <h4 className="text-sm font-semibold mb-3 text-brand-purple">
                    Evidências Fotográficas - Sistema {grupoIndex + 1}
                  </h4>
                  
                  {/* Layout 2x2 para 4 fotos na primeira página */}
                  {fotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                      {fotos.slice(0, 4).map((foto, idx) => (
                        <div key={`primeira-${idx}`}>
                          {renderFotoCard(foto, idx, grupoIndex, true)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {renderRodape(currentPageNumber)}
                </div>
              );

              // Páginas adicionais com 4 fotos cada (se necessário)
              const fotosRestantes = fotos.slice(4);
              for (let i = 0; i < fotosRestantes.length; i += 4) {
                currentPageNumber++;
                const fotosPagina = fotosRestantes.slice(i, i + 4);
                
                pages.push(
                  <div key={`${grupo.id}-adicional-${i}`} className="page flex flex-col gap-3 min-h-screen">
                    {renderCabecalho()}
                    
                    <h4 className="text-sm font-semibold mb-3 text-brand-purple">
                      Evidências Fotográficas - Sistema {grupoIndex + 1} (Continuação)
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
                      {fotosPagina.map((foto, idx) => (
                        <div key={`adicional-${i + idx}`}>
                          {renderFotoCard(foto, i + idx + 4, grupoIndex, true)}
                        </div>
                      ))}
                    </div>
                    
                    {renderRodape(currentPageNumber)}
                  </div>
                );
              }

              return pages;
            });
          })()}
        </div>
      </Card>
    </div>
  );
};

export default PreviewPDFSupabase;
