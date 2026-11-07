import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Upload, Link2, Trash2, CheckCircle2, AlertCircle, Info, HardDrive } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { AudioPlayer } from '@/components/VoicePlayer';
import { parseDriveLink } from '@/lib/drive';
import { useAppConfig } from '@/hooks/use-app-config';

export type VoiceMode = 'record' | 'upload' | 'drive';

export interface VoiceState {
  mode: VoiceMode;
  file: File | null;
  blobUrl: string | null;
  driveLink: string;
  message: string;
}

export const EMPTY_VOICE: VoiceState = { mode: 'record', file: null, blobUrl: null, driveLink: '', message: '' };

const MAX_RECORD_SECONDS = 5 * 60;
const SITE_STORAGE_LIMIT = 2 * 1024 * 1024; // keeps the whole card under Vercel's request limit

interface Props {
  value: VoiceState;
  onChange: (u: Partial<VoiceState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const mb = (b: number) => (b / 1024 / 1024).toFixed(1);

export function Step3Voice({ value, onChange, onNext, onBack }: Props) {
  const { t } = useLanguage();
  const { data: config } = useAppConfig();
  const driveEnabled = !!config?.driveEnabled;
  const maxBytes = driveEnabled ? config!.maxUploadBytes : SITE_STORAGE_LIMIT;

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isRecording) return;
    setSeconds(0);
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording && seconds >= MAX_RECORD_SECONDS) stopRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, isRecording]);

  useEffect(
    () => () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    },
    [],
  );

  const setAudio = (file: File | null) => {
    setFileError(null);
    if (file && file.size > maxBytes) {
      setFileError(t('step3.tooLarge').replace('{size}', mb(file.size)).replace('{max}', mb(maxBytes)));
      return;
    }
    onChange({ file, blobUrl: file ? URL.createObjectURL(file) : null });
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setFileError(t('error.microphone'));
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/ogg'];
      const mimeType = types.find((tp) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(tp)) || '';
      let rec: MediaRecorder;
      try {
        rec = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 64000 });
      } catch {
        rec = new MediaRecorder(stream);
      }
      recorderRef.current = rec;
      rec.ondataavailable = (e) => e.data?.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const type = (rec.mimeType || mimeType || 'audio/webm').split(';')[0];
        const ext = type.includes('mp4') || type.includes('aac') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
        const blob = new Blob(chunksRef.current, { type });
        setAudio(new File([blob], `voice-message.${ext}`, { type }));
        stream.getTracks().forEach((tr) => tr.stop());
      };
      rec.start(250);
      setIsRecording(true);
      setFileError(null);
    } catch (err: any) {
      setFileError(err?.name === 'NotAllowedError' ? t('error.micPermission') : t('error.microphone'));
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
    setIsRecording(false);
  };

  const driveParsed = parseDriveLink(value.driveLink);
  const driveInvalid = value.driveLink.trim().length > 0 && !driveParsed;

  const hasVoice = value.mode === 'drive' ? !!driveParsed : !!value.file;
  const canContinue = (hasVoice || !!value.message.trim()) && !isRecording && !driveInvalid;

  const tabs: { id: VoiceMode; label: string; icon: typeof Mic }[] = [
    { id: 'record', label: t('step3.tab.record'), icon: Mic },
    { id: 'upload', label: t('step3.tab.upload'), icon: Upload },
    { id: 'drive', label: t('step3.tab.drive'), icon: Link2 },
  ];

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mx-auto max-w-xl space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="font-serif text-3xl font-semibold md:text-4xl">{t('step3.title')}</h1>
        <p className="text-muted-foreground">{t('step3.subtitle')}</p>
      </header>

      <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-7">
        {/* Where the QR leads */}
        <div className={cn('mb-6 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm', driveEnabled || value.mode === 'drive' ? 'bg-emerald-50 text-emerald-900' : 'bg-secondary text-secondary-foreground')} data-testid="qr-destination-note">
          {driveEnabled || value.mode === 'drive' ? <HardDrive className="mt-0.5 h-4 w-4 shrink-0" /> : <Info className="mt-0.5 h-4 w-4 shrink-0" />}
          <p>{value.mode === 'drive' ? t('step3.note.driveLink') : driveEnabled ? t('step3.note.driveAuto') : t('step3.note.site')}</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-3 gap-1 rounded-full bg-muted p-1" role="tablist">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={value.mode === id}
              disabled={isRecording}
              onClick={() => {
                setFileError(null);
                onChange({ mode: id });
              }}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-sm font-semibold transition',
                value.mode === id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
              data-testid={`tab-${id}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Audio ready (record / upload) */}
        {value.mode !== 'drive' && value.file && value.blobUrl && (
          <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
            <AudioPlayer src={value.blobUrl} />
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {t('step3.audioReady')} · <span dir="ltr">{mb(value.file.size)} MB</span>
              </span>
              <button type="button" onClick={() => onChange({ file: null, blobUrl: null })} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
                {t('step3.rerecord')}
              </button>
            </div>
          </div>
        )}

        {value.mode === 'record' && !value.file && (
          <div className="flex flex-col items-center py-4">
            <p className="mb-6 max-w-sm text-center font-serif text-lg italic text-foreground/70">{t('step3.prompt')}</p>
            <div className="relative">
              {isRecording && <span className="absolute inset-0 animate-ping rounded-full bg-destructive/25" />}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  'relative flex h-24 w-24 items-center justify-center rounded-full shadow-xl transition active:scale-95',
                  isRecording ? 'bg-destructive text-white' : 'bg-accent text-accent-foreground hover:brightness-105',
                )}
                aria-label={isRecording ? t('step3.stop') : t('step3.record')}
                data-testid="button-record"
              >
                {isRecording ? <Square className="h-8 w-8 fill-current" /> : <Mic className="h-10 w-10" />}
              </button>
            </div>
            <p className={cn('mt-5 font-mono text-sm tabular-nums', isRecording ? 'text-destructive' : 'text-muted-foreground')} dir="ltr">
              {isRecording ? `${fmt(seconds)} / ${fmt(MAX_RECORD_SECONDS)}` : t('step3.tapToRecord')}
            </p>
          </div>
        )}

        {value.mode === 'upload' && !value.file && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-border px-6 py-10 text-center transition hover:border-primary/40 hover:bg-secondary/40"
            data-testid="button-upload-audio"
          >
            <Upload className="mb-3 h-8 w-8 text-primary" />
            <span className="font-semibold">{t('step3.upload')}</span>
            <span className="mt-1 text-sm text-muted-foreground">{t('step3.uploadHint').replace('{max}', mb(maxBytes))}</span>
          </button>
        )}

        {value.mode === 'drive' && (
          <div className="space-y-3">
            <label htmlFor="drive-link" className="text-sm font-semibold">
              {t('step3.driveLabel')}
            </label>
            <input
              id="drive-link"
              dir="ltr"
              inputMode="url"
              value={value.driveLink}
              onChange={(e) => onChange({ driveLink: e.target.value })}
              placeholder="https://drive.google.com/file/d/…/view"
              className={cn(
                'h-12 w-full rounded-xl border bg-background px-4 font-mono text-sm outline-none transition focus:ring-4',
                driveInvalid ? 'border-destructive focus:ring-destructive/10' : 'border-input focus:border-primary focus:ring-primary/10',
              )}
              data-testid="input-drive-link"
            />
            {driveInvalid && <p className="flex items-center gap-1.5 text-xs font-medium text-destructive"><AlertCircle className="h-3.5 w-3.5" />{t('step3.driveInvalid')}</p>}
            {driveParsed && <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />{driveParsed.kind === 'folder' ? t('step3.driveFolderOk') : t('step3.driveFileOk')}</p>}
            <ol className="list-decimal space-y-1 rounded-xl bg-muted/60 px-8 py-3 text-xs leading-relaxed text-muted-foreground">
              <li>{t('step3.driveHelp1')}</li>
              <li>{t('step3.driveHelp2')}</li>
              <li>{t('step3.driveHelp3')}</li>
            </ol>
          </div>
        )}

        {fileError && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" data-testid="voice-error">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {fileError}
          </p>
        )}

        <div className="mt-7 space-y-2">
          <label htmlFor="parent-message" className="text-sm font-semibold">
            {t('step3.writtenMessage')}
          </label>
          <textarea
            id="parent-message"
            value={value.message}
            maxLength={600}
            onChange={(e) => onChange({ message: e.target.value })}
            placeholder={t('step3.writtenPlaceholder')}
            className="min-h-[96px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      <input
        type="file"
        accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          setAudio(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
        data-testid="input-audio"
      />

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={isRecording} className="h-14 w-1/3 rounded-full border border-border bg-card font-semibold transition hover:bg-secondary disabled:opacity-40">
          {t('common.back')}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="h-14 flex-1 rounded-full bg-primary text-base font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="button-finish"
        >
          {t('step3.finish')}
        </button>
      </div>
    </motion.div>
  );
}
