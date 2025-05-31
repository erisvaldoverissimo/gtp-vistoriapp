
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import NovaVistoria from '@/components/NovaVistoria';
import ListaVistorias from '@/components/ListaVistorias';
import PreviewPDF from '@/components/PreviewPDF';
import Configuracoes from '@/components/Configuracoes';
import GerenciarCondominios from '@/components/GerenciarCondominios';
import ChatIA from '@/components/ChatIA';
import GerenciarUsuarios from '@/components/GerenciarUsuarios';
import { useCondominios } from '@/hooks/useCondominios';
import { useVistorias } from '@/hooks/useVistorias';

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
  condominioId: string;
  numeroInterno: string;
  idSequencial: number;
  dataVistoria: string;
  observacoes: string;
  responsavel: string;
  grupos: GrupoVistoria[];
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState('vistorias');
  const [previewData, setPreviewData] = useState<VistoriaData | null>(null);
  const { condominios, atualizarCondominios, obterProximoNumero, incrementarNumero } = useCondominios();
  const { salvarVistoria } = useVistorias();

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

  const handleEditFromPreview = () => {
    setCurrentPage('nova-vistoria');
    // Mantém os dados do previewData para serem editados
  };

  const handleSalvarVistoria = (data: VistoriaData) => {
    // Converter fotos para formato de salvamento (apenas nome e descrição)
    const grupos = data.grupos.map(grupo => ({
      ...grupo,
      fotos: grupo.fotos.map(foto => ({
        name: foto.name,
        descricao: foto.descricao
      }))
    }));

    const vistoriaSalva = {
      condominio: data.condominio,
      condominioId: data.condominioId,
      numeroInterno: data.numeroInterno,
      dataVistoria: data.dataVistoria,
      observacoes: data.observacoes,
      responsavel: data.responsavel,
      grupos
    };

    salvarVistoria(vistoriaSalva);
    incrementarNumero(data.condominioId);
  };

  const renderContent = () => {
    if (currentPage === 'preview' && previewData) {
      return (
        <PreviewPDF 
          data={previewData} 
          onBack={handleBackFromPreview}
          onEdit={handleEditFromPreview}
          onSave={handleSalvarVistoria}
        />
      );
    }

    switch (currentPage) {
      case 'nova-vistoria':
        return (
          <NovaVistoria 
            onPreview={handlePreview} 
            condominios={condominios}
            obterProximoNumero={obterProximoNumero}
            incrementarNumero={incrementarNumero}
            initialData={previewData}
          />
        );
      case 'usuarios':
        return <GerenciarUsuarios />;
      case 'condominios':
        return (
          <GerenciarCondominios 
            condominios={condominios}
            onCondominiosChange={atualizarCondominios}
          />
        );
      case 'chat-ia':
        return <ChatIA />;
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
