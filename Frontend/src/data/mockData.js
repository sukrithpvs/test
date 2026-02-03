// Mock data for Indian stock market
export const indices = [
  { name: 'SENSEX', value: 73651.35, change: 812.38, changePercent: 1.12, sparkline: [72800, 73000, 73200, 73400, 73651] },
  { name: 'BANKNIFTY', value: 47289.15, change: -162.34, changePercent: -0.34, sparkline: [47400, 47350, 47300, 47250, 47289] },
  { name: 'DOW', value: 38519.84, change: 215.56, changePercent: 0.56, sparkline: [38300, 38400, 38450, 38500, 38519] },
  { name: 'NASDAQ', value: 15361.64, change: 189.23, changePercent: 1.23, sparkline: [15170, 15200, 15250, 15300, 15361] },
  { name: 'FTSE', value: 7952.62, change: -7.95, changePercent: -0.1, sparkline: [7960, 7958, 7955, 7953, 7952] },
  { name: 'Nifty 50', value: 19847.25, change: 125.50, changePercent: 0.64, sparkline: [19800, 19820, 19830, 19840, 19847] },
];

export const myInvestments = [
  { ticker: 'RELIANCE', name: 'Reliance Industries', currentValue: 245000, investedAmount: 200000, gain: 45000, gainPercent: 22.5, ltp: 2450.00 },
  { ticker: 'TCS', name: 'Tata Consultancy Services', currentValue: 180000, investedAmount: 195000, gain: -15000, gainPercent: -7.69, ltp: 3450.00 },
  { ticker: 'HDFCBANK', name: 'HDFC Bank', currentValue: 125000, investedAmount: 110000, gain: 15000, gainPercent: 13.64, ltp: 1625.50 },
  { ticker: 'INFY', name: 'Infosys', currentValue: 95000, investedAmount: 100000, gain: -5000, gainPercent: -5.00, ltp: 1420.25 },
  { ticker: 'ICICIBANK', name: 'ICICI Bank', currentValue: 87000, investedAmount: 80000, gain: 7000, gainPercent: 8.75, ltp: 980.75 },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel', currentValue: 72000, investedAmount: 65000, gain: 7000, gainPercent: 10.77, ltp: 1080.00 },
];

// Holdings data for Holdings page
export const holdings = [
  { 
    ticker: 'RELIANCE', 
    name: 'Reliance Industries Ltd', 
    qty: 45, 
    avgPrice: 2456.80, 
    ltp: 2789.50, 
    value: 125527.50, 
    pnl: 14971.50, 
    pnlPercent: 13.54,
    invested: 110556.00
  },
  { 
    ticker: 'TCS', 
    name: 'Tata Consultancy Services', 
    qty: 28, 
    avgPrice: 3621.30, 
    ltp: 3890.75, 
    value: 108941.00, 
    pnl: 7544.60, 
    pnlPercent: 7.44,
    invested: 101396.40
  },
  { 
    ticker: 'HDFCBANK', 
    name: 'HDFC Bank Ltd', 
    qty: 65, 
    avgPrice: 1620.00, 
    ltp: 1625.50, 
    value: 105657.50, 
    pnl: 357.50, 
    pnlPercent: 0.34,
    invested: 105300.00
  },
  { 
    ticker: 'INFY', 
    name: 'Infosys Ltd', 
    qty: 50, 
    avgPrice: 1425.00, 
    ltp: 1420.25, 
    value: 71012.50, 
    pnl: -237.50, 
    pnlPercent: -0.33,
    invested: 71250.00
  },
  { 
    ticker: 'ICICIBANK', 
    name: 'ICICI Bank Ltd', 
    qty: 75, 
    avgPrice: 975.00, 
    ltp: 980.75, 
    value: 73556.25, 
    pnl: 431.25, 
    pnlPercent: 0.59,
    invested: 73125.00
  },
  { 
    ticker: 'BHARTIARTL', 
    name: 'Bharti Airtel Ltd', 
    qty: 60, 
    avgPrice: 1080.00, 
    ltp: 1080.00, 
    value: 64800.00, 
    pnl: 0.00, 
    pnlPercent: 0.00,
    invested: 64800.00
  },
];

export const portfolioSummary = {
  totalValue: 3452890,
  daysGain: 45230,
  daysGainPercent: 1.33,
  totalPnL: 892450,
  totalPnLPercent: 34.78,
  alphaVsBenchmark: 12.4,
  investedAmount: 2560277.40,
};

