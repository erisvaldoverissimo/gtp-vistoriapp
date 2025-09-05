
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { signIn, user, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  
  // Formulários
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  

  // Redirecionar se já estiver logado
  useEffect(() => {
    document.title = 'Entrar | Sistema de Vistorias';
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!loginForm.email || !loginForm.password) {
      setError('Preencha todos os campos');
      setLoading(false);
      return;
    }

    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Email não confirmado. Verifique sua caixa de entrada e confirme seu email antes de fazer login.');
      } else if (error.message.includes('signup_disabled')) {
        setError('Cadastro desabilitado. Entre em contato com o administrador.');
      } else {
        setError('Erro ao fazer login: ' + error.message);
      }
    } else {
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (!resetEmail) {
      setError('Digite seu email');
      setLoading(false);
      return;
    }

    const { error } = await resetPassword(resetEmail);
    
    if (error) {
      setError('Erro ao enviar email de redefinição: ' + error.message);
    } else {
      setSuccess('Email de redefinição enviado! Verifique sua caixa de entrada.');
      setShowResetPassword(false);
      setResetEmail('');
    }
    
    setLoading(false);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Building className="mx-auto h-12 w-12 text-teal-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Sistema de Vistorias
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Acesse sua conta
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-xl">
                {showResetPassword ? 'Redefinir Senha' : 'Entrar na sua conta'}
              </CardTitle>
            </CardHeader>

            {!showResetPassword ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Sua senha"
                      className="pl-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-teal-600 hover:text-teal-700 text-sm underline"
                    onClick={() => setShowResetPassword(true)}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">Cadastro somente via Administrador.</p>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-700 text-sm underline"
                    onClick={() => setShowResetPassword(false)}
                  >
                    Voltar ao login
                  </button>
                </div>
              </form>
            )}

            {success && (
              <Alert className="mt-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert className="mt-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
