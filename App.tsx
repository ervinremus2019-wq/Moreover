
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Note, Folder, ChatMessage } from './types';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import AIPanel from './components/AIPanel';
import { geminiService } from './services/geminiService';
import { 
  Plus, 
  Search, 
  Settings, 
  ChevronRight, 
  BrainCircuit, 
  Sparkles,
  Command,
  LayoutGrid,
  List
} from 'lucide-react';

const INITIAL_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Work', color: '#3b82f6' },
  { id: 'f2', name: 'Personal', color: '#10b981' },
  { id: 'f3', name: 'Projects', color: '#f59e0b' },
];

const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: 'Product Roadmap 2025',
    content: '# Product Roadmap 2025\n\n## Goals\n- Launch Gemini integration\n- Improve mobile experience\n- Add real-time collaboration',
    folderId: 'f1',
    tags: ['strategic', 'product'],
    updatedAt: Date.now(),
    isFavorite: true,
    coverImage: 'https://picsum.photos/seed/roadmap/1200/400'
  },
  {
    id: '2',
    title: 'Workout Routine',
    content: '## Daily Routine\n- 50 Pushups\n- 10km Run\n- 15min Stretching',
    folderId: 'f2',
    tags: ['health'],
    updatedAt: Date.now() - 86400000,
    isFavorite: false,
  }
];

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [folders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0].id);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGridView, setIsGridView] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  const createNewNote = useCallback(() => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Note',
      content: '',
      tags: [],
      updatedAt: Date.now(),
      isFavorite: false,
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  }, [activeNoteId]);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        notes={notes}
        folders={folders}
        activeNoteId={activeNoteId}
        setActiveNoteId={setActiveNoteId}
        createNewNote={createNewNote}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        {/* Toolbar */}
        <header className="h-14 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 hover:bg-slate-100 rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
            )}
            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search notes..."
                className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsGridView(!isGridView)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              title={isGridView ? "List View" : "Grid View"}
            >
              {isGridView ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                showAIPanel ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span className="text-sm font-medium">AI Insights</span>
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Note List (if grid view or filtering) */}
          {(!activeNoteId || searchQuery) && (
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">
                {searchQuery ? `Results for "${searchQuery}"` : "All Notes"}
              </h2>
              <div className={isGridView ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                {filteredNotes.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      activeNoteId === note.id ? 'border-indigo-500 bg-indigo-50/30' : 'bg-white border-slate-200'
                    }`}
                  >
                    {note.coverImage && isGridView && (
                      <img src={note.coverImage} className="w-full h-32 object-cover rounded-lg mb-3" alt="Cover" />
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800 line-clamp-1">{note.title}</h3>
                      {note.isFavorite && <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                      {note.content.replace(/[#*`]/g, '').slice(0, 100)}...
                    </p>
                    <div className="flex items-center gap-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md uppercase font-bold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Note Editor */}
          {activeNoteId && !searchQuery && (
            <Editor 
              note={activeNote!} 
              onUpdate={(updates) => updateNote(activeNoteId, updates)}
              onDelete={() => deleteNote(activeNoteId)}
            />
          )}

          {/* AI Panel (Drawer) */}
          <AIPanel 
            isOpen={showAIPanel} 
            activeNote={activeNote}
            onUpdateNote={(updates) => activeNote && updateNote(activeNote.id, updates)}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
