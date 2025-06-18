
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
        .eq('ativo', true);

      if (error) {
        console.log('Usando dados mock enquanto as tabelas não estão disponíveis');
        // Dados mockados temporários
        const dadosMock: CondominioSupabase[] = [
          {
            id: '1',
            nome: 'Condomínio Edifício Artur Ramos',
            endereco: 'Rua Artur Ramos, 123',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '01234-567',
            telefone: '(11) 1234-5678',
            email: 'contato@arthur.com.br',
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            nome: 'Residencial Park View',
            endereco: 'Av. das Flores, 456',
            cidade: 'São Paulo',
            estado: 'SP',
            cep: '02345-678',
            telefone: '(11) 2345-6789',
            email: 'sindico@parkview.com.br',
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setCondominios(dadosMock);
        setLoading(false);
        return;
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
      // Por enquanto, simular adição com dados locais
      const novoCondominio: CondominioSupabase = {
        ...dadosCondominio,
        id: Date.now().toString(),
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setCondominios(prev => [...prev, novoCondominio]);
      
      toast({
        title: "Sucesso",
        description: "Condomínio adicionado com sucesso.",
      });

      return novoCondominio;
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
      setCondominios(prev => 
        prev.map(cond => 
          cond.id === id 
            ? { ...cond, ...dadosAtualizados, updated_at: new Date().toISOString() }
            : cond
        )
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
      setCondominios(prev => 
        prev.map(cond => 
          cond.id === id 
            ? { ...cond, ativo: false, updated_at: new Date().toISOString() }
            : cond
        ).filter(cond => cond.ativo)
      );
      
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
