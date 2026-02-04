import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Calendar, Building, FileText, IndianRupee } from 'lucide-react';
import { marketApi } from '../api';

const MutualFundDetailPage = () => {
    const { schemeCode } = useParams();
    const navigate = useNavigate();
    const [fund, setFund] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadFundDetails();
    }, [schemeCode]);

    const loadFundDetails = async () => {
        try {
            setLoading(true);
            const data = await marketApi.getMutualFundDetails(schemeCode);
            setFund(data);
        } catch (err) {
            console.error('Failed to load fund details:', err);
            setError('Failed to load fund details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-6 pb-24">
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-10 h-10 animate-spin text-surreal-cyan" />
                </div>
            </div>
        );
    }

    if (error || !fund) {
        return (
            <div className="max-w-[1920px] mx-auto px-4 md:px-8 py-6 pb-24">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8">
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>
                <div className="text-center py-20 text-gray-500">
                    {error || 'Fund not found'}
                </div>
            </div>
        );
    }

    const isPositive = (val) => parseFloat(val || 0) >= 0;

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

            {/* Fund Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-8 border border-white/5 mb-8"
            >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{fund.schemeName}</h1>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1 rounded-lg bg-surreal-violet/20 text-surreal-violet text-sm font-medium border border-surreal-violet/20">
                                {fund.fundHouse}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-sm border border-white/5">
                                {fund.schemeType || 'Open Ended'}
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-sm border border-white/5">
                                {fund.schemeCategory || 'Equity'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Current NAV</div>
                        <div className="text-4xl font-bold text-white flex items-center justify-end gap-1">
                            <IndianRupee className="w-7 h-7" />
                            {parseFloat(fund.nav || 0).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">as of {fund.navDate || 'N/A'}</div>
                    </div>
                </div>
            </motion.div>

            {/* Returns Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
                {/* 1 Year Return */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">1 Year Return</span>
                    </div>
                    <div className={`text-3xl font-bold flex items-center gap-2 ${isPositive(fund.oneYearReturn) ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive(fund.oneYearReturn) ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        {parseFloat(fund.oneYearReturn || 0).toFixed(2)}%
                    </div>
                </div>

                {/* 3 Year Return */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">3 Year Return</span>
                    </div>
                    <div className={`text-3xl font-bold flex items-center gap-2 ${isPositive(fund.threeYearReturn) ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive(fund.threeYearReturn) ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        {parseFloat(fund.threeYearReturn || 0).toFixed(2)}%
                    </div>
                </div>

                {/* 5 Year Return */}
                <div className="glass-card rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">5 Year Return</span>
                    </div>
                    <div className={`text-3xl font-bold flex items-center gap-2 ${isPositive(fund.fiveYearReturn) ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive(fund.fiveYearReturn) ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                        {parseFloat(fund.fiveYearReturn || 0).toFixed(2)}%
                    </div>
                </div>
            </motion.div>

            {/* Fund Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-6 border border-white/5"
            >
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-surreal-cyan" />
                    Fund Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex justify-between py-3 border-b border-white/5">
                            <span className="text-gray-400">Scheme Code</span>
                            <span className="text-white font-mono">{fund.schemeCode}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-white/5">
                            <span className="text-gray-400">Fund House</span>
                            <span className="text-white">{fund.fundHouse}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-white/5">
                            <span className="text-gray-400">Scheme Type</span>
                            <span className="text-white">{fund.schemeType || 'Open Ended'}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between py-3 border-b border-white/5">
                            <span className="text-gray-400">Category</span>
                            <span className="text-white">{fund.schemeCategory || 'Equity'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-white/5">
                            <span className="text-gray-400">NAV Date</span>
                            <span className="text-white">{fund.navDate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b border-white/5">
                            <span className="text-gray-400">Current NAV</span>
                            <span className="text-white font-mono">₹{parseFloat(fund.nav || 0).toFixed(4)}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MutualFundDetailPage;
