import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Copy, Globe, Lock, Building2 } from 'lucide-react';
import { useTemplatesVistoria, TemplateVistoria } from '@/hooks/useTemplatesVistoria';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface GerenciarTemplatesProps {
  onNovoTemplate?: () => void;
  onEditarTemplate?: (template: TemplateVistoria) => void;
  onUsarTemplate?: (template: TemplateVistoria) => void;
}

const GerenciarTemplates = ({ onNovoTemplate, onEditarTemplate, onUsarTemplate }: GerenciarTemplatesProps) => {
  const { 
    templates, 
    loading, 
    excluirTemplate,
    obterTemplatesPublicos,
    obterTemplatesProprios 
  } = useTemplatesVistoria();
  
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'proprios' | 'publicos'>('todos');

  const templatesFiltrados = templates.filter(template => {
    const matchTexto = template.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                      template.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
                      template.condominio?.nome?.toLowerCase().includes(filtro.toLowerCase());
    
    const matchTipo = filtroTipo === 'todos' || 
                     (filtroTipo === 'proprios' && template.user_id) ||
                     (filtroTipo === 'publicos' && template.is_publico);
    
    return matchTexto && matchTipo;
  });

  const templatesPublicos = obterTemplatesPublicos();
  const templatesProprios = obterTemplatesProprios();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleExcluir = async (id: string) => {
    await excluirTemplate(id);
  };

  const handleDuplicar = (template: TemplateVistoria) => {
    if (onEditarTemplate) {
      // Criar uma cópia do template para edição
      const templateCopia: TemplateVistoria = {
        ...template,
        id: undefined,
        nome: `${template.nome} (Cópia)`,
        is_publico: false, // Cópias são sempre privadas inicialmente
        created_at: undefined,
        updated_at: undefined
      };
      onEditarTemplate(templateCopia);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates de Vistoria</h2>
          <p className="text-gray-600 mt-1">
            Gerencie templates para acelerar a criação de vistorias
          </p>
        </div>
        {onNovoTemplate && (
          <Button onClick={onNovoTemplate} className="bg-brand-purple hover:bg-brand-purple-light">
            <Plus size={18} className="mr-2" />
            Novo Template
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-brand-purple/10 rounded-lg">
                <Building2 className="h-5 w-5 text-brand-purple" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Meus Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templatesProprios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Templates Públicos</p>
                <p className="text-2xl font-bold text-gray-900">{templatesPublicos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Buscar por nome, descrição ou condomínio..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={filtroTipo === 'todos' ? 'default' : 'outline'}
            onClick={() => setFiltroTipo('todos')}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={filtroTipo === 'proprios' ? 'default' : 'outline'}
            onClick={() => setFiltroTipo('proprios')}
            size="sm"
          >
            Meus
          </Button>
          <Button
            variant={filtroTipo === 'publicos' ? 'default' : 'outline'}
            onClick={() => setFiltroTipo('publicos')}
            size="sm"
          >
            Públicos
          </Button>
        </div>
      </div>

      {/* Lista de Templates */}
      {templatesFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building2 size={48} className="mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {templates.length === 0 ? 'Nenhum template encontrado' : 'Nenhum template corresponde ao filtro'}
          </h3>
          <p className="text-gray-500 mb-6">
            {templates.length === 0 
              ? 'Comece criando seu primeiro template.' 
              : 'Tente ajustar os filtros de busca.'}
          </p>
          {templates.length === 0 && onNovoTemplate && (
            <Button onClick={onNovoTemplate} className="bg-brand-purple hover:bg-brand-purple-light">
              <Plus size={18} className="mr-2" />
              Criar Primeiro Template
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {templatesFiltrados.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg">{template.nome}</CardTitle>
                    <div className="flex space-x-2">
                      <Badge variant={template.is_publico ? "default" : "secondary"} className="flex items-center space-x-1">
                        {template.is_publico ? <Globe size={12} /> : <Lock size={12} />}
                        <span>{template.is_publico ? 'Público' : 'Privado'}</span>
                      </Badge>
                      {template.condominio && (
                        <Badge variant="outline">
                          {template.condominio.nome}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {onUsarTemplate && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onUsarTemplate(template)}
                        className="bg-brand-green hover:bg-brand-green-light"
                      >
                        Usar Template
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicar(template)}
                    >
                      <Copy size={16} className="mr-1" />
                      Duplicar
                    </Button>
                    
                    {onEditarTemplate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditarTemplate(template)}
                      >
                        <Edit size={16} className="mr-1" />
                        Editar
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 size={16} className="mr-1" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o template "{template.nome}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleExcluir(template.id!)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {template.descricao && (
                  <p className="text-gray-600 mb-4">{template.descricao}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Grupos:</span>
                    <span className="ml-2 text-gray-600">
                      {template.grupos?.length || 0} grupo(s) de vistoria
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Criado em:</span>
                    <span className="ml-2 text-gray-600">
                      {formatDate(template.created_at)}
                    </span>
                  </div>
                </div>

                {/* Prévia dos grupos */}
                {template.grupos && template.grupos.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Grupos inclusos:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {template.grupos.slice(0, 6).map((grupo, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-2 h-2 bg-brand-purple rounded-full"></span>
                          <span className="text-gray-600 truncate">
                            {grupo.ambiente} → {grupo.grupo} → {grupo.item}
                          </span>
                        </div>
                      ))}
                      {template.grupos.length > 6 && (
                        <div className="text-gray-500 italic">
                          ... e mais {template.grupos.length - 6} grupo(s)
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GerenciarTemplates;