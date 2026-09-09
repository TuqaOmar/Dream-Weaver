import React, { useEffect, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { useGetCard, getGetCardQueryKey } from '@workspace/api-client-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Download, Share2, Printer, Play, ArrowLeft, RefreshCw, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { MemoryFrame } from '@/components/MemoryFrame';

export default function CardView() {
  const [, params] = useRoute('/card/:id');
  const id = params?.id;
  const { t } = useLanguage();
  
  const { data: card, isLoading, refetch } = useGetCard(id!, { 
    query: { 
      enabled: !!id, 
      queryKey: getGetCardQueryKey(id!),
      refetchInterval: (query) => query.state.data?.status === 'generating' ? 3000 : false 
    } 
  });

  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (card?.status === 'completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4A6FA5', '#C9855C', '#ffffff']
      });
    }
  }, [card?.status]);

  const toggleAudio = () => {
    if (!audioRef.current || !card?.voiceMessageUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && card) {
      try {
        await navigator.share({
          title: `${t('memory.brand')} - ${card.childName}`,
          text: `${t('card.shareMemoryTitle')}: ${card.childName}`,
          url: `${window.location.origin}/memory/${card.id}`,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/memory/${card?.id}`);
      alert(t('common.linkCopied'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!card) {
    return <div className="text-center py-20">{t('common.cardNotFound')}</div>;
  }

  const isGenerating = card.status === 'generating';
  const memoryImageUrl = card.childPhotoUrl || card.aiImageUrl;

  return (
    <div className="min-h-screen bg-background pt-6 pb-20 print:bg-white print:pt-0">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> {t('card.backDashboard')}
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href="/create">
              <Button variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> {t('card.createAnother')}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Main Card View */}
          <div className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-[2.5rem] border shadow-2xl shadow-black/5 overflow-hidden print:shadow-none print:border-none print:rounded-none"
            >
              <div className="aspect-[2/3] relative bg-muted">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/5 gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                     <p className="text-primary font-medium text-lg animate-pulse">{t('card.preparing')}</p>
                  </div>
                ) : memoryImageUrl ? (
                  <MemoryFrame
                    src={memoryImageUrl}
                    alt={card.childName}
                    qrCodeUrl={card.qrCodeUrl}
                    className="h-full aspect-auto rounded-none shadow-none"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                     {t('common.noImageGenerated')}
                  </div>
                )}
                
              </div>
              
              <div className="p-8 bg-card flex flex-col gap-6">
                <div>
                  <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">{card.childName}</h1>
                </div>
                {card.parentMessage && (
                  <div className="text-lg italic font-serif text-foreground/80 leading-relaxed border-l-4 border-accent pl-6 py-2">
                    "{card.parentMessage}"
                  </div>
                )}
                
                {card.voiceMessageUrl && (
                  <div className="bg-muted/50 rounded-2xl p-4 flex items-center gap-4 print:hidden">
                    <button
                      onClick={toggleAudio}
                      className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform flex-shrink-0"
                    >
                      {isPlaying ? <span className="w-4 h-4 bg-current rounded-sm" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
                    </button>
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{t('card.playMessage')}</p>
                      <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                        <div className={cn("h-full bg-primary transition-all duration-300 w-0", isPlaying && "w-full animate-pulse")} style={{ transitionDuration: '10s' }} />
                      </div>
                    </div>
                    <audio ref={audioRef} src={card.voiceMessageUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Actions & QR Sidebar */}
          <div className="lg:col-span-2 space-y-6 print:hidden">
            <div className="bg-card border rounded-3xl p-6 shadow-sm">
              <h3 className="font-serif text-xl font-medium mb-4">{t('card.shareMemoryTitle')}</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button variant="outline" className="h-14 rounded-xl gap-2 text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50" onClick={handleShare} disabled={isGenerating}>
                  <Share2 className="w-5 h-5" /> {t('card.shareLink')}
                </Button>
                <Button variant="outline" className="h-14 rounded-xl gap-2 text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/50" onClick={handlePrint} disabled={isGenerating}>
                  <Printer className="w-5 h-5" /> {t('card.print')}
                </Button>
              </div>
              
              <div className="bg-muted rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 border border-border border-dashed">
                {card.qrCodeUrl ? (
                  <>
                    <div className="bg-white p-2 rounded-xl shadow-sm">
                      <img src={card.qrCodeUrl} alt={t('common.qrAlt')} className="w-40 h-40 mix-blend-multiply" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">{t('card.scanToShare')}</p>
                  </>
                ) : (
                  <div className="w-40 h-40 bg-background/50 rounded-xl flex items-center justify-center text-muted-foreground text-sm">
                    {isGenerating ? t('common.generatingQr') : t('common.noQr')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
              <h3 className="font-serif text-xl font-medium mb-2 text-primary">{t('card.storageTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t('card.storageDescription')}</p>
              <Link href="/dashboard">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> {t('nav.dashboard')}
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
