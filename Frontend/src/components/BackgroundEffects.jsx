import React from 'react';
import { motion } from 'framer-motion';

const BackgroundEffects = () => {
  // Create an array of particles
  const particles = Array.from({ length: 50 }, (_, i) => i);

  // Create animated lines
  const lines = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-1 h-1 bg-white/5 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            opacity: 0,
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Animated white lines that run across */}
      {lines.map((line) => (
        <motion.div
          key={`line-${line}`}
          className="absolute bg-white/30"
          style={{
            width: '200px',
            height: '1px',
            top: `${Math.random() * 100}%`,
            filter: 'blur(1px)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
          }}
          initial={{ x: -200, opacity: 0 }}
          animate={{
            x: (typeof window !== 'undefined' ? window.innerWidth : 1920) + 200,
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: Math.random() * 8,
            ease: "linear",
          }}
        />
      ))}

      {/* Moving lights - White glowing */}
      <motion.div
        className="absolute w-2 h-2 bg-white rounded-full"
        style={{
          filter: 'blur(2px)',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
        }}
        animate={{
          x: [0, (typeof window !== 'undefined' ? window.innerWidth : 1920), 0],
          y: [(typeof window !== 'undefined' ? window.innerHeight : 1080) / 2, (typeof window !== 'undefined' ? window.innerHeight : 1080) / 4, (typeof window !== 'undefined' ? window.innerHeight : 1080) / 2],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-3 h-3 bg-white rounded-full"
        style={{
          filter: 'blur(2px)',
          boxShadow: '0 0 25px rgba(255, 255, 255, 0.5), 0 0 50px rgba(255, 255, 255, 0.3)',
        }}
        animate={{
          x: [(typeof window !== 'undefined' ? window.innerWidth : 1920), 0, (typeof window !== 'undefined' ? window.innerWidth : 1920)],
          y: [(typeof window !== 'undefined' ? window.innerHeight : 1080) / 3, (typeof window !== 'undefined' ? window.innerHeight : 1080) * 2/3, (typeof window !== 'undefined' ? window.innerHeight : 1080) / 3],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          filter: 'blur(1px)',
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2)',
        }}
        animate={{
          x: [(typeof window !== 'undefined' ? window.innerWidth : 1920) / 2, (typeof window !== 'undefined' ? window.innerWidth : 1920) / 4, (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2],
          y: [0, (typeof window !== 'undefined' ? window.innerHeight : 1080), 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Additional bright sliding lights */}
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={`bright-light-${i}`}
          className="absolute bg-white"
          style={{
            width: `${150 + Math.random() * 100}px`,
            height: '2px',
            top: `${20 + i * 15}%`,
            filter: 'blur(1px)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4)',
          }}
          initial={{ x: -300, opacity: 0 }}
          animate={{
            x: (typeof window !== 'undefined' ? window.innerWidth : 1920) + 300,
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundEffects;

