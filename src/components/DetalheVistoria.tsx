
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
import { Download, Calendar, Building, User, MapPin, FileText, Edit } from 'lucide-react';
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

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Cabeçalho com logos e título (mesmo padrão do PreviewPDF)
      pdf.setFillColor(88, 69, 159); // Purple color
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text('Relatório de Vistoria Técnica - GTP', pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text('Sistema de Vistorias Prediais', pageWidth / 2, 32, { align: 'center' });
      
      // Informações da vistoria em formato de grid
      pdf.setTextColor(0, 0, 0);
      pdf.setFillColor(245, 245, 245);
      pdf.rect(20, 50, pageWidth - 40, 30, 'F');
      
      pdf.setFontSize(10);
      let yPos = 58;
      
      // Primeira linha
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data de emissão:', 25, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(new Date().toISOString()), 25, yPos + 5);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Hora:', 70, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), 70, yPos + 5);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Usuário:', 115, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(vistoria.responsavel, 115, yPos + 5);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Empreendimento:', 160, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(vistoria.condominio, 160, yPos + 5);
      
      // Segunda linha
      yPos += 15;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Nº interno da vistoria:', 25, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(vistoria.numeroInterno, 25, yPos + 5);
      
      pdf.setFont('helvetica', 'bold');
      pdf.text('Data da vistoria:', 115, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(formatDate(vistoria.dataVistoria), 115, yPos + 5);
      
      // Sistema de Vistoria - mesmo padrão do PreviewPDF
      yPos = 95;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(88, 69, 159);
      pdf.text('Sistema de Vistoria 1', 20, yPos);
      
      yPos += 10;
      
      // Cabeçalho da tabela
      pdf.setFillColor(88, 69, 159);
      pdf.rect(20, yPos, pageWidth - 40, 8, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      
      const colWidths = [30, 30, 30, 24, 56];
      let xPos = 20;
      
      pdf.text('Ambiente', xPos + colWidths[0]/2, yPos + 5, { align: 'center' });
      xPos += colWidths[0];
      pdf.text('Sistema', xPos + colWidths[1]/2, yPos + 5, { align: 'center' });
      xPos += colWidths[1];
      pdf.text('Subsistema', xPos + colWidths[2]/2, yPos + 5, { align: 'center' });
      xPos += colWidths[2];
      pdf.text('Status', xPos + colWidths[3]/2, yPos + 5, { align: 'center' });
      xPos += colWidths[3];
      pdf.text('Parecer', xPos + colWidths[4]/2, yPos + 5, { align: 'center' });
      
      // Linha de dados
      yPos += 8;
      pdf.setFillColor(255, 255, 255);
      pdf.rect(20, yPos, pageWidth - 40, 12, 'F');
      
      // Bordas da tabela
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      xPos = 20;
      for (let i = 0; i <= colWidths.length; i++) {
        pdf.line(xPos, yPos - 8, xPos, yPos + 12);
        if (i < colWidths.length) xPos += colWidths[i];
      }
      pdf.line(20, yPos - 8, pageWidth - 20, yPos - 8);
      pdf.line(20, yPos + 12, pageWidth - 20, yPos + 12);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      xPos = 20;
      pdf.text(vistoria.ambiente, xPos + colWidths[0]/2, yPos + 6, { align: 'center' });
      xPos += colWidths[0];
      pdf.text('Sistema Geral', xPos + colWidths[1]/2, yPos + 6, { align: 'center' });
      xPos += colWidths[1];
      pdf.text('Subsistema Geral', xPos + colWidths[2]/2, yPos + 6, { align: 'center' });
      xPos += colWidths[2];
      
      // Status com cor
      const statusColor = vistoria.status === 'Conforme' ? [76, 175, 80] : 
                         vistoria.status === 'Não Conforme' ? [244, 67, 54] : [255, 193, 7];
      pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.rect(xPos + 2, yPos + 2, colWidths[3] - 4, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.text(vistoria.status, xPos + colWidths[3]/2, yPos + 6, { align: 'center' });
      
      xPos += colWidths[3];
      pdf.setTextColor(0, 0, 0);
      const parecer = vistoria.observacoes || 'Vistoria realizada conforme procedimentos';
      const parecerLines = pdf.splitTextToSize(parecer, colWidths[4] - 4);
      pdf.text(parecerLines, xPos + 2, yPos + 4);
      
      // Observações gerais se existirem
      if (vistoria.observacoes) {
        yPos += 25;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(88, 69, 159);
        pdf.text('Observações Gerais', 20, yPos);
        
        yPos += 8;
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, yPos, pageWidth - 40, 20, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const obsLines = pdf.splitTextToSize(vistoria.observacoes, pageWidth - 50);
        pdf.text(obsLines, 25, yPos + 5);
      }
      
      // Rodapé
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Relatório gerado automaticamente pelo Sistema de Vistorias - ${formatDate(new Date().toISOString())} às ${new Date().toLocaleTimeString('pt-BR')}`,
        20,
        pageHeight - 20
      );
      pdf.text('Página 1/1', pageWidth - 40, pageHeight - 20);
      
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
