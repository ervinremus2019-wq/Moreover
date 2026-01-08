
import React, { useState, useEffect, useRef } from 'react';
import { Note, ChatMessage, SearchResult } from '../types';
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  FileText, 
  CheckSquare, 
  Search, 
  ArrowUpRight,
  Mic,
  MicOff,
  History,
  Activity
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface AIPanelProps {
  isOpen: boolean;
  activeNote: Note | null;
  onUpdateNote: (updates: Partial<Note>) => void;
}

const AIPanel: React.FC<AIPanelProps> = ({ isOpen, activeNote, onUpdateNote }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sources, setSources] = useState<SearchResult[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAction = async (action: 'summarize' | 'actions' | 'search') => {
    if (!activeNote || !activeNote.content.trim() && action !== 'search') return;
    setIsProcessing(true);
    
    try {
      if (action === 'summarize') {
        const summary = await geminiService.summarizeNote(activeNote.content);
        addMessage('assistant', `**Note Summary:**\n\n${summary}`);
      } else if (action === 'actions') {
        const items = await geminiService.extractActionItems(activeNote.content);
        if (items.length > 0) {
          addMessage('assistant', `**Extracted Action Items:**\n\n${items.map(i => `- [ ] ${i}`).join('\n')}`);
        } else {
          addMessage('assistant', "No clear action items found in this note.");
        }
      } else if (action === 'search') {
        if (!inputText.trim()) {
          addMessage('assistant', "Please provide a query in the chat box to search the web.");
          return;
        }
        const { text, sources: newSources } = await geminiService.searchGrounding(inputText);
        addMessage('assistant', text);
        setSources(newSources);
        setInputText('');
      }
    } catch (error) {
      addMessage('assistant', "I encountered an error processing that request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const addMessage = (role: 'user' | 'assistant', text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      role,
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    const query = inputText;
    setInputText('');
    addMessage('user', query);
    setIsProcessing(true);

    try {
      // Logic for general chat with context of active note
      const { text } = await geminiService.searchGrounding(`Context about this note: ${activeNote?.content || ''}\n\nUser Question: ${query}`);
      addMessage('assistant', text);
    } catch (error) {
      addMessage('assistant', "Sorry, I couldn't process your question.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-96 border-l bg-slate-50 h-full flex flex-col z-30 shadow-2xl relative animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          <span className="font-bold text-slate-800">Nova Intelligence</span>
        </div>
        <button className="p-1 hover:bg-slate-100 rounded-md text-slate-400">
          <Activity className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 flex gap-2 border-b bg-white overflow-x-auto no-scrollbar">
        <ActionButton 
          icon={<FileText className="w-3.5 h-3.5" />} 
          label="Summarize" 
          onClick={() => handleAction('summarize')}
          disabled={isProcessing}
        />
        <ActionButton 
          icon={<CheckSquare className="w-3.5 h-3.5" />} 
          label="Todo List" 
          onClick={() => handleAction('actions')}
          disabled={isProcessing}
        />
        <ActionButton 
          icon={<Search className="w-3.5 h-3.5" />} 
          label="Deep Search" 
          onClick={() => handleAction('search')}
          disabled={isProcessing}
        />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800">Ready to Assist</h4>
              <p className="text-xs text-slate-500 mt-2">
                Ask me about this note, generate tasks, or search the web for missing information.
              </p>
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white border text-slate-700 shadow-sm'
            }`}>
              {m.text.split('\n').map((line, i) => (
                <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-1'}>{line}</p>
              ))}
              <p className={`text-[9px] mt-1 ${m.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white border p-3 rounded-2xl flex items-center gap-2 shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nova Thinking</span>
            </div>
          </div>
        )}

        {sources.length > 0 && (
          <div className="space-y-2 mt-4">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Citations</h5>
            <div className="grid grid-cols-1 gap-2">
              {sources.map((s, i) => (
                <a 
                  key={i} 
                  href={s.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 bg-white border rounded-lg text-[11px] hover:border-indigo-300 transition-colors"
                >
                  <span className="truncate flex-1 pr-2 font-medium text-slate-600">{s.title}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-300 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <div className="relative">
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask Nova..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all h-24"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button 
              onClick={() => setIsRecording(!isRecording)}
              className={`p-1.5 rounded-lg transition-colors ${isRecording ? 'bg-red-50 text-red-500' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleSend}
              disabled={!inputText.trim() || isProcessing}
              className={`p-1.5 rounded-lg transition-all ${
                inputText.trim() && !isProcessing ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Powered by Gemini 3 Pro
        </p>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, disabled?: boolean }> = ({ icon, label, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 text-slate-600 rounded-full text-xs font-semibold transition-all shrink-0 active:scale-95 disabled:opacity-50"
  >
    {icon}
    {label}
  </button>
);

export default AIPanel;
