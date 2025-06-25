
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Building2, AlertCircle, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { VistoriaAnalytics } from '@/hooks/useVistoriaAnalytics';

interface AnalyticsDisplayProps {
  analytics: VistoriaAnalytics;
}

const AnalyticsDisplay: React.FC<AnalyticsDisplayProps> = ({ analytics }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído':
      case 'concluida':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'em andamento':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'pendente':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído':
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'em andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'pendente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 w-full max-w-4xl">
      {/* Resumo Geral */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="w-5 h-5 mr-2 text-teal-600" />
            Resumo Geral das Vistorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600 mb-2">
              {analytics.totalVistorias}
            </div>
            <div className="text-sm text-gray-600">Total de Vistorias</div>
          </div>
        </CardContent>
      </Card>

      {/* Por Condomínio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Por Condomínio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.vistoriasPorCondominio).map(([nome, count]) => (
              <div key={nome} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 truncate" title={nome}>
                    {nome}
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2">
                  {count} vistoria{count !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Por Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Por Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(analytics.vistoriasPorStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {getStatusIcon(status)}
                  <span className="ml-2 font-medium text-gray-900">{status}</span>
                </div>
                <Badge className={getStatusColor(status)}>
                  {count} vistoria{count !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Problemas Mais Frequentes */}
      {analytics.problemasFrequentes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Problemas Mais Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.problemasFrequentes.slice(0, 5).map((problema, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-semibold text-red-700 mr-2">
                        #{index + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {problema.item}
                      </span>
                    </div>
                  </div>
                  <Badge variant="destructive" className="ml-2">
                    {problema.count} ocorrência{problema.count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Condomínios Mais Ativos */}
      {analytics.condominiosAtivos.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Condomínios Mais Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.condominiosAtivos.slice(0, 3).map((condominio, index) => (
                <div key={condominio.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <span className="text-sm font-semibold text-green-700 mr-3">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900 truncate" title={condominio.nome}>
                        {condominio.nome}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {condominio.totalVistorias} vistoria{condominio.totalVistorias !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDisplay;
