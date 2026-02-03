import React from 'react';
import { motion } from 'framer-motion';
import { indices } from '../data/mockData';

const TickerTape = () => {

  // Duplicate indices for seamless loop
  const duplicatedIndices = [...indices, ...indices];

  return (
    <div className="h-[30px] bg-white/[0.05] border-b border-thin border-border overflow-hidden relative">
      <motion.div
        className="flex items-center h-full"
        animate={{
          x: ['0%', '-50%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {duplicatedIndices.map((index, idx) => (
          <div
            key={`${index.name}-${idx}`}
            className="flex items-center gap-4 px-8 whitespace-nowrap"
          >
            <span className="text-xs font-medium text-gray-400">{index.name}</span>
            <span className="tabular-nums text-xs font-semibold text-gray-100">
              {index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
            <span className={`tabular-nums text-xs ${index.changePercent >= 0 ? 'text-emerald-accent' : 'text-coral-accent'}`}>
              {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
            </span>
            {/* Mini sparkline */}
            <div className="w-12 h-3 relative">
              <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
                <polyline
                  points={index.sparkline.map((val, i) => {
                    const max = Math.max(...index.sparkline);
                    const min = Math.min(...index.sparkline);
                    const range = max - min || 1;
                    const x = (i / (index.sparkline.length - 1)) * 100;
                    const y = 20 - ((val - min) / range) * 20;
                    return `${x},${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={index.changePercent >= 0 ? '#10b981' : '#f87171'}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="w-px h-4 bg-border"></div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default TickerTape;

