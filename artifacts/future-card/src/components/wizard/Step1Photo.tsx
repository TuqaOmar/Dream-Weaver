import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Camera, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Step1PhotoProps {
  photoUrl: string | null;
  childName: string;
  onChildNameChange: (name: string) => void;
  onPhotoSelected: (file: File) => void;
  onNext: () => void;
}

export function Step1Photo({ photoUrl, childName, onChildNameChange, onPhotoSelected, onNext }: Step1PhotoProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [meta, setMeta] = useState<{ width: number; height: number } | null>(null);

  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const img = new Image();
    const tempUrl = URL.createObjectURL(file);
    img.onload = () => {
      setMeta({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(tempUrl);
    };
    img.src = tempUrl;
    onPhotoSelected(file);
  };

  const lowRes = meta && (meta.width < 600 || meta.height < 600);
  const canContinue = !!photoUrl && !!childName.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mx-auto max-w-xl space-y-8"
    >
      <header className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold md:text-4xl">{t('step1.title')}</h1>
        <p className="text-muted-foreground">{t('step1.subtitle')}</p>
      </header>

      <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-7">
        <div
          className={cn(
            'group relative mx-auto flex aspect-[4/5] w-full max-w-xs cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all',
            isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-primary/40 hover:bg-secondary/40',
            photoUrl && 'border-solid border-transparent',
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={t('step1.browse')}
          data-testid="photo-dropzone"
        >
          {photoUrl ? (
            <>
              <img src={photoUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
              <img src={photoUrl} alt={t('common.childPhotoAlt')} className="relative h-full w-full object-contain" />
              <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/90 px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
                <RefreshCw className="h-3.5 w-3.5" />
                {t('step1.change')}
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary transition-transform group-hover:scale-105">
                <ImagePlus className="h-7 w-7" />
              </div>
              <p className="font-semibold">{t('step1.drag')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('step1.hint')}</p>
            </div>
          )}
        </div>

        {!photoUrl && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary"
            >
              <Camera className="h-4 w-4" />
              {t('step1.takePhoto')}
            </button>
          </div>
        )}

        {meta && photoUrl && (
          <div
            className={cn(
              'mx-auto mt-4 flex max-w-xs items-start gap-2 rounded-xl px-3 py-2 text-xs',
              lowRes ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-900',
            )}
          >
            {lowRes ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
            <span>
              {lowRes ? t('step1.lowRes') : t('step1.goodRes')} <span dir="ltr" className="font-mono">({meta.width}×{meta.height})</span>
            </span>
          </div>
        )}

        <div className="mt-7 space-y-2">
          <label htmlFor="child-name" className="text-sm font-semibold">
            {t('step1.name')}
          </label>
          <input
            id="child-name"
            value={childName}
            maxLength={60}
            onChange={(e) => onChildNameChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && canContinue && onNext()}
            placeholder={t('step1.namePlaceholder')}
            className="h-12 w-full rounded-xl border border-input bg-background px-4 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            data-testid="input-child-name"
          />
        </div>
      </div>

      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFile(e.target.files?.[0])} data-testid="input-photo" />
      <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={(e) => handleFile(e.target.files?.[0])} />

      <button
        type="button"
        disabled={!canContinue}
        onClick={onNext}
        className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        data-testid="button-next-1"
      >
        {t('common.next')}
      </button>
    </motion.div>
  );
}
