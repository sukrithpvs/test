import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { marketApi } from '../api';

// Default mock news data to display initially
const MOCK_NEWS = [
  {
    id: 1,
    title: "Tech Giants Lead Market Rally as AI Optimism Grows",
    category: "Technology",
    time: "2 hours ago",
    source: "NASDAQ",
    ticker: null
  },
  {
    id: 2,
    title: "Federal Reserve Signals Potential Rate Adjustments",
    category: "Banking",
    time: "3 hours ago",
    source: "Reuters",
    ticker: null
  },
  {
    id: 3,
    title: "Apple Reports Strong iPhone Sales in Asian Markets",
    category: "Earnings",
    time: "4 hours ago",
    source: "Bloomberg",
    ticker: "AAPL"
  },
  {
    id: 4,
    title: "Microsoft Azure Revenue Surges 29% Year-over-Year",
    category: "Earnings",
    time: "5 hours ago",
    source: "CNBC",
    ticker: "MSFT"
  },
  {
    id: 5,
    title: "Tesla Announces New Gigafactory Expansion Plans",
    category: "Expansion",
    time: "6 hours ago",
    source: "Reuters",
    ticker: "TSLA"
  },
  {
    id: 6,
    title: "Amazon Partners with Major Retailers for Same-Day Delivery",
    category: "Partnership",
    time: "7 hours ago",
    source: "WSJ",
    ticker: "AMZN"
  }
];

const NewsSection = () => {
  const [news, setNews] = useState(MOCK_NEWS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await marketApi.getNews(true);
      if (data && data.length > 0) {
        setNews(data);
      } else {
        // If API returns empty, keep mock data
        console.log('API returned empty, keeping mock data');
      }
    } catch (err) {
      console.error('Failed to refresh news:', err);
      // On error, keep the existing data
    } finally {
      setRefreshing(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Earnings: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Partnership: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Banking: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Deals: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Technology: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      Expansion: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      Market: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Market News</h3>
        <motion.button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((item, idx) => (
          <motion.a
            key={item.id}
            href={item.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card rounded-xl p-4 border border-white/5 hover:border-white/20 cursor-pointer h-full block transition-all"
            whileHover={{ scale: 1.02, y: -2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </div>

            <h4 className="text-sm font-semibold text-gray-100 mb-2 line-clamp-2 leading-snug">
              {item.title}
            </h4>

            <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{item.time}</span>
              </div>
              <span className="truncate max-w-[100px]">{item.source}</span>
            </div>

            {item.ticker && (
              <div className="mt-2">
                <span className="text-xs tabular-nums text-purple-400 font-semibold">{item.ticker}</span>
              </div>
            )}
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;
