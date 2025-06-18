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
      // Remover fotos do grupo removido
      setGrupoFotos(prev => {
        const newFotos = { ...prev };
        delete newFotos[grupoIndex];
        // Re-indexar fotos dos grupos posteriores
        const updatedFotos: { [key: number]: FotoUpload[] } = {};
        Object.keys(newFotos).forEach(key => {
          const numKey = parseInt(key);
          if (numKey > grupoIndex) {
            updatedFotos[numKey - 1] = newFotos[numKey];
          } else {
            updatedFotos[numKey] = newFotos[numKey];
          }
        });
        return updatedFotos;
      });
    }
  }, [formData.grupos.length]);

  // Função corrigida para receber fotos
  const handleFotosChange = useCallback((grupoIndex: number, fotos: File[], fotosComDescricao?: Array<{file: File, descricao: string}>) => {
    console.log(`=== handleFotosChange chamada ===`);
    console.log(`Grupo: ${grupoIndex}`);
    console.log(`Arquivos recebidos:`, fotos.length);
    console.log(`Fotos com descrição:`, fotosComDescricao?.length || 0);
    
    // Log detalhado dos arquivos
    fotos.forEach((file, index) => {
      console.log(`Arquivo ${index}:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        isFile: file instanceof File
      });
    });

    // Usar fotosComDescricao se disponível, senão criar com descrição vazia
    const fotosUpload: FotoUpload[] = fotosComDescricao && fotosComDescricao.length === fotos.length 
      ? fotosComDescricao 
      : fotos.map(file => ({ file, descricao: '' }));

    console.log(`Fotos para upload processadas:`, fotosUpload.length);
    
    setGrupoFotos(prev => {
      const updated = {
        ...prev,
        [grupoIndex]: fotosUpload
      };
      console.log(`Estado grupoFotos atualizado:`, updated);
      return updated;
    });
  }, []);

  const handleSave = useCallback(async () => {
    console.log('=== INICIANDO SALVAMENTO ===');
    console.log('Dados da vistoria:', formData);
    console.log('Fotos por grupo:', grupoFotos);
    
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
      console.log('Salvando vistoria...');
      
      // Salvar vistoria primeiro
      const vistoriaSalva = await salvarVistoria(formData);
      
      if (!vistoriaSalva || !vistoriaSalva.id) {
        throw new Error('Erro ao salvar vistoria - ID não retornado');
      }

      console.log('Vistoria salva com sucesso:', vistoriaSalva.id);

      // Verificar se há fotos para upload
      const totalFotos = Object.values(grupoFotos).reduce((total, fotos) => total + fotos.length, 0);
      console.log(`Total de fotos para upload: ${totalFotos}`);
      
      if (totalFotos > 0) {
        console.log('Buscando grupos salvos...');
        
        // Buscar os grupos salvos para obter os IDs
        const { data: gruposSalvos, error: gruposError } = await supabase
          .from('grupos_vistoria')
          .select('id, ordem')
          .eq('vistoria_id', vistoriaSalva.id)
          .order('ordem');

        if (gruposError) {
          console.error('Erro ao buscar grupos salvos:', gruposError);
          throw gruposError;
        }

        console.log('Grupos salvos encontrados:', gruposSalvos);

        // Upload das fotos para cada grupo
        for (const [grupoIndexStr, fotos] of Object.entries(grupoFotos)) {
          const grupoIndex = parseInt(grupoIndexStr);
          
          if (fotos.length > 0) {
            const grupoSalvo = gruposSalvos?.find(g => g.ordem === grupoIndex);
            if (grupoSalvo) {
              console.log(`Fazendo upload de ${fotos.length} fotos para grupo ${grupoSalvo.id} (ordem ${grupoIndex})`);
              
              // Validar que os arquivos estão corretos antes do upload
              const fotosValidas = fotos.filter(foto => 
                foto.file instanceof File && foto.file.size > 0
              );
              
              console.log(`Fotos válidas para upload: ${fotosValidas.length}/${fotos.length}`);
              
              if (fotosValidas.length > 0) {
                try {
                  await uploadFotos(grupoSalvo.id, fotosValidas);
                  console.log(`Upload concluído para grupo ${grupoSalvo.id}`);
                } catch (uploadError) {
                  console.error(`Erro no upload de fotos para grupo ${grupoSalvo.id}:`, uploadError);
                  // Continuar com outros grupos mesmo se um falhar
                }
              } else {
                console.warn(`Nenhuma foto válida encontrada para grupo ${grupoIndex}`);
              }
            } else {
              console.warn(`Grupo salvo não encontrado para ordem ${grupoIndex}`);
            }
          }
        }

        toast({
          title: "Sucesso Completo",
          description: `Vistoria ${formData.numero_interno} salva com ${totalFotos} foto(s).`,
        });
      } else {
        toast({
          title: "Vistoria Salva",
          description: `Vistoria ${formData.numero_interno} salva sem fotos.`,
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
      toast({
        title: "Erro",
        description: "Não foi possível salvar a vistoria. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
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
