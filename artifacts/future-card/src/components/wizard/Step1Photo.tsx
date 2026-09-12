import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Camera, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Step1PhotoProps {
  photoUrl: string | null;
  childName: string;
  onChildNameChange: (name: string) => void;
  onPhotoSelected: (file: File) => void;
  onNext: () => void;
  isUploading: boolean;
}

export function Step1Photo({ photoUrl, childName, onChildNameChange, onPhotoSelected, onNext, isUploading }: Step1PhotoProps) {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number; sizeKB: number } | null>(null);

  const handleFile = (file?: File) => {
    if (file && file.type.startsWith('image/')) {
      const img = new Image();
      const tempUrl = URL.createObjectURL(file);
      img.onload = () => {
        setImageMeta({
          width: img.naturalWidth,
          height: img.naturalHeight,
          sizeKB: Math.round(file.size / 1024),
        });
        URL.revokeObjectURL(tempUrl);
      };
      img.src = tempUrl;
      onPhotoSelected(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-xl mx-auto flex flex-col items-center text-center space-y-8"
    >
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-serif text-foreground">{t('step1.title')}</h2>
        <p className="text-muted-foreground">{t('step1.subtitle')}</p>
      </div>

      <div 
        className={cn(
          "w-full max-w-sm aspect-[4/5] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all duration-300 relative overflow-hidden group cursor-pointer",
          isDragging ? "border-primary bg-primary/5 scale-105" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
          photoUrl && "border-none p-0"
        )}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !photoUrl && fileInputRef.current?.click()}
      >
        {photoUrl ? (
          <>
            <img src={photoUrl} alt={t('common.childPhotoAlt')} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="secondary" className="gap-2" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <UploadCloud className="w-4 h-4" />
                {t('step1.change')}
              </Button>
            </div>
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] rounded-3xl" />
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-foreground font-medium mb-1">{t('step1.drag')}</p>
            <p className="text-sm text-muted-foreground mb-6">{t('step1.or')}</p>
            <div className="flex gap-3 w-full justify-center">
              <Button type="button" variant="outline" className="gap-2 w-full max-w-[140px]" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                {t('step1.browse')}
              </Button>
              <Button type="button" variant="outline" className="gap-2 w-full max-w-[140px]" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                <Camera className="w-4 h-4" />
                {t('step1.takePhoto')}
              </Button>
            </div>
          </>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      {imageMeta && photoUrl && (
        <div className="w-full max-w-sm -mt-4">
          {imageMeta.width < 450 || imageMeta.height < 450 ? (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-2xl text-xs text-start">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-semibold mb-0.5">
                  {language === 'ar' ? 'أبعاد الصورة منخفضة جداً (صورة مصغرة)' : 'Low Resolution Image Detected'}
                </p>
                <p className="opacity-90">
                  {language === 'ar'
                    ? `أبعاد هذه الصورة (${imageMeta.width}×${imageMeta.height} بكسل). ستظهر مبكسلة عند التكبير والطباعة. للحصول على بطاقة واضحة، يُرجى رفع الصورة الأصلية عالية الدقة.`
                    : `This image is only ${imageMeta.width}×${imageMeta.height}px. It will appear blurry or pixelated when displayed or printed.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground bg-muted/40 py-1.5 px-3 rounded-full mx-auto w-fit">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span>
                {language === 'ar' ? 'دقة الصورة ممتازة:' : 'High Resolution:'} {imageMeta.width} × {imageMeta.height} px ({imageMeta.sizeKB} KB)
              </span>
            </div>
          )}
        </div>
      )}

      <div className="w-full max-w-sm space-y-2 text-start">
        <label htmlFor="child-name" className="text-sm font-medium text-foreground">
          {t('step1.name')}
        </label>
        <input
          id="child-name"
          value={childName}
          onChange={(event) => onChildNameChange(event.target.value)}
          placeholder={t('step1.namePlaceholder')}
          className="h-12 w-full rounded-2xl border border-border bg-white/70 px-4 text-foreground outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/10"
          data-testid="input-child-name"
        />
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        ref={cameraInputRef} 
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <Button 
        size="lg" 
        className="w-full max-w-sm rounded-full h-14 text-lg" 
        disabled={!photoUrl || !childName.trim() || isUploading}
        onClick={onNext}
      >
        {t('common.next')}
      </Button>
    </motion.div>
  );
}
