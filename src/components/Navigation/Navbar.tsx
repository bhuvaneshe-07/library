import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Bell,
  Sparkles,
  Menu,
  LogOut,
  UserCheck,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  Building2,
  BookMarked,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { INITIAL_USERS } from '../../data/mockData';

interface NavbarProps {
  onToggleSidebarMobile?: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebarMobile }) => {
  const {
    currentUser,
    isLoggedIn,
    loginUser,
    logoutUser,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsSearchOpen,
    setIsAIChatOpen,
    setCurrentView,
    totalOccupants,
    occupancyPercentage,
    availableCopiesCount,
  } = useLibrary();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand logo & mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            id="btn-mobile-sidebar-toggle"
            type="button"
            onClick={onToggleSidebarMobile}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div
            id="brand-logo-container"
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-teal-400 transition-colors">
                  Athenaeum AI
                </span>
                <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold text-teal-400 border border-teal-500/20">
                  BIBLIO-CORE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Smart Library & Archival Operations
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live telemetry status & Quick search */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-800/50 px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-200">
              {totalOccupants} Patrons Active
            </span>
            <span className="text-slate-600">•</span>
            <span className={`font-semibold ${occupancyPercentage > 85 ? 'text-amber-400' : 'text-teal-400'}`}>
              {occupancyPercentage}% Zone Load
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-medium hidden lg:inline">
              {availableCopiesCount} Copies on Shelf
            </span>
          </div>

          {/* Search bar button */}
          <button
            id="btn-global-search-trigger"
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-colors shadow-sm"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Search books, Dewey calls, pods, tasks...</span>
            <kbd className="ml-2 rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: AI Copilot trigger, notifications, user profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search trigger */}
          <button
            id="btn-mobile-search-trigger"
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-400 hover:text-white md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* AI Copilot Button */}
          <button
            id="btn-ai-assistant-toggle"
            type="button"
            onClick={() => setIsAIChatOpen(true)}
            className="relative flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600/30 to-emerald-600/30 hover:from-teal-600/40 hover:to-emerald-600/40 border border-teal-500/40 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200 transition-all shadow-sm group"
          >
            <Sparkles className="h-4 w-4 text-teal-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">BiblioAI Assistant</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              id="btn-notifications-dropdown"
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">Library Operations Alerts</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-medium text-rose-400 border border-rose-500/30">
                        {unreadNotificationsCount} unread
                      </span>
                    )}
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/40">
                  {notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.actionTab) {
                          setCurrentView(notif.actionTab as any);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                        notif.read
                          ? 'bg-transparent hover:bg-slate-800/50 opacity-75'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-l-2 border-teal-500'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {notif.type === 'critical' ? (
                            <AlertTriangle className="h-4 w-4 text-rose-400" />
                          ) : notif.type === 'warning' ? (
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          ) : notif.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <BookmarkCheck className="h-4 w-4 text-teal-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                            {notif.actionLabel && (
                              <span className="text-[10px] text-teal-400 font-medium hover:underline">
                                {notif.actionLabel} →
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('analytics');
                      setIsNotifOpen(false);
                    }}
                    className="text-xs text-slate-400 hover:text-teal-400 font-medium transition-colors"
                  >
                    View priority matrix & alerts →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative" ref={profileRef}>
            <button
              id="btn-user-profile-menu"
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/40 p-1.5 sm:px-2.5 sm:py-1.5 hover:bg-slate-800 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="h-7 w-7 rounded-full object-cover ring-1 ring-teal-500/50"
              />
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.role}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                  <p className="text-[11px] text-teal-400">{currentUser.role}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{currentUser.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] text-slate-300">
                      Status: {isLoggedIn ? 'Active Staff Duty' : 'Signed Out'}
                    </span>
                  </div>
                </div>

                {/* Quick Role Switcher */}
                <div className="py-1">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Switch Personnel Account
                  </p>
                  {INITIAL_USERS.map((usr) => (
                    <button
                      key={usr.id}
                      type="button"
                      onClick={() => {
                        loginUser(usr);
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs transition-colors ${
                        currentUser.id === usr.id
                          ? 'bg-teal-500/10 text-teal-300 font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={usr.avatar}
                          alt={usr.name}
                          className="h-5 w-5 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="truncate">{usr.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">{usr.role.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-1 mt-1 border-t border-slate-800">
                  {isLoggedIn ? (
                    <button
                      id="btn-logout-action"
                      type="button"
                      onClick={() => {
                        logoutUser();
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out Session</span>
                    </button>
                  ) : (
                    <button
                      id="btn-login-action"
                      type="button"
                      onClick={() => {
                        loginUser(INITIAL_USERS[0]);
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-teal-400 hover:bg-teal-500/10 transition-colors"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Log In as Chief Librarian</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
