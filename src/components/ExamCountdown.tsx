import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Flame, 
  Sparkles, 
  Award, 
  Pin, 
  BookOpen, 
  ChevronRight, 
  CheckSquare, 
  Target,
  Hourglass
} from 'lucide-react';

interface ExamInfo {
  id: string;
  name: string;
  fullName: string;
  date: Date;
  startDate: Date;
  color: string;
  category: 'engineering' | 'medical' | 'boards';
  syllabusTips: string[];
}

const EXAMS_DATA: ExamInfo[] = [
  {
    id: 'jee-main',
    name: 'JEE Main 2027 (Phase 1)',
    fullName: 'Joint Entrance Examination Main (Session 1)',
    date: new Date('2027-01-24T09:00:00'),
    startDate: new Date('2026-06-01T00:00:00'),
    color: '#061F48',
    category: 'engineering',
    syllabusTips: [
      'Master mechanics and electrostatics in Physics.',
      'Revise Coordinate Geometry and Integral Calculus daily.',
      'Focus on Inorganic Chemistry NCERT exceptions.'
    ]
  },
  {
    id: 'cbse-boards',
    name: 'CBSE Class 12 Boards 2027',
    fullName: 'CBSE Senior Secondary Board Examination',
    date: new Date('2027-02-15T09:00:00'),
    startDate: new Date('2026-06-01T00:00:00'),
    color: '#D09515',
    category: 'boards',
    syllabusTips: [
      'Practice derivation steps carefully for NCERT step-marking.',
      'Solve previous 10 years of board question papers.',
      'Focus on high-weightage topics like Organic Chemistry and Calculus.'
    ]
  },
  {
    id: 'neet-ug',
    name: 'NEET UG 2027',
    fullName: 'National Eligibility cum Entrance Test Under Graduate',
    date: new Date('2027-05-02T10:00:00'),
    startDate: new Date('2026-06-01T00:00:00'),
    color: '#10B981',
    category: 'medical',
    syllabusTips: [
      'Aim to finish 90 Biology MCQs in under 40 minutes.',
      'Practice direct NCERT-based assertions & reasons.',
      'Focus on high-yield sections like Genetics, Ecology, and Mechanics.'
    ]
  },
  {
    id: 'jee-adv',
    name: 'JEE Advanced 2027',
    fullName: 'Joint Entrance Examination Advanced',
    date: new Date('2027-05-30T09:00:00'),
    startDate: new Date('2026-06-01T00:00:00'),
    color: '#EF4444',
    category: 'engineering',
    syllabusTips: [
      'Solve multi-concept problems combining 2 or 3 distinct topics.',
      'Build physical clarity over mechanical formula memorization.',
      'Practice previous JEE Advanced integer and matrix-match questions.'
    ]
  }
];

