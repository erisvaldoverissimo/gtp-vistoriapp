
import React from 'react';
import { Building2, FileImage, List, Settings, Building, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const navigation = [
    { id: 'vistorias', label: 'Vistorias', icon: List },
    { id: 'nova-vistoria', label: 'Nova Vistoria', icon: FileImage },
    { id: 'condominios', label: 'Condomínios', icon: Building },
    { id: 'chat-ia', label: 'Chat IA', icon: MessageCircle },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 size={32} />
              <div>
                <h1 className="text-xl font-bold">VistoriaApp</h1>
                <p className="text-teal-100 text-sm">Sistema de Relatórios de Vistorias</p>
              </div>
            </div>
            <div className="hidden md:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "secondary" : "ghost"}
                    onClick={() => onNavigate(item.id)}
                    className={`text-white ${currentPage === item.id ? 'bg-teal-600' : 'hover:bg-teal-600'}`}
                  >
                    <Icon size={18} className="mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-teal-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => onNavigate(item.id)}
                  className={`flex-1 text-white ${currentPage === item.id ? 'bg-teal-700' : 'hover:bg-teal-700'}`}
                >
                  <Icon size={16} className="mr-1" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
