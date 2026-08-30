import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Sparkles, GraduationCap, ArrowRight, CalendarDays, CheckCircle2, Clock3 } from 'lucide-react';
import { CME_LAUNCH_AT, CME_LAUNCH_DATE_LABEL, CME_LAUNCH_TIME_LABEL } from '../lib/launchConfig';

function getCountdown() {
  const diff = Math.max(0, CME_LAUNCH_AT - Date.now());
  const total = Math.floor(diff / 1000);
  return { days: Math.floor(total / 86400), hours: Math.floor((total % 86400) / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60, live: diff === 0 };
}

const POPPERS = Array.from({ length: 28 }, (_, index) => ({
  left: `${8 + ((index * 31) % 84)}%`,
  delay: `${(index % 7) * 0.06}s`,
  rotate: `${-45 + ((index * 29) % 100)}deg`,
  duration: `${1.05 + ((index % 5) * 0.12)}s`,
  color: index % 3 === 0 ? '#D09515' : index % 3 === 1 ? '#061F48' : '#F2C24B',
}));

export default function LaunchAnnouncementModal() {
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { const timer = window.setInterval(() => setCountdown(getCountdown()), 1000); return () => window.clearInterval(timer); }, []);
  const status = useMemo(() => countdown.live ? 'WE ARE LIVE' : 'OFFICIAL LAUNCH', [countdown.live]);
  const close = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 sm:p-6 bg-[#061F48]/75 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full bg-[#D09515]/20 blur-2xl" />
            <div className="absolute right-[8%] top-[22%] h-28 w-28 rounded-full bg-[#F2C24B]/20 blur-2xl" />
            {POPPERS.map((piece, index) => (
              <motion.span
                key={index}
                className="absolute top-[12%] h-2.5 w-1.5 rounded-sm"
                style={{ left: piece.left, backgroundColor: piece.color, rotate: piece.rotate }}
                initial={{ y: -20, opacity: 0, scale: 0.4 }}
                animate={{
                  y: ['0vh', '22vh', '42vh'],
                  x: [0, (index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 8), (index % 2 === 0 ? 1 : -1) * (34 + (index % 5) * 7)],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.7],
                  rotate: [0, 100 + index * 17, 200 + index * 23],
                }}
                transition={{ delay: Number(piece.delay.replace('s', '')), duration: Number(piece.duration.replace('s', '')), ease: 'easeOut' }}
              />
            ))}
          </div>

          <motion.div role="dialog" aria-modal="true" aria-label="Concept Made Easy official launch announcement" className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#D09515]/25 bg-[#F8F5ED] text-[#061F48] shadow-[0_35px_120px_rgba(0,0,0,.35)]" initial={{ opacity: 0, y: 35, scale: .94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 25, scale: .96 }} transition={{ type: 'spring', stiffness: 180, damping: 18 }} onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 opacity-[.35] bg-[radial-gradient(circle_at_50%_0%,rgba(208,149,21,.25),transparent_45%)]" />
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-[#D09515]/12 blur-[90px]" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#061F48]/8 blur-[90px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,31,72,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(6,31,72,.035)_1px,transparent_1px)] bg-[size:30px_30px]" />
            <div className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2">
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: [0.4, 1.15, 1], opacity: [0, 1, 1] }}
                transition={{ duration: 0.55, delay: 0.28 }}
                className="h-3 w-3 rounded-full bg-[#D09515] shadow-[0_0_28px_rgba(208,149,21,.65)]"
              />
            </div>
            <button onClick={close} aria-label="Close" className="absolute right-4 top-4 z-20 rounded-full border border-[#061F48]/10 bg-white/70 p-2 text-[#061F48]/65 transition hover:bg-white hover:text-[#061F48]"><X className="h-5 w-5" /></button>

            <div className="relative z-10 grid md:grid-cols-[.82fr_1.45fr] items-center gap-6 p-6 sm:p-10 lg:p-12">
              <div className="flex justify-center">
                <motion.div initial={{ rotate: -2, y: 12, opacity: 0 }} animate={{ rotate: 0, y: 0, opacity: 1 }} transition={{ delay: .1 }} className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-[#D09515]/40 bg-[#061F48] p-4 shadow-[0_24px_80px_rgba(6,31,72,.25)]">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_15%,rgba(242,194,75,.22),transparent_42%)]" />
                  <div className="relative z-10 overflow-hidden rounded-[1.55rem] border border-[#D09515]/25 bg-[#F8F5ED] p-4 sm:p-6">
                    <img src="/cme-logo.jpg" alt="Concept Made Easy Classes logo" className="h-auto w-full rounded-[1.1rem] object-contain mix-blend-multiply" />
                  </div>
                  <div className="relative z-10 mt-4 text-center text-[10px] font-black uppercase tracking-[.22em] text-[#F2C24B]">Understand • Learn • Succeed</div>
                </motion.div>
              </div>

              <div className="text-center md:text-left">
                <motion.div initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .15 }} className="inline-flex items-center gap-2 rounded-full border border-[#D09515]/30 bg-[#D09515]/10 px-4 py-2 text-[10px] font-black tracking-[.22em] text-[#9A6900]"><Sparkles className="h-3.5 w-3.5" /> {status}</motion.div>
                <h2 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] text-[#061F48]">Concept Made Easy<br /><span className="text-[#D09515]">Officially Launches.</span></h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#061F48]/65 font-medium">A new learning experience built around one promise: <strong className="text-[#061F48]">Understand • Learn • Succeed.</strong></p>

                <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-[#D09515]/30 bg-white/75 px-4 py-3 shadow-sm"><CalendarDays className="h-5 w-5 text-[#D09515]" /><div><div className="text-[9px] font-black uppercase tracking-widest text-[#061F48]/40">Official Launch Date</div><div className="text-lg font-black text-[#061F48]">{CME_LAUNCH_DATE_LABEL}</div></div></div><div className="inline-flex items-center gap-2 rounded-2xl border border-[#061F48]/10 bg-white/75 px-4 py-3 shadow-sm"><Clock3 className="h-5 w-5 text-[#D09515]" /><div><div className="text-[9px] font-black uppercase tracking-widest text-[#061F48]/40">Official Launch Time</div><div className="text-lg font-black text-[#061F48]">{CME_LAUNCH_TIME_LABEL}</div></div></div>

                {!countdown.live ? <div className="mt-6 grid max-w-xl grid-cols-4 gap-2 sm:gap-3">{[['Days', countdown.days], ['Hours', countdown.hours], ['Minutes', countdown.minutes], ['Seconds', countdown.seconds]].map(([label, value]) => <div key={label} className="rounded-2xl border border-[#061F48]/10 bg-white/65 px-2 py-3 sm:px-4 sm:py-4 text-center shadow-sm"><div className="text-xl sm:text-3xl font-black tabular-nums">{String(value).padStart(2, '0')}</div><div className="mt-1 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-[#061F48]/40">{label}</div></div>)}</div> : <div className="mt-6 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-emerald-700/20 bg-emerald-50 px-5 py-4 text-emerald-800 font-black uppercase tracking-widest text-sm"><CheckCircle2 className="h-5 w-5" /> Official launch is live</div>}

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">{['Classes 6–12', 'Boards & School Support', 'JEE • NEET Preparation'].map((item) => <div key={item} className="flex items-center gap-2 rounded-xl border border-[#061F48]/8 bg-white/55 px-3 py-3 text-[10px] sm:text-[11px] font-bold text-[#061F48]/70"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#D09515]" /> {item}</div>)}</div>
                <div className="mt-7 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3"><a href="#/programs" onClick={close} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#061F48] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#D09515]">Explore Programs <ArrowRight className="h-4 w-4" /></a><button onClick={close} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#061F48]/12 bg-white/60 px-6 py-3 text-xs font-black uppercase tracking-wider text-[#061F48] transition hover:bg-white"><GraduationCap className="h-4 w-4 text-[#D09515]" /> Continue</button></div>
                <div className="mt-6 flex items-center justify-center md:justify-start gap-2 text-[9px] font-bold uppercase tracking-[.18em] text-[#061F48]/35">UNDERSTAND <span className="text-[#D09515]">•</span> LEARN <span className="text-[#D09515]">•</span> SUCCEED</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