export default function ExamCountdown() {
  const [pinnedExamId, setPinnedExamId] = useState<string>(() => {
    return localStorage.getItem('cme_pinned_exam') || 'jee-main';
  });
  const [selectedExamId, setSelectedExamId] = useState<string>(pinnedExamId);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Real-time ticking effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeExam = EXAMS_DATA.find(exam => exam.id === selectedExamId) || EXAMS_DATA[0];

  // Pin / Set Default Exam
  const handlePinExam = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedExamId(id);
    localStorage.setItem('cme_pinned_exam', id);
  };

  // Calculations
  const calculateTimeLeft = (targetDate: Date) => {
    const diff = targetDate.getTime() - currentTime.getTime();
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, totalMs: diff };
  };

  const timeLeft = calculateTimeLeft(activeExam.date);

  // Prep progress bar percentage (how much time has passed out of total available prep time)
  const calculatePrepProgress = (startDate: Date, targetDate: Date) => {
    const totalTime = targetDate.getTime() - startDate.getTime();
    const elapsed = currentTime.getTime() - startDate.getTime();
    if (elapsed <= 0) return 0;
    if (elapsed >= totalTime) return 100;
    return Math.round((elapsed / totalTime) * 100);
  };

  const prepProgress = calculatePrepProgress(activeExam.startDate, activeExam.date);

  // Auto scroll helpers
  const scrollToCard = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Custom visual categories styling
  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'engineering':
        return {
          bg: 'bg-blue-50/50 dark:bg-blue-950/20',
          border: 'border-blue-100 dark:border-blue-900/30',
          text: 'text-blue-700 dark:text-blue-300',
          indicator: 'bg-blue-600'
        };
      case 'medical':
        return {
          bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
          border: 'border-emerald-100 dark:border-emerald-900/30',
          text: 'text-emerald-700 dark:text-emerald-300',
          indicator: 'bg-emerald-600'
        };
      default:
        return {
          bg: 'bg-amber-50/50 dark:bg-amber-950/20',
          border: 'border-amber-100 dark:border-amber-900/30',
          text: 'text-amber-700 dark:text-amber-300',
          indicator: 'bg-[#D09515]'
        };
    }
  };

  const catTheme = getCategoryTheme(activeExam.category);

  return (
    <div className="bg-white dark:bg-[#09152E] rounded-[2rem] border border-[#061F48]/10 dark:border-white/10 p-6 md:p-8 shadow-sm relative overflow-hidden transition-all duration-300">
      
      {/* Visual Ambient Blur Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#D09515]/10 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-[#061F48]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#061F48]/5 dark:border-white/5 relative z-10">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#061F48]/5 dark:bg-white/5 text-[#061F48] dark:text-white px-3 py-1 rounded-full border border-[#061F48]/10 dark:border-white/10">
            <Flame className="h-4 w-4 text-[#D09515] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider">Exam Prep Hub</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#061F48] dark:text-[#F8F5ED] tracking-tight mt-2 flex items-center gap-2">
            <span>Competitive Exam Countdown</span>
            <Sparkles className="h-5 w-5 text-[#D09515]" />
          </h2>
          <p className="text-xs text-[#061F48]/60 dark:text-[#F8F5ED]/60 mt-1 font-semibold">
            Track days remaining and streamline your concept-based revision strategies.
          </p>
        </div>

        {/* Dynamic Exam Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {EXAMS_DATA.map((exam) => {
            const isSelected = exam.id === selectedExamId;
            const isPinned = exam.id === pinnedExamId;
            return (
              <button
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className={`relative px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer outline-none ${
                  isSelected 
                    ? 'bg-[#061F48] text-white shadow-md' 
                    : 'bg-[#F8F5ED] hover:bg-[#F8F5ED]/80 dark:bg-white/5 dark:hover:bg-white/10 text-[#061F48]/80 dark:text-[#F8F5ED]/80 border border-transparent hover:border-[#061F48]/10'
                }`}
              >
                <span>{exam.id === 'cbse-boards' ? 'Boards' : exam.id.toUpperCase().replace('-', ' ')}</span>
                
                {/* Pinned Marker or Interactive Pin */}
                <span 
                  onClick={(e) => handlePinExam(exam.id, e)}
                  className={`p-0.5 rounded hover:bg-white/15 transition-colors ${
                    isPinned ? 'text-[#D09515]' : isSelected ? 'text-white/40 hover:text-white' : 'text-[#061F48]/30 dark:text-[#F8F5ED]/30 hover:text-[#061F48]/70'
                  }`}
                  title={isPinned ? "Primary Target" : "Set as primary target"}
                >
                  <Pin className={`h-3 w-3 ${isPinned ? 'fill-[#D09515] stroke-[#D09515]' : ''}`} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Countdown Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center relative z-10">
        
        {/* BIG COUNTDOWN TIMER DISPLAY (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-1.5 bg-[#F8F5ED]/50 dark:bg-white/2 rounded-[1.5rem] border border-[#061F48]/5 dark:border-white/5">
            <div className="bg-white dark:bg-[#07132B] rounded-2xl border border-[#061F48]/10 dark:border-white/10 p-5 md:p-6 grid grid-cols-4 gap-2 md:gap-4 text-center">
              
              {/* DAYS */}
              <div className="space-y-1">
                <div className="bg-gradient-to-b from-[#F8F5ED] to-white dark:from-white/5 dark:to-white/0 border border-[#061F48]/5 dark:border-white/5 rounded-xl py-3.5 px-2 md:px-4">
                  <span className="text-2xl md:text-4xl lg:text-5xl font-black text-[#061F48] dark:text-[#F8F5ED] font-mono block tracking-tight">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] md:text-xs font-black text-[#061F48]/50 dark:text-[#F8F5ED]/50 uppercase tracking-widest block">
                  Days
                </span>
              </div>

              {/* HOURS */}
              <div className="space-y-1">
                <div className="bg-gradient-to-b from-[#F8F5ED] to-white dark:from-white/5 dark:to-white/0 border border-[#061F48]/5 dark:border-white/5 rounded-xl py-3.5 px-2 md:px-4">
                  <span className="text-2xl md:text-4xl lg:text-5xl font-black text-[#D09515] font-mono block tracking-tight">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] md:text-xs font-black text-[#061F48]/50 dark:text-[#F8F5ED]/50 uppercase tracking-widest block">
                  Hours
                </span>
              </div>

              {/* MINUTES */}
              <div className="space-y-1">
                <div className="bg-gradient-to-b from-[#F8F5ED] to-white dark:from-white/5 dark:to-white/0 border border-[#061F48]/5 dark:border-white/5 rounded-xl py-3.5 px-2 md:px-4">
                  <span className="text-2xl md:text-4xl lg:text-5xl font-black text-[#061F48] dark:text-[#F8F5ED] font-mono block tracking-tight">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] md:text-xs font-black text-[#061F48]/50 dark:text-[#F8F5ED]/50 uppercase tracking-widest block">
                  Mins
                </span>
              </div>

              {/* SECONDS */}
              <div className="space-y-1">
                <div className="bg-gradient-to-b from-[#F8F5ED] to-white dark:from-white/5 dark:to-white/0 border border-[#061F48]/5 dark:border-white/5 rounded-xl py-3.5 px-2 md:px-4">
                  <span className="text-2xl md:text-4xl lg:text-5xl font-black text-[#D09515] font-mono block tracking-tight w-full animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] md:text-xs font-black text-[#061F48]/50 dark:text-[#F8F5ED]/50 uppercase tracking-widest block">
                  Secs
                </span>
              </div>

            </div>
          </div>

          {/* PREPARATION TIMELINE PROGRESS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-[#061F48] dark:text-[#F8F5ED] flex items-center gap-1">
                <Hourglass className="h-3.5 w-3.5 text-[#D09515] animate-spin" style={{ animationDuration: '4s' }} />
                Academic Prep Journey Elapsed
              </span>
              <span className="font-black text-[#D09515] bg-[#D09515]/10 px-2 py-0.5 rounded-full">{prepProgress}% Passed</span>
            </div>
            
            <div className="relative h-3 bg-[#F8F5ED] dark:bg-white/5 rounded-full border border-[#061F48]/5 dark:border-white/5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${prepProgress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#061F48] to-[#D09515] rounded-full"
              />
              {/* Highlight anchor pointer */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-md border border-[#D09515]"
                style={{ left: `calc(${prepProgress}% - 3px)` }}
              />
            </div>
            
            <div className="flex justify-between text-[9px] font-black text-[#061F48]/40 dark:text-[#F8F5ED]/40 uppercase tracking-wider">
              <span>Start of Preparation (June '26)</span>
              <span>D-Day ({activeExam.date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })})</span>
            </div>
          </div>
        </div>

        {/* SIDE BAR / SYLLABUS TIPS & MOTIVATIONAL HUB (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-5 rounded-2xl border ${catTheme.bg} ${catTheme.border} space-y-3.5`}>
            
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg ${catTheme.indicator} text-white`}>
                <Target className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[#061F48] dark:text-[#F8F5ED]">
                  Target Syllabus Strategy
                </h4>
                <p className="text-[10px] text-[#061F48]/60 dark:text-[#F8F5ED]/60 font-semibold leading-none">
                  Tailored revision points from mentors
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {(activeExam?.syllabusTips || []).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="mt-1 flex-shrink-0">
                    <CheckSquare className="h-3.5 w-3.5 text-[#D09515]" />
                  </span>
                  <p className="text-[11px] font-semibold text-[#061F48]/80 dark:text-[#F8F5ED]/90 leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Master Actions */}
            <div className="pt-3 border-t border-[#061F48]/5 dark:border-white/5 flex gap-2">
              <button
                onClick={() => {
                  const el = document.getElementById('focus-timer-card');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    scrollToCard('student-academics-card');
                  }
                }}
                className="flex-1 bg-[#061F48] hover:bg-[#D09515] text-white py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <Clock className="h-3 w-3" />
                <span>Focus Revise</span>
              </button>
              <button
                onClick={() => scrollToCard('student-academics-card')}
                className="flex-1 bg-white hover:bg-[#F8F5ED] dark:bg-white/5 dark:hover:bg-white/10 text-[#061F48] dark:text-white border border-[#061F48]/15 dark:border-white/10 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <BookOpen className="h-3 w-3" />
                <span>Syllabus Tracker</span>
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Real-time Ticker Subtitle Status indicator */}
      <div className="mt-4 pt-4 border-t border-[#061F48]/5 dark:border-white/5 flex flex-wrap justify-between items-center text-[10px] text-[#061F48]/50 dark:text-[#F8F5ED]/50 font-bold gap-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Real-time Countdown Ticker Active
        </span>
        <span>
          Exam Date: <strong className="text-[#061F48] dark:text-[#F8F5ED]">{activeExam.fullName}</strong> — {activeExam.date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

    </div>
  );
}
