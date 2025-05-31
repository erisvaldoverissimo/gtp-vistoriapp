
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, Calendar, Building, User, MapPin, FileText } from 'lucide-react';

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

interface DetalheVistoriaProps {
  vistoria: Vistoria | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF: (vistoria: Vistoria) => void;
}

const DetalheVistoria = ({ vistoria, isOpen, onClose, onDownloadPDF }: DetalheVistoriaProps) => {
  if (!vistoria) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Detalhes da Vistoria
            </DialogTitle>
            <div className="flex space-x-2">
              <Button 
                onClick={() => onDownloadPDF(vistoria)}
                variant="outline" 
                size="sm"
              >
                <Download size={16} className="mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Informações Gerais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Condomínio</label>
                  <p className="text-lg font-semibold">{vistoria.condominio}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Número Interno</label>
                  <p className="text-lg">#{vistoria.numeroInterno}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Data da Vistoria</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p>{formatDate(vistoria.dataVistoria)}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div>
                    <Badge className={getStatusColor(vistoria.status)}>
                      {vistoria.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ambiente</label>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <p>{vistoria.ambiente}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Responsável</label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <p>{vistoria.responsavel}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {vistoria.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Observações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{vistoria.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Fotos */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos da Vistoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {vistoria.fotosCount} foto(s) registrada(s)
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Visualização de fotos será implementada em breve
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetalheVistoria;
