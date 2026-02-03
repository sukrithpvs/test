import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, MessageSquare, ChevronRight, Bot } from 'lucide-react';
import { chatService } from '../services/chatService';

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Hello! I\'m your personal financial assistant. How can I help you optimize your portfolio today?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestedQuestions = [
        "How is my portfolio performing?",
        "What are today's top gainers?",
        "Show me risky stocks",
        "Analyze Tesla"
    ];

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        // Add User Message
        const userMsg = { id: Date.now(), type: 'user', text: text };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Simulate Network Delay
        setTimeout(async () => {
            const responseText = await chatService.getResponse(text);
            const botMsg = { id: Date.now() + 1, type: 'bot', text: responseText };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-[350px] md:w-[400px] h-[600px] max-h-[80vh] glass-card rounded-2xl border border-white/20 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl bg-black/80"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-surreal-violet/10 to-surreal-cyan/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-surreal-violet to-surreal-cyan flex items-center justify-center shadow-lg shadow-surreal-cyan/20">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">FinAI Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] text-emerald-400 font-medium">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                                ? 'bg-surreal-violet text-white rounded-br-none shadow-lg shadow-surreal-violet/20'
                                                : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Questions (only if few messages) */}
                        {messages.length < 3 && (
                            <div className="px-4 pb-2">
                                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                    {suggestedQuestions.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSendMessage(q)}
                                            className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-surreal-cyan hover:text-white transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-black/40">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-surreal-cyan/50 focus:bg-white/10 transition-all placeholder-gray-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isTyping}
                                    className="p-2.5 bg-surreal-cyan text-black rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-surreal-cyan/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Orb Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="group relative w-14 h-14 rounded-full flex items-center justify-center outline-none"
            >
                {/* Glowing Orb Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-surreal-violet via-surreal-cyan to-surreal-purple opacity-90 blur-sm group-hover:blur-md transition-all duration-500 animate-pulse-glow" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-surreal-violet via-surreal-cyan to-surreal-purple opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500" />

                {/* Icon */}
                <div className="relative z-10 w-full h-full rounded-full bg-black/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                    {isOpen ? (
                        <X className="w-6 h-6 text-white" />
                    ) : (
                        <Sparkles className="w-6 h-6 text-white animate-pulse" />
                    )}
                </div>

                {/* Status indicator */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-black rounded-full" />
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
