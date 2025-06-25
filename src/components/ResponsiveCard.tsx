
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const ResponsiveCard = ({ 
  title, 
  description, 
  children, 
  className,
  contentClassName 
}: ResponsiveCardProps) => {
  return (
    <Card className={cn('w-full', className)}>
      {(title || description) && (
        <CardHeader className="pb-4">
          {title && (
            <CardTitle className="text-lg sm:text-xl lg:text-2xl">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm sm:text-base">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn('p-4 sm:p-6', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ResponsiveCard;
