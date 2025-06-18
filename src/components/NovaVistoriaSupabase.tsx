import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Save, Eye, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCondominiosSupabase } from '@/hooks/useCondominiosSupabase';
import { useVistoriasSupabase, VistoriaSupabase, GrupoVistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useAmbientesGrupos } from '@/hooks/useAmbientesGrupos';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UploadFotos from '@/components/UploadFotos';

interface NovaVistoriaSupabaseProps {
  onPreview?: (data: VistoriaSupabase) => void;
  onBack?: () => void;
}

const NovaVistoriaSupabase = ({ onPreview, onBack }: NovaVistoriaSupabaseProps) => {
  const { toast } = useToast();
  const { condominios, loading: loadingCondominios } = useCondominiosSupabase();
  const { salvarVistoria, obterProximoNumeroSequencial } = useVistoriasSupabase();
  const { obterUsuariosAtivos } = useUsuarios();
  const { obterAmbientesPorCondominio, obterGruposPorCondominio } = useAmbientesGrupos();
  const usuariosAtivos = obterUsuariosAtivos();
  
  const [formData, setFormData] = useState<VistoriaSupabase>({
    condominio_id: '',
    numero_interno: '',
    id_sequencial: 0,
    data_vistoria: new Date().toISOString().split('T')[0],
    observacoes_gerais: '',
    responsavel: '',
    status: 'Em Andamento',
    grupos: [{
      ambiente: '',
      grupo: '',
      item: '',
      status: '',
      parecer: '',
      ordem: 0
    }]
  });

  const [saving, setSaving] = useState(false);
  const [grupoFotos, setGrupoFotos] = useState<{ [key: number]: File[] }>({});

  // Obter ambientes e grupos baseados no condomínio selecionado
  const ambientesDisponiveis = obterAmbientesPorCondominio(formData.condominio_id);
  const gruposDisponiveis = obterGruposPorCondominio(formData.condominio_id);

  const statusOptions = ['N/A', 'Conforme', 'Não Conforme', 'Requer Atenção'];

  const handleInputChange = (field: keyof VistoriaSupabase, value: string) => {
    if (field === 'observacoes_gerais' && value.length > 150) {
      toast({
        title: "Limite de Caracteres Excedido",
        description: "As observações gerais devem ter no máximo 150 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCondominioChange = async (condominioId: string) => {
    const condominio = condominios.find(c => c.id === condominioId);
    if (condominio) {
      const proximoNumero = await obterProximoNumeroSequencial(condominioId);
      setFormData(prev => ({
        ...prev,
        condominio_id: condominioId,
        id_sequencial: proximoNumero,
        numero_interno: `${new Date().getFullYear()}-${proximoNumero.toString().padStart(4, '0')}`
      }));
    }
  };

  const handleGrupoChange = (grupoIndex: number, field: keyof GrupoVistoriaSupabase, value: string) => {
    if (field === 'parecer' && value.length > 200) {
      toast({
        title: "Limite de Caracteres Excedido",
        description: "O parecer técnico deve ter no máximo 200 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      grupos: prev.grupos.map((grupo, index) => 
        index === grupoIndex ? { ...grupo, [field]: value } : grupo
      )
    }));
  };

  const adicionarGrupo = () => {
    const novoGrupo: GrupoVistoriaSupabase = {
      ambiente: '',
      grupo: '',
      item: '',
      status: '',
      parecer: '',
      ordem: formData.grupos.length
    };
    setFormData(prev => ({
      ...prev,
      grupos: [...prev.grupos, novoGrupo]
    }));
  };

  const removerGrupo = (grupoIndex: number) => {
    if (formData.grupos.length > 1) {
      setFormData(prev => ({
        ...prev,
        grupos: prev.grupos.filter((_, index) => index !== grupoIndex)
      }));
      // Remover fotos associadas ao grupo removido
      setGrupoFotos(prev => {
        const newFotos = { ...prev };
        delete newFotos[grupoIndex];
        return newFotos;
      });
    }
  };

  const handleFotosChange = (grupoIndex: number, fotos: File[], fotosComDescricao?: Array<{file: File, descricao: string}>) => {
    setGrupoFotos(prev => ({
      ...prev,
      [grupoIndex]: fotos
    }));
  };

  const handleSave = async () => {
    if (!formData.condominio_id) {
      toast({
        title: "Condomínio Obrigatório",
        description: "Por favor, selecione um condomínio.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.responsavel) {
      toast({
        title: "Responsável Obrigatório",
        description: "Por favor, selecione o responsável pela vistoria.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await salvarVistoria(formData);
      
      // Limpar formulário após salvar
      setFormData({
        condominio_id: '',
        numero_interno: '',
        id_sequencial: 0,
        data_vistoria: new Date().toISOString().split('T')[0],
        observacoes_gerais: '',
        responsavel: '',
        status: 'Em Andamento',
        grupos: [{
          ambiente: '',
          grupo: '',
          item: '',
          status: '',
          parecer: '',
          ordem: 0
        }]
      });
      setGrupoFotos({});

      if (onBack) {
        onBack();
      }
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!formData.condominio_id) {
      toast({
        title: "Condomínio Obrigatório",
        description: "Por favor, selecione um condomínio.",
        variant: "destructive",
      });
      return;
    }
    if (onPreview) {
      onPreview(formData);
    }
  };

  if (loadingCondominios) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Nova Vistoria</h2>
        <div className="flex space-x-2">
          {onBack && (
            <Button onClick={onBack} variant="outline">
              Voltar
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          {onPreview && (
            <Button onClick={handlePreview} variant="outline">
              <Eye size={18} className="mr-2" />
              Visualizar PDF
            </Button>
          )}
        </div>
      </div>

      {/* Dados Básicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar size={20} className="mr-2" />
            Dados Básicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="condominio">Condomínio *</Label>
              {condominios.length === 0 ? (
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                  <p className="text-sm text-orange-700">
                    Nenhum condomínio cadastrado. Acesse a aba "Condomínios" para cadastrar.
                  </p>
                </div>
              ) : (
                <Select value={formData.condominio_id} onValueChange={handleCondominioChange}>
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

            <div>
              <Label htmlFor="responsavel">Responsável pela Vistoria *</Label>
              {usuariosAtivos.length === 0 ? (
                <div className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                  <p className="text-sm text-orange-700">
                    Nenhum usuário ativo cadastrado. Acesse a aba "Usuários" para gerenciar.
                  </p>
                </div>
              ) : (
                <Select value={formData.responsavel} onValueChange={(value) => handleInputChange('responsavel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuariosAtivos.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.nome}>
                        {usuario.nome} {usuario.cargo && `- ${usuario.cargo}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="numeroInterno">Nº Interno</Label>
              <Input
                id="numeroInterno"
                value={formData.numero_interno}
                readOnly
                className="bg-gray-50"
                placeholder="Selecione um condomínio"
              />
            </div>
            <div>
              <Label htmlFor="idSequencial">ID Sequencial</Label>
              <Input
                id="idSequencial"
                value={formData.id_sequencial || ''}
                readOnly
                className="bg-gray-50"
                placeholder="Auto"
              />
            </div>
            <div>
              <Label htmlFor="dataVistoria">Data da Vistoria</Label>
              <Input
                id="dataVistoria"
                type="date"
                value={formData.data_vistoria}
                onChange={(e) => handleInputChange('data_vistoria', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grupos de Vistoria */}
      {formData.grupos.map((grupo, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Grupo de Vistoria {index + 1}</CardTitle>
              <div className="flex space-x-2">
                {formData.grupos.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removerGrupo(index)}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`ambiente-${index}`}>Ambiente</Label>
                <Select 
                  value={grupo.ambiente} 
                  onValueChange={(value) => handleGrupoChange(index, 'ambiente', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ambiente" />
                  </SelectTrigger>
                  <SelectContent>
                    {ambientesDisponiveis.map((ambiente) => (
                      <SelectItem key={ambiente.id} value={ambiente.nome}>
                        {ambiente.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor={`grupo-${index}`}>Grupo</Label>
                <Select 
                  value={grupo.grupo} 
                  onValueChange={(value) => handleGrupoChange(index, 'grupo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {gruposDisponiveis.map((grupoOpcao) => (
                      <SelectItem key={grupoOpcao.id} value={grupoOpcao.nome}>
                        {grupoOpcao.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`item-${index}`}>Item</Label>
                <Input
                  id={`item-${index}`}
                  value={grupo.item}
                  onChange={(e) => handleGrupoChange(index, 'item', e.target.value)}
                  placeholder="Ex: 15.0 Sistema de automação..."
                />
              </div>

              <div>
                <Label htmlFor={`status-${index}`}>Status</Label>
                <Select 
                  value={grupo.status} 
                  onValueChange={(value) => handleGrupoChange(index, 'status', value)}
                >
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
            </div>

            <div>
              <Label htmlFor={`parecer-${index}`}>Parecer Técnico</Label>
              <div className="space-y-2">
                <Textarea
                  id={`parecer-${index}`}
                  value={grupo.parecer}
                  onChange={(e) => handleGrupoChange(index, 'parecer', e.target.value)}
                  placeholder="Descreva o parecer técnico detalhado..."
                  className="min-h-[80px]"
                />
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${grupo.parecer.length > 180 ? 'text-red-500' : 'text-gray-500'}`}>
                    {grupo.parecer.length}/200 caracteres
                  </span>
                </div>
              </div>
            </div>

            {/* Upload de Fotos */}
            <div>
              <Label>Fotos do Grupo {index + 1}</Label>
              <UploadFotos
                onFotosChange={(fotos, fotosComDescricao) => handleFotosChange(index, fotos, fotosComDescricao)}
                maxFotos={10}
                grupoId={`grupo-${index}`}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Botão para adicionar novo grupo */}
      <div className="flex justify-center">
        <Button onClick={adicionarGrupo} variant="outline" size="lg">
          <Plus size={18} className="mr-2" />
          Adicionar Novo Grupo de Vistoria
        </Button>
      </div>

      {/* Observações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="observacoes">Observações Gerais</Label>
            <div className="space-y-2">
              <Textarea
                id="observacoes"
                value={formData.observacoes_gerais || ''}
                onChange={(e) => handleInputChange('observacoes_gerais', e.target.value)}
                placeholder="Observações adicionais..."
                className="min-h-[80px]"
              />
              <div className="flex justify-between items-center">
                <span className={`text-xs ${(formData.observacoes_gerais?.length || 0) > 130 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.observacoes_gerais?.length || 0}/150 caracteres
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovaVistoriaSupabase;
