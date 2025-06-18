
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VistoriaSupabase, GrupoVistoriaSupabase, useVistoriasSupabase } from '@/hooks/useVistoriasSupabase';
import { useCondominiosSupabase } from '@/hooks/useCondominiosSupabase';

export const useNovaVistoriaForm = (onBack?: () => void) => {
  const { toast } = useToast();
  const { condominios } = useCondominiosSupabase();
  const { salvarVistoria, obterProximoNumeroSequencial } = useVistoriasSupabase();

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

  const handleInputChange = useCallback((field: keyof VistoriaSupabase, value: string) => {
    if (field === 'observacoes_gerais' && value.length > 150) {
      toast({
        title: "Limite de Caracteres Excedido",
        description: "As observações gerais devem ter no máximo 150 caracteres.",
        variant: "destructive",
      });
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [toast]);

  const handleCondominioChange = useCallback(async (condominioId: string) => {
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
  }, [condominios, obterProximoNumeroSequencial]);

  const handleGrupoChange = useCallback((grupoIndex: number, field: keyof GrupoVistoriaSupabase, value: string) => {
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
  }, [toast]);

  const adicionarGrupo = useCallback(() => {
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
  }, [formData.grupos.length]);

  const removerGrupo = useCallback((grupoIndex: number) => {
    if (formData.grupos.length > 1) {
      setFormData(prev => ({
        ...prev,
        grupos: prev.grupos.filter((_, index) => index !== grupoIndex)
      }));
      setGrupoFotos(prev => {
        const newFotos = { ...prev };
        delete newFotos[grupoIndex];
        return newFotos;
      });
    }
  }, [formData.grupos.length]);

  const handleFotosChange = useCallback((grupoIndex: number, fotos: File[], fotosComDescricao?: Array<{file: File, descricao: string}>) => {
    setGrupoFotos(prev => ({
      ...prev,
      [grupoIndex]: fotos
    }));
  }, []);

  const handleSave = useCallback(async () => {
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
  }, [formData, salvarVistoria, onBack, toast]);

  const handlePreview = useCallback(() => {
    if (!formData.condominio_id) {
      toast({
        title: "Condomínio Obrigatório",
        description: "Por favor, selecione um condomínio.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [formData.condominio_id, toast]);

  return {
    formData,
    saving,
    grupoFotos,
    handleInputChange,
    handleCondominioChange,
    handleGrupoChange,
    adicionarGrupo,
    removerGrupo,
    handleFotosChange,
    handleSave,
    handlePreview
  };
};
