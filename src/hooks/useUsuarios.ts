
import { useState, useEffect } from 'react';

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

  // Carregar usuários do localStorage
  useEffect(() => {
    const usuariosSalvos = localStorage.getItem('usuarios-vistorias');
    if (usuariosSalvos) {
      setUsuarios(JSON.parse(usuariosSalvos));
    }
  }, []);

  // Salvar usuários no localStorage
  const salvarUsuarios = (novosUsuarios: Usuario[]) => {
    localStorage.setItem('usuarios-vistorias', JSON.stringify(novosUsuarios));
    setUsuarios(novosUsuarios);
  };

  const adicionarUsuario = (usuario: Omit<Usuario, 'id'>) => {
    const novoUsuario: Usuario = {
      ...usuario,
      id: Date.now().toString(),
    };
    const novosUsuarios = [...usuarios, novoUsuario];
    salvarUsuarios(novosUsuarios);
  };

  const atualizarUsuario = (id: string, dadosAtualizados: Partial<Usuario>) => {
    const novosUsuarios = usuarios.map(usuario =>
      usuario.id === id ? { ...usuario, ...dadosAtualizados } : usuario
    );
    salvarUsuarios(novosUsuarios);
  };

  const removerUsuario = (id: string) => {
    const novosUsuarios = usuarios.filter(usuario => usuario.id !== id);
    salvarUsuarios(novosUsuarios);
  };

  const obterUsuariosAtivos = () => {
    return usuarios.filter(usuario => usuario.ativo);
  };

  return {
    usuarios,
    adicionarUsuario,
    atualizarUsuario,
    removerUsuario,
    obterUsuariosAtivos,
  };
};
