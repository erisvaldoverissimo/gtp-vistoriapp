
import React from 'react';
import { Building2, FileImage, List, Settings, Building, MessageCircle, Users, Menu, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const isMobile = useIsMobile();
  
  const navigation = [
    { id: 'vistorias', label: 'Vistorias', icon: List },
    { id: 'nova-vistoria', label: 'Nova Vistoria', icon: FileImage },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'condominios', label: 'Condomínios', icon: Building },
    { id: 'ambientes-grupos', label: 'Ambientes/Grupos', icon: MapPin },
    { id: 'chat-ia', label: 'Chat IA', icon: MessageCircle },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-brand-purple text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 size={isMobile ? 24 : 32} />
              <div>
                <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>VistoriaApp</h1>
                <p className={`text-purple-200 ${isMobile ? 'text-xs' : 'text-sm'}`}>Sistema de Relatórios de Vistorias</p>
              </div>
            </div>
            {!isMobile && (
              <div className="hidden md:flex space-x-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? "secondary" : "ghost"}
                      onClick={() => onNavigate(item.id)}
                      className={`text-white ${currentPage === item.id ? 'bg-brand-green hover:bg-brand-green' : 'hover:bg-brand-purple-light'}`}
                    >
                      <Icon size={18} className="mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className="bg-brand-purple-light text-white overflow-x-auto">
          <div className="flex min-w-max px-2 py-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => onNavigate(item.id)}
                  className={`flex-shrink-0 mx-1 text-white ${currentPage === item.id ? 'bg-brand-green' : 'hover:bg-brand-purple'}`}
                  size="sm"
                >
                  <Icon size={16} className="mr-1" />
                  <span className="text-xs whitespace-nowrap">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={`container mx-auto ${isMobile ? 'px-2 py-4' : 'px-4 py-6'}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
