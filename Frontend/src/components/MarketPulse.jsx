import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { marketApi } from '../api';
import DenseListItem from './DenseListItem';

const MarketPulse = () => {
  const [activeTab, setActiveTab] = useState('gainers');
  const [indices, setIndices] = useState([]);
  const [movers, setMovers] = useState({ gainers: [], losers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const [indicesData, gainersData, losersData] = await Promise.all([
        marketApi.getIndices(),
        marketApi.getGainers(),
        marketApi.getLosers()
      ]);

      setIndices(indicesData);
      setMovers({
        gainers: transformMovers(gainersData),
        losers: transformMovers(losersData)
      });
    } catch (err) {
      console.error('Failed to load market data:', err);
    } finally {
      setLoading(false);
    }
  };

  const transformMovers = (data) => {
    return data.map((stock, idx) => ({
      rank: idx + 1,
      ticker: stock.ticker,
      name: stock.name,
      price: parseFloat(stock.price || 0),
      change: parseFloat(stock.change || 0),
      changePercent: parseFloat(stock.changePercent || 0),
      volume: stock.volume,
      sparkline: generateSparkline(parseFloat(stock.price || 100), parseFloat(stock.changePercent || 0))
    }));
  };

  const generateSparkline = (price, changePercent) => {
    // Generate simple sparkline data based on price and change
    const points = 5;
    const result = [];
    const startPrice = price * (1 - changePercent / 100);
    const step = (price - startPrice) / points;
    for (let i = 0; i <= points; i++) {
      result.push(startPrice + step * i + (Math.random() - 0.5) * step * 0.5);
    }
    return result;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="glass rounded-xl p-8 border-thin border-border flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 mb-8">
      {/* Column 1: Indices & Volatility */}
      <div className="glass rounded-xl p-4 border-thin border-border">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Indices & Volatility</h3>
        <div className="space-y-3">
          {indices.map((index) => {
            const isPositive = index.changePercent >= 0;

            return (
              <div key={index.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{index.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums text-xs font-semibold text-gray-100">
                      {parseFloat(index.value).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </span>
                    <span className={`tabular-nums text-xs ${isPositive ? 'text-emerald-accent' : 'text-coral-accent'}`}>
                      {isPositive ? '+' : ''}{parseFloat(index.changePercent).toFixed(2)}%
                    </span>
                  </div>
                </div>
                {/* Day Range Bar */}
                <div className="h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${isPositive ? 'bg-emerald-accent' : 'bg-coral-accent'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(index.changePercent) * 20, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column 2: Top Movers */}
      <div className="glass rounded-xl p-4 border-thin border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-300">Top Movers</h3>
          <div className="flex gap-1">
            {['gainers', 'losers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 text-xs rounded transition-colors ${activeTab === tab
                  ? 'bg-white/[0.05] text-gray-100 border-thin border-border'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {movers[activeTab].map((stock) => (
            <DenseListItem
              key={stock.ticker}
              rank={stock.rank}
              ticker={stock.ticker}
              name={stock.name}
              price={stock.price}
              change={stock.change}
              changePercent={stock.changePercent}
              sparkline={stock.sparkline}
              logo={true}
            />
          ))}
          {movers[activeTab].length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPulse;
