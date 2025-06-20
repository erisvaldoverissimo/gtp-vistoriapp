
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConfiguracaoSistema {
  id: string;
  chave: string;
  valor: any;
  descricao?: string;
  categoria: string;
  created_at?: string;
  updated_at?: string;
}

export const useConfiguracoes = () => {
  const [configuracoes, setConfiguracoes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar configurações do sistema
  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('*');

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações.",
          variant: "destructive"
        });
        return;
      }

      // Converter array de configurações em objeto
      const configObj: Record<string, any> = {};
      data?.forEach((config: ConfiguracaoSistema) => {
        // Tratar valores que podem estar com dupla serialização
        let valor = config.valor;
        
        // Se o valor for uma string que parece ser JSON, tentar fazer parse
        if (typeof valor === 'string') {
          try {
            // Primeiro parse
            valor = JSON.parse(valor);
            // Se ainda for string após o primeiro parse, tentar novamente
            if (typeof valor === 'string') {
              valor = JSON.parse(valor);
            }
          } catch {
            // Se não conseguir fazer parse, usar o valor como string limpa (sem aspas)
            valor = valor.replace(/^"(.*)"$/, '$1');
          }
        }
        
        configObj[config.chave] = valor;
      });

      setConfiguracoes(configObj);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Salvar configuração individual
  const salvarConfiguracao = async (chave: string, valor: any) => {
    try {
      const { error } = await supabase
        .from('configuracoes_sistema')
        .upsert({
          chave,
          valor: valor, // Não fazer JSON.stringify aqui, deixar o Supabase tratar
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'chave'
        });

      if (error) {
        console.error('Erro ao salvar configuração:', error);
        toast({
          title: "Erro",
          description: `Não foi possível salvar a configuração ${chave}.`,
          variant: "destructive"
        });
        return false;
      }

      // Atualizar estado local
      setConfiguracoes(prev => ({
        ...prev,
        [chave]: valor
      }));

      return true;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      return false;
    }
  };

  // Salvar múltiplas configurações
  const salvarConfiguracoes = async (novasConfiguracoes: Record<string, any>) => {
    try {
      const updates = Object.entries(novasConfiguracoes).map(([chave, valor]) => ({
        chave,
        valor: valor, // Não fazer JSON.stringify aqui, deixar o Supabase tratar
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('configuracoes_sistema')
        .upsert(updates, {
          onConflict: 'chave'
        });

      if (error) {
        console.error('Erro ao salvar configurações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar as configurações.",
          variant: "destructive"
        });
        return false;
      }

      // Atualizar estado local
      setConfiguracoes(prev => ({
        ...prev,
        ...novasConfiguracoes
      }));

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso."
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Obter valor de configuração específica
  const obterConfiguracao = (chave: string, valorPadrao?: any) => {
    return configuracoes[chave] ?? valorPadrao;
  };

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  return {
    configuracoes,
    loading,
    carregarConfiguracoes,
    salvarConfiguracao,
    salvarConfiguracoes,
    obterConfiguracao
  };
};
