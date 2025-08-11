
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
  BookTemplate,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const menuItems = [
    { id: 'vistorias', label: 'Vistorias', icon: Home },
    { id: 'nova-vistoria', label: 'Nova Vistoria', icon: FileText },
    { id: 'templates', label: 'Templates', icon: BookTemplate },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'condominios', label: 'Condomínios', icon: Building },
    { id: 'ambientes-grupos', label: 'Ambientes e Grupos', icon: Layers },
    { id: 'chat-ia', label: 'Chat IA', icon: MessageSquare },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setSidebarOpen(false); // Fecha sidebar em mobile após navegação
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">Sistema de Vistorias</h1>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">Relatórios Técnicos</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <nav className="px-4 pb-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                className={`w-full justify-start mb-2 text-sm lg:text-base ${
                  currentPage === item.id 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => handleNavigate(item.id)}
              >
                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            );
          })}
          
          <div className="border-t pt-4 mt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 text-sm lg:text-base"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Sair</span>
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-gray-900 truncate">
            {menuItems.find(item => item.id === currentPage)?.label || 'Sistema de Vistorias'}
          </h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
