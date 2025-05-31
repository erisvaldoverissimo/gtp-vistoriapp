import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Download, Calendar, Building, FileText, Loader2 } from 'lucide-react';
import { useVistorias } from '@/hooks/useVistorias';
import DetalheVistoria from './DetalheVistoria';
import { useToast } from '@/hooks/use-toast';

interface Vistoria {
  id: string;
  condominio: string;
  numeroInterno: string;
  dataVistoria: string;
  ambiente: string;
  status: string;
  responsavel: string;
  fotosCount: number;
  observacoes?: string;
  condominioId?: string;
  idSequencial?: number;
}

const ListaVistorias = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVistoria, setSelectedVistoria] = useState<Vistoria | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { vistorias, loading } = useVistorias();
  const { toast } = useToast();

  const filteredVistorias = vistorias.filter(vistoria =>
    vistoria.condominio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vistoria.numeroInterno.includes(searchTerm) ||
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewVistoria = (vistoria: Vistoria) => {
    setSelectedVistoria(vistoria);
    setIsModalOpen(true);
  };

  const handleDownloadPDF = (vistoria: Vistoria) => {
    // Simular geração de PDF
    toast({
      title: "PDF em preparação",
      description: `Gerando PDF da vistoria ${vistoria.numeroInterno}...`,
    });

    // Simular delay da geração
    setTimeout(() => {
      toast({
        title: "PDF gerado com sucesso!",
        description: `Vistoria_${vistoria.numeroInterno}_${vistoria.condominio.replace(/\s+/g, '_')}.pdf`,
      });
    }, 2000);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVistoria(null);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vistorias Realizadas</h2>
        <div className="flex items-center space-x-4">
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
                <p className="text-2xl font-bold text-gray-900">{vistorias.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {vistorias.filter(v => v.status === 'Conforme').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {vistorias.filter(v => v.status === 'Não Conforme').length}
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {vistorias.filter(v => v.status === 'Requer Atenção').length}
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
            <CardContent className="p-8 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vistoria encontrada</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando uma nova vistoria.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVistorias.map((vistoria) => (
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
                      <Badge className={getStatusColor(vistoria.status)}>
                        {vistoria.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Data:</span> {formatDate(vistoria.dataVistoria)}
                      </div>
                      <div>
                        <span className="font-medium">Ambiente:</span> {vistoria.ambiente}
                      </div>
                      <div>
                        <span className="font-medium">Responsável:</span> {vistoria.responsavel}
                      </div>
                      <div>
                        <span className="font-medium">Fotos:</span> {vistoria.fotosCount}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewVistoria(vistoria)}
                    >
                      <Eye size={16} className="mr-2" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadPDF(vistoria)}
                    >
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

      {/* Modal de Detalhes */}
      <DetalheVistoria
        vistoria={selectedVistoria}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDownloadPDF={handleDownloadPDF}
      />
    </div>
  );
};

export default ListaVistorias;
