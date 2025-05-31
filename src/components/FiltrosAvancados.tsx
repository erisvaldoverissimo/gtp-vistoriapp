
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar } from 'lucide-react';

interface FiltrosAvancadosProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
  onClearFilters: () => void;
}

const FiltrosAvancados = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  onClearFilters
}: FiltrosAvancadosProps) => {
  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'Conforme', label: 'Conforme' },
    { value: 'Não Conforme', label: 'Não Conforme' },
    { value: 'Requer Atenção', label: 'Requer Atenção' },
    { value: 'N/A', label: 'N/A' }
  ];

  const hasActiveFilters = searchTerm || statusFilter || dateFilter;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar por condomínio, número ou responsável..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="text-gray-500" size={20} />
            
            {/* Filtro por Status */}
            <div className="flex space-x-1">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onStatusFilterChange(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Filtro por Data */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="pl-10 w-40"
                placeholder="Filtrar por data"
              />
            </div>

            {/* Limpar Filtros */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-800"
              >
                <X size={16} className="mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Indicadores de Filtros Ativos */}
        {hasActiveFilters && (
          <div className="flex items-center space-x-2 mt-3 pt-3 border-t">
            <span className="text-sm text-gray-600">Filtros ativos:</span>
            {searchTerm && (
              <Badge variant="outline" className="text-xs">
                Busca: {searchTerm}
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="outline" className="text-xs">
                Status: {statusFilter}
              </Badge>
            )}
            {dateFilter && (
              <Badge variant="outline" className="text-xs">
                Data: {new Date(dateFilter).toLocaleDateString('pt-BR')}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FiltrosAvancados;
