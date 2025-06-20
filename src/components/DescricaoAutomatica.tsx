
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

      // Construir prompt personalizado usando as configurações do agente
      let systemPrompt = '';
      
      if (enableAgente && (promptPersona || promptObjetivo || promptComportamento)) {
        systemPrompt = `${promptPersona ? promptPersona + '\n\n' : ''}${promptObjetivo ? promptObjetivo + '\n\n' : ''}${promptComportamento ? promptComportamento + '\n\n' : ''}`;
      }

      // Verificar se há instrução específica no campo de descrição
      const hasSpecificInstruction = currentDescription.trim().length > 0;
      const specificInstructionText = hasSpecificInstruction 
        ? `\n\nINSTRUÇÃO ESPECÍFICA DO USUÁRIO: "${currentDescription.trim()}"\n- Use esta instrução como foco principal da sua análise`
        : '';

      // Construir prompt base aprimorado para análise completa
      const taskPrompt = `
Como ${nomeAgente}, você deve analisar esta imagem de vistoria predial e descrever detalhadamente o que está sendo observado.

INSTRUÇÕES OBRIGATÓRIAS:
- MÁXIMO 200 caracteres
- Use linguagem técnica e objetiva
- Descreva o trabalho/situação observada na imagem
- Identifique: tipo de ambiente, atividades em execução, materiais utilizados, estado das estruturas
- Foque em aspectos técnicos relevantes: condições prediais, trabalhos sendo realizados, anomalias (se houver)
- Seja específico sobre o que está acontecendo na cena
- Se não houver atividades específicas, descreva o estado atual do ambiente

TIPOS DE ANÁLISE ESPERADA:
✓ Trabalhos em execução (instalações, reparos, reformas)
✓ Estado de conservação de estruturas
✓ Condições de segurança
✓ Materiais e equipamentos presentes
✓ Anomalias estruturais (fissuras, infiltrações, desgastes)
✓ Aspectos de acabamento e instalações${specificInstructionText}

Exemplo: "Aplicação de argamassa em parede interna. Materiais de construção organizados no piso. Estrutura em bom estado de conservação."`;

      const requestBody = {
        model: apiInfo.model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: taskPrompt
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
      console.log('Usando agente:', nomeAgente);
      if (hasSpecificInstruction) {
        console.log('Instrução específica:', currentDescription.trim());
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

      const instructionMessage = hasSpecificInstruction ? ' (com instrução específica)' : '';
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
