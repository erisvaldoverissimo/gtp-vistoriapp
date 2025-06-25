
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Conversa {
  id: string;
  user_id: string;
  titulo: string;
  created_at: string;
  updated_at: string;
  ativa: boolean;
}

export interface Mensagem {
  id: string;
  conversa_id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'audio';
  created_at: string;
}

export const useChatConversas = () => {
  const { toast } = useToast();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtual, setConversaAtual] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar conversas do usuário
  const carregarConversas = async () => {
    try {
      const { data, error } = await supabase
        .from('conversas_chat')
        .select('*')
        .eq('ativa', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversas(data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive"
      });
    }
  };

  // Carregar mensagens de uma conversa
  const carregarMensagens = async (conversaId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mensagens_chat')
        .select('*')
        .eq('conversa_id', conversaId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type casting para garantir tipos corretos
      const mensagensTyped: Mensagem[] = (data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant',
        type: (msg.type || 'text') as 'text' | 'audio'
      }));
      
      setMensagens(mensagensTyped);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar nova conversa
  const criarConversa = async (titulo: string = 'Nova Conversa') => {
    try {
      const { data, error } = await supabase
        .from('conversas_chat')
        .insert({
          titulo,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversas(prev => [data, ...prev]);
      setConversaAtual(data);
      setMensagens([]);
      
      return data;
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conversa.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Adicionar mensagem
  const adicionarMensagem = async (content: string, role: 'user' | 'assistant', type: 'text' | 'audio' = 'text') => {
    if (!conversaAtual) return null;

    try {
      const { data, error } = await supabase
        .from('mensagens_chat')
        .insert({
          conversa_id: conversaAtual.id,
          role,
          content,
          type
        })
        .select()
        .single();

      if (error) throw error;

      // Type casting para garantir tipos corretos
      const mensagemTyped: Mensagem = {
        ...data,
        role: data.role as 'user' | 'assistant',
        type: (data.type || 'text') as 'text' | 'audio'
      };

      setMensagens(prev => [...prev, mensagemTyped]);

      // Atualizar timestamp da conversa
      await supabase
        .from('conversas_chat')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversaAtual.id);

      return mensagemTyped;
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a mensagem.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Selecionar conversa
  const selecionarConversa = async (conversa: Conversa) => {
    setConversaAtual(conversa);
    await carregarMensagens(conversa.id);
  };

  // Deletar conversa
  const deletarConversa = async (conversaId: string) => {
    try {
      const { error } = await supabase
        .from('conversas_chat')
        .update({ ativa: false })
        .eq('id', conversaId);

      if (error) throw error;

      setConversas(prev => prev.filter(c => c.id !== conversaId));
      
      if (conversaAtual?.id === conversaId) {
        setConversaAtual(null);
        setMensagens([]);
      }

      toast({
        title: "Conversa Removida",
        description: "A conversa foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a conversa.",
        variant: "destructive"
      });
    }
  };

  // Atualizar título da conversa
  const atualizarTituloConversa = async (conversaId: string, novoTitulo: string) => {
    try {
      const { error } = await supabase
        .from('conversas_chat')
        .update({ titulo: novoTitulo })
        .eq('id', conversaId);

      if (error) throw error;

      setConversas(prev => prev.map(c => 
        c.id === conversaId ? { ...c, titulo: novoTitulo } : c
      ));

      if (conversaAtual?.id === conversaId) {
        setConversaAtual({ ...conversaAtual, titulo: novoTitulo });
      }
    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    carregarConversas();
  }, []);

  return {
    conversas,
    conversaAtual,
    mensagens,
    loading,
    criarConversa,
    selecionarConversa,
    adicionarMensagem,
    deletarConversa,
    atualizarTituloConversa,
    carregarConversas
  };
};