export const assetAllocation = [
  { name: 'Equity', value: 65, color: '#8b5cf6' },
  { name: 'Debt', value: 25, color: '#3b82f6' },
  { name: 'Cash', value: 10, color: '#10b981' },
];

export const topMovers = {
  gainers: [
    { rank: 1, ticker: 'ADANIENT', name: 'Adani Enterprises', price: 2450.50, change: 125.25, changePercent: 5.38, volume: 12500000, sparkline: [2325, 2350, 2380, 2400, 2450] },
    { rank: 2, ticker: 'TATAMOTORS', name: 'Tata Motors', price: 680.75, change: 32.50, changePercent: 5.02, volume: 9800000, sparkline: [648, 655, 665, 670, 680] },
    { rank: 3, ticker: 'WIPRO', name: 'Wipro', price: 425.30, change: 18.75, changePercent: 4.61, volume: 7500000, sparkline: [406, 410, 415, 420, 425] },
    { rank: 4, ticker: 'LT', name: 'Larsen & Toubro', price: 3250.00, change: 142.50, changePercent: 4.59, volume: 3200000, sparkline: [3107, 3150, 3180, 3220, 3250] },
    { rank: 5, ticker: 'MARUTI', name: 'Maruti Suzuki', price: 10850.75, change: 485.25, changePercent: 4.68, volume: 2100000, sparkline: [10365, 10450, 10600, 10750, 10850] },
  ],
  losers: [
    { rank: 1, ticker: 'ZOMATO', name: 'Zomato', price: 68.25, change: -4.50, changePercent: -6.19, volume: 45000000, sparkline: [72.75, 71.50, 70.25, 69.00, 68.25] },
    { rank: 2, ticker: 'PAYTM', name: 'Paytm', price: 645.50, change: -38.25, changePercent: -5.59, volume: 28000000, sparkline: [683.75, 675.00, 665.00, 655.00, 645.50] },
    { rank: 3, ticker: 'NYKAA', name: 'FSN E-Commerce', price: 142.75, change: -7.25, changePercent: -4.84, volume: 12000000, sparkline: [150.00, 148.00, 146.00, 144.00, 142.75] },
    { rank: 4, ticker: 'DELHIVERY', name: 'Delhivery', price: 385.25, change: -18.50, changePercent: -4.58, volume: 8500000, sparkline: [403.75, 398.00, 392.00, 388.00, 385.25] },
    { rank: 5, ticker: 'POLICYBZR', name: 'PB Fintech', price: 725.00, change: -32.75, changePercent: -4.32, volume: 5200000, sparkline: [757.75, 745.00, 735.00, 730.00, 725.00] },
  ],
  volume: [
    { rank: 1, ticker: 'RELIANCE', name: 'Reliance Industries', price: 2450.00, change: 25.50, changePercent: 1.05, volume: 125000000, sparkline: [2424, 2430, 2435, 2445, 2450] },
    { rank: 2, ticker: 'HDFCBANK', name: 'HDFC Bank', price: 1625.50, change: 12.25, changePercent: 0.76, volume: 98000000, sparkline: [1613, 1618, 1620, 1623, 1625] },
    { rank: 3, ticker: 'ICICIBANK', name: 'ICICI Bank', price: 980.75, change: 8.50, changePercent: 0.87, volume: 75000000, sparkline: [972, 975, 977, 979, 980] },
    { rank: 4, ticker: 'INFY', name: 'Infosys', price: 1420.25, change: -5.75, changePercent: -0.40, volume: 65000000, sparkline: [1426, 1424, 1422, 1421, 1420] },
    { rank: 5, ticker: 'TCS', name: 'Tata Consultancy Services', price: 3450.00, change: -15.25, changePercent: -0.44, volume: 52000000, sparkline: [3465, 3460, 3455, 3452, 3450] },
  ],
};

