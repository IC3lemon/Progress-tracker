
import React from 'react';
import { Card, CardContent } from "../components/ui/card";
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  onClick?: () => void;
  isLoading?: boolean; // Added isLoading prop
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  className,
  onClick,
  isLoading = false, // Default to false
}) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden card-hover", 
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-2">
              <h3 className="stat-label">{title}</h3>
              {icon && <div className="text-muted-foreground">{icon}</div>}
            </div>
            
            <div className="space-y-1">
              <p className="stat-value">
                {typeof value === 'number' && value >= 1000 
                  ? `${(value / 1000).toFixed(1)}k`
                  : value}
              </p>
              
              {(description || trend) && (
                <div className="flex items-center text-xs">
                  {trend && (
                    <span className={
                      cn("flex items-center mr-1 font-medium",
                        trend === 'up' && "text-green-500",
                        trend === 'down' && "text-red-500",
                        trend === 'neutral' && "text-github-gray"
                      )
                    }>
                      {trend === 'up' && '↑ '}
                      {trend === 'down' && '↓ '}
                      {trendValue}
                    </span>
                  )}
                  
                  {description && (
                    <span className="text-muted-foreground">{description}</span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
