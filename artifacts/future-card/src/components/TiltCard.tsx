import { useRef, type PointerEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

const MAX_TILT = 12; // degrees
const SPRING = { stiffness: 180, damping: 16, mass: 0.6 };

/**
 * Gently tilts its content in 3D towards the mouse pointer and springs back
 * when the pointer leaves. Touch / pen input and reduced motion are ignored.
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, SPRING);
  const rotateY = useSpring(ry, SPRING);
  const scale = useSpring(1, SPRING);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * MAX_TILT * 2);
    rx.set(-py * MAX_TILT * 2);
    scale.set(1.03);
  };

  const reset = () => {
    rx.set(0);
    ry.set(0);
    scale.set(1);
  };

  return (
    <div ref={ref} className={cn('[perspective:1000px]', className)} onPointerMove={onMove} onPointerLeave={reset} onPointerCancel={reset}>
      <motion.div style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }}>{children}</motion.div>
    </div>
  );
}
