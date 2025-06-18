
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Save, Edit, X } from 'lucide-react';
import { FotoVistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import { useFotosSupabase } from '@/hooks/useFotosSupabase';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FotosVistoriaEditavelProps {
  fotos: FotoVistoriaSupabase[];
  grupoNome: string;
  onFotosChange?: () => void;
}

const FotosVistoriaEditavel = ({ fotos, grupoNome, onFotosChange }: FotosVistoriaEditavelProps) => {
  const [editandoDescricoes, setEditandoDescricoes] = useState<{ [key: string]: string }>({});
  const [salvandoDescricao, setSalvandoDescricao] = useState<string | null>(null);
  const { removerFoto } = useFotosSupabase();
  const { toast } = useToast();

  if (!fotos || fotos.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        Nenhuma foto anexada para {grupoNome}
      </div>
    );
  }

  const iniciarEdicaoDescricao = (fotoId: string, descricaoAtual: string) => {
    setEditandoDescricoes(prev => ({
      ...prev,
      [fotoId]: descricaoAtual || ''
    }));
  };

  const cancelarEdicaoDescricao = (fotoId: string) => {
    setEditandoDescricoes(prev => {
      const novo = { ...prev };
      delete novo[fotoId];
      return novo;
    });
  };

  const salvarDescricaoFoto = async (fotoId: string) => {
    const novaDescricao = editandoDescricoes[fotoId];
    
    setSalvandoDescricao(fotoId);
    try {
      const { error } = await supabase
        .from('fotos_vistoria')
        .update({ descricao: novaDescricao })
        .eq('id', fotoId);

      if (error) {
        throw error;
      }

      // Remover da lista de edição
      setEditandoDescricoes(prev => {
        const novo = { ...prev };
        delete novo[fotoId];
        return novo;
      });

      toast({
        title: "Sucesso",
        description: "Descrição da foto atualizada com sucesso.",
      });

      // Notificar componente pai sobre a mudança
      if (onFotosChange) {
        onFotosChange();
      }
    } catch (error) {
      console.error('Erro ao salvar descrição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a descrição da foto.",
        variant: "destructive",
      });
    } finally {
      setSalvandoDescricao(null);
    }
  };

  const handleRemoverFoto = async (foto: FotoVistoriaSupabase) => {
    if (!foto.id) return;
    
    try {
      await removerFoto(foto.id, foto.arquivo_url);
      if (onFotosChange) {
        onFotosChange();
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fotos.map((foto) => (
          <Card key={foto.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <img
                src={foto.arquivo_url}
                alt={foto.descricao || foto.arquivo_nome}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-3 space-y-2">
              <div className="text-xs text-gray-500">
                {foto.arquivo_nome}
              </div>
              
              {editandoDescricoes[foto.id!] !== undefined ? (
                <div className="space-y-2">
                  <Label className="text-xs">Descrição:</Label>
                  <Input
                    value={editandoDescricoes[foto.id!]}
                    onChange={(e) => setEditandoDescricoes(prev => ({
                      ...prev,
                      [foto.id!]: e.target.value
                    }))}
                    placeholder="Descrição da foto..."
                    className="text-xs"
                  />
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => salvarDescricaoFoto(foto.id!)}
                      disabled={salvandoDescricao === foto.id}
                      className="text-xs h-7"
                    >
                      <Save size={12} className="mr-1" />
                      {salvandoDescricao === foto.id ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelarEdicaoDescricao(foto.id!)}
                      disabled={salvandoDescricao === foto.id}
                      className="text-xs h-7"
                    >
                      <X size={12} className="mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-gray-700">
                    <span className="font-medium">Descrição:</span>
                    <div className="mt-1">
                      {foto.descricao || 'Sem descrição'}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => iniciarEdicaoDescricao(foto.id!, foto.descricao || '')}
                      className="text-xs h-7"
                    >
                      <Edit size={12} className="mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoverFoto(foto)}
                      className="text-xs h-7 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={12} className="mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FotosVistoriaEditavel;
