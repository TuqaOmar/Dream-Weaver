import { Heart, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface MemoryFrameProps {
  src: string;
  alt: string;
  qrCodeUrl?: string | null;
  className?: string;
  showQr?: boolean;
}

export function MemoryFrame({
  src,
  alt,
  qrCodeUrl,
  className,
  showQr = true,
}: MemoryFrameProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        'relative aspect-[2/3] w-full overflow-hidden rounded-[1.8rem] bg-[#f05a9d] p-[4.5%] shadow-2xl shadow-primary/15',
        className,
      )}
      style={{
        backgroundImage: [
          'radial-gradient(circle at 10% 12%, rgba(238, 71, 160, 0.98) 0%, rgba(238, 71, 160, 0) 31%)',
          'radial-gradient(circle at 59% 4%, rgba(255, 215, 59, 0.98) 0%, rgba(255, 215, 59, 0) 36%)',
          'radial-gradient(circle at 99% 38%, rgba(55, 202, 163, 0.98) 0%, rgba(55, 202, 163, 0) 34%)',
          'radial-gradient(circle at 6% 76%, rgba(47, 205, 220, 0.98) 0%, rgba(47, 205, 220, 0) 34%)',
          'radial-gradient(circle at 86% 94%, rgba(255, 111, 125, 0.98) 0%, rgba(255, 111, 125, 0) 38%)',
          'linear-gradient(145deg, #e957a5 0%, #ffd04a 31%, #76d5a5 58%, #40c9d9 77%, #ff7c88 100%)',
        ].join(', '),
      }}
      data-testid="memory-frame"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.95) 1.2px, transparent 1.2px)',
          backgroundSize: '13px 13px',
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-10 text-white/90">
        <Sparkles className="absolute left-[8%] top-[4%] h-[6%] w-[6%] rotate-12 fill-white/70" />
        <Heart className="absolute left-[17%] top-[8%] h-[5%] w-[5%] -rotate-12 fill-white/80" />
        <Star className="absolute left-[43%] top-[3%] h-[4%] w-[4%] fill-white/70" />
        <Sparkles className="absolute right-[12%] top-[7%] h-[6%] w-[6%] -rotate-12 fill-white/70" />
        <Heart className="absolute right-[7%] top-[25%] h-[5%] w-[5%] rotate-12 fill-white/70" />
        <Star className="absolute left-[5%] top-[48%] h-[4%] w-[4%] fill-white/70" />
        <Heart className="absolute right-[8%] bottom-[25%] h-[5%] w-[5%] -rotate-12 fill-white/80" />
        <Sparkles className="absolute left-[18%] bottom-[5%] h-[6%] w-[6%] rotate-12 fill-white/70" />
        <Star className="absolute right-[28%] bottom-[4%] h-[4%] w-[4%] fill-white/70" />
      </div>

      <div className="relative z-[1] h-full w-full overflow-hidden rounded-[1.75rem] border-[3px] border-white/95 bg-[#fffdf8] p-[3px] shadow-inner">
        <div className="relative h-full w-full overflow-hidden rounded-[1.55rem] border border-white/90 bg-[#efe3d7]">
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            data-testid="img-memory-original"
          />
        </div>
      </div>

      {showQr && qrCodeUrl && (
        <div
          className="absolute bottom-[4.5%] left-[4.5%] z-20 w-[24%] rounded-[0.35rem] bg-white p-[1.6%] shadow-xl ring-1 ring-black/10"
          data-testid="qr-frame"
        >
          <img
            src={qrCodeUrl}
            alt={t('common.qrAlt')}
            className="block aspect-square w-full mix-blend-multiply"
          />
        </div>
      )}
    </div>
  );
}