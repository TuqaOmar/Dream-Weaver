import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step4MagicProps {
  isCreating: boolean;
  onComplete: () => void;
}

export function Step4Magic({ isCreating, onComplete }: Step4MagicProps) {
  const { t } = useLanguage();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { id: 'uploading', key: 'step4.uploading' },
    { id: 'generating', key: 'step4.generating' },
    { id: 'enhancing', key: 'step4.enhancing' },
    { id: 'saving', key: 'step4.saving' },
    { id: 'creatingQr', key: 'step4.creatingQr' }
  ];

  // Simulate progress steps for visual feedback while the server generates
  // the profession image and QR code. The parent switches isCreating to
  // false only after that request succeeds.
  useEffect(() => {
    if (!isCreating) {
      setActiveStep(steps.length);
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < steps.length) {
        setActiveStep(current);
      }
    }, 2000); // Progress every 2 seconds

    return () => clearInterval(interval);
  }, [isCreating, steps.length, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl transition-all">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-primary/20 blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-accent/20 blur-[100px]" 
        />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center">
        <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-t-2 border-r-2 border-primary"
          />
          <motion.div 
            animate={{ rotate: -360 }} 
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-b-2 border-l-2 border-accent"
          />
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>

        <h2 className="text-3xl font-serif text-foreground mb-2 text-center">{t('step4.title')}</h2>
        <p className="text-muted-foreground text-center mb-10">{t('step4.wait')}</p>

        <div className="w-full space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isCurrent = index === activeStep;
            const isPending = index > activeStep;

            return (
              <div 
                key={step.id} 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl transition-all duration-500",
                  isCurrent ? "bg-white/50 dark:bg-black/50 shadow-sm scale-105 border border-primary/20" : "opacity-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500",
                  isCompleted ? "bg-green-500 text-white" : 
                  isCurrent ? "bg-primary/20 text-primary border-2 border-primary" : 
                  "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : 
                   isCurrent ? <div className="w-2 h-2 bg-primary rounded-full animate-pulse" /> : 
                   <div className="w-2 h-2 bg-current rounded-full" />}
                </div>
                <span className={cn(
                  "font-medium",
                  isCompleted ? "text-foreground" :
                  isCurrent ? "text-primary" :
                  "text-muted-foreground"
                )}>
                  {t(step.key)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
