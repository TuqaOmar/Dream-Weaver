import React, { useCallback, useState } from 'react';
import { useLocation } from 'wouter';
import { Step1Photo } from '@/components/wizard/Step1Photo';
import { Step3Voice } from '@/components/wizard/Step3Voice';
import { Step4Magic } from '@/components/wizard/Step4Magic';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { useCreateCard, useGenerateCardImage, getListCardsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence } from 'framer-motion';

export default function Create() {
  const [, setLocation] = useLocation();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const createCard = useCreateCard();
  const generateImage = useGenerateCardImage();

  // Wizard State
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  
  const [childName, setChildName] = useState('');
  
  const [voiceBlobUrl, setVoiceBlobUrl] = useState<string | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [parentMessage, setParentMessage] = useState('');

  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };

      img.src = objectUrl;
    });
  };

  const handleFinalSubmit = async () => {
    setIsCreating(true);
    try {
      // 1. Process and compress photo
      let uploadedPhotoUrl = null;
      if (photoFile) {
        uploadedPhotoUrl = await compressImage(photoFile);
      }

      // 2. Process voice if exists
      let uploadedVoiceUrl = null;
      if (voiceFile) {
        uploadedVoiceUrl = await compressImage(voiceFile);
      }

      // 3. Create Card record
      const card = await createCard.mutateAsync({
        data: {
          childName,
          childPhotoUrl: uploadedPhotoUrl || undefined,
          voiceMessageUrl: uploadedVoiceUrl || undefined,
          parentMessage: parentMessage || undefined,
          language
        }
      });

      queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
      
      return card.id;

    } catch (error) {
      console.error(error);
      toast({
        title: t('error.genericTitle'),
        description: t('error.tryAgain'),
        variant: "destructive"
      });
      setIsCreating(false);
      return null;
    }
  };

  const [createdCardId, setCreatedCardId] = useState<string | null>(null);

  const nextStep = async () => {
    if (step === 1 && !photoUrl) return;
    if (step === 1 && !childName.trim()) return;
    
    if (step === 2) {
      setStep(3);
      const id = await handleFinalSubmit();
      if (id) {
        setCreatedCardId(id);

        try {
          await generateImage.mutateAsync({ id });
          setIsCreating(false);
        } catch (error) {
          console.error(error);
          setIsCreating(false);
          toast({
            title: t('error.finishTitle'),
            description: t('error.finishDescription'),
            variant: "destructive"
          });
        }
      } else {
        setStep(2);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const handleMagicComplete = useCallback(() => {
    if (createdCardId) {
      setLocation(`/card/${createdCardId}`);
    }
  }, [createdCardId, setLocation]);

  return (
    <div className="min-h-screen pt-20 pb-10 bg-background bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        {step < 3 && <WizardProgress currentStep={step} totalSteps={2} />}
        
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1Photo 
                key="step1"
                photoUrl={photoUrl} 
                childName={childName}
                onChildNameChange={setChildName}
                onPhotoSelected={handlePhotoSelect} 
                onNext={nextStep}
                isUploading={isUploading}
              />
            )}
            
            {step === 2 && (
              <Step3Voice 
                key="step2"
                voiceBlobUrl={voiceBlobUrl}
                parentMessage={parentMessage}
                onChange={(updates) => {
                  if (updates.voiceBlobUrl !== undefined) setVoiceBlobUrl(updates.voiceBlobUrl);
                  if (updates.voiceFile !== undefined) setVoiceFile(updates.voiceFile);
                  if (updates.parentMessage !== undefined) setParentMessage(updates.parentMessage);
                }}
                onNext={nextStep}
                onBack={() => setStep(1)}
              />
            )}
            
            {step === 3 && (
              <Step4Magic 
                key="step4"
                isCreating={isCreating} 
                onComplete={handleMagicComplete}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
