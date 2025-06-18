
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Eye, FileImage } from 'lucide-react';

interface FotoData {
  file: File;
  preview: string;
  descricao: string;
}

interface FotoPreviewProps {
  foto: FotoData;
  index: number;
  onRemove: () => void;
  onPreview: () => void;
}

const FotoPreview = ({ foto, index, onRemove, onPreview }: FotoPreviewProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative aspect-square">
        <img
          src={foto.preview}
          alt={`Preview ${index + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay com ações */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onPreview}
            className="bg-white/90 hover:bg-white"
          >
            <Eye size={16} />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onRemove}
          >
            <X size={16} />
          </Button>
        </div>

        {/* Badge com número */}
        <Badge className="absolute top-2 left-2 bg-teal-600">
          {index + 1}
        </Badge>
      </div>

      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <FileImage size={16} className="text-gray-500" />
            <span className="truncate font-medium">{foto.file.name}</span>
          </div>
          
          <div className="text-xs text-gray-500">
            {formatFileSize(foto.file.size)} • {foto.file.type.split('/')[1].toUpperCase()}
          </div>
          
          {foto.descricao && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {foto.descricao}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FotoPreview;
