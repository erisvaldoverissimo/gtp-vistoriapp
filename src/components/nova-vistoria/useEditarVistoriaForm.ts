
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { VistoriaSupabase, GrupoVistoriaSupabase, useVistoriasSupabase } from '@/hooks/useVistoriasSupabase';
import { useCondominiosSupabase } from '@/hooks/useCondominiosSupabase';
import { useFotosSupabase, FotoUpload } from '@/hooks/useFotosSupabase';
import { supabase } from '@/integrations/supabase/client';

export const useEditarVistoriaForm = (vistoriaId: string, onBack?: () => void) => {
  const { toast } = useToast();
  const { condominios } = useCondominiosSupabase();
  const { recarregar } = useVistoriasSupabase();
  const { uploadFotos, uploading, uploadProgress } = useFotosSupabase();

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
  const [loading, setLoading] = useState(true);
  const [grupoFotos, setGrupoFotos] = useState<{ [key: number]: FotoUpload[] }>({});

  // Carregar dados da vistoria
  useEffect(() => {
    const carregarVistoria = async () => {
      try {
        console.log('Carregando vistoria para edição:', vistoriaId);
        
        const { data: vistoriaData, error } = await supabase
          .from('vistorias')
          .select(`
            *,
            condominio:condominios(id, nome),
            grupos_vistoria(
              *,
              fotos_vistoria(*)
            )
          `)
          .eq('id', vistoriaId)
          .single();

        if (error) {
          console.error('Erro ao carregar vistoria:', error);
          throw error;
        }

        console.log('Vistoria carregada:', vistoriaData);

        // Formatar dados para o formulário
        const vistoriaFormatada: VistoriaSupabase = {
          id: vistoriaData.id,
          condominio_id: vistoriaData.condominio_id,
          user_id: vistoriaData.user_id,
          numero_interno: vistoriaData.numero_interno,
          id_sequencial: vistoriaData.id_sequencial,
          data_vistoria: vistoriaData.data_vistoria,
          observacoes_gerais: vistoriaData.observacoes_gerais,
          responsavel: vistoriaData.responsavel,
          status: vistoriaData.status,
          created_at: vistoriaData.created_at,
          updated_at: vistoriaData.updated_at,
          condominio: Array.isArray(vistoriaData.condominio) ? vistoriaData.condominio[0] : vistoriaData.condominio,
          grupos: (vistoriaData.grupos_vistoria || []).map(grupo => ({
            id: grupo.id,
            vistoria_id: grupo.vistoria_id,
            ambiente: grupo.ambiente,
            grupo: grupo.grupo,
            item: grupo.item,
            status: grupo.status,
            parecer: grupo.parecer || '',
            ordem: grupo.ordem || 0,
            fotos: grupo.fotos_vistoria || []
          }))
        };

        setFormData(vistoriaFormatada);
      } catch (error) {
        console.error('Erro ao carregar vistoria:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a vistoria para edição.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (vistoriaId) {
      carregarVistoria();
    }
  }, [vistoriaId, toast]);

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

  const handleCondominioChange = useCallback((condominioId: string) => {
    setFormData(prev => ({ ...prev, condominio_id: condominioId }));
  }, []);

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
      console.log('Atualizando vistoria...');
      
      // Atualizar dados da vistoria
      const { grupos, ...dadosVistoriaSemGrupos } = formData;
      const { error: vistoriaError } = await supabase
        .from('vistorias')
        .update({
          condominio_id: dadosVistoriaSemGrupos.condominio_id,
          data_vistoria: dadosVistoriaSemGrupos.data_vistoria,
          observacoes_gerais: dadosVistoriaSemGrupos.observacoes_gerais,
          responsavel: dadosVistoriaSemGrupos.responsavel,
          status: dadosVistoriaSemGrupos.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', vistoriaId);

      if (vistoriaError) {
        throw vistoriaError;
      }

      // Deletar grupos existentes
      const { error: deleteGruposError } = await supabase
        .from('grupos_vistoria')
        .delete()
        .eq('vistoria_id', vistoriaId);

      if (deleteGruposError) {
        throw deleteGruposError;
      }

      // Inserir grupos atualizados
      if (grupos && grupos.length > 0) {
        const gruposParaSalvar = grupos.map(grupo => ({
          vistoria_id: vistoriaId,
          ambiente: grupo.ambiente,
          grupo: grupo.grupo,
          item: grupo.item,
          status: grupo.status,
          parecer: grupo.parecer || '',
          ordem: grupo.ordem || 0
        }));

        const { data: gruposData, error: gruposError } = await supabase
          .from('grupos_vistoria')
          .insert(gruposParaSalvar)
          .select();

        if (gruposError) {
          throw gruposError;
        }

        // Upload das novas fotos para cada grupo
        const totalFotos = Object.values(grupoFotos).reduce((total, fotos) => total + fotos.length, 0);
        
        if (totalFotos > 0) {
          for (const [grupoIndex, fotos] of Object.entries(grupoFotos)) {
            if (fotos.length > 0) {
              const grupoSalvo = gruposData.find(g => g.ordem === parseInt(grupoIndex));
              if (grupoSalvo) {
                console.log(`Fazendo upload de ${fotos.length} fotos para grupo ${grupoSalvo.id}`);
                await uploadFotos(grupoSalvo.id, fotos);
              }
            }
          }
        }
      }

      await recarregar();
      
      toast({
        title: "Sucesso",
        description: `Vistoria ${formData.numero_interno} atualizada com sucesso.`,
      });

      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error('Erro ao atualizar vistoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a vistoria.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [formData, grupoFotos, vistoriaId, uploadFotos, onBack, toast, recarregar]);

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
    loading,
    grupoFotos,
    uploading,
    uploadProgress,
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
