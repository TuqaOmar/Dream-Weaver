import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowRight, Camera, Mic, QrCode, Printer, Smartphone, Palette } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MemoryFrame } from '@/components/MemoryFrame';
import { DEMO_QR } from '@/lib/demo-art';
import { TiltCard } from '@/components/TiltCard';

// Free photos from Unsplash (Unsplash License — free for commercial use).
const unsplash = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${Math.round(w * 1.5)}&fit=crop&crop=faces&auto=format&q=80`;
const HERO_PHOTO = unsplash('1621878166843-d060a5ff51ea', 900);
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

/* Headline words pop in one after another. */
const headline: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const headlineWord: Variants = {
  hidden: { opacity: 0, y: 34, scale: 0.6, rotate: -8 },
  show: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 420, damping: 16 } },
};

/* Rainbow headline split into words; each word shows its own slice of one continuous gradient. */
function PopHeadline({ text, isRTL }: { text: string; isRTL: boolean }) {
  const words = text.split(/\s+/).filter(Boolean);
  const n = words.length;
  return (
    <motion.span variants={headline} initial="hidden" animate="show" className="inline">
      {words.map((word, i) => {
        const slot = isRTL ? n - 1 - i : i;
        return (
          <span key={`${i}-${word}`}>
            <motion.span
              variants={headlineWord}
              className="text-rainbow inline-block"
              style={{ backgroundSize: `${n * 100}% 100%`, backgroundPosition: `${n > 1 ? (slot / (n - 1)) * 100 : 0}% 0` }}
            >
              {word}
            </motion.span>
            {i < n - 1 ? ' ' : null}
          </span>
        );
      })}
    </motion.span>
  );
}

/* Wraps a call-to-action with a breathing glow behind it. */
function GlowWrap({ children, glow }: { children: ReactNode; glow: string }) {
  return (
    <span className="relative isolate inline-flex">
      <span aria-hidden="true" className={`glow-pulse pointer-events-none absolute -inset-1.5 -z-10 rounded-full blur-lg ${glow}`} />
      {children}
    </span>
  );
}

const stepCard: Variants = {
  rest: { y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  hover: { y: -8, transition: { type: 'spring', stiffness: 300, damping: 16 } },
};
const stepIcon: Variants = {
  rest: { y: 0, rotate: 0, scale: 1 },
  hover: { y: [0, -12, 0, -5, 0], rotate: [0, -10, 8, -4, 0], scale: [1, 1.12, 1, 1.05, 1], transition: { duration: 0.7, ease: 'easeOut' } },
};
const stepBadge: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.15, rotate: 12, transition: { type: 'spring', stiffness: 400, damping: 12 } },
};

/* Sample cards fan in from a tilt, then lift and straighten on hover. */
const sampleHover: Variants = {
  rest: { y: 0, rotate: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
  // `custom` is the card's resting tilt, so hovering cancels it and the card stands straight.
  hover: (tilt: number) => ({ y: -14, scale: 1.06, rotate: -tilt, transition: { type: 'spring', stiffness: 260, damping: 16 } }),
};
const sampleShadow: Variants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.25 } },
};

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
    { src: unsplash('1707745736009-21c1af000560'), theme: 'rainbow', label: t('home.sample1'), tilt: -3 },
    { src: unsplash('1793984490614-3a94aea1cb36'), theme: 'gold', label: t('home.sample3'), tilt: 2 },
    { src: unsplash('1744973004605-118c8be37da4'), theme: 'navy', label: t('home.sample4'), tilt: -2 },
  ];
  return (
    <div className="bg-paper overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="bg-confetti pointer-events-none absolute inset-0 opacity-70" />
        <Cloud className="animate-drift-slow pointer-events-none absolute start-[6%] top-10 w-24 opacity-90" />
        <Cloud className="animate-drift pointer-events-none absolute end-[40%] top-24 hidden w-16 opacity-80 lg:block" />
        <Star className="animate-twinkle pointer-events-none absolute end-[8%] top-14 w-8" />
        <Heart className="animate-drift pointer-events-none absolute start-[45%] bottom-16 hidden w-7 lg:block" />
        <Star className="animate-drift-slow pointer-events-none absolute start-[3%] bottom-24 w-6" color="#a78bfa" />
        <Star className="animate-twinkle pointer-events-none absolute start-[38%] top-8 hidden w-5 [animation-delay:1.4s] lg:block" color="#38bdf8" />
        <Heart className="animate-drift-slow pointer-events-none absolute end-[4%] bottom-28 hidden w-6 md:block" color="#fb923c" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-12 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-7">
            <span className="eyebrow">{t('hero.badge')}</span>
            <h1 className="text-balance text-5xl font-bold leading-[1.15] tracking-tight text-foreground md:text-6xl">
              <PopHeadline key={t('hero.title')} text={t('hero.title')} isRTL={isRTL} />
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">{t('hero.subtitle')}</p>

            <div className="flex flex-wrap items-center gap-3">
              <GlowWrap glow="bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#fb923c]">
                <Link
                  href="/create"
                  className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#fb923c] px-8 text-lg font-bold text-white shadow-[0_14px_30px_-10px_rgba(236,72,153,0.6)] transition hover:scale-[1.03] active:scale-[0.98]"
                  data-testid="cta-create"
                >
                  <span aria-hidden="true" className="shine-sweep" />
                  <span className="relative">{t('hero.cta')}</span>
                  <Arrow className="relative h-5 w-5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </Link>
              </GlowWrap>
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
            initial={{ opacity: 0, y: 40, scale: 0.85, rotate: isRTL ? 10 : -10 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: isRTL ? 3 : -3 }}
            transition={{ type: 'spring', stiffness: 170, damping: 15, delay: 0.25, opacity: { duration: 0.4, delay: 0.25 } }}
            className="relative mx-auto w-full max-w-[340px]"
          >
            <div className="glow-pulse absolute -inset-12 -z-10 rounded-full bg-gradient-to-br from-[#fbcfe8] via-[#ddd6fe] to-[#bae6fd] opacity-70 blur-3xl" />
            <Balloon className="animate-balloon absolute -top-16 -end-10 z-10 w-12" color="#f472b6" />
            <Balloon className="animate-balloon-slow absolute -top-6 -end-20 z-0 w-10" color="#60a5fa" />
            <Star className="animate-twinkle absolute -bottom-6 -start-8 z-10 w-12" />
            <TiltCard>
              <div className="animate-float-slow">
                <MemoryFrame src={HERO_PHOTO} alt="" qrCodeUrl={DEMO_QR} theme="rainbow" />
              </div>
            </TiltCard>
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
                  initial={{ opacity: 0, y: 48, scale: 0.85 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: i * 0.14, opacity: { duration: 0.35, delay: i * 0.14 } }}
                >
                  <motion.div
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    variants={stepCard}
                    className={`relative h-full rounded-[2rem] p-7 ring-2 ${st.bg} ${st.ring}`}
                  >
                    <motion.span
                      variants={stepBadge}
                      className={`absolute end-6 top-6 flex h-9 w-9 items-center justify-center rounded-full ${st.icon} text-lg font-bold text-white`}
                    >
                      {i + 1}
                    </motion.span>
                    <motion.div variants={stepIcon} className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${st.icon} text-white shadow-lg`}>
                      <Icon className="h-7 w-7" />
                    </motion.div>
                    <h3 className="mb-2 text-xl font-bold">{title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{body}</p>
                  </motion.div>
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
                initial={{ opacity: 0, y: 70, scale: 0.8, rotate: s.tilt * 5 }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotate: s.tilt }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ type: 'spring', stiffness: 150, damping: 15, delay: i * 0.18, opacity: { duration: 0.35, delay: i * 0.18 } }}
                className="space-y-3"
              >
                <motion.div initial="rest" animate="rest" whileHover="hover" variants={sampleHover} custom={s.tilt} className="relative">
                  <motion.div
                    aria-hidden="true"
                    variants={sampleShadow}
                    className="pointer-events-none absolute inset-[3%] rounded-[8%] shadow-[0_45px_70px_-15px_rgba(91,33,182,0.55)]"
                  />
                  <MemoryFrame src={s.src} alt={s.label} qrCodeUrl={DEMO_QR} theme={s.theme} />
                </motion.div>
                <figcaption className="text-center text-base font-semibold text-foreground/80">{s.label}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#fb923c] px-8 py-12 text-white md:flex-row md:items-center md:px-12">
          <Star className="animate-twinkle absolute end-[30%] top-4 w-8 opacity-80" color="#fff" />
          <Heart className="animate-drift absolute bottom-4 start-[45%] w-7 opacity-70" color="#fff" />
          <div className="relative space-y-2">
            <h2 className="text-3xl font-bold md:text-4xl">{t('home.band.title')}</h2>
            <p className="text-lg text-white/85">{t('home.band.body')}</p>
          </div>
          <GlowWrap glow="bg-white/70">
            <Link href="/create" className="relative inline-flex h-14 shrink-0 items-center gap-2 overflow-hidden rounded-full bg-white px-8 text-lg font-bold text-[#7c3aed] shadow-lg transition hover:scale-[1.04]">
              <span
                aria-hidden="true"
                className="shine-sweep"
                style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(236,72,153,0.22) 48%, rgba(139,92,246,0.12) 56%, transparent 70%)' }}
              />
              <span className="relative">{t('hero.cta')}</span>
              <Arrow className="relative h-5 w-5" />
            </Link>
          </GlowWrap>
        </div>
      </section>

      <footer className="space-y-2 py-8 text-center text-sm text-muted-foreground" data-testid="footer">
        <p>
          {t('footer.madeBy')}{' '}
          <a
            href="https://www.linkedin.com/in/tuqa-dahab/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t('footer.author')}
          </a>
        </p>
        <span className="inline-flex items-center gap-1.5">{t('memory.brand')} <Heart className="h-4 w-4" /> {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
