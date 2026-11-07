import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, ImageIcon, HardDrive, Globe } from 'lucide-react';
import {
  useListCards,
  useGetCardStats,
  useDeleteCard,
  getListCardsQueryKey,
  getGetCardStatsQueryKey,
} from '@workspace/api-client-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MemoryFrame } from '@/components/MemoryFrame';
import { isDriveUrl } from '@/lib/drive';
import { loadTheme } from '@/lib/frame';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim()), 250);
    return () => clearTimeout(id);
  }, [search]);

  const params = debounced ? { search: debounced } : undefined;
  const { data: stats } = useGetCardStats({ query: { queryKey: getGetCardStatsQueryKey() } });
  const { data: cards, isLoading } = useListCards(params, { query: { queryKey: getListCardsQueryKey(params) } });
  const deleteCard = useDeleteCard();

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirmDelete'))) return;
    await deleteCard.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCardStatsQueryKey() });
  };

  const dateFmt = new Intl.DateTimeFormat(language === 'ar' ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-paper min-h-[calc(100dvh-4rem)] pb-20 pt-10">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <h1 className="font-serif text-4xl font-semibold">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.description')}</p>
          </div>
          {stats && (
            <dl className="flex divide-x divide-border rounded-2xl border border-border bg-card rtl:divide-x-reverse">
              <div className="px-6 py-3 text-center">
                <dt className="text-xs text-muted-foreground">{t('dashboard.stats.total')}</dt>
                <dd className="font-serif text-2xl font-semibold">{stats.total}</dd>
              </div>
              <div className="px-6 py-3 text-center">
                <dt className="text-xs text-muted-foreground">{t('dashboard.stats.completed')}</dt>
                <dd className="font-serif text-2xl font-semibold text-emerald-700">{stats.completed}</dd>
              </div>
            </dl>
          )}
        </div>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('dashboard.searchPlaceholder')}
              className="h-11 w-full rounded-full border border-input bg-card pe-4 ps-10 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <Link href="/create" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            {t('nav.create')}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[2/3] animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : cards && cards.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {cards.map((card, idx) => {
              const photo = card.childPhotoUrl || card.aiImageUrl;
              const drive = isDriveUrl(card.voiceMessageUrl);
              return (
                <motion.article
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx, 8) * 0.04 }}
                  className="group"
                >
                  <Link href={`/card/${card.id}`} className="block transition-transform duration-300 group-hover:-translate-y-1">
                    {photo ? (
                      <MemoryFrame src={photo} alt={card.childName} qrCodeUrl={card.qrCodeUrl} theme={loadTheme(card.id)} />
                    ) : (
                      <div className="flex aspect-[2/3] items-center justify-center rounded-3xl border border-dashed border-border bg-card text-muted-foreground">
                        <ImageIcon className="h-10 w-10 opacity-40" />
                      </div>
                    )}
                  </Link>
                  <div className="mt-3 flex items-start justify-between gap-2 px-1">
                    <div className="min-w-0">
                      <Link href={`/card/${card.id}`} className="block truncate font-semibold hover:underline">
                        {card.childName}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {drive ? <HardDrive className="h-3 w-3 text-emerald-700" /> : <Globe className="h-3 w-3" />}
                        {dateFmt.format(new Date(card.createdAt))}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(card.id)}
                      className="rounded-full p-2 text-muted-foreground opacity-70 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      aria-label={t('common.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-border bg-card/60 px-6 py-24 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
              <ImageIcon className="h-7 w-7" />
            </div>
            <h2 className="mb-2 font-serif text-2xl font-semibold">{t('dashboard.empty')}</h2>
            <p className="mx-auto mb-8 max-w-md text-muted-foreground">{t('dashboard.emptyDescription')}</p>
            <Link href="/create" className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground">
              <Plus className="h-4 w-4" />
              {t('nav.create')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
