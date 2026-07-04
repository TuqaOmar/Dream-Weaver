import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  const { t } = useLanguage();
  
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const step = idx + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 bg-background transition-colors duration-300",
                  isActive ? "border-primary text-primary shadow-[0_0_0_4px_rgba(var(--primary),0.1)]" : 
                  isCompleted ? "border-primary bg-primary text-primary-foreground" : 
                  "border-muted text-muted-foreground"
                )}
                initial={false}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step}
              </motion.div>
              <span className={cn(
                "text-xs font-medium absolute -bottom-6 w-max text-center transition-colors duration-300",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {t(`step.${step}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
