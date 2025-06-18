
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import { UploadProgress as UploadProgressType } from '@/hooks/useFotosSupabase';

interface UploadProgressProps {
  progress: UploadProgressType;
}

const UploadProgress = ({ progress }: UploadProgressProps) => {
  return (
    <Card className="border-teal-200 bg-teal-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-teal-800 flex items-center gap-2">
          <Loader2 className="animate-spin" size={20} />
          Enviando Fotos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-teal-700">
            Foto {progress.current} de {progress.total}
          </span>
          <span className="font-semibold text-teal-800">
            {progress.percentage}%
          </span>
        </div>
        
        <Progress 
          value={progress.percentage} 
          className="h-3"
        />
        
        <div className="flex items-center gap-2 text-sm text-teal-600">
          <Upload size={16} />
          <span className="truncate">
            Enviando: {progress.currentFileName}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadProgress;
