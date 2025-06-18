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

  const handleFotosChange = useCallback((grupoIndex: number, fotos: File[], fotosComDescricao?: Array<{file: File, descricao: string}>) => {
    console.log(`=== handleFotosChange NOVA VISTORIA ===`);
    console.log(`Grupo: ${grupoIndex}`);
    console.log(`Arquivos recebidos:`, fotos);
    console.log(`FotosComDescricao:`, fotosComDescricao);
    
    // Validar que todos os arquivos são File válidos
    const arquivosValidos = fotos.filter(file => {
      const isValid = file instanceof File && file.size > 0 && file.name;
      console.log(`Arquivo ${file.name}: válido=${isValid}, size=${file.size}, type=${file.type}`);
      return isValid;
    });

    console.log(`Arquivos válidos: ${arquivosValidos.length}/${fotos.length}`);

    if (arquivosValidos.length === 0) {
      console.warn('Nenhum arquivo válido encontrado');
      return;
    }

    // Criar FotoUpload array
    let fotosUpload: FotoUpload[];
    
    if (fotosComDescricao && fotosComDescricao.length === arquivosValidos.length) {
      // Usar descrições fornecidas
      fotosUpload = fotosComDescricao.filter(foto => 
        foto.file instanceof File && foto.file.size > 0
      );
      console.log('Usando fotos com descrições fornecidas:', fotosUpload.length);
    } else {
      // Criar com descrições vazias
      fotosUpload = arquivosValidos.map(file => ({
        file,
        descricao: ''
      }));
      console.log('Criando fotos com descrições vazias:', fotosUpload.length);
    }

    // Validação final
    const fotosFinais = fotosUpload.filter(foto => {
      const isValid = foto.file instanceof File && foto.file.size > 0;
      if (!isValid) {
        console.error('Foto inválida encontrada:', foto);
      }
      return isValid;
    });

    console.log(`Fotos finais válidas: ${fotosFinais.length}`);

    setGrupoFotos(prev => {
      const updated = {
        ...prev,
        [grupoIndex]: fotosFinais
      };
      console.log(`Estado grupoFotos atualizado para grupo ${grupoIndex}:`, updated[grupoIndex]);
      return updated;
    });
  }, []);

  const handleSave = useCallback(async () => {
    console.log('=== INICIANDO SALVAMENTO NOVA VISTORIA ===');
    console.log('FormData:', formData);
    console.log('GrupoFotos estado atual:', grupoFotos);
    
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
      const vistoriaSalva = await salvarVistoria(formData);
      
      if (!vistoriaSalva || !vistoriaSalva.id) {
        throw new Error('Erro ao salvar vistoria - ID não retornado');
      }

      console.log('Vistoria salva com ID:', vistoriaSalva.id);

      // Verificar se há fotos para upload
      const gruposComFotos = Object.entries(grupoFotos).filter(([_, fotos]) => fotos.length > 0);
      console.log(`Grupos com fotos: ${gruposComFotos.length}`);
      
      if (gruposComFotos.length > 0) {
        console.log('Buscando grupos salvos no banco...');
        
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

        // Upload das fotos
        let totalFotosUpload = 0;
        for (const [grupoIndexStr, fotos] of gruposComFotos) {
          const grupoIndex = parseInt(grupoIndexStr);
          const grupoSalvo = gruposSalvos?.find(g => g.ordem === grupoIndex);
          
          if (!grupoSalvo) {
            console.warn(`Grupo salvo não encontrado para ordem ${grupoIndex}`);
            continue;
          }

          console.log(`Fazendo upload de ${fotos.length} fotos para grupo ${grupoSalvo.id} (ordem ${grupoIndex})`);
          
          // Validação final das fotos antes do upload
          const fotosParaUpload = fotos.filter(foto => {
            const isValid = foto.file instanceof File && foto.file.size > 0 && foto.file.name;
            if (!isValid) {
              console.error('Foto inválida detectada no upload:', {
                hasFile: !!foto.file,
                isFile: foto.file instanceof File,
                size: foto.file?.size,
                name: foto.file?.name
              });
            }
            return isValid;
          });

          console.log(`Fotos válidas para upload no grupo ${grupoIndex}: ${fotosParaUpload.length}/${fotos.length}`);

          if (fotosParaUpload.length > 0) {
            try {
              await uploadFotos(grupoSalvo.id, fotosParaUpload);
              totalFotosUpload += fotosParaUpload.length;
              console.log(`Upload concluído para grupo ${grupoSalvo.id}: ${fotosParaUpload.length} fotos`);
            } catch (uploadError) {
              console.error(`Erro no upload de fotos para grupo ${grupoSalvo.id}:`, uploadError);
              toast({
                title: "Erro no Upload",
                description: `Erro ao enviar fotos do grupo ${grupoIndex + 1}. Algumas fotos podem não ter sido salvas.`,
                variant: "destructive",
              });
            }
          }
        }

        if (totalFotosUpload > 0) {
          toast({
            title: "Sucesso Completo",
            description: `Vistoria ${formData.numero_interno} salva com ${totalFotosUpload} foto(s).`,
          });
        } else {
          toast({
            title: "Vistoria Salva",
            description: `Vistoria ${formData.numero_interno} salva, mas nenhuma foto foi processada.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Vistoria Salva",
          description: `Vistoria ${formData.numero_interno} salva sem fotos.`,
        });
      }

      // Limpar formulário
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
