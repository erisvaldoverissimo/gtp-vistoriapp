import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VistoriaSupabase, GrupoVistoriaSupabase, useVistoriasSupabase } from '@/hooks/useVistoriasSupabase';
import { useCondominiosSupabase } from '@/hooks/useCondominiosSupabase';
import { useFotosSupabase, FotoUpload } from '@/hooks/useFotosSupabase';
import { supabase } from '@/integrations/supabase/client';

export const useNovaVistoriaForm = (onBack?: () => void) => {
  const { toast } = useToast();
  const { condominios } = useCondominiosSupabase();
  const { salvarVistoria, obterProximoNumeroSequencial } = useVistoriasSupabase();
  const { uploadFotos } = useFotosSupabase();

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
  const [grupoFotos, setGrupoFotos] = useState<{ [key: number]: FotoUpload[] }>({});

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
    const fotosUpload = fotosComDescricao || fotos.map(file => ({ file, descricao: '' }));
    setGrupoFotos(prev => ({
      ...prev,
      [grupoIndex]: fotosUpload
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
      console.log('Salvando vistoria com fotos...');
      
      // Salvar vistoria primeiro
      const vistoriaSalva = await salvarVistoria(formData);
      
      if (!vistoriaSalva || !vistoriaSalva.id) {
        throw new Error('Erro ao salvar vistoria - ID não retornado');
      }

      console.log('Vistoria salva, iniciando upload de fotos...');

      // Fazer upload das fotos para cada grupo que tem fotos
      const totalFotos = Object.values(grupoFotos).reduce((total, fotos) => total + fotos.length, 0);
      
      if (totalFotos > 0) {
        // Buscar os grupos salvos para obter os IDs
        const { data: gruposSalvos, error: gruposError } = await supabase
          .from('grupos_vistoria')
          .select('id, ordem')
          .eq('vistoria_id', vistoriaSalva.id)
          .order('ordem');

        if (gruposError) {
          throw gruposError;
        }

        // Upload das fotos para cada grupo
        for (const [grupoIndex, fotos] of Object.entries(grupoFotos)) {
          if (fotos.length > 0) {
            const grupoSalvo = gruposSalvos.find(g => g.ordem === parseInt(grupoIndex));
            if (grupoSalvo) {
              console.log(`Fazendo upload de ${fotos.length} fotos para grupo ${grupoSalvo.id}`);
              await uploadFotos(grupoSalvo.id, fotos);
            }
          }
        }

        toast({
          title: "Sucesso Completo",
          description: `Vistoria ${formData.numero_interno} salva com ${totalFotos} foto(s).`,
        });
      }

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
      console.error('Erro ao salvar vistoria:', error);
      // Erro já tratado nos hooks
    } finally {
      setSaving(false);
    }
  }, [formData, grupoFotos, salvarVistoria, uploadFotos, onBack, toast]);

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
