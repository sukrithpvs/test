import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Plus, Trash2, Filter, Search, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { watchlistApi, pricesApi } from '../api';

const WatchlistPage = () => {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTicker, setNewTicker] = useState('');

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const data = await watchlistApi.getAll();

      // Enrich with current prices
      const enriched = await Promise.all(data.map(async (item) => {
        try {
          const priceData = await pricesApi.getPrice(item.ticker);
          return {
            ticker: item.ticker,
            name: item.ticker, // API doesn't provide name, just use ticker
            price: parseFloat(priceData.price || 0),
            changePercent: parseFloat(priceData.changePercent || 0),
            notes: item.notes,
            createdAt: item.createdAt
          };
        } catch {
          return {
            ticker: item.ticker,
            name: item.ticker,
            price: 0,
            changePercent: 0,
            notes: item.notes,
            createdAt: item.createdAt
          };
        }
      }));

      setWatchlistItems(enriched);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async () => {
    if (!newTicker.trim()) return;
    try {
      await watchlistApi.add(newTicker.toUpperCase());
      setNewTicker('');
      setShowAddModal(false);
      loadWatchlist(); // Refresh
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  const removeFromWatchlist = async (ticker) => {
    try {
      await watchlistApi.remove(ticker);
      setWatchlistItems(prev => prev.filter(item => item.ticker !== ticker));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  const filteredStocks = watchlistItems.filter(stock =>
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-surreal-cyan" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 md:px-8 py-8"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Watchlist</h1>
          <p className="text-gray-400">Track and manage your potential investments.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surreal-violet hover:bg-surreal-violet/80 text-white rounded-xl shadow-lg shadow-surreal-purple/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative w-full md:w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-surreal-cyan transition-colors" />
          <input
            type="text"
            placeholder="Filter stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-surreal-cyan/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key="watchlist"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 gap-4"
          >
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock, idx) => {
                const isPositive = stock.changePercent >= 0;
                const target = stock.price * 1.1;

                return (
                  <motion.div
                    key={stock.ticker}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-4 rounded-xl border border-white/5 group hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      {/* Stock Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <Link to={`/stock/${stock.ticker}`} className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-xl bg-void-950 flex items-center justify-center border border-white/5 group-hover:border-surreal-cyan/30 transition-colors">
                            <span className="font-bold text-white text-xs">{stock.ticker.substring(0, 2)}</span>
                          </div>
                        </Link>
                        <div className="min-w-[120px]">
                          <Link to={`/stock/${stock.ticker}`}>
                            <h3 className="font-bold text-white group-hover:text-surreal-cyan transition-colors">{stock.ticker}</h3>
                          </Link>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{stock.notes || stock.name}</p>
                        </div>
                      </div>

                      {/* Price Info */}
                      <div className="hidden sm:block text-right mr-8 min-w-[100px]">
                        <div className="font-mono text-white">${stock.price.toFixed(2)}</div>
                        <div className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-coral-400'}`}>
                          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>

                      {/* Target Progress */}
                      <div className="hidden md:block flex-1 max-w-xs mr-8">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Target Progress</span>
                          <span className="text-gray-300">${target.toFixed(0)}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-surreal-violet to-surreal-cyan"
                            style={{ width: `${Math.min((stock.price / target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link to={`/stock/${stock.ticker}`}>
                          <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Buy">
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => removeFromWatchlist(stock.ticker)}
                          className="p-2 rounded-lg hover:bg-coral-500/10 text-gray-400 hover:text-coral-400 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No stocks in watchlist</h3>
                <p className="text-gray-500">Add stocks to track them here.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 px-4 py-2 bg-surreal-violet hover:bg-surreal-violet/80 text-white rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Stock
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-2xl border border-white/10 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">Add to Watchlist</h3>
            <input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && addToWatchlist()}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-surreal-cyan/50 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addToWatchlist}
                className="flex-1 py-2 rounded-xl bg-surreal-violet hover:bg-surreal-violet/80 text-white transition-colors"
              >
                Add Stock
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default WatchlistPage;
