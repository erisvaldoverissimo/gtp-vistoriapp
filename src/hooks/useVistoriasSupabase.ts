
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
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vistorias')
        .select(`
          *,
          condominio:condominios!condominio_id (
            id,
            nome
          ),
          grupos_vistoria (
            *,
            fotos_vistoria (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const vistoriasFormatadas = data?.map(vistoria => ({
        id: vistoria.id,
        condominio_id: vistoria.condominio_id,
        user_id: vistoria.user_id,
        numero_interno: vistoria.numero_interno,
        id_sequencial: vistoria.id_sequencial,
        data_vistoria: vistoria.data_vistoria,
        observacoes_gerais: vistoria.observacoes_gerais,
        responsavel: vistoria.responsavel,
        status: vistoria.status,
        created_at: vistoria.created_at,
        updated_at: vistoria.updated_at,
        condominio: Array.isArray(vistoria.condominio) ? vistoria.condominio[0] : vistoria.condominio,
        grupos: vistoria.grupos_vistoria?.map(grupo => ({
          id: grupo.id,
          vistoria_id: grupo.vistoria_id,
          ambiente: grupo.ambiente,
          grupo: grupo.grupo,
          item: grupo.item,
          status: grupo.status,
          parecer: grupo.parecer,
          ordem: grupo.ordem,
          fotos: grupo.fotos_vistoria || []
        })) || []
      })) || [];

      setVistorias(vistoriasFormatadas);
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
      // Primeiro, salvar a vistoria
      const { data: vistoriaData, error: vistoriaError } = await supabase
        .from('vistorias')
        .insert([{
          condominio_id: dadosVistoria.condominio_id,
          user_id: user.id,
          numero_interno: dadosVistoria.numero_interno,
          id_sequencial: dadosVistoria.id_sequencial,
          data_vistoria: dadosVistoria.data_vistoria,
          observacoes_gerais: dadosVistoria.observacoes_gerais,
          responsavel: dadosVistoria.responsavel,
          status: dadosVistoria.status
        }])
        .select()
        .single();

      if (vistoriaError) {
        throw vistoriaError;
      }

      // Depois, salvar os grupos
      if (dadosVistoria.grupos.length > 0) {
        const gruposParaInserir = dadosVistoria.grupos.map((grupo, index) => ({
          vistoria_id: vistoriaData.id,
          ambiente: grupo.ambiente,
          grupo: grupo.grupo,
          item: grupo.item,
          status: grupo.status,
          parecer: grupo.parecer,
          ordem: index
        }));

        const { error: gruposError } = await supabase
          .from('grupos_vistoria')
          .insert(gruposParaInserir);

        if (gruposError) {
          throw gruposError;
        }
      }

      await carregarVistorias();
      
      toast({
        title: "Sucesso",
        description: `Vistoria ${dadosVistoria.numero_interno} salva com sucesso.`,
      });

      return vistoriaData;
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
      const { data, error } = await supabase
        .from('vistorias')
        .select('id_sequencial')
        .eq('condominio_id', condominioId)
        .order('id_sequencial', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return data && data.length > 0 ? data[0].id_sequencial + 1 : 1;
    } catch (error) {
      console.error('Erro ao obter próximo número:', error);
      return 1;
    }
  };

  const excluirVistoria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vistorias')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await carregarVistorias();
      
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
