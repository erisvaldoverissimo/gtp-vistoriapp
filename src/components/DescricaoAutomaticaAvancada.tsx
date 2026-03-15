import React, { useState } from 'react';
import { getTokenParam } from '@/utils/ai/tokenParams';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Loader2, Sparkles, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useBaseConhecimento } from '@/hooks/useBaseConhecimento';
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
  const { buscarConhecimentoRelevante } = useBaseConhecimento();

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
    const modeloConfigurado = obterConfiguracao('ia_modelo', 'gpt-4o');
    if (apiKey.startsWith('sk-')) {
      return { provider: 'openai', url: 'https://api.openai.com/v1/chat/completions', model: modeloConfigurado };
    } else if (apiKey.startsWith('gsk_')) {
      return { provider: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.2-11b-vision-preview' };
    }
    return null;
  };

  // Gerar contexto inteligente baseado nas informações disponíveis
  const buildContextualPrompt = async (mode: string) => {
    const exemploDescricoes = obterConfiguracao('agente_exemplos_descricoes', []);
    const exemplosTexto = exemploDescricoes.length > 0 
      ? `\n\nEXEMPLOS DO SEU PADRÃO DE ESCRITA:\n${exemploDescricoes.map((ex: string, i: number) => `${i + 1}. ${ex}`).join('\n')}\n\nSiga este mesmo estilo e estrutura nos exemplos acima.`
      : '';

    // Buscar conhecimento relevante baseado no contexto
    const contextoAnalise = `${ambiente || ''} ${grupo || ''} ${selectedMode}`.trim();
    const conhecimentoRelevante = await buscarConhecimentoRelevante(contextoAnalise, grupo?.toLowerCase());
    
    const conhecimentoTexto = conhecimentoRelevante.length > 0
      ? `\n\nBASE DE CONHECIMENTO TÉCNICO RELEVANTE:\n${conhecimentoRelevante.map((c, i) => 
          `${i + 1}. ${c.titulo} (${c.categoria}):\n${c.conteudo_extraido.substring(0, 500)}...\n`
        ).join('\n')}\n\nUse este conhecimento técnico para enriquecer sua análise quando aplicável.`
      : '';

    const baseContext = `
Você é um engenheiro civil especialista em engenharia diagnóstica e vistorias prediais com 20+ anos de experiência em patologias construtivas.

REGRA CRÍTICA DE LIMITE:
- Sua resposta DEVE ter NO MÁXIMO 280 caracteres (incluindo espaços e pontuação).
- Conte os caracteres antes de responder. Se ultrapassar 280, reescreva mais curto.
- TERMINE sempre com uma frase completa seguida de ponto final.
- NUNCA deixe o texto cortado no meio de uma frase.

REGRAS DE ESTILO:
- NUNCA comece com "A imagem mostra", "Na imagem", "Observa-se na imagem" ou similares
- Comece DIRETAMENTE pelo elemento construtivo ou patologia identificada
- Texto corrido técnico em parágrafo único, como laudo de engenharia diagnóstica
- Use vocabulário técnico: fissura, trinca, eflorescência, desplacamento, infiltração, carbonatação, corrosão de armadura, bolor, desagregação, empolamento, vesícula, junta de dilatação, argamassa, substrato, alvenaria, verga, pingadeira
- Identifique quando possível: elemento construtivo, tipo de patologia/condição, extensão, gravidade aparente e causa provável

CONTEXTO DA VISTORIA:
${ambiente ? `- Ambiente: ${ambiente}` : ''}
${grupo ? `- Grupo de Vistoria: ${grupo}` : ''}
${status ? `- Status Atual: ${status}` : ''}
${condominioInfo?.nome ? `- Condomínio: ${condominioInfo.nome}` : ''}
${condominioInfo?.tipo ? `- Tipo: ${condominioInfo.tipo}` : ''}${exemplosTexto}${conhecimentoTexto}
`;

    const specificPrompts = {
      auto: `
ANÁLISE INTELIGENTE (MÁXIMO 300 CARACTERES):
- Identifique o principal elemento, patologia ou atividade visível
- Descreva com precisão técnica a condição observada
- Inclua causa provável quando identificável
- Se houver serviço em execução, descreva técnica e materiais

EXEMPLO: "Fissura horizontal em alvenaria de vedação no terço inferior, abertura ~0,3mm, extensão aprox. 1,5m. Padrão sugere movimentação diferencial da fundação. Grau de risco: médio."`,

      estrutural: `
FOCO ESTRUTURAL (MÁXIMO 300 CARACTERES):
- Analise elementos estruturais: lajes, vigas, pilares, paredes portantes, fundações
- Identifique patologias: fissuras (classificar abertura), trincas, deformações, flechas excessivas, deslocamentos
- Avalie materiais: concreto (cobrimento, carbonatação), alvenaria, estrutura metálica (corrosão)
- Note sinais de deterioração, corrosão de armadura ou sobrecarga

EXEMPLO: "Trinca diagonal em alvenaria estrutural partindo do vértice da abertura de janela, abertura ~1mm, sem verga adequada. Indica concentração de tensões por ausência de reforço."`,

      instalacoes: `
FOCO INSTALAÇÕES (MÁXIMO 300 CARACTERES):
- Identifique instalações elétricas: quadros, disjuntores, fiação, tomadas, aterramento
- Observe instalações hidráulicas: tubulações (material e diâmetro), registros, válvulas, conexões
- Note condições de funcionamento, adequação técnica, sinais de obsolescência
- Identifique: vazamentos, manchas de umidade, oxidação, subdimensionamento

EXEMPLO: "Quadro de distribuição com disjuntores incompatíveis com a seção dos condutores. Fiação com emendas expostas fora de caixa de passagem, apresentando risco de curto-circuito."`,

      acabamentos: `
FOCO ACABAMENTOS (MÁXIMO 300 CARACTERES):
- Analise revestimentos: argamassa, cerâmica, porcelanato, pintura, gesso
- Identifique patologias: desplacamento, empolamento, vesículas, eflorescência, manchas
- Avalie aderência, nivelamento, planicidade, juntas de assentamento
- Note necessidade de reparos pontuais ou substituição integral

EXEMPLO: "Desplacamento de revestimento cerâmico em fachada, área aprox. 2m², com exposição do substrato de argamassa. Perda de aderência indica falha na camada de chapisco ou movimentação térmica."`,

      seguranca: `
FOCO SEGURANÇA (MÁXIMO 300 CARACTERES):
- Identifique elementos de proteção: guarda-corpos, corrimãos, antiderrapantes, sinalização
- Observe acessibilidade: rampas, larguras de passagem, desníveis, pisos táteis
- Note riscos: superfícies escorregadias, bordas desprotegidas, iluminação inadequada
- Avalie conformidade com requisitos básicos de segurança

EXEMPLO: "Guarda-corpo metálico com altura de 0,90m, abaixo do mínimo recomendado de 1,10m. Espaçamento entre balaústres superior a 11cm, apresentando risco para crianças."`,

      conservacao: `
FOCO CONSERVAÇÃO (MÁXIMO 300 CARACTERES):
- Classifique o estado: Bom / Regular / Ruim / Crítico
- Identifique agentes de degradação: umidade, insolação, agentes químicos, desgaste mecânico
- Note vida útil residual estimada quando possível
- Indique urgência de intervenção

EXEMPLO: "Elemento em estado regular de conservação. Pintura com descascamento generalizado e exposição do substrato. Presença de bolor nas regiões inferiores indica umidade ascendente recorrente."`,

      manutencao: `
FOCO MANUTENÇÃO (MÁXIMO 300 CARACTERES):
- Identifique necessidades de manutenção preventiva ou corretiva
- Priorize por urgência: imediata, curto prazo (30 dias), médio prazo (90 dias)
- Descreva o serviço necessário e materiais recomendados
- Note se requer profissional especializado

EXEMPLO: "Infiltração ativa em laje de cobertura com mancha de umidade de aprox. 3m². Necessária impermeabilização corretiva com manta asfáltica. Prioridade: curto prazo. Risco de dano ao forro de gesso."`,

      detalhado: `
ANÁLISE TÉCNICA DETALHADA (MÁXIMO 600 CARACTERES):
- Forneça análise minuciosa com identificação precisa da patologia
- Descreva mecanismo de deterioração e evolução provável
- Inclua recomendação técnica de reparo com materiais e método
- Indique necessidade de ensaios complementares se aplicável
- Classifique grau de risco e urgência de intervenção

EXEMPLO: "Fissuras mapeadas no revestimento de argamassa da fachada norte, abertura média de 0,2mm, distribuídas uniformemente na superfície. Padrão característico de retração da argamassa por dosagem inadequada ou cura deficiente. Não apresenta comprometimento estrutural. Recomenda-se tratamento superficial com selante flexível de poliuretano após limpeza e abertura dos sulcos. Prioridade: médio prazo."`
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
        const systemPrompt = await buildContextualPrompt(selectedMode);
        
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
        auto: 250,
        estrutural: 250,
        instalacoes: 250,
        acabamentos: 250,
        seguranca: 250,
        conservacao: 250,
        manutencao: 250,
        detalhado: 400
      };

      const tokensValue = hasSpecificInstruction ? 300 : maxTokens[selectedMode as keyof typeof maxTokens];
      const requestBody = {
        model: apiInfo.model,
        messages: messages,
        ...getTokenParam(apiInfo.model, tokensValue),
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