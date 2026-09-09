import React from 'react';
import { Link, useLocation } from 'wouter';
import { Globe, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const [location] = useLocation();
  const { language, setLanguage, t, isRTL } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/60 backdrop-blur-xl dark:bg-black/60 transition-colors">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-lg group-hover:scale-105 transition-transform">
            {t('memory.brand').charAt(0)}
          </div>
          <span className="font-serif font-semibold text-xl tracking-tight text-foreground">
            {t('memory.brand')}
          </span>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {location !== '/' && location !== '/create' && !location.startsWith('/memory/') && (
            <Link href="/dashboard" className="hidden sm:flex">
              <Button variant="ghost" className="gap-2 font-medium">
                <LayoutDashboard className="w-4 h-4" />
                {t('nav.dashboard')}
              </Button>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="rounded-full w-9 h-9"
            title={t('nav.toggleLanguage')}
          >
            <Globe className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
          </Button>

          {location !== '/create' && !location.startsWith('/memory/') && (
            <Link href="/create">
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.create')}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
