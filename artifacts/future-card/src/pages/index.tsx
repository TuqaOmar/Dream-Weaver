import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Camera, Mic, QrCode, Printer, Smartphone, Palette } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MemoryFrame } from '@/components/MemoryFrame';
import { DEMO_QR } from '@/lib/demo-art';

const sample = (name: string) => `${import.meta.env.BASE_URL}samples/${name}.jpg`;
import type { FrameTheme } from '@/lib/frame';

/* Small decorative shapes that float around the page. */
function Star({ className, color = '#facc15' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 16.9 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z" fill={color} />
    </svg>
  );
}
function Heart({ className, color = '#f472b6' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 2.9 4.5 6.7 4.5c2.2 0 3.6 1.2 5.3 3.1 1.7-1.9 3.1-3.1 5.3-3.1 3.8 0 5.8 4.1 4.3 7.4C19.5 16.4 12 21 12 21z" fill={color} />
    </svg>
  );
}
function Cloud({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden="true">
      <path d="M14 30h38a10 10 0 0 0 0-20 14 14 0 0 0-26-3A11 11 0 0 0 14 30z" fill="#fff" />
    </svg>
  );
}
function Balloon({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 40 90" className={className} aria-hidden="true">
      <ellipse cx="20" cy="22" rx="17" ry="21" fill={color} />
      <ellipse cx="13" cy="14" rx="4" ry="7" fill="#fff" opacity=".45" />
      <path d="M17 43h6l-3 5z" fill={color} />
      <path d="M20 48c-4 12 4 20 0 40" stroke="#a78bfa" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

const STEP_STYLES = [
  { bg: 'bg-[#fff1f7]', ring: 'ring-[#fbcfe8]', icon: 'bg-[#f472b6]' },
  { bg: 'bg-[#f0f9ff]', ring: 'ring-[#bae6fd]', icon: 'bg-[#38bdf8]' },
  { bg: 'bg-[#f0fdf4]', ring: 'ring-[#bbf7d0]', icon: 'bg-[#34d399]' },
];

export default function Home() {
  const { t, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const steps = [
    { icon: Camera, title: t('home.step1.title'), body: t('home.step1.body') },
    { icon: Mic, title: t('home.step2.title'), body: t('home.step2.body') },
    { icon: QrCode, title: t('home.step3.title'), body: t('home.step3.body') },
  ];

  const samples: { src: string; theme: FrameTheme; label: string; tilt: number }[] = [
    { src: sample('boy-smile'), theme: 'rainbow', label: t('home.sample1'), tilt: -3 },
    { src: sample('boy-field'), theme: 'gold', label: t('home.sample3'), tilt: 2 },
    { src: sample('boy-book'), theme: 'navy', label: t('home.sample4'), tilt: -2 },
  ];
  return (
    <div className="bg-paper overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="bg-confetti pointer-events-none absolute inset-0 opacity-70" />
        <Cloud className="animate-float-slow pointer-events-none absolute start-[6%] top-10 w-24 opacity-90" />
        <Cloud className="animate-float pointer-events-none absolute end-[40%] top-24 hidden w-16 opacity-80 lg:block" />
        <Star className="animate-wiggle pointer-events-none absolute end-[8%] top-14 w-8" />
        <Heart className="animate-float pointer-events-none absolute start-[45%] bottom-16 hidden w-7 lg:block" />
        <Star className="animate-float-slow pointer-events-none absolute start-[3%] bottom-24 w-6" color="#a78bfa" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-12 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-7">
            <span className="eyebrow">{t('hero.badge')}</span>
            <h1 className="text-balance text-5xl font-bold leading-[1.15] tracking-tight text-foreground md:text-6xl">
              <span className="text-rainbow">{t('hero.title')}</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">{t('hero.subtitle')}</p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/create"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#fb923c] px-8 text-lg font-bold text-white shadow-[0_14px_30px_-10px_rgba(236,72,153,0.6)] transition hover:scale-[1.03] active:scale-[0.98]"
                data-testid="cta-create"
              >
                {t('hero.cta')}
                <Arrow className="h-5 w-5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-14 items-center rounded-full border-2 border-primary/20 bg-white/70 px-6 text-base font-semibold text-primary transition hover:bg-white"
              >
                {t('hero.secondary')}
              </Link>
            </div>

            <ul className="flex flex-wrap gap-2.5 pt-1 text-sm font-medium">
              <li className="flex items-center gap-2 rounded-full bg-[#fef3c7] px-3.5 py-1.5 text-[#92400e]"><Smartphone className="h-4 w-4" />{t('hero.point1')}</li>
              <li className="flex items-center gap-2 rounded-full bg-[#e0f2fe] px-3.5 py-1.5 text-[#075985]"><Printer className="h-4 w-4" />{t('hero.point2')}</li>
              <li className="flex items-center gap-2 rounded-full bg-[#fce7f3] px-3.5 py-1.5 text-[#9d174d]"><Palette className="h-4 w-4" />{t('hero.point3')}</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: isRTL ? 3 : -3 }}
            animate={{ opacity: 1, y: 0, rotate: isRTL ? 3 : -3 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative mx-auto w-full max-w-[340px]"
          >
            <div className="absolute -inset-12 -z-10 rounded-full bg-gradient-to-br from-[#fbcfe8] via-[#ddd6fe] to-[#bae6fd] opacity-70 blur-3xl" />
            <Balloon className="animate-float absolute -top-16 -end-10 z-10 w-12" color="#f472b6" />
            <Balloon className="animate-float-slow absolute -top-6 -end-20 z-0 w-10" color="#60a5fa" />
            <Star className="animate-wiggle absolute -bottom-6 -start-8 z-10 w-12" />
            <div className="animate-float-slow">
              <MemoryFrame src={sample('boy-book')} alt="" qrCodeUrl={DEMO_QR} theme="rainbow" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <div className="mb-10 max-w-2xl space-y-3">
            <span className="eyebrow">{t('home.how.eyebrow')}</span>
            <h2 className="text-3xl font-bold md:text-4xl">{t('home.how.title')}</h2>
          </div>
          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => {
              const st = STEP_STYLES[i];
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative rounded-[2rem] p-7 ring-2 ${st.bg} ${st.ring} transition hover:-translate-y-1`}
                >
                  <span className={`absolute end-6 top-6 flex h-9 w-9 items-center justify-center rounded-full ${st.icon} text-lg font-bold text-white`}>{i + 1}</span>
                  <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${st.icon} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{body}</p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Samples */}
      <section className="relative bg-gradient-to-b from-transparent via-[#f5f3ff] to-transparent" data-testid="samples">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
          <div className="mb-12 max-w-2xl space-y-3">
            <span className="eyebrow">{t('home.samples.eyebrow')}</span>
            <h2 className="text-3xl font-bold md:text-4xl">{t('home.samples.title')}</h2>
            <p className="text-lg text-muted-foreground">{t('home.samples.body')}</p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-3 md:gap-10">
            {samples.map((s, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 24, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate: s.tilt }}
                whileHover={{ rotate: 0, scale: 1.04 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="space-y-3"
              >
                <MemoryFrame src={s.src} alt={s.label} qrCodeUrl={DEMO_QR} theme={s.theme} />
                <figcaption className="text-center text-base font-semibold text-foreground/80">{s.label}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#fb923c] px-8 py-12 text-white md:flex-row md:items-center md:px-12">
          <Star className="animate-wiggle absolute end-[30%] top-4 w-8 opacity-80" color="#fff" />
          <Heart className="animate-float absolute bottom-4 start-[45%] w-7 opacity-70" color="#fff" />
          <div className="relative space-y-2">
            <h2 className="text-3xl font-bold md:text-4xl">{t('home.band.title')}</h2>
            <p className="text-lg text-white/85">{t('home.band.body')}</p>
          </div>
          <Link href="/create" className="relative inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-white px-8 text-lg font-bold text-[#7c3aed] shadow-lg transition hover:scale-[1.04]">
            {t('hero.cta')}
            <Arrow className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">{t('memory.brand')} <Heart className="h-4 w-4" /> {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
