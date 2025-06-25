
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

// Geocoding gratuito para obter coordenadas da cidade
const obterCoordenadas = async (cidade: string) => {
  try {
    console.log('Buscando coordenadas para:', cidade);
    
    // Usando serviço gratuito de geocoding
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`
    );
    
    if (!response.ok) {
      throw new Error('Erro ao buscar coordenadas');
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      // Fallback para São Paulo se cidade não encontrada
      console.warn(`Cidade ${cidade} não encontrada, usando São Paulo como fallback`);
      return { latitude: -23.5505, longitude: -46.6333 }; // São Paulo
    }
    
    const resultado = data.results[0];
    console.log('Coordenadas encontradas:', resultado);
    
    return {
      latitude: resultado.latitude,
      longitude: resultado.longitude
    };
  } catch (error) {
    console.error('Erro ao obter coordenadas:', error);
    // Fallback para São Paulo
    return { latitude: -23.5505, longitude: -46.6333 };
  }
};

const interpretarCodigoClima = (weatherCode: number, precipitacao: number) => {
  // Códigos WMO Weather interpretation
  if (weatherCode === 0) return 'Ensolarado';
  if (weatherCode >= 1 && weatherCode <= 3) return 'Parcialmente nublado';
  if (weatherCode >= 45 && weatherCode <= 48) return 'Nevoeiro';
  if (weatherCode >= 51 && weatherCode <= 67) return 'Chuvoso';
  if (weatherCode >= 71 && weatherCode <= 77) return 'Neve';
  if (weatherCode >= 80 && weatherCode <= 82) return 'Chuva forte';
  if (weatherCode >= 95 && weatherCode <= 99) return 'Tempestade';
  
  // Baseado na precipitação como fallback
  if (precipitacao > 10) return 'Chuvoso';
  if (precipitacao > 0) return 'Parcialmente nublado';
  return 'Nublado';
};

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
      
      // Obter coordenadas da cidade
      const coordenadas = await obterCoordenadas(cidade);
      
      // Buscar dados meteorológicos usando Open-Meteo (gratuito, sem API key)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coordenadas.latitude}&longitude=${coordenadas.longitude}&start_date=${data}&end_date=${data}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,relative_humidity_2m_max,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=America/Sao_Paulo`;
      
      console.log('URL da API:', weatherUrl);
      
      const response = await fetch(weatherUrl);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const weatherData = await response.json();
      console.log('Resposta da API:', weatherData);
      
      if (!weatherData.daily || !weatherData.daily.time || weatherData.daily.time.length === 0) {
        throw new Error('Dados meteorológicos não disponíveis para esta data');
      }
      
      const dadosDia = weatherData.daily;
      const indice = 0; // Primeiro (e único) dia
      
      const weatherCode = dadosDia.weather_code[indice] || 0;
      const precipitacao = dadosDia.precipitation_sum[indice] || 0;
      const temperatura = Math.round(dadosDia.temperature_2m_max[indice] || 20);
      const temperaturaMin = Math.round(dadosDia.temperature_2m_min[indice] || 15);
      const sensacaoTermica = Math.round(dadosDia.apparent_temperature_max[indice] || temperatura);
      const umidade = Math.round(dadosDia.relative_humidity_2m_max[indice] || 60);
      const velocidadeVento = Math.round(dadosDia.wind_speed_10m_max[indice] || 10);
      const direcaoVento = Math.round(dadosDia.wind_direction_10m_dominant[indice] || 180);
      
      const condicao = interpretarCodigoClima(weatherCode, precipitacao);
      
      const dadosProcessados: WeatherData = {
        temperatura: temperatura,
        umidade: umidade,
        pressao: 1013, // Valor padrão (Open-Meteo free não inclui pressão)
        velocidade_vento: velocidadeVento,
        direcao_vento: direcaoVento,
        visibilidade: 10, // Valor padrão
        condicao: condicao,
        descricao: '',
        precipitacao: Math.round(precipitacao),
        nuvens: weatherCode >= 1 ? Math.round(20 + (weatherCode * 10)) : 10, // Estimativa baseada no código
        sensacao_termica: sensacaoTermica
      };

      // Ajustar descrição baseada na condição
      switch (dadosProcessados.condicao) {
        case 'Ensolarado':
          dadosProcessados.descricao = 'Dia ensolarado, condições ideais para vistoria';
          break;
        case 'Chuvoso':
        case 'Chuva forte':
          dadosProcessados.descricao = 'Dia chuvoso, pode ter impactado a vistoria';
          break;
        case 'Tempestade':
          dadosProcessados.descricao = 'Tempestade, condições adversas';
          break;
        case 'Nevoeiro':
          dadosProcessados.descricao = 'Dia com nevoeiro, visibilidade reduzida';
          break;
        default:
          dadosProcessados.descricao = `Dia ${dadosProcessados.condicao.toLowerCase()}`;
      }

      console.log('Dados meteorológicos processados:', dadosProcessados);
      
      toast({
        title: "Dados Meteorológicos Obtidos",
        description: `${cidade}: ${dadosProcessados.condicao}, ${dadosProcessados.temperatura}°C`,
      });

      return dadosProcessados;
    } catch (error) {
      console.error('Erro ao buscar dados meteorológicos:', error);
      
      // Em caso de erro, ainda tentar fornecer dados simulados básicos
      toast({
        title: "Dados Simulados",
        description: "Não foi possível obter dados reais. Usando dados simulados.",
        variant: "default",
      });
      
      const dadosSimulados: WeatherData = {
        temperatura: Math.round(15 + Math.random() * 15), // 15-30°C
        umidade: Math.round(40 + Math.random() * 40), // 40-80%
        pressao: 1013,
        velocidade_vento: Math.round(Math.random() * 15), // 0-15 km/h
        direcao_vento: Math.round(Math.random() * 360),
        visibilidade: 10,
        condicao: 'Parcialmente nublado',
        descricao: 'Dados simulados - condições típicas',
        precipitacao: 0,
        nuvens: 50,
        sensacao_termica: Math.round(15 + Math.random() * 15)
      };
      
      return dadosSimulados;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    buscarDadosMeteorologicos,
    loading
  };
};
