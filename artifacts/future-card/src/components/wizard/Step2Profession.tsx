import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Profession {
  id: string;
  emoji: string;
  key: string; // Translation key
  color: string;
}

const PROFESSIONS: Profession[] = [
  { id: 'doctor', emoji: '🩺', key: 'prof.doctor', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'pilot', emoji: '✈️', key: 'prof.pilot', color: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  { id: 'engineer', emoji: '⚙️', key: 'prof.engineer', color: 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
  { id: 'teacher', emoji: '📚', key: 'prof.teacher', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { id: 'police', emoji: '👮', key: 'prof.police', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  { id: 'firefighter', emoji: '🚒', key: 'prof.firefighter', color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { id: 'astronaut', emoji: '🚀', key: 'prof.astronaut', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { id: 'chef', emoji: '👨‍🍳', key: 'prof.chef', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { id: 'football', emoji: '⚽', key: 'prof.football', color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { id: 'scientist', emoji: '🔬', key: 'prof.scientist', color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  { id: 'artist', emoji: '🎨', key: 'prof.artist', color: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  { id: 'entrepreneur', emoji: '💼', key: 'prof.entrepreneur', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
];

interface Step2ProfessionProps {
  childName: string;
  profession: string;
  customProfession: string | null;
  onChange: (updates: { childName?: string, profession?: string, customProfession?: string | null }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Profession({ childName, profession, customProfession, onChange, onNext, onBack }: Step2ProfessionProps) {
  const { t } = useLanguage();
  const [showOther, setShowOther] = useState(profession === 'other');

  const handleSelect = (id: string) => {
    if (id === 'other') {
      setShowOther(true);
      onChange({ profession: 'other' });
    } else {
      setShowOther(false);
      onChange({ profession: id, customProfession: null });
    }
  };

  const isComplete = childName.trim().length > 0 && 
    (profession && profession !== 'other' || (profession === 'other' && customProfession && customProfession.trim().length > 0));

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto flex flex-col space-y-8 pb-12"
    >
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-foreground">{t('step2.title')}</h2>
        <p className="text-muted-foreground">{t('step2.subtitle')}</p>
      </div>

      <div className="max-w-md mx-auto w-full space-y-3">
        <label className="text-sm font-medium text-foreground ml-1">Child's Name</label>
        <Input 
          value={childName}
          onChange={(e) => onChange({ childName: e.target.value })}
          placeholder="e.g. Leo"
          className="h-14 text-lg rounded-2xl px-6 bg-white/50 dark:bg-black/50 backdrop-blur border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {PROFESSIONS.map((p) => {
          const isSelected = profession === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-primary/20 shadow-lg scale-105 z-10" 
                  : "border-transparent bg-white dark:bg-card shadow-sm hover:border-primary/30"
              )}
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 transition-transform duration-300", p.color, isSelected ? "scale-110" : "group-hover:scale-110")}>
                {p.emoji}
              </div>
              <span className={cn("font-medium", isSelected ? "text-primary" : "text-foreground")}>
                {t(p.key)}
              </span>
            </button>
          );
        })}
        
        <button
          onClick={() => handleSelect('other')}
          className={cn(
            "relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl",
            profession === 'other'
              ? "border-primary bg-primary/5 shadow-primary/20 shadow-lg scale-105 z-10" 
              : "border-dashed border-muted-foreground/30 bg-transparent hover:border-primary/50"
          )}
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl mb-3 text-muted-foreground transition-transform duration-300 group-hover:scale-110">
            ✨
          </div>
          <span className={cn("font-medium", profession === 'other' ? "text-primary" : "text-foreground")}>
            {t('prof.other')}
          </span>
        </button>
      </div>

      {showOther && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-md mx-auto w-full pt-4"
        >
          <Input 
            value={customProfession || ''}
            onChange={(e) => onChange({ customProfession: e.target.value })}
            placeholder={t('step2.otherPlaceholder')}
            className="h-14 text-lg rounded-2xl px-6 bg-white/50 dark:bg-black/50 backdrop-blur border-primary/50 focus-visible:ring-primary shadow-lg shadow-primary/5"
            autoFocus
          />
        </motion.div>
      )}

      <div className="flex gap-4 max-w-md mx-auto w-full pt-8">
        <Button size="lg" variant="outline" className="w-1/3 rounded-full h-14" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button 
          size="lg" 
          className="w-2/3 rounded-full h-14 text-lg" 
          disabled={!isComplete}
          onClick={onNext}
        >
          {t('common.next')}
        </Button>
      </div>
    </motion.div>
  );
}
