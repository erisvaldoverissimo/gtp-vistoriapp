
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Thermometer, RefreshCw } from 'lucide-react';
import { WeatherData } from '@/hooks/useWeatherData';

interface DadosMeteorologicosProps {
  dadosMeteorologicos?: WeatherData | null;
  onBuscarDados: () => void;
  loading: boolean;
}

const DadosMeteorologicos = ({ dadosMeteorologicos, onBuscarDados, loading }: DadosMeteorologicosProps) => {
  const getWeatherIcon = (condicao: string) => {
    switch (condicao) {
      case 'Ensolarado':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'Chuvoso':
      case 'Tempestade':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      default:
        return <Cloud className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConditionColor = (condicao: string) => {
    switch (condicao) {
      case 'Ensolarado':
        return 'bg-yellow-100 text-yellow-800';
      case 'Parcialmente nublado':
        return 'bg-blue-100 text-blue-800';
      case 'Nublado':
        return 'bg-gray-100 text-gray-800';
      case 'Chuvoso':
        return 'bg-blue-200 text-blue-900';
      case 'Tempestade':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isWeatherAdverse = (dados: WeatherData) => {
    return dados.precipitacao > 10 || dados.velocidade_vento > 30 || dados.condicao === 'Tempestade';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Cloud size={20} className="mr-2" />
            Dados Meteorológicos
          </CardTitle>
          <Button 
            onClick={onBuscarDados} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Buscando...' : 'Buscar Dados'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!dadosMeteorologicos ? (
          <div className="text-center py-8">
            <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Clique em "Buscar Dados" para obter as condições meteorológicas do dia da vistoria
            </p>
            <p className="text-sm text-gray-500">
              Estes dados ajudam a documentar se condições climáticas impactaram o trabalho
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Condição Principal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getWeatherIcon(dadosMeteorologicos.condicao)}
                <div>
                  <Badge className={getConditionColor(dadosMeteorologicos.condicao)}>
                    {dadosMeteorologicos.condicao}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    {dadosMeteorologicos.descricao}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold flex items-center">
                  <Thermometer className="h-5 w-5 mr-1" />
                  {dadosMeteorologicos.temperatura}°C
                </div>
                <div className="text-sm text-gray-600">
                  Sensação: {dadosMeteorologicos.sensacao_termica}°C
                </div>
              </div>
            </div>

            {/* Alerta para Condições Adversas */}
            {isWeatherAdverse(dadosMeteorologicos) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center">
                  <Cloud className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">
                    Condições meteorológicas adversas detectadas
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  As condições climáticas podem ter impactado a execução da vistoria.
                </p>
              </div>
            )}

            {/* Grid de Dados */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-gray-600">Umidade</span>
                </div>
                <div className="text-lg font-semibold">{dadosMeteorologicos.umidade}%</div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <Wind className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-gray-600">Vento</span>
                </div>
                <div className="text-lg font-semibold">{dadosMeteorologicos.velocidade_vento} km/h</div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <CloudRain className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Chuva</span>
                </div>
                <div className="text-lg font-semibold">{dadosMeteorologicos.precipitacao} mm</div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <Eye className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-gray-600">Visibilidade</span>
                </div>
                <div className="text-lg font-semibold">{dadosMeteorologicos.visibilidade} km</div>
              </div>
            </div>

            {/* Dados Adicionais */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-sm">
                <span className="text-gray-600">Pressão:</span>
                <span className="ml-2 font-medium">{dadosMeteorologicos.pressao} hPa</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Nuvens:</span>
                <span className="ml-2 font-medium">{dadosMeteorologicos.nuvens}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DadosMeteorologicos;
