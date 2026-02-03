import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity, PieChart as PieIcon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { holdingsApi, portfolioApi, pricesApi } from '../api';

const HoldingsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pnlPeriod, setPnlPeriod] = useState('day');
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#a855f7'];

  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [holdingsData, summaryData] = await Promise.all([
        holdingsApi.getAll(),
        portfolioApi.getSummary()
      ]);

      // Enrich holdings with current prices
      const enriched = await Promise.all(holdingsData.map(async (holding) => {
        try {
          const priceData = await pricesApi.getPrice(holding.ticker);
          const currentPrice = parseFloat(priceData.price || holding.avgBuyPrice);
          const qty = parseFloat(holding.quantity);
          const avgPrice = parseFloat(holding.avgBuyPrice);
          const value = currentPrice * qty;
          const invested = avgPrice * qty;
          const pnl = value - invested;
          const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

          return {
            ticker: holding.ticker,
            name: holding.ticker,
            qty,
            avgPrice,
            ltp: currentPrice,
            value,
            pnl,
            pnlPercent,
            invested
          };
        } catch {
          const qty = parseFloat(holding.quantity);
          const avgPrice = parseFloat(holding.avgBuyPrice);
          return {
            ticker: holding.ticker,
            name: holding.ticker,
            qty,
            avgPrice,
            ltp: avgPrice,
            value: avgPrice * qty,
            pnl: 0,
            pnlPercent: 0,
            invested: avgPrice * qty
          };
        }
      }));

      setHoldings(enriched);
      setSummary({
        totalValue: parseFloat(summaryData.currentValue || 0),
        investedAmount: parseFloat(summaryData.totalInvested || 0),
        totalPnL: parseFloat(summaryData.profitLoss || 0),
        totalPnLPercent: parseFloat(summaryData.returnPercent || 0),
        cashBalance: parseFloat(summaryData.cashBalance || 0),
        daysGain: parseFloat(summaryData.profitLoss || 0) * 0.02, // Mock daily gain
        daysGainPercent: parseFloat(summaryData.returnPercent || 0) * 0.02
      });
    } catch (err) {
      console.error('Failed to load holdings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate asset allocation from actual holdings
  const assetAllocation = React.useMemo(() => {
    const totalHoldingsValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const cashValue = summary?.cashBalance || 0;
    const totalValue = totalHoldingsValue + cashValue;

    if (totalValue === 0) return [{ name: 'Cash', value: 100, color: COLORS[2] }];

    const allocation = holdings.map((h, idx) => ({
      name: h.ticker,
      value: Math.round((h.value / totalValue) * 100),
      color: COLORS[idx % COLORS.length]
    })).filter(a => a.value > 0);

    // Add cash if present
    const cashPercent = Math.round((cashValue / totalValue) * 100);
    if (cashPercent > 0) {
      allocation.push({ name: 'Cash', value: cashPercent, color: '#10b981' });
    }

    return allocation.length > 0 ? allocation : [{ name: 'Cash', value: 100, color: '#10b981' }];
  }, [holdings, summary]);

  // Generate realistic historical performance data
  const performanceData = React.useMemo(() => {
    const currentValue = summary?.totalValue || 10000;
    const dataPoints = [];
    let days;

    switch (selectedPeriod) {
      case '1W': days = 7; break;
      case '1M': days = 30; break;
      case 'YTD': days = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24)); break;
      case '1Y': days = 365; break;
      default: days = 30;
    }

    // Generate realistic price movements with trend
    const volatility = 0.008; // Daily volatility
    const trend = 0.0003; // Slight upward trend
    let value = currentValue * (1 - (days * trend) - (Math.random() * 0.1 - 0.05));

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Random walk with trend
      const randomChange = (Math.random() - 0.48) * volatility * value; // Slight positive bias
      value = value + randomChange + (value * trend);

      // Ensure we end close to current value
      if (i === 0) value = currentValue;

      dataPoints.push({
        name: dayName,
        value: Math.round(value * 100) / 100
      });
    }

    return dataPoints;
  }, [summary?.totalValue, selectedPeriod]);

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-surreal-cyan" />
      </div>
    );
  }

  const totalValue = summary?.totalValue || 0;
  const isPositiveDay = (summary?.daysGain || 0) >= 0;

  return (
    <div ref={containerRef} className="max-w-[1920px] mx-auto px-4 md:px-8 py-8 relative min-h-screen">

      {/* Hero Section: Portfolio Value */}
      <div className="relative z-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-gray-400 text-sm font-medium tracking-wider mb-2 uppercase">Total Portfolio Value</h2>
          <div className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(124,58,237,0.3)]">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 ${isPositiveDay ? 'bg-emerald-500/10 text-emerald-400' : 'bg-coral-500/10 text-coral-400'}`}>
            {isPositiveDay ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span className="font-bold text-lg tabular-nums">
              {summary?.totalPnL >= 0 ? '+' : ''}${Math.abs(summary?.totalPnL || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({summary?.totalPnLPercent?.toFixed(2) || 0}%)
            </span>
            <span className="text-gray-500 text-sm ml-1">Total</span>
          </div>

          {/* Portfolio Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 max-w-3xl mx-auto"
          >
            <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-gray-500 mb-1">Invested</div>
              <div className="text-lg font-bold text-white">${(summary?.investedAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-gray-500 mb-1">Cash Balance</div>
              <div className="text-lg font-bold text-surreal-violet">${(summary?.cashBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="glass-card p-3 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-gray-500 mb-1">Holdings</div>
              <div className="text-lg font-bold text-white">{holdings.length} Stocks</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* Left Column: Charts (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden group"
          >
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-surreal-cyan" />
                <h3 className="text-lg font-bold text-white">Performance</h3>
              </div>
              <div className="flex gap-2">
                {['1W', '1M', 'YTD', '1Y'].map(period => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${selectedPeriod === period
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                      }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Value']}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Detailed Holdings List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Your Holdings</h3>
            </div>

            {holdings.length === 0 ? (
              <div className="glass-card p-12 rounded-xl border border-white/5 text-center">
                <p className="text-gray-500">No holdings yet. Start investing!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {holdings.map((holding, idx) => {
                  const isPos = holding.pnl >= 0;
                  const sparkData = Array.from({ length: 10 }, () => ({ val: Math.random() * 100 }));

                  return (
                    <motion.div
                      key={holding.ticker}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      className="glass-card p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">

                        {/* Identity */}
                        <div className="flex items-center gap-4 col-span-1">
                          <Link to={`/stock/${holding.ticker}`}>
                            <div className="w-12 h-12 rounded-lg bg-void-950 flex items-center justify-center border border-white/5 group-hover:border-surreal-cyan/30 transition-colors shadow-lg">
                              <span className="font-bold text-white text-sm">{holding.ticker.substring(0, 2)}</span>
                            </div>
                          </Link>
                          <div>
                            <Link to={`/stock/${holding.ticker}`}>
                              <h4 className="font-bold text-white group-hover:text-surreal-cyan transition-colors">{holding.ticker}</h4>
                            </Link>
                            <div className="text-xs text-gray-500">{holding.qty} qty • Avg ${holding.avgPrice.toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Mini Chart */}
                        <div className="h-10 w-full hidden md:block">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparkData}>
                              <defs>
                                <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={isPos ? "#10b981" : "#f87171"} stopOpacity={0.4} />
                                  <stop offset="100%" stopColor={isPos ? "#10b981" : "#f87171"} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="val" stroke={isPos ? "#10b981" : "#f87171"} strokeWidth={2} fill={`url(#grad-${idx})`} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Values */}
                        <div className="text-right flex flex-col justify-center">
                          <div className="text-xs text-gray-500 mb-1">Current Value</div>
                          <div className="font-medium text-white tabular-nums text-lg">${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>

                        {/* Returns */}
                        <div className="text-right flex flex-col justify-center">
                          <div className="text-xs text-gray-500 mb-1">Total Return</div>
                          <div className={`font-bold tabular-nums text-lg flex items-center justify-end gap-1 ${isPos ? 'text-emerald-400' : 'text-coral-400'}`}>
                            {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {isPos ? '+' : ''}${Math.abs(holding.pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <div className={`text-xs ${isPos ? 'text-emerald-500/70' : 'text-coral-500/70'}`}>
                            ({holding.pnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Asset Allocation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-2xl border border-white/5"
          >
            <div className="flex items-center gap-2 mb-6">
              <PieIcon className="w-5 h-5 text-surreal-pink" />
              <h3 className="text-lg font-bold text-white">Asset Allocation</h3>
            </div>

            <div className="h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4 mt-6">
              {assetAllocation.map((asset, idx) => (
                <div key={asset.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-sm font-medium text-gray-300">{asset.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{asset.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-gray-500 uppercase mb-1">Total P&L</div>
              <div className={`text-xl font-bold ${(summary?.totalPnL || 0) >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                {(summary?.totalPnL || 0) >= 0 ? '+' : ''}${Math.abs(summary?.totalPnL || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </motion.div>
            <motion.div className="glass-card p-4 rounded-xl border border-white/5 text-center">
              <div className="text-xs text-gray-500 uppercase mb-1">Return %</div>
              <div className={`text-xl font-bold ${(summary?.totalPnLPercent || 0) >= 0 ? 'text-emerald-400' : 'text-coral-400'}`}>
                {(summary?.totalPnLPercent || 0) >= 0 ? '+' : ''}{(summary?.totalPnLPercent || 0).toFixed(2)}%
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HoldingsPage;
