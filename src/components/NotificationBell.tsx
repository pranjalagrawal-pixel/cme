import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Check, 
  Trash2, 
  MessageSquare, 
  BookOpen, 
  Clock, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useNotifications, NotificationItem } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'teacher_feedback':
        return (
          <div className="h-8 w-8 rounded-xl bg-amber-50 text-[#D09515] flex items-center justify-center shrink-0 border border-amber-500/10">
            <MessageSquare className="h-4 w-4" />
          </div>
        );
      case 'class_update':
      default:
        return (
          <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-500/10">
            <BookOpen className="h-4 w-4" />
          </div>
        );
    }
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="relative" ref={containerRef} id="cme-notification-bell-container">
      {/* BELL TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-[#F8F5ED] border border-[#061F48]/10 hover:border-[#D09515] text-[#061F48] hover:text-[#D09515] transition-all duration-250 cursor-pointer shadow-sm active:scale-95"
        aria-label="Toggle notifications menu"
        id="cme-notification-bell-btn"
      >
        <Bell className="h-5 w-5" />
        
        {/* Glow Badge Indicator */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white font-black text-[9px] flex items-center justify-center border-2 border-[#F8F5ED] shadow-md animate-pulse"
            >
              {unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* DROPDOWN CONTAINER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl border border-[#061F48]/15 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#061F48] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-[#D09515]" />
                <span className="font-sans font-black text-xs tracking-wider uppercase">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#D09515]/20 text-[#D09515] border border-[#D09515]/30 px-2 py-0.5 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    markAllAsRead();
                  }}
                  className="text-[9.5px] font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white hover:text-[#D09515] transition-all px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>

            {/* List Body */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#061F48]/5">
              {(notifications || []).length > 0 ? (
                (notifications || []).map((noti) => (
                  <div
                    key={noti.id}
                    onClick={() => {
                      if (!noti.read) {
                        markAsRead(noti.id);
                      }
                    }}
                    className={`p-4 flex gap-3 transition-colors duration-200 cursor-pointer text-left relative ${
                      noti.read 
                        ? 'bg-white hover:bg-[#F8F5ED]/60 text-[#061F48]/80' 
                        : 'bg-indigo-50/20 hover:bg-indigo-50/45 text-[#061F48]'
                    }`}
                  >
                    {/* Unread Glow Dot Indicator */}
                    {!noti.read && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-lg" />
                    )}

                    {getNotificationIcon(noti.type)}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#D09515]">
                          {noti.sender}
                        </span>
                        <div className="flex items-center gap-1 text-[9.5px] text-gray-400 font-bold">
                          <Clock className="h-3 w-3" />
                          <span>{getRelativeTime(noti.timestamp)}</span>
                        </div>
                      </div>

                      <h4 className={`text-xs tracking-tight ${noti.read ? 'font-bold' : 'font-black'}`}>
                        {noti.title}
                      </h4>
                      
                      <p className="text-[11px] leading-relaxed text-gray-500 font-medium font-sans">
                        {noti.description}
                      </p>

                      {noti.actionPath && (
                        <div className="pt-1">
                          <Link
                            to={noti.actionPath}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase text-[#061F48] hover:text-[#D09515] transition-colors"
                          >
                            <span>Open Desk</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                /* Empty State */
                <div className="p-8 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center mx-auto border border-slate-100">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-700">Inbox is clean!</p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      We'll ping you as soon as teachers answer doubts or post schedule updates.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {(notifications || []).length > 0 && (
              <div className="p-3 bg-[#F8F5ED] border-t border-[#061F48]/10 flex justify-between items-center">
                <p className="text-[9px] font-semibold text-gray-400">
                  Concept Made Easy Updates
                </p>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your notification history?")) {
                      clearAll();
                    }
                  }}
                  className="text-[9.5px] font-black uppercase tracking-wider text-red-600 hover:text-red-800 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
