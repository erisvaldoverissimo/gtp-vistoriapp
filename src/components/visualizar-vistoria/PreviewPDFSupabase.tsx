import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Mail } from 'lucide-react';
import { VerificacaoEnvioEmail } from '@/components/email/VerificacaoEnvioEmail';
import { useToast } from '@/hooks/use-toast';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { useChecklistVistoria } from '@/hooks/useChecklistVistoria';
import { supabase } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface PreviewPDFSupabaseProps {
  vistoria: VistoriaSupabase;
  onBack: () => void;
}

const PreviewPDFSupabase = ({ vistoria: vistoriaInicial, onBack }: PreviewPDFSupabaseProps) => {
  const { toast } = useToast();
  const { reportRef, generatePDF } = usePDFGenerator();
  const { sistemasDisponiveis } = useChecklistVistoria();
  const [vistoria, setVistoria] = useState(vistoriaInicial);
  const [mostrarVerificacaoEmail, setMostrarVerificacaoEmail] = useState(false);

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

        const grupos = (vistoriaData.grupos_vistoria || []).map(grupo => {
          const grupoAny = grupo as any; // Type assertion para campos novos
          return {
            id: grupo.id,
            vistoria_id: grupo.vistoria_id,
            ambiente: grupo.ambiente,
            grupo: grupo.grupo,
            item: grupo.item,
            status: grupo.status,
            parecer: grupo.parecer || '',
            ordem: grupo.ordem || 0,
            fotos: grupo.fotos_vistoria || [],
            // Campos do checklist técnico
            modo_checklist: grupoAny.modo_checklist || false,
            checklist_tecnico: grupoAny.checklist_tecnico ? 
              (typeof grupoAny.checklist_tecnico === 'string' ? 
                JSON.parse(grupoAny.checklist_tecnico) : 
                grupoAny.checklist_tecnico) : 
              undefined
          };
        });

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
    console.log('=== formatDate Debug ===');
    console.log('dateString recebido:', dateString);
    
    // Parse a data como local para evitar problemas de timezone
    const [year, month, day] = dateString.split('-');
    console.log('Componentes da data:', { year, month, day });
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    console.log('Data criada:', date);
    console.log('Data formatada:', date.toLocaleDateString('pt-BR'));
    
    return date.toLocaleDateString('pt-BR');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleConfirmarEnvioEmail = async (dadosEnvio: {
    vistoriaId: string;
    emailPrincipal: string;
    emailsCopia: string[];
    nomeCondominio: string;
    numeroInterno: string;
    dataVistoria: string;
  }) => {
    try {
      console.log('=== DADOS ANTES DO ENVIO ===');
      console.log('Dados enviados para a função:', dadosEnvio);
      console.log('emailsCopia tipo:', typeof dadosEnvio.emailsCopia);
      console.log('emailsCopia é array:', Array.isArray(dadosEnvio.emailsCopia));
      console.log('emailsCopia valor:', dadosEnvio.emailsCopia);
      console.log('emailsCopia length:', dadosEnvio.emailsCopia?.length);
      console.log('===========================');

      const { data, error } = await supabase.functions.invoke('enviar-email-pdf', {
        body: {
          ...dadosEnvio,
          // Garantir que emailsCopia seja sempre um array
          emailsCopia: Array.isArray(dadosEnvio.emailsCopia) ? dadosEnvio.emailsCopia : []
        }
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar email. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log('Resposta da função:', data);

      if (data.success) {
        toast({
          title: "Email Enviado",
          description: `Relatório enviado com sucesso para ${data.destinatarios.length} destinatário(s).`,
        });
      } else {
        toast({
          title: "Erro",
          description: data.error || "Erro desconhecido ao enviar email.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast({
        title: "Erro",
        description: "Erro interno. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const calculateTotalPages = () => {
    if (!vistoria.grupos || vistoria.grupos.length === 0) {
      return 1;
    }
    
    let totalPages = 0;
    vistoria.grupos.forEach(grupo => {
      const fotosCount = (grupo.fotos || []).length;
      if (fotosCount > 0) {
        // Primeira página + páginas adicionais com 2 fotos cada
        totalPages += 1 + Math.ceil(Math.max(0, fotosCount - 2) / 2);
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

  const renderTabelaGrupo = (grupo: any, grupoIndex: number) => {
    // Se for modo checklist técnico, renderizar informações estruturadas
    if (grupo.modo_checklist && grupo.checklist_tecnico) {
      const checklist = grupo.checklist_tecnico;
      const sistema = sistemasDisponiveis.find(s => s.id === checklist.sistemaId);
      const elemento = sistema?.elementos.find(e => e.id === checklist.elementoId);
      const manifestacoesSelecionadas = elemento?.manifestacoes.filter(m => 
        checklist.manifestacoesIds?.includes(m.id)
      ) || [];

      return (
        <div className="mb-4">
          <h3 className="text-base font-semibold mb-2 text-brand-purple">
            Sistema de Vistoria {grupoIndex + 1} - <span className="text-sm bg-blue-100 px-2 py-1 rounded">Checklist Técnico</span>
          </h3>
          
          {/* Informações Técnicas Estruturadas */}
          <div className="bg-blue-50 p-3 rounded-lg mb-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="font-semibold text-blue-800">Sistema:</span>
                <br />
                {sistema?.nome || 'Não informado'}
              </div>
              <div>
                <span className="font-semibold text-blue-800">Elemento:</span>
                <br />
                {elemento?.nome || 'Não informado'}
              </div>
              <div>
                <span className="font-semibold text-blue-800">Tipo de Material:</span>
                <br />
                {checklist.tipo || 'Não informado'}
              </div>
              <div>
                <span className="font-semibold text-blue-800">Status:</span>
                <br />
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  grupo.status === 'N/A' ? 'bg-gray-200' :
                  grupo.status === 'Conforme' ? 'bg-brand-green text-white' :
                  grupo.status === 'Não Conforme' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {grupo.status}
                </span>
              </div>
            </div>
          </div>

          {/* Manifestações Patológicas */}
          {manifestacoesSelecionadas.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold mb-2 text-red-600">Manifestações Patológicas Identificadas:</h4>
              <div className="space-y-1">
                {manifestacoesSelecionadas.map((manifestacao, index) => (
                  <div key={manifestacao.id} className="bg-red-50 p-2 rounded border-l-4 border-red-400">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs bg-red-100 px-2 py-1 rounded text-red-700 min-w-fit">
                        {manifestacao.codigo}
                      </span>
                      <span className="text-xs text-gray-700 leading-relaxed">
                        {manifestacao.descricao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações Técnicas */}
          {checklist.observacoesTecnicas && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold mb-2 text-gray-700">Observações Técnicas:</h4>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded leading-relaxed">
                {checklist.observacoesTecnicas}
              </p>
            </div>
          )}

          {/* Parecer Geral (se existir) */}
          {grupo.parecer && (
            <div className="mb-3">
              <h4 className="text-sm font-semibold mb-2 text-gray-700">Parecer Geral:</h4>
              <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded leading-relaxed">
                {truncateText(grupo.parecer, 200)}
              </p>
            </div>
          )}
        </div>
      );
    }

    // Modo tradicional - tabela original
    return (
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
  };

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
    const descricaoFoto = foto.descricao || 'Evidência fotográfica da vistoria';
    
    console.log(`Renderizando foto ${numeroFoto} do grupo ${grupoIndex + 1}:`, {
      url: foto.arquivo_url,
      nome: foto.arquivo_nome,
      descricao: descricaoFoto
    });
    
    return (
      <div className="border rounded-lg p-3 flex-1">
        <AspectRatio ratio={4/3}>
          <img
            src={foto.arquivo_url}
            alt={`Foto ${numeroFoto} - Sistema ${grupoIndex + 1}`}
            className="w-full h-full object-cover rounded"
            crossOrigin="anonymous"
            loading="eager"
            style={{
              maxWidth: '100%',
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
        </AspectRatio>
        <div>
          <p className="text-sm font-medium mb-2">
            Foto {String(numeroFoto).padStart(2, '0')} - Sistema {grupoIndex + 1}
          </p>
          <p className="text-xs text-gray-700 leading-relaxed break-words">
            {descricaoFoto}
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
          <Button onClick={() => setMostrarVerificacaoEmail(true)} variant="outline">
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
            
            // Se não houver grupos, renderiza uma página-resumo para permitir visualização e geração de PDF
            if (!vistoria.grupos || vistoria.grupos.length === 0) {
              currentPageNumber++;
              return (
                <div className="page flex flex-col gap-3 min-h-screen">
                  {renderCabecalho()}
                  {renderInformacoesVistoria()}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p className="text-sm">Nenhum sistema de vistoria cadastrado.</p>
                      <p className="text-xs mt-2">O relatório contém apenas informações gerais.</p>
                    </div>
                  </div>
                  {renderRodape(currentPageNumber)}
                </div>
              );
            }
            
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

              const pages = [] as React.ReactNode[];
              
              // Primeira página com cabeçalho, tabela e até 2 fotos
              currentPageNumber++;
              pages.push(
                <div key={`${grupo.id}-primeira`} className="page flex flex-col gap-3 min-h-screen">
                  {renderCabecalho()}
                  {renderInformacoesVistoria()}
                  {renderTabelaGrupo(grupo, grupoIndex)}
                  
                  <h4 className="text-sm font-semibold mb-3 text-brand-purple">
                    Evidências Fotográficas - Sistema {grupoIndex + 1}
                  </h4>
                  
                  {/* Layout com 2 fotos lado a lado na primeira página */}
                  {fotos.length > 0 && (
                    <div className="flex gap-4 mb-4">
                      {fotos.slice(0, 2).map((foto, idx) => (
                        <div key={`primeira-${idx}`} className="flex-1">
                          {renderFotoCard(foto, idx, grupoIndex)}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {renderRodape(currentPageNumber)}
                </div>
              );

              // Páginas adicionais com 2 fotos cada (se necessário)
              const fotosRestantes = fotos.slice(2);
              for (let i = 0; i < fotosRestantes.length; i += 2) {
                currentPageNumber++;
                const fotosPagina = fotosRestantes.slice(i, i + 2);
                
                pages.push(
                  <div key={`${grupo.id}-adicional-${i}`} className="page flex flex-col gap-3 min-h-screen">
                    {renderCabecalho()}
                    
                    <h4 className="text-sm font-semibold mb-3 text-brand-purple">
                      Evidências Fotográficas - Sistema {grupoIndex + 1} (Continuação)
                    </h4>
                    
                    <div className="flex gap-4 mb-4">
                      {fotosPagina.map((foto, idx) => (
                        <div key={`adicional-${i + idx}`} className="flex-1">
                          {renderFotoCard(foto, i + idx + 2, grupoIndex)}
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

      {/* Modal de Verificação de Email */}
      <VerificacaoEnvioEmail
        open={mostrarVerificacaoEmail}
        onClose={() => setMostrarVerificacaoEmail(false)}
        dadosVistoria={vistoria}
        onEnviar={handleConfirmarEnvioEmail}
      />
    </div>
  );
};

export default PreviewPDFSupabase;
