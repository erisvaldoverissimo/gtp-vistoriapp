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
import { Download, X, Calendar, Building, User, MapPin, FileText, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

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
  onEdit: (vistoria: Vistoria) => void;
}

const DetalheVistoria = ({ vistoria, isOpen, onClose, onDownloadPDF, onEdit }: DetalheVistoriaProps) => {
  const { toast } = useToast();

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

  const handleDownloadPDFLocal = async () => {
    try {
      toast({
        title: "Gerando PDF...",
        description: `Preparando relatório da vistoria ${vistoria.numeroInterno}`,
      });

      // Usar a mesma lógica de geração de PDF
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Cabeçalho
      pdf.setFillColor(128, 90, 213);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text('Relatório de Vistoria Técnica - GTP', pageWidth / 2, 25, { align: 'center' });
      
      // Informações da vistoria
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      
      let yPosition = 60;
      
      pdf.text(`Condomínio: ${vistoria.condominio}`, 20, yPosition);
      yPosition += 10;
      
      pdf.text(`Número Interno: #${vistoria.numeroInterno}`, 20, yPosition);
      yPosition += 10;
      
      pdf.text(`Data da Vistoria: ${formatDate(vistoria.dataVistoria)}`, 20, yPosition);
      yPosition += 10;
      
      pdf.text(`Ambiente: ${vistoria.ambiente}`, 20, yPosition);
      yPosition += 10;
      
      pdf.text(`Status: ${vistoria.status}`, 20, yPosition);
      yPosition += 10;
      
      pdf.text(`Responsável: ${vistoria.responsavel}`, 20, yPosition);
      yPosition += 10;
      
      pdf.text(`Fotos Registradas: ${vistoria.fotosCount}`, 20, yPosition);
      yPosition += 20;
      
      // Observações se existirem
      if (vistoria.observacoes) {
        pdf.setFontSize(14);
        pdf.text('Observações:', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(10);
        const observacoes = pdf.splitTextToSize(vistoria.observacoes, pageWidth - 40);
        pdf.text(observacoes, 20, yPosition);
        yPosition += observacoes.length * 5;
      }
      
      // Rodapé
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
        20,
        pageHeight - 20
      );
      
      // Salvar o PDF
      const fileName = `Vistoria_${vistoria.numeroInterno}_${vistoria.condominio.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF gerado com sucesso!",
        description: `Relatório ${fileName} foi baixado`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro durante a geração do relatório",
        variant: "destructive",
      });
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
                onClick={() => onEdit(vistoria)}
                variant="outline" 
                size="sm"
              >
                <Edit size={16} className="mr-2" />
                Editar
              </Button>
              <Button 
                onClick={handleDownloadPDFLocal}
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
