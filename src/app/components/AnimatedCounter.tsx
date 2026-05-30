import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

interface AnimatedCounterProps {
  /** Target number to count to */
  target: number;
  /** Duration of the animation in ms */
  duration?: number;
  /** Suffix to display after the number (e.g., '%', '+', 'K') */
  suffix?: string;
  /** Prefix to display before the number (e.g., '$') */
  prefix?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Additional className */
  className?: string;
}

/**
 * Animated counter that counts from 0 to target when scrolled into view.
 * Uses an ease-out-expo curve for a satisfying counting effect.
 * Replaces static numbers in stats sections with engaging animations.
 */
export function AnimatedCounter({
  target,
  duration = 2000,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!isInView) return;

    // Nếu đã chạy hiệu ứng xong 1 lần, lập tức cập nhật giá trị tĩnh mới mà không chạy lại từ 0
    if (hasAnimatedRef.current) {
      setDisplayValue(target);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out-expo curve for satisfying deceleration
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(eased * target);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        hasAnimatedRef.current = true; // Khóa hiệu ứng sau khi hoàn thành
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, target, duration]);

  const formatted = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
