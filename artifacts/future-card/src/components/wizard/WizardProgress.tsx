import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export function WizardProgress({ currentStep }: { currentStep: number }) {
  const { t } = useLanguage();
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
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active && 'border-primary bg-background text-primary ring-4 ring-primary/10',
                  !done && !active && 'border-border bg-background text-muted-foreground',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : n}
              </span>
              <span className={cn('text-sm font-medium', active || done ? 'text-foreground' : 'text-muted-foreground')}>{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <span className={cn('mx-3 h-px flex-1 transition-colors', done ? 'bg-primary' : 'bg-border')} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
