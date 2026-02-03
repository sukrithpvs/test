// API Service for LockedIn Portfolio Manager
// Connects React frontend to Spring Boot backend

const API_BASE = 'http://localhost:8080/api';

// Helper for fetch with error handling
async function fetchApi(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

// =============== MARKET DATA ===============

export const marketApi = {
    // Get top gainers (cached, updates hourly)
    getGainers: () => fetchApi('/market/gainers'),

    // Get top losers (cached, updates hourly)
    getLosers: () => fetchApi('/market/losers'),

    // Get market indices (S&P 500, NASDAQ, DOW, etc.)
    getIndices: () => fetchApi('/market/indices'),

    // Get trending stocks
    getTrending: () => fetchApi('/market/trending'),

    // Get stock detail
    getStock: (ticker) => fetchApi(`/market/stock/${ticker}`),

    // Get stock with 6-month historical data
    getStockHistory: (ticker) => fetchApi(`/market/stock/${ticker}/history`),

    // Get top mutual funds
    getMutualFunds: () => fetchApi('/market/mutualfunds'),

    // Get mutual fund details
    getMutualFundDetails: (schemeCode) => fetchApi(`/market/mutualfunds/${schemeCode}`),

    // Search mutual funds
    searchMutualFunds: (query) => fetchApi(`/market/mutualfunds/search?q=${encodeURIComponent(query)}`),
};

// =============== PORTFOLIO ===============

export const portfolioApi = {
    // Get portfolio summary (cash balance, value, P&L)
    getSummary: () => fetchApi('/portfolio/summary'),

    // Get or create portfolio
    getPortfolio: () => fetchApi('/portfolio'),
};

// =============== HOLDINGS ===============

export const holdingsApi = {
    // Get all holdings with current values
    getAll: () => fetchApi('/holdings'),

    // Get holding by ticker
    getByTicker: (ticker) => fetchApi(`/holdings/${ticker}`),
};

// =============== ORDERS ===============

export const ordersApi = {
    // Get all orders
    getAll: () => fetchApi('/orders'),

    // Place a new order (BUY or SELL)
    place: (orderData) => fetchApi('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
    }),
};

// =============== WATCHLIST ===============

export const watchlistApi = {
    // Get full watchlist
    getAll: () => fetchApi('/watchlist'),

    // Add to watchlist
    add: (ticker, notes = '') => fetchApi('/watchlist', {
        method: 'POST',
        body: JSON.stringify({ ticker, notes }),
    }),

    // Remove from watchlist
    remove: (ticker) => fetchApi(`/watchlist/${ticker}`, {
        method: 'DELETE',
    }),
};

// =============== PRICES ===============

export const pricesApi = {
    // Get live price for a ticker
    getPrice: (ticker) => fetchApi(`/prices/${ticker}`),
};

// Default export with all APIs
export default {
    market: marketApi,
    portfolio: portfolioApi,
    holdings: holdingsApi,
    orders: ordersApi,
    watchlist: watchlistApi,
    prices: pricesApi,
};
