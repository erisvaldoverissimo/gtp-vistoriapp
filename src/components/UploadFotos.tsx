
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FotoData {
  file: File;
  preview: string;
  descricao: string;
}

interface UploadFotosProps {
  onFotosChange: (fotos: File[]) => void;
}

const UploadFotos = ({ onFotosChange }: UploadFotosProps) => {
  const { toast } = useToast();
  const [fotos, setFotos] = useState<FotoData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validar tipos de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Arquivo Inválido",
        description: "Por favor, selecione apenas arquivos de imagem (JPEG, PNG, WebP).",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB por arquivo)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "Arquivo Muito Grande",
        description: "Cada arquivo deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    const newFotos: FotoData[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      descricao: ''
    }));

    const updatedFotos = [...fotos, ...newFotos];
    setFotos(updatedFotos);
    onFotosChange(updatedFotos.map(f => f.file));
    
    toast({
      title: "Fotos Adicionadas",
      description: `${files.length} foto(s) adicionada(s) com sucesso.`,
    });

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFoto = (index: number) => {
    const updatedFotos = fotos.filter((_, i) => i !== index);
    setFotos(updatedFotos);
    onFotosChange(updatedFotos.map(f => f.file));
    
    // Liberar URL do preview
    URL.revokeObjectURL(fotos[index].preview);
  };

  const handleDescricaoChange = (index: number, descricao: string) => {
    const updatedFotos = fotos.map((foto, i) => 
      i === index ? { ...foto, descricao } : foto
    );
    setFotos(updatedFotos);
  };

  const generateAutoDescription = async (index: number) => {
    // Simular geração automática de descrição com IA
    const descriptions = [
      "Vista do acesso ao elevador de serviço",
      "Destaque para os sensores dos elevadores, que apresentam falha no reconhecimento das digitais",
      "Painel de controle interno do elevador",
      "Sistema de automação e controle predial",
      "Detalhes da instalação elétrica"
    ];
    
    const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
    handleDescricaoChange(index, randomDescription);
    
    toast({
      title: "Descrição Gerada",
      description: "Descrição automática gerada pela IA. Você pode editá-la se necessário.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Clique para adicionar fotos
        </p>
        <p className="text-sm text-gray-500">
          Ou arraste e solte arquivos aqui (JPEG, PNG, WebP - máx. 5MB cada)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Lista de Fotos */}
      {fotos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Fotos Adicionadas ({fotos.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fotos.map((foto, index) => (
              <Card key={index} className="p-4">
                <div className="relative">
                  <img
                    src={foto.preview}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveFoto(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
                
                <div className="mt-3 space-y-2">
                  <Label htmlFor={`descricao-${index}`}>Descrição da Foto {index + 1}</Label>
                  <Input
                    id={`descricao-${index}`}
                    value={foto.descricao}
                    onChange={(e) => handleDescricaoChange(index, e.target.value)}
                    placeholder="Descreva o que mostra esta foto..."
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAutoDescription(index)}
                    className="w-full"
                  >
                    <ImageIcon size={16} className="mr-2" />
                    Gerar Descrição IA
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {fotos.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
          <p>Nenhuma foto adicionada ainda.</p>
          <p className="text-sm">As fotos serão organizadas automaticamente no relatório PDF.</p>
        </div>
      )}
    </div>
  );
};

export default UploadFotos;
