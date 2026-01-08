
import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { 
  Star, 
  Trash2, 
  Image as ImageIcon, 
  Type as TypeIcon,
  Smile,
  Maximize2,
  Calendar,
  Tag,
  Save,
  Wand2,
  BrainCircuit
} from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface EditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
}

const Editor: React.FC<EditorProps> = ({ note, onUpdate, onDelete }) => {
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  // Sync state when note changes
  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
  }, [note.id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate({ content: newContent });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate({ title: newTitle });
  };

  const generateAITitle = async () => {
    if (!content.trim()) return;
    setIsGeneratingTitle(true);
    try {
      const newTitle = await geminiService.generateTitle(content);
      setTitle(newTitle);
      onUpdate({ title: newTitle });
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const generateAICover = async () => {
    setIsGeneratingCover(true);
    try {
      const imgUrl = await geminiService.generateImageForNote(title);
      if (imgUrl) onUpdate({ coverImage: imgUrl });
    } finally {
      setIsGeneratingCover(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Cover Image */}
      <div className="relative group h-48 md:h-64 overflow-hidden bg-slate-100">
        {note.coverImage ? (
          <img src={note.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
          <button 
            onClick={generateAICover}
            disabled={isGeneratingCover}
            className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold text-slate-700 hover:bg-white transition-colors"
          >
            <Sparkles className={`w-4 h-4 text-indigo-500 ${isGeneratingCover ? 'animate-spin' : ''}`} />
            {isGeneratingCover ? 'Generating...' : 'Regenerate Cover'}
          </button>
        </div>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-10 md:px-20 lg:px-40">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 group">
              <input 
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Untitled Note"
                className="w-full text-4xl md:text-5xl font-extrabold text-slate-800 bg-transparent border-none outline-none placeholder:text-slate-200 transition-all focus:placeholder:text-slate-300"
              />
              <button 
                onClick={generateAITitle}
                disabled={isGeneratingTitle}
                className="mt-2 text-xs font-bold text-indigo-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <BrainCircuit className={`w-3 h-3 ${isGeneratingTitle ? 'animate-pulse' : ''}`} />
                {isGeneratingTitle ? 'Thinking...' : 'AI Suggest Title'}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button 
                onClick={() => onUpdate({ isFavorite: !note.isFavorite })}
                className={`p-2 rounded-lg transition-colors ${note.isFavorite ? 'bg-amber-50 text-amber-500' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                <Star className={`w-5 h-5 ${note.isFavorite ? 'fill-amber-500' : ''}`} />
              </button>
              <button 
                onClick={onDelete}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 border-b pb-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Last edited {new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              <div className="flex gap-1">
                {note.tags.length > 0 ? note.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] uppercase font-bold text-slate-500">#{t}</span>
                )) : <span>No tags</span>}
              </div>
            </div>
          </div>

          <textarea 
            value={content}
            onChange={handleContentChange}
            placeholder="Start writing or use AI to brainstrom..."
            className="w-full h-[500px] text-lg leading-relaxed text-slate-700 bg-transparent border-none outline-none resize-none placeholder:text-slate-200"
          />
        </div>
      </div>

      {/* Formatting Bubble (Simulated) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-lg border shadow-2xl rounded-2xl px-4 py-2 flex items-center gap-4 z-10 transition-transform hover:scale-105 active:scale-95">
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><TypeIcon className="w-4 h-4" /></button>
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors font-bold text-sm">B</button>
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors italic text-sm">I</button>
        <div className="w-px h-6 bg-slate-200" />
        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"><Smile className="w-4 h-4" /></button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-md transition-all">
          <BrainCircuit className="w-3 h-3" />
          AI Transform
        </button>
      </div>
    </div>
  );
};

export default Editor;

const Sparkles: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
  </svg>
);
