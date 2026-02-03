import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, Filter, Loader2 } from 'lucide-react';
import { ordersApi } from '../api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAll();
      // Transform API response
      const transformed = data.map(order => ({
        id: order.id,
        ticker: order.ticker,
        type: order.type,
        qty: parseFloat(order.quantity || 0),
        price: parseFloat(order.price || 0),
        orderValue: parseFloat(order.totalAmount || 0),
        status: order.status || 'EXECUTED',
        time: order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'
      }));
      setOrders(transformed);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EXECUTED':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-emerald-accent" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'CANCELLED':
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-coral-accent" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EXECUTED':
      case 'COMPLETED':
        return 'text-emerald-accent bg-emerald-accent/10';
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'CANCELLED':
      case 'FAILED':
        return 'text-coral-accent bg-coral-accent/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const filteredOrders = filter === 'ALL'
    ? orders
    : orders.filter(order => order.status === filter ||
      (filter === 'EXECUTED' && order.status === 'COMPLETED'));

  const stats = {
    total: orders.length,
    executed: orders.filter(o => o.status === 'EXECUTED' || o.status === 'COMPLETED').length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED' || o.status === 'FAILED').length,
    totalValue: orders.filter(o => o.status === 'EXECUTED' || o.status === 'COMPLETED')
      .reduce((sum, o) => sum + (o.orderValue || 0), 0),
  };

  if (loading) {
    return (
      <div className="max-w-[1920px] mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-surreal-cyan" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1920px] mx-auto px-6 py-8"
    >
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Orders & Transactions</h1>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-4 border-thin border-border"
        >
          <div className="text-sm text-gray-400 mb-1">Total Orders</div>
          <div className="tabular-nums text-2xl font-bold text-gray-100">{stats.total}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4 border-thin border-border"
        >
          <div className="text-sm text-gray-400 mb-1">Executed</div>
          <div className="tabular-nums text-2xl font-bold text-emerald-accent">{stats.executed}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-4 border-thin border-border"
        >
          <div className="text-sm text-gray-400 mb-1">Pending</div>
          <div className="tabular-nums text-2xl font-bold text-yellow-500">{stats.pending}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-4 border-thin border-border"
        >
          <div className="text-sm text-gray-400 mb-1">Total Value</div>
          <div className="tabular-nums text-2xl font-bold text-gray-100">
            ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-2">
          {['ALL', 'EXECUTED', 'PENDING', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                  ? 'bg-white/[0.05] text-gray-100 border-thin border-border'
                  : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-xl p-6 border-thin border-border"
      >
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No orders yet. Place your first trade!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-thin border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Symbol</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Type</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Quantity</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Price</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Order Value</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.05 }}
                    className="border-b border-thin border-border/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4 tabular-nums text-sm text-gray-100">#{order.id}</td>
                    <td className="py-3 px-4">
                      <div className="tabular-nums text-sm font-semibold text-gray-100">{order.ticker}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-semibold ${order.type === 'BUY' ? 'text-emerald-accent' : 'text-coral-accent'
                        }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums text-sm text-gray-100">{order.qty}</td>
                    <td className="text-right py-3 px-4 tabular-nums text-sm text-gray-100">${order.price.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 tabular-nums text-sm text-gray-100">
                      ${order.orderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">{order.time}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OrdersPage;
