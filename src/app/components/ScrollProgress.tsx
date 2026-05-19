import { motion, useScroll, useSpring } from 'motion/react';

/**
 * Thin gradient progress bar at the top of the page.
 * Shows scroll progress — a subtle but premium UX detail.
 * Used by Apple, Linear, and most Awwwards-winning sites.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[200] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, var(--eco-emerald-dim), var(--eco-emerald), var(--eco-amber))',
      }}
    />
  );
}
