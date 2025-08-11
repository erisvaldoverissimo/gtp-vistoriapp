import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Trash2, Calendar, Building, User } from 'lucide-react';
import { useVistoriasSupabase } from '@/hooks/useVistoriasSupabase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import DetalhesVistoria from './visualizar-vistoria/DetalhesVistoria';
import EditarVistoriaSupabase from './EditarVistoriaSupabase';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';

interface ListaVistoriasSupabaseProps {
  onNovaVistoria: () => void;
}

const ListaVistoriasSupabase = ({ onNovaVistoria }: ListaVistoriasSupabaseProps) => {
  const { vistorias, loading, excluirVistoria } = useVistoriasSupabase();
  const [filtro, setFiltro] = useState('');
  const [vistoriaSelecionada, setVistoriaSelecionada] = useState<string | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const { isSindico } = useCurrentProfile();

  const vistoriasFiltradas = vistorias.filter(vistoria =>
    vistoria.numero_interno.toLowerCase().includes(filtro.toLowerCase()) ||
    vistoria.condominio?.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    vistoria.responsavel.toLowerCase().includes(filtro.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Conforme':
        return 'bg-green-100 text-green-800';
      case 'Não Conforme':
        return 'bg-red-100 text-red-800';
      case 'Requer Atenção':
        return 'bg-yellow-100 text-yellow-800';
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExcluir = async (id: string) => {
    await excluirVistoria(id);
  };

  const handleVerDetalhes = (vistoriaId: string) => {
    setVistoriaSelecionada(vistoriaId);
    setModoEdicao(false);
  };

  const handleEditar = (vistoriaId: string) => {
    setVistoriaSelecionada(vistoriaId);
    setModoEdicao(true);
  };

  const handleVoltar = () => {
    setVistoriaSelecionada(null);
    setModoEdicao(false);
  };

  if (vistoriaSelecionada) {
    const vistoria = vistorias.find(v => v.id === vistoriaSelecionada);
    
    if (!vistoria) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Vistoria não encontrada.</p>
          <Button onClick={handleVoltar} className="mt-4">
            Voltar à Lista
          </Button>
        </div>
      );
    }

    if (modoEdicao) {
      return (
        <EditarVistoriaSupabase 
          vistoriaId={vistoriaSelecionada}
          onBack={handleVoltar}
        />
      );
    }

    return (
      isSindico ? (
        <DetalhesVistoria 
          vistoria={vistoria} 
          onBack={handleVoltar}
        />
      ) : (
        <DetalhesVistoria 
          vistoria={vistoria} 
          onBack={handleVoltar}
          onEdit={handleEditar}
        />
      )
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando vistorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vistorias</h2>
        {!isSindico && (
          <Button onClick={onNovaVistoria} className="bg-teal-600 hover:bg-teal-700">
            <Plus size={18} className="mr-2" />
            Nova Vistoria
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Buscar por número, condomínio ou responsável..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {vistoriasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building size={48} className="mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {vistorias.length === 0 ? 'Nenhuma vistoria encontrada' : 'Nenhuma vistoria corresponde ao filtro'}
          </h3>
          <p className="text-gray-500 mb-6">
            {vistorias.length === 0 
              ? 'Comece criando sua primeira vistoria.' 
              : 'Tente ajustar os filtros de busca.'}
          </p>
          {vistorias.length === 0 && !isSindico && (
            <Button onClick={onNovaVistoria} className="bg-teal-600 hover:bg-teal-700">
              <Plus size={18} className="mr-2" />
              Criar Primeira Vistoria
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {vistoriasFiltradas.map((vistoria) => (
            <Card key={vistoria.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <span>{vistoria.condominio?.nome}</span>
                    <Badge className={getStatusColor(vistoria.status)}>
                      {vistoria.status}
                    </Badge>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerDetalhes(vistoria.id!)}
                    >
                      <Eye size={16} className="mr-1" />
                      Ver
                    </Button>
                    {!isSindico && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 size={16} className="mr-1" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a vistoria #{vistoria.numero_interno}? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleExcluir(vistoria.id!)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-teal-600" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Data</p>
                      <p className="text-gray-900">{formatDate(vistoria.data_vistoria)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="text-teal-600" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Responsável</p>
                      <p className="text-gray-900">{vistoria.responsavel}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="text-teal-600" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nº Interno</p>
                      <p className="text-gray-900">#{vistoria.numero_interno}</p>
                    </div>
                  </div>
                </div>
                
                {vistoria.observacoes_gerais && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Observações:</span> {vistoria.observacoes_gerais}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{vistoria.grupos.length} grupo(s) de vistoria</span>
                  <span>Atualizada em {formatDate(vistoria.updated_at || vistoria.created_at || '')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaVistoriasSupabase;
