
import { useState, useEffect } from 'react';

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

export const useVistorias = () => {
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar vistorias do localStorage
  useEffect(() => {
    const carregarVistorias = () => {
      try {
        const vistoriasSalvas = localStorage.getItem('vistorias');
        if (vistoriasSalvas) {
          const dados = JSON.parse(vistoriasSalvas);
          setVistorias(dados);
        } else {
          // Dados mockados para demonstração inicial
          const dadosMock: Vistoria[] = [
            {
              id: '1',
              condominio: 'Condomínio Edifício Artur Ramos',
              numeroInterno: '2028',
              dataVistoria: '2025-02-14',
              ambiente: 'Térreo',
              status: 'N/A',
              responsavel: 'João Silva',
              fotosCount: 3
            },
            {
              id: '2',
              condominio: 'Residencial Park View',
              numeroInterno: '2029',
              dataVistoria: '2025-02-13',
              ambiente: '1º Andar',
              status: 'Conforme',
              responsavel: 'Maria Santos',
              fotosCount: 5
            },
            {
              id: '3',
              condominio: 'Edifício Central Plaza',
              numeroInterno: '2030',
              dataVistoria: '2025-02-12',
              ambiente: 'Cobertura',
              status: 'Não Conforme',
              responsavel: 'Carlos Oliveira',
              fotosCount: 8
            }
          ];
          setVistorias(dadosMock);
          localStorage.setItem('vistorias', JSON.stringify(dadosMock));
        }
      } catch (error) {
        console.error('Erro ao carregar vistorias:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarVistorias();
  }, []);

  // Salvar vistoria
  const salvarVistoria = (novaVistoria: Omit<Vistoria, 'id'>) => {
    const vistoriaComId = {
      ...novaVistoria,
      id: Date.now().toString()
    };
    
    const novasVistorias = [...vistorias, vistoriaComId];
    setVistorias(novasVistorias);
    localStorage.setItem('vistorias', JSON.stringify(novasVistorias));
    
    return vistoriaComId;
  };

  // Atualizar vistoria
  const atualizarVistoria = (id: string, dadosAtualizados: Partial<Vistoria>) => {
    const novasVistorias = vistorias.map(vistoria =>
      vistoria.id === id ? { ...vistoria, ...dadosAtualizados } : vistoria
    );
    setVistorias(novasVistorias);
    localStorage.setItem('vistorias', JSON.stringify(novasVistorias));
  };

  // Excluir vistoria
  const excluirVistoria = (id: string) => {
    const novasVistorias = vistorias.filter(vistoria => vistoria.id !== id);
    setVistorias(novasVistorias);
    localStorage.setItem('vistorias', JSON.stringify(novasVistorias));
  };

  // Buscar vistoria por ID
  const obterVistoriaPorId = (id: string) => {
    return vistorias.find(vistoria => vistoria.id === id);
  };

  return {
    vistorias,
    loading,
    salvarVistoria,
    atualizarVistoria,
    excluirVistoria,
    obterVistoriaPorId
  };
};
