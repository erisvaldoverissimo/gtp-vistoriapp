
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Eye, Plus } from 'lucide-react';
import { useCondominiosSupabase } from '@/hooks/useCondominiosSupabase';
import { VistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useAmbientesGrupos } from '@/hooks/useAmbientesGrupos';
import DadosBasicos from './nova-vistoria/DadosBasicos';
import GrupoVistoria from './nova-vistoria/GrupoVistoria';
import ObservacoesGerais from './nova-vistoria/ObservacoesGerais';
import { useNovaVistoriaForm } from './nova-vistoria/useNovaVistoriaForm';

interface NovaVistoriaSupabaseProps {
  onPreview?: (data: VistoriaSupabase) => void;
  onBack?: () => void;
}

const NovaVistoriaSupabase = ({ onPreview, onBack }: NovaVistoriaSupabaseProps) => {
  const { condominios, loading: loadingCondominios } = useCondominiosSupabase();
  const { obterUsuariosAtivos } = useUsuarios();
  const { obterAmbientesPorCondominio, obterGruposPorCondominio } = useAmbientesGrupos();
  const usuariosAtivos = obterUsuariosAtivos();
  
  const {
    formData,
    saving,
    handleInputChange,
    handleCondominioChange,
    handleGrupoChange,
    adicionarGrupo,
    removerGrupo,
    handleFotosChange,
    handleSave,
    handlePreview
  } = useNovaVistoriaForm(onBack);

  // Obter ambientes e grupos baseados no condomínio selecionado
  const ambientesDisponiveis = obterAmbientesPorCondominio(formData.condominio_id);
  const gruposDisponiveis = obterGruposPorCondominio(formData.condominio_id);
  const statusOptions = ['N/A', 'Conforme', 'Não Conforme', 'Requer Atenção'];

  const handlePreviewClick = () => {
    if (handlePreview() && onPreview) {
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
            <Button onClick={handlePreviewClick} variant="outline">
              <Eye size={18} className="mr-2" />
              Visualizar PDF
            </Button>
          )}
        </div>
      </div>

      {/* Dados Básicos */}
      <DadosBasicos
        condominios={condominios}
        usuariosAtivos={usuariosAtivos}
        formData={formData}
        onCondominioChange={handleCondominioChange}
        onInputChange={handleInputChange}
      />

      {/* Grupos de Vistoria */}
      {formData.grupos.map((grupo, index) => (
        <GrupoVistoria
          key={index}
          grupo={grupo}
          index={index}
          ambientesDisponiveis={ambientesDisponiveis}
          gruposDisponiveis={gruposDisponiveis}
          statusOptions={statusOptions}
          canRemove={formData.grupos.length > 1}
          onGrupoChange={handleGrupoChange}
          onRemoverGrupo={removerGrupo}
          onFotosChange={handleFotosChange}
        />
      ))}

      {/* Botão para adicionar novo grupo */}
      <div className="flex justify-center">
        <Button onClick={adicionarGrupo} variant="outline" size="lg">
          <Plus size={18} className="mr-2" />
          Adicionar Novo Grupo de Vistoria
        </Button>
      </div>

      {/* Observações Gerais */}
      <ObservacoesGerais
        observacoes={formData.observacoes_gerais || ''}
        onObservacoesChange={(value) => handleInputChange('observacoes_gerais', value)}
      />
    </div>
  );
};

export default NovaVistoriaSupabase;
