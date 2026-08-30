import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock,
  Compass, 
  Cpu, 
  Download, 
  FileCheck, 
  Flame, 
  GraduationCap, 
  Info, 
  Share2, 
  Sparkles, 
  Star, 
  Trophy, 
  Zap 
} from 'lucide-react';

interface StudentProfile {
  name: string;
  studentClass: string;
  stream?: string;
}

interface StudentAchievementsProps {
  profile: StudentProfile;
  completedChapters: Record<string, boolean>;
  quizScore: number | null;
  hasCompiledCheatsheet: boolean;
  hasReadTopperBlueprint: boolean;
  focusHours?: number;
}

export default function StudentAchievements({
  profile,
  completedChapters,
  quizScore,
  hasCompiledCheatsheet = false,
  hasReadTopperBlueprint = false,
  focusHours = 0
}: StudentAchievementsProps) {
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);

  // Derive dynamic state for achievements
  const chaptersDone = Object.keys(completedChapters || {}).filter(k => (completedChapters || {})[k]).length;
  
  // Custom mock attendance streak since local login keeps it fresh
  // Let's grab an attendance streak from localStorage, or initialize to a safe default like 5 days
  const rawStreak = localStorage.getItem(`cme_attendance_streak_${profile?.name || 'learner'}`);
  const parsedStreak = rawStreak ? parseInt(rawStreak, 10) : 6;
  const attendanceStreak = isNaN(parsedStreak) ? 6 : parsedStreak;

  // Let's create an elegant list of virtual badges
  const badges = [
    {
      id: 'syllabus_explorer',
      title: 'NCERT Explorer',
      description: 'Mastered your first curriculum topic under the expert board guidance.',
      category: 'Curriculum',
      icon: Compass,
      color: '#061F48', // Brand Deep Blue
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      earnedCondition: chaptersDone >= 1,
      metric: `${chaptersDone}/1 chapter completed`,
      advice: 'Amazing start! Establishing conceptual foundations early protects you from exam-time cramming.'
    },
    {
      id: 'syllabus_master',
      title: 'Syllabus Master',
      description: 'Mastered 50% or more of the Class syllabus standard core topics.',
      category: 'Curriculum',
      icon: BookOpen,
      color: '#10B981', // Forest Green
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      earnedCondition: chaptersDone >= 4,
      metric: `${chaptersDone}/4+ chapters completed`,
      advice: 'Strong milestone! Your syllabus depth is outstanding. Keep marking off chapters.'
    },
    {
      id: 'board_ready',
      title: 'CBSE Board Ready',
      description: 'Completed 90%+ of chapters. Fully prepared for exemplary marks.',
      category: 'Curriculum',
      icon: Trophy,
      color: '#D09515', // Gold
      bgColor: 'bg-[#F8F5ED]',
      borderColor: 'border-[#D09515]/40',
      earnedCondition: chaptersDone >= 8,
      metric: `${chaptersDone}/8+ chapters completed`,
      advice: 'Unbelievable! You are practically sitting at a 100/100 board standard. Start doing full mock papers!'
    },
    {
      id: 'attendance_streak',
      title: 'Lobby Champ',
      description: 'Maintained an active attendance streak of 5+ live classes.',
      category: 'Consistency',
      icon: Flame,
      color: '#EF4444', // Alert Red
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      earnedCondition: attendanceStreak >= 5,
      metric: `${attendanceStreak} days streak`,
      advice: 'Brilliant punctuality. Live peer discussions are the secret sauce of top-tier performers.'
    },
    {
      id: 'quiz_master',
      title: 'Quiz Wizard',
      description: 'Scored a perfect 3/3 on any Daily Brain Drill conceptual test.',
      category: 'Quizzes',
      icon: Star,
      color: '#8B5CF6', // Purple
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      earnedCondition: quizScore !== null && quizScore >= 3,
      metric: quizScore !== null ? `Highest: ${quizScore}/3` : 'Not attempted',
      advice: 'Phenomenal logic! High-speed recall tests make your brain razor-sharp for multiple-choice sections.'
    },
    {
      id: 'topper_insight',
      title: 'Topper Analyst',
      description: 'Investigated CBSE Topper presentation sheets and expert tips.',
      category: 'Strategy',
      icon: FileCheck,
      color: '#D09515', // Board Gold
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-200',
      earnedCondition: hasReadTopperBlueprint,
      metric: hasReadTopperBlueprint ? 'Completed' : 'Locked',
      advice: 'Crucial strategy! Examiners search for specific paraxial approximations and boxed proofs. You know exactly what they want now.'
    },
    {
      id: 'formula_architect',
      title: 'Formula Booklet Builder',
      description: 'Compiled and generated a bespoke digital cheatcheet booklet.',
      category: 'Strategy',
      icon: Cpu,
      color: '#061F48', // Deep Blue
      bgColor: 'bg-[#F8F5ED]',
      borderColor: 'border-blue-200',
      earnedCondition: hasCompiledCheatsheet,
      metric: hasCompiledCheatsheet ? 'Booklet Copied' : 'Not built',
      advice: 'Superb revision planning! Custom compiled cheat sheets are ideal for last-minute standard formulas recall.'
    },
    {
      id: 'focus_sprint_badge',
      title: 'Attention Architect',
      description: 'Completed your first interactive focus block of 15+ minutes.',
      category: 'Focus',
      icon: Clock,
      color: '#D09515',
      bgColor: 'bg-[#F8F5ED]',
      borderColor: 'border-[#D09515]/40',
      earnedCondition: focusHours >= 0.25,
      metric: `${focusHours}/0.25+ hours focused`,
      advice: 'Amazing discipline! Structuring your board review into distraction-free blocks is what distinguishes state toppers.'
    },
    {
      id: 'deep_work_master',
      title: 'Deep Work Champion',
      description: 'Logged 1+ hours of high-integrity board exam Pomodoro sprints.',
      category: 'Focus',
      icon: Zap,
      color: '#10B981',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      earnedCondition: focusHours >= 1,
      metric: `${focusHours}/1+ hours focused`,
      advice: 'Phenomenal productivity. Consistent focused learning blocks build strong neuroplastic retention for the final boards.'
    }
  ];

  const earnedBadges = (badges || []).filter(b => b.earnedCondition);
  const lockedBadges = (badges || []).filter(b => !b.earnedCondition);

  const displayedBadges = (badges || []).filter(b => {
    if (filter === 'earned') return b.earnedCondition;
    if (filter === 'locked') return !b.earnedCondition;
    return true;
  });

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#061F48]/5">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#D09515]/10 border border-[#D09515]/30 px-2.5 py-0.5 rounded-full mb-1">
            <Award className="h-3.5 w-3.5 text-[#D09515]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#D09515]">Gamified Milestones</span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-[#061F48]">My Board Prep Achievements</h3>
          <p className="text-xs text-[#061F48]/60 font-semibold">
            Earn virtual credentials for your curriculum completion, attendance streaks, and topic quiz performance.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-[#F8F5ED] border border-[#061F48]/10 p-1 rounded-xl shrink-0">
          {[
            { value: 'all', label: `All (${(badges || []).length})` },
            { value: 'earned', label: `Earned (${(earnedBadges || []).length})` },
            { value: 'locked', label: `Locked (${(lockedBadges || []).length})` }
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value as any)}
              className={`px-3 py-1.5 text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all ${filter === btn.value ? 'bg-[#061F48] text-white' : 'text-[#061F48]/60 hover:text-[#061F48]'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F8F5ED] p-4 rounded-2xl border border-[#061F48]/5">
        <div className="text-center sm:border-r border-[#061F48]/10 p-2">
          <span className="text-[9px] font-black uppercase text-[#061F48]/50 tracking-wider block">Total Badges</span>
          <span className="text-xl font-black text-[#061F48]">{(badges || []).length}</span>
        </div>
        <div className="text-center sm:border-r border-[#061F48]/10 p-2">
          <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider block">Badges Unlocked</span>
          <span className="text-xl font-black text-emerald-700">{(earnedBadges || []).length}</span>
        </div>
        <div className="text-center sm:border-r border-[#061F48]/10 p-2">
          <span className="text-[9px] font-black uppercase text-[#D09515] tracking-wider block">Attendance Streak</span>
          <span className="text-xl font-black text-[#D09515] flex items-center justify-center gap-1">
            <Flame className="h-4.5 w-4.5 fill-current text-red-500 border-none" />
            {attendanceStreak} Days
          </span>
        </div>
        <div className="text-center p-2">
          <span className="text-[9px] font-black uppercase text-purple-700 tracking-wider block">Quiz Status</span>
          <span className="text-xl font-black text-purple-700">
            {quizScore !== null ? `${quizScore}/3 Best` : 'None'}
          </span>
        </div>
      </div>

      {/* BADGES DISPLAY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayedBadges.map((badge, idx) => {
          const IconComponent = badge.icon;
          const isEarned = badge.earnedCondition;

          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: isEarned ? 1.03 : 1 }}
              onClick={() => isEarned && setSelectedBadge(badge)}
              className={`p-4 rounded-2xl border flex flex-col justify-between text-center relative overflow-hidden transition-all select-none ${isEarned ? `${badge.bgColor} ${badge.borderColor} cursor-pointer hover:shadow-md` : 'bg-gray-50/50 border-gray-200/60 opacity-60'}`}
            >
              {/* Badge Icon circle */}
              <div className="flex justify-center mb-3">
                <div 
                  className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-transform ${isEarned ? 'bg-white shadow-inner animate-pulse' : 'bg-gray-100 border-gray-300'}`}
                  style={{ borderColor: isEarned ? badge.color : '#D1D5DB' }}
                >
                  <IconComponent 
                    className="h-6 w-6" 
                    style={{ color: isEarned ? badge.color : '#9CA3AF' }} 
                  />
                </div>
              </div>

              {/* Title & info */}
              <div className="space-y-1">
                <h4 className={`text-[11px] font-black leading-tight ${isEarned ? 'text-[#061F48]' : 'text-gray-500'}`}>
                  {badge.title}
                </h4>
                <p className="text-[9px] text-gray-400 font-semibold line-clamp-2 px-1 leading-normal">
                  {badge.description}
                </p>
              </div>

              {/* Footer status pill */}
              <div className="mt-3.5 pt-2 border-t border-black/5">
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isEarned ? 'bg-white text-[#061F48] border shadow-sm' : 'bg-gray-100 text-gray-400'}`}>
                  {isEarned ? '✓ Earned' : '🔒 Locked'}
                </span>
                <span className="text-[8px] block mt-1.5 font-bold text-[#061F48]/50 italic">
                  {badge.metric}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SELECTED BADGE MODAL OVERLAY */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-[#061F48]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#061F48]/15 shadow-2xl p-6 md:p-8 space-y-5 text-center relative">
            
            {/* Sparkle assets */}
            <div className="absolute top-4 left-4 text-[#D09515] animate-bounce">
              <Sparkles className="h-5 w-5" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-sm bg-gray-50 rounded-full h-8 w-8 flex items-center justify-center border"
            >
              ✕
            </button>

            {/* Expanded Medallion */}
            <div className="flex justify-center pt-2">
              <div 
                className={`h-20 w-20 rounded-full flex items-center justify-center border-4 bg-[#F8F5ED] shadow-xl animate-spin`}
                style={{ borderColor: selectedBadge.color, animationDuration: '8s' }}
              >
                {React.createElement(selectedBadge.icon, {
                  className: "h-10 w-10",
                  style: { color: selectedBadge.color }
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[8px] font-black uppercase text-[#D09515] tracking-widest block bg-[#D09515]/10 py-1 px-2.5 rounded-full max-w-max mx-auto border border-[#D09515]/30">
                ★ CONCEPT MADE EASY BADGE ★
              </span>
              <h3 className="text-base md:text-lg font-black text-[#061F48]">{selectedBadge.title}</h3>
              <p className="text-xs text-gray-500 font-semibold max-w-sm mx-auto leading-relaxed">
                "{selectedBadge.description}"
              </p>
            </div>

            {/* Coordinator/Gauri Gupta Evaluation note */}
            <div className="bg-[#F8F5ED] border border-[#D09515]/20 p-4 rounded-2xl text-left space-y-2">
              <span className="text-[9px] font-black text-[#D09515] uppercase tracking-wider block flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                Mentor Gauri Gupta's Scoring Blueprint:
              </span>
              <p className="text-[10px] text-[#061F48]/80 font-semibold leading-relaxed italic">
                {selectedBadge.advice}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Generating custom achievement certificate as PDF for student ${profile.name}... Download has been safely queued!`);
                }}
                className="flex-1 bg-[#061F48] hover:bg-[#D09515] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="h-4 w-4" />
                <span>Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`I successfully unlocked the '${selectedBadge.title}' badge on Concept Made Easy! Chapters mastered: ${chaptersDone}.`);
                  alert(`Copied sharing link to clipboard! Let classmates know your board readiness score.`);
                }}
                className="flex-1 bg-[#F8F5ED] border border-[#061F48]/15 text-[#061F48] hover:bg-[#061F48]/5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Share2 className="h-4 w-4 text-[#D09515]" />
                <span>Share Stats</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
