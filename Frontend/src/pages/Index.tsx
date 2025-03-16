import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GithubUser, GithubStats, Repository } from '../lib/types';
import { fetchRepositories,fetchUserDetails  } from '../api/githubApi';
import Navbar from '../components/Navbar';
import ProfileHeader from '../components/ProfileHeader';
import StatCard from '../components/StatCard';
import ContributionCalendar from '../components/ContributionCalendar';
import ActivityTimeline from '../components/ActivityTimeline';
import RepositoryList from '../components/RepositoryList';
import LanguageChart from '../components/LanguageChart';
import { 
  GitCommit, 
  //GitPullRequest, 
  //MessageSquare, 
  Folder, 
  //Star, 
  //Sparkles,
  ArrowUp
} from 'lucide-react';
//import { Button } from '../components/ui/button';
//import { useToast } from '../hooks/use-toast';

const Index = () => {
  //const [apiUrl, setApiUrl] = useState<string>('');
  //const [isConfigured, setIsConfigured] = useState<boolean>(false);
  //const { toast } = useToast();

  const { data: user, isLoading: isUserLoading } = useQuery<GithubUser>({
    queryKey: ['githubUser'],
    queryFn: fetchUserDetails,
  });

  const { data: stats = {} as GithubStats, isLoading: isStatsLoading } = useQuery<GithubStats>({
    queryKey: ['githubStats'],
    // queryFn: fetchGithubStats,
  });

  const { data: repositories = [], isLoading: isReposLoading } = useQuery<Repository[]>({
    queryKey: ['repositories'],
    queryFn: fetchRepositories,
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container px-4 py-8">
        {/* Profile Section */}
        <section className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <ProfileHeader 
            user={user} 
            isLoading={isUserLoading} 
          />
        </section>
        
        {/* Stats Overview */}
        <section className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stats ? (
              <StatCard 
                title="Total Commits" 
                value={stats.totalCommits}
                icon={<GitCommit className="h-5 w-5" />}
                description="Last year"
                trend="up"
                trendValue="12%"
                isLoading={isStatsLoading}
              />
            ) : (
              <p className="text-center text-muted-foreground">Stats not found</p>
            )}

            {stats ? (
              <StatCard 
                title="Pull Request" 
                value={stats.totalCommits}
                icon={<GitCommit className="h-5 w-5" />}
                description="Last year"
                trend="up"
                trendValue="12%"
                isLoading={isStatsLoading}
              />
            ) : (
              <p className="text-center text-muted-foreground">Stats not found</p>
            )}

            {stats ? (
              <StatCard 
                title="Issues" 
                value={stats.totalCommits}
                icon={<GitCommit className="h-5 w-5" />}
                description="Last year"
                trend="up"
                trendValue="12%"
                isLoading={isStatsLoading}
              />
            ) : (
              <p className="text-center text-muted-foreground">Stats not found</p>
            )}

            <StatCard 
              title="Repositories" 
              value={stats?.totalRepos || 0}
              icon={<Folder className="h-5 w-5" />}
              description="Total"
              isLoading={isStatsLoading}
            />

            {stats ? (
              <StatCard 
                title="Star Given" 
                value={stats.totalCommits}
                icon={<GitCommit className="h-5 w-5" />}
                description="Last year"
                trend="up"
                trendValue="12%"
                isLoading={isStatsLoading}
              />
            ) : (
              <p className="text-center text-muted-foreground">Stats not found</p>
            )}

            {stats ? (
              <StatCard 
                title="Star Received" 
                value={stats.totalCommits}
                icon={<GitCommit className="h-5 w-5" />}
                description="Last year"
                trend="up"
                trendValue="12%"
                isLoading={isStatsLoading}
              />
            ) : (
              <p className="text-center text-muted-foreground">Stats not found</p>
            )}
          </div>
        </section>
        
        {/* Contribution Calendar */}
        <section className="mb-8 opacity-0 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <ContributionCalendar 
            calendar={stats?.contributionCalendar}
            isLoading={isStatsLoading}
          />
        </section>
        
        {/* Repositories and Activity */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="opacity-0 animate-slide-up bg-gray-100 dark:bg-gray-800 p-4 rounded-lg" style={{ animationDelay: '400ms' }}>
            <RepositoryList 
              repositories={repositories || []} // Pass the fetched repositories
              isLoading={isReposLoading} // Pass the loading state
              className="h-full"
            />
          </div>
          
          <div className="opacity-0 animate-slide-up bg-gray-100 dark:bg-gray-800 p-4 rounded-lg" style={{ animationDelay: '500ms' }}>
            <ActivityTimeline 
              activities={stats?.recentActivity}
              isLoading={isStatsLoading}
              className="h-full"
            />
          </div>
        </section>
        
        {/* Languages */}
        <section className="opacity-0 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <LanguageChart 
            languages={stats?.topLanguages}
            isLoading={isStatsLoading}
          />
        </section>
        
      </main>
      
      {/* Footer */}
      <footer className="py-6 border-t dark:border-gray-700">
        <div className="container px-4 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
            GitHub Stats Dashboard • {new Date().getFullYear()}
          </p>
          <p className="text-sm text-muted-foreground">
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-2 rounded-full bg-primary text-primary-foreground shadow-md opacity-0 animate-fade-in hover:scale-110 transition-transform"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Index;
