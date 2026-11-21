import { Link, useLocation } from 'wouter';
import { LayoutGrid, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden="true">
      <defs>
        <linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f472b6" /><stop offset=".5" stopColor="#a78bfa" /><stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <rect x="5" y="2" width="22" height="28" rx="7" fill="url(#bm)" />
      <rect x="9" y="6" width="14" height="14" rx="4" fill="#fff" opacity=".95" />
      <path d="M16 11.2c-.9-1.6-3.6-1.3-3.6.9 0 1.7 2.3 3.1 3.6 4 1.3-.9 3.6-2.3 3.6-4 0-2.2-2.7-2.5-3.6-.9z" fill="#ec4899" />
      <rect x="9" y="23" width="5" height="3" rx="1.5" fill="#fff" />
      <rect x="15.5" y="23" width="7.5" height="3" rx="1.5" fill="#fff" opacity=".6" />
    </svg>
  );
}

export function Navigation() {
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const links = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutGrid },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#f3e8ff] bg-white/80 backdrop-blur-xl print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5" data-testid="link-home">
          <BrandMark />
          <span className="text-xl font-bold tracking-tight text-primary">{t('memory.brand')}</span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors sm:flex',
                location.startsWith(href) ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          <div className="flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-semibold" role="group" aria-label={t('nav.toggleLanguage')}>
            {(['ar', 'en'] as const).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => setLanguage(lng)}
                className={cn(
                  'rounded-full px-3 py-1.5 transition-colors',
                  language === lng ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
                data-testid={`lang-${lng}`}
              >
                {lng === 'ar' ? 'ع' : 'EN'}
              </button>
            ))}
          </div>

          {location !== '/create' && (
            <Link
              href="/create"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] px-4 py-2 text-sm font-bold text-white shadow-md transition hover:scale-[1.04] active:scale-[0.98]"
              data-testid="nav-create"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.create')}</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
