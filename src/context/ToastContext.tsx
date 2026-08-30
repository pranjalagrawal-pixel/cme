import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  Video, 
  Award, 
  Megaphone, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Clock 
} from 'lucide-react';

export interface Toast {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'class' | 'result' | 'announcement';
  duration?: number;
  actionText?: string;
  onAction?: () => void;
  sender?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  triggerAnnouncement: (title: string, desc: string, sender?: string) => void;
  triggerClassAlert: (className: string, subject: string, teacher: string, timeText: string, onJoin: () => void) => void;
  triggerResultAlert: (testName: string, scoreText: string, actionLabel: string, onAction: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toastInput: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toastInput.duration ?? 6000;
    const newToast: Toast = { ...toastInput, id };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerAnnouncement = (title: string, desc: string, sender = 'Admin Desk') => {
    addToast({
      title,
      description: desc,
      type: 'announcement',
      sender,
      duration: 8000
    });
  };

  const triggerClassAlert = (className: string, subject: string, teacher: string, timeText: string, onJoin: () => void) => {
    addToast({
      title: `Upcoming Class: ${subject}`,
      description: `Batch ${className} with ${teacher} starts ${timeText}.`,
      type: 'class',
      actionText: 'Join Lobby',
      onAction: onJoin,
      duration: 10000
    });
  };

  const triggerResultAlert = (testName: string, scoreText: string, actionLabel: string, onAction: () => void) => {
    addToast({
      title: 'New Test Results Published!',
      description: `${testName} result is active. Marks: ${scoreText}.`,
      type: 'result',
      actionText: actionLabel,
      onAction: onAction,
      duration: 9000
    });
  };

  // Synchronize dynamic admin announcements from localStorage to live users!
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cme_latest_announcement' && e.newValue) {
        try {
          const ann = JSON.parse(e.newValue);
          // Check if this is a newly triggered announcement (timestamp within 5 seconds)
          if (Date.now() - ann.timestamp < 5000) {
            triggerAnnouncement(ann.title, ann.description, ann.sender || 'Admin Center');
          }
        } catch (err) {
          console.error('Failed to sync announcement toast', err);
        }
      }

      if (e.key === 'cme_latest_result_event' && e.newValue) {
        try {
          const resData = JSON.parse(e.newValue);
          if (Date.now() - resData.timestamp < 5000) {
            triggerResultAlert(resData.testName, resData.scoreText, 'Review Scorecard', () => {
              const el = document.getElementById('student-academics-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            });
          }
        } catch (err) {
          console.error('Failed to sync result toast', err);
        }
      }

      if (e.key === 'cme_latest_class_alert_event' && e.newValue) {
        try {
          const classData = JSON.parse(e.newValue);
          if (Date.now() - classData.timestamp < 5000) {
            const profileRaw = localStorage.getItem('cme_student_profile');
            if (profileRaw) {
              const profile = JSON.parse(profileRaw);
              if (profile.studentClass === classData.studentClass || classData.studentClass === 'ALL') {
                triggerClassAlert(classData.studentClass, classData.subject, classData.mentor, classData.timeText, () => {
                  const el = document.getElementById('student-live-classroom-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                });
              }
            }
          }
        } catch (err) {
          console.error('Failed to sync class alert toast', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also periodically check localStorage for any new active class updates
    const interval = setInterval(() => {
      const activeRaw = localStorage.getItem('cme_active_classes_event');
      if (activeRaw) {
        try {
          const eventData = JSON.parse(activeRaw);
          if (Date.now() - eventData.timestamp < 4000) {
            // Clear event so we don't trigger multiple times
            localStorage.removeItem('cme_active_classes_event');
            
            // Format toast alert for students
            const profileRaw = localStorage.getItem('cme_student_profile');
            if (profileRaw) {
              const profile = JSON.parse(profileRaw);
              if (profile.studentClass === eventData.studentClass) {
                // Trigger toast for student
                addToast({
                  title: `🔴 Class Live: ${eventData.subject}`,
                  description: `Prof. ${eventData.teacherName} has launched the Live Room. Join now!`,
                  type: 'class',
                  actionText: 'Join Class',
                  onAction: () => {
                    // We can store a trigger flag in sessionStorage to auto-join when they go to StudentPortal
                    sessionStorage.setItem('cme_autojoin_class_id', eventData.classId);
                    window.dispatchEvent(new CustomEvent('cme_navigate_portal', { detail: '/student-portal' }));
                  },
                  duration: 15000
                });
              }
            }
          }
        } catch (err) {
          // ignore
        }
      }
    }, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'class':
        return <Video className="h-5 w-5 text-sky-500" />;
      case 'result':
        return <Award className="h-5 w-5 text-[#D09515]" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5 text-indigo-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgStyle = (type: Toast['type']) => {
    switch (type) {
      case 'class':
        return 'border-sky-500/20 bg-sky-50/95 text-sky-950 shadow-sky-100/50';
      case 'result':
        return 'border-amber-500/20 bg-amber-50/95 text-amber-950 shadow-amber-100/50';
      case 'announcement':
        return 'border-indigo-500/20 bg-indigo-50/95 text-indigo-950 shadow-indigo-100/50';
      case 'success':
        return 'border-emerald-500/20 bg-emerald-50/95 text-emerald-950 shadow-emerald-100/50';
      case 'warning':
        return 'border-amber-500/20 bg-amber-50/95 text-amber-950 shadow-amber-100/50';
      case 'error':
        return 'border-red-500/20 bg-red-50/95 text-red-950 shadow-red-100/50';
      default:
        return 'border-slate-500/20 bg-slate-50/95 text-slate-950 shadow-slate-100/50';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, triggerAnnouncement, triggerClassAlert, triggerResultAlert }}>
      {children}

      {/* TOASTS CONTAINERS */}
      <div 
        id="cme-toast-container"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-3.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
              className={`p-4 rounded-2xl border pointer-events-auto shadow-xl flex gap-3 ${getBgStyle(toast.type)} backdrop-blur-md`}
            >
              <div className="shrink-0 pt-0.5">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start gap-1">
                  <h4 className="text-xs font-black tracking-tight leading-snug">
                    {toast.title}
                  </h4>
                  {toast.sender && (
                    <span className="text-[8.5px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-700 px-1.5 py-0.2 rounded shrink-0">
                      {toast.sender}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold opacity-80 leading-relaxed">
                  {toast.description}
                </p>
                {toast.onAction && toast.actionText && (
                  <button
                    onClick={() => {
                      toast.onAction?.();
                      removeToast(toast.id);
                    }}
                    className="mt-2 bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] px-3.5 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1 shadow-sm"
                  >
                    <span>{toast.actionText}</span>
                    <Clock className="h-3 w-3" />
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 self-start p-1 text-black/40 hover:text-black/80 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
