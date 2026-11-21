import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { type FrameTheme, GEO, frameSvgDataUrl, pct } from '@/lib/frame';

interface MemoryFrameProps {
  src: string;
  alt: string;
  qrCodeUrl?: string | null;
  childName?: string;
  theme?: FrameTheme;
  className?: string;
  showQr?: boolean;
}

/**
 * On-screen version of the printed card. Uses the same SVG artwork and
 * coordinates as the PNG export in `lib/frame.ts`.
 */
export function MemoryFrame({
  src,
  alt,
  qrCodeUrl,
  theme = 'rainbow',
  className,
  showQr = true,
}: MemoryFrameProps) {
  const { t } = useLanguage();
  const frameUrl = useMemo(() => frameSvgDataUrl(theme), [theme]);
  const { photo, qrTile: q } = GEO;

  return (
    <div
      className={cn('relative aspect-[2/3] w-full select-none', className)}
      style={{ containerType: 'inline-size' }}
      data-testid="memory-frame"
    >
      <div
        className="absolute inset-0 overflow-hidden shadow-[0_30px_60px_-20px_rgba(28,35,51,0.35)]"
        style={{ borderRadius: pct.cq(GEO.outerRadius) }}
      >
        <img src={frameUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full" draggable={false} />
      </div>

      <div
        className="absolute overflow-hidden bg-[#efe6dc]"
        style={{
          left: pct.x(photo.x),
          top: pct.y(photo.y),
          width: pct.x(photo.w),
          height: pct.y(photo.h),
          borderRadius: pct.cq(photo.r),
        }}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          data-testid="img-memory-original"
          draggable={false}
        />
      </div>

      {showQr && qrCodeUrl && (
        <div
          className="absolute z-20 bg-white shadow-lg"
          style={{
            left: pct.x(q.x),
            top: pct.y(q.y),
            width: pct.x(q.w),
            height: pct.y(q.h),
            borderRadius: pct.cq(q.r),
            padding: pct.cq(q.pad),
          }}
          data-testid="qr-frame"
        >
          <img
            src={qrCodeUrl}
            alt={t('common.qrAlt')}
            className="block aspect-square w-full [image-rendering:pixelated]"
            data-testid="img-qr"
          />
        </div>
      )}
    </div>
  );
}
