
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, MapPin, Tag } from 'lucide-react';
import { useAmbientesGrupos } from '@/hooks/useAmbientesGrupos';
import { useToast } from '@/hooks/use-toast';
import { Condominio } from '@/hooks/useCondominios';
import { useIsMobile } from '@/hooks/use-mobile';

interface GerenciarAmbientesGruposProps {
  condominios: Condominio[];
}

const GerenciarAmbientesGrupos = ({ condominios }: GerenciarAmbientesGruposProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    ambientes,
    grupos,
    adicionarAmbiente,
    adicionarGrupo,
    removerAmbiente,
    removerGrupo
  } = useAmbientesGrupos();

  const [novoAmbiente, setNovoAmbiente] = useState({
    nome: '',
    condominioId: ''
  });

  const [novoGrupo, setNovoGrupo] = useState({
    nome: '',
    condominioId: ''
  });

  const handleAdicionarAmbiente = () => {
    if (!novoAmbiente.nome.trim()) {
      toast({
        title: "Nome Obrigatório",
        description: "Por favor, informe o nome do ambiente.",
        variant: "destructive",
      });
      return;
    }

    adicionarAmbiente(novoAmbiente.nome, novoAmbiente.condominioId || undefined);
    setNovoAmbiente({ nome: '', condominioId: '' });
    
    toast({
      title: "Ambiente Adicionado",
      description: "Ambiente adicionado com sucesso.",
    });
  };

  const handleAdicionarGrupo = () => {
    if (!novoGrupo.nome.trim()) {
      toast({
        title: "Nome Obrigatório",
        description: "Por favor, informe o nome do grupo.",
        variant: "destructive",
      });
      return;
    }

    adicionarGrupo(novoGrupo.nome, novoGrupo.condominioId || undefined);
    setNovoGrupo({ nome: '', condominioId: '' });
    
    toast({
      title: "Grupo Adicionado",
      description: "Grupo adicionado com sucesso.",
    });
  };

  const handleRemoverAmbiente = (id: string) => {
    removerAmbiente(id);
    toast({
      title: "Ambiente Removido",
      description: "Ambiente removido com sucesso.",
    });
  };

  const handleRemoverGrupo = (id: string) => {
    removerGrupo(id);
    toast({
      title: "Grupo Removido",
      description: "Grupo removido com sucesso.",
    });
  };

  const getCondominioNome = (condominioId?: string) => {
    if (!condominioId) return 'Geral';
    const condominio = condominios.find(c => c.id === condominioId);
    return condominio?.nome || 'Desconhecido';
  };

  return (
    <div className={`space-y-4 md:space-y-6 ${isMobile ? 'px-2' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Gerenciar Ambientes e Grupos
        </h2>
      </div>

      {/* Adicionar Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center ${isMobile ? 'text-lg' : ''}`}>
            <MapPin size={isMobile ? 18 : 20} className="mr-2" />
            Adicionar Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            <div className={isMobile ? '' : 'md:col-span-2'}>
              <Label htmlFor="nomeAmbiente">Nome do Ambiente *</Label>
              <Input
                id="nomeAmbiente"
                value={novoAmbiente.nome}
                onChange={(e) => setNovoAmbiente(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: 4º Andar, Garagem, Salão de Festas"
              />
            </div>
            
            <div>
              <Label htmlFor="condominioAmbiente">Condomínio (Opcional)</Label>
              <Select 
                value={novoAmbiente.condominioId} 
                onValueChange={(value) => setNovoAmbiente(prev => ({ ...prev, condominioId: value === 'geral' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Geral para todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral para todos</SelectItem>
                  {condominios.map((condominio) => (
                    <SelectItem key={condominio.id} value={condominio.id}>
                      {condominio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleAdicionarAmbiente} className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto">
            <Plus size={18} className="mr-2" />
            Adicionar Ambiente
          </Button>
        </CardContent>
      </Card>

      {/* Adicionar Grupo */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center ${isMobile ? 'text-lg' : ''}`}>
            <Tag size={isMobile ? 18 : 20} className="mr-2" />
            Adicionar Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            <div className={isMobile ? '' : 'md:col-span-2'}>
              <Label htmlFor="nomeGrupo">Nome do Grupo *</Label>
              <Input
                id="nomeGrupo"
                value={novoGrupo.nome}
                onChange={(e) => setNovoGrupo(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Sistema de Segurança, Paisagismo"
              />
            </div>
            
            <div>
              <Label htmlFor="condominioGrupo">Condomínio (Opcional)</Label>
              <Select 
                value={novoGrupo.condominioId} 
                onValueChange={(value) => setNovoGrupo(prev => ({ ...prev, condominioId: value === 'geral' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Geral para todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral para todos</SelectItem>
                  {condominios.map((condominio) => (
                    <SelectItem key={condominio.id} value={condominio.id}>
                      {condominio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleAdicionarGrupo} className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto">
            <Plus size={18} className="mr-2" />
            Adicionar Grupo
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Ambientes */}
      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? 'text-lg' : ''}>
            Ambientes Cadastrados ({ambientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ambientes.map((ambiente) => (
              <div key={ambiente.id} className={`flex items-center justify-between p-3 border rounded-lg ${isMobile ? 'flex-col items-start space-y-2' : ''}`}>
                <div className={isMobile ? 'w-full' : ''}>
                  <span className={`font-medium ${isMobile ? 'block' : ''}`}>{ambiente.nome}</span>
                  <span className={`text-sm text-gray-500 ${isMobile ? 'block' : 'ml-2'}`}>
                    ({getCondominioNome(ambiente.condominioId)})
                  </span>
                </div>
                {!ambiente.id.startsWith('default-') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={isMobile ? 'w-full' : ''}
                    onClick={() => handleRemoverAmbiente(ambiente.id)}
                  >
                    <Trash2 size={16} className={isMobile ? 'mr-2' : ''} />
                    {isMobile && 'Remover'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Grupos */}
      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? 'text-lg' : ''}>
            Grupos Cadastrados ({grupos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {grupos.map((grupo) => (
              <div key={grupo.id} className={`flex items-center justify-between p-3 border rounded-lg ${isMobile ? 'flex-col items-start space-y-2' : ''}`}>
                <div className={isMobile ? 'w-full' : ''}>
                  <span className={`font-medium ${isMobile ? 'block' : ''}`}>{grupo.nome}</span>
                  <span className={`text-sm text-gray-500 ${isMobile ? 'block' : 'ml-2'}`}>
                    ({getCondominioNome(grupo.condominioId)})
                  </span>
                </div>
                {!grupo.id.startsWith('default-') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={isMobile ? 'w-full' : ''}
                    onClick={() => handleRemoverGrupo(grupo.id)}
                  >
                    <Trash2 size={16} className={isMobile ? 'mr-2' : ''} />
                    {isMobile && 'Remover'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciarAmbientesGrupos;
