import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useBaseConhecimento, BaseConhecimento } from '@/hooks/useBaseConhecimento';
import { Upload, BookOpen, Plus, Trash2, Edit, FileText, Settings, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GerenciarBaseConhecimento: React.FC = () => {
  const { 
    baseConhecimento, 
    loading, 
    uploading,
    adicionarConhecimento, 
    atualizarConhecimento, 
    removerConhecimento,
    uploadPDF
  } = useBaseConhecimento();

  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editandoItem, setEditandoItem] = useState<BaseConhecimento | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [buscaTexto, setBuscaTexto] = useState<string>('');

  // Formulário
  const [formData, setFormData] = useState({
    titulo: '',
    tipo_documento: '',
    categoria: '',
    conteudo_extraido: '',
    palavras_chave: '',
    arquivo: null as File | null
  });

  const tiposDocumento = [
    { value: 'pdf', label: 'PDF Técnico' },
    { value: 'manual', label: 'Manual' },
    { value: 'norma', label: 'Norma Técnica' },
    { value: 'especificacao', label: 'Especificação' },
    { value: 'checklist', label: 'Lista de Verificação' },
    { value: 'procedimento', label: 'Procedimento' }
  ];

  const categorias = [
    { value: 'estrutural', label: 'Estrutural' },
    { value: 'instalacoes', label: 'Instalações' },
    { value: 'acabamentos', label: 'Acabamentos' },
    { value: 'seguranca', label: 'Segurança' },
    { value: 'conservacao', label: 'Conservação' },
    { value: 'manutencao', label: 'Manutenção' },
    { value: 'normas', label: 'Normas e Regulamentos' },
    { value: 'geral', label: 'Geral' }
  ];

  // Extração simples de texto de PDF (aqui você poderia usar uma biblioteca mais robusta)
  const extrairTextoPDF = async (arquivo: File): Promise<string> => {
    // Por simplicidade, retornaremos uma mensagem indicando que o texto foi extraído
    // Em uma implementação real, você usaria uma biblioteca como pdf-parse
    return `Conteúdo extraído do arquivo: ${arquivo.name}\n\nEste texto seria extraído automaticamente do PDF usando bibliotecas especializadas.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.conteudo_extraido) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    let arquivoUrl = '';
    if (formData.arquivo) {
      const url = await uploadPDF(formData.arquivo);
      if (!url) return;
      arquivoUrl = url;
    }

    const dadosConhecimento = {
      titulo: formData.titulo,
      tipo_documento: formData.tipo_documento,
      categoria: formData.categoria,
      conteudo_extraido: formData.conteudo_extraido,
      palavras_chave: formData.palavras_chave.split(',').map(p => p.trim()).filter(p => p),
      arquivo_url: arquivoUrl,
      tamanho_bytes: formData.arquivo?.size
    };

    let sucesso = false;

    if (editandoItem) {
      sucesso = await atualizarConhecimento(editandoItem.id, dadosConhecimento);
    } else {
      const resultado = await adicionarConhecimento(dadosConhecimento);
      sucesso = !!resultado;
    }

    if (sucesso) {
      setIsDialogOpen(false);
      setEditandoItem(null);
      setFormData({
        titulo: '',
        tipo_documento: '',
        categoria: '',
        conteudo_extraido: '',
        palavras_chave: '',
        arquivo: null
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, arquivo: file }));
      
      // Tentar extrair texto automaticamente
      try {
        const textoExtraido = await extrairTextoPDF(file);
        setFormData(prev => ({
          ...prev,
          conteudo_extraido: textoExtraido,
          titulo: prev.titulo || file.name.replace('.pdf', '')
        }));
      } catch (error) {
        console.error('Erro ao extrair texto do PDF:', error);
      }
    }
  };

  const handleEdit = (item: BaseConhecimento) => {
    setEditandoItem(item);
    setFormData({
      titulo: item.titulo,
      tipo_documento: item.tipo_documento,
      categoria: item.categoria || '',
      conteudo_extraido: item.conteudo_extraido,
      palavras_chave: item.palavras_chave.join(', '),
      arquivo: null
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await removerConhecimento(id);
  };

  // Filtrar itens
  const itensFiltrados = baseConhecimento.filter(item => {
    const matchCategoria = !filtroCategoria || item.categoria === filtroCategoria;
    const matchTipo = !filtroTipo || item.tipo_documento === filtroTipo;
    const matchTexto = !buscaTexto || 
      item.titulo.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      item.conteudo_extraido.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      item.palavras_chave.some(p => p.toLowerCase().includes(buscaTexto.toLowerCase()));
    
    return matchCategoria && matchTipo && matchTexto;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Base de Conhecimento Técnico
          </CardTitle>
          <CardDescription>
            Gerencie materiais técnicos em PDF para enriquecer as análises da IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título, conteúdo ou palavras-chave..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {tiposDocumento.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditandoItem(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editandoItem ? 'Editar' : 'Adicionar'} Conhecimento Técnico
                  </DialogTitle>
                  <DialogDescription>
                    {editandoItem ? 'Edite as informações' : 'Adicione um novo material'} da base de conhecimento
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Título *</label>
                      <Input
                        value={formData.titulo}
                        onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                        placeholder="Nome do documento"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipo de Documento *</label>
                      <Select 
                        value={formData.tipo_documento} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_documento: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposDocumento.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Categoria</label>
                    <Select 
                      value={formData.categoria} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Arquivo PDF</label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Conteúdo Extraído *</label>
                    <Textarea
                      value={formData.conteudo_extraido}
                      onChange={(e) => setFormData(prev => ({ ...prev, conteudo_extraido: e.target.value }))}
                      placeholder="Conteúdo técnico que será usado pela IA..."
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Palavras-chave (separadas por vírgula)</label>
                    <Input
                      value={formData.palavras_chave}
                      onChange={(e) => setFormData(prev => ({ ...prev, palavras_chave: e.target.value }))}
                      placeholder="estrutural, concreto, fissura, viga..."
                    />
                  </div>

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? 'Processando...' : editandoItem ? 'Salvar' : 'Adicionar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Separator className="mb-6" />

          {/* Lista de Conhecimentos */}
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : itensFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum conhecimento encontrado</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {itensFiltrados.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          <h3 className="font-medium">{item.titulo}</h3>
                          <Badge variant="secondary">{tiposDocumento.find(t => t.value === item.tipo_documento)?.label}</Badge>
                          {item.categoria && (
                            <Badge variant="outline">{categorias.find(c => c.value === item.categoria)?.label}</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.conteudo_extraido.substring(0, 200)}...
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.palavras_chave.slice(0, 5).map((palavra, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {palavra}
                            </Badge>
                          ))}
                          {item.palavras_chave.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.palavras_chave.length - 5} mais
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs text-gray-500">
                          Adicionado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                          {item.tamanho_bytes && (
                            <span> • {Math.round(item.tamanho_bytes / 1024)} KB</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover "{item.titulo}" da base de conhecimento?
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GerenciarBaseConhecimento;