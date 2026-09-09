import React, { useRef, useState } from 'react';
import { useRoute } from 'wouter';
import { useGetPublicCard, getGetPublicCardQueryKey } from '@workspace/api-client-react';
import { Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { MemoryFrame } from '@/components/MemoryFrame';

export default function MemoryPublicView() {
  const [, params] = useRoute('/memory/:id');
  const id = params?.id;
  const { t } = useLanguage();
  
  const { data: card, isLoading } = useGetPublicCard(id!, { 
    query: { enabled: !!id, queryKey: getGetPublicCardQueryKey(id!) } 
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!card) {
    return <div className="text-center py-20 text-xl font-serif">Memory not found.</div>;
  }

  const toggleAudio = () => {
    if (!audioRef.current || !card?.voiceMessageUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-[100dvh] w-full relative bg-background overflow-x-hidden selection:bg-primary/20">
      {/* Dynamic atmospheric background based on image */}
      <div className="fixed inset-0 pointer-events-none">
        {(card.childPhotoUrl || card.aiImageUrl) && (
          <>
            <img src={card.childPhotoUrl || card.aiImageUrl || ''} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[100px] scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
          </>
        )}
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto min-h-[100dvh] flex flex-col items-center justify-center p-6 md:p-12 py-20">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full aspect-[4/5] md:aspect-[3/4] max-w-2xl mx-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative mb-12"
        >
          {card.childPhotoUrl || card.aiImageUrl ? (
            <MemoryFrame
              src={card.childPhotoUrl || card.aiImageUrl || ''}
              alt={card.childName}
              className="h-full aspect-auto rounded-none shadow-none"
              showQr={false}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">No image available</div>
          )}
        </motion.div>

        <div className="w-full max-w-xl mx-auto space-y-12">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">Future {card.profession}</p>
            <h1 className="mt-3 text-5xl md:text-7xl font-serif text-foreground font-bold tracking-tight">
              {card.childName}
            </h1>
          </div>
          {card.voiceMessageUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="flex flex-col items-center gap-6"
            >
              <button
                onClick={toggleAudio}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center text-primary-foreground shadow-xl transition-all duration-500",
                  isPlaying ? "bg-primary scale-110 shadow-primary/40 animate-pulse" : "bg-primary/90 hover:bg-primary hover:scale-105"
                )}
              >
                {isPlaying ? <Square className="w-8 h-8 fill-current" /> : <Play className="w-10 h-10 ml-2 fill-current" />}
              </button>
              <span className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
                Listen to the message
              </span>
              <audio ref={audioRef} src={card.voiceMessageUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
            </motion.div>
          )}

          {card.parentMessage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 1 }}
              className="text-center px-6"
            >
              <p className="text-2xl md:text-3xl font-serif text-foreground/90 leading-relaxed italic">
                "{card.parentMessage}"
              </p>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-center pt-12 border-t border-border/50 mt-12"
          >
            <p className="font-serif text-lg text-primary">{t('memory.brand')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Created on {new Date(card.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
