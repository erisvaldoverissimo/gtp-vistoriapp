import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image as ImageIcon, Info, Sparkles, Brain } from 'lucide-react';
import DescricaoAutomaticaAvancada from './DescricaoAutomaticaAvancada';

const TesteDescricaoIAAvancada = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Dados de teste para simular contexto da vistoria
  const [ambiente, setAmbiente] = useState('');
  const [grupo, setGrupo] = useState('');
  const [status, setStatus] = useState('');
  const [tipoCondominio, setTipoCondominio] = useState('');

  const ambientes = [
    'Área Comum', 'Hall de Entrada', 'Garagem', 'Subsolo', 'Cobertura',
    'Apartamento', 'Sala', 'Quarto', 'Cozinha', 'Banheiro', 'Varanda',
    'Área de Serviço', 'Elevador', 'Escadaria', 'Fachada', 'Jardim'
  ];

  const grupos = [
    'Estrutura', 'Alvenaria', 'Revestimentos', 'Pisos', 'Instalações Elétricas',
    'Instalações Hidráulicas', 'Esquadrias', 'Pintura', 'Impermeabilização',
    'Segurança', 'Acessibilidade', 'Paisagismo', 'Sistema de Incêndio'
  ];

  const statusOptions = ['N/A', 'Conforme', 'Não Conforme', 'Requer Atenção'];
  const tiposCondominio = ['Residencial', 'Comercial', 'Misto', 'Industrial'];

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

  const resetContext = () => {
    setAmbiente('');
    setGrupo('');
    setStatus('');
    setTipoCondominio('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">IA Avançada - Descrição de Vistorias</h2>
          <Sparkles className="text-yellow-500" size={20} />
        </div>
      </div>

      {/* Configuração de Contexto */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Info size={18} className="mr-2" />
            Contexto da Vistoria (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="ambiente">Ambiente</Label>
              <Select value={ambiente} onValueChange={setAmbiente}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar ambiente" />
                </SelectTrigger>
                <SelectContent>
                  {ambientes.map((amb) => (
                    <SelectItem key={amb} value={amb}>{amb}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="grupo">Grupo de Vistoria</Label>
              <Select value={grupo} onValueChange={setGrupo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar grupo" />
                </SelectTrigger>
                <SelectContent>
                  {grupos.map((grp) => (
                    <SelectItem key={grp} value={grp}>{grp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((st) => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipoCondominio">Tipo de Condomínio</Label>
              <Select value={tipoCondominio} onValueChange={setTipoCondominio}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo do condomínio" />
                </SelectTrigger>
                <SelectContent>
                  {tiposCondominio.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={resetContext} variant="outline" size="sm">
              Limpar Contexto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload e Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon size={20} className="mr-2" />
            Análise Inteligente com IA
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
                    className="w-full max-w-lg mx-auto h-auto"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descriptionInput">
                  Instrução Personalizada (Opcional)
                  <span className="text-sm text-gray-500 ml-2">- Sobrescreve análise automática</span>
                </Label>
                <Textarea
                  id="descriptionInput"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1"
                  placeholder="Ex: 'Focar na análise de infiltração na parede' ou 'Descrever detalhadamente o sistema elétrico'"
                />
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Info size={14} className="mr-1" />
                  <span>
                    {description.trim() 
                      ? `🎯 IA seguirá esta instrução específica` 
                      : 'Deixe vazio para análise automática contextual'
                    }
                  </span>
                </div>
              </div>

              {selectedFile && (
                <DescricaoAutomaticaAvancada
                  imageFile={selectedFile}
                  onDescriptionGenerated={handleDescriptionGenerated}
                  currentDescription={description}
                  ambiente={ambiente}
                  grupo={grupo}
                  status={status}
                  condominioInfo={{
                    nome: 'Condomínio Teste',
                    tipo: tipoCondominio
                  }}
                />
              )}
            </div>
          )}

          {!selectedFile && (
            <div className="text-center py-12 text-gray-500">
              <Upload size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Selecione uma imagem para análise</p>
              <p className="text-sm">
                Configure o contexto acima para análise mais precisa
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guia de Melhorias */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">
            🚀 Melhorias Implementadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">Análise Contextual</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>✅ Usa contexto do ambiente e grupo</li>
                <li>✅ Adapta linguagem por tipo de condomínio</li>
                <li>✅ Considera status atual do item</li>
                <li>✅ Prompts especializados por área</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-700 mb-2">Modos de Análise</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>✅ Automática inteligente</li>
                <li>✅ Foco estrutural</li>
                <li>✅ Instalações específicas</li>
                <li>✅ Segurança e acessibilidade</li>
                <li>✅ Análise detalhada</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-green-700 mb-2">Melhorias Técnicas</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>✅ Prompts especializados em vistoria</li>
                <li>✅ Limite de caracteres otimizado</li>
                <li>✅ Modelo GPT-4o para máxima qualidade</li>
                <li>✅ Instruções personalizadas</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-green-700 mb-2">Produtividade</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>✅ Descrições técnicas precisas</li>
                <li>✅ Economia de tempo significativa</li>
                <li>✅ Padronização de linguagem</li>
                <li>✅ Foco em ações necessárias</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TesteDescricaoIAAvancada;