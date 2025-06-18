
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, Download, ZoomIn } from 'lucide-react';
import { FotoVistoriaSupabase } from '@/hooks/useVistoriasSupabase';

interface FotosVistoriaProps {
  fotos: FotoVistoriaSupabase[];
  grupoNome?: string;
}

const FotosVistoria = ({ fotos, grupoNome }: FotosVistoriaProps) => {
  const [selectedFoto, setSelectedFoto] = useState<FotoVistoriaSupabase | null>(null);

  if (!fotos || fotos.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p>Nenhuma foto disponível para este grupo</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (foto: FotoVistoriaSupabase) => {
    try {
      const response = await fetch(foto.arquivo_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = foto.arquivo_nome;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao baixar foto:', error);
    }
  };

  return (
    <div className="space-y-4">
      {grupoNome && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Fotos - {grupoNome}</h4>
          <Badge variant="outline">{fotos.length} foto(s)</Badge>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {fotos.map((foto) => (
          <Card key={foto.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-square">
                <img
                  src={foto.arquivo_url}
                  alt={foto.descricao || foto.arquivo_nome}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedFoto(foto)}
                        >
                          <ZoomIn size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-full">
                        <DialogHeader>
                          <DialogTitle>{foto.arquivo_nome}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <img
                            src={foto.arquivo_url}
                            alt={foto.descricao || foto.arquivo_nome}
                            className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                          />
                          {foto.descricao && (
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm text-gray-700">
                                <strong>Descrição:</strong> {foto.descricao}
                              </p>
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Tamanho: {foto.tamanho_bytes ? formatFileSize(foto.tamanho_bytes) : 'N/A'}</span>
                            <span>Tipo: {foto.tipo_mime || 'N/A'}</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(foto)}
                    >
                      <Download size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              {foto.descricao && (
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate" title={foto.descricao}>
                    {foto.descricao}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FotosVistoria;
