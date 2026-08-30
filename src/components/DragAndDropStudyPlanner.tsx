import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GripVertical, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  Video, 
  FileText, 
  Zap, 
  ArrowRight, 
  RotateCcw,
  Calendar,
  Check,
  ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export interface PlannerTask {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  taskType: 'revision' | 'lecture' | 'ncert' | 'pyq';
  status: 'backlog' | 'morning' | 'afternoon' | 'evening' | 'completed';
  priority: 'high' | 'medium' | 'normal';
}

interface DragAndDropStudyPlannerProps {
  studentProfile: {
    id: string;
    name: string;
    studentClass: string;
  };
}

const COLUMN_CONFIGS: { id: PlannerTask['status']; title: string; subtitle: string; icon: any; color: string; bg: string; border: string }[] = [
  {
    id: 'backlog',
    title: 'Task Backlog',
    subtitle: 'Unscheduled Revision Tasks',
    icon: BookOpen,
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50/60 dark:bg-amber-950/20',
    border: 'border-amber-200/80 dark:border-amber-800/40'
  },
  {
    id: 'morning',
    title: 'Morning Shift',
    subtitle: '08:00 AM – 12:00 PM',
    icon: Clock,
    color: 'text-[#061F48] dark:text-blue-400',
    bg: 'bg-blue-50/60 dark:bg-blue-950/20',
    border: 'border-blue-200/80 dark:border-blue-800/40'
  },
  {
    id: 'afternoon',
    title: 'Afternoon Shift',
    subtitle: '12:00 PM – 05:00 PM',
    icon: Video,
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-50/60 dark:bg-purple-950/20',
    border: 'border-purple-200/80 dark:border-purple-800/40'
  },
  {
    id: 'evening',
    title: 'Evening & Night',
    subtitle: '05:00 PM – 10:00 PM',
    icon: Zap,
    color: 'text-indigo-700 dark:text-indigo-400',
    bg: 'bg-indigo-50/60 dark:bg-indigo-950/20',
    border: 'border-indigo-200/80 dark:border-indigo-800/40'
  },
  {
    id: 'completed',
    title: 'Completed',
    subtitle: 'Done Today',
    icon: CheckCircle2,
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    border: 'border-emerald-200/80 dark:border-emerald-800/40'
  }
];

