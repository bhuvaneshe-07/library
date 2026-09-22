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
  Loader2,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Book, BookGenre, BookStatus, AISearchResponse, AISearchResultItem } from '../../types';

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

const SUGGESTED_AI_QUERIES = [
  'Introductory computer science books available now',
  'Ancient philosophy and classical ethics',
  'Astrophysics and cosmos exploration',
  'Rare medieval manuscripts in archival vault',
  'Novels exploring human psychology',
];

export const CatalogView: React.FC<CatalogViewProps> = ({ onOpenNewBookModal }) => {
  const { books, borrowBook, returnBook, triggerAIChatWithPrompt } = useLibrary();

  // Search mode: standard keyword vs AI natural language
  const [searchMode, setSearchMode] = useState<'keyword' | 'ai'>('keyword');

  // Keyword search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<BookGenre | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | 'all'>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // AI search states
  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState<string | null>(null);
  const [aiSearchResult, setAiSearchResult] = useState<AISearchResponse | null>(null);

  // Checkout modal states
  const [checkoutModalBook, setCheckoutModalBook] = useState<Book | null>(null);
  const [patronName, setPatronName] = useState('');
  const [patronCardId, setPatronCardId] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });

  // Execute AI Natural Language Search
  const handleExecuteAiSearch = async (queryToRun?: string) => {
    const targetQuery = (queryToRun !== undefined ? queryToRun : aiQuery).trim();
    if (!targetQuery) return;
    if (queryToRun !== undefined) {
      setAiQuery(queryToRun);
    }

    setIsAiSearching(true);
    setAiSearchError(null);

    try {
      const res = await fetch('/api/ai/search-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: targetQuery,
          books,
          target: 'books',
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data: AISearchResponse = await res.json();
      setAiSearchResult(data);
    } catch (err: any) {
      console.error('AI search failed:', err);
      setAiSearchError('Semantic discovery service is momentarily unavailable. Falling back to keyword search.');
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleResetAiSearch = () => {
    setAiSearchResult(null);
    setAiQuery('');
    setAiSearchError(null);
  };

  // Determine displayed books based on active search mode
  const displayedBooks = React.useMemo(() => {
    // AI Mode with active search result
    if (searchMode === 'ai' && aiSearchResult && aiSearchResult.matchedBookIds.length > 0) {
      const scoreMap = new Map<string, AISearchResultItem>(
        aiSearchResult.matchedBookIds.map((item) => [item.id, item])
      );

      return books
        .filter((b) => {
          const isMatched = scoreMap.has(b.id);
          const matchesGenre = selectedGenre === 'All' || b.genre === selectedGenre;
          const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;
          return isMatched && matchesGenre && matchesStatus;
        })
        .sort((a, b) => {
          const scoreA = scoreMap.get(a.id)?.relevanceScore || 0;
          const scoreB = scoreMap.get(b.id)?.relevanceScore || 0;
          return scoreB - scoreA;
        });
    }

    // Default Keyword Search Mode (or AI mode with no query submitted yet)
    return books.filter((b) => {
      const matchesSearch =
        !searchQuery.trim() ||
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
  }, [books, searchMode, aiSearchResult, searchQuery, selectedGenre, selectedStatus]);

  const handleExecuteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutModalBook || !patronName.trim() || !patronCardId.trim()) return;

    borrowBook(checkoutModalBook.id, patronName.trim(), patronCardId.trim(), dueDate);
    setCheckoutModalBook(null);
    setPatronName('');
    setPatronCardId('');
  };

  // Helper to get AI match info for a book
  const getAiMatchForBook = (bookId: string): AISearchResultItem | undefined => {
    if (searchMode !== 'ai' || !aiSearchResult) return undefined;
    return aiSearchResult.matchedBookIds.find((m) => m.id === bookId);
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
            Global discovery index with real-time stack coordinates, RFID tracking, and AI natural language search.
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg space-y-3.5">
        {/* Search Mode Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="tab-keyword-search"
              onClick={() => setSearchMode('keyword')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                searchMode === 'keyword'
                  ? 'bg-slate-800 text-teal-400 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Standard Keyword Search</span>
            </button>

            <button
              type="button"
              id="tab-ai-search"
              onClick={() => setSearchMode('ai')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                searchMode === 'ai'
                  ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border border-teal-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-teal-300 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
              <span>AI Natural Language Search</span>
              <span className="rounded-full bg-teal-500/20 px-1.5 py-0.2 text-[9px] font-mono text-teal-300">
                Gemini 3.8
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
            <span>Showing {displayedBooks.length} records</span>
          </div>
        </div>

        {/* Dynamic Search Controls based on Mode */}
        {searchMode === 'keyword' ? (
          /* Standard Keyword Search Input */
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="input-catalog-keyword-search"
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
                id="select-catalog-availability-keyword"
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
        ) : (
          /* AI Natural Language Record Search Input & Assistant */
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row gap-2.5">
              <div className="relative flex-1">
                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400" />
                <input
                  id="input-catalog-ai-search"
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleExecuteAiSearch();
                    }
                  }}
                  placeholder="Ask in plain language, e.g. 'Introductory textbooks on artificial intelligence with copies available right now'..."
                  className="w-full rounded-xl border border-teal-500/40 bg-slate-950/90 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-inner"
                />
                {aiQuery && (
                  <button
                    type="button"
                    onClick={() => setAiQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-execute-ai-search"
                  disabled={isAiSearching || !aiQuery.trim()}
                  onClick={() => handleExecuteAiSearch()}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-teal-500/20 shrink-0"
                >
                  {isAiSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing Intent...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Search with AI</span>
                    </>
                  )}
                </button>

                {aiSearchResult && (
                  <button
                    type="button"
                    onClick={handleResetAiSearch}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
                    title="Reset to full catalog"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Suggested Sample Queries */}
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Compass className="h-3 w-3 text-teal-400" />
                Suggested Research Prompts:
              </span>
              {(aiSearchResult?.suggestedQueryPills || SUGGESTED_AI_QUERIES).slice(0, 4).map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => handleExecuteAiSearch(promptText)}
                  className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-teal-500/40 hover:text-teal-300 hover:bg-slate-800/80 transition-all text-left"
                >
                  "{promptText}"
                </button>
              ))}
            </div>

            {/* Error Message */}
            {aiSearchError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{aiSearchError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleExecuteAiSearch()}
                  className="text-xs font-bold underline hover:text-rose-200"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Active AI Search Result Insights Banner */}
            {aiSearchResult && !isAiSearching && (
              <div className="rounded-xl border border-teal-500/30 bg-teal-950/30 p-3.5 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-teal-500/20 border border-teal-500/40 px-2.5 py-0.5 text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" />
                      AI Query Interpretation
                    </span>
                    <span className="text-xs font-bold text-white">
                      {aiSearchResult.interpretedQuery}
                    </span>
                  </div>
                  <span className="text-[11px] text-teal-400 font-semibold">
                    {displayedBooks.length} Semantic Match{displayedBooks.length === 1 ? '' : 'es'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiSearchResult.aiSummary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Genre Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider pr-1">
            Genre:
          </span>
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
      {displayedBooks.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">
            {searchMode === 'ai' && aiSearchResult
              ? `No catalog records met high semantic relevance for "${aiQuery}"`
              : 'No books matched your criteria'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {searchMode === 'ai'
              ? 'Try asking for broader topics (e.g., "science", "programming", "ancient history") or check suggested queries.'
              : 'Try broadening your search query or genre filter.'}
          </p>
          {searchMode === 'ai' && (
            <button
              type="button"
              onClick={handleResetAiSearch}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 px-3.5 py-2 text-xs font-bold text-teal-300 hover:bg-teal-500/30 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to View All Catalog Books</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            const aiMatch = getAiMatchForBook(book.id);

            return (
              <div
                key={book.id}
                className={`rounded-2xl border bg-slate-900/90 overflow-hidden transition-all flex flex-col justify-between group shadow-lg ${
                  aiMatch
                    ? 'border-teal-500/40 hover:border-teal-400 shadow-teal-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
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

                    {/* AI Relevance Badge */}
                    {aiMatch && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow-md">
                          <Sparkles className="h-3 w-3" />
                          {aiMatch.relevanceScore}% Match
                        </span>
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
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
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                        {book.genre}
                      </span>
                      <span className="text-[10px] text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded">
                        {book.year}
                      </span>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-teal-400 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{book.author}</p>
                    </div>

                    {/* AI Match Rationale Callout when in AI mode */}
                    {aiMatch && aiMatch.matchReason && (
                      <div className="rounded-xl border border-teal-500/30 bg-teal-950/40 p-2 text-[11px] text-teal-200">
                        <div className="flex items-center gap-1 font-bold text-teal-400 mb-0.5">
                          <Sparkles className="h-3 w-3" />
                          <span>AI Match Rationale</span>
                        </div>
                        <p className="line-clamp-2 leading-relaxed">{aiMatch.matchReason}</p>
                      </div>
                    )}

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
                    {book.aiSummary && !aiMatch && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 italic pt-1">
                        "{book.aiSummary}"
                      </p>
                    )}

                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
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
                referrerPolicy="no-referrer"
                className="w-28 h-40 object-cover rounded-xl shadow-md border border-slate-800 shrink-0"
              />
              <div className="space-y-1.5 flex-1">
                <span className="rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold px-2 py-0.5 border border-teal-500/30">
                  {selectedBook.genre}
                </span>
                <h2 className="text-lg font-black text-white leading-tight">{selectedBook.title}</h2>
                <p className="text-xs text-slate-400">By {selectedBook.author}</p>
                <p className="text-xs text-slate-400">
                  Published {selectedBook.year} • {selectedBook.publisher}
                </p>

                <div className="pt-2 flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      selectedBook.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : selectedBook.status === 'low_stock'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {selectedBook.availableCopies} of {selectedBook.totalCopies} Copies In Library
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-slate-800 pt-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Catalog Abstract & Content</h4>
                <p className="text-slate-400 leading-relaxed">{selectedBook.aiSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block text-[10px]">Call Classification</span>
                  <span className="font-mono font-bold text-teal-400">{selectedBook.callNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Standard ISBN-13</span>
                  <span className="font-mono text-slate-300">{selectedBook.isbn}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Physical Shelf Location</span>
                  <span className="text-slate-300 font-semibold">{selectedBook.shelfLocation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Format Specification</span>
                  <span className="text-slate-300">{selectedBook.format}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-1.5">Bibliographic Index Tags</h4>
                <div className="flex gap-1.5 flex-wrap">
                  {selectedBook.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-teal-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
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
                  className="rounded-xl bg-teal-500 hover:bg-teal-400 px-5 py-2 text-xs font-bold text-slate-950 transition-colors shadow-md"
                >
                  Proceed to Check Out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    returnBook(selectedBook.id);
                    setSelectedBook(null);
                  }}
                  className="rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 px-5 py-2 text-xs font-bold transition-colors"
                >
                  Return Copy to Stacks
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Check Out Book to Patron */}
      {checkoutModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-teal-400" />
                Issue Circulation Loan
              </h3>
              <button
                type="button"
                onClick={() => setCheckoutModalBook(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteCheckout} className="space-y-4 pt-4">
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex gap-3">
                <img
                  src={checkoutModalBook.coverImage}
                  alt={checkoutModalBook.title}
                  className="w-12 h-16 object-cover rounded shadow"
                />
                <div>
                  <p className="text-xs font-bold text-white line-clamp-1">
                    {checkoutModalBook.title}
                  </p>
                  <p className="text-[11px] text-slate-400">{checkoutModalBook.author}</p>
                  <p className="text-[10px] text-teal-400 font-mono mt-1">
                    {checkoutModalBook.callNumber} • {checkoutModalBook.shelfLocation}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Patron Full Name
                </label>
                <input
                  type="text"
                  required
                  value={patronName}
                  onChange={(e) => setPatronName(e.target.value)}
                  placeholder="e.g., Prof. Catherine Vance"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Patron Card / University ID
                </label>
                <input
                  type="text"
                  required
                  value={patronCardId}
                  onChange={(e) => setPatronCardId(e.target.value)}
                  placeholder="e.g., ATH-8824"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Scheduled Return Due Date
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCheckoutModalBook(null)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-500 hover:bg-teal-400 px-5 py-2 text-xs font-bold text-slate-950 shadow-md"
                >
                  Confirm & Issue Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

