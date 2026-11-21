import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export function WizardProgress({ currentStep }: { currentStep: number }) {
  const { t, isRTL } = useLanguage();
  const steps = [t('step.1'), t('step.2'), t('step.3')];

  return (
    <ol className="mx-auto flex max-w-xl items-center" aria-label={t('wizard.progress')}>
      {steps.map((label, idx) => {
        const n = idx + 1;
        const done = n < currentStep;
        const active = n === currentStep;
        return (
          <li key={n} className={cn('flex items-center', idx < steps.length - 1 && 'flex-1')}>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-8 w-8 shrink-0">
                {active && <span aria-hidden="true" className="animate-soft-ping pointer-events-none absolute inset-0 rounded-full bg-primary/25" />}
                <motion.span
                  className={cn(
                    'relative flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-300',
                    done && 'border-primary bg-primary text-primary-foreground',
                    active && 'border-primary bg-background text-primary ring-4 ring-primary/10',
                    !done && !active && 'border-border bg-background text-muted-foreground',
                  )}
                  animate={{ scale: active ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? (
                    <motion.span
                      key="done"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="flex"
                    >
                      <Check className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    n
                  )}
                </motion.span>
              </span>
              <span className={cn('text-sm font-medium transition-colors duration-300', active || done ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <span className="relative mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                <motion.span
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rtl:bg-gradient-to-l"
                  style={{ transformOrigin: isRTL ? 'right' : 'left' }}
                  initial={false}
                  animate={{ scaleX: done ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
