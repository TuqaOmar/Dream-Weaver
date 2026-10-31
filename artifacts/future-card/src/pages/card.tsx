import { useEffect, useMemo, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetCard,
  getGetCardQueryKey,
  getListCardsQueryKey,
  useUpdateCard,
  useGenerateCardImage,
} from '@workspace/api-client-react';
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Printer,
  Share2,
  ExternalLink,
  Copy,
  Check,
  HardDrive,
  Globe,
  Pencil,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { MemoryFrame } from '@/components/MemoryFrame';
import { VoicePlayer } from '@/components/VoicePlayer';
import { FRAME_THEMES, type FrameTheme, loadTheme, saveTheme, themeLabel, themeSwatch, renderCardToCanvas } from '@/lib/frame';
import { isDriveUrl, normalizeDriveLink, parseDriveLink, qrTargetFor } from '@/lib/drive';
import { cn } from '@/lib/utils';

export default function CardView() {
  const [, params] = useRoute('/card/:id');
  const id = params?.id;
  const { t, language, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: card, isLoading, refetch } = useGetCard(id!, {
    query: {
      enabled: !!id,
      queryKey: getGetCardQueryKey(id!),
      refetchInterval: (q) => (q.state.data?.status === 'generating' ? 2500 : false),
    },
  });

  const updateCard = useUpdateCard();
  const generateQr = useGenerateCardImage();

  const [theme, setTheme] = useState<FrameTheme>(() => loadTheme(id));
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingLink, setEditingLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  useEffect(() => setTheme(loadTheme(id)), [id]);

  const qrTarget = useMemo(() => (card ? qrTargetFor(card) : ''), [card]);
  const opensDrive = !!card && isDriveUrl(card.voiceMessageUrl);
  const photo = card?.childPhotoUrl || card?.aiImageUrl || null;
  const Back = isRTL ? ArrowRight : ArrowLeft;

  const pickTheme = (th: FrameTheme) => {
    setTheme(th);
    if (id) saveTheme(id, th);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrTarget);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ title: qrTarget });
    }
  };

  const share = async () => {
    if (!card) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${t('memory.brand')} · ${card.childName}`, url: qrTarget });
      } catch {
        /* cancelled */
      }
    } else {
      copyLink();
    }
  };

  const download = async () => {
    if (!card || !photo) return;
    setDownloading(true);
    try {
      const canvas = await renderCardToCanvas({
        theme,
        photoUrl: photo,
        qrCodeUrl: card.qrCodeUrl,
        childName: card.childName,
        caption: t('frame.scanCaption'),
        isRTL,
      });
      const link = document.createElement('a');
      link.download = `${card.childName || 'card'}-${theme}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      toast({ title: t('error.genericTitle'), description: t('card.downloadFailed'), variant: 'destructive' });
    } finally {
      setDownloading(false);
    }
  };

  const saveDriveLink = async () => {
    if (!card) return;
    const normalized = normalizeDriveLink(linkDraft);
    if (!normalized) return;
    setSavingLink(true);
    try {
      await updateCard.mutateAsync({ id: card.id, data: { voiceMessageUrl: normalized } });
      await generateQr.mutateAsync({ id: card.id });
      await refetch();
      queryClient.invalidateQueries({ queryKey: getListCardsQueryKey() });
      setEditingLink(false);
      setLinkDraft('');
      toast({ title: t('card.linkSaved') });
    } catch (e) {
      toast({ title: t('error.genericTitle'), description: t('error.tryAgain'), variant: 'destructive' });
    } finally {
      setSavingLink(false);
    }
  };

  const deletePhoto = async () => {
    if (!card || !confirm(t('card.deletePhotoConfirm'))) return;
    await fetch(`/api/cards/${card.id}/photo`, { method: 'DELETE' });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!card) {
    return <div className="py-24 text-center text-muted-foreground">{t('common.cardNotFound')}</div>;
  }

  const generating = card.status === 'generating';
  const draftParsed = parseDriveLink(linkDraft);

  return (
    <div className="bg-paper min-h-[calc(100dvh-4rem)] pb-20 pt-6 print:bg-white print:p-0 print-page-wrapper">
      <div className="mx-auto max-w-6xl px-4 md:px-8 print:max-w-none print:p-0">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <Back className="h-4 w-4" />
            {t('card.backDashboard')}
          </Link>
          <Link href="/create" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary">
            <Plus className="h-4 w-4" />
            {t('card.createAnother')}
          </Link>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-14 print:block">
          {/* Card preview */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-[420px] print:max-w-none">
            <div className="print-card-frame">
              {photo ? (
                <MemoryFrame src={photo} alt={card.childName} qrCodeUrl={card.qrCodeUrl} childName={card.childName} theme={theme} />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center rounded-[2rem] border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                  {t('common.noImageGenerated')}
                </div>
              )}
            </div>

            <div className="mt-6 print:hidden">
              <p className="mb-2.5 text-center text-xs font-semibold text-muted-foreground">{t('card.frameStyle')}</p>
              <div className="flex justify-center gap-2" role="radiogroup" aria-label={t('card.frameStyle')}>
                {FRAME_THEMES.map((th) => (
                  <button
                    key={th}
                    type="button"
                    role="radio"
                    aria-checked={theme === th}
                    onClick={() => pickTheme(th)}
                    className={cn(
                      'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                      theme === th ? 'border-primary bg-card shadow-sm' : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                    data-testid={`theme-${th}`}
                  >
                    <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ background: themeSwatch(th) }} />
                    {themeLabel(th, language)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Side panel */}
          <div className="min-w-0 space-y-5 print:hidden">
            <div>
              <span className="eyebrow">{t('card.ready')}</span>
              <h1 className="mt-2 font-serif text-4xl font-semibold" data-testid="card-title">{card.childName}</h1>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={download}
                disabled={generating || downloading || !photo}
                className="col-span-2 flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50 sm:col-span-1"
                data-testid="button-download"
              >
                {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {t('card.download')}
              </button>
              <button type="button" onClick={() => window.print()} disabled={generating} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card font-semibold transition hover:bg-secondary disabled:opacity-50">
                <Printer className="h-5 w-5" />
                {t('card.print')}
              </button>
              <button type="button" onClick={share} disabled={generating} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-card font-semibold transition hover:bg-secondary disabled:opacity-50">
                <Share2 className="h-5 w-5" />
                {t('card.shareLink')}
              </button>
            </div>

            {/* QR destination */}
            <section className="rounded-3xl border border-border bg-card p-5 sm:p-6" data-testid="qr-destination">
              <div className="flex items-start gap-4">
                {card.qrCodeUrl ? (
                  <img src={card.qrCodeUrl} alt={t('common.qrAlt')} className="h-24 w-24 shrink-0 rounded-xl border border-border bg-white p-1.5 [image-rendering:pixelated]" />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                    {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : t('common.noQr')}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <h2 className="font-semibold">{t('card.qrOpens')}</h2>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                      opensDrive ? 'bg-emerald-50 text-emerald-800' : 'bg-secondary text-secondary-foreground',
                    )}
                    data-testid="qr-destination-kind"
                  >
                    {opensDrive ? <HardDrive className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                    {opensDrive ? 'Google Drive' : t('card.listenPage')}
                  </span>
                  <p className="truncate font-mono text-xs text-muted-foreground" dir="ltr" title={qrTarget} data-testid="qr-target">
                    {qrTarget}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a href={qrTarget} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/70">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {t('card.testLink')}
                    </a>
                    <button type="button" onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold hover:bg-secondary/70">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? t('common.copied') : t('common.copy')}
                    </button>
                    <button type="button" onClick={() => setEditingLink((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary" data-testid="button-edit-link">
                      <Pencil className="h-3.5 w-3.5" />
                      {opensDrive ? t('card.changeDrive') : t('card.useDrive')}
                    </button>
                  </div>
                </div>
              </div>

              {editingLink && (
                <div className="mt-5 space-y-2 border-t border-border pt-5">
                  <label htmlFor="edit-drive" className="text-sm font-semibold">{t('step3.driveLabel')}</label>
                  <div className="flex gap-2">
                    <input
                      id="edit-drive"
                      dir="ltr"
                      value={linkDraft}
                      onChange={(e) => setLinkDraft(e.target.value)}
                      placeholder="https://drive.google.com/file/d/…/view"
                      className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 font-mono text-xs outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                      data-testid="input-edit-drive"
                    />
                    <button
                      type="button"
                      disabled={!draftParsed || savingLink}
                      onClick={saveDriveLink}
                      className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                      data-testid="button-save-drive"
                    >
                      {savingLink && <Loader2 className="h-4 w-4 animate-spin" />}
                      {t('common.save')}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('card.driveEditHint')}</p>
                </div>
              )}
            </section>

            {/* Voice + message */}
            {(card.voiceMessageUrl || card.parentMessage) && (
              <section className="space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
                <h2 className="font-semibold">{t('card.playMessage')}</h2>
                {card.voiceMessageUrl && <VoicePlayer url={card.voiceMessageUrl} />}
                {card.parentMessage && (
                  <blockquote className="border-s-2 border-accent ps-4 font-serif text-lg italic leading-relaxed text-foreground/80">
                    {card.parentMessage}
                  </blockquote>
                )}
              </section>
            )}

            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{t('card.printTip')}</span>
              {card.childPhotoUrl && (
                <button type="button" onClick={deletePhoto} className="inline-flex items-center gap-1 underline-offset-4 hover:text-destructive hover:underline">
                  <Trash2 className="h-3 w-3" />
                  {t('card.deletePhoto')}
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
