import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DenseListItem = ({ rank, ticker, name, price, change, changePercent, sparkline, logo, onClick }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/stock/${ticker}`);
    }
  };
  const isPositive = changePercent >= 0;
  
  // Simple sparkline rendering
  const maxVal = Math.max(...sparkline);
  const minVal = Math.min(...sparkline);
  const range = maxVal - minVal || 1;
  
  const points = sparkline.map((val, idx) => {
    const x = (idx / (sparkline.length - 1)) * 100;
    const y = 100 - ((val - minVal) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <motion.div
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.02] cursor-pointer group transition-colors"
      onClick={handleClick}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.2 }}
    >
      <span className="tabular-nums text-xs text-gray-500 w-6">{rank}</span>
      
      {logo && (
        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold">
          {ticker[0]}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-sm font-semibold text-gray-100">{ticker}</span>
          <span className="text-xs text-gray-500 truncate">{name}</span>
        </div>
      </div>
      
      <div className="w-16 h-6 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={isPositive ? '#10b981' : '#f87171'}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      
      <div className="text-right min-w-[80px]">
        <div className="tabular-nums text-sm font-semibold text-gray-100">₹{price.toFixed(2)}</div>
        <div className={`tabular-nums text-xs flex items-center gap-1 ${isPositive ? 'text-emerald-accent' : 'text-coral-accent'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>
    </motion.div>
  );
};

export default DenseListItem;

