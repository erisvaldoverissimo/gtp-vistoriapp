
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CondominioSupabase {
  id: string;
  nome: string;
  endereco: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useCondominiosSupabase = () => {
  const [condominios, setCondominios] = useState<CondominioSupabase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const carregarCondominios = async () => {
    try {
      const { data, error } = await supabase
        .from('condominios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        throw error;
      }

      setCondominios(data || []);
    } catch (error) {
      console.error('Erro ao carregar condomínios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os condomínios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCondominios();
  }, []);

  const adicionarCondominio = async (dadosCondominio: Omit<CondominioSupabase, 'id' | 'created_at' | 'updated_at' | 'ativo'>) => {
    try {
      const { data, error } = await supabase
        .from('condominios')
        .insert([dadosCondominio])
        .select()
        .single();

      if (error) {
        throw error;
      }

      await carregarCondominios();
      
      toast({
        title: "Sucesso",
        description: "Condomínio adicionado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar condomínio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o condomínio.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const atualizarCondominio = async (id: string, dadosAtualizados: Partial<CondominioSupabase>) => {
    try {
      const { error } = await supabase
        .from('condominios')
        .update({ ...dadosAtualizados, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await carregarCondominios();
      
      toast({
        title: "Sucesso",
        description: "Condomínio atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar condomínio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o condomínio.",
        variant: "destructive",
      });
    }
  };

  const removerCondominio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('condominios')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await carregarCondominios();
      
      toast({
        title: "Sucesso",
        description: "Condomínio removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover condomínio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o condomínio.",
        variant: "destructive",
      });
    }
  };

  return {
    condominios,
    loading,
    adicionarCondominio,
    atualizarCondominio,
    removerCondominio,
    recarregar: carregarCondominios
  };
};
