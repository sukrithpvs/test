import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { holdingsApi, pricesApi } from '../api';

const InvestmentsRibbon = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const holdings = await holdingsApi.getAll();

      // Enrich with current prices
      const enriched = await Promise.all(holdings.map(async (holding) => {
        try {
          const priceData = await pricesApi.getPrice(holding.ticker);
          const currentPrice = parseFloat(priceData.price || holding.avgBuyPrice);
          const quantity = parseFloat(holding.quantity);
          const avgBuyPrice = parseFloat(holding.avgBuyPrice);
          const currentValue = currentPrice * quantity;
          const invested = avgBuyPrice * quantity;
          const gain = currentValue - invested;
          const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;

          return {
            ticker: holding.ticker,
            name: holding.name || holding.ticker,
            currentValue,
            investedAmount: invested,
            gain,
            gainPercent,
            ltp: currentPrice
          };
        } catch {
          // Fallback if price fetch fails
          const quantity = parseFloat(holding.quantity);
          const avgBuyPrice = parseFloat(holding.avgBuyPrice);
          return {
            ticker: holding.ticker,
            name: holding.name || holding.ticker,
            currentValue: avgBuyPrice * quantity,
            investedAmount: avgBuyPrice * quantity,
            gain: 0,
            gainPercent: 0,
            ltp: avgBuyPrice
          };
        }
      }));

      setInvestments(enriched);
    } catch (err) {
      console.error('Failed to load investments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">My Investments</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">My Investments</h2>
          <Link
            to="/holdings"
            className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1 transition-colors"
          >
            View Portfolio
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="glass rounded-xl p-6 text-center text-gray-500">
          <p>No investments yet. Start building your portfolio!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-100">My Investments</h2>
        <Link
          to="/holdings"
          className="text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1 transition-colors"
        >
          View Full Portfolio
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
        {investments.map((investment, idx) => {
          const isPositive = investment.gainPercent >= 0;

          return (
            <motion.div
              key={investment.ticker}
              className="glass rounded-full px-4 py-2.5 flex items-center gap-3 min-w-fit cursor-pointer"
              whileHover={{ scale: 1.05, borderColor: '#404040' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <div className="flex flex-col">
                <span className="tabular-nums text-sm font-semibold text-gray-100">{investment.ticker}</span>
                <span className="tabular-nums text-xs text-gray-500">{investment.name}</span>
              </div>

              <div className="w-px h-6 bg-border"></div>

              <div className="flex flex-col items-end">
                <span className="tabular-nums text-sm font-semibold text-gray-100">
                  ${(investment.currentValue / 1000).toFixed(1)}K
                </span>
                <div className={`tabular-nums text-xs flex items-center gap-1 ${isPositive ? 'text-emerald-accent' : 'text-coral-accent'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{investment.gainPercent.toFixed(2)}%
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InvestmentsRibbon;
