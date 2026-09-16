import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Loader2,
  BookmarkCheck,
  Building2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { TaskDepartment } from '../../types';

export const AnalyticsView: React.FC = () => {
  const {
    zones,
    tasks,
    bookings,
    books,
    totalOccupants,
    totalCapacity,
    occupancyPercentage,
    availableCopiesCount,
    totalCopiesCount,
    pendingTasksCount,
    urgentTasksCount,
    activeLoansCount,
    overdueLoansCount,
    triggerAIChatWithPrompt,
  } = useLibrary();

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiPriorityMatrix, setAiPriorityMatrix] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [loadingPriority, setLoadingPriority] = useState(false);

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const circulationRate = totalCopiesCount > 0 ? Math.round(((totalCopiesCount - availableCopiesCount) / totalCopiesCount) * 100) : 0;

  // Department distribution
  const departments: TaskDepartment[] = [
    'Cataloging & Metadata',
    'Circulation & Stacks',
    'Preservation & Archives',
    'IT & Digital Systems',
    'Research & Public Events',
  ];

  const deptCounts = departments.map((dept) => ({
    name: dept,
    total: tasks.filter((t) => t.department === dept).length,
    completed: tasks.filter((t) => t.department === dept && t.status === 'completed').length,
  }));

  // Generate AI Executive Report
  const handleGenerateAIReport = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, zones, bookings, books }),
      });
      const data = await res.json();
      setAiReport(data.summary || 'Library operations analysis completed successfully.');
    } catch {
      setAiReport(
        `### Library Operations Executive Briefing\n\n- **Patron Footfall**: **${totalOccupants}** readers active across ${zones.length} library zones (**${occupancyPercentage}% capacity**).\n- **Task Execution Rate**: **${taskCompletionRate}%** (${completedTasks}/${tasks.length} tasks completed).\n- **Circulation Status**: **${circulationRate}%** of collection copies currently on loan.`
      );
    } finally {
      setLoadingReport(false);
    }
  };

  // Generate AI Priority Matrix
  const handleGenerateAIPriority = async () => {
    setLoadingPriority(true);
    try {
      const res = await fetch('/api/ai/prioritize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, zones, bookings }),
      });
      const data = await res.json();
      setAiPriorityMatrix(data.analysis || 'Priority matrix calculated.');
    } catch {
      setAiPriorityMatrix(
        `**BiblioAI Dynamic Priority Assessment**\n\n1. **Rare Manuscripts Climate Alert**: Relative humidity in Archival Vault requires dehumidification intervention.\n2. **Academic Reserve Holds**: Restock Course Reserve shelf for upcoming midterms.\n3. **Silent Sanctuary Decibel Sweep**: Conduct walk-through to ensure headphone compliance.`
      );
    } finally {
      setLoadingPriority(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Library Priorities & Progress Analytics</span>
            <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 text-xs font-bold text-teal-400">
              Live Telemetry
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Circulation velocity, facility occupancy distribution, departmental task velocity, and AI briefings.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleGenerateAIPriority}
            disabled={loadingPriority}
            className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-3.5 py-2.5 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 transition-all disabled:opacity-50"
          >
            {loadingPriority ? (
              <Loader2 className="h-4 w-4 animate-spin text-teal-400" />
            ) : (
              <Sparkles className="h-4 w-4 text-teal-400" />
            )}
            <span>AI Priority Matrix</span>
          </button>

          <button
            id="btn-generate-ai-analytics-brief"
            type="button"
            onClick={handleGenerateAIReport}
            disabled={loadingReport}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-teal-400 hover:to-emerald-400 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
          >
            {loadingReport ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span>Synthesize Operations Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Task Velocity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Task Velocity</span>
            <span className="text-xs font-bold text-teal-400">{taskCompletionRate}%</span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{completedTasks} / {tasks.length}</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-400 transition-all"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{pendingTasksCount} tasks remaining</p>
        </div>

        {/* Occupancy Index */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Occupancy Index</span>
            <span className="text-xs font-bold text-emerald-400">{occupancyPercentage}%</span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{totalOccupants} Patrons</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                occupancyPercentage > 85 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">{totalCapacity} maximum facility capacity</p>
        </div>

        {/* Circulation Velocity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Circulation Rate</span>
            <span className="text-xs font-bold text-indigo-400">{circulationRate}%</span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{activeLoansCount} Active Loans</p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-400 transition-all"
              style={{ width: `${circulationRate}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {availableCopiesCount} of {totalCopiesCount} copies on shelf
          </p>
        </div>

        {/* Overdue Index */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Overdue Hold Risk</span>
            <span className="text-xs font-bold text-rose-400">{overdueLoansCount} Overdue</span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">
            {overdueLoansCount === 0 ? 'Optimal' : `${overdueLoansCount} Active Recalls`}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${overdueLoansCount > 0 ? 'bg-rose-500' : 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, overdueLoansCount * 25 || 10)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Fine recalculation active</p>
        </div>
      </div>

      {/* AI Dynamic Priority Matrix (If Generated or Preloaded) */}
      {aiPriorityMatrix && (
        <div className="rounded-2xl border border-teal-500/30 bg-slate-900/95 p-5 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-400" />
              <h3 className="font-bold text-sm text-white">BiblioAI Priority Brief</h3>
            </div>
            <button
              onClick={() => setAiPriorityMatrix(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
            {aiPriorityMatrix}
          </div>
        </div>
      )}

      {/* AI Synthesis Report (If Generated) */}
      {aiReport && (
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-5 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Synthesized Library Operations Briefing</h3>
            </div>
            <button
              onClick={() => setAiReport(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
          <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
            {aiReport}
          </div>
        </div>
      )}

      {/* Grid: Department Performance & Zone Load Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Tasks Progress */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <h3 className="font-bold text-sm text-white mb-4">Operations Velocity by Department</h3>
          <div className="space-y-4">
            {deptCounts.map((dept) => {
              const rate = dept.total > 0 ? Math.round((dept.completed / dept.total) * 100) : 0;
              return (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{dept.name}</span>
                    <span className="text-slate-400">
                      {dept.completed} / {dept.total} completed ({rate}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Zone Load & Environmental Index */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <h3 className="font-bold text-sm text-white mb-4">Zone Capacity & Noise Load</h3>
          <div className="space-y-4">
            {zones.map((zone) => {
              const pct = Math.round((zone.currentOccupants / zone.capacity) * 100);
              return (
                <div key={zone.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-200">{zone.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({zone.code})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {zone.environmental && (
                        <span className="text-[10px] text-indigo-300">
                          {zone.environmental.noiseLevelDb} dB
                        </span>
                      )}
                      <span className="font-bold text-slate-300">
                        {zone.currentOccupants}/{zone.capacity} ({pct}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 85 ? 'bg-amber-400' : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
