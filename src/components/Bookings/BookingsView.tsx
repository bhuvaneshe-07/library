import React, { useState } from 'react';
import {
  BookmarkCheck,
  Plus,
  Search,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Sparkles,
  Mail,
  Filter,
  BookOpen,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Booking, BookingStatus, BookingType } from '../../types';

interface BookingsViewProps {
  onOpenNewBookingModal: () => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({ onOpenNewBookingModal }) => {
  const {
    bookings,
    updateBookingStatus,
    cancelBooking,
    returnBook,
    triggerAIChatWithPrompt,
    activeLoansCount,
    overdueLoansCount,
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.patronName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patronCardId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.patronEmail && b.patronEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || b.status === selectedStatus;
    const matchesType = selectedType === 'all' || b.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const statusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'overdue':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold';
      case 'returned':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
      case 'cancelled':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Loans, Circulation & Facility Reservations</span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-400 border border-slate-700">
              {filteredBookings.length} records
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track student/faculty book loans, study pod bookings, and automated recall notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              triggerAIChatWithPrompt('📋 Audit all overdue book loans and high-demand reservations today. Draft email recall notices.')
            }
            className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 transition-all shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>AI Recall Audit</span>
          </button>

          <button
            id="btn-new-booking-open"
            type="button"
            onClick={onOpenNewBookingModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all shadow-md shadow-teal-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>New Loan / Pod Hold</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
          <span className="text-xs font-semibold text-slate-400">Active Book Loans</span>
          <p className="mt-2 text-2xl font-black text-white">{activeLoansCount} Items</p>
          <p className="text-[11px] text-slate-400 mt-1">In circulation across campus</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
          <span className="text-xs font-semibold text-slate-400">Overdue Hold Notices</span>
          <p className="mt-2 text-2xl font-black text-rose-400">{overdueLoansCount} Notice{overdueLoansCount > 1 ? 's' : ''}</p>
          <p className="text-[11px] text-slate-400 mt-1">Automated fine schedule active</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
          <span className="text-xs font-semibold text-slate-400">Study Pod Reservations</span>
          <p className="mt-2 text-2xl font-black text-indigo-400">
            {bookings.filter((b) => b.type === 'study_pod' && b.status === 'confirmed').length} Booked
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Today's scheduled sessions</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
          <span className="text-xs font-semibold text-slate-400">Returned This Week</span>
          <p className="mt-2 text-2xl font-black text-emerald-400">
            {bookings.filter((b) => b.status === 'returned').length} Items
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Restocked onto shelves</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="input-booking-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patron name, library card ID, book title, or loan code..."
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Reservation Types</option>
            <option value="book_loan">Book Circulation Loans</option>
            <option value="study_pod">Study Pods</option>
            <option value="microfilm_desk">Archival / Microfilm Stations</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-300 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="confirmed">Confirmed</option>
            <option value="overdue">Overdue Notice</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Loan / Hold Code</th>
                <th className="p-3.5">Item / Room Title</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Patron & Card ID</th>
                <th className="p-3.5">Due Date / Time</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No loan or room records matching query.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-teal-400 font-bold">{b.bookingCode}</td>
                    <td className="p-3.5 max-w-xs">
                      <p className="font-semibold text-slate-200 line-clamp-1">{b.itemTitle}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{b.notes || b.category}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1 text-slate-300">
                        {b.type === 'book_loan' ? (
                          <BookOpen className="h-3.5 w-3.5 text-teal-400" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                        )}
                        <span className="capitalize">{b.type.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-slate-200">{b.patronName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{b.patronCardId}</p>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={
                          b.status === 'overdue'
                            ? 'text-rose-400 font-bold flex items-center gap-1'
                            : 'text-slate-300'
                        }
                      >
                        {b.status === 'overdue' && <AlertTriangle className="h-3 w-3" />}
                        {b.dueDate}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase border ${statusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.status === 'active' || b.status === 'overdue' ? (
                          <button
                            type="button"
                            onClick={() => returnBook(b.itemId, b.id)}
                            className="rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30 px-2.5 py-1 text-xs font-semibold transition-colors"
                          >
                            Check In
                          </button>
                        ) : b.status === 'confirmed' ? (
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(b.id, 'active')}
                            className="rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold transition-colors"
                          >
                            Start Session
                          </button>
                        ) : null}

                        {b.status !== 'returned' && b.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => cancelBooking(b.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Cancel Booking"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
