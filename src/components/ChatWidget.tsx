
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ShoppingCart, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  products?: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number | null;
  stock: number;
  image_urls: string[] | null;
  requires_prescription: boolean;
  category: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when first opened
      setMessages([{
        id: 'welcome',
        text: "Hi 👋 I'm HealthCare Assistant. How can I help you today?",
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          userId: user?.id,
          message: inputValue,
          conversationId
        }
      });

      if (error) throw error;

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: data.message,
        isBot: true,
        timestamp: new Date(),
        products: data.products || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      
      const confirmMessage: Message = {
        id: `confirm_${Date.now()}`,
        text: `✅ Added ${product.name} to cart!`,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  console.log('ChatWidget rendering, isOpen:', isOpen);

  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-4 left-4 z-[999999]" 
        style={{ 
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          zIndex: 999999
        }}
      >
        <button
          onClick={() => {
            console.log('Chat button clicked');
            setIsOpen(true);
          }}
          className="w-16 h-16 bg-black hover:bg-gray-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group border-2 border-gray-300"
          aria-label="Open HealthCare Assistant"
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform duration-200" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-pulse border-2 border-black"></div>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-4 left-4 w-80 h-[520px] bg-white rounded-lg shadow-2xl border-2 border-black z-[999999] flex flex-col sm:w-96"
      style={{ 
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        zIndex: 999999
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-black bg-black text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="font-medium">HealthCare Assistant</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs opacity-90">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-lg px-3 py-2 ${
              message.isBot 
                ? 'bg-gray-100 text-black border border-gray-300' 
                : 'bg-black text-white'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              
              {/* Product Cards */}
              {message.products && message.products.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.products.map((product) => (
                    <div key={product.id} className="bg-white border-2 border-black rounded-lg p-3">
                      <div className="flex items-start space-x-3">
                        {product.image_urls && product.image_urls[0] && (
                          <img 
                            src={product.image_urls[0]} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded border border-gray-300"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-black truncate">{product.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-black font-medium">₹{product.price}</span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-xs text-gray-500 line-through">₹{product.mrp}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-1 rounded border ${
                              product.stock > 0 ? 'bg-white text-black border-black' : 'bg-gray-200 text-gray-800 border-gray-400'
                            }`}>
                              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                            {product.requires_prescription && (
                              <span className="text-xs bg-gray-200 text-black px-2 py-1 rounded border border-gray-400">
                                Prescription
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className="w-full mt-2 h-7 text-xs bg-black text-white hover:bg-gray-800 border border-black"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t-2 border-black">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isTyping}
            className="flex-1 text-sm border-2 border-black focus:border-black focus:ring-0"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!inputValue.trim() || isTyping}
            className="px-3 bg-black text-white hover:bg-gray-800 border-2 border-black"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWidget;
