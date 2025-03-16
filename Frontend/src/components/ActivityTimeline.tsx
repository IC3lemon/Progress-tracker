
import React from 'react';
import { Contribution } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { GitCommit, GitPullRequest, GitMerge, CircleHelp, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface ActivityTimelineProps {
  activities?: Contribution[];
  isLoading?: boolean;
  className?: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities = [],
  isLoading = false,
  className,
}) => {
  // Helper to get the right icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="h-4 w-4 text-github-blue" />;
      case 'pr':
        return <GitPullRequest className="h-4 w-4 text-github-green" />;
      case 'issue':
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      case 'review':
        return <GitMerge className="h-4 w-4 text-purple-500" />;
      default:
        return <CircleHelp className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Helper to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = activity.date.split('T')[0]; // Get just the date part
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Contribution[]>);
  
  // Get activity type label
  const getActivityTypeLabel = (type: string, count: number) => {
    switch (type) {
      case 'commit':
        return `${count} commit${count > 1 ? 's' : ''}`;
      case 'pr':
        return `${count} pull request${count > 1 ? 's' : ''}`;
      case 'issue':
        return `${count} issue${count > 1 ? 's' : ''}`;
      case 'review':
        return `${count} review${count > 1 ? 's' : ''}`;
      default:
        return `${count} contribution${count > 1 ? 's' : ''}`;
    }
  };

  return (
    <Card className={cn("w-full h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
            {Object.entries(groupedActivities).map(([date, dateActivities], groupIndex) => (
              <div key={date} className="relative opacity-0 animate-slide-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      {getActivityIcon(dateActivities[0].type)}
                    </div>
                    {groupIndex < Object.keys(groupedActivities).length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium">
                        {dateActivities.map(a => getActivityTypeLabel(a.type, a.count)).join(', ')} to{' '}
                        <a href={dateActivities[0].url} className="text-github-blue hover:underline" target="_blank" rel="noopener noreferrer">
                          {dateActivities[0].repositoryName}
                        </a>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(dateActivities[0].date)}
                      </p>
                    </div>
                    
                    {dateActivities[0].title && (
                      <p className="text-sm text-muted-foreground">
                        {dateActivities[0].title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityTimeline;
