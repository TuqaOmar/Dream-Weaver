import { useEffect, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** sessionStorage key: set to a card id right before the wizard opens that card. */
export const CELEBRATE_KEY = 'fc:celebrate';

const COLORS = ['#8b5cf6', '#ec4899', '#fb923c', '#facc15', '#34d399', '#38bdf8'];
const PIECES = 60;
const DURATION = 2.5;

interface Piece {
  id: number;
  color: string;
  w: number;
  h: number;
  round: boolean;
  dx: number;
  peak: number;
  fall: number;
  spin: number;
  duration: number;
  delay: number;
  originX: number;
}

function makePieces(): Piece[] {
  return Array.from({ length: PIECES }, (_, id) => {
    // Shoot upwards in a wide fan, then fall with gravity.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
    const speed = 260 + Math.random() * 300;
    const round = Math.random() < 0.3;
    const size = 7 + Math.random() * 6;
    return {
      id,
      color: COLORS[id % COLORS.length],
      w: size,
      h: round ? size : size * (1.4 + Math.random() * 0.6),
      round,
      dx: Math.cos(angle) * speed,
      peak: Math.sin(angle) * speed,
      fall: 380 + Math.random() * 320,
      spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
      duration: DURATION - 0.5 + Math.random() * 0.5,
      delay: Math.random() * 0.15,
      originX: 50 + (Math.random() - 0.5) * 16,
    };
  });
}

/** A one-off confetti burst over the page. Calls onDone when it is finished. */
export function ConfettiBurst({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(makePieces, []);

  useEffect(() => {
    const timer = window.setTimeout(onDone, reduce ? 0 : (DURATION + 0.3) * 1000);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reduce) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden print:hidden" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block"
          style={{
            left: `${p.originX}%`,
            top: '38%',
            width: p.w,
            height: p.h,
            marginLeft: -p.w / 2,
            background: p.color,
            borderRadius: p.round ? '9999px' : '2px',
          }}
          initial={{ x: 0, y: 0, rotate: 0, scale: 0.3, opacity: 1 }}
          animate={{
            x: [0, p.dx * 0.8, p.dx],
            y: [0, p.peak, p.peak + p.fall],
            rotate: [0, p.spin * 0.5, p.spin],
            scale: [0.3, 1, 0.9],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            times: [0, 0.32, 1],
            x: { duration: p.duration, delay: p.delay, times: [0, 0.32, 1], ease: ['easeOut', 'linear'] },
            y: { duration: p.duration, delay: p.delay, times: [0, 0.32, 1], ease: ['easeOut', 'easeIn'] },
            opacity: { duration: p.duration, delay: p.delay, times: [0, 0.75, 1], ease: 'linear' },
          }}
        />
      ))}
    </div>
  );
}
