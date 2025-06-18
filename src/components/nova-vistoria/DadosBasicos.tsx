
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { CondominioSupabase } from '@/hooks/useCondominiosSupabase';

interface Usuario {
  id: string;
  nome: string;
  cargo?: string;
}

interface DadosBasicosProps {
  condominios: CondominioSupabase[];
  usuariosAtivos: Usuario[];
  formData: {
    condominio_id: string;
    responsavel: string;
    numero_interno: string;
    id_sequencial: number;
    data_vistoria: string;
  };
  onCondominioChange: (condominioId: string) => void;
  onInputChange: (field: string, value: string) => void;
}

const DadosBasicos = ({ 
  condominios, 
  usuariosAtivos, 
  formData, 
  onCondominioChange, 
  onInputChange 
}: DadosBasicosProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar size={20} className="mr-2" />
          Dados Básicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="condominio">Condomínio *</Label>
            {condominios.length === 0 ? (
              <div className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                <p className="text-sm text-orange-700">
                  Nenhum condomínio cadastrado. Acesse a aba "Condomínios" para cadastrar.
                </p>
              </div>
            ) : (
              <Select value={formData.condominio_id} onValueChange={onCondominioChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o condomínio" />
                </SelectTrigger>
                <SelectContent>
                  {condominios.map((condominio) => (
                    <SelectItem key={condominio.id} value={condominio.id}>
                      {condominio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <Label htmlFor="responsavel">Responsável pela Vistoria *</Label>
            {usuariosAtivos.length === 0 ? (
              <div className="p-3 border border-orange-200 bg-orange-50 rounded-md">
                <p className="text-sm text-orange-700">
                  Nenhum usuário ativo cadastrado. Acesse a aba "Usuários" para gerenciar.
                </p>
              </div>
            ) : (
              <Select value={formData.responsavel} onValueChange={(value) => onInputChange('responsavel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {usuariosAtivos.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.nome}>
                      {usuario.nome} {usuario.cargo && `- ${usuario.cargo}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="numeroInterno">Nº Interno</Label>
            <Input
              id="numeroInterno"
              value={formData.numero_interno}
              readOnly
              className="bg-gray-50"
              placeholder="Selecione um condomínio"
            />
          </div>
          <div>
            <Label htmlFor="idSequencial">ID Sequencial</Label>
            <Input
              id="idSequencial"
              value={formData.id_sequencial || ''}
              readOnly
              className="bg-gray-50"
              placeholder="Auto"
            />
          </div>
          <div>
            <Label htmlFor="dataVistoria">Data da Vistoria</Label>
            <Input
              id="dataVistoria"
              type="date"
              value={formData.data_vistoria}
              onChange={(e) => onInputChange('data_vistoria', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DadosBasicos;
