
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DescricaoAutomatica from './DescricaoAutomatica';
import FotoPreview from './upload/FotoPreview';
import FotoModal from './upload/FotoModal';
import UploadProgress from './upload/UploadProgress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFotosSupabase } from '@/hooks/useFotosSupabase';

interface FotoData {
  file: File;
  preview: string;
  descricao: string;
}

interface UploadFotosProps {
  onFotosChange: (fotos: File[], fotosComDescricao?: Array<{file: File, descricao: string}>) => void;
  maxFotos?: number;
  grupoId?: string;
}

const UploadFotos = ({ onFotosChange, maxFotos = 10, grupoId }: UploadFotosProps) => {
  const { toast } = useToast();
  const { uploading, uploadProgress } = useFotosSupabase();
  const [fotos, setFotos] = useState<FotoData[]>([]);
  const [selectedFoto, setSelectedFoto] = useState<{ url: string; nome: string; descricao?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_DESCRICAO_LENGTH = 200;

  // Reset fotos quando o grupoId muda (novo grupo)
  useEffect(() => {
    setFotos([]);
  }, [grupoId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Verificar se não vai ultrapassar o limite
    if (fotos.length + files.length > maxFotos) {
      toast({
        title: "Limite de Fotos Atingido",
        description: `Você pode adicionar no máximo ${maxFotos} fotos por grupo. Fotos restantes: ${maxFotos - fotos.length}`,
        variant: "destructive",
      });
      return;
    }

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
    
    // Enviar fotos com descrições
    const fotosComDescricao = updatedFotos.map(foto => ({
      file: foto.file,
      descricao: foto.descricao
    }));
    onFotosChange(updatedFotos.map(f => f.file), fotosComDescricao);
    
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
    
    // Enviar fotos com descrições atualizadas
    const fotosComDescricao = updatedFotos.map(foto => ({
      file: foto.file,
      descricao: foto.descricao
    }));
    onFotosChange(updatedFotos.map(f => f.file), fotosComDescricao);
    
    // Liberar URL do preview
    URL.revokeObjectURL(fotos[index].preview);
  };

  const handleDescricaoChange = (index: number, descricao: string) => {
    const updatedFotos = fotos.map((foto, i) => 
      i === index ? { ...foto, descricao } : foto
    );
    setFotos(updatedFotos);
    
    // Enviar fotos com descrições atualizadas
    const fotosComDescricao = updatedFotos.map(foto => ({
      file: foto.file,
      descricao: foto.descricao
    }));
    onFotosChange(updatedFotos.map(f => f.file), fotosComDescricao);
  };

  const handleDescriptionGenerated = (index: number, description: string) => {
    // Limitar a descrição gerada automaticamente também
    const descricaoLimitada = description.slice(0, MAX_DESCRICAO_LENGTH);
    handleDescricaoChange(index, descricaoLimitada);
  };

  const handlePreviewFoto = (foto: FotoData) => {
    setSelectedFoto({
      url: foto.preview,
      nome: foto.file.name,
      descricao: foto.descricao
    });
  };

  const fotosRestantes = maxFotos - fotos.length;

  // Mostrar progresso de upload se estiver fazendo upload
  if (uploading && uploadProgress) {
    return (
      <div className="space-y-4">
        <UploadProgress progress={uploadProgress} />
        
        {/* Mostrar fotos já adicionadas em modo somente leitura */}
        {fotos.length > 0 && (
          <div className="opacity-50">
            <h3 className="text-lg font-medium mb-4">Fotos Preparadas ({fotos.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fotos.map((foto, index) => (
                <div key={index} className="aspect-square">
                  <img
                    src={foto.preview}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          fotosRestantes > 0 
            ? 'border-gray-300 hover:border-teal-400' 
            : 'border-gray-200 bg-gray-50 cursor-not-allowed'
        }`}
        onClick={() => fotosRestantes > 0 && fileInputRef.current?.click()}
      >
        <Upload size={40} className={`mx-auto mb-3 ${fotosRestantes > 0 ? 'text-gray-400' : 'text-gray-300'}`} />
        <p className={`text-base font-medium mb-1 ${fotosRestantes > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
          {fotosRestantes > 0 ? 'Clique para adicionar fotos' : 'Limite de fotos atingido'}
        </p>
        <p className="text-sm text-gray-500">
          {fotosRestantes > 0 
            ? `Máximo ${maxFotos} fotos - Restam ${fotosRestantes}` 
            : `Máximo de ${maxFotos} fotos por grupo`
          }
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={fotosRestantes === 0}
        />
      </div>

      {/* Preview das Fotos */}
      {fotos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preview das Fotos ({fotos.length}/{maxFotos})</h3>
          
          {/* Grid de previews */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto, index) => (
              <FotoPreview
                key={index}
                foto={foto}
                index={index}
                onRemove={() => handleRemoveFoto(index)}
                onPreview={() => handlePreviewFoto(foto)}
              />
            ))}
          </div>

          {/* Descrições das fotos */}
          <div className="space-y-4">
            <h4 className="font-medium">Descrições das Fotos</h4>
            {fotos.map((foto, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`descricao-${index}`}>
                      Descrição da Foto {index + 1} - {foto.file.name}
                    </Label>
                    <span className={`text-xs ${foto.descricao.length > MAX_DESCRICAO_LENGTH ? 'text-red-500 font-semibold' : foto.descricao.length > MAX_DESCRICAO_LENGTH * 0.9 ? 'text-yellow-600' : 'text-gray-500'}`}>
                      {foto.descricao.length}/{MAX_DESCRICAO_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    id={`descricao-${index}`}
                    value={foto.descricao}
                    onChange={(e) => handleDescricaoChange(index, e.target.value)}
                    placeholder="Descreva o que mostra esta foto..."
                    className={`min-h-[100px] ${foto.descricao.length > MAX_DESCRICAO_LENGTH ? 'border-red-500 focus:ring-red-500' : ''}`}
                    rows={4}
                  />
                  {foto.descricao.length > MAX_DESCRICAO_LENGTH && (
                    <Alert variant="warning">
                      <AlertDescription>
                        A descrição excede o limite de {MAX_DESCRICAO_LENGTH} caracteres e será truncada no PDF ({foto.descricao.length - MAX_DESCRICAO_LENGTH} caracteres excedentes).
                      </AlertDescription>
                    </Alert>
                  )}
                  <DescricaoAutomatica
                    imageFile={foto.file}
                    onDescriptionGenerated={(description) => handleDescriptionGenerated(index, description)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {fotos.length === 0 && (
        <div className="text-center text-gray-500 py-6">
          <ImageIcon size={48} className="mx-auto mb-3 text-gray-300" />
          <p>Nenhuma foto adicionada ainda.</p>
          <p className="text-sm">Máximo {maxFotos} fotos por grupo de vistoria.</p>
        </div>
      )}

      {/* Modal de preview */}
      {selectedFoto && (
        <FotoModal
          isOpen={!!selectedFoto}
          onClose={() => setSelectedFoto(null)}
          fotoUrl={selectedFoto.url}
          fotoNome={selectedFoto.nome}
          descricao={selectedFoto.descricao}
        />
      )}
    </div>
  );
};

export default UploadFotos;
