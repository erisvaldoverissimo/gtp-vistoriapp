
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  ativo: boolean;
}

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar usuários do Supabase
  const carregarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome');

      if (error) {
        throw error;
      }

      const usuariosFormatados = data.map(profile => ({
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        telefone: profile.telefone || '',
        cargo: profile.cargo || 'Vistoriador',
        ativo: profile.ativo
      }));

      setUsuarios(usuariosFormatados);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const adicionarUsuario = async (dadosUsuario: Omit<Usuario, 'id'>) => {
    try {
      // Como estamos trabalhando com profiles que são criados automaticamente
      // quando um usuário se registra, esta função serve mais para demonstração
      // Em um cenário real, novos usuários seriam criados através do registro
      console.log('Adicionando usuário:', dadosUsuario);
      
      toast({
        title: "Informação",
        description: "Novos usuários devem se registrar através da página de autenticação.",
      });
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o usuário.",
        variant: "destructive",
      });
    }
  };

  const atualizarUsuario = async (id: string, dadosAtualizados: Partial<Usuario>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: dadosAtualizados.nome,
          telefone: dadosAtualizados.telefone,
          cargo: dadosAtualizados.cargo,
          ativo: dadosAtualizados.ativo
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await carregarUsuarios();
      
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const removerUsuario = async (id: string) => {
    try {
      // Em vez de deletar o perfil (que pode quebrar referências),
      // vamos apenas desativar o usuário
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await carregarUsuarios();
      
      toast({
        title: "Sucesso",
        description: "Usuário desativado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário.",
        variant: "destructive",
      });
    }
  };

  const obterUsuariosAtivos = () => {
    return usuarios.filter(usuario => usuario.ativo);
  };

  return {
    usuarios,
    loading,
    adicionarUsuario,
    atualizarUsuario,
    removerUsuario,
    obterUsuariosAtivos,
    recarregar: carregarUsuarios
  };
};
