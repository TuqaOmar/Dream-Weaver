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
  childName,
  theme = 'rainbow',
  className,
  showQr = true,
}: MemoryFrameProps) {
  const { t } = useLanguage();
  const frameUrl = useMemo(() => frameSvgDataUrl(theme), [theme]);
  const { photo, qrTile: q, name: n } = GEO;

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
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-[1.15] object-cover opacity-75 blur-2xl"
          draggable={false}
        />
        <img
          src={src}
          alt={alt}
          className="relative z-10 h-full w-full object-contain"
          data-testid="img-memory-original"
          draggable={false}
        />
      </div>

      {childName?.trim() && (
        <div
          className="absolute z-20 flex items-center rounded-full bg-[#fffdf8]/95 font-serif font-semibold text-[#1c2333] shadow-lg"
          style={{
            right: pct.x(1000 - n.right),
            bottom: pct.y(1500 - n.bottom),
            height: pct.y(n.h),
            paddingInline: pct.cq(n.padX),
            fontSize: pct.cq(n.size),
            maxWidth: '55%',
          }}
        >
          <span className="truncate leading-none">{childName}</span>
        </div>
      )}

      {showQr && qrCodeUrl && (
        <div
          className="absolute z-20 flex flex-col items-center bg-white shadow-xl"
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
          <span
            className="mt-auto block w-full truncate text-center font-semibold leading-none text-[#1c2333]"
            style={{ fontSize: pct.cq(GEO.caption.size) }}
          >
            {t('frame.scanCaption')}
          </span>
        </div>
      )}
    </div>
  );
}
