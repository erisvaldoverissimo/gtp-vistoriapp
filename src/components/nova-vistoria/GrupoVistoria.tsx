
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { GrupoVistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import UploadFotos from '@/components/UploadFotos';

interface GrupoVistoriaProps {
  grupo: GrupoVistoriaSupabase;
  index: number;
  ambientesDisponiveis: string[];
  gruposDisponiveis: string[];
  statusOptions: string[];
  canRemove: boolean;
  isEditing?: boolean;
  onGrupoChange: (index: number, field: keyof GrupoVistoriaSupabase, value: string) => void;
  onRemoverGrupo: (index: number) => void;
  onFotosChange: (index: number, fotos: File[], fotosComDescricao?: Array<{file: File, descricao: string}>) => void;
  onFotosExistentesChange?: () => void;
}

const GrupoVistoria = ({
  grupo,
  index,
  ambientesDisponiveis,
  gruposDisponiveis,
  statusOptions,
  canRemove,
  isEditing = false,
  onGrupoChange,
  onRemoverGrupo,
  onFotosChange,
  onFotosExistentesChange
}: GrupoVistoriaProps) => {
  return (
    <Card className="border-l-4 border-l-teal-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Grupo de Vistoria {index + 1}
          </CardTitle>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoverGrupo(index)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ambiente */}
        <div className="space-y-2">
          <Label htmlFor={`ambiente-${index}`}>Ambiente</Label>
          <Select 
            value={grupo.ambiente} 
            onValueChange={(value) => onGrupoChange(index, 'ambiente', value)}
          >
            <SelectTrigger id={`ambiente-${index}`}>
              <SelectValue placeholder="Selecione o ambiente" />
            </SelectTrigger>
            <SelectContent>
              {ambientesDisponiveis.map((ambiente) => (
                <SelectItem key={ambiente} value={ambiente}>
                  {ambiente}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grupo */}
        <div className="space-y-2">
          <Label htmlFor={`grupo-${index}`}>Grupo</Label>
          <Select 
            value={grupo.grupo} 
            onValueChange={(value) => onGrupoChange(index, 'grupo', value)}
          >
            <SelectTrigger id={`grupo-${index}`}>
              <SelectValue placeholder="Selecione o grupo" />
            </SelectTrigger>
            <SelectContent>
              {gruposDisponiveis.map((grupoItem) => (
                <SelectItem key={grupoItem} value={grupoItem}>
                  {grupoItem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Item */}
        <div className="space-y-2">
          <Label htmlFor={`item-${index}`}>Item</Label>
          <Textarea
            id={`item-${index}`}
            value={grupo.item}
            onChange={(e) => onGrupoChange(index, 'item', e.target.value)}
            placeholder="Descreva o item a ser vistoriado..."
            className="min-h-[80px]"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor={`status-${index}`}>Status</Label>
          <Select 
            value={grupo.status} 
            onValueChange={(value) => onGrupoChange(index, 'status', value)}
          >
            <SelectTrigger id={`status-${index}`}>
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

        {/* Parecer */}
        <div className="space-y-2">
          <Label htmlFor={`parecer-${index}`}>Parecer Técnico</Label>
          <Textarea
            id={`parecer-${index}`}
            value={grupo.parecer || ''}
            onChange={(e) => onGrupoChange(index, 'parecer', e.target.value)}
            placeholder="Parecer técnico sobre o item vistoriado..."
            className="min-h-[100px]"
            maxLength={200}
          />
          <p className="text-xs text-gray-500">
            {(grupo.parecer || '').length}/200 caracteres
          </p>
        </div>

        {/* Upload de Fotos */}
        <div className="space-y-2">
          <Label>Fotos do Grupo</Label>
          <UploadFotos
            onFotosChange={(fotos, fotosComDescricao) => onFotosChange(index, fotos, fotosComDescricao)}
            maxFotos={10}
            grupoId={grupo.id}
            fotosExistentes={grupo.fotos || []}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GrupoVistoria;
