import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface Step1PhotoProps {
  photoUrl: string | null;
  onPhotoSelected: (file: File) => void;
  onNext: () => void;
  isUploading: boolean;
}

export function Step1Photo({ photoUrl, onPhotoSelected, onNext, isUploading }: Step1PhotoProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file?: File) => {
    if (file && file.type.startsWith('image/')) {
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
            <img src={photoUrl} alt="Child" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button variant="secondary" className="gap-2" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <UploadCloud className="w-4 h-4" />
                Change Photo
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
        disabled={!photoUrl || isUploading}
        onClick={onNext}
      >
        {t('common.next')}
      </Button>
    </motion.div>
  );
}
