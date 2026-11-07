import { useEffect, type ReactNode } from 'react';
import { useRoute } from 'wouter';
import { motion } from 'framer-motion';
import { HardDrive, VolumeX, Loader2, ExternalLink } from 'lucide-react';
import { useGetPublicCard, getGetPublicCardQueryKey } from '@workspace/api-client-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AudioPlayer } from '@/components/VoicePlayer';
import { BrandMark } from '@/components/Navigation';
import { normalizeDriveLink } from '@/lib/drive';

/**
 * Public page reached by scanning a QR code (older cards, or cards whose
 * voice is stored on the site). If the voice lives on Google Drive we send
 * the visitor straight there.
 */
export default function ListenPublicView() {
  const [, params] = useRoute('/listen/:id');
  const id = params?.id;
  const { t, language, setLanguage } = useLanguage();

  const { data: card, isLoading, isError } = useGetPublicCard(id!, {
    query: { enabled: !!id, queryKey: getGetPublicCardQueryKey(id!), retry: 1 },
  });

  useEffect(() => {
    if (card?.language === 'en' || card?.language === 'ar') setLanguage(card.language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.language]);

  const driveUrl = normalizeDriveLink(card?.voiceMessageUrl);

  useEffect(() => {
    if (!driveUrl) return undefined;
    const timer = setTimeout(() => window.location.replace(driveUrl), 900);
    return () => clearTimeout(timer);
  }, [driveUrl]);

  const shell = (children: ReactNode) => (
    <div className="relative flex min-h-[100dvh] flex-col items-center bg-[#151b2e] px-5 py-6 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#c9855c]/25 blur-[120px]" />
      </div>
      <header className="relative z-10 flex w-full max-w-md items-center justify-between">
        <div className="flex items-center gap-2">
          <BrandMark className="h-7 w-7" />
          <span className="font-serif text-sm font-semibold text-white/85">{t('memory.brand')}</span>
        </div>
        <button
          type="button"
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/75 hover:bg-white/10"
        >
          {language === 'ar' ? 'EN' : 'ع'}
        </button>
      </header>
      <main className="relative z-10 flex w-full max-w-md flex-1 flex-col items-center justify-center py-10">{children}</main>
    </div>
  );

  if (isLoading) {
    return shell(<Loader2 className="h-8 w-8 animate-spin text-white/70" />);
  }

  if (!card || isError) {
    return shell(
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
          <VolumeX className="h-6 w-6 text-white/70" />
        </div>
        <h1 className="mb-2 font-serif text-xl font-semibold">{t('common.memoryNotFound')}</h1>
        <p className="text-sm text-white/60">{t('listen.notFoundBody')}</p>
      </div>,
    );
  }

  const photo = card.childPhotoUrl || card.aiImageUrl;

  return shell(
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full text-center">
      <div className="mx-auto mb-6 h-36 w-36 overflow-hidden rounded-full p-1 shadow-2xl" style={{ background: 'linear-gradient(135deg,#ef5fa7,#ffd04a,#5fd3a5,#3fc6dc)' }}>
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#efe6dc]">
          {photo && (
            <>
              <img src={photo} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-xl" />
              <img src={photo} alt={card.childName} className="relative h-full w-full object-contain" />
            </>
          )}
        </div>
      </div>
      <p className="eyebrow !text-[#e7b48f]">{t('listen.eyebrow')}</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold" data-testid="listen-name">{card.childName}</h1>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-start backdrop-blur">
        {driveUrl ? (
          <div className="space-y-4 text-center" data-testid="listen-drive-redirect">
            <div className="flex items-center justify-center gap-2 text-sm text-white/80">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('listen.openingDrive')}
            </div>
            <a href={driveUrl} className="inline-flex items-center gap-2 rounded-full bg-[#f4e6cf] px-5 py-2.5 text-sm font-semibold text-[#1c2333]">
              <HardDrive className="h-4 w-4" />
              {t('player.openDrive')}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : card.voiceMessageUrl ? (
          <AudioPlayer src={card.voiceMessageUrl} tone="dark" />
        ) : (
          <p className="py-2 text-center text-sm text-white/60">{t('listen.noVoice')}</p>
        )}
      </div>

      {card.parentMessage && (
        <blockquote className="mt-6 font-serif text-lg italic leading-relaxed text-white/80">“{card.parentMessage}”</blockquote>
      )}

      <p className="mt-10 text-xs text-white/40">
        {t('listen.recordedOn')} {new Date(card.createdAt).toLocaleDateString(language === 'ar' ? 'ar-JO' : 'en-GB')}
      </p>
    </motion.div>,
  );
}
