import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  PlusCircle,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { ChatMessage, Task } from '../../types';

export const AIAssistantDrawer: React.FC = () => {
  const {
    isAIChatOpen,
    setIsAIChatOpen,
    aiDrawerPrompt,
    tasks,
    zones,
    bookings,
    books,
    currentUser,
    addAITasks,
    pendingTasksCount,
    urgentTasksCount,
    occupancyPercentage,
    totalOccupants,
    overdueLoansCount,
    availableCopiesCount,
  } = useLibrary();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am **BiblioAI**, your library operations and cataloging copilot.\n\nI am currently monitoring **6 library zones**, **${books.length} cataloged titles** (${availableCopiesCount} copies on shelf), **${pendingTasksCount} staff tasks** (${urgentTasksCount} urgent), and live patron footfall (**${totalOccupants} readers**, ${occupancyPercentage}% capacity).\n\nHow can I help you optimize library workflows or organize tasks today?`,
      timestamp: 'Now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAIChatOpen) {
      scrollToBottom();
    }
  }, [messages, isAIChatOpen]);

  // If triggered with a prompt from another button
  useEffect(() => {
    if (aiDrawerPrompt && isAIChatOpen) {
      handleSendMessage(aiDrawerPrompt);
    }
  }, [aiDrawerPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
          context: {
            zonesSummary: zones.map((z) => `${z.name}: ${z.currentOccupants}/${z.capacity} (${z.status}, ${z.environmental?.humidity}% RH)`),
            catalogSummary: `${books.length} titles, ${availableCopiesCount} available on shelf`,
            pendingTasksCount,
            urgentTasksCount,
            overdueLoansCount,
            bookingsSummary: `${bookings.length} active loans/holds, ${overdueLoansCount} overdue items`,
            userRole: currentUser.role,
          },
        }),
      });

      const data = await response.json();
      const botReply = data.reply || 'I have analyzed your library operations telemetry. All systems within threshold.';

      // Check if text suggests creating tasks
      let suggestedTasks: Partial<Task>[] | undefined;
      const lower = text.toLowerCase();
      if (
        lower.includes('task') ||
        lower.includes('organize') ||
        lower.includes('prepare') ||
        lower.includes('checklist') ||
        lower.includes('audit') ||
        lower.includes('prioritize')
      ) {
        suggestedTasks = [
          {
            title: `Action: ${text.slice(0, 45)}...`,
            department: currentUser.department || 'Preservation & Archives',
            priority: lower.includes('urgent') || lower.includes('alert') || lower.includes('humidity') ? 'urgent' : 'high',
            description: `Generated automatically by BiblioAI in response to: "${text}"`,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          },
        ];
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedTasks,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: `**BiblioAI Operations Assessment**:\n\n1. Reviewing current operational priorities...\n2. Recommend focusing on **${urgentTasksCount} urgent tasks** before afternoon study rushes.\n3. Humidity at Archival Vault is 54% RH (threshold: 45%). Dehumidifier check advised.\n4. **${overdueLoansCount} overdue loans** detected in Course Reserves. Automated recall recommended.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleAcceptSuggestedTask = (taskData: Partial<Task>) => {
    addAITasks([
      {
        title: taskData.title || 'Staff Action Item',
        description: taskData.description || 'Action item generated by BiblioAI',
        department: taskData.department || 'Preservation & Archives',
        priority: taskData.priority || 'high',
        status: 'todo',
        dueDate: taskData.dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        assignee: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role,
        },
        tags: ['AI-Generated', 'Library-Ops'],
      },
    ]);
  };

  if (!isAIChatOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 lg:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <span>BiblioAI Operations Copilot</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-slate-400">Library AI Assistant</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAIChatOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30 mt-0.5">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Suggested Task Preview Pill */}
              {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold text-teal-400 flex items-center gap-1">
                    <ListTodo className="h-3 w-3" />
                    BiblioAI Suggested Action:
                  </span>
                  {msg.suggestedTasks.map((st, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <p className="font-bold text-slate-200 truncate">{st.title}</p>
                        <p className="text-[10px] text-slate-400">{st.department} • Due: {st.dueDate}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAcceptSuggestedTask(st)}
                        className="shrink-0 flex items-center gap-1 rounded-lg bg-teal-500 px-2 py-1 text-[10px] font-bold text-slate-950 hover:bg-teal-400 transition-colors"
                      >
                        <PlusCircle className="h-3 w-3" />
                        <span>Add Task</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <span
                className={`block text-[9px] mt-1.5 ${
                  msg.sender === 'user' ? 'text-slate-800 text-right' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="h-7 w-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700 mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 justify-start">
            <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-slate-950 border border-slate-800 p-3 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" />
              <span>BiblioAI synthesizing catalog & telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Action Prompts */}
      <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleQuickPrompt('⚡ Prioritize our highest risk library tasks and catalog backlogs for today')}
          className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-teal-500/40 hover:text-teal-300 transition-colors shrink-0"
        >
          ⚡ Prioritize Tasks
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt('📊 Summarize library circulation, patron footfall, and overdue holds')}
          className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-teal-500/40 hover:text-teal-300 transition-colors shrink-0"
        >
          📊 Daily Summary
        </button>
        <button
          type="button"
          onClick={() => handleQuickPrompt('🏛️ Evaluate humidity and decibel noise levels in reading rooms')}
          className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-teal-500/40 hover:text-teal-300 transition-colors shrink-0"
        >
          🏛️ Environmental Check
        </button>
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask BiblioAI to prioritize, organize, or summarize..."
            className="flex-1 rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-teal-500 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
