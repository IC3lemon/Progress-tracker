
import React from 'react';
import { GithubUser } from '../lib/types';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Building, Link as LinkIcon, Users, Calendar } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

interface ProfileHeaderProps {
  user?: GithubUser;
  isLoading?: boolean;
  className?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  isLoading = false,
  className 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {isLoading ? (
            <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          ) : (
            <img 
              src={user?.avatar_url} 
              alt={`${user?.name}'s avatar`} 
              className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md shrink-0"
            />
          )}
          
          <div className="space-y-3 flex-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full max-w-lg" />
                <div className="flex flex-wrap gap-4 pt-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{user?.name}</h1>
                  <p className="text-muted-foreground">@{user?.username}</p>
                </div>
                
                {user?.bio && (
                  <p className="text-sm text-foreground/90 max-w-lg">{user?.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-1">
                  {user?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </span>
                  )}
                  
                  {user?.company && (
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {user.company}
                    </span>
                  )}
                  
                  {user?.blog && (
                    <span className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" />
                      <a 
                        href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-github-blue hover:underline"
                      >
                        {user.blog}
                      </a>
                    </span>
                  )}
                  
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      <span className="font-medium">{user?.followers?.toLocaleString()}</span> followers 
                      · <span className="font-medium">{user?.following?.toLocaleString()}</span> following
                    </span>
                  </span>
                  
                  {user?.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined on {formatDate(user.created_at)}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
