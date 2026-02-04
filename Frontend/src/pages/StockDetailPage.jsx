import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Share2, Star, ChevronRight, Zap, DollarSign, Plus, Minus, Loader2, Newspaper, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { marketApi, ordersApi, watchlistApi, portfolioApi } from '../api';
import MetricChip from '../components/MetricChip';

const StockDetailPage = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('1M');
  const [activeTab, setActiveTab] = useState('Overview');
  const [orderType, setOrderType] = useState('BUY');
  const [qty, setQty] = useState(1);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cashBalance, setCashBalance] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const periods = ['1D', '1W', '1M', '3M', '6M', 'ALL'];
  const tabs = ['Overview', 'Technicals', 'Financials'];

  useEffect(() => {
    if (ticker) {
      loadStockData();
      loadPortfolio();
      loadStockNews();
    }
  }, [ticker]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketApi.getStockHistory(ticker);

      // Transform historical data for chart
      const historicalData = data.historicalData || [];
      const chartData = historicalData.map(point => ({
        date: point.date,
        price: parseFloat(point.close || 0)
      }));

      setStock({
        ticker: data.ticker,
        name: data.name || data.ticker,
        exchange: data.exchange || 'NASDAQ',
        currency: data.currency || 'USD',
        price: parseFloat(data.price || 0),
        change: parseFloat(data.change || 0),
        changePercent: parseFloat(data.changePercent || 0),
        open: parseFloat(data.open || 0),
        high: parseFloat(data.high || 0),
        low: parseFloat(data.low || 0),
        previousClose: parseFloat(data.previousClose || 0),
        volume: data.volume,
        avgVolume: data.avgVolume,
        marketCap: data.marketCap,
        peRatio: parseFloat(data.peRatio || 0),
        eps: parseFloat(data.eps || 0),
        fiftyTwoWeekHigh: parseFloat(data.fiftyTwoWeekHigh || 0),
        fiftyTwoWeekLow: parseFloat(data.fiftyTwoWeekLow || 0),
        sector: data.sector,
        industry: data.industry,
        chartData: chartData
      });
    } catch (err) {
      console.error('Failed to load stock:', err);
      setError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolio = async () => {
    try {
      const summary = await portfolioApi.getSummary();
      setCashBalance(parseFloat(summary.cashBalance || 0));
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    }
  };

  const loadStockNews = async () => {
    try {
      setLoadingNews(true);
      const newsData = await marketApi.getStockNews(ticker);
      setNews(newsData || []);
    } catch (err) {
      console.error('Failed to load stock news:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  const handleOrder = async () => {
    if (qty <= 0 || !stock) return;

    try {
      setPlacing(true);
      await ordersApi.place({
        ticker: stock.ticker,
        orderType: orderType,
        quantity: qty,
        price: stock.price
      });
      alert(`${orderType} order placed successfully!`);
      loadPortfolio(); // Refresh balance
    } catch (err) {
      alert(`Order failed: ${err.message}`);
    } finally {
      setPlacing(false);
    }
  };

  const addToWatchlist = async () => {
    try {
      await watchlistApi.add(ticker);
      alert('Added to watchlist!');
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
    }
  };

  const formatVolume = (vol) => {
    if (!vol) return 'N/A';
    if (vol >= 1e9) return (vol / 1e9).toFixed(2) + 'B';
    if (vol >= 1e6) return (vol / 1e6).toFixed(2) + 'M';
    if (vol >= 1e3) return (vol / 1e3).toFixed(2) + 'K';
    return vol.toString();
  };

  const formatMarketCap = (cap) => {
    if (!cap) return 'N/A';
    const num = parseFloat(cap);
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    return '$' + num.toLocaleString();
  };

  // Filter chart data based on selected period
  const getFilteredChartData = () => {
    if (!stock?.chartData) return [];
    const data = stock.chartData;
    const now = new Date();
    let daysBack = 30;

    switch (selectedPeriod) {
      case '1D': daysBack = 1; break;
      case '1W': daysBack = 7; break;
      case '1M': daysBack = 30; break;
      case '3M': daysBack = 90; break;
      case '6M': daysBack = 180; break;
      case 'ALL': return data;
      default: daysBack = 30;
    }

    return data.slice(-daysBack);
  };

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-surreal-cyan" />
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">{error || 'Stock not found'}</p>
          <button onClick={loadStockData} className="px-4 py-2 bg-surreal-violet rounded-xl text-white">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isPositive = stock.changePercent >= 0;
  const chartData = getFilteredChartData();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[1920px] mx-auto px-4 md:px-8 py-6 pb-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content (Left) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header & Back */}
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Explore</span>
            </button>
            <div className="flex gap-2">
              <button className="p-2 glass rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={addToWatchlist}
                className="p-2 glass rounded-full hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                <Star className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stock Title Header */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{stock.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-lg text-gray-400 font-mono tracking-wide">{stock.ticker}</span>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/10 text-gray-300 border border-white/5">{stock.exchange}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-white mb-2 tabular-nums">${stock.price.toFixed(2)}</div>
              <div className={`flex items-center justify-end gap-2 text-lg font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="tabular-nums">{isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="glass-card rounded-2xl p-1 border border-white/5 shadow-2xl overflow-hidden relative group">
            {/* Period Selectors */}
            <div className="absolute top-4 left-4 z-10 flex gap-1 bg-black/40 backdrop-blur-md p-1 rounded-lg border border-white/5">
              {periods.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${selectedPeriod === p ? 'bg-surreal-cyan text-force-black shadow-lg shadow-surreal-cyan/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="h-[400px] w-full pt-14 pb-4 pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f87171'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f87171'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                    labelFormatter={(label) => label}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? '#10b981' : '#f87171'}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabs & Content */}
          <div>
            <div className="flex border-b border-white/10 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium relative transition-colors ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-surreal-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'Overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MetricChip label="Market Cap" value={formatMarketCap(stock.marketCap)} />
                      <MetricChip label="P/E Ratio" value={stock.peRatio.toFixed(2)} />
                      <MetricChip label="Volume" value={formatVolume(stock.volume)} />
                      <MetricChip label="52W High" value={`$${stock.fiftyTwoWeekHigh.toFixed(2)}`} />
                    </div>

                    <div className="glass-card p-6 rounded-xl border border-white/5">
                      <h3 className="text-xl font-bold text-white mb-4">Price Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Open</div>
                          <div className="text-white font-bold">${stock.open.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Day High</div>
                          <div className="text-emerald-400 font-bold">${stock.high.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Day Low</div>
                          <div className="text-red-400 font-bold">${stock.low.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Prev Close</div>
                          <div className="text-white font-bold">${stock.previousClose.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-xl border border-white/5">
                      <h3 className="text-xl font-bold text-white mb-4">About {stock.name}</h3>
                      <div className="flex gap-4 mb-4">
                        {stock.sector && <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">{stock.sector}</span>}
                        {stock.industry && <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">{stock.industry}</span>}
                      </div>
                      <p className="text-gray-400 leading-relaxed">
                        {stock.name} ({stock.ticker}) is traded on {stock.exchange}.
                        Current market price is ${stock.price.toFixed(2)} with a P/E ratio of {stock.peRatio.toFixed(2)}.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'Technicals' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-6 rounded-xl border border-white/5 text-center">
                      <div className="text-sm text-gray-500 mb-2">52 Week Range</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-red-400">${stock.fiftyTwoWeekLow.toFixed(2)}</span>
                        <span className="text-emerald-400">${stock.fiftyTwoWeekHigh.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500"
                          style={{
                            width: `${((stock.price - stock.fiftyTwoWeekLow) / (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="glass-card p-6 rounded-xl border border-white/5 text-center">
                      <div className="text-sm text-gray-500 mb-2">EPS</div>
                      <div className="text-3xl font-bold text-white">${stock.eps.toFixed(2)}</div>
                    </div>
                    <div className="glass-card p-6 rounded-xl border border-white/5 text-center">
                      <div className="text-sm text-gray-500 mb-2">Avg Volume</div>
                      <div className="text-3xl font-bold text-white">{formatVolume(stock.avgVolume)}</div>
                    </div>
                  </div>
                )}

                {activeTab === 'Financials' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="glass-card p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">P/E Ratio</div>
                        <div className="text-xl font-bold text-white">{stock.peRatio.toFixed(2)}</div>
                      </div>
                      <div className="glass-card p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">EPS</div>
                        <div className="text-xl font-bold text-white">${stock.eps.toFixed(2)}</div>
                      </div>
                      <div className="glass-card p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">Market Cap</div>
                        <div className="text-xl font-bold text-white">{formatMarketCap(stock.marketCap)}</div>
                      </div>
                      <div className="glass-card p-4 rounded-xl border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">52W High</div>
                        <div className="text-xl font-bold text-emerald-400">${stock.fiftyTwoWeekHigh.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Action Panel (Right) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-gradient-to-b from-white/[0.05] to-transparent relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${orderType === 'BUY' ? 'from-surreal-cyan/20' : 'from-red-500/20'} to-transparent blur-3xl -z-10`} />

              <div className="flex bg-black/40 p-1 rounded-xl mb-6">
                <button
                  onClick={() => setOrderType('BUY')}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${orderType === 'BUY' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-gray-400 hover:text-white'}`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setOrderType('SELL')}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${orderType === 'SELL' ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' : 'text-gray-400 hover:text-white'}`}
                >
                  SELL
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Quantity</span>
                    <span>lot: 1</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setQty('');
                        } else {
                          setQty(Math.max(1, parseInt(val)));
                        }
                      }}
                      onBlur={() => {
                        if (qty === '' || qty < 1) setQty(1);
                      }}
                      min="1"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-xl font-bold text-white focus:outline-none focus:border-surreal-cyan transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 z-10">
                      <button
                        type="button"
                        onClick={() => setQty(q => Math.max(1, (Number(q) || 0) - 1))}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <Minus className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setQty(q => (Number(q) || 0) + 1)}
                        className="p-2 hover:bg-white/10 rounded transition-colors"
                      >
                        <Plus className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Price</span>
                    <span className="text-surreal-cyan">Market</span>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</div>
                    <input
                      type="number"
                      value={stock.price.toFixed(2)}
                      disabled
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-4 text-xl font-bold text-white opacity-60 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-white font-mono">${(stock.price * qty).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available Balance</span>
                    <span className="text-gray-400">${cashBalance.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={placing || (orderType === 'BUY' && stock.price * qty > cashBalance)}
                  className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${orderType === 'BUY' ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-red-500 shadow-red-500/25'}`}
                >
                  {placing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {orderType === 'BUY' ? <Zap className="w-5 h-5 fill-current" /> : <DollarSign className="w-5 h-5" />}
                      {orderType} {stock.ticker}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* News Section - Full Width */}
        <div className="lg:col-span-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-surreal-violet/20">
                <Newspaper className="w-5 h-5 text-surreal-violet" />
              </div>
              <h3 className="text-xl font-bold text-white">{stock.ticker} News</h3>
            </div>

            {loadingNews ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent news for {stock.ticker}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {news.slice(0, 6).map((item, idx) => (
                  <a
                    key={item.id || idx}
                    href={item.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surreal-violet/20 text-surreal-violet font-medium">
                        {item.category || 'News'}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-surreal-cyan transition-colors" />
                    </div>
                    <h4 className="text-white font-medium text-sm mb-2 line-clamp-2 group-hover:text-surreal-cyan transition-colors">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.source || 'News'}</span>
                      <span>{item.time}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default StockDetailPage;
