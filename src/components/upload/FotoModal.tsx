
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface FotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  fotoUrl: string;
  fotoNome: string;
  descricao?: string;
}

const FotoModal = ({ isOpen, onClose, fotoUrl, fotoNome, descricao }: FotoModalProps) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fotoUrl;
    link.download = fotoNome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogTitle className="sr-only">Preview da Foto</DialogTitle>
        
        <div className="relative">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 p-4 flex items-center justify-between">
            <h3 className="text-white font-medium truncate mr-4">{fotoNome}</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDownload}
              >
                <Download size={16} className="mr-1" />
                Baixar
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={onClose}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Imagem */}
          <div className="max-h-[80vh] overflow-hidden">
            <img
              src={fotoUrl}
              alt={fotoNome}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Descrição */}
          {descricao && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
              <p className="text-white text-sm">{descricao}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FotoModal;
