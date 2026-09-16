import React, { useState } from 'react';
import { X, LogIn, Check, BookOpen } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ACCOUNTS: UserProfile[] = [
  {
    id: 'user-1',
    name: 'Dr. Eleanor Vance',
    email: 'eleanor.vance@athenaeum.edu',
    role: 'Chief Librarian',
    department: 'Research & Public Events',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-2',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@athenaeum.edu',
    role: 'Circulation Manager',
    department: 'Circulation & Stacks',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-3',
    name: 'Sofia Ramirez',
    email: 'sofia.ramirez@athenaeum.edu',
    role: 'Preservation Archivist',
    department: 'Preservation & Archives',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, currentUser, isLoggedIn } = useLibrary();

  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState<UserProfile['role']>('Chief Librarian');
  const [customDept, setCustomDept] = useState('Preservation & Archives');

  if (!isOpen) return null;

  const handleSelectPreset = (user: UserProfile) => {
    login(user);
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    login({
      id: `user-${Date.now()}`,
      name: customName.trim(),
      email: customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '.')}@athenaeum.edu`,
      role: customRole,
      department: customDept,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-400" />
            <h3 className="text-base font-black text-white">
              {isLoggedIn ? 'Switch Active Staff Profile' : 'Sign in to Athenaeum AI'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <p className="text-slate-400">
            Select an authorized staff librarian profile or authenticate with custom credentials:
          </p>

          {/* Presets */}
          <div className="space-y-2">
            {PRESET_ACCOUNTS.map((preset) => {
              const isActive = isLoggedIn && currentUser.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'border-teal-500/50 bg-teal-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={preset.avatar}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-700"
                    />
                    <div>
                      <p className="font-bold text-white text-xs">{preset.name}</p>
                      <p className="text-[11px] text-teal-400">{preset.role}</p>
                      <p className="text-[10px] text-slate-400">{preset.department}</p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="flex items-center gap-1 rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300">
                      <Check className="h-3 w-3" /> Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Or Custom Sign In
            </span>
          </div>

          {/* Custom staff login */}
          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Staff Member Name *</label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Professor Henry Higgins"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Institutional Email</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="henry.higgins@athenaeum.edu"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role</label>
                <select
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value as UserProfile['role'])}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                >
                  <option value="Chief Librarian">Chief Librarian</option>
                  <option value="Cataloging Specialist">Cataloging Specialist</option>
                  <option value="Preservation Archivist">Preservation Archivist</option>
                  <option value="Circulation Manager">Circulation Manager</option>
                  <option value="Research Fellow / Patron">Research Fellow / Patron</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <select
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
                >
                  <option value="Cataloging & Metadata">Cataloging & Metadata</option>
                  <option value="Circulation & Stacks">Circulation & Stacks</option>
                  <option value="Preservation & Archives">Preservation & Archives</option>
                  <option value="IT & Digital Systems">IT & Digital Systems</option>
                  <option value="Research & Public Events">Research & Public Events</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition-colors shadow-sm"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
