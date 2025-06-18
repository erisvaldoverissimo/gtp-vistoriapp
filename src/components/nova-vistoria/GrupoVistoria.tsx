
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { GrupoVistoriaSupabase } from '@/hooks/useVistoriasSupabase';
import UploadFotos from '@/components/UploadFotos';

interface Ambiente {
  id: string;
  nome: string;
}

interface Grupo {
  id: string;
  nome: string;
}

interface GrupoVistoriaProps {
  grupo: GrupoVistoriaSupabase;
  index: number;
  ambientesDisponiveis: Ambiente[];
  gruposDisponiveis: Grupo[];
  statusOptions: string[];
  canRemove: boolean;
  onGrupoChange: (grupoIndex: number, field: keyof GrupoVistoriaSupabase, value: string) => void;
  onRemoverGrupo: (grupoIndex: number) => void;
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
            >
              <Trash2 size={16} className="mr-1" />
              Remover
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              onValueChange={(value) => onGrupoChange(index, 'grupo', value)}
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
              onChange={(e) => onGrupoChange(index, 'item', e.target.value)}
              placeholder="Ex: 15.0 Sistema de automação..."
            />
          </div>

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

        <div>
          <Label htmlFor={`parecer-${index}`}>Parecer Técnico</Label>
          <div className="space-y-2">
            <Textarea
              id={`parecer-${index}`}
              value={grupo.parecer}
              onChange={(e) => onGrupoChange(index, 'parecer', e.target.value)}
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

        <div>
          <Label>Fotos do Grupo {index + 1}</Label>
          <UploadFotos
            onFotosChange={(fotos, fotosComDescricao) => onFotosChange(index, fotos, fotosComDescricao)}
            maxFotos={10}
            grupoId={`grupo-${index}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GrupoVistoria;
