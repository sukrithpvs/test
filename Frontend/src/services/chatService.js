export const chatService = {
    getResponse: async (message) => {
        // Determine response based on keywords
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('portfolio') || lowerMsg.includes('balance')) {
            return "Your portfolio is currently valued at $107,450.25 (up 2.4% today). Your cash balance is $24,500. Would you like a breakdown by sector?";
        }

        if (lowerMsg.includes('gainers') || lowerMsg.includes('top')) {
            return "Today's top gainers are:\n1. NVDA (+4.2%)\n2. TSLA (+1.8%)\n3. META (+1.2%)\n\nTech is leading the rally today!";
        }

        if (lowerMsg.includes('tesla') || lowerMsg.includes('tsla')) {
            return "Tesla (TSLA) is trading at $248.75. It has strong momentum recently due to new delivery numbers. Analysts have a 'Buy' rating on it.";
        }

        if (lowerMsg.includes('risk') || lowerMsg.includes('safe')) {
            return "Based on your holdings, about 65% of your portfolio is in high-growth tech stocks, which carries higher volatility. Consider diversifying into bonds or ETFs for more stability.";
        }

        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            return "Hi there! I'm ready to help you analyze the market. What's on your mind?";
        }

        return "That's an interesting question. I'm currently in 'Demo Mode', so I have limited live analysis capabilities, but I can tell you about your portfolio, top movers, or specific tech stocks!";
    }
};
