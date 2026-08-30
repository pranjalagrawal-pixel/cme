import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Sparkles, Zap } from 'lucide-react';

const STAGES = [
  { at: 18, label: 'Preparing your learning environment', icon: BookOpen },
  { at: 48, label: 'Loading classes, tests & study tools', icon: GraduationCap },
  { at: 78, label: 'Connecting your CME experience', icon: Zap },
  { at: 100, label: 'Everything is ready. Let’s learn.', icon: Sparkles },
];

export default function StartupLoadingScreen({ onComplete, forceShow = false }: { onComplete?: () => void; forceShow?: boolean }) {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  const finish = React.useCallback(() => {
    sessionStorage.setItem('cme_startup_seen', 'true');
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const seen = sessionStorage.getItem('cme_startup_seen') === 'true';
    const skip = localStorage.getItem('cme_startup_skip_always') === 'true';
    if (seen && skip && !forceShow) { setVisible(false); return; }
    const start = Date.now();
    const duration = 2400;
    const timer = window.setInterval(() => {
      const next = Math.min(100, Math.floor(((Date.now() - start) / duration) * 100));
      setProgress(next);
      if (next >= 100) {
        window.clearInterval(timer);
        window.setTimeout(finish, 400);
      }
    }, 24);
    return () => window.clearInterval(timer);
  }, [finish, forceShow]);

  useEffect(() => {
    const reopen = () => {
      setProgress(0); setVisible(true);
      const start = Date.now();
      const timer = window.setInterval(() => {
        const next = Math.min(100, Math.floor(((Date.now() - start) / 2100) * 100));
        setProgress(next);
        if (next >= 100) { window.clearInterval(timer); window.setTimeout(finish, 300); }
      }, 24);
    };
    window.addEventListener('cme_trigger_startup_screen', reopen);
    return () => window.removeEventListener('cme_trigger_startup_screen', reopen);
  }, [finish]);

  if (!visible) return null;
  const stage = STAGES.find((item) => progress <= item.at) ?? STAGES[STAGES.length - 1];
  const Icon = stage.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.02, transition: { duration: .5 } }}
        className="fixed inset-0 z-[99999] overflow-hidden bg-[#F8F5ED] text-[#061F48]"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [.12, .22, .12] }} transition={{ duration: 4, repeat: Infinity }} className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D09515] blur-[120px]" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#061F48]/10 blur-[100px]" />
        <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#D09515]/10 blur-[90px]" />

        <div className="relative z-10 flex min-h-full flex-col items-center justify-between px-5 py-7 sm:px-8 sm:py-10">
          <div className="flex w-full max-w-5xl items-center justify-between">
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[.22em] text-[#061F48]/55">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#D09515]" /> Official CME Learning Platform
            </div>
            <button onClick={finish} className="rounded-full border border-[#061F48]/10 bg-white/55 px-3.5 py-2 text-[9px] font-black uppercase tracking-widest text-[#061F48]/60 transition hover:bg-white hover:text-[#061F48]">
              Skip <ArrowRight className="ml-1 inline h-3 w-3" />
            </button>
          </div>

          <div className="w-full max-w-2xl text-center">
            <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .6 }}>
              <div className="mx-auto inline-flex rounded-[2rem] border border-[#061F48]/10 bg-white/70 p-5 shadow-[0_20px_70px_rgba(6,31,72,.12)] backdrop-blur-xl">
                <img src="/cme-logo.jpg" alt="Concept Made Easy Classes" className="h-28 sm:h-32 w-auto max-w-[250px] rounded-xl object-contain" />
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-[#B27A00] text-[10px] font-black uppercase tracking-[.25em]">
                <Sparkles className="h-3.5 w-3.5" /> Concept Made Easy Classes
              </div>
              <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight text-[#061F48]">Understand. <span className="text-[#D09515]">Learn.</span> Succeed.</h1>
              <p className="mt-3 text-xs sm:text-sm font-medium text-[#061F48]/55">Your premium learning experience is getting ready.</p>
            </motion.div>

            <div className="mt-9 rounded-[1.5rem] border border-[#061F48]/10 bg-white/65 p-5 sm:p-6 text-left shadow-[0_18px_60px_rgba(6,31,72,.09)] backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-xl bg-[#D09515]/12 p-2.5 text-[#B27A00]"><Icon className="h-4 w-4" /></div>
                  <span className="truncate text-[11px] sm:text-xs font-bold text-[#061F48]/75">{stage.label}</span>
                </div>
                <span className="font-mono text-sm font-black text-[#B27A00]">{progress}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#061F48]/8">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-[#B27A00] via-[#F2C24B] to-[#D09515]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#061F48]/35">
                {['Learning', 'Classroom', 'Ready'].map((item, i) => (
                  <div key={item} className="flex items-center justify-center gap-1.5">
                    <CheckCircle2 className={`h-3 w-3 ${progress >= [20, 55, 90][i] ? 'text-[#D09515]' : 'text-[#061F48]/12'}`} /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-bold uppercase tracking-[.2em] text-[#061F48]/30">© 2026 Concept Made Easy Classes</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
