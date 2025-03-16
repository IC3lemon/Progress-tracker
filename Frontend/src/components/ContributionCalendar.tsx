
import React from 'react';
import { ContributionCalendar as ContributionCalendarType } from '../lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { cn } from '../lib/utils';

interface ContributionCalendarProps {
  calendar?: ContributionCalendarType;
  isLoading?: boolean;
  className?: string;
}

const ContributionCalendar: React.FC<ContributionCalendarProps> = ({
  calendar,
  isLoading = false,
  className,
}) => {
  // Month labels
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get month indices for the calendar
  const getMonthLabels = () => {
    if (!calendar?.weeks || calendar.weeks.length === 0) return [];
    
    const labels: { month: string; index: number }[] = [];
    const firstDay = new Date(calendar.weeks[0].days[0].date);
    let currentMonth = firstDay.getMonth();
    
    // Add first month
    labels.push({ month: months[currentMonth], index: 0 });
    
    // Traverse the weeks to find month changes
    calendar.weeks.forEach((week, i) => {
      week.days.forEach((day) => {
        const date = new Date(day.date);
        const month = date.getMonth();
        
        if (month !== currentMonth) {
          labels.push({ month: months[month], index: i });
          currentMonth = month;
        }
      });
    });
    
    return labels;
  };
  
  const monthLabels = getMonthLabels();
  
  // Day labels (Mon, Wed, Fri)
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  
  // Level to color mapping
  const levelColors = [
    'bg-github-lightGray hover:bg-github-gray/20', // Level 0
    'bg-github-green/20 hover:bg-github-green/30', // Level 1
    'bg-github-green/40 hover:bg-github-green/50', // Level 2
    'bg-github-green/60 hover:bg-github-green/70', // Level 3
    'bg-github-green/80 hover:bg-github-green/90'  // Level 4
  ];
  
  // Format date: Feb 14, 2023
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Contribution Activity</CardTitle>
        <CardDescription>
          {isLoading
            ? <Skeleton className="h-4 w-48" />
            : `${calendar?.totalContributions?.toLocaleString() || 0} contributions in the last year`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[120px] w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[730px]">
              <div className="flex">
                {/* Day labels column */}
                <div className="flex flex-col justify-between pr-2 pt-6 text-xs text-muted-foreground">
                  {dayLabels.map((day, i) => (
                    <div key={i} className="h-[15px] flex items-center">{day}</div>
                  ))}
                </div>
                
                {/* Calendar grid and month labels */}
                <div className="flex-1">
                  {/* Month labels */}
                  <div className="flex text-xs text-muted-foreground mb-1 relative h-5">
                    {monthLabels.map((label, i) => (
                      <div
                        key={i}
                        className="absolute"
                        style={{ 
                          left: `${(label.index / (calendar?.weeks?.length || 52)) * 100}%` 
                        }}
                      >
                        {label.month}
                      </div>
                    ))}
                  </div>
                  
                  {/* Contribution grid */}
                  <div className="grid grid-flow-col gap-[2px]">
                    {calendar?.weeks?.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-flow-row gap-[2px]">
                        {week.days.map((day, dayIndex) => (
                          <TooltipProvider key={dayIndex}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] rounded-sm transition-all duration-100",
                                    levelColors[day.level]
                                  )}
                                ></div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-xs">
                                  <span className="font-medium">
                                    {day.count} {day.count === 1 ? 'contribution' : 'contributions'}
                                  </span>
                                  <br />
                                  {formatDate(day.date)}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-end mt-4 text-xs text-muted-foreground">
                <span className="mr-2">Less</span>
                {levelColors.map((color, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-[10px] h-[10px] mr-[2px] rounded-sm",
                      color.split(' ')[0] // Just get the base color without the hover
                    )}
                  ></div>
                ))}
                <span className="ml-2">More</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContributionCalendar;
