
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatIA = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Carregar configurações da IA
  const [config, setConfig] = useState({
    nomeAgente: 'Theo',
    promptPersona: '',
    promptObjetivo: '',
    promptComportamento: '',
    enableAgente: true,
    apiKeyOpenAI: ''
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('configuracoes');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setConfig({
        nomeAgente: parsedConfig.nomeAgente || 'Theo',
        promptPersona: parsedConfig.promptPersona || '',
        promptObjetivo: parsedConfig.promptObjetivo || '',
        promptComportamento: parsedConfig.promptComportamento || '',
        enableAgente: parsedConfig.enableAgente || true,
        apiKeyOpenAI: parsedConfig.apiKeyOpenAI || ''
      });
    }
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Detectar o tipo de API baseado na chave
  const detectApiProvider = (apiKey: string) => {
    if (apiKey.startsWith('sk-')) {
      return { provider: 'openai', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' };
    } else if (apiKey.startsWith('gsk_')) {
      return { provider: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.1-8b-instant' };
    }
    return null;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (!config.enableAgente) {
      toast({
        title: "Agente IA Desabilitado",
        description: "Habilite o agente IA nas configurações primeiro.",
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

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Construir o prompt completo do sistema
      const systemPrompt = `${config.promptPersona}\n\n${config.promptObjetivo}\n\n${config.promptComportamento}`;

      console.log('Enviando para:', apiInfo.provider, apiInfo.url);
      console.log('Modelo:', apiInfo.model);

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
              role: 'system',
              content: systemPrompt
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: inputMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro da API:', errorData);
        throw new Error(`Erro na API ${apiInfo.provider}: ${response.status}`);
      }

      const data = await response.json();
      console.log('Resposta recebida:', data);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "Mensagem Enviada",
        description: `Resposta recebida via ${apiInfo.provider.toUpperCase()}`,
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro na Comunicação",
        description: `Não foi possível se comunicar com a IA. Verifique sua API Key.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Limpo",
      description: "Histórico de conversa foi removido.",
    });
  };

  // Detectar o provedor atual para exibir na interface
  const currentProvider = config.apiKeyOpenAI ? detectApiProvider(config.apiKeyOpenAI) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Chat com IA - {config.nomeAgente}</h2>
          {currentProvider && (
            <p className="text-sm text-gray-600">
              Conectado via {currentProvider.provider.toUpperCase()} ({currentProvider.model})
            </p>
          )}
        </div>
        <Button onClick={clearChat} variant="outline">
          <MessageCircle size={18} className="mr-2" />
          Limpar Chat
        </Button>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Bot size={20} className="mr-2" />
            Conversa com {config.nomeAgente}
            {!config.enableAgente && (
              <span className="ml-2 text-sm text-red-500 font-normal">(Desabilitado)</span>
            )}
            {currentProvider && (
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                {currentProvider.provider.toUpperCase()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Bot size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Inicie uma conversa com {config.nomeAgente}</p>
                  <p className="text-sm mt-2">Digite sua mensagem abaixo para começar</p>
                  {currentProvider && (
                    <p className="text-xs mt-2 text-gray-400">
                      Usando {currentProvider.provider.toUpperCase()} - {currentProvider.model}
                    </p>
                  )}
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <Bot size={24} className="text-teal-600" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-teal-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <User size={24} className="text-teal-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <Bot size={24} className="text-teal-600" />
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Digite sua mensagem para ${config.nomeAgente}...`}
              disabled={isLoading || !config.enableAgente}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={isLoading || !inputMessage.trim() || !config.enableAgente}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Send size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatIA;
