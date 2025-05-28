
import { useState, useEffect } from 'react';

export interface Condominio {
  id: string;
  nome: string;
  endereco: string;
  responsavel: string;
  telefone: string;
  dataCadastro: string;
  proximoNumero: number;
}

export const useCondominios = () => {
  const [condominios, setCondominios] = useState<Condominio[]>([]);

  // Carregar condomínios do localStorage na inicialização
  useEffect(() => {
    const condominiosSalvos = localStorage.getItem('condominios');
    if (condominiosSalvos) {
      setCondominios(JSON.parse(condominiosSalvos));
    }
  }, []);

  // Salvar condomínios no localStorage sempre que houver mudança
  useEffect(() => {
    localStorage.setItem('condominios', JSON.stringify(condominios));
  }, [condominios]);

  const atualizarCondominios = (novosCondominios: Condominio[]) => {
    setCondominios(novosCondominios);
  };

  const obterProximoNumero = (condominioId: string): number => {
    const condominio = condominios.find(c => c.id === condominioId);
    return condominio ? condominio.proximoNumero : 1;
  };

  const incrementarNumero = (condominioId: string) => {
    setCondominios(prev => 
      prev.map(condominio => 
        condominio.id === condominioId 
          ? { ...condominio, proximoNumero: condominio.proximoNumero + 1 }
          : condominio
      )
    );
  };

  return {
    condominios,
    atualizarCondominios,
    obterProximoNumero,
    incrementarNumero
  };
};
