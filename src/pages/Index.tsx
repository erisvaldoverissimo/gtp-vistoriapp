
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
      return (
        <PreviewPDF 
          data={previewData} 
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
        return (
          <GerenciarAmbientesGrupos 
            condominios={condominios}
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
