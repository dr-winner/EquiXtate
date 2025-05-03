
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  percentChange?: number;
  icon?: LucideIcon;
  iconColor: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  percentChange, 
  icon: Icon, 
  iconColor, 
  subtitle 
}) => {
  return (
    <Card className="bg-space-deep-purple/30 border-space-deep-purple">
      <CardHeader className="p-3">
        <CardTitle className="text-sm text-gray-300">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex items-center gap-2">
          <p className={`text-xl font-orbitron ${iconColor}`}>
            {value}
          </p>
          {percentChange !== undefined && Icon && (
            <Icon className={`${iconColor} h-4 w-4`} />
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
