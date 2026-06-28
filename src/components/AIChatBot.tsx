import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Sparkles, Trash2, HelpCircle, AlertCircle } from "lucide-react";
import Markdown from "react-markdown";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  { id: "sug-1", text: "Como identificar e combater a Antracnose?", label: "Doença: Antracnose" },
  { id: "sug-2", text: "Quais os principais cuidados no plantio do cajueiro?", label: "Plantio do Cajueiro" },
  { id: "sug-3", text: "Como produzir e conservar cajuína caseira?", label: "Produção de Cajuína" },
  { id: "sug-4", text: "Quais são as melhores épocas para podar o cajueiro?", label: "Época de Poda" }
];

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-msg",
      sender: "ai",
      text: "Olá! Sou o **CajuAjudante**, seu assistente virtual especializado em cajucultura. \n\nEstou aqui para ajudar com dúvidas sobre plantio, controle de pragas, adubação, colheita e a produção de deliciosos derivados do caju, como a cajuína, doces e castanhas. \n\nComo posso ajudar você hoje?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText) return;

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: "user",
      text: trimmedText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      // Keep only user-facing fields in history, mapped for server endpoint
      const historyPayload = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmedText,
          history: historyPayload
        })
      });

      if (!response.ok) {
        throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: "ai",
        text: data.text || "Desculpe, não consegui gerar uma resposta.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Erro no chat do CajuAjudante:", err);
      setError("Ops! Ocorreu um erro ao carregar a resposta. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleClearHistory = () => {
    if (window.confirm("Deseja mesmo limpar todo o histórico de conversas?")) {
      setMessages([
        {
          id: "initial-msg-reset",
          sender: "ai",
          text: "Histórico limpo! Como posso te ajudar com o cultivo ou processamento do caju agora?",
          timestamp: new Date()
        }
      ]);
      setError(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="ai-chatbot-root">
      {/* Floating Trigger Button */}
      <motion.button
        id="btn-chatbot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-art-green text-white shadow-lg hover:bg-art-green/95 transition-colors focus:outline-none focus:ring-2 focus:ring-art-orange focus:ring-offset-2 relative cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Conversar com CajuAjudante"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="h-6 w-6" id="icon-chatbot-close" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <MessageSquare className="h-6 w-6" id="icon-chatbot-open" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4" id="badge-chatbot">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-art-orange opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-art-orange text-[9px] font-bold text-white items-center justify-center">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window-panel"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-16 right-0 w-[92vw] sm:w-[400px] h-[550px] max-h-[80vh] flex flex-col rounded-2xl border border-art-border bg-art-bg shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-art-green p-4 text-white" id="chatbot-header">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-art-orange" id="avatar-chatbot-header">
                  <Sparkles className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base leading-tight">CajuAjudante AI</h3>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-art-success animate-pulse" />
                    <span className="text-xs text-white/80 font-medium">Especialista em Cajucultura</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {messages.length > 1 && (
                  <button
                    id="btn-chatbot-clear"
                    onClick={handleClearHistory}
                    className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                    title="Limpar conversa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  id="btn-chatbot-close-header"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chatbot-messages-container">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  id={`chatbot-msg-wrapper-${msg.id}`}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    id={`chatbot-msg-bubble-${msg.id}`}
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-art-green text-white rounded-br-none"
                        : "bg-white dark:bg-art-gray-bg/80 border border-art-gray-border text-art-dark rounded-bl-none"
                    }`}
                  >
                    {msg.sender === "ai" ? (
                      <div className="prose prose-sm text-art-dark max-w-none">
                        <Markdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-xs">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold text-art-green">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-xs">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-xs">{children}</ol>,
                            li: ({ children }) => <li className="mb-0.5 last:mb-0">{children}</li>,
                            h1: ({ children }) => <h4 className="font-serif font-bold text-sm mt-2 mb-1 text-art-green">{children}</h4>,
                            h2: ({ children }) => <h4 className="font-serif font-bold text-sm mt-2 mb-1 text-art-green">{children}</h4>,
                            h3: ({ children }) => <h4 className="font-serif font-bold text-sm mt-2 mb-1 text-art-green">{children}</h4>,
                          }}
                        >
                          {msg.text}
                        </Markdown>
                      </div>
                    ) : (
                      <p className="text-xs whitespace-pre-wrap">{msg.text}</p>
                    )}
                    <span
                      id={`chatbot-msg-time-${msg.id}`}
                      className={`text-[9px] block mt-1.5 text-right ${
                        msg.sender === "user" ? "text-white/60" : "text-art-muted"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Server/Connection Error State */}
              {error && (
                <div className="flex flex-col items-center justify-center p-4 bg-red-50 border border-red-100 rounded-xl space-y-2 text-center text-red-600 animate-fade-in" id="chatbot-error-box">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-xs font-medium">{error}</p>
                  <button
                    id="btn-chatbot-retry"
                    onClick={() => handleSendMessage(messages[messages.length - 1]?.text || "")}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {/* Bot Loading/Typing State */}
              {isLoading && (
                <div className="flex justify-start animate-fade-in" id="chatbot-loading-bubble-wrapper">
                  <div className="bg-white dark:bg-art-gray-bg/80 border border-art-gray-border text-art-dark rounded-2xl rounded-bl-none p-3.5 shadow-sm max-w-[85%] flex items-center space-x-2">
                    <span className="text-xs text-art-muted font-medium flex items-center space-x-1.5">
                      <Sparkles className="h-3.5 w-3.5 animate-spin text-art-orange" />
                      <span>CajuAjudante está elaborando a resposta...</span>
                    </span>
                    <span className="flex space-x-1 items-center">
                      <span className="block h-1.5 w-1.5 rounded-full bg-art-orange animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="block h-1.5 w-1.5 rounded-full bg-art-orange animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="block h-1.5 w-1.5 rounded-full bg-art-orange animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions & Quick Prompts Footer */}
            {messages.length === 1 && !isLoading && (
              <div className="px-4 py-2 border-t border-art-border bg-art-gray-bg/50" id="chatbot-suggestions-section">
                <p className="text-[10px] text-art-muted font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3 text-art-orange" /> Perguntas Frequentes:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.id}
                      id={`btn-chatbot-sug-${sug.id}`}
                      onClick={() => handleSendMessage(sug.text)}
                      className="px-2.5 py-1 text-left text-xs bg-white dark:bg-art-gray-bg/80 border border-art-gray-border rounded-full hover:border-art-orange hover:bg-art-cream text-art-dark hover:text-art-orange transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Action Bar */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-art-border bg-white dark:bg-art-gray-bg flex items-center space-x-2" id="chatbot-input-form">
              <input
                ref={chatInputRef}
                id="chatbot-input-field"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pergunte sobre plantio, pragas, doces, cajuína..."
                className="flex-1 text-xs border border-art-gray-border rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-art-green focus:border-art-green placeholder-art-muted/80 text-art-dark bg-art-bg/20"
                disabled={isLoading}
              />
              <button
                id="btn-chatbot-send-message"
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-art-green text-white shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-art-orange ${
                  isLoading || !inputValue.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-art-green/95 hover:shadow-md cursor-pointer active:scale-95"
                }`}
                title="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
