import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Tag,
  Bookmark,
  Building,
  Layers,
  Calendar,
  User,
  ArrowUpDown,
  BookMarked,
  X,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, BookGenre, BookStatus } from '../../types';

interface CatalogViewProps {
  onOpenNewBookModal: () => void;
}

const GENRES: Array<BookGenre | 'All'> = [
  'All',
  'Computer Science & AI',
  'Philosophy & Ethics',
  'Science & Astronomy',
  'Rare Manuscripts & Archives',
  'Classic Literature',
  'History & Archaeology',
  'Psychology & Social Sciences',
];

export const CatalogView: React.FC<CatalogViewProps> = ({ onOpenNewBookModal }) => {
  const { books, borrowBook, returnBook, triggerAIChatWithPrompt } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<BookGenre | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | 'all'>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Checkout modal states
  const [checkoutModalBook, setCheckoutModalBook] = useState<Book | null>(null);
  const [patronName, setPatronName] = useState('');
  const [patronCardId, setPatronCardId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.callNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'All' || b.genre === selectedGenre;
    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;

    return matchesSearch && matchesGenre && matchesStatus;
  });

  const handleExecuteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutModalBook || !patronName.trim() || !patronCardId.trim()) return;

    borrowBook(checkoutModalBook.id, patronName.trim(), patronCardId.trim(), dueDate);
    setCheckoutModalBook(null);
    setPatronName('');
    setPatronCardId('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Catalog & Collections (OPAC)
            </h1>
            <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-[11px] font-bold text-teal-400">
              {books.length} Titles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global discovery index with real-time stack coordinates, RFID tracking, and instant loan checkout.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => triggerAIChatWithPrompt('Review active course reserve holdings and suggest new acquisitions for AI research')}
            className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>AI Collection Advisor</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewBookModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all shadow-md shadow-teal-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Catalog Record</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, Dewey / LC call number, shelf location, or tag..."
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 focus:border-teal-500 focus:outline-none"
            >
              <option value="all">All Availability</option>
              <option value="available">Available on Shelf</option>
              <option value="low_stock">Low Stock (≤2)</option>
              <option value="checked_out">All Copies Checked Out</option>
            </select>
          </div>
        </div>

        {/* Genre Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {GENRES.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGenre === genre
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No books matched your criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search query or genre filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <div
                key={book.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  {/* Book Cover Image */}
                  <div className="h-44 w-full relative bg-slate-950 overflow-hidden">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold border backdrop-blur-md ${
                          book.status === 'available'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : book.status === 'low_stock'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {book.status === 'available'
                          ? `${book.availableCopies} Available`
                          : book.status === 'low_stock'
                          ? `Only ${book.availableCopies} Left`
                          : 'Checked Out'}
                      </span>
                    </div>

                    {/* Genre tag */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                        {book.genre}
                      </span>
                      <span className="text-[10px] text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
                        {book.year}
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-teal-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{book.author}</p>

                    {/* Shelf and Call Number */}
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 font-mono">Call #</span>
                        <span className="font-mono font-semibold text-teal-400">{book.callNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-slate-500">Location</span>
                        <span className="truncate max-w-[170px]">{book.shelfLocation}</span>
                      </div>
                    </div>

                    {/* AI Summary snippet */}
                    {book.aiSummary && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 italic pt-1">
                        "{book.aiSummary}"
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      {book.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-0 border-t border-slate-800/60 mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBook(book)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 py-2 text-xs font-semibold text-slate-200 transition-colors text-center"
                  >
                    View Details
                  </button>

                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => setCheckoutModalBook(book)}
                      className="flex-1 rounded-xl bg-teal-500 hover:bg-teal-400 py-2 text-xs font-bold text-slate-950 transition-colors text-center shadow-sm"
                    >
                      Check Out
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => returnBook(book.id)}
                      className="flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 py-2 text-xs font-bold text-rose-300 transition-colors text-center"
                    >
                      Return Copy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Detail Drawer Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex gap-4 items-start">
              <img
                src={selectedBook.coverImage}
                alt={selectedBook.title}
                className="w-28 h-40 object-cover rounded-xl border border-slate-700 shadow-md shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1">
                <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-400">
                  {selectedBook.genre}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1.5">{selectedBook.title}</h2>
                <p className="text-xs text-slate-300">{selectedBook.author}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Published by {selectedBook.publisher} ({selectedBook.year}) • {selectedBook.format}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      selectedBook.availableCopies > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {selectedBook.availableCopies} of {selectedBook.totalCopies} Available
                  </span>
                </div>
              </div>
            </div>

            {/* Catalog Data Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-slate-500 text-[11px]">Library Call Number</p>
                <p className="text-teal-400 font-mono font-bold mt-0.5">{selectedBook.callNumber}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Shelf Location</p>
                <p className="text-slate-200 font-medium mt-0.5">{selectedBook.shelfLocation}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">ISBN-13</p>
                <p className="text-slate-300 font-mono mt-0.5">{selectedBook.isbn}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Format & Binding</p>
                <p className="text-slate-300 font-medium mt-0.5">{selectedBook.format}</p>
              </div>
            </div>

            {/* BiblioAI Syllabus & Content Analysis */}
            <div className="mt-4 rounded-xl border border-teal-500/30 bg-teal-950/20 p-4">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-bold mb-1">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span>BiblioAI Catalog Annotation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedBook.aiSummary || 'Standard academic monograph in high circulation for graduate coursework.'}
              </p>
            </div>

            {/* Tags */}
            <div className="mt-4 flex items-center gap-1.5 flex-wrap">
              {selectedBook.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300 border border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>

              {selectedBook.availableCopies > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutModalBook(selectedBook);
                    setSelectedBook(null);
                  }}
                  className="rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-sm"
                >
                  Check Out to Patron
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    returnBook(selectedBook.id);
                    setSelectedBook(null);
                  }}
                  className="rounded-xl bg-rose-500 hover:bg-rose-400 px-4 py-2 text-xs font-bold text-white transition-colors"
                >
                  Process Return
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instant Checkout to Patron Modal */}
      {checkoutModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setCheckoutModalBook(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <BookMarked className="h-5 w-5 text-teal-400" />
              <h2 className="text-base font-bold text-white">Circulation Checkout Desk</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Loan record for <span className="text-teal-400 font-semibold">{checkoutModalBook.title}</span>
            </p>

            <form onSubmit={handleExecuteCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Patron Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sophia Sterling"
                  value={patronName}
                  onChange={(e) => setPatronName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Patron Library Card / ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LIB-99321 or FAC-10042"
                  value={patronCardId}
                  onChange={(e) => setPatronCardId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Return Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutModalBook(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-sm"
                >
                  Issue Loan Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
