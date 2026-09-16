import React, { useState } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Navbar } from './components/Navigation/Navbar';
import { Sidebar } from './components/Navigation/Sidebar';
import { GlobalSearchModal } from './components/Search/GlobalSearchModal';
import { AIAssistantDrawer } from './components/AI/AIAssistantDrawer';
import { DashboardView } from './components/Dashboard/DashboardView';
import { CatalogView } from './components/Catalog/CatalogView';
import { TasksView } from './components/Tasks/TasksView';
import { PlacesView } from './components/Places/PlacesView';
import { BookingsView } from './components/Bookings/BookingsView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { AICopilotView } from './components/AI/AICopilotView';
import { NewTaskModal } from './components/Modals/NewTaskModal';
import { NewBookingModal } from './components/Modals/NewBookingModal';
import { NewDestinationModal } from './components/Modals/NewDestinationModal';
import { NewBookModal } from './components/Modals/NewBookModal';
import { AuthModal } from './components/Auth/AuthModal';
import { Sparkles, LogIn } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentView,
    isLoggedIn,
    setIsAIChatOpen,
    isAIChatOpen,
  } = useLibrary();

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar onOpenAuthModal={() => setIsAuthModalOpen(true)} />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Desktop Sidebar & Mobile Drawer */}
        <Sidebar />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {!isLoggedIn ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center my-8 max-w-xl mx-auto">
              <h2 className="text-lg font-bold text-white mb-2">You are currently logged out</h2>
              <p className="text-xs text-slate-300 mb-4">
                Please sign in to access live library telemetry, manage circulation tasks, and review loans.
              </p>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-teal-400 transition-all shadow-md shadow-teal-500/20"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In as Staff Librarian</span>
              </button>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  onOpenNewTaskModal={() => setIsTaskModalOpen(true)}
                  onOpenNewBookingModal={() => setIsBookingModalOpen(true)}
                  onOpenNewBookModal={() => setIsBookModalOpen(true)}
                />
              )}
              {currentView === 'catalog' && (
                <CatalogView
                  onOpenNewBookModal={() => setIsBookModalOpen(true)}
                  onOpenNewLoanModal={() => setIsBookingModalOpen(true)}
                />
              )}
              {currentView === 'tasks' && (
                <TasksView onOpenNewTaskModal={() => setIsTaskModalOpen(true)} />
              )}
              {currentView === 'places' && (
                <PlacesView onOpenNewPlaceModal={() => setIsZoneModalOpen(true)} />
              )}
              {currentView === 'bookings' && (
                <BookingsView onOpenNewBookingModal={() => setIsBookingModalOpen(true)} />
              )}
              {currentView === 'analytics' && <AnalyticsView />}
              {currentView === 'ai-copilot' && <AICopilotView />}
            </>
          )}
        </main>
      </div>

      {/* Floating AI Copilot Quick Launcher (Bottom Right) */}
      {!isAIChatOpen && (
        <button
          id="btn-floating-ai-copilot"
          type="button"
          onClick={() => setIsAIChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-3 text-xs font-bold text-slate-950 shadow-2xl hover:from-teal-400 hover:to-emerald-400 transition-all transform hover:scale-105"
          aria-label="Open AI Operations Assistant"
        >
          <Sparkles className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">BiblioAI Copilot</span>
          <span className="sm:hidden">AI</span>
        </button>
      )}

      {/* Global Modals & Drawers */}
      <GlobalSearchModal />
      <AIAssistantDrawer />

      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />
      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
      <NewDestinationModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
      />
      <NewBookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LibraryProvider>
      <MainContent />
    </LibraryProvider>
  );
}
