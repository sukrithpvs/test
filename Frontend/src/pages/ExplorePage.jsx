import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvestmentsRibbon from '../components/InvestmentsRibbon';
import MarketPulse from '../components/MarketPulse';
import TrendingStocks from '../components/TrendingStocks';
import NewsSection from '../components/NewsSection';
import { marketApi } from '../api';

// Frontend cache configuration
const MF_CACHE_KEY = 'explore_mf_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const ExplorePage = () => {
  const navigate = useNavigate();
  const [mutualFunds, setMutualFunds] = useState([]);
  const [loadingMF, setLoadingMF] = useState(true);

  useEffect(() => {
    loadMutualFunds();
  }, []);

  const loadMutualFunds = async () => {
    try {
      // Check frontend cache first
      const cached = sessionStorage.getItem(MF_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL_MS) {
          console.log('📦 ExplorePage MF: Using cached data');
          setMutualFunds(data);
          setLoadingMF(false);
          return;
        }
      }

      console.log('🌐 ExplorePage MF: Fetching fresh data');
      setLoadingMF(true);
      const data = await marketApi.getMutualFunds();
      const slicedData = data.slice(0, 4);
      setMutualFunds(slicedData);

      // Save to frontend cache
      sessionStorage.setItem(MF_CACHE_KEY, JSON.stringify({
        data: slicedData,
        timestamp: Date.now()
      }));
    } catch (err) {
      console.error('Failed to load mutual funds:', err);
    } finally {
      setLoadingMF(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1920px] mx-auto pb-12"
    >
      {/* Hero / Welcome */}
      <div className="mb-10 mt-4 relative">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 mb-2 tracking-tight">
          Explore Markets
        </h1>
        <p className="text-gray-400 text-lg">Discover your next investment opportunity.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column (Main Content) */}
        <div className="lg:col-span-8 space-y-12">
          {/* My Investments Ribbon */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InvestmentsRibbon />
          </motion.div>

          {/* Trending Stocks */}
          <TrendingStocks />

          {/* News Section */}
          <NewsSection />
        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Market Pulse Widget (Includes Indices, Top Movers, Sectors) */}
          <MarketPulse />

          {/* Mutual Funds Section */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Top Mutual Funds</h3>
            {loadingMF ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {mutualFunds.map((fund, i) => (
                  <div
                    key={fund.schemeCode || i}
                    className="flex justify-between items-start pb-3 border-b border-white/5 last:border-0 last:pb-0 group cursor-pointer hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-white group-hover:text-surreal-cyan transition-colors text-sm">
                        {fund.schemeName || 'Mutual Fund'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {fund.fundHouse || fund.category || 'Category'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-mono text-sm font-bold">
                        {fund.oneYearReturn ? `+${parseFloat(fund.oneYearReturn).toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        NAV: ₹{parseFloat(fund.nav || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                {mutualFunds.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">No funds available</div>
                )}
              </div>
            )}
            <button
              className="w-full mt-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-surreal-cyan transition-colors font-medium"
              onClick={() => navigate('/mutualfunds')}
            >
              View All Funds
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default ExplorePage;
