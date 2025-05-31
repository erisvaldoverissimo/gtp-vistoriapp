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
import { Condominio } from '@/hooks/useCondominios';

interface FotoComDescricao extends File {
  descricao?: string;
}

interface VistoriaData {
  condominio: string;
  condominioId: string;
  numeroInterno: string;
  idSequencial: number;
  dataVistoria: string;
  ambiente: string;
  grupo: string;
  item: string;
  status: string;
  parecer: string;
  observacoes: string;
  responsavel: string;
  fotos: FotoComDescricao[];
}

interface NovaVistoriaProps {
  onPreview: (data: VistoriaData) => void;
  condominios: Condominio[];
  obterProximoNumero: (condominioId: string) => number;
  incrementarNumero: (condominioId: string) => void;
}

const NovaVistoria = ({ onPreview, condominios, obterProximoNumero, incrementarNumero }: NovaVistoriaProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<VistoriaData>({
    condominio: '',
    condominioId: '',
    numeroInterno: '',
    idSequencial: 0,
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

  const handleCondominioChange = (condominioId: string) => {
    const condominio = condominios.find(c => c.id === condominioId);
    if (condominio) {
      const proximoNumero = obterProximoNumero(condominioId);
      setFormData(prev => ({
        ...prev,
        condominioId,
        condominio: condominio.nome,
        idSequencial: proximoNumero,
        numeroInterno: `${new Date().getFullYear()}-${proximoNumero.toString().padStart(4, '0')}`
      }));
    }
  };

  const handleFotosChange = (fotos: File[], fotosComDescricao?: Array<{file: File, descricao: string}>) => {
    if (fotosComDescricao) {
      const fotosComDescricaoExtendidas: FotoComDescricao[] = fotosComDescricao.map(item => {
        const fotoExtendida = item.file as FotoComDescricao;
        fotoExtendida.descricao = item.descricao;
        return fotoExtendida;
      });
      setFormData(prev => ({ ...prev, fotos: fotosComDescricaoExtendidas }));
    } else {
      setFormData(prev => ({ ...prev, fotos }));
    }
  };

  const handleSave = () => {
    if (!formData.condominioId) {
      toast({
        title: "Condomínio Obrigatório",
        description: "Por favor, selecione um condomínio.",
        variant: "destructive",
      });
      return;
    }

    // Incrementar o número sequencial do condomínio
    incrementarNumero(formData.condominioId);
    
    console.log('Salvando vistoria:', formData);
    toast({
      title: "Vistoria Salva",
      description: `Vistoria #${formData.numeroInterno} salva com sucesso.`,
    });
  };

  const handlePreview = () => {
    if (!formData.condominioId) {
      toast({
        title: "Condomínio Obrigatório",
        description: "Por favor, selecione um condomínio.",
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
              <Label htmlFor="condominio">Condomínio *</Label>
              {condominios.length === 0 ? (
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                  <p className="text-sm text-orange-700">
                    Nenhum condomínio cadastrado. Acesse a aba "Condomínios" para cadastrar.
                  </p>
                </div>
              ) : (
                <Select value={formData.condominioId} onValueChange={handleCondominioChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o condomínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {condominios.map((condominio) => (
                      <SelectItem key={condominio.id} value={condominio.id}>
                        {condominio.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numeroInterno">Nº Interno</Label>
                <Input
                  id="numeroInterno"
                  value={formData.numeroInterno}
                  readOnly
                  className="bg-gray-50"
                  placeholder="Selecione um condomínio"
                />
              </div>
              <div>
                <Label htmlFor="idSequencial">ID Sequencial</Label>
                <Input
                  id="idSequencial"
                  value={formData.idSequencial || ''}
                  readOnly
                  className="bg-gray-50"
                  placeholder="Auto"
                />
              </div>
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
