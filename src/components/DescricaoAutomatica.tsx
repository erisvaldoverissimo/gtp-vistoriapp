
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
      // Usando um modelo de visão que está atualmente disponível no Groq
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

      const requestBody = {
        model: apiInfo.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise esta imagem de vistoria predial e descreva APENAS as anomalias, problemas ou condições técnicas observadas. 

INSTRUÇÕES OBRIGATÓRIAS:
- MÁXIMO 200 caracteres
- Use linguagem técnica e objetiva
- NÃO mencione datas, horários ou metadados da foto
- Foque APENAS em: fissuras, infiltrações, desgastes, corrosão, defeitos estruturais, problemas de instalações
- Se não houver anomalias visíveis, escreva "Sem anomalias aparentes"
- Use termos técnicos de engenharia civil/predial

Exemplo: "Fissura horizontal na viga de concreto, aprox. 2mm de abertura. Sinais de infiltração com eflorescência na parede lateral direita."`
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
        max_tokens: 150,
        temperature: 0.1
      };

      console.log('Enviando requisição para:', apiInfo.url);
      console.log('Corpo da requisição:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiInfo.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKeyOpenAI}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', response.headers);

      const responseText = await response.text();
      console.log('Resposta bruta:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: { message: responseText } };
        }
        console.error('Erro da API:', errorData);
        
        // Mensagem de erro mais específica para problemas de modelo
        if (response.status === 400 && errorData.error?.message?.includes('model')) {
          throw new Error(`Modelo ${apiInfo.model} não disponível no ${apiInfo.provider.toUpperCase()}. Tente usar uma API Key do OpenAI.`);
        }
        
        throw new Error(`Erro na API ${apiInfo.provider}: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = JSON.parse(responseText);
      console.log('Dados parseados:', data);
      
      let description = data.choices[0].message.content;

      // Garantir que a descrição não exceda 200 caracteres
      if (description.length > 200) {
        description = description.substring(0, 197) + '...';
      }

      onDescriptionGenerated(description);

      toast({
        title: "Descrição Gerada",
        description: `Descrição criada via ${apiInfo.provider.toUpperCase()} (${description.length}/200 caracteres)`,
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
