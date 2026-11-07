import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Camera, Mic, QrCode, Printer, ShieldCheck, HardDrive } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MemoryFrame } from '@/components/MemoryFrame';
import { DEMO_PHOTO, DEMO_QR } from '@/lib/demo-art';

export default function Home() {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const steps = [
    { icon: Camera, title: t('home.step1.title'), body: t('home.step1.body') },
    { icon: Mic, title: t('home.step2.title'), body: t('home.step2.body') },
    { icon: QrCode, title: t('home.step3.title'), body: t('home.step3.body') },
  ];

  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-12 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
          <span className="eyebrow">{t('hero.badge')}</span>
          <h1 className="text-balance font-serif text-5xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-6xl">
            {t('hero.title')}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{t('hero.subtitle')}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/create"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.6)] transition hover:bg-primary/90 active:scale-[0.98]"
              data-testid="cta-create"
            >
              {t('hero.cta')}
              <Arrow className="h-5 w-5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Link>
            <Link href="/dashboard" className="inline-flex h-14 items-center rounded-full px-6 text-base font-medium text-foreground/80 hover:text-foreground">
              {t('hero.secondary')}
            </Link>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><HardDrive className="h-4 w-4 text-accent" />{t('hero.point1')}</li>
            <li className="flex items-center gap-2"><Printer className="h-4 w-4 text-accent" />{t('hero.point2')}</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" />{t('hero.point3')}</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, rotate: isRTL ? 2 : -2 }}
          animate={{ opacity: 1, y: 0, rotate: isRTL ? 2 : -2 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative mx-auto w-full max-w-[340px]"
        >
          <div className="absolute -inset-10 -z-10 rounded-full bg-accent/15 blur-3xl" />
          <MemoryFrame src={DEMO_PHOTO} alt="" qrCodeUrl={DEMO_QR} childName={t('home.demoName')} theme="rainbow" />
        </motion.div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/70 bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <div className="mb-12 max-w-2xl space-y-3">
            <span className="eyebrow">{t('home.how.eyebrow')}</span>
            <h2 className="font-serif text-3xl font-semibold md:text-4xl">{t('home.how.title')}</h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={i} className="relative rounded-3xl border border-border bg-background p-7">
                <span className="absolute end-6 top-6 font-serif text-5xl font-semibold text-foreground/[0.06]">{i + 1}</span>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-primary px-8 py-12 text-primary-foreground md:flex-row md:items-center md:px-12">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-semibold">{t('home.band.title')}</h2>
            <p className="text-primary-foreground/70">{t('home.band.body')}</p>
          </div>
          <Link href="/create" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#f4e6cf] px-7 font-semibold text-primary transition hover:bg-white">
            {t('hero.cta')}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/70 py-8 text-center text-sm text-muted-foreground">
        {t('memory.brand')} · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
