import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  BookOpen, 
  Award,
  Sparkles,
  BookMarked,
  Info
} from 'lucide-react';

interface StudentProfile {
  name: string;
  studentClass: string;
  stream?: string;
}

interface StudentCalendarProps {
  profile: StudentProfile;
  schedules?: any[]; // Schedules from getSchedulesForClass
}

interface CalendarEvent {
  id: string;
  type: 'live-class';
  title: string;
  subject: string;
  time: string;
  instructor?: string;
  syllabus?: string;
  duration?: string;
}

export default function StudentCalendar({ profile, schedules = [] }: StudentCalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  // Determine current month & year stats
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const todayDate = new Date();
    setCurrentDate(todayDate);
    setSelectedDate(todayDate);
  };

  // Helper: Number of days in the current month
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  // Helper: First day of month offset index (0 for Sunday, 1 for Monday...)
  const firstDayOffset = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  // Selected date key helper
  const getSelectedDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Only show real schedules supplied by the backend. No demo/mock classes or tests are generated here.
  const events = useMemo<Record<string, CalendarEvent[]>>(() => {
    const registry: Record<string, CalendarEvent[]> = {};

    (schedules || []).forEach((slot: any, index: number) => {
      const rawStart = slot?.startTime || slot?.start || slot?.dateTime;
      if (!rawStart) return;

      const startDate = new Date(rawStart);
      if (Number.isNaN(startDate.getTime())) return;

      const dateKey = getSelectedDateKey(startDate);
      if (!registry[dateKey]) registry[dateKey] = [];

      registry[dateKey].push({
        id: slot?.id || `real-class-${dateKey}-${index}`,
        type: 'live-class',
        title: slot?.title || slot?.topic || `Live ${slot?.subject || 'Class'}`,
        subject: slot?.subject || slot?.title || 'Class',
        time: startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        instructor: slot?.teacherName || slot?.teacher || 'Faculty Mentor',
        syllabus: slot?.syllabus || undefined,
        duration: slot?.duration || (slot?.endTime ? `${Math.max(1, Math.round((new Date(slot.endTime).getTime() - startDate.getTime()) / 60000))} mins` : undefined)
      });
    });

    return registry;
  }, [schedules]);

  // Generate day items for rendering
  const calendarDaysGrid = useMemo(() => {
    const grid = [];
    
    // Add offset days from previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      grid.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }

    // Add days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      grid.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(year, month, d)
      });
    }

    // Pad remaining space to complete full weekly rows (grid length multiple of 7)
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    return grid;
  }, [year, month, firstDayOffset, daysInMonth]);

  const selectedDateKey = getSelectedDateKey(selectedDate);
  const selectedDateEvents = events[selectedDateKey] || [];

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 shadow-sm p-6 md:p-8 space-y-6">
      
      {/* SECTION TITLE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#061F48]/5 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] text-[#D09515] px-2.5 py-0.5 rounded-full border border-[#D09515]/25">
            <Calendar className="h-3.5 w-3.5 text-[#D09515]" />
            <span className="text-[9px] font-black uppercase tracking-wider">Time Manager</span>
          </div>
          <h3 className="text-base md:text-lg font-black text-[#061F48]">Academic Prep Calendar</h3>
          <p className="text-[10px] text-[#061F48]/60 font-semibold leading-relaxed">
            Only teacher-published class schedules appear here. Demo classes are never shown.
          </p>
        </div>

        {/* Calendar Navigators */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
          <button 
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-[#061F48]/5 text-[#061F48] hover:bg-[#061F48]/10 border border-[#061F48]/10 transition-colors"
          >
            Today
          </button>
          
          <div className="flex items-center bg-[#F8F5ED] border border-[#061F48]/10 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#061F48]/70 hover:text-[#061F48] hover:bg-white transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-black text-[#061F48] min-w-[100px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#061F48]/70 hover:text-[#061F48] hover:bg-white transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: THE MONTHLY CALENDAR GRID */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center">
            {daysOfWeek.map((day, idx) => (
              <span 
                key={idx} 
                className={`text-[9px] font-black uppercase tracking-widest pb-2 ${idx === 0 || idx === 6 ? 'text-amber-600' : 'text-[#061F48]/40'}`}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Monthly grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {calendarDaysGrid.map((cell, idx) => {
              const cellKey = getSelectedDateKey(cell.date);
              const cellEvents = events[cellKey] || [];
              const hasLiveClass = cellEvents.some(e => e.type === 'live-class');
              const hasMockTest = cellEvents.some(e => e.type === 'mock-test');
              
              const isToday = cell.date.getDate() === 11 && cell.date.getMonth() === 6 && cell.date.getFullYear() === 2026;
              const isSelected = cell.date.getDate() === selectedDate.getDate() && 
                                 cell.date.getMonth() === selectedDate.getMonth() && 
                                 cell.date.getFullYear() === selectedDate.getFullYear();

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 md:p-2 border transition-all ${
                    !cell.isCurrentMonth ? 'text-gray-300 border-transparent bg-transparent opacity-40 cursor-not-allowed' :
                    isSelected ? 'bg-[#061F48] border-[#061F48] text-white shadow-md shadow-[#061F48]/15' :
                    isToday ? 'bg-amber-50 border-[#D09515] text-[#061F48] font-bold' :
                    'bg-[#F8F5ED]/40 border-[#061F48]/5 hover:border-[#061F48]/15 text-[#061F48]'
                  }`}
                  disabled={!cell.isCurrentMonth}
                >
                  {/* Day Number */}
                  <span className={`text-xs font-bold leading-none ${isToday && !isSelected ? 'text-[#D09515] font-black' : ''}`}>
                    {cell.day}
                  </span>

                  {/* Indicators representing scheduled classes/tests */}
                  {cell.isCurrentMonth && (
                    <div className="flex gap-1 justify-center w-full">
                      {hasLiveClass && (
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#061F48]'}`} />
                      )}
                      {hasMockTest && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#D09515]" />
                      )}
                    </div>
                  )}

                  {/* Decorative dot for today */}
                  {isToday && !isSelected && (
                    <span className="absolute top-1.5 right-1.5 h-1 w-1 bg-[#D09515] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Grid Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 border-t border-[#061F48]/5 text-[10px] font-bold text-[#061F48]/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#061F48]" />
              <span>Live Lectures Weekday Cycle</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#D09515]" />
              <span>Upcoming CME Board Mock Tests</span>
            </span>
            <span className="flex items-center gap-1.5 ml-auto text-[9px] text-[#061F48]/40">
              *Today is 11 Jul 2026
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: EVENTS AND DRILLS FOR SELECTED DATE */}
        <div className="lg:col-span-5 bg-[#F8F5ED]/30 border border-[#061F48]/5 p-5 md:p-6 rounded-[2rem] flex flex-col justify-between space-y-5">
          
          {/* Header of Selection Panel */}
          <div className="space-y-1 pb-3 border-b border-[#061F48]/5">
            <span className="text-[9px] font-black text-[#D09515] uppercase tracking-wider block">
              Event Breakdown for
            </span>
            <h4 className="text-sm font-black text-[#061F48]">
              {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
            </h4>
          </div>

          {/* Events List */}
          <div className="space-y-3 flex-grow overflow-y-auto max-h-[15.5rem] pr-1 scrollbar-none">
            {(selectedDateEvents || []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 min-h-[140px]">
                <div className="h-10 w-10 bg-[#061F48]/5 rounded-full flex items-center justify-center text-[#061F48]/30">
                  <BookMarked className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-[#061F48]/60">No Academic Events Scheduled</p>
                <p className="text-[9px] text-[#061F48]/40 max-w-[180px] leading-relaxed">
                  Use this time for self-study, doubt formulation, or finishing chapter checklists below!
                </p>
              </div>
            ) : (
              (selectedDateEvents || []).map((evt, idx) => {
                const isClass = evt.type === 'live-class';
                return (
                  <div 
                    key={evt.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 bg-white border-[#061F48]/10 hover:border-[#061F48]/20`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className={`inline-flex px-1.5 py-0.2 rounded text-[8px] font-black uppercase mb-1 bg-[#061F48]/5 text-[#061F48]`}>
                          💻 Lecture
                        </span>
                        <h5 className="text-[11.5px] font-black text-[#061F48] leading-tight">
                          {evt.title}
                        </h5>
                      </div>

                      <span className="text-[9px] font-bold text-[#061F48]/50 shrink-0">
                        {evt.duration}
                      </span>
                    </div>

                    {/* Meta info block */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1.5 border-t border-[#061F48]/5 text-[10px] text-[#061F48]/60">
                      <p className="flex items-center gap-1 font-semibold col-span-2">
                        <Clock className="h-3 w-3 text-[#D09515]" />
                        <span>Scheduled: {evt.time}</span>
                      </p>
                      
                      {evt.instructor && (
                        <p className="flex items-center gap-1 font-semibold">
                          <span className="font-extrabold text-[#061F48]/40 text-[9px] uppercase">By:</span>
                          <span className="truncate max-w-[100px]">{evt.instructor}</span>
                        </p>
                      )}

                      <p className="flex items-center gap-1 font-semibold justify-end">
                        <span className="font-extrabold text-[#061F48]/40 text-[9px] uppercase">Topic:</span>
                        <span className="truncate max-w-[90px] text-[#D09515]">{evt.subject}</span>
                      </p>
                    </div>

                    {evt.syllabus && (
                      <p className="text-[9.5px] text-[#061F48]/50 leading-relaxed italic bg-white/20 p-1.5 rounded border border-[#061F48]/5">
                        💡 {evt.syllabus}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick study prompt */}
          <div className="pt-2 border-t border-[#061F48]/5 flex items-center gap-2 text-[10px] font-bold text-[#061F48]/50">
            <Info className="h-4 w-4 text-[#D09515] shrink-0" />
            <span>Click any day to organize your revision milestones dynamically!</span>
          </div>

        </div>

      </div>

    </div>
  );
}
