import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Moon, Zap, X, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { marketApi } from '../api';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    if (theme === 'surreal') return <Zap className="w-4 h-4" />;
    return <Moon className="w-4 h-4" />;
  };

  const getThemeLabel = () => {
    if (theme === 'surreal') return 'Surreal';
    return 'Black';
  };

  const navItems = [
    { path: '/', label: 'Explore' },
    { path: '/holdings', label: 'Holdings' },
    { path: '/orders', label: 'Orders' },
    { path: '/watchlist', label: 'Watchlist' },
  ];

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Search stocks - ALWAYS try API first for any stock
  const searchStocks = async (query) => {
    if (!query || query.length < 1) {
      setSearchResults([]);
      return;
    }

    setSearching(true);

    try {
      // Always call API - it will search Yahoo/Finnhub for ANY ticker
      const results = await marketApi.searchStocks(query);
      setSearchResults(results || []);
    } catch (err) {
      console.error('Search API error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Search when query changes with debounce
  useEffect(() => {
    const debounce = setTimeout(() => {
      searchStocks(searchQuery);
    }, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleResultClick = (ticker) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/stock/${ticker}`);
  };

  return (
    <>
      <div className="sticky top-6 z-50 px-4 md:px-0 mb-8 pointer-events-none">
        <nav className="glass-card max-w-4xl mx-auto rounded-2xl border-thin border-white/10 shadow-2xl pointer-events-auto transition-all duration-300">
          <div className="px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 pl-2 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-surreal-violet to-surreal-cyan p-[1px]">
                <div className="w-full h-full rounded-xl bg-void-950 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-surreal-violet/20 to-surreal-cyan/20 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-surreal-violet to-surreal-cyan">L</span>
                </div>
              </div>
              <span className="text-lg font-bold text-white hidden sm:block tracking-tight">
                LOCKED<span className="black-mode:text-white text-surreal-cyan">IN</span>
              </span>
            </Link>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center bg-white/5 rounded-full p-1 border border-white/5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-5 py-2 text-sm font-medium transition-all duration-300 rounded-full ${isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-surreal-violet to-surreal-cyan rounded-full shadow-lg shadow-surreal-purple/25"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 mix-blend-overlay">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 pr-2">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`Current: ${getThemeLabel()}. Click to cycle.`}
              >
                {getThemeIcon()}
              </motion.button>

              {/* Global Search */}
              <motion.div
                className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/5"
                onClick={() => setSearchOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-4 h-4" />
              </motion.div>

              {/* User Profile */}
              <motion.button
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-surreal-purple to-surreal-pink p-[1px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-full h-full rounded-xl bg-void-950 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-300" />
                </div>
              </motion.button>
            </div>
          </div >
        </nav >
      </div >

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] px-4"
            >
              <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-white/10">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search any stock (VIX, SPY, AAPL, TSLA...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                  />
                  {searching && <Loader2 className="w-5 h-5 animate-spin text-surreal-cyan" />}
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Search Results */}
                <div className="max-h-[400px] overflow-y-auto">
                  {searchQuery.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p>Search for any stock ticker</p>
                      <p className="text-sm mt-1">e.g., VIX, SPY, QQQ, AAPL, TSLA</p>
                    </div>
                  ) : searching ? (
                    <div className="p-8 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-surreal-cyan" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No stocks found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {searchResults.map((stock) => {
                        const isPositive = (stock.changePercent || 0) >= 0;
                        const price = stock.price || 0;
                        const change = stock.changePercent || 0;
                        return (
                          <motion.button
                            key={stock.ticker}
                            onClick={() => handleResultClick(stock.ticker)}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                <span className="text-sm font-bold text-white">{stock.ticker.substring(0, 2)}</span>
                              </div>
                              <div>
                                <div className="font-medium text-white">{stock.ticker}</div>
                                <div className="text-sm text-gray-500 truncate max-w-[200px]">{stock.name || stock.ticker}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-white">${parseFloat(price).toFixed(2)}</div>
                              <div className={`text-sm flex items-center gap-1 justify-end ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {isPositive ? '+' : ''}{parseFloat(change).toFixed(2)}%
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
