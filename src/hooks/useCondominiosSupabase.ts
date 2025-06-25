
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
  responsavel?: string;
  telefone_responsavel?: string;
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
      console.log('Carregando condomínios do Supabase...');
      
      // Com RLS, só vemos condomínios ativos
      const { data, error } = await supabase
        .from('condominios')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar condomínios:', error);
        throw error;
      }

      console.log('Condomínios carregados:', data);
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
      console.log('Adicionando condomínio:', dadosCondominio);
      
      const { data, error } = await supabase
        .from('condominios')
        .insert([dadosCondominio])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar condomínio:', error);
        throw error;
      }

      console.log('Condomínio adicionado:', data);
      setCondominios(prev => [...prev, data]);
      
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
      console.log('Atualizando condomínio:', id, dadosAtualizados);
      
      const { data, error } = await supabase
        .from('condominios')
        .update(dadosAtualizados)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar condomínio:', error);
        throw error;
      }

      console.log('Condomínio atualizado:', data);
      setCondominios(prev => 
        prev.map(cond => cond.id === id ? data : cond)
      );
      
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
      console.log('Removendo condomínio:', id);
      
      const { error } = await supabase
        .from('condominios')
        .update({ ativo: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover condomínio:', error);
        throw error;
      }

      console.log('Condomínio removido:', id);
      setCondominios(prev => prev.filter(cond => cond.id !== id));
      
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
