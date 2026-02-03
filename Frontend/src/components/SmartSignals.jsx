import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Zap, ArrowUpRight } from 'lucide-react';
import { smartSignals } from '../data/mockData';

const SmartSignals = () => {
  const getIcon = (type) => {
    switch (type) {
      case 'high':
        return <TrendingUp className="w-4 h-4" />;
      case 'crossover':
        return <Activity className="w-4 h-4" />;
      case 'fii':
        return <Zap className="w-4 h-4" />;
      default:
        return <ArrowUpRight className="w-4 h-4" />;
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Smart Signals</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
        {smartSignals.map((signal, idx) => (
          <motion.div
            key={signal.id}
            className="glass rounded-lg px-4 py-3 min-w-[240px] cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: '#404040' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.1 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-accent/10 flex items-center justify-center text-emerald-accent flex-shrink-0">
                {getIcon(signal.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 mb-1">{signal.text}</p>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-xs text-emerald-accent font-semibold">
                    {signal.count} stocks
                  </span>
                  <span className="text-xs text-gray-500">
                    {signal.stocks.slice(0, 2).join(', ')}
                    {signal.stocks.length > 2 && '...'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SmartSignals;

