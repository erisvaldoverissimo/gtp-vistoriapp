
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Condominio {
  id: string;
  nome: string;
  endereco: string;
  responsavel: string;
  telefone: string;
  dataCadastro: string;
  proximoNumero: number;
}

interface GerenciarCondominiosProps {
  condominios: Condominio[];
  onCondominiosChange: (condominios: Condominio[]) => void;
}

const GerenciarCondominios = ({ condominios, onCondominiosChange }: GerenciarCondominiosProps) => {
  const { toast } = useToast();
  const [editando, setEditando] = useState<string | null>(null);
  const [novoCondominio, setNovoCondominio] = useState({
    nome: '',
    endereco: '',
    responsavel: '',
    telefone: ''
  });

  const adicionarCondominio = () => {
    if (!novoCondominio.nome.trim()) {
      toast({
        title: "Nome Obrigatório",
        description: "Por favor, informe o nome do condomínio.",
        variant: "destructive",
      });
      return;
    }

    const condominio: Condominio = {
      id: Date.now().toString(),
      nome: novoCondominio.nome,
      endereco: novoCondominio.endereco,
      responsavel: novoCondominio.responsavel,
      telefone: novoCondominio.telefone,
      dataCadastro: new Date().toISOString(),
      proximoNumero: 1
    };

    const novosCondominios = [...condominios, condominio];
    onCondominiosChange(novosCondominios);
    
    setNovoCondominio({ nome: '', endereco: '', responsavel: '', telefone: '' });
    
    toast({
      title: "Condomínio Cadastrado",
      description: "Condomínio adicionado com sucesso.",
    });
  };

  const removerCondominio = (id: string) => {
    const novosCondominios = condominios.filter(c => c.id !== id);
    onCondominiosChange(novosCondominios);
    
    toast({
      title: "Condomínio Removido",
      description: "Condomínio removido com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Condomínios</h2>
      </div>

      {/* Formulário para Novo Condomínio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus size={20} className="mr-2" />
            Cadastrar Novo Condomínio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Condomínio *</Label>
              <Input
                id="nome"
                value={novoCondominio.nome}
                onChange={(e) => setNovoCondominio(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Condomínio Edifício Artur Ramos"
              />
            </div>
            
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={novoCondominio.endereco}
                onChange={(e) => setNovoCondominio(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Endereço completo"
              />
            </div>
            
            <div>
              <Label htmlFor="responsavel">Responsável/Síndico</Label>
              <Input
                id="responsavel"
                value={novoCondominio.responsavel}
                onChange={(e) => setNovoCondominio(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome do responsável"
              />
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={novoCondominio.telefone}
                onChange={(e) => setNovoCondominio(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          
          <Button onClick={adicionarCondominio} className="bg-teal-600 hover:bg-teal-700">
            <Plus size={18} className="mr-2" />
            Cadastrar Condomínio
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Condomínios */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Condomínios Cadastrados ({condominios.length})</h3>
        
        {condominios.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum condomínio cadastrado</h3>
              <p className="text-gray-600">Comece cadastrando um novo condomínio acima.</p>
            </CardContent>
          </Card>
        ) : (
          condominios.map((condominio) => (
            <Card key={condominio.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {condominio.nome}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      {condominio.endereco && (
                        <div>
                          <span className="font-medium">Endereço:</span> {condominio.endereco}
                        </div>
                      )}
                      {condominio.responsavel && (
                        <div>
                          <span className="font-medium">Responsável:</span> {condominio.responsavel}
                        </div>
                      )}
                      {condominio.telefone && (
                        <div>
                          <span className="font-medium">Telefone:</span> {condominio.telefone}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Próximo nº de vistoria:</span> {condominio.proximoNumero}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit size={16} className="mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removerCondominio(condominio.id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default GerenciarCondominios;
