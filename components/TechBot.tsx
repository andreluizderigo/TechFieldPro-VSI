
import React, { useState, useRef, useEffect } from 'react';
import { Send, Cpu, Bot, Sparkles, Loader2, X, Maximize2, Minimize2 } from 'lucide-react';
import { askTechAssistant } from '../services/geminiService';

const TechBot: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const response = await askTechAssistant(userMsg);
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Houve um problema ao consultar a base técnica. Verifique sua conexão." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-700 transition-all duration-500 ${isExpanded ? 'h-[500px]' : 'h-auto'}`}>
      {/* Header do Bot */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-[#D1101E] rounded-xl shadow-lg shadow-red-900/40">
              <Bot className="text-white" size={24} />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
              VSI TECHBOT <Sparkles size={12} className="text-yellow-400" />
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Especialista de Campo</p>
          </div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      {/* Area de Mensagens */}
      {isExpanded ? (
        <div className="flex flex-col h-[436px]">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4">
                <Cpu size={40} className="text-slate-700" strokeWidth={1} />
                <div>
                    <p className="text-white font-black text-xs uppercase tracking-widest mb-1">Base Técnica Pronta</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Dúvidas sobre **Intelbras**, **Hikvision**, **Redes IP** ou **Sistemas VRF**?
                        Pergunte ao TechBot agora.
                    </p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-[#D1101E] text-white rounded-tr-none' 
                  : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-800 flex items-center gap-2">
                  <Loader2 className="animate-spin text-[#D1101E]" size={14} />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Consultando manuais...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5 bg-slate-900/50">
            <div className="relative">
              <input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ex: Como configurar P2P no NVR Intelbras?"
                className="w-full bg-slate-800 border-none rounded-2xl py-4 pl-5 pr-14 text-white text-xs font-medium outline-none placeholder:text-slate-600 focus:ring-1 ring-[#D1101E]/50 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#D1101E] text-white rounded-xl active:scale-90 transition-transform disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 flex items-center gap-4">
            <div className="flex-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Dúvida rápida em campo?</p>
                <p className="text-xs text-white/60 line-clamp-1 italic">Pergunte sobre CFTV, Redes, Alarmes ou Refrigeração...</p>
            </div>
            <button 
                onClick={() => setIsExpanded(true)}
                className="px-5 py-3 bg-[#D1101E] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-95 transition-all"
            >
                ABRIR ASSISTENTE
            </button>
        </div>
      )}
    </div>
  );
};

export default TechBot;
