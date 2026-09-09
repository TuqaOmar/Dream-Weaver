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

  const uploadFile = async (file: File, type: 'photo' | 'voice') => {
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = type === 'photo' ? '/api/upload/photo' : '/api/upload/voice';
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleFinalSubmit = async () => {
    setIsCreating(true);
    try {
      // 1. Upload photo
      let uploadedPhotoUrl = null;
      if (photoFile) {
        uploadedPhotoUrl = await uploadFile(photoFile, 'photo');
      }

      // 2. Upload voice if exists
      let uploadedVoiceUrl = null;
      if (voiceFile) {
        uploadedVoiceUrl = await uploadFile(voiceFile, 'voice');
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
      const id = await handleFinalSubmit();
      if (id) {
        setCreatedCardId(id);
        setStep(3);

        // Keep the magic screen visible while the server preserves the
        // original photo and creates the QR code. Previously this ran in the
        // background and isCreating never became false, so the wizard
        // stayed forever on "Creating QR Code".
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
