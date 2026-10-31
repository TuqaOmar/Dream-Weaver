import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, ExternalLink, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { drivePreviewUrl, normalizeDriveLink, parseDriveLink } from '@/lib/drive';

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

const BARS = 36;
const BAR_HEIGHTS = Array.from({ length: BARS }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));

export function AudioPlayer({ src, className, tone = 'light' }: { src: string; className?: string; tone?: 'light' | 'dark' }) {
  const { isRTL, t } = useLanguage();
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => setTime(a.currentTime);
    const onDur = () => isFinite(a.duration) && setDuration(a.duration);
    const onEnd = () => {
      setPlaying(false);
      setTime(0);
    };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onDur);
    a.addEventListener('durationchange', onDur);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onDur);
      a.removeEventListener('durationchange', onDur);
      a.removeEventListener('ended', onEnd);
    };
  }, [src]);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    let ratio = (e.clientX - rect.left) / rect.width;
    if (isRTL) ratio = 1 - ratio;
    a.currentTime = Math.max(0, Math.min(duration, ratio * duration));
  };

  const progress = duration ? time / duration : 0;
  const dark = tone === 'dark';

  return (
    <div className={cn('flex items-center gap-4', className)} data-testid="audio-player">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? t('player.pause') : t('player.play')}
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg transition active:scale-95',
          dark ? 'bg-[#f4e6cf] text-[#1c2333]' : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        {playing ? <Pause className="h-6 w-6 fill-current" /> : <Play className={cn('h-6 w-6 fill-current', isRTL ? 'rotate-180' : 'ms-0.5')} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-10 cursor-pointer items-center gap-[3px]" onClick={seek} role="slider" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}>
          {BAR_HEIGHTS.map((h, i) => {
            const active = i / BARS <= progress && progress > 0;
            return (
              <span
                key={i}
                className={cn(
                  'flex-1 rounded-full transition-colors duration-150',
                  active ? (dark ? 'bg-[#f4e6cf]' : 'bg-primary') : dark ? 'bg-white/20' : 'bg-primary/15',
                  playing && 'animate-[pulse_1.6s_ease-in-out_infinite]',
                )}
                style={{ height: `${h * 100}%`, animationDelay: `${(i % 6) * 0.12}s` }}
              />
            );
          })}
        </div>
        <div className={cn('mt-1 flex justify-between font-mono text-[11px] tabular-nums', dark ? 'text-white/60' : 'text-muted-foreground')} dir="ltr">
          <span>{formatTime(time)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          if (ref.current) {
            ref.current.currentTime = 0;
            setTime(0);
          }
        }}
        aria-label={t('player.restart')}
        className={cn('hidden h-9 w-9 shrink-0 items-center justify-center rounded-full transition sm:flex', dark ? 'text-white/60 hover:bg-white/10' : 'text-muted-foreground hover:bg-muted')}
      >
        <RotateCcw className="h-4 w-4" />
      </button>
      <audio ref={ref} src={src} preload="metadata" className="hidden" />
    </div>
  );
}

/** Plays a voice message from any source we support (Drive file, Drive folder, or audio URL). */
export function VoicePlayer({ url, className, tone = 'light' }: { url: string; className?: string; tone?: 'light' | 'dark' }) {
  const { t } = useLanguage();
  const drive = parseDriveLink(url);

  if (drive?.kind === 'file') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-white">
          <iframe
            src={drivePreviewUrl(url)!}
            title={t('player.driveTitle')}
            className="block h-[120px] w-full"
            allow="autoplay"
            data-testid="drive-preview"
          />
        </div>
        <a
          href={normalizeDriveLink(url)!}
          target="_blank"
          rel="noreferrer"
          className={cn('inline-flex items-center gap-1.5 text-xs font-medium hover:underline', tone === 'dark' ? 'text-white/70' : 'text-muted-foreground')}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t('player.openDrive')}
        </a>
      </div>
    );
  }

  if (drive?.kind === 'folder') {
    return (
      <a
        href={normalizeDriveLink(url)!}
        target="_blank"
        rel="noreferrer"
        className={cn('flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium hover:bg-muted', className)}
      >
        <FolderOpen className="h-5 w-5 text-primary" />
        {t('player.openDriveFolder')}
      </a>
    );
  }

  return <AudioPlayer src={url} className={className} tone={tone} />;
}
