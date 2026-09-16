import React, { useState } from 'react';
import { X, CheckSquare, Plus, Trash2, Calendar, Building2 } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { TaskPriority, TaskDepartment } from '../../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEPARTMENTS: TaskDepartment[] = [
  'Cataloging & Metadata',
  'Circulation & Stacks',
  'Preservation & Archives',
  'IT & Digital Systems',
  'Research & Public Events',
];

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, zones, currentUser } = useLibrary();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zoneId, setZoneId] = useState(zones[0]?.id || '');
  const [department, setDepartment] = useState<TaskDepartment>('Preservation & Archives');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [checklistItems, setChecklistItems] = useState<string[]>(['']);

  if (!isOpen) return null;

  const handleAddChecklistField = () => {
    setChecklistItems([...checklistItems, '']);
  };

  const handleRemoveChecklistField = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleUpdateChecklistItem = (index: number, val: string) => {
    const updated = [...checklistItems];
    updated[index] = val;
    setChecklistItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedZone = zones.find((z) => z.id === zoneId);

    const checklist = checklistItems
      .filter((item) => item.trim().length > 0)
      .map((item, idx) => ({
        id: `check-${Date.now()}-${idx}`,
        text: item.trim(),
        done: false,
      }));

    addTask({
      title: title.trim(),
      description: description.trim(),
      zoneId,
      zoneName: matchedZone?.name,
      department,
      priority,
      status: 'todo',
      dueDate,
      assignee: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role,
      },
      tags: [department, priority],
      checklist,
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setChecklistItems(['']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-teal-400" />
            <h3 className="text-base font-black text-white">Create Library Staff Task</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Audit archival vault desiccant canisters and humidity logs"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions, protocols, or equipment required..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Facility Zone / Room</label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Library Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as TaskDepartment)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold">Sub-Tasks / Protocol Checklist</label>
              <button
                type="button"
                onClick={handleAddChecklistField}
                className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="h-3 w-3" /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleUpdateChecklistItem(idx, e.target.value)}
                    placeholder={`Step ${idx + 1}`}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
                  />
                  {checklistItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistField(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
