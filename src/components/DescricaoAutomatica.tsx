import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

interface DescricaoAutomaticaProps {
  imageFile: File;
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
  currentDescription?: string; // Texto atual no campo de descrição
}

const DescricaoAutomatica: React.FC<DescricaoAutomaticaProps> = ({
  imageFile,
  onDescriptionGenerated,
  disabled,
  currentDescription = ''
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const { obterConfiguracao, loading } = useConfiguracoes();

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
    if (loading) {
      toast({
        title: "Carregando",
        description: "Aguarde as configurações serem carregadas...",
        variant: "destructive"
      });
      return;
    }

    const enableAutoDescription = obterConfiguracao('ia_auto_descricao', false);
    const apiKey = obterConfiguracao('api_key_openai', '');
    const enableAgente = obterConfiguracao('agente_enable', true);
    
    if (!enableAutoDescription) {
      toast({
        title: "Função Desabilitada",
        description: "Habilite a descrição automática nas configurações primeiro.",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key Necessária",
        description: "Configure a API Key (OpenAI ou Groq) nas configurações.",
        variant: "destructive"
      });
      return;
    }

    const apiInfo = detectApiProvider(apiKey);
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
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      console.log('Gerando descrição via:', apiInfo.provider, 'modelo:', apiInfo.model);

      // Carregar configurações do agente
      const nomeAgente = obterConfiguracao('agente_nome', 'Assistente IA');
      const promptPersona = obterConfiguracao('agente_prompt_persona', '');
      const promptObjetivo = obterConfiguracao('agente_prompt_objetivo', '');
      const promptComportamento = obterConfiguracao('agente_prompt_comportamento', '');

      // Verificar se há instrução específica no campo de descrição
      const hasSpecificInstruction = currentDescription.trim().length > 0;
      
      // Construir mensagens de forma diferente baseado na instrução
      let messages = [];
      
      if (hasSpecificInstruction) {
        // INSTRUÇÃO ESPECÍFICA: Colocar como PRIMEIRA mensagem prioritária
        messages = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `INSTRUÇÃO PRIORITÁRIA: ${currentDescription.trim()}

Analise esta imagem e responda EXATAMENTE conforme a instrução acima. Máximo 200 caracteres.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ];
      } else {
        // SEM INSTRUÇÃO: Usar prompt geral com sistema
        const systemPrompt = promptPersona || promptObjetivo || promptComportamento ? 
          `${promptPersona ? promptPersona + '\n\n' : ''}${promptObjetivo ? promptObjetivo + '\n\n' : ''}${promptComportamento ? promptComportamento + '\n\n' : ''}` : '';
        
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        
        messages.push({
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Como ${nomeAgente}, analise esta imagem de vistoria predial.

INSTRUÇÕES:
- MÁXIMO 200 caracteres
- Use linguagem técnica e objetiva
- Descreva trabalhos/atividades em execução
- Identifique: ambiente, materiais, estado das estruturas
- Foque em aspectos técnicos relevantes

Exemplo: "Aplicação de argamassa em parede interna. Materiais organizados, estrutura em bom estado."`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        });
      }

      const requestBody = {
        model: apiInfo.model,
        messages: messages,
        max_tokens: hasSpecificInstruction ? 300 : 150,
        temperature: hasSpecificInstruction ? 0.8 : 0.1
      };

      console.log('Enviando requisição para:', apiInfo.url);
      console.log('Usando agente:', nomeAgente);
      if (hasSpecificInstruction) {
        console.log('INSTRUÇÃO ESPECÍFICA COMO PRIMEIRA MENSAGEM:', currentDescription.trim());
        console.log('Temperature ajustada para:', 0.8);
        console.log('Max tokens:', 300);
      }

      const response = await fetch(apiInfo.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Status da resposta:', response.status);

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

      const instructionMessage = hasSpecificInstruction ? ' (seguindo instrução específica)' : '';
      toast({
        title: "Descrição Gerada",
        description: `Descrição criada por ${nomeAgente} via ${apiInfo.provider.toUpperCase()}${instructionMessage} (${description.length}/200 caracteres)`,
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
      disabled={disabled || isGenerating || loading}
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
