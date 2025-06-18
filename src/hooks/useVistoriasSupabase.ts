
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface GrupoVistoriaSupabase {
  id?: string;
  vistoria_id?: string;
  ambiente: string;
  grupo: string;
  item: string;
  status: string;
  parecer: string;
  ordem?: number;
  fotos?: FotoVistoriaSupabase[];
}

export interface FotoVistoriaSupabase {
  id?: string;
  grupo_vistoria_id?: string;
  arquivo_nome: string;
  arquivo_url: string;
  descricao?: string;
  tamanho_bytes?: number;
  tipo_mime?: string;
}

export interface VistoriaSupabase {
  id?: string;
  condominio_id: string;
  user_id?: string;
  numero_interno: string;
  id_sequencial: number;
  data_vistoria: string;
  observacoes_gerais?: string;
  responsavel: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  grupos: GrupoVistoriaSupabase[];
  // Dados do condomínio para exibição
  condominio?: {
    id: string;
    nome: string;
  };
}

export const useVistoriasSupabase = () => {
  const [vistorias, setVistorias] = useState<VistoriaSupabase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const carregarVistorias = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Por enquanto, usar dados mockados já que as tabelas ainda não estão disponíveis
      console.log('Usando dados mock enquanto as tabelas não estão disponíveis');
      
      const dadosMock: VistoriaSupabase[] = [
        {
          id: '1',
          condominio_id: '1',
          user_id: user.id,
          numero_interno: '2025-0001',
          id_sequencial: 1,
          data_vistoria: '2025-01-15',
          observacoes_gerais: 'Vistoria realizada sem intercorrências',
          responsavel: 'João Silva',
          status: 'Conforme',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          condominio: {
            id: '1',
            nome: 'Condomínio Edifício Artur Ramos'
          },
          grupos: [
            {
              id: '1',
              vistoria_id: '1',
              ambiente: 'Térreo',
              grupo: 'Estrutura',
              item: 'Pilares de concreto',
              status: 'Conforme',
              parecer: 'Estrutura em bom estado de conservação',
              ordem: 0,
              fotos: []
            }
          ]
        }
      ];

      setVistorias(dadosMock);
    } catch (error) {
      console.error('Erro ao carregar vistorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vistorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarVistorias();
    }
  }, [user]);

  const salvarVistoria = async (dadosVistoria: Omit<VistoriaSupabase, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const novaVistoria: VistoriaSupabase = {
        ...dadosVistoria,
        id: Date.now().toString(),
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setVistorias(prev => [...prev, novaVistoria]);
      
      toast({
        title: "Sucesso",
        description: `Vistoria ${dadosVistoria.numero_interno} salva com sucesso.`,
      });

      return novaVistoria;
    } catch (error) {
      console.error('Erro ao salvar vistoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a vistoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const obterProximoNumeroSequencial = async (condominioId: string): Promise<number> => {
    try {
      const vistoriasCondominio = vistorias.filter(v => v.condominio_id === condominioId);
      const ultimoNumero = Math.max(...vistoriasCondominio.map(v => v.id_sequencial), 0);
      return ultimoNumero + 1;
    } catch (error) {
      console.error('Erro ao obter próximo número:', error);
      return 1;
    }
  };

  const excluirVistoria = async (id: string) => {
    try {
      setVistorias(prev => prev.filter(v => v.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Vistoria excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir vistoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a vistoria.",
        variant: "destructive",
      });
    }
  };

  return {
    vistorias,
    loading,
    salvarVistoria,
    obterProximoNumeroSequencial,
    excluirVistoria,
    recarregar: carregarVistorias
  };
};
