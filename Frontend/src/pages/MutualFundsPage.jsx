import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingUp, Search, ChevronRight } from 'lucide-react';
import { marketApi } from '../api';

// Cache key for session storage
const CACHE_KEY = 'mutualfunds_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes frontend cache

const MutualFundsPage = () => {
    const navigate = useNavigate();
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFunds();
    }, []);

    const loadFunds = async () => {
        // Check session cache first
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setFunds(data);
                    setLoading(false);
                    return;
                }
            }
        } catch (e) {
            console.log('Cache miss');
        }

        // Fetch from API
        try {
            setLoading(true);
            const data = await marketApi.getMutualFunds();
            setFunds(data);
            // Cache the result
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } catch (err) {
            console.error('Failed to load funds:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredFunds = funds.filter(fund =>
        fund.schemeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fund.fundHouse?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFundClick = (schemeCode) => {
        navigate(`/mutualfund/${schemeCode}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1920px] mx-auto px-4 md:px-8 py-6 pb-24"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Back</span>
                </button>
            </div>

            <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Mutual Funds</h1>
                <p className="text-gray-400 text-lg">Explore top performing funds across various categories.</p>
            </div>

            {/* Search & Content */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search mutual funds..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-surreal-cyan transition-colors"
                        />
                    </div>
                    <div className="text-sm text-gray-400">
                        Showing {filteredFunds.length} funds
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-surreal-cyan" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredFunds.map((fund, i) => (
                            <motion.div
                                key={fund.schemeCode || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => handleFundClick(fund.schemeCode)}
                                className="glass p-6 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-surreal-cyan transition-colors mb-1">
                                            {fund.schemeName}
                                        </h3>
                                        <div className="flex gap-3 text-sm text-gray-400">
                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-xs">
                                                {fund.fundHouse}
                                            </span>
                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-xs">
                                                {fund.schemeCategory || 'Equity'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">NAV</div>
                                            <div className="text-white font-mono font-bold">₹{parseFloat(fund.nav || 0).toFixed(2)}</div>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <div className="text-xs text-gray-500 mb-1">1Y Return</div>
                                            <div className={`flex items-center justify-end gap-1 font-mono font-bold ${(fund.oneYearReturn || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {(fund.oneYearReturn || 0) >= 0 && <TrendingUp className="w-4 h-4" />}
                                                {parseFloat(fund.oneYearReturn || 0).toFixed(2)}%
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-surreal-cyan group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filteredFunds.length === 0 && (
                            <div className="text-center py-20 text-gray-500">
                                No funds found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default MutualFundsPage;
