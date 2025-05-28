
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings, Mail, Image, Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Configuracoes = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    // Configurações da Empresa
    nomeEmpresa: 'VistoriaApp',
    emailEmpresa: 'contato@vistoriaapp.com.br',
    telefoneEmpresa: '(11) 99999-9999',
    
    // Configurações de Email SMTP
    smtpServer: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    
    // Configurações de Relatório
    logoEmpresa: '',
    corCabecalho: '#0f766e',
    assinaturaEmail: '',
    
    // Configurações de IA
    apiKeyOpenAI: '',
    enableAutoDescription: true,
    
    // Configurações Gerais
    limiteFotos: 10,
    tamanhoMaximoFoto: '5', // MB
    formatosPermitidos: 'JPEG, PNG, WebP'
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Salvando configurações:', config);
    toast({
      title: "Configurações Salvas",
      description: "Todas as configurações foram salvas com sucesso.",
    });
  };

  const handleTestEmail = () => {
    console.log('Testando configurações de email...');
    toast({
      title: "Teste de Email",
      description: "Email de teste enviado. Verifique sua caixa de entrada.",
    });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simular upload da logo
      toast({
        title: "Logo Carregada",
        description: "A logo da empresa foi carregada com sucesso.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
        <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">
          <Save size={18} className="mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings size={20} className="mr-2" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
              <Input
                id="nomeEmpresa"
                value={config.nomeEmpresa}
                onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="emailEmpresa">Email da Empresa</Label>
              <Input
                id="emailEmpresa"
                type="email"
                value={config.emailEmpresa}
                onChange={(e) => handleInputChange('emailEmpresa', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="telefoneEmpresa">Telefone</Label>
              <Input
                id="telefoneEmpresa"
                value={config.telefoneEmpresa}
                onChange={(e) => handleInputChange('telefoneEmpresa', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="logoUpload">Logo da Empresa</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="logoUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Upload size={16} className="mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="corCabecalho">Cor do Cabeçalho</Label>
              <Input
                id="corCabecalho"
                type="color"
                value={config.corCabecalho}
                onChange={(e) => handleInputChange('corCabecalho', e.target.value)}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail size={20} className="mr-2" />
              Configurações de Email (SMTP)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="smtpServer">Servidor SMTP</Label>
              <Input
                id="smtpServer"
                value={config.smtpServer}
                onChange={(e) => handleInputChange('smtpServer', e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpPort">Porta</Label>
                <Input
                  id="smtpPort"
                  value={config.smtpPort}
                  onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  checked={config.smtpSecure}
                  onCheckedChange={(checked) => handleInputChange('smtpSecure', checked)}
                />
                <Label>SSL/TLS</Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="smtpUser">Usuário</Label>
              <Input
                id="smtpUser"
                value={config.smtpUser}
                onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                placeholder="seu-email@gmail.com"
              />
            </div>
            
            <div>
              <Label htmlFor="smtpPassword">Senha</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={config.smtpPassword}
                onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="assinaturaEmail">Assinatura do Email</Label>
              <Textarea
                id="assinaturaEmail"
                value={config.assinaturaEmail}
                onChange={(e) => handleInputChange('assinaturaEmail', e.target.value)}
                placeholder="Atenciosamente,&#10;Equipe VistoriaApp"
                rows={3}
              />
            </div>

            <Button onClick={handleTestEmail} variant="outline" className="w-full">
              <Mail size={16} className="mr-2" />
              Testar Configurações de Email
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de IA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image size={20} className="mr-2" />
              Configurações de IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKeyOpenAI">API Key OpenAI</Label>
              <Input
                id="apiKeyOpenAI"
                type="password"
                value={config.apiKeyOpenAI}
                onChange={(e) => handleInputChange('apiKeyOpenAI', e.target.value)}
                placeholder="sk-..."
              />
              <p className="text-sm text-gray-600 mt-1">
                Necessária para descrição automática de imagens
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={config.enableAutoDescription}
                onCheckedChange={(checked) => handleInputChange('enableAutoDescription', checked)}
              />
              <Label>Habilitar descrição automática de imagens</Label>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload size={20} className="mr-2" />
              Configurações de Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="limiteFotos">Limite de Fotos por Vistoria</Label>
              <Input
                id="limiteFotos"
                type="number"
                value={config.limiteFotos}
                onChange={(e) => handleInputChange('limiteFotos', e.target.value)}
                min="1"
                max="50"
              />
            </div>

            <div>
              <Label htmlFor="tamanhoMaximoFoto">Tamanho Máximo por Foto (MB)</Label>
              <Input
                id="tamanhoMaximoFoto"
                type="number"
                value={config.tamanhoMaximoFoto}
                onChange={(e) => handleInputChange('tamanhoMaximoFoto', e.target.value)}
                min="1"
                max="20"
              />
            </div>

            <div>
              <Label htmlFor="formatosPermitidos">Formatos Permitidos</Label>
              <Input
                id="formatosPermitidos"
                value={config.formatosPermitidos}
                onChange={(e) => handleInputChange('formatosPermitidos', e.target.value)}
                readOnly
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;
