import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Calendar, Building, FileText, Loader2, Edit } from 'lucide-react';
import { useVistorias } from '@/hooks/useVistorias';
import DetalheVistoria from './DetalheVistoria';
import FiltrosAvancados from './FiltrosAvancados';
import Paginacao from './Paginacao';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

interface ListaVistoriasProps {
  onNavigate?: (page: string) => void;
  onEditVistoria?: (vistoria: Vistoria) => void;
}

const ITEMS_PER_PAGE = 10;

const ListaVistorias = ({ onNavigate, onEditVistoria }: ListaVistoriasProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVistoria, setSelectedVistoria] = useState<Vistoria | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { vistorias, loading, excluirVistoria } = useVistorias();
  const { toast } = useToast();

  const filteredVistorias = useMemo(() => {
    return vistorias.filter(vistoria => {
      const matchesSearch = 
        vistoria.condominio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vistoria.numeroInterno.includes(searchTerm) ||
        vistoria.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || vistoria.status === statusFilter;
      
      const matchesDate = !dateFilter || vistoria.dataVistoria === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [vistorias, searchTerm, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredVistorias.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVistorias = filteredVistorias.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  const handleEditVistoria = (vistoria: Vistoria) => {
    if (onEditVistoria) {
      onEditVistoria(vistoria);
    }
    if (onNavigate) {
      onNavigate('nova-vistoria');
    }
  };

  const handleDownloadPDF = async (vistoria: Vistoria) => {
    try {
      toast({
        title: "Gerando PDF...",
        description: `Preparando relatório da vistoria ${vistoria.numeroInterno}`,
      });

      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Cabeçalho com logos e título
      pdf.setFillColor(88, 69, 159); // Purple color like PreviewPDF
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
      
      // Tabela do sistema de vistoria
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

  const handleDeleteVistoria = async (vistoria: Vistoria) => {
    if (window.confirm(`Tem certeza que deseja excluir a vistoria ${vistoria.numeroInterno}?`)) {
      try {
        excluirVistoria(vistoria.id);
        toast({
          title: "Vistoria Excluída",
          description: `Vistoria ${vistoria.numeroInterno} foi excluída com sucesso.`,
        });
      } catch (error) {
        toast({
          title: "Erro ao Excluir",
          description: "Ocorreu um erro ao excluir a vistoria.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVistoria(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      </div>

      {/* Filtros Avançados */}
      <FiltrosAvancados
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearFilters={handleClearFilters}
      />

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Vistorias</p>
                <p className="text-2xl font-bold text-gray-900">{filteredVistorias.length}</p>
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
                  {filteredVistorias.filter(v => v.status === 'Conforme').length}
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
                  {filteredVistorias.filter(v => v.status === 'Não Conforme').length}
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
                  {filteredVistorias.filter(v => v.status === 'Requer Atenção').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Vistorias */}
      <div className="space-y-4">
        {paginatedVistorias.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vistoria encontrada</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter || dateFilter ? 'Tente ajustar os filtros de busca.' : 'Acesse "Nova Vistoria" no menu para criar sua primeira vistoria.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          paginatedVistorias.map((vistoria) => (
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
                      onClick={() => handleEditVistoria(vistoria)}
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
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

      {/* Paginação */}
      <Paginacao
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredVistorias.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />

      {/* Modal de Detalhes */}
      <DetalheVistoria
        vistoria={selectedVistoria}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDownloadPDF={handleDownloadPDF}
        onEdit={handleEditVistoria}
      />
    </div>
  );
};

export default ListaVistorias;
