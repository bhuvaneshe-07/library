import React, { useState } from 'react';
import { X, BookOpen, Plus, Tag } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { BookGenre } from '../../types';

interface NewBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENRES: BookGenre[] = [
  'Computer Science & AI',
  'Philosophy & Ethics',
  'Science & Astronomy',
  'Rare Manuscripts & Archives',
  'Classic Literature',
  'History & Archaeology',
  'Psychology & Social Sciences',
];

export const NewBookModal: React.FC<NewBookModalProps> = ({ isOpen, onClose }) => {
  const { addBook } = useLibrary();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('978-0-');
  const [genre, setGenre] = useState<BookGenre>('Computer Science & AI');
  const [callNumber, setCallNumber] = useState('QA 76.87 .');
  const [shelfLocation, setShelfLocation] = useState('Stacks Floor 2 - Bay 4');
  const [totalCopies, setTotalCopies] = useState(3);
  const [publisher, setPublisher] = useState('Academic Press');
  const [year, setYear] = useState(2024);
  const [format, setFormat] = useState('Hardcover');
  const [aiSummary, setAiSummary] = useState('');
  const [tags, setTags] = useState('Algorithms, AI, Reference');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    addBook({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      genre,
      callNumber: callNumber.trim(),
      shelfLocation: shelfLocation.trim(),
      totalCopies,
      availableCopies: totalCopies,
      status: 'available',
      coverImage: coverImage.trim(),
      publisher: publisher.trim(),
      year,
      format,
      aiSummary: aiSummary.trim() || `Core volume in ${genre} cataloged for scholarly reference and course reserve.`,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    // Reset
    setTitle('');
    setAuthor('');
    setAiSummary('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-400" />
            <h3 className="text-base font-black text-white">Catalog New Book Acquisition</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Book Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Learning & Neural Architectures"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Author(s) *</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Ian Goodfellow, Yoshua Bengio"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Genre / Category</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as BookGenre)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Call Number</label>
              <input
                type="text"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                placeholder="QA 76.87"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ISBN-13</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-0-262-03561-3"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Copies</label>
              <input
                type="number"
                min={1}
                max={50}
                value={totalCopies}
                onChange={(e) => setTotalCopies(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Shelf Location</label>
              <input
                type="text"
                value={shelfLocation}
                onChange={(e) => setShelfLocation(e.target.value)}
                placeholder="Level 2 - Bay 4"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Publisher & Year</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="MIT Press"
                  className="w-2/3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                  placeholder="2024"
                  className="w-1/3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Abstract / AI Catalog Summary</label>
            <textarea
              rows={2}
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              placeholder="Key themes, syllabus topics, and reference value..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Deep Learning, Neural Networks, Course Reserve"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all shadow-md shadow-teal-500/20"
            >
              Catalog Volume
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
