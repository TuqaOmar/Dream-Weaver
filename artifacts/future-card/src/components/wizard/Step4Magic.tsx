import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

/** Real progress of the card creation (stage index comes from the page). */
export function Step4Magic({ stage, usesDrive }: { stage: number; usesDrive: boolean }) {
  const { t } = useLanguage();
  const steps = [
    t('step4.photo'),
    usesDrive ? t('step4.voiceDrive') : t('step4.voice'),
    t('step4.saving'),
    t('step4.creatingQr'),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-4 backdrop-blur-xl" data-testid="finishing-overlay">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h2 className="mb-2 text-center font-serif text-2xl font-semibold">{t('step4.title')}</h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">{t('step4.wait')}</p>
        <ol className="space-y-2">
          {steps.map((label, i) => {
            const done = i < stage;
            const current = i === stage;
            return (
              <li
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all',
                  current ? 'border-primary/30 bg-card font-semibold shadow-sm' : 'border-transparent',
                  !done && !current && 'opacity-45',
                )}
              >
                <span className={cn('flex h-6 w-6 items-center justify-center rounded-full', done ? 'bg-emerald-600 text-white' : current ? 'bg-primary/10 text-primary' : 'bg-muted')}>
                  {done ? <Check className="h-3.5 w-3.5" /> : current ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      </motion.div>
    </div>
  );
}
