import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Book,
  LibraryPlace,
  Task,
  Booking,
  AppNotification,
  UserProfile,
  AppView,
  TaskStatus,
  BookingStatus,
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_ZONES,
  INITIAL_TASKS,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
} from '../data/mockData';

interface LibraryContextType {
  books: Book[];
  zones: LibraryPlace[];
  tasks: Task[];
  bookings: Booking[];
  notifications: AppNotification[];
  currentUser: UserProfile;
  isLoggedIn: boolean;
  currentView: AppView;
  isSearchOpen: boolean;
  isAIChatOpen: boolean;
  aiDrawerPrompt: string;
  unreadNotificationsCount: number;

  // View & UI controls
  setCurrentView: (view: AppView) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsAIChatOpen: (open: boolean) => void;
  triggerAIChatWithPrompt: (promptText: string) => void;
  loginUser: (user: UserProfile) => void;
  logoutUser: () => void;

  // Book actions
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  borrowBook: (bookId: string, patronName: string, patronCardId: string, dueDate: string) => void;
  returnBook: (bookId: string, bookingId?: string) => void;

  // Zone actions
  addZone: (zone: Omit<LibraryPlace, 'id' | 'currentOccupants'>) => void;
  updateZone: (id: string, updates: Partial<LibraryPlace>) => void;
  adjustZoneOccupants: (id: string, delta: number) => void;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  toggleChecklistItem: (taskId: string, checklistId: string) => void;
  addAITasks: (tasks: Array<Partial<Task>>) => void;

  // Booking / Reservation actions
  addBooking: (booking: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>) => void;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  cancelBooking: (id: string) => void;

