import { useState } from 'react';
import { useLocation } from 'wouter';
import { AnimatePresence } from 'framer-motion';
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

export default function Create() {
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createCard = useCreateCard();
  const generateQr = useGenerateCardImage();

  const [step, setStep] = useState(1);
  const [stage, setStage] = useState(0);

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
      setTimeout(() => setLocation(`/card/${card.id}`), 450);
    } catch (error: any) {
      console.error(error);
      toast({
        title: t('error.genericTitle'),
        description: error?.message && error.message !== 'Failed to fetch' ? error.message : t('error.tryAgain'),
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
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1Photo
                key="step1"
                photoUrl={photoUrl}
                childName={childName}
                onChildNameChange={setChildName}
                onPhotoSelected={handlePhotoSelect}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <Step3Voice key="step2" value={voice} onChange={(u) => setVoice((v) => ({ ...v, ...u }))} onNext={finish} onBack={() => setStep(1)} />
            )}
          </AnimatePresence>
          {step === 3 && <Step4Magic stage={stage} usesDrive={voice.mode === 'drive'} />}
        </div>
      </div>
    </div>
  );
}
