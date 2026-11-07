import { Link } from 'wouter';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="bg-paper flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-7xl font-semibold text-foreground/10">404</p>
      <h1 className="mt-2 font-serif text-2xl font-semibold">{t('notFound.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('notFound.description')}</p>
      <Link href="/" className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground">
        {t('notFound.home')}
      </Link>
    </div>
  );
}
