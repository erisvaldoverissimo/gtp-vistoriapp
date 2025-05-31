
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon } from 'lucide-react';
import DescricaoAutomatica from './DescricaoAutomatica';

const TesteDescricaoIA = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDescription('');
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDescriptionGenerated = (newDescription: string) => {
    setDescription(newDescription);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teste - Descrição Automática IA</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon size={20} className="mr-2" />
            Teste de Geração de Descrição via Groq/OpenAI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="imageFile">Selecionar Imagem</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-1"
            />
          </div>

          {imagePreview && (
            <div className="space-y-4">
              <div>
                <Label>Preview da Imagem</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full max-w-md mx-auto h-auto"
                  />
                </div>
              </div>

              {selectedFile && (
                <DescricaoAutomatica
                  imageFile={selectedFile}
                  onDescriptionGenerated={handleDescriptionGenerated}
                />
              )}

              {description && (
                <div>
                  <Label htmlFor="generatedDescription">Descrição Gerada pela IA</Label>
                  <Textarea
                    id="generatedDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="mt-1"
                    placeholder="A descrição aparecerá aqui..."
                  />
                </div>
              )}
            </div>
          )}

          {!selectedFile && (
            <div className="text-center py-8 text-gray-500">
              <Upload size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Selecione uma imagem para testar a geração de descrição automática</p>
              <p className="text-sm mt-2">
                Certifique-se de que a API Key está configurada nas Configurações
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instruções de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Certifique-se de que sua API Key do Groq (gsk_...) está configurada</li>
            <li>Verifique se a opção "Habilitar descrição automática" está ativada nas Configurações</li>
            <li>Selecione uma imagem usando o campo acima</li>
            <li>Clique em "Gerar Descrição IA" para testar</li>
            <li>A descrição deve aparecer no campo de texto abaixo</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesteDescricaoIA;
