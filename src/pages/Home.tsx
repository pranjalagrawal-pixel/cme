import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Star, 
  Award, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  BookOpen, 
  CheckCircle,
  Users,
  Clock,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
  Target,
  BadgeCheck
} from 'lucide-react';
import { ConceptLogo } from '../components/Logos';

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      
      <section className="mx-4 sm:mx-6 lg:mx-8 pt-3">
        <div className="max-w-7xl mx-auto rounded-2xl border border-[#D09515]/25 bg-[#061F48] px-4 py-3.5 text-white shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-center">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#D09515]">
              <span className="h-2 w-2 rounded-full bg-[#D09515] animate-pulse" /> Official Launch • 31 August 2026 • 1:30 PM IST
            </span>
            <span className="hidden sm:block text-white/30">•</span>
            <span className="text-[11px] font-semibold text-white/80">A focused digital classroom for concept-first learning.</span>
          </div>
        </div>
      </section>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-20 md:py-24 flex flex-col items-center">
        {/* Subtle Decorative Background Circles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D09515] opacity-[0.035] rounded-full blur-3xl -mr-28 -mt-28 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#061F48] opacity-[0.03] rounded-full blur-3xl -ml-28 -mb-28 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left animate-fade-in">
              
              {/* Institutional Quality Accreditation Badge */}
              <div className="inline-flex items-center space-x-2.5 bg-white dark:bg-[#0A1E4A] border border-[#061F48]/10 dark:border-white/10 px-4 py-1.5 rounded-full shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D09515] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D09515]"></span>
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#061F48] dark:text-[#F8F5ED]">
                  Academic Session 2026–27 Admissions Active
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#061F48] dark:text-white tracking-tight leading-[1.1]">
                Understand.<br />
                <span className="text-[#D09515]">Learn.</span> Succeed.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#061F48]/80 dark:text-gray-300 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A concept-driven learning platform for <strong className="text-[#061F48] dark:text-white font-bold">Classes 6–12</strong> and rigorous <strong className="text-[#D09515] font-bold">JEE & NEET preparation</strong>. Built to help students understand concepts clearly, practise consistently, and get academic support when they need it.
              </p>

              {/* Trust Pillars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2 max-w-xl mx-auto lg:mx-0 text-left">
                {[
                  { icon: BookOpen, title: 'Concept First', text: 'Clear explanations' },
                  { icon: Target, title: 'Focused Practice', text: 'Structured revision' },
                  { icon: ShieldCheck, title: 'Student Support', text: 'Help when needed' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-center space-x-2.5 bg-white dark:bg-[#0A1E4A] p-3.5 rounded-2xl border border-[#061F48]/10 dark:border-white/10 shadow-sm">
                    <Icon className="h-5 w-5 text-[#D09515] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#061F48] dark:text-white leading-tight">{title}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hero Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
                <Link 
                  to="/programs" 
                  className="w-full sm:w-auto bg-[#061F48] text-white hover:bg-[#D09515] hover:text-[#061F48] px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Explore Academic Programs
                </Link>
                <Link 
                  to="/scholarship" 
                  className="w-full sm:w-auto bg-white dark:bg-[#0A1E4A] text-[#061F48] dark:text-white hover:border-[#D09515] border border-[#061F48]/20 dark:border-white/20 px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase text-center shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-[#D09515]" />
                  Scholarship Calculator
                </Link>
              </div>

              {/* Brand-aligned trust signals — no fabricated numbers */}
              <div className="pt-6 border-t border-[#061F48]/10 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto lg:mx-0">
                {[
                  { title: 'Small Batches', text: 'Focused classroom attention' },
                  { title: 'Concept First', text: 'Understand before memorising' },
                  { title: 'Live Support', text: 'Doubts + academic guidance' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-[#061F48]/10 dark:border-white/10 bg-white/70 dark:bg-[#0A1E4A]/80 px-4 py-3 shadow-sm">
                    <p className="text-xs font-black text-[#061F48] dark:text-white">{item.title}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-[#061F48]/55 dark:text-gray-400">{item.text}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Media Column - Scalable Premium Logo Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative bg-white dark:bg-[#0A1E4A] border border-[#0B2046]/10 dark:border-white/10 p-6 sm:p-10 rounded-[2.5rem] shadow-xl max-w-sm w-full transform hover:scale-[1.01] transition-all duration-300">
                <ConceptLogo className="h-full w-full max-h-[340px] mx-auto filter drop-shadow-sm" />
                <div className="absolute -bottom-4 -left-4 bg-[#0B2046] text-white p-3.5 rounded-2xl shadow-lg border border-white/10 hidden sm:block">
                  <p className="text-[9px] font-bold text-[#D09515] uppercase tracking-widest leading-none">TEACHING PHILOSOPHY</p>
                  <p className="text-xs font-black mt-1 leading-none">Concept-first learning</p>
                </div>
                <div className="absolute -top-4 -right-4 bg-[#D09515] text-[#061F48] p-3 rounded-2xl shadow-lg border border-white/20 hidden sm:block">
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none">FEE CONCESSION</p>
                  <p className="text-xs font-black mt-1 leading-none">Up to 50% Merit Grant</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* INSTITUTIONAL TRUST BAR */}
      <section className="bg-[#061F48] text-white py-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#D09515] shrink-0" />
              <span className="text-xs font-bold tracking-wide">Classes 6–12</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#D09515] shrink-0" />
              <span className="text-xs font-bold tracking-wide">JEE & NEET Preparation</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#D09515] shrink-0" />
              <span className="text-xs font-bold tracking-wide">JEE / NEET CBT Mock Engine</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#D09515] shrink-0" />
              <span className="text-xs font-bold tracking-wide">Live Doubt Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE USPs BENTO GRID SUMMARY */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-widest block">Pedagogical Framework</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#061F48] dark:text-white tracking-tight">Designed for Academic Dominance</h2>
            <p className="text-xs sm:text-sm text-[#061F48]/70 dark:text-gray-300 font-semibold leading-relaxed">
              We combine clear explanations, structured practice, and focused academic support in one learning space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#0A1E4A] border border-[#061F48]/10 dark:border-white/10 p-8 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-[#061F48] text-[#D09515] rounded-2xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#061F48] dark:text-white">Focused Academic Support</h3>
              <p className="text-xs text-[#061F48]/70 dark:text-gray-300 font-medium leading-relaxed">
                Students can use structured learning tools and seek academic support based on their goals and schedule.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0A1E4A] border border-[#061F48]/10 dark:border-white/10 p-8 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-[#061F48] text-[#D09515] rounded-2xl flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#061F48] dark:text-white">High-Yield Study Cards</h3>
              <p className="text-xs text-[#061F48]/70 dark:text-gray-300 font-medium leading-relaxed">
                Fully personalized formula sheets, summary booklets, NCERT concept maps, and rank-prediction tools. Eliminating bulky books for precision drills.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0A1E4A] border border-[#061F48]/10 dark:border-white/10 p-8 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 bg-[#061F48] text-[#D09515] rounded-2xl flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[#061F48] dark:text-white">Focused Learning Groups</h3>
              <p className="text-xs text-[#061F48]/70 dark:text-gray-300 font-medium leading-relaxed">
                Classroom formats can be organized around focused teaching and meaningful student participation.
              </p>
            </div>
          </div>

          <div className="text-center pt-10">
            <Link to="/about" className="text-xs font-extrabold text-[#061F48] dark:text-[#F8F5ED] hover:text-[#D09515] inline-flex items-center justify-center gap-2 tracking-wider uppercase group">
              Explore Our Teaching Methodology & Faculty
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform text-[#D09515]" />
            </Link>
          </div>
        </div>
      </section>

      {/* METHODOLOGY INTERACTIVE HIGHLIGHTS */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-widest block">The Concept-Driven Paradigm</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#061F48] dark:text-white tracking-tight">Mastering the "Why" Over Blind Memorization</h2>
            <p className="text-xs sm:text-sm text-[#061F48]/70 dark:text-gray-300 font-semibold leading-relaxed">
              Standard coaching relies on repetitive formula mugging. Our faculty breaks down root-level physics derivations, intuitive calculus steps, and organic chemistry reaction mechanisms.
            </p>
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3 text-xs font-semibold text-[#061F48]/80 dark:text-gray-200">
                <CheckCircle className="h-5 w-5 text-[#D09515] shrink-0 mt-0.5" />
                <span>Deep structural intuition prepares learners for multi-concept JEE Advanced & NEET problems.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs font-semibold text-[#061F48]/80 dark:text-gray-200">
                <CheckCircle className="h-5 w-5 text-[#D09515] shrink-0 mt-0.5" />
                <span>Comprehensive weekly progress trajectories track conceptual velocity chapter-by-chapter.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs font-semibold text-[#061F48]/80 dark:text-gray-200">
                <CheckCircle className="h-5 w-5 text-[#D09515] shrink-0 mt-0.5" />
                <span>Dedicated Saturday doubt counters and Sunday mock rooms with real-time test simulations.</span>
              </div>
            </div>
            <div className="pt-2">
              <Link to="/about" className="inline-flex items-center space-x-2 bg-[#061F48] text-white hover:bg-[#D09515] hover:text-[#061F48] px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                <span>View Full Curriculum Specs</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Interactive comparative visual board */}
          <div className="bg-white dark:bg-[#0A1E4A] border border-[#061F48]/10 dark:border-white/10 p-8 rounded-3xl shadow-lg space-y-6">
            <h3 className="text-base font-bold text-[#061F48] dark:text-white border-b border-[#061F48]/5 dark:border-white/5 pb-3">
              Comparative Academic Matrix
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-full uppercase">Standard Coaching</span>
                <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200">Rote Memorization</h4>
                <ul className="text-[11px] text-rose-800/80 dark:text-rose-300 font-medium space-y-1">
                  <li>• Bulky 500-page modules</li>
                  <li>• Panic in unfamiliar questions</li>
                  <li>• Large-group formats can limit individual interaction</li>
                  <li>• Slow doubt resolution</li>
                </ul>
              </div>
              <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 p-5 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full uppercase">Concept Made Easy</span>
                <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">First-Principles Mastery</h4>
                <ul className="text-[11px] text-emerald-800/80 dark:text-emerald-300 font-medium space-y-1">
                  <li>• Proof-based derivations</li>
                  <li>• Calm systematic problem solve</li>
                  <li>• Focused teaching with room for questions</li>
                  <li>• Guided doubt support</li>
                </ul>
              </div>
            </div>
            <div className="bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/5 dark:border-white/5 p-4 rounded-xl text-center">
              <p className="text-[11px] text-[#061F48]/80 dark:text-gray-300 font-bold italic">
                "Understanding the concept first makes practice more meaningful."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK FEATURED BATCHES & TEST SERIES LISTINGS */}
      <section className="py-12 bg-white/50 dark:bg-[#061F48]/50 border-y border-[#061F48]/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-widest block">Academic Cohorts</span>
              <h2 className="text-3xl font-extrabold text-[#061F48] dark:text-white tracking-tight">Featured Tuition & Test Series</h2>
            </div>
            <div className="mt-4 md:mt-0 flex gap-3">
              <Link to="/programs" className="bg-white dark:bg-[#0A1E4A] hover:bg-[#061F48]/5 text-[#061F48] dark:text-white border border-[#061F48]/10 dark:border-white/10 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                All Programs
              </Link>
              <Link to="/test-series" className="bg-[#061F48] hover:bg-[#D09515] hover:text-[#061F48] text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                Test Series Portal
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Program Card 1 */}
            <div className="bg-white dark:bg-[#0A1E4A] rounded-3xl border border-[#061F48]/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full text-white bg-[#061F48] inline-block mb-4">Board Prep</span>
                <h3 className="text-xl font-bold text-[#061F48] dark:text-white">Classes 9–10 Board Mastery</h3>
                <p className="text-xs text-[#061F48]/70 dark:text-gray-300 font-semibold mt-1">Foundation concepts for board exam preparedness</p>
                <div className="mt-4 space-y-2 border-t border-[#061F48]/5 dark:border-white/5 pt-4">
                  <div className="flex items-center text-xs text-[#061F48]/80 dark:text-gray-300 font-semibold gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D09515]" />
                    <span>Comprehensive Science, Maths & English</span>
                  </div>
                  <div className="flex items-center text-xs text-[#061F48]/80 dark:text-gray-300 font-semibold gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D09515]" />
                    <span>Weekly mock tests matching school formats</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-[#061F48]/5 dark:border-white/5 mt-6 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-[#061F48]/55 dark:text-gray-400 uppercase block leading-none">Program details</span>
                  <span className="text-sm font-extrabold text-[#061F48] dark:text-white">View current offering</span>
                </div>
                <Link to="/programs" className="text-xs font-black text-[#D09515] hover:text-[#061F48] dark:hover:text-white uppercase tracking-wider flex items-center gap-1">
                  <span>Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Program Card 2 */}
            <div className="bg-white dark:bg-[#0A1E4A] rounded-3xl border border-[#061F48]/10 dark:border-white/10 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full text-[#061F48] bg-[#D09515] inline-block mb-4">Competitive</span>
                <h3 className="text-xl font-bold text-[#061F48] dark:text-white">JEE Advanced Prep</h3>
                <p className="text-xs text-[#061F48]/70 dark:text-gray-300 font-semibold mt-1">Target rank-booster & rigorous PCM problem solving</p>
                <div className="mt-4 space-y-2 border-t border-[#061F48]/5 dark:border-white/5 pt-4">
                  <div className="flex items-center text-xs text-[#061F48]/80 dark:text-gray-300 font-semibold gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D09515]" />
                    <span>Physics kinematics to organic mechanisms</span>
                  </div>
                  <div className="flex items-center text-xs text-[#061F48]/80 dark:text-gray-300 font-semibold gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D09515]" />
                    <span>Real Computer-Based Mock Simulator</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-[#061F48]/5 dark:border-white/5 mt-6 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-[#061F48]/55 dark:text-gray-400 uppercase block leading-none">Program details</span>
                  <span className="text-sm font-extrabold text-[#061F48] dark:text-white">View current offering</span>
                </div>
                <Link to="/programs" className="text-xs font-black text-[#D09515] hover:text-[#061F48] dark:hover:text-white uppercase tracking-wider flex items-center gap-1">
                  <span>Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Program Card 3 */}
            <div className="bg-white dark:bg-[#0A1E4A] rounded-3xl border border-[#D09515]/30 shadow-md p-6 flex flex-col justify-between ring-2 ring-[#D09515]/20 relative overflow-hidden">
                            <div>
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full text-white bg-[#061F48] inline-block mb-4">Mock Series</span>
                <h3 className="text-xl font-bold text-[#061F48] dark:text-white">JEE / NEET Test Series</h3>
                <p className="text-xs text-[#061F48]/70 dark:text-gray-300 font-semibold mt-1">Structured exam practice and performance review</p>
                <div className="mt-4 space-y-2 border-t border-[#061F48]/5 dark:border-white/5 pt-4">
                  <div className="flex items-center text-xs text-[#061F48]/80 dark:text-gray-300 font-semibold gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D09515]" />
                    <span>Full syllabus online CBT tests</span>
                  </div>
                  <div className="flex items-center text-xs text-[#061F48]/80 dark:text-gray-300 font-semibold gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#D09515]" />
                    <span>Predictive AIR (All India Rank) engine</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-[#061F48]/5 dark:border-white/5 mt-6 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-[#061F48]/55 dark:text-gray-400 uppercase block leading-none">Current offering</span>
                  <span className="text-sm font-black text-[#D09515]">View details</span>
                </div>
                <Link to="/test-series" className="text-xs font-black text-[#061F48] dark:text-white hover:text-[#D09515] uppercase tracking-wider flex items-center gap-1">
                  <span>Enroll</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CME STUDENT TOOLKIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#061F48]/10 dark:border-white/10 bg-white dark:bg-[#0A1E4A] shadow-xl">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#D09515]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#061F48]/5 dark:bg-white/5 blur-3xl pointer-events-none" />
          <div className="relative p-7 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
              <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#D09515]">Built around the learner</span>
                <h2 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-[#061F48] dark:text-white">Everything you need to stay on track.</h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#061F48]/65 dark:text-gray-300">
                  One focused learning space for classes, practice, planning, revision and academic support.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#D09515]/30 bg-[#D09515]/10 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#061F48] dark:text-[#F8F5ED]">
                <Sparkles className="h-3.5 w-3.5 text-[#D09515]" />
                Concept-first experience
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: GraduationCap, title: 'Live Classes', text: 'Join teacher-led learning when a class is scheduled.', href: '/student-portal' },
                { icon: Target, title: 'Study Planner', text: 'Turn your own goals into a clear daily plan.', href: '/student-portal' },
                { icon: BookOpen, title: 'Test Practice', text: 'Use structured practice to prepare with purpose.', href: '/test-series' },
                { icon: HelpCircle, title: 'Doubt Support', text: 'Ask questions and keep your learning moving.', href: '/student-portal' },
              ].map(({ icon: Icon, title, text, href }) => (
                <Link
                  key={title}
                  to={href}
                  className="group rounded-2xl border border-[#061F48]/10 dark:border-white/10 bg-[#F8F5ED]/70 dark:bg-[#061F48]/50 p-5 hover:-translate-y-1 hover:border-[#D09515]/40 hover:shadow-lg transition-all duration-200"
                >
                  <div className="h-10 w-10 rounded-xl bg-[#061F48] text-[#D09515] flex items-center justify-center shadow-sm group-hover:bg-[#D09515] group-hover:text-[#061F48] transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-[#061F48] dark:text-white">{title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed font-medium text-[#061F48]/60 dark:text-gray-400">{text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#D09515]">
                    Open <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION SCHOLARSHIP SIMULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#061F48] text-white p-8 md:p-14 rounded-[2.5rem] relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8 justify-between border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D09515] opacity-[0.08] rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-3.5 max-w-xl text-center md:text-left">
            <span className="text-xs font-extrabold text-[#D09515] tracking-[0.2em] uppercase block">Merit-Based Scholarship</span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">Provisional Fee Concession Portal</h2>
            <p className="text-xs md:text-sm text-white/80 font-medium leading-relaxed">
              Calculate your tuition scholarship entitlement instantly! Our admissions simulator evaluates academic scores and family background to grant fee waivers up to <strong>50% Off</strong>.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link 
              to="/scholarship" 
              className="block w-full md:w-auto text-center bg-[#D09515] text-[#061F48] hover:bg-white px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Launch Simulator
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

