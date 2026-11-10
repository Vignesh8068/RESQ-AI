import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * RESQ AI – Next-Level Mission Operations Cursor
 * Smooth central cursor dot + spring-trailing glowing ring.
 * Features:
 * - Magnetic interaction & scale expansion on interactive elements.
 * - Dynamic color adaptation (Emergency Red over critical/danger, Cyan over primary, Green over available).
 * - Active only on devices with pointer: fine (desktop/mouse); hidden on touch.
 * - pointer-events: none ensures clicks & text selections are NEVER blocked.
 * - Respects prefers-reduced-motion.
 */

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState<'default' | 'button' | 'critical' | 'available'>('default');
  const [reducedMotion, setReducedMotion] = useState(false);

  // Mouse coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring physics for trailing follower
  const springConfig = { damping: 24, stiffness: 280, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check for fine pointer (desktop mouse)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReduced);

    if (!hasFinePointer || prefersReduced) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check element under cursor for contextual color & scale
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, input, select, textarea, [data-cursor="interactive"]');
      const isCritical = target.closest('.bg-red-500, [data-priority="critical"], .border-red-500, .btn-primary');
      const isAvailable = target.closest('.bg-green-500, [data-status="available"], .text-green-400');

      if (isCritical) {
        setCursorState('critical');
      } else if (isAvailable) {
        setCursorState('available');
      } else if (interactive) {
        setCursorState('button');
      } else {
        setCursorState('default');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (reducedMotion || !isVisible) return null;

  // Determine colors based on state
  let ringColor = 'rgba(53, 217, 255, 0.4)';
  let dotColor = '#35D9FF';
  let ringScale = 1;
  let ringSize = 34;

  if (cursorState === 'critical') {
    ringColor = 'rgba(255, 64, 87, 0.6)';
    dotColor = '#FF4057';
    ringScale = 1.35;
  } else if (cursorState === 'available') {
    ringColor = 'rgba(32, 201, 151, 0.6)';
    dotColor = '#20C997';
    ringScale = 1.25;
  } else if (cursorState === 'button') {
    ringColor = 'rgba(53, 217, 255, 0.7)';
    dotColor = '#FFFFFF';
    ringScale = 1.4;
  }

  return (
    <div className="hidden pointer-events-none z-[99999] md:block fixed inset-0 overflow-hidden select-none">
      {/* Central Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          x: mouseX,
          y: mouseY,
          backgroundColor: dotColor,
          boxShadow: `0 0 10px ${dotColor}`,
        }}
      />

      {/* Trailing Spring Follower Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 border"
        style={{
          x: smoothX,
          y: smoothY,
          width: ringSize,
          height: ringSize,
          borderColor: ringColor,
          backgroundColor: cursorState !== 'default' ? `${ringColor.replace(/[\d.]+\)$/, '0.12)')}` : 'transparent',
          boxShadow: `0 0 16px ${ringColor}`,
        }}
        animate={{
          scale: ringScale,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      />
    </div>
  );
}
