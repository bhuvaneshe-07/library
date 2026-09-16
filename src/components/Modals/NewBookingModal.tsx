import React, { useState } from 'react';
import { X, Calendar, BookmarkCheck, BookOpen, Building2 } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { BookingType } from '../../types';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({ isOpen, onClose }) => {
  const { addBooking, books, zones } = useLibrary();

  const [bookingType, setBookingType] = useState<BookingType>('book_loan');
  const [patronName, setPatronName] = useState('');
  const [patronCardId, setPatronCardId] = useState('');
  const [patronEmail, setPatronEmail] = useState('');

  // Book loan fields
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || '');

  // Facility fields
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id || '');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [partySize, setPartySize] = useState(1);

  // Common dates
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patronName.trim() || !patronCardId.trim()) return;

    if (bookingType === 'book_loan') {
      const b = books.find((x) => x.id === selectedBookId) || books[0];
      addBooking({
        patronName: patronName.trim(),
        patronCardId: patronCardId.trim(),
        patronEmail: patronEmail.trim() || undefined,
        type: 'book_loan',
        itemId: b.id,
        itemTitle: b.title,
        category: b.genre,
        startDate,
        dueDate,
        status: 'active',
        notes: notes.trim() || 'Standard circulation loan pass',
      });
    } else {
      const z = zones.find((x) => x.id === selectedZoneId) || zones[0];
      addBooking({
        patronName: patronName.trim(),
        patronCardId: patronCardId.trim(),
        patronEmail: patronEmail.trim() || undefined,
        type: 'study_pod',
        itemId: z.id,
        itemTitle: `${z.name} - Study Pod`,
        category: z.category,
        startDate,
        dueDate: startDate,
        timeSlot,
        partySize,
        status: 'confirmed',
        notes: notes.trim() || 'Study pod reservation session',
      });
    }

    // Reset
    setPatronName('');
    setPatronCardId('');
    setPatronEmail('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5 text-teal-400" />
            <h3 className="text-base font-black text-white">Create Loan or Hold Pass</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toggle Type */}
        <div className="mt-4 flex rounded-xl border border-slate-800 bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => setBookingType('book_loan')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              bookingType === 'book_loan'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Book Loan</span>
          </button>
          <button
            type="button"
            onClick={() => setBookingType('study_pod')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              bookingType === 'study_pod'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Study Pod Hold</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Patron Full Name *</label>
            <input
              type="text"
              required
              value={patronName}
              onChange={(e) => setPatronName(e.target.value)}
              placeholder="e.g. Dr. Maya Lin"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Library Card / ID *</label>
              <input
                type="text"
                required
                value={patronCardId}
                onChange={(e) => setPatronCardId(e.target.value)}
                placeholder="e.g. FAC-20914"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Patron Email</label>
              <input
                type="email"
                value={patronEmail}
                onChange={(e) => setPatronEmail(e.target.value)}
                placeholder="maya@university.edu"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {bookingType === 'book_loan' ? (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catalog Item to Loan *</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.availableCopies} left) - {b.callNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Scheduled Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Facility Zone / Pod *</label>
                <select
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.floor}) - {z.bookableRooms} rooms
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reservation Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM</option>
                    <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Special Notes / Research Project</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Master's thesis literature review, course reserve loan pass..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
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
              Issue Circulation Pass
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
