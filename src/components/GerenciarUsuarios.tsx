
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, Shield, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Usuario, useUsuarios } from '@/hooks/useUsuarios';

const GerenciarUsuarios = () => {
  const { toast } = useToast();
  const { usuarios, adicionarUsuario, atualizarUsuario, removerUsuario } = useUsuarios();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState<Omit<Usuario, 'id'>>({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    ativo: true,
    role: 'sindico'
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cargo: '',
      ativo: true,
      role: 'sindico'
    });
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do usuário.",
        variant: "destructive",
      });
      return;
    }

    if (editandoId) {
      atualizarUsuario(editandoId, formData);
      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram atualizados com sucesso.",
      });
    } else {
      adicionarUsuario(formData);
      toast({
        title: "Usuário cadastrado",
        description: "Usuário cadastrado com sucesso.",
      });
    }
    
    resetForm();
  };

  const handleEdit = (usuario: Usuario) => {
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      cargo: usuario.cargo,
      ativo: usuario.ativo,
      role: usuario.role
    });
    setEditandoId(usuario.id);
    setMostrarFormulario(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      removerUsuario(id);
      toast({
        title: "Usuário excluído",
        description: "Usuário removido com sucesso.",
      });
    }
  };

  const handleInputChange = (field: keyof Omit<Usuario, 'id'>, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users size={24} className="mr-2" />
          Gerenciar Usuários
        </h2>
        <Button 
          onClick={() => setMostrarFormulario(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus size={18} className="mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Formulário de cadastro/edição */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editandoId ? 'Editar Usuário' : 'Novo Usuário'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Nome do vistoriador"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                    placeholder="Ex: Engenheiro Civil"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Perfil de Acesso</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'admin' | 'sindico') => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sindico">
                        <div className="flex items-center">
                          <User size={16} className="mr-2" />
                          Síndico
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield size={16} className="mr-2" />
                          Administrador
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => handleInputChange('ativo', checked)}
                />
                <Label htmlFor="ativo">Usuário ativo</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  {editandoId ? 'Atualizar' : 'Cadastrar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Cadastrados ({usuarios.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhum usuário cadastrado ainda.</p>
              <p className="text-sm text-gray-500">Clique em "Novo Usuário" para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left">Nome</th>
                    <th className="border border-gray-300 p-3 text-left">Email</th>
                    <th className="border border-gray-300 p-3 text-left">Telefone</th>
                    <th className="border border-gray-300 p-3 text-left">Cargo</th>
                    <th className="border border-gray-300 p-3 text-center">Perfil</th>
                    <th className="border border-gray-300 p-3 text-center">Status</th>
                    <th className="border border-gray-300 p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">{usuario.nome}</td>
                      <td className="border border-gray-300 p-3">{usuario.email}</td>
                      <td className="border border-gray-300 p-3">{usuario.telefone}</td>
                      <td className="border border-gray-300 p-3">{usuario.cargo}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                          usuario.role === 'admin' 
                            ? 'bg-purple-200 text-purple-800' 
                            : 'bg-blue-200 text-blue-800'
                        }`}>
                          {usuario.role === 'admin' ? (
                            <>
                              <Shield size={12} className="mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <User size={12} className="mr-1" />
                              Síndico
                            </>
                          )}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          usuario.ativo 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-red-200 text-red-800'
                        }`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex justify-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(usuario)}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(usuario.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciarUsuarios;
