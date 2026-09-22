import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  Building2,
  CheckSquare,
  BookmarkCheck,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    books,
    zones,
    tasks,
    bookings,
    setCurrentView,
  } = useLibrary();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedBooks = q
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.callNumber.toLowerCase().includes(q) ||
          b.shelfLocation.toLowerCase().includes(q)
      )
    : books.slice(0, 3);

  const matchedZones = q
    ? zones.filter(
        (z) =>
          z.name.toLowerCase().includes(q) ||
          z.floor.toLowerCase().includes(q) ||
          z.category.toLowerCase().includes(q) ||
          z.code.toLowerCase().includes(q)
      )
    : zones.slice(0, 2);

  const matchedTasks = q
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    : tasks.slice(0, 2);

  const matchedBookings = q
    ? bookings.filter(
        (b) =>
          b.patronName.toLowerCase().includes(q) ||
          b.bookingCode.toLowerCase().includes(q) ||
          b.itemTitle.toLowerCase().includes(q) ||
          b.patronCardId.toLowerCase().includes(q)
      )
    : bookings.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="global-search-modal"
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-teal-400 shrink-0" />
          <input
            ref={inputRef}
            id="input-global-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search catalog titles, ISBN, zones, operational tasks, loans..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-[10px] font-medium text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5 divide-y divide-slate-800/40">
          {query.trim() && (
            <div
              onClick={() => {
                setCurrentView('catalog');
                setIsSearchOpen(false);
              }}
              className="p-3 rounded-xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 to-slate-900 hover:from-teal-950/70 hover:to-slate-800 cursor-pointer flex items-center justify-between text-xs text-teal-200 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-teal-500/20 p-1.5 border border-teal-500/30">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                </div>
                <div>
                  <p className="font-bold text-teal-300">
                    Search with BiblioAI Natural Language Assistant
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Find records semantically matching "{query}"
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-teal-400">
                <span>Open in Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          )}

          {/* Catalog Books */}
          {matchedBooks.length > 0 && (
            <div>
              <div className="flex items-center justify-between pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-teal-400" />
                  Catalog & Books ({matchedBooks.length})
                </span>
                <span className="text-[10px] text-slate-500">Call Number</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {matchedBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      setCurrentView('catalog');
                      setIsSearchOpen(false);
                    }}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/70 border border-slate-800/60 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="h-9 w-7 object-cover rounded shadow"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition-colors line-clamp-1">
                          {book.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {book.author} • <span className="text-teal-400">{book.shelfLocation}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {book.callNumber}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zones */}
          {matchedZones.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center justify-between pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  Library Zones & Facilities ({matchedZones.length})
                </span>
                <span className="text-[10px] text-slate-500">Occupancy</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {matchedZones.map((zone) => (
                  <div
                    key={zone.id}
                    onClick={() => {
                      setCurrentView('places');
                      setIsSearchOpen(false);
                    }}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/70 border border-slate-800/60 cursor-pointer transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition-colors">
                        {zone.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {zone.floor} • {zone.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-300">
                        {zone.currentOccupants}/{zone.capacity}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {matchedTasks.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center justify-between pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-purple-400" />
                  Operational Tasks ({matchedTasks.length})
                </span>
                <span className="text-[10px] text-slate-500">Priority</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {matchedTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setCurrentView('tasks');
                      setIsSearchOpen(false);
                    }}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/70 border border-slate-800/60 cursor-pointer transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition-colors line-clamp-1">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {t.department} • Due {t.dueDate}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        t.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loans & Bookings */}
          {matchedBookings.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center justify-between pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookmarkCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Loans & Holds ({matchedBookings.length})
                </span>
                <span className="text-[10px] text-slate-500">Status</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {matchedBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setCurrentView('bookings');
                      setIsSearchOpen(false);
                    }}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800/70 border border-slate-800/60 cursor-pointer transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-teal-400 transition-colors line-clamp-1">
                        {b.itemTitle}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Patron: {b.patronName} ({b.patronCardId})
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-teal-400 uppercase">
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/90 px-4 py-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Search across Library OPAC, Stacks, Bookings, and Operations</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
