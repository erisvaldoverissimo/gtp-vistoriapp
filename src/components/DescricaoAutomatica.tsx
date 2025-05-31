
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DescricaoAutomaticaProps {
  imageFile: File;
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
}

const DescricaoAutomatica: React.FC<DescricaoAutomaticaProps> = ({
  imageFile,
  onDescriptionGenerated,
  disabled
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Carregar configurações
  const getConfig = () => {
    const savedConfig = localStorage.getItem('configuracoes');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return {
      apiKeyOpenAI: '',
      enableAutoDescription: false
    };
  };

  // Detectar o tipo de API baseado na chave
  const detectApiProvider = (apiKey: string) => {
    if (apiKey.startsWith('sk-')) {
      return { provider: 'openai', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' };
    } else if (apiKey.startsWith('gsk_')) {
      return { provider: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.2-11b-vision-preview' };
    }
    return null;
  };

  const generateDescription = async () => {
    const config = getConfig();
    
    if (!config.enableAutoDescription) {
      toast({
        title: "Função Desabilitada",
        description: "Habilite a descrição automática nas configurações primeiro.",
        variant: "destructive"
      });
      return;
    }

    if (!config.apiKeyOpenAI) {
      toast({
        title: "API Key Necessária",
        description: "Configure a API Key (OpenAI ou Groq) nas configurações.",
        variant: "destructive"
      });
      return;
    }

    const apiInfo = detectApiProvider(config.apiKeyOpenAI);
    if (!apiInfo) {
      toast({
        title: "API Key Inválida",
        description: "A API Key deve começar com 'sk-' (OpenAI) ou 'gsk_' (Groq).",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Converter imagem para base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remover o prefixo data:image/...;base64,
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      console.log('Gerando descrição via:', apiInfo.provider, 'modelo:', apiInfo.model);

      const response = await fetch(apiInfo.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKeyOpenAI}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: apiInfo.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Descreva esta imagem de forma detalhada e técnica, como se fosse para um relatório de vistoria. Inclua aspectos como condições, materiais, possíveis problemas ou observações importantes.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro da API:', errorData);
        throw new Error(`Erro na API ${apiInfo.provider}: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      const description = data.choices[0].message.content;

      onDescriptionGenerated(description);

      toast({
        title: "Descrição Gerada",
        description: `Descrição criada via ${apiInfo.provider.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      toast({
        title: "Erro na Geração",
        description: error instanceof Error ? error.message : "Não foi possível gerar a descrição. Verifique sua API Key e conexão.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generateDescription}
      disabled={disabled || isGenerating}
      variant="outline"
      size="sm"
      className="w-full"
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Brain size={16} className="mr-2" />
          Gerar Descrição IA
        </>
      )}
    </Button>
  );
};

export default DescricaoAutomatica;
