import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Clock, 
  Sparkles, 
  Zap, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Flame, 
  Info,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface StudentProfile {
  name: string;
  studentClass: string;
}

interface UninterruptedStudyTrackerProps {
  profile: StudentProfile;
}

interface StudyBadge {
  id: string;
  name: string;
  minutesRequired: number;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export default function UninterruptedStudyTracker({ profile }: UninterruptedStudyTrackerProps) {
  const { addToast } = useToast();

  // Definition of the digital badges to earn
  const BADGES: StudyBadge[] = [
    {
      id: 'focus_apprentice',
      name: 'Focus Apprentice',
      minutesRequired: 1,
      description: 'Maintained absolute study concentration for 1 continuous minute.',
      icon: '🥉',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      id: 'zen_scholar',
      name: 'Zen Scholar',
      minutesRequired: 3,
      description: 'Maintained absolute study concentration for 3 continuous minutes.',
      icon: '🥈',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200'
    },
    {
      id: 'deep_work_champ',
      name: 'Deep Work Champion',
      minutesRequired: 5,
      description: 'Unlocked elite 5-minute uninterrupted flow block.',
      icon: '🥇',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50/40',
      borderColor: 'border-amber-300'
    },
    {
      id: 'milestone_master',
      name: 'Milestone Master',
      minutesRequired: 10,
      description: 'Excellent cognitive perseverance for 10 continuous minutes.',
      icon: '💎',
      color: 'text-[#061F48]',
      bgColor: 'bg-[#061F48]/5',
      borderColor: 'border-[#061F48]/20'
    },
    {
      id: 'flow_state_guru',
      name: 'Flow State Guru',
      minutesRequired: 15,
      description: 'Mastered 15-minute continuous board-exam focus baseline.',
      icon: '👑',
      color: 'text-[#D09515]',
      bgColor: 'bg-[#F8F5ED]',
      borderColor: 'border-[#D09515]/30'
    }
  ];

  // Tracking states
  const [secondsSpent, setSecondsSpent] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true); // active by default when on the study page
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x, 5x, 10x, 30x, 60x (for instant review!)
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState<StudyBadge | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Load earned badges from localStorage
  useEffect(() => {
    const key = `cme_uninterrupted_badges_${profile.name || 'learner'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setUnlockedBadges(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [profile.name]);

  // Tab Visibility Listener (tracks browser tab active state!)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);
      
      if (!visible) {
        // Tab hidden -> pause tracking
        addToast({
          title: '⚠️ Study Time Paused',
          description: 'Focus paused because you switched browser tabs or minimized the window.',
          type: 'info',
          duration: 3000
        });
      } else {
        // Tab visible -> resume tracking
        addToast({
          title: '⚡ Focus Resumed',
          description: 'Welcome back! Uninterrupted concentration is filling back up.',
          type: 'success',
          duration: 2500
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [addToast]);

  // Timer Interval Hook (fills up as they stay on page)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && isTabVisible) {
      interval = setInterval(() => {
        setSecondsSpent(prev => {
          const nextVal = prev + speedMultiplier;
          
          // Check for any newly earned badges
          BADGES.forEach(badge => {
            const secsNeeded = badge.minutesRequired * 60;
            if (nextVal >= secsNeeded && !unlockedBadges.includes(badge.id)) {
              // Unlock badge!
              setUnlockedBadges(current => {
                if (current.includes(badge.id)) return current;
                const newArr = [...current, badge.id];
                const key = `cme_uninterrupted_badges_${profile.name || 'learner'}`;
                localStorage.setItem(key, JSON.stringify(newArr));
                return newArr;
              });

              // Play simple synthesised web audio chime if enabled
              if (soundEnabled) {
                try {
                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
                  notes.forEach((freq, idx) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.15);
                    gain.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + idx * 0.15 + 0.4);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(audioCtx.currentTime + idx * 0.15);
                    osc.stop(audioCtx.currentTime + idx * 0.15 + 0.5);
                  });
                } catch (e) {
                  console.log('Web Audio chime not supported or gestured:', e);
                }
              }

              // Trigger celebration toast and modal popup
              addToast({
                title: `🎉 ${badge.name} Unlocked!`,
                description: `Congratulations! You maintained ${badge.minutesRequired} minutes of uninterrupted study.`,
                type: 'success',
                duration: 6000
              });
              setShowCelebration(badge);
            }
          });

          return nextVal;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isTabVisible, speedMultiplier, unlockedBadges, profile?.name, soundEnabled, addToast]);

  // Calculate current target milestone details
  const nextBadge = BADGES.find(b => !(unlockedBadges || []).includes(b.id)) || BADGES[(BADGES || []).length - 1] || BADGES[0];
  const targetSeconds = (nextBadge?.minutesRequired || 1) * 60;
  
  // Progress ratio calculation
  const progressRatio = Math.min(100, (secondsSpent / targetSeconds) * 100);

  // Format seconds to nice HH:MM:SS format
  const formatDuration = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  // Reset progress tracker
  const handleReset = () => {
    setSecondsSpent(0);
    setIsActive(true);
    addToast({
      title: '🔄 Study Clock Reset',
      description: 'Your continuous focus session timer has been reset to zero.',
      type: 'info',
      duration: 2500
    });
  };

  // Clear all earned digital badges (for complete replay testing!)
  const handleClearAllBadges = () => {
    if (window.confirm("Would you like to clear your earned badges ledger to test the lock and reward loop from scratch?")) {
      const key = `cme_uninterrupted_badges_${profile.name || 'learner'}`;
      localStorage.removeItem(key);
      setUnlockedBadges([]);
      setSecondsSpent(0);
      addToast({
        title: '🧹 Badges Cleared',
        description: 'Concentration achievements and rewards reset successfully.',
        type: 'success',
        duration: 3000
      });
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 shadow-sm p-6 md:p-8 space-y-6 relative overflow-hidden">
      
      {/* Decorative backdrop glow */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-[#F8F5ED] opacity-40 blur-3xl pointer-events-none rounded-full" />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#061F48]/5 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] text-[#D09515] px-2.5 py-0.5 rounded-full border border-[#D09515]/25">
            <Zap className="h-3.5 w-3.5 text-[#D09515] fill-current" />
            <span className="text-[9px] font-black uppercase tracking-wider">Passive Concentration Hub</span>
          </div>
          <h3 className="text-base md:text-lg font-black text-[#061F48]">Uninterrupted Study Flow Tracker</h3>
          <p className="text-[10px] text-[#061F48]/60 font-semibold leading-relaxed">
            Stay focused on this page to passively charge up your progress bar. Earn digital badges to build high cognitive stamina.
          </p>
        </div>

        {/* Live System Diagnostics / Tab Status indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab visibility status pill */}
          <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${
            !isTabVisible ? 'bg-red-50 text-red-700 border-red-200' :
            !isActive ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {!isTabVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>{!isTabVisible ? 'Tab Hidden (Paused)' : !isActive ? 'Flow Stopped' : 'Active (Focusing)'}</span>
          </div>

          {/* Sound configuration toggler */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl border border-[#061F48]/10 bg-[#F8F5ED]/60 text-[#061F48] hover:bg-white transition-colors"
            title={soundEnabled ? 'Disable Chime Sound' : 'Enable Chime Sound'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT COLUMN: ACTIVE DURATION COUNTER & PROGRESS GAUGE */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Main Stats Display */}
          <div className="bg-[#F8F5ED]/50 border border-[#061F48]/5 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Current Focus Session</span>
              <div className="text-2xl md:text-3xl font-black text-[#061F48] font-mono tracking-tight flex items-center gap-2">
                <Clock className="h-6 w-6 text-[#D09515] animate-pulse" />
                <span>{formatDuration(secondsSpent)}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Uninterrupted Level</span>
              <p className="text-sm font-black text-emerald-600 flex items-center gap-1 justify-end">
                <Flame className="h-4 w-4 fill-current text-[#D09515] border-none" />
                <span>{(unlockedBadges || []).length} Badges</span>
              </p>
            </div>
          </div>

          {/* DYNAMIC PROGRESS BAR GAUGE */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10.5px] font-black">
              <span className="text-[#061F48] flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#D09515]" />
                Next Goal: {nextBadge.name} ({nextBadge.minutesRequired}m)
              </span>
              <span className="text-[#D09515] font-mono">{progressRatio.toFixed(0)}%</span>
            </div>

            {/* Fills up smoothly! */}
            <div className="h-3.5 bg-[#F8F5ED] rounded-full overflow-hidden border border-[#061F48]/10 p-0.5 shadow-inner">
              <motion.div 
                className="h-full rounded-full bg-gradient-to-r from-[#061F48] via-[#D09515] to-amber-500 relative"
                style={{ width: `${progressRatio}%` }}
                layoutId="focusBar"
                transition={{ type: 'spring', stiffness: 40, damping: 15 }}
              >
                {/* Visual scanning line effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" style={{ backgroundSize: '200% 100%' }} />
              </motion.div>
            </div>

            <div className="flex justify-between items-center text-[9px] font-bold text-[#061F48]/40">
              <span>0 mins</span>
              <span className="text-center italic">Auto-pauses if you leave or switch tabs!</span>
              <span>{nextBadge.minutesRequired} mins</span>
            </div>
          </div>

          {/* DIAGNOSTICS & TEST DRILL CONTROLS (TEST MULTIPLIER!) */}
          <div className="bg-[#F8F5ED]/30 border border-[#061F48]/5 p-4 rounded-xl flex flex-wrap justify-between items-center gap-3">
            <div className="space-y-0.5">
              <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider block">⭐ Simulator Speed Controller</span>
              <p className="text-[9.5px] text-gray-400 font-semibold">Speed up time to test milestones and earn digital badges instantly!</p>
            </div>

            <div className="flex gap-1.5 bg-white border border-[#061F48]/15 rounded-xl p-1 shrink-0">
              {[1, 5, 20, 60].map(mult => (
                <button
                  key={mult}
                  onClick={() => setSpeedMultiplier(mult)}
                  className={`px-2 py-1 rounded-lg text-[9px] font-black transition-all ${speedMultiplier === mult ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/70 hover:bg-[#F8F5ED]'}`}
                >
                  {mult}x
                </button>
              ))}
            </div>
          </div>

          {/* Action trigger controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-md flex items-center justify-center gap-1.5 ${isActive ? 'bg-[#061F48] hover:bg-[#061F48]/90' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{isActive ? 'Pause Focus' : 'Resume Focus'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded-xl border border-[#061F48]/15 text-[#061F48] bg-white hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Reset timer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={handleClearAllBadges}
              className="text-[9px] font-black uppercase tracking-wider text-red-600 hover:underline px-2.5 py-1.5 rounded-lg hover:bg-red-50"
            >
              Clear Achievements
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: DIGITAL BADGES LEDGER & PROGRESS LOCKS */}
        <div className="lg:col-span-6 bg-[#F8F5ED]/30 border border-[#061F48]/5 p-5 md:p-6 rounded-[2rem] space-y-4">
          <div className="border-b border-[#061F48]/5 pb-2">
            <h4 className="text-xs font-black text-[#061F48] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#D09515]" />
              Study Concentration Milestones
            </h4>
          </div>

          <div className="space-y-2.5 max-h-[17.5rem] overflow-y-auto pr-1 scrollbar-none">
            {BADGES.map((badge, idx) => {
              const isEarned = unlockedBadges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    isEarned 
                      ? `${badge.bgColor} ${badge.borderColor} scale-[1.01] shadow-xs` 
                      : 'bg-white/40 border-[#061F48]/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Badge Emoji Circle */}
                    <div className={`h-11 w-11 rounded-full border flex items-center justify-center text-xl shrink-0 shadow-sm ${
                      isEarned ? `${badge.borderColor} bg-white` : 'border-gray-100 bg-gray-50'
                    }`}>
                      {isEarned ? badge.icon : '🔒'}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className={`text-[11px] font-black ${isEarned ? badge.color : 'text-gray-400'}`}>
                          {badge.name}
                        </h5>
                        {isEarned && (
                          <span className="inline-flex items-center px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[8px] font-black">
                            EARNED
                          </span>
                        )}
                      </div>
                      <p className="text-[9.5px] text-[#061F48]/60 font-semibold leading-snug">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-black font-mono text-gray-400 shrink-0">
                    {badge.minutesRequired}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* POPUP MODAL CELEBRATION */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061F48]/60 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border-2 border-[#D09515] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Confetti simulation background styling */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#061F48] via-[#D09515] to-amber-500" />
              
              <div className="text-6xl animate-bounce pt-4">
                {showCelebration.icon}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-[#D09515] tracking-widest block">
                  New Achievement Unlocked!
                </span>
                <h3 className="text-xl font-black text-[#061F48]">
                  {showCelebration.name}
                </h3>
                <p className="text-xs text-[#061F48]/70 font-semibold">
                  {showCelebration.description}
                </p>
              </div>

              <div className="bg-[#F8F5ED] border border-[#D09515]/30 p-4 rounded-2xl">
                <p className="text-[10.5px] text-[#061F48] font-bold">
                  You stayed focused on Concept Made Easy for {showCelebration.minutesRequired} minutes uninterrupted! High cognitive stamina unlocks standard pre-board excellence.
                </p>
              </div>

              <button
                onClick={() => setShowCelebration(null)}
                className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-md"
              >
                Claim Digital Badge
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
