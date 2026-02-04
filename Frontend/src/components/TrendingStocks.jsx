import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { marketApi, watchlistApi } from '../api';

// Frontend cache configuration
const CACHE_KEY = 'trending_stocks_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const TrendingStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrendingStocks();
  }, []);

  const loadTrendingStocks = async () => {
    try {
      // Check frontend cache first
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          console.log('📦 TrendingStocks: Using cached data');
          setStocks(data);
          setLoading(false);
          setError(null);
          return;
        }
      }

      console.log('🌐 TrendingStocks: Fetching fresh data');
      setLoading(true);
      const data = await marketApi.getTrending();
      // Transform API response to match component expectations
      const transformed = data.map(stock => ({
        ticker: stock.ticker,
        name: stock.name,
        price: parseFloat(stock.price || 0),
        change: parseFloat(stock.change || 0),
        changePercent: parseFloat(stock.changePercent || 0),
        volume: formatVolume(stock.volume),
        marketCap: formatMarketCap(stock.marketCap),
        sector: stock.sector || 'Technology'
      }));
      setStocks(transformed);
      setError(null);

      // Save to frontend cache
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({
        data: transformed,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Failed to load trending stocks:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatVolume = (vol) => {
    if (!vol) return '0';
    if (vol >= 1e9) return (vol / 1e9).toFixed(1) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(1) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(1) + 'K';
    return vol.toString();
  };

  const formatMarketCap = (cap) => {
    if (!cap) return '$0';
    const num = parseFloat(cap);
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString();
  };

  const handleAddToWatchlist = async (e, ticker) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await watchlistApi.add(ticker);
      // Could show a toast notification here
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  if (loading) {
    return (
      <div className="mb-12 relative z-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-surreal-cyan" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-12 relative z-10">
        <div className="text-center py-12 text-gray-400">
          <p>{error}</p>
          <button
            onClick={loadTrendingStocks}
            className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 relative z-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">Trending Stocks</h2>
          <p className="text-gray-400">Market movers catching fire right now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stocks.map((stock, idx) => {
          const isPositive = stock.changePercent >= 0;

          return (
            <Link key={stock.ticker} to={`/stock/${stock.ticker}`}>
              <motion.div
                className="group relative h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-b ${isPositive ? 'from-emerald-500/20 to-emerald-500/0' : 'from-coral-500/20 to-coral-500/0'} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`} />

                <div className="glass-card h-full rounded-2xl p-5 border border-white/5 relative overflow-hidden transition-all duration-300 group-hover:translate-y-[-4px]">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${isPositive ? 'from-emerald-500/5' : 'from-coral-500/5'} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-coral-500/10 text-coral-400'}`}>
                          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-white tracking-tight">{stock.ticker}</div>
                          <div className="text-xs text-gray-400">{stock.name}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-white tabular-nums">${stock.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium tabular-nums flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-coral-400'}`}>
                          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                        <span className="text-gray-500 text-xs">Vol: {stock.volume}</span>
                      </div>
                    </div>

                    {/* Quick Actions (Hover) */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                      <button
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
                        onClick={(e) => handleAddToWatchlist(e, stock.ticker)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg bg-surreal-violet hover:bg-surreal-violet/80 text-white shadow-lg shadow-surreal-purple/20 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          // Handle Buy
                        }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingStocks;
