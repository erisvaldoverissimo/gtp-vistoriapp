
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

interface Vistoria {
  id: string;
  condominio: string;
  numeroInterno: string;
  dataVistoria: string;
  ambiente: string;
  status: string;
  responsavel: string;
  fotosCount: number;
  observacoes?: string;
  condominioId?: string;
  idSequencial?: number;
}

const Index = () => {
  const [currentPage, setCurrentPage] = useState('vistorias');
  const [previewData, setPreviewData] = useState<VistoriaData | null>(null);
  const [editingVistoria, setEditingVistoria] = useState<Vistoria | null>(null);
  const { condominios, atualizarCondominios, obterProximoNumero, incrementarNumero } = useCondominios();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== 'preview') {
      setPreviewData(null);
    }
    if (page !== 'nova-vistoria') {
      setEditingVistoria(null);
    }
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

  const handleEditVistoria = (vistoria: Vistoria) => {
    // Converter dados da vistoria para o formato esperado pelo NovaVistoria
    const vistoriaData: VistoriaData = {
      condominio: vistoria.condominio,
      condominioId: vistoria.condominioId || '',
      numeroInterno: vistoria.numeroInterno,
      idSequencial: vistoria.idSequencial || 0,
      dataVistoria: vistoria.dataVistoria,
      observacoes: vistoria.observacoes || '',
      responsavel: vistoria.responsavel,
      grupos: [{
        id: '1',
        ambiente: vistoria.ambiente,
        grupo: '',
        item: '',
        status: vistoria.status,
        parecer: '',
        fotos: []
      }]
    };
    
    setEditingVistoria(vistoria);
    setPreviewData(vistoriaData);
    setCurrentPage('nova-vistoria');
  };

  const renderContent = () => {
    if (currentPage === 'preview' && previewData) {
      return (
        <PreviewPDF 
          data={previewData} 
          onBack={handleBackFromPreview}
          onEdit={handleEditFromPreview}
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
            onNavigate={handleNavigate}
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
        return (
          <ListaVistorias 
            onNavigate={handleNavigate}
            onEditVistoria={handleEditVistoria}
          />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  );
};

export default Index;
