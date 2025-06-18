
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ObservacoesGeraisProps {
  observacoes: string;
  onObservacoesChange: (value: string) => void;
}

const ObservacoesGerais = ({ observacoes, onObservacoesChange }: ObservacoesGeraisProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Observações Gerais</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="observacoes">Observações Gerais</Label>
          <div className="space-y-2">
            <Textarea
              id="observacoes"
              value={observacoes || ''}
              onChange={(e) => onObservacoesChange(e.target.value)}
              placeholder="Observações adicionais..."
              className="min-h-[80px]"
            />
            <div className="flex justify-between items-center">
              <span className={`text-xs ${(observacoes?.length || 0) > 130 ? 'text-red-500' : 'text-gray-500'}`}>
                {observacoes?.length || 0}/150 caracteres
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ObservacoesGerais;
