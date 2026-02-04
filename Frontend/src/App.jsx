import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ExplorePage from './pages/ExplorePage';
import HoldingsPage from './pages/HoldingsPage';
import OrdersPage from './pages/OrdersPage';
import WatchlistPage from './pages/WatchlistPage';
import StockDetailPage from './pages/StockDetailPage';
import MutualFundsPage from './pages/MutualFundsPage';
import MutualFundDetailPage from './pages/MutualFundDetailPage';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/holdings" element={<HoldingsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/mutualfunds" element={<MutualFundsPage />} />
          <Route path="/mutualfund/:schemeCode" element={<MutualFundDetailPage />} />
          <Route path="/stock/:ticker" element={<StockDetailPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;


