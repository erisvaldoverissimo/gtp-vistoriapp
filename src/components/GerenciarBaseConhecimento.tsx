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
import { Upload, BookOpen, Plus, Trash2, Edit, FileText, Settings, Search, Brain, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GerenciarBaseConhecimento: React.FC = () => {
  const { 
    baseConhecimento, 
    loading, 
    uploading,
    adicionarConhecimento, 
    atualizarConhecimento, 
    removerConhecimento,
    uploadPDF,
    extrairConteudoPDF
  } = useBaseConhecimento();

  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editandoItem, setEditandoItem] = useState<BaseConhecimento | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [buscaTexto, setBuscaTexto] = useState<string>('');
  const [processandoPDF, setProcessandoPDF] = useState(false);
  const [multiplosArquivos, setMultiplosArquivos] = useState<File[]>([]);

  // Formulário
  const [formData, setFormData] = useState({
    titulo: '',
    tipo_documento: '',
    categoria: '',
    conteudo_extraido: '',
    palavras_chave: '',
    arquivo: null as File | null,
    resumo: '',
    topicos_principais: '',
    normas_referencias: ''
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

  // Extração inteligente de conteúdo do PDF
  const processarPDFComIA = async (arquivo: File): Promise<void> => {
    setProcessandoPDF(true);
    
    try {
      // 1. Upload do arquivo
      const arquivoUrl = await uploadPDF(arquivo);
      if (!arquivoUrl) {
        throw new Error('Falha no upload');
      }

      // 2. Extração inteligente do conteúdo
      const dadosExtraidos = await extrairConteudoPDF(
        arquivoUrl,
        formData.titulo || arquivo.name.replace('.pdf', ''),
        formData.categoria,
        formData.tipo_documento
      );

      if (dadosExtraidos) {
        // 3. Atualizar formulário com dados extraídos
        setFormData(prev => ({
          ...prev,
          titulo: prev.titulo || arquivo.name.replace('.pdf', ''),
          conteudo_extraido: dadosExtraidos.conteudo_extraido || '',
          palavras_chave: (dadosExtraidos.palavras_chave || []).join(', '),
          resumo: dadosExtraidos.resumo || '',
          topicos_principais: (dadosExtraidos.topicos_principais || []).join(', '),
          normas_referencias: (dadosExtraidos.normas_referencias || []).join(', ')
        }));

        toast({
          title: "Extração Concluída",
          description: "Conteúdo extraído automaticamente! Revise as informações antes de salvar.",
        });
      }
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro no Processamento",
        description: "Falha na extração automática. Você pode preencher manualmente.",
        variant: "destructive"
      });
    } finally {
      setProcessandoPDF(false);
    }
  };

  // Processamento em lote de múltiplos PDFs
  const processarMultiplosArquivos = async (): Promise<void> => {
    if (multiplosArquivos.length === 0) return;

    setProcessandoPDF(true);
    
    for (const arquivo of multiplosArquivos) {
      try {
        const arquivoUrl = await uploadPDF(arquivo);
        if (!arquivoUrl) continue;

        const dadosExtraidos = await extrairConteudoPDF(
          arquivoUrl,
          arquivo.name.replace('.pdf', ''),
          'geral',
          'pdf'
        );

        if (dadosExtraidos) {
          await adicionarConhecimento({
            titulo: arquivo.name.replace('.pdf', ''),
            tipo_documento: 'pdf',
            categoria: 'geral',
            conteudo_extraido: dadosExtraidos.conteudo_extraido,
            palavras_chave: dadosExtraidos.palavras_chave || [],
            arquivo_url: arquivoUrl,
            tamanho_bytes: arquivo.size
          });
        }
      } catch (error) {
        console.error(`Erro ao processar ${arquivo.name}:`, error);
      }
    }

    setMultiplosArquivos([]);
    setProcessandoPDF(false);
    
    toast({
      title: "Processamento Concluído",
      description: `${multiplosArquivos.length} arquivos processados!`
    });
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
        arquivo: null,
        resumo: '',
        topicos_principais: '',
        normas_referencias: ''
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, arquivo: file }));
      
      // Processar automaticamente com IA se os campos obrigatórios estiverem preenchidos
      if (formData.tipo_documento) {
        await processarPDFComIA(file);
      } else {
        toast({
          title: "Configuração Necessária",
          description: "Selecione o tipo de documento antes de fazer upload para processamento automático.",
          variant: "destructive"
        });
      }
    }
  };

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    setMultiplosArquivos(pdfFiles);
  };

  const handleEdit = (item: BaseConhecimento) => {
    setEditandoItem(item);
    setFormData({
      titulo: item.titulo,
      tipo_documento: item.tipo_documento,
      categoria: item.categoria || '',
      conteudo_extraido: item.conteudo_extraido,
      palavras_chave: item.palavras_chave.join(', '),
      arquivo: null,
      resumo: '',
      topicos_principais: '',
      normas_referencias: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await removerConhecimento(id);
  };

  // Filtrar itens
  const itensFiltrados = baseConhecimento.filter(item => {
    const matchCategoria = filtroCategoria === 'todas' || item.categoria === filtroCategoria;
    const matchTipo = filtroTipo === 'todos' || item.tipo_documento === filtroTipo;
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
                <SelectItem value="todas">Todas as categorias</SelectItem>
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
                <SelectItem value="todos">Todos os tipos</SelectItem>
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
                      disabled={processandoPDF}
                    />
                    {processandoPDF && (
                      <div className="flex items-center mt-2 text-blue-600">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span className="text-sm">Processando PDF com IA...</span>
                      </div>
                    )}
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

                  {(formData.resumo || formData.topicos_principais || formData.normas_referencias) && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-green-700 mb-3 flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        Dados Extraídos pela IA
                      </h4>
                      
                      {formData.resumo && (
                        <div className="mb-3">
                          <label className="text-sm font-medium text-gray-600">Resumo</label>
                          <p className="text-sm bg-green-50 p-2 rounded">{formData.resumo}</p>
                        </div>
                      )}
                      
                      {formData.topicos_principais && (
                        <div className="mb-3">
                          <label className="text-sm font-medium text-gray-600">Tópicos Principais</label>
                          <p className="text-sm bg-green-50 p-2 rounded">{formData.topicos_principais}</p>
                        </div>
                      )}
                      
                      {formData.normas_referencias && (
                        <div className="mb-3">
                          <label className="text-sm font-medium text-gray-600">Normas/Referências</label>
                          <p className="text-sm bg-green-50 p-2 rounded">{formData.normas_referencias}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={uploading || processandoPDF}>
                      {uploading || processandoPDF ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {processandoPDF ? 'Processando...' : 'Salvando...'}
                        </>
                      ) : (
                        editandoItem ? 'Salvar' : 'Adicionar'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Processamento em Lote */}
          {multiplosArquivos.length > 0 && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">
                      {multiplosArquivos.length} arquivo(s) selecionado(s)
                    </h4>
                    <p className="text-sm text-blue-700">
                      {multiplosArquivos.map(f => f.name).join(', ')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMultiplosArquivos([])}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={processarMultiplosArquivos}
                      disabled={processandoPDF}
                    >
                      {processandoPDF ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Processar com IA
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload em Lote */}
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <h4 className="font-medium mb-2">Processamento em Lote</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Selecione múltiplos PDFs para processamento automático com IA
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleMultipleFiles}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

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