export const trendingStocks = [
  { ticker: 'RELIANCE', name: 'Reliance Industries', price: 2789.50, change: 25.50, changePercent: 0.92, volume: '125M', marketCap: '₹18.9L Cr', sector: 'Energy' },
  { ticker: 'TCS', name: 'Tata Consultancy', price: 3890.75, change: 45.25, changePercent: 1.18, volume: '52M', marketCap: '₹14.2L Cr', sector: 'IT' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank', price: 1625.50, change: 12.25, changePercent: 0.76, volume: '98M', marketCap: '₹12.5L Cr', sector: 'Banking' },
  { ticker: 'INFY', name: 'Infosys', price: 1420.25, change: -5.75, changePercent: -0.40, volume: '65M', marketCap: '₹6.0L Cr', sector: 'IT' },
  { ticker: 'ICICIBANK', name: 'ICICI Bank', price: 980.75, change: 8.50, changePercent: 0.87, volume: '75M', marketCap: '₹7.2L Cr', sector: 'Banking' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel', price: 1080.00, change: 15.25, changePercent: 1.43, volume: '42M', marketCap: '₹6.1L Cr', sector: 'Telecom' },
  { ticker: 'TATAMOTORS', name: 'Tata Motors', price: 680.75, change: 32.50, changePercent: 5.02, volume: '98M', marketCap: '₹2.5L Cr', sector: 'Auto' },
  { ticker: 'LT', name: 'Larsen & Toubro', price: 3250.00, change: 142.50, changePercent: 4.59, volume: '32M', marketCap: '₹4.6L Cr', sector: 'Infrastructure' },
];

export const sectors = [
  { name: 'IT', performance: 2.3, stocks: ['TCS', 'INFY', 'WIPRO', 'HCLTECH'] },
  { name: 'Auto', performance: 1.8, stocks: ['TATAMOTORS', 'MARUTI', 'M&M', 'BAJAJ-AUTO'] },
  { name: 'Pharma', performance: -0.5, stocks: ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'LUPIN'] },
  { name: 'Banking', performance: 1.2, stocks: ['HDFCBANK', 'ICICIBANK', 'KOTAKBANK', 'AXISBANK'] },
  { name: 'FMCG', performance: 0.8, stocks: ['HUL', 'ITC', 'NESTLE', 'BRITANNIA'] },
  { name: 'Energy', performance: 3.1, stocks: ['RELIANCE', 'ONGC', 'IOC', 'BPCL'] },
  { name: 'Metals', performance: -1.2, stocks: ['TATASTEEL', 'JSWSTEEL', 'SAIL', 'HINDALCO'] },
  { name: 'Realty', performance: 2.5, stocks: ['DLF', 'GODREJPROP', 'SOBHA', 'PRESTIGE'] },
];

export const news = [
  { id: 1, title: 'Reliance Industries reports record Q3 profits, stock surges 3%', source: 'Economic Times', time: '2h ago', category: 'Earnings', ticker: 'RELIANCE' },
  { id: 2, title: 'TCS announces major AI partnership with global tech giant', source: 'Business Standard', time: '4h ago', category: 'Partnership', ticker: 'TCS' },
  { id: 3, title: 'HDFC Bank sees strong loan growth, NPA levels improve', source: 'Mint', time: '6h ago', category: 'Banking', ticker: 'HDFCBANK' },
  { id: 4, title: 'Infosys wins $500M deal from European client', source: 'ET Markets', time: '8h ago', category: 'Deals', ticker: 'INFY' },
  { id: 5, title: 'ICICI Bank launches new digital banking platform', source: 'Financial Express', time: '10h ago', category: 'Technology', ticker: 'ICICIBANK' },
  { id: 6, title: 'Bharti Airtel expands 5G network to 50 more cities', source: 'The Hindu', time: '12h ago', category: 'Expansion', ticker: 'BHARTIARTL' },
];

export const stockDetails = {
  'RELIANCE': {
    name: 'Reliance Industries Ltd',
    price: 2789.50,
    change: 25.50,
    changePercent: 0.92,
    dayRange: { high: 2805.50, low: 2764.25 },
    weekRange: { high: 2810.00, low: 2720.00 },
    marketCap: '₹18,90,000 Cr',
    pe: 28.5,
    pb: 2.8,
    debtToEquity: 0.15,
    dividendYield: 0.38,
    roe: 12.5,
    eps: 97.8,
    bookValue: 995.50,
    faceValue: 10,
    ownership: {
      promoter: 50.1,
      fii: 24.8,
      dii: 8.2,
      retail: 16.9,
    },
    peers: [
      { ticker: 'ONGC', name: 'Oil & Natural Gas Corp', price: 185.50, pe: 6.2, returns1Y: 15.3, marketCap: '₹2.3L Cr' },
      { ticker: 'IOC', name: 'Indian Oil Corporation', price: 95.25, pe: 8.5, returns1Y: 22.1, marketCap: '₹1.4L Cr' },
      { ticker: 'BPCL', name: 'Bharat Petroleum', price: 385.75, pe: 7.8, returns1Y: 18.5, marketCap: '₹83K Cr' },
      { ticker: 'GAIL', name: 'GAIL India', price: 125.00, pe: 9.2, returns1Y: 12.8, marketCap: '₹55K Cr' },
    ],
    priceHistory: {
      '1D': [2764, 2770, 2775, 2780, 2785, 2789],
      '1W': [2720, 2730, 2740, 2750, 2760, 2770, 2789],
      '1M': [2650, 2680, 2700, 2720, 2740, 2760, 2789],
      '1Y': [2400, 2500, 2600, 2700, 2750, 2789],
    },
  },
  'TCS': {
    name: 'Tata Consultancy Services Ltd',
    price: 3890.75,
    change: 45.25,
    changePercent: 1.18,
    dayRange: { high: 3905.00, low: 3845.50 },
    weekRange: { high: 3920.00, low: 3800.00 },
    marketCap: '₹14,20,000 Cr',
    pe: 32.5,
    pb: 12.8,
    debtToEquity: 0.0,
    dividendYield: 1.2,
    roe: 38.5,
    eps: 119.7,
    bookValue: 304.0,
    faceValue: 1,
    ownership: {
      promoter: 72.0,
      fii: 15.2,
      dii: 7.8,
      retail: 5.0,
    },
    peers: [
      { ticker: 'INFY', name: 'Infosys Ltd', price: 1420.25, pe: 28.2, returns1Y: 8.5, marketCap: '₹6.0L Cr' },
      { ticker: 'WIPRO', name: 'Wipro Ltd', price: 425.30, pe: 22.5, returns1Y: -5.2, marketCap: '₹2.3L Cr' },
      { ticker: 'HCLTECH', name: 'HCL Technologies', price: 1250.50, pe: 25.8, returns1Y: 12.3, marketCap: '₹3.4L Cr' },
      { ticker: 'TECHM', name: 'Tech Mahindra', price: 1280.75, pe: 24.5, returns1Y: 6.8, marketCap: '₹1.2L Cr' },
    ],
    priceHistory: {
      '1D': [3845, 3860, 3870, 3880, 3885, 3890],
      '1W': [3800, 3820, 3840, 3860, 3880, 3890],
      '1M': [3700, 3750, 3800, 3850, 3880, 3890],
      '1Y': [3600, 3700, 3800, 3850, 3890],
    },
  },
};

export const orders = [
  { id: 1, ticker: 'RELIANCE', type: 'BUY', qty: 10, price: 2789.50, status: 'EXECUTED', time: '2024-01-15 10:30:25', orderValue: 27895.00 },
  { id: 2, ticker: 'TCS', type: 'SELL', qty: 5, price: 3890.75, status: 'EXECUTED', time: '2024-01-15 09:15:10', orderValue: 19453.75 },
  { id: 3, ticker: 'HDFCBANK', type: 'BUY', qty: 20, price: 1625.50, status: 'PENDING', time: '2024-01-15 14:20:00', orderValue: 32510.00 },
  { id: 4, ticker: 'INFY', type: 'BUY', qty: 15, price: 1420.25, status: 'EXECUTED', time: '2024-01-14 11:45:30', orderValue: 21303.75 },
  { id: 5, ticker: 'ICICIBANK', type: 'SELL', qty: 25, price: 980.75, status: 'CANCELLED', time: '2024-01-14 15:30:00', orderValue: 24518.75 },
  { id: 6, ticker: 'BHARTIARTL', type: 'BUY', qty: 30, price: 1080.00, status: 'EXECUTED', time: '2024-01-13 10:00:00', orderValue: 32400.00 },
];

export const watchlist = [
  { ticker: 'RELIANCE', name: 'Reliance Industries', price: 2789.50, change: 25.50, changePercent: 0.92, target: 3000, stopLoss: 2700 },
  { ticker: 'TCS', name: 'Tata Consultancy', price: 3890.75, change: 45.25, changePercent: 1.18, target: 4000, stopLoss: 3800 },
  { ticker: 'HDFCBANK', name: 'HDFC Bank', price: 1625.50, change: 12.25, changePercent: 0.76, target: 1700, stopLoss: 1600 },
  { ticker: 'INFY', name: 'Infosys', price: 1420.25, change: -5.75, changePercent: -0.40, target: 1500, stopLoss: 1400 },
  { ticker: 'ICICIBANK', name: 'ICICI Bank', price: 980.75, change: 8.50, changePercent: 0.87, target: 1050, stopLoss: 950 },
];