export default function DragAndDropStudyPlanner({ studentProfile }: DragAndDropStudyPlannerProps) {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<PlannerTask['status'] | null>(null);

  // Form Modal / Inline State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Biology');
  const [newDuration, setNewDuration] = useState(45);
  const [newTaskType, setNewTaskType] = useState<PlannerTask['taskType']>('lecture');
  const [newStatus, setNewStatus] = useState<PlannerTask['status']>('morning');
  const [newPriority, setNewPriority] = useState<PlannerTask['priority']>('medium');

  const storageKey = `cme_dnd_study_planner_${studentProfile.id || 'anonymous'}`;

  // Load only real saved tasks. Never seed demo/fake tasks.
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      setTasks([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const savedTasks = Array.isArray(parsed) ? parsed : [];
      const demoTaskIds = new Set(['task_1', 'task_2', 'task_3', 'task_4']);
      const cleanedTasks = savedTasks.filter((task) => task && !demoTaskIds.has(task.id));

      setTasks(cleanedTasks);

      if (cleanedTasks.length !== savedTasks.length) {
        localStorage.setItem(storageKey, JSON.stringify(cleanedTasks));
      }
    } catch (e) {
      console.error('Error loading study planner tasks:', e);
      setTasks([]);
    }
  }, [studentProfile.id]);

  // Sync to localStorage
  const saveTasks = (updated: PlannerTask[]) => {
    setTasks(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Move task to new status column
  const moveTask = (taskId: string, newColStatus: PlannerTask['status']) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        if (newColStatus === 'completed' && t.status !== 'completed') {
          addToast({
            title: 'Task Mastered! 🎉',
            description: `Finished "${t.title}" (${t.durationMinutes} mins)`,
            type: 'success'
          });
        }
        return { ...t, status: newColStatus };
      }
      return t;
    });
    saveTasks(updated);
  };

  // HTML5 Drag Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colStatus: PlannerTask['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colStatus) {
      setDragOverColumn(colStatus);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colStatus: PlannerTask['status']) => {
    e.preventDefault();
    if (dragOverColumn === colStatus) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colStatus: PlannerTask['status']) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTask(taskId, colStatus);
    }
    setDraggedTaskId(null);
  };

  // Add Task
  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast({ title: 'Task Title Required', description: 'Please enter a name for your task.', type: 'error' });
      return;
    }

    const newTask: PlannerTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: newTitle.trim(),
      subject: newSubject,
      durationMinutes: Number(newDuration) || 30,
      taskType: newTaskType,
      status: newStatus,
      priority: newPriority
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);
    setNewTitle('');
    setShowAddForm(false);

    addToast({
      title: 'Task Scheduled 📅',
      description: `Added "${newTask.title}" to ${COLUMN_CONFIGS.find((c) => c.id === newStatus)?.title}.`,
      type: 'success'
    });
  };

  // Delete Task
  const deleteTask = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    saveTasks(updated);
    addToast({ title: 'Task Removed', description: 'Item deleted from study planner.', type: 'info' });
  };

  // Clear Planner
  const resetPlanner = () => {
    saveTasks([]);
    addToast({ title: 'Planner Cleared', description: 'All study planner tasks were removed.', type: 'info' });
  };

  // Calculate Metrics
  const totalPlannedMinutes = (tasks || [])
    .filter((t) => t && t.status !== 'completed')
    .reduce((acc, t) => acc + (t.durationMinutes || 0), 0);

  const completedMinutes = (tasks || [])
    .filter((t) => t && t.status === 'completed')
    .reduce((acc, t) => acc + (t.durationMinutes || 0), 0);

  const completedCount = (tasks || []).filter((t) => t && t.status === 'completed').length;
  const totalCount = (tasks || []).length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const formatHours = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs === 0) return `${m}m`;
    return m === 0 ? `${hrs}h` : `${hrs}h ${m}m`;
  };

  const getTaskTypeBadge = (type: PlannerTask['taskType']) => {
    switch (type) {
      case 'lecture':
        return { label: 'Lecture Watch', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300', icon: Video };
      case 'revision':
        return { label: 'Revision', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: BookOpen };
      case 'ncert':
        return { label: 'NCERT Practice', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: FileText };
      case 'pyq':
        return { label: 'PYQ Drill', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', icon: Zap };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-[#061F48]/15 dark:border-gray-800 p-6 md:p-8 shadow-md space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#061F48]/10 dark:border-gray-800">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] dark:bg-gray-800 text-[#D09515] px-3 py-1 rounded-full border border-[#D09515]/20">
            <Sparkles className="h-3.5 w-3.5 text-[#D09515]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Interactive Board Scheduler</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-[#061F48] dark:text-white flex items-center gap-2">
            <span>Drag-and-Drop Study Planner</span>
          </h3>
          <p className="text-xs text-[#061F48]/70 dark:text-gray-400 font-semibold max-w-xl leading-relaxed">
            Drag & drop lecture watch times, NCERT chapter revisions, and competitive drills between time shifts.
          </p>
        </div>

        {/* METRICS & QUICK ACTIONS */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-[#F8F5ED] dark:bg-gray-800 border border-[#061F48]/10 dark:border-gray-700 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-gray-400 block">Total Planned</span>
              <p className="text-sm font-black text-[#061F48] dark:text-white flex items-center gap-1">
                <Clock className="h-4 w-4 text-[#D09515]" />
                <span>{formatHours(totalPlannedMinutes)}</span>
              </p>
            </div>
            <div className="h-8 w-px bg-[#061F48]/10 dark:bg-gray-700" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Completed</span>
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>{formatHours(completedMinutes)}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-[#061F48] hover:bg-[#D09515] text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>

          <button
            onClick={resetPlanner}
            title="Clear all planner tasks"
            className="p-2.5 bg-[#F8F5ED] hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#061F48] dark:text-gray-300 rounded-2xl transition-colors border border-[#061F48]/10 dark:border-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="bg-[#F8F5ED] dark:bg-gray-800/80 p-3.5 rounded-2xl border border-[#061F48]/10 dark:border-gray-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0">
            {completionPercentage}%
          </div>
          <div>
            <p className="text-xs font-black text-[#061F48] dark:text-white uppercase tracking-wider">Daily Goal Completion Status</p>
            <p className="text-[10px] text-[#061F48]/60 dark:text-gray-400 font-semibold">
              {totalCount > 0 ? `${completedCount} of ${totalCount} scheduled tasks completed.` : 'No study tasks scheduled yet.'}</p>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden shrink-0 border border-[#061F48]/5">
          <div
            className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* REAL-DATA-ONLY NOTICE */}
      {tasks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#061F48]/15 dark:border-gray-700 bg-[#F8F5ED]/60 dark:bg-gray-800/50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#061F48]/60 dark:text-gray-400">
            Your planner is empty
          </p>
          <p className="text-[10px] text-[#061F48]/50 dark:text-gray-500 font-semibold mt-1">
            Add your own study task to start building today’s schedule.
          </p>
        </div>
      )}

      {/* INLINE ADD TASK FORM */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddNewTask}
            className="bg-[#F8F5ED] dark:bg-gray-800/90 border border-[#061F48]/15 dark:border-gray-700 p-5 rounded-3xl space-y-4 overflow-hidden"
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#061F48]/10 dark:border-gray-700">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#061F48] dark:text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-[#D09515]" />
                <span>Create New Scheduled Study Task</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 space-y-1">
                <label className="text-[10px] font-black uppercase text-[#061F48]/70 dark:text-gray-300 block">Task Title / Topic Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Human Reproduction Diagrams"
                  className="w-full bg-white dark:bg-gray-900 border border-[#061F48]/15 dark:border-gray-700 p-2.5 rounded-xl text-xs font-bold text-[#061F48] dark:text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-black uppercase text-[#061F48]/70 dark:text-gray-300 block">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-white dark:bg-gray-900 border border-[#061F48]/15 dark:border-gray-700 p-2.5 rounded-xl text-xs font-bold text-[#061F48] dark:text-white focus:outline-none"
                >
                  <option value="Biology">Biology</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="SST">Social Science (SST)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-[#061F48]/70 dark:text-gray-300 block">Duration (Mins)</label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full bg-white dark:bg-gray-900 border border-[#061F48]/15 dark:border-gray-700 p-2.5 rounded-xl text-xs font-bold text-[#061F48] dark:text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-[#061F48]/70 dark:text-gray-300 block">Task Category</label>
                <select
                  value={newTaskType}
                  onChange={(e) => setNewTaskType(e.target.value as any)}
                  className="w-full bg-white dark:bg-gray-900 border border-[#061F48]/15 dark:border-gray-700 p-2.5 rounded-xl text-xs font-bold text-[#061F48] dark:text-white focus:outline-none"
                >
                  <option value="lecture">Lecture Watch</option>
                  <option value="revision">Revision Notes</option>
                  <option value="ncert">NCERT Practice</option>
                  <option value="pyq">PYQ Drill</option>
                </select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-black uppercase text-[#061F48]/70 dark:text-gray-300 block">Initial Time Shift</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full bg-white dark:bg-gray-900 border border-[#061F48]/15 dark:border-gray-700 p-2.5 rounded-xl text-xs font-bold text-[#061F48] dark:text-white focus:outline-none"
                >
                  <option value="backlog">Task Backlog (Unscheduled)</option>
                  <option value="morning">Morning Shift (08:00 AM – 12:00 PM)</option>
                  <option value="afternoon">Afternoon Shift (12:00 PM – 05:00 PM)</option>
                  <option value="evening">Evening Shift (05:00 PM – 10:00 PM)</option>
                </select>
              </div>

              <div className="md:col-span-8 flex items-end justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#061F48] hover:bg-[#D09515] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Save to Schedule</span>
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* KANBAN DRAG-AND-DROP BOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {COLUMN_CONFIGS.map((col) => {
          const ColumnIcon = col.icon;
          const colTasks = tasks.filter((t) => t.status === col.id);
          const totalColMins = colTasks.reduce((sum, t) => sum + t.durationMinutes, 0);
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-3xl border transition-all duration-200 flex flex-col p-4 space-y-3 min-h-[360px] ${
                col.bg
              } ${col.border} ${
                isOver ? 'ring-2 ring-[#D09515] scale-[1.01] bg-amber-100/40 dark:bg-amber-900/30' : ''
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#061F48]/10 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl bg-white dark:bg-gray-800 shadow-xs ${col.color}`}>
                    <ColumnIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${col.color}`}>
                      {col.title}
                    </h4>
                    <p className="text-[9px] text-[#061F48]/50 dark:text-gray-400 font-bold">{col.subtitle}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-[#061F48] dark:text-white block">{(colTasks || []).length}</span>
                  <span className="text-[8px] font-extrabold text-[#061F48]/50 dark:text-gray-400 uppercase">
                    {formatHours(totalColMins)}
                  </span>
                </div>
              </div>

              {/* Task Items List */}
              <div className="flex-grow space-y-2.5 overflow-y-auto max-h-[420px] pr-1 scrollbar-none">
                {(colTasks || []).length === 0 ? (
                  <div className="h-full min-h-[140px] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Drop Tasks Here</p>
                    <p className="text-[9px] text-gray-300 dark:text-gray-600 mt-0.5">Drag any task into this shift</p>
                  </div>
                ) : (
                  (colTasks || []).map((task) => {
                    const badge = getTaskTypeBadge(task.taskType);
                    const BadgeIcon = badge.icon;
                    const isDragging = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`bg-white dark:bg-gray-800 border border-[#061F48]/10 dark:border-gray-700/80 rounded-2xl p-3 shadow-xs space-y-2 cursor-grab active:cursor-grabbing hover:border-[#D09515] hover:shadow-md transition-all ${
                          isDragging ? 'opacity-40 scale-95' : ''
                        }`}
                      >
                        {/* Task Top Row */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
                            <span className="text-[9px] font-black uppercase text-[#D09515]">{task.subject}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md flex items-center gap-1 ${badge.bg}`}>
                              <BadgeIcon className="h-2.5 w-2.5" />
                              <span>{badge.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <p className={`text-xs font-bold leading-snug ${task.status === 'completed' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-[#061F48] dark:text-white'}`}>
                          {task.title}
                        </p>

                        {/* Task Footer & Move Controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700/60 text-[9px]">
                          <span className="font-extrabold text-[#061F48]/60 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 text-[#D09515]" />
                            {task.durationMinutes} mins
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Move quick dropdown for mobile or easy clicking */}
                            <select
                              value={task.status}
                              onChange={(e) => moveTask(task.id, e.target.value as any)}
                              className="bg-gray-100 dark:bg-gray-700 text-[#061F48] dark:text-gray-200 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border-none focus:outline-none cursor-pointer"
                              title="Quick move to column"
                            >
                              <option value="backlog">Backlog</option>
                              <option value="morning">Morning</option>
                              <option value="afternoon">Afternoon</option>
                              <option value="evening">Evening</option>
                              <option value="completed">Done</option>
                            </select>

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
