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
  const [isDownloading, setIsDownloading] = React.useState(false);
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

  const handleDownloadPhoto = () => {
    if (!memoryImageUrl || !card) return;
    const link = document.createElement('a');
    link.href = memoryImageUrl;
    link.download = `${card.childName || 'child'}-photo.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCard = async () => {
    if (!memoryImageUrl || !card) return;
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const width = 800;
      const height = 1200;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const drawRound = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, w, h, r);
        } else {
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
        }
      };

      // 1. Draw outer gradient background
      ctx.save();
      drawRound(0, 0, width, height, 38);
      ctx.clip();

      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#e957a5');
      bgGrad.addColorStop(0.31, '#ffd04a');
      bgGrad.addColorStop(0.58, '#76d5a5');
      bgGrad.addColorStop(0.77, '#40c9d9');
      bgGrad.addColorStop(1, '#ff7c88');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw white inner frame border
      const padding = 36;
      const innerW = width - padding * 2;
      const innerH = height - padding * 2;
      drawRound(padding, padding, innerW, innerH, 30);
      ctx.fillStyle = '#fffdf8';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.stroke();

      // 3. Child image area
      const imgPadding = 8;
      const imgX = padding + imgPadding;
      const imgY = padding + imgPadding;
      const imgW = innerW - imgPadding * 2;
      const imgH = innerH - imgPadding * 2;

      ctx.save();
      drawRound(imgX, imgY, imgW, imgH, 24);
      ctx.clip();
      ctx.fillStyle = '#efe3d7';
      ctx.fillRect(imgX, imgY, imgW, imgH);

      const childImg = new Image();
      childImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        childImg.onload = resolve;
        childImg.onerror = reject;
        childImg.src = memoryImageUrl;
      });

      const hRatio = imgW / (childImg.naturalWidth || childImg.width);
      const vRatio = imgH / (childImg.naturalHeight || childImg.height);
      const ratio = Math.max(hRatio, vRatio);
      const nw = (childImg.naturalWidth || childImg.width) * ratio;
      const nh = (childImg.naturalHeight || childImg.height) * ratio;
      const shiftX = (imgW - nw) / 2;
      const shiftY = (imgH - nh) / 2;

      ctx.drawImage(childImg, 0, 0, childImg.naturalWidth || childImg.width, childImg.naturalHeight || childImg.height, imgX + shiftX, imgY + shiftY, nw, nh);
      ctx.restore();

      // 4. Draw QR Code in bottom corner
      if (card.qrCodeUrl) {
        const qrSize = 190;
        const qrX = padding + 16;
        const qrY = height - padding - qrSize - 16;

        ctx.save();
        drawRound(qrX, qrY, qrSize, qrSize, 14);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;
        ctx.fill();
        ctx.restore();

        const qrImg = new Image();
        qrImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = card.qrCodeUrl!;
        });

        const qrPad = 12;
        ctx.drawImage(qrImg, qrX + qrPad, qrY + qrPad, qrSize - qrPad * 2, qrSize - qrPad * 2);
      }

      ctx.restore();

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${card.childName || 'future-card'}-card.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download card error:', err);
      handleDownloadPhoto();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && card) {
      try {
        await navigator.share({
          title: `${t('memory.brand')} - ${card.childName}`,
          text: `${t('card.shareMemoryTitle')}: ${card.childName}`,
          url: `${window.location.origin}/listen/${card.id}`,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/listen/${card?.id}`);
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
    <div className="min-h-screen bg-background pt-6 pb-20 print:min-h-0 print:p-0 print:m-0 print:bg-white print-page-wrapper">
      <div className="container mx-auto px-4 max-w-5xl print:max-w-none print:p-0 print:m-0 print:w-full">
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start print:block print:w-full print:m-0">
          
          {/* Main Card View */}
          <div className="lg:col-span-3 print:w-full print:flex print:items-center print:justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-[2.5rem] border shadow-2xl shadow-black/5 overflow-hidden print:shadow-none print:border-none print:bg-transparent print:rounded-none print:w-auto"
            >
              <div className="aspect-[2/3] relative bg-muted print:bg-transparent print:w-[130mm] print:max-w-[90vw] print:mx-auto print-card-frame">
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
                    className="h-full aspect-auto rounded-none shadow-none print:rounded-[1.8rem]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                     {t('common.noImageGenerated')}
                  </div>
                )}
                
              </div>
              
              <div className="p-8 bg-card flex flex-col gap-6 print:hidden">
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
                <Button 
                  variant="outline" 
                  className="col-span-2 h-14 rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-md transition-all active:scale-[0.98]" 
                  onClick={handleDownloadCard} 
                  disabled={isGenerating || isDownloading}
                >
                  <Download className="w-5 h-5" />
                  {isDownloading 
                    ? (t('card.download') === 'تنزيل البطاقة (صورة PNG)' ? 'جاري تجهيز الصورة وتنزيلها...' : 'Generating image...') 
                    : t('card.download')}
                </Button>
                <button
                  type="button"
                  onClick={handleDownloadPhoto}
                  disabled={isGenerating}
                  className="col-span-2 text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors text-center py-1"
                >
                  {t('card.downloadPhoto')}
                </button>
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
