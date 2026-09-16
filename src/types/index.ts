export type BookGenre =
  | 'Computer Science & AI'
  | 'Philosophy & Ethics'
  | 'Classic Literature'
  | 'History & Archaeology'
  | 'Science & Astronomy'
  | 'Rare Manuscripts & Archives'
  | 'Psychology & Social Sciences';

export type BookFormat = 'Hardcover' | 'Paperback' | 'Manuscript' | 'Digital eBook' | 'Audiobook';

export type BookStatus = 'available' | 'low_stock' | 'checked_out' | 'reserved' | 'in_restoration';

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  genre: BookGenre;
  format: BookFormat;
  callNumber: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  status: BookStatus;
  rating: number;
  coverImage: string;
  aiSummary: string;
  tags: string[];
}

export type ZoneCategory =
  | 'Quiet Study Sanctuary'
  | 'Research & Manuscripts'
  | 'Digital Innovation Lab'
  | 'Children & Young Readers'
  | 'Grand Circulation Commons'
  | 'Collaborative Seminar Pods';

export type ZoneStatus = 'Normal' | 'Near Capacity' | 'Full' | 'Silent Hours' | 'Restricted Access';

export interface LibraryPlace {
  id: string;
  name: string;
  code: string;
  floor: string;
  category: ZoneCategory;
  description: string;
  capacity: number;
  currentOccupants: number;
  status: ZoneStatus;
  environmental: {
    tempC: number;
    humidity: number;
    noiseLevelDb: number;
    noiseStatus: 'Silent (<25dB)' | 'Quiet (<35dB)' | 'Moderate (<50dB)' | 'High Alert (>60dB)';
  };
  librarianInCharge: string;
  seatsAvailable: number;
  bookableRooms: number;
  amenities: string[];
  imageUrl: string;
  operatingHours: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskDepartment =
  | 'Cataloging & Metadata'
  | 'Circulation & Stacks'
  | 'Preservation & Archives'
  | 'IT & Digital Systems'
  | 'Research & Public Events';

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  department: TaskDepartment;
  assignee: {
    name: string;
    role: string;
    avatar: string;
  };
  dueDate: string;
  zoneId?: string;
  zoneName?: string;
  tags: string[];
  aiSuggested?: boolean;
  checklist: TaskChecklistItem[];
  createdAt: string;
}

export type BookingType = 'book_loan' | 'study_pod' | 'conference_room' | 'microfilm_desk';
export type BookingStatus = 'active' | 'overdue' | 'returned' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  bookingCode: string;
  type: BookingType;
  patronName: string;
  patronEmail: string;
  patronCardId: string;
  itemTitle: string; // Book title or Room name
  itemId: string;
  category: string;
  startDate: string;
  dueDate: string;
  status: BookingStatus;
  notes?: string;
  librarianApproved?: string;
  createdAt: string;
}

export type NotificationType = 'critical' | 'warning' | 'info' | 'success';
export type NotificationCategory = 'circulation' | 'preservation' | 'task' | 'room' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  actionTab?: string;
  actionLabel?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Chief Librarian' | 'Cataloging Specialist' | 'Preservation Archivist' | 'Circulation Manager' | 'Research Fellow / Patron';
  avatar: string;
  department: TaskDepartment;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedTasks?: Partial<Task>[];
}

export type AppView =
  | 'dashboard'
  | 'catalog'
  | 'tasks'
  | 'places'
  | 'bookings'
  | 'analytics'
  | 'ai-copilot';

