
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import NovaVistoriaSupabase from '@/components/NovaVistoriaSupabase';
import ListaVistoriasSupabase from '@/components/ListaVistoriasSupabase';
import PreviewPDF from '@/components/PreviewPDF';
import Configuracoes from '@/components/Configuracoes';
import GerenciarCondominios from '@/components/GerenciarCondominios';
import GerenciarAmbientesGrupos from '@/components/GerenciarAmbientesGrupos';
import ChatIA from '@/components/ChatIA';
import GerenciarUsuarios from '@/components/GerenciarUsuarios';
import { useCondominiosSupabase } from '@/hooks/useCondominiosSupabase';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('vistorias');
  const [previewData, setPreviewData] = useState<VistoriaSupabase | null>(null);
  const { condominios } = useCondominiosSupabase();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setPreviewData(null);
  };

  const handleNovaVistoria = () => {
    setCurrentPage('nova-vistoria');
    setPreviewData(null);
  };

  const handlePreview = (data: VistoriaSupabase) => {
    setPreviewData(data);
    setCurrentPage('preview');
  };

  const handleBackFromPreview = () => {
    setPreviewData(null);
    setCurrentPage('nova-vistoria');
  };

  const handleBackFromNova = () => {
    setCurrentPage('vistorias');
    setPreviewData(null);
  };

  const renderContent = () => {
    if (currentPage === 'preview' && previewData) {
      // Converter VistoriaSupabase para o formato esperado pelo PreviewPDF
      const previewDataFormatted = {
        numeroInterno: previewData.numero_interno,
        dataVistoria: previewData.data_vistoria,
        condominio: previewData.condominio?.nome || '',
        responsavel: previewData.responsavel,
        observacoes: previewData.observacoes_gerais || '',
        grupos: previewData.grupos.map(grupo => ({
          id: grupo.id || '',
          ambiente: grupo.ambiente,
          grupo: grupo.grupo,
          item: grupo.item,
          status: grupo.status,
          parecer: grupo.parecer,
          // Converter FotoVistoriaSupabase para o formato File esperado pelo PreviewPDF
          fotos: (grupo.fotos || []).map(foto => {
            // Criar um File mock para compatibilidade com o PreviewPDF
            const file = new File([''], foto.arquivo_nome, { 
              type: foto.tipo_mime || 'image/jpeg'
            });
            // Adicionar propriedades customizadas
            Object.defineProperty(file, 'descricao', {
              value: foto.descricao || '',
              writable: true
            });
            return file as File & { descricao?: string };
          })
        }))
      };

      return (
        <PreviewPDF 
          data={previewDataFormatted} 
          onBack={handleBackFromPreview}
          onEdit={() => setCurrentPage('nova-vistoria')}
        />
      );
    }

    switch (currentPage) {
      case 'nova-vistoria':
        return (
          <NovaVistoriaSupabase 
            onPreview={handlePreview}
            onBack={handleBackFromNova}
          />
        );
      case 'usuarios':
        return <GerenciarUsuarios />;
      case 'condominios':
        return (
          <GerenciarCondominios 
            condominios={condominios}
            onCondominiosChange={() => {}}
          />
        );
      case 'ambientes-grupos':
        // Converter CondominioSupabase[] para o formato esperado
        const condominiosFormatted = condominios.map(cond => ({
          id: cond.id,
          nome: cond.nome,
          endereco: cond.endereco,
          responsavel: '',
          telefone: cond.telefone || '',
          dataCadastro: cond.created_at,
          proximoNumero: 1
        }));
        
        return (
          <GerenciarAmbientesGrupos 
            condominios={condominiosFormatted}
          />
        );
      case 'chat-ia':
        return <ChatIA />;
      case 'configuracoes':
        return <Configuracoes />;
      case 'vistorias':
      default:
        return <ListaVistoriasSupabase onNovaVistoria={handleNovaVistoria} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
