
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { GrupoVistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import UploadFotos from '../UploadFotos';

interface GrupoVistoriaProps {
  grupo: GrupoVistoriaSupabase;
  index: number;
  ambientesDisponiveis: string[];
  gruposDisponiveis: string[];
  statusOptions: string[];
  canRemove: boolean;
  onGrupoChange: (index: number, field: keyof GrupoVistoriaSupabase, value: string) => void;
  onRemoverGrupo: (index: number) => void;
  onFotosChange: (grupoIndex: number, fotos: File[], fotosComDescricao?: Array<{file: File, descricao: string}>) => void;
}

const GrupoVistoria = ({
  grupo,
  index,
  ambientesDisponiveis,
  gruposDisponiveis,
  statusOptions,
  canRemove,
  onGrupoChange,
  onRemoverGrupo,
  onFotosChange
}: GrupoVistoriaProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Grupo de Vistoria {index + 1}</CardTitle>
          {canRemove && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemoverGrupo(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} className="mr-2" />
              Remover Grupo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ambiente */}
          <div>
            <Label htmlFor={`ambiente-${index}`}>Ambiente</Label>
            <Select 
              value={grupo.ambiente} 
              onValueChange={(value) => onGrupoChange(index, 'ambiente', value)}
            >
              <SelectTrigger>
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
          <div>
            <Label htmlFor={`grupo-${index}`}>Grupo</Label>
            <Select 
              value={grupo.grupo} 
              onValueChange={(value) => onGrupoChange(index, 'grupo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo" />
              </SelectTrigger>
              <SelectContent>
                {gruposDisponiveis.map((grupoOption) => (
                  <SelectItem key={grupoOption} value={grupoOption}>
                    {grupoOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Item */}
          <div>
            <Label htmlFor={`item-${index}`}>Item</Label>
            <Select 
              value={grupo.item} 
              onValueChange={(value) => onGrupoChange(index, 'item', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fachada">Fachada</SelectItem>
                <SelectItem value="Cobertura">Cobertura</SelectItem>
                <SelectItem value="Estrutura">Estrutura</SelectItem>
                <SelectItem value="Instalações">Instalações</SelectItem>
                <SelectItem value="Pintura">Pintura</SelectItem>
                <SelectItem value="Impermeabilização">Impermeabilização</SelectItem>
                <SelectItem value="Esquadrias">Esquadrias</SelectItem>
                <SelectItem value="Revestimentos">Revestimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor={`status-${index}`}>Status</Label>
            <Select 
              value={grupo.status} 
              onValueChange={(value) => onGrupoChange(index, 'status', value)}
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

        {/* Parecer Técnico */}
        <div>
          <Label htmlFor={`parecer-${index}`}>Parecer Técnico</Label>
          <div className="space-y-2">
            <Textarea
              id={`parecer-${index}`}
              value={grupo.parecer || ''}
              onChange={(e) => onGrupoChange(index, 'parecer', e.target.value)}
              placeholder="Descrição detalhada do estado/condição encontrada..."
              className="min-h-[100px]"
            />
            <div className="flex justify-between items-center">
              <span className={`text-xs ${(grupo.parecer?.length || 0) > 180 ? 'text-red-500' : 'text-gray-500'}`}>
                {grupo.parecer?.length || 0}/200 caracteres
              </span>
            </div>
          </div>
        </div>

        {/* Upload de Fotos */}
        <div>
          <Label>Fotos do Grupo</Label>
          <UploadFotos
            onFotosChange={(fotos, fotosComDescricao) => onFotosChange(index, fotos, fotosComDescricao)}
            maxFotos={10}
            grupoId={`grupo-${index}`}
            fotosExistentes={grupo.fotos || []}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GrupoVistoria;
