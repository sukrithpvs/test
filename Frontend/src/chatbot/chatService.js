import OpenAI from "openai";

const client = new OpenAI({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    dangerouslyAllowBrowser: true
});

export const chatService = {
    getResponse: async (message) => {
        try {
            // 1. Fetch Context Data (Parallel fetch for speed)
            const [portfolioRes, gainersRes, trendingRes] = await Promise.allSettled([
                fetch('/api/portfolio/summary'),
                fetch('/api/market/gainers'),
                fetch('/api/market/trending')
            ]);

            let portfolioContext = "Portfolio data unavailable.";
            let marketContext = "Market data unavailable.";

            if (portfolioRes.status === 'fulfilled' && portfolioRes.value.ok) {
                const data = await portfolioRes.value.json();
                portfolioContext = JSON.stringify(data);
            }

            if (gainersRes.status === 'fulfilled' && gainersRes.value.ok) {
                const gainers = await gainersRes.value.json();
                const trending = trendingRes.status === 'fulfilled' && trendingRes.value.ok ? await trendingRes.value.json() : [];
                marketContext = `Top Gainers: ${JSON.stringify(gainers)}. Trending: ${JSON.stringify(trending)}`;
            }

            // 2. Construct System Prompt
            const systemPrompt = `You are a financial advisor chatbot for the "LockedIn" portfolio app.
            
            Context Data:
            User Portfolio: ${portfolioContext}
            Market Trends: ${marketContext}

            Instructions:
            - Answer the user's question based on the provided context.
            - Use **Markdown** formatting to make the response easy to read.
            - **ALWAYS use bullet points** for lists (like top stocks, holdings, or recommendations).
            - Use **bold text** for ticker symbols and key figures (e.g., **NVDA**, **+5%**).
            - Keep paragraphs short and concise.
            - If the user asks about their portfolio, use the Portfolio data.
            - If the user asks what to buy/sell, refer to Market Trends and their current holdings (if relevant).
            - Do not mention "JSON" or technical data formats to the user.
            `;

            // 3. Call Groq API
            const response = await client.chat.completions.create({
                model: "llama-3.3-70b-versatile", // Updated to supported model
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.7,
                max_tokens: 300
            });

            return response.choices[0]?.message?.content || "I couldn't generate a response.";

        } catch (error) {
            console.error("Chat Service Error:", error);
            // Enhanced error reporting for debugging
            if (error.message.includes("404")) {
                return "Error: Could not connect to the Backend API. Please check if the Java server is running.";
            }
            if (error instanceof OpenAI.APIError) {
                return `Error connecting to AI: ${error.message}`;
            }
            return `Connection Error: ${error.message || "Unknown error"}. Check console for details.`;
        }
    }
};
