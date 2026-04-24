'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Database, Search, GitMerge, AlertCircle, Trash2 } from 'lucide-react';
import AssetCard from '../cards/AssetCard';
import PIIBanner from '../cards/PIIBanner';
import LineageGraph from '../lineage/LineageGraph';
import ImpactRadar from '../impact/ImpactRadar';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  data?: any;
  hasPII?: boolean;
  piiDetails?: string[];
  timestamp: Date;
}

export default function ChatInterface({ mode = 'full' }: { mode?: 'full' | 'sidebar' }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionContext, setSessionContext] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const text = overrideInput || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionContext }),
      });

      const result = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.aiResponse,
        intent: result.intent,
        data: result.data,
        hasPII: result.hasPII,
        piiDetails: result.piiDetails,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update session context if an asset was found
      if (result.intent === 'explain_schema' || result.intent === 'quality') {
        const asset = result.data.table;
        setSessionContext(prev => {
          const exists = prev.find(a => a.fqn === asset.fullyQualifiedName);
          if (exists) return prev;
          return [...prev, { fqn: asset.fullyQualifiedName, name: asset.name, type: 'table' }];
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (mode === 'sidebar') {
    return (
      <div className="flex flex-col h-full bg-[#0a0a15] w-full">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10">
              <Sparkles size={13} className="text-cyan-400" />
            </div>
            <span className="font-bold text-[11px] uppercase tracking-widest text-white">
              AI Assistant
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                <Sparkles size={18} className="text-cyan-400 opacity-70" />
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ask me anything about your data catalog. Try a query like{' '}
                <span className="text-cyan-400/80">&quot;find PII tables&quot;</span>.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[90%]', msg.role === 'user' ? 'items-end' : 'items-start')}>
                  <div
                    className={cn(
                      'p-3 rounded-xl text-xs leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-white rounded-tr-none'
                        : 'bg-white/5 border border-white/8 text-gray-300 rounded-tl-none'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your data…"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.07] text-xs transition-all placeholder:text-gray-600"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500 disabled:opacity-30 hover:text-cyan-300 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#080808] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#080808]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">MetaFlux</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <motion.div 
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Sandbox Live</span>
        </div>
      </nav>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20"
            >
              <Sparkles size={40} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold mb-2">MetaFlux</h1>
              <p className="text-gray-500 text-lg">Talk to your data catalog in plain English</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              {[
                "Show me all payment tables",
                "What's the lineage of dim_customer?",
                "What breaks if fact_orders changes?",
                "Which tables have failing quality tests?"
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSubmit(undefined, prompt)}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl text-left text-sm text-gray-400 hover:bg-white/10 hover:border-white/20 transition-all hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] space-y-2", msg.role === 'user' ? "items-end" : "items-start")}>
                <div className={cn(
                  "p-4 rounded-2xl",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-[#111] border border-white/10 rounded-tl-none"
                )}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>

                {msg.role === 'assistant' && msg.data && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 w-full min-w-[400px]"
                  >
                    {msg.hasPII && (
                      <PIIBanner 
                        piiColumns={msg.piiDetails || []} 
                        owner={msg.data.table?.owners?.[0] || null} 
                      />
                    )}

                    {msg.intent === 'search' && (
                      <div className="grid gap-3">
                        {msg.data.hits?.hits?.map((hit: any) => (
                          <AssetCard key={hit._id} asset={hit} healthScore={hit.healthScore} />
                        ))}
                      </div>
                    )}

                    {msg.intent === 'lineage' && (
                      <LineageGraph 
                        nodes={msg.data.nodes} 
                        edges={msg.data.upstreamEdges.concat(msg.data.downstreamEdges)} 
                        centerFqn={msg.data.entity.fullyQualifiedName}
                      />
                    )}

                    {msg.intent === 'impact' && (
                      <ImpactRadar impacts={msg.data} />
                    )}

                    {(msg.intent === 'explain_schema' || msg.intent === 'quality') && (
                      <AssetCard asset={msg.data.table} healthScore={msg.data.health} />
                    )}
                  </motion.div>
                )}
                
                <span className="text-[10px] text-gray-600 uppercase tracking-widest px-1">
                  {msg.role} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-6 bg-[#080808]/80 backdrop-blur-md border-t border-white/5">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask MetaFlux anything about your data..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 w-10 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Sparkles size={18} className="text-white" />
              </motion.div>
            ) : (
              <Send size={18} className="text-white" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
