import { useState } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateCard, useGenerateCardImage, getListCardsQueryKey } from '@workspace/api-client-react';
import { Step1Photo } from '@/components/wizard/Step1Photo';
import { Step3Voice, type VoiceState, EMPTY_VOICE } from '@/components/wizard/Step3Voice';
import { Step4Magic } from '@/components/wizard/Step4Magic';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { normalizeDriveLink } from '@/lib/drive';
import { compressImage } from '@/lib/image';
import { CELEBRATE_KEY } from '@/components/Confetti';

/* Wizard steps slide in from the reading direction (dir: +1 forward, -1 back). */
const slide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 56, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 30, opacity: { duration: 0.2 } } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -56, scale: 0.98, transition: { duration: 0.18, ease: 'easeIn' } }),
};

export default function Create() {
  const [, setLocation] = useLocation();
  const { language, t, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCard = useCreateCard();
  const generateQr = useGenerateCardImage();

  const [step, setStep] = useState(1);
  const [stage, setStage] = useState(0);
  const [forward, setForward] = useState(true);
  // In RTL the "next" step comes in from the left.
  const dir = (forward ? 1 : -1) * (isRTL ? -1 : 1);

  const goTo = (n: number) => {
    setForward(n > step);
    setStep(n);
  };

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [childName, setChildName] = useState('');
  const [voice, setVoice] = useState<VoiceState>(EMPTY_VOICE);

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const uploadVoice = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('name', childName.trim());
    form.append('file', file, file.name);
    const res = await fetch('/api/upload/voice', { method: 'POST', body: form });
    const json = await res.json().catch(() => ({}));
    if (res.status === 413) throw new Error(t('error.fileTooLarge'));
    if (!res.ok || !json.url) throw new Error(json.error || t('error.uploadVoice'));
    if (json.warning === 'drive_upload_failed') {
      toast({ title: t('warn.driveFailedTitle'), description: t('warn.driveFailedBody') });
    }
    return json.url as string;
  };

  const finish = async () => {
    setStep(3);
    setStage(0);
    try {
      const photo = photoFile ? await compressImage(photoFile) : undefined;

      setStage(1);
      let voiceMessageUrl: string | undefined;
      if (voice.mode === 'drive') {
        voiceMessageUrl = normalizeDriveLink(voice.driveLink) ?? undefined;
      } else if (voice.file) {
        voiceMessageUrl = await uploadVoice(voice.file);
      }

      setStage(2);
      const card = await createCard.mutateAsync({
        data: {
          childName: childName.trim(),
          childPhotoUrl: photo,
          voiceMessageUrl,
          parentMessage: voice.message.trim() || undefined,
          language,
        },
      });

      setStage(3);
      await generateQr.mutateAsync({ id: card.id });
      queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });

      setStage(4);
      try {
        sessionStorage.setItem(CELEBRATE_KEY, card.id);
      } catch {
        /* storage unavailable: just skip the celebration */
      }
      setTimeout(() => setLocation(`/card/${card.id}`), 450);
    } catch (error: any) {
      console.error(error);
      toast({
        title: t('error.genericTitle'),
        description: /database_unavailable|503/.test(String(error?.message ?? error?.status ?? ''))
          ? t('error.database')
          : error?.message && error.message !== 'Failed to fetch'
            ? error.message
            : t('error.tryAgain'),
        variant: 'destructive',
      });
      setStep(2);
    }
  };

  return (
    <div className="bg-paper min-h-[calc(100dvh-4rem)] pb-16 pt-8">
      <div className="mx-auto max-w-3xl px-4">
        <WizardProgress currentStep={Math.min(step, 3)} />
        <div className="mt-10">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {step === 1 && (
              <motion.div key="step1" custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
                <Step1Photo
                  photoUrl={photoUrl}
                  childName={childName}
                  onChildNameChange={setChildName}
                  onPhotoSelected={handlePhotoSelect}
                  onNext={() => goTo(2)}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
                <Step3Voice value={voice} onChange={(u) => setVoice((v) => ({ ...v, ...u }))} onNext={finish} onBack={() => goTo(1)} />
              </motion.div>
            )}
          </AnimatePresence>
          {step === 3 && <Step4Magic stage={stage} usesDrive={voice.mode === 'drive'} />}
        </div>
      </div>
    </div>
  );
}
