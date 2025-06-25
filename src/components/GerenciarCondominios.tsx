
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Building, Save, X } from 'lucide-react';
import { useCondominiosSupabase, CondominioSupabase } from '@/hooks/useCondominiosSupabase';

interface GerenciarCondominiosProps {
  condominios: CondominioSupabase[];
  onCondominiosChange: (condominios: CondominioSupabase[]) => void;
}

const GerenciarCondominios = ({ condominios: propCondominios, onCondominiosChange }: GerenciarCondominiosProps) => {
  const { condominios, adicionarCondominio, atualizarCondominio, removerCondominio } = useCondominiosSupabase();
  const [editando, setEditando] = useState<string | null>(null);
  const [dadosEdicao, setDadosEdicao] = useState<Partial<CondominioSupabase>>({});
  const [novoCondominio, setNovoCondominio] = useState({
    nome: '',
    endereco: '',
    cidade: '',
    estado: 'SP',
    cep: '',
    telefone: '',
    email: '',
    responsavel: '',
    telefone_responsavel: ''
  });

  const handleAdicionarCondominio = async () => {
    if (!novoCondominio.nome.trim()) {
      return;
    }

    try {
      await adicionarCondominio(novoCondominio);
      setNovoCondominio({ 
        nome: '', 
        endereco: '', 
        cidade: '', 
        estado: 'SP', 
        cep: '', 
        telefone: '', 
        email: '',
        responsavel: '',
        telefone_responsavel: ''
      });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleRemoverCondominio = async (id: string) => {
    await removerCondominio(id);
  };

  const iniciarEdicao = (condominio: CondominioSupabase) => {
    setEditando(condominio.id);
    setDadosEdicao({
      nome: condominio.nome,
      endereco: condominio.endereco,
      cidade: condominio.cidade,
      estado: condominio.estado,
      cep: condominio.cep,
      telefone: condominio.telefone,
      email: condominio.email,
      responsavel: condominio.responsavel || '',
      telefone_responsavel: condominio.telefone_responsavel || ''
    });
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setDadosEdicao({});
  };

  const salvarEdicao = async () => {
    if (!editando || !dadosEdicao.nome?.trim()) {
      return;
    }

    try {
      await atualizarCondominio(editando, dadosEdicao);
      setEditando(null);
      setDadosEdicao({});
    } catch (error) {
      // Erro já tratado no hook
    }
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
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={novoCondominio.cidade}
                onChange={(e) => setNovoCondominio(prev => ({ ...prev, cidade: e.target.value }))}
                placeholder="São Paulo"
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

            <div>
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={novoCondominio.responsavel}
                onChange={(e) => setNovoCondominio(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome do responsável"
              />
            </div>

            <div>
              <Label htmlFor="telefone_responsavel">Telefone do Responsável</Label>
              <Input
                id="telefone_responsavel"
                value={novoCondominio.telefone_responsavel}
                onChange={(e) => setNovoCondominio(prev => ({ ...prev, telefone_responsavel: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          
          <Button onClick={handleAdicionarCondominio} className="bg-teal-600 hover:bg-teal-700">
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
                {editando === condominio.id ? (
                  // Modo de edição
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-nome-${condominio.id}`}>Nome do Condomínio *</Label>
                        <Input
                          id={`edit-nome-${condominio.id}`}
                          value={dadosEdicao.nome || ''}
                          onChange={(e) => setDadosEdicao(prev => ({ ...prev, nome: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`edit-endereco-${condominio.id}`}>Endereço</Label>
                        <Input
                          id={`edit-endereco-${condominio.id}`}
                          value={dadosEdicao.endereco || ''}
                          onChange={(e) => setDadosEdicao(prev => ({ ...prev, endereco: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`edit-cidade-${condominio.id}`}>Cidade</Label>
                        <Input
                          id={`edit-cidade-${condominio.id}`}
                          value={dadosEdicao.cidade || ''}
                          onChange={(e) => setDadosEdicao(prev => ({ ...prev, cidade: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`edit-telefone-${condominio.id}`}>Telefone</Label>
                        <Input
                          id={`edit-telefone-${condominio.id}`}
                          value={dadosEdicao.telefone || ''}
                          onChange={(e) => setDadosEdicao(prev => ({ ...prev, telefone: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`edit-responsavel-${condominio.id}`}>Responsável</Label>
                        <Input
                          id={`edit-responsavel-${condominio.id}`}
                          value={dadosEdicao.responsavel || ''}
                          onChange={(e) => setDadosEdicao(prev => ({ ...prev, responsavel: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`edit-telefone-responsavel-${condominio.id}`}>Telefone do Responsável</Label>
                        <Input
                          id={`edit-telefone-responsavel-${condominio.id}`}
                          value={dadosEdicao.telefone_responsavel || ''}
                          onChange={(e) => setDadosEdicao(prev => ({ ...prev, telefone_responsavel: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button onClick={salvarEdicao} className="bg-teal-600 hover:bg-teal-700">
                        <Save size={16} className="mr-2" />
                        Salvar
                      </Button>
                      <Button onClick={cancelarEdicao} variant="outline">
                        <X size={16} className="mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Modo de visualização
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
                        {condominio.cidade && (
                          <div>
                            <span className="font-medium">Cidade:</span> {condominio.cidade}
                          </div>
                        )}
                        {condominio.telefone && (
                          <div>
                            <span className="font-medium">Telefone:</span> {condominio.telefone}
                          </div>
                        )}
                        {condominio.responsavel && (
                          <div>
                            <span className="font-medium">Responsável:</span> {condominio.responsavel}
                          </div>
                        )}
                        {condominio.telefone_responsavel && (
                          <div>
                            <span className="font-medium">Tel. Responsável:</span> {condominio.telefone_responsavel}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => iniciarEdicao(condominio)}
                      >
                        <Edit size={16} className="mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoverCondominio(condominio.id)}
                      >
                        <Trash2 size={16} className="mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default GerenciarCondominios;
