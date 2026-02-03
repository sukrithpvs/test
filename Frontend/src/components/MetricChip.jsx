import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

const MetricChip = ({ label, value, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.div
        className="glass rounded-full px-4 py-2 flex items-center gap-2 cursor-help"
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        whileHover={{ scale: 1.05, borderColor: '#404040' }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-xs text-gray-400">{label}</span>
        <span className="tabular-nums text-sm font-semibold text-gray-100">{value}</span>
        {tooltip && (
          <Info className="w-3 h-3 text-gray-500" />
        )}
      </motion.div>
      
      <AnimatePresence>
        {showTooltip && tooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass rounded-lg px-3 py-2 text-xs text-gray-300 whitespace-nowrap z-50"
          >
            {tooltip}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white/[0.02] border-l border-t border-border rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MetricChip;

