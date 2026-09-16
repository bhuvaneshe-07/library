import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Kanban,
  List,
  Sparkles,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Tag,
  Clock,
  Building2,
  Layers,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { Task, TaskPriority, TaskStatus, TaskDepartment } from '../../types';

interface TasksViewProps {
  onOpenNewTaskModal: () => void;
}

const DEPARTMENTS: Array<TaskDepartment | 'all'> = [
  'all',
  'Cataloging & Metadata',
  'Circulation & Stacks',
  'Preservation & Archives',
  'IT & Digital Systems',
  'Research & Public Events',
];

export const TasksView: React.FC<TasksViewProps> = ({ onOpenNewTaskModal }) => {
  const {
    tasks,
    updateTaskStatus,
    deleteTask,
    toggleChecklistItem,
    triggerAIChatWithPrompt,
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.zoneName && t.zoneName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority =
      selectedPriority === 'all' || t.priority === selectedPriority;

    const matchesDept =
      selectedDepartment === 'all' || t.department === selectedDepartment;

    return matchesSearch && matchesPriority && matchesDept;
  });

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'backlog', label: 'Backlog', color: 'border-slate-700 text-slate-400' },
    { id: 'todo', label: 'To Do', color: 'border-blue-500/40 text-blue-400' },
    { id: 'in_progress', label: 'In Progress', color: 'border-amber-500/40 text-amber-400' },
    { id: 'review', label: 'Archival Review', color: 'border-purple-500/40 text-purple-400' },
    { id: 'completed', label: 'Completed', color: 'border-emerald-500/40 text-emerald-400' },
  ];

  const priorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'low':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const advanceStatus = (current: TaskStatus): TaskStatus => {
    switch (current) {
      case 'backlog':
        return 'todo';
      case 'todo':
        return 'in_progress';
      case 'in_progress':
        return 'review';
      case 'review':
        return 'completed';
      case 'completed':
        return 'backlog';
    }
  };

  const revertStatus = (current: TaskStatus): TaskStatus => {
    switch (current) {
      case 'completed':
        return 'review';
      case 'review':
        return 'in_progress';
      case 'in_progress':
        return 'todo';
      case 'todo':
        return 'backlog';
      case 'backlog':
        return 'completed';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Staff Operations & Task Board</span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-400 border border-slate-700">
              {filteredTasks.length} tasks
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Coordinate archival conservation, cataloging batches, stack audits, and reading room acoustics.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View switcher */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => triggerAIChatWithPrompt('⚡ Analyze our current library backlog and auto-prioritize urgent preservation tasks')}
            className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>AI Auto-Prioritize</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewTaskModal}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all shadow-md shadow-teal-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-lg">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tasks, assignees, tags..."
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Priority filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Department filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-300 focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.filter((d) => d !== 'all').map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-3 min-h-[420px]"
              >
                {/* Column header */}
                <div className={`flex items-center justify-between pb-2 mb-3 border-b-2 ${col.color}`}>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    {col.label}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                {/* Column task items */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-800/90 bg-slate-950/80 p-3 hover:border-slate-700 transition-all shadow-md group relative"
                    >
                      {/* Priority and Department */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase border ${priorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          {task.department}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Zone Name tag if assigned */}
                      {task.zoneName && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-teal-400">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{task.zoneName}</span>
                        </div>
                      )}

                      {/* Checklist progress */}
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span>Checklist</span>
                            <span className="font-semibold text-slate-300">
                              {task.checklist.filter((c) => c.done).length}/{task.checklist.length}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {task.checklist.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleChecklistItem(task.id, item.id)}
                                className="w-full flex items-center gap-1.5 text-left text-[11px] text-slate-400 hover:text-slate-200"
                              >
                                <span
                                  className={`h-3 w-3 rounded border flex items-center justify-center text-[9px] shrink-0 ${
                                    item.done
                                      ? 'bg-teal-500 border-teal-500 text-slate-950 font-black'
                                      : 'border-slate-700'
                                  }`}
                                >
                                  {item.done && '✓'}
                                </span>
                                <span className={item.done ? 'line-through opacity-60' : ''}>
                                  {item.text}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Assignee & Due Date */}
                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="h-5 w-5 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="truncate max-w-[90px]">{task.assignee.name}</span>
                        </div>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="h-3 w-3" />
                          {task.dueDate}
                        </span>
                      </div>

                      {/* Status Transition Bar */}
                      <div className="mt-2.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, revertStatus(task.status))}
                          className="p-1 text-slate-500 hover:text-slate-300 rounded"
                          title="Move status backward"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete task"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => updateTaskStatus(task.id, advanceStatus(task.status))}
                          className="p-1 text-teal-400 hover:text-teal-300 rounded"
                          title="Advance status forward"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="h-32 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-600">
                      Empty column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Table View */}
      {viewMode === 'list' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Task Title</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Facility Zone</th>
                  <th className="p-3.5">Assignee</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <select
                        value={t.status}
                        onChange={(e) => updateTaskStatus(t.id, e.target.value as TaskStatus)}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 focus:border-teal-500 focus:outline-none"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase border ${priorityBadge(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="font-semibold text-slate-200 line-clamp-1">{t.title}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{t.description}</p>
                    </td>
                    <td className="p-3.5 text-slate-300">{t.department}</td>
                    <td className="p-3.5 text-teal-400">{t.zoneName || '—'}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={t.assignee.avatar}
                          alt={t.assignee.name}
                          className="h-5 w-5 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-slate-300">{t.assignee.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-400">{t.dueDate}</td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => deleteTask(t.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete Task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
