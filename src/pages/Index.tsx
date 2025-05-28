
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import NovaVistoria from '@/components/NovaVistoria';
import ListaVistorias from '@/components/ListaVistorias';
import PreviewPDF from '@/components/PreviewPDF';
import Configuracoes from '@/components/Configuracoes';
import GerenciarCondominios from '@/components/GerenciarCondominios';
import { useCondominios } from '@/hooks/useCondominios';

interface VistoriaData {
  condominio: string;
  condominioId: string;
  numeroInterno: string;
  idSequencial: number;
  dataVistoria: string;
  ambiente: string;
  grupo: string;
  item: string;
  status: string;
  parecer: string;
  observacoes: string;
  responsavel: string;
  fotos: File[];
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState('vistorias');
  const [previewData, setPreviewData] = useState<VistoriaData | null>(null);
  const { condominios, atualizarCondominios, obterProximoNumero, incrementarNumero } = useCondominios();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setPreviewData(null);
  };

  const handlePreview = (data: VistoriaData) => {
    setPreviewData(data);
    setCurrentPage('preview');
  };

  const handleBackFromPreview = () => {
    setPreviewData(null);
    setCurrentPage('nova-vistoria');
  };

  const renderContent = () => {
    if (currentPage === 'preview' && previewData) {
      return <PreviewPDF data={previewData} onBack={handleBackFromPreview} />;
    }

    switch (currentPage) {
      case 'nova-vistoria':
        return (
          <NovaVistoria 
            onPreview={handlePreview} 
            condominios={condominios}
            obterProximoNumero={obterProximoNumero}
            incrementarNumero={incrementarNumero}
          />
        );
      case 'condominios':
        return (
          <GerenciarCondominios 
            condominios={condominios}
            onCondominiosChange={atualizarCondominios}
          />
        );
      case 'configuracoes':
        return <Configuracoes />;
      case 'vistorias':
      default:
        return <ListaVistorias />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
