
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DescricaoAutomatica from './DescricaoAutomatica';
import DescricaoAutomaticaAvancada from './DescricaoAutomaticaAvancada';
import FotoPreview from './upload/FotoPreview';
import FotoModal from './upload/FotoModal';
import UploadProgress from './upload/UploadProgress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FotoVistoriaSupabase } from '@/hooks/useVistoriasSupabase';

interface FotoData {
  file: File;
  preview: string;
  descricao: string;
}

interface FotoExistente {
  id: string;
  url: string;
  nome: string;
  descricao: string;
  isExisting: true;
}

interface UploadFotosProps {
  onFotosChange: (fotos: File[], fotosComDescricao?: Array<{file: File, descricao: string}>) => void;
  maxFotos?: number;
  grupoId?: string;
  fotosExistentes?: FotoVistoriaSupabase[];
  uploading?: boolean;
  uploadProgress?: {
    current: number;
    total: number;
    currentFileName: string;
    percentage: number;
  } | null;
}

const UploadFotos = ({ 
  onFotosChange, 
  maxFotos = 10, 
  grupoId, 
  fotosExistentes = [], 
  uploading = false,
  uploadProgress = null 
}: UploadFotosProps) => {
  const { toast } = useToast();
  const [fotos, setFotos] = useState<FotoData[]>([]);
  const [fotosExistentesState, setFotosExistentesState] = useState<FotoExistente[]>([]);
  const [selectedFoto, setSelectedFoto] = useState<{ url: string; nome: string; descricao?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_DESCRICAO_LENGTH = 200;

  // Carregar fotos existentes quando o componente monta ou fotosExistentes muda
  useEffect(() => {
    if (fotosExistentes && fotosExistentes.length > 0) {
      const fotosFormatadas: FotoExistente[] = fotosExistentes.map(foto => ({
        id: foto.id || '',
        url: foto.arquivo_url,
        nome: foto.arquivo_nome,
        descricao: foto.descricao || '',
        isExisting: true
      }));
      setFotosExistentesState(fotosFormatadas);
    } else {
      setFotosExistentesState([]);
    }
  }, [fotosExistentes]);

  // Reset fotos quando o grupoId muda (novo grupo) - CORRIGIDO
  useEffect(() => {
    // Só limpar se não há fotos existentes E não é uma nova vistoria
    if (!fotosExistentes || fotosExistentes.length === 0) {
      // Para nova vistoria (sem grupoId), manter as fotos no estado
      if (grupoId) {
        console.log('Limpando fotos para novo grupo com ID:', grupoId);
        setFotos([]);
      }
    }
  }, [grupoId, fotosExistentes]);

  // Função para notificar mudanças nas fotos
  const notifyFotosChange = (novasFotos: FotoData[]) => {
    console.log('=== NOTIFICANDO MUDANÇA DE FOTOS ===');
    console.log('Quantidade de fotos:', novasFotos.length);
    console.log('GrupoId atual:', grupoId);
    
    if (novasFotos.length === 0) {
      console.log('Nenhuma foto, enviando arrays vazios');
      onFotosChange([], []);
      return;
    }
    
    // Manter referências diretas dos arquivos File
    const arquivosOriginais: File[] = [];
    const fotosComDescricao: Array<{file: File, descricao: string}> = [];
    
    novasFotos.forEach((fotoData, index) => {
      console.log(`Processando foto ${index + 1}:`, {
        fileName: fotoData.file.name,
        fileSize: fotoData.file.size,
        fileType: fotoData.file.type,
        isFileInstance: fotoData.file instanceof File,
        descricao: fotoData.descricao
      });
      
      // Usar referência direta do arquivo original
      arquivosOriginais.push(fotoData.file);
      fotosComDescricao.push({
        file: fotoData.file,
        descricao: fotoData.descricao
      });
    });
    
    console.log('Enviando para callback:', {
      arquivos: arquivosOriginais.length,
      fotosComDescricao: fotosComDescricao.length
    });
    
    onFotosChange(arquivosOriginais, fotosComDescricao);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    console.log('=== SELEÇÃO DE ARQUIVOS ===');
    console.log('Arquivos selecionados:', files.length);

    const totalFotosAtuais = fotos.length + fotosExistentesState.length;

    // Verificar limite
    if (totalFotosAtuais + files.length > maxFotos) {
      toast({
        title: "Limite de Fotos Atingido",
        description: `Você pode adicionar no máximo ${maxFotos} fotos por grupo. Fotos restantes: ${maxFotos - totalFotosAtuais}`,
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

    // Criar FotoData com referências diretas dos arquivos
    const newFotos: FotoData[] = files.map((file, index) => {
      console.log(`Criando FotoData ${index + 1} para:`, file.name);
      
      return {
        file: file, // Referência direta
        preview: URL.createObjectURL(file),
        descricao: ''
      };
    });

    console.log(`FotoData criadas: ${newFotos.length}`);

    // Atualizar estado
    const updatedFotos = [...fotos, ...newFotos];
    setFotos(updatedFotos);
    
    // Notificar imediatamente
    notifyFotosChange(updatedFotos);
    
    toast({
      title: "Fotos Adicionadas",
      description: `${newFotos.length} foto(s) adicionada(s) com sucesso.`,
    });

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFoto = (index: number) => {
    console.log(`Removendo foto ${index}...`);
    const fotoRemovida = fotos[index];
    const updatedFotos = fotos.filter((_, i) => i !== index);
    setFotos(updatedFotos);
    
    // Liberar URL do preview
    if (fotoRemovida?.preview) {
      URL.revokeObjectURL(fotoRemovida.preview);
    }
    
    notifyFotosChange(updatedFotos);
  };

  const handleRemoveFotoExistente = (index: number) => {
    const updatedFotosExistentes = fotosExistentesState.filter((_, i) => i !== index);
    setFotosExistentesState(updatedFotosExistentes);
    
    toast({
      title: "Foto Removida",
      description: "A foto existente foi marcada para remoção.",
    });
  };

  const handleDescricaoChange = (index: number, descricao: string) => {
    console.log(`Atualizando descrição da foto ${index}:`, descricao);
    const updatedFotos = fotos.map((foto, i) => 
      i === index ? { ...foto, descricao } : foto
    );
    setFotos(updatedFotos);
    notifyFotosChange(updatedFotos);
  };

  const handleDescricaoExistenteChange = (index: number, descricao: string) => {
    const updatedFotosExistentes = fotosExistentesState.map((foto, i) => 
      i === index ? { ...foto, descricao } : foto
    );
    setFotosExistentesState(updatedFotosExistentes);
  };

  const handleDescriptionGenerated = (index: number, description: string) => {
    const descricaoLimitada = description.slice(0, MAX_DESCRICAO_LENGTH);
    handleDescricaoChange(index, descricaoLimitada);
  };

  const handlePreviewFoto = (foto: FotoData | FotoExistente) => {
    if ('isExisting' in foto) {
      setSelectedFoto({
        url: foto.url,
        nome: foto.nome,
        descricao: foto.descricao
      });
    } else {
      setSelectedFoto({
        url: foto.preview,
        nome: foto.file.name,
        descricao: foto.descricao
      });
    }
  };

  const totalFotos = fotos.length + fotosExistentesState.length;
  const fotosRestantes = maxFotos - totalFotos;

  // Mostrar progresso de upload se estiver fazendo upload
  if (uploading && uploadProgress) {
    return (
      <div className="space-y-4">
        <UploadProgress progress={uploadProgress} />
        
        {/* Mostrar fotos já adicionadas em modo somente leitura */}
        {totalFotos > 0 && (
          <div className="opacity-50">
            <h3 className="text-lg font-medium mb-4">Fotos Preparadas ({totalFotos})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {fotosExistentesState.map((foto, index) => (
                <div key={`existing-${index}`} className="aspect-square">
                  <img
                    src={foto.url}
                    alt={foto.nome}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
              {fotos.map((foto, index) => (
                <div key={`new-${index}`} className="aspect-square">
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

      {/* Preview das Fotos Existentes */}
      {fotosExistentesState.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Fotos Existentes ({fotosExistentesState.length})</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotosExistentesState.map((foto, index) => (
              <Card key={`existing-${index}`} className="overflow-hidden">
                <div className="relative aspect-square">
                  <img
                    src={foto.url}
                    alt={foto.nome}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handlePreviewFoto(foto)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveFotoExistente(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate">{foto.nome}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Descrições das fotos existentes */}
          <div className="space-y-4">
            <h4 className="font-medium">Descrições das Fotos Existentes</h4>
            {fotosExistentesState.map((foto, index) => (
              <Card key={`desc-existing-${index}`} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`descricao-existing-${index}`}>
                      Descrição - {foto.nome}
                    </Label>
                    <span className={`text-xs ${foto.descricao.length > MAX_DESCRICAO_LENGTH ? 'text-red-500 font-semibold' : foto.descricao.length > MAX_DESCRICAO_LENGTH * 0.9 ? 'text-yellow-600' : 'text-gray-500'}`}>
                      {foto.descricao.length}/{MAX_DESCRICAO_LENGTH}
                    </span>
                  </div>
                  <Textarea
                    id={`descricao-existing-${index}`}
                    value={foto.descricao}
                    onChange={(e) => handleDescricaoExistenteChange(index, e.target.value)}
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
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preview das Fotos Novas - SEMPRE RENDERIZAR quando há fotos */}
      {fotos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {grupoId ? `Novas Fotos (${fotos.length}/${maxFotos})` : `Fotos Adicionadas (${fotos.length}/${maxFotos})`}
          </h3>
          
          {/* Grid de previews */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {fotos.map((foto, index) => (
              <FotoPreview
                key={`preview-${index}`}
                foto={foto}
                index={index}
                onRemove={() => handleRemoveFoto(index)}
                onPreview={() => handlePreviewFoto(foto)}
              />
            ))}
          </div>

          {/* Descrições das fotos novas */}
          <div className="space-y-4">
            <h4 className="font-medium">
              {grupoId ? 'Descrições das Novas Fotos' : 'Descrições das Fotos'}
            </h4>
            {fotos.map((foto, index) => (
              <Card key={`desc-${index}`} className="p-4">
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
                  <DescricaoAutomaticaAvancada
                    imageFile={foto.file}
                    onDescriptionGenerated={(description) => handleDescriptionGenerated(index, description)}
                    currentDescription={foto.descricao}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {totalFotos === 0 && (
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
