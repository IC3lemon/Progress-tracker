
import React from 'react';
import { LanguageStat } from '../lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

interface LanguageChartProps {
  languages?: LanguageStat[];
  isLoading?: boolean;
  className?: string;
}

const LanguageChart: React.FC<LanguageChartProps> = ({
  languages = [],
  isLoading = false,
  className,
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const language = payload[0].payload;
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-sm">
          <p className="font-medium">{language.name}</p>
          <p className="text-sm">{language.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomizedLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center text-xs">
            <div 
              className="w-3 h-3 rounded-sm mr-1" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className={cn("w-full h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Top Languages</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[200px]">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </div>
        ) : (
          <div className="h-[270px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={languages}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="percentage"
                  animationDuration={800}
                  animationBegin={300}
                >
                  {languages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomizedLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguageChart;
