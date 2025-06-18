
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

  const obterUsuariosAtivos = () => {
    return usuarios.filter(usuario => usuario.ativo);
  };

  return {
    usuarios,
    loading,
    atualizarUsuario,
    obterUsuariosAtivos,
    recarregar: carregarUsuarios
  };
};
