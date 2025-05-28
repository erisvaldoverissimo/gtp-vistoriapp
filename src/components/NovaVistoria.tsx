
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Upload, Save, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UploadFotos from './UploadFotos';

interface VistoriaData {
  condominio: string;
  numeroInterno: string;
  dataVistoria: string;
  ambiente: string;
  grupo: string;
  item: string;
  status: string;
  parecer: string;
  observacoes: string;
  responsavel: string;
  fotos: File[];
}

interface NovaVistoriaProps {
  onPreview: (data: VistoriaData) => void;
}

const NovaVistoria = ({ onPreview }: NovaVistoriaProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<VistoriaData>({
    condominio: '',
    numeroInterno: '',
    dataVistoria: new Date().toISOString().split('T')[0],
    ambiente: '',
    grupo: '',
    item: '',
    status: '',
    parecer: '',
    observacoes: '',
    responsavel: '',
    fotos: []
  });

  const ambientes = ['Térreo', '1º Andar', '2º Andar', '3º Andar', 'Subsolo', 'Cobertura', 'Área Externa'];
  const grupos = [
    'Inspeção Predial (PMUO) [ABNT NBR 5674]',
    'Estrutural',
    'Instalações Elétricas',
    'Instalações Hidráulicas',
    'Vedações',
    'Cobertura'
  ];
  const statusOptions = ['N/A', 'Conforme', 'Não Conforme', 'Requer Atenção'];

  const handleInputChange = (field: keyof VistoriaData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFotosChange = (fotos: File[]) => {
    setFormData(prev => ({ ...prev, fotos }));
  };

  const handleSave = () => {
    console.log('Salvando vistoria:', formData);
    toast({
      title: "Vistoria Salva",
      description: "Os dados da vistoria foram salvos com sucesso.",
    });
  };

  const handlePreview = () => {
    if (!formData.condominio || !formData.numeroInterno) {
      toast({
        title: "Dados Incompletos",
        description: "Por favor, preencha pelo menos o nome do condomínio e número interno.",
        variant: "destructive",
      });
      return;
    }
    onPreview(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Nova Vistoria</h2>
        <div className="flex space-x-2">
          <Button onClick={handleSave} variant="outline">
            <Save size={18} className="mr-2" />
            Salvar
          </Button>
          <Button onClick={handlePreview} className="bg-teal-600 hover:bg-teal-700">
            <Eye size={18} className="mr-2" />
            Visualizar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar size={20} className="mr-2" />
              Dados Básicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="condominio">Nome do Condomínio *</Label>
              <Input
                id="condominio"
                value={formData.condominio}
                onChange={(e) => handleInputChange('condominio', e.target.value)}
                placeholder="Ex: Condomínio Edifício Artur Ramos"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numeroInterno">Nº Interno *</Label>
                <Input
                  id="numeroInterno"
                  value={formData.numeroInterno}
                  onChange={(e) => handleInputChange('numeroInterno', e.target.value)}
                  placeholder="Ex: 2028"
                />
              </div>
              <div>
                <Label htmlFor="dataVistoria">Data da Vistoria</Label>
                <Input
                  id="dataVistoria"
                  type="date"
                  value={formData.dataVistoria}
                  onChange={(e) => handleInputChange('dataVistoria', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="responsavel">Responsável pela Vistoria</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                placeholder="Nome do vistoriador"
              />
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Vistoria */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Vistoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ambiente">Ambiente</Label>
              <Select value={formData.ambiente} onValueChange={(value) => handleInputChange('ambiente', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent>
                  {ambientes.map((ambiente) => (
                    <SelectItem key={ambiente} value={ambiente}>
                      {ambiente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grupo">Grupo</Label>
              <Select value={formData.grupo} onValueChange={(value) => handleInputChange('grupo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o grupo" />
                </SelectTrigger>
                <SelectContent>
                  {grupos.map((grupo) => (
                    <SelectItem key={grupo} value={grupo}>
                      {grupo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item">Item</Label>
              <Input
                id="item"
                value={formData.item}
                onChange={(e) => handleInputChange('item', e.target.value)}
                placeholder="Ex: 15.0 Sistema de automação (30 dias) > [01] Dados, Informática, Vídeo"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parecer e Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Parecer Técnico e Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="parecer">Parecer Técnico</Label>
            <Textarea
              id="parecer"
              value={formData.parecer}
              onChange={(e) => handleInputChange('parecer', e.target.value)}
              placeholder="Descreva o parecer técnico detalhado..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload de Fotos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload size={20} className="mr-2" />
            Fotos da Vistoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UploadFotos onFotosChange={handleFotosChange} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NovaVistoria;
