
import React from 'react';
import { Note, Folder } from '../types';
import { 
  Folder as FolderIcon, 
  FileText, 
  Star, 
  Trash2, 
  Plus, 
  ChevronLeft,
  Layout,
  Clock,
  Tag
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  createNewNote: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  notes,
  folders,
  activeNoteId,
  setActiveNoteId,
  createNewNote
}) => {
  if (!isOpen) return null;

  const favorites = notes.filter(n => n.isFavorite);

  return (
    <aside className="w-64 border-r bg-white h-full flex flex-col z-30 shadow-lg shrink-0">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic">
            N
          </div>
          <span className="font-bold text-slate-800 tracking-tight">NovaNode</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
        <section>
          <button 
            onClick={createNewNote}
            className="w-full flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 mb-4"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">New Note</span>
          </button>

          <div className="space-y-1">
            <SidebarItem 
              icon={<Layout className="w-4 h-4" />} 
              label="Dashboard" 
              active={!activeNoteId}
              onClick={() => setActiveNoteId(null)}
            />
            <SidebarItem icon={<Clock className="w-4 h-4" />} label="Recent" />
            <SidebarItem icon={<Tag className="w-4 h-4" />} label="Tags" />
          </div>
        </section>

        <section>
          <div className="px-3 mb-2 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Collections</span>
            <Plus className="w-3 h-3 cursor-pointer hover:text-slate-600" />
          </div>
          <div className="space-y-1">
            {folders.map(folder => (
              <SidebarItem 
                key={folder.id}
                icon={<FolderIcon className="w-4 h-4" style={{ color: folder.color }} />} 
                label={folder.name} 
              />
            ))}
          </div>
        </section>

        <section>
          <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Favorites</span>
          </div>
          <div className="space-y-1">
            {favorites.map(note => (
              <SidebarItem 
                key={note.id}
                icon={<Star className="w-4 h-4 text-amber-500 fill-amber-500" />} 
                label={note.title} 
                active={activeNoteId === note.id}
                onClick={() => setActiveNoteId(note.id)}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors">
          <img src="https://picsum.photos/id/64/32/32" className="w-8 h-8 rounded-full border" alt="Profile" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">Alex Rivera</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Pro Workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
      active 
        ? 'bg-indigo-50 text-indigo-700 font-semibold' 
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <span className={`${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {icon}
    </span>
    <span className="truncate">{label}</span>
  </button>
);

export default Sidebar;
