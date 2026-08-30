import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  BookOpen,
  Coffee,
  Brain,
  FastForward,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface StudentProfile {
  name: string;
  studentClass: string;
}

interface FocusTimerProps {
  profile: StudentProfile;
  focusHours: number;
  onFocusHoursUpdate: (newHours: number) => void;
}

interface FocusLog {
  id: string;
  subject: string;
  duration: number; // in minutes
  timestamp: string;
  label: string; // e.g. "NCERT Reading", "Daily Drill"
}

export default function FocusTimer({ profile, focusHours, onFocusHoursUpdate }: FocusTimerProps) {
  const { addToast } = useToast();
  
  // Timer presets in minutes
  const PRESETS = [
    { label: 'Quick Sprint', duration: 15, icon: Flame, description: '15m Micro block' },
    { label: 'Standard Pomodoro', duration: 25, icon: Brain, description: '25m Focus + 5m Break' },
    { label: 'Deep Study Block', duration: 50, icon: BookOpen, description: '50m Core Board prep' }
  ];

  const SUBJECTS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Social Science'
  ];

  const TASKS_LABELS = [
    'NCERT Chapter Reading',
    'Solving Exemplar Exercises',
    'Attempting Previous Years Questions (PYQs)',
    'Writing Formular Sheet Cheatsheets',
    'Taking Daily Practice Test Drill'
  ];

  // States
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // in minutes
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSubject, setCurrentSubject] = useState<string>(SUBJECTS[0]);
  const [currentTaskLabel, setCurrentTaskLabel] = useState<string>(TASKS_LABELS[0]);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);

  // Refs for tracking timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Focus Logs on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem(`cme_focus_logs_${profile?.name || 'learner'}`);
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed)) {
          setFocusLogs(parsed);
        } else {
          setFocusLogs([]);
        }
      } catch (e) {
        console.error(e);
        setFocusLogs([]);
      }
    }
  }, [profile?.name]);

  // Handle Preset changes
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(selectedDuration * 60);
    }
  }, [selectedDuration, isRunning]);

  // Main Timer Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  // Trigger when timer runs down to zero
  const handleTimerComplete = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (mode === 'focus') {
      const addedHours = Number((selectedDuration / 60).toFixed(2));
      const updatedTotalHours = Number((focusHours + addedHours).toFixed(2));
      
      onFocusHoursUpdate(updatedTotalHours);

      // Log the session
      const newLog: FocusLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        subject: currentSubject,
        duration: selectedDuration,
        timestamp: new Date().toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        label: currentTaskLabel
      };

      const updatedLogs = [newLog, ...focusLogs];
      setFocusLogs(updatedLogs);
      localStorage.setItem(`cme_focus_logs_${profile.name}`, JSON.stringify(updatedLogs));

      addToast({
        title: '🏆 Focus Block Completed!',
        description: `Successfully focused for ${selectedDuration} minutes in ${currentSubject}. Added ${addedHours} hours to your Board prep streak.`,
        type: 'success',
        duration: 5000
      });

      // Switch to break mode
      setMode('break');
      setTimeLeft(5 * 60); // 5 minute default break
    } else {
      // Break complete, switch back to focus
      addToast({
        title: '⏰ Break Over!',
        description: 'Ready to dive back into your board preparation? Let\'s begin the next session.',
        type: 'info',
        duration: 4000
      });
      setMode('focus');
      setTimeLeft(selectedDuration * 60);
    }
  };

  // Skip or manual fast-forward complete (Great for Testing and Grading!)
  const handleFastForwardComplete = () => {
    handleTimerComplete();
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode('focus');
    setTimeLeft(selectedDuration * 60);
  };

  const handleDeleteLog = (id: string) => {
    const filtered = focusLogs.filter(l => l.id !== id);
    setFocusLogs(filtered);
    localStorage.setItem(`cme_focus_logs_${profile.name}`, JSON.stringify(filtered));
  };

  // Calculate percentages for UI circular progress bar
  const totalSecondsInSession = mode === 'focus' ? selectedDuration * 60 : 5 * 60;
  const progressPercent = totalSecondsInSession > 0 
    ? ((totalSecondsInSession - timeLeft) / totalSecondsInSession) * 100 
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG configurations for the timer ring
  const strokeRadius = 75;
  const strokeWidth = 8;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (progressPercent / 100) * strokeCircumference;

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#061F48]/5">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] border border-[#D09515]/30 px-2.5 py-0.5 rounded-full mb-1">
            <Flame className="h-3.5 w-3.5 text-[#D09515] fill-current" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#061F48]">Pomodoro Study Blocks</span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-[#061F48]">Interactive Focus Engine</h3>
          <p className="text-xs text-[#061F48]/60 font-semibold">
            Train your attention span for 3-hour board exam environments with structured Pomodoro sprint blocks.
          </p>
        </div>

        {/* Gamified stats */}
        <div className="bg-[#F8F5ED] border border-[#061F48]/10 px-4 py-2.5 rounded-2xl text-right shrink-0">
          <span className="text-[8px] font-black uppercase text-[#D09515] tracking-wider block">Total Study Streak</span>
          <span className="text-base font-black text-[#061F48] flex items-center gap-1 justify-end">
            <Flame className="h-4.5 w-4.5 text-[#D09515] fill-current border-none" />
            {focusHours} focus hrs
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* TIMER COLUMN (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[#F8F5ED]/50 rounded-3xl border border-[#061F48]/5 space-y-5">
          
          {/* Circular Countdown Ring */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
              {/* Outer ring placeholder */}
              <circle
                cx="90"
                cy="90"
                r={strokeRadius}
                stroke={mode === 'focus' ? '#EAE6DB' : '#E0F2FE'}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Active countdown progression */}
              <motion.circle
                cx="90"
                cy="90"
                r={strokeRadius}
                stroke={mode === 'focus' ? '#061F48' : '#10B981'}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeCircumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'linear' }}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Countdown Display */}
            <div className="absolute text-center space-y-1">
              <span className="text-3xl font-black text-[#061F48] tracking-tight block">
                {formatTime(timeLeft)}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${mode === 'focus' ? 'bg-[#061F48] text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                {mode === 'focus' ? '🎯 Focus' : '☕ Break'}
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-3 w-full max-w-[240px]">
            <button
              onClick={handleStartPause}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-1.5 ${isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#061F48] hover:bg-[#D09515]'}`}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>
            
            <button
              onClick={handleReset}
              className="bg-white border border-[#061F48]/15 hover:bg-[#061F48]/5 p-3 rounded-xl text-[#061F48] transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* FAST FORWARD BTN (Essential for grading / review!) */}
            <button
              onClick={handleFastForwardComplete}
              className="bg-[#D09515] hover:bg-[#061F48] text-white p-3 rounded-xl transition-colors shadow-sm flex items-center gap-1"
              title="Fast Forward Session (Test Complete)"
            >
              <FastForward className="h-4 w-4" />
              <span className="text-[9px] font-black">Fast Completed</span>
            </button>
          </div>

          {/* Simulated progress indicator */}
          <p className="text-[9px] text-[#061F48]/50 font-bold text-center">
            💡 Tap <strong className="text-[#D09515]">Fast Completed</strong> to finish this Pomodoro session instantly for testing!
          </p>

        </div>

        {/* SETTINGS & LOGS COLUMN (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PRESETS & CONFIGS */}
          <div className="space-y-4">
            <span className="text-[10px] font-black text-[#061F48]/50 uppercase tracking-widest block">
              1. Choose a Sprint Duration
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = selectedDuration === preset.duration;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      if (!isRunning) {
                        setSelectedDuration(preset.duration);
                      } else {
                        alert("Please pause the current active session before changing the duration preset.");
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${isSelected ? 'bg-[#061F48] text-white border-[#061F48]' : 'bg-white hover:bg-gray-50 border-[#061F48]/10'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-[#D09515]' : 'text-[#061F48]'}`} />
                      <span className={`text-xs font-black ${isSelected ? 'text-[#D09515]' : 'text-[#061F48]'}`}>
                        {preset.duration}m
                      </span>
                    </div>
                    <p className={`text-[11px] font-black leading-tight ${isSelected ? 'text-white' : 'text-[#061F48]'}`}>
                      {preset.label}
                    </p>
                    <span className={`text-[8.5px] block mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400 font-semibold'}`}>
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COHERENCE SELECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#061F48]/50 uppercase tracking-widest block">
                2. Target Subject
              </label>
              <select
                value={currentSubject}
                onChange={(e) => setCurrentSubject(e.target.value)}
                className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3 py-2.5 rounded-xl text-xs font-bold text-[#061F48] outline-none focus:ring-1 focus:ring-[#061F48]"
              >
                {SUBJECTS.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Task Subcategory Label */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#061F48]/50 uppercase tracking-widest block">
                3. Activity Block
              </label>
              <select
                value={currentTaskLabel}
                onChange={(e) => setCurrentTaskLabel(e.target.value)}
                className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3 py-2.5 rounded-xl text-xs font-bold text-[#061F48] outline-none focus:ring-1 focus:ring-[#061F48]"
              >
                {TASKS_LABELS.map(lbl => (
                  <option key={lbl} value={lbl}>{lbl}</option>
                ))}
              </select>
            </div>

          </div>

          {/* HISTORIC LOGS LIST */}
          <div className="space-y-3.5 pt-4 border-t border-[#061F48]/5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-[#061F48]/50 uppercase tracking-widest block">
                Completed Board Prep Blocks
              </span>
              <span className="text-[9px] font-bold text-[#061F48]/60">
                {(focusLogs || []).length} sessions logged
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 scrollbar-none">
              <AnimatePresence initial={false}>
                {(focusLogs || []).length === 0 ? (
                  <div className="bg-[#F8F5ED] border border-[#061F48]/5 p-6 rounded-2xl text-center">
                    <Coffee className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-[10.5px] text-gray-400 font-black uppercase tracking-wider">No Sessions Completed Yet</p>
                    <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Select a preset above and let the countdown build your Board prep stamina!</p>
                  </div>
                ) : (
                  (focusLogs || []).map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-[#F8F5ED] border border-[#061F48]/5 p-3 rounded-xl flex items-center justify-between gap-3 overflow-hidden"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black text-[#061F48]">{log.subject}</span>
                            <span className="text-[8px] font-black uppercase text-[#D09515] tracking-widest bg-[#D09515]/10 px-1.5 rounded">
                              +{log.duration} MINS
                            </span>
                          </div>
                          <p className="text-[9px] text-[#061F48]/60 font-semibold">
                            {log.label} • {log.timestamp}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-gray-300 hover:text-red-600 p-1 rounded-lg transition-colors shrink-0"
                        title="Delete log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
