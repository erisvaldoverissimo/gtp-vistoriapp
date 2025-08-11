import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Loader2, Sparkles, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { Badge } from '@/components/ui/badge';

interface DescricaoAutomaticaAvancadaProps {
  imageFile: File;
  onDescriptionGenerated: (description: string) => void;
  disabled?: boolean;
  currentDescription?: string;
  ambiente?: string;
  grupo?: string;
  status?: string;
  condominioInfo?: {
    nome: string;
    tipo?: string; // residencial, comercial, industrial
  };
}

const DescricaoAutomaticaAvancada: React.FC<DescricaoAutomaticaAvancadaProps> = ({
  imageFile,
  onDescriptionGenerated,
  disabled,
  currentDescription = '',
  ambiente,
  grupo,
  status,
  condominioInfo
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('auto');
  const { obterConfiguracao, loading } = useConfiguracoes();

  // Tipos de análise especializada
  const analysisMode = {
    auto: 'Análise Automática Inteligente',
    estrutural: 'Foco Estrutural e Construtivo',
    instalacoes: 'Instalações (Elétrica/Hidráulica)',
    acabamentos: 'Acabamentos e Revestimentos',
    seguranca: 'Segurança e Acessibilidade',
    conservacao: 'Estado de Conservação',
    manutencao: 'Manutenção Necessária',
    detalhado: 'Análise Técnica Detalhada'
  };

  // Detectar o tipo de API baseado na chave
  const detectApiProvider = (apiKey: string) => {
    if (apiKey.startsWith('sk-')) {
      return { provider: 'openai', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o' };
    } else if (apiKey.startsWith('gsk_')) {
      return { provider: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.2-11b-vision-preview' };
    }
    return null;
  };

  // Gerar contexto inteligente baseado nas informações disponíveis
  const buildContextualPrompt = (mode: string) => {
    const exemploDescricoes = obterConfiguracao('agente_exemplos_descricoes', []);
    const exemplosTexto = exemploDescricoes.length > 0 
      ? `\n\nEXEMPLOS DO SEU PADRÃO DE ESCRITA:\n${exemploDescricoes.map((ex: string, i: number) => `${i + 1}. ${ex}`).join('\n')}\n\nSiga este mesmo estilo e estrutura nos exemplos acima.`
      : '';

    const baseContext = `
Você é um engenheiro especialista em vistorias prediais com 20+ anos de experiência.
Analise esta imagem de vistoria predial e forneça uma descrição técnica precisa e útil.

CONTEXTO DA VISTORIA:
${ambiente ? `- Ambiente: ${ambiente}` : ''}
${grupo ? `- Grupo de Vistoria: ${grupo}` : ''}
${status ? `- Status Atual: ${status}` : ''}
${condominioInfo?.nome ? `- Condomínio: ${condominioInfo.nome}` : ''}
${condominioInfo?.tipo ? `- Tipo: ${condominioInfo.tipo}` : ''}${exemplosTexto}
`;

    const specificPrompts = {
      auto: `
ANÁLISE INTELIGENTE:
- Identifique automaticamente o principal elemento/atividade/problema
- Use linguagem técnica clara e objetiva, NUNCA comece com "A imagem mostra" ou similares
- Seja direto: inicie descrevendo o elemento e sua condição (ex: "viga de concreto com sinais evidentes de deterioração")
- Priorize informações mais relevantes para decisões de manutenção
- Descreva trabalhos em andamento, condições estruturais ou anomalias
- MÁXIMO 300 caracteres

FORMATO OBRIGATÓRIO: "[Elemento e material] com [condição/anomalia]. [Detalhes técnicos observados]. [Consequências/observações]"`,

      estrutural: `
FOCO ESTRUTURAL:
- NUNCA comece com "A imagem mostra" ou similares
- Inicie diretamente: "[elemento estrutural] com [condição]" (ex: "viga de concreto com fissuras visíveis")
- Analise elementos estruturais: lajes, vigas, pilares, paredes, fundações
- Identifique fissuras, rachaduras, deformações, deslocamentos
- Avalie materiais: concreto, alvenaria, estrutura metálica
- Note sinais de deterioração, corrosão ou sobrecarga
- MÁXIMO 400 caracteres`,

      instalacoes: `
FOCO INSTALAÇÕES:
- NUNCA comece com "A imagem mostra" ou similares
- Inicie diretamente: "[tipo de instalação] com [condição]" (ex: "tubulação hidráulica com vazamento aparente")
- Identifique instalações elétricas: quadros, cabos, tomadas, luminárias
- Observe instalações hidráulicas: tubulações, registros, válvulas
- Note condições de funcionamento, adequação às normas
- Identifique problemas: vazamentos, sobrecarga, obsolescência
- MÁXIMO 350 caracteres`,

      acabamentos: `
FOCO ACABAMENTOS:
- NUNCA comece com "A imagem mostra" ou similares
- Inicie diretamente: "[tipo de acabamento] com [condição]" (ex: "revestimento cerâmico com descolamentos")
- Analise revestimentos: pisos, paredes, tetos
- Observe pintura, azulejos, cerâmica, pedras naturais
- Note desgaste, manchas, descolamentos, trincas
- Avalie necessidade de reforma ou manutenção
- MÁXIMO 300 caracteres`,

      seguranca: `
FOCO SEGURANÇA:
- NUNCA comece com "A imagem mostra" ou similares
- Inicie diretamente: "[elemento de segurança] com [condição]" (ex: "corrimão metálico com oxidação severa")
- Identifique elementos de segurança: grades, portões, corrimãos
- Observe acessibilidade: rampas, sinalização, obstáculos
- Note riscos: superfícies escorregadias, obstáculos, iluminação inadequada
- Avalie conformidade com normas de segurança
- MÁXIMO 350 caracteres`,

      conservacao: `
FOCO CONSERVAÇÃO:
- NUNCA comece com "A imagem mostra" ou similares
- Inicie diretamente: "[elemento] em estado [classificação]" (ex: "fachada em estado crítico de conservação")
- Avalie estado geral de conservação dos elementos
- Identifique sinais de deterioração natural ou acelerada
- Note áreas que precisam de intervenção imediata
- Classifique: Bom, Regular, Ruim, Crítico
- MÁXIMO 300 caracteres`,

      manutencao: `
FOCO MANUTENÇÃO:
- NUNCA comece com "A imagem mostra" ou similares
- Inicie diretamente: "[elemento] necessita [tipo de manutenção]" (ex: "impermeabilização necessita manutenção corretiva urgente")
- Identifique necessidades de manutenção preventiva ou corretiva
- Priorize intervenções por urgência e impacto
- Sugira prazos para ações necessárias
- Note materiais e métodos recomendados
- MÁXIMO 400 caracteres`,

      detalhado: `
ANÁLISE TÉCNICA DETALHADA:
- NUNCA comece com "A imagem mostra" ou similares
- Inicie diretamente com o elemento e sua condição
- Forneça análise completa e minuciosa
- Inclua aspectos técnicos, normativos e de segurança
- Detalhe materiais, métodos construtivos, patologias
- Sugira investigações adicionais se necessário
- MÁXIMO 600 caracteres`
    };

    return baseContext + specificPrompts[mode as keyof typeof specificPrompts];
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

      // Verificar se há instrução específica no campo de descrição
      const hasSpecificInstruction = currentDescription.trim().length > 0;
      
      let messages = [];
      
      if (hasSpecificInstruction) {
        // Modo instrução específica
        messages = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `INSTRUÇÃO ESPECÍFICA: ${currentDescription.trim()}\n\nAnalise a imagem de vistoria seguindo exatamente esta instrução.`
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
        // Modo contextual inteligente
        const systemPrompt = buildContextualPrompt(selectedMode);
        
        messages = [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise esta imagem de vistoria seguindo as diretrizes estabelecidas.'
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
      }

      const maxTokens = {
        auto: 200,
        estrutural: 250,
        instalacoes: 220,
        acabamentos: 200,
        seguranca: 220,
        conservacao: 200,
        manutencao: 250,
        detalhado: 400
      };

      const requestBody = {
        model: apiInfo.model,
        messages: messages,
        max_tokens: hasSpecificInstruction ? 300 : maxTokens[selectedMode as keyof typeof maxTokens],
        temperature: hasSpecificInstruction ? 0.7 : 0.3
      };

      const response = await fetch(apiInfo.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro na API ${apiInfo.provider}: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      const description = data.choices[0].message.content;

      onDescriptionGenerated(description);

      const modeLabel = hasSpecificInstruction ? 'Instrução Específica' : analysisMode[selectedMode as keyof typeof analysisMode];
      toast({
        title: "Descrição Gerada",
        description: `${modeLabel} via ${apiInfo.provider.toUpperCase()} - ${description.length} caracteres`,
      });

    } catch (error) {
      console.error('Erro ao gerar descrição:', error);
      toast({
        title: "Erro na Geração",
        description: error instanceof Error ? error.message : "Não foi possível gerar a descrição.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const hasCustomInstruction = currentDescription.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Seletor de Modo de Análise */}
      {!hasCustomInstruction && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Análise</label>
          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de análise" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(analysisMode).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Indicadores de Contexto */}
      {(ambiente || grupo || condominioInfo?.nome) && (
        <div className="flex flex-wrap gap-1">
          {ambiente && <Badge variant="secondary" className="text-xs">{ambiente}</Badge>}
          {grupo && <Badge variant="outline" className="text-xs">{grupo}</Badge>}
          {condominioInfo?.tipo && <Badge variant="outline" className="text-xs">{condominioInfo.tipo}</Badge>}
        </div>
      )}

      {/* Botão de Geração */}
      <Button
        onClick={generateDescription}
        disabled={disabled || isGenerating || loading}
        variant={hasCustomInstruction ? "default" : "outline"}
        size="sm"
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Analisando...
          </>
        ) : (
          <>
            {hasCustomInstruction ? (
              <Settings size={16} className="mr-2" />
            ) : (
              <Brain size={16} className="mr-2" />
            )}
            {hasCustomInstruction 
              ? 'Executar Instrução' 
              : `IA: ${analysisMode[selectedMode as keyof typeof analysisMode]}`
            }
            <Sparkles size={14} className="ml-2" />
          </>
        )}
      </Button>

      {hasCustomInstruction && (
        <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          🎯 Modo personalizado ativo: "{currentDescription.substring(0, 50)}..."
        </p>
      )}
    </div>
  );
};

export default DescricaoAutomaticaAvancada;