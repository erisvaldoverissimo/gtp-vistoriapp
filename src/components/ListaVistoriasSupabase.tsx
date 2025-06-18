
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Download, Calendar, Building, FileText, Loader2, Plus } from 'lucide-react';
import { useVistoriasSupabase } from '@/hooks/useVistoriasSupabase';
import { useIsMobile } from '@/hooks/use-mobile';

interface ListaVistoriasSupabaseProps {
  onNovaVistoria?: () => void;
}

const ListaVistoriasSupabase = ({ onNovaVistoria }: ListaVistoriasSupabaseProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { vistorias, loading } = useVistoriasSupabase();
  const isMobile = useIsMobile();

  const filteredVistorias = vistorias.filter(vistoria =>
    vistoria.condominio?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vistoria.numero_interno.includes(searchTerm) ||
    vistoria.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Conforme':
        return 'bg-green-100 text-green-800';
      case 'Não Conforme':
        return 'bg-red-100 text-red-800';
      case 'Requer Atenção':
        return 'bg-yellow-100 text-yellow-800';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-gray-600">Carregando vistorias...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>Vistorias Realizadas</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder={isMobile ? "Buscar..." : "Buscar por condomínio, número ou responsável..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 ${isMobile ? 'w-full' : 'w-80'}`}
            />
          </div>
          {onNovaVistoria && (
            <Button onClick={onNovaVistoria} className="bg-teal-600 hover:bg-teal-700">
              <Plus size={18} className="mr-2" />
              Nova Vistoria
            </Button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        <Card>
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center">
              <FileText className={`text-teal-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              <div className="ml-4">
                <p className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Total</p>
                <p className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>{vistorias.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center">
              <Building className={`text-green-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              <div className="ml-4">
                <p className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Conformes</p>
                <p className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {vistorias.filter(v => v.status === 'Conforme').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center">
              <Calendar className={`text-red-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              <div className="ml-4">
                <p className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Não Conformes</p>
                <p className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {vistorias.filter(v => v.status === 'Não Conforme').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center">
              <Eye className={`text-blue-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
              <div className="ml-4">
                <p className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Em Andamento</p>
                <p className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                  {vistorias.filter(v => v.status === 'Em Andamento').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vistorias */}
      <div className="space-y-4">
        {filteredVistorias.length === 0 ? (
          <Card>
            <CardContent className={`text-center ${isMobile ? 'p-6' : 'p-8'}`}>
              <FileText size={isMobile ? 32 : 48} className="mx-auto text-gray-300 mb-4" />
              <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                {searchTerm ? 'Nenhuma vistoria encontrada' : 'Nenhuma vistoria cadastrada'}
              </h3>
              <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando uma nova vistoria.'}
              </p>
              {!searchTerm && onNovaVistoria && (
                <Button onClick={onNovaVistoria} className="bg-teal-600 hover:bg-teal-700">
                  <Plus size={18} className="mr-2" />
                  Criar Nova Vistoria
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredVistorias.map((vistoria) => (
            <Card key={vistoria.id} className="hover:shadow-md transition-shadow">
              <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
                  <div className="flex-1">
                    <div className={`flex items-center mb-2 ${isMobile ? 'flex-wrap gap-2' : 'space-x-4'}`}>
                      <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
                        {vistoria.condominio?.nome}
                      </h3>
                      <Badge variant="outline">
                        #{vistoria.numero_interno}
                      </Badge>
                      <Badge className={getStatusColor(vistoria.status)}>
                        {vistoria.status}
                      </Badge>
                    </div>
                    
                    <div className={`grid gap-2 text-gray-600 ${isMobile ? 'grid-cols-1 text-sm' : 'grid-cols-2 md:grid-cols-4 gap-4 text-sm'}`}>
                      <div>
                        <span className="font-medium">Data:</span> {formatDate(vistoria.data_vistoria)}
                      </div>
                      <div>
                        <span className="font-medium">Responsável:</span> {vistoria.responsavel}
                      </div>
                      <div>
                        <span className="font-medium">Grupos:</span> {vistoria.grupos.length}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span> {vistoria.id_sequencial}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`flex space-x-2 ${isMobile ? 'w-full' : 'ml-4'}`}>
                    <Button variant="outline" size="sm" className={isMobile ? 'flex-1' : ''}>
                      <Eye size={16} className={isMobile ? '' : 'mr-2'} />
                      {!isMobile && 'Visualizar'}
                    </Button>
                    <Button variant="outline" size="sm" className={isMobile ? 'flex-1' : ''}>
                      <Download size={16} className={isMobile ? '' : 'mr-2'} />
                      {!isMobile && 'PDF'}
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

export default ListaVistoriasSupabase;
