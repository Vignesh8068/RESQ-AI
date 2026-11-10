import React from 'react';
import { motion } from 'framer-motion';

/**
 * RESQ AI – Mission Operations Command Center Background
 * High-performance, GPU-accelerated atmospheric background.
 * Includes: Tactical grid, gentle floating particles, ambient radial lighting, subtle radar scan line.
 */

export function CommandCenterBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#080F1E]">
      {/* 1. Tactical Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(53, 217, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(53, 217, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* 2. Soft Ambient Atmospheric Radial Glows */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
        style={{ background: 'radial-gradient(circle, #35D9FF 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 -right-32 w-[700px] h-[700px] rounded-full blur-[140px] opacity-15"
        style={{ background: 'radial-gradient(circle, #FF4057 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 left-1/3 w-[650px] h-[650px] rounded-full blur-[130px] opacity-15"
        style={{ background: 'radial-gradient(circle, #20C997 0%, transparent 70%)' }}
      />

      {/* 3. Minimal Radar Sweep Line */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
        <motion.div
          className="w-full h-1 bg-gradient-to-r from-transparent via-[#35D9FF] to-transparent"
          animate={{ y: ['-100%', '1000%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* 4. Floating Operational Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i % 3 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 3 : 2,
              left: `${(i * 5.8) % 100}%`,
              top: `${(i * 7.3) % 100}%`,
              backgroundColor: i % 4 === 0 ? '#FF4057' : i % 2 === 0 ? '#35D9FF' : '#20C997',
              opacity: 0.35,
            }}
            animate={{
              y: [0, -35, 0],
              opacity: [0.15, 0.45, 0.15],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 5 + (i % 5),
              repeat: Infinity,
              delay: (i % 4) * 1.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
