import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Link, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useCondominios } from '@/hooks/useCondominios';
import { useUsuarioCondominios } from '@/hooks/useUsuarioCondominios';

const GerenciarAssociacoes = () => {
  const { toast } = useToast();
  const { usuarios } = useUsuarios();
  const { condominios } = useCondominios();
  const { associacoes, criarAssociacao, removerAssociacao } = useUsuarioCondominios();
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    condominioId: ''
  });

  // Filtrar apenas síndicos
  const sindicos = usuarios.filter(usuario => usuario.role === 'sindico');

  const resetForm = () => {
    setFormData({ userId: '', condominioId: '' });
    setMostrarFormulario(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.condominioId) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione o usuário e o condomínio.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se a associação já existe
    const associacaoExiste = associacoes.some(
      assoc => assoc.user_id === formData.userId && assoc.condominio_id === formData.condominioId
    );

    if (associacaoExiste) {
      toast({
        title: "Associação já existe",
        description: "Este usuário já está associado a este condomínio.",
        variant: "destructive",
      });
      return;
    }

    await criarAssociacao(formData.userId, formData.condominioId);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta associação?')) {
      await removerAssociacao(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Link size={24} className="mr-2" />
          Associações Usuário-Condomínio
        </h2>
        <Button 
          onClick={() => setMostrarFormulario(true)}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus size={18} className="mr-2" />
          Nova Associação
        </Button>
      </div>

      {/* Formulário de nova associação */}
      {mostrarFormulario && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Associação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usuario">Síndico</Label>
                  <Select
                    value={formData.userId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um síndico" />
                    </SelectTrigger>
                    <SelectContent>
                      {sindicos.map((usuario) => (
                        <SelectItem key={usuario.id} value={usuario.id}>
                          <div className="flex items-center">
                            <User size={16} className="mr-2" />
                            {usuario.nome} ({usuario.email})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="condominio">Condomínio</Label>
                  <Select
                    value={formData.condominioId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, condominioId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um condomínio" />
                    </SelectTrigger>
                    <SelectContent>
                      {condominios.map((condominio) => (
                        <SelectItem key={condominio.id} value={condominio.id}>
                          <div className="flex items-center">
                            <Building size={16} className="mr-2" />
                            {condominio.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  Criar Associação
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de associações */}
      <Card>
        <CardHeader>
          <CardTitle>Associações Ativas ({associacoes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {associacoes.length === 0 ? (
            <div className="text-center py-8">
              <Link size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Nenhuma associação cadastrada ainda.</p>
              <p className="text-sm text-gray-500">Clique em "Nova Associação" para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left">Síndico</th>
                    <th className="border border-gray-300 p-3 text-left">Email</th>
                    <th className="border border-gray-300 p-3 text-left">Condomínio</th>
                    <th className="border border-gray-300 p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {associacoes.map((associacao) => (
                    <tr key={associacao.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-blue-600" />
                          {associacao.usuario?.nome || 'Usuário não encontrado'}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3">
                        {associacao.usuario?.email || '-'}
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex items-center">
                          <Building size={16} className="mr-2 text-green-600" />
                          {associacao.condominio?.nome || 'Condomínio não encontrado'}
                        </div>
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(associacao.id)}
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

export default GerenciarAssociacoes;