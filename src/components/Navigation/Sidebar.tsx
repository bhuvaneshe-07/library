import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Building2,
  BookmarkCheck,
  BarChart3,
  Bell,
  Sparkles,
  X,
  Thermometer,
  Volume2,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { AppView } from '../../types';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const {
    currentView,
    setCurrentView,
    pendingTasksCount,
    urgentTasksCount,
    unreadNotificationsCount,
    totalOccupants,
    totalCapacity,
    occupancyPercentage,
    activeLoansCount,
    totalBooksCount,
    zones,
  } = useLibrary();

  const navItems: {
    id: AppView;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Library Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'catalog',
      label: 'Book Catalog & OPAC',
      icon: BookOpen,
      badge: `${totalBooksCount} Titles`,
      badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
    },
    {
      id: 'tasks',
      label: 'Staff Task Board',
      icon: CheckSquare,
      badge: pendingTasksCount,
      badgeColor:
        urgentTasksCount > 0
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          : 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      id: 'places',
      label: 'Zones & Facilities',
      icon: Building2,
      badge: '6 Zones',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'bookings',
      label: 'Loans & Reservations',
      icon: BookmarkCheck,
      badge: activeLoansCount > 0 ? `${activeLoansCount} Active` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'analytics',
      label: 'Priorities & Metrics',
      icon: BarChart3,
    },
    {
      id: 'ai-copilot',
      label: 'BiblioAI Assistant',
      icon: Sparkles,
      badge: 'Online',
      badgeColor: 'bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/30',
    },
  ];

  // Check vault status
  const archivalVault = zones.find((z) => z.id === 'zone-3');
  const hasVaultWarning = archivalVault && archivalVault.environmental && archivalVault.environmental.humidity > 50;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-30 h-screen md:h-[calc(100vh-4rem)] w-64 shrink-0 flex flex-col justify-between border-r border-slate-800/80 bg-slate-900/95 backdrop-blur-md p-4 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Mobile Header in sidebar */}
          <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-800 md:hidden">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-400" />
              <span className="font-bold text-white">Athenaeum Systems</span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-2 px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation & Modules
            </span>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => {
                    setCurrentView(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-emerald-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-transform ${
                        isActive ? 'text-teal-400 scale-110' : 'text-slate-400 group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Facility Telemetry Mini Card */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          {hasVaultWarning && (
            <div
              onClick={() => setCurrentView('places')}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 cursor-pointer hover:bg-amber-500/15 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <Thermometer className="h-3.5 w-3.5" />
                <span>Vault Humidity Alert</span>
              </div>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                54% RH in Archival Vault (Safe: &lt;45%)
              </p>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 shadow-inner">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Facility Occupancy</span>
              <span className="text-teal-400 font-bold">{occupancyPercentage}%</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  occupancyPercentage > 85 ? 'bg-amber-500' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>{totalOccupants} / {totalCapacity} patrons</span>
              <span>6 Library zones</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
