import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useListCards, useGetCardStats, useDeleteCard, getListCardsQueryKey, getGetCardStatsQueryKey } from '@workspace/api-client-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Edit2, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { t, language } = useLanguage();
  const [search, setSearch] = React.useState('');
  const queryClient = useQueryClient();
  
  const { data: stats } = useGetCardStats({ query: { queryKey: getGetCardStatsQueryKey() } });
  const { data: cards, isLoading } = useListCards(
    search ? { search } : undefined, 
    { query: { queryKey: getListCardsQueryKey(search ? { search } : undefined) } }
  );
  
  const deleteCard = useDeleteCard();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      await deleteCard.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetCardStatsQueryKey() });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800">{t('card.status.completed')}</span>;
      case 'generating':
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-800 animate-pulse">{t('card.status.generating')}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs font-medium border border-gray-200 dark:border-gray-700">{t('card.status.draft')}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif font-semibold text-foreground mb-2">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">Manage and cherish your digital memories.</p>
          </div>
          
          {stats && (
            <div className="flex gap-4 p-2 bg-white/50 dark:bg-black/20 rounded-2xl border border-border backdrop-blur-sm shadow-sm">
              <div className="px-4 py-2 text-center">
                <div className="text-2xl font-serif text-primary">{stats.total}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('dashboard.stats.total')}</div>
              </div>
              <div className="w-px bg-border my-2" />
              <div className="px-4 py-2 text-center">
                <div className="text-2xl font-serif text-green-600">{stats.completed}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{t('dashboard.stats.completed')}</div>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or profession..." 
              className="pl-10 h-12 rounded-xl bg-white dark:bg-card shadow-sm border-border"
            />
          </div>
          
          <Link href="/create">
            <Button size="lg" className="w-full sm:w-auto rounded-xl gap-2 shadow-primary/20 shadow-lg">
              <PlusCircle className="w-5 h-5" />
              {t('nav.create')}
            </Button>
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[3/4] rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : cards && cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={card.id} 
                className="group relative flex flex-col bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Link href={`/card/${card.id}`} className="block relative aspect-[4/3] overflow-hidden bg-muted">
                  {card.aiImageUrl ? (
                    <img src={card.aiImageUrl} alt={card.childName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : card.childPhotoUrl ? (
                    <div className="w-full h-full relative">
                      <img src={card.childPhotoUrl} alt={card.childName} className="w-full h-full object-cover opacity-50 blur-sm" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground opacity-50" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white flex flex-col gap-1">
                    <h3 className="font-serif text-2xl font-medium tracking-wide">{card.childName}</h3>
                    <p className="text-white/80 font-medium">{card.profession}</p>
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(card.status)}
                  </div>
                </Link>

                <div className="p-4 flex items-center justify-between border-t border-border bg-card">
                  <div className="text-xs text-muted-foreground font-medium">
                    {format(new Date(card.createdAt), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(card.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {card.status === 'completed' && (
                      <Link href={`/memory/${card.id}`} target="_blank">
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/50 dark:bg-card/50 rounded-3xl border border-dashed border-border">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-2">{t('dashboard.empty')}</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your generated memories will appear here. Start creating your first beautiful keepsake.
            </p>
            <Link href="/create">
              <Button size="lg" className="rounded-full shadow-lg">
                {t('nav.create')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
