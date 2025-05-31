
import { useState, useEffect } from 'react';

export interface VistoriaSalva {
  id: string;
  condominio: string;
  condominioId: string;
  numeroInterno: string;
  dataVistoria: string;
  observacoes: string;
  responsavel: string;
  grupos: Array<{
    id: string;
    ambiente: string;
    grupo: string;
    item: string;
    status: string;
    parecer: string;
    fotos: Array<{
      name: string;
      descricao?: string;
    }>;
  }>;
  dataCriacao: string;
}

export const useVistorias = () => {
  const [vistorias, setVistorias] = useState<VistoriaSalva[]>([]);

  // Carregar vistorias do localStorage na inicialização
  useEffect(() => {
    const vistoriasSalvas = localStorage.getItem('vistorias');
    if (vistoriasSalvas) {
      setVistorias(JSON.parse(vistoriasSalvas));
    }
  }, []);

  // Salvar vistorias no localStorage sempre que houver mudança
  useEffect(() => {
    localStorage.setItem('vistorias', JSON.stringify(vistorias));
  }, [vistorias]);

  const salvarVistoria = (vistoria: Omit<VistoriaSalva, 'id' | 'dataCriacao'>) => {
    const novaVistoria: VistoriaSalva = {
      ...vistoria,
      id: Date.now().toString(),
      dataCriacao: new Date().toISOString()
    };
    
    setVistorias(prev => [novaVistoria, ...prev]);
    return novaVistoria.id;
  };

  const obterVistoriasPorCondominio = (condominioId?: string) => {
    if (!condominioId) return vistorias;
    return vistorias.filter(v => v.condominioId === condominioId);
  };

  const obterEstatisticas = (condominioId?: string) => {
    const vistoriasFiltradas = obterVistoriasPorCondominio(condominioId);
    
    return {
      total: vistoriasFiltradas.length,
      conformes: vistoriasFiltradas.filter(v => 
        v.grupos.some(g => g.status === 'Conforme')
      ).length,
      naoConformes: vistoriasFiltradas.filter(v => 
        v.grupos.some(g => g.status === 'Não Conforme')
      ).length,
      requerAtencao: vistoriasFiltradas.filter(v => 
        v.grupos.some(g => g.status === 'Requer Atenção')
      ).length
    };
  };

  return {
    vistorias,
    salvarVistoria,
    obterVistoriasPorCondominio,
    obterEstatisticas
  };
};
