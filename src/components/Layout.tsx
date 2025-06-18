
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  Users, 
  Building, 
  Settings, 
  MessageSquare,
  Layers,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'vistorias', label: 'Vistorias', icon: Home },
    { id: 'nova-vistoria', label: 'Nova Vistoria', icon: FileText },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'condominios', label: 'Condomínios', icon: Building },
    { id: 'ambientes-grupos', label: 'Ambientes e Grupos', icon: Layers },
    { id: 'chat-ia', label: 'Chat IA', icon: MessageSquare },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Sistema de Vistorias</h1>
          <p className="text-sm text-gray-600 mt-1">Relatórios Técnicos</p>
        </div>
        
        <nav className="px-4 pb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={`w-full justify-start mb-2 ${
                  currentPage === item.id 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
          
          <div className="border-t pt-4 mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sair
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
};

export default Layout;
