import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, getDocs, addDoc, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export interface ClassScheduleItem {
  id: string;
  subject: string;
  topic?: string;
  studentClass: string;
  teacherName: string;
  startTime: string; // ISO 8601 string
  endTime?: string;
  platform?: string;
  meetLink?: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: 'class_update' | 'teacher_feedback';
  timestamp: string;
  read: boolean;
  sender: string;
  actionPath?: string;
  classScheduleId?: string;
  doubtId?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (noti: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) => void;
  clearAll: () => void;
  classSchedules: ClassScheduleItem[];
  scheduleLiveClass: (scheduleData: Omit<ClassScheduleItem, 'id' | 'createdAt'>) => Promise<string>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [classSchedules, setClassSchedules] = useState<ClassScheduleItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const savedRead = localStorage.getItem('cme_read_notification_ids');
      if (!savedRead) return new Set<string>();
      const parsed: unknown = JSON.parse(savedRead);
      return Array.isArray(parsed)
        ? new Set<string>(parsed.filter((value): value is string => typeof value === 'string'))
        : new Set<string>();
    } catch {
      return new Set();
    }
  });

  const rawSchedulesRef = useRef<ClassScheduleItem[]>([]);
  const rawDoubtsRef = useRef<any[]>([]);

  // Persist read IDs
  const persistReadIds = (newReadIds: Set<string>) => {
    try {
      localStorage.setItem('cme_read_notification_ids', JSON.stringify(Array.from(newReadIds)));
    } catch (e) {
      console.error('Error saving read notification ids:', e);
    }
  };

  // Clean out any legacy mock/fake notifications from localStorage on mount
  useEffect(() => {
    try {
      // Remove deprecated static keys
      const keysToRemove = [
        'cme_notifications_guest',
        'cme_latest_announcement',
        'cme_latest_class_alert_event'
      ];
      if (userProfile?.uid) {
        keysToRemove.push(`cme_notifications_${userProfile.uid}`);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      // ignore
    }
  }, [userProfile?.uid]);

  // Remove legacy demo classes that older builds seeded automatically.
  const removeLegacyDemoSchedules = async () => {
    try {
      const snap = await getDocs(collection(db, 'class_schedules'));
      const legacySubjects = new Set([
        'Physics (Gauss Law & Electrostatics)',
        'Biology (Cellular Respiration & ATP)'
      ]);
      await Promise.all(
        snap.docs
          .filter((d) => {
            const data = d.data();
            return legacySubjects.has(data.subject);
          })
          .map((d) => deleteDoc(d.ref))
      );
    } catch (err) {
      console.warn('Could not clean legacy demo class schedules:', err);
    }

    try {
      localStorage.removeItem('cme_active_classes');
      localStorage.removeItem('cme_active_classes_event');
    } catch {
      // ignore
    }
  };

  // 1. Recompute Notifications based strictly on Firestore data and the 30-minute window
  const recomputeNotifications = useCallback(() => {
    const nowMs = Date.now();
    const thirtyMinMs = nowMs + 30 * 60 * 1000;
    const fiveMinAgoMs = nowMs - 5 * 60 * 1000;

    const newNotis: NotificationItem[] = [];

    // Filter A: Live Class Schedules from Firestore
    rawSchedulesRef.current.forEach((schedule) => {
      // Must not be Completed or Cancelled
      if (schedule.status === 'Completed' || schedule.status === 'Cancelled') {
        return;
      }

      if (!schedule.startTime) return;
      const startMs = new Date(schedule.startTime).getTime();
      if (isNaN(startMs)) return;

      // STRICT WINDOW: Only upcoming classes within the next 30 minutes (and not older than 5 min ago)
      if (startMs >= fiveMinAgoMs && startMs <= thirtyMinMs) {
        const diffMs = startMs - nowMs;
        const minsLeft = Math.round(diffMs / 60000);

        let title: string;
        if (minsLeft <= 0) {
          title = `🔴 Live Class Now: ${schedule.subject}`;
        } else {
          title = `⏰ Upcoming Class in ${minsLeft}m: ${schedule.subject}`;
        }

        const id = `class_schedule_${schedule.id}`;
        const isRead = readIds.has(id);

        newNotis.push({
          id,
          title,
          description: `${schedule.topic ? `${schedule.topic} • ` : ''}Class ${schedule.studentClass} standard with Prof. ${schedule.teacherName}. ${schedule.platform ? `(${schedule.platform})` : ''}`,
          type: 'class_update',
          timestamp: schedule.startTime,
          read: isRead,
          sender: schedule.teacherName || 'Faculty Mentor',
          actionPath: '/student-portal',
          classScheduleId: schedule.id
        });
      }
    });

    // Filter B: Real Answered Doubts from Firestore
    rawDoubtsRef.current.forEach((doubt) => {
      if (doubt && doubt.status === 'Answered' && doubt.answer) {
        const answerText = typeof doubt.answer === 'string' ? doubt.answer : String(doubt.answer || '');
        const id = `doubt_feedback_${doubt.id}`;
        const isRead = readIds.has(id);

        newNotis.push({
          id,
          title: `💬 Mentor Feedback on ${doubt.subject || 'Doubt'}`,
          description: `Teacher ${doubt.solvedBy || doubt.teacherName || 'Faculty Mentor'} answered: "${(answerText || '').substring(0, 90)}${(answerText || '').length > 90 ? '...' : ''}"`,
          type: 'teacher_feedback',
          timestamp: doubt.answeredAt || doubt.respondedAt || new Date().toISOString(),
          read: isRead,
          sender: doubt.solvedBy || doubt.teacherName || 'Faculty Mentor',
          actionPath: '/student-portal',
          doubtId: doubt.id
        });
      }
    });

    // Sort descending by timestamp
    newNotis.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setNotifications(newNotis);
  }, [readIds]);

  // 2. Real-time Firestore Listener for `class_schedules`
  useEffect(() => {
    removeLegacyDemoSchedules();

    try {
      const q = collection(db, 'class_schedules');
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetched: ClassScheduleItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            fetched.push({
              id: docSnap.id,
              subject: data.subject || 'Subject Lecture',
              topic: data.topic || '',
              studentClass: data.studentClass || '10',
              teacherName: data.teacherName || 'Faculty Mentor',
              startTime: data.startTime || new Date().toISOString(),
              endTime: data.endTime,
              platform: data.platform || 'Concept Live Virtual Room',
              meetLink: data.meetLink || '/student-portal',
              status: data.status || 'Scheduled',
              createdAt: data.createdAt
            });
          });

          rawSchedulesRef.current = fetched;
          setClassSchedules(fetched);
          recomputeNotifications();
        },
        (error) => {
          console.error('Error listening to class_schedules from Firestore:', error);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error('Error setting up class_schedules Firestore listener:', e);
    }
  }, [recomputeNotifications]);

  // 3. Real-time Firestore Listener for `doubts`
  useEffect(() => {
    if (!userProfile?.uid) {
      rawDoubtsRef.current = [];
      recomputeNotifications();
      return;
    }

    try {
      const q = query(collection(db, 'doubts'), where('studentUid', '==', userProfile.uid));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const doubtsList: any[] = [];
          snapshot.forEach((docSnap) => {
            doubtsList.push({ id: docSnap.id, ...docSnap.data() });
          });
          rawDoubtsRef.current = doubtsList;
          recomputeNotifications();
        },
        (err) => {
          console.error('Error listening to doubts from Firestore:', err);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.error('Error creating doubts listener:', e);
    }
  }, [userProfile?.uid, recomputeNotifications]);

  // 4. Timer tick: Recompute every 30 seconds to update remaining minutes and purge past classes in real time
  useEffect(() => {
    const timer = setInterval(() => {
      recomputeNotifications();
    }, 30000);

    return () => clearInterval(timer);
  }, [recomputeNotifications]);

  // Context Operations
  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      persistReadIds(next);
      return next;
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (noti: Omit<NotificationItem, 'id' | 'read' | 'timestamp'>) => {
    const id = `custom_noti_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newNoti: NotificationItem = {
      ...noti,
      id,
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications((prev) => [newNoti, ...prev]);
  };

  const clearAll = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      persistReadIds(next);
      return next;
    });
    setNotifications([]);
  };

  // Helper to schedule a new live class in Firestore
  const scheduleLiveClass = async (scheduleData: Omit<ClassScheduleItem, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'class_schedules'), {
      ...scheduleData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        clearAll,
        classSchedules,
        scheduleLiveClass
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

