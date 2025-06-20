import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';

interface DescricaoAutomaticaProps {
  imageFile: File;
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
  currentDescription?: string;
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
    } else {
      // Se não tem prefixo conhecido, assumir que é Chatvolt
      return { provider: 'chatvolt', url: 'https://api.chatvolt.ai/agents/query', model: 'chatvolt-agent' };
    }
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
    const chatvoltAgentId = obterConfiguracao('chatvolt_agent_id', '');
    
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
        description: "Configure a API Key (OpenAI, Groq ou Chatvolt) nas configurações.",
        variant: "destructive"
      });
      return;
    }

    const apiInfo = detectApiProvider(apiKey);

    // Validação específica para Chatvolt
    if (apiInfo.provider === 'chatvolt' && !chatvoltAgentId) {
      toast({
        title: "Agent ID Necessário",
        description: "Configure o Agent ID do Chatvolt nas configurações.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Gerando descrição via:', apiInfo.provider, 'modelo:', apiInfo.model);

      if (apiInfo.provider === 'chatvolt') {
        await generateWithChatvolt(apiInfo, apiKey, chatvoltAgentId);
      } else {
        await generateWithOpenAIOrGroq(apiInfo, apiKey);
      }

    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      
      // Verificar se é erro de CORS especificamente
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        toast({
          title: "Erro de CORS",
          description: "A API da Chatvolt não permite requisições diretas do navegador. Tente usar OpenAI (sk-...) ou Groq (gsk-...) em vez disso.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro na Geração",
          description: error instanceof Error ? error.message : "Não foi possível gerar a descrição. Verifique sua API Key e conexão.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWithChatvolt = async (apiInfo: any, apiKey: string, agentId: string) => {
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

    const hasSpecificInstruction = currentDescription.trim().length > 0;
    
    // Construir mensagem para o Chatvolt
    let message = '';
    if (hasSpecificInstruction) {
      message = currentDescription.trim();
      console.log('CHATVOLT - MODO INSTRUÇÃO ESPECÍFICA:', message);
    } else {
      message = `Analise esta imagem de vistoria predial.

INSTRUÇÕES:
- MÁXIMO 200 caracteres
- Use linguagem técnica e objetiva
- Descreva trabalhos/atividades em execução
- Identifique: ambiente, materiais, estado das estruturas
- Foque em aspectos técnicos relevantes

Exemplo: "Aplicação de argamassa em parede interna. Materiais organizados, estrutura em bom estado."`;
      console.log('CHATVOLT - MODO PADRÃO');
    }

    // Tentar diferentes formatos de requisição para a Chatvolt
    const requestBody = {
      agentId: agentId,
      message: message,
      files: [
        {
          type: 'image',
          data: `data:image/jpeg;base64,${base64Image}`
        }
      ]
    };

    console.log('Enviando para Chatvolt Agent ID:', agentId);
    console.log('URL:', apiInfo.url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    // Tentar requisição com modo 'no-cors' primeiro para ver se funciona
    try {
      console.log('Tentando requisição padrão...');
      const response = await fetch(apiInfo.url, {
        method: 'POST',
        mode: 'cors', // Explicitamente usar CORS
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Status da resposta Chatvolt:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro da API Chatvolt - Status:', response.status);
        console.error('Erro da API Chatvolt - Response:', errorText);
        
        let errorMessage = `Erro ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${errorData.error?.message || errorData.message || 'Erro desconhecido'}`;
        } catch {
          errorMessage += ` - ${errorText || 'Erro desconhecido'}`;
        }
        
        throw new Error(`Chatvolt API: ${errorMessage}`);
      }

      const responseText = await response.text();
      console.log('Resposta bruta Chatvolt:', responseText);

      const data = JSON.parse(responseText);
      console.log('Dados parseados Chatvolt:', data);
      
      // A resposta da Chatvolt pode vir em diferentes formatos
      let description = data.answer || data.response || data.message || data.text || data.content || 'Resposta não encontrada';

      // Garantir que a descrição não exceda 200 caracteres se não for instrução específica
      if (!hasSpecificInstruction && description.length > 200) {
        description = description.substring(0, 197) + '...';
      }

      onDescriptionGenerated(description);

      const instructionMessage = hasSpecificInstruction ? ' (seguindo sua instrução específica)' : '';
      toast({
        title: "Descrição Gerada",
        description: `Descrição criada pelo agente Chatvolt${instructionMessage} (${description.length} caracteres)`,
      });

    } catch (fetchError) {
      console.error('Erro na requisição fetch:', fetchError);
      
      // Se falhou por CORS, informar ao usuário
      if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
        throw new Error('Erro de CORS: A API da Chatvolt não permite requisições diretas do navegador. Use OpenAI (sk-...) ou Groq (gsk-...) em vez disso.');
      }
      
      throw fetchError;
    }
  };

  const generateWithOpenAIOrGroq = async (apiInfo: any, apiKey: string) => {
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
      max_tokens: hasSpecificInstruction ? 500 : 150, // Mais tokens para instruções específicas
      temperature: hasSpecificInstruction ? 1.0 : 0.1  // Temperatura máxima para seguir instruções
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

    // Garantir que a descrição não exceda 200 caracteres se não for instrução específica
    if (!hasSpecificInstruction && description.length > 200) {
      description = description.substring(0, 197) + '...';
    }

    onDescriptionGenerated(description);

    const instructionMessage = hasSpecificInstruction ? ' (seguindo sua instrução específica)' : '';
    toast({
      title: "Descrição Gerada",
      description: `Descrição criada por ${nomeAgente} via ${apiInfo.provider.toUpperCase()}${instructionMessage} (${description.length} caracteres)`,
    });
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
