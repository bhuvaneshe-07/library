import React from 'react';
import {
  Users,
  BookOpen,
  CheckSquare,
  BookmarkCheck,
  Sparkles,
  Plus,
  Calendar,
  AlertTriangle,
  Building2,
  Thermometer,
  Volume2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

interface DashboardViewProps {
  onOpenNewTaskModal: () => void;
  onOpenNewBookingModal: () => void;
  onOpenNewBookModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTaskModal,
  onOpenNewBookingModal,
  onOpenNewBookModal,
}) => {
  const {
    zones,
    tasks,
    bookings,
    books,
    currentUser,
    setCurrentView,
    triggerAIChatWithPrompt,
    updateTaskStatus,
    returnBook,
    adjustZoneOccupants,
    totalOccupants,
    totalCapacity,
    occupancyPercentage,
    availableCopiesCount,
    totalCopiesCount,
    totalBooksCount,
    activeLoansCount,
    overdueLoansCount,
    pendingTasksCount,
    urgentTasksCount,
  } = useLibrary();

  // Urgent tasks
  const urgentTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => (a.priority === 'urgent' ? -1 : 1))
    .slice(0, 4);

  // Recent bookings/loans
  const recentBookings = bookings.slice(0, 4);

  // Hourly patron occupancy trend data
  const hourlyData = [
    { hour: '08:00', patrons: 65 },
    { hour: '10:00', patrons: 190 },
    { hour: '12:00', patrons: 295 },
    { hour: '14:00', patrons: 342 },
    { hour: '16:00', patrons: 310 },
    { hour: '18:00', patrons: 240 },
    { hour: '20:00', patrons: 135 },
  ];

  const maxHourly = Math.max(...hourlyData.map((d) => d.patrons));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Library Operations Hub
            </h1>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
              Live Network
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Welcome, <span className="text-slate-200 font-semibold">{currentUser.name}</span> ({currentUser.role}). All stacks, catalog records, and study pods are synchronizing.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenNewBookModal && (
            <button
              id="btn-dash-new-book"
              type="button"
              onClick={onOpenNewBookModal}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5 text-teal-400" />
              <span>Catalog Book</span>
            </button>
          )}

          <button
            id="btn-dash-new-task"
            type="button"
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 text-teal-400" />
            <span>New Task</span>
          </button>

          <button
            id="btn-dash-new-booking"
            type="button"
            onClick={onOpenNewBookingModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
          >
            <Calendar className="h-3.5 w-3.5 text-teal-400" />
            <span>Reserve / Checkout</span>
          </button>

          <button
            id="btn-dash-ai-prioritize"
            type="button"
            onClick={() => triggerAIChatWithPrompt('⚡ Analyze today’s pending library tasks, catalog holds, and archival risks to generate an operational priority plan')}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all shadow-md shadow-teal-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Prioritize</span>
          </button>
        </div>
      </div>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Readers & Facility Load */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Patrons in Library</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalOccupants}</span>
            <span className="text-xs text-slate-400">/ {totalCapacity} capacity</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                occupancyPercentage > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{occupancyPercentage}% total load</span>
            <span className="text-teal-400 font-medium">6 Zones</span>
          </div>
        </div>

        {/* Catalog Circulation & Availability */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Catalog Collection</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{availableCopiesCount}</span>
            <span className="text-xs text-slate-400">copies available ({totalCopiesCount} total)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{totalBooksCount} Cataloged Titles</span>
            <button
              onClick={() => setCurrentView('catalog')}
              className="text-slate-400 hover:text-white underline text-[10px]"
            >
              Browse OPAC →
            </button>
          </div>
        </div>

        {/* Active Loans & Holds */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Loans & Reservations</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookmarkCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeLoansCount}</span>
            <span className="text-xs text-slate-400">active loans</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            {overdueLoansCount > 0 ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {overdueLoansCount} Overdue Notice{overdueLoansCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">Zero Overdues</span>
            )}
            <button
              onClick={() => setCurrentView('bookings')}
              className="text-slate-400 hover:text-white text-[10px]"
            >
              View Loans →
            </button>
          </div>
        </div>

        {/* Staff Operations & Tasks */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Operational Tasks</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{pendingTasksCount}</span>
            <span className="text-xs text-slate-400">pending tasks</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            {urgentTasksCount > 0 ? (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                {urgentTasksCount} Urgent Priority
              </span>
            ) : (
              <span className="text-slate-400">All standard priority</span>
            )}
            <button
              onClick={() => setCurrentView('tasks')}
              className="text-teal-400 hover:underline text-[10px]"
            >
              Task Board →
            </button>
          </div>
        </div>
      </div>

      {/* BiblioAI Quick Insight Strip */}
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/40 via-slate-900 to-emerald-950/30 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">BiblioAI Daily Operations Intelligence</h2>
                <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-300">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Archival Vault sensor detected 54% humidity spike. Recommended: Reassign 1 cataloger to the circulation desk for mid-day textbook returns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => triggerAIChatWithPrompt('Summarize library operations, book circulation velocity, and today’s facility bottlenecks')}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
            >
              Generate Summary
            </button>
            <button
              type="button"
              onClick={() => triggerAIChatWithPrompt('Audit Course Reserves and notify students with overdue holds')}
              className="rounded-lg bg-teal-500 hover:bg-teal-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors shadow-sm"
            >
              Audit Course Reserves
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Live Zones & Occupancy Curve */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Zone Telemetry Cards */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-teal-400" />
                <h3 className="font-bold text-white text-sm">Monitored Zones & Environmental Telemetry</h3>
              </div>
              <button
                onClick={() => setCurrentView('places')}
                className="text-xs text-teal-400 hover:underline font-medium flex items-center gap-1"
              >
                <span>View all 6 zones</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {zones.slice(0, 4).map((zone) => {
                const isFull = zone.currentOccupants >= zone.capacity;
                const pct = Math.round((zone.currentOccupants / zone.capacity) * 100);
                const hasAlert = zone.environmental && zone.environmental.humidity > 50;

                return (
                  <div
                    key={zone.id}
                    className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-3.5 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-200 text-xs">{zone.name}</span>
                            {hasAlert && (
                              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{zone.floor}</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                            isFull
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : pct > 80
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {zone.status}
                        </span>
                      </div>

                      {/* Environmental indicators */}
                      {zone.environmental && (
                        <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3.5 w-3.5 text-teal-400" />
                            <span>{zone.environmental.tempC}°C</span>
                            <span className={hasAlert ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                              ({zone.environmental.humidity}% RH)
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                            <span>{zone.environmental.noiseLevelDb} dB</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300">
                          {zone.currentOccupants} / {zone.capacity}
                        </span>
                        <span className="text-[10px] text-slate-500">({pct}%)</span>
                      </div>

                      {/* Quick occupant simulation buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => adjustZoneOccupants(zone.id, -1)}
                          disabled={zone.currentOccupants <= 0}
                          className="h-6 w-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 text-xs flex items-center justify-center font-bold"
                          title="Simulate patron exit"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustZoneOccupants(zone.id, 1)}
                          disabled={zone.currentOccupants >= zone.capacity}
                          className="h-6 w-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 text-xs flex items-center justify-center font-bold"
                          title="Simulate patron entry"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hourly Patron Footfall Velocity Chart */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">Today’s Patron Footfall Curve</h3>
                <p className="text-[11px] text-slate-400">Aggregated turnstile & RFID gate read velocity</p>
              </div>
              <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                Peak: 14:00 (342 Patrons)
              </span>
            </div>

            <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
              {hourlyData.map((d) => {
                const heightPct = Math.round((d.patrons / maxHourly) * 100);
                return (
                  <div key={d.hour} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.patrons}
                    </span>
                    <div className="w-full h-32 bg-slate-800/60 rounded-t-lg relative flex items-end justify-center overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-teal-600 to-emerald-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">{d.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Urgent Tasks & Active Bookings */}
        <div className="space-y-6">
          {/* Urgent Staff Tasks */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">High Priority Operations</h3>
              </div>
              <button
                onClick={() => setCurrentView('tasks')}
                className="text-xs text-teal-400 hover:underline font-medium"
              >
                Board →
              </button>
            </div>

            <div className="space-y-2.5">
              {urgentTasks.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No urgent tasks currently pending!
                </div>
              ) : (
                urgentTasks.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(t.id, 'completed')}
                          className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                          title="Mark completed"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <div>
                          <p className="text-xs font-semibold text-slate-200 line-clamp-1">{t.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{t.description}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          t.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={t.assignee.avatar}
                          alt={t.assignee.name}
                          className="h-4 w-4 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span>{t.assignee.name}</span>
                      </div>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3" />
                        Due: {t.dueDate}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Loans & Holds */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="h-4 w-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Active Loans & Reservations</h3>
              </div>
              <button
                onClick={() => setCurrentView('bookings')}
                className="text-xs text-teal-400 hover:underline font-medium"
              >
                View all →
              </button>
            </div>

            <div className="space-y-2.5">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{b.itemTitle}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Patron: <span className="text-slate-300">{b.patronName}</span> ({b.patronCardId})
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        b.status === 'overdue'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : b.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Due: {b.dueDate}</span>
                    {b.status === 'active' || b.status === 'overdue' ? (
                      <button
                        type="button"
                        onClick={() => returnBook(b.itemId, b.id)}
                        className="text-teal-400 hover:text-teal-300 font-medium"
                      >
                        Check In / Return →
                      </button>
                    ) : (
                      <span className="text-slate-500 font-mono">{b.bookingCode}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
