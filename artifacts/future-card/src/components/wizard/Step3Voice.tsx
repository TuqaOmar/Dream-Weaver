import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, Trash2, Upload, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface Step3VoiceProps {
  voiceBlobUrl: string | null;
  parentMessage: string;
  onChange: (updates: { voiceBlobUrl?: string | null, voiceFile?: File | null, parentMessage?: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Voice({ voiceBlobUrl, parentMessage, onChange, onNext, onBack }: Step3VoiceProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });
        onChange({ voiceBlobUrl: url, voiceFile: file });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert(t('error.microphone'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !voiceBlobUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDelete = () => {
    onChange({ voiceBlobUrl: null, voiceFile: null });
    setDuration(0);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ voiceBlobUrl: url, voiceFile: file });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto flex flex-col items-center space-y-10 pb-12"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-serif text-foreground">{t('step3.title')}</h2>
        <p className="text-muted-foreground">{t('step3.subtitle')}</p>
      </div>

      <div className="w-full bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden">
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-48 h-48 bg-accent rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute w-64 h-64 bg-accent rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
          </div>
        )}

        {!voiceBlobUrl ? (
          <div className="flex flex-col items-center z-10 space-y-8">
            <p className="text-lg italic font-serif text-center max-w-md text-foreground/80 px-4">
              {t('step3.prompt')}
            </p>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                isRecording 
                  ? "bg-destructive text-destructive-foreground hover:scale-95" 
                  : "bg-accent text-accent-foreground hover:scale-105 hover:shadow-accent/30"
              )}
            >
              {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-10 h-10" />}
            </button>
            
            <div className="text-center space-y-2">
              {isRecording ? (
                <div className="text-destructive font-mono text-xl font-medium tracking-wider">
                  {formatTime(duration)}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                    {t('step3.record')}
                  </span>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground mt-4" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4" />
                    {t('step3.upload')}
                  </Button>
                  <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center z-10 w-full max-w-md space-y-6">
            <div className="w-full bg-white dark:bg-black/40 rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col items-center gap-6">
              <div className="w-full flex items-center gap-4">
                <button
                  onClick={togglePlayback}
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex flex-shrink-0 items-center justify-center hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
                </button>
                
                <div className="flex-1 h-12 flex items-center gap-1 opacity-70">
                  {/* Fake waveform */}
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-1.5 bg-primary/60 rounded-full transition-all duration-150",
                        isPlaying ? "animate-pulse" : ""
                      )}
                      style={{ 
                        height: isPlaying ? `${Math.max(10, Math.random() * 40)}px` : '10px',
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="w-full flex justify-between items-center border-t border-border pt-4">
                   <span className="text-sm font-medium text-primary flex items-center gap-2">
                   <Volume2 className="w-4 h-4" /> {t('step3.audioReady')}
                </span>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('step3.rerecord')}
                </Button>
              </div>
            </div>
            
            <audio 
              ref={audioRef} 
              src={voiceBlobUrl} 
              onEnded={() => setIsPlaying(false)} 
              className="hidden" 
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-md space-y-2 pt-4">
        <label className="text-sm font-medium text-foreground ml-1">{t('step3.writtenMessage')}</label>
        <Textarea 
          value={parentMessage}
          onChange={(e) => onChange({ parentMessage: e.target.value })}
          placeholder={t('step3.writtenPlaceholder')}
          className="min-h-[120px] rounded-2xl resize-none bg-white/50 dark:bg-black/50 backdrop-blur"
        />
      </div>

      <div className="flex gap-4 max-w-md mx-auto w-full pt-4">
        <Button size="lg" variant="outline" className="w-1/3 rounded-full h-14" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button 
          size="lg" 
          className="w-2/3 rounded-full h-14 text-lg" 
          disabled={!voiceBlobUrl && !parentMessage}
          onClick={onNext}
        >
          {t('common.next')}
        </Button>
      </div>
    </motion.div>
  );
}
