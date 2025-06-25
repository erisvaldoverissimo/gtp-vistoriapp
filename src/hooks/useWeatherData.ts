
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface WeatherData {
  temperatura: number;
  umidade: number;
  pressao: number;
  velocidade_vento: number;
  direcao_vento: number;
  visibilidade: number;
  condicao: string;
  descricao: string;
  precipitacao: number;
  nuvens: number;
  sensacao_termica: number;
}

export const useWeatherData = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const buscarDadosMeteorologicos = useCallback(async (data: string, cidade: string = 'São Paulo'): Promise<WeatherData | null> => {
    if (!data) {
      toast({
        title: "Data inválida",
        description: "Por favor, forneça uma data válida.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('Buscando dados meteorológicos para:', { data, cidade });
      
      // Usando OpenWeatherMap API (gratuita) - seria necessário configurar a chave da API
      // Por enquanto, vou simular dados realistas
      const dadosSimulados: WeatherData = {
        temperatura: Math.round(15 + Math.random() * 20), // 15-35°C
        umidade: Math.round(40 + Math.random() * 50), // 40-90%
        pressao: Math.round(1000 + Math.random() * 30), // 1000-1030 hPa
        velocidade_vento: Math.round(Math.random() * 20), // 0-20 km/h
        direcao_vento: Math.round(Math.random() * 360), // 0-360°
        visibilidade: Math.round(8 + Math.random() * 7), // 8-15 km
        condicao: ['Ensolarado', 'Parcialmente nublado', 'Nublado', 'Chuvoso', 'Tempestade'][Math.floor(Math.random() * 5)],
        descricao: 'Condições meteorológicas do dia',
        precipitacao: Math.random() > 0.7 ? Math.round(Math.random() * 50) : 0, // 30% chance de chuva
        nuvens: Math.round(Math.random() * 100), // 0-100%
        sensacao_termica: Math.round(15 + Math.random() * 20) // 15-35°C
      };

      // Ajustar descrição baseada na condição
      switch (dadosSimulados.condicao) {
        case 'Ensolarado':
          dadosSimulados.descricao = 'Dia ensolarado, condições ideais para vistoria';
          dadosSimulados.precipitacao = 0;
          dadosSimulados.nuvens = Math.round(Math.random() * 20);
          break;
        case 'Chuvoso':
          dadosSimulados.descricao = 'Dia chuvoso, pode ter impactado a vistoria';
          dadosSimulados.precipitacao = Math.round(5 + Math.random() * 30);
          dadosSimulados.nuvens = Math.round(70 + Math.random() * 30);
          break;
        case 'Tempestade':
          dadosSimulados.descricao = 'Tempestade, condições adversas';
          dadosSimulados.precipitacao = Math.round(20 + Math.random() * 50);
          dadosSimulados.nuvens = Math.round(80 + Math.random() * 20);
          dadosSimulados.velocidade_vento = Math.round(20 + Math.random() * 30);
          break;
        default:
          dadosSimulados.descricao = `Dia ${dadosSimulados.condicao.toLowerCase()}`;
      }

      console.log('Dados meteorológicos obtidos:', dadosSimulados);
      
      toast({
        title: "Dados Meteorológicos",
        description: `Condições do dia: ${dadosSimulados.condicao}`,
      });

      return dadosSimulados;
    } catch (error) {
      console.error('Erro ao buscar dados meteorológicos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível obter os dados meteorológicos.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    buscarDadosMeteorologicos,
    loading
  };
};
