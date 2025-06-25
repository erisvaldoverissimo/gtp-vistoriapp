
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Conversa {
  id: string;
  user_id: string;
  titulo: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mensagem {
  id: string;
  conversa_id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'audio' | 'analytics';
  created_at: string;
}

export const useChatConversas = () => {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtual, setConversaAtual] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Carregar conversas do usuário
  const carregarConversas = async () => {
    try {
      setLoading(true);
      console.log('Carregando conversas...');

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('conversas_chat')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('ativa', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar conversas:', error);
        throw error;
      }

      console.log('Conversas carregadas:', data?.length || 0);
      setConversas(data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens de uma conversa
  const carregarMensagens = async (conversaId: string) => {
    try {
      console.log('Carregando mensagens da conversa:', conversaId);

      const { data, error } = await supabase
        .from('mensagens_chat')
        .select('*')
        .eq('conversa_id', conversaId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        throw error;
      }

      console.log('Mensagens carregadas:', data?.length || 0);
      setMensagens(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive"
      });
    }
  };

  // Criar nova conversa
  const criarConversa = async (): Promise<Conversa | null> => {
    try {
      console.log('Criando nova conversa...');

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('Usuário não autenticado');
        return null;
      }

      const { data, error } = await supabase
        .from('conversas_chat')
        .insert({
          user_id: userData.user.id,
          titulo: 'Nova Conversa',
          ativa: true
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar conversa:', error);
        throw error;
      }

      console.log('Conversa criada:', data);
      
      // Atualizar lista de conversas
      setConversas(prev => [data, ...prev]);
      
      // Selecionar a nova conversa
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

  // Selecionar conversa
  const selecionarConversa = async (conversa: Conversa) => {
    console.log('Selecionando conversa:', conversa.id);
    setConversaAtual(conversa);
    await carregarMensagens(conversa.id);
  };

  // Adicionar mensagem
  const adicionarMensagem = async (content: string, role: 'user' | 'assistant', type: 'text' | 'audio' | 'analytics' = 'text') => {
    if (!conversaAtual) {
      console.error('Nenhuma conversa selecionada');
      return;
    }

    try {
      console.log('Adicionando mensagem:', { content: content.substring(0, 100) + '...', role, type });

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

      if (error) {
        console.error('Erro ao salvar mensagem:', error);
        throw error;
      }

      console.log('Mensagem salva no banco:', data);
      
      // Atualizar mensagens localmente
      setMensagens(prev => {
        const novasMensagens = [...prev, data];
        console.log('Estado atualizado - Total mensagens:', novasMensagens.length);
        return novasMensagens;
      });

      // Atualizar timestamp da conversa
      await supabase
        .from('conversas_chat')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversaAtual.id);

    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a mensagem.",
        variant: "destructive"
      });
    }
  };

  // Deletar conversa
  const deletarConversa = async (conversaId: string) => {
    try {
      console.log('Deletando conversa:', conversaId);

      // Deletar mensagens da conversa
      const { error: mensagensError } = await supabase
        .from('mensagens_chat')
        .delete()
        .eq('conversa_id', conversaId);

      if (mensagensError) {
        console.error('Erro ao deletar mensagens:', mensagensError);
        throw mensagensError;
      }

      // Deletar a conversa
      const { error: conversaError } = await supabase
        .from('conversas_chat')
        .delete()
        .eq('id', conversaId);

      if (conversaError) {
        console.error('Erro ao deletar conversa:', conversaError);
        throw conversaError;
      }

      // Atualizar estado local
      setConversas(prev => prev.filter(c => c.id !== conversaId));
      
      if (conversaAtual?.id === conversaId) {
        setConversaAtual(null);
        setMensagens([]);
      }

      toast({
        title: "Conversa Deletada",
        description: "A conversa foi removida com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao deletar conversa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conversa.",
        variant: "destructive"
      });
    }
  };

  // Atualizar título da conversa
  const atualizarTituloConversa = async (conversaId: string, novoTitulo: string) => {
    try {
      console.log('Atualizando título da conversa:', conversaId, novoTitulo);

      const { error } = await supabase
        .from('conversas_chat')
        .update({ titulo: novoTitulo, updated_at: new Date().toISOString() })
        .eq('id', conversaId);

      if (error) {
        console.error('Erro ao atualizar título:', error);
        throw error;
      }

      // Atualizar estado local
      setConversas(prev => prev.map(c => 
        c.id === conversaId ? { ...c, titulo: novoTitulo } : c
      ));

      if (conversaAtual?.id === conversaId) {
        setConversaAtual(prev => prev ? { ...prev, titulo: novoTitulo } : null);
      }

      toast({
        title: "Título Atualizado",
        description: "O título da conversa foi alterado com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao atualizar título:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título.",
        variant: "destructive"
      });
    }
  };

  // Carregar conversas na inicialização
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
