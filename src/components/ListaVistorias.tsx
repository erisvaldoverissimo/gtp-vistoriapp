
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Download, Calendar, Building, FileText } from 'lucide-react';
import { useVistorias } from '@/hooks/useVistorias';
import { useCondominios } from '@/hooks/useCondominios';

const ListaVistorias = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [condominioSelecionado, setCondominioSelecionado] = useState<string>('');
  
  const { vistorias, obterVistoriasPorCondominio, obterEstatisticas } = useVistorias();
  const { condominios } = useCondominios();

  // Filtrar vistorias baseado na busca e condomínio selecionado
  const vistoriasFiltradas = obterVistoriasPorCondominio(condominioSelecionado || undefined)
    .filter(vistoria =>
      vistoria.condominio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vistoria.numeroInterno.includes(searchTerm) ||
      vistoria.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const estatisticas = obterEstatisticas(condominioSelecionado || undefined);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (grupos: any[]) => {
    const hasNaoConforme = grupos.some(g => g.status === 'Não Conforme');
    const hasRequerAtencao = grupos.some(g => g.status === 'Requer Atenção');
    const hasConforme = grupos.some(g => g.status === 'Conforme');

    if (hasNaoConforme) return 'bg-red-100 text-red-800';
    if (hasRequerAtencao) return 'bg-yellow-100 text-yellow-800';
    if (hasConforme) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (grupos: any[]) => {
    const hasNaoConforme = grupos.some(g => g.status === 'Não Conforme');
    const hasRequerAtencao = grupos.some(g => g.status === 'Requer Atenção');
    const hasConforme = grupos.some(g => g.status === 'Conforme');

    if (hasNaoConforme) return 'Não Conforme';
    if (hasRequerAtencao) return 'Requer Atenção';
    if (hasConforme) return 'Conforme';
    return 'N/A';
  };

  const getTotalFotos = (grupos: any[]) => {
    return grupos.reduce((total, grupo) => total + grupo.fotos.length, 0);
  };

  const getAmbientes = (grupos: any[]) => {
    const ambientes = [...new Set(grupos.map(g => g.ambiente))];
    return ambientes.join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vistorias Realizadas</h2>
        <div className="flex items-center space-x-4">
          <Select value={condominioSelecionado} onValueChange={setCondominioSelecionado}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todos os condomínios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os condomínios</SelectItem>
              {condominios.map((condominio) => (
                <SelectItem key={condominio.id} value={condominio.id}>
                  {condominio.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar por condomínio, número ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Vistorias</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conformes</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.conformes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Não Conformes</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.naoConformes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Requer Atenção</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.requerAtencao}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vistorias */}
      <div className="space-y-4">
        {vistoriasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vistoria encontrada</h3>
              <p className="text-gray-600">
                {searchTerm || condominioSelecionado ? 'Tente ajustar os filtros de busca.' : 'Comece criando uma nova vistoria.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          vistoriasFiltradas.map((vistoria) => (
            <Card key={vistoria.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {vistoria.condominio}
                      </h3>
                      <Badge variant="outline">
                        #{vistoria.numeroInterno}
                      </Badge>
                      <Badge className={getStatusColor(vistoria.grupos)}>
                        {getStatusLabel(vistoria.grupos)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Data:</span> {formatDate(vistoria.dataVistoria)}
                      </div>
                      <div>
                        <span className="font-medium">Ambiente:</span> {getAmbientes(vistoria.grupos)}
                      </div>
                      <div>
                        <span className="font-medium">Responsável:</span> {vistoria.responsavel}
                      </div>
                      <div>
                        <span className="font-medium">Fotos:</span> {getTotalFotos(vistoria.grupos)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye size={16} className="mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ListaVistorias;
