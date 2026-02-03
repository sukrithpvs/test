import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Sun, Moon, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navigation = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
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

  return (
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
              className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-text border border-white/5"
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
  );
};

export default Navigation;

