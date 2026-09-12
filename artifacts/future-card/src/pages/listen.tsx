import React, { useRef, useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useGetPublicCard, getGetPublicCardQueryKey } from '@workspace/api-client-react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Heart, Globe, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ListenPublicView() {
  const [, params] = useRoute('/listen/:id');
  const id = params?.id;
  const { t, language, setLanguage, isRTL } = useLanguage();

  const { data: card, isLoading } = useGetPublicCard(id!, {
    query: { enabled: !!id, queryKey: getGetPublicCardQueryKey(id!) },
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [card?.voiceMessageUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !card?.voiceMessageUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio play error:', err));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const restartAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().then(() => setIsPlaying(true));
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background p-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Heart className="w-6 h-6 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="mt-4 text-muted-foreground font-serif text-sm animate-pulse">
          {language === 'ar' ? 'جاري تحميل الرسالة الصوتية...' : 'Loading voice message...'}
        </p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <VolumeX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-serif text-foreground font-bold mb-2">
          {t('common.memoryNotFound')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {language === 'ar'
            ? 'تأكد من صحة الرابط أو رمز الاستجابة السريعة (QR Code).'
            : 'Please verify the link or scanned QR code.'}
        </p>
      </div>
    );
  }

  const childPhoto = card.childPhotoUrl || card.aiImageUrl;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-primary/10 via-background to-background flex flex-col justify-between items-center p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Soft ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      </div>

      {/* Top bar: minimal branding and language switcher */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between z-10 pt-2 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold font-serif shadow-sm">
            {t('memory.brand').charAt(0)}
          </div>
          <span className="font-serif font-bold text-sm tracking-wide text-foreground/80">
            {t('memory.brand')}
          </span>
        </div>

        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-background/80 hover:bg-background border border-border/60 shadow-sm backdrop-blur transition-all active:scale-95 text-foreground/80"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </header>

      {/* Main player container */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center z-10 py-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-card/80 backdrop-blur-2xl border border-border/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-primary/5 flex flex-col items-center space-y-6"
        >
          {/* Circular avatar with glowing effect */}
          <div className="relative group">
            <motion.div
              animate={{
                scale: isPlaying ? [1, 1.04, 1] : 1,
              }}
              transition={{
                scale: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
              }}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-primary via-primary/40 to-accent shadow-xl flex items-center justify-center overflow-hidden"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-background flex items-center justify-center">
                <Volume2 className={cn("w-16 h-16 text-primary", isPlaying && "animate-pulse")} />
              </div>
            </motion.div>

            {/* Floating badge */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-3 h-3" />
              <span>{card.customProfession || card.profession || t('hero.badge')}</span>
            </div>
          </div>

          {/* Child title & greeting */}
          <div className="text-center space-y-1 pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {language === 'ar' ? 'رسالة صوتية خاصة' : 'Special Voice Message'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
              {card.childName}
            </h1>
          </div>

          {/* Hidden HTML5 Audio Element */}
          {card.voiceMessageUrl && (
            <audio
              ref={audioRef}
              src={card.voiceMessageUrl}
              preload="metadata"
              className="hidden"
            />
          )}

          {/* Waveform Visualization Bars */}
          <div className="w-full flex items-center justify-center gap-1 sm:gap-1.5 h-12 px-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const activeIndex = Math.floor((progressPercent / 100) * 28);
              const isPast = i <= activeIndex;
              return (
                <motion.div
                  key={i}
                  animate={{
                    height: isPlaying
                      ? `${Math.max(12, Math.sin(i * 0.5 + currentTime * 5) * 36 + 18)}px`
                      : isPast
                        ? '16px'
                        : '8px',
                  }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'w-1.5 rounded-full transition-colors',
                    isPast
                      ? 'bg-primary'
                      : 'bg-primary/20 dark:bg-primary/30'
                  )}
                />
              );
            })}
          </div>

          {/* Progress Slider & Times */}
          <div className="w-full space-y-2">
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                disabled={!card.voiceMessageUrl}
                className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary transition-all focus:outline-none"
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-muted-foreground px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Audio Controls */}
          {card.voiceMessageUrl ? (
            <div className="flex items-center justify-center gap-6 pt-2">
              <button
                onClick={restartAudio}
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90"
                title={language === 'ar' ? 'إعادة من البداية' : 'Restart'}
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className={cn(
                  'w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-primary-foreground shadow-2xl transition-all duration-300 active:scale-95',
                  isPlaying
                    ? 'bg-primary scale-105 shadow-primary/40'
                    : 'bg-primary hover:scale-105 hover:bg-primary/90 shadow-primary/25'
                )}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className={cn('w-8 h-8 fill-current', isRTL ? 'mr-1' : 'ml-1')} />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-90"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-destructive" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>
          ) : (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {language === 'ar'
                ? 'لا يوجد تسجيل صوتي محفوظ لهذه البطاقة.'
                : 'No voice recording found for this card.'}
            </div>
          )}

          {/* Parent written message if available */}
          {card.parentMessage && (
            <div className="w-full pt-4 border-t border-border/50">
              <div className="relative bg-muted/40 dark:bg-muted/20 rounded-2xl p-4 text-center">
                <Quote className="w-4 h-4 text-primary/40 mb-1 mx-auto" />
                <p className="font-serif italic text-sm text-foreground/90 leading-relaxed">
                  "{card.parentMessage}"
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center z-10 py-3 text-xs text-muted-foreground/70">
        <p>
          {language === 'ar' ? 'سُجِّلت بكل حب في' : 'Recorded with love on'}{' '}
          {new Date(card.createdAt).toLocaleDateString(language === 'ar' ? 'ar-JO' : 'en-US')}
        </p>
      </footer>
    </div>
  );
}
