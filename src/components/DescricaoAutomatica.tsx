
import React, { useState } from 'react';
import { getTokenParam } from '@/utils/ai/tokenParams';
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
    const modeloConfigurado = obterConfiguracao('ia_modelo', 'gpt-4o');
    if (apiKey.startsWith('sk-')) {
      return { provider: 'openai', url: 'https://api.openai.com/v1/chat/completions', model: modeloConfigurado };
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
      
      // Construir mensagens de forma COMPLETAMENTE diferente
      let messages = [];
      
      if (hasSpecificInstruction) {
        // MODO INSTRUÇÃO ESPECÍFICA: Usar APENAS a instrução do usuário, sem prompts extras
        console.log('MODO INSTRUÇÃO ESPECÍFICA PURA - SEM PROMPTS EXTRAS');
        console.log('Instrução do usuário:', currentDescription.trim());
        
        messages = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: currentDescription.trim() // APENAS a instrução do usuário, nada mais
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
        // MODO PADRÃO: Usar prompts do sistema
        console.log('MODO PADRÃO - USANDO PROMPTS DO SISTEMA');
        
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
              text: `Como ${nomeAgente}, analise esta imagem de vistoria predial com precisão de engenharia diagnóstica.

REGRAS OBRIGATÓRIAS:
- MÁXIMO 300 caracteres - finalize a frase antes do limite
- NUNCA comece com "A imagem mostra", "Na imagem" ou similares
- Comece DIRETAMENTE pelo elemento ou patologia observada
- Texto corrido técnico em parágrafo único, como laudo de engenharia
- Identifique: elemento construtivo, tipo de patologia/condição, extensão aproximada, gravidade aparente e causa provável
- Se houver atividade em execução, descreva o serviço, materiais e técnica observada

VOCABULÁRIO TÉCNICO OBRIGATÓRIO:
Use termos como: fissura, trinca, eflorescência, desplacamento, infiltração, carbonatação, corrosão de armadura, bolor, desagregação, empolamento, vesícula, junta de dilatação, argamassa de revestimento, substrato, laje, alvenaria, contramarco, verga, pingadeira

EXEMPLOS DE REFERÊNCIA:
- "Fissura horizontal em alvenaria de vedação no terço inferior da parede, abertura estimada em 0,3mm, extensão de aproximadamente 1,5m. Padrão sugere movimentação diferencial da fundação. Grau de risco: médio."
- "Eflorescência localizada na face interna da parede junto ao rodapé, indicando presença de umidade ascendente por capilaridade. Revestimento com descolamento incipiente na região afetada."
- "Instalação de tubulação hidráulica em PVC soldável Ø50mm em prumada de esgoto. Conexões com aplicação de adesivo adequada, alinhamento e prumo satisfatórios."`
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
        max_tokens: hasSpecificInstruction ? 500 : 250,
        temperature: hasSpecificInstruction ? 0.7 : 0.2
      };

      console.log('Configuração da requisição:');
      console.log('- Max tokens:', requestBody.max_tokens);
      console.log('- Temperature:', requestBody.temperature);
      console.log('- Mensagens enviadas:', JSON.stringify(messages, null, 2));

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

      // Garantir que a descrição não exceda 300 caracteres se não for instrução específica
      if (!hasSpecificInstruction && description.length > 300) {
        // Cortar na última frase completa antes de 300 chars
        const truncated = description.substring(0, 300);
        const lastPeriod = truncated.lastIndexOf('.');
        description = lastPeriod > 150 ? truncated.substring(0, lastPeriod + 1) : truncated.substring(0, 297) + '...';
      }

      onDescriptionGenerated(description);

      const instructionMessage = hasSpecificInstruction ? ' (seguindo sua instrução específica)' : '';
      toast({
        title: "Descrição Gerada",
        description: `Descrição criada por ${nomeAgente} via ${apiInfo.provider.toUpperCase()}${instructionMessage} (${description.length} caracteres)`,
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
