import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';

// Pages
import Home from '@/pages/index';
import Create from '@/pages/create';
import Dashboard from '@/pages/dashboard';
import CardView from '@/pages/card';
import MemoryPublicView from '@/pages/memory';
import ListenPublicView from '@/pages/listen';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Switch>
        <Route path="/listen/:id">
          <ListenPublicView />
        </Route>
        <Route path="/memory/:id">
          <MemoryPublicView />
        </Route>
        
        <Route>
          <Navigation />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/create" component={Create} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/card/:id" component={CardView} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
