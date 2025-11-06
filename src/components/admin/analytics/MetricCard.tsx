'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
  description?: string;
  icon?: React.ReactNode;
  valueColor?: string;
}

export function MetricCard({
  title,
  value,
  previousValue,
  trend,
  changePercent,
  description,
  icon,
  valueColor = 'text-foreground',
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';

    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  const formatChangePercent = (percent: number) => {
    const abs = Math.abs(percent);
    const sign = percent > 0 ? '+' : '';
    return `${sign}${abs.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>

        {(trend || changePercent !== undefined) && (
          <div className="mt-2 flex items-center space-x-2">
            {getTrendIcon()}
            {changePercent !== undefined && (
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {formatChangePercent(changePercent)}
              </span>
            )}
            {previousValue !== undefined && (
              <span className="text-sm text-muted-foreground">
                from {previousValue.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {description && (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
