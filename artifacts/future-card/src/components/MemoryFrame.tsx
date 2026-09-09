import { Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <div
      className={cn(
        'relative aspect-[4/5] w-full overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#f48fb1_0%,#f6c453_28%,#8ed6c4_67%,#7dc8ea_100%)] p-3 shadow-2xl shadow-primary/15',
        className,
      )}
      data-testid="memory-frame"
    >
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-5 top-10 h-20 w-20 rounded-full bg-white/30 blur-2xl" />
        <div className="absolute -right-6 bottom-10 h-28 w-28 rounded-full bg-fuchsia-200/40 blur-2xl" />
        <Sparkles className="absolute left-5 top-5 h-5 w-5 rotate-12 text-white/90" />
        <Sparkles className="absolute right-8 top-7 h-4 w-4 -rotate-12 text-white/90" />
        <Heart className="absolute bottom-7 right-5 h-5 w-5 fill-white/70 text-white/90" />
        <Heart className="absolute bottom-5 left-8 h-4 w-4 fill-white/60 text-white/80" />
      </div>

      <div className="relative h-full w-full overflow-hidden rounded-[1.7rem] border-2 border-white/90 bg-[#fffdf8] p-2 shadow-inner">
        <div className="relative h-full w-full overflow-hidden rounded-[1.35rem] border border-white bg-[#f8f5ef]">
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-contain"
            data-testid="img-memory-original"
          />

          {showQr && qrCodeUrl && (
            <div
              className="absolute bottom-3 left-3 rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/10"
              data-testid="qr-frame"
            >
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="h-20 w-20 mix-blend-multiply"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}