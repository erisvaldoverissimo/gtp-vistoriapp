import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookTemplate, Building, Eye } from 'lucide-react';
import { useTemplatesVistoria, TemplateVistoria } from '@/hooks/useTemplatesVistoria';
import { useCondominiosSupabase } from '@/hooks/useCondominiosSupabase';

interface SeletorTemplateProps {
  condominioId?: string;
  onTemplateSelected: (template: TemplateVistoria) => void;
}

const SeletorTemplate = ({ condominioId, onTemplateSelected }: SeletorTemplateProps) => {
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState('');
  const { templates, loading } = useTemplatesVistoria();
  const { condominios } = useCondominiosSupabase();

  // Filtrar templates disponíveis
  const templatesDisponiveis = templates.filter(template => {
    // Mostrar templates públicos e do condomínio específico (se selecionado)
    const podeUsar = template.is_publico || 
                     !template.condominio_id || 
                     (condominioId && template.condominio_id === condominioId);
    
    // Aplicar filtro de busca
    const passaFiltro = !filtro || 
                        template.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                        (template.descricao && template.descricao.toLowerCase().includes(filtro.toLowerCase()));
    
    return podeUsar && passaFiltro;
  });

  const handleSelecionarTemplate = (template: TemplateVistoria) => {
    onTemplateSelected(template);
    setOpen(false);
    setFiltro('');
  };

  const obterNomeCondominio = (condominioId?: string) => {
    if (!condominioId) return null;
    const condominio = condominios.find(c => c.id === condominioId);
    return condominio?.nome || 'Condomínio não encontrado';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <BookTemplate size={16} className="mr-2" />
          Usar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookTemplate size={20} />
            Selecionar Template de Vistoria
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Lista de templates */}
          {!loading && (
            <div className="space-y-3">
              {templatesDisponiveis.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {filtro ? 'Nenhum template encontrado com o filtro aplicado.' : 'Nenhum template disponível.'}
                </div>
              ) : (
                templatesDisponiveis.map((template) => (
                  <div 
                    key={template.id}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleSelecionarTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{template.nome}</h3>
                          <div className="flex gap-1">
                            {template.is_publico && (
                              <Badge variant="secondary" className="text-xs">
                                Público
                              </Badge>
                            )}
                            {template.condominio_id && (
                              <Badge variant="outline" className="text-xs">
                                <Building size={12} className="mr-1" />
                                {obterNomeCondominio(template.condominio_id)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {template.descricao && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {template.descricao}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{template.grupos?.length || 0} grupos</span>
                          {template.created_at && (
                            <span>
                              Criado em {new Date(template.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm">
                        <Eye size={16} className="mr-1" />
                        Usar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeletorTemplate;