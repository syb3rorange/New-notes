/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  ChevronLeft, 
  MoreVertical, 
  Clock, 
  FileText,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  color: string;
}

const COLORS = [
  'bg-white',
  'bg-amber-50',
  'bg-blue-50',
  'bg-emerald-50',
  'bg-rose-50',
  'bg-purple-50',
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('noteflow_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse notes', e);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('noteflow_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId) || null
  , [notes, activeNoteId]);

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes.sort((a, b) => b.updatedAt - a.updatedAt);
    const query = searchQuery.toLowerCase();
    return notes
      .filter(n => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchQuery]);

  const createNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: '',
      content: '',
      updatedAt: Date.now(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    if (window.confirm('Delete this note?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
      if (activeNoteId === id) setActiveNoteId(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-zinc-200">
      <AnimatePresence mode="wait">
        {!activeNoteId ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-md mx-auto px-4 py-6 pb-24"
          >
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Notes</h1>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSearching(!isSearching)}
                  className="p-2 rounded-full hover:bg-zinc-200 transition-colors text-zinc-600"
                  id="search-toggle"
                >
                  <Search size={22} />
                </button>
              </div>
            </header>

            {/* Search Bar */}
            <AnimatePresence>
              {isSearching && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-100 border-none rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-zinc-300 outline-none transition-all"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes Grid/List */}
            <div className="grid gap-4">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => (
                  <motion.div
                    layoutId={note.id}
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`${note.color} p-5 rounded-3xl border border-zinc-200/50 shadow-sm active:scale-[0.98] transition-transform cursor-pointer group relative`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-zinc-900 line-clamp-1">
                        {note.title || 'Untitled'}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mt-1">
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                    <p className="text-zinc-600 text-sm line-clamp-3 leading-relaxed">
                      {note.content || 'No content yet...'}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                  <FileText size={48} strokeWidth={1} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">
                    {searchQuery ? 'No notes match your search' : 'No notes yet. Tap + to start.'}
                  </p>
                </div>
              )}
            </div>

            {/* Floating Action Button */}
            <button
              onClick={createNote}
              className="fixed bottom-8 right-8 w-16 h-16 bg-zinc-900 text-white rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform z-50"
              id="add-note-btn"
            >
              <Plus size={32} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`fixed inset-0 ${activeNote?.color || 'bg-white'} z-[100] flex flex-col`}
          >
            {/* Editor Header */}
            <header className="flex items-center justify-between px-4 py-4 border-b border-zinc-200/30">
              <button 
                onClick={() => setActiveNoteId(null)}
                className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors text-zinc-600"
                id="back-btn"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="flex items-center gap-1">
                <div className="flex gap-1 mr-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => updateNote(activeNoteId!, { color })}
                      className={`w-6 h-6 rounded-full border border-zinc-200 ${color} ${activeNote?.color === color ? 'ring-2 ring-zinc-400 ring-offset-2' : ''}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => deleteNote(activeNoteId!)}
                  className="p-2 rounded-full hover:bg-rose-100 transition-colors text-rose-500"
                  id="delete-note-btn"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </header>

            {/* Editor Content */}
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <Clock size={14} />
                <span className="text-xs font-medium uppercase tracking-widest">
                  Last edited {new Date(activeNote?.updatedAt || 0).toLocaleString()}
                </span>
              </div>
              
              <input
                type="text"
                placeholder="Title"
                value={activeNote?.title || ''}
                onChange={(e) => updateNote(activeNoteId!, { title: e.target.value })}
                className="text-3xl font-bold bg-transparent border-none outline-none placeholder:text-zinc-300 mb-6 w-full"
              />
              
              <textarea
                autoFocus
                placeholder="Start typing..."
                value={activeNote?.content || ''}
                onChange={(e) => updateNote(activeNoteId!, { content: e.target.value })}
                className="flex-1 bg-transparent border-none outline-none resize-none text-lg leading-relaxed placeholder:text-zinc-300 w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
