import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';
import { news } from '../data/mockData';

const NewsSection = () => {
  const getCategoryColor = (category) => {
    const colors = {
      Earnings: 'bg-emerald-accent/10 text-emerald-accent',
      Partnership: 'bg-blue-accent/10 text-blue-accent',
      Banking: 'bg-purple-accent/10 text-purple-accent',
      Deals: 'bg-emerald-accent/10 text-emerald-accent',
      Technology: 'bg-blue-accent/10 text-blue-accent',
      Expansion: 'bg-purple-accent/10 text-purple-accent',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-400';
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Market News</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item, idx) => (
          <motion.div
            key={item.id}
            className="glass rounded-xl p-4 border-thin border-border cursor-pointer h-full"
            whileHover={{ scale: 1.02, borderColor: '#404040' }}
            transition={{ duration: 0.2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </div>
            
            <h4 className="text-sm font-semibold text-gray-100 mb-2 line-clamp-2">
              {item.title}
            </h4>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{item.time}</span>
              </div>
              <span>{item.source}</span>
            </div>
            
            {item.ticker && (
              <div className="mt-2">
                <span className="text-xs tabular-nums text-purple-accent font-semibold">{item.ticker}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;