  // Notification actions
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (id: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Aggregates & Telemetry
  totalBooksCount: number;
  totalCopiesCount: number;
  availableCopiesCount: number;
  totalOccupants: number;
  totalCapacity: number;
  occupancyPercentage: number;
  activeLoansCount: number;
  overdueLoansCount: number;
  pendingTasksCount: number;
  urgentTasksCount: number;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'athenaeum_books_v1',
  ZONES: 'athenaeum_zones_v1',
  TASKS: 'athenaeum_tasks_v1',
  BOOKINGS: 'athenaeum_bookings_v1',
  NOTIFICATIONS: 'athenaeum_notifications_v1',
  USER: 'athenaeum_user_v1',
  IS_LOGGED_IN: 'athenaeum_is_logged_in_v1',
};

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKS);
      return saved ? JSON.parse(saved) : INITIAL_BOOKS;
    } catch {
      return INITIAL_BOOKS;
    }
  });

  const [zones, setZones] = useState<LibraryPlace[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ZONES);
      return saved ? JSON.parse(saved) : INITIAL_ZONES;
    } catch {
      return INITIAL_ZONES;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiDrawerPrompt, setAiDrawerPrompt] = useState('');

  // LocalStorage sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    } catch (e) {
      console.warn('Failed to persist books', e);
    }
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
    } catch (e) {
      console.warn('Failed to persist zones', e);
    }
  }, [zones]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to persist tasks', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch (e) {
      console.warn('Failed to persist bookings', e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to persist notifications', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(isLoggedIn));
    } catch (e) {
      console.warn('Failed to persist auth', e);
    }
  }, [currentUser, isLoggedIn]);

  // Keyboard shortcut: Cmd/Ctrl + K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerAIChatWithPrompt = (promptText: string) => {
    setAiDrawerPrompt(promptText);
    setIsAIChatOpen(true);
  };

  const loginUser = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    addNotification({
      title: `Welcome, ${user.name}`,
      message: `Signed in as ${user.role} (${user.department}).`,
      type: 'info',
      category: 'system',
    });
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
  };

  // Book operations
  const addBook = (newBookData: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...newBookData,
      id: `bk-${Date.now()}`,
    };
    setBooks((prev) => [newBook, ...prev]);
    addNotification({
      title: 'New Catalog Record Added',
      message: `"${newBook.title}" was cataloged under ${newBook.callNumber}.`,
      type: 'success',
      category: 'circulation',
      actionTab: 'catalog',
      actionLabel: 'View in Catalog',
    });
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBook = (id: string) => {
    const target = books.find((b) => b.id === id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (target) {
      addNotification({
        title: 'Title Deaccessioned',
        message: `"${target.title}" was removed from the active catalog.`,
        type: 'warning',
        category: 'circulation',
      });
    }
  };

  const borrowBook = (bookId: string, patronName: string, patronCardId: string, dueDate: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book || book.availableCopies <= 0) return;

    // Decrease copies
    const updatedCopies = book.availableCopies - 1;
    const updatedStatus = updatedCopies === 0 ? 'checked_out' : updatedCopies <= 2 ? 'low_stock' : 'available';

    updateBook(bookId, {
      availableCopies: updatedCopies,
      status: updatedStatus,
    });

    // Create loan booking record
    const newBooking: Booking = {
      id: `bk-loan-${Date.now()}`,
      bookingCode: `LOAN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'book_loan',
      patronName,
      patronEmail: `${patronName.toLowerCase().replace(/\s+/g, '.')}@athenaeum.edu`,
      patronCardId,
      itemTitle: book.title,
      itemId: book.id,
      category: book.genre,
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'active',
      notes: `Checked out from ${book.shelfLocation}. Return on or before ${dueDate}.`,
      librarianApproved: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);

    addNotification({
      title: 'Book Checked Out',
      message: `"${book.title}" loaned to ${patronName} (Due: ${dueDate}).`,
      type: 'info',
      category: 'circulation',
      actionTab: 'bookings',
      actionLabel: 'View Loan Record',
    });
  };

  const returnBook = (bookId: string, bookingId?: string) => {
    const book = books.find((b) => b.id === bookId);
    if (book) {
      const updatedCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      updateBook(bookId, {
        availableCopies: updatedCopies,
        status: updatedCopies > 2 ? 'available' : 'low_stock',
      });
    }

    if (bookingId) {
      updateBookingStatus(bookingId, 'returned');
    } else {
      // Find active loan for this book
      const loan = bookings.find((b) => b.itemId === bookId && (b.status === 'active' || b.status === 'overdue'));
      if (loan) {
        updateBookingStatus(loan.id, 'returned');
      }
    }

    addNotification({
      title: 'Book Successfully Returned',
      message: `Item has been returned to circulation desk and shelves updated.`,
      type: 'success',
      category: 'circulation',
    });
  };

  // Zone operations
  const addZone = (newZoneData: Omit<LibraryPlace, 'id' | 'currentOccupants'>) => {
    const newZone: LibraryPlace = {
      ...newZoneData,
      id: `zone-${Date.now()}`,
      currentOccupants: 0,
    };
    setZones((prev) => [...prev, newZone]);
    addNotification({
      title: 'New Library Place Added',
      message: `${newZone.name} on ${newZone.floor} is now registered in the telemetry system.`,
      type: 'info',
      category: 'room',
      actionTab: 'places',
      actionLabel: 'View Zones',
    });
  };

  const updateZone = (id: string, updates: Partial<LibraryPlace>) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...updates } : z)));
  };

  const adjustZoneOccupants = (id: string, delta: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== id) return z;
        const newOccupancy = Math.max(0, Math.min(z.capacity, z.currentOccupants + delta));
        let status = z.status;
        if (newOccupancy >= z.capacity) {
          status = 'Full';
        } else if (newOccupancy / z.capacity >= 0.85) {
          status = 'Near Capacity';
        } else if (status === 'Near Capacity' || status === 'Full') {
          status = 'Normal';
        }
        return {
          ...z,
          currentOccupants: newOccupancy,
          seatsAvailable: Math.max(0, z.capacity - newOccupancy),
          status,
        };
      })
    );
  };

  // Task operations
  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    addNotification({
      title: 'New Task Created',
      message: `"${newTask.title}" assigned to ${newTask.assignee.name} [${newTask.priority.toUpperCase()}].`,
      type: newTask.priority === 'urgent' ? 'critical' : 'info',
      category: 'task',
      actionTab: 'tasks',
      actionLabel: 'View Task Board',
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, status };
        if (status === 'completed') {
          addNotification({
            title: 'Task Completed',
            message: `"${t.title}" was marked as completed!`,
            type: 'success',
            category: 'task',
          });
        }
        return updated;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleChecklistItem = (taskId: string, checklistId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map((item) =>
          item.id === checklistId ? { ...item, done: !item.done } : item
        );
        return { ...t, checklist: updatedChecklist };
      })
    );
  };

  const addAITasks = (newTasksList: Array<Partial<Task>>) => {
    const formatted: Task[] = newTasksList.map((t, idx) => ({
      id: `ai-tsk-${Date.now()}-${idx}`,
      title: t.title || 'AI Recommended Operations Task',
      description: t.description || 'Generated by BiblioAI Assistant to balance workflow priorities.',
      status: 'todo',
      priority: (t.priority as any) || 'high',
      department: (t.department as any) || 'Circulation & Stacks',
      assignee: t.assignee || {
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
      },
      dueDate: t.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      zoneId: t.zoneId || zones[0]?.id,
      zoneName: t.zoneName || zones[0]?.name,
      tags: t.tags || ['AI-Organized', 'Priority'],
      aiSuggested: true,
      checklist: (t.checklist as any) || [
        { id: `ai-chk-1-${idx}`, text: 'Review AI task parameters', done: false },
        { id: `ai-chk-2-${idx}`, text: 'Execute library protocol', done: false },
      ],
      createdAt: new Date().toISOString(),
    }));

    setTasks((prev) => [...formatted, ...prev]);
    addNotification({
      title: 'BiblioAI Added Tasks',
      message: `Injected ${formatted.length} structured tasks directly onto your board.`,
      type: 'success',
      category: 'task',
      actionTab: 'tasks',
      actionLabel: 'Review Tasks',
    });
  };

  // Booking operations
  const addBooking = (newBookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt'>) => {
    const code =
      newBookingData.type === 'book_loan'
        ? `LOAN-${Math.floor(10000 + Math.random() * 90000)}`
        : `POD-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking: Booking = {
      ...newBookingData,
      id: `bk-${Date.now()}`,
      bookingCode: code,
      createdAt: new Date().toISOString(),
    };

    setBookings((prev) => [newBooking, ...prev]);
    addNotification({
      title: 'New Reservation / Hold Recorded',
      message: `${newBooking.itemTitle} reserved by ${newBooking.patronName} (${newBooking.bookingCode}).`,
      type: 'info',
      category: 'room',
      actionTab: 'bookings',
      actionLabel: 'View Bookings',
    });
  };

  const updateBookingStatus = (id: string, status: BookingStatus) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...status ? { status } : {} } : b)));
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
    );
    addNotification({
      title: 'Reservation Cancelled',
      message: `The booking has been marked as cancelled and capacity restored.`,
      type: 'warning',
      category: 'room',
    });
  };

  // Notification operations
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Telemetry Aggregates
  const totalBooksCount = books.length;
  const totalCopiesCount = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopiesCount = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const totalOccupants = zones.reduce((acc, z) => acc + z.currentOccupants, 0);
  const totalCapacity = zones.reduce((acc, z) => acc + z.capacity, 0);
  const occupancyPercentage = totalCapacity > 0 ? Math.round((totalOccupants / totalCapacity) * 100) : 0;
  const activeLoansCount = bookings.filter((b) => b.type === 'book_loan' && (b.status === 'active' || b.status === 'overdue')).length;
  const overdueLoansCount = bookings.filter((b) => b.type === 'book_loan' && b.status === 'overdue').length;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const urgentTasksCount = tasks.filter((t) => t.status !== 'completed' && t.priority === 'urgent').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <LibraryContext.Provider
      value={{
        books,
        zones,
        tasks,
        bookings,
        notifications,
        currentUser,
        isLoggedIn,
        currentView,
        isSearchOpen,
        isAIChatOpen,
        aiDrawerPrompt,
        unreadNotificationsCount,

        setCurrentView,
        setIsSearchOpen,
        setIsAIChatOpen,
        triggerAIChatWithPrompt,
        loginUser,
        logoutUser,

        addBook,
        updateBook,
        deleteBook,
        borrowBook,
        returnBook,

        addZone,
        updateZone,
        adjustZoneOccupants,

        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        toggleChecklistItem,
        addAITasks,

        addBooking,
        updateBookingStatus,
        cancelBooking,

        markNotificationAsRead,
        markAllNotificationsAsRead,
        dismissNotification,
        addNotification,

        totalBooksCount,
        totalCopiesCount,
        availableCopiesCount,
        totalOccupants,
        totalCapacity,
        occupancyPercentage,
        activeLoansCount,
        overdueLoansCount,
        pendingTasksCount,
        urgentTasksCount,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};

// Aliases for compatibility
export const TouristProvider = LibraryProvider;
export const useTourist = useLibrary;
